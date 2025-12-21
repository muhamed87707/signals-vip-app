/**
 * Technical Analysis Service
 * Supply/Demand Zone Detection
 * Requirements: 7.1
 */

/**
 * Detect supply zones (resistance areas)
 * @param {Array} candles - OHLC candle data
 * @param {number} lookback - Number of candles to analyze
 * @returns {Array} Supply zones
 */
export function detectSupplyZones(candles, lookback = 50) {
  if (!candles || candles.length < lookback) return [];
  
  const zones = [];
  const recentCandles = candles.slice(-lookback);
  
  for (let i = 2; i < recentCandles.length - 2; i++) {
    const prev2 = recentCandles[i - 2];
    const prev1 = recentCandles[i - 1];
    const current = recentCandles[i];
    const next1 = recentCandles[i + 1];
    const next2 = recentCandles[i + 2];
    
    // Swing high detection
    if (current.high > prev1.high && current.high > prev2.high &&
        current.high > next1.high && current.high > next2.high) {
      zones.push({
        type: 'supply',
        high: current.high,
        low: Math.min(current.open, current.close),
        timestamp: current.timestamp,
        strength: calculateZoneStrength(current, recentCandles),
        tested: 0,
      });
    }
  }
  
  return mergeOverlappingZones(zones);
}

/**
 * Detect demand zones (support areas)
 * @param {Array} candles - OHLC candle data
 * @param {number} lookback - Number of candles to analyze
 * @returns {Array} Demand zones
 */
export function detectDemandZones(candles, lookback = 50) {
  if (!candles || candles.length < lookback) return [];
  
  const zones = [];
  const recentCandles = candles.slice(-lookback);
  
  for (let i = 2; i < recentCandles.length - 2; i++) {
    const prev2 = recentCandles[i - 2];
    const prev1 = recentCandles[i - 1];
    const current = recentCandles[i];
    const next1 = recentCandles[i + 1];
    const next2 = recentCandles[i + 2];
    
    // Swing low detection
    if (current.low < prev1.low && current.low < prev2.low &&
        current.low < next1.low && current.low < next2.low) {
      zones.push({
        type: 'demand',
        high: Math.max(current.open, current.close),
        low: current.low,
        timestamp: current.timestamp,
        strength: calculateZoneStrength(current, recentCandles),
        tested: 0,
      });
    }
  }
  
  return mergeOverlappingZones(zones);
}

/**
 * Calculate zone strength based on volume and price action
 */
function calculateZoneStrength(candle, allCandles) {
  const avgVolume = allCandles.reduce((sum, c) => sum + (c.volume || 0), 0) / allCandles.length;
  const volumeRatio = (candle.volume || avgVolume) / avgVolume;
  const bodySize = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low;
  const bodyRatio = range > 0 ? bodySize / range : 0;
  
  let strength = 50;
  if (volumeRatio > 1.5) strength += 20;
  if (bodyRatio > 0.6) strength += 15;
  if (bodyRatio < 0.3) strength += 10; // Doji/rejection
  
  return Math.min(100, Math.max(0, strength));
}

/**
 * Merge overlapping zones
 */
function mergeOverlappingZones(zones) {
  if (zones.length < 2) return zones;
  
  const sorted = [...zones].sort((a, b) => b.high - a.high);
  const merged = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.high >= last.low && current.type === last.type) {
      last.low = Math.min(last.low, current.low);
      last.strength = Math.max(last.strength, current.strength);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

/**
 * Get all technical levels
 * @param {Array} candles - OHLC candle data
 * @returns {Object} All technical levels
 */
export function getTechnicalLevels(candles) {
  const supplyZones = detectSupplyZones(candles);
  const demandZones = detectDemandZones(candles);
  
  return {
    supply: supplyZones,
    demand: demandZones,
    timestamp: new Date().toISOString(),
  };
}

export default {
  detectSupplyZones,
  detectDemandZones,
  getTechnicalLevels,
};
