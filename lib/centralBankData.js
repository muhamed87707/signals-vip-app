/**
 * Central Bank Gold Purchase Data Service
 * Requirements: 9.1, 9.2
 */

// Default central bank gold holdings data (based on World Gold Council data)
const DEFAULT_CB_DATA = {
  purchases: [
    { country: 'China', code: 'CN', flag: '🇨🇳', bank: 'PBoC', ytd: 225, monthly: 18, totalHoldings: 2264, rank: 6 },
    { country: 'Russia', code: 'RU', flag: '🇷🇺', bank: 'CBR', ytd: 85, monthly: 8, totalHoldings: 2333, rank: 5 },
    { country: 'Poland', code: 'PL', flag: '🇵🇱', bank: 'NBP', ytd: 45, monthly: 5, totalHoldings: 358, rank: 22 },
    { country: 'Turkey', code: 'TR', flag: '🇹🇷', bank: 'TCMB', ytd: 38, monthly: 3, totalHoldings: 540, rank: 11 },
    { country: 'India', code: 'IN', flag: '🇮🇳', bank: 'RBI', ytd: 32, monthly: 4, totalHoldings: 822, rank: 9 },
    { country: 'Czech Republic', code: 'CZ', flag: '🇨🇿', bank: 'CNB', ytd: 28, monthly: 3, totalHoldings: 42, rank: 45 },
    { country: 'Singapore', code: 'SG', flag: '🇸🇬', bank: 'MAS', ytd: 15, monthly: 2, totalHoldings: 230, rank: 28 },
    { country: 'Qatar', code: 'QA', flag: '🇶🇦', bank: 'QCB', ytd: 12, monthly: 1, totalHoldings: 102, rank: 38 },
  ],
  topHolders: [
    { country: 'United States', code: 'US', flag: '🇺🇸', bank: 'Fed', totalHoldings: 8133, percentReserves: 69.1 },
    { country: 'Germany', code: 'DE', flag: '🇩🇪', bank: 'Bundesbank', totalHoldings: 3352, percentReserves: 68.7 },
    { country: 'Italy', code: 'IT', flag: '🇮🇹', bank: 'Banca d\'Italia', totalHoldings: 2452, percentReserves: 65.4 },
    { country: 'France', code: 'FR', flag: '🇫🇷', bank: 'Banque de France', totalHoldings: 2437, percentReserves: 66.1 },
    { country: 'Russia', code: 'RU', flag: '🇷🇺', bank: 'CBR', totalHoldings: 2333, percentReserves: 25.8 },
  ],
  globalStats: {
    totalCBHoldings: 36699,
    ytdNetPurchases: 480,
    avgMonthlyPurchases: 45,
    buyingCountries: 12,
    sellingCountries: 3,
  },
  lastUpdated: new Date().toISOString(),
};

/**
 * Get central bank gold purchase data
 * @returns {Object} Central bank data
 */
export function getCentralBankData() {
  return {
    ...DEFAULT_CB_DATA,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get top buyers by YTD purchases
 * @param {number} limit - Number of results
 * @returns {Array} Top buyers
 */
export function getTopBuyers(limit = 5) {
  return DEFAULT_CB_DATA.purchases
    .sort((a, b) => b.ytd - a.ytd)
    .slice(0, limit);
}

/**
 * Get top holders by total holdings
 * @param {number} limit - Number of results
 * @returns {Array} Top holders
 */
export function getTopHolders(limit = 5) {
  return DEFAULT_CB_DATA.topHolders.slice(0, limit);
}

/**
 * Calculate purchase trend
 * @param {string} countryCode - Country code
 * @returns {Object} Trend data
 */
export function getPurchaseTrend(countryCode) {
  const country = DEFAULT_CB_DATA.purchases.find(p => p.code === countryCode);
  if (!country) return null;

  const avgMonthly = country.ytd / 12;
  const trend = country.monthly > avgMonthly ? 'increasing' : country.monthly < avgMonthly ? 'decreasing' : 'stable';

  return {
    country: country.country,
    trend,
    monthlyAvg: Math.round(avgMonthly * 10) / 10,
    currentMonthly: country.monthly,
    ytd: country.ytd,
  };
}

export default {
  getCentralBankData,
  getTopBuyers,
  getTopHolders,
  getPurchaseTrend,
};
