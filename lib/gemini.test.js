/**
 * Property Tests for AI Output Structure
 * Feature: gold-forex-intelligence-dashboard, Property 1: AI Output Structure Validation
 * Validates: Requirements 1.4, 1.6, 1.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Validation function extracted from gemini.js for testing
 * This validates AI analysis output structure
 */
function validateAnalysis(analysis) {
  const validBias = ['Bullish', 'Bearish', 'Neutral'];
  
  if (!validBias.includes(analysis.bias)) {
    analysis.bias = 'Neutral';
  }
  
  if (!analysis.summary || typeof analysis.summary !== 'string') {
    analysis.summary = 'Analysis unavailable';
  }
  
  if (!Array.isArray(analysis.risk_factors)) {
    analysis.risk_factors = [];
  }
  while (analysis.risk_factors.length < 3) {
    analysis.risk_factors.push('Risk factor unavailable');
  }
  analysis.risk_factors = analysis.risk_factors.slice(0, 3);
  
  if (!analysis.key_levels) {
    analysis.key_levels = { support: [], resistance: [] };
  }
  if (!Array.isArray(analysis.key_levels.support)) {
    analysis.key_levels.support = [];
  }
  if (!Array.isArray(analysis.key_levels.resistance)) {
    analysis.key_levels.resistance = [];
  }
  
  if (typeof analysis.confidence !== 'number') {
    analysis.confidence = 0.5;
  }
  analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));
  
  analysis.timestamp = new Date();
  
  return analysis;
}

describe('AI Output Structure Validation', () => {
  describe('Property 1: AI Output Structure Validation', () => {
    /**
     * Property: For any AI analysis output, the response must be valid JSON containing
     * all required fields with correct types and values
     */
    it('should always produce valid output structure with required fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            bias: fc.oneof(
              fc.constant('Bullish'),
              fc.constant('Bearish'),
              fc.constant('Neutral'),
              fc.string() // Invalid bias to test normalization
            ),
            summary: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
            risk_factors: fc.oneof(
              fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
              fc.constant(null),
              fc.constant(undefined)
            ),
            key_levels: fc.oneof(
              fc.record({
                support: fc.array(fc.float({ min: 1000, max: 3000 })),
                resistance: fc.array(fc.float({ min: 1000, max: 3000 })),
              }),
              fc.constant(null),
              fc.constant(undefined)
            ),
            confidence: fc.oneof(
              fc.float({ min: -1, max: 2 }),
              fc.constant(null),
              fc.constant(undefined)
            ),
          }),
          (rawAnalysis) => {
            const validated = validateAnalysis({ ...rawAnalysis });
            
            // Bias must be one of valid values
            expect(['Bullish', 'Bearish', 'Neutral']).toContain(validated.bias);
            
            // Summary must be non-empty string
            expect(typeof validated.summary).toBe('string');
            expect(validated.summary.length).toBeGreaterThan(0);
            
            // Risk factors must be array of exactly 3 strings
            expect(Array.isArray(validated.risk_factors)).toBe(true);
            expect(validated.risk_factors.length).toBe(3);
            validated.risk_factors.forEach(rf => {
              expect(typeof rf).toBe('string');
            });
            
            // Key levels must have support and resistance arrays
            expect(validated.key_levels).toBeDefined();
            expect(Array.isArray(validated.key_levels.support)).toBe(true);
            expect(Array.isArray(validated.key_levels.resistance)).toBe(true);
            
            // Confidence must be between 0 and 1
            expect(validated.confidence).toBeGreaterThanOrEqual(0);
            expect(validated.confidence).toBeLessThanOrEqual(1);
            
            // Timestamp must be present
            expect(validated.timestamp).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Bias normalization - invalid bias values should become 'Neutral'
     */
    it('should normalize invalid bias values to Neutral', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['Bullish', 'Bearish', 'Neutral'].includes(s)),
          (invalidBias) => {
            const validated = validateAnalysis({ bias: invalidBias });
            expect(validated.bias).toBe('Neutral');
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Risk factors always has exactly 3 items
     */
    it('should always have exactly 3 risk factors', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
          (riskFactors) => {
            const validated = validateAnalysis({ risk_factors: riskFactors });
            expect(validated.risk_factors.length).toBe(3);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Confidence is clamped to [0, 1] range
     */
    it('should clamp confidence to valid range', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -100, max: 100 }),
          (confidence) => {
            const validated = validateAnalysis({ confidence });
            expect(validated.confidence).toBeGreaterThanOrEqual(0);
            expect(validated.confidence).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should preserve valid bias values', () => {
      expect(validateAnalysis({ bias: 'Bullish' }).bias).toBe('Bullish');
      expect(validateAnalysis({ bias: 'Bearish' }).bias).toBe('Bearish');
      expect(validateAnalysis({ bias: 'Neutral' }).bias).toBe('Neutral');
    });

    it('should preserve valid summary', () => {
      const summary = 'Gold is showing bullish momentum';
      expect(validateAnalysis({ summary }).summary).toBe(summary);
    });

    it('should preserve first 3 risk factors when more provided', () => {
      const risk_factors = ['Risk 1', 'Risk 2', 'Risk 3', 'Risk 4', 'Risk 5'];
      const validated = validateAnalysis({ risk_factors });
      expect(validated.risk_factors).toEqual(['Risk 1', 'Risk 2', 'Risk 3']);
    });

    it('should preserve key levels arrays', () => {
      const key_levels = {
        support: [2300, 2280],
        resistance: [2350, 2380],
      };
      const validated = validateAnalysis({ key_levels });
      expect(validated.key_levels.support).toEqual([2300, 2280]);
      expect(validated.key_levels.resistance).toEqual([2350, 2380]);
    });
  });
});
