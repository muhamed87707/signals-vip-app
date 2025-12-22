/**
 * PatternDetector - Advanced Pattern Recognition Engine
 * Detects candlestick patterns, chart patterns, and harmonic patterns
 */

export class PatternDetector {
  constructor() {
    this.candlePatterns = [
      'DOJI', 'HAMMER', 'INVERTED_HAMMER', 'HANGING_MAN', 'SHOOTING_STAR',
      'ENGULFING_BULLISH', 'ENGULFING_BEARISH', 'MORNING_STAR', 'EVENING_STAR',
      'THREE_WHITE_SOLDIERS', 'THREE_BLACK_CROWS', 'HARAMI_BULLISH', 'HARAMI_BEARISH',
      'PIERCING_LINE', 'DARK_CLOUD_COVER', 'TWEEZER_TOP', 'TWEEZER_BOTTOM',
      'SPINNING_TOP', 'MARUBOZU_BULLISH', 'MARUBOZU_BEARISH'
    ];
  }

  /**
   * Main analysis function - detects all patterns
   */
  async analyze(priceData) {
    if (!priceData || priceData.length < 50) {
      return { error: 'Insufficient price data', minRequired: 50 };
    }

    const results = {
      timestamp: new Date(),
      candlePatterns: this.detectCandlePatterns(priceData),
      chartPatterns: this.detectChartPatterns(priceData),
      harmonicPatterns: this.detectHarmonicPatterns(priceData),
      summary: null
    };

    results.summary = this.generateSummary(results);
    return results;
  }

  // ==================== CANDLESTICK PATTERNS ====================

  /**
   * Detect all candlestick patterns
   */
  detectCandlePatterns(data) {
    const patterns = [];
    const recent = data.slice(-10);

    // Single candle patterns
    const singlePatterns = this.detectSingleCandlePatterns(recent);
    patterns.push(...singlePatterns);

    // Double candle patterns
    const doublePatterns = this.detectDoubleCandlePatterns(recent);
    patterns.push(...doublePatterns);

    // Triple candle patterns
    const triplePatterns = this.detectTripleCandlePatterns(recent);
    patterns.push(...triplePatterns);

    return patterns;
  }

  /**
   * Detect single candlestick patterns
   */
  detectSingleCandlePatterns(data) {
    const patterns = [];
    const candle = data[data.length - 1];
    const prev = data[data.length - 2];
    
    const body = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const range = candle.high - candle.low;
    const isBullish = candle.close > candle.open;

    // Doji - very small body
    if (body < range * 0.1) {
      let dojiType = 'DOJI';
      if (upperWick > body * 2 && lowerWick > body * 2) dojiType = 'LONG_LEGGED_DOJI';
      else if (upperWick > body * 3 && lowerWick < body) dojiType = 'GRAVESTONE_DOJI';
      else if (lowerWick > body * 3 && upperWick < body) dojiType = 'DRAGONFLY_DOJI';
      
      patterns.push({
        name: dojiType,
        type: 'REVERSAL',
        direction: 'NEUTRAL',
        strength: 'MEDIUM',
        description: 'Indecision in the market'
      });
    }

    // Hammer - small body at top, long lower wick
    if (lowerWick > body * 2 && upperWick < body * 0.5 && this.isDowntrend(data)) {
      patterns.push({
        name: 'HAMMER',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'HIGH',
        description: 'Potential bullish reversal after downtrend'
      });
    }

    // Inverted Hammer
    if (upperWick > body * 2 && lowerWick < body * 0.5 && this.isDowntrend(data)) {
      patterns.push({
        name: 'INVERTED_HAMMER',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'MEDIUM',
        description: 'Potential bullish reversal signal'
      });
    }

    // Hanging Man - hammer in uptrend
    if (lowerWick > body * 2 && upperWick < body * 0.5 && this.isUptrend(data)) {
      patterns.push({
        name: 'HANGING_MAN',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Potential bearish reversal after uptrend'
      });
    }

    // Shooting Star - inverted hammer in uptrend
    if (upperWick > body * 2 && lowerWick < body * 0.5 && this.isUptrend(data)) {
      patterns.push({
        name: 'SHOOTING_STAR',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Strong bearish reversal signal'
      });
    }

    // Marubozu - full body, no wicks
    if (upperWick < range * 0.05 && lowerWick < range * 0.05) {
      patterns.push({
        name: isBullish ? 'MARUBOZU_BULLISH' : 'MARUBOZU_BEARISH',
        type: 'CONTINUATION',
        direction: isBullish ? 'BULLISH' : 'BEARISH',
        strength: 'HIGH',
        description: `Strong ${isBullish ? 'buying' : 'selling'} pressure`
      });
    }

    // Spinning Top - small body, equal wicks
    if (body < range * 0.3 && Math.abs(upperWick - lowerWick) < range * 0.2) {
      patterns.push({
        name: 'SPINNING_TOP',
        type: 'NEUTRAL',
        direction: 'NEUTRAL',
        strength: 'LOW',
        description: 'Market indecision'
      });
    }

    return patterns;
  }


