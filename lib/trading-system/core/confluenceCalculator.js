/**
 * Confluence Calculator - حاسبة درجة التقاء المؤشرات
 * Calculates the overall confluence score from all analysis components
 */

import { CONFLUENCE_WEIGHTS, QUALITY_THRESHOLDS } from '../index';

export class ConfluenceCalculator {
  constructor(weights = CONFLUENCE_WEIGHTS) {
    this.weights = weights;
    
    // Validate weights sum to 1
    const totalWeight = Object.values(this.weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(totalWeight - 1) > 0.001) {
      throw new Error(`Confluence weights must sum to 1, got ${totalWeight}`);
    }
  }

  /**
   * Calculate overall confluence score
   * @param {Object} analysis - Full analysis result
   * @returns {Object} Confluence result with score and breakdown
   */
  calculate(analysis) {
    const componentScores = this.getComponentScores(analysis);
    
    // Calculate weighted score
    let weightedScore = 0;
    const breakdown = [];

    for (const [component, weight] of Object.entries(this.weights)) {
      const score = componentScores[component] || 0;
      const contribution = score * weight;
      weightedScore += contribution;
      
      breakdown.push({
        component,
        score,
        weight: weight * 100,
        contribution: contribution,
      });
    }

    // Round to integer
    const finalScore = Math.round(Math.min(100, Math.max(0, weightedScore)));

    return {
      score: finalScore,
      quality: this.getQualityLabel(finalScore),
      components: componentScores,
      breakdown,
      meetsMinimum: finalScore >= QUALITY_THRESHOLDS.minimum,
    };
  }

  /**
   * Get individual component scores
   */
  getComponentScores(analysis) {
    const { 
      smc, technical, wyckoff, vsa, orderFlow, 
      intermarket, fundamental, sentiment, ai 
    } = analysis.analysis;

    return {
      smc: this.calculateSMCScore(smc),
      structure: this.calculateStructureScore(smc, technical),
      wyckoff: this.calculateWyckoffScore(wyckoff),
      vsa: this.calculateVSAScore(vsa),
      orderFlow: this.calculateOrderFlowScore(orderFlow),
      technical: this.calculateTechnicalScore(technical),
      intermarket: this.calculateIntermarketScore(intermarket),
      fundamental: this.calculateFundamentalScore(fundamental),
      sentiment: this.calculateSentimentScore(sentiment),
      ai: this.calculateAIScore(ai),
    };
  }

