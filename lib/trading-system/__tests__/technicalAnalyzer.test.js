/**
 * Technical Analyzer Tests
 * Property-based tests for EMA, RSI, and pattern detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { TechnicalAnalyzer } from '../analyzers/technicalAnalyzer';

describe('TechnicalAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new TechnicalAnalyzer();
  });

  describe('Property 10: EMA Calculation Correctness', () => {
    /**
     * Property: For any price series and period n, the EMA SHALL:
     * 1. Have length = data.length - period + 1
     * 2. First value equals SMA of first n values
     * 3. Each subsequent value = price * k + prevEMA * (1-k) where k = 2/(n+1)
     * 
     * Validates: Requirements 9.1
     */
    it('should calculate EMA with correct length', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(1), max: Math.fround(1000), noNaN: true }),
            { minLength: 50, maxLength: 200 }
          ),
          fc.integer({ min: 5, max: 30 }),
          (prices, period) => {
            const ema = analyzer.calculateEMA(prices, period);
            
            // EMA length should be data.length - period + 1
            expect(ema.length).toBe(prices.length - period + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have first EMA value equal to SMA of first n values', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(1), max: Math.fround(1000), noNaN: true }),
            { minLength: 50, maxLength: 200 }
          ),
          fc.integer({ min: 5, max: 30 }),
          (prices, period) => {
            const ema = analyzer.calculateEMA(prices, period);
            const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
            
            // First EMA value should equal SMA
            expect(Math.abs(ema[0] - sma)).toBeLessThan(0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should follow EMA formula for subsequent values', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(10), max: Math.fround(100), noNaN: true }),
            { minLength: 50, maxLength: 100 }
          ),
          fc.integer({ min: 5, max: 20 }),
          (prices, period) => {
            const ema = analyzer.calculateEMA(prices, period);
            const k = 2 / (period + 1);
            
            // Verify EMA formula for each subsequent value
            for (let i = 1; i < ema.length; i++) {
              const priceIdx = period + i - 1;
              const expected = prices[priceIdx] * k + ema[i - 1] * (1 - k);
              expect(Math.abs(ema[i] - expected)).toBeLessThan(0.0001);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array for insufficient data', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(1), max: Math.fround(100), noNaN: true }),
            { minLength: 1, maxLength: 10 }
          ),
          fc.integer({ min: 20, max: 50 }),
          (prices, period) => {
            if (prices.length < period) {
              const ema = analyzer.calculateEMA(prices, period);
              expect(ema.length).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: RSI Bounds', () => {
    /**
     * Property: For any price series, RSI SHALL always be between 0 and 100 inclusive.
     * 
     * Validates: Requirements 9.2
     */
    it('should always produce RSI values between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(1), max: Math.fround(1000), noNaN: true }),
            { minLength: 50, maxLength: 200 }
          ),
          (prices) => {
            const rsi = analyzer.calculateRSI(prices, 14);
            
            rsi.forEach(value => {
              expect(value).toBeGreaterThanOrEqual(0);
              expect(value).toBeLessThanOrEqual(100);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return RSI near 100 for consistently rising prices', () => {
      // Generate strictly increasing prices
      const risingPrices = Array.from({ length: 100 }, (_, i) => 100 + i * 2);
      const rsi = analyzer.calculateRSI(risingPrices, 14);
      
      // Last RSI values should be very high (near 100)
      const lastRSI = rsi[rsi.length - 1];
      expect(lastRSI).toBeGreaterThan(90);
    });

    it('should return RSI near 0 for consistently falling prices', () => {
      // Generate strictly decreasing prices
      const fallingPrices = Array.from({ length: 100 }, (_, i) => 200 - i * 1.5);
      const rsi = analyzer.calculateRSI(fallingPrices, 14);
      
      // Last RSI values should be very low (near 0)
      const lastRSI = rsi[rsi.length - 1];
      expect(lastRSI).toBeLessThan(10);
    });

    it('should return RSI near 50 for oscillating prices', () => {
      // Generate oscillating prices
      const oscillatingPrices = Array.from({ length: 100 }, (_, i) => 
        100 + Math.sin(i * 0.5) * 10
      );
      const rsi = analyzer.calculateRSI(oscillatingPrices, 14);
      
      // RSI should be around 50 for balanced movement
      const avgRSI = rsi.reduce((a, b) => a + b, 0) / rsi.length;
      expect(avgRSI).toBeGreaterThan(30);
      expect(avgRSI).toBeLessThan(70);
    });

    it('should return empty array for insufficient data', () => {
      const shortPrices = [1, 2, 3, 4, 5];
      const rsi = analyzer.calculateRSI(shortPrices, 14);
      expect(rsi.length).toBe(0);
    });
  });

  describe('MACD Calculation', () => {
    it('should calculate MACD with correct structure', () => {
      const prices = Array.from({ length: 100 }, (_, i) => 100 + Math.sin(i * 0.1) * 10);
      const macd = analyzer.calculateMACD(prices);
      
      expect(macd).toHaveProperty('line');
      expect(macd).toHaveProperty('signal');
      expect(macd).toHaveProperty('histogram');
      expect(typeof macd.line).toBe('number');
      expect(typeof macd.signal).toBe('number');
      expect(typeof macd.histogram).toBe('number');
    });

    it('should have histogram equal to line minus signal', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(50), max: Math.fround(150), noNaN: true }),
            { minLength: 50, maxLength: 100 }
          ),
          (prices) => {
            const macd = analyzer.calculateMACD(prices);
            const expectedHistogram = macd.line - macd.signal;
            expect(Math.abs(macd.histogram - expectedHistogram)).toBeLessThan(0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Bollinger Bands Calculation', () => {
    it('should have upper > middle > lower', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(50), max: Math.fround(150), noNaN: true }),
            { minLength: 30, maxLength: 100 }
          ),
          (prices) => {
            const bb = analyzer.calculateBollingerBands(prices);
            
            if (bb.middle !== 0) {
              expect(bb.upper).toBeGreaterThan(bb.middle);
              expect(bb.middle).toBeGreaterThan(bb.lower);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have bands equidistant from middle', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.random() * 10);
      const bb = analyzer.calculateBollingerBands(prices);
      
      const upperDist = bb.upper - bb.middle;
      const lowerDist = bb.middle - bb.lower;
      
      expect(Math.abs(upperDist - lowerDist)).toBeLessThan(0.0001);
    });
  });

  describe('ATR Calculation', () => {
    it('should always produce positive ATR values', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              open: fc.float({ min: Math.fround(90), max: Math.fround(110), noNaN: true }),
              high: fc.float({ min: Math.fround(100), max: Math.fround(120), noNaN: true }),
              low: fc.float({ min: Math.fround(80), max: Math.fround(100), noNaN: true }),
              close: fc.float({ min: Math.fround(90), max: Math.fround(110), noNaN: true }),
            }),
            { minLength: 30, maxLength: 100 }
          ),
          (candles) => {
            // Ensure high >= low
            const validCandles = candles.map(c => ({
              ...c,
              high: Math.max(c.open, c.close, c.high),
              low: Math.min(c.open, c.close, c.low),
            }));
            
            const atr = analyzer.calculateATR(validCandles, 14);
            
            atr.forEach(value => {
              expect(value).toBeGreaterThanOrEqual(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Candlestick Pattern Detection', () => {
    it('should detect bullish engulfing pattern', () => {
      const candles = [
        { open: 100, high: 101, low: 98, close: 99 },  // Bearish
        { open: 98, high: 103, low: 97, close: 102 },  // Bullish engulfing
      ];
      
      expect(analyzer.isEngulfing(candles[0], candles[1])).toBe(true);
    });

    it('should detect bearish engulfing pattern', () => {
      const candles = [
        { open: 99, high: 102, low: 98, close: 101 },  // Bullish
        { open: 102, high: 103, low: 97, close: 98 },  // Bearish engulfing
      ];
      
      expect(analyzer.isEngulfing(candles[0], candles[1])).toBe(true);
    });

    it('should detect doji pattern', () => {
      const doji = { open: 100, high: 105, low: 95, close: 100.5 };
      expect(analyzer.isDoji(doji)).toBe(true);
      
      const notDoji = { open: 100, high: 105, low: 95, close: 104 };
      expect(analyzer.isDoji(notDoji)).toBe(false);
    });

    it('should detect hammer pattern', () => {
      // Hammer: small body at top, long lower wick (>2x body), tiny upper wick (<0.5x body)
      // body = |100.5 - 100| = 0.5, lowerWick = 100 - 90 = 10 (>1), upperWick = 100.5 - 100.5 = 0
      const hammer = { open: 100, high: 100.5, low: 90, close: 100.5 };
      expect(analyzer.isHammer(hammer)).toBe(true);
    });

    it('should detect shooting star pattern', () => {
      // Shooting star: small body at bottom, long upper wick (>2x body), tiny lower wick (<0.5x body)
      // body = |100 - 99.5| = 0.5, upperWick = 110 - 100 = 10 (>1), lowerWick = 99.5 - 99.5 = 0
      const shootingStar = { open: 100, high: 110, low: 99.5, close: 99.5 };
      expect(analyzer.isShootingStar(shootingStar)).toBe(true);
    });

    it('should detect pin bar pattern', () => {
      const pinBar = { open: 100, high: 101, low: 90, close: 100.5 };
      expect(analyzer.isPinBar(pinBar)).toBe(true);
    });
  });

  describe('Trend Analysis', () => {
    it('should identify bullish trend when price above EMAs', () => {
      const closes = Array.from({ length: 250 }, (_, i) => 100 + i * 0.5);
      const emas = analyzer.calculateEMAs(closes);
      const trend = analyzer.analyzeTrend(closes, emas);
      
      expect(trend.direction).toBe('bullish');
      expect(trend.strength).toBeGreaterThan(0);
    });

    it('should identify bearish trend when price below EMAs', () => {
      const closes = Array.from({ length: 250 }, (_, i) => 200 - i * 0.5);
      const emas = analyzer.calculateEMAs(closes);
      const trend = analyzer.analyzeTrend(closes, emas);
      
      expect(trend.direction).toBe('bearish');
      expect(trend.strength).toBeGreaterThan(0);
    });
  });

  describe('Full Analysis', () => {
    it('should return complete analysis structure', async () => {
      const marketData = {
        H1: {
          candles: Array.from({ length: 250 }, (_, i) => ({
            timestamp: Date.now() - (250 - i) * 3600000,
            open: 100 + Math.sin(i * 0.1) * 5,
            high: 102 + Math.sin(i * 0.1) * 5,
            low: 98 + Math.sin(i * 0.1) * 5,
            close: 101 + Math.sin(i * 0.1) * 5,
            volume: 1000 + Math.random() * 500,
          })),
        },
      };

      const analysis = await analyzer.analyze(marketData);
      
      expect(analysis).toHaveProperty('trend');
      expect(analysis).toHaveProperty('momentum');
      expect(analysis).toHaveProperty('volatility');
      expect(analysis).toHaveProperty('indicators');
      expect(analysis).toHaveProperty('patterns');
      expect(analysis).toHaveProperty('divergences');
      expect(analysis).toHaveProperty('score');
      expect(analysis).toHaveProperty('bias');
      
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
    });

    it('should return empty analysis for insufficient data', async () => {
      const marketData = {
        H1: {
          candles: Array.from({ length: 50 }, (_, i) => ({
            timestamp: Date.now() - (50 - i) * 3600000,
            open: 100,
            high: 102,
            low: 98,
            close: 101,
            volume: 1000,
          })),
        },
      };

      const analysis = await analyzer.analyze(marketData);
      
      expect(analysis.trend.direction).toBe('neutral');
      expect(analysis.score).toBe(0);
    });
  });
});


describe('Additional Candlestick Patterns', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new TechnicalAnalyzer();
  });

  describe('Morning Star Pattern', () => {
    it('should detect morning star pattern', () => {
      // 1st: Large bearish candle
      const first = { open: 110, high: 111, low: 100, close: 101 };
      // 2nd: Small body (doji-like)
      const second = { open: 100, high: 101, low: 99, close: 100.5 };
      // 3rd: Large bullish candle closing above 1st midpoint (105.5)
      const third = { open: 101, high: 112, low: 100, close: 110 };
      
      expect(analyzer.isMorningStar(first, second, third)).toBe(true);
    });

    it('should not detect morning star when conditions not met', () => {
      // First candle is bullish (not bearish)
      const first = { open: 100, high: 111, low: 99, close: 110 };
      const second = { open: 110, high: 111, low: 109, close: 110.5 };
      const third = { open: 111, high: 115, low: 110, close: 114 };
      
      expect(analyzer.isMorningStar(first, second, third)).toBe(false);
    });
  });

  describe('Evening Star Pattern', () => {
    it('should detect evening star pattern', () => {
      // 1st: Large bullish candle
      const first = { open: 100, high: 111, low: 99, close: 110 };
      // 2nd: Small body (doji-like)
      const second = { open: 111, high: 112, low: 110, close: 111.5 };
      // 3rd: Large bearish candle closing below 1st midpoint (105)
      const third = { open: 110, high: 111, low: 99, close: 100 };
      
      expect(analyzer.isEveningStar(first, second, third)).toBe(true);
    });

    it('should not detect evening star when conditions not met', () => {
      // First candle is bearish (not bullish)
      const first = { open: 110, high: 111, low: 99, close: 100 };
      const second = { open: 100, high: 101, low: 99, close: 100.5 };
      const third = { open: 99, high: 100, low: 90, close: 91 };
      
      expect(analyzer.isEveningStar(first, second, third)).toBe(false);
    });
  });

  describe('Inside Bar Pattern', () => {
    it('should detect inside bar pattern', () => {
      const prev = { open: 100, high: 110, low: 90, close: 105 };
      const curr = { open: 102, high: 108, low: 92, close: 104 };
      
      expect(analyzer.isInsideBar(prev, curr)).toBe(true);
    });

    it('should not detect inside bar when high exceeds previous', () => {
      const prev = { open: 100, high: 110, low: 90, close: 105 };
      const curr = { open: 102, high: 115, low: 92, close: 104 };
      
      expect(analyzer.isInsideBar(prev, curr)).toBe(false);
    });

    it('should not detect inside bar when low exceeds previous', () => {
      const prev = { open: 100, high: 110, low: 90, close: 105 };
      const curr = { open: 102, high: 108, low: 85, close: 104 };
      
      expect(analyzer.isInsideBar(prev, curr)).toBe(false);
    });
  });
});

