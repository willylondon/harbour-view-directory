'use strict';

require('dotenv').config({ path: '.env.local', quiet: true });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required Supabase env vars.');
  process.exit(1);
}

const shouldApply = process.argv.includes('--apply');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PUBLIC_LOCALITIES = new Set(['harbour_view_verified', 'harbour_view_likely']);
const BLOCKED_DATA_QUALITY = new Set(['rejected', 'out_of_area', 'duplicate', 'duplicate_probable']);

const LEGACY_TERMS = [
  'Keddy Cakes',
  'Keddy Cake',
  'Keddys Cakes',
  "Keddy's Cakes",
  'Keddy’s Cakes',
  'Tsaja',
  'T-Saja',
  'T Saja',
  "T'saja",
  'T’saja',
  'cake',
  'cakes',
];

const CATEGORY_UPDATES = {
  'bosslady-clothing-store': 'Online Retail',
  'conceptual-draughting-building-services': 'General Services',
  'ctl-limited-harbour-view': 'General Services',
  'dfence-photography': 'Events / Bookings',
  'eastern-exotic-pets-jamaica': 'Pets / Animals',
  'exclusive-travel-co': 'Events / Bookings',
  'harbour-bay-plaza': 'Retail & Shopping',
  'harbour-diesel-depot': 'Auto & Transport',
  'jamaicangyalcom': 'General Services',
  'kingston-dry-dock': 'Marine / Fishing Supplies',
  'link7teen-i-ces-institute-of-culture-entertainment-sports': 'Events / Bookings',
  'mamalashee': 'General Services',
  'messiah-logistics': 'General Services',
  'mmdm-books-and-bookings': 'Books / Stationery',
  'mycart-express': 'General Services',
  'neeks-collection': 'Online Retail',
  'bill-express': 'Finance & Banking',
  'rapido-car-rentals-and-auto-sales-limited': 'Auto & Transport',
  'ship-global-jamaica': 'General Services',
  'south-optical-jamaica': 'Health & Medical',
  'sscs-supplies': 'Retail & Shopping',
  'thick-thick-necessities': 'Online Retail',
  'total-gas-station-harbour-view-roundabout': 'Auto & Transport',
  'virtual-assist-hub': 'General Services',
  'wihcon': 'Home Services',
};

const SEARCH_QUERIES = [
  'restaurants',
  'restaurant',
  'food',
  'Chinese',
  'jerk',
  'cake',
  'Keddy',
  'Tsaja',
  'laundry',
  'mechanic',
];

const GENERIC_DESCRIPTION_PATTERNS = [
  /is listed as a .* business serving the harbour view community/i,
  /contact and listing details are being verified/i,
];

