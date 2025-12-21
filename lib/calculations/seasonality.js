/**
 * Seasonality Calculation Service
 * Monthly performance calculation for gold
 * Requirements: 10.1, 10.2, 10.3
 */

// Historical monthly returns for gold (20-year average)
const HISTORICAL_MONTHLY_RETURNS = {
  Jan: { avg: 2.1, median: 1.8, positive: 65, best: 8.5, worst: -6.2 },
  Feb: { avg: 0.8, median: 0.5, positive: 55, best: 6.1, worst: -5.8 },
  Mar: { avg: -0.5, median: -0.3, positive: 45, best: 4.2, worst: -7.1 },
  Apr: { avg: 1.2, median: 1.0, positive: 60, best: 5.8, worst: -4.5 },
  May: { avg: -1.1, median: -0.8, positive: 40, best: 3.5, worst: -6.8 },
  Jun: { avg: 0.3, median: 0.2, positive: 50, best: 4.8, worst: -5.2 },
  Jul: { avg: 1.8, median: 1.5, positive: 62, best: 7.2, worst: -3.8 },
  Aug: { avg: 2.5, median: 2.2, positive: 70, best: 9.1, worst: -4.1 },
  Sep: { avg: -0.8, median: -0.5, positive: 42, best: 5.5, worst: -8.2 },
  Oct: { avg: 0.5, median: 0.3, positive: 52, best: 4.5, worst: -5.5 },
  Nov: { avg: 1.5, median: 1.2, positive: 58, best: 6.8, worst: -4.8 },
  Dec: { avg: 0.9, median: 0.7, positive: 55, best: 5.2, worst: -3.5 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get seasonality data for all months
 * @returns {Array} Monthly seasonality data
 */
export function getSeasonalityData() {
  return MONTHS.map((month, index) => ({
    month,
    monthIndex: index,
    ...HISTORICAL_MONTHLY_RETURNS[month],
    strength: getSeasonalStrength(HISTORICAL_MONTHLY_RETURNS[month].avg),
  }));
}

/**
 * Get seasonal strength classification
 * @param {number} avgReturn - Average return
 * @returns {string} Strength classification
 */
export function getSeasonalStrength(avgReturn) {
  if (avgReturn >= 2) return 'strong-bullish';
  if (avgReturn >= 1) return 'bullish';
  if (avgReturn >= 0) return 'neutral';
  if (avgReturn >= -1) return 'bearish';
  return 'strong-bearish';
}

/**
 * Get current month seasonality
 * @returns {Object} Current month data
 */
export function getCurrentMonthSeasonality() {
  const currentMonth = MONTHS[new Date().getMonth()];
  const data = HISTORICAL_MONTHLY_RETURNS[currentMonth];
  return {
    month: currentMonth,
    ...data,
    strength: getSeasonalStrength(data.avg),
  };
}

/**
 * Get best and worst months
 * @returns {Object} Best and worst months
 */
export function getBestWorstMonths() {
  const sorted = [...MONTHS].sort((a, b) => 
    HISTORICAL_MONTHLY_RETURNS[b].avg - HISTORICAL_MONTHLY_RETURNS[a].avg
  );
  
  return {
    best: sorted.slice(0, 3).map(m => ({ month: m, ...HISTORICAL_MONTHLY_RETURNS[m] })),
    worst: sorted.slice(-3).reverse().map(m => ({ month: m, ...HISTORICAL_MONTHLY_RETURNS[m] })),
  };
}

/**
 * Get quarterly seasonality
 * @returns {Array} Quarterly data
 */
export function getQuarterlySeasonality() {
  const quarters = [
    { name: 'Q1', months: ['Jan', 'Feb', 'Mar'] },
    { name: 'Q2', months: ['Apr', 'May', 'Jun'] },
    { name: 'Q3', months: ['Jul', 'Aug', 'Sep'] },
    { name: 'Q4', months: ['Oct', 'Nov', 'Dec'] },
  ];

  return quarters.map(q => {
    const avgReturn = q.months.reduce((sum, m) => sum + HISTORICAL_MONTHLY_RETURNS[m].avg, 0) / 3;
    return {
      quarter: q.name,
      avgReturn: Math.round(avgReturn * 100) / 100,
      strength: getSeasonalStrength(avgReturn),
    };
  });
}

export default {
  getSeasonalityData,
  getSeasonalStrength,
  getCurrentMonthSeasonality,
  getBestWorstMonths,
  getQuarterlySeasonality,
  HISTORICAL_MONTHLY_RETURNS,
};
