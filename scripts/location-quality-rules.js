'use strict';

const BAD_LOCATION_MARKERS = [
  'usa',
  'united states',
  'suffolk',
  'virginia',
  ' va ',
  ' uk',
  'canada',
  'montego bay',
  'spanish town',
  'portmore',
  'old hope road',
  'liguanea',
  'new kingston',
  'half-way-tree',
];

const POSITIVE_HARBOUR_VIEW_MARKERS = [
  'harbour view, kingston',
  'harbour view kingston',
  'harbour view, kingston 17',
  'harbour view kingston 17',
  'kingston 17',
  'seashore place',
  'everest drive',
  'nautilus avenue',
  'dorado drive',
  'fort nugent drive',
  'forth nugent drive',
  'harbour view shopping centre',
  'st. benedicts heights',
  'st. benedicts heights',
  'neptune ave',
  'neptune avenue',
  'harbour bay plaza',
  'harbour view plaza',
  'common plaza',
  'orion ave',
  'orion avenue',
  'martello drive',
  'balkan avenue',
  'stellar rd',
  'stellar road',
];

const HARBOUR_VIEW_DETAIL_MARKERS = [
  'shop',
  'plaza',
  'shopping centre',
  'shopping center',
  'drive',
  'avenue',
  ' ave ',
  ' road ',
  ' rd ',
  'close',
  'heights',
  'bay',
  'gate',
  'main road',
  'fort nugent',
  'seashore',
  'everest',
  'nautilus',
  'dorado',
  'neptune',
];

const CATEGORY_ALIASES = {
  'food & beverage': 'Food & Restaurants',
  'food & dining': 'Food & Restaurants',
  'education & tutoring': 'Education',
  community: 'Community & Church',
  retail: 'Retail & Shopping',
  transport: 'Auto & Transport',
  'professional services': 'Professional / Legal / JP',
};

const CATEGORY_KEYWORDS = [
  { label: 'Marine / Fishing Supplies', keywords: ['fishing', 'bait', 'tackle', 'marine', 'boat supplies', 'fishing supplies'], exclude: ['restaurant', 'jerk', 'cook shop', 'cookshop', 'takeout', 'bakery', 'patty', 'bar and grill'] },
  { label: 'Finance & Banking', keywords: ['atm', 'bank', 'credit union', 'cambio', 'remittance', 'western union', 'moneygram', 'loan'] },
  { label: 'Health & Medical', keywords: ['clinic', 'doctor', 'pharmacy', 'medical', 'health centre', 'health center', 'dentist', 'nurse', 'physiotherapy', 'lab'] },
  { label: 'Auto & Transport', keywords: ['mechanic', 'mobile mechanic', 'car technician', 'auto technician', 'vehicle', 'tyre', 'tire', 'battery', 'taxi', 'transport', 'car wash', 'auto parts'] },
  { label: 'Community & Church', keywords: ['church', 'ministry', 'temple', 'community centre', 'community center', 'citizens association'] },
  { label: 'Education', keywords: ['school', 'tutor', 'tutoring', 'academy', 'basic school', 'prep school', 'college', 'learning centre', 'learning center'] },
  { label: 'Laundry & Cleaning', keywords: ['laundry', 'laundromat', 'laundry mat', 'dry cleaner', 'dry cleaning', 'cleaners', 'wash and fold', 'wash & fold', 'ironing', 'pressing', 'house cleaning', 'pressure washing'] },
  { label: 'Beauty & Wellness', keywords: ['hair', 'hairdresser', 'salon', 'braids', 'cornrow', 'twist', 'barber', 'beauty', 'nail', 'nails', 'lash', 'makeup', 'massage', 'spa', 'wellness'] },
  { label: 'Grocery & Convenience', keywords: ['supermarket', 'grocery', 'mini mart', 'minimart', 'convenience', 'wholesale', 'market', 'corner shop'] },
  { label: 'Tech & Electronics', keywords: ['phone repair', 'computer', 'laptop', 'tablet', 'electronics', 'it', 'network', 'printer', 'camera', 'cctv', 'software', 'hardware'] },
  { label: 'Food & Restaurants', keywords: ['restaurant', 'restaurants', 'food', 'food spot', 'cook shop', 'cookshop', 'takeout', 'take away', 'takeaway', 'jerk', 'fried chicken', 'chicken', 'chinese', 'bar and grill', 'bar & grill', 'cafe', 'coffee', 'bakery', 'patty', 'patties', 'lunch', 'dinner', 'breakfast', 'seafood', 'bar'] },
  { label: 'Professional / Legal / JP', keywords: ['justice of the peace', 'lawyer', 'attorney', 'notary', 'accountant', 'insurance', 'real estate', 'jp'] },
  { label: 'Home Services', keywords: ['plumber', 'plumbing', 'electrician', 'electrical', 'locksmith', 'carpenter', 'gardener', 'landscaper', 'painter', 'tiler', 'welder', 'appliance', 'fridge repair', 'washing machine', 'stove repair', 'oven', 'air conditi', 'ac technician', 'pest control', 'roofing', 'solar', 'water heater', 'water truck', 'water tank', 'upholsterer', 'handyman', 'general repair', 'odd jobs'] },
];

