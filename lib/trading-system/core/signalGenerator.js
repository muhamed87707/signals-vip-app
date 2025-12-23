/**
 * Signal Generator - مولد التوصيات
 * Generates trading signals from validated analysis
 */

import { v4 as uuidv4 } from 'uuid';

export class SignalGenerator {
  constructor(config = {}) {
    this.config = {
      defaultExpirationHours: 24,
      ...config,
    };
  }

  /**
   * Generate a trading signal from analysis
   * @param {Object} analysis - Full analysis result
   * @returns {Object} Trading signal
   */
  generate(analysis) {
    const { symbol, confluence, validation } = analysis;
    const { smc, technical, ai } = analysis.analysis;

    // Determine direction from analysis consensus
    const direction = this.determineDirection(analysis);
    
    // Calculate entry price
    const entry = this.calculateEntry(analysis, direction);
    
    // Calculate stop loss
    const stopLoss = this.calculateStopLoss(analysis, direction, entry);
    
    // Calculate take profits
    const takeProfits = this.calculateTakeProfits(entry, stopLoss, direction);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(analysis);
    
    // Determine quality label
    const quality = this.getQualityLabel(confluence.score);

    const signal = {
      id: uuidv4(),
      symbol,
      direction,
      entry,
      stopLoss,
      takeProfit1: takeProfits.tp1,
      takeProfit2: takeProfits.tp2,
      takeProfit3: takeProfits.tp3,
      confluenceScore: confluence.score,
      quality,
      reasoning,
      validationLayers: validation.layers,
      analysis: {
        smcBias: smc.bias,
        technicalBias: technical.bias,
        aiBias: ai.direction,
        aiConfidence: ai.confidence,
      },
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.config.defaultExpirationHours * 60 * 60 * 1000),
      status: 'active',
    };