describe('Fibonacci Calculations', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new TechnicalAnalyzer();
  });

  describe('Fibonacci Retracement', () => {
    it('should calculate correct retracement levels for bullish direction', () => {
      const swingHigh = 100;
      const swingLow = 50;
      const fib = analyzer.calculateFibonacciRetracement(swingHigh, swingLow, 'bullish');
      
      expect(fib.levels['0%']).toBe(100);      // 100 - (50 * 0) = 100
      expect(fib.levels['50%']).toBe(75);      // 100 - (50 * 0.5) = 75
      expect(fib.levels['100%']).toBe(50);     // 100 - (50 * 1) = 50
      expect(fib.levels['61.8%']).toBeCloseTo(69.1, 1);  // 100 - (50 * 0.618) = 69.1
    });

    it('should calculate correct retracement levels for bearish direction', () => {
      const swingHigh = 100;
      const swingLow = 50;
      const fib = analyzer.calculateFibonacciRetracement(swingHigh, swingLow, 'bearish');
      
      expect(fib.levels['0%']).toBe(50);       // 50 + (50 * 0) = 50
      expect(fib.levels['50%']).toBe(75);      // 50 + (50 * 0.5) = 75
      expect(fib.levels['100%']).toBe(100);    // 50 + (50 * 1) = 100
    });

    it('should identify golden zone correctly', () => {
      const swingHigh = 100;
      const swingLow = 50;
      const fib = analyzer.calculateFibonacciRetracement(swingHigh, swingLow, 'bullish');
      
      // Golden zone is between 61.8% and 78.6% retracement
      expect(fib.goldenZone.upper).toBeCloseTo(69.1, 1);  // 61.8%
      expect(fib.goldenZone.lower).toBeCloseTo(60.7, 1);  // 78.6%
    });
  });

  describe('Fibonacci Extension', () => {
    it('should calculate correct extension levels for bullish direction', () => {
      const swingHigh = 100;
      const swingLow = 50;
      const retracePoint = 70;
      const fib = analyzer.calculateFibonacciExtension(swingHigh, swingLow, retracePoint, 'bullish');
      
      expect(fib.levels['100%']).toBe(120);     // 70 + (50 * 1) = 120
      expect(fib.levels['161.8%']).toBeCloseTo(150.9, 1);  // 70 + (50 * 1.618) = 150.9
    });

    it('should calculate correct extension levels for bearish direction', () => {
      const swingHigh = 100;
      const swingLow = 50;
      const retracePoint = 80;
      const fib = analyzer.calculateFibonacciExtension(swingHigh, swingLow, retracePoint, 'bearish');
      
      expect(fib.levels['100%']).toBe(30);     // 80 - (50 * 1) = 30
      expect(fib.levels['161.8%']).toBeCloseTo(-0.9, 1);  // 80 - (50 * 1.618) = -0.9
    });

    it('should provide primary targets', () => {
      const swingHigh = 100;
      const swingLow = 50;
      const retracePoint = 70;
      const fib = analyzer.calculateFibonacciExtension(swingHigh, swingLow, retracePoint, 'bullish');
      
      expect(fib.primaryTargets.tp1).toBe(120);  // 100%
      expect(fib.primaryTargets.tp2).toBeCloseTo(150.9, 1);  // 161.8%
      expect(fib.primaryTargets.tp3).toBeCloseTo(200.9, 1);  // 261.8%
    });
  });

  describe('Auto Fibonacci', () => {
    it('should auto-detect swing points and calculate levels', () => {
      // Create candles with clear swing high and low
      const candles = [];
      // First 25 candles going down (swing low at end)
      for (let i = 0; i < 25; i++) {
        candles.push({
          open: 100 - i * 2,
          high: 101 - i * 2,
          low: 99 - i * 2,
          close: 100 - i * 2,
        });
      }
      // Next 25 candles going up (swing high at end)
      for (let i = 0; i < 25; i++) {
        candles.push({
          open: 50 + i * 2,
          high: 51 + i * 2,
          low: 49 + i * 2,
          close: 50 + i * 2,
        });
      }
      
      const fib = analyzer.autoFibonacci(candles);
      
      expect(fib.retracement).toBeDefined();
      expect(fib.extension).toBeDefined();
      expect(fib.currentPrice).toBeDefined();
      expect(fib.nearestLevel).toBeDefined();
    });

    it('should return null for insufficient data', () => {
      const candles = Array.from({ length: 10 }, (_, i) => ({
        open: 100,
        high: 101,
        low: 99,
        close: 100,
      }));
      
      const fib = analyzer.autoFibonacci(candles);
      
      expect(fib.retracement).toBeNull();
      expect(fib.extension).toBeNull();
    });

    it('should identify if price is in golden zone', () => {
      // Create candles where current price is in golden zone
      const candles = [];
      for (let i = 0; i < 50; i++) {
        const price = i < 25 ? 50 + i * 2 : 100 - (i - 25) * 0.5;
        candles.push({
          open: price,
          high: price + 1,
          low: price - 1,
          close: price,
        });
      }
      
      const fib = analyzer.autoFibonacci(candles);
      
      expect(typeof fib.inGoldenZone).toBe('boolean');
    });
  });
});
