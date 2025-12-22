/**
 * MultiTimeframeAnalyzer - Multi-Timeframe Analysis Engine
 * Analyzes 6 timeframes simultaneously for confluence detection
 * Timeframes: M15, H1, H4, D1, W1, MN
 */

import { TechnicalAnalyzer } from './TechnicalAnalyzer.js';
import { PatternDetector } from './PatternDetector.js';
import { SmartMoneyAnalyzer } from './SmartMoneyAnalyzer.js';

export class MultiTimeframeAnalyzer {
  constructor() {
    this.technicalAnalyzer = new TechnicalAnalyzer();
    this.patternDetector = new PatternDetector();
    this.smartMoneyAnalyzer = new SmartMoneyAnalyzer();
    
    this.timeframes = ['M15', 'H1', 'H4', 'D1', 'W1', 'MN'];
    this.timeframeWeights = {
      'M15': 0.10,  // Entry timing
      'H1': 0.15,   // Short-term trend
      'H4': 0.25,   // Primary trading timeframe
      'D1': 0.25,   // Daily trend
      'W1': 0.15,   // Weekly trend
      'MN': 0.10    // Monthly trend
    };
  }

  /**
   * Main analysis function - analyzes all timeframes
   * @param {Object} priceDataByTimeframe - Object with timeframe keys and price data arrays
   */
  async analyze(priceDataByTimeframe) {
    const results = {
      timestamp: new Date(),
      timeframeAnalysis: {},
      alignment: null,
      confluenceScore: 0,
      overallBias: 'NEUTRAL',
      tradingRecommendation: null
    };

    // Analyze each timeframe
    for (const tf of this.timeframes) {
      if (priceDataByTimeframe[tf] && priceDataByTimeframe[tf].length >= 50) {
        results.timeframeAnalysis[tf] = await this.analyzeTimeframe(priceDataByTimeframe[tf], tf);
      } else {
        results.timeframeAnalysis[tf] = { error: 'Insufficient data', available: false };
      }
    }

    // Calculate alignment across timeframes
    results.alignment = this.calculateAlignment(results.timeframeAnalysis);

    // Calculate overall confluence score
    results.confluenceScore = this.calculateConfluenceScore(results.timeframeAnalysis);

    // Determine overall bias
    results.overallBias = this.determineOverallBias(results.timeframeAnalysis);

    // Generate trading recommendation
    results.tradingRecommendation = this.generateRecommendation(results);

    return results;
  }

