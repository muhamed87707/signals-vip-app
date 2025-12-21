/**
 * Correlation Calculation Utilities
 * Requirements: 3.2, 6.1-6.5
 */

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param {number[]} x - First data series
 * @param {number[]} y - Second data series
 * @returns {number} Correlation coefficient between -1 and 1
 */
export function calculateCorrelation(x, y) {
  if (!Array.isArray(x) || !Array.isArray(y)) {
    throw new Error('Both inputs must be arrays');
  }
  
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }
  
  if (x.length < 2) {
    throw new Error('Arrays must have at least 2 elements');
  }

  const n = x.length;
  
  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let varX = 0;
  let varY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    covariance += diffX * diffY;
    varX += diffX * diffX;
    varY += diffY * diffY;
  }
  
  // Handle edge case where variance is 0
  if (varX === 0 || varY === 0) {
    return 0;
  }
  
  const correlation = covariance / Math.sqrt(varX * varY);
  
  // Clamp to [-1, 1] to handle floating point errors
  return Math.max(-1, Math.min(1, correlation));
}

/**
 * Calculate correlation matrix for multiple assets
 * @param {Object} data - Object with asset names as keys and price arrays as values
 * @returns {Object} Correlation matrix
 */
export function calculateCorrelationMatrix(data) {
  const assets = Object.keys(data);
  const matrix = {};
  
  for (const asset1 of assets) {
    matrix[asset1] = {};
    for (const asset2 of assets) {
      if (asset1 === asset2) {
        matrix[asset1][asset2] = 1;
      } else {
        matrix[asset1][asset2] = calculateCorrelation(data[asset1], data[asset2]);
      }
    }
  }
  
  return matrix;
}

/**
 * Detect significant correlation changes
 * @param {number} oldCorr - Previous correlation value
 * @param {number} newCorr - New correlation value
 * @param {number} threshold - Change threshold (default 0.1)
 * @returns {Object} Change detection result
 */
export function detectCorrelationChange(oldCorr, newCorr, threshold = 0.1) {
  const change = newCorr - oldCorr;
  const absChange = Math.abs(change);
  
  return {
    changed: absChange >= threshold,
    change,
    absChange,
    direction: change > 0 ? 'strengthened' : change < 0 ? 'weakened' : 'unchanged',
  };
}

/**
 * Get correlation strength label
 * @param {number} correlation - Correlation coefficient
 * @returns {string} Strength label
 */
export function getCorrelationStrength(correlation) {
  const abs = Math.abs(correlation);
  if (abs >= 0.8) return 'very-strong';
  if (abs >= 0.6) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'negligible';
}

/**
 * Get correlation color for heatmap
 * @param {number} correlation - Correlation coefficient
 * @returns {string} CSS color value
 */
export function getCorrelationColor(correlation) {
  if (correlation >= 0.8) return 'rgba(0, 255, 136, 0.9)';
  if (correlation >= 0.6) return 'rgba(0, 255, 136, 0.7)';
  if (correlation >= 0.4) return 'rgba(0, 255, 136, 0.5)';
  if (correlation >= 0.2) return 'rgba(0, 255, 136, 0.3)';
  if (correlation > -0.2) return 'rgba(128, 128, 128, 0.3)';
  if (correlation > -0.4) return 'rgba(255, 68, 68, 0.3)';
  if (correlation > -0.6) return 'rgba(255, 68, 68, 0.5)';
  if (correlation > -0.8) return 'rgba(255, 68, 68, 0.7)';
  return 'rgba(255, 68, 68, 0.9)';
}

/**
 * Calculate full correlation matrix with metadata
 * @param {Object} currentData - Current price data by asset
 * @param {Object} previousData - Previous period price data (optional)
 * @param {number} changeThreshold - Threshold for highlighting changes
 * @returns {Object} Full matrix with metadata
 */
export function calculateFullCorrelationMatrix(currentData, previousData = null, changeThreshold = 0.1) {
  const assets = Object.keys(currentData);
  const currentMatrix = calculateCorrelationMatrix(currentData);
  const previousMatrix = previousData ? calculateCorrelationMatrix(previousData) : null;
  
  const result = {
    assets,
    matrix: {},
    changes: [],
    timestamp: new Date().toISOString(),
  };
  
  for (const asset1 of assets) {
    result.matrix[asset1] = {};
    for (const asset2 of assets) {
      const current = currentMatrix[asset1][asset2];
      const previous = previousMatrix ? previousMatrix[asset1][asset2] : null;
      
      const cell = {
        value: current,
        strength: getCorrelationStrength(current),
        color: getCorrelationColor(current),
      };
      
      if (previous !== null) {
        const changeInfo = detectCorrelationChange(previous, current, changeThreshold);
        cell.previous = previous;
        cell.change = changeInfo.change;
        cell.hasSignificantChange = changeInfo.changed;
        
        if (changeInfo.changed && asset1 !== asset2) {
          result.changes.push({
            asset1,
            asset2,
            previous,
            current,
            change: changeInfo.change,
            direction: changeInfo.direction,
          });
        }
      }
      
      result.matrix[asset1][asset2] = cell;
    }
  }
  
  return result;
}

/**
 * Default assets for gold correlation analysis
 */
export const DEFAULT_CORRELATION_ASSETS = [
  { id: 'XAUUSD', name: 'Gold', symbol: '🥇' },
  { id: 'DXY', name: 'Dollar Index', symbol: '💵' },
  { id: 'US10Y', name: '10Y Treasury', symbol: '📈' },
  { id: 'XAGUSD', name: 'Silver', symbol: '🥈' },
  { id: 'AUDUSD', name: 'AUD/USD', symbol: '🇦🇺' },
  { id: 'USDJPY', name: 'USD/JPY', symbol: '🇯🇵' },
];

export default {
  calculateCorrelation,
  calculateCorrelationMatrix,
  detectCorrelationChange,
  getCorrelationStrength,
  getCorrelationColor,
  calculateFullCorrelationMatrix,
  DEFAULT_CORRELATION_ASSETS,
};
