/**
 * Cache Manager
 * نظام التخزين المؤقت للبيانات
 * 
 * Features:
 * - In-memory caching with TTL
 * - LRU eviction policy
 * - Namespace support
 * - Statistics tracking
 */

export class CacheManager {
  constructor(config = {}) {
    this.config = {
      maxSize: 1000,           // Maximum cache entries
      defaultTTL: 60000,       // Default TTL: 1 minute
      cleanupInterval: 30000,  // Cleanup every 30 seconds
      ...config,
    };

    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
    };

    // Start cleanup interval
    this.cleanupTimer = setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Update access time for LRU
    entry.lastAccess = Date.now();
    this.stats.hits++;
    
    return entry.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in ms (optional)
   */
  set(key, value, ttl = this.config.defaultTTL) {
    // Evict if at max size
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      expiresAt: Date.now() + ttl,
    });

    this.stats.sets++;
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear entries by namespace/prefix
   * @param {string} prefix - Key prefix to clear
   */
  clearByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get or set with callback
   * @param {string} key - Cache key
   * @param {Function} callback - Function to get value if not cached
   * @param {number} ttl - Time to live
   */
  async getOrSet(key, callback, ttl = this.config.defaultTTL) {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await callback();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.config.maxSize,
    };
  }

  /**
   * Destroy cache manager
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

// Singleton instance for global cache
let globalCache = null;

export function getGlobalCache() {
  if (!globalCache) {
    globalCache = new CacheManager({
      maxSize: 2000,
      defaultTTL: 300000, // 5 minutes
    });
  }
  return globalCache;
}

// Cache key generators
export const CacheKeys = {
  marketData: (symbol, timeframe) => `market:${symbol}:${timeframe}`,
  analysis: (symbol) => `analysis:${symbol}`,
  signal: (symbol) => `signal:${symbol}`,
  performance: () => 'performance:stats',
  instruments: () => 'instruments:list',
  killZone: () => 'killzone:current',
};

// TTL presets (in milliseconds)
export const CacheTTL = {
  REALTIME: 5000,      // 5 seconds
  SHORT: 30000,        // 30 seconds
  MEDIUM: 60000,       // 1 minute
  LONG: 300000,        // 5 minutes
  EXTENDED: 900000,    // 15 minutes
  HOUR: 3600000,       // 1 hour
};
