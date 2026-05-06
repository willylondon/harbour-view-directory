const rateLimitStore = new Map();

/**
 * Simple in-memory rate limiter.
 * @param {string} key Unique key (e.g., IP address)
 * @param {number} limit Max requests per interval
 * @param {number} interval Time interval in milliseconds
 * @returns {boolean} True if allowed, false if limited
 */
export function isRateLimited(key, limit = 3, interval = 3600000) {
  const now = Date.now();
  const userData = rateLimitStore.get(key) || { count: 0, startTime: now };

  if (now - userData.startTime > interval) {
    // Reset window
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count++;
  }

  rateLimitStore.set(key, userData);

  return userData.count > limit;
}
