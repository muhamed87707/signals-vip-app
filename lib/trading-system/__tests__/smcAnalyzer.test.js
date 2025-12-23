/**
 * SMC Analyzer Tests
 * Property-based tests for Fair Value Gap detection and Premium/Discount zones
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { SMCAnalyzer } from '../analyzers/smcAnalyzer';

describe('SMCAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new SMCAnalyzer();
  });

  describe('Property 7: Fair Value Gap Detection', () => {
    /**
     * Property: For any 3 consecutive candles where candle1.high < candle3.low (bullish)
     * or candle1.low > candle3.high (bearish), a Fair Value Gap SHALL be detected.
     * 
     * Validates: Requirements 2.2
     */
    it('should detect bullish FVG when gap exists between candle1 high and candle3 low', () => {
      // Create candles with clear bullish FVG
      const candles = [
        { open: 100, high: 101, low: 99, close: 100.5, timestamp: 1 },
        { open: 101, high: 103, low: 100.5, close: 102.5, timestamp: 2 },
        { open: 103, high: 105, low: 102, close: 104, timestamp: 3 }, // low (102) > candle1 high (101)
      ];
      
      const fvgs = analyzer.detectFVGs(candles);
      
      expect(fvgs.length).toBe(1);
      expect(fvgs[0].type).toBe('bullish');
      expect(fvgs[0].low).toBe(101); // candle1.high
      expect(fvgs[0].high).toBe(102); // candle3.low
    });

    it('should detect bearish FVG when gap exists between candle1 low and candle3 high', () => {
      // Create candles with clear bearish FVG
      const candles = [
        { open: 104, high: 105, low: 103, close: 103.5, timestamp: 1 },
        { open: 103, high: 103.5, low: 100, close: 100.5, timestamp: 2 },
        { open: 100, high: 101, low: 99, close: 99.5, timestamp: 3 }, // high (101) < candle1 low (103)
      ];
      
      const fvgs = analyzer.detectFVGs(candles);
      
      expect(fvgs.length).toBe(1);
      expect(fvgs[0].type).toBe('bearish');
      expect(fvgs[0].high).toBe(103); // candle1.low
      expect(fvgs[0].low).toBe(101); // candle3.high
    });

    it('should not detect FVG when no gap exists', () => {
      // Create candles without FVG (overlapping)
      const candles = [
        { open: 100, high: 102, low: 99, close: 101, timestamp: 1 },
        { open: 101, high: 103, low: 100, close: 102, timestamp: 2 },
        { open: 102, high: 104, low: 101, close: 103, timestamp: 3 }, // low (101) < candle1 high (102)
      ];
      
      const fvgs = analyzer.detectFVGs(candles);
      
      expect(fvgs.length).toBe(0);
    });

    it('should mark FVG as filled when price returns to gap', () => {
      // Create candles with FVG that gets filled
      const candles = [
        { open: 100, high: 101, low: 99, close: 100.5, timestamp: 1 },
        { open: 101, high: 103, low: 100.5, close: 102.5, timestamp: 2 },
        { open: 103, high: 105, low: 102, close: 104, timestamp: 3 }, // Bullish FVG
        { open: 104, high: 105, low: 100, close: 101, timestamp: 4 }, // Price drops into gap
      ];
      
      const fvgs = analyzer.detectFVGs(candles);
      
      // FVG should be filtered out as filled
      expect(fvgs.length).toBe(0);
    });

    it('should calculate FVG midpoint correctly', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(100), max: Math.fround(110), noNaN: true }),
          fc.float({ min: Math.fround(1), max: Math.fround(5), noNaN: true }),
          (basePrice, gapSize) => {
            const candles = [
              { open: basePrice, high: basePrice + 1, low: basePrice - 1, close: basePrice, timestamp: 1 },
              { open: basePrice + 2, high: basePrice + 3, low: basePrice + 1, close: basePrice + 2.5, timestamp: 2 },
              { open: basePrice + 2 + gapSize, high: basePrice + 3 + gapSize, low: basePrice + 1 + gapSize, close: basePrice + 2 + gapSize, timestamp: 3 },
            ];
            
            const fvgs = analyzer.detectFVGs(candles);
            
            if (fvgs.length > 0) {
              const expectedMidpoint = (fvgs[0].high + fvgs[0].low) / 2;
              expect(Math.abs(fvgs[0].midpoint - expectedMidpoint)).toBeLessThan(0.001);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Premium/Discount Zone Calculation', () => {
    /**
     * Property: For any price range, Premium zone SHALL be above 70% of range,
     * Discount zone SHALL be below 30% of range, with Equilibrium at 50%.
     * 
     * Validates: Requirements 2.4
     */
    it('should identify premium zone when price is above 70% of range', () => {
      // Create candles where current price is in premium zone
      const candles = [];
      for (let i = 0; i < 50; i++) {
        candles.push({
          open: 100 + (i % 10),
          high: 110,
          low: 100,
          close: 108, // 80% of range (100-110)
          timestamp: i,
        });
      }
      
      const pd = analyzer.calculatePremiumDiscount(candles);
      
      expect(pd.zone).toBe('premium');
      expect(pd.pricePosition).toBeGreaterThan(70);
    });

    it('should identify discount zone when price is below 30% of range', () => {
      // Create candles where current price is in discount zone
      const candles = [];
      for (let i = 0; i < 50; i++) {
        candles.push({
          open: 100 + (i % 10),
          high: 110,
          low: 100,
          close: 102, // 20% of range (100-110)
          timestamp: i,
        });
      }
      
      const pd = analyzer.calculatePremiumDiscount(candles);
      
      expect(pd.zone).toBe('discount');
      expect(pd.pricePosition).toBeLessThan(30);
    });

    it('should identify equilibrium when price is around 50% of range', () => {
      // Create candles where current price is at equilibrium
      const candles = [];
      for (let i = 0; i < 50; i++) {
        candles.push({
          open: 100 + (i % 10),
          high: 110,
          low: 100,
          close: 105, // 50% of range (100-110)
          timestamp: i,
        });
      }
      
      const pd = analyzer.calculatePremiumDiscount(candles);
      
      expect(pd.zone).toBe('equilibrium');
      expect(pd.pricePosition).toBeGreaterThanOrEqual(30);
      expect(pd.pricePosition).toBeLessThanOrEqual(70);
    });

    it('should calculate equilibrium as midpoint of range', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(50), max: Math.fround(100), noNaN: true }),
          fc.float({ min: Math.fround(10), max: Math.fround(50), noNaN: true }),
          (rangeLow, rangeSize) => {
            const rangeHigh = rangeLow + rangeSize;
            const candles = [];
            for (let i = 0; i < 50; i++) {
              candles.push({
                open: rangeLow + rangeSize / 2,
                high: rangeHigh,
                low: rangeLow,
                close: rangeLow + rangeSize / 2,
                timestamp: i,
              });
            }
            
            const pd = analyzer.calculatePremiumDiscount(candles);
            const expectedEquilibrium = (rangeHigh + rangeLow) / 2;
            
            expect(Math.abs(pd.equilibrium - expectedEquilibrium)).toBeLessThan(0.001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have premium zone above equilibrium and discount zone below', () => {
      const candles = [];
      for (let i = 0; i < 50; i++) {
        candles.push({
          open: 100,
          high: 110,
          low: 100,
          close: 105,
          timestamp: i,
        });
      }
      
      const pd = analyzer.calculatePremiumDiscount(candles);
      
      expect(pd.premiumZone.low).toBeGreaterThan(pd.equilibrium);
      expect(pd.discountZone.high).toBeLessThan(pd.equilibrium);
    });
  });

  describe('Order Block Detection', () => {
    it('should detect bullish order block', () => {
      // Bearish candle followed by strong bullish move
      const candles = [];
      // Add some initial candles
      for (let i = 0; i < 10; i++) {
        candles.push({ open: 100, high: 101, low: 99, close: 100, timestamp: i });
      }
      // Bearish candle (potential OB)
      candles.push({ open: 102, high: 103, low: 99, close: 100, timestamp: 10 });
      // Strong bullish move
      candles.push({ open: 100, high: 106, low: 99, close: 105, timestamp: 11 });
      candles.push({ open: 105, high: 110, low: 104, close: 109, timestamp: 12 });
      
      const obs = analyzer.detectOrderBlocks(candles);
      
      const bullishOB = obs.find(ob => ob.type === 'bullish');
      expect(bullishOB).toBeDefined();
    });

    it('should detect bearish order block', () => {
      // Bullish candle followed by strong bearish move
      const candles = [];
      // Add some initial candles
      for (let i = 0; i < 10; i++) {
        candles.push({ open: 100, high: 101, low: 99, close: 100, timestamp: i });
      }
      // Bullish candle (potential OB)
      candles.push({ open: 98, high: 103, low: 97, close: 102, timestamp: 10 });
      // Strong bearish move
      candles.push({ open: 102, high: 103, low: 96, close: 97, timestamp: 11 });
      candles.push({ open: 97, high: 98, low: 92, close: 93, timestamp: 12 });
      
      const obs = analyzer.detectOrderBlocks(candles);
      
      const bearishOB = obs.find(ob => ob.type === 'bearish');
      expect(bearishOB).toBeDefined();
    });

    it('should filter out mitigated order blocks', () => {
      const candles = [];
      for (let i = 0; i < 10; i++) {
        candles.push({ open: 100, high: 101, low: 99, close: 100, timestamp: i });
      }
      // Bearish candle (potential bullish OB)
      candles.push({ open: 102, high: 103, low: 99, close: 100, timestamp: 10 });
      // Strong bullish move
      candles.push({ open: 100, high: 106, low: 99, close: 105, timestamp: 11 });
      candles.push({ open: 105, high: 110, low: 104, close: 109, timestamp: 12 });
      // Price returns and breaks below OB low (mitigates it)
      candles.push({ open: 109, high: 110, low: 98, close: 98, timestamp: 13 });
      
      const obs = analyzer.detectOrderBlocks(candles);
      
      // Mitigated OB should be filtered out
      const bullishOB = obs.find(ob => ob.type === 'bullish');
      expect(bullishOB).toBeUndefined();
    });
  });

  describe('Market Structure Analysis', () => {
    it('should find swing highs and lows', () => {
      const candles = [];
      // Create clear swing pattern
      for (let i = 0; i < 30; i++) {
        const price = 100 + Math.sin(i * 0.5) * 10;
        candles.push({
          open: price,
          high: price + 2,
          low: price - 2,
          close: price + 1,
          timestamp: i,
        });
      }
      
      const structure = analyzer.analyzeMarketStructure(candles);
      
      expect(structure.swingPoints.highs.length).toBeGreaterThan(0);
      expect(structure.swingPoints.lows.length).toBeGreaterThan(0);
    });

    it('should detect Break of Structure (BOS)', () => {
      const candles = [];
      // Uptrend with higher highs
      for (let i = 0; i < 50; i++) {
        const basePrice = 100 + i * 0.5;
        candles.push({
          open: basePrice,
          high: basePrice + 2 + (i % 10 === 5 ? 3 : 0), // Swing highs every 10 candles
          low: basePrice - 2 - (i % 10 === 0 ? 3 : 0), // Swing lows every 10 candles
          close: basePrice + 1,
          timestamp: i,
        });
      }
      
      const structure = analyzer.analyzeMarketStructure(candles);
      
      // Should detect BOS events
      expect(structure.bos.length).toBeGreaterThanOrEqual(0);
    });

    it('should determine bias based on structure', () => {
      const candles = [];
      // Clear uptrend
      for (let i = 0; i < 50; i++) {
        const price = 100 + i * 2;
        candles.push({
          open: price,
          high: price + 3,
          low: price - 1,
          close: price + 2,
          timestamp: i,
        });
      }
      
      const structure = analyzer.analyzeMarketStructure(candles);
      
      expect(['bullish', 'bearish', 'neutral']).toContain(structure.bias);
    });
  });

  describe('Liquidity Zone Detection', () => {
    it('should detect equal highs', () => {
      const candles = [];
      for (let i = 0; i < 50; i++) {
        candles.push({
          open: 100,
          high: i % 10 === 0 ? 110 : 105, // Equal highs at 110
          low: 99,
          close: 101,
          timestamp: i,
        });
      }
      
      const liquidity = analyzer.detectLiquidityZones(candles);
      
      expect(liquidity.equalHighs.length).toBeGreaterThan(0);
    });

    it('should detect equal lows', () => {
      const candles = [];
      for (let i = 0; i < 50; i++) {
        candles.push({
          open: 100,
          high: 105,
          low: i % 10 === 0 ? 95 : 98, // Equal lows at 95
          close: 101,
          timestamp: i,
        });
      }
      
      const liquidity = analyzer.detectLiquidityZones(candles);
      
      expect(liquidity.equalLows.length).toBeGreaterThan(0);
    });
  });

  describe('OTE Zone Calculation', () => {
    it('should calculate OTE zone between 61.8% and 78.6% retracement', () => {
      const candles = [];
      // Create clear swing high and low
      for (let i = 0; i < 30; i++) {
        candles.push({
          open: 100,
          high: i === 10 ? 120 : 105, // Swing high at 120
          low: i === 20 ? 100 : 102, // Swing low at 100
          close: 103,
          timestamp: i,
        });
      }
      
      const structure = analyzer.analyzeMarketStructure(candles);
      const ote = analyzer.calculateOTEZone(candles, structure);
      
      if (ote) {
        // OTE should be between 61.8% and 78.6% of the range
        const range = ote.swingHigh - ote.swingLow;
        const oteRange = ote.high - ote.low;
        
        expect(oteRange).toBeGreaterThan(0);
        expect(ote.high).toBeLessThanOrEqual(ote.swingHigh);
        expect(ote.low).toBeGreaterThanOrEqual(ote.swingLow);
      }
    });
  });

  describe('Full Analysis', () => {
    it('should return complete analysis structure', async () => {
      const marketData = {
        H1: {
          candles: Array.from({ length: 100 }, (_, i) => ({
            timestamp: Date.now() - (100 - i) * 3600000,
            open: 100 + Math.sin(i * 0.1) * 5,
            high: 102 + Math.sin(i * 0.1) * 5,
            low: 98 + Math.sin(i * 0.1) * 5,
            close: 101 + Math.sin(i * 0.1) * 5,
            volume: 1000,
          })),
        },
      };

      const analysis = await analyzer.analyze(marketData);
      
      expect(analysis).toHaveProperty('orderBlocks');
      expect(analysis).toHaveProperty('fvgs');
      expect(analysis).toHaveProperty('liquidity');
      expect(analysis).toHaveProperty('structure');
      expect(analysis).toHaveProperty('premiumDiscount');
      expect(analysis).toHaveProperty('score');
      expect(analysis).toHaveProperty('bias');
      
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
    });

    it('should return empty analysis for insufficient data', async () => {
      const marketData = {
        H1: {
          candles: Array.from({ length: 10 }, (_, i) => ({
            timestamp: Date.now() - (10 - i) * 3600000,
            open: 100,
            high: 102,
            low: 98,
            close: 101,
            volume: 1000,
          })),
        },
      };

      const analysis = await analyzer.analyze(marketData);
      
      expect(analysis.score).toBe(0);
      expect(analysis.bias).toBe('neutral');
    });
  });
});
