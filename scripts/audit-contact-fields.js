#!/usr/bin/env node

/*
 * Dry-run by default. Pass --apply to fix only high-confidence single-number
 * WhatsApp links. Phone display values are never overwritten by this script.
 */

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
  require('dotenv').config({ path: path.join(process.cwd(), '.env'), quiet: true });
} catch (_) {
  // dotenv is optional for snapshot dry-runs.
}

const APPLY = process.argv.includes('--apply');
const VENDORS_PATH = path.join(__dirname, 'current_production_vendors.json');
const VALID_WHATSAPP_URL = /^https:\/\/wa\.me\/1876\d{7}$/;
const PHONE_INVALID_CHARS = /[^0-9+\-()\s/.]/;

function safeErrorMessage(error) {
  return (error?.message || String(error || 'Unknown error')).replace(/eyJ[a-zA-Z0-9._-]+/g, '[redacted-token]');
}

function loadSnapshot() {
  const raw = JSON.parse(fs.readFileSync(VENDORS_PATH, 'utf8'));
  return Array.isArray(raw) ? raw : raw.records || [];
}

function blank(value) {
  return value == null || value.toString().trim() === '';
}

function extractDigitGroups(value = '') {
  return value.toString().match(/\d+/g) || [];
}

function extractPhoneNumbers(value = '') {
  const digits = extractDigitGroups(value).join('');
  const matches = [];

  for (let index = 0; index <= digits.length - 10; index += 1) {
    const ten = digits.slice(index, index + 10);
    if (/^876\d{7}$/.test(ten)) matches.push(`1${ten}`);
  }

  for (let index = 0; index <= digits.length - 11; index += 1) {
    const eleven = digits.slice(index, index + 11);
    if (/^1876\d{7}$/.test(eleven)) matches.push(eleven);
  }

  return [...new Set(matches)];
}

function normalizeWhatsappNumber(value = '') {
  const numbers = extractPhoneNumbers(value);
  if (numbers.length === 1) {
    return { status: 'fixable', url: `https://wa.me/${numbers[0]}`, numbers };
  }
  if (numbers.length > 1) {
    return { status: 'manual', reason: 'multiple valid WhatsApp numbers detected', numbers };
  }
  return { status: 'invalid', reason: 'no valid Jamaican WhatsApp number detected', numbers: [] };
}

function inspectVendor(vendor = {}) {
  const issues = [];
  const highConfidenceFixes = [];
  const manualReview = [];
  const phone = (vendor.phone || '').toString().trim();
  const whatsapp = (vendor.whatsapp || '').toString().trim();
  const phoneNumbers = extractPhoneNumbers(phone);

  if (!blank(phone)) {
    if (PHONE_INVALID_CHARS.test(phone)) {
      manualReview.push({
        field: 'phone',
        reason: 'phone contains invalid characters',
        current_value: phone,
      });
    }

    if (phoneNumbers.length > 1) {
      manualReview.push({
        field: 'phone',
        reason: 'multiple phone numbers in display field',
        current_value: phone,
        detected_numbers: phoneNumbers,
      });
    }
  }

  if (!blank(whatsapp)) {
    if (VALID_WHATSAPP_URL.test(whatsapp)) {
      return { issues, highConfidenceFixes, manualReview };
    }

    const normalized = normalizeWhatsappNumber(whatsapp);
    if (normalized.status === 'fixable') {
      if (phoneNumbers.length > 1) {
        manualReview.push({
          field: 'whatsapp',
          reason: 'WhatsApp has one extractable number but phone has multiple numbers',
          current_value: whatsapp,
          proposed_value: normalized.url,
          detected_phone_numbers: phoneNumbers,
        });
      } else {
        highConfidenceFixes.push({
          field: 'whatsapp',
          reason: 'normalize single Jamaican WhatsApp number',
          current_value: whatsapp,
          proposed_value: normalized.url,
        });
      }
    } else {
      manualReview.push({
        field: 'whatsapp',
        reason: normalized.reason,
        current_value: whatsapp,
        detected_numbers: normalized.numbers,
      });
    }
  }

  return { issues, highConfidenceFixes, manualReview };
}

function auditRows(vendors = []) {
  return vendors
    .map((vendor) => {
      const inspected = inspectVendor(vendor);
      const issueCount = inspected.issues.length + inspected.highConfidenceFixes.length + inspected.manualReview.length;
      if (!issueCount) return null;
      return {
        id: vendor.id,
        business_name: vendor.business_name,
        slug: vendor.slug,
        phone: vendor.phone || null,
        whatsapp: vendor.whatsapp || null,
        high_confidence_fixes: inspected.highConfidenceFixes,
        manual_review: inspected.manualReview,
      };
    })
    .filter(Boolean);
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

async function applyFixes(client, rows = []) {
  const applied = [];
  const failed = [];

  for (const row of rows) {
    const whatsappFix = row.high_confidence_fixes.find((fix) => fix.field === 'whatsapp');
    if (!whatsappFix) continue;

    const { error } = await client.from('vendors').update({ whatsapp: whatsappFix.proposed_value }).eq('id', row.id);
    if (error) {
      failed.push({ id: row.id, business_name: row.business_name, error: safeErrorMessage(error) });
    } else {
      applied.push({ id: row.id, business_name: row.business_name, whatsapp: whatsappFix.proposed_value });
    }
  }

  return { applied, failed };
}

async function main() {
  const { source, source_warning: sourceWarning, vendors, client } = await loadSupabaseVendors();
  const rows = auditRows(vendors);
  let applyResult = { applied: [], failed: [] };

  if (APPLY) {
    applyResult = await applyFixes(client, rows);
  }

  const result = {
    mode: APPLY ? 'apply' : 'dry-run',
    source,
    source_warning: sourceWarning,
    total_checked: vendors.length,
    records_with_contact_issues: rows.length,
    high_confidence_fix_count: rows.reduce((count, row) => count + row.high_confidence_fixes.length, 0),
    manual_review_count: rows.reduce((count, row) => count + row.manual_review.length, 0),
    records: rows,
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