function normalizeText(value) {
  return ` ${(value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function isPublic(vendor) {
  if (vendor.is_approved === false) return false;
  if (vendor.public_visibility !== true) return false;
  if (!PUBLIC_LOCALITIES.has(vendor.locality_status)) return false;
  if (BLOCKED_DATA_QUALITY.has((vendor.data_quality_status || '').toLowerCase())) return false;
  return true;
}

function primaryImage(vendor) {
  return Array.isArray(vendor.images) ? vendor.images[0] || null : vendor.images || null;
}

function reportShape(vendor) {
  return {
    business_name: vendor.business_name,
    slug: vendor.slug,
    phone: vendor.phone,
    whatsapp: vendor.whatsapp,
    category: vendor.category,
    address: vendor.address,
    image_url: primaryImage(vendor),
    public_visibility: vendor.public_visibility,
    locality_status: vendor.locality_status,
    recovery_status: vendor.recovery_status || null,
    source_dataset: vendor.source_dataset || vendor.source || null,
  };
}

function matchesLegacyTerm(vendor, term) {
  const haystack = normalizeText([
    vendor.business_name,
    vendor.slug,
    vendor.category,
    vendor.description,
    vendor.phone,
    vendor.whatsapp,
    vendor.address,
  ].join(' '));
  return haystack.includes(normalizeText(term));
}

function matchesSearch(vendor, query) {
  const term = normalizeText(query).trim();
  const haystack = normalizeText([
    vendor.business_name,
    vendor.category,
    vendor.description,
    vendor.address,
  ].join(' '));

  if (['restaurants', 'restaurant', 'food', 'chinese', 'jerk'].includes(term)) {
    return vendor.category === 'Food & Restaurants';
  }

  if (term === 'mechanic') {
    return haystack.includes(' mechanic ') || vendor.category === 'Auto & Transport';
  }

  return haystack.includes(` ${term} `);
}

function first50Flags(vendor, seenSlugs) {
  const flags = [];
  const address = (vendor.address || '').toLowerCase();
  if (!vendor.phone && !vendor.whatsapp) flags.push('no phone/WhatsApp');
  if (!primaryImage(vendor)) flags.push('missing image');
  if (GENERIC_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(vendor.description || ''))) {
    flags.push('generic fallback description');
  }
  if (vendor.locality_status && !PUBLIC_LOCALITIES.has(vendor.locality_status)) flags.push('out-of-area');
  if (address.includes('lane plaza') || address.includes('half way tree') || address.includes('portmore') || address.includes('montego bay')) {
    flags.push('out-of-area');
  }
  if (seenSlugs.has(vendor.slug)) flags.push('suspicious duplicate');
  seenSlugs.add(vendor.slug);
  return flags;
}

async function fetchVendors() {
  const { data, error } = await supabase.from('vendors').select('*');
  if (error) throw error;
  return data || [];
}

async function applyCategoryUpdates(vendors) {
  const pending = vendors.filter((vendor) => CATEGORY_UPDATES[vendor.slug] && vendor.category !== CATEGORY_UPDATES[vendor.slug]);
  for (const vendor of pending) {
    const { error } = await supabase
      .from('vendors')
      .update({ category: CATEGORY_UPDATES[vendor.slug] })
      .eq('id', vendor.id);

    if (error) throw new Error(`Failed category update for ${vendor.business_name}: ${error.message}`);
  }
  return pending;
}

async function main() {
  const vendors = await fetchVendors();

  const legacyResults = LEGACY_TERMS.map((term) => ({
    term,
    results: vendors.filter((vendor) => matchesLegacyTerm(vendor, term)).map(reportShape),
  }));

  const professionalRecords = vendors
    .filter((vendor) => vendor.category === 'Professional / Legal / JP' || vendor.category === 'Professional Services')
    .sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));

  const categoryCorrections = professionalRecords
    .filter((vendor) => CATEGORY_UPDATES[vendor.slug])
    .map((vendor) => ({
      business_name: vendor.business_name,
      slug: vendor.slug,
      current_category: vendor.category,
      proposed_category: CATEGORY_UPDATES[vendor.slug],
      public_visibility: vendor.public_visibility,
      locality_status: vendor.locality_status,
    }));

  const publicVendors = vendors
    .filter(isPublic)
    .sort((a, b) => {
      if (Boolean(b.is_top_ad) !== Boolean(a.is_top_ad)) return Boolean(b.is_top_ad) - Boolean(a.is_top_ad);
      if (Boolean(b.is_featured) !== Boolean(a.is_featured)) return Boolean(b.is_featured) - Boolean(a.is_featured);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const searchProof = SEARCH_QUERIES.map((query) => {
    const results = publicVendors.filter((vendor) => matchesSearch(vendor, query));
    return {
      query,
      count: results.length,
      sample: results.slice(0, 5).map((vendor) => vendor.business_name),
    };
  });

  const seenSlugs = new Set();
  const first50 = publicVendors.slice(0, 50).map((vendor, index) => ({
    index: index + 1,
    business_name: vendor.business_name,
    slug: vendor.slug,
    category: vendor.category,
    flags: first50Flags(vendor, seenSlugs),
  }));

  const hiddenBadLocationNames = ['Lane Plaza', 'Liberty Live Church'];
  const badLocationStatus = hiddenBadLocationNames.map((name) => {
    const rows = vendors.filter((vendor) => (vendor.business_name || '').toLowerCase() === name.toLowerCase());
    return {
      business_name: name,
      records: rows.map(reportShape),
      visible_count: rows.filter(isPublic).length,
    };
  });

  let appliedCategoryUpdates = [];
  if (shouldApply) {
    appliedCategoryUpdates = await applyCategoryUpdates(vendors);
  }

  console.log(JSON.stringify({
    mode: shouldApply ? 'apply' : 'dry-run',
    totals: {
      vendors: vendors.length,
      public_vendors: publicVendors.length,
      professional_records: professionalRecords.length,
    },
    legacyResults,
    categoryCorrections,
    appliedCategoryUpdates: appliedCategoryUpdates.map((vendor) => ({
      business_name: vendor.business_name,
      slug: vendor.slug,
      from: vendor.category,
      to: CATEGORY_UPDATES[vendor.slug],
    })),
    searchProof,
    first50,
    badLocationStatus,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