  /**
   * Analyze a single timeframe
   */
  async analyzeTimeframe(priceData, timeframe) {
    const analysis = {
      timeframe,
      available: true,
      technical: null,
      patterns: null,
      smartMoney: null,
      trend: 'NEUTRAL',
      bias: 'NEUTRAL',
      strength: 0
    };

    try {
      // Technical Analysis
      analysis.technical = await this.technicalAnalyzer.analyze(priceData, timeframe);
      
      // Pattern Detection
      analysis.patterns = await this.patternDetector.analyze(priceData);
      
      // Smart Money Analysis
      analysis.smartMoney = await this.smartMoneyAnalyzer.analyze(priceData);

      // Determine timeframe trend
      analysis.trend = this.determineTimeframeTrend(analysis);
      
      // Determine bias
      analysis.bias = this.determineTimeframeBias(analysis);
      
      // Calculate strength (0-100)
      analysis.strength = this.calculateTimeframeStrength(analysis);

    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
   * Determine trend for a single timeframe
   */
  determineTimeframeTrend(analysis) {
    let bullishSignals = 0;
    let bearishSignals = 0;

    // Technical trend
    if (analysis.technical?.trend?.includes('BULLISH')) bullishSignals += 2;
    else if (analysis.technical?.trend?.includes('BEARISH')) bearishSignals += 2;

    // Pattern bias
    if (analysis.patterns?.summary?.bias === 'BULLISH') bullishSignals += 1;
    else if (analysis.patterns?.summary?.bias === 'BEARISH') bearishSignals += 1;

    // SMC bias
    if (analysis.smartMoney?.summary?.smcBias === 'BULLISH') bullishSignals += 2;
    else if (analysis.smartMoney?.summary?.smcBias === 'BEARISH') bearishSignals += 2;

    if (bullishSignals > bearishSignals + 2) return 'STRONG_BULLISH';
    if (bullishSignals > bearishSignals) return 'BULLISH';
    if (bearishSignals > bullishSignals + 2) return 'STRONG_BEARISH';
    if (bearishSignals > bullishSignals) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Determine bias for a single timeframe
   */
  determineTimeframeBias(analysis) {
    const trend = analysis.trend;
    if (trend.includes('BULLISH')) return 'BULLISH';
    if (trend.includes('BEARISH')) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Calculate strength for a single timeframe (0-100)
   */
  calculateTimeframeStrength(analysis) {
    let strength = 50;

    // Technical score contribution
    if (analysis.technical?.score) {
      strength = (strength + analysis.technical.score) / 2;
    }

    // Pattern confidence
    if (analysis.patterns?.summary?.confidence === 'HIGH') strength += 10;
    else if (analysis.patterns?.summary?.confidence === 'MEDIUM') strength += 5;

    // SMC confidence
    if (analysis.smartMoney?.summary?.confidence === 'HIGH') strength += 10;
    else if (analysis.smartMoney?.summary?.confidence === 'MEDIUM') strength += 5;

    // Strong trend bonus
    if (analysis.trend.includes('STRONG')) strength += 10;

    return Math.min(100, Math.max(0, Math.round(strength)));
  }


  /**
   * Calculate alignment across all timeframes
   */
  calculateAlignment(timeframeAnalysis) {
    const alignment = {
      aligned: false,
      direction: 'NEUTRAL',
      alignedTimeframes: [],
      conflictingTimeframes: [],
      alignmentScore: 0,
      details: {}
    };

    let bullishCount = 0;
    let bearishCount = 0;
    let totalWeight = 0;
    let weightedBullish = 0;
    let weightedBearish = 0;

    for (const [tf, analysis] of Object.entries(timeframeAnalysis)) {
      if (!analysis.available) continue;

      const weight = this.timeframeWeights[tf] || 0.1;
      totalWeight += weight;

      alignment.details[tf] = {
        bias: analysis.bias,
        trend: analysis.trend,
        strength: analysis.strength,
        weight
      };

      if (analysis.bias === 'BULLISH') {
        bullishCount++;
        weightedBullish += weight * analysis.strength;
        alignment.alignedTimeframes.push({ tf, bias: 'BULLISH' });
      } else if (analysis.bias === 'BEARISH') {
        bearishCount++;
        weightedBearish += weight * analysis.strength;
        alignment.alignedTimeframes.push({ tf, bias: 'BEARISH' });
      } else {
        alignment.conflictingTimeframes.push({ tf, bias: 'NEUTRAL' });
      }
    }

    // Calculate alignment score (0-100)
    const totalTimeframes = bullishCount + bearishCount + alignment.conflictingTimeframes.length;
    const dominantCount = Math.max(bullishCount, bearishCount);
    
    if (totalTimeframes > 0) {
      alignment.alignmentScore = Math.round((dominantCount / totalTimeframes) * 100);
    }

    // Determine if aligned (at least 4 out of 6 timeframes agree)
    if (bullishCount >= 4) {
      alignment.aligned = true;
      alignment.direction = 'BULLISH';
    } else if (bearishCount >= 4) {
      alignment.aligned = true;
      alignment.direction = 'BEARISH';
    }

    // Filter aligned timeframes to only show dominant direction
    alignment.alignedTimeframes = alignment.alignedTimeframes.filter(
      t => t.bias === alignment.direction
    );

    // Conflicting are those that don't match dominant direction
    alignment.conflictingTimeframes = Object.entries(timeframeAnalysis)
      .filter(([tf, a]) => a.available && a.bias !== alignment.direction)
      .map(([tf, a]) => ({ tf, bias: a.bias }));

    return alignment;
  }

  /**
   * Calculate overall confluence score (0-100)
   */
  calculateConfluenceScore(timeframeAnalysis) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [tf, analysis] of Object.entries(timeframeAnalysis)) {
      if (!analysis.available) continue;

      const weight = this.timeframeWeights[tf] || 0.1;
      totalWeight += weight;

      // Base score from timeframe strength
      let tfScore = analysis.strength;

      // Bonus for strong trends
      if (analysis.trend.includes('STRONG')) tfScore += 10;

      // Bonus for high confidence patterns
      if (analysis.patterns?.summary?.confidence === 'HIGH') tfScore += 5;

      // Bonus for SMC confirmation
      if (analysis.smartMoney?.summary?.confidence === 'HIGH') tfScore += 5;

      totalScore += tfScore * weight;
    }

    if (totalWeight === 0) return 0;

    return Math.min(100, Math.round(totalScore / totalWeight));
  }

  /**
   * Determine overall bias from all timeframes
   */
  determineOverallBias(timeframeAnalysis) {
    let weightedBullish = 0;
    let weightedBearish = 0;
    let totalWeight = 0;

    for (const [tf, analysis] of Object.entries(timeframeAnalysis)) {
      if (!analysis.available) continue;

      const weight = this.timeframeWeights[tf] || 0.1;
      totalWeight += weight;

      if (analysis.bias === 'BULLISH') {
        weightedBullish += weight * (analysis.strength / 100);
      } else if (analysis.bias === 'BEARISH') {
        weightedBearish += weight * (analysis.strength / 100);
      }
    }

    if (totalWeight === 0) return 'NEUTRAL';

    const bullishScore = weightedBullish / totalWeight;
    const bearishScore = weightedBearish / totalWeight;

    if (bullishScore > bearishScore + 0.2) return 'STRONG_BULLISH';
    if (bullishScore > bearishScore + 0.1) return 'BULLISH';
    if (bearishScore > bullishScore + 0.2) return 'STRONG_BEARISH';
    if (bearishScore > bullishScore + 0.1) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Generate trading recommendation based on MTF analysis
   */
  generateRecommendation(results) {
    const recommendation = {
      action: 'WAIT',
      direction: null,
      confidence: 'LOW',
      entryTimeframe: null,
      reasons: [],
      warnings: []
    };

    // Check alignment
    if (!results.alignment.aligned) {
      recommendation.warnings.push('Timeframes not aligned - wait for confluence');
      return recommendation;
    }

    // Check confluence score
    if (results.confluenceScore < 60) {
      recommendation.warnings.push(`Low confluence score (${results.confluenceScore}%) - wait for better setup`);
      return recommendation;
    }

    // Determine action based on overall bias
    if (results.overallBias.includes('BULLISH')) {
      recommendation.action = 'BUY';
      recommendation.direction = 'LONG';
    } else if (results.overallBias.includes('BEARISH')) {
      recommendation.action = 'SELL';
      recommendation.direction = 'SHORT';
    } else {
      recommendation.warnings.push('No clear directional bias');
      return recommendation;
    }

    // Determine confidence
    if (results.confluenceScore >= 80 && results.alignment.alignmentScore >= 80) {
      recommendation.confidence = 'HIGH';
    } else if (results.confluenceScore >= 70 && results.alignment.alignmentScore >= 70) {
      recommendation.confidence = 'MEDIUM';
    }

    // Determine best entry timeframe (lowest aligned timeframe)
    const entryTimeframes = ['M15', 'H1', 'H4'];
    for (const tf of entryTimeframes) {
      const analysis = results.timeframeAnalysis[tf];
      if (analysis?.available && analysis.bias === results.alignment.direction) {
        recommendation.entryTimeframe = tf;
        break;
      }
    }

    // Add reasons
    recommendation.reasons.push(`${results.alignment.alignedTimeframes.length} timeframes aligned ${results.alignment.direction}`);
    recommendation.reasons.push(`Confluence score: ${results.confluenceScore}%`);
    recommendation.reasons.push(`Overall bias: ${results.overallBias}`);

    // Add warnings for conflicting timeframes
    if (results.alignment.conflictingTimeframes.length > 0) {
      const conflicts = results.alignment.conflictingTimeframes.map(c => c.tf).join(', ');
      recommendation.warnings.push(`Conflicting timeframes: ${conflicts}`);
    }

    return recommendation;
  }

  /**
   * Get key levels from all timeframes
   */
  getKeyLevels(timeframeAnalysis) {
    const levels = {
      support: [],
      resistance: [],
      orderBlocks: [],
      fvgs: []
    };

    for (const [tf, analysis] of Object.entries(timeframeAnalysis)) {
      if (!analysis.available) continue;

      const weight = this.timeframeWeights[tf] || 0.1;

      // Technical levels
      if (analysis.technical?.indicators?.bollinger) {
        levels.support.push({
          price: analysis.technical.indicators.bollinger.lower,
          timeframe: tf,
          type: 'BOLLINGER_LOWER',
          weight
        });
        levels.resistance.push({
          price: analysis.technical.indicators.bollinger.upper,
          timeframe: tf,
          type: 'BOLLINGER_UPPER',
          weight
        });
      }

      // SMC levels
      if (analysis.smartMoney?.orderBlocks) {
        for (const ob of analysis.smartMoney.orderBlocks.bullish) {
          levels.orderBlocks.push({
            ...ob,
            timeframe: tf,
            weight
          });
        }
        for (const ob of analysis.smartMoney.orderBlocks.bearish) {
          levels.orderBlocks.push({
            ...ob,
            timeframe: tf,
            weight
          });
        }
      }

      if (analysis.smartMoney?.fairValueGaps) {
        for (const fvg of analysis.smartMoney.fairValueGaps.bullish) {
          levels.fvgs.push({
            ...fvg,
            timeframe: tf,
            weight
          });
        }
        for (const fvg of analysis.smartMoney.fairValueGaps.bearish) {
          levels.fvgs.push({
            ...fvg,
            timeframe: tf,
            weight
          });
        }
      }
    }

    // Sort by weight (higher timeframe = more important)
    levels.support.sort((a, b) => b.weight - a.weight);
    levels.resistance.sort((a, b) => b.weight - a.weight);
    levels.orderBlocks.sort((a, b) => b.weight - a.weight);
    levels.fvgs.sort((a, b) => b.weight - a.weight);

    return levels;
  }
}

export default MultiTimeframeAnalyzer;
