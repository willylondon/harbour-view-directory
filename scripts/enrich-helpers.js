/**
 * enrich-helpers.js
 * Pure helper functions for the Google Places enrichment pipeline.
 * No Supabase or API calls here — fully testable in isolation.
 */

// ─── Harbour View geofence ─────────────────────────────────────────────────
const HV_BOUNDS = {
  latMin: 17.930, latMax: 17.975,
  lngMin: -76.745, lngMax: -76.710,
};

const EXCLUDED_AREAS = [
  'bull bay', 'seven miles', 'rockfort', 'mountain view',
  'windward road', 'port royal', 'palisadoes', 'norman manley',
  'downtown kingston', 'vineyard town', 'rollington town',
  'downtown', 'new kingston',
];

const EXCLUDED_CATEGORIES = [
  'betting', 'gambling', 'adult entertainment', 'casino',
  'cannabis', 'vape', 'smoke shop', 'weapon', 'firearms',
];

/** Returns true if lat/lng fall inside the Harbour View geofence */
function inHarbourViewBounds(lat, lng) {
  if (lat == null || lng == null) return false;
  return (
    lat >= HV_BOUNDS.latMin && lat <= HV_BOUNDS.latMax &&
    lng >= HV_BOUNDS.lngMin && lng <= HV_BOUNDS.lngMax
  );
}

/** Returns true if address string explicitly mentions Harbour View or Kingston 17 */
function addressIsHarbourView(address) {
  if (!address) return false;
  const a = address.toLowerCase();
  return a.includes('harbour view') || a.includes('harbor view') || a.includes('kingston 17');
}

/** Returns true if the address mentions an excluded area */
function addressIsExcluded(address) {
  if (!address) return false;
  const a = address.toLowerCase();
  return EXCLUDED_AREAS.some(x => a.includes(x));
}

/** Returns true if the business type/category is excluded */
function categoryIsExcluded(types = []) {
  return EXCLUDED_CATEGORIES.some(ex =>
    types.some(t => t.toLowerCase().includes(ex))
  );
}

// ─── Confidence scoring ────────────────────────────────────────────────────

/**
 * Score a Google Places result for confidence it belongs in Harbour View.
 * Returns integer 0–100.
 */
function scoreConfidence(place) {
  const { lat, lng, address, types = [], business_status } = place;
  let score = 0;
  const reasons = [];

  const inBounds = inHarbourViewBounds(lat, lng);
  const inAddress = addressIsHarbourView(address);
  const excluded = addressIsExcluded(address);
  const catExcluded = categoryIsExcluded(types);

  if (excluded || catExcluded) return { score: 0, reasons: ['Excluded area or category'] };

  if (inBounds) { score += 50; reasons.push('Coordinates inside Harbour View geofence'); }
  if (inAddress) { score += 35; reasons.push('Address contains Harbour View / Kingston 17'); }

  // Both signals = very high confidence
  if (inBounds && inAddress) { score = Math.min(score + 10, 100); }

  if (business_status === 'OPERATIONAL') { score += 5; reasons.push('Status: OPERATIONAL'); }

  // Has a place_id
  if (place.place_id) { score = Math.min(score + 5, 100); reasons.push('Valid place_id present'); }

  // Neither signal — reject
  if (!inBounds && !inAddress) {
    score = 40;
    reasons.push('No Harbour View address signal and outside geofence');
  }

  return { score: Math.min(score, 100), reasons };
}

// ─── Text normalisation ────────────────────────────────────────────────────

function normaliseName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalisePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

function normaliseAddress(address) {
  if (!address) return '';
  return address.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function generateSlug(name, existingSlugs = []) {
  let base = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!existingSlugs.includes(base)) return base;

  let counter = 2;
  while (existingSlugs.includes(`${base}-${counter}`)) counter++;
  return `${base}-${counter}`;
}

// ─── Levenshtein distance (for near-name dedup) ────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

