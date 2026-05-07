'use strict';

require('dotenv').config({ path: '.env.local', quiet: true });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const shouldApply = process.argv.includes('--apply');

const RESTORE_NAMES = new Set([
  'Yummy Kitchen',
  "Rouney's Chicken",
  'Harbour View United Church',
  'Homes General Supplies And Hardware Ltd',
  'KFC Harbour View',
  'Sunshine Courier And Transport Services',
  'Kingston Dry Dock',
  'Keddykaykes (Keddy Cakes)',
  'Ms. Doctor',
  '1 JUPITER ROAD-KIDDIES CORNER',
  'Opp Total Gas Station Harbour View',
  'Total Gas Station Harbour View (roundabout)',
  'The Source Arena ',
]);

const EXCLUDED_NAMES = new Set([
  '876-445-2583',
  '876-922-2121',
  'Harbour View',
  'Harbour View Shopping Centre',
]);

const BLANK_OR_WEAK_HV_ADDRESSES = new Set(['', 'harbour view', 'harbour view jamaica', 'harbour view, jamaica']);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeAddress(value) {
  return (value || '').toString().trim().toLowerCase();
}

function buildApprovedState(vendor) {
  const currentAddress = (vendor.address || '').toString().trim();
  const normalizedAddress = normalizeAddress(currentAddress);
  const address = BLANK_OR_WEAK_HV_ADDRESSES.has(normalizedAddress)
    ? 'Harbour View, Jamaica'
    : currentAddress;

  const isLegacyNoAddress = !currentAddress;
  const locationNotes = isLegacyNoAddress
    ? 'Legacy community-built Harbour View record restored by admin approval. Original record had no formal address but had local business contact, description, or image data.'
    : 'Harbour View listing restored by admin approval after manual review.';

  return {
    address,
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    admin_review_required: false,
    location_confidence: 70,
    location_notes: locationNotes,
  };
}

function diffVendor(vendor, proposed) {
  const updates = {};
  for (const [key, value] of Object.entries(proposed)) {
    if ((vendor[key] || '') !== (value || '')) {
      updates[key] = value;
    }
  }
  return updates;
}

async function main() {
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .order('business_name', { ascending: true });

  if (error) {
    console.error(`Failed to fetch vendors: ${error.message}`);
    process.exit(1);
  }

  const matched = [];
  const missing = [];

  for (const name of RESTORE_NAMES) {
    const vendor = (vendors || []).find((row) => row.business_name === name);
    if (!vendor) {
      missing.push(name);
      continue;
    }
    matched.push(vendor);
  }

  const excludedPresent = (vendors || []).filter((row) => EXCLUDED_NAMES.has(row.business_name));
  const pendingUpdates = matched.map((vendor) => ({
    vendor,
    updates: diffVendor(vendor, buildApprovedState(vendor)),
  }));

  console.log(`mode: ${shouldApply ? 'apply' : 'dry-run'}`);
  console.log(`restore target count: ${RESTORE_NAMES.size}`);
  console.log(`matched in production: ${matched.length}`);
  console.log(`missing from production: ${missing.length}`);
  console.log(`excluded records still untouched: ${excludedPresent.length}`);

  if (missing.length) {
    console.log('\nmissing restore targets:');
    missing.forEach((name) => console.log(`- ${name}`));
  }

  console.log('\nplanned updates:');
  pendingUpdates.forEach(({ vendor, updates }) => {
    console.log(JSON.stringify({
      business_name: vendor.business_name,
      slug: vendor.slug,
      current_address: vendor.address,
      updates,
    }, null, 2));
  });

  if (!shouldApply) {
    return;
  }

  for (const { vendor, updates } of pendingUpdates) {
    if (!Object.keys(updates).length) continue;
    const { error: updateError } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', vendor.id);

    if (updateError) {
      console.error(`Failed to update ${vendor.business_name}: ${updateError.message}`);
      process.exit(1);
    }
  }

  console.log('\napply complete');
}

main().catch((error) => {
  console.error(`Restore failed: ${error.message}`);
  process.exit(1);
});
