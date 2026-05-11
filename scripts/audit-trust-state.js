#!/usr/bin/env node

/*
 * Dry-run by default. Pass --apply to update contradictory public trust states.
 * This script never deletes records and never prints Supabase service-role keys.
 */

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
  require('dotenv').config({ path: path.join(process.cwd(), '.env'), quiet: true });
} catch (_) {
  // dotenv is optional for local dry-runs that use the checked-in production snapshot.
}

const APPLY = process.argv.includes('--apply');
const VENDORS_PATH = path.join(__dirname, 'current_production_vendors.json');
const PUBLIC_LOCALITIES = new Set(['harbour_view_verified', 'harbour_view_likely']);
const BLOCKED_QUALITY = new Set(['rejected', 'out_of_area', 'duplicate', 'duplicate_probable']);
const REVIEW_NOTE = 'Auto-flagged: verified status removed because no public contact method exists.';
const OPTIONAL_COLUMNS = ['admin_review_required', 'admin_notes'];

function blank(value) {
  return value == null || value.toString().trim() === '';
}

function safeErrorMessage(error) {
  return (error?.message || String(error || 'Unknown error')).replace(/eyJ[a-zA-Z0-9._-]+/g, '[redacted-token]');
}

function loadSnapshot() {
  const raw = JSON.parse(fs.readFileSync(VENDORS_PATH, 'utf8'));
  return Array.isArray(raw) ? raw : raw.records || [];
}

function isPublicVendor(vendor = {}) {
  if (vendor.is_approved === false) return false;
  if (vendor.public_visibility !== true) return false;
  if (!PUBLIC_LOCALITIES.has(vendor.locality_status)) return false;
  if (BLOCKED_QUALITY.has((vendor.data_quality_status || '').toString().toLowerCase())) return false;
  return true;
}

function availableColumns(vendors = []) {
  const columns = new Set();
  vendors.forEach((vendor) => Object.keys(vendor || {}).forEach((key) => columns.add(key)));
  return columns;
}

function chooseProposedStatus(vendors = []) {
  const statuses = new Set(
    vendors
      .map((vendor) => (vendor.data_quality_status || '').toString().trim())
      .filter(Boolean)
  );

  if (statuses.has('needs_confirmation')) return 'needs_confirmation';
  if (statuses.has('needs_review')) return 'needs_review';
  if (statuses.has('unverified')) return 'unverified';
  return 'needs_confirmation';
}

function affectedRecords(vendors = [], proposedStatus) {
  return vendors
    .filter(isPublicVendor)
    .filter((vendor) => (vendor.data_quality_status || '').toString().toLowerCase() === 'verified')
    .filter((vendor) => blank(vendor.phone) && blank(vendor.whatsapp) && blank(vendor.website))
    .map((vendor) => ({
      id: vendor.id,
      business_name: vendor.business_name,
      slug: vendor.slug,
      category: vendor.category,
      phone: vendor.phone || null,
      whatsapp: vendor.whatsapp || null,
      website: vendor.website || null,
      current_data_quality_status: vendor.data_quality_status,
      proposed_data_quality_status: proposedStatus,
    }));
}

function withReviewNote(existingNote) {
  const current = (existingNote || '').toString().trim();
  if (!current) return REVIEW_NOTE;
  if (current.includes(REVIEW_NOTE)) return current;
  return `${current}\n${REVIEW_NOTE}`;
}

async function loadSupabaseVendors() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    if (APPLY) {
      throw new Error('Apply mode requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    return { source: 'snapshot', vendors: loadSnapshot(), client: null };
  }

  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.from('vendors').select('*');
  if (error) {
    if (APPLY) throw new Error(`Unable to read vendors from Supabase: ${safeErrorMessage(error)}`);
    return {
      source: 'snapshot',
      source_warning: `Supabase read failed; using snapshot: ${safeErrorMessage(error)}`,
      vendors: loadSnapshot(),
      client: null,
    };
  }
  return { source: 'supabase', source_warning: null, vendors: data || [], client };
}

async function applyUpdates(client, vendorsById, records, proposedStatus, columns) {
  const applied = [];
  const failed = [];

  for (const record of records) {
    const original = vendorsById.get(record.id) || {};
    const update = { data_quality_status: proposedStatus };

    if (columns.has('admin_review_required')) {
      update.admin_review_required = true;
    }
    if (columns.has('admin_notes')) {
      update.admin_notes = withReviewNote(original.admin_notes);
    }

    const { error } = await client.from('vendors').update(update).eq('id', record.id);
    if (error) {
      failed.push({ id: record.id, business_name: record.business_name, error: safeErrorMessage(error) });
    } else {
      applied.push({ id: record.id, business_name: record.business_name });
    }
  }

  return { applied, failed };
}

async function main() {
  const { source, source_warning: sourceWarning, vendors, client } = await loadSupabaseVendors();
  const columns = availableColumns(vendors);
  const proposedStatus = chooseProposedStatus(vendors);
  const records = affectedRecords(vendors, proposedStatus);
  const vendorsById = new Map(vendors.map((vendor) => [vendor.id, vendor]));
  const unavailableColumns = OPTIONAL_COLUMNS.filter((column) => !columns.has(column));
  let applyResult = { applied: [], failed: [] };

  if (APPLY) {
    applyResult = await applyUpdates(client, vendorsById, records, proposedStatus, columns);
  }

  const result = {
    mode: APPLY ? 'apply' : 'dry-run',
    source,
    source_warning: sourceWarning,
    total_checked: vendors.length,
    total_affected: records.length,
    proposed_status: proposedStatus,
    status_values_seen: [...new Set(vendors.map((vendor) => vendor.data_quality_status).filter(Boolean))].sort(),
    unavailable_columns: unavailableColumns,
    records,
    applied_count: applyResult.applied.length,
    failed_count: applyResult.failed.length,
    failed: applyResult.failed,
  };

  console.log(JSON.stringify(result, null, 2));

  if (applyResult.failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(JSON.stringify({ error: safeErrorMessage(error) }, null, 2));
  process.exit(1);
});
