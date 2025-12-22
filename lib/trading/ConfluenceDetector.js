/**
 * ConfluenceDetector - Confluence Analysis Engine
 * Calculates weighted confluence score from all analysis components
 * Determines signal grade (A+, A, or No Signal)
 * Minimum threshold: 70% for signal generation
 */

export class ConfluenceDetector {
  constructor() {
    // Weights for each analysis component (total = 100%)
    this.weights = {
      technicalAnalysis: 0.25,      // 25% - Technical indicators
      patternAnalysis: 0.15,        // 15% - Candlestick & chart patterns
      smartMoneyAnalysis: 0.20,     // 20% - SMC (Order Blocks, FVG, BOS)
      multiTimeframe: 0.20,         // 20% - MTF alignment
      fundamentalAnalysis: 0.10,    // 10% - COT, economic calendar
      sentimentAnalysis: 0.05,      // 5% - Market sentiment
      volumeAnalysis: 0.05          // 5% - Volume profile
    };

    // Minimum thresholds
    this.minConfluenceScore = 70;   // Minimum for any signal
    this.aPlusThreshold = 80;       // A+ grade threshold
    this.aThreshold = 70;           // A grade threshold
  }

  /**
   * Main confluence calculation
   * @param {Object} analysisData - All analysis results
   * @returns {Object} Confluence result with score and grade
   */
  calculate(analysisData) {
    const result = {
      timestamp: new Date(),
      scores: {},
      weightedScores: {},
      totalScore: 0,
      grade: null,
      signalValid: false,
      direction: 'NEUTRAL',
      confidence: 0,
      breakdown: [],
      reasons: [],
      warnings: []
    };

    // Calculate score for each component
    result.scores.technical = this.scoreTechnicalAnalysis(analysisData.technical);
    result.scores.patterns = this.scorePatternAnalysis(analysisData.patterns);
    result.scores.smartMoney = this.scoreSmartMoneyAnalysis(analysisData.smartMoney);
    result.scores.multiTimeframe = this.scoreMultiTimeframe(analysisData.multiTimeframe);
    result.scores.fundamental = this.scoreFundamentalAnalysis(analysisData.fundamental);
    result.scores.sentiment = this.scoreSentimentAnalysis(analysisData.sentiment);
    result.scores.volume = this.scoreVolumeAnalysis(analysisData.volume);

    // Calculate weighted scores
    result.weightedScores.technical = result.scores.technical * this.weights.technicalAnalysis;
    result.weightedScores.patterns = result.scores.patterns * this.weights.patternAnalysis;
    result.weightedScores.smartMoney = result.scores.smartMoney * this.weights.smartMoneyAnalysis;
    result.weightedScores.multiTimeframe = result.scores.multiTimeframe * this.weights.multiTimeframe;
    result.weightedScores.fundamental = result.scores.fundamental * this.weights.fundamentalAnalysis;
    result.weightedScores.sentiment = result.scores.sentiment * this.weights.sentimentAnalysis;
    result.weightedScores.volume = result.scores.volume * this.weights.volumeAnalysis;

    // Calculate total score
    result.totalScore = Math.round(
      Object.values(result.weightedScores).reduce((sum, score) => sum + score, 0)
    );

    // Determine grade
    result.grade = this.determineGrade(result.totalScore);
    result.signalValid = result.totalScore >= this.minConfluenceScore;

    // Determine direction
    result.direction = this.determineDirection(analysisData, result.scores);

    // Calculate confidence
    result.confidence = this.calculateConfidence(result);

    // Generate breakdown
    result.breakdown = this.generateBreakdown(result.scores, result.weightedScores);

    // Generate reasons and warnings
    result.reasons = this.generateReasons(analysisData, result);
    result.warnings = this.generateWarnings(analysisData, result);

    return result;
  }

