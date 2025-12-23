/**
 * Technical Analyzer - المحلل الفني
 * Calculates technical indicators and detects patterns
 */

export class TechnicalAnalyzer {
  constructor(config = {}) {
    this.config = {
      emaPeriods: [9, 21, 50, 100, 200],
      rsiPeriod: 14,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      bbPeriod: 20,
      bbStdDev: 2,
      atrPeriod: 14,
      ...config,
    };
  }

  /**
   * Perform full technical analysis
   */
  async analyze(marketData) {
    const candles = marketData.H1?.candles || [];
    
    if (candles.length < 200) {
      return this.getEmptyAnalysis();
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    // Calculate indicators
    const emas = this.calculateEMAs(closes);
    const rsi = this.calculateRSI(closes, this.config.rsiPeriod);
    const macd = this.calculateMACD(closes);
    const bb = this.calculateBollingerBands(closes);
    const atr = this.calculateATR(candles, this.config.atrPeriod);

    // Detect patterns
    const candlePatterns = this.detectCandlePatterns(candles);
    const divergences = this.detectDivergences(candles, rsi);

    // Determine trend
    const trend = this.analyzeTrend(closes, emas);

    // Determine bias
    const bias = this.determineBias(trend, rsi, macd);

    return {
      trend,
      momentum: {
        rsi: rsi[rsi.length - 1],
        macd: macd,
        aligned: this.isMomentumAligned(rsi, macd, trend.direction),
      },
      volatility: {
        atr: atr[atr.length - 1],
        bb: bb,
        squeeze: this.detectBBSqueeze(bb),
      },
      indicators: {
        emas,
        rsi: rsi[rsi.length - 1],
        macd,
        bb,
        atr: atr[atr.length - 1],
      },
      patterns: candlePatterns,
      divergences,
      fibonacci: this.autoFibonacci(candles),
      score: this.calculateScore(trend, rsi, macd, candlePatterns),
      bias,
    };
  }

  /**
   * Calculate EMAs for multiple periods
   */
  calculateEMAs(closes) {
    const result = {};
    for (const period of this.config.emaPeriods) {
      result[`ema${period}`] = this.calculateEMA(closes, period);
    }
    return result;
  }

  /**
   * Calculate EMA
   */
  calculateEMA(data, period) {
    if (data.length < period) return [];
    
    const k = 2 / (period + 1);
    const ema = [data.slice(0, period).reduce((a, b) => a + b, 0) / period];
    
    for (let i = period; i < data.length; i++) {
      ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
    }
    
    return ema;
  }

  /**
   * Calculate RSI
   */
  calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return [];
    
    const changes = [];
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }

    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    const rsi = [];
    
    for (let i = period; i < changes.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  /**
   * Calculate MACD
   */
  calculateMACD(closes) {
    const emaFast = this.calculateEMA(closes, this.config.macdFast);
    const emaSlow = this.calculateEMA(closes, this.config.macdSlow);
    
    if (emaFast.length === 0 || emaSlow.length === 0) {
      return { line: 0, signal: 0, histogram: 0 };
    }

    const macdLine = [];
    const offset = emaSlow.length - emaFast.length;
    
    for (let i = 0; i < emaSlow.length; i++) {
      const fastIdx = i - offset;
      if (fastIdx >= 0 && fastIdx < emaFast.length) {
        macdLine.push(emaFast[fastIdx] - emaSlow[i]);
      }
    }

    const signalLine = this.calculateEMA(macdLine, this.config.macdSignal);
    
    const lastMACD = macdLine[macdLine.length - 1] || 0;
    const lastSignal = signalLine[signalLine.length - 1] || 0;

    return {
      line: lastMACD,
      signal: lastSignal,
      histogram: lastMACD - lastSignal,
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollingerBands(closes) {
    const period = this.config.bbPeriod;
    const stdDev = this.config.bbStdDev;
    
    if (closes.length < period) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    const slice = closes.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev),
    };
  }

  /**
   * Calculate ATR
   */
  calculateATR(candles, period = 14) {
    if (candles.length < period + 1) return [];
    
    const tr = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      tr.push(Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      ));
    }

