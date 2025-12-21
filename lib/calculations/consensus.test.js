/**
 * Property Tests for Consensus Price Calculation
 * Feature: gold-forex-intelligence-dashboard, Property 3: Consensus Price Calculation
 * Validates: Requirements 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateConsensusPrice, validateForecast } from './consensus';

describe('Consensus Price Calculation', () => {
  describe('Property 3: Consensus Price Calculation', () => {
    /**
     * Property: For any non-empty array of bank forecasts with valid forecast prices,
     * the calculated consensus price must equal the arithmetic mean of all forecast prices
     */
    it('should calculate consensus as arithmetic mean', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              bankName: fc.constantFrom('JP Morgan', 'Goldman Sachs', 'Citi'),
              forecastPrice: fc.float({ min: 1000, max: 5000, noNaN: true }),
              timeframe: fc.constantFrom('Q1', 'Q2', 'Year-End'),
              analystLogic: fc.string({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (forecasts) => {
            const consensus = calculateConsensusPrice(forecasts);
            const expectedSum = forecasts.reduce((acc, f) => acc + f.forecastPrice, 0);
            const expectedMean = expectedSum / forecasts.length;
            
            expect(consensus).toBeCloseTo(expectedMean, 10);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Consensus of single forecast equals that forecast's price
     */
    it('should return single forecast price when only one forecast', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1000, max: 5000, noNaN: true }),
          (price) => {
            const forecasts = [{ forecastPrice: price }];
            const consensus = calculateConsensusPrice(forecasts);
            
            expect(consensus).toBe(price);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Consensus should be between min and max forecast prices
     */
    it('should be between min and max forecast prices', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              forecastPrice: fc.float({ min: 1000, max: 5000, noNaN: true }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (forecasts) => {
            const consensus = calculateConsensusPrice(forecasts);
            const prices = forecasts.map(f => f.forecastPrice);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            expect(consensus).toBeGreaterThanOrEqual(minPrice);
            expect(consensus).toBeLessThanOrEqual(maxPrice);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Adding a forecast equal to current consensus shouldn't change consensus
     */
    it('should not change when adding forecast equal to consensus', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              forecastPrice: fc.float({ min: 1000, max: 5000, noNaN: true }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (forecasts) => {
            const originalConsensus = calculateConsensusPrice(forecasts);
            const newForecasts = [...forecasts, { forecastPrice: originalConsensus }];
            const newConsensus = calculateConsensusPrice(newForecasts);
            
            expect(newConsensus).toBeCloseTo(originalConsensus, 10);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Forecast Validation', () => {
    it('should validate complete forecast objects', () => {
      fc.assert(
        fc.property(
          fc.record({
            bankName: fc.string({ minLength: 1 }),
            forecastPrice: fc.float({ min: 0, max: 10000, noNaN: true }),
            timeframe: fc.string({ minLength: 1 }),
            analystLogic: fc.string({ minLength: 1 }),
          }),
          (forecast) => {
            expect(validateForecast(forecast)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should calculate correct consensus for known values', () => {
      const forecasts = [
        { forecastPrice: 2900 },
        { forecastPrice: 2800 },
        { forecastPrice: 2700 },
      ];
      expect(calculateConsensusPrice(forecasts)).toBe(2800);
    });

    it('should return null for empty array', () => {
      expect(calculateConsensusPrice([])).toBeNull();
    });

    it('should return null for null input', () => {
      expect(calculateConsensusPrice(null)).toBeNull();
    });

    it('should filter out invalid forecasts', () => {
      const forecasts = [
        { forecastPrice: 2900 },
        { forecastPrice: null },
        { forecastPrice: 2700 },
      ];
      expect(calculateConsensusPrice(forecasts)).toBe(2800);
    });

    it('should validate forecast with all required fields', () => {
      const forecast = {
        bankName: 'JP Morgan',
        forecastPrice: 2800,
        timeframe: 'Year-End',
        analystLogic: 'Test logic',
      };
      expect(validateForecast(forecast)).toBe(true);
    });

    it('should reject forecast with missing fields', () => {
      expect(validateForecast({ bankName: 'JP Morgan' })).toBe(false);
      expect(validateForecast(null)).toBe(false);
      expect(validateForecast({})).toBe(false);
    });

    it('should reject forecast with negative price', () => {
      const forecast = {
        bankName: 'JP Morgan',
        forecastPrice: -100,
        timeframe: 'Year-End',
        analystLogic: 'Test',
      };
      expect(validateForecast(forecast)).toBe(false);
    });
  });
});
