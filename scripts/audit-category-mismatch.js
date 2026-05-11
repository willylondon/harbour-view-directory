#!/usr/bin/env node

/*
 * Dry-run by default. Pass --apply to update only high-confidence category fixes.
 * Ambiguous matches are reported for manual review. No records are deleted.
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

const CATEGORY_RULES = [
  { category: 'Education', confidence: 'high', pattern: /\b(daycare|day care|pre school|pre-school|early childhood|tutor|tutoring|lessons|music school)\b/i },
  { category: 'Beauty & Wellness', confidence: 'high', pattern: /\b(barber|hairdresser|hair dresser|nail|beauty|massage|salon)\b/i },
  { category: 'Pets / Animals', confidence: 'high', pattern: /\b(vet|veterinary|pet|pets|animal|animals)\b/i },
  { category: 'Auto & Transport', confidence: 'high', pattern: /\b(taxi|driver|driving instructor|bus|transportation|airport pick ?up|car rental|moving|trucking|mechanic|car service|body work|duco)\b/i },
  { category: 'Finance & Banking', confidence: 'high', pattern: /\b(atm|bank|bill payment|money transfer|moneygram|western union)\b/i },
  { category: 'Health & Medical', confidence: 'high', pattern: /\b(pharmacy|clinic|doctor|dental|dentist|optical|medical)\b/i },
  { category: 'Marine / Fishing Supplies', confidence: 'high', pattern: /\b(fishing|marine|bait|tackle)\b/i },
  { category: 'Professional / Legal / JP', confidence: 'high', pattern: /\b(justice of the peace|legal|lawyer|attorney|real estate)\b/i },
  { category: 'Retail & Shopping', confidence: 'high', pattern: /\b(passport pics|passport photos|printing|courier|tailor|dressmaker|recording studio|graphics|flower|plant supplier)\b/i },
  { category: 'Home Services', confidence: 'high', pattern: /\b(plumber|electrician|carpenter|tiler|painter|air conditioning|technician|hardware|gardener|landscaper|pest control|welder|upholsterer)\b/i },
  { category: 'Events / Bookings', confidence: 'high', pattern: /\b(travel|vacation|tour|event|booking|photography)\b/i },
  { category: 'Grocery & Convenience', confidence: 'high', pattern: /\b(grocery|supermarket|mini mart|minimart|drinking water|wholesale)\b/i },
  { category: 'Food & Restaurants', confidence: 'high', pattern: /\b(food|deli|baker|bakery|cake|restaurant|takeaway|take out|cook shop)\b/i },
  { category: 'Community & Church', confidence: 'high', pattern: /\b(police|church|community centre|community center)\b/i },
  { category: 'General Services', confidence: 'manual', pattern: /\b(delivery|repair|supplier|technician)\b/i },
];

function safeErrorMessage(error) {
  return (error?.message || String(error || 'Unknown error')).replace(/eyJ[a-zA-Z0-9._-]+/g, '[redacted-token]');
}

function normalize(value = '') {
  return value.toString().trim().toLowerCase();
}

function loadSnapshot() {
  const raw = JSON.parse(fs.readFileSync(VENDORS_PATH, 'utf8'));
  return Array.isArray(raw) ? raw : raw.records || [];
}

function inspectVendor(vendor = {}) {
  const description = (vendor.description || '').toString().trim();
  const text = description || (vendor.business_name || '').toString();
  const matches = CATEGORY_RULES
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => ({ category: rule.category, confidence: rule.confidence, reason: rule.pattern.toString() }));
  const distinctCategories = [...new Set(matches.map((match) => match.category))];

  if (distinctCategories.length === 0) return null;
  if (distinctCategories.length > 1) {
    return {
      proposed_category: distinctCategories[0],
      confidence: 'manual',
      reason: `multiple category signals: ${distinctCategories.join(', ')}`,
    };
  }

  const match = matches[0];
  return {
    proposed_category: match.category,
    confidence: match.confidence,
    reason: match.reason,
  };
}

function mismatchRows(vendors = []) {
  return vendors
    .map((vendor) => {
      const inspection = inspectVendor(vendor);
      if (!inspection) return null;
      if (normalize(vendor.category) === normalize(inspection.proposed_category)) return null;
      return {
        id: vendor.id,
        business_name: vendor.business_name,
        slug: vendor.slug,
        description: vendor.description,
        current_category: vendor.category,
        proposed_category: inspection.proposed_category,
        confidence: inspection.confidence,
        reason: inspection.reason,
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

async function applyHighConfidence(client, rows = []) {
  const applied = [];
  const failed = [];
  const highConfidenceRows = rows.filter((row) => row.confidence === 'high');

  for (const row of highConfidenceRows) {
    const { error } = await client.from('vendors').update({ category: row.proposed_category }).eq('id', row.id);
    if (error) {
      failed.push({ id: row.id, business_name: row.business_name, error: safeErrorMessage(error) });
    } else {
      applied.push({ id: row.id, business_name: row.business_name, category: row.proposed_category });
    }
  }

  return { applied, failed };
}

async function main() {
  const { source, source_warning: sourceWarning, vendors, client } = await loadSupabaseVendors();
  const rows = mismatchRows(vendors);
  const highConfidence = rows.filter((row) => row.confidence === 'high');
  const manualReview = rows.filter((row) => row.confidence !== 'high');
  let applyResult = { applied: [], failed: [] };

  if (APPLY) {
    applyResult = await applyHighConfidence(client, rows);
  }

  const result = {
    mode: APPLY ? 'apply' : 'dry-run',
    source,
    source_warning: sourceWarning,
    total_checked: vendors.length,
    mismatch_count: rows.length,
    high_confidence_count: highConfidence.length,
    manual_review_count: manualReview.length,
    high_confidence: highConfidence,
    manual_review: manualReview,
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
