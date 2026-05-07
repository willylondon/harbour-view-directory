const CATEGORY_STYLES = {
  'Food & Restaurants': { display: 'Food & Restaurants', emoji: '🍽️', bg: 'bg-orange-50', border: 'border-orange-200' },
  'Grocery & Convenience': { display: 'Grocery & Convenience', emoji: '🛒', bg: 'bg-green-50', border: 'border-green-200' },
  'Retail & Shopping': { display: 'Retail & Shopping', emoji: '🛍️', bg: 'bg-violet-50', border: 'border-violet-200' },
  'Marine / Fishing Supplies': { display: 'Marine / Fishing Supplies', emoji: '⚓', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  'Finance & Banking': { display: 'Finance & Banking', emoji: '🏦', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'Health & Medical': { display: 'Health & Medical', emoji: '⚕️', bg: 'bg-red-50', border: 'border-red-200' },
  'Community & Church': { display: 'Community & Church', emoji: '⛪', bg: 'bg-amber-50', border: 'border-amber-200' },
  Education: { display: 'Education', emoji: '📚', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Auto & Transport': { display: 'Auto & Transport', emoji: '🚗', bg: 'bg-slate-50', border: 'border-slate-200' },
  'Laundry & Cleaning': { display: 'Laundry & Cleaning', emoji: '🧺', bg: 'bg-sky-50', border: 'border-sky-200' },
  'Beauty & Wellness': { display: 'Beauty & Wellness', emoji: '💆', bg: 'bg-pink-50', border: 'border-pink-200' },
  'Professional / Legal / JP': { display: 'Professional / Legal / JP', emoji: '🏢', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Books / Stationery': { display: 'Books / Stationery', emoji: '📖', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  'Pets / Animals': { display: 'Pets / Animals', emoji: '🐾', bg: 'bg-lime-50', border: 'border-lime-200' },
  'Online Retail': { display: 'Online Retail', emoji: '🛒', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
  'Events / Bookings': { display: 'Events / Bookings', emoji: '🎟️', bg: 'bg-rose-50', border: 'border-rose-200' },
  'General Services': { display: 'General Services', emoji: '🧰', bg: 'bg-stone-50', border: 'border-stone-200' },
  'Tech & Electronics': { display: 'Tech & Electronics', emoji: '📱', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  'Home Services': { display: 'Home Services', emoji: '🏠', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const DEFAULT_CATEGORY = CATEGORY_STYLES['Professional / Legal / JP'];

const CATEGORY_ALIASES = {
  'food & beverage': 'Food & Restaurants',
  'food & dining': 'Food & Restaurants',
  'education & tutoring': 'Education',
  community: 'Community & Church',
  retail: 'Retail & Shopping',
  transport: 'Auto & Transport',
  'professional services': 'Professional / Legal / JP',
};

const FOOD_KEYWORDS = ['restaurant', 'restaurants', 'food', 'food spot', 'food spots', 'eat', 'eatery', 'cook shop', 'cookshop', 'takeout', 'take out', 'takeaway', 'jerk', 'fried chicken', 'chicken', 'fish fry', 'seafood boil', 'chinese', 'bar and grill', 'bar & grill', 'cafe', 'coffee', 'bakery', 'patty', 'patties', 'lunch', 'dinner', 'breakfast', 'bar', 'grill', 'meal', 'catering'];
const PREPARED_FOOD_KEYWORDS = ['restaurant', 'food', 'cook shop', 'cookshop', 'takeout', 'take away', 'takeaway', 'jerk', 'chicken', 'chinese', 'cafe', 'bakery', 'patty', 'patties', 'breakfast', 'lunch', 'dinner', 'bar and grill', 'bar & grill', 'seafood'];
const GROCERY_KEYWORDS = ['supermarket', 'grocery', 'groceries', 'mini mart', 'minimart', 'convenience', 'wholesale', 'market', 'corner shop', 'corner-store', 'produce', 'liquor store', 'liquor', 'spirits', 'wine shop', 'beverage depot'];
const MARINE_KEYWORDS = ['fishing', 'bait', 'tackle', 'marine supplies', 'marine', 'fishing supplies', 'boat supplies', 'boat'];
const FINANCE_KEYWORDS = ['atm', 'bank', 'credit union', 'cambio', 'remittance', 'western union', 'moneygram', 'loan'];
const HEALTH_KEYWORDS = ['clinic', 'doctor', 'pharmacy', 'medical', 'health centre', 'health center', 'dentist', 'nurse', 'physiotherapy', 'lab'];
const AUTO_KEYWORDS = ['mechanic', 'mobile mechanic', 'car technician', 'auto technician', 'vehicle', 'tyre', 'tire', 'battery', 'taxi', 'transport', 'car wash', 'auto parts', 'driving instructor', 'transportation'];
const AUTO_CONTEXT = ['car', 'auto', 'vehicle', 'motor', 'mechanic', 'tyre', 'tire', 'battery', 'transport'];
const COMMUNITY_KEYWORDS = ['church', 'ministry', 'temple', 'community centre', 'community center', 'citizens association'];
const EDUCATION_KEYWORDS = ['school', 'tutor', 'tutoring', 'academy', 'basic school', 'prep school', 'college', 'learning centre', 'learning center'];
const LAUNDRY_KEYWORDS = ['laundry', 'laundromat', 'laundry mat', 'dry cleaner', 'dry cleaning', 'cleaners', 'wash and fold', 'wash & fold', 'ironing', 'pressing', 'house cleaning', 'pressure washing'];
const BEAUTY_KEYWORDS = ['hair', 'hairdresser', 'salon', 'braids', 'cornrow', 'twist', 'barber', 'beauty', 'nail', 'nails', 'lash', 'makeup', 'massage', 'wax', 'spa', 'skin', 'wellness'];
const PROFESSIONAL_KEYWORDS = ['justice of the peace', ' legal ', 'lawyer', 'attorney', 'notary', 'jp', 'accountant', 'insurance', 'real estate', 'tax office'];
const BOOKS_KEYWORDS = ['book', 'books', 'bookstore', 'book shop', 'stationery', 'school supplies', 'office supplies'];
const PETS_KEYWORDS = ['pet', 'pets', 'animals', 'exotic pets', 'mobile zoo', 'birds', 'parrot', 'rabbit', 'veterinary'];
const ONLINE_RETAIL_KEYWORDS = ['online retail', 'online store', 'ecommerce', 'e-commerce', 'clothing store', 'boutique', 'collection', 'necessities'];
const EVENTS_KEYWORDS = ['event', 'events', 'bookings', 'booking', 'photography', 'entertainment', 'travel', 'tour', 'logistics'];
const GENERAL_SERVICES_KEYWORDS = ['consulting', 'consultant', 'project management', 'workshop', 'training', 'interpreter', 'interpretation', 'shipping', 'courier', 'virtual assist', 'draughting'];
const TECH_KEYWORDS = ['phone repair', 'computer', 'laptop', 'tablet', 'electronics', 'it', 'network', 'printer', 'camera', 'cctv', 'software', 'computer hardware'];
const TECH_CONTEXT = ['phone', 'computer', 'laptop', 'tablet', 'electronics', 'it', 'network', 'printer', 'camera', 'cctv', 'software', 'hardware'];
const HOME_SERVICE_KEYWORDS = ['plumber', 'plumbing', 'electrician', 'electrical', 'locksmith', 'carpenter', 'gardener', 'landscaper', 'painter', 'tiler', 'welder', 'appliance', 'fridge repair', 'washing machine', 'stove repair', 'oven', 'air conditi', 'ac technician', 'pest control', 'roofing', 'solar', 'water heater', 'water truck', 'water tank', 'upholsterer', 'handyman', 'general repair', 'odd jobs', 'cooking gas', 'gas cylinder', 'hardware supplies', 'hardware supplier', 'hardware'];

// Preserved for existing service-trade listings until the user chooses a stricter replacement bucket.
export const CATEGORY_TAXONOMY = [
  'Food & Restaurants',
  'Grocery & Convenience',
  'Retail & Shopping',
  'Marine / Fishing Supplies',
  'Finance & Banking',
  'Health & Medical',
  'Community & Church',
  'Education',
  'Auto & Transport',
  'Laundry & Cleaning',
  'Beauty & Wellness',
  'Professional / Legal / JP',
  'Books / Stationery',
  'Pets / Animals',
  'Online Retail',
  'Events / Bookings',
  'General Services',
  'Tech & Electronics',
  'Home Services',
];

export const SEARCH_SYNONYMS = {
  gas: ['cooking gas', 'propane', 'cylinder'],
  'cooking gas': ['gas supplier', 'tuna gas', 'vespak'],
  jp: ['justice of the peace'],
  justice: ['justice of the peace', 'jp'],
  phone: ['cell phone', 'phone repair', 'mobile'],
  phones: ['cell phone', 'phone repair', 'mobile'],
  'phone repair': ['cell phone repair', 'mobile repair'],
  tutor: ['tutoring', 'lessons', 'teacher', 'pep'],
  music: ['music school', 'music lessons', 'recording'],
  book: ['books', 'stationery', 'bookstore'],
  books: ['stationery', 'bookstore'],
  pets: ['animals', 'exotic pets', 'mobile zoo'],
  pet: ['animals', 'exotic pets', 'mobile zoo'],
  events: ['bookings', 'photography', 'entertainment'],
  booking: ['bookings', 'events'],
  bookings: ['booking', 'events'],
  plumber: ['plumbing', 'plumbing services'],
  electrician: ['electrical', 'electrical services'],
  salon: ['hairdresser', 'hair salon', 'braids'],
  barber: ['barber shop', 'haircut'],
  taxi: ['transportation', 'transport'],
  transport: ['taxi', 'transportation', 'bus'],
  room: ['rent', 'rental', 'room for rent'],
  rent: ['rental', 'room', 'apartment'],
  cmu: ['caribbean maritime', 'maritime university'],
  braids: ['hairdresser', 'cornrows', 'hair'],
  hair: ['hairdresser', 'salon', 'braids', 'barber'],
};

const RESTAURANT_SEARCH_TERMS = [
  'food & restaurants',
  ...FOOD_KEYWORDS,
];

const BROAD_RESTAURANT_SEARCH_TERMS = new Set([
  'food',
  'restaurant',
  'restaurants',
  'chinese',
  'jerk',
  'food spot',
  'food spots',
  'eat',
  'eatery',
  'cook shop',
  'cookshop',
  'takeout',
  'take out',
  'takeaway',
]);

function isBroadRestaurantSearchQuery(query) {
  const term = (query || '').toString().toLowerCase().trim();
  return BROAD_RESTAURANT_SEARCH_TERMS.has(term);
}

function isRestaurantSearchQuery(query) {
  const term = (query || '').toString().toLowerCase().trim();
  return RESTAURANT_SEARCH_TERMS.includes(term);
}

function normalizeText(value) {
  return ` ${(value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function includesAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword).trim() ? normalizeText(keyword) : keyword));
}

function hasTechnicianContext(haystack, contextKeywords) {
  return haystack.includes(' technician') && includesAny(haystack, contextKeywords);
}

export function normalizeCategoryLabel(value) {
  const key = (value || '').toString().trim();
  if (!key) return '';
  const alias = CATEGORY_ALIASES[key.toLowerCase()];
  return alias || key;
}

function inferCategoryLabel(vendor) {
  const normalizedDbCategory = normalizeCategoryLabel(vendor?.category);
  const haystack = normalizeText([
    vendor?.business_name || '',
    vendor?.description || '',
  ].join(' '));

  if (includesAny(haystack, MARINE_KEYWORDS) && !includesAny(haystack, PREPARED_FOOD_KEYWORDS)) {
    return 'Marine / Fishing Supplies';
  }

  if (includesAny(haystack, FINANCE_KEYWORDS)) return 'Finance & Banking';
  if (includesAny(haystack, HEALTH_KEYWORDS)) return 'Health & Medical';
  if (includesAny(haystack, AUTO_KEYWORDS) || hasTechnicianContext(haystack, AUTO_CONTEXT)) return 'Auto & Transport';
  if (includesAny(haystack, COMMUNITY_KEYWORDS)) return 'Community & Church';
  if (includesAny(haystack, EDUCATION_KEYWORDS)) return 'Education';
  if (includesAny(haystack, LAUNDRY_KEYWORDS)) return 'Laundry & Cleaning';
  if (includesAny(haystack, BEAUTY_KEYWORDS)) return 'Beauty & Wellness';
  if (includesAny(haystack, BOOKS_KEYWORDS)) return 'Books / Stationery';
  if (includesAny(haystack, PETS_KEYWORDS)) return 'Pets / Animals';
  if (includesAny(haystack, ONLINE_RETAIL_KEYWORDS)) return 'Online Retail';
  if (includesAny(haystack, EVENTS_KEYWORDS)) return 'Events / Bookings';
  if (includesAny(haystack, GENERAL_SERVICES_KEYWORDS)) return 'General Services';
  if (includesAny(haystack, GROCERY_KEYWORDS)) return 'Grocery & Convenience';
  if (includesAny(haystack, TECH_KEYWORDS) || hasTechnicianContext(haystack, TECH_CONTEXT)) return 'Tech & Electronics';
  if (includesAny(haystack, FOOD_KEYWORDS)) return 'Food & Restaurants';
  if (includesAny(haystack, PROFESSIONAL_KEYWORDS)) return 'Professional / Legal / JP';
  if (includesAny(haystack, HOME_SERVICE_KEYWORDS)) return 'Home Services';

  if (CATEGORY_STYLES[normalizedDbCategory]) {
    return normalizedDbCategory;
  }

  return DEFAULT_CATEGORY.display;
}

export function getNormalizedCategory(vendor) {
  const label = inferCategoryLabel(vendor);
  return CATEGORY_STYLES[label] || DEFAULT_CATEGORY;
}

export function getDisplayCategory(vendor) {
  return getNormalizedCategory(vendor);
}

export function expandSearchQuery(query) {
  const term = (query || '').toString().toLowerCase().trim();
  if (!term) return [];

  const tokens = new Set([term]);
  const normalizedCategory = normalizeCategoryLabel(term);
  if (normalizedCategory) tokens.add(normalizedCategory.toLowerCase());

  if (isBroadRestaurantSearchQuery(term)) {
    RESTAURANT_SEARCH_TERMS.forEach((token) => tokens.add(token));
  } else if (isRestaurantSearchQuery(term)) {
    tokens.add('food & restaurants');
  }

  (SEARCH_SYNONYMS[term] || []).forEach((token) => tokens.add(token));

  return [...tokens];
}

export function vendorMatchesSearch(vendor, query) {
  const terms = expandSearchQuery(query);
  if (!terms.length) return true;

  if (isBroadRestaurantSearchQuery(query)) {
    return getDisplayCategory(vendor).display === 'Food & Restaurants';
  }

  const haystack = normalizeText([
    vendor?.business_name || '',
    vendor?.category || '',
    vendor?.description || '',
    vendor?.address || '',
    getDisplayCategory(vendor).display,
  ].join(' '));

  if (isRestaurantSearchQuery(query)) {
    const specificTerms = terms.filter((term) => term !== 'food & restaurants');
    return getDisplayCategory(vendor).display === 'Food & Restaurants'
      && specificTerms.some((term) => haystack.includes(normalizeText(term)));
  }

  return terms.some((term) => haystack.includes(normalizeText(term)));
}
