/**
 * PatternDetector - Advanced Pattern Recognition Engine
 * Detects candlestick patterns, chart patterns, and harmonic patterns
 */

export class PatternDetector {
  constructor() {
    this.minPatternReliability = 2; // Minimum reliability score (1-5)
  }

  /**
   * Main detection function - finds all patterns
   */
  async detectPatterns(priceData, timeframe = 'H4') {
    const patterns = {
      candlestick: this.detectCandlestickPatterns(priceData),
      chart: this.detectChartPatterns(priceData),
      harmonic: this.detectHarmonicPatterns(priceData),
      timeframe
    };

    // Filter by reliability
    patterns.candlestick = patterns.candlestick.filter(p => p.reliability >= this.minPatternReliability);
    
    // Calculate overall pattern score
    patterns.score = this.calculatePatternScore(patterns);
    patterns.bias = this.determinePatternBias(patterns);

    return patterns;
  }

  // ==================== CANDLESTICK PATTERNS ====================

  /**
   * Detect all candlestick patterns
   */
  detectCandlestickPatterns(data) {
    const patterns = [];
    
    if (data.length < 5) return patterns;

    // Get recent candles
    const candles = data.slice(-10).map((d, i, arr) => ({
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      body: Math.abs(d.close - d.open),
      upperWick: d.high - Math.max(d.open, d.close),
      lowerWick: Math.min(d.open, d.close) - d.low,
      range: d.high - d.low,
      isBullish: d.close > d.open,
      index: data.length - 10 + i
    }));

    const avgBody = candles.reduce((sum, c) => sum + c.body, 0) / candles.length;
    const avgRange = candles.reduce((sum, c) => sum + c.range, 0) / candles.length;

    // Single candle patterns
    patterns.push(...this.detectSingleCandlePatterns(candles, avgBody, avgRange));
    
    // Double candle patterns
    patterns.push(...this.detectDoubleCandlePatterns(candles, avgBody, avgRange));
    
    // Triple candle patterns
    patterns.push(...this.detectTripleCandlePatterns(candles, avgBody, avgRange));

    return patterns;
  }

  /**
   * Detect single candle patterns
   */
  detectSingleCandlePatterns(candles, avgBody, avgRange) {
    const patterns = [];
    const current = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // Doji
    if (current.body < avgBody * 0.1) {
      patterns.push({
        name: 'Doji',
        type: 'candlestick',
        direction: 'neutral',
        reliability: 2,
        description: 'Indecision pattern - potential reversal'
      });
    }

    // Hammer (bullish)
    if (current.lowerWick > current.body * 2 && 
        current.upperWick < current.body * 0.5 &&
        !current.isBullish === false) {
      patterns.push({
        name: 'Hammer',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 3,
        description: 'Bullish reversal pattern at support'
      });
    }

    // Inverted Hammer
    if (current.upperWick > current.body * 2 && 
        current.lowerWick < current.body * 0.5) {
      patterns.push({
        name: 'Inverted Hammer',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 2,
        description: 'Potential bullish reversal'
      });
    }

    // Shooting Star (bearish)
    if (current.upperWick > current.body * 2 && 
        current.lowerWick < current.body * 0.5 &&
        prev && prev.isBullish) {
      patterns.push({
        name: 'Shooting Star',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 3,
        description: 'Bearish reversal pattern at resistance'
      });
    }

    // Marubozu (strong trend)
    if (current.body > avgBody * 1.5 && 
        current.upperWick < current.body * 0.1 && 
        current.lowerWick < current.body * 0.1) {
      patterns.push({
        name: current.isBullish ? 'Bullish Marubozu' : 'Bearish Marubozu',
        type: 'candlestick',
        direction: current.isBullish ? 'bullish' : 'bearish',
        reliability: 4,
        description: 'Strong momentum candle'
      });
    }

    // Spinning Top
    if (current.body < avgBody * 0.3 && 
        current.upperWick > current.body && 
        current.lowerWick > current.body) {
      patterns.push({
        name: 'Spinning Top',
        type: 'candlestick',
        direction: 'neutral',
        reliability: 2,
        description: 'Indecision - market uncertainty'
      });
    }

    return patterns;
  }

