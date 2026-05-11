import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const emitWarning = process.emitWarning.bind(process);
process.emitWarning = (warning, ...args) => {
  const message = typeof warning === 'string' ? warning : warning?.message;
  if (message?.includes('Module type of file') || args.includes('MODULE_TYPELESS_PACKAGE_JSON')) {
    return;
  }
  emitWarning(warning, ...args);
};

const { CATEGORY_TAXONOMY, getDisplayCategory } = await import('../lib/categoryMap.js');
const { filterPublicVendors } = await import('../lib/publicDirectory.js');
const { getVendorDisplayDescription } = await import('../lib/listingCopy.js');
const { getTrustStatus } = await import('../lib/trustState.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vendorsPath = path.join(__dirname, 'current_production_vendors.json');
const FIRST_CARD_COUNT = 24;
const MAX_STRUCTURE_REPEATS = 3;
const OLD_GENERIC_COPY = 'Local Harbour View business. Details are being updated.';
const FORBIDDEN_WITHOUT_DATA = [
  'best',
  'top-rated',
  'trusted',
  'open now',
  'delivery',
  'WhatsApp',
  'owner',
  'reviewed by customers',
];

function loadVendors() {
  const raw = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'));
  if (Array.isArray(raw)) return raw;
  return raw.records || [];
}

function rowName(vendor = {}) {
  return vendor.business_name || vendor.slug || vendor.id || 'Unknown listing';
}

function displayBusinessName(vendor = {}) {
  const name = vendor.business_name || 'This listing';
  if (name.length > 3 && name === name.toUpperCase()) {
    return name
      .toLowerCase()
      .replace(/\b[a-z]/g, letter => letter.toUpperCase())
      .replace(/\bS&s\b/g, 'S&S');
  }
  return name;
}

function sortLikeDirectory(vendors = []) {
  return [...vendors].sort((a, b) => {
    if (a.is_top_ad && !b.is_top_ad) return -1;
    if (!a.is_top_ad && b.is_top_ad) return 1;
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getValueText(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(getValueText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(getValueText).join(' ');
  return String(value);
}

function listingDataSupportsTerm(vendor = {}, term = '') {
  if (/^whatsapp$/i.test(term)) {
    return Boolean(vendor.whatsapp);
  }

  if (/^owner$/i.test(term)) {
    return Boolean(vendor.owner_name || vendor.owner_id || vendor.owner_claimed || vendor.claimed_at);
  }

  const dataText = getValueText(vendor).toLowerCase();
  return dataText.includes(term.toLowerCase());
}

function descriptionIncludesTerm(description = '', term = '') {
  const escaped = escapeRegExp(term);
  if (/^[a-z0-9 -]+$/i.test(term)) {
    return new RegExp(`\\b${escaped}\\b`, 'i').test(description);
  }
  return new RegExp(escaped, 'i').test(description);
}

function getStructureSignature(vendor = {}, description = '') {
  let signature = description;
  const category = getDisplayCategory(vendor).display;
  const names = [
    vendor.business_name,
    vendor.business_name && vendor.business_name.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase()).replace(/\bS&s\b/g, 'S&S'),
  ].filter(Boolean);

  for (const name of names) {
    signature = signature.replace(new RegExp(escapeRegExp(name), 'gi'), '{business}');
  }

  for (const categoryName of CATEGORY_TAXONOMY) {
    signature = signature.replace(new RegExp(escapeRegExp(categoryName), 'gi'), '{category}');
  }

  signature = signature
    .replace(new RegExp(escapeRegExp(category), 'gi'), '{category}')
    .replace(/Harbour View, Kingston 17/gi, '{area}')
    .replace(/Useful for [^.]+[.]/gi, 'Useful for {intent}.')
    .replace(/when checking [^.]+[.]/gi, 'when checking {intent}.')
    .replace(/This page helps with [^.]+[.]/gi, 'This page helps with {intent}.')
    .replace(/Use this page for [^.]+[.]/gi, 'Use this page for {intent}.')
    .replace(/Helpful when you need [^.]+[.]/gi, 'Helpful when you need {intent}.')
    .replace(/to check [^.]+[.]/gi, 'to check {intent}.')
    .replace(/This listing points to [^.]+[.]/gi, 'This listing points to {intent}.')
    .replace(/Use the listing to find [^.]+[.]/gi, 'Use the listing to find {intent}.')
    .replace(/may use \{business\} for [^.]+[.]/gi, 'may use {business} for {intent}.')
    .replace(/It can help with [^.]+[.]/gi, 'It can help with {intent}.')
    .replace(/Check this page for [^.]+[.]/gi, 'Check this page for {intent}.')
    .replace(/\s+/g, ' ')
    .trim();

  return signature;
}

const publicVendors = filterPublicVendors(loadVendors());
const firstCards = sortLikeDirectory(publicVendors).slice(0, FIRST_CARD_COUNT);
const failures = [];
const structures = new Map();
const samples = [];

for (const vendor of firstCards) {
  const description = getVendorDisplayDescription(vendor);
  const trustStatus = getTrustStatus(vendor);
  const structure = getStructureSignature(vendor, description);
  const entries = structures.get(structure) || [];
  entries.push(rowName(vendor));
  structures.set(structure, entries);

  samples.push({
    listing: rowName(vendor),
    category: getDisplayCategory(vendor).display,
    description,
  });

  if (/\bverified\b/i.test(description) && !trustStatus.isVerified) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'unverified_description_claims_verified',
      description,
    });
  }

  if (description.includes(OLD_GENERIC_COPY)) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'old_generic_copy_present',
      description,
    });
  }

  if (/^[A-Za-z &/]+ is the directory category for\b/i.test(description)) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'old_category_first_copy_present',
      description,
    });
  }

  if (!description.startsWith(displayBusinessName(vendor))) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'generated_copy_does_not_start_with_business_name',
      description,
    });
  }

  for (const term of FORBIDDEN_WITHOUT_DATA) {
    if (descriptionIncludesTerm(description, term) && !listingDataSupportsTerm(vendor, term)) {
      failures.push({
        listing: rowName(vendor),
        id: vendor.id,
        reason: 'unsupported_word_without_data',
        term,
        description,
      });
    }
  }
}

for (const [structure, listings] of structures.entries()) {
  if (listings.length > MAX_STRUCTURE_REPEATS) {
    failures.push({
      reason: 'repeated_sentence_structure',
      count: listings.length,
      max_allowed: MAX_STRUCTURE_REPEATS,
      listings,
      structure,
    });
  }
}

const result = {
  checked_first_cards: firstCards.length,
  invalid_count: failures.length,
  invalid_rows: failures,
  repeated_structure_counts: [...structures.entries()]
    .map(([structure, listings]) => ({ count: listings.length, listings, structure }))
    .sort((a, b) => b.count - a.count),
  samples,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
