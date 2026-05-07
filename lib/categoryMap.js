/**
 * Category normalization and search synonym mapping.
 * Does NOT modify database data — derives display category from keywords
 * found in business name and description at display time.
 */

// Ordered rules: first match wins
const CATEGORY_RULES = [
  // Finance & Banking
  {
    display: 'Finance & Banking',
    emoji: '🏦', bg: 'bg-emerald-50', border: 'border-emerald-200',
    keywords: ['atm', 'bank', 'credit union', 'cambio', 'remittance', 'western union', 'moneygram', 'loan'],
  },

  // Health & Medical
  {
    display: 'Health & Medical',
    emoji: '⚕️', bg: 'bg-red-50', border: 'border-red-200',
    keywords: ['clinic', 'doctor', 'pharmacy', 'medical', 'health centre', 'dentist', 'nurse', 'physiotherapy', 'lab'],
  },

  // Auto & Transport
  {
    display: 'Auto & Transport',
    emoji: '🚗', bg: 'bg-slate-50', border: 'border-slate-200',
    keywords: ['mechanic', 'car technician', 'auto technician', 'mobile mechanic', 'tyre', 'tire', 'battery', 'vehicle', 'taxi', 'transport', 'car wash', 'duco', 'body work', 'transportation', 'bus', 'bus driver', 'driver', 'driving instructor', 'car rental', 'rental car', 'trucking', 'moving', 'airport', 'car service', 'car maintenance'],
  },

  // Community & Church
  {
    display: 'Community & Church',
    emoji: '⛪', bg: 'bg-amber-50', border: 'border-amber-200',
    keywords: ['church', 'ministry', 'temple', 'community centre', 'citizens association', 'police', 'fire brigade', 'emergency', 'day worker', 'dayworker'],
  },

  // Education
  {
    display: 'Education',
    emoji: '📚', bg: 'bg-indigo-50', border: 'border-indigo-200',
    keywords: ['school', 'tutor', 'tutoring', 'academy', 'basic school', 'prep school', 'college', 'learning centre', 'lessons', 'music school', 'music lesson', 'teacher', 'primary education', 'pep', 'cxc', 'csec', 'math', 'physics', 'chemistry', 'biology', 'daycare', 'pre school', 'preschool', 'brilliant minds', 'recording studio'],
  },

  // Laundry & Cleaning
  {
    display: 'Laundry & Cleaning',
    emoji: '🧺', bg: 'bg-sky-50', border: 'border-sky-200',
    keywords: ['laundry', 'laundromat', 'laundry mat', 'dry cleaner', 'dry cleaning', 'wash', 'wash and fold', 'wash & fold', 'ironing', 'pressing', 'cleaners', 'house cleaning', 'pressure washing'],
  },

  // Cooking Gas (Home Services specific)
  {
    display: 'Home Services',
    emoji: '🏠', bg: 'bg-teal-50', border: 'border-teal-200',
    keywords: ['cooking gas', 'gas cylinder', 'propane', 'tuna gas', 'vespak', 'igl cylinder', 'igl gas', 'vp gas', 'gas supplier', 'cooking gas supplier', 'gas delivery', 'plumber', 'plumbing', 'electrician', 'electrical', 'locksmith', 'carpenter', 'gardener', 'landscaper', 'painter', 'tiler', 'welder', 'appliance', 'fridge repair', 'washing machine', 'stove repair', 'oven', 'air conditi', 'ac technician', 'pest control', 'roofing', 'solar', 'water heater', 'water truck', 'water tank', 'mattress', 'upholsterer', 'furniture', 'hardware', 'general repair', 'handyman', 'general service', 'odd jobs', 'odd-job'],
  },

  // Tech & Electronics
  {
    display: 'Tech & Electronics',
    emoji: '📱', bg: 'bg-cyan-50', border: 'border-cyan-200',
    keywords: ['phone repair', 'cell phone', 'computer repair', 'laptop repair', 'tech', 'electronics', 'printing', 'passport pic', 'photocopying', 'graphic', 'print', 'it support', 'computer', 'security camera', 'cctv', 'cctv camera', 'phone', 'laptop', 'tablet', 'network', 'printer', 'camera'],
  },

  // Food & Beverage
  {
    display: 'Food & Beverage',
    emoji: '🍽️', bg: 'bg-orange-50', border: 'border-orange-200',
    keywords: ['food', 'restaurant', 'deli', 'catering', 'baker', 'baking', 'cake', 'pastry', 'drink', 'water delivery', 'drinking water', 'delivery food', 'beverage', 'jerk', 'snack', 'bbq', 'bar', 'cafe', 'liquor', 'wholesale liquor'],
  },

  // Beauty & Wellness
  {
    display: 'Beauty & Wellness',
    emoji: '💆', bg: 'bg-pink-50', border: 'border-pink-200',
    keywords: ['hair', 'hairdresser', 'salon', 'braids', 'cornrow', 'twist', 'barber', 'beauty', 'nail', 'nails', 'lash', 'makeup', 'massage', 'wax', 'body massage', 'spa', 'skin', 'wellness', 'beauty therapist'],
  },

  // Retail & Shopping
  {
    display: 'Retail & Shopping',
    emoji: '🛍️', bg: 'bg-violet-50', border: 'border-violet-200',
    keywords: ['courier', 'dressmaker', 'tailor', 'seamstress', 'shop', 'store', 'retail'],
  },

  // Professional Services (Includes Legal/JP/Real Estate)
  {
    display: 'Professional Services',
    emoji: '🏢', bg: 'bg-blue-50', border: 'border-blue-200',
    keywords: ['justice of the peace', 'jp', 'legal', 'notary', 'attorney', 'lawyer', 'real estate', 'insurance', 'accountant', 'financial'],
  },
];

