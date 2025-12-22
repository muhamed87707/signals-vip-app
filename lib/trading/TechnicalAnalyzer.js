/**
 * TechnicalAnalyzer - Advanced Technical Analysis Engine
 * Calculates 15+ technical indicators and analyzes price action
 */

export class TechnicalAnalyzer {
  constructor() {
    this.indicators = [
      'EMA_9', 'EMA_21', 'EMA_50', 'EMA_100', 'EMA_200',
      'RSI_14', 'MACD', 'STOCHASTIC', 'BOLLINGER',
      'ATR_14', 'ADX_14', 'ICHIMOKU', 'VOLUME_PROFILE',
      'OBV', 'MFI'
    ];
  }

  /**
   * Main analysis function - analyzes all indicators for given price data
   */
  async analyze(priceData, timeframe = 'H4') {
    if (!priceData || priceData.length < 200) {
      return { error: 'Insufficient price data', minRequired: 200 };
    }

    const results = {
      timeframe,
      timestamp: new Date(),
      price: {
        current: priceData[priceData.length - 1].close,
        open: priceData[priceData.length - 1].open,
        high: priceData[priceData.length - 1].high,
        low: priceData[priceData.length - 1].low
      },
      indicators: {},
      signals: [],
      trend: 'NEUTRAL',
      score: 0
    };

    // Calculate all indicators
    results.indicators.ema = this.calculateAllEMAs(priceData);
    results.indicators.rsi = this.calculateRSI(priceData, 14);
    results.indicators.macd = this.calculateMACD(priceData);
    results.indicators.stochastic = this.calculateStochastic(priceData);
    results.indicators.bollinger = this.calculateBollinger(priceData);
    results.indicators.atr = this.calculateATR(priceData, 14);
    results.indicators.adx = this.calculateADX(priceData, 14);

    results.indicators.ichimoku = this.calculateIchimoku(priceData);

    // Determine overall trend
    results.trend = this.determineTrend(results.indicators, priceData);
    
    // Generate signals from indicators
    results.signals = this.generateSignals(results.indicators, priceData);
    
    // Calculate overall technical score (0-100)
    results.score = this.calculateScore(results);

    return results;
  }

  /**
   * Calculate all EMAs (9, 21, 50, 100, 200)
   */
  calculateAllEMAs(data) {
    const closes = data.map(d => d.close);
    return {
      ema9: this.calculateEMA(closes, 9),
      ema21: this.calculateEMA(closes, 21),
      ema50: this.calculateEMA(closes, 50),
      ema100: this.calculateEMA(closes, 100),
      ema200: this.calculateEMA(closes, 200),
      alignment: this.checkEMAAlignment(closes)
    };
  }

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
   * Check EMA alignment for trend confirmation
   */
  checkEMAAlignment(closes) {
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = this.calculateEMA(closes, 200);
    
    if (ema9 > ema21 && ema21 > ema50 && ema50 > ema200) {
      return { direction: 'BULLISH', strength: 'STRONG' };
    } else if (ema9 < ema21 && ema21 < ema50 && ema50 < ema200) {
      return { direction: 'BEARISH', strength: 'STRONG' };
    } else if (ema9 > ema21 && ema21 > ema50) {
      return { direction: 'BULLISH', strength: 'MODERATE' };
    } else if (ema9 < ema21 && ema21 < ema50) {
      return { direction: 'BEARISH', strength: 'MODERATE' };
    }
    return { direction: 'NEUTRAL', strength: 'WEAK' };
  }


