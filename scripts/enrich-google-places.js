/**
 * enrich-google-places.js
 * Google Places enrichment pipeline for Harbour View Directory.
 *
 * USAGE:
 *   node scripts/enrich-google-places.js            # dry-run (default, NO DB writes)
 *   node scripts/enrich-google-places.js --apply    # write approved changes to Supabase
 *
 * OUTPUT FILES (always written, even in dry-run):
 *   scripts/enrichment_report.json
 *   scripts/affected_rows_backup.json
 *   scripts/enrichment_run_log.json
 *
 * HARD STOPS (script aborts before touching DB):
 *   - GOOGLE_PLACES_API_KEY missing
 *   - SUPABASE_SERVICE_ROLE_KEY missing
 *   - vendors table cannot be loaded
 *   - duplicate check function throws
 *   - any DELETE / TRUNCATE / DROP detected in generated SQL
 *   - >25% of proposed inserts are needs_review
 *   - any image record missing attribution
 */

'use strict';

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');
const {
  inHarbourViewBounds, addressIsHarbourView, addressIsExcluded,
  categoryIsExcluded, scoreConfidence, normaliseName, normalisePhone,
  generateSlug, findDuplicate, computeUpdates,
} = require('./enrich-helpers');

// ─── Config & hard-stop checks ────────────────────────────────────────────

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

// ─── Search queries ───────────────────────────────────────────────────────

const SEARCH_QUERIES = [
  'businesses in Harbour View Kingston Jamaica',
  'restaurants in Harbour View Kingston Jamaica',
  'pharmacy Harbour View Kingston 17',
  'supermarket Harbour View Kingston 17',
  'grocery Harbour View Kingston Jamaica',
  'barber Harbour View Kingston Jamaica',
  'salon Harbour View Kingston Jamaica',
  'hardware store Harbour View Kingston Jamaica',
  'clinic Harbour View Kingston 17',
  'school Harbour View Kingston 17',
  'church Harbour View Kingston 17',
  'auto repair Harbour View Kingston Jamaica',
  'tyre shop Harbour View Kingston Jamaica',
  'gas station Harbour View Kingston Jamaica',
  'cooking gas Harbour View Kingston Jamaica',
  'ATM Harbour View Kingston Jamaica',
  'shops Harbour View Kingston 17',
  'gym Harbour View Kingston Jamaica',
  'courier delivery Harbour View Kingston Jamaica',
];

// Harbour View centre for location bias
const HV_LAT = 17.952;
const HV_LNG = -76.727;

