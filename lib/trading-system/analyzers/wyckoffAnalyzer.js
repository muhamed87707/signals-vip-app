/**
 * Wyckoff Analyzer - Wyckoff Method Analysis
 * Detects Accumulation/Distribution phases, Spring/Upthrust patterns
 */

export class WyckoffAnalyzer {
  constructor(config = {}) {
    this.config = {
      phaseLookback: 100,
      volumeThreshold: 1.5, // Volume spike threshold
      ...config,
    };
  }

  /**
   * Perform full Wyckoff analysis
   */
  async analyze(marketData) {
    const candles = marketData.H1?.candles || [];
    const dailyCandles = marketData.D1?.candles || [];
    
    if (candles.length < 50) {
      return this.getEmptyAnalysis();
    }

    // Detect current phase
    const phase = this.detectPhase(candles);
    
    // Detect Spring/Upthrust patterns
    const spring = this.detectSpring(candles);
    const upthrust = this.detectUpthrust(candles);
    
    // Detect Signs of Strength/Weakness
    const sos = this.detectSOS(candles);
    const sow = this.detectSOW(candles);
    
    // Analyze volume patterns
    const volumeAnalysis = this.analyzeVolume(candles);
    
    // Calculate Wyckoff score
    const score = this.calculateScore(phase, spring, upthrust, sos, sow, volumeAnalysis);

    return {
      phase,
      spring,
      upthrust,
      sos,
      sow,
      volumeAnalysis,
      score,
      bias: this.determineBias(phase, spring, upthrust, sos, sow),
    };
  }

  /**
   * Detect Wyckoff Phase (Accumulation or Distribution)
   */
  detectPhase(candles) {
    const lookback = Math.min(this.config.phaseLookback, candles.length);
    const recentCandles = candles.slice(-lookback);
    
    // Calculate range characteristics
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    const rangeHigh = Math.max(...highs);
    const rangeLow = Math.min(...lows);
    const range = rangeHigh - rangeLow;
    
    // Check if price is in a trading range (consolidation)
    const avgRange = range / lookback;
    const recentRange = Math.max(...recentCandles.slice(-20).map(c => c.high)) - 
                        Math.min(...recentCandles.slice(-20).map(c => c.low));
    const isConsolidating = recentRange < range * 0.5;
    
    // Analyze volume trend
    const volumes = recentCandles.map(c => c.volume || 1);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const recentAvgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeDecreasing = recentAvgVolume < avgVolume * 0.8;
    
    // Determine phase
    let phase = 'unknown';
    let subPhase = null;
    
    if (isConsolidating) {
      // Check for accumulation characteristics
      const currentPrice = recentCandles[recentCandles.length - 1].close;
      const pricePosition = (currentPrice - rangeLow) / range;
      
      if (pricePosition < 0.4 && volumeDecreasing) {
        phase = 'accumulation';
        subPhase = this.detectAccumulationSubPhase(recentCandles, rangeLow, rangeHigh);
      } else if (pricePosition > 0.6 && volumeDecreasing) {
        phase = 'distribution';
        subPhase = this.detectDistributionSubPhase(recentCandles, rangeLow, rangeHigh);
      } else {
        phase = 'ranging';
      }
    } else {
      // Trending market
      const firstPrice = recentCandles[0].close;
      const lastPrice = recentCandles[recentCandles.length - 1].close;
      
      if (lastPrice > firstPrice * 1.05) {
        phase = 'markup';
      } else if (lastPrice < firstPrice * 0.95) {
        phase = 'markdown';
      } else {
        phase = 'ranging';
      }
    }
    
    return {
      phase,
      subPhase,
      rangeHigh,
      rangeLow,
      isConsolidating,
      volumeTrend: volumeDecreasing ? 'decreasing' : 'increasing',
    };
  }

  /**
   * Detect Accumulation sub-phase
   */
  detectAccumulationSubPhase(candles, rangeLow, rangeHigh) {
    const len = candles.length;
    const lastCandle = candles[len - 1];
    const range = rangeHigh - rangeLow;
    
    // Phase A: Selling Climax (SC), Automatic Rally (AR)
    // Phase B: Secondary Test (ST)
    // Phase C: Spring/Test
    // Phase D: Sign of Strength (SOS), Last Point of Support (LPS)
    // Phase E: Markup begins
    
    // Check for recent spring (price below range then recovery)
    const recentLow = Math.min(...candles.slice(-10).map(c => c.low));
    const hasSpring = recentLow < rangeLow && lastCandle.close > rangeLow;
    
    if (hasSpring) {
      return 'phase_c'; // Spring phase
    }
    
    // Check for SOS (break above range with volume)
    const recentHigh = Math.max(...candles.slice(-10).map(c => c.high));
    if (recentHigh > rangeHigh * 0.98) {
      return 'phase_d'; // SOS phase
    }
    
    // Check for secondary test
    const priceNearLow = lastCandle.close < rangeLow + range * 0.2;
    if (priceNearLow) {
      return 'phase_b'; // Secondary test
    }
    
    return 'phase_a'; // Early accumulation
  }

