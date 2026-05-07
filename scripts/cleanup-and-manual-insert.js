/**
 * cleanup-and-manual-insert.js
 * 
 * Three tasks:
 *  1. Remove pre-existing duplicate vendor names (keep the richer record)
 *  2. Delete the malformed "89Orion Avenue" listing
 *  3. Insert Niel Technician as a new manual listing
 *
 * Run: node scripts/cleanup-and-manual-insert.js
 */

'use strict';

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/[\r\n]/g, '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/[\r\n]/g, '').trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials'); process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Score how "rich" a vendor record is ──────────────────────────────────
function richnessScore(v) {
  let s = 0;
  if (v.description)        s += 10;
  if (v.slug)               s += 5;
  if (v.phone)              s += 4;
  if (v.google_place_id)    s += 4;
  if (v.address)            s += 3;
  if (v.latitude)           s += 3;
  if (v.rating > 0)         s += 2;
  if (v.images && v.images.length > 0) s += 3;
  if (v.website)            s += 2;
  if (v.category)           s += 1;
  return s;
}

// ─── TASK 1: Resolve duplicate business names ─────────────────────────────
async function resolveDuplicates() {
  console.log('\n── TASK 1: Resolving duplicate business names ──────────────');

  const { data: all, error } = await sb.from('vendors').select('*').order('created_at', { ascending: true });
  if (error) { console.error('Load error:', error.message); return; }

  // Group by exact business_name
  const groups = {};
  for (const v of all) {
    const key = v.business_name.trim();
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  }

  const dupGroups = Object.entries(groups).filter(([, arr]) => arr.length > 1);
  console.log(`Found ${dupGroups.length} duplicate name groups:`);

  let totalDeleted = 0;

  for (const [name, records] of dupGroups) {
    // Sort: highest richness score first; tie-break by created_at (older = keep)
    records.sort((a, b) => richnessScore(b) - richnessScore(a) || new Date(a.created_at) - new Date(b.created_at));

    const keep   = records[0];
    const remove = records.slice(1);

    console.log(`\n  "${name}":`);
    console.log(`    KEEP   → id: ${keep.id} | score: ${richnessScore(keep)} | slug: ${keep.slug || 'none'}`);
    for (const r of remove) {
      console.log(`    DELETE → id: ${r.id}   | score: ${richnessScore(r)} | slug: ${r.slug || 'none'}`);
      const { error: delErr } = await sb.from('vendors').delete().eq('id', r.id);
      if (delErr) {
        console.error(`    ⚠ Delete failed: ${delErr.message}`);
      } else {
        console.log(`    ✅ Deleted.`);
        totalDeleted++;
      }
    }
  }

  console.log(`\n  Total deleted: ${totalDeleted}`);
}

// ─── TASK 2: Delete malformed Orion Avenue record ─────────────────────────
async function deleteMalformedOrion() {
  console.log('\n── TASK 2: Deleting malformed Orion Avenue listing ─────────');

  const { data, error } = await sb
    .from('vendors')
    .select('id, business_name, slug')
    .ilike('business_name', '%89Orion%');

  if (error) { console.error('Search error:', error.message); return; }

  if (!data || data.length === 0) {
    console.log('  Not found — may have already been removed.');
    return;
  }

  for (const v of data) {
    console.log(`  Deleting: "${v.business_name}" (id: ${v.id})`);
    const { error: delErr } = await sb.from('vendors').delete().eq('id', v.id);
    if (delErr) console.error(`  ⚠ Failed: ${delErr.message}`);
    else console.log('  ✅ Deleted.');
  }
}

// ─── TASK 3: Insert Niel Technician ───────────────────────────────────────
async function insertNielTechnician() {
  console.log('\n── TASK 3: Inserting Niel Technician ───────────────────────');

  const slug = 'niel-technician';
  const phone = '876-441-3432';

  // Check not already in DB
  const { data: existing } = await sb
    .from('vendors')
    .select('id, business_name')
    .or(`slug.eq.${slug},phone.eq.${phone}`);

  if (existing && existing.length > 0) {
    console.log(`  ⚠ Already exists: "${existing[0].business_name}" — skipping insert.`);
    return;
  }

  const record = {
    business_name:       'Niel Technician',
    slug,
    category:            'Auto & Transport',
    description:         'Mobile car technician serving Harbour View and surrounding areas. Specialising in mechanical repairs, diagnostics, and general vehicle maintenance.',
    phone,
    address:             'Harbour View, Kingston 17, Jamaica',
    area:                'Harbour View',
    parish:              'Kingston / St. Andrew',
    postal_area:         'Kingston 17',
    source:              'manual',
    data_quality_status: 'verified',
    confidence_score:    90,
    last_verified_date:  new Date().toISOString().slice(0, 10),
    is_approved:         true,
    is_featured:         false,
    is_top_ad:           false,
    tier:                'free',
    rating:              0,
  };

  const { data: inserted, error } = await sb.from('vendors').insert(record).select().single();

  if (error) {
    console.error(`  ⚠ Insert failed: ${error.message}`);
  } else {
    console.log(`  ✅ Inserted: "${inserted.business_name}"`);
    console.log(`     ID   : ${inserted.id}`);
    console.log(`     Slug : /vendor/${inserted.slug}`);
    console.log(`     Phone: ${inserted.phone}`);
    console.log(`     Cat  : ${inserted.category}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60));
  console.log('Harbour View Directory — Cleanup & Manual Insert');
  console.log('='.repeat(60));

  await resolveDuplicates();
  await deleteMalformedOrion();
  await insertNielTechnician();

  // Final count
  const { count } = await sb.from('vendors').select('*', { count: 'exact', head: true });
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ All done. Total vendors now in database: ${count}`);
  console.log('='.repeat(60));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