  /**
   * Detect double candlestick patterns
   */
  detectDoubleCandlePatterns(data) {
    const patterns = [];
    if (data.length < 2) return patterns;

    const curr = data[data.length - 1];
    const prev = data[data.length - 2];

    const currBody = Math.abs(curr.close - curr.open);
    const prevBody = Math.abs(prev.close - prev.open);
    const currBullish = curr.close > curr.open;
    const prevBullish = prev.close > prev.open;

    // Bullish Engulfing
    if (!prevBullish && currBullish && 
        curr.open < prev.close && curr.close > prev.open &&
        currBody > prevBody && this.isDowntrend(data)) {
      patterns.push({
        name: 'ENGULFING_BULLISH',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'HIGH',
        description: 'Strong bullish reversal - buyers overwhelmed sellers'
      });
    }

    // Bearish Engulfing
    if (prevBullish && !currBullish && 
        curr.open > prev.close && curr.close < prev.open &&
        currBody > prevBody && this.isUptrend(data)) {
      patterns.push({
        name: 'ENGULFING_BEARISH',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Strong bearish reversal - sellers overwhelmed buyers'
      });
    }

    // Bullish Harami
    if (!prevBullish && currBullish &&
        curr.open > prev.close && curr.close < prev.open &&
        currBody < prevBody * 0.5) {
      patterns.push({
        name: 'HARAMI_BULLISH',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'MEDIUM',
        description: 'Potential bullish reversal'
      });
    }

    // Bearish Harami
    if (prevBullish && !currBullish &&
        curr.open < prev.close && curr.close > prev.open &&
        currBody < prevBody * 0.5) {
      patterns.push({
        name: 'HARAMI_BEARISH',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'MEDIUM',
        description: 'Potential bearish reversal'
      });
    }

    // Piercing Line
    if (!prevBullish && currBullish &&
        curr.open < prev.low &&
        curr.close > (prev.open + prev.close) / 2 &&
        curr.close < prev.open && this.isDowntrend(data)) {
      patterns.push({
        name: 'PIERCING_LINE',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'HIGH',
        description: 'Bullish reversal - price pierced into previous candle'
      });
    }

    // Dark Cloud Cover
    if (prevBullish && !currBullish &&
        curr.open > prev.high &&
        curr.close < (prev.open + prev.close) / 2 &&
        curr.close > prev.open && this.isUptrend(data)) {
      patterns.push({
        name: 'DARK_CLOUD_COVER',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Bearish reversal - dark cloud covering previous gains'
      });
    }

    // Tweezer Top
    if (Math.abs(curr.high - prev.high) < (curr.high * 0.001) && this.isUptrend(data)) {
      patterns.push({
        name: 'TWEEZER_TOP',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'MEDIUM',
        description: 'Potential top - equal highs'
      });
    }

    // Tweezer Bottom
    if (Math.abs(curr.low - prev.low) < (curr.low * 0.001) && this.isDowntrend(data)) {
      patterns.push({
        name: 'TWEEZER_BOTTOM',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'MEDIUM',
        description: 'Potential bottom - equal lows'
      });
    }

    return patterns;
  }

