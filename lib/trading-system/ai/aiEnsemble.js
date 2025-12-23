/**
 * AI Ensemble
 * نظام الذكاء الاصطناعي المتكامل
 * 
 * Integrates multiple AI models for:
 * - Pattern recognition
 * - Probability calculation
 * - Market regime detection
 * - Signal validation
 */

export class AIEnsemble {
  constructor(config = {}) {
    this.config = {
      minConfidence: 0.70, // 70% minimum confidence
      geminiApiKey: config.geminiApiKey || process.env.GEMINI_API_KEY,
      enablePatternRecognition: true,
      enableRegimeDetection: true,
      ...config,
    };
  }

  /**
   * Analyze market using AI ensemble
   * @param {string} symbol - Trading symbol
   * @param {Array} candles - OHLCV data
   * @param {Object} analysisContext - Context from other analyzers
   * @returns {Object} AI analysis
   */
  async analyze(symbol, candles, analysisContext = {}) {
    const patternRecognition = this.config.enablePatternRecognition 
      ? await this.recognizePatterns(candles)
      : { patterns: [], confidence: 0 };

    const regimeDetection = this.config.enableRegimeDetection
      ? this.detectMarketRegime(candles)
      : { regime: 'unknown', confidence: 0 };

    const probability = this.calculateProbability(candles, analysisContext);
    const prediction = await this.generatePrediction(symbol, candles, analysisContext);
    const validation = this.validateSignal(analysisContext, prediction);

    const confidence = this.calculateOverallConfidence(
      patternRecognition,
      regimeDetection,
      probability,
      prediction
    );

    return {
      symbol,
      patternRecognition,
      regimeDetection,
      probability,
      prediction,
      validation,
      confidence,
      meetsThreshold: confidence >= this.config.minConfidence,
      timestamp: Date.now(),
    };
  }

  /**
   * Recognize chart patterns using AI
   */
  async recognizePatterns(candles) {
    if (!candles || candles.length < 50) {
      return { patterns: [], confidence: 0 };
    }

    const patterns = [];

    // Head and Shoulders detection
    const headShoulders = this.detectHeadAndShoulders(candles);
    if (headShoulders.detected) {
      patterns.push(headShoulders);
    }

    // Double Top/Bottom detection
    const doublePattern = this.detectDoublePattern(candles);
    if (doublePattern.detected) {
      patterns.push(doublePattern);
    }

    // Triangle detection
    const triangle = this.detectTriangle(candles);
    if (triangle.detected) {
      patterns.push(triangle);
    }

    // Wedge detection
    const wedge = this.detectWedge(candles);
    if (wedge.detected) {
      patterns.push(wedge);
    }

    // Channel detection
    const channel = this.detectChannel(candles);
    if (channel.detected) {
      patterns.push(channel);
    }

    const avgConfidence = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
      : 0;

    return {
      patterns,
      count: patterns.length,
      confidence: avgConfidence,
      dominantPattern: patterns.length > 0 
        ? patterns.reduce((a, b) => a.confidence > b.confidence ? a : b)
        : null,
    };
  }

  /**
   * Detect Head and Shoulders pattern
   */
  detectHeadAndShoulders(candles) {
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const len = highs.length;

    if (len < 30) return { detected: false };

    // Find potential head (highest point in middle third)
    const middleStart = Math.floor(len / 3);
    const middleEnd = Math.floor(2 * len / 3);
    
    let headIdx = middleStart;
    for (let i = middleStart; i < middleEnd; i++) {
      if (highs[i] > highs[headIdx]) headIdx = i;
    }

    // Find left shoulder (highest before head)
    let leftShoulderIdx = 0;
    for (let i = 0; i < headIdx - 5; i++) {
      if (highs[i] > highs[leftShoulderIdx]) leftShoulderIdx = i;
    }

    // Find right shoulder (highest after head)
    let rightShoulderIdx = headIdx + 5;
    for (let i = headIdx + 5; i < len; i++) {
      if (highs[i] > highs[rightShoulderIdx]) rightShoulderIdx = i;
    }

    // Validate pattern
    const head = highs[headIdx];
    const leftShoulder = highs[leftShoulderIdx];
    const rightShoulder = highs[rightShoulderIdx];

    const isValid = head > leftShoulder && 
                   head > rightShoulder &&
                   Math.abs(leftShoulder - rightShoulder) / head < 0.03;

    if (!isValid) return { detected: false };

    // Calculate neckline
    const leftNeck = lows.slice(leftShoulderIdx, headIdx).reduce((a, b) => Math.min(a, b));
    const rightNeck = lows.slice(headIdx, rightShoulderIdx).reduce((a, b) => Math.min(a, b));
    const neckline = (leftNeck + rightNeck) / 2;

    return {
      detected: true,
      type: 'head_and_shoulders',
      direction: 'bearish',
      confidence: 0.75,
      levels: {
        head,
        leftShoulder,
        rightShoulder,
        neckline,
        target: neckline - (head - neckline),
      },
    };
  }

