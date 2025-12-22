/**
 * Simple in-memory cache for trading data
 * Reduces API calls and improves performance
 */

class TradingCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get cached value
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set cached value
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Delete cached value
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    let valid = 0;
    let expired = 0;
    const now = Date.now();

    this.cache.forEach((item) => {
      if (now > item.expiry) expired++;
      else valid++;
    });

    return { total: this.cache.size, valid, expired };
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const tradingCache = new TradingCache();

// Cache keys
export const CACHE_KEYS = {
  PRICE: (symbol) => `price:${symbol}`,
  ANALYSIS: (symbol, tf) => `analysis:${symbol}:${tf}`,
  SCAN: 'market:scan',
  PERFORMANCE: 'performance:stats',
  SETTINGS: (userId) => `settings:${userId}`
};

// TTL values
export const CACHE_TTL = {
  PRICE: 30 * 1000,        // 30 seconds
  ANALYSIS: 5 * 60 * 1000, // 5 minutes
  SCAN: 5 * 60 * 1000,     // 5 minutes
  PERFORMANCE: 60 * 1000,  // 1 minute
  SETTINGS: 10 * 60 * 1000 // 10 minutes
};

export default tradingCache;
