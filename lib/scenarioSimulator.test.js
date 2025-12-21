/**
 * Property Tests for Scenario Simulator
 * Property 16: Scenario Simulation Output
 * Validates: Requirements 8.2, 8.3
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateScenario, generateExplanation } from './scenarioSimulator';

describe('Property 16: Scenario Simulation Output', () => {
  /**
   * Property: Output always contains required fields
   */
  it('should always return valid output structure', () => {
    fc.assert(
      fc.property(
        fc.record({
          fedRateChange: fc.integer({ min: -100, max: 100 }),
          dxyChange: fc.float({ min: -5, max: 5, noNaN: true }),
          inflationChange: fc.float({ min: -1, max: 1, noNaN: true }),
          realYieldChange: fc.float({ min: -1, max: 1, noNaN: true }),
          geopoliticalRisk: fc.integer({ min: 0, max: 100 }),
        }),
        fc.float({ min: 1000, max: 5000, noNaN: true }),
        (scenario, currentPrice) => {
          const result = calculateScenario(scenario, currentPrice);
          
          expect(result).toHaveProperty('currentPrice');
          expect(result).toHaveProperty('projectedPrice');
          expect(result).toHaveProperty('totalImpact');
          expect(result).toHaveProperty('percentChange');
          expect(result).toHaveProperty('breakdown');
          expect(result).toHaveProperty('confidence');
          expect(typeof result.projectedPrice).toBe('number');
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Projected price equals current price plus total impact
   */
  it('projected price should equal current price plus total impact', () => {
    fc.assert(
      fc.property(
        fc.record({
          fedRateChange: fc.integer({ min: -100, max: 100 }),
          dxyChange: fc.float({ min: -5, max: 5, noNaN: true }),
        }),
        fc.float({ min: 1000, max: 5000, noNaN: true }),
        (scenario, currentPrice) => {
          const result = calculateScenario(scenario, currentPrice);
          const expected = Math.round((currentPrice + result.totalImpact) * 100) / 100;
          expect(result.projectedPrice).toBeCloseTo(expected, 1);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Explanation is always a non-empty string
   */
  it('should generate valid explanation', () => {
    fc.assert(
      fc.property(
        fc.record({
          fedRateChange: fc.integer({ min: -100, max: 100 }),
          dxyChange: fc.float({ min: -5, max: 5, noNaN: true }),
        }),
        fc.float({ min: 1000, max: 5000, noNaN: true }),
        (scenario, currentPrice) => {
          const result = calculateScenario(scenario, currentPrice);
          const explanation = generateExplanation(result);
          expect(typeof explanation).toBe('string');
          expect(explanation.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});
