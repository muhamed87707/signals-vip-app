/**
 * TechnicalAnalyzer - Advanced Technical Analysis Engine
 * Calculates 15+ technical indicators and analyzes price action
 */

export class TechnicalAnalyzer {
  constructor() {
    this.timeframes = ['M15', 'H1', 'H4', 'D1', 'W1', 'M1'];
  }

  /**
   * Main analysis function - analyzes all timeframes
   */
  async analyze(priceData, symbol) {
    const results = {
      symbol,
      timestamp: new Date(),
      indicators: {},
      trend: 'NEUTRAL',
      trendStrength: 0,
      bias: 'neutral',
      score: 0
    };

    // Calculate all indicators
    results.indicators = this.calculateAllIndicators(priceData);
    
    // Determine overall trend
    const trendAnalysis = this.analyzeTrend(results.indicators, priceData);
    results.trend = trendAnalysis.trend;
    results.trendStrength = trendAnalysis.strength;
    results.bias = trendAnalysis.bias;
    
    // Calculate technical score (0-100)
    results.score = this.calculateTechnicalScore(results.indicators, trendAnalysis);

    return results;
  }

  /**
   * Calculate all technical indicators
   */
  calculateAllIndicators(data) {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume || 0);

    return {
      // Moving Averages
      ema: {
        ema9: this.calculateEMA(closes, 9),
        ema21: this.calculateEMA(closes, 21),
        ema50: this.calculateEMA(closes, 50),
        ema100: this.calculateEMA(closes, 100),
        ema200: this.calculateEMA(closes, 200)
      },
      sma: {
        sma20: this.calculateSMA(closes, 20),
        sma50: this.calculateSMA(closes, 50),
        sma200: this.calculateSMA(closes, 200)
      },
      
      // Momentum Indicators
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      stochastic: this.calculateStochastic(highs, lows, closes),
      momentum: this.calculateMomentum(closes, 14),
      roc: this.calculateROC(closes, 14),
      
      // Volatility Indicators
      atr: this.calculateATR(highs, lows, closes, 14),
      bollinger: this.calculateBollingerBands(closes, 20, 2),
      
      // Trend Indicators
      adx: this.calculateADX(highs, lows, closes, 14),
      ichimoku: this.calculateIchimoku(highs, lows, closes),
      
      // Volume Indicators
      obv: this.calculateOBV(closes, volumes),
      mfi: this.calculateMFI(highs, lows, closes, volumes, 14),
      
      // Current price info
      currentPrice: closes[closes.length - 1],
      previousClose: closes[closes.length - 2]
    };
  }

  // ==================== MOVING AVERAGES ====================

  /**
   * Calculate Exponential Moving Average
   */
  calculateEMA(data, period) {
    if (data.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    
    return Math.round(ema * 100000) / 100000;
  }

  /**
   * Calculate Simple Moving Average
   */
  calculateSMA(data, period) {
    if (data.length < period) return null;
    const slice = data.slice(-period);
    return Math.round((slice.reduce((a, b) => a + b, 0) / period) * 100000) / 100000;
  }

  // ==================== MOMENTUM INDICATORS ====================

  /**
   * Calculate RSI (Relative Strength Index)
   */
  calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return { value: 50, signal: 'neutral' };
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate smoothed RSI
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    const value = Math.round(rsi * 100) / 100;
    
    let signal = 'neutral';
    if (value >= 70) signal = 'overbought';
    else if (value <= 30) signal = 'oversold';
    else if (value >= 50) signal = 'bullish';
    else signal = 'bearish';
    
    return { value, signal };
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (closes.length < slowPeriod + signalPeriod) {
      return { macd: 0, signal: 0, histogram: 0, trend: 'neutral' };
    }
    
    const fastEMA = this.calculateEMAArray(closes, fastPeriod);
    const slowEMA = this.calculateEMAArray(closes, slowPeriod);
    
    const macdLine = [];
    for (let i = 0; i < fastEMA.length; i++) {
      if (slowEMA[i] !== undefined) {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      }
    }
    
    const signalLine = this.calculateEMAArray(macdLine, signalPeriod);
    
    const macd = macdLine[macdLine.length - 1] || 0;
    const signal = signalLine[signalLine.length - 1] || 0;
    const histogram = macd - signal;
    const prevHistogram = macdLine.length > 1 ? 
      macdLine[macdLine.length - 2] - (signalLine[signalLine.length - 2] || 0) : 0;
    
    let trend = 'neutral';
    if (histogram > 0 && histogram > prevHistogram) trend = 'bullish_strong';
    else if (histogram > 0) trend = 'bullish';
    else if (histogram < 0 && histogram < prevHistogram) trend = 'bearish_strong';
    else if (histogram < 0) trend = 'bearish';
    
    return {
      macd: Math.round(macd * 100000) / 100000,
      signal: Math.round(signal * 100000) / 100000,
      histogram: Math.round(histogram * 100000) / 100000,
      trend
    };
  }

  /**
   * Calculate EMA Array (helper for MACD)
   */
  calculateEMAArray(data, period) {
    if (data.length < period) return [];
    
    const multiplier = 2 / (period + 1);
    const emaArray = [];
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    emaArray.push(ema);
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      emaArray.push(ema);
    }
    
    return emaArray;
  }

  /**
   * Calculate Stochastic Oscillator
   */
  calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
    if (closes.length < kPeriod + dPeriod) {
      return { k: 50, d: 50, signal: 'neutral' };
    }
    
    const kValues = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...highSlice);
      const lowest = Math.min(...lowSlice);
      
      const k = highest === lowest ? 50 : ((closes[i] - lowest) / (highest - lowest)) * 100;
      kValues.push(k);
    }
    
    const k = kValues[kValues.length - 1];
    const d = kValues.slice(-dPeriod).reduce((a, b) => a + b, 0) / dPeriod;
    
    let signal = 'neutral';
    if (k >= 80 && d >= 80) signal = 'overbought';
    else if (k <= 20 && d <= 20) signal = 'oversold';
    else if (k > d && k > 50) signal = 'bullish';
    else if (k < d && k < 50) signal = 'bearish';
    
    return {
      k: Math.round(k * 100) / 100,
      d: Math.round(d * 100) / 100,
      signal
    };
  }

  /**
   * Calculate Momentum
   */
  calculateMomentum(closes, period = 14) {
    if (closes.length < period + 1) return { value: 0, signal: 'neutral' };
    
    const current = closes[closes.length - 1];
    const past = closes[closes.length - 1 - period];
    const momentum = current - past;
    
    let signal = 'neutral';
    if (momentum > 0) signal = 'bullish';
    else if (momentum < 0) signal = 'bearish';
    
    return { value: Math.round(momentum * 100000) / 100000, signal };
  }

  /**
   * Calculate Rate of Change
   */
  calculateROC(closes, period = 14) {
    if (closes.length < period + 1) return { value: 0, signal: 'neutral' };
    
    const current = closes[closes.length - 1];
    const past = closes[closes.length - 1 - period];
    const roc = ((current - past) / past) * 100;
    
    let signal = 'neutral';
    if (roc > 5) signal = 'bullish_strong';
    else if (roc > 0) signal = 'bullish';
    else if (roc < -5) signal = 'bearish_strong';
    else if (roc < 0) signal = 'bearish';
    
    return { value: Math.round(roc * 100) / 100, signal };
  }

  // ==================== VOLATILITY INDICATORS ====================

  /**
   * Calculate ATR (Average True Range)
   */
  calculateATR(highs, lows, closes, period = 14) {
    if (closes.length < period + 1) return { value: 0, percentile: 50 };
    
    const trueRanges = [];
    
    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }
    
    // Calculate ATR using Wilder's smoothing
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
    }
    
    // Calculate percentile (compare to historical ATR)
    const historicalATRs = [];
    let tempATR = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    historicalATRs.push(tempATR);
    
    for (let i = period; i < trueRanges.length; i++) {
      tempATR = (tempATR * (period - 1) + trueRanges[i]) / period;
      historicalATRs.push(tempATR);
    }
    
    const sortedATRs = [...historicalATRs].sort((a, b) => a - b);
    const percentile = (sortedATRs.indexOf(atr) / sortedATRs.length) * 100;
    
    return {
      value: Math.round(atr * 100000) / 100000,
      percentile: Math.round(percentile)
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollingerBands(closes, period = 20, stdDev = 2) {
    if (closes.length < period) {
      return { upper: 0, middle: 0, lower: 0, bandwidth: 0, squeeze: false };
    }
    
    const slice = closes.slice(-period);
    const middle = slice.reduce((a, b) => a + b, 0) / period;
    
    const squaredDiffs = slice.map(x => Math.pow(x - middle, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);
    
    const upper = middle + (stdDev * std);
    const lower = middle - (stdDev * std);
    const bandwidth = ((upper - lower) / middle) * 100;
    
    // Squeeze detection (bandwidth < 4% typically indicates squeeze)
    const squeeze = bandwidth < 4;
    
    const currentPrice = closes[closes.length - 1];
    let position = 'middle';
    if (currentPrice > upper) position = 'above_upper';
    else if (currentPrice < lower) position = 'below_lower';
    else if (currentPrice > middle) position = 'upper_half';
    else position = 'lower_half';
    
    return {
      upper: Math.round(upper * 100000) / 100000,
      middle: Math.round(middle * 100000) / 100000,
      lower: Math.round(lower * 100000) / 100000,
      bandwidth: Math.round(bandwidth * 100) / 100,
      squeeze,
      position
    };
  }

  // ==================== TREND INDICATORS ====================

  /**
   * Calculate ADX (Average Directional Index)
   */
  calculateADX(highs, lows, closes, period = 14) {
    if (closes.length < period * 2) {
      return { adx: 25, plusDI: 25, minusDI: 25, trend: 'neutral' };
    }
    
    const plusDM = [];
    const minusDM = [];
    const tr = [];
    
    for (let i = 1; i < closes.length; i++) {
      const highDiff = highs[i] - highs[i - 1];
      const lowDiff = lows[i - 1] - lows[i];
      
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
      
      tr.push(Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      ));
    }
    
    // Smooth the values
    const smoothPlusDM = this.wilderSmooth(plusDM, period);
    const smoothMinusDM = this.wilderSmooth(minusDM, period);
    const smoothTR = this.wilderSmooth(tr, period);
    
    const plusDI = (smoothPlusDM / smoothTR) * 100;
    const minusDI = (smoothMinusDM / smoothTR) * 100;
    
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    const adx = dx; // Simplified - would need smoothing for accurate ADX
    
    let trend = 'neutral';
    if (adx > 25) {
      if (plusDI > minusDI) trend = adx > 40 ? 'strong_bullish' : 'bullish';
      else trend = adx > 40 ? 'strong_bearish' : 'bearish';
    }
    
    return {
      adx: Math.round(adx * 100) / 100,
      plusDI: Math.round(plusDI * 100) / 100,
      minusDI: Math.round(minusDI * 100) / 100,
      trend
    };
  }

  /**
   * Wilder's Smoothing Method
   */
  wilderSmooth(data, period) {
    if (data.length < period) return 0;
    
    let smooth = data.slice(0, period).reduce((a, b) => a + b, 0);
    
    for (let i = period; i < data.length; i++) {
      smooth = smooth - (smooth / period) + data[i];
    }
    
    return smooth / period;
  }

  /**
   * Calculate Ichimoku Cloud
   */
  calculateIchimoku(highs, lows, closes) {
    const tenkanPeriod = 9;
    const kijunPeriod = 26;
    const senkouBPeriod = 52;
    
    if (closes.length < senkouBPeriod) {
      return { tenkan: 0, kijun: 0, senkouA: 0, senkouB: 0, chikou: 0, signal: 'neutral' };
    }
    
    const calcMidpoint = (h, l, period) => {
      const highSlice = h.slice(-period);
      const lowSlice = l.slice(-period);
      return (Math.max(...highSlice) + Math.min(...lowSlice)) / 2;
    };
    
    const tenkan = calcMidpoint(highs, lows, tenkanPeriod);
    const kijun = calcMidpoint(highs, lows, kijunPeriod);
    const senkouA = (tenkan + kijun) / 2;
    const senkouB = calcMidpoint(highs, lows, senkouBPeriod);
    const chikou = closes[closes.length - 1];
    const currentPrice = closes[closes.length - 1];
    
    let signal = 'neutral';
    const cloudTop = Math.max(senkouA, senkouB);
    const cloudBottom = Math.min(senkouA, senkouB);
    
    if (currentPrice > cloudTop && tenkan > kijun) signal = 'bullish';
    else if (currentPrice < cloudBottom && tenkan < kijun) signal = 'bearish';
    else if (currentPrice > cloudTop) signal = 'bullish_weak';
    else if (currentPrice < cloudBottom) signal = 'bearish_weak';
    
    return {
      tenkan: Math.round(tenkan * 100000) / 100000,
      kijun: Math.round(kijun * 100000) / 100000,
      senkouA: Math.round(senkouA * 100000) / 100000,
      senkouB: Math.round(senkouB * 100000) / 100000,
      chikou: Math.round(chikou * 100000) / 100000,
      cloudTop: Math.round(cloudTop * 100000) / 100000,
      cloudBottom: Math.round(cloudBottom * 100000) / 100000,
      signal
    };
  }

  // ==================== VOLUME INDICATORS ====================

  /**
   * Calculate OBV (On-Balance Volume)
   */
  calculateOBV(closes, volumes) {
    if (closes.length < 2 || volumes.length < 2) return { value: 0, trend: 'neutral' };
    
    let obv = 0;
    const obvValues = [0];
    
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        obv += volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        obv -= volumes[i];
      }
      obvValues.push(obv);
    }
    
    // Determine trend
    const recentOBV = obvValues.slice(-5);
    const obvTrend = recentOBV[recentOBV.length - 1] > recentOBV[0] ? 'bullish' : 'bearish';
    
    return { value: obv, trend: obvTrend };
  }

  /**
   * Calculate MFI (Money Flow Index)
   */
  calculateMFI(highs, lows, closes, volumes, period = 14) {
    if (closes.length < period + 1) return { value: 50, signal: 'neutral' };
    
    const typicalPrices = [];
    const moneyFlows = [];
    
    for (let i = 0; i < closes.length; i++) {
      const tp = (highs[i] + lows[i] + closes[i]) / 3;
      typicalPrices.push(tp);
      moneyFlows.push(tp * volumes[i]);
    }
    
    let positiveFlow = 0;
    let negativeFlow = 0;
    
    for (let i = closes.length - period; i < closes.length; i++) {
      if (typicalPrices[i] > typicalPrices[i - 1]) {
        positiveFlow += moneyFlows[i];
      } else {
        negativeFlow += moneyFlows[i];
      }
    }
    
    const mfi = negativeFlow === 0 ? 100 : 100 - (100 / (1 + positiveFlow / negativeFlow));
    
    let signal = 'neutral';
    if (mfi >= 80) signal = 'overbought';
    else if (mfi <= 20) signal = 'oversold';
    else if (mfi >= 50) signal = 'bullish';
    else signal = 'bearish';
    
    return { value: Math.round(mfi * 100) / 100, signal };
  }

  // ==================== ANALYSIS FUNCTIONS ====================

  /**
   * Analyze overall trend from indicators
   */
  analyzeTrend(indicators, priceData) {
    let bullishSignals = 0;
    let bearishSignals = 0;
    let totalSignals = 0;
    
    const currentPrice = indicators.currentPrice;
    
    // EMA Analysis
    if (currentPrice > indicators.ema.ema200) bullishSignals += 2;
    else bearishSignals += 2;
    totalSignals += 2;
    
    if (currentPrice > indicators.ema.ema50) bullishSignals++;
    else bearishSignals++;
    totalSignals++;
    
    if (indicators.ema.ema9 > indicators.ema.ema21) bullishSignals++;
    else bearishSignals++;
    totalSignals++;
    
    // RSI Analysis
    if (indicators.rsi.signal === 'bullish' || indicators.rsi.signal === 'oversold') bullishSignals++;
    else if (indicators.rsi.signal === 'bearish' || indicators.rsi.signal === 'overbought') bearishSignals++;
    totalSignals++;
    
    // MACD Analysis
    if (indicators.macd.trend.includes('bullish')) bullishSignals++;
    else if (indicators.macd.trend.includes('bearish')) bearishSignals++;
    totalSignals++;
    
    // Stochastic Analysis
    if (indicators.stochastic.signal === 'bullish' || indicators.stochastic.signal === 'oversold') bullishSignals++;
    else if (indicators.stochastic.signal === 'bearish' || indicators.stochastic.signal === 'overbought') bearishSignals++;
    totalSignals++;
    
    // ADX Analysis
    if (indicators.adx.trend.includes('bullish')) bullishSignals++;
    else if (indicators.adx.trend.includes('bearish')) bearishSignals++;
    totalSignals++;
    
    // Ichimoku Analysis
    if (indicators.ichimoku.signal.includes('bullish')) bullishSignals++;
    else if (indicators.ichimoku.signal.includes('bearish')) bearishSignals++;
    totalSignals++;
    
    // Calculate trend
    const bullishPercent = (bullishSignals / totalSignals) * 100;
    const bearishPercent = (bearishSignals / totalSignals) * 100;
    
    let trend = 'NEUTRAL';
    let bias = 'neutral';
    
    if (bullishPercent >= 70) {
      trend = 'STRONG_BULLISH';
      bias = 'bullish';
    } else if (bullishPercent >= 55) {
      trend = 'BULLISH';
      bias = 'bullish';
    } else if (bearishPercent >= 70) {
      trend = 'STRONG_BEARISH';
      bias = 'bearish';
    } else if (bearishPercent >= 55) {
      trend = 'BEARISH';
      bias = 'bearish';
    }
    
    return {
      trend,
      bias,
      strength: Math.max(bullishPercent, bearishPercent),
      bullishSignals,
      bearishSignals,
      totalSignals
    };
  }

  /**
   * Calculate overall technical score (0-100)
   */
  calculateTechnicalScore(indicators, trendAnalysis) {
    let score = 50; // Start neutral
    
    // Trend alignment bonus (up to 20 points)
    if (trendAnalysis.strength >= 70) score += 20;
    else if (trendAnalysis.strength >= 60) score += 15;
    else if (trendAnalysis.strength >= 55) score += 10;
    
    // RSI bonus (up to 10 points)
    if (indicators.rsi.value >= 30 && indicators.rsi.value <= 70) {
      score += 5; // Not overbought/oversold
    }
    if ((trendAnalysis.bias === 'bullish' && indicators.rsi.value < 50) ||
        (trendAnalysis.bias === 'bearish' && indicators.rsi.value > 50)) {
      score += 5; // Room to move
    }
    
    // MACD bonus (up to 10 points)
    if (indicators.macd.histogram > 0 && trendAnalysis.bias === 'bullish') score += 10;
    else if (indicators.macd.histogram < 0 && trendAnalysis.bias === 'bearish') score += 10;
    
    // ADX bonus (up to 10 points)
    if (indicators.adx.adx > 25) score += 5;
    if (indicators.adx.adx > 40) score += 5;
    
    // Bollinger position (up to 5 points)
    if (!indicators.bollinger.squeeze) score += 2;
    if (indicators.bollinger.position === 'middle') score += 3;
    
    // Ichimoku confirmation (up to 5 points)
    if ((trendAnalysis.bias === 'bullish' && indicators.ichimoku.signal.includes('bullish')) ||
        (trendAnalysis.bias === 'bearish' && indicators.ichimoku.signal.includes('bearish'))) {
      score += 5;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

export default TechnicalAnalyzer;