    const atr = [tr.slice(0, period).reduce((a, b) => a + b, 0) / period];
    
    for (let i = period; i < tr.length; i++) {
      atr.push((atr[atr.length - 1] * (period - 1) + tr[i]) / period);
    }

    return atr;
  }

  /**
   * Analyze trend
   */
  analyzeTrend(closes, emas) {
    const currentPrice = closes[closes.length - 1];
    const ema9 = emas.ema9?.[emas.ema9.length - 1];
    const ema21 = emas.ema21?.[emas.ema21.length - 1];
    const ema50 = emas.ema50?.[emas.ema50.length - 1];
    const ema200 = emas.ema200?.[emas.ema200.length - 1];

    let bullishCount = 0;
    let bearishCount = 0;

    // Price vs EMAs
    if (currentPrice > ema9) bullishCount++; else bearishCount++;
    if (currentPrice > ema21) bullishCount++; else bearishCount++;
    if (currentPrice > ema50) bullishCount++; else bearishCount++;
    if (currentPrice > ema200) bullishCount++; else bearishCount++;

    // EMA alignment
    if (ema9 > ema21 && ema21 > ema50) bullishCount += 2;
    if (ema9 < ema21 && ema21 < ema50) bearishCount += 2;

    const strength = Math.abs(bullishCount - bearishCount) / 6 * 100;
    
    let direction = 'neutral';
    if (bullishCount > bearishCount + 1) direction = 'bullish';
    if (bearishCount > bullishCount + 1) direction = 'bearish';

    return {
      direction,
      strength: Math.round(strength),
      htfAlignment: direction !== 'neutral',
    };
  }

  /**
   * Detect candlestick patterns
   */
  detectCandlePatterns(candles) {
    const patterns = [];
    const len = candles.length;
    
    if (len < 3) return patterns;

    const last = candles[len - 1];
    const prev = candles[len - 2];
    const prev2 = candles[len - 3];

    // Engulfing
    if (this.isEngulfing(prev, last)) {
      patterns.push({
        name: last.close > last.open ? 'Bullish Engulfing' : 'Bearish Engulfing',
        type: last.close > last.open ? 'bullish' : 'bearish',
        reliability: 4,
      });
    }

    // Doji
    if (this.isDoji(last)) {
      patterns.push({
        name: 'Doji',
        type: 'neutral',
        reliability: 3,
      });
    }

    // Hammer/Shooting Star
    if (this.isHammer(last)) {
      patterns.push({
        name: 'Hammer',
        type: 'bullish',
        reliability: 3,
      });
    }

    if (this.isShootingStar(last)) {
      patterns.push({
        name: 'Shooting Star',
        type: 'bearish',
        reliability: 3,
      });
    }

    // Pin Bar
    if (this.isPinBar(last)) {
      const type = last.close > last.open ? 'bullish' : 'bearish';
      patterns.push({
        name: 'Pin Bar',
        type,
        reliability: 4,
      });
    }

    // Morning Star (bullish reversal)
    if (this.isMorningStar(prev2, prev, last)) {
      patterns.push({
        name: 'Morning Star',
        type: 'bullish',
        reliability: 5,
      });
    }

    // Evening Star (bearish reversal)
    if (this.isEveningStar(prev2, prev, last)) {
      patterns.push({
        name: 'Evening Star',
        type: 'bearish',
        reliability: 5,
      });
    }

    // Inside Bar
    if (this.isInsideBar(prev, last)) {
      patterns.push({
        name: 'Inside Bar',
        type: 'neutral',
        reliability: 3,
      });
    }

    return patterns;
  }

  /**
   * Check if Morning Star pattern (3-candle bullish reversal)
   * 1st: Large bearish candle
   * 2nd: Small body (doji-like) with gap down
   * 3rd: Large bullish candle closing above 1st candle midpoint
   */
  isMorningStar(first, second, third) {
    const firstBody = Math.abs(first.close - first.open);
    const secondBody = Math.abs(second.close - second.open);
    const thirdBody = Math.abs(third.close - third.open);
    const firstRange = first.high - first.low;
    
    // First candle must be bearish and significant
    const firstBearish = first.close < first.open && firstBody > firstRange * 0.5;
    
    // Second candle must have small body
    const secondSmall = secondBody < firstBody * 0.3;
    
    // Third candle must be bullish and significant
    const thirdBullish = third.close > third.open && thirdBody > firstBody * 0.5;
    
    // Third candle should close above first candle midpoint
    const firstMidpoint = (first.open + first.close) / 2;
    const closesAboveMid = third.close > firstMidpoint;
    
    return firstBearish && secondSmall && thirdBullish && closesAboveMid;
  }

  /**
   * Check if Evening Star pattern (3-candle bearish reversal)
   * 1st: Large bullish candle
   * 2nd: Small body (doji-like) with gap up
   * 3rd: Large bearish candle closing below 1st candle midpoint
   */
  isEveningStar(first, second, third) {
    const firstBody = Math.abs(first.close - first.open);
    const secondBody = Math.abs(second.close - second.open);
    const thirdBody = Math.abs(third.close - third.open);
    const firstRange = first.high - first.low;
    
    // First candle must be bullish and significant
    const firstBullish = first.close > first.open && firstBody > firstRange * 0.5;
    
    // Second candle must have small body
    const secondSmall = secondBody < firstBody * 0.3;
    
    // Third candle must be bearish and significant
    const thirdBearish = third.close < third.open && thirdBody > firstBody * 0.5;
    
    // Third candle should close below first candle midpoint
    const firstMidpoint = (first.open + first.close) / 2;
    const closesBelowMid = third.close < firstMidpoint;
    
    return firstBullish && secondSmall && thirdBearish && closesBelowMid;
  }

  /**
   * Check if Inside Bar pattern
   * Current candle's high/low is within previous candle's range
   */
  isInsideBar(prev, curr) {
    return curr.high < prev.high && curr.low > prev.low;
  }

  /**
   * Check if engulfing pattern
   */
  isEngulfing(prev, curr) {
    const prevBody = Math.abs(prev.close - prev.open);
    const currBody = Math.abs(curr.close - curr.open);
    
    if (currBody <= prevBody) return false;

    // Bullish engulfing
    if (prev.close < prev.open && curr.close > curr.open) {
      return curr.open <= prev.close && curr.close >= prev.open;
    }
    
    // Bearish engulfing
    if (prev.close > prev.open && curr.close < curr.open) {
      return curr.open >= prev.close && curr.close <= prev.open;
    }

    return false;
  }

  /**
   * Check if doji
   */
  isDoji(candle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    return body / range < 0.1;
  }

  /**
   * Check if hammer
   */
  isHammer(candle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    
    return lowerWick > body * 2 && upperWick < body * 0.5;
  }

  /**
   * Check if shooting star
   */
  isShootingStar(candle) {
    const body = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    
    return upperWick > body * 2 && lowerWick < body * 0.5;
  }

  /**
   * Check if pin bar
   */
  isPinBar(candle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    
    const longWick = Math.max(upperWick, lowerWick);
    return longWick > range * 0.6 && body < range * 0.3;
  }

  /**
   * Detect divergences
   */
  detectDivergences(candles, rsi) {
    const divergences = [];
    
    if (candles.length < 20 || rsi.length < 20) return divergences;

    // Simple divergence detection
    const priceHigh1 = Math.max(...candles.slice(-10).map(c => c.high));
    const priceHigh2 = Math.max(...candles.slice(-20, -10).map(c => c.high));
    const rsiHigh1 = Math.max(...rsi.slice(-10));
    const rsiHigh2 = Math.max(...rsi.slice(-20, -10));

    // Bearish divergence: higher price high, lower RSI high
    if (priceHigh1 > priceHigh2 && rsiHigh1 < rsiHigh2) {
      divergences.push({
        type: 'bearish',
        indicator: 'RSI',
        description: 'Bearish divergence - price making higher highs while RSI making lower highs',
      });
    }

    const priceLow1 = Math.min(...candles.slice(-10).map(c => c.low));
    const priceLow2 = Math.min(...candles.slice(-20, -10).map(c => c.low));
    const rsiLow1 = Math.min(...rsi.slice(-10));
    const rsiLow2 = Math.min(...rsi.slice(-20, -10));

    // Bullish divergence: lower price low, higher RSI low
    if (priceLow1 < priceLow2 && rsiLow1 > rsiLow2) {
      divergences.push({
        type: 'bullish',
        indicator: 'RSI',
        description: 'Bullish divergence - price making lower lows while RSI making higher lows',
      });
    }

    return divergences;
  }

  /**
   * Check if momentum is aligned with trend
   */
  isMomentumAligned(rsi, macd, trendDirection) {
    const lastRSI = rsi[rsi.length - 1];
    
    if (trendDirection === 'bullish') {
      return lastRSI > 50 && macd.histogram > 0;
    }
    if (trendDirection === 'bearish') {
      return lastRSI < 50 && macd.histogram < 0;
    }
    return false;
  }

  /**
   * Detect Bollinger Band squeeze
   */
  detectBBSqueeze(bb) {
    const bandwidth = (bb.upper - bb.lower) / bb.middle;
    return bandwidth < 0.02; // Less than 2% bandwidth
  }

  /**
   * Determine overall bias
   */
  determineBias(trend, rsi, macd) {
    let bullishScore = 0;
    let bearishScore = 0;

    // Trend
    if (trend.direction === 'bullish') bullishScore += 2;
    if (trend.direction === 'bearish') bearishScore += 2;

    // RSI
    const lastRSI = rsi[rsi.length - 1];
    if (lastRSI > 50) bullishScore++;
    if (lastRSI < 50) bearishScore++;

    // MACD
    if (macd.histogram > 0) bullishScore++;
    if (macd.histogram < 0) bearishScore++;

    if (bullishScore > bearishScore + 1) return 'bullish';
    if (bearishScore > bullishScore + 1) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate technical score
   */
  calculateScore(trend, rsi, macd, patterns) {
    let score = 50;

    // Trend strength
    score += trend.strength * 0.3;

    // RSI
    const lastRSI = rsi[rsi.length - 1];
    if (lastRSI > 30 && lastRSI < 70) score += 10;

    // MACD alignment
    if (macd.histogram !== 0) score += 10;

    // Patterns
    score += patterns.length * 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get empty analysis
   */
  getEmptyAnalysis() {
    return {
      trend: { direction: 'neutral', strength: 0, htfAlignment: false },
      momentum: { rsi: 50, macd: { line: 0, signal: 0, histogram: 0 }, aligned: false },
      volatility: { atr: 0, bb: { upper: 0, middle: 0, lower: 0 }, squeeze: false },
      indicators: {},
      patterns: [],
      divergences: [],
      fibonacci: { retracement: [], extension: [] },
      score: 0,
      bias: 'neutral',
    };
  }

  /**
   * Calculate Fibonacci retracement levels
   * @param {number} swingHigh - The swing high price
   * @param {number} swingLow - The swing low price
   * @param {string} direction - 'bullish' (low to high) or 'bearish' (high to low)
   * @returns {Object} Fibonacci retracement levels
   */
  calculateFibonacciRetracement(swingHigh, swingLow, direction = 'bullish') {
    const diff = swingHigh - swingLow;
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    
    const retracement = {};
    
    if (direction === 'bullish') {
      // Retracement from high back down
      levels.forEach(level => {
        retracement[`${level * 100}%`] = swingHigh - (diff * level);
      });
    } else {
      // Retracement from low back up
      levels.forEach(level => {
        retracement[`${level * 100}%`] = swingLow + (diff * level);
      });
    }
    
    return {
      swingHigh,
      swingLow,
      direction,
      levels: retracement,
      goldenZone: {
        upper: direction === 'bullish' ? swingHigh - (diff * 0.618) : swingLow + (diff * 0.618),
        lower: direction === 'bullish' ? swingHigh - (diff * 0.786) : swingLow + (diff * 0.786),
      },
    };
  }

  /**
   * Calculate Fibonacci extension levels
   * @param {number} swingHigh - The swing high price
   * @param {number} swingLow - The swing low price
   * @param {number} retracePoint - The retracement point
   * @param {string} direction - 'bullish' or 'bearish'
   * @returns {Object} Fibonacci extension levels
   */
  calculateFibonacciExtension(swingHigh, swingLow, retracePoint, direction = 'bullish') {
    const diff = swingHigh - swingLow;
    const extensionLevels = [1, 1.272, 1.414, 1.618, 2, 2.618, 3.618];
    
    const extension = {};
    
    if (direction === 'bullish') {
      // Extensions above the swing high
      extensionLevels.forEach(level => {
        extension[`${level * 100}%`] = retracePoint + (diff * level);
      });
    } else {
      // Extensions below the swing low
      extensionLevels.forEach(level => {
        extension[`${level * 100}%`] = retracePoint - (diff * level);
      });
    }
    
    return {
      swingHigh,
      swingLow,
      retracePoint,
      direction,
      levels: extension,
      primaryTargets: {
        tp1: direction === 'bullish' ? retracePoint + (diff * 1) : retracePoint - (diff * 1),
        tp2: direction === 'bullish' ? retracePoint + (diff * 1.618) : retracePoint - (diff * 1.618),
        tp3: direction === 'bullish' ? retracePoint + (diff * 2.618) : retracePoint - (diff * 2.618),
      },
    };
  }

  /**
   * Auto-detect swing points and calculate Fibonacci levels
   * @param {Array} candles - OHLCV candles
   * @param {number} lookback - Number of candles to look back
   * @returns {Object} Fibonacci analysis
   */
  autoFibonacci(candles, lookback = 50) {
    if (candles.length < lookback) {
      return { retracement: null, extension: null };
    }

    const recentCandles = candles.slice(-lookback);
    
    // Find swing high and low
    let swingHighIdx = 0;
    let swingLowIdx = 0;
    let swingHigh = recentCandles[0].high;
    let swingLow = recentCandles[0].low;
    
    recentCandles.forEach((candle, idx) => {
      if (candle.high > swingHigh) {
        swingHigh = candle.high;
        swingHighIdx = idx;
      }
      if (candle.low < swingLow) {
        swingLow = candle.low;
        swingLowIdx = idx;
      }
    });

    // Determine direction based on which came first
    const direction = swingLowIdx < swingHighIdx ? 'bullish' : 'bearish';
    const currentPrice = recentCandles[recentCandles.length - 1].close;
    
    const retracement = this.calculateFibonacciRetracement(swingHigh, swingLow, direction);
    const extension = this.calculateFibonacciExtension(swingHigh, swingLow, currentPrice, direction);
    
    // Find nearest Fibonacci level
    const retraceLevels = Object.entries(retracement.levels);
    let nearestLevel = null;
    let nearestDistance = Infinity;
    
    retraceLevels.forEach(([level, price]) => {
      const distance = Math.abs(currentPrice - price);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestLevel = { level, price, distance };
      }
    });

    return {
      retracement,
      extension,
      currentPrice,
      nearestLevel,
      inGoldenZone: currentPrice >= Math.min(retracement.goldenZone.upper, retracement.goldenZone.lower) &&
                    currentPrice <= Math.max(retracement.goldenZone.upper, retracement.goldenZone.lower),
    };
  }
}

export default TechnicalAnalyzer;
