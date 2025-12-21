/**
 * Yield Calculation Utilities
 * Requirements: 3.2, 3.4
 */

/**
 * Calculate Real Yield
 * Real Yield = Nominal 10Y Yield - Inflation Rate (or Breakeven)
 * @param {number} nominal10Y - Nominal 10-Year Treasury Yield
 * @param {number} inflationRate - Inflation rate or breakeven inflation
 * @returns {number} Real yield value
 */
export function calculateRealYield(nominal10Y, inflationRate) {
  if (typeof nominal10Y !== 'number' || typeof inflationRate !== 'number') {
    throw new Error('Both inputs must be numbers');
  }
  
  if (isNaN(nominal10Y) || isNaN(inflationRate)) {
    throw new Error('Inputs cannot be NaN');
  }
  
  return nominal10Y - inflationRate;
}

/**
 * Determine impact of real yield on Gold
 * Negative real yields are bullish for Gold
 * @param {number} realYield - Calculated real yield
 * @returns {string} Impact: 'Bullish', 'Bearish', or 'Neutral'
 */
export function getRealYieldImpact(realYield) {
  if (realYield < 0) {
    return 'Bullish';
  } else if (realYield > 1) {
    return 'Bearish';
  }
  return 'Neutral';
}

/**
 * Calculate yield curve spread
 * @param {number} longYield - Long-term yield (e.g., 10Y)
 * @param {number} shortYield - Short-term yield (e.g., 2Y)
 * @returns {Object} Spread data with inversion status
 */
export function calculateYieldSpread(longYield, shortYield) {
  const spread = longYield - shortYield;
  
  return {
    spread: parseFloat(spread.toFixed(2)),
    inverted: spread < 0,
    status: spread < 0 ? 'Inverted' : spread < 0.5 ? 'Flat' : 'Normal',
  };
}

/**
 * Calculate yield change
 * @param {number} currentYield - Current yield value
 * @param {number} previousYield - Previous yield value
 * @returns {Object} Change data
 */
export function calculateYieldChange(currentYield, previousYield) {
  const change = currentYield - previousYield;
  const changePercent = previousYield !== 0 
    ? (change / previousYield) * 100 
    : 0;
  
  return {
    change: parseFloat(change.toFixed(3)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged',
  };
}

/**
 * Format yield data for display
 * @param {Object} yieldData - Raw yield data
 * @returns {Object} Formatted yield data
 */
export function formatYieldData(yieldData) {
  return {
    us02y: {
      value: yieldData.us02y,
      formatted: `${yieldData.us02y.toFixed(2)}%`,
      label: '2-Year Treasury',
    },
    us10y: {
      value: yieldData.us10y,
      formatted: `${yieldData.us10y.toFixed(2)}%`,
      label: '10-Year Treasury',
    },
    us30y: {
      value: yieldData.us30y,
      formatted: `${yieldData.us30y.toFixed(2)}%`,
      label: '30-Year Treasury',
    },
    spread2s10s: calculateYieldSpread(yieldData.us10y, yieldData.us02y),
  };
}

export default {
  calculateRealYield,
  getRealYieldImpact,
  calculateYieldSpread,
  calculateYieldChange,
  formatYieldData,
};
