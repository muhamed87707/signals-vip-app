/**
 * Performance Calculator Tests
 * Property 17: Win Rate Calculation
 * Validates: Requirements 19.1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Performance calculation functions (extracted for testing)
function calculateWinRate(signals) {
  if (signals.length === 0) return 0;
  
  const wins = signals.filter(s => ['tp1_hit', 'tp2_hit', 'tp3_hit'].includes(s.status));
  return (wins.length / signals.length) * 100;
}

function calculatePerformance(signals) {
  if (signals.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      totalPips: 0,
      averagePips: 0,
      totalWins: 0,
      totalLosses: 0,
    };
  }

  const wins = signals.filter(s => ['tp1_hit', 'tp2_hit', 'tp3_hit'].includes(s.status));
  const losses = signals.filter(s => s.status === 'sl_hit');
  
  const winRate = (wins.length / signals.length) * 100;
  
  const totalWinPips = wins.reduce((sum, s) => sum + (s.pnlPips || 0), 0);
  const totalLossPips = Math.abs(losses.reduce((sum, s) => sum + (s.pnlPips || 0), 0));
  const totalPips = totalWinPips - totalLossPips;
  
  const profitFactor = totalLossPips > 0 ? totalWinPips / totalLossPips : totalWinPips;
  const averagePips = totalPips / signals.length;

  return {
    winRate: Math.round(winRate * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    totalPips: Math.round(totalPips * 10) / 10,
    averagePips: Math.round(averagePips * 10) / 10,
    totalWins: wins.length,
    totalLosses: losses.length,
  };
}

// Signal generator for property tests - realistic signals
// Winning signals have positive pnlPips, losing signals have negative pnlPips
const winningSignalArbitrary = fc.record({
  symbol: fc.constantFrom('EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'),
  status: fc.constantFrom('tp1_hit', 'tp2_hit', 'tp3_hit'),
  pnlPips: fc.float({ min: 10, max: 200, noNaN: true }), // Wins are positive
  pnlPercent: fc.float({ min: 0.5, max: 10, noNaN: true }),
  quality: fc.constantFrom('good', 'strong', 'excellent', 'institutional'),
  closedAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
});

const losingSignalArbitrary = fc.record({
  symbol: fc.constantFrom('EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'),
  status: fc.constant('sl_hit'),
  pnlPips: fc.float({ min: -100, max: -10, noNaN: true }), // Losses are negative
  pnlPercent: fc.float({ min: -5, max: -0.5, noNaN: true }),
  quality: fc.constantFrom('good', 'strong', 'excellent', 'institutional'),
  closedAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
});

const expiredSignalArbitrary = fc.record({
  symbol: fc.constantFrom('EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'),
  status: fc.constant('expired'),
  pnlPips: fc.constant(0),
  pnlPercent: fc.constant(0),
  quality: fc.constantFrom('good', 'strong', 'excellent', 'institutional'),
  closedAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
});

// Combined realistic signal generator
const signalArbitrary = fc.oneof(
  { weight: 3, arbitrary: winningSignalArbitrary },
  { weight: 2, arbitrary: losingSignalArbitrary },
  { weight: 1, arbitrary: expiredSignalArbitrary }
);

describe('Performance Calculator', () => {
  describe('Property 17: Win Rate Calculation', () => {
    /**
     * Property 17: Win Rate Calculation
     * For any performance period, Win Rate SHALL equal (Winning Signals / Total Closed Signals) × 100,
     * and SHALL be between 0 and 100.
     * Validates: Requirements 19.1
     */

    it('should always produce win rate between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.array(signalArbitrary, { minLength: 1, maxLength: 100 }),
          (signals) => {
            const winRate = calculateWinRate(signals);
            return winRate >= 0 && winRate <= 100;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate win rate as (wins / total) * 100', () => {
      fc.assert(
        fc.property(
          fc.array(signalArbitrary, { minLength: 1, maxLength: 50 }),
          (signals) => {
            const winRate = calculateWinRate(signals);
            const wins = signals.filter(s => ['tp1_hit', 'tp2_hit', 'tp3_hit'].includes(s.status));
            const expectedWinRate = (wins.length / signals.length) * 100;
            
            return Math.abs(winRate - expectedWinRate) < 0.01;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for empty signals array', () => {
      const winRate = calculateWinRate([]);
      expect(winRate).toBe(0);
    });

    it('should return 100 for all winning signals', () => {
      const allWins = [
        { status: 'tp1_hit', pnlPips: 50 },
        { status: 'tp2_hit', pnlPips: 100 },
        { status: 'tp3_hit', pnlPips: 150 },
      ];
      const winRate = calculateWinRate(allWins);
      expect(winRate).toBe(100);
    });

    it('should return 0 for all losing signals', () => {
      const allLosses = [
        { status: 'sl_hit', pnlPips: -30 },
        { status: 'sl_hit', pnlPips: -25 },
        { status: 'sl_hit', pnlPips: -35 },
      ];
      const winRate = calculateWinRate(allLosses);
      expect(winRate).toBe(0);
    });

    it('should count expired signals as neither win nor loss', () => {
      const signals = [
        { status: 'tp1_hit', pnlPips: 50 },
        { status: 'expired', pnlPips: 0 },
        { status: 'sl_hit', pnlPips: -30 },
      ];
      // 1 win out of 3 total = 33.33%
      const winRate = calculateWinRate(signals);
      expect(winRate).toBeCloseTo(33.33, 1);
    });
  });

  describe('Performance Metrics Consistency', () => {
    it('should have totalWins + totalLosses <= total signals', () => {
      fc.assert(
        fc.property(
          fc.array(signalArbitrary, { minLength: 1, maxLength: 50 }),
          (signals) => {
            const perf = calculatePerformance(signals);
            return perf.totalWins + perf.totalLosses <= signals.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have non-negative profit factor when there are wins', () => {
      fc.assert(
        fc.property(
          fc.array(signalArbitrary, { minLength: 1, maxLength: 50 }),
          (signals) => {
            const perf = calculatePerformance(signals);
            return perf.profitFactor >= 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate correct total pips', () => {
      const signals = [
        { status: 'tp1_hit', pnlPips: 50 },
        { status: 'tp2_hit', pnlPips: 100 },
        { status: 'sl_hit', pnlPips: -30 },
      ];
      const perf = calculatePerformance(signals);
      expect(perf.totalPips).toBeCloseTo(120, 1); // 50 + 100 - 30 = 120
    });

    it('should calculate correct average pips', () => {
      const signals = [
        { status: 'tp1_hit', pnlPips: 60 },
        { status: 'sl_hit', pnlPips: -30 },
      ];
      const perf = calculatePerformance(signals);
      expect(perf.averagePips).toBeCloseTo(15, 1); // (60 - 30) / 2 = 15
    });
  });

  describe('Edge Cases', () => {
    it('should handle signals with zero pnlPips', () => {
      const signals = [
        { status: 'tp1_hit', pnlPips: 0 },
        { status: 'sl_hit', pnlPips: 0 },
      ];
      const perf = calculatePerformance(signals);
      expect(perf.winRate).toBe(50);
      expect(perf.totalPips).toBe(0);
    });

    it('should handle single signal', () => {
      const signals = [{ status: 'tp1_hit', pnlPips: 50 }];
      const perf = calculatePerformance(signals);
      expect(perf.winRate).toBe(100);
      expect(perf.totalWins).toBe(1);
      expect(perf.totalLosses).toBe(0);
    });

    it('should handle undefined pnlPips gracefully', () => {
      const signals = [
        { status: 'tp1_hit' },
        { status: 'sl_hit' },
      ];
      const perf = calculatePerformance(signals);
      expect(perf.winRate).toBe(50);
      expect(perf.totalPips).toBe(0);
    });
  });
});
