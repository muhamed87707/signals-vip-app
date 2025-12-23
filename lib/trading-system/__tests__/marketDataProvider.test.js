/**
 * Market Data Provider Tests
 * Property-based tests for data source failover and data validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { MarketDataProvider } from '../data/marketDataProvider';

describe('MarketDataProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new MarketDataProvider({
      alphaVantageKey: 'test-key',
      twelveDataKey: 'test-key',
      cacheTimeout: 1000,
      retryAttempts: 2,
      retryDelay: 100,
    });
  });

  describe('Property 15: Data Source Failover', () => {
    /**
     * Property: For any data fetch where the primary source fails,
     * the system SHALL automatically attempt backup sources within 5 seconds
     * and return valid data if any source succeeds.
     * 
     * Validates: Requirements 1.4
     */
    it('should failover to backup sources when primary fails', async () => {
      // Mock primary source to fail
      const mockPrimaryFail = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const mockBackupSuccess = vi.fn().mockResolvedValue([
        { timestamp: Date.now(), open: 1.1, high: 1.2, low: 1.0, close: 1.15, volume: 100 }
      ]);

      provider.sources = {
        alphavantage: mockPrimaryFail,
        twelvedata: mockBackupSuccess,
        yahoo: mockBackupSuccess,
      };

      const startTime = Date.now();
      const result = await provider.getOHLCV('EURUSD', 'H1', 1);
      const elapsed = Date.now() - startTime;

      // Should return valid data from backup
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // Should complete within 5 seconds
      expect(elapsed).toBeLessThan(5000);
      
      // Primary should have been called
      expect(mockPrimaryFail).toHaveBeenCalled();
      
      // Backup should have been called after primary failed
      expect(mockBackupSuccess).toHaveBeenCalled();
    });

    it('should try all backup sources before failing', async () => {
      const mockFail = vi.fn().mockRejectedValue(new Error('Source failed'));
      
      provider.sources = {
        alphavantage: mockFail,
        twelvedata: mockFail,
        yahoo: mockFail,
      };

      await expect(provider.getOHLCV('EURUSD', 'H1', 1))
        .rejects.toThrow('All data sources failed');

      // All sources should have been tried
      expect(mockFail).toHaveBeenCalledTimes(6); // 2 retries × 3 sources
    });

    it('should return cached data if available', async () => {
      const mockFetch = vi.fn().mockResolvedValue([
        { timestamp: Date.now(), open: 1.1, high: 1.2, low: 1.0, close: 1.15, volume: 100 }
      ]);

      provider.sources = {
        alphavantage: mockFetch,
        twelvedata: mockFetch,
        yahoo: mockFetch,
      };

      // First call - should fetch
      await provider.getOHLCV('EURUSD', 'H1', 1);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await provider.getOHLCV('EURUSD', 'H1', 1);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, used cache
    });
  });

  describe('Data Validation Properties', () => {
    /**
     * Property: For any valid OHLCV data, high >= low and high >= open, close
     */
    it('should validate OHLCV data integrity', () => {
      fc.assert(
        fc.property(
          fc.record({
            timestamp: fc.integer({ min: 1 }),
            open: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
            high: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
            low: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
            close: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
            volume: fc.integer({ min: 0 }),
          }),
          (candle) => {
            // Adjust to make valid OHLCV
            const validCandle = {
              ...candle,
              high: Math.max(candle.open, candle.close, candle.high),
              low: Math.min(candle.open, candle.close, candle.low),
            };

            const validated = provider.validateData([validCandle]);
            
            expect(validated.length).toBe(1);
            expect(validated[0].high).toBeGreaterThanOrEqual(validated[0].low);
            expect(validated[0].high).toBeGreaterThanOrEqual(validated[0].open);
            expect(validated[0].high).toBeGreaterThanOrEqual(validated[0].close);
            expect(validated[0].low).toBeLessThanOrEqual(validated[0].open);
            expect(validated[0].low).toBeLessThanOrEqual(validated[0].close);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Validated data should always be sorted by timestamp ascending
     */
    it('should sort candles by timestamp ascending', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              timestamp: fc.integer({ min: 1000000000000, max: 2000000000000 }),
              open: fc.float({ min: Math.fround(1), max: Math.fround(2), noNaN: true }),
              high: fc.float({ min: Math.fround(1), max: Math.fround(2), noNaN: true }),
              low: fc.float({ min: Math.fround(1), max: Math.fround(2), noNaN: true }),
              close: fc.float({ min: Math.fround(1), max: Math.fround(2), noNaN: true }),
              volume: fc.integer({ min: 0 }),
            }),
            { minLength: 2, maxLength: 100 }
          ),
          (candles) => {
            // Make candles valid
            const validCandles = candles.map(c => ({
              ...c,
              high: Math.max(c.open, c.close, c.high),
              low: Math.min(c.open, c.close, c.low),
            }));

            const validated = provider.validateData(validCandles);
            
            // Check sorted ascending
            for (let i = 1; i < validated.length; i++) {
              expect(validated[i].timestamp).toBeGreaterThanOrEqual(validated[i - 1].timestamp);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Empty or invalid data should throw error
     */
    it('should throw error for empty data', () => {
      expect(() => provider.validateData([])).toThrow('Invalid data');
      expect(() => provider.validateData(null)).toThrow();
      expect(() => provider.validateData(undefined)).toThrow();
    });
  });

  describe('Timeframe Mapping Properties', () => {
    /**
     * Property: All supported timeframes should have valid mappings
     */
    it('should map all timeframes correctly', () => {
      const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];
      
      timeframes.forEach(tf => {
        const avMapping = provider.mapTimeframeToAlphaVantage(tf);
        const tdMapping = provider.mapTimeframeToTwelveData(tf);
        const yahooMapping = provider.mapTimeframeToYahoo(tf);
        
        expect(avMapping).toBeDefined();
        expect(tdMapping).toBeDefined();
        expect(yahooMapping).toBeDefined();
        expect(typeof avMapping).toBe('string');
        expect(typeof tdMapping).toBe('string');
        expect(typeof yahooMapping).toBe('string');
      });
    });
  });

  describe('Symbol Mapping Properties', () => {
    /**
     * Property: All supported symbols should have valid Yahoo mappings
     */
    it('should map forex symbols to Yahoo format', () => {
      const forexPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
      
      forexPairs.forEach(symbol => {
        const yahooSymbol = provider.mapSymbolToYahoo(symbol);
        expect(yahooSymbol).toContain('=X');
      });
    });

    it('should map metals to Yahoo futures format', () => {
      expect(provider.mapSymbolToYahoo('XAUUSD')).toBe('GC=F');
      expect(provider.mapSymbolToYahoo('XAGUSD')).toBe('SI=F');
    });

    it('should map indices to Yahoo format', () => {
      expect(provider.mapSymbolToYahoo('US30')).toBe('YM=F');
      expect(provider.mapSymbolToYahoo('US500')).toBe('ES=F');
      expect(provider.mapSymbolToYahoo('US100')).toBe('NQ=F');
    });
  });
});
