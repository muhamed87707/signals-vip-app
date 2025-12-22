/**
 * VolumeAnalyzer - Volume Analysis Engine
 * Analyzes Volume Profile, VWAP, OBV, MFI, and other volume indicators
 * Provides volume-based confirmation for trading signals
 */

export class VolumeAnalyzer {
  constructor() {
    // Default periods
    this.periods = {
      vwap: 'session',
      obv: 20,
      mfi: 14,
      volumeMA: 20,
      cmf: 20
    };
  }

  /**
   * Main analysis function
   */
  analyze(candles) {
    if (!candles || candles.length < 50) {
      return { error: 'Insufficient data for volume analysis' };
    }

    const result = {
      timestamp: new Date(),
      volumeProfile: this.calculateVolumeProfile(candles),
      vwap: this.calculateVWAP(candles),
      obv: this.calculateOBV(candles),
      mfi: this.calculateMFI(candles),
      cmf: this.calculateCMF(candles),
      volumeTrend: this.analyzeVolumeTrend(candles),
      volumeConfirmation: false,
      bias: 'NEUTRAL',
      confidence: 0,
      summary: {}
    };

    // Determine volume confirmation
    result.volumeConfirmation = this.checkVolumeConfirmation(result, candles);
    
    // Calculate overall bias
    result.bias = this.calculateBias(result);
    
    // Calculate confidence
    result.confidence = this.calculateConfidence(result);
    
    // Generate summary
    result.summary = this.generateSummary(result, candles);

    return result;
  }

  /**
   * Calculate Volume Profile
   */
  calculateVolumeProfile(candles, bins = 24) {
    const result = {
      poc: null,           // Point of Control
      valueAreaHigh: null, // Value Area High (70%)
      valueAreaLow: null,  // Value Area Low (70%)
      hvn: [],             // High Volume Nodes
      lvn: [],             // Low Volume Nodes
      priceInValueArea: false,
      nearPOC: false
    };

    if (candles.length < 20) return result;

    // Find price range
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const priceRange = maxPrice - minPrice;
    const binSize = priceRange / bins;

    // Create volume profile
    const profile = new Array(bins).fill(0);
    
    candles.forEach(candle => {
      const volume = candle.volume || 1;
      const avgPrice = (candle.high + candle.low) / 2;
      const binIndex = Math.min(Math.floor((avgPrice - minPrice) / binSize), bins - 1);
      profile[binIndex] += volume;
    });

    // Find POC (highest volume bin)
    const maxVolume = Math.max(...profile);
    const pocIndex = profile.indexOf(maxVolume);
    result.poc = minPrice + (pocIndex + 0.5) * binSize;

    // Calculate Value Area (70% of volume)
    const totalVolume = profile.reduce((a, b) => a + b, 0);
    const targetVolume = totalVolume * 0.7;
    
    let vaVolume = profile[pocIndex];
    let vaLowIndex = pocIndex;
    let vaHighIndex = pocIndex;

    while (vaVolume < targetVolume) {
      const lowerVol = vaLowIndex > 0 ? profile[vaLowIndex - 1] : 0;
      const upperVol = vaHighIndex < bins - 1 ? profile[vaHighIndex + 1] : 0;

      if (lowerVol >= upperVol && vaLowIndex > 0) {
        vaLowIndex--;
        vaVolume += lowerVol;
      } else if (vaHighIndex < bins - 1) {
        vaHighIndex++;
        vaVolume += upperVol;
      } else {
        break;
      }
    }

    result.valueAreaLow = minPrice + vaLowIndex * binSize;
    result.valueAreaHigh = minPrice + (vaHighIndex + 1) * binSize;

    // Find HVN and LVN
    const avgVolume = totalVolume / bins;
    profile.forEach((vol, i) => {
      const price = minPrice + (i + 0.5) * binSize;
      if (vol > avgVolume * 1.5) {
        result.hvn.push({ price, volume: vol });
      } else if (vol < avgVolume * 0.5) {
        result.lvn.push({ price, volume: vol });
      }
    });

    // Check current price position
    const currentPrice = candles[candles.length - 1].close;
    result.priceInValueArea = currentPrice >= result.valueAreaLow && currentPrice <= result.valueAreaHigh;
    result.nearPOC = Math.abs(currentPrice - result.poc) / result.poc < 0.005; // Within 0.5%

    return result;
  }