  /**
   * Detect triple candlestick patterns
   */
  detectTripleCandlePatterns(data) {
    const patterns = [];
    if (data.length < 3) return patterns;

    const c1 = data[data.length - 3];
    const c2 = data[data.length - 2];
    const c3 = data[data.length - 1];

    const c1Bullish = c1.close > c1.open;
    const c2Bullish = c2.close > c2.open;
    const c3Bullish = c3.close > c3.open;
    const c2Body = Math.abs(c2.close - c2.open);
    const c2Range = c2.high - c2.low;

    // Morning Star
    if (!c1Bullish && c2Body < c2Range * 0.3 && c3Bullish &&
        c2.close < c1.close && c3.close > (c1.open + c1.close) / 2 &&
        this.isDowntrend(data.slice(0, -2))) {
      patterns.push({
        name: 'MORNING_STAR',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'HIGH',
        description: 'Strong bullish reversal pattern'
      });
    }

    // Evening Star
    if (c1Bullish && c2Body < c2Range * 0.3 && !c3Bullish &&
        c2.close > c1.close && c3.close < (c1.open + c1.close) / 2 &&
        this.isUptrend(data.slice(0, -2))) {
      patterns.push({
        name: 'EVENING_STAR',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Strong bearish reversal pattern'
      });
    }

    // Three White Soldiers
    if (c1Bullish && c2Bullish && c3Bullish &&
        c2.open > c1.open && c2.close > c1.close &&
        c3.open > c2.open && c3.close > c2.close &&
        this.isDowntrend(data.slice(0, -3))) {
      patterns.push({
        name: 'THREE_WHITE_SOLDIERS',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'HIGH',
        description: 'Very strong bullish reversal'
      });
    }

    // Three Black Crows
    if (!c1Bullish && !c2Bullish && !c3Bullish &&
        c2.open < c1.open && c2.close < c1.close &&
        c3.open < c2.open && c3.close < c2.close &&
        this.isUptrend(data.slice(0, -3))) {
      patterns.push({
        name: 'THREE_BLACK_CROWS',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Very strong bearish reversal'
      });
    }

    return patterns;
  }


  // ==================== CHART PATTERNS ====================

  /**
   * Detect chart patterns (Head & Shoulders, Triangles, etc.)
   */
  detectChartPatterns(data) {
    const patterns = [];
    
    // Find swing points
    const swings = this.findSwingPoints(data);
    
    // Head and Shoulders
    const headShoulders = this.detectHeadAndShoulders(swings, data);
    if (headShoulders) patterns.push(headShoulders);

    // Double Top/Bottom
    const doublePatterns = this.detectDoublePatterns(swings, data);
    patterns.push(...doublePatterns);

    // Triangles
    const triangles = this.detectTriangles(swings, data);
    patterns.push(...triangles);

    // Wedges
    const wedges = this.detectWedges(swings, data);
    patterns.push(...wedges);

    // Flags and Pennants
    const flags = this.detectFlags(data);
    if (flags) patterns.push(flags);

    return patterns;
  }

  /**
   * Find swing highs and lows
   */
  findSwingPoints(data, lookback = 5) {
    const swings = { highs: [], lows: [] };
    
    for (let i = lookback; i < data.length - lookback; i++) {
      let isSwingHigh = true;
      let isSwingLow = true;

      for (let j = 1; j <= lookback; j++) {
        if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) {
          isSwingHigh = false;
        }
        if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) {
          isSwingLow = false;
        }
      }

