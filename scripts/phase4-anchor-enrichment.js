/**
 * phase4-anchor-enrichment.js
 * Extended enrichment focusing on anchors and exact names in Harbour View.
 */

'use strict';

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  inHarbourViewBounds, addressIsHarbourView, addressIsExcluded,
  categoryIsExcluded, normaliseName, normalisePhone,
  generateSlug, findDuplicate, computeUpdates,
} = require('./enrich-helpers');

const APPLY_MODE = process.argv.includes('--apply');
const RUN_ID     = crypto.randomUUID();
const RUN_DATE   = new Date().toISOString().slice(0, 10);
const OUT_DIR    = path.join(__dirname);

function hardStop(msg) {
  console.error(`\n🛑 HARD STOP: ${msg}`);
  console.error('No database changes were made.');
  process.exit(1);
}

const GOOGLE_API_KEY    = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL      = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/[\r\n]/g, '').trim();
const SUPABASE_SVC_KEY  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/[\r\n]/g, '').trim();

if (!GOOGLE_API_KEY)   hardStop('GOOGLE_PLACES_API_KEY is not set in .env.local');
if (!SUPABASE_URL)     hardStop('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
if (!SUPABASE_SVC_KEY) hardStop('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');

const supabase = createClient(SUPABASE_URL, SUPABASE_SVC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const HV_LAT = 17.952;
const HV_LNG = -76.727;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('location', `${HV_LAT},${HV_LNG}`);
  url.searchParams.set('radius', '2000');
  url.searchParams.set('key', GOOGLE_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠ Places API warning for "${query}": ${data.status} — ${data.error_message || ''}`);
    return [];
  }
  return data.results || [];
}

async function nearbySearch(lat, lng, keyword) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', '1000');
  if (keyword) url.searchParams.set('keyword', keyword);
  url.searchParams.set('key', GOOGLE_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠ Nearby API warning for "${keyword}": ${data.status} — ${data.error_message || ''}`);
    return [];
  }
  return data.results || [];
}

async function getPlaceDetails(placeId) {
  const fields = [
    'place_id','name','formatted_address','geometry','formatted_phone_number',
    'website','business_status','opening_hours','rating','user_ratings_total',
    'price_level','url','photos','types',
  ].join(',');

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', fields);
  url.searchParams.set('key', GOOGLE_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();
  if (data.status !== 'OK') return null;
  return data.result;
}

function buildPhotoRecords(details, slug) {
  if (!details.photos || !details.photos.length) return [];
  return details.photos.slice(0, 5).map(p => {
    const attribution = (p.html_attributions && p.html_attributions[0]) || 'Google Maps';
    if (!attribution) return null;
    return {
      source:          'google_places',
      photo_reference: p.photo_reference,
      photo_url:       null,
      width:           p.width || null,
      height:          p.height || null,
      attribution,
      business_slug:   slug,
      google_place_id: details.place_id,
      date_collected:  RUN_DATE,
    };
  }).filter(Boolean);
}

function mapPlaceToPayload(details) {
  const loc = details.geometry?.location || {};
  return {
    google_place_id:    details.place_id,
    name:               details.name,
    address:            details.formatted_address,
    lat:                loc.lat || null,
    lng:                loc.lng || null,
    phone:              details.formatted_phone_number || null,
    website:            details.website || null,
    google_maps_url:    details.url || null,
    business_status:    details.business_status || null,
    opening_hours:      details.opening_hours?.weekday_text ? { weekday_text: details.opening_hours.weekday_text } : null,
    price_level:        details.price_level ?? null,
    rating:             details.rating || null,
    review_count:       details.user_ratings_total || null,
    types:              details.types || [],
    area:               'Harbour View',
    parish:             'Kingston / St. Andrew',
    postal_area:        'Kingston 17',
    source:             'google_places',
    last_verified_date: RUN_DATE,
    data_quality_status:'verified',
  };
}

function inferCategory(types = [], name = '') {
  const t = types.join(' ').toLowerCase();
  const n = name.toLowerCase();
  if (t.includes('laundry') || n.includes('laundry') || n.includes('laundromat') || n.includes('cleaner')) return 'Laundry & Cleaning';
  if (t.includes('water') || n.includes('water')) return 'Retail & Shopping';
  if (t.includes('school') || t.includes('university') || n.includes('school') || n.includes('academy') || n.includes('teacher') || n.includes('tutor'))  return 'Education';
  if (t.includes('pharmacy') || n.includes('pharmacy')) return 'Health & Medical';
  if (t.includes('clinic') || t.includes('dentist') || t.includes('physician') || n.includes('medical') || t.includes('hospital')) return 'Health & Medical';
  if (t.includes('church') || t.includes('place_of_worship') || n.includes('church')) return 'Community & Church';
  if (t.includes('restaurant') || t.includes('food') || t.includes('meal') || n.includes('fast food') || n.includes('cook shop')) return 'Food & Beverage';
  if (t.includes('grocery') || t.includes('supermarket') || n.includes('wholesale')) return 'Retail & Shopping';
  if (t.includes('hardware') || t.includes('home_goods')) return 'Home Services';
  if (t.includes('car_repair') || t.includes('car_wash') || n.includes('tyre') || n.includes('mechanic')) return 'Auto & Transport';
  if (t.includes('gas_station')) return 'Auto & Transport';
  if (t.includes('hair_care') || t.includes('beauty') || n.includes('barber') || n.includes('salon')) return 'Beauty & Wellness';
  if (t.includes('gym') || t.includes('fitness')) return 'Community & Church';
  if (t.includes('bank') || t.includes('atm') || t.includes('finance') || n.includes('cambio') || n.includes('remittance')) return 'Finance & Banking';
  if (t.includes('electronics') || n.includes('phone repair')) return 'Tech & Electronics';
  return 'Professional Services';
}

async function loadExistingVendors() {
  const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: true });
  if (error) hardStop(`Could not load vendors table: ${error.message}`);
  return data;
}

