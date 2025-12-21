/**
 * Property Tests for SMC Analysis
 * Property 15: SMC Marker Validity
 * Validates: Requirements 7.2
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { detectOrderBlocks, detectFVG, getSMCMarkers } from './smcAnalysis';

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

describe('Property 15: SMC Marker Validity', () => {
  /**
   * Property: Order blocks have valid type and price levels
   */
  it('order blocks should have valid structure', () => {
    fc.assert(
      fc.property(candlesArb, (candles) => {
        const obs = detectOrderBlocks(candles);
        obs.forEach(ob => {
          expect(['bullish_ob', 'bearish_ob']).toContain(ob.type);
          expect(ob.high).toBeGreaterThanOrEqual(ob.low);
          expect(ob.strength).toBeGreaterThanOrEqual(0);
          expect(ob.strength).toBeLessThanOrEqual(100);
          expect(typeof ob.mitigated).toBe('boolean');
        });
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: FVGs have valid type and price levels
   */
  it('FVGs should have valid structure', () => {
    fc.assert(
      fc.property(candlesArb, (candles) => {
        const fvgs = detectFVG(candles);
        fvgs.forEach(fvg => {
          expect(['bullish_fvg', 'bearish_fvg']).toContain(fvg.type);
          expect(fvg.high).toBeGreaterThanOrEqual(fvg.low);
          expect(typeof fvg.filled).toBe('boolean');
          expect(fvg.fillPercent).toBeGreaterThanOrEqual(0);
        });
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: getSMCMarkers returns valid structure
   */
  it('should return valid SMC markers structure', () => {
    fc.assert(
      fc.property(candlesArb, (candles) => {
        const markers = getSMCMarkers(candles);
        expect(markers).toHaveProperty('orderBlocks');
        expect(markers).toHaveProperty('fvgs');
        expect(markers).toHaveProperty('timestamp');
        expect(Array.isArray(markers.orderBlocks)).toBe(true);
        expect(Array.isArray(markers.fvgs)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});
