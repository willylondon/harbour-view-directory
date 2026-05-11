import { getDisplayCategory } from './categoryMap.js';
import { getTrustStatus } from './trustState.js';

const GENERIC_DESCRIPTION_PATTERNS = [
  /is a verified .* business serving harbour view/i,
  /is listed as a .* business serving the harbour view community/i,
  /use this listing to find contact details, location information, and available service notes/i,
  /is a .* contact listed for harbour view/i,
  /is the directory category for/i,
  /useful for people looking for .* status:/i,
  /contact and listing details are being verified/i,
  /details are being updated/i,
  /contact details are being verified/i,
  /local harbour view business/i,
];

const CATEGORY_INTENTS = {
  'Food & Restaurants': 'food, lunch, takeaway, or restaurant details in the community',
  'Grocery & Convenience': 'groceries, corner-shop items, household basics, or convenience-store details',
  'Retail & Shopping': 'shops, supplies, printing, tailoring, courier, or local retail details',
  'Marine / Fishing Supplies': 'fishing gear, marine supplies, or local fishing-related errands',
  'Finance & Banking': 'ATM, bill payment, banking, or money-transfer details',
  'Health & Medical': 'pharmacy, clinic, dental, optical, or health-service contact details',
  'Community & Church': 'location details, community contacts, or corrected information',
  Education: 'school, tutor, lessons, daycare, or education-support details',
  'Auto & Transport': 'local auto parts, mechanics, transport contacts, or vehicle-support errands',
  'Laundry & Cleaning': 'laundry, cleaning, washing, pressing, or garment-care details',
  'Beauty & Wellness': 'barber, salon, hair, nails, or personal-care service details',
  'Professional / Legal / JP': 'legal, JP, document, real-estate, or professional-service details',
  'Books / Stationery': 'books, stationery, school supplies, or reading-related details',
  'Pets / Animals': 'pet supplies, animal-care contacts, veterinary, or pet-service details',
  'Online Retail': 'local product availability, pickup options, or community retail contacts',
  'Events / Bookings': 'event planning, bookings, photography, entertainment, or activity contacts',
  'General Services': 'local service contacts, errands, or community business details',
  'Tech & Electronics': 'phone repair, electronics, computer, or tech-support contact details',
  'Home Services': 'repairs, plumbing, electrical, hardware, appliance, or home-service contacts',
};

const UNKNOWN_CATEGORY_INTENT = 'available contact details, location notes, or directory updates';
const articleFor = value => (/^[aeiou]/i.test(value) ? 'an' : 'a');
const OPENING_VARIANTS = [
  (businessName, category, area) => `${businessName} is listed under ${category} in ${area}.`,
  (businessName, category, area) => `${businessName} appears in the ${category} section for ${area}.`,
  (businessName, category, area) => `${businessName} is ${articleFor(category)} ${category} listing for ${area}.`,
  (businessName, category, area) => `${businessName} can be found under ${category} in ${area}.`,
  (businessName, category, area) => `${businessName} is included with ${category} listings in ${area}.`,
  (businessName, category, area) => `${businessName} is part of the local ${category} directory for ${area}.`,
  (businessName, category, area) => `${businessName} sits in the ${category} category for ${area}.`,
  (businessName, category, area) => `${businessName} is grouped with ${category} options around ${area}.`,
  (businessName, category, area) => `${businessName} has a ${category} directory page for ${area}.`,
];
const INTENT_VARIANTS = [
  intent => `Use this page for ${intent}.`,
  intent => `This page helps with ${intent}.`,
  intent => `Check this listing for ${intent}.`,
  intent => `Helpful when you need ${intent}.`,
  intent => `Use the listing to find ${intent}.`,
  intent => `Local users can check here for ${intent}.`,
  intent => `It is meant for checking ${intent}.`,
  intent => `The listing points to ${intent}.`,
  intent => `Use it when looking for ${intent}.`,
];
const BAD_ADDRESS_VALUES = new Set(['n/a', 'na', 'none', 'null', 'undefined', 'unknown']);

export function isGenericListingDescription(description = '') {
  return GENERIC_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(description));
}

function getCategoryIntent(category) {
  return CATEGORY_INTENTS[category] || UNKNOWN_CATEGORY_INTENT;
}

function getStableVariantIndex(vendor = {}, salt = '', length = 1) {
  const seed = `${vendor.slug || ''}:${vendor.id || ''}:${vendor.business_name || ''}:${salt}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % length;
}

function getDescriptionAreaPhrase() {
  return 'Harbour View, Kingston 17';
}

function getDisplayBusinessName(vendor = {}) {
  const name = vendor.business_name || 'This listing';
  if (name.length > 3 && name === name.toUpperCase()) {
    return name
      .toLowerCase()
      .replace(/\b[a-z]/g, letter => letter.toUpperCase())
      .replace(/\bS&s\b/g, 'S&S');
  }
  return name;
}

function getGeneratedListingDescription(vendor = {}) {
  const category = getDisplayCategory(vendor).display;
  const businessName = getDisplayBusinessName(vendor);
  const area = getDescriptionAreaPhrase(vendor);
  const intent = getCategoryIntent(category);
  const opening = OPENING_VARIANTS[getStableVariantIndex(vendor, 'opening', OPENING_VARIANTS.length)](
    businessName,
    category,
    area,
  );
  const useCase = INTENT_VARIANTS[getStableVariantIndex(vendor, 'intent', INTENT_VARIANTS.length)](intent);

  return `${opening} ${useCase}`;
}

export function getVendorDisplayDescription(vendor = {}) {
  const description = (vendor.description || '').trim();
  const containsVerifiedClaim = /\bverified\b/i.test(description);
  const trustStatus = getTrustStatus(vendor);

  if (description && !isGenericListingDescription(description) && (!containsVerifiedClaim || trustStatus.isVerified)) {
    return description;
  }

  return getGeneratedListingDescription(vendor);
}

export function getVendorDisplayAddress(vendor = {}) {
  const rawAddress = (vendor.address || '').toString().trim();
  if (!rawAddress || BAD_ADDRESS_VALUES.has(rawAddress.toLowerCase())) {
    return 'Local Harbour View business — address not listed';
  }

  const cleanedAddress = rawAddress
    .replace(/\b(undefined|null|n\/a)\b/gi, '')
    .replace(/\s*,\s*,+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*(Harbour View)(,\s*\1)+/gi, ', $1')
    .replace(/\b(Kingston)\s*,?\s*\1\b/gi, '$1')
    .replace(/\b(Jamaica)\s*,?\s*\1\b/gi, '$1')
    .replace(/^\s*[,|-]+\s*/g, '')
    .replace(/\s*[,|-]+\s*$/g, '')
    .trim();

  if (!cleanedAddress || BAD_ADDRESS_VALUES.has(cleanedAddress.toLowerCase())) {
    return 'Local Harbour View business — address not listed';
  }

  return cleanedAddress;
}

export function getVendorMetaDescription(vendor = {}) {
  return getGeneratedListingDescription(vendor);
}
