'use strict';

require('dotenv').config({ path: '.env.local', quiet: true });

const { createClient } = require('@supabase/supabase-js');
const { buildProposedState, normalizeCategory, RECORD_OVERRIDES, summarizeAudit } = require('./location-quality-rules');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const shouldApply = process.argv.includes('--apply');
const isDryRun = !shouldApply || process.argv.includes('--dry-run');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl.trim(), supabaseServiceRoleKey.trim(), {
  auth: { autoRefreshToken: false, persistSession: false },
});

function pickUpdates(vendor, proposed) {
  const updates = {};
  const override = RECORD_OVERRIDES[(vendor.business_name || '').toLowerCase()];
  const normalizedExistingCategory = normalizeCategory(vendor.category);
  const targetCategory = override ? proposed.category : normalizedExistingCategory;

  if ((vendor.category || null) !== targetCategory && (override || normalizedExistingCategory !== (vendor.category || ''))) {
    updates.category = targetCategory;
  }
  if ((vendor.locality_status || null) !== proposed.locality_status) updates.locality_status = proposed.locality_status;
  if (vendor.public_visibility !== proposed.public_visibility) updates.public_visibility = proposed.public_visibility;
  if ((vendor.location_confidence || 0) !== proposed.location_confidence) updates.location_confidence = proposed.location_confidence;
  if ((vendor.admin_review_required ?? true) !== proposed.admin_review_required) updates.admin_review_required = proposed.admin_review_required;
  if ((vendor.location_notes || '') !== proposed.location_notes) updates.location_notes = proposed.location_notes;

  return updates;
}

async function run() {
  const { data: vendors, error } = await supabase.from('vendors').select('*').order('business_name', { ascending: true });
  if (error) {
    console.error(`Failed to fetch vendors: ${error.message}`);
    process.exit(1);
  }

  const before = summarizeAudit(vendors || []);
  const pendingUpdates = [];

  for (const vendor of vendors || []) {
    const proposed = buildProposedState(vendor);
    const updates = pickUpdates(vendor, proposed);
    if (Object.keys(updates).length > 0) {
      pendingUpdates.push({ vendor, proposed, updates });
    }
  }

  console.log(`mode: ${isDryRun ? 'dry-run' : 'apply'}`);
  console.log(`before visible vendors: ${before.counts.public_visible_vendors}`);
  console.log(`before hidden out-of-area: ${before.counts.hidden_out_of_area}`);
  console.log(`before needs manual review: ${before.counts.needs_manual_review}`);
  console.log(`records to update: ${pendingUpdates.length}`);

  pendingUpdates.slice(0, 30).forEach(({ vendor, updates }, index) => {
    console.log(`${index + 1}. ${vendor.business_name} -> ${JSON.stringify(updates)}`);
  });

  if (isDryRun) {
    return;
  }

  for (const { vendor, updates } of pendingUpdates) {
    const { error: updateError } = await supabase.from('vendors').update(updates).eq('id', vendor.id);
    if (updateError) {
      console.error(`Failed to update ${vendor.business_name}: ${updateError.message}`);
      process.exit(1);
    }
  }

  const { data: refreshed, error: refreshError } = await supabase.from('vendors').select('*').order('business_name', { ascending: true });
  if (refreshError) {
    console.error(`Failed to re-fetch vendors: ${refreshError.message}`);
    process.exit(1);
  }

  const after = summarizeAudit(refreshed || []);

  console.log(`after visible vendors: ${after.counts.public_visible_vendors}`);
  console.log(`after hidden out-of-area: ${after.counts.hidden_out_of_area}`);
  console.log(`after needs manual review: ${after.counts.needs_manual_review}`);

  console.log('\nfirst 20 visible listings after apply:');
  after.visible.slice(0, 20).forEach(({ vendor, proposed }, index) => {
    console.log(`${index + 1}. ${vendor.business_name} | ${proposed.category} | ${vendor.address || 'No address'}`);
  });
}

run().catch((error) => {
  console.error(`Location quarantine failed: ${error.message}`);
  process.exit(1);
});
