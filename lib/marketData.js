/**
 * Market Data Service - AlphaVantage API Client
 * Requirements: 3.1, 3.3
 * Provides LIVE market data for trading decisions
 */

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

// In-memory cache with shorter TTL for live data
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute for live trading data

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
 * Fetch Gold (XAUUSD) price data - LIVE
 */
export async function getGoldPrice() {
  const cacheKey = 'gold_price';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Primary: AlphaVantage
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`;
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      const currentPrice = parseFloat(rate['5. Exchange Rate']);
      
      // Get previous close for change calculation
      let change = 0;
      let changePercent = 0;
      
      try {
        const dailyUrl = `${ALPHA_VANTAGE_BASE_URL}?function=FX_DAILY&from_symbol=XAU&to_symbol=USD&apikey=${API_KEY}`;
        const dailyResponse = await fetch(dailyUrl, { cache: 'no-store' });
        const dailyData = await dailyResponse.json();
        
        if (dailyData['Time Series FX (Daily)']) {
          const dates = Object.keys(dailyData['Time Series FX (Daily)']).sort().reverse();
          if (dates.length >= 2) {
            const prevClose = parseFloat(dailyData['Time Series FX (Daily)'][dates[1]]['4. close']);
            change = currentPrice - prevClose;
            changePercent = (change / prevClose) * 100;
          }
        }
      } catch (e) {
        console.error('Error fetching daily gold data:', e);
      }

      const result = {
        price: currentPrice,
        bidPrice: parseFloat(rate['8. Bid Price'] || currentPrice - 0.5),
        askPrice: parseFloat(rate['9. Ask Price'] || currentPrice + 0.5),
        change,
        changePercent,
        timestamp: new Date(rate['6. Last Refreshed']),
        source: 'AlphaVantage',
      };
      setCache(cacheKey, result);
      return result;
    }
    
    // Check for API limit message
    if (data['Note'] || data['Information']) {
      console.warn('AlphaVantage API limit reached:', data['Note'] || data['Information']);
    }
    
    throw new Error('Invalid response from AlphaVantage');
  } catch (error) {
    console.error('Error fetching gold price:', error);
    // Return fallback with warning
    return {
      price: 2650.00,
      bidPrice: 2649.50,
      askPrice: 2650.50,
      change: 0,
      changePercent: 0,
      timestamp: new Date(),
      isFallback: true,
      error: error.message,
    };
  }
}

/**
 * Fetch DXY (Dollar Index) data - LIVE
 */
export async function getDXYData() {
  const cacheKey = 'dxy_data';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // DXY is calculated from multiple currency pairs
    // EUR (57.6%), JPY (13.6%), GBP (11.9%), CAD (9.1%), SEK (4.2%), CHF (3.6%)
    const pairs = [
      { from: 'EUR', to: 'USD', weight: 0.576 },
      { from: 'USD', to: 'JPY', weight: 0.136 },
      { from: 'GBP', to: 'USD', weight: 0.119 },
      { from: 'USD', to: 'CAD', weight: 0.091 },
    ];

    // Fetch EUR/USD as primary indicator
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${API_KEY}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const eurUsd = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
      
      // Simplified DXY approximation based on EUR/USD
      // DXY ≈ 50.14348112 × (1/EURUSD)^0.576 × ... (simplified)
      const dxyApprox = 50.14348112 * Math.pow(1/eurUsd, 0.576) * 1.95;
      
      const result = {
        value: parseFloat(dxyApprox.toFixed(2)),
        change: 0,
        changePercent: 0,
        eurUsd,
        timestamp: new Date(),
        source: 'Calculated from EUR/USD',
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
 * Fetch forex pair data - LIVE
 */
export async function getForexRate(fromCurrency, toCurrency) {
  const cacheKey = `forex_${fromCurrency}_${toCurrency}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();

    if (data['Realtime Currency Exchange Rate']) {
      const rate = data['Realtime Currency Exchange Rate'];
      const result = {
        pair: `${fromCurrency}${toCurrency}`,
        rate: parseFloat(rate['5. Exchange Rate']),
        bidPrice: parseFloat(rate['8. Bid Price'] || rate['5. Exchange Rate']),
        askPrice: parseFloat(rate['9. Ask Price'] || rate['5. Exchange Rate']),
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
 * Fetch commodity price (Oil) - LIVE
 */
export async function getOilPrice() {
  const cacheKey = 'oil_price';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=WTI&interval=daily&apikey=${API_KEY}`;
    const response = await fetch(url, { cache: 'no-store' });
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
        source: 'AlphaVantage WTI',
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
 * Clear cache - force fresh data
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