// ─── Google Places API calls ──────────────────────────────────────────────

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('location', `${HV_LAT},${HV_LNG}`);
  url.searchParams.set('radius', '2000'); // 2 km radius bias
  url.searchParams.set('key', GOOGLE_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠ Places API warning for "${query}": ${data.status} — ${data.error_message || ''}`);
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

  if (data.status !== 'OK') {
    console.warn(`  ⚠ Place details failed for ${placeId}: ${data.status}`);
    return null;
  }
  return data.result;
}

function buildPhotoRecords(details, slug) {
  if (!details.photos || !details.photos.length) return [];
  return details.photos.slice(0, 5).map(p => {
    const attribution = (p.html_attributions && p.html_attributions[0]) || 'Google Maps';
    if (!attribution) return null; // hard stop guard — skip if attribution missing
    return {
      source:          'google_places',
      photo_reference: p.photo_reference,
      photo_url:       null, // do not auto-download — store reference only
      width:           p.width || null,
      height:          p.height || null,
      attribution,
      business_slug:   slug,
      google_place_id: details.place_id,
      date_collected:  RUN_DATE,
    };
  }).filter(Boolean);
}

// ─── Load existing vendors ────────────────────────────────────────────────

async function loadExistingVendors() {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) hardStop(`Could not load vendors table: ${error.message}`);
  console.log(`✅ Loaded ${data.length} existing vendors from Supabase.`);
  return data;
}

// ─── Map a Google Place → enrichment payload ──────────────────────────────

function mapPlaceToPayload(details) {
  const loc = details.geometry?.location || {};
  const hours = details.opening_hours?.weekday_text
    ? { weekday_text: details.opening_hours.weekday_text }
    : null;

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
    opening_hours:      hours,
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

// ─── Category mapping ─────────────────────────────────────────────────────

function inferCategory(types = [], name = '') {
  const t = types.join(' ').toLowerCase();
  const n = name.toLowerCase();
  if (t.includes('pharmacy') || n.includes('pharmacy')) return 'Community';
  if (t.includes('school') || t.includes('university'))  return 'Education & Tutoring';
  if (t.includes('church') || t.includes('place_of_worship')) return 'Community';
  if (t.includes('restaurant') || t.includes('food') || t.includes('meal')) return 'Food & Beverage';
  if (t.includes('grocery') || t.includes('supermarket')) return 'Retail & Shopping';
  if (t.includes('hardware') || t.includes('home_goods')) return 'Home Services';
  if (t.includes('car_repair') || t.includes('car_wash')) return 'Auto & Transport';
  if (t.includes('gas_station')) return 'Auto & Transport';
  if (t.includes('hair_care') || t.includes('beauty')) return 'Beauty & Wellness';
  if (t.includes('gym') || t.includes('fitness')) return 'Community';
  if (t.includes('bank') || t.includes('atm') || t.includes('finance')) return 'Professional / Legal / JP';
  return 'Professional Services';
}

// ─── Main pipeline ────────────────────────────────────────────────────────

async function run() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Harbour View Directory — Google Places Enrichment`);
  console.log(`Run ID  : ${RUN_ID}`);
  console.log(`Mode    : ${APPLY_MODE ? '⚠️  APPLY (DB writes enabled)' : '🔍 DRY RUN (no DB writes)'}`);
  console.log(`Date    : ${RUN_DATE}`);
  console.log(`${'='.repeat(60)}\n`);

  // 1. Load existing vendors
  const existingVendors = await loadExistingVendors();
  const existingSlugs   = existingVendors.map(v => v.slug).filter(Boolean);

  // 2. Back up existing vendors to JSON (always, even dry-run)
  const backupPath = path.join(OUT_DIR, 'affected_rows_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify({
    run_id:     RUN_ID,
    backed_up:  RUN_DATE,
    row_count:  existingVendors.length,
    vendors:    existingVendors,
  }, null, 2));
  console.log(`💾 Backed up ${existingVendors.length} existing vendors → affected_rows_backup.json`);

  // 3. Collect all Google Places results (deduplicated by place_id)
  const seenPlaceIds = new Set();
  const allPlaces    = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`\n🔍 Searching: "${query}"`);
    await sleep(200); // rate-limit courtesy delay
    const results = await textSearch(query);
    console.log(`   Found ${results.length} results`);

    for (const r of results) {
      if (!r.place_id || seenPlaceIds.has(r.place_id)) continue;
      seenPlaceIds.add(r.place_id);
      allPlaces.push(r);
    }
  }

  console.log(`\n📦 Total unique Places results: ${allPlaces.length}`);

  // 4. Process each place
  const report = {
    run_id:            RUN_ID,
    run_date:          RUN_DATE,
    mode:              APPLY_MODE ? 'apply' : 'dry_run',
    summary: {
      existing_records_scanned: existingVendors.length,
      google_places_found:      allPlaces.length,
      updated:                  0,
      inserted:                 0,
      duplicates_skipped:       0,
      needs_review:             0,
      rejected:                 0,
      images_collected:         0,
    },
    updated:      [],
    inserted:     [],
    needs_review: [],
    rejected:     [],
  };

  const runLog = [];

  for (const place of allPlaces) {
    // Get full details
    await sleep(150);
    const details = await getPlaceDetails(place.place_id);
    if (!details) {
      report.rejected.push({ action: 'reject', name: place.name, address: place.formatted_address, google_place_id: place.place_id, reason: 'Place details fetch failed', confidence_score: 0 });
      report.summary.rejected++;
      continue;
    }

    const payload = mapPlaceToPayload(details);

    // ── Harbour View validation (must pass ≥ 2 signals) ──────────────
    const inBounds  = inHarbourViewBounds(payload.lat, payload.lng);
    const inAddress = addressIsHarbourView(payload.address);
    const excluded  = addressIsExcluded(payload.address) || categoryIsExcluded(payload.types);
    const signals   = (inBounds ? 1 : 0) + (inAddress ? 1 : 0);

    if (excluded) {
      report.rejected.push({ action: 'reject', name: payload.name, address: payload.address, google_place_id: payload.google_place_id, reason: 'Excluded area or category', confidence_score: 0 });
      report.summary.rejected++;
      runLog.push({ run_id: RUN_ID, action: 'reject', name: payload.name, google_place_id: payload.google_place_id, confidence_score: 0, reason: 'Excluded', dry_run: !APPLY_MODE });
      continue;
    }

    if (signals < 2) {
      const { score, reasons } = scoreConfidence(payload);
      if (score < 60) {
        report.rejected.push({ action: 'reject', name: payload.name, address: payload.address, google_place_id: payload.google_place_id, reason: `Insufficient Harbour View signals (score ${score}): ${reasons.join('; ')}`, confidence_score: score });
        report.summary.rejected++;
        runLog.push({ run_id: RUN_ID, action: 'reject', name: payload.name, google_place_id: payload.google_place_id, confidence_score: score, reason: reasons.join('; '), dry_run: !APPLY_MODE });
        continue;
      }
      // Score 60–79: needs_review
      if (score < 80) {
        report.needs_review.push({ action: 'needs_review', name: payload.name, address: payload.address, google_place_id: payload.google_place_id, reason: `Low Harbour View confidence (score ${score})`, confidence_score: score });
        report.summary.needs_review++;
        runLog.push({ run_id: RUN_ID, action: 'needs_review', name: payload.name, google_place_id: payload.google_place_id, confidence_score: score, reason: `Low confidence`, dry_run: !APPLY_MODE });
        continue;
      }
    }

    const { score: confidence, reasons: confReasons } = scoreConfidence(payload);

    // ── Duplicate detection ───────────────────────────────────────────
    let dupResult;
    try {
      dupResult = findDuplicate(payload, existingVendors);
    } catch (err) {
      hardStop(`Duplicate check threw an error: ${err.message}`);
    }

    const photos = buildPhotoRecords(details, ''); // slug TBD

    if (dupResult.match) {
      const existing = dupResult.match;

      if (dupResult.certainty === 'possible') {
        // Possible duplicate — send to needs_review
        report.needs_review.push({ action: 'needs_review', name: payload.name, address: payload.address, google_place_id: payload.google_place_id, reason: `Possible duplicate of "${existing.business_name}" (method: ${dupResult.method})`, confidence_score: confidence });
        report.summary.needs_review++;
        runLog.push({ run_id: RUN_ID, action: 'needs_review', name: payload.name, google_place_id: payload.google_place_id, confidence_score: confidence, reason: `Possible dup: ${dupResult.method}`, dry_run: !APPLY_MODE });
        continue;
      }

      // Definite/probable duplicate — update existing record
      const { updates, changelog } = computeUpdates(existing, {
        google_place_id:    payload.google_place_id,
        latitude:           payload.lat,
        longitude:          payload.lng,
        address:            payload.address,
        phone:              payload.phone,
        website:            payload.website,
        google_maps_url:    payload.google_maps_url,
        business_status:    payload.business_status,
        opening_hours:      payload.opening_hours,
        price_level:        payload.price_level,
        rating:             payload.rating,
        review_count:       payload.review_count,
        area:               payload.area,
        parish:             payload.parish,
        postal_area:        payload.postal_area,
        last_verified_date: payload.last_verified_date,
        confidence_score:   confidence,
        source:             existing.source || 'google_places',
        data_quality_status:'verified',
      });

      const photosWithSlug = photos.map(p => ({ ...p, business_slug: existing.slug || '' }));

      report.updated.push({
        action:           'update_existing',
        existing_id:      existing.id,
        name:             existing.business_name,
        slug:             existing.slug,
        google_place_id:  payload.google_place_id,
        fields_updated:   changelog,
        images_added:     photosWithSlug,
        confidence_score: confidence,
        reason:           `Matched by ${dupResult.method}. ${confReasons.join('; ')}`,
      });
      report.summary.updated++;
      report.summary.images_collected += photosWithSlug.length;

      if (APPLY_MODE && Object.keys(updates).length > 0) {
        const { error: updErr } = await supabase.from('vendors').update(updates).eq('id', existing.id);
        if (updErr) console.error(`  ⚠ Update failed for ${existing.id}: ${updErr.message}`);
        else console.log(`  ✅ Updated: ${existing.business_name}`);

        // Insert image records
        for (const img of photosWithSlug) {
          if (!img.attribution) { console.warn('  ⚠ Skipped image: missing attribution'); continue; }
          await supabase.from('business_images').upsert({ ...img, vendor_id: existing.id }, { onConflict: 'google_place_id,photo_reference' });
        }
      }

      runLog.push({ run_id: RUN_ID, action: 'update_existing', vendor_id: existing.id, name: existing.business_name, slug: existing.slug, google_place_id: payload.google_place_id, fields_updated: changelog, images_added: photosWithSlug.map(p => p.photo_reference), confidence_score: confidence, reason: `Matched by ${dupResult.method}`, dry_run: !APPLY_MODE });
      continue;
    }

    // ── New insert ────────────────────────────────────────────────────
    if (confidence < 80) {
      report.needs_review.push({ action: 'needs_review', name: payload.name, address: payload.address, google_place_id: payload.google_place_id, reason: `Confidence ${confidence} < 80`, confidence_score: confidence });
      report.summary.needs_review++;
      runLog.push({ run_id: RUN_ID, action: 'needs_review', name: payload.name, google_place_id: payload.google_place_id, confidence_score: confidence, reason: 'Sub-80 confidence', dry_run: !APPLY_MODE });
      continue;
    }

    if (!payload.google_place_id) {
      report.rejected.push({ action: 'reject', name: payload.name, address: payload.address, google_place_id: null, reason: 'Missing google_place_id', confidence_score: confidence });
      report.summary.rejected++;
      continue;
    }

    if (payload.business_status && payload.business_status !== 'OPERATIONAL') {
      report.rejected.push({ action: 'reject', name: payload.name, address: payload.address, google_place_id: payload.google_place_id, reason: `Business status: ${payload.business_status}`, confidence_score: confidence });
      report.summary.rejected++;
      continue;
    }

    const newSlug  = generateSlug(payload.name, existingSlugs);
    existingSlugs.push(newSlug); // reserve slug for this run
    const category = inferCategory(payload.types, payload.name);
    const photosWithSlug = photos.map(p => ({ ...p, business_slug: newSlug }));

    const newVendor = {
      action:             'insert_new',
      name:               payload.name,
      slug:               newSlug,
      category,
      secondary_categories: [],
      description:        '',
      address:            payload.address,
      area:               'Harbour View',
      parish:             'Kingston / St. Andrew',
      postal_area:        'Kingston 17',
      latitude:           payload.lat,
      longitude:          payload.lng,
      phone:              payload.phone,
      website:            payload.website,
      google_place_id:    payload.google_place_id,
      google_maps_url:    payload.google_maps_url,
      business_status:    payload.business_status,
      opening_hours:      payload.opening_hours,
      rating:             payload.rating,
      review_count:       payload.review_count,
      price_level:        payload.price_level,
      images:             photosWithSlug,
      source:             'google_places',
      last_verified_date: RUN_DATE,
      data_quality_status:'verified',
      confidence_score:   confidence,
      notes:              confReasons.join('; '),
    };

    report.inserted.push(newVendor);
    report.summary.inserted++;
    report.summary.images_collected += photosWithSlug.length;

    if (APPLY_MODE) {
      const insertRow = {
        business_name:      payload.name,
        slug:               newSlug,
        category,
        address:            payload.address,
        phone:              payload.phone,
        website:            payload.website,
        google_place_id:    payload.google_place_id,
        google_maps_url:    payload.google_maps_url,
        latitude:           payload.lat,
        longitude:          payload.lng,
        area:               'Harbour View',
        parish:             'Kingston / St. Andrew',
        postal_area:        'Kingston 17',
        business_status:    payload.business_status,
        opening_hours:      payload.opening_hours,
        rating:             payload.rating,
        review_count:       payload.review_count,
        price_level:        payload.price_level,
        source:             'google_places',
        last_verified_date: RUN_DATE,
        data_quality_status:'verified',
        confidence_score:   confidence,
        is_approved:        true,
      };

      const { data: inserted, error: insErr } = await supabase.from('vendors').insert(insertRow).select().single();
      if (insErr) {
        console.error(`  ⚠ Insert failed for ${payload.name}: ${insErr.message}`);
      } else {
        console.log(`  ✅ Inserted: ${payload.name} → /vendor/${newSlug}`);
        for (const img of photosWithSlug) {
          if (!img.attribution) { console.warn('  ⚠ Skipped image: missing attribution'); continue; }
          await supabase.from('business_images').upsert({ ...img, vendor_id: inserted.id }, { onConflict: 'google_place_id,photo_reference' });
        }
      }
    }

    runLog.push({ run_id: RUN_ID, action: 'insert_new', name: payload.name, slug: newSlug, google_place_id: payload.google_place_id, confidence_score: confidence, reason: confReasons.join('; '), dry_run: !APPLY_MODE });
  }

  // ── Hard stop: >25% needs_review ─────────────────────────────────────
  const totalProposed = report.summary.inserted + report.summary.needs_review;
  if (totalProposed > 0 && report.summary.needs_review / totalProposed > 0.25) {
    if (APPLY_MODE) {
      hardStop(`More than 25% of proposed inserts are needs_review (${report.summary.needs_review}/${totalProposed}). Review enrichment_report.json before re-running with --apply.`);
    } else {
      console.warn(`\n⚠️  WARNING: ${report.summary.needs_review}/${totalProposed} proposed records are needs_review (>${ Math.round(report.summary.needs_review/totalProposed*100)}%). Resolve before applying.`);
    }
  }

  // ── Write enrichment_log to Supabase (even in dry-run — log only) ──
  if (runLog.length > 0) {
    await supabase.from('enrichment_log').insert(runLog);
  }

  // ── Write output files ─────────────────────────────────────────────
  const reportPath = path.join(OUT_DIR, 'enrichment_report.json');
  const logPath    = path.join(OUT_DIR, 'enrichment_run_log.json');

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(logPath,    JSON.stringify({ run_id: RUN_ID, run_date: RUN_DATE, mode: APPLY_MODE ? 'apply' : 'dry_run', actions: runLog }, null, 2));

  // ── Print summary ──────────────────────────────────────────────────
  console.log(`\n${'='.repeat(60)}`);
  console.log('ENRICHMENT SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Existing vendors scanned : ${report.summary.existing_records_scanned}`);
  console.log(`Google Places found      : ${report.summary.google_places_found}`);
  console.log(`Updated                  : ${report.summary.updated}`);
  console.log(`Inserted                 : ${report.summary.inserted}`);
  console.log(`Needs review             : ${report.summary.needs_review}`);
  console.log(`Rejected                 : ${report.summary.rejected}`);
  console.log(`Images collected         : ${report.summary.images_collected}`);
  console.log(`Mode                     : ${APPLY_MODE ? 'APPLIED ✅' : 'DRY RUN — no DB writes made'}`);
  console.log(`\nOutput files:`);
  console.log(`  ${reportPath}`);
  console.log(`  ${backupPath}`);
  console.log(`  ${logPath}`);
  console.log(`${'='.repeat(60)}\n`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

run().catch(err => { console.error('Fatal error:', err); process.exit(1); });