// Default fallback
const DEFAULT_CATEGORY = {
  display: 'Professional Services',
  emoji: '🏢', bg: 'bg-gray-50', border: 'border-gray-200',
};

/**
 * All canonical display category names for use in filter dropdowns.
 */
export const CATEGORY_TAXONOMY = [
  'Food & Beverage',
  'Beauty & Wellness',
  'Home Services',
  'Auto & Transport',
  'Education',
  'Tech & Electronics',
  'Finance & Banking',
  'Health & Medical',
  'Community & Church',
  'Laundry & Cleaning',
  'Retail & Shopping',
  'Professional Services',
];

/**
 * Returns a normalized display category object based on the vendor's
 * business name, description, and original DB category.
 *
 * @param {{ business_name?: string, description?: string, category?: string }} vendor
 * @returns {{ display: string, emoji: string, bg: string, border: string }}
 */
export function getNormalizedCategory(vendor) {
  if (!vendor) return DEFAULT_CATEGORY;

  const haystack = [
    vendor.business_name || '',
    vendor.description || '',
    vendor.category || '',
  ].join(' ').toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => haystack.includes(kw))) {
      return rule;
    }
  }

  // Fall back to matching original DB category display
  const dbMatch = CATEGORY_RULES.find(r => r.display === vendor.category);
  return dbMatch || DEFAULT_CATEGORY;
}

/**
 * Canonical alias for getNormalizedCategory — use this everywhere.
 * Returns a normalized display category object based on vendor data.
 *
 * @param {{ business_name?: string, description?: string, category?: string }} vendor
 * @returns {{ display: string, emoji: string, bg: string, border: string }}
 */
export function getDisplayCategory(vendor) {
  return getNormalizedCategory(vendor);
}

/**
 * Search synonym map — expands a user query to related terms.
 * Keys are what the user types; values are additional search strings
 * injected into the search (checked against name + description + category).
 */
export const SEARCH_SYNONYMS = {
  'gas': ['cooking gas', 'propane', 'cylinder'],
  'cooking gas': ['gas supplier', 'tuna gas', 'vespak'],
  'jp': ['justice of the peace'],
  'justice': ['justice of the peace', 'jp'],
  'phone': ['cell phone', 'phone repair', 'mobile'],
  'phones': ['cell phone', 'phone repair', 'mobile'],
  'phone repair': ['cell phone repair', 'mobile repair'],
  'tutor': ['tutoring', 'lessons', 'teacher', 'pep'],
  'music': ['music school', 'music lessons', 'recording'],
  'plumber': ['plumbing', 'plumbing services'],
  'electrician': ['electrical', 'electrical services'],
  'salon': ['hairdresser', 'hair salon', 'braids'],
  'barber': ['barber shop', 'haircut'],
  'taxi': ['transportation', 'transport'],
  'locksmith': ['lock', 'locksmith services'],
  'carpenter': ['carpentry', 'woodwork'],
  'gardener': ['gardening', 'landscaping'],
  'transport': ['taxi', 'transportation', 'bus'],
  'room': ['rent', 'rental', 'room for rent'],
  'rent': ['rental', 'room', 'apartment'],
  'cmu': ['caribbean maritime', 'maritime university'],
  'braids': ['hairdresser', 'cornrows', 'hair'],
  'hair': ['hairdresser', 'salon', 'braids', 'barber'],
};

/**
 * Expands a search query using synonyms and normalizes it.
 * @param {string} query
 * @returns {string[]} - Array of terms to search for (OR logic)
 */
export function expandSearchQuery(query) {
  if (!query) return [];
  const normalized = query.toLowerCase().trim();
  const synonyms = SEARCH_SYNONYMS[normalized] || [];
  return [normalized, ...synonyms];
}
