/**
 * Generates a URL-friendly slug from a string.
 * @param {string} text 
 * @returns {string}
 */
export function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Normalizes a WhatsApp number to international format (+1876XXXXXXXX).
 * @param {string} phone 
 * @returns {string}
 */
export function normalizeWhatsApp(phone) {
  if (!phone) return '';
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 876 and is 10 digits, add +1
  if (digits.length === 10 && digits.startsWith('876')) {
    return `+1${digits}`;
  }
  
  // If it's already 11 digits and starts with 1, just add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Default: return as is if it's already formatted or too weird
  return digits.startsWith('+') ? digits : `+${digits}`;
}