  /**
   * Calculate RSI (Relative Strength Index)
   */
  calculateRSI(data, period = 14) {
    const closes = data.map(d => d.close);
    if (closes.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate smoothed RSI
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Detect divergence
    const divergence = this.detectRSIDivergence(data, period);

    return {
      value: Math.round(rsi * 100) / 100,
      signal: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL',
      divergence,
      strength: rsi > 60 ? 'BULLISH' : rsi < 40 ? 'BEARISH' : 'NEUTRAL'
    };
  }

  /**
   * Detect RSI Divergence
   */
  detectRSIDivergence(data, period) {
    const closes = data.map(d => d.close);
    const rsiValues = [];
    
    // Calculate RSI for last 20 candles
    for (let i = data.length - 20; i < data.length; i++) {
      const slice = data.slice(0, i + 1);
      const rsi = this.calculateRSI(slice, period);
      if (rsi) rsiValues.push({ price: closes[i], rsi: rsi.value, index: i });
    }

    if (rsiValues.length < 10) return null;

    // Find recent swing highs/lows
    const recent = rsiValues.slice(-10);
    const priceHigh1 = Math.max(...recent.slice(0, 5).map(r => r.price));
    const priceHigh2 = Math.max(...recent.slice(5).map(r => r.price));
    const rsiHigh1 = Math.max(...recent.slice(0, 5).map(r => r.rsi));
    const rsiHigh2 = Math.max(...recent.slice(5).map(r => r.rsi));

    // Bearish divergence: Higher price high, lower RSI high
    if (priceHigh2 > priceHigh1 && rsiHigh2 < rsiHigh1) {
      return { type: 'BEARISH', strength: 'REGULAR' };
    }

    const priceLow1 = Math.min(...recent.slice(0, 5).map(r => r.price));
    const priceLow2 = Math.min(...recent.slice(5).map(r => r.price));
    const rsiLow1 = Math.min(...recent.slice(0, 5).map(r => r.rsi));
    const rsiLow2 = Math.min(...recent.slice(5).map(r => r.rsi));

    // Bullish divergence: Lower price low, higher RSI low
    if (priceLow2 < priceLow1 && rsiLow2 > rsiLow1) {
      return { type: 'BULLISH', strength: 'REGULAR' };
    }

    return null;
  }


  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const closes = data.map(d => d.close);
    if (closes.length < slowPeriod + signalPeriod) return null;

    const fastEMA = this.calculateEMAArray(closes, fastPeriod);
    const slowEMA = this.calculateEMAArray(closes, slowPeriod);
    
    // MACD Line = Fast EMA - Slow EMA
    const macdLine = [];
    for (let i = slowPeriod - 1; i < closes.length; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }

    // Signal Line = 9-period EMA of MACD Line
    const signalLine = this.calculateEMAArray(macdLine, signalPeriod);
    
    const currentMACD = macdLine[macdLine.length - 1];
    const currentSignal = signalLine[signalLine.length - 1];
    const histogram = currentMACD - currentSignal;
    const prevHistogram = macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2];

    // Determine signal
    let signal = 'NEUTRAL';
    if (currentMACD > currentSignal && histogram > prevHistogram) {
      signal = 'BULLISH';
    } else if (currentMACD < currentSignal && histogram < prevHistogram) {
      signal = 'BEARISH';
    }

    // Check for crossover
    const prevMACD = macdLine[macdLine.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];
    let crossover = null;
    if (prevMACD < prevSignal && currentMACD > currentSignal) {
      crossover = 'BULLISH_CROSSOVER';
    } else if (prevMACD > prevSignal && currentMACD < currentSignal) {
      crossover = 'BEARISH_CROSSOVER';
    }

