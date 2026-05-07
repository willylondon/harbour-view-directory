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

  const isBad = BAD_LOCATIONS.some(b => addrStr.includes(b.toLowerCase()));
  if (isBad) return { status: 'out_of_area_rejected', visibility: false, reason: 'Matches known bad location' };

  const isSafe = SAFE_MARKERS.some(s => addrStr.includes(s.toLowerCase()));
  if (isSafe) return { status: 'harbour_view_likely', visibility: true, reason: 'Strong Harbour View address marker' };

  if (!address) return { status: 'needs_manual_review', visibility: false, reason: 'Address missing entirely' };
  
  if (nameStr.includes('harbour view') && !address) {
    return { status: 'needs_manual_review', visibility: false, reason: 'Name contains Harbour View but address missing' };
  }
  
  if (addrStr.includes('kingston') && !addrStr.includes('harbour view') && !addrStr.includes('17')) {
    return { status: 'needs_manual_review', visibility: false, reason: 'Address says Kingston only' };
  }

  if (addrStr.includes('harbour view') && !addrStr.includes('jamaica') && !addrStr.includes('kingston')) {
    return { status: 'needs_manual_review', visibility: false, reason: 'Harbour View only with no Jamaica/Kingston signal' };
  }

  return { status: 'needs_manual_review', visibility: false, reason: 'Address is present but lacks strong markers' };
}

async function run() {
  console.log('--- APPLYING LOCATION QUARANTINE ---');
  
  const { data: vendors, error } = await supabase.from('vendors').select('*');
  if (error) {
    console.error('Failed to fetch vendors:', error);
    process.exit(1);
  }

  const outOfArea = [];
  const needsReview = [];
  const foodNotRest = [];
  const visible = [];

  for (const v of vendors) {
    const { status, visibility, reason } = checkLocation(v.address, v.business_name);
    
    let newCategory = v.category;
    const nameL = v.business_name.toLowerCase();
    
    if (newCategory === 'Food & Beverage') {
      newCategory = 'Food & Restaurants';
    }

    if ((newCategory === 'Food & Restaurants' || newCategory === 'Food & Beverage') && nameL.includes('fishing')) {
      newCategory = 'Marine / Fishing Supplies';
      foodNotRest.push({ name: v.business_name, reason: 'Moved to Marine / Fishing Supplies' });
    }

    const updates = {};
    if (v.locality_status !== status) updates.locality_status = status;
    if (v.public_visibility !== visibility) updates.public_visibility = visibility;
    if (v.category !== newCategory) updates.category = newCategory;

    if (Object.keys(updates).length > 0) {
      await supabase.from('vendors').update(updates).eq('id', v.id);
    }

    if (status === 'out_of_area_rejected') outOfArea.push({ name: v.business_name, address: v.address, reason });
    else if (status === 'needs_manual_review') needsReview.push({ name: v.business_name, address: v.address, reason });
    
    if (visibility) visible.push({ name: v.business_name, category: newCategory });
  }

  // Count food categories
  const { data: foodVendors } = await supabase.from('vendors').select('*').eq('category', 'Food & Restaurants');

  console.log(`\n✅ VISIBLE AFTER CLEANUP`);
  console.log(`Total Visible: ${visible.length}`);
  console.log(`First 20 Visible:`);
  visible.slice(0, 20).forEach((v, i) => console.log(`  ${i+1}. ${v.name} (${v.category})`));
  
  const categoryCounts = visible.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});
  console.log(`\nCategory Counts (Visible):`, categoryCounts);

  console.log(`\n🛑 HIDDEN OUT OF AREA (${outOfArea.length}):`);
  outOfArea.forEach(v => console.log(`- ${v.name} | ${v.address}`));

  console.log(`\n⚠️ NEEDS MANUAL REVIEW (${needsReview.length}):`);
  needsReview.forEach(v => console.log(`- ${v.name} | ${v.reason}`));

  console.log(`\n🍔 FOOD CLEANUP`);
  console.log(`Total Food & Restaurants Records: ${foodVendors ? foodVendors.length : 0}`);
  console.log(`Suspicious Food records relocated: ${foodNotRest.length}`);
  foodNotRest.forEach(v => console.log(`- ${v.name} | ${v.reason}`));

  console.log('\nCleanup Complete. Please verify visible listings before deploying frontend filters.');
}

run();