const RECORD_OVERRIDES = {
  'lane plaza': {
    category: 'Professional / Legal / JP',
    locality_status: 'out_of_area_rejected',
    public_visibility: false,
    location_confidence: 0,
    admin_review_required: false,
    location_notes: 'Rejected automatically: Old Hope Road is outside the Harbour View / Kingston 17 vendor directory.',
  },
  'liberty live church - harbour view': {
    category: 'Community & Church',
    locality_status: 'out_of_area_rejected',
    public_visibility: false,
    location_confidence: 0,
    admin_review_required: false,
    location_notes: 'Rejected automatically: Suffolk, Virginia, USA listing is outside Jamaica.',
  },
  's&s fishing supplies': {
    category: 'Marine / Fishing Supplies',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 95,
    admin_review_required: false,
    location_notes: 'Harbour View address with fishing-supplies business context.',
  },
  'ncb atm': {
    category: 'Finance & Banking',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 88,
    admin_review_required: false,
    location_notes: 'Accepted: ATM listing with Harbour View, Jamaica location signal.',
  },
  'jn bank atm': {
    category: 'Finance & Banking',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 95,
    admin_review_required: false,
    location_notes: 'Accepted: Harbour View Shopping Centre is an approved Harbour View marker.',
  },
  'niel technician': {
    category: 'Auto & Transport',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 88,
    admin_review_required: false,
    location_notes: 'Accepted: Harbour View, Kingston 17 address and vehicle-service context.',
  },
  'harbour view health center': {
    category: 'Health & Medical',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 90,
    admin_review_required: false,
    location_notes: 'Accepted: Neptune Avenue / Harbour View health facility.',
  },
  'smith chemical n things': {
    category: 'Retail & Shopping',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 95,
    admin_review_required: false,
    location_notes: 'Accepted: Harbour View Shopping Centre retailer, not a restaurant listing.',
  },
  'blue ocean produce': {
    category: 'Grocery & Convenience',
    locality_status: 'harbour_view_likely',
    public_visibility: true,
    location_confidence: 88,
    admin_review_required: false,
    location_notes: 'Accepted: produce and grocery listing in Harbour View, not a restaurant listing.',
  },
};