  /**
   * Detect Distribution sub-phase
   */
  detectDistributionSubPhase(candles, rangeLow, rangeHigh) {
    const len = candles.length;
    const lastCandle = candles[len - 1];
    const range = rangeHigh - rangeLow;
    
    // Check for upthrust (price above range then rejection)
    const recentHigh = Math.max(...candles.slice(-10).map(c => c.high));
    const hasUpthrust = recentHigh > rangeHigh && lastCandle.close < rangeHigh;
    
    if (hasUpthrust) {
      return 'phase_c'; // Upthrust phase
    }
    
    // Check for SOW (break below range)
    const recentLow = Math.min(...candles.slice(-10).map(c => c.low));
    if (recentLow < rangeLow * 1.02) {
      return 'phase_d'; // SOW phase
    }
    
    // Check for secondary test of high
    const priceNearHigh = lastCandle.close > rangeHigh - range * 0.2;
    if (priceNearHigh) {
      return 'phase_b'; // Secondary test
    }
    
    return 'phase_a'; // Early distribution
  }

  /**
   * Detect Spring pattern (false breakdown below support)
   */
  detectSpring(candles) {
    const lookback = 30;
    const recentCandles = candles.slice(-lookback);
    
    // Find support level (recent lows)
    const lows = recentCandles.slice(0, -5).map(c => c.low);
    const supportLevel = Math.min(...lows);
    
    // Look for spring pattern in last 5 candles
    for (let i = recentCandles.length - 5; i < recentCandles.length; i++) {
      const candle = recentCandles[i];
      
      // Spring: price breaks below support then closes above
      if (candle.low < supportLevel * 0.998 && candle.close > supportLevel) {
        // Check for follow-through (next candles bullish)
        const followThrough = recentCandles.slice(i + 1).every(c => c.close > c.open);
        
        return {
          detected: true,
          price: candle.low,
          supportLevel,
          index: i,
          followThrough,
          strength: followThrough ? 'strong' : 'weak',
        };
      }
    }
    
    return { detected: false };
  }

  /**
   * Detect Upthrust pattern (false breakout above resistance)
   */
  detectUpthrust(candles) {
    const lookback = 30;
    const recentCandles = candles.slice(-lookback);
    
    // Find resistance level (recent highs)
    const highs = recentCandles.slice(0, -5).map(c => c.high);
    const resistanceLevel = Math.max(...highs);
    
    // Look for upthrust pattern in last 5 candles
    for (let i = recentCandles.length - 5; i < recentCandles.length; i++) {
      const candle = recentCandles[i];
      
      // Upthrust: price breaks above resistance then closes below
      if (candle.high > resistanceLevel * 1.002 && candle.close < resistanceLevel) {
        // Check for follow-through (next candles bearish)
        const followThrough = recentCandles.slice(i + 1).every(c => c.close < c.open);
        
        return {
          detected: true,
          price: candle.high,
          resistanceLevel,
          index: i,
          followThrough,
          strength: followThrough ? 'strong' : 'weak',
        };
      }
    }
    
    return { detected: false };
  }

  /**
   * Detect Sign of Strength (SOS)
   */
  detectSOS(candles) {
    const lookback = 20;
    const recentCandles = candles.slice(-lookback);
    
    // SOS: Strong bullish candle with high volume breaking above resistance
    const avgVolume = recentCandles.map(c => c.volume || 1).reduce((a, b) => a + b, 0) / lookback;
    const resistanceLevel = Math.max(...recentCandles.slice(0, -5).map(c => c.high));
    
    const sosCandles = [];
    
    for (let i = lookback - 5; i < lookback; i++) {
      const candle = recentCandles[i];
      const isBullish = candle.close > candle.open;
      const isHighVolume = (candle.volume || 1) > avgVolume * this.config.volumeThreshold;
      const breaksResistance = candle.close > resistanceLevel;
      
      if (isBullish && isHighVolume && breaksResistance) {
        sosCandles.push({
          index: i,
          price: candle.close,
          volume: candle.volume,
        });
      }
    }
    
    return {
      detected: sosCandles.length > 0,
      events: sosCandles,
    };
  }

