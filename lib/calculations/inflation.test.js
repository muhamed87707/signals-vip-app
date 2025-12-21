/**
 * Property Tests for Inflation Impact Tagging
 * Feature: gold-forex-intelligence-dashboard, Property 7: Inflation Impact Tagging
 * Validates: Requirements 3.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getInflationImpact, validateInflationData, createInflationData } from './inflation';

describe('Inflation Impact Tagging', () => {
  describe('Property 7: Inflation Impact Tagging', () => {
    /**
     * Property: For any inflation data point (CPI, PPI, or PCE), it must have
     * an associated impact field with value 'Bullish', 'Bearish', or 'Neutral'
     */
    it('should always return valid impact tag for any inflation value', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('cpi', 'ppi', 'pce'),
          fc.float({ min: -5, max: 15, noNaN: true }),
          (type, value) => {
            const result = getInflationImpact(type, value);
            
            expect(result.impact).toBeDefined();
            expect(['Bullish', 'Bearish', 'Neutral']).toContain(result.impact);
            expect(result.type).toBe(type.toUpperCase());
            expect(result.value).toBe(value);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Created inflation data should always have all three fields with valid impacts
     */
    it('should create valid inflation data with all required fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            cpi: fc.float({ min: -2, max: 10, noNaN: true }),
            ppi: fc.float({ min: -2, max: 10, noNaN: true }),
            pce: fc.float({ min: -2, max: 10, noNaN: true }),
          }),
          (rawData) => {
            const result = createInflationData(rawData);
            
            // All three fields must exist
            expect(result.cpi).toBeDefined();
            expect(result.ppi).toBeDefined();
            expect(result.pce).toBeDefined();
            
            // All must have valid impact tags
            expect(['Bullish', 'Bearish', 'Neutral']).toContain(result.cpi.impact);
            expect(['Bullish', 'Bearish', 'Neutral']).toContain(result.ppi.impact);
            expect(['Bullish', 'Bearish', 'Neutral']).toContain(result.pce.impact);
            
            // Validation should pass
            expect(validateInflationData(result)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: High CPI values should be tagged as Bullish for Gold
     */
    it('should tag high CPI as Bullish', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 3.1, max: 15, noNaN: true }),
          (value) => {
            const result = getInflationImpact('cpi', value);
            expect(result.impact).toBe('Bullish');
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Low CPI values should be tagged as Bearish for Gold
     */
    it('should tag low CPI as Bearish', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -2, max: 1.9, noNaN: true }),
          (value) => {
            const result = getInflationImpact('cpi', value);
            expect(result.impact).toBe('Bearish');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should return Bullish for high CPI', () => {
      expect(getInflationImpact('cpi', 4.5).impact).toBe('Bullish');
    });

    it('should return Bearish for low CPI', () => {
      expect(getInflationImpact('cpi', 1.5).impact).toBe('Bearish');
    });

    it('should return Neutral for moderate CPI', () => {
      expect(getInflationImpact('cpi', 2.5).impact).toBe('Neutral');
    });

    it('should include change data when previous value provided', () => {
      const result = getInflationImpact('cpi', 3.5, 3.0);
      expect(result.change).toBe(0.5);
      expect(result.trend).toBe('rising');
    });

    it('should throw for invalid type', () => {
      expect(() => getInflationImpact('invalid', 3.0)).toThrow();
    });

    it('should throw for non-number value', () => {
      expect(() => getInflationImpact('cpi', 'invalid')).toThrow();
    });

    it('should validate correct inflation data', () => {
      const data = {
        cpi: { value: 3.2, impact: 'Bullish' },
        ppi: { value: 2.1, impact: 'Neutral' },
        pce: { value: 2.8, impact: 'Neutral' },
      };
      expect(validateInflationData(data)).toBe(true);
    });

    it('should reject invalid inflation data', () => {
      expect(validateInflationData(null)).toBe(false);
      expect(validateInflationData({})).toBe(false);
      expect(validateInflationData({ cpi: {} })).toBe(false);
    });
  });
});
