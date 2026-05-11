import fs from 'node:fs';
import { getDisplayCategory } from '../lib/categoryMap.js';
import { getVendorMetaDescription } from '../lib/listingCopy.js';

const dataPath = 'scripts/current_production_vendors.json';

if (!fs.existsSync(dataPath)) {
  console.error(`Missing ${dataPath}. Export production vendors before running this audit.`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const records = Array.isArray(payload) ? payload : payload.records || [];

const normalizedCategoryChanges = records
  .map((vendor) => {
    const rawCategory = vendor.category || '';
    const canonical = getDisplayCategory(vendor).display;
    return {
      business_name: vendor.business_name,
      slug: vendor.slug,
      raw_category: rawCategory,
      canonical_category: canonical,
      changed: rawCategory && rawCategory !== canonical,
    };
  })
  .filter(row => row.changed);

function categoryBySurface(vendor) {
  const directoryCard = getDisplayCategory(vendor).display;
  const homepageCard = getDisplayCategory(vendor).display;
  const vendorPage = getDisplayCategory(vendor).display;
  const seoMetaDescription = getVendorMetaDescription(vendor);
  const seoMetadata = seoMetaDescription.includes(directoryCard) ? directoryCard : '';

  return {
    business_name: vendor.business_name,
    slug: vendor.slug,
    source_category: vendor.category || '',
    homepage_card: homepageCard,
    directory_card: directoryCard,
    vendor_page: vendorPage,
    seo_metadata: seoMetadata,
  };
}

const surfaceRows = records.map(categoryBySurface);
const surfaceMismatches = surfaceRows
  .map((row) => {
    const values = [row.homepage_card, row.directory_card, row.vendor_page, row.seo_metadata].filter(Boolean);
    return {
      ...row,
      mismatch: new Set(values).size > 1 || !row.seo_metadata,
    };
  })
  .filter(row => row.mismatch);

const unstable = records
  .map((vendor) => {
    const first = getDisplayCategory(vendor).display;
    const second = getDisplayCategory({ ...vendor, category: first }).display;
    return {
      business_name: vendor.business_name,
      slug: vendor.slug,
      first,
      second,
      unstable: first !== second,
    };
  })
  .filter(row => row.unstable);

console.log(JSON.stringify({
  total_records: records.length,
  normalized_category_changes: normalizedCategoryChanges.length,
  surface_category_mismatches: surfaceMismatches.length,
  unstable_category_results: unstable.length,
  changed_rows: normalizedCategoryChanges,
  surface_mismatch_rows: surfaceMismatches,
  unstable_rows: unstable,
}, null, 2));

if (unstable.length || surfaceMismatches.length) {
  process.exitCode = 1;
}
