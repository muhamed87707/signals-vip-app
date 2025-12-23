/**
 * Multi-Layer Validator
 * نظام التحقق متعدد الطبقات
 * 
 * Validates signals through 10 analysis layers:
 * 1. SMC Analysis
 * 2. Wyckoff Analysis
 * 3. Elliott Wave Analysis
 * 4. VSA Analysis
 * 5. Market Profile Analysis
 * 6. Order Flow Analysis
 * 7. Intermarket Analysis
 * 8. Technical Analysis
 * 9. Fundamental Analysis
 * 10. Sentiment Analysis
 */

export class MultiLayerValidator {
  constructor(config = {}) {
    this.config = {
      minimumLayers: 8, // Minimum 8 out of 10 layers must pass
      criticalLayers: ['smc', 'technical', 'fundamental'], // Must pass
      layerWeights: {
        smc: 1.5,
        wyckoff: 1.0,
        elliottWave: 0.8,
        vsa: 1.0,
        marketProfile: 0.9,
        orderFlow: 1.0,
        intermarket: 0.8,
        technical: 1.2,
        fundamental: 1.0,
        sentiment: 0.8,
      },
      ...config,
    };

    this.totalLayers = 10;
  }

  /**
   * Validate signal through all layers
   * @param {Object} analysisResults - Results from all analyzers
   * @param {string} proposedDirection - BUY or SELL
   * @returns {Object} Validation result
   */
  validate(analysisResults, proposedDirection) {
    const layerResults = this.validateAllLayers(analysisResults, proposedDirection);
    const passedLayers = layerResults.filter(l => l.passed);
    const failedLayers = layerResults.filter(l => !l.passed);
    const criticalPassed = this.checkCriticalLayers(layerResults);
    
    const passCount = passedLayers.length;
    const isValid = passCount >= this.config.minimumLayers && criticalPassed;
    
    const weightedScore = this.calculateWeightedScore(layerResults);
    const confidence = this.calculateConfidence(layerResults, passCount);

    return {
      isValid,
      passedCount: passCount,
      totalLayers: this.totalLayers,
      minimumRequired: this.config.minimumLayers,
      criticalLayersPassed: criticalPassed,
      layers: layerResults,
      passedLayers: passedLayers.map(l => l.name),
      failedLayers: failedLayers.map(l => ({ name: l.name, reason: l.reason })),
      weightedScore,
      confidence,
      recommendation: this.getRecommendation(isValid, passCount, criticalPassed),
      timestamp: Date.now(),
    };
  }

  /**
   * Validate all 10 layers
   */
  validateAllLayers(results, direction) {
    return [
      this.validateSMC(results.smc, direction),
      this.validateWyckoff(results.wyckoff, direction),
      this.validateElliottWave(results.elliottWave, direction),
      this.validateVSA(results.vsa, direction),
      this.validateMarketProfile(results.marketProfile, direction),
      this.validateOrderFlow(results.orderFlow, direction),
      this.validateIntermarket(results.intermarket, direction),
      this.validateTechnical(results.technical, direction),
      this.validateFundamental(results.fundamental, direction),
      this.validateSentiment(results.sentiment, direction),
    ];
  }

