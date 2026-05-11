export const PUBLIC_VENDOR_LOCALITIES = ['harbour_view_verified', 'harbour_view_likely'];
export const PUBLIC_RENTAL_LOCALITIES = ['harbour_view_verified', 'harbour_view_likely', 'nearby_allowed'];

const BLOCKED_VENDOR_DATA_QUALITY = new Set(['rejected', 'out_of_area', 'duplicate', 'duplicate_probable']);

export const PUBLIC_VENDOR_COLUMNS = 'id, business_name, category, description, slug, address, whatsapp, phone, website, images, is_featured, is_top_ad, created_at, updated_at, locality_status, public_visibility, data_quality_status';
export const PUBLIC_RENTAL_COLUMNS = 'id, title, type, price, location, furnished, utilities_included, distance_to_cmu, photos, slug, created_at, distance_sort, locality_status, public_visibility, status, expires_at';

export function applyPublicVendorFilters(query) {
  return query
    .eq('is_approved', true)
    .eq('public_visibility', true)
    .in('locality_status', PUBLIC_VENDOR_LOCALITIES);
}

export function applyPublicRentalFilters(query) {
  return query
    .eq('status', 'approved')
    .eq('public_visibility', true)
    .in('locality_status', PUBLIC_RENTAL_LOCALITIES);
}

export function isVendorPublic(vendor) {
  if (!vendor) return false;
  if (vendor.is_approved === false) return false;
  if (vendor.public_visibility !== true) return false;
  if (!PUBLIC_VENDOR_LOCALITIES.includes(vendor.locality_status)) return false;
  if (BLOCKED_VENDOR_DATA_QUALITY.has((vendor.data_quality_status || '').toLowerCase())) return false;
  return true;
}

export function isRentalPublic(rental) {
  if (!rental) return false;
  if (rental.status && rental.status !== 'approved') return false;
  if (rental.public_visibility !== true) return false;
  if (!PUBLIC_RENTAL_LOCALITIES.includes(rental.locality_status)) return false;
  return true;
}

export function filterPublicVendors(vendors = []) {
  return vendors.filter(isVendorPublic);
}

export function filterPublicRentals(rentals = []) {
  return rentals.filter(isRentalPublic);
}