  /**
   * Calculate SMC component score
   */
  calculateSMCScore(smc) {
    if (!smc) return 0;
    
    let score = 0;
    
    // Order Blocks (max 30 points)
    if (smc.orderBlocks && smc.orderBlocks.length > 0) {
      const strongOB = smc.orderBlocks.find(ob => ob.strength > 70);
      score += strongOB ? 30 : 20;
    }
    
    // Fair Value Gaps (max 25 points)
    if (smc.fvgs && smc.fvgs.length > 0) {
      const unfilledFVG = smc.fvgs.find(fvg => !fvg.filled);
      score += unfilledFVG ? 25 : 15;
    }
    
    // Liquidity Zones (max 20 points)
    if (smc.liquidityZones && smc.liquidityZones.length > 0) {
      score += 20;
    }
    
    // Premium/Discount alignment (max 25 points)
    if (smc.premiumDiscount) {
      const { zone, bias } = smc.premiumDiscount;
      // Buying in discount or selling in premium
      if ((zone === 'discount' && bias === 'bullish') || 
          (zone === 'premium' && bias === 'bearish')) {
        score += 25;
      } else {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Market Structure score
   */
  calculateStructureScore(smc, technical) {
    if (!smc) return 0;
    
    let score = 0;
    
    // Trend alignment across timeframes (max 40 points)
    if (technical && technical.trend) {
      if (technical.trend.htfAlignment) {
        score += 40;
      } else if (technical.trend.direction !== 'neutral') {
        score += 20;
      }
    }
    
    // Structure breaks (max 30 points)
    if (smc.structureBreaks && smc.structureBreaks.length > 0) {
      const recentBOS = smc.structureBreaks.find(sb => sb.type === 'BOS');
      const recentCHoCH = smc.structureBreaks.find(sb => sb.type === 'CHoCH');
      
      if (recentBOS) score += 30;
      else if (recentCHoCH) score += 20;
    }
    
    // Swing point clarity (max 30 points)
    if (smc.swingPoints && smc.swingPoints.length >= 4) {
      score += 30;
    } else if (smc.swingPoints && smc.swingPoints.length >= 2) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Wyckoff score
   */
  calculateWyckoffScore(wyckoff) {
    if (!wyckoff) return 0;
    
    let score = 0;
    
    // Phase identification (max 40 points)
    if (wyckoff.phase && wyckoff.phase.type !== 'unknown') {
      score += Math.round(wyckoff.phase.probability * 0.4);
    }
    
    // Spring/Upthrust patterns (max 30 points)
    if (wyckoff.spring || wyckoff.upthrust) {
      score += 30;
    }
    
    // SOS/SOW signals (max 30 points)
    if (wyckoff.sos || wyckoff.sow) {
      score += 30;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate VSA score
   */
  calculateVSAScore(vsa) {
    if (!vsa) return 0;
    
    let score = 0;
    
    // Volume confirmation (max 40 points)
    if (vsa.volumeConfirmation) {
      score += 40;
    }
    
    // Stopping volume (max 30 points)
    if (vsa.stoppingVolume) {
      score += 30;
    }
    
    // No demand/supply (max 30 points)
    if (vsa.noDemand || vsa.noSupply) {
      score += 30;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Order Flow score
   */
  calculateOrderFlowScore(orderFlow) {
    if (!orderFlow) return 0;
    
    let score = 0;
    
    // Delta confirmation (max 40 points)
    if (orderFlow.deltaConfirmation) {
      score += 40;
    }
    
    // Absorption detected (max 30 points)
    if (orderFlow.absorption) {
      score += 30;
    }
    
    // Exhaustion signals (max 30 points)
    if (orderFlow.exhaustion) {
      score += 30;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Technical score
   */
  calculateTechnicalScore(technical) {
    if (!technical) return 0;
    
    let score = 0;
    
    // Trend strength (max 30 points)
    if (technical.trend && technical.trend.strength) {
      score += Math.round(technical.trend.strength * 0.3);
    }
    
    // Momentum alignment (max 25 points)
    if (technical.momentum && technical.momentum.aligned) {
      score += 25;
    }
    
    // Divergences (max 25 points)
    if (technical.divergences && technical.divergences.length > 0) {
      score += 25;
    }
    
    // Pattern detection (max 20 points)
    if (technical.patterns && technical.patterns.length > 0) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Intermarket score
   */
  calculateIntermarketScore(intermarket) {
    if (!intermarket) return 0;
    
    let score = 0;
    
    // Correlation alignment (max 50 points)
    if (intermarket.correlationAligned) {
      score += 50;
    }
    
    // DXY confirmation (max 30 points)
    if (intermarket.dxyConfirmation) {
      score += 30;
    }
    
    // Risk sentiment alignment (max 20 points)
    if (intermarket.riskSentimentAligned) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Fundamental score
   */
  calculateFundamentalScore(fundamental) {
    if (!fundamental) return 0;
    
    let score = 50; // Base score
    
    // News blackout penalty
    if (fundamental.newsBlackout) {
      return 0;
    }
    
    // Fundamental bias alignment (max 30 points)
    if (fundamental.bias !== 'neutral') {
      score += 30;
    }
    
    // COT alignment (max 20 points)
    if (fundamental.cotAligned) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Sentiment score
   */
  calculateSentimentScore(sentiment) {
    if (!sentiment) return 0;
    
    let score = 50; // Base score
    
    // Sentiment extremes (contrarian opportunity)
    if (Math.abs(sentiment.score) > 80) {
      score += 30; // Contrarian opportunity
    } else if (Math.abs(sentiment.score) > 50) {
      score += 20;
    }
    
    // Fear & Greed alignment
    if (sentiment.fearGreedAligned) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate AI score
   */
  calculateAIScore(ai) {
    if (!ai) return 0;
    
    // AI confidence is the score
    return Math.round(ai.confidence || 0);
  }

  /**
   * Get quality label based on score
   */
  getQualityLabel(score) {
    if (score >= QUALITY_THRESHOLDS.institutional) return 'institutional';
    if (score >= QUALITY_THRESHOLDS.excellent) return 'excellent';
    if (score >= QUALITY_THRESHOLDS.strong) return 'strong';
    if (score >= QUALITY_THRESHOLDS.good) return 'good';
    return 'fair';
  }

  /**
   * Get weights (for testing)
   */
  getWeights() {
    return { ...this.weights };
  }
}

export default ConfluenceCalculator;