      if (isSwingHigh) {
        swings.highs.push({ index: i, price: data[i].high, time: data[i].time });
      }
      if (isSwingLow) {
        swings.lows.push({ index: i, price: data[i].low, time: data[i].time });
      }
    }

    return swings;
  }

  /**
   * Detect Head and Shoulders pattern
   */
  detectHeadAndShoulders(swings, data) {
    const highs = swings.highs.slice(-5);
    const lows = swings.lows.slice(-4);

    if (highs.length < 3 || lows.length < 2) return null;

    // Check for Head and Shoulders Top
    for (let i = 0; i < highs.length - 2; i++) {
      const leftShoulder = highs[i];
      const head = highs[i + 1];
      const rightShoulder = highs[i + 2];

      // Head should be higher than both shoulders
      if (head.price > leftShoulder.price && head.price > rightShoulder.price) {
        // Shoulders should be roughly equal (within 3%)
        const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price;
        if (shoulderDiff < 0.03) {
          // Find neckline
          const necklineLows = lows.filter(l => l.index > leftShoulder.index && l.index < rightShoulder.index);
          if (necklineLows.length >= 2) {
            const neckline = (necklineLows[0].price + necklineLows[1].price) / 2;
            const currentPrice = data[data.length - 1].close;
            
            return {
              name: 'HEAD_AND_SHOULDERS',
              type: 'REVERSAL',
              direction: 'BEARISH',
              strength: 'HIGH',
              neckline,
              target: neckline - (head.price - neckline),
              confirmed: currentPrice < neckline,
              description: 'Head and Shoulders top - bearish reversal pattern'
            };
          }
        }
      }
    }

    // Check for Inverse Head and Shoulders
    const lowsForInverse = swings.lows.slice(-5);
    for (let i = 0; i < lowsForInverse.length - 2; i++) {
      const leftShoulder = lowsForInverse[i];
      const head = lowsForInverse[i + 1];
      const rightShoulder = lowsForInverse[i + 2];

      if (head.price < leftShoulder.price && head.price < rightShoulder.price) {
        const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price;
        if (shoulderDiff < 0.03) {
          const necklineHighs = highs.filter(h => h.index > leftShoulder.index && h.index < rightShoulder.index);
          if (necklineHighs.length >= 2) {
            const neckline = (necklineHighs[0].price + necklineHighs[1].price) / 2;
            const currentPrice = data[data.length - 1].close;
            
            return {
              name: 'INVERSE_HEAD_AND_SHOULDERS',
              type: 'REVERSAL',
              direction: 'BULLISH',
              strength: 'HIGH',
              neckline,
              target: neckline + (neckline - head.price),
              confirmed: currentPrice > neckline,
              description: 'Inverse Head and Shoulders - bullish reversal pattern'
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Detect Double Top/Bottom patterns
   */
  detectDoublePatterns(swings, data) {
    const patterns = [];
    const currentPrice = data[data.length - 1].close;

    // Double Top
    const recentHighs = swings.highs.slice(-3);
    if (recentHighs.length >= 2) {
      const h1 = recentHighs[recentHighs.length - 2];
      const h2 = recentHighs[recentHighs.length - 1];
      const diff = Math.abs(h1.price - h2.price) / h1.price;

      if (diff < 0.02 && h2.index - h1.index > 5) {
        const lowBetween = Math.min(...data.slice(h1.index, h2.index).map(d => d.low));
        patterns.push({
          name: 'DOUBLE_TOP',
          type: 'REVERSAL',
          direction: 'BEARISH',
          strength: 'HIGH',
          neckline: lowBetween,
          target: lowBetween - (h1.price - lowBetween),
          confirmed: currentPrice < lowBetween,
          description: 'Double Top - bearish reversal pattern'
        });
      }
    }

    // Double Bottom
    const recentLows = swings.lows.slice(-3);
    if (recentLows.length >= 2) {
      const l1 = recentLows[recentLows.length - 2];
      const l2 = recentLows[recentLows.length - 1];
      const diff = Math.abs(l1.price - l2.price) / l1.price;

      if (diff < 0.02 && l2.index - l1.index > 5) {
        const highBetween = Math.max(...data.slice(l1.index, l2.index).map(d => d.high));
        patterns.push({
          name: 'DOUBLE_BOTTOM',
          type: 'REVERSAL',
          direction: 'BULLISH',
          strength: 'HIGH',
          neckline: highBetween,
          target: highBetween + (highBetween - l1.price),
          confirmed: currentPrice > highBetween,
          description: 'Double Bottom - bullish reversal pattern'
        });
      }
    }

    return patterns;
  }


  /**
   * Detect Triangle patterns
   */
  detectTriangles(swings, data) {
    const patterns = [];
    const recentHighs = swings.highs.slice(-4);
    const recentLows = swings.lows.slice(-4);

    if (recentHighs.length < 2 || recentLows.length < 2) return patterns;

    // Calculate trendlines
    const highSlope = this.calculateSlope(recentHighs);
    const lowSlope = this.calculateSlope(recentLows);

    // Symmetrical Triangle - converging trendlines
    if (highSlope < -0.0001 && lowSlope > 0.0001) {
      patterns.push({
        name: 'SYMMETRICAL_TRIANGLE',
        type: 'CONTINUATION',
        direction: 'NEUTRAL',
        strength: 'MEDIUM',
        description: 'Symmetrical Triangle - breakout expected'
      });
    }

    // Ascending Triangle - flat top, rising bottom
    if (Math.abs(highSlope) < 0.0001 && lowSlope > 0.0001) {
      patterns.push({
        name: 'ASCENDING_TRIANGLE',
        type: 'CONTINUATION',
        direction: 'BULLISH',
        strength: 'HIGH',
        resistance: recentHighs[recentHighs.length - 1].price,
        description: 'Ascending Triangle - bullish breakout likely'
      });
    }

    // Descending Triangle - flat bottom, falling top
    if (highSlope < -0.0001 && Math.abs(lowSlope) < 0.0001) {
      patterns.push({
        name: 'DESCENDING_TRIANGLE',
        type: 'CONTINUATION',
        direction: 'BEARISH',
        strength: 'HIGH',
        support: recentLows[recentLows.length - 1].price,
        description: 'Descending Triangle - bearish breakout likely'
      });
    }

    return patterns;
  }

  /**
   * Detect Wedge patterns
   */
  detectWedges(swings, data) {
    const patterns = [];
    const recentHighs = swings.highs.slice(-4);
    const recentLows = swings.lows.slice(-4);

    if (recentHighs.length < 2 || recentLows.length < 2) return patterns;

    const highSlope = this.calculateSlope(recentHighs);
    const lowSlope = this.calculateSlope(recentLows);

    // Rising Wedge - both lines rising, converging
    if (highSlope > 0 && lowSlope > 0 && lowSlope > highSlope) {
      patterns.push({
        name: 'RISING_WEDGE',
        type: 'REVERSAL',
        direction: 'BEARISH',
        strength: 'HIGH',
        description: 'Rising Wedge - bearish reversal pattern'
      });
    }

    // Falling Wedge - both lines falling, converging
    if (highSlope < 0 && lowSlope < 0 && highSlope > lowSlope) {
      patterns.push({
        name: 'FALLING_WEDGE',
        type: 'REVERSAL',
        direction: 'BULLISH',
        strength: 'HIGH',
        description: 'Falling Wedge - bullish reversal pattern'
      });
    }

    return patterns;
  }

  /**
   * Detect Flag and Pennant patterns
   */
  detectFlags(data) {
    const recent = data.slice(-20);
    const prior = data.slice(-40, -20);

    if (recent.length < 20 || prior.length < 20) return null;

    // Check for strong prior move (pole)
    const priorMove = (prior[prior.length - 1].close - prior[0].close) / prior[0].close;
    const recentRange = (Math.max(...recent.map(d => d.high)) - Math.min(...recent.map(d => d.low))) / recent[0].close;

    // Flag: strong move followed by consolidation
    if (Math.abs(priorMove) > 0.03 && recentRange < Math.abs(priorMove) * 0.5) {
      const direction = priorMove > 0 ? 'BULLISH' : 'BEARISH';
      return {
        name: direction === 'BULLISH' ? 'BULL_FLAG' : 'BEAR_FLAG',
        type: 'CONTINUATION',
        direction,
        strength: 'HIGH',
        poleSize: Math.abs(priorMove) * 100,
        description: `${direction === 'BULLISH' ? 'Bull' : 'Bear'} Flag - continuation pattern`
      };
    }

    return null;
  }

  calculateSlope(points) {
    if (points.length < 2) return 0;
    const first = points[0];
    const last = points[points.length - 1];
    return (last.price - first.price) / (last.index - first.index);
  }

  // ==================== HARMONIC PATTERNS ====================

  /**
   * Detect Harmonic patterns (Gartley, Butterfly, Bat, Crab)
   */
  detectHarmonicPatterns(data) {
    const patterns = [];
    const swings = this.findSwingPoints(data, 3);
    
    // Need at least 5 points (X, A, B, C, D)
    const allSwings = this.mergeSwings(swings);
    if (allSwings.length < 5) return patterns;

    const recentSwings = allSwings.slice(-5);
    const [X, A, B, C, D] = recentSwings;

    // Calculate Fibonacci ratios
    const XA = Math.abs(A.price - X.price);
    const AB = Math.abs(B.price - A.price);
    const BC = Math.abs(C.price - B.price);
    const CD = Math.abs(D.price - C.price);
    const XD = Math.abs(D.price - X.price);

    const AB_XA = AB / XA;
    const BC_AB = BC / AB;
    const CD_BC = CD / BC;
    const XD_XA = XD / XA;

    // Gartley Pattern (0.618 retracement)
    if (this.isInRange(AB_XA, 0.618, 0.05) && 
        this.isInRange(BC_AB, 0.382, 0.786, 0.05) &&
        this.isInRange(CD_BC, 1.27, 1.618, 0.05) &&
        this.isInRange(XD_XA, 0.786, 0.05)) {
      patterns.push({
        name: 'GARTLEY',
        type: 'REVERSAL',
        direction: D.price < X.price ? 'BULLISH' : 'BEARISH',
        strength: 'HIGH',
        prz: D.price,
        description: 'Gartley Pattern - high probability reversal zone'
      });
    }

    // Butterfly Pattern
    if (this.isInRange(AB_XA, 0.786, 0.05) &&
        this.isInRange(BC_AB, 0.382, 0.886, 0.05) &&
        this.isInRange(XD_XA, 1.27, 0.1)) {
      patterns.push({
        name: 'BUTTERFLY',
        type: 'REVERSAL',
        direction: D.price < X.price ? 'BULLISH' : 'BEARISH',
        strength: 'HIGH',
        prz: D.price,
        description: 'Butterfly Pattern - extension reversal'
      });
    }

    // Bat Pattern
    if (this.isInRange(AB_XA, 0.382, 0.5, 0.05) &&
        this.isInRange(BC_AB, 0.382, 0.886, 0.05) &&
        this.isInRange(XD_XA, 0.886, 0.05)) {
      patterns.push({
        name: 'BAT',
        type: 'REVERSAL',
        direction: D.price < X.price ? 'BULLISH' : 'BEARISH',
        strength: 'HIGH',
        prz: D.price,
        description: 'Bat Pattern - deep retracement reversal'
      });
    }

    // Crab Pattern
    if (this.isInRange(AB_XA, 0.382, 0.618, 0.05) &&
        this.isInRange(BC_AB, 0.382, 0.886, 0.05) &&
        this.isInRange(XD_XA, 1.618, 0.1)) {
      patterns.push({
        name: 'CRAB',
        type: 'REVERSAL',
        direction: D.price < X.price ? 'BULLISH' : 'BEARISH',
        strength: 'HIGH',
        prz: D.price,
        description: 'Crab Pattern - extreme extension reversal'
      });
    }

    return patterns;
  }

  mergeSwings(swings) {
    const all = [
      ...swings.highs.map(h => ({ ...h, type: 'high' })),
      ...swings.lows.map(l => ({ ...l, type: 'low' }))
    ];
    return all.sort((a, b) => a.index - b.index);
  }

  isInRange(value, target, tolerance = 0.05) {
    if (arguments.length === 4) {
      // Range check: isInRange(value, min, max, tolerance)
      const [, min, max, tol] = arguments;
      return value >= min - tol && value <= max + tol;
    }
    return Math.abs(value - target) <= tolerance;
  }


  // ==================== HELPER METHODS ====================

  /**
   * Check if market is in uptrend
   */
  isUptrend(data, lookback = 5) {
    if (data.length < lookback) return false;
    const recent = data.slice(-lookback);
    let higherHighs = 0;
    let higherLows = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].high > recent[i - 1].high) higherHighs++;
      if (recent[i].low > recent[i - 1].low) higherLows++;
    }

    return higherHighs >= lookback * 0.6 && higherLows >= lookback * 0.6;
  }

  /**
   * Check if market is in downtrend
   */
  isDowntrend(data, lookback = 5) {
    if (data.length < lookback) return false;
    const recent = data.slice(-lookback);
    let lowerHighs = 0;
    let lowerLows = 0;

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].high < recent[i - 1].high) lowerHighs++;
      if (recent[i].low < recent[i - 1].low) lowerLows++;
    }

    return lowerHighs >= lookback * 0.6 && lowerLows >= lookback * 0.6;
  }

  /**
   * Generate summary of all detected patterns
   */
  generateSummary(results) {
    const allPatterns = [
      ...results.candlePatterns,
      ...results.chartPatterns,
      ...results.harmonicPatterns
    ];

    const bullishPatterns = allPatterns.filter(p => p.direction === 'BULLISH');
    const bearishPatterns = allPatterns.filter(p => p.direction === 'BEARISH');
    const highStrength = allPatterns.filter(p => p.strength === 'HIGH');

    let bias = 'NEUTRAL';
    if (bullishPatterns.length > bearishPatterns.length + 1) bias = 'BULLISH';
    else if (bearishPatterns.length > bullishPatterns.length + 1) bias = 'BEARISH';

    return {
      totalPatterns: allPatterns.length,
      bullishCount: bullishPatterns.length,
      bearishCount: bearishPatterns.length,
      highStrengthCount: highStrength.length,
      bias,
      confidence: highStrength.length > 0 ? 'HIGH' : allPatterns.length > 2 ? 'MEDIUM' : 'LOW',
      topPatterns: allPatterns
        .filter(p => p.strength === 'HIGH')
        .slice(0, 3)
        .map(p => p.name)
    };
  }
}

export default PatternDetector;
