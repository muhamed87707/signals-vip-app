/**
 * Market Data Service - AlphaVantage API Client
 * Requirements: 3.1, 3.3
 */

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// In-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data or fetch new
 */
function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch Gold (XAUUSD) price data
 */
export async function getGoldPrice() {
  const cacheKey = 'gold_price';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      const result = {
        price: parseFloat(rate['5. Exchange Rate']),
        bidPrice: parseFloat(rate['8. Bid Price'] || rate['5. Exchange Rate']),
        askPrice: parseFloat(rate['9. Ask Price'] || rate['5. Exchange Rate']),
        timestamp: new Date(rate['6. Last Refreshed']),
      };
      setCache(cacheKey, result);
      return result;
    }
    
    throw new Error('Invalid response from AlphaVantage');
  } catch (error) {
    console.error('Error fetching gold price:', error);
    // Return fallback data
    return {
      price: 2650.00,
      bidPrice: 2649.50,
      askPrice: 2650.50,
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

/**
 * Fetch DXY (Dollar Index) data
 */
export async function getDXYData() {
  const cacheKey = 'dxy_data';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // DXY is approximated using EUR/USD inverse (EUR is ~57% of DXY)
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
      // Approximate DXY calculation
      const dxyApprox = 100 / rate * 0.576 + 50; // Simplified approximation
      
      const result = {
        value: parseFloat(dxyApprox.toFixed(2)),
        change: 0, // Would need historical data for change
        changePercent: 0,
        timestamp: new Date(),
      };
      setCache(cacheKey, result);
      return result;
    }
    
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Error fetching DXY:', error);
    return {
      value: 104.25,
      change: -0.15,
      changePercent: -0.14,
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

/**
 * Fetch forex pair data
 */
export async function getForexRate(fromCurrency, toCurrency) {
  const cacheKey = `forex_${fromCurrency}_${toCurrency}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      const result = {
        pair: `${fromCurrency}${toCurrency}`,
        rate: parseFloat(rate['5. Exchange Rate']),
        timestamp: new Date(rate['6. Last Refreshed']),
      };
      setCache(cacheKey, result);
      return result;
    }
    
    throw new Error('Invalid response');
  } catch (error) {
    console.error(`Error fetching ${fromCurrency}/${toCurrency}:`, error);
    return null;
  }
}

/**
 * Fetch commodity price (Oil)
 */
export async function getOilPrice() {
  const cacheKey = 'oil_price';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=WTI&interval=daily&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const latest = data.data[0];
      const previous = data.data[1];
      const price = parseFloat(latest.value);
      const prevPrice = parseFloat(previous.value);
      
      const result = {
        price,
        change: price - prevPrice,
        changePercent: ((price - prevPrice) / prevPrice) * 100,
        timestamp: new Date(latest.date),
      };
      setCache(cacheKey, result);
      return result;
    }
    
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Error fetching oil price:', error);
    return {
      price: 71.45,
      change: 0.85,
      changePercent: 1.20,
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}

export default {
  getGoldPrice,
  getDXYData,
  getForexRate,
  getOilPrice,
  clearCache,
};