  /**
   * Score Technical Analysis (0-100)
   */
  scoreTechnicalAnalysis(technical) {
    if (!technical || technical.error) return 0;

    let score = 50; // Base score

    // Trend strength
    if (technical.trend === 'STRONG_BULLISH' || technical.trend === 'STRONG_BEARISH') {
      score += 20;
    } else if (technical.trend === 'BULLISH' || technical.trend === 'BEARISH') {
      score += 10;
    }

    // EMA alignment
    if (technical.indicators?.ema?.alignment?.strength === 'STRONG') {
      score += 15;
    } else if (technical.indicators?.ema?.alignment?.strength === 'MODERATE') {
      score += 8;
    }

    // RSI confirmation
    if (technical.indicators?.rsi) {
      const rsi = technical.indicators.rsi;
      if (rsi.divergence) score += 10;
      if (rsi.signal === 'OVERSOLD' || rsi.signal === 'OVERBOUGHT') score += 5;
    }

    // MACD confirmation
    if (technical.indicators?.macd?.crossover) {
      score += 10;
    }

    // ADX trending
    if (technical.indicators?.adx?.trending) {
      score += 5;
      if (technical.indicators.adx.strength === 'STRONG') score += 5;
    }

    // Ichimoku confirmation
    if (technical.indicators?.ichimoku) {
      if (technical.indicators.ichimoku.signal?.includes('STRONG')) score += 10;
      if (technical.indicators.ichimoku.tkCross) score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Pattern Analysis (0-100)
   */
  scorePatternAnalysis(patterns) {
    if (!patterns || patterns.error) return 0;

    let score = 50;

    // High strength patterns
    const highStrength = [
      ...(patterns.candlePatterns || []),
      ...(patterns.chartPatterns || []),
      ...(patterns.harmonicPatterns || [])
    ].filter(p => p.strength === 'HIGH');

    score += highStrength.length * 10;

    // Pattern confidence
    if (patterns.summary?.confidence === 'HIGH') score += 15;
    else if (patterns.summary?.confidence === 'MEDIUM') score += 8;

    // Reversal patterns at key levels
    const reversalPatterns = [
      ...(patterns.candlePatterns || []),
      ...(patterns.chartPatterns || [])
    ].filter(p => p.type === 'REVERSAL');

    score += reversalPatterns.length * 5;

    // Harmonic patterns (high probability)
    if (patterns.harmonicPatterns?.length > 0) {
      score += patterns.harmonicPatterns.length * 8;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Smart Money Analysis (0-100)
   */
  scoreSmartMoneyAnalysis(smartMoney) {
    if (!smartMoney || smartMoney.error) return 0;

    let score = 50;

    // Market structure
    if (smartMoney.marketStructure) {
      if (smartMoney.marketStructure.trend !== 'NEUTRAL') score += 10;
      
      // CHoCH is a strong signal
      if (smartMoney.marketStructure.choch?.length > 0) score += 15;
      
      // BOS confirmation
      if (smartMoney.marketStructure.bos?.length > 0) score += 8;
    }

    // Order Blocks
    const totalOBs = (smartMoney.orderBlocks?.bullish?.length || 0) + 
                     (smartMoney.orderBlocks?.bearish?.length || 0);
    score += Math.min(totalOBs * 5, 15);

    // Fair Value Gaps
    const totalFVGs = (smartMoney.fairValueGaps?.bullish?.length || 0) + 
                      (smartMoney.fairValueGaps?.bearish?.length || 0);
    score += Math.min(totalFVGs * 3, 10);

    // Premium/Discount zone
    if (smartMoney.premiumDiscount) {
      if (smartMoney.premiumDiscount.currentZone !== 'EQUILIBRIUM') {
        score += 5;
      }
    }

    // SMC confidence
    if (smartMoney.summary?.confidence === 'HIGH') score += 10;

    return Math.min(100, Math.max(0, score));
  }


  /**
   * Score Multi-Timeframe Analysis (0-100)
   */
  scoreMultiTimeframe(mtf) {
    if (!mtf || mtf.error) return 0;

    let score = 50;

    // Alignment score
    if (mtf.alignment) {
      if (mtf.alignment.aligned) score += 20;
      score += (mtf.alignment.alignmentScore || 0) * 0.2;
    }

    // Confluence score from MTF
    if (mtf.confluenceScore) {
      score += mtf.confluenceScore * 0.15;
    }

    // Strong overall bias
    if (mtf.overallBias?.includes('STRONG')) {
      score += 10;
    } else if (mtf.overallBias !== 'NEUTRAL') {
      score += 5;
    }

    // Trading recommendation confidence
    if (mtf.tradingRecommendation?.confidence === 'HIGH') {
      score += 10;
    } else if (mtf.tradingRecommendation?.confidence === 'MEDIUM') {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Fundamental Analysis (0-100)
   */
  scoreFundamentalAnalysis(fundamental) {
    if (!fundamental) return 50; // Neutral if not available

    let score = 50;

    // COT data
    if (fundamental.cot) {
      if (fundamental.cot.bias !== 'NEUTRAL') score += 10;
      if (fundamental.cot.extremePositioning) score += 10;
    }

    // Economic calendar
    if (fundamental.economicCalendar) {
      // No high-impact news = safer to trade
      if (!fundamental.economicCalendar.highImpactSoon) score += 10;
      // Aligned with expected news direction
      if (fundamental.economicCalendar.aligned) score += 5;
    }

    // Currency strength
    if (fundamental.currencyStrength) {
      if (fundamental.currencyStrength.divergence > 20) score += 10;
    }

    // Interest rate differential
    if (fundamental.interestRates?.favorable) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Sentiment Analysis (0-100)
   */
  scoreSentimentAnalysis(sentiment) {
    if (!sentiment) return 50; // Neutral if not available

    let score = 50;

    // Retail positioning (contrarian)
    if (sentiment.retailPositioning) {
      // Extreme retail positioning = contrarian opportunity
      if (sentiment.retailPositioning.extreme) score += 15;
      if (sentiment.retailPositioning.ratio > 70 || sentiment.retailPositioning.ratio < 30) {
        score += 10;
      }
    }

    // News sentiment
    if (sentiment.newsSentiment) {
      if (sentiment.newsSentiment.aligned) score += 10;
      if (sentiment.newsSentiment.confidence === 'HIGH') score += 5;
    }

    // Fear & Greed
    if (sentiment.fearGreed) {
      if (sentiment.fearGreed.extreme) score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Volume Analysis (0-100)
   */
  scoreVolumeAnalysis(volume) {
    if (!volume) return 50; // Neutral if not available

    let score = 50;

    // Volume confirmation
    if (volume.volumeConfirmation) score += 15;

    // Volume Profile
    if (volume.volumeProfile) {
      if (volume.volumeProfile.nearPOC) score += 10;
      if (volume.volumeProfile.inValueArea) score += 5;
    }

    // OBV trend
    if (volume.obv?.aligned) score += 10;

    // MFI
    if (volume.mfi?.signal) score += 5;

    // VWAP
    if (volume.vwap?.priceRelation) {
      if (volume.vwap.aligned) score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine signal grade
   */
  determineGrade(score) {
    if (score >= this.aPlusThreshold) return 'A+';
    if (score >= this.aThreshold) return 'A';
    return null; // No signal
  }

  /**
   * Determine overall direction
   */
  determineDirection(analysisData, scores) {
    let bullishScore = 0;
    let bearishScore = 0;

    // Technical direction
    if (analysisData.technical?.trend?.includes('BULLISH')) {
      bullishScore += scores.technical * this.weights.technicalAnalysis;
    } else if (analysisData.technical?.trend?.includes('BEARISH')) {
      bearishScore += scores.technical * this.weights.technicalAnalysis;
    }

    // Pattern direction
    if (analysisData.patterns?.summary?.bias === 'BULLISH') {
      bullishScore += scores.patterns * this.weights.patternAnalysis;
    } else if (analysisData.patterns?.summary?.bias === 'BEARISH') {
      bearishScore += scores.patterns * this.weights.patternAnalysis;
    }

    // SMC direction
    if (analysisData.smartMoney?.summary?.smcBias === 'BULLISH') {
      bullishScore += scores.smartMoney * this.weights.smartMoneyAnalysis;
    } else if (analysisData.smartMoney?.summary?.smcBias === 'BEARISH') {
      bearishScore += scores.smartMoney * this.weights.smartMoneyAnalysis;
    }

    // MTF direction
    if (analysisData.multiTimeframe?.overallBias?.includes('BULLISH')) {
      bullishScore += scores.multiTimeframe * this.weights.multiTimeframe;
    } else if (analysisData.multiTimeframe?.overallBias?.includes('BEARISH')) {
      bearishScore += scores.multiTimeframe * this.weights.multiTimeframe;
    }

    if (bullishScore > bearishScore * 1.2) return 'BULLISH';
    if (bearishScore > bullishScore * 1.2) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(result) {
    let confidence = result.totalScore;

    // Bonus for consistent direction across components
    const directions = Object.values(result.scores).filter(s => s > 60);
    if (directions.length >= 5) confidence += 5;

    // Penalty for low individual scores
    const lowScores = Object.values(result.scores).filter(s => s < 40);
    confidence -= lowScores.length * 3;

    return Math.min(100, Math.max(0, Math.round(confidence)));
  }


  /**
   * Generate score breakdown
   */
  generateBreakdown(scores, weightedScores) {
    return [
      {
        component: 'Technical Analysis',
        score: scores.technical,
        weight: this.weights.technicalAnalysis * 100,
        weighted: Math.round(weightedScores.technical),
        icon: '📊'
      },
      {
        component: 'Pattern Analysis',
        score: scores.patterns,
        weight: this.weights.patternAnalysis * 100,
        weighted: Math.round(weightedScores.patterns),
        icon: '🔷'
      },
      {
        component: 'Smart Money',
        score: scores.smartMoney,
        weight: this.weights.smartMoneyAnalysis * 100,
        weighted: Math.round(weightedScores.smartMoney),
        icon: '🏦'
      },
      {
        component: 'Multi-Timeframe',
        score: scores.multiTimeframe,
        weight: this.weights.multiTimeframe * 100,
        weighted: Math.round(weightedScores.multiTimeframe),
        icon: '⏱️'
      },
      {
        component: 'Fundamental',
        score: scores.fundamental,
        weight: this.weights.fundamentalAnalysis * 100,
        weighted: Math.round(weightedScores.fundamental),
        icon: '📰'
      },
      {
        component: 'Sentiment',
        score: scores.sentiment,
        weight: this.weights.sentimentAnalysis * 100,
        weighted: Math.round(weightedScores.sentiment),
        icon: '😊'
      },
      {
        component: 'Volume',
        score: scores.volume,
        weight: this.weights.volumeAnalysis * 100,
        weighted: Math.round(weightedScores.volume),
        icon: '📈'
      }
    ];
  }

  /**
   * Generate reasons for the signal
   */
  generateReasons(analysisData, result) {
    const reasons = [];

    // Technical reasons
    if (analysisData.technical?.trend?.includes('STRONG')) {
      reasons.push({
        ar: `اتجاه فني قوي ${analysisData.technical.trend === 'STRONG_BULLISH' ? 'صاعد' : 'هابط'}`,
        en: `Strong ${analysisData.technical.trend.toLowerCase().replace('_', ' ')} trend`
      });
    }

    if (analysisData.technical?.indicators?.ema?.alignment?.strength === 'STRONG') {
      reasons.push({
        ar: 'توافق قوي في المتوسطات المتحركة',
        en: 'Strong EMA alignment'
      });
    }

    if (analysisData.technical?.indicators?.rsi?.divergence) {
      reasons.push({
        ar: `انحراف ${analysisData.technical.indicators.rsi.divergence.type === 'BULLISH' ? 'صاعد' : 'هابط'} في RSI`,
        en: `${analysisData.technical.indicators.rsi.divergence.type} RSI divergence`
      });
    }

    // Pattern reasons
    if (analysisData.patterns?.summary?.topPatterns?.length > 0) {
      const topPattern = analysisData.patterns.summary.topPatterns[0];
      reasons.push({
        ar: `نمط ${topPattern} مكتشف`,
        en: `${topPattern} pattern detected`
      });
    }

    // SMC reasons
    if (analysisData.smartMoney?.marketStructure?.choch?.length > 0) {
      reasons.push({
        ar: 'تغير في طبيعة السوق (CHoCH)',
        en: 'Change of Character (CHoCH) detected'
      });
    }

    if (analysisData.smartMoney?.orderBlocks?.bullish?.length > 0 || 
        analysisData.smartMoney?.orderBlocks?.bearish?.length > 0) {
      reasons.push({
        ar: 'السعر قرب منطقة Order Block',
        en: 'Price near Order Block zone'
      });
    }

    // MTF reasons
    if (analysisData.multiTimeframe?.alignment?.aligned) {
      reasons.push({
        ar: `توافق ${analysisData.multiTimeframe.alignment.alignedTimeframes.length} أطر زمنية`,
        en: `${analysisData.multiTimeframe.alignment.alignedTimeframes.length} timeframes aligned`
      });
    }

    return reasons;
  }

  /**
   * Generate warnings
   */
  generateWarnings(analysisData, result) {
    const warnings = [];

    // Low individual scores
    if (result.scores.technical < 50) {
      warnings.push({
        ar: 'المؤشرات الفنية ضعيفة',
        en: 'Weak technical indicators'
      });
    }

    if (result.scores.multiTimeframe < 50) {
      warnings.push({
        ar: 'عدم توافق الأطر الزمنية',
        en: 'Timeframes not aligned'
      });
    }

    // High volatility
    if (analysisData.technical?.indicators?.atr?.volatility === 'EXTREME') {
      warnings.push({
        ar: 'تقلب عالي جداً - احذر',
        en: 'Extreme volatility - be cautious'
      });
    }

    // News warning
    if (analysisData.fundamental?.economicCalendar?.highImpactSoon) {
      warnings.push({
        ar: 'أخبار عالية التأثير قريباً',
        en: 'High-impact news coming soon'
      });
    }

    // Conflicting signals
    if (result.direction === 'NEUTRAL' && result.totalScore > 60) {
      warnings.push({
        ar: 'إشارات متضاربة - انتظر تأكيد',
        en: 'Conflicting signals - wait for confirmation'
      });
    }

    return warnings;
  }

  /**
   * Quick confluence check (for scanning)
   */
  quickCheck(analysisData) {
    const technicalScore = this.scoreTechnicalAnalysis(analysisData.technical);
    const smcScore = this.scoreSmartMoneyAnalysis(analysisData.smartMoney);
    const mtfScore = this.scoreMultiTimeframe(analysisData.multiTimeframe);

    const quickScore = (technicalScore * 0.4) + (smcScore * 0.35) + (mtfScore * 0.25);

    return {
      score: Math.round(quickScore),
      potential: quickScore >= 60,
      direction: this.determineDirection(analysisData, {
        technical: technicalScore,
        smartMoney: smcScore,
        multiTimeframe: mtfScore
      })
    };
  }
}

export default ConfluenceDetector;
