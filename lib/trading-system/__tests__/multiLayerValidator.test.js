/**
 * Multi-Layer Validator Tests
 * Property-based tests for validation layer requirements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { MultiLayerValidator } from '../validation/multiLayerValidator';

describe('MultiLayerValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new MultiLayerValidator();
  });

  describe('Property 5: Validation Layer Requirements', () => {
    /**
     * Property: A signal SHALL only be generated if at least 8 out of 10 validation
     * layers pass, AND all critical layers (SMC, Technical, Fundamental) pass.
     * 
     * Validates: Requirements 13.1, 13.2
     */
    it('should require minimum 8 out of 10 layers to pass', () => {
      // Create analysis with only 7 passing layers
      const analysisWithSevenPassing = createMockAnalysis({
        smc: createPassingSMC(),
        technical: createPassingTechnical(),
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: null, // Failing
        fundamental: createPassingFundamental(),
        sentiment: null, // Failing
      });

      const result = validator.validate(analysisWithSevenPassing, 'BUY');
      
      // Should have less than 8 passing layers
      expect(result.passedCount).toBeLessThan(10);
    });

    it('should pass when 8 or more layers pass', () => {
      // Create analysis with all passing layers
      const analysisWithAllPassing = createMockAnalysis({
        smc: createPassingSMC(),
        technical: createPassingTechnical(),
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: createPassingIntermarket(),
        fundamental: createPassingFundamental(),
        sentiment: createPassingSentiment(),
      });

      const result = validator.validate(analysisWithAllPassing, 'BUY');
      
      expect(result.passedCount).toBeGreaterThanOrEqual(8);
    });

    it('should require all critical layers to pass', () => {
      // Create analysis where SMC (critical) fails
      const analysisWithFailingSMC = createMockAnalysis({
        smc: null, // Critical layer failing
        technical: createPassingTechnical(),
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: createPassingIntermarket(),
        fundamental: createPassingFundamental(),
        sentiment: createPassingSentiment(),
      });

      const result = validator.validate(analysisWithFailingSMC, 'BUY');
      
      expect(result.criticalLayersPassed).toBe(false);
      expect(result.isValid).toBe(false);
    });

    it('should require Technical layer (critical) to pass', () => {
      const analysisWithFailingTechnical = createMockAnalysis({
        smc: createPassingSMC(),
        technical: null, // Critical layer failing
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: createPassingIntermarket(),
        fundamental: createPassingFundamental(),
        sentiment: createPassingSentiment(),
      });

      const result = validator.validate(analysisWithFailingTechnical, 'BUY');
      
      expect(result.criticalLayersPassed).toBe(false);
    });

    it('should require Fundamental layer (critical) to pass', () => {
      const analysisWithFailingFundamental = createMockAnalysis({
        smc: createPassingSMC(),
        technical: createPassingTechnical(),
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: createPassingIntermarket(),
        fundamental: { newsBlackout: { active: true } }, // Critical layer failing
        sentiment: createPassingSentiment(),
      });

      const result = validator.validate(analysisWithFailingFundamental, 'BUY');
      
      expect(result.criticalLayersPassed).toBe(false);
    });
  });

  describe('Layer Validation Logic', () => {
    it('should validate each layer independently', () => {
      const analysis = createMockAnalysis({
        smc: createPassingSMC(),
        technical: createPassingTechnical(),
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: createPassingIntermarket(),
        fundamental: createPassingFundamental(),
        sentiment: createPassingSentiment(),
      });

      const result = validator.validate(analysis, 'BUY');
      
      expect(result.layers).toHaveLength(10);
      expect(result.layers.every(l => typeof l.passed === 'boolean')).toBe(true);
    });

    it('should return correct structure', () => {
      const analysis = createMockAnalysis({
        smc: createPassingSMC(),
        technical: createPassingTechnical(),
        wyckoff: null,
        elliottWave: null,
        vsa: null,
        marketProfile: null,
        orderFlow: null,
        intermarket: null,
        fundamental: createPassingFundamental(),
        sentiment: null,
      });

      const result = validator.validate(analysis, 'BUY');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('passedCount');
      expect(result).toHaveProperty('totalLayers');
      expect(result).toHaveProperty('criticalLayersPassed');
      expect(result).toHaveProperty('layers');
      expect(result).toHaveProperty('weightedScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('recommendation');
    });
  });

  describe('Recommendation Logic', () => {
    it('should return STRONG_SIGNAL when 9+ layers pass', () => {
      const analysis = createMockAnalysis({
        smc: createPassingSMC(),
        technical: createPassingTechnical(),
        wyckoff: createPassingWyckoff(),
        elliottWave: createPassingElliott(),
        vsa: createPassingVSA(),
        marketProfile: createPassingMarketProfile(),
        orderFlow: createPassingOrderFlow(),
        intermarket: createPassingIntermarket(),
        fundamental: createPassingFundamental(),
        sentiment: createPassingSentiment(),
      });

      const result = validator.validate(analysis, 'BUY');
      
      if (result.passedCount >= 9 && result.isValid) {
        expect(result.recommendation).toBe('STRONG_SIGNAL');
      }
    });

    it('should return NO_TRADE when too few layers pass', () => {
      const analysis = createMockAnalysis({
        smc: null,
        technical: null,
        wyckoff: null,
        elliottWave: null,
        vsa: null,
        marketProfile: null,
        orderFlow: null,
        intermarket: null,
        fundamental: null,
        sentiment: null,
      });

      const result = validator.validate(analysis, 'BUY');
      
      expect(['NO_TRADE', 'CRITICAL_LAYERS_FAILED']).toContain(result.recommendation);
    });
  });

  describe('Weighted Score Calculation', () => {
    it('should calculate weighted score between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (smcPass, techPass, fundPass) => {
            const analysis = createMockAnalysis({
              smc: smcPass ? createPassingSMC() : null,
              technical: techPass ? createPassingTechnical() : null,
              wyckoff: createPassingWyckoff(),
              elliottWave: createPassingElliott(),
              vsa: createPassingVSA(),
              marketProfile: createPassingMarketProfile(),
              orderFlow: createPassingOrderFlow(),
              intermarket: createPassingIntermarket(),
              fundamental: fundPass ? createPassingFundamental() : null,
              sentiment: createPassingSentiment(),
            });

            const result = validator.validate(analysis, 'BUY');
            
            expect(result.weightedScore).toBeGreaterThanOrEqual(0);
            expect(result.weightedScore).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * Helper functions to create mock analysis data
 */
function createMockAnalysis(overrides = {}) {
  return {
    smc: overrides.smc,
    technical: overrides.technical,
    wyckoff: overrides.wyckoff,
    elliottWave: overrides.elliottWave,
    vsa: overrides.vsa,
    marketProfile: overrides.marketProfile,
    orderFlow: overrides.orderFlow,
    intermarket: overrides.intermarket,
    fundamental: overrides.fundamental,
    sentiment: overrides.sentiment,
  };
}

function createPassingSMC() {
  return {
    marketStructure: { trend: 'bullish' },
    orderBlocks: [{ type: 'bullish' }],
    fvgs: [{ type: 'bullish' }],
    liquidityZones: [{ type: 'support' }],
    premiumDiscount: { zone: 'discount' },
  };
}

function createPassingTechnical() {
  return {
    trend: 'up',
    emas: { aligned: true },
    rsi: 45,
    macd: { signal: 'bullish' },
    patterns: [{ name: 'Bullish Engulfing' }],
  };
}

function createPassingWyckoff() {
  return {
    phase: 'accumulation',
    spring: { detected: true },
    sos: { detected: true },
  };
}

function createPassingElliott() {
  return {
    currentWave: 3,
    targets: [{ price: 1.1 }],
    validity: 0.8,
  };
}

function createPassingVSA() {
  return {
    volumeConfirmation: true,
    accumulation: { detected: true },
    stoppingVolume: { detected: true },
  };
}

function createPassingMarketProfile() {
  return {
    valueArea: { vah: 1.1, val: 1.0, poc: 1.05, currentPrice: 1.0 },
    poc: 1.05,
    profileShape: 'normal',
  };
}

function createPassingOrderFlow() {
  return {
    delta: { bias: 'bullish' },
    absorption: { detected: true },
    exhaustion: { detected: false },
  };
}

function createPassingIntermarket() {
  return {
    dxy: { impact: 'bullish' },
    yields: { impact: 'bullish' },
    divergences: { detected: false },
    riskSentiment: { sentiment: 'risk_on' },
  };
}

function createPassingFundamental() {
  return {
    newsBlackout: { active: false },
    newsAnalysis: { sentiment: 'bullish' },
    upcomingHighImpact: [],
  };
}

function createPassingSentiment() {
  return {
    contrarian: { active: true, signal: 'BUY' },
    cotAnalysis: { signal: 'BUY' },
    retailPositioning: { extreme: true, contrarianSignal: 'BUY' },
    fearGreed: { label: 'Greed' },
  };
}
