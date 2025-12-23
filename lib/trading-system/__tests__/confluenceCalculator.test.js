/**
 * Confluence Calculator Tests
 * Property-based tests for confluence score calculation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ConfluenceCalculator } from '../core/confluenceCalculator';
import { CONFLUENCE_WEIGHTS, QUALITY_THRESHOLDS } from '../index';

describe('ConfluenceCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new ConfluenceCalculator();
  });

  describe('Property 1: Confluence Score Bounds and Threshold', () => {
    /**
     * Property: The confluence score SHALL always be between 0 and 100,
     * and signals SHALL only be generated when score >= 80.
     * 
     * Validates: Requirements 14.1, 14.3
     */
    it('should always produce scores between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.record({
            smc: fc.option(fc.record({
              orderBlocks: fc.array(fc.record({ strength: fc.integer({ min: 0, max: 100 }) })),
              fvgs: fc.array(fc.record({ filled: fc.boolean() })),
              liquidityZones: fc.array(fc.constant({})),
              premiumDiscount: fc.option(fc.record({
                zone: fc.constantFrom('premium', 'discount', 'equilibrium'),
                bias: fc.constantFrom('bullish', 'bearish', 'neutral'),
              })),
            }), { nil: undefined }),
            technical: fc.option(fc.record({
              trend: fc.option(fc.record({
                direction: fc.constantFrom('bullish', 'bearish', 'neutral'),
                strength: fc.integer({ min: 0, max: 100 }),
                htfAlignment: fc.boolean(),
              })),
              momentum: fc.option(fc.record({ aligned: fc.boolean() })),
              divergences: fc.array(fc.constant({})),
              patterns: fc.array(fc.constant({})),
            }), { nil: undefined }),
            ai: fc.option(fc.record({
              confidence: fc.integer({ min: 0, max: 100 }),
            }), { nil: undefined }),
          }),
          (analysisData) => {
            const analysis = { analysis: analysisData };
            const result = calculator.calculate(analysis);
            
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should only meet minimum when score >= 80', () => {
      // Test with high scores
      const highScoreAnalysis = createMockAnalysis({
        smc: { orderBlocks: [{ strength: 90 }], fvgs: [{ filled: false }], liquidityZones: [{}], premiumDiscount: { zone: 'discount', bias: 'bullish' } },
        technical: { trend: { direction: 'bullish', strength: 80, htfAlignment: true }, momentum: { aligned: true }, patterns: [{}] },
        ai: { confidence: 90 },
      });
      
      const highResult = calculator.calculate(highScoreAnalysis);
      
      if (highResult.score >= 80) {
        expect(highResult.meetsMinimum).toBe(true);
      }
      
      // Test with low scores
      const lowScoreAnalysis = createMockAnalysis({
        smc: null,
        technical: null,
        ai: { confidence: 20 },
      });
      
      const lowResult = calculator.calculate(lowScoreAnalysis);
      
      if (lowResult.score < 80) {
        expect(lowResult.meetsMinimum).toBe(false);
      }
    });

    it('should use minimum threshold of 80', () => {
      expect(QUALITY_THRESHOLDS.minimum).toBe(80);
    });
  });

  describe('Property 2: Confluence Score Weight Sum', () => {
    /**
     * Property: The sum of all confluence weights SHALL equal 1.0 (100%).
     * 
     * Validates: Requirements 14.2
     */
    it('should have weights that sum to 1.0', () => {
      const weights = calculator.getWeights();
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      
      expect(Math.abs(totalWeight - 1)).toBeLessThan(0.001);
    });

    it('should throw error if weights do not sum to 1', () => {
      const invalidWeights = {
        smc: 0.30,
        structure: 0.20,
        wyckoff: 0.10,
        vsa: 0.10,
        orderFlow: 0.10,
        technical: 0.10,
        intermarket: 0.05,
        fundamental: 0.05,
        sentiment: 0.05,
        ai: 0.10, // Total = 1.15, not 1.0
      };
      
      expect(() => new ConfluenceCalculator(invalidWeights)).toThrow();
    });

    it('should accept valid custom weights', () => {
      const validWeights = {
        smc: 0.20,
        structure: 0.15,
        wyckoff: 0.10,
        vsa: 0.10,
        orderFlow: 0.10,
        technical: 0.10,
        intermarket: 0.05,
        fundamental: 0.05,
        sentiment: 0.05,
        ai: 0.10,
      };
      
      expect(() => new ConfluenceCalculator(validWeights)).not.toThrow();
    });
  });

  describe('Property 9: SMC Confluence Score Boost', () => {
    /**
     * Property: When SMC analysis shows strong confluence (Order Block + FVG + Liquidity),
     * the overall score SHALL receive a boost.
     * 
     * Validates: Requirements 2.5
     */
    it('should give higher SMC score when all SMC components present', () => {
      // Full SMC confluence
      const fullSMC = {
        orderBlocks: [{ strength: 80 }],
        fvgs: [{ filled: false }],
        liquidityZones: [{}],
        premiumDiscount: { zone: 'discount', bias: 'bullish' },
      };
      
      // Partial SMC
      const partialSMC = {
        orderBlocks: [{ strength: 50 }],
        fvgs: [],
        liquidityZones: [],
        premiumDiscount: null,
      };
      
      const fullScore = calculator.calculateSMCScore(fullSMC);
      const partialScore = calculator.calculateSMCScore(partialSMC);
      
      expect(fullScore).toBeGreaterThan(partialScore);
    });

    it('should give maximum SMC score of 100', () => {
      const maxSMC = {
        orderBlocks: [{ strength: 100 }],
        fvgs: [{ filled: false }],
        liquidityZones: [{}],
        premiumDiscount: { zone: 'discount', bias: 'bullish' },
      };
      
      const score = calculator.calculateSMCScore(maxSMC);
      
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for null SMC analysis', () => {
      const score = calculator.calculateSMCScore(null);
      expect(score).toBe(0);
    });
  });

  describe('Quality Labels', () => {
    it('should assign correct quality labels based on score', () => {
      expect(calculator.getQualityLabel(95)).toBe('institutional');
      expect(calculator.getQualityLabel(90)).toBe('excellent');
      expect(calculator.getQualityLabel(85)).toBe('strong');
      expect(calculator.getQualityLabel(80)).toBe('good');
      expect(calculator.getQualityLabel(70)).toBe('fair');
    });

    it('should have quality thresholds in correct order', () => {
      expect(QUALITY_THRESHOLDS.institutional).toBeGreaterThan(QUALITY_THRESHOLDS.excellent);
      expect(QUALITY_THRESHOLDS.excellent).toBeGreaterThan(QUALITY_THRESHOLDS.strong);
      expect(QUALITY_THRESHOLDS.strong).toBeGreaterThan(QUALITY_THRESHOLDS.good);
    });
  });

  describe('Component Score Calculations', () => {
    it('should calculate technical score correctly', () => {
      const technical = {
        trend: { direction: 'bullish', strength: 80, htfAlignment: true },
        momentum: { aligned: true },
        divergences: [{}],
        patterns: [{}],
      };
      
      const score = calculator.calculateTechnicalScore(technical);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate AI score from confidence', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (confidence) => {
            const ai = { confidence };
            const score = calculator.calculateAIScore(ai);
            
            expect(score).toBe(confidence);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for fundamental score during news blackout', () => {
      const fundamental = { newsBlackout: true };
      const score = calculator.calculateFundamentalScore(fundamental);
      
      expect(score).toBe(0);
    });
  });

  describe('Full Calculation', () => {
    it('should return complete result structure', () => {
      const analysis = createMockAnalysis({
        smc: { orderBlocks: [{ strength: 70 }], fvgs: [], liquidityZones: [], premiumDiscount: null },
        technical: { trend: { direction: 'bullish', strength: 60 }, momentum: { aligned: true } },
        ai: { confidence: 75 },
      });
      
      const result = calculator.calculate(analysis);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('quality');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('meetsMinimum');
      
      expect(result.breakdown).toHaveLength(10);
      expect(result.breakdown.every(b => 
        b.hasOwnProperty('component') && 
        b.hasOwnProperty('score') && 
        b.hasOwnProperty('weight') && 
        b.hasOwnProperty('contribution')
      )).toBe(true);
    });
  });
});

/**
 * Helper function to create mock analysis
 */
function createMockAnalysis(overrides = {}) {
  return {
    analysis: {
      smc: overrides.smc || null,
      technical: overrides.technical || null,
      wyckoff: overrides.wyckoff || null,
      vsa: overrides.vsa || null,
      orderFlow: overrides.orderFlow || null,
      intermarket: overrides.intermarket || null,
      fundamental: overrides.fundamental || null,
      sentiment: overrides.sentiment || null,
      ai: overrides.ai || null,
    },
  };
}