/** Distance in metres between two lat/lng pairs (Haversine) */
function metresApart(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ─── Duplicate detection ───────────────────────────────────────────────────

/**
 * Check a Google Places result against the existing vendor list.
 * Returns { match: vendor|null, method: string|null, certainty: 'definite'|'probable'|'possible' }
 */
function findDuplicate(place, existingVendors) {
  const placePhone = normalisePhone(place.phone);
  const placeName  = normaliseName(place.name);
  const placeAddr  = normaliseAddress(place.address);
  const placeSlug  = place.name
    ? place.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    : '';

  for (const v of existingVendors) {
    // 1. google_place_id exact match
    if (place.place_id && v.google_place_id && place.place_id === v.google_place_id) {
      return { match: v, method: 'google_place_id', certainty: 'definite' };
    }

    // 2. normalised phone match
    if (placePhone && v.phone) {
      const vPhone = normalisePhone(v.phone);
      if (placePhone === vPhone && placePhone.length >= 7) {
        return { match: v, method: 'phone', certainty: 'definite' };
      }
    }

    // 3. name + address
    const vName = normaliseName(v.business_name);
    const vAddr = normaliseAddress(v.address);
    if (placeName && vName && placeAddr && vAddr &&
        placeName === vName && placeAddr === vAddr) {
      return { match: v, method: 'name+address', certainty: 'definite' };
    }

    // 4. near-name + nearby coordinates
    if (placeName && vName && levenshtein(placeName, vName) <= 2) {
      if (v.latitude && v.longitude && place.lat && place.lng) {
        const dist = metresApart(place.lat, place.lng, v.latitude, v.longitude);
        if (dist <= 100) {
          return { match: v, method: 'near-name+coords', certainty: 'probable' };
        }
      }
    }

    // 5. website match
    if (place.website && v.website) {
      const clean = u => u.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      if (clean(place.website) === clean(v.website)) {
        return { match: v, method: 'website', certainty: 'probable' };
      }
    }

    // 6. similar slug
    if (placeSlug && v.slug && levenshtein(placeSlug, v.slug) <= 2) {
      return { match: v, method: 'slug-similarity', certainty: 'possible' };
    }
  }

  return { match: null, method: null, certainty: null };
}

// ─── Field merge (safe update) ─────────────────────────────────────────────

/** PROTECTED fields — never overwrite if already set */
const PROTECTED_FIELDS = new Set([
  'business_name', 'slug', 'description', 'category',
  'images', 'admin_notes', 'is_featured', 'meta_title',
  'meta_description', 'is_approved', 'tier',
]);

/** SAFE fields — enrich only if blank or explicitly stale */
const ENRICHABLE_FIELDS = [
  'google_place_id', 'latitude', 'longitude', 'address',
  'phone', 'website', 'google_maps_url', 'business_status',
  'opening_hours', 'price_level', 'rating', 'review_count',
  'area', 'parish', 'postal_area', 'last_verified_date',
  'confidence_score', 'source', 'data_quality_status',
];

/**
 * Compute the set of fields that are safe to update on an existing vendor.
 * Returns { updates: {field: newVal}, changelog: [{field, old, new}] }
 */
function computeUpdates(existingVendor, placeData) {
  const updates = {};
  const changelog = [];

  for (const field of ENRICHABLE_FIELDS) {
    const newVal = placeData[field];
    if (newVal === undefined || newVal === null || newVal === '') continue;

    const oldVal = existingVendor[field];

    // Only update if existing value is blank/null/zero
    const isBlank = oldVal === null || oldVal === undefined || oldVal === '' || oldVal === 0;
    if (isBlank) {
      updates[field] = newVal;
      changelog.push({ field, old: oldVal, new: newVal });
    }
  }

  return { updates, changelog };
}

module.exports = {
  inHarbourViewBounds,
  addressIsHarbourView,
  addressIsExcluded,
  categoryIsExcluded,
  scoreConfidence,
  normaliseName,
  normalisePhone,
  normaliseAddress,
  generateSlug,
  levenshtein,
  metresApart,
  findDuplicate,
  computeUpdates,
  PROTECTED_FIELDS,
  ENRICHABLE_FIELDS,
};