function normalizeText(value) {
  return ` ${(value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function normalizeCategory(value) {
  const raw = (value || '').toString().trim();
  if (!raw) return 'Professional / Legal / JP';
  return CATEGORY_ALIASES[raw.toLowerCase()] || raw;
}

function hasSuspiciousBusinessName(vendor) {
  const name = normalizeText(vendor.business_name);
  const raw = (vendor.business_name || '').trim();
  const isPhoneLike = /^[\d+\-\s()]{7,}$/.test(raw);
  const isAddressLike = /\b(avenue|ave|drive|dr|road|rd|street|st|close|lane|plaza|kingston|jamaica)\b/i.test(raw) && /\d/.test(raw);
  return isPhoneLike || isAddressLike;
}

function inferCategory(vendor) {
  const text = normalizeText([
    vendor.business_name || '',
    vendor.description || '',
    vendor.category || '',
  ].join(' '));

  if (text.includes(' technician') && includesAny(text, [' car ', ' auto ', 'vehicle', 'mechanic', 'tyre', 'tire', 'battery'])) {
    return 'Auto & Transport';
  }

  if (text.includes(' technician') && includesAny(text, [' phone ', 'computer', 'laptop', 'tablet', 'electronics', 'network', 'printer', 'camera', 'cctv'])) {
    return 'Tech & Electronics';
  }

  for (const rule of CATEGORY_KEYWORDS) {
    const matched = includesAny(text, rule.keywords);
    const blocked = rule.exclude ? includesAny(text, rule.exclude) : false;
    if (matched && !blocked) return rule.label;
  }

  return normalizeCategory(vendor.category);
}

function classifyLocation(vendor) {
  const address = (vendor.address || '').toString().trim();
  const lowerAddress = normalizeText(address);
  const lowerName = normalizeText(vendor.business_name);
  const lowerCombined = `${lowerName}${lowerAddress}`;

  if (!address) {
    return {
      locality_status: 'needs_manual_review',
      public_visibility: false,
      location_confidence: 0,
      admin_review_required: true,
      location_notes: 'Address missing entirely.',
    };
  }

  if (includesAny(lowerAddress, BAD_LOCATION_MARKERS) || (lowerCombined.includes(' harbour view ') && includesAny(lowerCombined, [' usa ', ' united states', ' suffolk', ' virginia', ' canada', ' uk ']))) {
    return {
      locality_status: 'out_of_area_rejected',
      public_visibility: false,
      location_confidence: 0,
      admin_review_required: false,
      location_notes: 'Rejected automatically: address matches an out-of-area or foreign marker.',
    };
  }

  if (includesAny(lowerAddress, POSITIVE_HARBOUR_VIEW_MARKERS)) {
    return {
      locality_status: 'harbour_view_likely',
      public_visibility: true,
      location_confidence: 95,
      admin_review_required: false,
      location_notes: 'Accepted automatically: address matches a strong Harbour View / Kingston 17 marker.',
    };
  }

  if (lowerAddress.includes(' harbour view ') && lowerAddress.includes(' kingston ')) {
    return {
      locality_status: 'harbour_view_likely',
      public_visibility: true,
      location_confidence: 88,
      admin_review_required: false,
      location_notes: 'Accepted automatically: Harbour View with Kingston signal.',
    };
  }

  if (lowerAddress.includes(' kingston 17 ')) {
    return {
      locality_status: 'harbour_view_likely',
      public_visibility: true,
      location_confidence: 82,
      admin_review_required: false,
      location_notes: 'Accepted automatically: Kingston 17 signal present.',
    };
  }

  if (lowerAddress.includes(' harbour view ') && lowerAddress.includes(' jamaica ') && includesAny(lowerAddress, HARBOUR_VIEW_DETAIL_MARKERS)) {
    return {
      locality_status: 'harbour_view_likely',
      public_visibility: true,
      location_confidence: 82,
      admin_review_required: false,
      location_notes: 'Accepted automatically: Harbour View, Jamaica listing with a specific local landmark or street detail.',
    };
  }

  if (lowerAddress.includes(' kingston ')) {
    return {
      locality_status: 'needs_manual_review',
      public_visibility: false,
      location_confidence: 35,
      admin_review_required: true,
      location_notes: 'Needs review: Kingston address without a Harbour View / Kingston 17 marker.',
    };
  }

  if (lowerAddress.includes(' harbour view ')) {
    return {
      locality_status: 'needs_manual_review',
      public_visibility: false,
      location_confidence: 30,
      admin_review_required: true,
      location_notes: 'Needs review: Harbour View appears without a strong Kingston 17 or local landmark signal.',
    };
  }

  return {
    locality_status: 'needs_manual_review',
    public_visibility: false,
    location_confidence: 20,
    admin_review_required: true,
    location_notes: 'Needs review: address lacks strong Harbour View / Kingston 17 markers.',
  };
}

function buildProposedState(vendor) {
  const override = RECORD_OVERRIDES[(vendor.business_name || '').toLowerCase()];
  const category = (override && override.category) || inferCategory(vendor);
  const locationState = override || classifyLocation(vendor);

  if (!override && hasSuspiciousBusinessName(vendor)) {
    return {
      category,
      locality_status: 'needs_manual_review',
      public_visibility: false,
      location_confidence: 15,
      admin_review_required: true,
      location_notes: 'Needs review: business name looks like a phone number or raw address instead of a verified listing name.',
    };
  }

  return {
    category,
    locality_status: locationState.locality_status,
    public_visibility: locationState.public_visibility,
    location_confidence: locationState.location_confidence,
    admin_review_required: locationState.admin_review_required,
    location_notes: locationState.location_notes,
  };
}

function isSuspiciousFood(vendor, proposedCategory) {
  const currentCategory = normalizeCategory(vendor.category);
  const text = normalizeText([vendor.business_name, vendor.description, vendor.category].join(' '));
  const looksMarine = includesAny(text, ['fishing', 'bait', 'tackle', 'marine', 'boat']);
  return (currentCategory === 'Food & Restaurants' || proposedCategory === 'Food & Restaurants') && looksMarine;
}

function summarizeAudit(vendors) {
  const rows = vendors.map((vendor) => {
    const proposed = buildProposedState(vendor);
    return { vendor, proposed };
  });

  const visible = rows.filter(({ proposed }) => proposed.public_visibility);
  const hiddenOutOfArea = rows.filter(({ proposed }) => proposed.locality_status === 'out_of_area_rejected');
  const manualReview = rows.filter(({ proposed }) => proposed.locality_status === 'needs_manual_review');
  const foreignAddresses = rows.filter(({ vendor }) => includesAny(normalizeText(vendor.address), [' usa ', ' united states', ' suffolk', ' virginia', ' canada', ' uk ']));
  const nonHarbourViewKingston = rows.filter(({ vendor, proposed }) => (vendor.address || '').toLowerCase().includes('kingston') && !includesAny(normalizeText(vendor.address), [' harbour view ', ' kingston 17 ']) && proposed.locality_status !== 'out_of_area_rejected');
  const missingAddress = rows.filter(({ vendor }) => !(vendor.address || '').trim());
  const harbourViewOutsideJamaica = rows.filter(({ vendor }) => normalizeText(vendor.address).includes(' harbour view ') && includesAny(normalizeText(vendor.address), [' usa ', ' united states', ' suffolk', ' virginia', ' canada', ' uk ']));
  const suspiciousMappings = rows.filter(({ vendor, proposed }) => normalizeCategory(vendor.category) !== proposed.category);
  const suspiciousFood = rows.filter(({ vendor, proposed }) => isSuspiciousFood(vendor, proposed.category));

  return {
    rows,
    counts: {
      total_vendors: vendors.length,
      public_visible_vendors: visible.length,
      hidden_out_of_area: hiddenOutOfArea.length,
      needs_manual_review: manualReview.length,
      foreign_addresses: foreignAddresses.length,
      non_harbour_view_kingston_addresses: nonHarbourViewKingston.length,
      missing_address: missingAddress.length,
      kingston_without_harbour_view_signal: nonHarbourViewKingston.length,
      harbour_view_outside_jamaica: harbourViewOutsideJamaica.length,
      suspicious_category_mappings: suspiciousMappings.length,
      food_listings_not_restaurants: suspiciousFood.length,
    },
    visible,
    hiddenOutOfArea,
    manualReview,
    foreignAddresses,
    nonHarbourViewKingston,
    missingAddress,
    harbourViewOutsideJamaica,
    suspiciousMappings,
    suspiciousFood,
  };
}

module.exports = {
  BAD_LOCATION_MARKERS,
  POSITIVE_HARBOUR_VIEW_MARKERS,
  RECORD_OVERRIDES,
  buildProposedState,
  inferCategory,
  isSuspiciousFood,
  normalizeCategory,
  summarizeAudit,
};