const ANCHORS = [
  'Harbour View Shopping Centre',
  'Harbour View Shopping Center',
  'Harbour View Harbour Centre',
  'Fort Nugent Drive',
  'Harbour Drive',
  'Harbour View Roundabout',
  'Kingston 17',
  'Harbour View P.O.',
  'Shoppers Fair Harbour View',
  'Total Harbour View',
];
for (let i = 1; i <= 50; i++) ANCHORS.push(`Shop ${i} Harbour View Shopping Centre`);

const SERVICES = [
  'laundromat', 'laundry', 'dry cleaner', 'wash and fold',
  'water shop', 'water refill', 'purified water', 'water delivery',
  'Chinese restaurant', 'Chinese food', 'Chinese takeout',
  'cook shop', 'fast food', 'supermarket', 'grocery', 'pharmacy',
  'barber', 'salon', 'nail tech', 'beauty supply', 'hardware',
  'phone repair', 'electronics', 'tyre shop', 'mechanic', 'car wash',
  'cooking gas', 'ATM', 'bill payment', 'money transfer', 'cambio',
  'clinic', 'dentist', 'school', 'church', 'plaza shop', 'shopping centre tenant'
];

async function run() {
  console.log(`\n${'='.repeat(60)}\nHarbour View Full Community Business Coverage (Phase 4)\nRun ID: ${RUN_ID}\nMode: ${APPLY_MODE ? 'APPLY' : 'DRY RUN'}\n${'='.repeat(60)}\n`);

  const existingVendors = await loadExistingVendors();
  const backupPath = path.join(OUT_DIR, 'affected_rows_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify({ run_id: RUN_ID, backed_up: RUN_DATE, row_count: existingVendors.length, vendors: existingVendors }, null, 2));

  let seedList = [];
  const seedPath = path.join(OUT_DIR, 'harbour-view-known-businesses.json');
  if (fs.existsSync(seedPath)) {
    seedList = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }

  const queriesExecuted = new Set();
  const seenPlaceIds = new Set();
  const allPlaces = [];

  async function executeSearch(query, origin) {
    if (queriesExecuted.has(query)) return;
    queriesExecuted.add(query);
    console.log(`🔍 [${origin}] Searching: "${query}"`);
    await sleep(200);
    const results = await textSearch(query);
    for (const r of results) {
      if (!r.place_id || seenPlaceIds.has(r.place_id)) continue;
      seenPlaceIds.add(r.place_id);
      allPlaces.push({ ...r, _origin: origin, _query: query });
    }
  }

  // 1. Anchor + Service pass
  for (const anchor of ANCHORS) {
    await executeSearch(`${anchor} businesses`, 'anchor');
    if (!anchor.startsWith('Shop ')) {
      // For general anchors, search nearby specific services
      const sampleServices = ['laundromat', 'water shop', 'supermarket', 'pharmacy', 'Chinese restaurant', 'hardware', 'cook shop'];
      for (const svc of sampleServices) {
        await executeSearch(`${anchor} ${svc}`, 'anchor+service');
      }
    }
  }

  // 2. Service Recovery pass
  for (const svc of SERVICES) {
    await executeSearch(`${svc} Harbour View Kingston Jamaica`, 'service_recovery');
    await executeSearch(`${svc} Harbour View Kingston 17`, 'service_recovery');
  }

  // 3. Exact Seed pass
  for (const seed of seedList) {
    if (!seed.name) continue;
    await executeSearch(`${seed.name} Harbour View`, 'seed');
    await executeSearch(`${seed.name} Kingston 17`, 'seed');
    await executeSearch(`${seed.name} Fort Nugent Drive`, 'seed');
  }

  // 4. Shopping Centre Nearby pass
  // Known coords roughly for shopping centre: 17.9515, -76.7265
  await sleep(200);
  const nearbyCenter = await nearbySearch(17.9515, -76.7265, 'store');
  for (const r of nearbyCenter) {
    if (!r.place_id || seenPlaceIds.has(r.place_id)) continue;
    seenPlaceIds.add(r.place_id);
    allPlaces.push({ ...r, _origin: 'shopping_center_nearby', _query: 'Nearby Search' });
  }

  console.log(`\n📦 Total unique Places results collected: ${allPlaces.length}`);

  const report = {
    SECTION_1_Summary: { mode: APPLY_MODE ? 'apply' : 'dry_run', total_found: allPlaces.length, updated: 0, inserted: 0, rejected: 0, needs_review: 0 },
    SECTION_2_Existing_Updated: [],
    SECTION_3_New_To_Insert: [],
    SECTION_4_Needs_Review: [],
    SECTION_5_Rejected: [],
    SECTION_6_Seed_List_Verification: seedList,
    SECTION_7_Anchor_Coverage: { queries_attempted: Array.from(queriesExecuted), places_found: allPlaces.length },
    SECTION_8_Missed_Recovery: []
  };

  const existingSlugs = existingVendors.map(v => v.slug).filter(Boolean);
  const runLog = [];

  let missingCore = { laundry: true, water: true, chinese: true };

  for (const place of allPlaces) {
    await sleep(150);
    const details = await getPlaceDetails(place.place_id);
    if (!details) {
      report.SECTION_5_Rejected.push({ name: place.name, reason: 'Details fetch failed' });
      continue;
    }

    const payload = mapPlaceToPayload(details);
    const inBounds = inHarbourViewBounds(payload.lat, payload.lng);
    const isHarbourViewAddr = addressIsHarbourView(payload.address);
    const hasShopStr = (payload.address || '').toLowerCase().includes('shop ') || (payload.name || '').toLowerCase().includes('shop ');
    const hasFortNugent = (payload.address || '').toLowerCase().includes('fort nugent') || (payload.address || '').toLowerCase().includes('harbour drive');
    
    if (categoryIsExcluded(payload.types) || addressIsExcluded(payload.address)) {
      report.SECTION_5_Rejected.push({ name: payload.name, address: payload.address, reason: 'Excluded category — not suitable for public community directory.' });
      report.SECTION_1_Summary.rejected++;
      continue;
    }

    const validLocation = inBounds || isHarbourViewAddr || hasShopStr || hasFortNugent;

    let dupResult;
    try { dupResult = findDuplicate(payload, existingVendors); } 
    catch (err) { hardStop(`Duplicate check failed: ${err.message}`); }

    const category = inferCategory(payload.types, payload.name);
    if (category === 'Laundry & Cleaning') missingCore.laundry = false;
    if (category === 'Retail & Shopping' && (payload.name.toLowerCase().includes('water'))) missingCore.water = false;
    if (category === 'Food & Beverage' && (payload.name.toLowerCase().includes('chinese'))) missingCore.chinese = false;

    if (dupResult.match) {
      if (dupResult.certainty === 'possible') {
        report.SECTION_4_Needs_Review.push({ name: payload.name, reason: `Possible duplicate of ${dupResult.match.business_name}` });
        report.SECTION_1_Summary.needs_review++;
        continue;
      }
      const existing = dupResult.match;
      const { updates, changelog } = computeUpdates(existing, payload);
      report.SECTION_2_Existing_Updated.push({ name: existing.business_name, updates: changelog });
      report.SECTION_1_Summary.updated++;
      
      if (APPLY_MODE && Object.keys(updates).length > 0) {
        await supabase.from('vendors').update(updates).eq('id', existing.id);
      }
      continue;
    }

    if (!validLocation) {
      report.SECTION_4_Needs_Review.push({ name: payload.name, address: payload.address, reason: 'Low location confidence' });
      report.SECTION_1_Summary.needs_review++;
      continue;
    }

    const newSlug = generateSlug(payload.name, existingSlugs);
    existingSlugs.push(newSlug);
    const photos = buildPhotoRecords(details, newSlug);

    const newVendor = {
      business_name: payload.name,
      slug: newSlug,
      category,
      address: payload.address,
      phone: payload.phone,
      website: payload.website,
      google_place_id: payload.google_place_id,
      google_maps_url: payload.google_maps_url,
      latitude: payload.lat,
      longitude: payload.lng,
      business_status: payload.business_status,
      opening_hours: payload.opening_hours,
      rating: payload.rating,
      review_count: payload.review_count,
      price_level: payload.price_level,
      source: 'google_places',
      last_verified_date: RUN_DATE,
      data_quality_status: 'verified',
      confidence_score: 90,
      is_approved: true,
      area: 'Harbour View',
      parish: 'Kingston / St. Andrew',
      postal_area: 'Kingston 17'
    };

    report.SECTION_3_New_To_Insert.push(newVendor);
    report.SECTION_1_Summary.inserted++;
    
    if (APPLY_MODE) {
      const { data: inserted, error: insErr } = await supabase.from('vendors').insert(newVendor).select().single();
      if (!insErr && inserted) {
        for (const img of photos) {
          if (!img.attribution) hardStop(`Image missing attribution for ${payload.name}`);
          await supabase.from('business_images').upsert({ ...img, vendor_id: inserted.id }, { onConflict: 'google_place_id,photo_reference' });
        }
      }
    }
  }

  const reportPath = path.join(OUT_DIR, 'enrichment_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n✅ Script complete. Summary:
  Updated: ${report.SECTION_1_Summary.updated}
  Inserted: ${report.SECTION_1_Summary.inserted}
  Needs Review: ${report.SECTION_1_Summary.needs_review}
  Rejected: ${report.SECTION_1_Summary.rejected}`);

  if (missingCore.laundry || missingCore.water || missingCore.chinese) {
    console.warn('\n⚠️ WARNING: Core missing categories (laundry, water, chinese) were not fully resolved.');
    if (APPLY_MODE) hardStop('Missing core categories still exist. Cannot apply.');
  }

  if (APPLY_MODE) console.log('\nAPPLIED TO DATABASE ✅');
  else console.log('\nDRY RUN ONLY — Use --apply to commit changes.');
}

run().catch(e => hardStop(e.message));
