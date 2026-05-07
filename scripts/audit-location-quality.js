'use strict';

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SVC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SVC_KEY);

const BAD_LOCATIONS = [
  'USA', 'United States', 'Suffolk', 'Virginia', 'VA', 'UK', 'Canada',
  'Montego Bay', 'Spanish Town', 'Portmore', 'Old Hope Road',
  'Liguanea', 'New Kingston', 'Half-Way-Tree'
];

const SAFE_MARKERS = [
  'Harbour View, Kingston', 'Harbour View, Kingston 17',
  'Harbour View Kingston17', 'Seashore Place', 'Everest Drive',
  'Nautilus Avenue', 'Dorado Drive', 'Forth Nugent Drive',
  'Fort Nugent Drive', 'Harbour View Shopping Centre',
  'St. Benedicts Heights'
];

function checkLocation(address, name) {
  const addrStr = (address || '').toLowerCase();
  const nameStr = (name || '').toLowerCase();

  // 1. Check for known bad locations
  const isBad = BAD_LOCATIONS.some(b => addrStr.includes(b.toLowerCase()));
  if (isBad) return { status: 'out_of_area_rejected', reason: 'Matches known bad location (e.g. USA, UK, Old Hope Rd)' };

  // 2. Check for safe markers
  const isSafe = SAFE_MARKERS.some(s => addrStr.includes(s.toLowerCase()));
  if (isSafe) return { status: 'harbour_view_likely', reason: 'Matches strong Harbour View address marker' };

  // 3. Needs manual review logic
  if (!address) return { status: 'needs_manual_review', reason: 'Address missing entirely' };
  
  if (nameStr.includes('harbour view') && !address) {
    return { status: 'needs_manual_review', reason: 'Name contains Harbour View but address missing' };
  }
  
  if (addrStr.includes('kingston') && !addrStr.includes('harbour view') && !addrStr.includes('17')) {
    return { status: 'needs_manual_review', reason: 'Address says Kingston only' };
  }

  // If "Harbour View" but no "Jamaica" (unless Kingston 17 is present)
  if (addrStr.includes('harbour view') && !addrStr.includes('jamaica') && !addrStr.includes('kingston')) {
    return { status: 'needs_manual_review', reason: 'Harbour View only with no Jamaica/Kingston signal' };
  }

  return { status: 'needs_manual_review', reason: 'Address is present but lacks strong markers' };
}

async function run() {
  console.log('--- AUDITING LOCATION QUALITY ---');
  const { data: vendors, error } = await supabase.from('vendors').select('*');
  if (error) {
    console.error('Failed to fetch vendors:', error);
    process.exit(1);
  }

  const outOfArea = [];
  const needsReview = [];
  const foodNotRest = [];

  for (const v of vendors) {
    const { status, reason } = checkLocation(v.address, v.business_name);
    
    if (status === 'out_of_area_rejected') outOfArea.push({ name: v.business_name, address: v.address, reason });
    if (status === 'needs_manual_review') needsReview.push({ name: v.business_name, address: v.address, reason });

    // Check food categories that might not be restaurants
    const isFood = v.category === 'Food & Beverage' || v.category === 'Food & Restaurants';
    if (isFood) {
      const nameL = v.business_name.toLowerCase();
      if (nameL.includes('fishing') || nameL.includes('wholesale') || nameL.includes('gas') || nameL.includes('grocery')) {
        foodNotRest.push({ name: v.business_name, address: v.address, reason: 'Suspicious Food listing (fishing/grocery/wholesale)' });
      }
    }
  }

  console.log(`\n🛑 OUT OF AREA REJECTED CANDIDATES (${outOfArea.length}):`);
  outOfArea.forEach(v => console.log(`- ${v.name} | ${v.address} | ${v.reason}`));

  console.log(`\n⚠️ NEEDS MANUAL REVIEW (${needsReview.length}):`);
  needsReview.forEach(v => console.log(`- ${v.name} | ${v.address} | ${v.reason}`));

  console.log(`\n🍔 SUSPICIOUS FOOD LISTINGS (${foodNotRest.length}):`);
  foodNotRest.forEach(v => console.log(`- ${v.name} | ${v.reason}`));

  console.log('\nAudit complete. Run apply-location-quarantine.js to enforce these rules.');
}

run();
