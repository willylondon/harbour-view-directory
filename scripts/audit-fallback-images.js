import fs from 'node:fs';
import { createVendorImageResolver, getFallbackAuditInfo, CATEGORY_IMAGE_QUERY_MAP } from '../lib/categoryFallbackImages.js';

const dataPath = 'scripts/current_production_vendors.json';

if (!fs.existsSync(dataPath)) {
  console.error(`Missing ${dataPath}. Export production vendors before running this audit.`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const records = (Array.isArray(payload) ? payload : payload.records || []).slice(0, 24);
const resolveImage = createVendorImageResolver();
const rows = records.map((vendor) => {
  const image = resolveImage(vendor);
  const audit = getFallbackAuditInfo(vendor);
  return {
    business_name: vendor.business_name,
    category: audit.category,
    fallback_group: image.fallbackGroup,
    source: image.source,
    image_url: image.src,
    query_hint: CATEGORY_IMAGE_QUERY_MAP[image.fallbackGroup] || CATEGORY_IMAGE_QUERY_MAP[audit.category] || '',
  };
});

const fallbackCounts = rows.reduce((counts, row) => {
  if (row.source !== 'uploaded' && row.image_url) {
    counts[row.image_url] = (counts[row.image_url] || 0) + 1;
  }
  return counts;
}, {});

const repeated = Object.entries(fallbackCounts)
  .filter(([, count]) => count > 1)
  .map(([image_url, count]) => ({ image_url, count }));

const suspicious = rows.filter(row => {
  const text = `${row.business_name} ${row.category}`.toLowerCase();
  if (text.includes('barber')) return row.fallback_group !== 'barber';
  if (text.includes('mechanic') || text.includes('auto')) return row.fallback_group !== 'mechanic' && row.category !== 'Auto & Transport';
  if (text.includes('pharmacy')) return row.fallback_group !== 'health' && row.category !== 'Health & Medical';
  if (text.includes('laundry')) return row.fallback_group !== 'laundry';
  return false;
});

const categoryImageCounts = rows.reduce((counts, row) => {
  if (row.source === 'uploaded' || !row.image_url) return counts;
  const key = `${row.category}::${row.image_url}`;
  counts[key] = (counts[key] || 0) + 1;
  return counts;
}, {});

const overusedWithinCategory = Object.entries(categoryImageCounts)
  .filter(([, count]) => count > 1)
  .map(([key, count]) => {
    const [category, image_url] = key.split('::');
    return { category, image_url, count };
  });

console.log(JSON.stringify({
  audited_visible_records: rows.length,
  repeated_fallback_images: repeated,
  overused_fallback_images_within_category: overusedWithinCategory,
  suspicious_category_pairings: suspicious,
  rows,
}, null, 2));

if (repeated.length || overusedWithinCategory.length || suspicious.length) {
  process.exitCode = 1;
}