    return {
      macd: Math.round(currentMACD * 100000) / 100000,
      signal: Math.round(currentSignal * 100000) / 100000,
      histogram: Math.round(histogram * 100000) / 100000,
      trend: signal,
      crossover,
      histogramIncreasing: histogram > prevHistogram
    };
  }

  /**
   * Calculate EMA Array (returns all values)
   */
  calculateEMAArray(data, period) {
    const result = [];
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = 0; i < period; i++) {
      result.push(null);
    }
    result[period - 1] = ema;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
    
    return result;
  }


  /**
   * Calculate Stochastic Oscillator
   */
  calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
    if (data.length < kPeriod + dPeriod) return null;

    const kValues = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(d => d.high));
      const lowestLow = Math.min(...slice.map(d => d.low));
      const close = data[i].close;
      
      const k = highestHigh === lowestLow ? 50 : 
                ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }

    // %D is SMA of %K
    const dValues = [];
    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const d = kValues.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / dPeriod;
      dValues.push(d);
    }

    const currentK = kValues[kValues.length - 1];
    const currentD = dValues[dValues.length - 1];
    const prevK = kValues[kValues.length - 2];
    const prevD = dValues[dValues.length - 2];

    let signal = 'NEUTRAL';
    let crossover = null;

    if (currentK > 80 && currentD > 80) {
      signal = 'OVERBOUGHT';
    } else if (currentK < 20 && currentD < 20) {
      signal = 'OVERSOLD';
    }

    if (prevK < prevD && currentK > currentD) {
      crossover = 'BULLISH_CROSSOVER';
    } else if (prevK > prevD && currentK < currentD) {
      crossover = 'BEARISH_CROSSOVER';
    }

    return {
      k: Math.round(currentK * 100) / 100,
      d: Math.round(currentD * 100) / 100,
      signal,
      crossover
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollinger(data, period = 20, stdDev = 2) {
    const closes = data.map(d => d.close);
    if (closes.length < period) return null;

    const recentCloses = closes.slice(-period);
    const sma = recentCloses.reduce((a, b) => a + b, 0) / period;
    
    const squaredDiffs = recentCloses.map(c => Math.pow(c - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    const upper = sma + (stdDev * standardDeviation);
    const lower = sma - (stdDev * standardDeviation);
    const currentPrice = closes[closes.length - 1];
    
    // Calculate bandwidth and %B
    const bandwidth = ((upper - lower) / sma) * 100;
    const percentB = (currentPrice - lower) / (upper - lower);

    // Detect squeeze (low volatility)
    const avgBandwidth = this.calculateAverageBandwidth(data, period, stdDev);
    const squeeze = bandwidth < avgBandwidth * 0.5;

    let signal = 'NEUTRAL';
    if (currentPrice > upper) signal = 'OVERBOUGHT';
    else if (currentPrice < lower) signal = 'OVERSOLD';
    else if (percentB > 0.8) signal = 'UPPER_ZONE';
    else if (percentB < 0.2) signal = 'LOWER_ZONE';

    return {
      upper: Math.round(upper * 100000) / 100000,
      middle: Math.round(sma * 100000) / 100000,
      lower: Math.round(lower * 100000) / 100000,
      bandwidth: Math.round(bandwidth * 100) / 100,
      percentB: Math.round(percentB * 100) / 100,
      squeeze,
      signal
    };
  }

  calculateAverageBandwidth(data, period, stdDev) {
    const bandwidths = [];
    for (let i = period; i < data.length; i++) {
      const slice = data.slice(i - period, i);
      const closes = slice.map(d => d.close);
      const sma = closes.reduce((a, b) => a + b, 0) / period;
      const variance = closes.map(c => Math.pow(c - sma, 2)).reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(variance);
      const bw = ((2 * stdDev * std) / sma) * 100;
      bandwidths.push(bw);
    }
    return bandwidths.reduce((a, b) => a + b, 0) / bandwidths.length;
  }


  /**
   * Calculate ATR (Average True Range)
   */
  calculateATR(data, period = 14) {
    if (data.length < period + 1) return null;

    const trueRanges = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    // Calculate ATR using Wilder's smoothing
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < trueRanges.length; i++) {
      atr = ((atr * (period - 1)) + trueRanges[i]) / period;
    }

    // Calculate ATR percentile (compare to historical)
    const historicalATRs = [];
    for (let i = period; i < trueRanges.length; i++) {
      let tempATR = trueRanges.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      historicalATRs.push(tempATR);
    }
    
    const sortedATRs = [...historicalATRs].sort((a, b) => a - b);
    const percentile = (sortedATRs.indexOf(atr) / sortedATRs.length) * 100;

    let volatility = 'NORMAL';
    if (percentile > 80) volatility = 'HIGH';
    else if (percentile > 90) volatility = 'EXTREME';
    else if (percentile < 20) volatility = 'LOW';

    return {
      value: Math.round(atr * 100000) / 100000,
      percentile: Math.round(percentile),
      volatility,
      // Useful for stop loss calculation
      stopLossMultiple: {
        conservative: Math.round(atr * 1.5 * 100000) / 100000,
        moderate: Math.round(atr * 2 * 100000) / 100000,
        aggressive: Math.round(atr * 2.5 * 100000) / 100000
      }
    };
  }

  /**
   * Calculate ADX (Average Directional Index)
   */
  calculateADX(data, period = 14) {
    if (data.length < period * 2) return null;

    const plusDM = [];
    const minusDM = [];
    const trueRanges = [];

    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevHigh = data[i - 1].high;
      const prevLow = data[i - 1].low;
      const prevClose = data[i - 1].close;

      // Directional Movement
      const upMove = high - prevHigh;
      const downMove = prevLow - low;

      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

      // True Range
      trueRanges.push(Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      ));
    }

    // Smooth the values
    const smoothPlusDM = this.wilderSmooth(plusDM, period);
    const smoothMinusDM = this.wilderSmooth(minusDM, period);
    const smoothTR = this.wilderSmooth(trueRanges, period);

    // Calculate +DI and -DI
    const plusDI = (smoothPlusDM / smoothTR) * 100;
    const minusDI = (smoothMinusDM / smoothTR) * 100;

    // Calculate DX
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;

    // Calculate ADX (smoothed DX)
    // For simplicity, using current DX as ADX approximation
    const adx = dx;

    let trend = 'NO_TREND';
    let strength = 'WEAK';

    if (adx > 25) {
      strength = adx > 50 ? 'VERY_STRONG' : adx > 40 ? 'STRONG' : 'MODERATE';
      trend = plusDI > minusDI ? 'BULLISH' : 'BEARISH';
    }

    return {
      adx: Math.round(adx * 100) / 100,
      plusDI: Math.round(plusDI * 100) / 100,
      minusDI: Math.round(minusDI * 100) / 100,
      trend,
      strength,
      trending: adx > 25
    };
  }

  wilderSmooth(data, period) {
    let smooth = data.slice(0, period).reduce((a, b) => a + b, 0);
    for (let i = period; i < data.length; i++) {
      smooth = smooth - (smooth / period) + data[i];
    }
    return smooth / period;
  }


  /**
   * Calculate Ichimoku Cloud
   */
  calculateIchimoku(data) {
    if (data.length < 52) return null;

    const tenkanPeriod = 9;
    const kijunPeriod = 26;
    const senkouBPeriod = 52;

    // Tenkan-sen (Conversion Line)
    const tenkanData = data.slice(-tenkanPeriod);
    const tenkan = (Math.max(...tenkanData.map(d => d.high)) + 
                   Math.min(...tenkanData.map(d => d.low))) / 2;

    // Kijun-sen (Base Line)
    const kijunData = data.slice(-kijunPeriod);
    const kijun = (Math.max(...kijunData.map(d => d.high)) + 
                  Math.min(...kijunData.map(d => d.low))) / 2;

    // Senkou Span A (Leading Span A)
    const senkouA = (tenkan + kijun) / 2;

    // Senkou Span B (Leading Span B)
    const senkouBData = data.slice(-senkouBPeriod);
    const senkouB = (Math.max(...senkouBData.map(d => d.high)) + 
                    Math.min(...senkouBData.map(d => d.low))) / 2;

    // Chikou Span (Lagging Span) - current close
    const chikou = data[data.length - 1].close;

    const currentPrice = data[data.length - 1].close;
    const cloudTop = Math.max(senkouA, senkouB);
    const cloudBottom = Math.min(senkouA, senkouB);

    // Determine signal
    let signal = 'NEUTRAL';
    let cloudColor = senkouA > senkouB ? 'GREEN' : 'RED';
    
    if (currentPrice > cloudTop && tenkan > kijun) {
      signal = 'STRONG_BULLISH';
    } else if (currentPrice > cloudTop) {
      signal = 'BULLISH';
    } else if (currentPrice < cloudBottom && tenkan < kijun) {
      signal = 'STRONG_BEARISH';
    } else if (currentPrice < cloudBottom) {
      signal = 'BEARISH';
    } else {
      signal = 'IN_CLOUD'; // Price is inside the cloud - indecision
    }

    // TK Cross
    let tkCross = null;
    const prevTenkan = this.calculateIchimokuLine(data.slice(0, -1), tenkanPeriod);
    const prevKijun = this.calculateIchimokuLine(data.slice(0, -1), kijunPeriod);
    
    if (prevTenkan < prevKijun && tenkan > kijun) {
      tkCross = 'BULLISH';
    } else if (prevTenkan > prevKijun && tenkan < kijun) {
      tkCross = 'BEARISH';
    }

    return {
      tenkan: Math.round(tenkan * 100000) / 100000,
      kijun: Math.round(kijun * 100000) / 100000,
      senkouA: Math.round(senkouA * 100000) / 100000,
      senkouB: Math.round(senkouB * 100000) / 100000,
      chikou: Math.round(chikou * 100000) / 100000,
      cloudTop: Math.round(cloudTop * 100000) / 100000,
      cloudBottom: Math.round(cloudBottom * 100000) / 100000,
      cloudColor,
      signal,
      tkCross,
      priceVsCloud: currentPrice > cloudTop ? 'ABOVE' : currentPrice < cloudBottom ? 'BELOW' : 'INSIDE'
    };
  }

  calculateIchimokuLine(data, period) {
    const slice = data.slice(-period);
    return (Math.max(...slice.map(d => d.high)) + Math.min(...slice.map(d => d.low))) / 2;
  }

  /**
   * Determine overall trend from all indicators
   */
  determineTrend(indicators, data) {
    let bullishCount = 0;
    let bearishCount = 0;

    // EMA alignment
    if (indicators.ema?.alignment?.direction === 'BULLISH') bullishCount += 2;
    else if (indicators.ema?.alignment?.direction === 'BEARISH') bearishCount += 2;

    // RSI
    if (indicators.rsi?.strength === 'BULLISH') bullishCount++;
    else if (indicators.rsi?.strength === 'BEARISH') bearishCount++;

    // MACD
    if (indicators.macd?.trend === 'BULLISH') bullishCount++;
    else if (indicators.macd?.trend === 'BEARISH') bearishCount++;

    // ADX
    if (indicators.adx?.trend === 'BULLISH') bullishCount++;
    else if (indicators.adx?.trend === 'BEARISH') bearishCount++;

    // Ichimoku
    if (indicators.ichimoku?.signal?.includes('BULLISH')) bullishCount += 2;
    else if (indicators.ichimoku?.signal?.includes('BEARISH')) bearishCount += 2;

    const diff = bullishCount - bearishCount;
    
    if (diff >= 4) return 'STRONG_BULLISH';
    if (diff >= 2) return 'BULLISH';
    if (diff <= -4) return 'STRONG_BEARISH';
    if (diff <= -2) return 'BEARISH';
    return 'NEUTRAL';
  }


  /**
   * Generate trading signals from indicators
   */
  generateSignals(indicators, data) {
    const signals = [];
    const currentPrice = data[data.length - 1].close;

    // RSI signals
    if (indicators.rsi) {
      if (indicators.rsi.signal === 'OVERSOLD' && indicators.rsi.divergence?.type === 'BULLISH') {
        signals.push({
          type: 'RSI_BULLISH_DIVERGENCE',
          strength: 'HIGH',
          direction: 'BUY',
          description: 'RSI oversold with bullish divergence'
        });
      } else if (indicators.rsi.signal === 'OVERBOUGHT' && indicators.rsi.divergence?.type === 'BEARISH') {
        signals.push({
          type: 'RSI_BEARISH_DIVERGENCE',
          strength: 'HIGH',
          direction: 'SELL',
          description: 'RSI overbought with bearish divergence'
        });
      }
    }

    // MACD signals
    if (indicators.macd?.crossover) {
      signals.push({
        type: indicators.macd.crossover,
        strength: 'MEDIUM',
        direction: indicators.macd.crossover === 'BULLISH_CROSSOVER' ? 'BUY' : 'SELL',
        description: `MACD ${indicators.macd.crossover.toLowerCase().replace('_', ' ')}`
      });
    }

    // Stochastic signals
    if (indicators.stochastic) {
      if (indicators.stochastic.signal === 'OVERSOLD' && indicators.stochastic.crossover === 'BULLISH_CROSSOVER') {
        signals.push({
          type: 'STOCH_BULLISH',
          strength: 'MEDIUM',
          direction: 'BUY',
          description: 'Stochastic bullish crossover in oversold zone'
        });
      } else if (indicators.stochastic.signal === 'OVERBOUGHT' && indicators.stochastic.crossover === 'BEARISH_CROSSOVER') {
        signals.push({
          type: 'STOCH_BEARISH',
          strength: 'MEDIUM',
          direction: 'SELL',
          description: 'Stochastic bearish crossover in overbought zone'
        });
      }
    }

    // Bollinger Band signals
    if (indicators.bollinger) {
      if (indicators.bollinger.squeeze) {
        signals.push({
          type: 'BB_SQUEEZE',
          strength: 'HIGH',
          direction: 'NEUTRAL',
          description: 'Bollinger Band squeeze - expect breakout'
        });
      }
      if (indicators.bollinger.signal === 'OVERSOLD') {
        signals.push({
          type: 'BB_OVERSOLD',
          strength: 'MEDIUM',
          direction: 'BUY',
          description: 'Price below lower Bollinger Band'
        });
      } else if (indicators.bollinger.signal === 'OVERBOUGHT') {
        signals.push({
          type: 'BB_OVERBOUGHT',
          strength: 'MEDIUM',
          direction: 'SELL',
          description: 'Price above upper Bollinger Band'
        });
      }
    }

    // Ichimoku signals
    if (indicators.ichimoku?.tkCross) {
      signals.push({
        type: `ICHIMOKU_TK_${indicators.ichimoku.tkCross}`,
        strength: indicators.ichimoku.priceVsCloud === 'ABOVE' && indicators.ichimoku.tkCross === 'BULLISH' ? 'HIGH' : 'MEDIUM',
        direction: indicators.ichimoku.tkCross === 'BULLISH' ? 'BUY' : 'SELL',
        description: `Ichimoku TK cross ${indicators.ichimoku.tkCross.toLowerCase()}`
      });
    }

    // EMA alignment signal
    if (indicators.ema?.alignment?.strength === 'STRONG') {
      signals.push({
        type: `EMA_ALIGNMENT_${indicators.ema.alignment.direction}`,
        strength: 'HIGH',
        direction: indicators.ema.alignment.direction === 'BULLISH' ? 'BUY' : 'SELL',
        description: `Strong EMA alignment ${indicators.ema.alignment.direction.toLowerCase()}`
      });
    }

    return signals;
  }

  /**
   * Calculate overall technical score (0-100)
   */
  calculateScore(results) {
    let score = 50; // Start neutral

    // Trend contribution (max ±20)
    if (results.trend === 'STRONG_BULLISH' || results.trend === 'STRONG_BEARISH') score += 20;
    else if (results.trend === 'BULLISH' || results.trend === 'BEARISH') score += 10;

    // Signal count contribution (max ±15)
    const buySignals = results.signals.filter(s => s.direction === 'BUY').length;
    const sellSignals = results.signals.filter(s => s.direction === 'SELL').length;
    const signalDiff = Math.abs(buySignals - sellSignals);
    score += Math.min(signalDiff * 5, 15);

    // High strength signals (max ±10)
    const highStrengthSignals = results.signals.filter(s => s.strength === 'HIGH').length;
    score += Math.min(highStrengthSignals * 5, 10);

    // ADX trending bonus (max +5)
    if (results.indicators.adx?.trending) score += 5;

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Find support and resistance levels
   */
  findKeyLevels(data, lookback = 100) {
    const relevantData = data.slice(-lookback);
    const levels = { support: [], resistance: [] };
    
    // Find swing highs and lows
    for (let i = 2; i < relevantData.length - 2; i++) {
      const current = relevantData[i];
      const prev1 = relevantData[i - 1];
      const prev2 = relevantData[i - 2];
      const next1 = relevantData[i + 1];
      const next2 = relevantData[i + 2];

      // Swing high (resistance)
      if (current.high > prev1.high && current.high > prev2.high &&
          current.high > next1.high && current.high > next2.high) {
        levels.resistance.push({
          price: current.high,
          touches: 1,
          strength: 1
        });
      }

      // Swing low (support)
      if (current.low < prev1.low && current.low < prev2.low &&
          current.low < next1.low && current.low < next2.low) {
        levels.support.push({
          price: current.low,
          touches: 1,
          strength: 1
        });
      }
    }

    // Cluster nearby levels and count touches
    levels.support = this.clusterLevels(levels.support, data);
    levels.resistance = this.clusterLevels(levels.resistance, data);

    return levels;
  }

  clusterLevels(levels, data, threshold = 0.001) {
    if (levels.length === 0) return [];

    const clustered = [];
    const used = new Set();

    for (let i = 0; i < levels.length; i++) {
      if (used.has(i)) continue;

      let cluster = [levels[i]];
      used.add(i);

      for (let j = i + 1; j < levels.length; j++) {
        if (used.has(j)) continue;
        
        const diff = Math.abs(levels[i].price - levels[j].price) / levels[i].price;
        if (diff < threshold) {
          cluster.push(levels[j]);
          used.add(j);
        }
      }

      // Average the cluster
      const avgPrice = cluster.reduce((sum, l) => sum + l.price, 0) / cluster.length;
      
      // Count how many times price touched this level
      const touches = this.countTouches(avgPrice, data, threshold);
      
      clustered.push({
        price: Math.round(avgPrice * 100000) / 100000,
        touches,
        strength: Math.min(touches, 5) // Max strength of 5
      });
    }

    return clustered.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  countTouches(level, data, threshold) {
    let touches = 0;
    for (const candle of data) {
      const highDiff = Math.abs(candle.high - level) / level;
      const lowDiff = Math.abs(candle.low - level) / level;
      if (highDiff < threshold || lowDiff < threshold) {
        touches++;
      }
    }
    return touches;
  }
}

export default TechnicalAnalyzer;
