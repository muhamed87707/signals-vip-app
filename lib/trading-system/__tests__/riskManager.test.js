/**
 * Risk Manager Tests
 * Property-based tests for risk management calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { RiskManager } from '../risk/riskManager';

describe('RiskManager', () => {
  let riskManager;

  beforeEach(() => {
    riskManager = new RiskManager();
  });

  describe('Property 3: Risk Management Constraints', () => {
    /**
     * Property: Stop Loss SHALL be between minSlPips and maxSlPips,
     * and risk per trade SHALL not exceed maxRiskPercent.
     * 
     * Validates: Requirements 15.1, 15.2
     */
    it('should constrain stop loss within min and max pips', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(1.0), max: Math.fround(2.0), noNaN: true }),
          fc.float({ min: Math.fround(0.001), max: Math.fround(0.01), noNaN: true }),
          (entryPrice, atr) => {
            const stopLoss = riskManager.calculateStopLoss({
              symbol: 'EURUSD',
              direction: 'BUY',
              entryPrice,
              atr,
              swingHigh: null,
              swingLow: null,
              orderBlock: null,
              fvg: null,
            });
            
            expect(stopLoss.pips).toBeGreaterThanOrEqual(riskManager.config.minSlPips);
            expect(stopLoss.pips).toBeLessThanOrEqual(riskManager.config.maxSlPips);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not exceed maximum risk percent', () => {
      const result = riskManager.calculate({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        accountBalance: 10000,
        atr: 0.0050,
        swingHigh: null,
        swingLow: 1.0950,
        orderBlock: null,
        fvg: null,
      });
      
      expect(result.positionSize.riskPercent).toBeLessThanOrEqual(riskManager.config.maxRiskPercent);
    });

    it('should use default risk percent of 1%', () => {
      expect(riskManager.config.defaultRiskPercent).toBe(1.0);
    });

    it('should have maximum risk percent of 2%', () => {
      expect(riskManager.config.maxRiskPercent).toBe(2.0);
    });
  });

  describe('Property 4: Position Size Calculation', () => {
    /**
     * Property: Position size SHALL be calculated such that
     * risk amount = account balance * risk percent.
     * 
     * Validates: Requirements 15.3
     */
    it('should calculate position size based on risk percent', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 100000 }),
          fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true }),
          (accountBalance, riskPercent) => {
            const positionSize = riskManager.calculatePositionSize({
              symbol: 'EURUSD',
              accountBalance,
              entryPrice: 1.1000,
              stopLoss: { pips: 20, distance: 0.0020 },
              riskPercent,
            });
            
            const expectedRiskAmount = accountBalance * (riskPercent / 100);
            
            // Risk amount should be close to expected (within rounding)
            expect(Math.abs(positionSize.riskAmount - expectedRiskAmount)).toBeLessThan(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return positive lot size', () => {
      const positionSize = riskManager.calculatePositionSize({
        symbol: 'EURUSD',
        accountBalance: 10000,
        entryPrice: 1.1000,
        stopLoss: { pips: 20, distance: 0.0020 },
        riskPercent: 1.0,
      });
      
      expect(positionSize.lots).toBeGreaterThan(0);
      expect(positionSize.units).toBeGreaterThan(0);
    });

    it('should scale position size with account balance', () => {
      const smallAccount = riskManager.calculatePositionSize({
        symbol: 'EURUSD',
        accountBalance: 1000,
        entryPrice: 1.1000,
        stopLoss: { pips: 20, distance: 0.0020 },
        riskPercent: 1.0,
      });
      
      const largeAccount = riskManager.calculatePositionSize({
        symbol: 'EURUSD',
        accountBalance: 10000,
        entryPrice: 1.1000,
        stopLoss: { pips: 20, distance: 0.0020 },
        riskPercent: 1.0,
      });
      
      // Larger account should have larger position
      expect(largeAccount.lots).toBeGreaterThan(smallAccount.lots);
      expect(largeAccount.riskAmount).toBeGreaterThan(smallAccount.riskAmount);
    });
  });

  describe('Property 16: Take Profit Ratio Consistency', () => {
    /**
     * Property: Take Profit levels SHALL maintain consistent ratios:
     * TP1 = 1.5x SL, TP2 = 2.5x SL, TP3 = 4x SL.
     * 
     * Validates: Requirements 15.4, 15.5, 15.6
     */
    it('should calculate TP levels with correct ratios', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(1.0), max: Math.fround(2.0), noNaN: true }),
          fc.float({ min: Math.fround(10), max: Math.fround(50), noNaN: true }),
          (entryPrice, slPips) => {
            const pipValue = 0.0001;
            const slDistance = slPips * pipValue;
            
            const takeProfits = riskManager.calculateTakeProfits({
              symbol: 'EURUSD',
              direction: 'BUY',
              entryPrice,
              stopLoss: { pips: slPips, distance: slDistance },
            });
            
            // Check ratios
            expect(takeProfits.tp1.ratio).toBe(1.5);
            expect(takeProfits.tp2.ratio).toBe(2.5);
            expect(takeProfits.tp3.ratio).toBe(4.0);
            
            // Check TP pips are proportional to SL pips
            expect(Math.abs(takeProfits.tp1.pips / slPips - 1.5)).toBeLessThan(0.1);
            expect(Math.abs(takeProfits.tp2.pips / slPips - 2.5)).toBeLessThan(0.1);
            expect(Math.abs(takeProfits.tp3.pips / slPips - 4.0)).toBeLessThan(0.1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have TP1 < TP2 < TP3 for BUY orders', () => {
      const takeProfits = riskManager.calculateTakeProfits({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        stopLoss: { pips: 20, distance: 0.0020 },
      });
      
      expect(takeProfits.tp1.price).toBeLessThan(takeProfits.tp2.price);
      expect(takeProfits.tp2.price).toBeLessThan(takeProfits.tp3.price);
    });

    it('should have TP1 > TP2 > TP3 for SELL orders', () => {
      const takeProfits = riskManager.calculateTakeProfits({
        symbol: 'EURUSD',
        direction: 'SELL',
        entryPrice: 1.1000,
        stopLoss: { pips: 20, distance: 0.0020 },
      });
      
      expect(takeProfits.tp1.price).toBeGreaterThan(takeProfits.tp2.price);
      expect(takeProfits.tp2.price).toBeGreaterThan(takeProfits.tp3.price);
    });

    it('should have partial close percentages sum to 100%', () => {
      const { partialClosePercents } = riskManager.config;
      const total = partialClosePercents.tp1 + partialClosePercents.tp2 + partialClosePercents.tp3;
      
      expect(total).toBe(100);
    });
  });

  describe('Risk/Reward Calculation', () => {
    it('should calculate correct R:R ratios', () => {
      const stopLoss = { pips: 20, distance: 0.0020 };
      const takeProfits = {
        tp1: { pips: 30, ratio: 1.5 },
        tp2: { pips: 50, ratio: 2.5 },
        tp3: { pips: 80, ratio: 4.0 },
      };
      
      const riskReward = riskManager.calculateRiskReward(1.1000, stopLoss, takeProfits);
      
      expect(riskReward.tp1).toBe(1.5);
      expect(riskReward.tp2).toBe(2.5);
      expect(riskReward.tp3).toBe(4.0);
    });

    it('should check if R:R meets minimum requirement', () => {
      const stopLoss = { pips: 20, distance: 0.0020 };
      
      // Good R:R
      const goodTPs = {
        tp1: { pips: 30, ratio: 1.5 },
        tp2: { pips: 50, ratio: 2.5 },
        tp3: { pips: 80, ratio: 4.0 },
      };
      const goodRR = riskManager.calculateRiskReward(1.1000, stopLoss, goodTPs);
      expect(goodRR.meetsMinimum).toBe(true);
      
      // Bad R:R
      const badTPs = {
        tp1: { pips: 15, ratio: 0.75 },
        tp2: { pips: 30, ratio: 1.5 },
        tp3: { pips: 40, ratio: 2.0 },
      };
      const badRR = riskManager.calculateRiskReward(1.1000, stopLoss, badTPs);
      expect(badRR.meetsMinimum).toBe(false);
    });

    it('should require minimum R:R of 2.5', () => {
      expect(riskManager.config.minRiskReward).toBe(2.5);
    });
  });

  describe('Stop Loss Calculation Methods', () => {
    it('should use ATR-based SL when no structure available', () => {
      const stopLoss = riskManager.calculateStopLoss({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        atr: 0.0030,
        swingHigh: null,
        swingLow: null,
        orderBlock: null,
        fvg: null,
      });
      
      expect(stopLoss.method).toBe('atr');
    });

    it('should use structure-based SL when swing points available', () => {
      const stopLoss = riskManager.calculateStopLoss({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        atr: 0.0030,
        swingHigh: null,
        swingLow: 1.0980,
        orderBlock: null,
        fvg: null,
      });
      
      expect(stopLoss.method).toBe('structure');
    });

    it('should use order block SL when available', () => {
      const stopLoss = riskManager.calculateStopLoss({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        atr: 0.0030,
        swingHigh: null,
        swingLow: null,
        orderBlock: { low: 1.0985, high: 1.0995 },
        fvg: null,
      });
      
      expect(stopLoss.method).toBe('orderBlock');
    });
  });

  describe('Volatility Adjustment', () => {
    it('should increase position size in low volatility', () => {
      const lowVolAdj = riskManager.calculateVolatilityAdjustment(0.0010, 'EURUSD');
      
      expect(lowVolAdj.volatilityLevel).toBe('low');
      expect(lowVolAdj.adjustment).toBeGreaterThan(1.0);
    });

    it('should decrease position size in high volatility', () => {
      const highVolAdj = riskManager.calculateVolatilityAdjustment(0.0100, 'EURUSD');
      
      expect(highVolAdj.volatilityLevel).toBe('high');
      expect(highVolAdj.adjustment).toBeLessThan(1.0);
    });

    it('should keep normal adjustment in normal volatility', () => {
      const normalVolAdj = riskManager.calculateVolatilityAdjustment(0.0050, 'EURUSD');
      
      expect(normalVolAdj.volatilityLevel).toBe('normal');
      expect(normalVolAdj.adjustment).toBe(1.0);
    });
  });

  describe('Full Calculation', () => {
    it('should return complete risk management structure', () => {
      const result = riskManager.calculate({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        accountBalance: 10000,
        atr: 0.0050,
        swingHigh: null,
        swingLow: 1.0950,
        orderBlock: null,
        fvg: null,
      });
      
      expect(result).toHaveProperty('symbol');
      expect(result).toHaveProperty('direction');
      expect(result).toHaveProperty('entry');
      expect(result).toHaveProperty('stopLoss');
      expect(result).toHaveProperty('takeProfits');
      expect(result).toHaveProperty('positionSize');
      expect(result).toHaveProperty('riskReward');
      expect(result).toHaveProperty('volatilityAdjustment');
      expect(result).toHaveProperty('riskAmount');
      expect(result).toHaveProperty('potentialProfit');
      expect(result).toHaveProperty('isValid');
    });

    it('should validate risk parameters', () => {
      const result = riskManager.calculate({
        symbol: 'EURUSD',
        direction: 'BUY',
        entryPrice: 1.1000,
        accountBalance: 10000,
        atr: 0.0050,
        swingHigh: null,
        swingLow: 1.0950,
        orderBlock: null,
        fvg: null,
      });
      
      expect(result.isValid).toHaveProperty('isValid');
      expect(result.isValid).toHaveProperty('issues');
    });
  });

  describe('Instrument Support', () => {
    it('should handle forex pairs correctly', () => {
      const pipValue = riskManager.getPipValue('EURUSD');
      expect(pipValue).toBe(0.0001);
    });

    it('should handle JPY pairs correctly', () => {
      const pipValue = riskManager.getPipValue('USDJPY');
      expect(pipValue).toBe(0.01);
    });

    it('should handle gold correctly', () => {
      const pipValue = riskManager.getPipValue('XAUUSD');
      expect(pipValue).toBe(0.1);
    });

    it('should handle indices correctly', () => {
      const pipValue = riskManager.getPipValue('US30');
      expect(pipValue).toBe(1);
    });
  });
});
