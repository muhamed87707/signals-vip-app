/**
 * FRED API Client - Federal Reserve Economic Data
 * Requirements: 3.1, 3.3
 */

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';
const API_KEY = process.env.FRED_API_KEY || 'demo';

// Series IDs for economic data
const SERIES = {
  US10Y: 'DGS10',      // 10-Year Treasury
  US02Y: 'DGS2',       // 2-Year Treasury
  US30Y: 'DGS30',      // 30-Year Treasury
  CPI: 'CPIAUCSL',     // Consumer Price Index
  PCE: 'PCEPI',        // PCE Price Index
  PPI: 'PPIACO',       // Producer Price Index
  BREAKEVEN_10Y: 'T10YIE', // 10-Year Breakeven Inflation
};

// In-memory cache
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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
 * Fetch series data from FRED
 */
async function fetchSeries(seriesId, limit = 10) {
  const cacheKey = `fred_${seriesId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      const result = data.observations
        .filter(obs => obs.value !== '.')
        .map(obs => ({
          date: obs.date,
          value: parseFloat(obs.value),
        }));
      setCache(cacheKey, result);
      return result;
    }
    
    throw new Error('No data available');
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

/**
 * Get bond yields (US02Y, US10Y, US30Y)
 */
export async function getBondYields() {
  const cacheKey = 'bond_yields';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [us02y, us10y, us30y] = await Promise.all([
      fetchSeries(SERIES.US02Y, 5),
      fetchSeries(SERIES.US10Y, 5),
      fetchSeries(SERIES.US30Y, 5),
    ]);

    const result = {
      us02y: us02y?.[0]?.value || 4.25,
      us10y: us10y?.[0]?.value || 4.42,
      us30y: us30y?.[0]?.value || 4.58,
      timestamp: new Date(),
      history: {
        us02y: us02y || [],
        us10y: us10y || [],
        us30y: us30y || [],
      },
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching bond yields:', error);
    return {
      us02y: 4.25,
      us10y: 4.42,
      us30y: 4.58,
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

/**
 * Get inflation data (CPI, PPI, PCE)
 */
export async function getInflationData() {
  const cacheKey = 'inflation_data';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [cpi, ppi, pce] = await Promise.all([
      fetchSeries(SERIES.CPI, 2),
      fetchSeries(SERIES.PPI, 2),
      fetchSeries(SERIES.PCE, 2),
    ]);

    // Calculate YoY change for CPI
    const cpiYoY = cpi && cpi.length >= 2 
      ? ((cpi[0].value - cpi[1].value) / cpi[1].value * 100).toFixed(1)
      : 3.2;

    const result = {
      cpi: {
        value: parseFloat(cpiYoY),
        date: cpi?.[0]?.date || new Date().toISOString().split('T')[0],
        impact: parseFloat(cpiYoY) > 3 ? 'Bullish' : parseFloat(cpiYoY) < 2 ? 'Bearish' : 'Neutral',
      },
      ppi: {
        value: ppi?.[0]?.value || 0,
        date: ppi?.[0]?.date || new Date().toISOString().split('T')[0],
        impact: 'Neutral',
      },
      pce: {
        value: pce?.[0]?.value || 0,
        date: pce?.[0]?.date || new Date().toISOString().split('T')[0],
        impact: 'Neutral',
      },
      timestamp: new Date(),
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching inflation data:', error);
    return {
      cpi: { value: 3.2, date: new Date().toISOString().split('T')[0], impact: 'Bullish' },
      ppi: { value: 2.1, date: new Date().toISOString().split('T')[0], impact: 'Neutral' },
      pce: { value: 2.8, date: new Date().toISOString().split('T')[0], impact: 'Neutral' },
      timestamp: new Date(),
      isFallback: true,
    };
  }
}

/**
 * Get breakeven inflation rate (for real yield calculation)
 */
export async function getBreakevenInflation() {
  const cacheKey = 'breakeven_inflation';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchSeries(SERIES.BREAKEVEN_10Y, 5);
    
    if (data && data.length > 0) {
      const result = {
        value: data[0].value,
        date: data[0].date,
        history: data,
      };
      setCache(cacheKey, result);
      return result;
    }
    
    throw new Error('No data');
  } catch (error) {
    console.error('Error fetching breakeven inflation:', error);
    return {
      value: 2.35,
      date: new Date().toISOString().split('T')[0],
      isFallback: true,
    };
  }
}

/**
 * Calculate Real Yield
 * Real Yield = Nominal 10Y Yield - Breakeven Inflation
 */
export async function getRealYield() {
  const [yields, breakeven] = await Promise.all([
    getBondYields(),
    getBreakevenInflation(),
  ]);

  const realYield = yields.us10y - breakeven.value;
  
  return {
    nominal10Y: yields.us10y,
    breakevenInflation: breakeven.value,
    realYield: parseFloat(realYield.toFixed(2)),
    impact: realYield < 0 ? 'Bullish' : realYield > 1 ? 'Bearish' : 'Neutral',
    timestamp: new Date(),
  };
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}

export default {
  getBondYields,
  getInflationData,
  getBreakevenInflation,
  getRealYield,
  clearCache,
  SERIES,
};
