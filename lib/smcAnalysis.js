/**
 * SMC (Smart Money Concepts) Analysis
 * Order Blocks and Fair Value Gaps Detection
 * Requirements: 7.2
 */

/**
 * Detect Order Blocks (OB)
 * @param {Array} candles - OHLC candle data
 * @param {number} lookback - Number of candles to analyze
 * @returns {Array} Order blocks
 */
export function detectOrderBlocks(candles, lookback = 50) {
  if (!candles || candles.length < lookback) return [];
  
  const orderBlocks = [];
  const recentCandles = candles.slice(-lookback);
  
  for (let i = 1; i < recentCandles.length - 1; i++) {
    const prev = recentCandles[i - 1];
    const current = recentCandles[i];
    const next = recentCandles[i + 1];
    
    const prevBullish = prev.close > prev.open;
    const currentBullish = current.close > current.open;
    const nextBullish = next.close > next.open;
    
    // Bullish Order Block: bearish candle followed by strong bullish move
    if (!prevBullish && currentBullish && nextBullish) {
      const moveStrength = (next.close - prev.low) / prev.low * 100;
      if (moveStrength > 0.5) {
        orderBlocks.push({
          type: 'bullish_ob',
          high: prev.high,
          low: prev.low,
          timestamp: prev.timestamp,
          strength: Math.min(100, moveStrength * 10),
          mitigated: false,
        });
      }
    }
    
    // Bearish Order Block: bullish candle followed by strong bearish move
    if (prevBullish && !currentBullish && !nextBullish) {
      const moveStrength = (prev.high - next.close) / prev.high * 100;
      if (moveStrength > 0.5) {
        orderBlocks.push({
          type: 'bearish_ob',
          high: prev.high,
          low: prev.low,
          timestamp: prev.timestamp,
          strength: Math.min(100, moveStrength * 10),
          mitigated: false,
        });
      }
    }
  }
  
  return orderBlocks;
}

/**
 * Detect Fair Value Gaps (FVG)
 * @param {Array} candles - OHLC candle data
 * @param {number} lookback - Number of candles to analyze
 * @returns {Array} Fair value gaps
 */
export function detectFVG(candles, lookback = 50) {
  if (!candles || candles.length < lookback) return [];
  
  const fvgs = [];
  const recentCandles = candles.slice(-lookback);
  
  for (let i = 2; i < recentCandles.length; i++) {
    const candle1 = recentCandles[i - 2];
    const candle2 = recentCandles[i - 1];
    const candle3 = recentCandles[i];
    
    // Bullish FVG: gap between candle1 high and candle3 low
    if (candle3.low > candle1.high) {
      const gapSize = candle3.low - candle1.high;
      const avgRange = (candle1.high - candle1.low + candle2.high - candle2.low + candle3.high - candle3.low) / 3;
      
      if (gapSize > avgRange * 0.1) {
        fvgs.push({
          type: 'bullish_fvg',
          high: candle3.low,
          low: candle1.high,
          timestamp: candle2.timestamp,
          filled: false,
          fillPercent: 0,
        });
      }
    }
    
    // Bearish FVG: gap between candle1 low and candle3 high
    if (candle3.high < candle1.low) {
      const gapSize = candle1.low - candle3.high;
      const avgRange = (candle1.high - candle1.low + candle2.high - candle2.low + candle3.high - candle3.low) / 3;
      
      if (gapSize > avgRange * 0.1) {
        fvgs.push({
          type: 'bearish_fvg',
          high: candle1.low,
          low: candle3.high,
          timestamp: candle2.timestamp,
          filled: false,
          fillPercent: 0,
        });
      }
    }
  }
  
  return fvgs;
}

/**
 * Get all SMC markers
 * @param {Array} candles - OHLC candle data
 * @returns {Object} All SMC markers
 */
export function getSMCMarkers(candles) {
  const orderBlocks = detectOrderBlocks(candles);
  const fvgs = detectFVG(candles);
  
  return {
    orderBlocks,
    fvgs,
    timestamp: new Date().toISOString(),
  };
}

export default {
  detectOrderBlocks,
  detectFVG,
  getSMCMarkers,
};