  /**
   * Detect double candle patterns
   */
  detectDoubleCandlePatterns(candles, avgBody, avgRange) {
    const patterns = [];
    if (candles.length < 2) return patterns;

    const current = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    // Bullish Engulfing
    if (!prev.isBullish && current.isBullish &&
        current.open < prev.close && current.close > prev.open &&
        current.body > prev.body * 1.2) {
      patterns.push({
        name: 'Bullish Engulfing',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 4,
        description: 'Strong bullish reversal pattern'
      });
    }

    // Bearish Engulfing
    if (prev.isBullish && !current.isBullish &&
        current.open > prev.close && current.close < prev.open &&
        current.body > prev.body * 1.2) {
      patterns.push({
        name: 'Bearish Engulfing',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 4,
        description: 'Strong bearish reversal pattern'
      });
    }

    // Bullish Harami
    if (!prev.isBullish && current.isBullish &&
        current.open > prev.close && current.close < prev.open &&
        current.body < prev.body * 0.5) {
      patterns.push({
        name: 'Bullish Harami',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 3,
        description: 'Potential bullish reversal'
      });
    }

    // Bearish Harami
    if (prev.isBullish && !current.isBullish &&
        current.open < prev.close && current.close > prev.open &&
        current.body < prev.body * 0.5) {
      patterns.push({
        name: 'Bearish Harami',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 3,
        description: 'Potential bearish reversal'
      });
    }

    // Piercing Line
    if (!prev.isBullish && current.isBullish &&
        current.open < prev.low &&
        current.close > (prev.open + prev.close) / 2 &&
        current.close < prev.open) {
      patterns.push({
        name: 'Piercing Line',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 3,
        description: 'Bullish reversal pattern'
      });
    }

    // Dark Cloud Cover
    if (prev.isBullish && !current.isBullish &&
        current.open > prev.high &&
        current.close < (prev.open + prev.close) / 2 &&
        current.close > prev.open) {
      patterns.push({
        name: 'Dark Cloud Cover',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 3,
        description: 'Bearish reversal pattern'
      });
    }

    // Tweezer Top
    if (prev.isBullish && !current.isBullish &&
        Math.abs(prev.high - current.high) < avgRange * 0.05) {
      patterns.push({
        name: 'Tweezer Top',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 3,
        description: 'Bearish reversal at resistance'
      });
    }

    // Tweezer Bottom
    if (!prev.isBullish && current.isBullish &&
        Math.abs(prev.low - current.low) < avgRange * 0.05) {
      patterns.push({
        name: 'Tweezer Bottom',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 3,
        description: 'Bullish reversal at support'
      });
    }

    return patterns;
  }

  /**
   * Detect triple candle patterns
   */
  detectTripleCandlePatterns(candles, avgBody, avgRange) {
    const patterns = [];
    if (candles.length < 3) return patterns;

    const c1 = candles[candles.length - 3];
    const c2 = candles[candles.length - 2];
    const c3 = candles[candles.length - 1];

    // Morning Star (bullish)
    if (!c1.isBullish && c1.body > avgBody &&
        c2.body < avgBody * 0.3 &&
        c3.isBullish && c3.body > avgBody &&
        c3.close > (c1.open + c1.close) / 2) {
      patterns.push({
        name: 'Morning Star',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 5,
        description: 'Strong bullish reversal pattern'
      });
    }

    // Evening Star (bearish)
    if (c1.isBullish && c1.body > avgBody &&
        c2.body < avgBody * 0.3 &&
        !c3.isBullish && c3.body > avgBody &&
        c3.close < (c1.open + c1.close) / 2) {
      patterns.push({
        name: 'Evening Star',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 5,
        description: 'Strong bearish reversal pattern'
      });
    }

    // Three White Soldiers
    if (c1.isBullish && c2.isBullish && c3.isBullish &&
        c2.close > c1.close && c3.close > c2.close &&
        c1.body > avgBody * 0.7 && c2.body > avgBody * 0.7 && c3.body > avgBody * 0.7) {
      patterns.push({
        name: 'Three White Soldiers',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 5,
        description: 'Strong bullish continuation'
      });
    }

    // Three Black Crows
    if (!c1.isBullish && !c2.isBullish && !c3.isBullish &&
        c2.close < c1.close && c3.close < c2.close &&
        c1.body > avgBody * 0.7 && c2.body > avgBody * 0.7 && c3.body > avgBody * 0.7) {
      patterns.push({
        name: 'Three Black Crows',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 5,
        description: 'Strong bearish continuation'
      });
    }

    // Three Inside Up
    if (!c1.isBullish && c1.body > avgBody &&
        c2.isBullish && c2.body < c1.body * 0.5 &&
        c2.close < c1.open && c2.open > c1.close &&
        c3.isBullish && c3.close > c1.open) {
      patterns.push({
        name: 'Three Inside Up',
        type: 'candlestick',
        direction: 'bullish',
        reliability: 4,
        description: 'Bullish reversal confirmation'
      });
    }

    // Three Inside Down
    if (c1.isBullish && c1.body > avgBody &&
        !c2.isBullish && c2.body < c1.body * 0.5 &&
        c2.close > c1.open && c2.open < c1.close &&
        !c3.isBullish && c3.close < c1.open) {
      patterns.push({
        name: 'Three Inside Down',
        type: 'candlestick',
        direction: 'bearish',
        reliability: 4,
        description: 'Bearish reversal confirmation'
      });
    }

    return patterns;
  }

