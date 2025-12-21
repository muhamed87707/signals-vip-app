/**
 * Property Tests for Bank Forecast Display Completeness
 * Feature: gold-forex-intelligence-dashboard, Property 4: Bank Forecast Display Completeness
 * Validates: Requirements 2.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatForecast, validateForecast } from './consensus';

/**
 * Render forecast to string (simulates UI rendering)
 */
function renderForecastToString(forecast) {
  const formatted = formatForecast(forecast);
  return `${formatted.bankName} ${formatted.formattedPrice} ${formatted.timeframe} ${formatted.analystLogic}`;
}

describe('Bank Forecast Display Completeness', () => {
  describe('Property 4: Bank Forecast Display Completeness', () => {
    /**
     * Property: For any bank forecast object rendered in the UI, the output must
     * contain the bank name, forecast price, timeframe, and analyst logic fields
     */
    it('should include all required fields in rendered output', () => {
      fc.assert(
        fc.property(
          fc.record({
            bankName: fc.constantFrom('JP Morgan', 'Goldman Sachs', 'Citi', 'Morgan Stanley', 'UBS', 'Commerzbank'),
            forecastPrice: fc.integer({ min: 1000, max: 5000 }),
            timeframe: fc.constantFrom('Q1', 'Q2', 'Q3', 'Q4', 'Year-End'),
            analystLogic: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          (forecast) => {
            const rendered = renderForecastToString(forecast);
            
            // Bank name must be present
            expect(rendered).toContain(forecast.bankName);
            
            // Price must be present (formatted)
            expect(rendered).toContain('$');
            expect(rendered).toContain(forecast.forecastPrice.toLocaleString());
            
            // Timeframe must be present
            expect(rendered).toContain(forecast.timeframe);
            
            // Analyst logic must be present
            expect(rendered).toContain(forecast.analystLogic);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Formatted forecast should preserve all original data
     */
    it('should preserve all data when formatting', () => {
      fc.assert(
        fc.property(
          fc.record({
            bankName: fc.string({ minLength: 1, maxLength: 50 }),
            forecastPrice: fc.integer({ min: 1000, max: 5000 }),
            timeframe: fc.string({ minLength: 1, maxLength: 20 }),
            analystLogic: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          (forecast) => {
            const formatted = formatForecast(forecast);
            
            expect(formatted.bankName).toBe(forecast.bankName);
            expect(formatted.forecastPrice).toBe(forecast.forecastPrice);
            expect(formatted.timeframe).toBe(forecast.timeframe);
            expect(formatted.analystLogic).toBe(forecast.analystLogic);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Valid forecasts should always pass validation
     */
    it('should validate complete forecast objects', () => {
      fc.assert(
        fc.property(
          fc.record({
            bankName: fc.constantFrom('JP Morgan', 'Goldman Sachs', 'Citi'),
            forecastPrice: fc.integer({ min: 1000, max: 5000 }),
            timeframe: fc.constantFrom('Q1', 'Q2', 'Year-End'),
            analystLogic: fc.string({ minLength: 10, maxLength: 200 }),
          }),
          (forecast) => {
            expect(validateForecast(forecast)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Formatted price should always start with $
     */
    it('should format price with dollar sign', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }),
          (price) => {
            const forecast = { forecastPrice: price };
            const formatted = formatForecast(forecast);
            
            expect(formatted.formattedPrice).toMatch(/^\$/);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should format forecast correctly', () => {
      const forecast = {
        bankName: 'JP Morgan',
        forecastPrice: 2800,
        timeframe: 'Year-End',
        analystLogic: 'Strong demand expected',
      };
      
      const formatted = formatForecast(forecast);
      
      expect(formatted.bankName).toBe('JP Morgan');
      expect(formatted.forecastPrice).toBe(2800);
      expect(formatted.formattedPrice).toBe('$2,800');
      expect(formatted.timeframe).toBe('Year-End');
      expect(formatted.analystLogic).toBe('Strong demand expected');
    });

    it('should render all fields in output string', () => {
      const forecast = {
        bankName: 'Goldman Sachs',
        forecastPrice: 2900,
        timeframe: 'Q4',
        analystLogic: 'Bullish outlook',
      };
      
      const rendered = renderForecastToString(forecast);
      
      expect(rendered).toContain('Goldman Sachs');
      expect(rendered).toContain('$2,900');
      expect(rendered).toContain('Q4');
      expect(rendered).toContain('Bullish outlook');
    });
  });
});
