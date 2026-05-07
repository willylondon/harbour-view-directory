/**
 * Category normalization and search synonym mapping.
 * Does NOT modify database data — derives display category from keywords
 * found in business name and description at display time.
 */

// Ordered rules: first match wins
const CATEGORY_RULES = [
  // Food & Beverage
  {
    display: 'Food & Beverage',
    emoji: '🍽️', bg: 'bg-orange-50', border: 'border-orange-200',
    keywords: ['food', 'restaurant', 'deli', 'catering', 'baker', 'baking', 'cake', 'pastry',
               'drink', 'water delivery', 'drinking water', 'delivery food', 'beverage',
               'jerk', 'cook', 'snack', 'bbq', 'bar', 'cafe', 'liquor', 'wholesale liquor'],
  },

  // Cooking Gas — separate from Food
  {
    display: 'Home Services',
    emoji: '🏠', bg: 'bg-emerald-50', border: 'border-emerald-200',
    keywords: ['cooking gas', 'gas cylinder', 'propane', 'tuna gas', 'vespak', 'igl cylinder',
               'gas supplier', 'cooking gas supplier'],
  },

  // Beauty & Wellness
  {
    display: 'Beauty & Wellness',
    emoji: '💆', bg: 'bg-pink-50', border: 'border-pink-200',
    keywords: ['hair', 'hairdresser', 'salon', 'braids', 'cornrow', 'twist', 'barber',
               'beauty', 'nail', 'nails', 'lash', 'makeup', 'massage', 'wax',
               'body massage', 'spa', 'skin', 'wellness', 'beauty therapist'],
  },

  // Education & Tutoring
  {
    display: 'Education & Tutoring',
    emoji: '📚', bg: 'bg-indigo-50', border: 'border-indigo-200',
    keywords: ['tutor', 'tutoring', 'lessons', 'music school', 'music lesson', 'teacher',
               'primary education', 'pep', 'cxc', 'csec', 'math', 'physics', 'chemistry',
               'biology', 'school', 'daycare', 'pre school', 'preschool', 'brilliant minds',
               'recording studio'],
  },

  // Tech & Electronics
  {
    display: 'Tech & Electronics',
    emoji: '📱', bg: 'bg-cyan-50', border: 'border-cyan-200',
    keywords: ['phone repair', 'cell phone', 'computer repair', 'laptop repair', 'tech',
               'electronics', 'printing', 'passport pic', 'photocopying', 'graphic', 'print',
               'it support', 'computer', 'security camera', 'cctv', 'cctv camera'],
  },

  // Professional / Legal / JP
  {
    display: 'Professional / Legal / JP',
    emoji: '⚖️', bg: 'bg-blue-50', border: 'border-blue-200',
    keywords: ['justice of the peace', 'jp', 'legal', 'notary', 'attorney', 'lawyer',
               'real estate', 'insurance', 'accountant', 'financial'],
  },

  // Auto & Transport
  {
    display: 'Auto & Transport',
    emoji: '🚗', bg: 'bg-slate-50', border: 'border-slate-200',
    keywords: ['taxi', 'transport', 'transportation', 'bus', 'bus driver', 'driver',
               'driving instructor', 'car rental', 'rental car', 'trucking', 'moving',
               'airport', 'wheelchair', 'mechanic', 'car service', 'car maintenance',
               'duco', 'body work'],
  },

  // Home Services
  {
    display: 'Home Services',
    emoji: '🏠', bg: 'bg-emerald-50', border: 'border-emerald-200',
    keywords: ['plumber', 'plumbing', 'electrician', 'electrical', 'locksmith', 'carpenter',
               'gardener', 'landscaper', 'painter', 'tiler', 'welder', 'appliance',
               'fridge repair', 'washing machine', 'stove repair', 'oven', 'air conditi',
               'ac technician', 'pest control', 'roofing', 'solar', 'water heater',
               'water truck', 'water tank', 'mattress', 'upholsterer', 'furniture',
               'hardware', 'general repair', 'handyman', 'general service', 'odd jobs',
               'odd-job'],
  },

  // Retail & Shopping
  {
    display: 'Retail & Shopping',
    emoji: '🛍️', bg: 'bg-violet-50', border: 'border-violet-200',
    keywords: ['courier', 'dressmaker', 'tailor', 'seamstress', 'shop', 'store', 'retail'],
  },

  // Community & Emergency
  {
    display: 'Community',
    emoji: '🏘️', bg: 'bg-amber-50', border: 'border-amber-200',
    keywords: ['police', 'fire brigade', 'emergency', 'health centre', 'dental', 'dentist',
               'vet', 'veterinary', 'animal', 'plant supplier', 'garden supplier',
               'day worker', 'dayworker', 'travel', 'vacation'],
  },
];

// Default fallback
const DEFAULT_CATEGORY = {
  display: 'Professional Services',
  emoji: '🏢', bg: 'bg-gray-50', border: 'border-gray-200',
};

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
