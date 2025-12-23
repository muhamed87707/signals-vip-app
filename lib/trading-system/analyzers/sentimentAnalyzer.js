/**
 * Sentiment Analyzer
 * تحليل معنويات السوق
 * 
 * Analyzes:
 * - Retail positioning (contrarian indicator)
 * - Fear & Greed index
 * - Social sentiment
 * - COT (Commitment of Traders) data
 */

export class SentimentAnalyzer {
  constructor(config = {}) {
    this.config = {
      extremeRetailThreshold: 70, // % for contrarian signal
      fearGreedExtremeHigh: 80,
      fearGreedExtremeLow: 20,
      cotExtremeThreshold: 0.8, // 80th percentile
      ...config,
    };
  }

  /**
   * Analyze market sentiment for a symbol
   * @param {string} symbol - Trading symbol
   * @param {Object} sentimentData - Sentiment data from various sources
   * @returns {Object} Sentiment analysis
   */
  analyze(symbol, sentimentData = {}) {
    const retailPositioning = this.analyzeRetailPositioning(symbol, sentimentData.retail);
    const fearGreed = this.analyzeFearGreed(sentimentData.fearGreed);
    const socialSentiment = this.analyzeSocialSentiment(symbol, sentimentData.social);
    const cotAnalysis = this.analyzeCOT(symbol, sentimentData.cot);
    const contrarian = this.calculateContrarianSignal(retailPositioning, fearGreed);

    const signal = this.generateSignal(retailPositioning, fearGreed, socialSentiment, cotAnalysis, contrarian);
    const score = this.calculateScore(retailPositioning, fearGreed, socialSentiment, cotAnalysis);

    return {
      symbol,
      retailPositioning,
      fearGreed,
      socialSentiment,
      cotAnalysis,
      contrarian,
      signal,
      score,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze retail positioning (contrarian indicator)
   */
  analyzeRetailPositioning(symbol, retailData) {
    if (!retailData) {
      return {
        longPercent: 50,
        shortPercent: 50,
        bias: 'neutral',
        extreme: false,
        contrarianSignal: null,
      };
    }

    const longPercent = retailData.longPercent || 50;
    const shortPercent = 100 - longPercent;
    
    let bias = 'neutral';
    let extreme = false;
    let contrarianSignal = null;

    if (longPercent >= this.config.extremeRetailThreshold) {
      bias = 'extremely_long';
      extreme = true;
      contrarianSignal = 'SELL'; // Contrarian: sell when retail is extremely long
    } else if (shortPercent >= this.config.extremeRetailThreshold) {
      bias = 'extremely_short';
      extreme = true;
      contrarianSignal = 'BUY'; // Contrarian: buy when retail is extremely short
    } else if (longPercent > 55) {
      bias = 'long';
    } else if (shortPercent > 55) {
      bias = 'short';
    }

    return {
      longPercent,
      shortPercent,
      bias,
      extreme,
      contrarianSignal,
      source: retailData.source || 'unknown',
    };
  }

  /**
   * Analyze Fear & Greed index
   */
  analyzeFearGreed(fearGreedData) {
    if (!fearGreedData) {
      return {
        value: 50,
        label: 'neutral',
        extreme: false,
        implication: 'no_clear_signal',
      };
    }

    const value = fearGreedData.value || 50;
    let label = 'neutral';
    let extreme = false;
    let implication = 'no_clear_signal';

    if (value >= this.config.fearGreedExtremeHigh) {
      label = 'extreme_greed';
      extreme = true;
      implication = 'potential_top'; // Contrarian
    } else if (value >= 60) {
      label = 'greed';
      implication = 'bullish_sentiment';
    } else if (value <= this.config.fearGreedExtremeLow) {
      label = 'extreme_fear';
      extreme = true;
      implication = 'potential_bottom'; // Contrarian
    } else if (value <= 40) {
      label = 'fear';
      implication = 'bearish_sentiment';
    }

    return {
      value,
      label,
      extreme,
      implication,
      previousValue: fearGreedData.previousValue || null,
      change: fearGreedData.previousValue ? value - fearGreedData.previousValue : 0,
    };
  }

  /**
   * Analyze social media sentiment
   */
  analyzeSocialSentiment(symbol, socialData) {
    if (!socialData) {
      return {
        score: 50,
        sentiment: 'neutral',
        volume: 0,
        trending: false,
      };
    }

    const score = socialData.score || 50;
    let sentiment = 'neutral';

    if (score >= 70) sentiment = 'very_bullish';
    else if (score >= 55) sentiment = 'bullish';
    else if (score <= 30) sentiment = 'very_bearish';
    else if (score <= 45) sentiment = 'bearish';

    return {
      score,
      sentiment,
      volume: socialData.volume || 0,
      trending: socialData.trending || false,
      mentions: socialData.mentions || 0,
      sources: socialData.sources || [],
    };
  }

  /**
   * Analyze COT (Commitment of Traders) data
   */
  analyzeCOT(symbol, cotData) {
    if (!cotData) {
      return {
        commercials: { net: 0, change: 0, bias: 'neutral' },
        nonCommercials: { net: 0, change: 0, bias: 'neutral' },
        retailers: { net: 0, change: 0, bias: 'neutral' },
        signal: null,
      };
    }

    const commercials = this.analyzeCOTGroup(cotData.commercials, 'commercials');
    const nonCommercials = this.analyzeCOTGroup(cotData.nonCommercials, 'non_commercials');
    const retailers = this.analyzeCOTGroup(cotData.retailers, 'retailers');

    // Smart money follows commercials and large speculators
    let signal = null;
    if (commercials.bias === 'bullish' && nonCommercials.bias === 'bullish') {
      signal = 'BUY';
    } else if (commercials.bias === 'bearish' && nonCommercials.bias === 'bearish') {
      signal = 'SELL';
    }

    return {
      commercials,
      nonCommercials,
      retailers,
      signal,
      reportDate: cotData.reportDate || null,
    };
  }

  /**
   * Analyze COT group positioning
   */
  analyzeCOTGroup(groupData, groupName) {
    if (!groupData) {
      return { net: 0, change: 0, bias: 'neutral', percentile: 50 };
    }

    const net = groupData.long - groupData.short;
    const change = groupData.change || 0;
    const percentile = groupData.percentile || 50;

    let bias = 'neutral';
    if (percentile >= 80) bias = 'bullish';
    else if (percentile <= 20) bias = 'bearish';
    else if (net > 0 && change > 0) bias = 'bullish';
    else if (net < 0 && change < 0) bias = 'bearish';

    return {
      net,
      long: groupData.long || 0,
      short: groupData.short || 0,
      change,
      percentile,
      bias,
    };
  }

  /**
   * Calculate contrarian signal
   */
  calculateContrarianSignal(retailPositioning, fearGreed) {
    let contrarianBullish = 0;
    let contrarianBearish = 0;

    // Retail positioning contrarian
    if (retailPositioning.contrarianSignal === 'BUY') {
      contrarianBullish += 40;
    } else if (retailPositioning.contrarianSignal === 'SELL') {
      contrarianBearish += 40;
    }

    // Fear & Greed contrarian
    if (fearGreed.implication === 'potential_bottom') {
      contrarianBullish += 30;
    } else if (fearGreed.implication === 'potential_top') {
      contrarianBearish += 30;
    }

    const isActive = contrarianBullish >= 40 || contrarianBearish >= 40;
    let signal = null;
    let strength = 0;

    if (contrarianBullish > contrarianBearish && contrarianBullish >= 40) {
      signal = 'BUY';
      strength = contrarianBullish;
    } else if (contrarianBearish > contrarianBullish && contrarianBearish >= 40) {
      signal = 'SELL';
      strength = contrarianBearish;
    }

    return {
      active: isActive,
      signal,
      strength,
      reason: this.getContrarianReason(retailPositioning, fearGreed),
    };
  }

  /**
   * Get contrarian signal reason
   */
  getContrarianReason(retailPositioning, fearGreed) {
    const reasons = [];

    if (retailPositioning.extreme) {
      reasons.push(`Retail ${retailPositioning.bias}`);
    }
    if (fearGreed.extreme) {
      reasons.push(`${fearGreed.label}`);
    }

    return reasons.length > 0 ? reasons.join(', ') : 'No extreme sentiment';
  }

  /**
   * Generate trading signal from sentiment
   */
  generateSignal(retailPositioning, fearGreed, socialSentiment, cotAnalysis, contrarian) {
    let bullishScore = 0;
    let bearishScore = 0;

    // Contrarian signals (highest weight)
    if (contrarian.signal === 'BUY') bullishScore += 35;
    else if (contrarian.signal === 'SELL') bearishScore += 35;

    // COT analysis (smart money)
    if (cotAnalysis.signal === 'BUY') bullishScore += 25;
    else if (cotAnalysis.signal === 'SELL') bearishScore += 25;

    // Social sentiment (lower weight, can be noise)
    if (socialSentiment.sentiment === 'very_bullish') bullishScore += 15;
    else if (socialSentiment.sentiment === 'bullish') bullishScore += 10;
    else if (socialSentiment.sentiment === 'very_bearish') bearishScore += 15;
    else if (socialSentiment.sentiment === 'bearish') bearishScore += 10;

    // Fear & Greed (non-contrarian component)
    if (!fearGreed.extreme) {
      if (fearGreed.label === 'greed') bullishScore += 10;
      else if (fearGreed.label === 'fear') bearishScore += 10;
    }

    if (bullishScore > bearishScore + 15) {
      return {
        direction: 'BUY',
        strength: bullishScore,
        confidence: bullishScore / 100,
        isContrarian: contrarian.active && contrarian.signal === 'BUY',
      };
    } else if (bearishScore > bullishScore + 15) {
      return {
        direction: 'SELL',
        strength: bearishScore,
        confidence: bearishScore / 100,
        isContrarian: contrarian.active && contrarian.signal === 'SELL',
      };
    }

    return {
      direction: 'NEUTRAL',
      strength: 0,
      confidence: 0.5,
      isContrarian: false,
    };
  }

  /**
   * Calculate sentiment score (0-100)
   */
  calculateScore(retailPositioning, fearGreed, socialSentiment, cotAnalysis) {
    let score = 50;

    // Extreme readings increase score (more actionable)
    if (retailPositioning.extreme) score += 15;
    if (fearGreed.extreme) score += 15;

    // COT clarity
    if (cotAnalysis.signal) score += 10;

    // Social volume
    if (socialSentiment.trending) score += 5;
    if (socialSentiment.volume > 1000) score += 5;

    // Alignment bonus
    const signals = [
      retailPositioning.contrarianSignal,
      cotAnalysis.signal,
      socialSentiment.sentiment.includes('bullish') ? 'BUY' : 
        socialSentiment.sentiment.includes('bearish') ? 'SELL' : null,
    ].filter(Boolean);

    const uniqueSignals = [...new Set(signals)];
    if (uniqueSignals.length === 1 && signals.length >= 2) {
      score += 10; // All signals aligned
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get retail positioning for symbol
   * This would typically fetch from broker APIs
   */
  async getRetailPositioning(symbol) {
    // Mock data - would fetch from real API
    return {
      longPercent: 50,
      shortPercent: 50,
      source: 'mock',
    };
  }

  /**
   * Get Fear & Greed index
   */
  async getFearGreedIndex() {
    // Mock data - would fetch from real API
    return {
      value: 50,
      previousValue: 48,
    };
  }
}