  /**
   * Layer 1: SMC Validation
   */
  validateSMC(smc, direction) {
    const result = {
      name: 'smc',
      displayName: 'Smart Money Concepts',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!smc) {
      result.reason = 'No SMC analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check market structure alignment
    if (smc.marketStructure?.trend) {
      const structureAligned = 
        (direction === 'BUY' && smc.marketStructure.trend === 'bullish') ||
        (direction === 'SELL' && smc.marketStructure.trend === 'bearish');
      
      if (structureAligned) {
        score += 30;
        checks.push('Market structure aligned');
      }
    }

    // Check order blocks
    if (smc.orderBlocks?.length > 0) {
      const relevantOB = smc.orderBlocks.find(ob => 
        (direction === 'BUY' && ob.type === 'bullish') ||
        (direction === 'SELL' && ob.type === 'bearish')
      );
      if (relevantOB) {
        score += 25;
        checks.push('Order block present');
      }
    }

    // Check FVGs
    if (smc.fvgs?.length > 0) {
      score += 20;
      checks.push('Fair Value Gap identified');
    }

    // Check liquidity zones
    if (smc.liquidityZones?.length > 0) {
      score += 15;
      checks.push('Liquidity zone mapped');
    }

    // Check premium/discount
    if (smc.premiumDiscount) {
      const inDiscount = direction === 'BUY' && smc.premiumDiscount.zone === 'discount';
      const inPremium = direction === 'SELL' && smc.premiumDiscount.zone === 'premium';
      if (inDiscount || inPremium) {
        score += 10;
        checks.push(`Price in ${smc.premiumDiscount.zone} zone`);
      }
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'Insufficient SMC confluence';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 2: Wyckoff Validation
   */
  validateWyckoff(wyckoff, direction) {
    const result = {
      name: 'wyckoff',
      displayName: 'Wyckoff Analysis',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!wyckoff) {
      result.reason = 'No Wyckoff analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check phase alignment
    if (wyckoff.phase) {
      const bullishPhases = ['accumulation', 'markup', 'spring'];
      const bearishPhases = ['distribution', 'markdown', 'upthrust'];
      
      const phaseAligned = 
        (direction === 'BUY' && bullishPhases.includes(wyckoff.phase)) ||
        (direction === 'SELL' && bearishPhases.includes(wyckoff.phase));
      
      if (phaseAligned) {
        score += 50;
        checks.push(`Wyckoff phase: ${wyckoff.phase}`);
      }
    }

    // Check for spring/upthrust
    if (wyckoff.spring?.detected && direction === 'BUY') {
      score += 30;
      checks.push('Spring pattern detected');
    }
    if (wyckoff.upthrust?.detected && direction === 'SELL') {
      score += 30;
      checks.push('Upthrust pattern detected');
    }

    // Check SOS/SOW
    if (wyckoff.sos?.detected && direction === 'BUY') {
      score += 20;
      checks.push('Sign of Strength detected');
    }
    if (wyckoff.sow?.detected && direction === 'SELL') {
      score += 20;
      checks.push('Sign of Weakness detected');
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'Wyckoff phase not aligned';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 3: Elliott Wave Validation
   */
  validateElliottWave(elliottWave, direction) {
    const result = {
      name: 'elliottWave',
      displayName: 'Elliott Wave',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!elliottWave) {
      result.reason = 'No Elliott Wave analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check wave count
    if (elliottWave.currentWave) {
      const bullishWaves = [1, 3, 5, 'A', 'C'];
      const bearishWaves = [2, 4, 'B'];
      
      const waveAligned = 
        (direction === 'BUY' && bullishWaves.includes(elliottWave.currentWave)) ||
        (direction === 'SELL' && bearishWaves.includes(elliottWave.currentWave));
      
      if (waveAligned) {
        score += 40;
        checks.push(`Wave ${elliottWave.currentWave} in progress`);
      }
    }

    // Check wave targets
    if (elliottWave.targets?.length > 0) {
      score += 30;
      checks.push('Wave targets calculated');
    }

    // Check wave validity
    if (elliottWave.validity > 0.6) {
      score += 30;
      checks.push(`Wave validity: ${Math.round(elliottWave.validity * 100)}%`);
    }

    result.score = score;
    result.passed = score >= 40;
    result.reason = result.passed ? checks.join(', ') : 'Elliott Wave not supportive';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 4: VSA Validation
   */
  validateVSA(vsa, direction) {
    const result = {
      name: 'vsa',
      displayName: 'Volume Spread Analysis',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!vsa) {
      result.reason = 'No VSA analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check volume confirmation
    if (vsa.volumeConfirmation) {
      score += 30;
      checks.push('Volume confirms move');
    }

    // Check for accumulation/distribution
    if (vsa.accumulation?.detected && direction === 'BUY') {
      score += 35;
      checks.push('Accumulation detected');
    }
    if (vsa.distribution?.detected && direction === 'SELL') {
      score += 35;
      checks.push('Distribution detected');
    }

    // Check stopping volume
    if (vsa.stoppingVolume?.detected) {
      score += 20;
      checks.push('Stopping volume present');
    }

    // Check climactic action
    if (vsa.climacticAction?.detected) {
      score += 15;
      checks.push('Climactic action detected');
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'VSA not confirming';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 5: Market Profile Validation
   */
  validateMarketProfile(marketProfile, direction) {
    const result = {
      name: 'marketProfile',
      displayName: 'Market Profile',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!marketProfile) {
      result.reason = 'No Market Profile analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check value area position
    if (marketProfile.valueArea) {
      const { vah, val, poc, currentPrice } = marketProfile.valueArea;
      
      if (direction === 'BUY' && currentPrice <= val) {
        score += 40;
        checks.push('Price at/below VAL');
      } else if (direction === 'SELL' && currentPrice >= vah) {
        score += 40;
        checks.push('Price at/above VAH');
      }
    }

    // Check POC
    if (marketProfile.poc) {
      score += 20;
      checks.push('POC identified');
    }

    // Check profile shape
    if (marketProfile.profileShape) {
      score += 20;
      checks.push(`Profile: ${marketProfile.profileShape}`);
    }

    // Check single prints
    if (marketProfile.singlePrints?.length > 0) {
      score += 20;
      checks.push('Single prints present');
    }

    result.score = score;
    result.passed = score >= 40;
    result.reason = result.passed ? checks.join(', ') : 'Market Profile not supportive';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 6: Order Flow Validation
   */
  validateOrderFlow(orderFlow, direction) {
    const result = {
      name: 'orderFlow',
      displayName: 'Order Flow',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!orderFlow) {
      result.reason = 'No Order Flow analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check delta
    if (orderFlow.delta) {
      const deltaAligned = 
        (direction === 'BUY' && orderFlow.delta.bias === 'bullish') ||
        (direction === 'SELL' && orderFlow.delta.bias === 'bearish');
      
      if (deltaAligned) {
        score += 35;
        checks.push(`Delta ${orderFlow.delta.bias}`);
      }
    }

    // Check absorption
    if (orderFlow.absorption?.detected) {
      score += 25;
      checks.push('Absorption detected');
    }

    // Check exhaustion
    if (orderFlow.exhaustion?.detected) {
      score += 25;
      checks.push('Exhaustion detected');
    }

    // Check imbalances
    if (orderFlow.imbalances?.detected) {
      score += 15;
      checks.push('Imbalances present');
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'Order flow not confirming';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 7: Intermarket Validation
   */
  validateIntermarket(intermarket, direction) {
    const result = {
      name: 'intermarket',
      displayName: 'Intermarket Analysis',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!intermarket) {
      result.reason = 'No Intermarket analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check DXY impact
    if (intermarket.dxy?.impact) {
      const dxyAligned = 
        (direction === 'BUY' && intermarket.dxy.impact === 'bullish') ||
        (direction === 'SELL' && intermarket.dxy.impact === 'bearish');
      
      if (dxyAligned) {
        score += 30;
        checks.push('DXY correlation aligned');
      }
    }

    // Check yields impact
    if (intermarket.yields?.impact) {
      const yieldsAligned = 
        (direction === 'BUY' && intermarket.yields.impact === 'bullish') ||
        (direction === 'SELL' && intermarket.yields.impact === 'bearish');
      
      if (yieldsAligned) {
        score += 25;
        checks.push('Yields correlation aligned');
      }
    }

    // Check for divergences (negative)
    if (!intermarket.divergences?.detected) {
      score += 25;
      checks.push('No divergences detected');
    }

    // Check risk sentiment
    if (intermarket.riskSentiment?.sentiment !== 'neutral') {
      score += 20;
      checks.push(`Risk sentiment: ${intermarket.riskSentiment.sentiment}`);
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'Intermarket not aligned';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 8: Technical Validation
   */
  validateTechnical(technical, direction) {
    const result = {
      name: 'technical',
      displayName: 'Technical Analysis',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!technical) {
      result.reason = 'No Technical analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check trend
    if (technical.trend) {
      const trendAligned = 
        (direction === 'BUY' && technical.trend === 'up') ||
        (direction === 'SELL' && technical.trend === 'down');
      
      if (trendAligned) {
        score += 25;
        checks.push(`Trend: ${technical.trend}`);
      }
    }

    // Check EMA alignment
    if (technical.emas?.aligned) {
      score += 20;
      checks.push('EMAs aligned');
    }

    // Check RSI
    if (technical.rsi) {
      const rsiOK = 
        (direction === 'BUY' && technical.rsi < 70) ||
        (direction === 'SELL' && technical.rsi > 30);
      
      if (rsiOK) {
        score += 15;
        checks.push(`RSI: ${Math.round(technical.rsi)}`);
      }
    }

    // Check MACD
    if (technical.macd?.signal) {
      const macdAligned = 
        (direction === 'BUY' && technical.macd.signal === 'bullish') ||
        (direction === 'SELL' && technical.macd.signal === 'bearish');
      
      if (macdAligned) {
        score += 20;
        checks.push('MACD aligned');
      }
    }

    // Check candlestick patterns
    if (technical.patterns?.length > 0) {
      score += 20;
      checks.push(`Pattern: ${technical.patterns[0].name}`);
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'Technical indicators not aligned';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 9: Fundamental Validation
   */
  validateFundamental(fundamental, direction) {
    const result = {
      name: 'fundamental',
      displayName: 'Fundamental Analysis',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!fundamental) {
      result.reason = 'No Fundamental analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check news blackout (critical)
    if (!fundamental.newsBlackout?.active) {
      score += 40;
      checks.push('No news blackout');
    } else {
      result.reason = 'News blackout active - trading not allowed';
      result.details = { newsBlackout: fundamental.newsBlackout };
      return result;
    }

    // Check news sentiment
    if (fundamental.newsAnalysis?.sentiment) {
      const sentimentAligned = 
        (direction === 'BUY' && fundamental.newsAnalysis.sentiment === 'bullish') ||
        (direction === 'SELL' && fundamental.newsAnalysis.sentiment === 'bearish');
      
      if (sentimentAligned) {
        score += 30;
        checks.push(`News sentiment: ${fundamental.newsAnalysis.sentiment}`);
      } else if (fundamental.newsAnalysis.sentiment === 'neutral') {
        score += 15;
        checks.push('Neutral news environment');
      }
    }

    // Check upcoming high impact events
    if (!fundamental.upcomingHighImpact?.length) {
      score += 30;
      checks.push('No imminent high-impact news');
    }

    result.score = score;
    result.passed = score >= 50;
    result.reason = result.passed ? checks.join(', ') : 'Fundamental conditions unfavorable';
    result.details = { checks, score };

    return result;
  }

  /**
   * Layer 10: Sentiment Validation
   */
  validateSentiment(sentiment, direction) {
    const result = {
      name: 'sentiment',
      displayName: 'Sentiment Analysis',
      passed: false,
      score: 0,
      reason: '',
      details: {},
    };

    if (!sentiment) {
      result.reason = 'No Sentiment analysis available';
      return result;
    }

    let score = 0;
    const checks = [];

    // Check contrarian signal (high value)
    if (sentiment.contrarian?.active) {
      const contrarianAligned = sentiment.contrarian.signal === direction;
      if (contrarianAligned) {
        score += 40;
        checks.push(`Contrarian signal: ${sentiment.contrarian.signal}`);
      }
    }

    // Check COT data
    if (sentiment.cotAnalysis?.signal) {
      const cotAligned = sentiment.cotAnalysis.signal === direction;
      if (cotAligned) {
        score += 30;
        checks.push('COT data aligned');
      }
    }

    // Check retail positioning (contrarian)
    if (sentiment.retailPositioning?.extreme) {
      const retailContrarian = sentiment.retailPositioning.contrarianSignal === direction;
      if (retailContrarian) {
        score += 20;
        checks.push('Retail positioning extreme (contrarian)');
      }
    }

    // Check fear & greed
    if (sentiment.fearGreed) {
      score += 10;
      checks.push(`Fear & Greed: ${sentiment.fearGreed.label}`);
    }

    result.score = score;
    result.passed = score >= 40;
    result.reason = result.passed ? checks.join(', ') : 'Sentiment not supportive';
    result.details = { checks, score };

    return result;
  }

  /**
   * Check if all critical layers passed
   */
  checkCriticalLayers(layerResults) {
    return this.config.criticalLayers.every(criticalLayer => {
      const layer = layerResults.find(l => l.name === criticalLayer);
      return layer?.passed;
    });
  }

  /**
   * Calculate weighted score
   */
  calculateWeightedScore(layerResults) {
    let totalWeight = 0;
    let weightedSum = 0;

    layerResults.forEach(layer => {
      const weight = this.config.layerWeights[layer.name] || 1.0;
      totalWeight += weight;
      weightedSum += (layer.score / 100) * weight;
    });

    return Math.round((weightedSum / totalWeight) * 100);
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(layerResults, passCount) {
    const baseConfidence = passCount / this.totalLayers;
    const avgScore = layerResults.reduce((sum, l) => sum + l.score, 0) / this.totalLayers;
    
    return Math.round((baseConfidence * 0.6 + (avgScore / 100) * 0.4) * 100);
  }

  /**
   * Get recommendation based on validation
   */
  getRecommendation(isValid, passCount, criticalPassed) {
    if (isValid) {
      if (passCount >= 9) return 'STRONG_SIGNAL';
      return 'VALID_SIGNAL';
    }

    if (!criticalPassed) {
      return 'CRITICAL_LAYERS_FAILED';
    }

    if (passCount >= 6) {
      return 'WEAK_SIGNAL';
    }

    return 'NO_TRADE';
  }
}