  /**
   * Calculate VWAP (Volume Weighted Average Price)
   */
  calculateVWAP(candles) {
    const result = {
      value: 0,
      upperBand1: 0,
      lowerBand1: 0,
      upperBand2: 0,
      lowerBand2: 0,
      priceRelation: 'AT_VWAP',
      aligned: false
    };

    if (candles.length < 10) return result;

    // Calculate VWAP
    let cumulativeTPV = 0;  // Typical Price * Volume
    let cumulativeVolume = 0;
    const tpvArray = [];

    candles.forEach(candle => {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      const volume = candle.volume || 1;
      cumulativeTPV += typicalPrice * volume;
      cumulativeVolume += volume;
      tpvArray.push({ tp: typicalPrice, vol: volume });
    });

    result.value = cumulativeTPV / cumulativeVolume;

    // Calculate standard deviation for bands
    let sumSquaredDev = 0;
    tpvArray.forEach(item => {
      sumSquaredDev += Math.pow(item.tp - result.value, 2) * item.vol;
    });
    const stdDev = Math.sqrt(sumSquaredDev / cumulativeVolume);

    result.upperBand1 = result.value + stdDev;
    result.lowerBand1 = result.value - stdDev;
    result.upperBand2 = result.value + 2 * stdDev;
    result.lowerBand2 = result.value - 2 * stdDev;

    // Determine price relation to VWAP
    const currentPrice = candles[candles.length - 1].close;
    if (currentPrice > result.upperBand1) {
      result.priceRelation = 'ABOVE_VWAP';
      result.aligned = true; // Bullish
    } else if (currentPrice < result.lowerBand1) {
      result.priceRelation = 'BELOW_VWAP';
      result.aligned = true; // Bearish
    }

    return result;
  }


  /**
   * Calculate OBV (On-Balance Volume)
   */
  calculateOBV(candles) {
    const result = {
      values: [],
      current: 0,
      trend: 'NEUTRAL',
      divergence: null,
      aligned: false
    };

    if (candles.length < 20) return result;

    let obv = 0;
    const obvValues = [0];

    for (let i = 1; i < candles.length; i++) {
      const currentClose = candles[i].close;
      const prevClose = candles[i - 1].close;
      const volume = candles[i].volume || 1;

      if (currentClose > prevClose) {
        obv += volume;
      } else if (currentClose < prevClose) {
        obv -= volume;
      }
      obvValues.push(obv);
    }

    result.values = obvValues;
    result.current = obv;

    // Calculate OBV trend (using simple moving average)
    const period = Math.min(20, obvValues.length);
    const recentOBV = obvValues.slice(-period);
    const obvMA = recentOBV.reduce((a, b) => a + b, 0) / period;

    if (obv > obvMA * 1.05) {
      result.trend = 'BULLISH';
    } else if (obv < obvMA * 0.95) {
      result.trend = 'BEARISH';
    }

    // Check for divergence
    result.divergence = this.checkOBVDivergence(candles, obvValues);

    // Check alignment with price
    const priceUp = candles[candles.length - 1].close > candles[candles.length - 10].close;
    const obvUp = obv > obvValues[obvValues.length - 10];
    result.aligned = priceUp === obvUp;

    return result;
  }

  /**
   * Check OBV divergence
   */
  checkOBVDivergence(candles, obvValues) {
    if (candles.length < 20) return null;

    const lookback = 20;
    const recentCandles = candles.slice(-lookback);
    const recentOBV = obvValues.slice(-lookback);

    // Find price highs/lows
    const priceHigh1 = Math.max(...recentCandles.slice(0, 10).map(c => c.high));
    const priceHigh2 = Math.max(...recentCandles.slice(10).map(c => c.high));
    const priceLow1 = Math.min(...recentCandles.slice(0, 10).map(c => c.low));
    const priceLow2 = Math.min(...recentCandles.slice(10).map(c => c.low));

    // Find OBV highs/lows
    const obvHigh1 = Math.max(...recentOBV.slice(0, 10));
    const obvHigh2 = Math.max(...recentOBV.slice(10));
    const obvLow1 = Math.min(...recentOBV.slice(0, 10));
    const obvLow2 = Math.min(...recentOBV.slice(10));

    // Bearish divergence: Higher price high, lower OBV high
    if (priceHigh2 > priceHigh1 && obvHigh2 < obvHigh1) {
      return { type: 'BEARISH', strength: 'MODERATE' };
    }

    // Bullish divergence: Lower price low, higher OBV low
    if (priceLow2 < priceLow1 && obvLow2 > obvLow1) {
      return { type: 'BULLISH', strength: 'MODERATE' };
    }

    return null;
  }

