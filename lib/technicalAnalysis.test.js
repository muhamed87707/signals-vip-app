/**
 * Property Tests for Technical Analysis
 * Property 14: Technical Level Validity
 * Validates: Requirements 7.1
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { detectSupplyZones, detectDemandZones, getTechnicalLevels } from './technicalAnalysis';

// Generator for valid OHLC candle
const candleArb = fc.record({
  open: fc.float({ min: 1000, max: 3000, noNaN: true }),
  high: fc.float({ min: 1000, max: 3000, noNaN: true }),
  low: fc.float({ min: 1000, max: 3000, noNaN: true }),
  close: fc.float({ min: 1000, max: 3000, noNaN: true }),
  volume: fc.integer({ min: 1000, max: 100000 }),
  timestamp: fc.date(),
}).map(c => ({
  ...c,
  high: Math.max(c.open, c.close, c.high),
  low: Math.min(c.open, c.close, c.low),
}));

const candlesArb = fc.array(candleArb, { minLength: 10, maxLength: 60 });

describe('Property 14: Technical Level Validity', () => {
  /**
   * Property: All supply zones have high >= low
   */
  it('supply zones should have valid high/low relationship', () => {
    fc.assert(
      fc.property(candlesArb, (candles) => {
        const zones = detectSupplyZones(candles);
        zones.forEach(zone => {
          expect(zone.high).toBeGreaterThanOrEqual(zone.low);
          expect(zone.type).toBe('supply');
          expect(zone.strength).toBeGreaterThanOrEqual(0);
          expect(zone.strength).toBeLessThanOrEqual(100);
        });
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: All demand zones have high >= low
   */
  it('demand zones should have valid high/low relationship', () => {
    fc.assert(
      fc.property(candlesArb, (candles) => {
        const zones = detectDemandZones(candles);
        zones.forEach(zone => {
          expect(zone.high).toBeGreaterThanOrEqual(zone.low);
          expect(zone.type).toBe('demand');
          expect(zone.strength).toBeGreaterThanOrEqual(0);
          expect(zone.strength).toBeLessThanOrEqual(100);
        });
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: getTechnicalLevels returns valid structure
   */
  it('should return valid technical levels structure', () => {
    fc.assert(
      fc.property(candlesArb, (candles) => {
        const levels = getTechnicalLevels(candles);
        expect(levels).toHaveProperty('supply');
        expect(levels).toHaveProperty('demand');
        expect(levels).toHaveProperty('timestamp');
        expect(Array.isArray(levels.supply)).toBe(true);
        expect(Array.isArray(levels.demand)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});
