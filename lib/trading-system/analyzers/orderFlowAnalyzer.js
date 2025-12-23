/**
 * Order Flow Analyzer
 * تحليل تدفق الأوامر
 * 
 * Analyzes order flow patterns including:
 * - Delta (buying vs selling pressure)
 * - Absorption patterns
 * - Exhaustion patterns
 * - Imbalances
 */

export class OrderFlowAnalyzer {
  constructor(config = {}) {
    this.config = {
      deltaThreshold: 0.6,
      absorptionMinVolume: 1.5,
      exhaustionThreshold: 2.0,
      imbalanceRatio: 3.0,
      ...config,
    };
  }

  /**
   * Analyze order flow for given candles
   * @param {Array} candles - OHLCV data
   * @returns {Object} Order flow analysis
   */
  analyze(candles) {
    if (!candles || candles.length < 10) {
      return this.getEmptyAnalysis();
    }

    const delta = this.calculateDelta(candles);
    const absorption = this.detectAbsorption(candles);
    const exhaustion = this.detectExhaustion(candles);
    const imbalances = this.detectImbalances(candles);
    const cumulativeDelta = this.calculateCumulativeDelta(candles);

    const signal = this.generateSignal(delta, absorption, exhaustion, imbalances);
    const score = this.calculateScore(delta, absorption, exhaustion, imbalances);

    return {
      delta,
      cumulativeDelta,
      absorption,
      exhaustion,
      imbalances,
      signal,
      score,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate delta (buying vs selling pressure)
   */
  calculateDelta(candles) {
    const recentCandles = candles.slice(-20);
    let buyVolume = 0;
    let sellVolume = 0;

    recentCandles.forEach(candle => {
      const bodySize = Math.abs(candle.close - candle.open);
      const totalRange = candle.high - candle.low;
      
      if (totalRange === 0) return;

      const buyRatio = candle.close > candle.open 
        ? (bodySize / totalRange) 
        : (1 - bodySize / totalRange) * 0.5;
      
      buyVolume += candle.volume * buyRatio;
      sellVolume += candle.volume * (1 - buyRatio);
    });

    const totalVolume = buyVolume + sellVolume;
    const deltaValue = totalVolume > 0 ? (buyVolume - sellVolume) / totalVolume : 0;

    return {
      value: deltaValue,
      buyVolume,
      sellVolume,
      bias: deltaValue > this.config.deltaThreshold ? 'bullish' 
          : deltaValue < -this.config.deltaThreshold ? 'bearish' 
          : 'neutral',
    };
  }

  /**
   * Calculate cumulative delta
   */
  calculateCumulativeDelta(candles) {
    let cumDelta = 0;
    const history = [];

    candles.forEach(candle => {
      const isBullish = candle.close > candle.open;
      const delta = isBullish ? candle.volume : -candle.volume;
      cumDelta += delta;
      history.push({
        timestamp: candle.timestamp,
        delta,
        cumulative: cumDelta,
      });
    });

    return {
      current: cumDelta,
      history: history.slice(-50),
      trend: this.detectCumulativeDeltaTrend(history),
    };
  }

  /**
   * Detect cumulative delta trend
   */
  detectCumulativeDeltaTrend(history) {
    if (history.length < 10) return 'neutral';

    const recent = history.slice(-10);
    const first = recent[0].cumulative;
    const last = recent[recent.length - 1].cumulative;
    const change = last - first;
    const avgVolume = recent.reduce((sum, h) => sum + Math.abs(h.delta), 0) / recent.length;

    if (change > avgVolume * 2) return 'rising';
    if (change < -avgVolume * 2) return 'falling';
    return 'neutral';
  }

  /**
   * Detect absorption patterns
   */
  detectAbsorption(candles) {
    const absorptions = [];
    const avgVolume = this.calculateAverageVolume(candles);

    for (let i = 5; i < candles.length; i++) {
      const candle = candles[i];
      const prevCandles = candles.slice(i - 5, i);
      
      // High volume with small body = absorption
      const bodySize = Math.abs(candle.close - candle.open);
      const totalRange = candle.high - candle.low;
      const bodyRatio = totalRange > 0 ? bodySize / totalRange : 0;
      
      if (candle.volume > avgVolume * this.config.absorptionMinVolume && bodyRatio < 0.3) {
        const prevTrend = this.detectTrend(prevCandles);
        
        absorptions.push({
          timestamp: candle.timestamp,
          price: candle.close,
          volume: candle.volume,
          type: prevTrend === 'up' ? 'selling_absorbed' : 'buying_absorbed',
          strength: candle.volume / avgVolume,
        });
      }
    }

    return {
      detected: absorptions.length > 0,
      patterns: absorptions.slice(-5),
      latestType: absorptions.length > 0 ? absorptions[absorptions.length - 1].type : null,
    };
  }

  /**
   * Detect exhaustion patterns
   */
  detectExhaustion(candles) {
    const exhaustions = [];
    const avgVolume = this.calculateAverageVolume(candles);

    for (let i = 10; i < candles.length; i++) {
      const candle = candles[i];
      const prevCandles = candles.slice(i - 10, i);
      
      // Very high volume with reversal = exhaustion
      if (candle.volume > avgVolume * this.config.exhaustionThreshold) {
        const prevTrend = this.detectTrend(prevCandles);
        const isReversal = (prevTrend === 'up' && candle.close < candle.open) ||
                          (prevTrend === 'down' && candle.close > candle.open);
        
        if (isReversal) {
          exhaustions.push({
            timestamp: candle.timestamp,
            price: candle.close,
            volume: candle.volume,
            type: prevTrend === 'up' ? 'buying_exhaustion' : 'selling_exhaustion',
            strength: candle.volume / avgVolume,
          });
        }
      }
    }

    return {
      detected: exhaustions.length > 0,
      patterns: exhaustions.slice(-3),
      latestType: exhaustions.length > 0 ? exhaustions[exhaustions.length - 1].type : null,
    };
  }

  /**
   * Detect volume imbalances
   */
  detectImbalances(candles) {
    const imbalances = [];

    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const prev = candles[i - 1];
      
      const volumeRatio = prev.volume > 0 ? current.volume / prev.volume : 1;
      
      if (volumeRatio > this.config.imbalanceRatio) {
        imbalances.push({
          timestamp: current.timestamp,
          price: current.close,
          ratio: volumeRatio,
          direction: current.close > current.open ? 'bullish' : 'bearish',
        });
      }
    }

    return {
      detected: imbalances.length > 0,
      patterns: imbalances.slice(-5),
      latestDirection: imbalances.length > 0 ? imbalances[imbalances.length - 1].direction : null,
    };
  }

  /**
   * Generate trading signal from order flow
   */
  generateSignal(delta, absorption, exhaustion, imbalances) {
    let bullishScore = 0;
    let bearishScore = 0;

    // Delta contribution
    if (delta.bias === 'bullish') bullishScore += 30;
    else if (delta.bias === 'bearish') bearishScore += 30;

    // Absorption contribution
    if (absorption.latestType === 'selling_absorbed') bullishScore += 25;
    else if (absorption.latestType === 'buying_absorbed') bearishScore += 25;

    // Exhaustion contribution
    if (exhaustion.latestType === 'buying_exhaustion') bearishScore += 25;
    else if (exhaustion.latestType === 'selling_exhaustion') bullishScore += 25;

    // Imbalance contribution
    if (imbalances.latestDirection === 'bullish') bullishScore += 20;
    else if (imbalances.latestDirection === 'bearish') bearishScore += 20;

    if (bullishScore > bearishScore + 20) {
      return { direction: 'BUY', strength: bullishScore };
    } else if (bearishScore > bullishScore + 20) {
      return { direction: 'SELL', strength: bearishScore };
    }
    return { direction: 'NEUTRAL', strength: 0 };
  }

  /**
   * Calculate order flow score (0-100)
   */
  calculateScore(delta, absorption, exhaustion, imbalances) {
    let score = 50; // Base score

    // Delta strength
    score += Math.abs(delta.value) * 20;

    // Absorption patterns
    if (absorption.detected) {
      score += absorption.patterns.length * 5;
    }

    // Exhaustion patterns
    if (exhaustion.detected) {
      score += exhaustion.patterns.length * 10;
    }

    // Imbalances
    if (imbalances.detected) {
      score += imbalances.patterns.length * 5;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Calculate average volume
   */
  calculateAverageVolume(candles) {
    if (candles.length === 0) return 0;
    return candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
  }

  /**
   * Detect trend from candles
   */
  detectTrend(candles) {
    if (candles.length < 2) return 'neutral';
    const first = candles[0].close;
    const last = candles[candles.length - 1].close;
    const change = (last - first) / first;
    
    if (change > 0.001) return 'up';
    if (change < -0.001) return 'down';
    return 'neutral';
  }

  /**
   * Get empty analysis result
   */
  getEmptyAnalysis() {
    return {
      delta: { value: 0, buyVolume: 0, sellVolume: 0, bias: 'neutral' },
      cumulativeDelta: { current: 0, history: [], trend: 'neutral' },
      absorption: { detected: false, patterns: [], latestType: null },
      exhaustion: { detected: false, patterns: [], latestType: null },
      imbalances: { detected: false, patterns: [], latestDirection: null },
      signal: { direction: 'NEUTRAL', strength: 0 },
      score: 50,
      timestamp: Date.now(),
    };
  }
}
