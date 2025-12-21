/**
 * Inflation Impact Calculation Utilities
 * Requirements: 3.5
 */

/**
 * Determine impact of inflation data on Gold
 * @param {string} type - Type of inflation data: 'cpi', 'ppi', 'pce'
 * @param {number} value - Inflation value
 * @param {number} previous - Previous value (optional)
 * @returns {Object} Impact data with tag
 */
export function getInflationImpact(type, value, previous = null) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a valid number');
  }

  const validTypes = ['cpi', 'ppi', 'pce'];
  if (!validTypes.includes(type.toLowerCase())) {
    throw new Error(`Type must be one of: ${validTypes.join(', ')}`);
  }

  let impact;
  
  // Higher inflation is generally bullish for Gold
  if (type.toLowerCase() === 'cpi') {
    if (value > 3) {
      impact = 'Bullish';
    } else if (value < 2) {
      impact = 'Bearish';
    } else {
      impact = 'Neutral';
    }
  } else if (type.toLowerCase() === 'pce') {
    // PCE is Fed's preferred measure
    if (value > 2.5) {
      impact = 'Bullish';
    } else if (value < 1.5) {
      impact = 'Bearish';
    } else {
      impact = 'Neutral';
    }
  } else {
    // PPI - producer prices
    if (value > 4) {
      impact = 'Bullish';
    } else if (value < 1) {
      impact = 'Bearish';
    } else {
      impact = 'Neutral';
    }
  }

  const result = {
    type: type.toUpperCase(),
    value,
    impact,
  };

  // Add change data if previous value provided
  if (previous !== null && typeof previous === 'number') {
    result.change = value - previous;
    result.trend = value > previous ? 'rising' : value < previous ? 'falling' : 'stable';
  }

  return result;
}

/**
 * Validate inflation data structure
 * @param {Object} data - Inflation data object
 * @returns {boolean} Whether data is valid
 */
export function validateInflationData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['cpi', 'ppi', 'pce'];
  
  for (const field of requiredFields) {
    if (!data[field]) return false;
    if (typeof data[field].value !== 'number') return false;
    if (!['Bullish', 'Bearish', 'Neutral'].includes(data[field].impact)) return false;
  }

  return true;
}

/**
 * Create inflation data object with impact tags
 * @param {Object} rawData - Raw inflation values
 * @returns {Object} Formatted inflation data with impacts
 */
export function createInflationData(rawData) {
  return {
    cpi: getInflationImpact('cpi', rawData.cpi || 0),
    ppi: getInflationImpact('ppi', rawData.ppi || 0),
    pce: getInflationImpact('pce', rawData.pce || 0),
    timestamp: new Date(),
  };
}

export default {
  getInflationImpact,
  validateInflationData,
  createInflationData,
};
