/**
 * Property Tests for Correlation Coefficient
 * Feature: gold-forex-intelligence-dashboard, Property 5: Correlation Coefficient Validity
 * Validates: Requirements 3.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateCorrelation, detectCorrelationChange } from './correlation';

describe('Correlation Coefficient', () => {
  describe('Property 5: Correlation Coefficient Validity', () => {
    /**
     * Property: For any calculated correlation coefficient between two price series,
     * the value must be within the range [-1, 1] inclusive.
     */
    it('should always return correlation within [-1, 1] range', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: -10000, max: 10000, noNaN: true }), { minLength: 2, maxLength: 100 }),
          fc.array(fc.float({ min: -10000, max: 10000, noNaN: true }), { minLength: 2, maxLength: 100 }),
          (arr1, arr2) => {
            // Make arrays same length
            const minLen = Math.min(arr1.length, arr2.length);
            const x = arr1.slice(0, minLen);
            const y = arr2.slice(0, minLen);
            
            if (x.length < 2) return true; // Skip if too short
            
            const correlation = calculateCorrelation(x, y);
            
            expect(correlation).toBeGreaterThanOrEqual(-1);
            expect(correlation).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Correlation of identical arrays should be 1
     */
    it('should return 1 for identical arrays', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: -1000, max: 1000, noNaN: true }), { minLength: 2, maxLength: 50 }),
          (arr) => {
            // Filter out arrays with all same values (variance = 0)
            const unique = new Set(arr);
            if (unique.size < 2) return true;
            
            const correlation = calculateCorrelation(arr, arr);
            expect(correlation).toBeCloseTo(1, 5);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Correlation is symmetric - corr(x,y) = corr(y,x)
     */
    it('should be symmetric', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: -1000, max: 1000, noNaN: true }), { minLength: 2, maxLength: 50 }),
          fc.array(fc.float({ min: -1000, max: 1000, noNaN: true }), { minLength: 2, maxLength: 50 }),
          (arr1, arr2) => {
            const minLen = Math.min(arr1.length, arr2.length);
            const x = arr1.slice(0, minLen);
            const y = arr2.slice(0, minLen);
            
            if (x.length < 2) return true;
            
            const corrXY = calculateCorrelation(x, y);
            const corrYX = calculateCorrelation(y, x);
            
            expect(corrXY).toBeCloseTo(corrYX, 10);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Negating one array should negate the correlation
     */
    it('should negate correlation when one array is negated', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: -1000, max: 1000, noNaN: true }), { minLength: 2, maxLength: 50 }),
          fc.array(fc.float({ min: -1000, max: 1000, noNaN: true }), { minLength: 2, maxLength: 50 }),
          (arr1, arr2) => {
            const minLen = Math.min(arr1.length, arr2.length);
            const x = arr1.slice(0, minLen);
            const y = arr2.slice(0, minLen);
            
            if (x.length < 2) return true;
            
            const corrXY = calculateCorrelation(x, y);
            const negY = y.map(v => -v);
            const corrXNegY = calculateCorrelation(x, negY);
            
            expect(corrXNegY).toBeCloseTo(-corrXY, 5);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Correlation Change Detection', () => {
    /**
     * Property: Change detection should correctly identify significant changes
     */
    it('should detect changes above threshold', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -1, max: 1, noNaN: true }),
          fc.float({ min: -1, max: 1, noNaN: true }),
          fc.float({ min: 0.01, max: 0.5, noNaN: true }),
          (oldCorr, newCorr, threshold) => {
            const result = detectCorrelationChange(oldCorr, newCorr, threshold);
            const absChange = Math.abs(newCorr - oldCorr);
            
            expect(result.changed).toBe(absChange >= threshold);
            expect(result.absChange).toBeCloseTo(absChange, 10);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should calculate perfect positive correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      expect(calculateCorrelation(x, y)).toBeCloseTo(1, 5);
    });

    it('should calculate perfect negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      expect(calculateCorrelation(x, y)).toBeCloseTo(-1, 5);
    });

    it('should return 0 for uncorrelated data', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 5, 5, 5, 5]; // Constant - no variance
      expect(calculateCorrelation(x, y)).toBe(0);
    });

    it('should throw for arrays of different lengths', () => {
      expect(() => calculateCorrelation([1, 2], [1, 2, 3])).toThrow();
    });

    it('should throw for arrays with less than 2 elements', () => {
      expect(() => calculateCorrelation([1], [1])).toThrow();
    });
  });
});
