/**
 * Property Tests for Real Yield Calculation
 * Feature: gold-forex-intelligence-dashboard, Property 6: Real Yield Calculation
 * Validates: Requirements 3.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateRealYield, getRealYieldImpact, calculateYieldSpread } from './yields';

describe('Real Yield Calculation', () => {
  describe('Property 6: Real Yield Calculation', () => {
    /**
     * Property: For any nominal 10Y yield value and inflation rate/breakeven value,
     * the calculated real yield must equal exactly: nominal10Y - inflationRate
     */
    it('should calculate real yield as nominal minus inflation', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -5, max: 15, noNaN: true }),
          fc.float({ min: -2, max: 10, noNaN: true }),
          (nominal10Y, inflationRate) => {
            const realYield = calculateRealYield(nominal10Y, inflationRate);
            const expected = nominal10Y - inflationRate;
            
            expect(realYield).toBeCloseTo(expected, 10);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Real yield should be negative when inflation exceeds nominal yield
     */
    it('should be negative when inflation exceeds nominal yield', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10, noNaN: true }),
          fc.float({ min: 0, max: 10, noNaN: true }),
          (nominal, inflation) => {
            // Ensure inflation > nominal
            const adjustedInflation = nominal + Math.abs(inflation) + 0.1;
            const realYield = calculateRealYield(nominal, adjustedInflation);
            
            expect(realYield).toBeLessThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Real yield should be positive when nominal exceeds inflation
     */
    it('should be positive when nominal exceeds inflation', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10, noNaN: true }),
          fc.float({ min: 0, max: 10, noNaN: true }),
          (nominal, inflation) => {
            // Ensure nominal > inflation
            const adjustedNominal = inflation + Math.abs(nominal) + 0.1;
            const realYield = calculateRealYield(adjustedNominal, inflation);
            
            expect(realYield).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Real yield impact should be consistent with value
     */
    it('should return correct impact based on real yield value', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -5, max: 5, noNaN: true }),
          (realYield) => {
            const impact = getRealYieldImpact(realYield);
            
            if (realYield < 0) {
              expect(impact).toBe('Bullish');
            } else if (realYield > 1) {
              expect(impact).toBe('Bearish');
            } else {
              expect(impact).toBe('Neutral');
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Yield Spread Calculation', () => {
    /**
     * Property: Spread should be inverted when short yield exceeds long yield
     */
    it('should detect yield curve inversion correctly', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10, noNaN: true }),
          fc.float({ min: 0, max: 10, noNaN: true }),
          (longYield, shortYield) => {
            const result = calculateYieldSpread(longYield, shortYield);
            
            expect(result.inverted).toBe(longYield < shortYield);
            expect(result.spread).toBeCloseTo(longYield - shortYield, 2);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should calculate real yield correctly', () => {
      expect(calculateRealYield(4.5, 3.2)).toBeCloseTo(1.3, 5);
      expect(calculateRealYield(4.0, 5.0)).toBeCloseTo(-1.0, 5);
      expect(calculateRealYield(3.0, 3.0)).toBeCloseTo(0, 5);
    });

    it('should return Bullish for negative real yields', () => {
      expect(getRealYieldImpact(-0.5)).toBe('Bullish');
      expect(getRealYieldImpact(-2.0)).toBe('Bullish');
    });

    it('should return Bearish for high positive real yields', () => {
      expect(getRealYieldImpact(1.5)).toBe('Bearish');
      expect(getRealYieldImpact(2.0)).toBe('Bearish');
    });

    it('should return Neutral for moderate real yields', () => {
      expect(getRealYieldImpact(0.5)).toBe('Neutral');
      expect(getRealYieldImpact(0)).toBe('Neutral');
    });

    it('should throw for non-number inputs', () => {
      expect(() => calculateRealYield('4.5', 3.2)).toThrow();
      expect(() => calculateRealYield(4.5, null)).toThrow();
    });

    it('should detect inverted yield curve', () => {
      const result = calculateYieldSpread(4.0, 4.5);
      expect(result.inverted).toBe(true);
      expect(result.status).toBe('Inverted');
    });

    it('should detect normal yield curve', () => {
      const result = calculateYieldSpread(4.5, 3.5);
      expect(result.inverted).toBe(false);
      expect(result.status).toBe('Normal');
    });
  });
});
