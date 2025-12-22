/**
 * Rate Limiter for API protection
 * Prevents abuse and ensures fair usage
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limits = {
      generateSignal: { max: 10, window: 60 * 1000 },  // 10 per minute
      scan: { max: 20, window: 60 * 1000 },            // 20 per minute
      analyze: { max: 30, window: 60 * 1000 },         // 30 per minute
      default: { max: 100, window: 60 * 1000 }         // 100 per minute
    };
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier, action = 'default') {
    const key = `${identifier}:${action}`;
    const limit = this.limits[action] || this.limits.default;
    const now = Date.now();

    // Get or create request record
    let record = this.requests.get(key);
    if (!record) {
      record = { count: 0, windowStart: now };
      this.requests.set(key, record);
    }

    // Reset window if expired
    if (now - record.windowStart > limit.window) {
      record.count = 0;
      record.windowStart = now;
    }

    // Check limit
    if (record.count >= limit.max) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((record.windowStart + limit.window - now) / 1000)
      };
    }

    // Increment and allow
    record.count++;
    return {
      allowed: true,
      remaining: limit.max - record.count,
      resetIn: Math.ceil((record.windowStart + limit.window - now) / 1000)
    };
  }

  /**
   * Get rate limit headers
   */
  getHeaders(identifier, action = 'default') {
    const result = this.isAllowed(identifier, action);
    const limit = this.limits[action] || this.limits.default;

    return {
      'X-RateLimit-Limit': limit.max.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetIn.toString()
    };
  }

  /**
   * Clean up old records
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      const action = key.split(':')[1] || 'default';
      const limit = this.limits[action] || this.limits.default;
      if (now - record.windowStart > limit.window * 2) {
        this.requests.delete(key);
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

export default rateLimiter;