  /**
   * Detect Sign of Weakness (SOW)
   */
  detectSOW(candles) {
    const lookback = 20;
    const recentCandles = candles.slice(-lookback);
    
    // SOW: Strong bearish candle with high volume breaking below support
    const avgVolume = recentCandles.map(c => c.volume || 1).reduce((a, b) => a + b, 0) / lookback;
    const supportLevel = Math.min(...recentCandles.slice(0, -5).map(c => c.low));
    
    const sowCandles = [];
    
    for (let i = lookback - 5; i < lookback; i++) {
      const candle = recentCandles[i];
      const isBearish = candle.close < candle.open;
      const isHighVolume = (candle.volume || 1) > avgVolume * this.config.volumeThreshold;
      const breaksSupport = candle.close < supportLevel;
      
      if (isBearish && isHighVolume && breaksSupport) {
        sowCandles.push({
          index: i,
          price: candle.close,
          volume: candle.volume,
        });
      }
    }
    
    return {
      detected: sowCandles.length > 0,
      events: sowCandles,
    };
  }

  /**
   * Analyze volume patterns
   */
  analyzeVolume(candles) {
    const lookback = 50;
    const recentCandles = candles.slice(-lookback);
    const volumes = recentCandles.map(c => c.volume || 1);
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / lookback;
    const recentAvgVolume = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    
    // Detect volume climax
    const maxVolume = Math.max(...volumes);
    const climaxIndex = volumes.indexOf(maxVolume);
    const hasClimax = maxVolume > avgVolume * 2;
    
    // Detect volume dry-up
    const minRecentVolume = Math.min(...volumes.slice(-10));
    const hasDryUp = minRecentVolume < avgVolume * 0.5;
    
    return {
      avgVolume,
      recentAvgVolume,
      trend: recentAvgVolume > avgVolume ? 'increasing' : 'decreasing',
      hasClimax,
      climaxIndex: hasClimax ? climaxIndex : null,
      hasDryUp,
      ratio: recentAvgVolume / avgVolume,
    };
  }

  /**
   * Determine overall bias
   */
  determineBias(phase, spring, upthrust, sos, sow) {
    let bullishScore = 0;
    let bearishScore = 0;
    
    // Phase bias
    if (phase.phase === 'accumulation') bullishScore += 2;
    if (phase.phase === 'distribution') bearishScore += 2;
    if (phase.phase === 'markup') bullishScore += 3;
    if (phase.phase === 'markdown') bearishScore += 3;
    
    // Spring/Upthrust
    if (spring.detected) bullishScore += spring.followThrough ? 3 : 1;
    if (upthrust.detected) bearishScore += upthrust.followThrough ? 3 : 1;
    
    // SOS/SOW
    if (sos.detected) bullishScore += 2;
    if (sow.detected) bearishScore += 2;
    
    if (bullishScore > bearishScore + 1) return 'bullish';
    if (bearishScore > bullishScore + 1) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate Wyckoff score
   */
  calculateScore(phase, spring, upthrust, sos, sow, volumeAnalysis) {
    let score = 50;
    
    // Phase clarity
    if (phase.phase !== 'unknown' && phase.phase !== 'ranging') {
      score += 15;
    }
    
    // Spring/Upthrust patterns
    if (spring.detected && spring.strength === 'strong') score += 20;
    else if (spring.detected) score += 10;
    
    if (upthrust.detected && upthrust.strength === 'strong') score += 20;
    else if (upthrust.detected) score += 10;
    
    // SOS/SOW
    if (sos.detected) score += 10;
    if (sow.detected) score += 10;
    
    // Volume confirmation
    if (volumeAnalysis.hasClimax) score += 5;
    if (volumeAnalysis.hasDryUp && phase.phase === 'accumulation') score += 5;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get empty analysis
   */
  getEmptyAnalysis() {
    return {
      phase: { phase: 'unknown', subPhase: null },
      spring: { detected: false },
      upthrust: { detected: false },
      sos: { detected: false, events: [] },
      sow: { detected: false, events: [] },
      volumeAnalysis: { trend: 'neutral', hasClimax: false, hasDryUp: false },
      score: 0,
      bias: 'neutral',
    };
  }
}

export default WyckoffAnalyzer;
