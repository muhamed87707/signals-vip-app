/**
 * VSA Analyzer - Volume Spread Analysis
 * Detects No Demand/No Supply, Stopping Volume, Climactic Action
 */

export class VSAAnalyzer {
  constructor(config = {}) {
    this.config = {
      volumeLookback: 20,
      spreadThreshold: 0.3, // Narrow spread threshold
      volumeHighThreshold: 1.5, // High volume multiplier
      volumeLowThreshold: 0.5, // Low volume multiplier
      ...config,
    };
  }

  /**
   * Perform full VSA analysis
   */
  async analyze(marketData) {
    const candles = marketData.H1?.candles || [];
    
    if (candles.length < 30) {
      return this.getEmptyAnalysis();
    }

    // Calculate volume metrics
    const volumeMetrics = this.calculateVolumeMetrics(candles);
    
    // Detect VSA patterns
    const noDemand = this.detectNoDemand(candles, volumeMetrics);
    const noSupply = this.detectNoSupply(candles, volumeMetrics);
    const stoppingVolume = this.detectStoppingVolume(candles, volumeMetrics);
    const climacticAction = this.detectClimacticAction(candles, volumeMetrics);
    const testPatterns = this.detectTestPatterns(candles, volumeMetrics);
    
    // Analyze effort vs result
    const effortResult = this.analyzeEffortVsResult(candles, volumeMetrics);
    
    // Calculate VSA score
    const score = this.calculateScore(noDemand, noSupply, stoppingVolume, climacticAction, effortResult);

    return {
      volumeMetrics,
      noDemand,
      noSupply,
      stoppingVolume,
      climacticAction,
      testPatterns,
      effortResult,
      score,
      bias: this.determineBias(noDemand, noSupply, stoppingVolume, climacticAction),
    };
  }

  /**
   * Calculate volume metrics
   */
  calculateVolumeMetrics(candles) {
    const lookback = Math.min(this.config.volumeLookback, candles.length);
    const recentCandles = candles.slice(-lookback);
    const volumes = recentCandles.map(c => c.volume || 1);
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / lookback;
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);
    
