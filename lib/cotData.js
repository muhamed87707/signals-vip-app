/**
 * COT Data Service - CFTC Commitment of Traders
 * Requirements: 4.1, 4.3, 4.4
 */

// In-memory cache
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Default COT data (updated weekly on Fridays)
const DEFAULT_COT_DATA = {
  reportDate: new Date(),
  nonCommercialLong: 285000,
  nonCommercialShort: 45000,
  netPosition: 240000,
  managedMoneyLong: 195000,
  managedMoneyShort: 32000,
  historicHigh: 320000,
  historicLow: -50000,
};

/**
 * Fetch latest COT data for Gold
 */
export async function getLatestCOTData() {
  const cacheKey = 'cot_gold';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // In production, fetch from CFTC API or data provider
    // For now, return simulated data with some variation
    const variation = Math.random() * 10000 - 5000;
    
    const data = {
      ...DEFAULT_COT_DATA,
      reportDate: getLastFriday(),
      managedMoneyLong: Math.round(DEFAULT_COT_DATA.managedMoneyLong + variation),
      managedMoneyShort: Math.round(DEFAULT_COT_DATA.managedMoneyShort + variation * 0.2),
    };
    
    data.netPosition = data.managedMoneyLong - data.managedMoneyShort;
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching COT data:', error);
    return DEFAULT_COT_DATA;
  }
}

/**
 * Calculate net position from COT data
 */
export function calculateNetPosition(cotData) {
  if (!cotData) return 0;
  return cotData.managedMoneyLong - cotData.managedMoneyShort;
}

/**
 * Check if position is overcrowded
 */
export function isOvercrowded(cotData, threshold = 0.9) {
  if (!cotData || !cotData.historicHigh) return false;
  return cotData.managedMoneyLong >= cotData.historicHigh * threshold;
}

/**
 * Generate COT alert if needed
 */
export function generateCOTAlert(cotData) {
  if (!cotData) return null;

  if (isOvercrowded(cotData)) {
    return {
      type: 'overcrowded',
      message: 'Managed Money Longs approaching historic highs - Overcrowded Trade Alert',
      severity: 'high',
    };
  }

  const longPercentage = cotData.managedMoneyLong / (cotData.managedMoneyLong + cotData.managedMoneyShort);
  
  if (longPercentage > 0.85) {
    return {
      type: 'extreme_long',
      message: 'Extreme long positioning detected',
      severity: 'medium',
    };
  }

  if (longPercentage < 0.3) {
    return {
      type: 'extreme_short',
      message: 'Extreme short positioning - potential reversal',
      severity: 'medium',
    };
  }

  return null;
}

/**
 * Get last Friday date
 */
function getLastFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2;
  const lastFriday = new Date(today);
  lastFriday.setDate(today.getDate() - diff);
  return lastFriday;
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}

export default {
  getLatestCOTData,
  calculateNetPosition,
  isOvercrowded,
  generateCOTAlert,
  clearCache,
};