  /**
   * Detect Double Top/Bottom pattern
   */
  detectDoublePattern(candles) {
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const len = highs.length;

    if (len < 20) return { detected: false };

    // Check for double top
    const maxHigh = Math.max(...highs);
    const highIndices = highs.map((h, i) => ({ h, i }))
      .filter(x => x.h >= maxHigh * 0.98)
      .map(x => x.i);

    if (highIndices.length >= 2) {
      const first = highIndices[0];
      const second = highIndices[highIndices.length - 1];
      
      if (second - first >= 10) {
        const middleLow = Math.min(...lows.slice(first, second));
        return {
          detected: true,
          type: 'double_top',
          direction: 'bearish',
          confidence: 0.70,
          levels: {
            top1: highs[first],
            top2: highs[second],
            neckline: middleLow,
            target: middleLow - (maxHigh - middleLow),
          },
        };
      }
    }

    // Check for double bottom
    const minLow = Math.min(...lows);
    const lowIndices = lows.map((l, i) => ({ l, i }))
      .filter(x => x.l <= minLow * 1.02)
      .map(x => x.i);

    if (lowIndices.length >= 2) {
      const first = lowIndices[0];
      const second = lowIndices[lowIndices.length - 1];
      
      if (second - first >= 10) {
        const middleHigh = Math.max(...highs.slice(first, second));
        return {
          detected: true,
          type: 'double_bottom',
          direction: 'bullish',
          confidence: 0.70,
          levels: {
            bottom1: lows[first],
            bottom2: lows[second],
            neckline: middleHigh,
            target: middleHigh + (middleHigh - minLow),
          },
        };
      }
    }

    return { detected: false };
  }

  /**
   * Detect Triangle pattern
   */
  detectTriangle(candles) {
    if (candles.length < 20) return { detected: false };

    const recent = candles.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);

    // Calculate trend lines
    const highSlope = this.calculateSlope(highs);
    const lowSlope = this.calculateSlope(lows);

    // Ascending triangle: flat top, rising bottom
    if (Math.abs(highSlope) < 0.0001 && lowSlope > 0.0001) {
      return {
        detected: true,
        type: 'ascending_triangle',
        direction: 'bullish',
        confidence: 0.65,
        levels: {
          resistance: Math.max(...highs),
          support: lows[lows.length - 1],
        },
      };
    }

    // Descending triangle: falling top, flat bottom
    if (highSlope < -0.0001 && Math.abs(lowSlope) < 0.0001) {
      return {
        detected: true,
        type: 'descending_triangle',
        direction: 'bearish',
        confidence: 0.65,
        levels: {
          resistance: highs[highs.length - 1],
          support: Math.min(...lows),
        },
      };
    }

    // Symmetrical triangle: converging
    if (highSlope < -0.0001 && lowSlope > 0.0001) {
      return {
        detected: true,
        type: 'symmetrical_triangle',
        direction: 'neutral',
        confidence: 0.60,
        levels: {
          resistance: highs[highs.length - 1],
          support: lows[lows.length - 1],
        },
      };
    }

