/**
 * Property Tests for Correlation Change Highlighting
 * Property 13: Correlation Change Highlighting
 * Validates: Requirements 6.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { detectCorrelationChange, getCorrelationStrength, getCorrelationColor } from './correlation';

describe('Property 13: Correlation Change Highlighting', () => {
  /**
   * Property: For any two correlation values and threshold,
   * change is flagged if and only if absolute difference >= threshold
   */
  it('should flag changes when absolute difference meets or exceeds threshold', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        fc.float({ min: -1, max: 1, noNaN: true }),
        fc.float({ min: 0.01, max: 0.5, noNaN: true }),
        (oldCorr, newCorr, threshold) => {
          const result = detectCorrelationChange(oldCorr, newCorr, threshold);
          const expectedChanged = Math.abs(newCorr - oldCorr) >= threshold;
          
          expect(result.changed).toBe(expectedChanged);
          expect(result.change).toBeCloseTo(newCorr - oldCorr, 5);
          expect(result.absChange).toBeCloseTo(Math.abs(newCorr - oldCorr), 5);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Direction is correctly determined based on change sign
   */
  it('should correctly determine change direction', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        fc.float({ min: -1, max: 1, noNaN: true }),
        (oldCorr, newCorr) => {
          const result = detectCorrelationChange(oldCorr, newCorr);
          const change = newCorr - oldCorr;
          
          if (change > 0) expect(result.direction).toBe('strengthened');
          else if (change < 0) expect(result.direction).toBe('weakened');
          else expect(result.direction).toBe('unchanged');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Correlation strength labels are consistent with value ranges
   */
  it('should assign correct strength labels based on correlation magnitude', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        (correlation) => {
          const strength = getCorrelationStrength(correlation);
          const abs = Math.abs(correlation);
          
          if (abs >= 0.8) expect(strength).toBe('very-strong');
          else if (abs >= 0.6) expect(strength).toBe('strong');
          else if (abs >= 0.4) expect(strength).toBe('moderate');
          else if (abs >= 0.2) expect(strength).toBe('weak');
          else expect(strength).toBe('negligible');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Color function returns valid CSS color for any correlation
   */
  it('should return valid color for any correlation value', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        (correlation) => {
          const color = getCorrelationColor(correlation);
          expect(color).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
        }
      ),
      { numRuns: 20 }
    );
  });
});
