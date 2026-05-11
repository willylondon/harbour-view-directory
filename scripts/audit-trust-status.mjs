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

const { getTrustStatus } = await import('../lib/trustState.js');
const { getVendorDisplayDescription } = await import('../lib/listingCopy.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vendorsPath = path.join(__dirname, 'current_production_vendors.json');
const forbiddenWithVerified = new Set(['needs_confirmation', 'community_listed', 'recently_added']);

function loadVendors() {
  const raw = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'));
  if (Array.isArray(raw)) return raw;
  return raw.records || [];
}

function rowName(vendor = {}) {
  return vendor.business_name || vendor.slug || vendor.id || 'Unknown listing';
}

const vendors = loadVendors();
const failures = [];

for (const vendor of vendors) {
  const trust = getTrustStatus(vendor);
  const stateValues = trust.states.map(state => state.value);
  const description = getVendorDisplayDescription(vendor);

  if (trust.isVerified && trust.showContactNotice) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'verified_with_contact_notice',
      states: stateValues,
    });
  }

  if (trust.primary.value === 'verified' && !trust.isVerified) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'primary_verified_without_true_verification',
      states: stateValues,
    });
  }

  if (trust.primary.value === 'verified') {
    const conflicts = stateValues.filter(value => forbiddenWithVerified.has(value));
    if (conflicts.length > 0) {
      failures.push({
        listing: rowName(vendor),
        id: vendor.id,
        reason: 'verified_with_conflicting_status',
        conflicts,
        states: stateValues,
      });
    }
  }

  if (trust.primary.value === 'recently_added' && trust.isVerified) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'verified_listing_recently_added_as_primary',
      states: stateValues,
    });
  }

  if (/\bverified\b/i.test(description) && !trust.isVerified) {
    failures.push({
      listing: rowName(vendor),
      id: vendor.id,
      reason: 'unverified_description_claims_verified',
      states: stateValues,
    });
  }
}

const result = {
  checked: vendors.length,
  invalid_count: failures.length,
  invalid_rows: failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
