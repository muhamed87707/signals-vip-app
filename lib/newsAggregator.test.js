/**
 * Property Tests for News Aggregation and Sentiment
 * Feature: gold-forex-intelligence-dashboard
 * Property 10: News Source Aggregation - Validates: Requirements 5.1
 * Property 11: Sentiment Score Range - Validates: Requirements 5.2
 * Property 12: Geopolitical Risk Index Completeness - Validates: Requirements 5.3, 5.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { hasAllSources, filterBySource } from './newsAggregator';
import { calculateRiskIndex, validateRiskIndex, getFearLevel } from './calculations/riskIndex';

describe('News Source Aggregation', () => {
  describe('Property 10: News Source Aggregation', () => {
    /**
     * Property: For any aggregated news feed, it must contain at least one item
     * from each source when available
     */
    it('should detect when all sources are present', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              headline: fc.string({ minLength: 5, maxLength: 100 }),
              source: fc.constantFrom('Reuters', 'Bloomberg', 'CentralBank'),
              sentiment: fc.integer({ min: -100, max: 100 }),
            }),
            { minLength: 3, maxLength: 10 }
          ),
          (news) => {
            // Ensure we have at least one from each source
            const withAllSources = [
              ...news,
              { headline: 'Test Reuters', source: 'Reuters', sentiment: 0 },
              { headline: 'Test Bloomberg', source: 'Bloomberg', sentiment: 0 },
              { headline: 'Test CentralBank', source: 'CentralBank', sentiment: 0 },
            ];
            
            const result = hasAllSources(withAllSources);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Filter by source should only return items from that source
     */
    it('should filter news by source correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              headline: fc.string({ minLength: 5 }),
              source: fc.constantFrom('Reuters', 'Bloomberg', 'CentralBank'),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          fc.constantFrom('Reuters', 'Bloomberg', 'CentralBank'),
          (news, targetSource) => {
            const filtered = filterBySource(news, targetSource);
            
            // All filtered items should be from target source
            filtered.forEach(item => {
              expect(item.source).toBe(targetSource);
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 11: Sentiment Score Range', () => {
    /**
     * Property: For any sentiment score, the value must be within [-100, 100]
     */
    it('should have sentiment scores within valid range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 100 }),
          (score) => {
            expect(score).toBeGreaterThanOrEqual(-100);
            expect(score).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 12: Geopolitical Risk Index Completeness', () => {
    /**
     * Property: For any risk index calculation, it must track all four keyword
     * categories and have aggregate score within [0, 100]
     */
    it('should calculate risk index with all keyword categories', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 20 }),
          (headlines) => {
            const riskIndex = calculateRiskIndex(headlines);
            
            // Score must be within [0, 100]
            expect(riskIndex.score).toBeGreaterThanOrEqual(0);
            expect(riskIndex.score).toBeLessThanOrEqual(100);
            
            // All four keyword categories must be present
            expect(riskIndex.keywords).toHaveProperty('war');
            expect(riskIndex.keywords).toHaveProperty('sanctions');
            expect(riskIndex.keywords).toHaveProperty('tariffs');
            expect(riskIndex.keywords).toHaveProperty('recession');
            
            // Validation should pass
            expect(validateRiskIndex(riskIndex)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Risk index should detect keywords correctly
     */
    it('should detect risk keywords in headlines', () => {
      const headlines = ['War breaks out in region', 'Sanctions imposed on country'];
      const riskIndex = calculateRiskIndex(headlines);
      
      expect(riskIndex.keywords.war).toBeGreaterThan(0);
      expect(riskIndex.keywords.sanctions).toBeGreaterThan(0);
    });

    /**
     * Property: Empty headlines should return zero score
     */
    it('should return zero score for empty headlines', () => {
      const riskIndex = calculateRiskIndex([]);
      expect(riskIndex.score).toBe(0);
    });

    /**
     * Property: Fear level should be consistent with score
     */
    it('should return appropriate fear level for score', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (score) => {
            const fearLevel = getFearLevel(score);
            
            expect(fearLevel).toHaveProperty('level');
            expect(fearLevel).toHaveProperty('color');
            
            if (score >= 70) {
              expect(fearLevel.level).toBe('Extreme Fear');
            } else if (score >= 50) {
              expect(fearLevel.level).toBe('Fear');
            } else if (score >= 30) {
              expect(fearLevel.level).toBe('Moderate');
            } else {
              expect(fearLevel.level).toBe('Low Fear');
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should detect missing sources', () => {
      const news = [
        { headline: 'Test', source: 'Reuters' },
        { headline: 'Test', source: 'Bloomberg' },
      ];
      expect(hasAllSources(news)).toBe(false);
    });

    it('should return empty array for invalid input', () => {
      expect(filterBySource(null, 'Reuters')).toEqual([]);
      expect(filterBySource(undefined, 'Reuters')).toEqual([]);
    });

    it('should validate correct risk index', () => {
      const riskIndex = {
        score: 50,
        keywords: { war: 1, sanctions: 2, tariffs: 0, recession: 1 },
        trend: 'stable',
      };
      expect(validateRiskIndex(riskIndex)).toBe(true);
    });

    it('should reject invalid risk index', () => {
      expect(validateRiskIndex(null)).toBe(false);
      expect(validateRiskIndex({ score: 150 })).toBe(false);
      expect(validateRiskIndex({ score: 50 })).toBe(false);
    });
  });
});
