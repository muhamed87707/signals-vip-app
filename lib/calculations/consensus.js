/**
 * Consensus Price Calculation Utilities
 * Requirements: 2.3
 */

/**
 * Calculate consensus price from bank forecasts
 * @param {Array} forecasts - Array of forecast objects with forecastPrice
 * @returns {number|null} Consensus price (arithmetic mean) or null if empty
 */
export function calculateConsensusPrice(forecasts) {
  if (!Array.isArray(forecasts) || forecasts.length === 0) {
    return null;
  }

  const validForecasts = forecasts.filter(
    f => f && typeof f.forecastPrice === 'number' && !isNaN(f.forecastPrice)
  );

  if (validForecasts.length === 0) {
    return null;
  }

  const sum = validForecasts.reduce((acc, f) => acc + f.forecastPrice, 0);
  return sum / validForecasts.length;
}

/**
 * Validate forecast object has required fields
 * @param {Object} forecast - Forecast object
 * @returns {boolean} Whether forecast is valid
 */
export function validateForecast(forecast) {
  if (!forecast || typeof forecast !== 'object') {
    return false;
  }

  const requiredFields = ['bankName', 'forecastPrice', 'timeframe', 'analystLogic'];
  
  for (const field of requiredFields) {
    if (forecast[field] === undefined || forecast[field] === null) {
      return false;
    }
  }

  if (typeof forecast.forecastPrice !== 'number' || forecast.forecastPrice < 0) {
    return false;
  }

  return true;
}

/**
 * Format forecast for display
 * @param {Object} forecast - Forecast object
 * @returns {Object} Formatted forecast
 */
export function formatForecast(forecast) {
  return {
    bankName: forecast.bankName,
    forecastPrice: forecast.forecastPrice,
    formattedPrice: `$${forecast.forecastPrice.toLocaleString()}`,
    timeframe: forecast.timeframe,
    analystLogic: forecast.analystLogic,
  };
}

export default {
  calculateConsensusPrice,
  validateForecast,
  formatForecast,
};
