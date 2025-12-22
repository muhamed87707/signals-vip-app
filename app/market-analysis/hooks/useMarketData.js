'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Cache configuration for different data types
 * TTL in milliseconds
 */
const CACHE_CONFIG = {
    'gold-price': { ttl: 30000, staleWhileRevalidate: true },      // 30 seconds
    'cot-report': { ttl: 3600000, staleWhileRevalidate: true },    // 1 hour (weekly data)
    'news': { ttl: 300000, staleWhileRevalidate: true },           // 5 minutes
    'bank-forecasts': { ttl: 86400000, staleWhileRevalidate: true }, // 24 hours
    'treasury-yields': { ttl: 60000, staleWhileRevalidate: true }, // 1 minute
    'dxy': { ttl: 60000, staleWhileRevalidate: true },             // 1 minute
    'currencies': { ttl: 60000, staleWhileRevalidate: true },      // 1 minute
    'indices': { ttl: 60000, staleWhileRevalidate: true },         // 1 minute
    'economic-calendar': { ttl: 300000, staleWhileRevalidate: true }, // 5 minutes
    'fed-watch': { ttl: 3600000, staleWhileRevalidate: true },     // 1 hour
    'correlations': { ttl: 3600000, staleWhileRevalidate: true },  // 1 hour
    'fundamentals': { ttl: 86400000, staleWhileRevalidate: true }, // 24 hours
    'ai-analysis': { ttl: 600000, staleWhileRevalidate: true },    // 10 minutes
    'default': { ttl: 300000, staleWhileRevalidate: true }         // 5 minutes default
};

// In-memory cache store
const cacheStore = new Map();

/**
 * Get cached data if valid
 */
function getCachedData(key) {
    const cached = cacheStore.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    const config = CACHE_CONFIG[key] || CACHE_CONFIG.default;
    
    if (now - cached.timestamp < config.ttl) {
        return { data: cached.data, isStale: false, timestamp: cached.timestamp };
    }
    
    if (config.staleWhileRevalidate) {
        return { data: cached.data, isStale: true, timestamp: cached.timestamp };
    }
    
    return null;
}

/**
 * Set cache data
 */
function setCacheData(key, data) {
    cacheStore.set(key, {
        data,
        timestamp: Date.now()
    });
}

/**
 * Clear specific cache or all cache
 */
export function clearCache(key = null) {
    if (key) {
        cacheStore.delete(key);
    } else {
        cacheStore.clear();
    }
}

/**
 * useMarketData - Custom hook for fetching market data with caching
 * @param {string} endpoint - API endpoint key (e.g., 'gold-price', 'cot-report')
 * @param {object} options - Options
 * @param {boolean} options.enabled - Enable/disable fetching
 * @param {number} options.refreshInterval - Auto-refresh interval in ms (0 to disable)
 * @param {object} options.params - Query parameters
 * @param {function} options.onSuccess - Success callback
 * @param {function} options.onError - Error callback
 */
export default function useMarketData(endpoint, options = {}) {
    const {
        enabled = true,
        refreshInterval = 0,
        params = {},
        onSuccess,
        onError
    } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isStale, setIsStale] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    
    const abortControllerRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async (skipCache = false) => {
        if (!enabled) return;

        // Check cache first (unless skipCache is true)
        if (!skipCache) {
            const cached = getCachedData(endpoint);
            if (cached && !cached.isStale) {
                setData(cached.data);
                setIsStale(false);
                setLastUpdate(new Date(cached.timestamp));
                setLoading(false);
                return;
            }
            
            // Use stale data while revalidating
            if (cached && cached.isStale) {
                setData(cached.data);
                setIsStale(true);
                setLastUpdate(new Date(cached.timestamp));
            }
        }

        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            // Build URL with params
            const queryString = new URLSearchParams(params).toString();
            const url = `/api/market/${endpoint}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Update cache
            setCacheData(endpoint, result);
            
            setData(result);
            setIsStale(false);
            setLastUpdate(new Date());
            setError(null);
            
            if (onSuccess) onSuccess(result);
        } catch (err) {
            if (err.name === 'AbortError') return;
            
            console.error(`Error fetching ${endpoint}:`, err);
            setError(err.message);
            
            // Keep stale data on error
            const cached = getCachedData(endpoint);
            if (cached) {
                setData(cached.data);
                setIsStale(true);
            }
            
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, enabled, params, onSuccess, onError]);

    // Initial fetch
    useEffect(() => {
        fetchData();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData]);

    // Auto-refresh interval
    useEffect(() => {
        if (refreshInterval > 0 && enabled) {
            intervalRef.current = setInterval(() => {
                fetchData(true); // Skip cache for interval refresh
            }, refreshInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [refreshInterval, enabled, fetchData]);

    // Manual refresh function
    const refresh = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    // Mutate function to update data locally
    const mutate = useCallback((newData) => {
        setData(newData);
        setCacheData(endpoint, newData);
        setLastUpdate(new Date());
    }, [endpoint]);

    return {
        data,
        error,
        loading,
        isStale,
        lastUpdate,
        refresh,
        mutate
    };
}

/**
 * useGoldPrice - Specialized hook for gold price with auto-refresh
 */
export function useGoldPrice(options = {}) {
    return useMarketData('gold-price', {
        refreshInterval: 30000, // 30 seconds
        ...options
    });
}

/**
 * useCOTReport - Hook for COT report data
 */
export function useCOTReport(options = {}) {
    return useMarketData('cot-report', options);
}

/**
 * useNews - Hook for news data
 */
export function useNews(options = {}) {
    return useMarketData('news', {
        refreshInterval: 300000, // 5 minutes
        ...options
    });
}

/**
 * useBankForecasts - Hook for bank forecasts
 */
export function useBankForecasts(options = {}) {
    return useMarketData('bank-forecasts', options);
}

/**
 * useTreasuryYields - Hook for treasury yields
 */
export function useTreasuryYields(options = {}) {
    return useMarketData('treasury-yields', {
        refreshInterval: 60000, // 1 minute
        ...options
    });
}

/**
 * useAIAnalysis - Hook for AI analysis
 */
export function useAIAnalysis(options = {}) {
    return useMarketData('ai-analysis', options);
}
