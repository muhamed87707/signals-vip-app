/**
 * Market Data Service - Multiple API Sources for LIVE Data
 * Requirements: 3.1, 3.3
 * Uses multiple free APIs for accurate real-time data
 */

// Cache with 30 second TTL for live trading
const cache = new Map();
const CACHE_TTL = 30 * 1000;

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
 * Fetch Gold (XAUUSD) price - Using multiple sources
 */
export async function getGoldPrice() {
  const cacheKey = 'gold_price';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Try multiple APIs in order of reliability
  const apis = [
    fetchGoldFromMetalsAPI,
    fetchGoldFromGoldAPI,
    fetchGoldFromExchangeRate,
  ];

  for (const fetchFn of apis) {
    try {
      const result = await fetchFn();
      if (result && result.price > 0) {
        setCache(cacheKey, result);
        return result;
      }
    } catch (e) {
      console.error(`Gold API failed:`, e.message);
    }
  }

  // Fallback - but mark it clearly
  return {
    price: 2650.00,
    change: 0,
    changePercent: 0,
    timestamp: new Date(),
    isFallback: true,
    warning: 'Using fallback data - APIs unavailable',
  };
}

// Primary: Free Gold Price API
async function fetchGoldFromMetalsAPI() {
  const response = await fetch('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=XAU&currencies=USD', {
    cache: 'no-store',
  });
  const data = await response.json();
  
  if (data.rates && data.rates.USD) {
    const price = 1 / data.rates.USD; // XAU/USD
    return {
      price: parseFloat(price.toFixed(2)),
      change: 0,
      changePercent: 0,
      timestamp: new Date(),
      source: 'MetalPriceAPI',
    };
  }
  throw new Error('Invalid MetalPriceAPI response');
}

// Secondary: Gold-API.io (free tier)
async function fetchGoldFromGoldAPI() {
  // Using a public endpoint
  const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    },
  });
  const data = await response.json();
  
  if (data.items && data.items[0]) {
    const item = data.items[0];
    const price = item.xauPrice;
    const prevPrice = item.xauClose || price;
    const change = price - prevPrice;
    
    return {
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / prevPrice) * 100).toFixed(2)),
      timestamp: new Date(item.date),
      source: 'GoldPrice.org',
    };
  }
  throw new Error('Invalid GoldPrice response');
}

// Tertiary: Exchange Rate API
async function fetchGoldFromExchangeRate() {
  const response = await fetch('https://api.exchangerate.host/latest?base=XAU&symbols=USD', {
    cache: 'no-store',
  });
  const data = await response.json();
  
  if (data.rates && data.rates.USD) {
    return {
      price: parseFloat(data.rates.USD.toFixed(2)),
      change: 0,
      changePercent: 0,
      timestamp: new Date(data.date),
      source: 'ExchangeRate.host',
    };
  }
  throw new Error('Invalid ExchangeRate response');
}

/**
 * Fetch DXY (Dollar Index) - Using EUR/USD as proxy
 */
export async function getDXYData() {
  const cacheKey = 'dxy_data';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Use Frankfurter API (free, reliable)
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,JPY,GBP,CAD,SEK,CHF', {
      cache: 'no-store',
    });
    const data = await response.json();

    if (data.rates) {
      // Calculate DXY approximation
      // DXY = 50.14348112 × EURUSD^(-0.576) × USDJPY^(0.136) × GBPUSD^(-0.119) × USDCAD^(0.091) × USDSEK^(0.042) × USDCHF^(0.036)
      const eurUsd = 1 / data.rates.EUR;
      const usdJpy = data.rates.JPY;
      const gbpUsd = 1 / data.rates.GBP;
      const usdCad = data.rates.CAD;
      const usdSek = data.rates.SEK;
      const usdChf = data.rates.CHF;

      const dxy = 50.14348112 * 
        Math.pow(eurUsd, -0.576) * 
        Math.pow(usdJpy, 0.136) * 
        Math.pow(gbpUsd, -0.119) * 
        Math.pow(usdCad, 0.091) * 
        Math.pow(usdSek, 0.042) * 
        Math.pow(usdChf, 0.036);

      const result = {
        value: parseFloat(dxy.toFixed(2)),
        change: 0,
        changePercent: 0,
        eurUsd: parseFloat(eurUsd.toFixed(5)),
        timestamp: new Date(data.date),
        source: 'Frankfurter API',
      };
      setCache(cacheKey, result);
      return result;
    }
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Error fetching DXY:', error);
    return {
      value: 104.25,
      change: 0,
      changePercent: 0,
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
    const response = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`, {
      cache: 'no-store',
    });
    const data = await response.json();

    if (data.rates && data.rates[toCurrency]) {
      const result = {
        pair: `${fromCurrency}${toCurrency}`,
        rate: data.rates[toCurrency],
        timestamp: new Date(data.date),
        source: 'Frankfurter API',
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
 * Fetch Oil (WTI) price
 */
export async function getOilPrice() {
  const cacheKey = 'oil_price';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Try FRED API for WTI
    const fredKey = process.env.FRED_API_KEY;
    if (fredKey) {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=DCOILWTICO&api_key=${fredKey}&file_type=json&limit=2&sort_order=desc`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (data.observations && data.observations.length >= 2) {
        const latest = parseFloat(data.observations[0].value);
        const previous = parseFloat(data.observations[1].value);
        const change = latest - previous;

        const result = {
          price: latest,
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(((change / previous) * 100).toFixed(2)),
          timestamp: new Date(data.observations[0].date),
          source: 'FRED API',
        };
        setCache(cacheKey, result);
        return result;
      }
    }
    throw new Error('FRED API unavailable');
  } catch (error) {
    console.error('Error fetching oil price:', error);
    return {
      price: 71.45,
      change: 0,
      changePercent: 0,
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

/**
 * Fetch Treasury Yield (US 10Y)
 */
export async function getTreasuryYield() {
  try {
    const fredKey = process.env.FRED_API_KEY;
    if (fredKey) {
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${fredKey}&file_type=json&limit=2&sort_order=desc`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (data.observations && data.observations.length >= 2) {
        const latest = parseFloat(data.observations[0].value);
        const previous = parseFloat(data.observations[1].value);

        return {
          value: latest,
          change: parseFloat((latest - previous).toFixed(2)),
          timestamp: new Date(data.observations[0].date),
          source: 'FRED API',
        };
      }
    }
    throw new Error('FRED API unavailable');
  } catch (error) {
    console.error('Error fetching treasury yield:', error);
    return {
      value: 4.42,
      change: 0,
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

export function clearCache() {
  cache.clear();
}

export default {
  getGoldPrice,
  getDXYData,
  getForexRate,
  getOilPrice,
  getTreasuryYield,
  clearCache,
};