  /**
   * Calculate MFI (Money Flow Index)
   */
  calculateMFI(candles, period = 14) {
    const result = {
      value: 50,
      signal: 'NEUTRAL',
      overbought: false,
      oversold: false
    };

    if (candles.length < period + 1) return result;

    const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);
    const rawMoneyFlow = candles.map((c, i) => typicalPrices[i] * (c.volume || 1));

    let positiveFlow = 0;
    let negativeFlow = 0;

    for (let i = candles.length - period; i < candles.length; i++) {
      if (typicalPrices[i] > typicalPrices[i - 1]) {
        positiveFlow += rawMoneyFlow[i];
      } else {
        negativeFlow += rawMoneyFlow[i];
      }
    }

    const moneyRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
    result.value = 100 - (100 / (1 + moneyRatio));

    // Determine signal
    if (result.value >= 80) {
      result.signal = 'OVERBOUGHT';
      result.overbought = true;
    } else if (result.value <= 20) {
      result.signal = 'OVERSOLD';
      result.oversold = true;
    } else if (result.value > 50) {
      result.signal = 'BULLISH';
    } else {
      result.signal = 'BEARISH';
    }

    return result;
  }

  /**
   * Calculate CMF (Chaikin Money Flow)
   */
  calculateCMF(candles, period = 20) {
    const result = {
      value: 0,
      signal: 'NEUTRAL',
      accumulation: false,
      distribution: false
    };

    if (candles.length < period) return result;

    let sumMFV = 0;  // Money Flow Volume
    let sumVolume = 0;

    for (let i = candles.length - period; i < candles.length; i++) {
      const candle = candles[i];
      const range = candle.high - candle.low;
      
      if (range === 0) continue;

      // Money Flow Multiplier
      const mfm = ((candle.close - candle.low) - (candle.high - candle.close)) / range;
      
      // Money Flow Volume
      const mfv = mfm * (candle.volume || 1);
      
      sumMFV += mfv;
      sumVolume += candle.volume || 1;
    }

    result.value = sumVolume === 0 ? 0 : sumMFV / sumVolume;

    // Determine signal
    if (result.value > 0.1) {
      result.signal = 'BULLISH';
      result.accumulation = true;
    } else if (result.value < -0.1) {
      result.signal = 'BEARISH';
      result.distribution = true;
    }

    return result;
  }

  /**
   * Analyze volume trend
   */
  analyzeVolumeTrend(candles) {
    const result = {
      trend: 'NEUTRAL',
      increasing: false,
      decreasing: false,
      spike: false,
      avgVolume: 0,
      currentVolume: 0,
      volumeRatio: 1
    };

    if (candles.length < 20) return result;

    // Calculate average volume
    const volumes = candles.slice(-20).map(c => c.volume || 1);
    result.avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    result.currentVolume = candles[candles.length - 1].volume || 1;
    result.volumeRatio = result.currentVolume / result.avgVolume;

    // Check for volume spike
    if (result.volumeRatio > 2) {
      result.spike = true;
    }

    // Analyze trend
    const recentAvg = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const olderAvg = volumes.slice(0, 10).reduce((a, b) => a + b, 0) / 10;

    if (recentAvg > olderAvg * 1.2) {
      result.trend = 'INCREASING';
      result.increasing = true;
    } else if (recentAvg < olderAvg * 0.8) {
      result.trend = 'DECREASING';
      result.decreasing = true;
    }

    return result;
  }

  /**
   * Check volume confirmation
   */
  checkVolumeConfirmation(analysis, candles) {
    let confirmations = 0;
    let total = 0;

    // OBV alignment
    if (analysis.obv?.aligned) {
      confirmations++;
    }
    total++;

    // MFI not extreme opposite
    const priceUp = candles[candles.length - 1].close > candles[candles.length - 5].close;
    if (priceUp && !analysis.mfi?.overbought) confirmations++;
    else if (!priceUp && !analysis.mfi?.oversold) confirmations++;
    total++;

    // CMF alignment
    if (analysis.cmf?.signal !== 'NEUTRAL') {
      const cmfBullish = analysis.cmf.signal === 'BULLISH';
      if (priceUp === cmfBullish) confirmations++;
    }
    total++;

    // Volume trend
    if (analysis.volumeTrend?.increasing) confirmations++;
    total++;

    return confirmations >= total * 0.6;
  }

  /**
   * Calculate overall bias
   */
  calculateBias(analysis) {
    let bullishScore = 0;
    let bearishScore = 0;

    // OBV
    if (analysis.obv?.trend === 'BULLISH') bullishScore += 25;
    else if (analysis.obv?.trend === 'BEARISH') bearishScore += 25;

    // OBV divergence
    if (analysis.obv?.divergence?.type === 'BULLISH') bullishScore += 15;
    else if (analysis.obv?.divergence?.type === 'BEARISH') bearishScore += 15;

    // MFI
    if (analysis.mfi?.signal === 'BULLISH' || analysis.mfi?.oversold) bullishScore += 20;
    else if (analysis.mfi?.signal === 'BEARISH' || analysis.mfi?.overbought) bearishScore += 20;

    // CMF
    if (analysis.cmf?.accumulation) bullishScore += 20;
    else if (analysis.cmf?.distribution) bearishScore += 20;

    // VWAP
    if (analysis.vwap?.priceRelation === 'ABOVE_VWAP') bullishScore += 20;
    else if (analysis.vwap?.priceRelation === 'BELOW_VWAP') bearishScore += 20;

    if (bullishScore > bearishScore + 15) return 'BULLISH';
    if (bearishScore > bullishScore + 15) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Calculate confidence
   */
  calculateConfidence(analysis) {
    let confidence = 50;

    // Volume confirmation
    if (analysis.volumeConfirmation) confidence += 15;

    // OBV alignment
    if (analysis.obv?.aligned) confidence += 10;

    // OBV divergence
    if (analysis.obv?.divergence) confidence += 10;

    // Volume spike
    if (analysis.volumeTrend?.spike) confidence += 5;

    // Near POC
    if (analysis.volumeProfile?.nearPOC) confidence += 10;

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Generate summary
   */
  generateSummary(analysis, candles) {
    const currentPrice = candles[candles.length - 1].close;
    
    const summary = {
      bias: analysis.bias,
      confidence: analysis.confidence,
      keyLevels: {
        poc: analysis.volumeProfile?.poc,
        vah: analysis.volumeProfile?.valueAreaHigh,
        val: analysis.volumeProfile?.valueAreaLow,
        vwap: analysis.vwap?.value
      },
      keyFactors: [],
      warnings: [],
      description: { en: '', ar: '' }
    };

    // Key factors
    if (analysis.volumeConfirmation) {
      summary.keyFactors.push({
        en: 'Volume confirms price action',
        ar: 'الحجم يؤكد حركة السعر'
      });
    }

    if (analysis.obv?.divergence) {
      summary.keyFactors.push({
        en: `${analysis.obv.divergence.type} OBV divergence detected`,
        ar: `تم اكتشاف انحراف ${analysis.obv.divergence.type === 'BULLISH' ? 'صاعد' : 'هابط'} في OBV`
      });
    }

    if (analysis.volumeProfile?.nearPOC) {
      summary.keyFactors.push({
        en: `Price near POC (${analysis.volumeProfile.poc?.toFixed(5)})`,
        ar: `السعر قرب نقطة التحكم (${analysis.volumeProfile.poc?.toFixed(5)})`
      });
    }

    if (analysis.cmf?.accumulation) {
      summary.keyFactors.push({
        en: 'Accumulation detected (CMF positive)',
        ar: 'تم اكتشاف تجميع (CMF إيجابي)'
      });
    } else if (analysis.cmf?.distribution) {
      summary.keyFactors.push({
        en: 'Distribution detected (CMF negative)',
        ar: 'تم اكتشاف توزيع (CMF سلبي)'
      });
    }

    // Warnings
    if (analysis.mfi?.overbought) {
      summary.warnings.push({
        en: 'MFI overbought - potential reversal',
        ar: 'MFI في منطقة التشبع الشرائي - احتمال انعكاس'
      });
    } else if (analysis.mfi?.oversold) {
      summary.warnings.push({
        en: 'MFI oversold - potential reversal',
        ar: 'MFI في منطقة التشبع البيعي - احتمال انعكاس'
      });
    }

    if (analysis.volumeTrend?.decreasing) {
      summary.warnings.push({
        en: 'Decreasing volume - weak momentum',
        ar: 'حجم متناقص - زخم ضعيف'
      });
    }

    // Description
    summary.description = {
      en: `Volume analysis shows ${analysis.bias.toLowerCase()} bias. ${analysis.volumeConfirmation ? 'Volume confirms the move.' : 'Volume not confirming.'}`,
      ar: `تحليل الحجم يظهر اتجاه ${analysis.bias === 'BULLISH' ? 'صاعد' : analysis.bias === 'BEARISH' ? 'هابط' : 'محايد'}. ${analysis.volumeConfirmation ? 'الحجم يؤكد الحركة.' : 'الحجم لا يؤكد.'}`
    };

    return summary;
  }
}

export default VolumeAnalyzer;