    return { detected: false };
  }

  /**
   * Detect Wedge pattern
   */
  detectWedge(candles) {
    if (candles.length < 20) return { detected: false };

    const recent = candles.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);

    const highSlope = this.calculateSlope(highs);
    const lowSlope = this.calculateSlope(lows);

    // Rising wedge (bearish)
    if (highSlope > 0 && lowSlope > 0 && highSlope < lowSlope) {
      return {
        detected: true,
        type: 'rising_wedge',
        direction: 'bearish',
        confidence: 0.65,
      };
    }

    // Falling wedge (bullish)
    if (highSlope < 0 && lowSlope < 0 && highSlope > lowSlope) {
      return {
        detected: true,
        type: 'falling_wedge',
        direction: 'bullish',
        confidence: 0.65,
      };
    }

    return { detected: false };
  }

  /**
   * Detect Channel pattern
   */
  detectChannel(candles) {
    if (candles.length < 20) return { detected: false };

    const recent = candles.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);

    const highSlope = this.calculateSlope(highs);
    const lowSlope = this.calculateSlope(lows);

    // Parallel lines = channel
    if (Math.abs(highSlope - lowSlope) < 0.0002) {
      const direction = highSlope > 0.0001 ? 'bullish' : highSlope < -0.0001 ? 'bearish' : 'sideways';
      return {
        detected: true,
        type: 'channel',
        direction,
        confidence: 0.60,
        levels: {
          upperBound: Math.max(...highs),
          lowerBound: Math.min(...lows),
        },
      };
    }

    return { detected: false };
  }

  /**
   * Detect market regime
   */
  detectMarketRegime(candles) {
    if (!candles || candles.length < 50) {
      return { regime: 'unknown', confidence: 0 };
    }

    const closes = candles.map(c => c.close);
    const volatility = this.calculateVolatility(closes);
    const trend = this.calculateTrendStrength(closes);
    const momentum = this.calculateMomentum(closes);

    let regime = 'ranging';
    let confidence = 0.5;

    if (trend.strength > 0.6 && trend.direction === 'up') {
      regime = 'trending_up';
      confidence = trend.strength;
    } else if (trend.strength > 0.6 && trend.direction === 'down') {
      regime = 'trending_down';
      confidence = trend.strength;
    } else if (volatility > 0.02) {
      regime = 'volatile';
      confidence = Math.min(volatility * 30, 0.9);
    } else if (volatility < 0.005) {
      regime = 'low_volatility';
      confidence = 0.7;
    }

    return {
      regime,
      confidence,
      volatility,
      trend,
      momentum,
      recommendation: this.getRegimeRecommendation(regime),
    };
  }

  /**
   * Calculate probability of success
   */
  calculateProbability(candles, context) {
    let probability = 0.5; // Base probability

    // Trend alignment
    if (context.technical?.trend === context.smc?.marketStructure?.trend) {
      probability += 0.1;
    }

    // Multiple timeframe alignment
    if (context.mtf?.aligned) {
      probability += 0.1;
    }

    // Volume confirmation
    if (context.vsa?.volumeConfirmation) {
      probability += 0.05;
    }

    // Smart money alignment
    if (context.smc?.orderBlocks?.length > 0 || context.smc?.fvgs?.length > 0) {
      probability += 0.1;
    }

    // Wyckoff phase
    if (context.wyckoff?.phase === 'accumulation' || context.wyckoff?.phase === 'distribution') {
      probability += 0.1;
    }

    // Kill zone bonus
    if (context.killZone?.active) {
      probability += 0.05;
    }

    return {
      value: Math.min(0.95, probability),
      factors: this.getProbabilityFactors(context),
    };
  }

  /**
   * Generate AI prediction
   */
  async generatePrediction(symbol, candles, context) {
    // Aggregate all signals
    const signals = [];
    
    if (context.technical?.signal) signals.push(context.technical.signal);
    if (context.smc?.signal) signals.push(context.smc.signal);
    if (context.wyckoff?.signal) signals.push(context.wyckoff.signal);
    if (context.vsa?.signal) signals.push(context.vsa.signal);
    if (context.orderFlow?.signal) signals.push(context.orderFlow.signal);

    const buySignals = signals.filter(s => s?.direction === 'BUY').length;
    const sellSignals = signals.filter(s => s?.direction === 'SELL').length;

    let direction = 'NEUTRAL';
    let confidence = 0.5;

    if (buySignals > sellSignals && buySignals >= 3) {
      direction = 'BUY';
      confidence = 0.5 + (buySignals / signals.length) * 0.4;
    } else if (sellSignals > buySignals && sellSignals >= 3) {
      direction = 'SELL';
      confidence = 0.5 + (sellSignals / signals.length) * 0.4;
    }

    return {
      direction,
      confidence,
      signalCount: { buy: buySignals, sell: sellSignals, total: signals.length },
      reasoning: this.generateReasoning(context, direction),
    };
  }

  /**
   * Validate signal using AI
   */
  validateSignal(context, prediction) {
    const issues = [];
    let valid = true;

    // Check for conflicting signals
    if (prediction.signalCount.buy > 0 && prediction.signalCount.sell > 0) {
      if (Math.abs(prediction.signalCount.buy - prediction.signalCount.sell) < 2) {
        issues.push('Conflicting signals detected');
        valid = false;
      }
    }

    // Check for news blackout
    if (context.fundamental?.newsBlackout?.active) {
      issues.push('News blackout period active');
      valid = false;
    }

    // Check minimum confluence
    if (context.confluence?.score < 80) {
      issues.push('Confluence score below minimum threshold');
      valid = false;
    }

    // Check AI confidence
    if (prediction.confidence < this.config.minConfidence) {
      issues.push('AI confidence below minimum threshold');
      valid = false;
    }

    return {
      valid,
      issues,
      passedChecks: valid ? 'All validation checks passed' : `${issues.length} issues found`,
    };
  }

  /**
   * Calculate overall AI confidence
   */
  calculateOverallConfidence(patternRecognition, regimeDetection, probability, prediction) {
    const weights = {
      pattern: 0.25,
      regime: 0.20,
      probability: 0.30,
      prediction: 0.25,
    };

    const confidence = 
      (patternRecognition.confidence || 0.5) * weights.pattern +
      (regimeDetection.confidence || 0.5) * weights.regime +
      (probability.value || 0.5) * weights.probability +
      (prediction.confidence || 0.5) * weights.prediction;

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Helper: Calculate slope of data series
   */
  calculateSlope(data) {
    const n = data.length;
    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Helper: Calculate volatility
   */
  calculateVolatility(closes) {
    if (closes.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i-1]) / closes[i-1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Helper: Calculate trend strength
   */
  calculateTrendStrength(closes) {
    if (closes.length < 20) return { strength: 0, direction: 'neutral' };

    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const current = closes[closes.length - 1];
    const first = closes[closes.length - 20];

    const change = (current - first) / first;
    const direction = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'neutral';
    const strength = Math.min(Math.abs(change) * 10, 1);

    return { strength, direction };
  }

  /**
   * Helper: Calculate momentum
   */
  calculateMomentum(closes) {
    if (closes.length < 14) return 0;
    
    const current = closes[closes.length - 1];
    const past = closes[closes.length - 14];
    
    return (current - past) / past;
  }

  /**
   * Helper: Get regime recommendation
   */
  getRegimeRecommendation(regime) {
    const recommendations = {
      trending_up: 'Look for pullback entries in direction of trend',
      trending_down: 'Look for pullback entries in direction of trend',
      ranging: 'Trade range boundaries with tight stops',
      volatile: 'Reduce position size, widen stops',
      low_volatility: 'Expect breakout, prepare for momentum entry',
      unknown: 'Wait for clearer market conditions',
    };
    return recommendations[regime] || recommendations.unknown;
  }

  /**
   * Helper: Get probability factors
   */
  getProbabilityFactors(context) {
    const factors = [];
    
    if (context.technical?.trend) factors.push(`Technical trend: ${context.technical.trend}`);
    if (context.smc?.marketStructure) factors.push(`SMC structure: ${context.smc.marketStructure.trend}`);
    if (context.killZone?.active) factors.push('Active kill zone');
    
    return factors;
  }

  /**
   * Helper: Generate reasoning
   */
  generateReasoning(context, direction) {
    const reasons = [];
    
    if (direction === 'BUY') {
      if (context.smc?.orderBlocks?.some(ob => ob.type === 'bullish')) {
        reasons.push('Bullish order block present');
      }
      if (context.technical?.trend === 'up') {
        reasons.push('Technical trend is bullish');
      }
    } else if (direction === 'SELL') {
      if (context.smc?.orderBlocks?.some(ob => ob.type === 'bearish')) {
        reasons.push('Bearish order block present');
      }
      if (context.technical?.trend === 'down') {
        reasons.push('Technical trend is bearish');
      }
    }

    return reasons.length > 0 ? reasons : ['Insufficient confluence for clear direction'];
  }
}