  // ==================== CHART PATTERNS ====================

  /**
   * Detect chart patterns
   */
  detectChartPatterns(data) {
    const patterns = [];
    
    if (data.length < 50) return patterns;

    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);

    // Find swing points
    const swingHighs = this.findSwingPoints(highs, 'high');
    const swingLows = this.findSwingPoints(lows, 'low');

    // Double Top
    const doubleTop = this.detectDoubleTop(swingHighs, closes);
    if (doubleTop) patterns.push(doubleTop);

    // Double Bottom
    const doubleBottom = this.detectDoubleBottom(swingLows, closes);
    if (doubleBottom) patterns.push(doubleBottom);

    // Head and Shoulders
    const headShoulders = this.detectHeadAndShoulders(swingHighs, swingLows, closes);
    if (headShoulders) patterns.push(headShoulders);

    // Triangle patterns
    const triangle = this.detectTriangle(swingHighs, swingLows, closes);
    if (triangle) patterns.push(triangle);

    return patterns;
  }

  /**
   * Find swing points
   */
  findSwingPoints(data, type) {
    const swings = [];
    const lookback = 5;

    for (let i = lookback; i < data.length - lookback; i++) {
      const slice = data.slice(i - lookback, i + lookback + 1);
      const current = data[i];

      if (type === 'high' && current === Math.max(...slice)) {
        swings.push({ index: i, value: current });
      } else if (type === 'low' && current === Math.min(...slice)) {
        swings.push({ index: i, value: current });
      }
    }

    return swings;
  }

  /**
   * Detect Double Top pattern
   */
  detectDoubleTop(swingHighs, closes) {
    if (swingHighs.length < 2) return null;

    const recent = swingHighs.slice(-3);
    if (recent.length < 2) return null;

    const [first, second] = recent.slice(-2);
    const tolerance = first.value * 0.02; // 2% tolerance

    if (Math.abs(first.value - second.value) < tolerance &&
        second.index - first.index > 10 &&
        closes[closes.length - 1] < Math.min(first.value, second.value)) {
      return {
        name: 'Double Top',
        type: 'chart',
        direction: 'bearish',
        reliability: 4,
        description: 'Bearish reversal pattern',
        neckline: Math.min(...closes.slice(first.index, second.index)),
        target: Math.min(...closes.slice(first.index, second.index)) - (first.value - Math.min(...closes.slice(first.index, second.index)))
      };
    }

    return null;
  }

  /**
   * Detect Double Bottom pattern
   */
  detectDoubleBottom(swingLows, closes) {
    if (swingLows.length < 2) return null;

    const recent = swingLows.slice(-3);
    if (recent.length < 2) return null;

    const [first, second] = recent.slice(-2);
    const tolerance = first.value * 0.02;

    if (Math.abs(first.value - second.value) < tolerance &&
        second.index - first.index > 10 &&
        closes[closes.length - 1] > Math.max(first.value, second.value)) {
      return {
        name: 'Double Bottom',
        type: 'chart',
        direction: 'bullish',
        reliability: 4,
        description: 'Bullish reversal pattern',
        neckline: Math.max(...closes.slice(first.index, second.index)),
        target: Math.max(...closes.slice(first.index, second.index)) + (Math.max(...closes.slice(first.index, second.index)) - first.value)
      };
    }

    return null;
  }

  /**
   * Detect Head and Shoulders pattern
   */
  detectHeadAndShoulders(swingHighs, swingLows, closes) {
    if (swingHighs.length < 3) return null;

    const recent = swingHighs.slice(-5);
    if (recent.length < 3) return null;

    // Look for left shoulder, head, right shoulder
    for (let i = 0; i < recent.length - 2; i++) {
      const leftShoulder = recent[i];
      const head = recent[i + 1];
      const rightShoulder = recent[i + 2];

      const shoulderTolerance = leftShoulder.value * 0.03;

      if (head.value > leftShoulder.value &&
          head.value > rightShoulder.value &&
          Math.abs(leftShoulder.value - rightShoulder.value) < shoulderTolerance) {
        
        // Find neckline
        const necklinePoints = swingLows.filter(l => 
          l.index > leftShoulder.index && l.index < rightShoulder.index
        );

        if (necklinePoints.length >= 1) {
          const neckline = necklinePoints.reduce((sum, p) => sum + p.value, 0) / necklinePoints.length;
          
          if (closes[closes.length - 1] < neckline) {
            return {
              name: 'Head and Shoulders',
              type: 'chart',
              direction: 'bearish',
              reliability: 5,
              description: 'Strong bearish reversal pattern',
              neckline,
              target: neckline - (head.value - neckline)
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Detect Triangle patterns
   */
  detectTriangle(swingHighs, swingLows, closes) {
    if (swingHighs.length < 3 || swingLows.length < 3) return null;

    const recentHighs = swingHighs.slice(-4);
    const recentLows = swingLows.slice(-4);

    if (recentHighs.length < 2 || recentLows.length < 2) return null;

    // Calculate slopes
    const highSlope = (recentHighs[recentHighs.length - 1].value - recentHighs[0].value) / 
                      (recentHighs[recentHighs.length - 1].index - recentHighs[0].index);
    const lowSlope = (recentLows[recentLows.length - 1].value - recentLows[0].value) / 
                     (recentLows[recentLows.length - 1].index - recentLows[0].index);

    // Ascending Triangle (flat top, rising bottom)
    if (Math.abs(highSlope) < 0.0001 && lowSlope > 0.0001) {
      return {
        name: 'Ascending Triangle',
        type: 'chart',
        direction: 'bullish',
        reliability: 4,
        description: 'Bullish continuation pattern'
      };
    }

    // Descending Triangle (falling top, flat bottom)
    if (highSlope < -0.0001 && Math.abs(lowSlope) < 0.0001) {
      return {
        name: 'Descending Triangle',
        type: 'chart',
        direction: 'bearish',
        reliability: 4,
        description: 'Bearish continuation pattern'
      };
    }

    // Symmetrical Triangle (converging)
    if (highSlope < -0.0001 && lowSlope > 0.0001) {
      return {
        name: 'Symmetrical Triangle',
        type: 'chart',
        direction: 'neutral',
        reliability: 3,
        description: 'Breakout pattern - wait for direction'
      };
    }

    return null;
  }

  // ==================== HARMONIC PATTERNS ====================

  /**
   * Detect harmonic patterns
   */
  detectHarmonicPatterns(data) {
    const patterns = [];
    
    if (data.length < 50) return patterns;

    const swingPoints = this.findAllSwingPoints(data);
    
    if (swingPoints.length < 5) return patterns;

    // Check for Gartley pattern
    const gartley = this.detectGartley(swingPoints);
    if (gartley) patterns.push(gartley);

    // Check for Butterfly pattern
    const butterfly = this.detectButterfly(swingPoints);
    if (butterfly) patterns.push(butterfly);

    // Check for Bat pattern
    const bat = this.detectBat(swingPoints);
    if (bat) patterns.push(bat);

    return patterns;
  }

  /**
   * Find all swing points (both highs and lows)
   */
  findAllSwingPoints(data) {
    const swings = [];
    const lookback = 5;

    for (let i = lookback; i < data.length - lookback; i++) {
      const highSlice = data.slice(i - lookback, i + lookback + 1).map(d => d.high);
      const lowSlice = data.slice(i - lookback, i + lookback + 1).map(d => d.low);

      if (data[i].high === Math.max(...highSlice)) {
        swings.push({ index: i, value: data[i].high, type: 'high' });
      }
      if (data[i].low === Math.min(...lowSlice)) {
        swings.push({ index: i, value: data[i].low, type: 'low' });
      }
    }

    return swings.sort((a, b) => a.index - b.index);
  }

  /**
   * Detect Gartley pattern
   * XA: Initial move
   * AB: 61.8% retracement of XA
   * BC: 38.2% - 88.6% retracement of AB
   * CD: 127.2% - 161.8% extension of BC
   * D: 78.6% retracement of XA
   */
  detectGartley(swings) {
    if (swings.length < 5) return null;

    const recent = swings.slice(-5);
    const [X, A, B, C, D] = recent;

    if (!X || !A || !B || !C || !D) return null;

    const XA = Math.abs(A.value - X.value);
    const AB = Math.abs(B.value - A.value);
    const BC = Math.abs(C.value - B.value);
    const CD = Math.abs(D.value - C.value);

    // Check Fibonacci ratios with tolerance
    const tolerance = 0.05;
    
    const abRatio = AB / XA;
    const bcRatio = BC / AB;
    const cdRatio = CD / BC;
    const xdRatio = Math.abs(D.value - X.value) / XA;

    if (Math.abs(abRatio - 0.618) < tolerance &&
        bcRatio >= 0.382 - tolerance && bcRatio <= 0.886 + tolerance &&
        Math.abs(xdRatio - 0.786) < tolerance) {
      
      const direction = D.type === 'low' ? 'bullish' : 'bearish';
      
      return {
        name: 'Gartley',
        type: 'harmonic',
        direction,
        reliability: 4,
        description: `${direction === 'bullish' ? 'Bullish' : 'Bearish'} Gartley pattern`,
        prz: D.value, // Potential Reversal Zone
        target1: D.value + (direction === 'bullish' ? 1 : -1) * XA * 0.382,
        target2: D.value + (direction === 'bullish' ? 1 : -1) * XA * 0.618
      };
    }

    return null;
  }

  /**
   * Detect Butterfly pattern
   */
  detectButterfly(swings) {
    if (swings.length < 5) return null;

    const recent = swings.slice(-5);
    const [X, A, B, C, D] = recent;

    if (!X || !A || !B || !C || !D) return null;

    const XA = Math.abs(A.value - X.value);
    const AB = Math.abs(B.value - A.value);
    const xdRatio = Math.abs(D.value - X.value) / XA;

    const tolerance = 0.05;
    const abRatio = AB / XA;

    // Butterfly: AB = 78.6% of XA, D extends beyond X (127.2% - 161.8%)
    if (Math.abs(abRatio - 0.786) < tolerance &&
        xdRatio >= 1.272 - tolerance && xdRatio <= 1.618 + tolerance) {
      
      const direction = D.type === 'low' ? 'bullish' : 'bearish';
      
      return {
        name: 'Butterfly',
        type: 'harmonic',
        direction,
        reliability: 4,
        description: `${direction === 'bullish' ? 'Bullish' : 'Bearish'} Butterfly pattern`,
        prz: D.value
      };
    }

    return null;
  }

  /**
   * Detect Bat pattern
   */
  detectBat(swings) {
    if (swings.length < 5) return null;

    const recent = swings.slice(-5);
    const [X, A, B, C, D] = recent;

    if (!X || !A || !B || !C || !D) return null;

    const XA = Math.abs(A.value - X.value);
    const AB = Math.abs(B.value - A.value);
    const xdRatio = Math.abs(D.value - X.value) / XA;

    const tolerance = 0.05;
    const abRatio = AB / XA;

    // Bat: AB = 38.2% - 50% of XA, D = 88.6% of XA
    if (abRatio >= 0.382 - tolerance && abRatio <= 0.50 + tolerance &&
        Math.abs(xdRatio - 0.886) < tolerance) {
      
      const direction = D.type === 'low' ? 'bullish' : 'bearish';
      
      return {
        name: 'Bat',
        type: 'harmonic',
        direction,
        reliability: 4,
        description: `${direction === 'bullish' ? 'Bullish' : 'Bearish'} Bat pattern`,
        prz: D.value
      };
    }

    return null;
  }

  // ==================== SCORING ====================

  /**
   * Calculate overall pattern score
   */
  calculatePatternScore(patterns) {
    let score = 50; // Base score

    // Candlestick patterns
    for (const pattern of patterns.candlestick) {
      score += pattern.reliability * 3;
    }

    // Chart patterns (higher weight)
    for (const pattern of patterns.chart) {
      score += pattern.reliability * 5;
    }

    // Harmonic patterns (highest weight)
    for (const pattern of patterns.harmonic) {
      score += pattern.reliability * 6;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine overall pattern bias
   */
  determinePatternBias(patterns) {
    let bullishScore = 0;
    let bearishScore = 0;

    const allPatterns = [
      ...patterns.candlestick,
      ...patterns.chart,
      ...patterns.harmonic
    ];

    for (const pattern of allPatterns) {
      if (pattern.direction === 'bullish') {
        bullishScore += pattern.reliability;
      } else if (pattern.direction === 'bearish') {
        bearishScore += pattern.reliability;
      }
    }

    if (bullishScore > bearishScore * 1.5) return 'bullish';
    if (bearishScore > bullishScore * 1.5) return 'bearish';
    return 'neutral';
  }
}

export default PatternDetector;
