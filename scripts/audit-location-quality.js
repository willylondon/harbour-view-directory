'use strict';

require('dotenv').config({ path: '.env.local', quiet: true });

const { createClient } = require('@supabase/supabase-js');
const { summarizeAudit } = require('./location-quality-rules');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl.trim(), supabaseServiceRoleKey.trim(), {
  auth: { autoRefreshToken: false, persistSession: false },
});

function printList(title, rows, formatter) {
  console.log(`\n${title} (${rows.length})`);
  rows.slice(0, 20).forEach((row, index) => {
    console.log(`  ${index + 1}. ${formatter(row)}`);
  });
}

async function run() {
  const { data: vendors, error } = await supabase.from('vendors').select('*').order('business_name', { ascending: true });
  if (error) {
    console.error(`Failed to fetch vendors: ${error.message}`);
    process.exit(1);
  }

  const audit = summarizeAudit(vendors || []);

  console.log(JSON.stringify(audit.counts, null, 2));

  printList('First 20 visible listings after filtering', audit.visible, ({ vendor, proposed }) => `${vendor.business_name} | ${proposed.category} | ${vendor.address || 'No address'}`);
  printList('Hidden out-of-area listings', audit.hiddenOutOfArea, ({ vendor }) => `${vendor.business_name} | ${vendor.address || 'No address'}`);
  printList('Needs manual review', audit.manualReview, ({ vendor, proposed }) => `${vendor.business_name} | ${vendor.address || 'No address'} | ${proposed.location_notes}`);
  printList('Foreign addresses', audit.foreignAddresses, ({ vendor }) => `${vendor.business_name} | ${vendor.address || 'No address'}`);
  printList('Non-Harbour View Kingston addresses', audit.nonHarbourViewKingston, ({ vendor }) => `${vendor.business_name} | ${vendor.address || 'No address'}`);
  printList('Listings where Harbour View appears outside Jamaica', audit.harbourViewOutsideJamaica, ({ vendor }) => `${vendor.business_name} | ${vendor.address || 'No address'}`);
  printList('Suspicious category mappings', audit.suspiciousMappings, ({ vendor, proposed }) => `${vendor.business_name} | current=${vendor.category || 'None'} | proposed=${proposed.category}`);
  printList('Food listings that are not restaurants', audit.suspiciousFood, ({ vendor, proposed }) => `${vendor.business_name} | current=${vendor.category || 'None'} | proposed=${proposed.category}`);
}

run().catch((error) => {
  console.error(`Audit failed: ${error.message}`);
  process.exit(1);
});