    // Calculate volume trend
    const firstHalf = volumes.slice(0, Math.floor(lookback / 2));
    const secondHalf = volumes.slice(Math.floor(lookback / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const currentVolume = volumes[volumes.length - 1];
    
    return {
      avgVolume,
      maxVolume,
      minVolume,
      currentVolume,
      volumeTrend: secondHalfAvg > firstHalfAvg ? 'increasing' : 'decreasing',
      relativeVolume: currentVolume / avgVolume,
      isHighVolume: currentVolume > avgVolume * this.config.volumeHighThreshold,
      isLowVolume: currentVolume < avgVolume * this.config.volumeLowThreshold,
    };
  }

  /**
   * Detect No Demand bars (bearish signal)
   * Characteristics: Up bar, narrow spread, low volume, closes in middle/low
   */
  detectNoDemand(candles, volumeMetrics) {
    const patterns = [];
    const lookback = 10;
    
    for (let i = candles.length - lookback; i < candles.length; i++) {
      const candle = candles[i];
      const spread = candle.high - candle.low;
      const avgSpread = this.calculateAvgSpread(candles, i);
      const volume = candle.volume || 1;
      
      // Up bar
      const isUpBar = candle.close > candle.open;
      
      // Narrow spread
      const isNarrowSpread = spread < avgSpread * this.config.spreadThreshold;
      
      // Low volume
      const isLowVolume = volume < volumeMetrics.avgVolume * this.config.volumeLowThreshold;
      
      // Close in lower half
      const closePosition = (candle.close - candle.low) / spread;
      const closesLow = closePosition < 0.5;
      
      if (isUpBar && isNarrowSpread && isLowVolume && closesLow) {
        patterns.push({
          index: i,
          timestamp: candle.timestamp,
          price: candle.close,
          volume,
          spread,
          strength: this.calculatePatternStrength(isNarrowSpread, isLowVolume, closePosition),
        });
      }
    }
    
    return {
      detected: patterns.length > 0,
      patterns,
      signal: patterns.length > 0 ? 'bearish' : 'neutral',
    };
  }

  /**
   * Detect No Supply bars (bullish signal)
   * Characteristics: Down bar, narrow spread, low volume, closes in middle/high
   */
  detectNoSupply(candles, volumeMetrics) {
    const patterns = [];
    const lookback = 10;
    
    for (let i = candles.length - lookback; i < candles.length; i++) {
      const candle = candles[i];
      const spread = candle.high - candle.low;
      const avgSpread = this.calculateAvgSpread(candles, i);
      const volume = candle.volume || 1;
      
      // Down bar
      const isDownBar = candle.close < candle.open;
      
      // Narrow spread
      const isNarrowSpread = spread < avgSpread * this.config.spreadThreshold;
      
      // Low volume
      const isLowVolume = volume < volumeMetrics.avgVolume * this.config.volumeLowThreshold;
      
      // Close in upper half
      const closePosition = (candle.close - candle.low) / spread;
      const closesHigh = closePosition > 0.5;
      
      if (isDownBar && isNarrowSpread && isLowVolume && closesHigh) {
        patterns.push({
          index: i,
          timestamp: candle.timestamp,
          price: candle.close,
          volume,
          spread,
          strength: this.calculatePatternStrength(isNarrowSpread, isLowVolume, 1 - closePosition),
        });
      }
    }
    
    return {
      detected: patterns.length > 0,
      patterns,
      signal: patterns.length > 0 ? 'bullish' : 'neutral',
    };
  }

  /**
   * Detect Stopping Volume (potential reversal)
   * Characteristics: High volume, wide spread, closes off lows/highs
   */
  detectStoppingVolume(candles, volumeMetrics) {
    const patterns = [];
    const lookback = 10;
    
    for (let i = candles.length - lookback; i < candles.length; i++) {
      const candle = candles[i];
      const spread = candle.high - candle.low;
      const avgSpread = this.calculateAvgSpread(candles, i);
      const volume = candle.volume || 1;
      
      // High volume
      const isHighVolume = volume > volumeMetrics.avgVolume * this.config.volumeHighThreshold;
      
      // Wide spread
      const isWideSpread = spread > avgSpread * 1.5;
      
      // Close position
      const closePosition = (candle.close - candle.low) / spread;
      
      // Bullish stopping volume: Down move with close near high
      if (isHighVolume && isWideSpread && candle.close < candle.open && closePosition > 0.6) {
        patterns.push({
          type: 'bullish',
          index: i,
          timestamp: candle.timestamp,
          price: candle.close,
          volume,
          spread,
          closePosition,
        });
      }
      
      // Bearish stopping volume: Up move with close near low
      if (isHighVolume && isWideSpread && candle.close > candle.open && closePosition < 0.4) {
        patterns.push({
          type: 'bearish',
          index: i,
          timestamp: candle.timestamp,
          price: candle.close,
          volume,
          spread,
          closePosition,
        });
      }
    }
    
    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Detect Climactic Action (exhaustion)
   * Characteristics: Ultra-high volume, very wide spread, often at extremes
   */
  detectClimacticAction(candles, volumeMetrics) {
    const patterns = [];
    const lookback = 20;
    
    for (let i = candles.length - lookback; i < candles.length; i++) {
      const candle = candles[i];
      const spread = candle.high - candle.low;
      const avgSpread = this.calculateAvgSpread(candles, i);
      const volume = candle.volume || 1;
      
      // Ultra-high volume (2x average)
      const isUltraHighVolume = volume > volumeMetrics.avgVolume * 2;
      
      // Very wide spread
      const isVeryWideSpread = spread > avgSpread * 2;
      
      if (isUltraHighVolume && isVeryWideSpread) {
        const closePosition = (candle.close - candle.low) / spread;
        const type = candle.close > candle.open ? 'buying_climax' : 'selling_climax';
        
        patterns.push({
          type,
          index: i,
          timestamp: candle.timestamp,
          price: candle.close,
          volume,
          spread,
          volumeRatio: volume / volumeMetrics.avgVolume,
          spreadRatio: spread / avgSpread,
          closePosition,
        });
      }
    }
    
    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Detect Test patterns
   * Test: Low volume return to previous support/resistance
   */
  detectTestPatterns(candles, volumeMetrics) {
    const patterns = [];
    const lookback = 30;
    const recentCandles = candles.slice(-lookback);
    
    // Find recent significant levels
    const significantLow = Math.min(...recentCandles.slice(0, -5).map(c => c.low));
    const significantHigh = Math.max(...recentCandles.slice(0, -5).map(c => c.high));
    
    // Check last 5 candles for tests
    for (let i = recentCandles.length - 5; i < recentCandles.length; i++) {
      const candle = recentCandles[i];
      const volume = candle.volume || 1;
      const isLowVolume = volume < volumeMetrics.avgVolume * 0.7;
      
      // Test of support (bullish)
      const tolerance = (significantHigh - significantLow) * 0.02;
      if (Math.abs(candle.low - significantLow) < tolerance && isLowVolume && candle.close > candle.open) {
        patterns.push({
          type: 'support_test',
          signal: 'bullish',
          index: i,
          level: significantLow,
          volume,
        });
      }
      
      // Test of resistance (bearish)
      if (Math.abs(candle.high - significantHigh) < tolerance && isLowVolume && candle.close < candle.open) {
        patterns.push({
          type: 'resistance_test',
          signal: 'bearish',
          index: i,
          level: significantHigh,
          volume,
        });
      }
    }
    
    return {
      detected: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Analyze Effort vs Result
   * High effort (volume) should produce proportional result (price movement)
   */
  analyzeEffortVsResult(candles, volumeMetrics) {
    const lookback = 10;
    const results = [];
    
    for (let i = candles.length - lookback; i < candles.length; i++) {
      const candle = candles[i];
      const volume = candle.volume || 1;
      const priceChange = Math.abs(candle.close - candle.open);
      const avgPriceChange = this.calculateAvgPriceChange(candles, i);
      
      const volumeRatio = volume / volumeMetrics.avgVolume;
      const priceRatio = priceChange / (avgPriceChange || 1);
      
      // Effort vs Result ratio
      const evr = volumeRatio / (priceRatio || 1);
      
      let interpretation = 'normal';
      if (evr > 2) {
        // High effort, low result - absorption
        interpretation = 'absorption';
      } else if (evr < 0.5) {
        // Low effort, high result - easy movement
        interpretation = 'easy_movement';
      }
      
      results.push({
        index: i,
        volumeRatio,
        priceRatio,
        evr,
        interpretation,
      });
    }
    
    // Summarize
    const absorptionCount = results.filter(r => r.interpretation === 'absorption').length;
    const easyMovementCount = results.filter(r => r.interpretation === 'easy_movement').length;
    
    return {
      results,
      summary: {
        absorptionBars: absorptionCount,
        easyMovementBars: easyMovementCount,
        dominantPattern: absorptionCount > easyMovementCount ? 'absorption' : 
                         easyMovementCount > absorptionCount ? 'easy_movement' : 'balanced',
      },
    };
  }

  /**
   * Calculate average spread
   */
  calculateAvgSpread(candles, currentIndex) {
    const lookback = 20;
    const start = Math.max(0, currentIndex - lookback);
    const spreads = candles.slice(start, currentIndex).map(c => c.high - c.low);
    return spreads.reduce((a, b) => a + b, 0) / spreads.length || 1;
  }

  /**
   * Calculate average price change
   */
  calculateAvgPriceChange(candles, currentIndex) {
    const lookback = 20;
    const start = Math.max(0, currentIndex - lookback);
    const changes = candles.slice(start, currentIndex).map(c => Math.abs(c.close - c.open));
    return changes.reduce((a, b) => a + b, 0) / changes.length || 1;
  }

  /**
   * Calculate pattern strength
   */
  calculatePatternStrength(isNarrowSpread, isLowVolume, closePosition) {
    let strength = 50;
    if (isNarrowSpread) strength += 20;
    if (isLowVolume) strength += 20;
    strength += (1 - closePosition) * 10;
    return Math.min(100, Math.round(strength));
  }

  /**
   * Determine bias
   */
  determineBias(noDemand, noSupply, stoppingVolume, climacticAction) {
    let bullishScore = 0;
    let bearishScore = 0;
    
    if (noSupply.detected) bullishScore += 2;
    if (noDemand.detected) bearishScore += 2;
    
    stoppingVolume.patterns.forEach(p => {
      if (p.type === 'bullish') bullishScore += 2;
      if (p.type === 'bearish') bearishScore += 2;
    });
    
    climacticAction.patterns.forEach(p => {
      // Climax often signals reversal
      if (p.type === 'selling_climax') bullishScore += 1;
      if (p.type === 'buying_climax') bearishScore += 1;
    });
    
    if (bullishScore > bearishScore + 1) return 'bullish';
    if (bearishScore > bullishScore + 1) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate VSA score
   */
  calculateScore(noDemand, noSupply, stoppingVolume, climacticAction, effortResult) {
    let score = 50;
    
    // Pattern detection
    if (noDemand.detected || noSupply.detected) score += 15;
    if (stoppingVolume.detected) score += 20;
    if (climacticAction.detected) score += 15;
    
    // Effort vs Result clarity
    if (effortResult.summary.dominantPattern !== 'balanced') {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get empty analysis
   */
  getEmptyAnalysis() {
    return {
      volumeMetrics: { avgVolume: 0, relativeVolume: 1, volumeTrend: 'neutral' },
      noDemand: { detected: false, patterns: [], signal: 'neutral' },
      noSupply: { detected: false, patterns: [], signal: 'neutral' },
      stoppingVolume: { detected: false, patterns: [] },
      climacticAction: { detected: false, patterns: [] },
      testPatterns: { detected: false, patterns: [] },
      effortResult: { results: [], summary: { dominantPattern: 'balanced' } },
      score: 0,
      bias: 'neutral',
    };
  }
}

export default VSAAnalyzer;
