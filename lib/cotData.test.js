/**
 * Property Tests for COT Data
 * Feature: gold-forex-intelligence-dashboard
 * Property 8: COT Histogram Data Accuracy - Validates: Requirements 4.2
 * Property 9: COT Overcrowded Alert Generation - Validates: Requirements 4.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateNetPosition, isOvercrowded, generateCOTAlert } from './cotData';

describe('COT Data', () => {
  describe('Property 8: COT Histogram Data Accuracy', () => {
    /**
     * Property: For any COT data object, the net position must equal
     * managedMoneyLong - managedMoneyShort
     */
    it('should calculate net position correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            managedMoneyLong: fc.integer({ min: 0, max: 500000 }),
            managedMoneyShort: fc.integer({ min: 0, max: 500000 }),
          }),
          (cotData) => {
            const netPosition = calculateNetPosition(cotData);
            const expected = cotData.managedMoneyLong - cotData.managedMoneyShort;
            
            expect(netPosition).toBe(expected);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Net position should be positive when longs > shorts
     */
    it('should return positive net when longs exceed shorts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500000 }),
          fc.integer({ min: 0, max: 500000 }),
          (base, diff) => {
            const cotData = {
              managedMoneyLong: base + diff,
              managedMoneyShort: base,
            };
            const netPosition = calculateNetPosition(cotData);
            
            expect(netPosition).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Net position should be negative when shorts > longs
     */
    it('should return negative net when shorts exceed longs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500000 }),
          fc.integer({ min: 1, max: 500000 }),
          (base, diff) => {
            const cotData = {
              managedMoneyLong: base,
              managedMoneyShort: base + diff,
            };
            const netPosition = calculateNetPosition(cotData);
            
            expect(netPosition).toBeLessThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 9: COT Overcrowded Alert Generation', () => {
    /**
     * Property: When managedMoneyLong exceeds historicHigh threshold,
     * the system must generate an alert with type 'overcrowded'
     */
    it('should generate overcrowded alert when longs exceed threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 500000 }),
          (historicHigh) => {
            const cotData = {
              managedMoneyLong: historicHigh, // At 100% of historic high
              managedMoneyShort: 50000,
              historicHigh,
            };
            
            const isOver = isOvercrowded(cotData, 0.9);
            expect(isOver).toBe(true);
            
            const alert = generateCOTAlert(cotData);
            expect(alert).not.toBeNull();
            expect(alert.type).toBe('overcrowded');
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: When longs are below threshold, no overcrowded alert
     */
    it('should not generate overcrowded alert when below threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 500000 }),
          (historicHigh) => {
            const cotData = {
              managedMoneyLong: Math.floor(historicHigh * 0.5), // 50% of historic high
              managedMoneyShort: 50000,
              historicHigh,
            };
            
            const isOver = isOvercrowded(cotData, 0.9);
            expect(isOver).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Alert severity should be 'high' for overcrowded
     */
    it('should have high severity for overcrowded alerts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 500000 }),
          (historicHigh) => {
            const cotData = {
              managedMoneyLong: historicHigh,
              managedMoneyShort: 10000,
              historicHigh,
            };
            
            const alert = generateCOTAlert(cotData);
            if (alert && alert.type === 'overcrowded') {
              expect(alert.severity).toBe('high');
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should calculate net position correctly', () => {
      expect(calculateNetPosition({ managedMoneyLong: 200000, managedMoneyShort: 50000 })).toBe(150000);
      expect(calculateNetPosition({ managedMoneyLong: 50000, managedMoneyShort: 100000 })).toBe(-50000);
    });

    it('should return 0 for null data', () => {
      expect(calculateNetPosition(null)).toBe(0);
    });

    it('should detect overcrowded position', () => {
      const cotData = {
        managedMoneyLong: 300000,
        managedMoneyShort: 50000,
        historicHigh: 320000,
      };
      expect(isOvercrowded(cotData, 0.9)).toBe(true);
    });

    it('should not detect overcrowded when below threshold', () => {
      const cotData = {
        managedMoneyLong: 200000,
        managedMoneyShort: 50000,
        historicHigh: 320000,
      };
      expect(isOvercrowded(cotData, 0.9)).toBe(false);
    });

    it('should generate overcrowded alert', () => {
      const cotData = {
        managedMoneyLong: 300000,
        managedMoneyShort: 50000,
        historicHigh: 320000,
      };
      const alert = generateCOTAlert(cotData);
      expect(alert).not.toBeNull();
      expect(alert.type).toBe('overcrowded');
      expect(alert.severity).toBe('high');
    });

    it('should return null alert when not overcrowded', () => {
      const cotData = {
        managedMoneyLong: 150000,
        managedMoneyShort: 100000,
        historicHigh: 320000,
      };
      const alert = generateCOTAlert(cotData);
      expect(alert).toBeNull();
    });
  });
});