    return signal;
  }

  /**
   * Determine trade direction from analysis
   */
  determineDirection(analysis) {
    const { smc, technical, wyckoff, ai } = analysis.analysis;
    
    let bullishScore = 0;
    let bearishScore = 0;

    // SMC bias (weight: 30%)
    if (smc.bias === 'bullish') bullishScore += 30;
    else if (smc.bias === 'bearish') bearishScore += 30;

    // Technical bias (weight: 25%)
    if (technical.bias === 'bullish') bullishScore += 25;
    else if (technical.bias === 'bearish') bearishScore += 25;

    // Wyckoff bias (weight: 20%)
    if (wyckoff.bias === 'bullish') bullishScore += 20;
    else if (wyckoff.bias === 'bearish') bearishScore += 20;

    // AI direction (weight: 25%)
    if (ai.direction === 'long') bullishScore += 25;
    else if (ai.direction === 'short') bearishScore += 25;

    return bullishScore > bearishScore ? 'long' : 'short';
  }

  /**
   * Calculate entry price
   */
  calculateEntry(analysis, direction) {
    const { smc, technical } = analysis.analysis;
    const currentPrice = analysis.marketData.H1.candles[analysis.marketData.H1.candles.length - 1].close;

    // If there's an Order Block nearby, use it for entry
    const nearbyOB = smc.orderBlocks.find(ob => {
      const distance = Math.abs(currentPrice - (ob.high + ob.low) / 2) / currentPrice;
      return distance < 0.005 && // Within 0.5%
        ((direction === 'long' && ob.type === 'bullish') ||
         (direction === 'short' && ob.type === 'bearish'));
    });

    if (nearbyOB) {
      // Enter at OB midpoint
      return direction === 'long' ? nearbyOB.low : nearbyOB.high;
    }

    // If there's an OTE zone, use it
    if (smc.oteZone) {
      return direction === 'long' ? smc.oteZone.low : smc.oteZone.high;
    }

    // Default to current price
    return currentPrice;
  }

  /**
   * Calculate stop loss
   */
  calculateStopLoss(analysis, direction, entry) {
    const { smc, technical } = analysis.analysis;
    const atr = technical.volatility.atr;

    // Method 1: Structure-based SL (below/above swing point)
    let structureSL;
    if (direction === 'long') {
      const recentLow = smc.swingPoints
        .filter(sp => sp.type === 'low')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      structureSL = recentLow ? recentLow.price - (atr * 0.5) : entry - (atr * 2);
    } else {
      const recentHigh = smc.swingPoints
        .filter(sp => sp.type === 'high')
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      structureSL = recentHigh ? recentHigh.price + (atr * 0.5) : entry + (atr * 2);
    }

    // Method 2: ATR-based SL (1.5x ATR)
    const atrSL = direction === 'long' 
      ? entry - (atr * 1.5)
      : entry + (atr * 1.5);

    // Use the tighter SL (closer to entry)
    if (direction === 'long') {
      return Math.max(structureSL, atrSL);
    } else {
      return Math.min(structureSL, atrSL);
    }
  }

  /**
   * Calculate take profit levels
   */
  calculateTakeProfits(entry, stopLoss, direction) {
    const risk = Math.abs(entry - stopLoss);

    if (direction === 'long') {
      return {
        tp1: entry + (risk * 1.5),  // 1:1.5 RR
        tp2: entry + (risk * 2.5),  // 1:2.5 RR
        tp3: entry + (risk * 4),    // 1:4 RR
      };
    } else {
      return {
        tp1: entry - (risk * 1.5),
        tp2: entry - (risk * 2.5),
        tp3: entry - (risk * 4),
      };
    }
  }

  /**
   * Generate reasoning for the signal
   */
  generateReasoning(analysis) {
    const reasons = [];
    const { smc, technical, wyckoff, ai, fundamental, sentiment } = analysis.analysis;

    // SMC reasons
    if (smc.orderBlocks.length > 0) {
      const obType = smc.orderBlocks[0].type;
      reasons.push(`${obType === 'bullish' ? '🟢' : '🔴'} Order Block detected at key level`);
    }
    if (smc.fvgs.length > 0) {
      reasons.push(`📊 Fair Value Gap present - price imbalance zone`);
    }
    if (smc.structureBreaks.length > 0) {
      const lastBreak = smc.structureBreaks[smc.structureBreaks.length - 1];
      reasons.push(`📈 ${lastBreak.type} confirmed - trend continuation`);
    }

    // Technical reasons
    if (technical.trend.direction !== 'neutral') {
      reasons.push(`📉 Trend: ${technical.trend.direction} (strength: ${technical.trend.strength}%)`);
    }
    if (technical.divergences.length > 0) {
      reasons.push(`⚡ ${technical.divergences[0].type} divergence detected`);
    }

    // Wyckoff reasons
    if (wyckoff.phase.type !== 'unknown') {
      reasons.push(`🏛️ Wyckoff ${wyckoff.phase.type} phase (${wyckoff.phase.probability}% confidence)`);
    }
    if (wyckoff.spring) {
      reasons.push(`🌊 Spring pattern - potential reversal`);
    }

    // AI reasons
    if (ai.reasoning && ai.reasoning.length > 0) {
      reasons.push(...ai.reasoning.slice(0, 2).map(r => `🤖 ${r}`));
    }

    // Fundamental reasons
    if (!fundamental.newsBlackout && fundamental.bias !== 'neutral') {
      reasons.push(`📰 Fundamental bias: ${fundamental.bias}`);
    }

    // Sentiment reasons
    if (Math.abs(sentiment.score) > 50) {
      const sentimentDir = sentiment.score > 0 ? 'bullish' : 'bearish';
      reasons.push(`💭 Market sentiment: ${sentimentDir} (${Math.abs(sentiment.score)}%)`);
    }

    return reasons;
  }

  /**
   * Get quality label based on confluence score
   */
  getQualityLabel(score) {
    if (score >= 95) return 'institutional';
    if (score >= 90) return 'excellent';
    if (score >= 85) return 'strong';
    if (score >= 80) return 'good';
    return 'fair';
  }
}

export default SignalGenerator;
