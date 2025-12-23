/**
 * Intermarket Analyzer
 * تحليل العلاقات بين الأسواق
 * 
 * Analyzes correlations between:
 * - DXY (Dollar Index) and forex pairs
 * - US10Y yields and currencies
 * - Gold and USD
 * - Stock indices and risk sentiment
 */

export class IntermarketAnalyzer {
  constructor(config = {}) {
    this.config = {
      correlationPeriod: 20,
      strongCorrelation: 0.7,
      divergenceThreshold: 0.3,
      ...config,
    };

    // Known correlations
    this.correlationMap = {
      EURUSD: { DXY: -0.95, US10Y: -0.3, GOLD: 0.4 },
      GBPUSD: { DXY: -0.85, US10Y: -0.25, GOLD: 0.3 },
      USDJPY: { DXY: 0.7, US10Y: 0.6, GOLD: -0.4 },
      USDCHF: { DXY: 0.9, US10Y: 0.3, GOLD: -0.5 },
      AUDUSD: { DXY: -0.8, US10Y: -0.2, GOLD: 0.5 },
      NZDUSD: { DXY: -0.75, US10Y: -0.2, GOLD: 0.4 },
      USDCAD: { DXY: 0.6, US10Y: 0.2, GOLD: -0.3 },
      XAUUSD: { DXY: -0.85, US10Y: -0.5, GOLD: 1.0 },
      XAGUSD: { DXY: -0.75, US10Y: -0.4, GOLD: 0.9 },
    };
  }

  /**
   * Analyze intermarket relationships
   * @param {string} symbol - Trading symbol
   * @param {Object} marketData - Market data for related instruments
   * @returns {Object} Intermarket analysis
   */
  analyze(symbol, marketData = {}) {
    const dxyAnalysis = this.analyzeDXY(symbol, marketData.dxy);
    const yieldsAnalysis = this.analyzeYields(symbol, marketData.yields);
    const correlations = this.calculateCorrelations(symbol, marketData);
    const divergences = this.detectDivergences(symbol, marketData);
    const riskSentiment = this.analyzeRiskSentiment(marketData);

    const signal = this.generateSignal(symbol, dxyAnalysis, yieldsAnalysis, divergences, riskSentiment);
    const score = this.calculateScore(dxyAnalysis, yieldsAnalysis, divergences, riskSentiment);

    return {
      symbol,
      dxy: dxyAnalysis,
      yields: yieldsAnalysis,
      correlations,
      divergences,
      riskSentiment,
      signal,
      score,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze DXY impact on symbol
   */
  analyzeDXY(symbol, dxyData) {
    const expectedCorrelation = this.correlationMap[symbol]?.DXY || 0;
    
    if (!dxyData || !dxyData.current) {
      return {
        current: null,
        change: 0,
        trend: 'unknown',
        impact: 'neutral',
        expectedCorrelation,
      };
    }

    const change = dxyData.change || 0;
    const trend = change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'sideways';
    
    // Determine impact based on correlation
    let impact = 'neutral';
    if (expectedCorrelation < -0.5) {
      impact = trend === 'up' ? 'bearish' : trend === 'down' ? 'bullish' : 'neutral';
    } else if (expectedCorrelation > 0.5) {
      impact = trend === 'up' ? 'bullish' : trend === 'down' ? 'bearish' : 'neutral';
    }

    return {
      current: dxyData.current,
      change,
      trend,
      impact,
      expectedCorrelation,
    };
  }

  /**
   * Analyze US Treasury yields impact
   */
  analyzeYields(symbol, yieldsData) {
    const expectedCorrelation = this.correlationMap[symbol]?.US10Y || 0;
    
    if (!yieldsData || !yieldsData.us10y) {
      return {
        us10y: null,
        us2y: null,
        spread: null,
        trend: 'unknown',
        impact: 'neutral',
        expectedCorrelation,
      };
    }

    const us10y = yieldsData.us10y;
    const us2y = yieldsData.us2y || 0;
    const spread = us10y - us2y;
    const change = yieldsData.change || 0;
    const trend = change > 0.02 ? 'rising' : change < -0.02 ? 'falling' : 'stable';

    // Determine impact
    let impact = 'neutral';
    if (expectedCorrelation > 0.3) {
      impact = trend === 'rising' ? 'bullish' : trend === 'falling' ? 'bearish' : 'neutral';
    } else if (expectedCorrelation < -0.3) {
      impact = trend === 'rising' ? 'bearish' : trend === 'falling' ? 'bullish' : 'neutral';
    }

    return {
      us10y,
      us2y,
      spread,
      trend,
      impact,
      expectedCorrelation,
      yieldCurve: spread > 0 ? 'normal' : 'inverted',
    };
  }

  /**
   * Calculate live correlations
   */
  calculateCorrelations(symbol, marketData) {
    const correlations = {};
    const symbolData = marketData[symbol.toLowerCase()];

    if (!symbolData || symbolData.length < this.config.correlationPeriod) {
      return this.correlationMap[symbol] || {};
    }

    // Calculate correlation with DXY
    if (marketData.dxy?.history) {
      correlations.DXY = this.pearsonCorrelation(
        symbolData.slice(-this.config.correlationPeriod).map(c => c.close),
        marketData.dxy.history.slice(-this.config.correlationPeriod).map(c => c.close)
      );
    }

    // Calculate correlation with Gold
    if (marketData.gold?.history) {
      correlations.GOLD = this.pearsonCorrelation(
        symbolData.slice(-this.config.correlationPeriod).map(c => c.close),
        marketData.gold.history.slice(-this.config.correlationPeriod).map(c => c.close)
      );
    }

    return correlations;
  }

  /**
   * Detect divergences between correlated instruments
   */
  detectDivergences(symbol, marketData) {
    const divergences = [];
    const expectedCorrelations = this.correlationMap[symbol] || {};

    // Check DXY divergence
    if (marketData.dxy && expectedCorrelations.DXY) {
      const symbolTrend = this.detectTrend(marketData[symbol.toLowerCase()]);
      const dxyTrend = marketData.dxy.trend;
      
      const expectedDirection = expectedCorrelations.DXY < 0 
        ? (dxyTrend === 'up' ? 'down' : 'up')
        : dxyTrend;

      if (symbolTrend !== 'sideways' && symbolTrend !== expectedDirection) {
        divergences.push({
          type: 'DXY_DIVERGENCE',
          expected: expectedDirection,
          actual: symbolTrend,
          significance: Math.abs(expectedCorrelations.DXY),
          implication: symbolTrend === 'up' ? 'potential_reversal_down' : 'potential_reversal_up',
        });
      }
    }

    // Check yields divergence for USD pairs
    if (symbol.includes('USD') && marketData.yields) {
      const symbolTrend = this.detectTrend(marketData[symbol.toLowerCase()]);
      const yieldsTrend = marketData.yields.trend;
      
      if (expectedCorrelations.US10Y && Math.abs(expectedCorrelations.US10Y) > 0.3) {
        const expectedDirection = expectedCorrelations.US10Y > 0
          ? yieldsTrend
          : (yieldsTrend === 'rising' ? 'down' : 'up');

        if (symbolTrend !== 'sideways' && symbolTrend !== expectedDirection) {
          divergences.push({
            type: 'YIELDS_DIVERGENCE',
            expected: expectedDirection,
            actual: symbolTrend,
            significance: Math.abs(expectedCorrelations.US10Y),
            implication: 'potential_mean_reversion',
          });
        }
      }
    }

    return {
      detected: divergences.length > 0,
      patterns: divergences,
      tradingImplication: this.getDivergenceImplication(divergences),
    };
  }

  /**
   * Analyze overall risk sentiment
   */
  analyzeRiskSentiment(marketData) {
    let riskOnScore = 0;
    let riskOffScore = 0;

    // VIX analysis
    if (marketData.vix) {
      if (marketData.vix.current < 15) riskOnScore += 30;
      else if (marketData.vix.current > 25) riskOffScore += 30;
      else riskOnScore += 15;
    }

    // Stock indices
    if (marketData.sp500?.trend === 'up') riskOnScore += 25;
    else if (marketData.sp500?.trend === 'down') riskOffScore += 25;

    // Gold (safe haven)
    if (marketData.gold?.trend === 'up') riskOffScore += 20;
    else if (marketData.gold?.trend === 'down') riskOnScore += 20;

    // JPY (safe haven)
    if (marketData.usdjpy?.trend === 'up') riskOnScore += 15;
    else if (marketData.usdjpy?.trend === 'down') riskOffScore += 15;

    // CHF (safe haven)
    if (marketData.usdchf?.trend === 'down') riskOffScore += 10;
    else if (marketData.usdchf?.trend === 'up') riskOnScore += 10;

    const sentiment = riskOnScore > riskOffScore + 20 ? 'risk_on'
                    : riskOffScore > riskOnScore + 20 ? 'risk_off'
                    : 'neutral';

    return {
      sentiment,
      riskOnScore,
      riskOffScore,
      vix: marketData.vix?.current || null,
      implication: this.getRiskImplication(sentiment),
    };
  }

  /**
   * Generate trading signal from intermarket analysis
   */
  generateSignal(symbol, dxyAnalysis, yieldsAnalysis, divergences, riskSentiment) {
    let bullishScore = 0;
    let bearishScore = 0;

    // DXY impact
    if (dxyAnalysis.impact === 'bullish') bullishScore += 30;
    else if (dxyAnalysis.impact === 'bearish') bearishScore += 30;

    // Yields impact
    if (yieldsAnalysis.impact === 'bullish') bullishScore += 20;
    else if (yieldsAnalysis.impact === 'bearish') bearishScore += 20;

    // Divergences (contrarian)
    if (divergences.detected) {
      divergences.patterns.forEach(d => {
        if (d.implication.includes('up')) bullishScore += 15;
        else if (d.implication.includes('down')) bearishScore += 15;
      });
    }

    // Risk sentiment
    const isRiskCurrency = ['AUD', 'NZD', 'CAD'].some(c => symbol.includes(c));
    const isSafeCurrency = ['JPY', 'CHF'].some(c => symbol.includes(c));

    if (riskSentiment.sentiment === 'risk_on') {
      if (isRiskCurrency && symbol.startsWith('USD')) bearishScore += 15;
      else if (isRiskCurrency) bullishScore += 15;
      if (isSafeCurrency && symbol.startsWith('USD')) bullishScore += 15;
      else if (isSafeCurrency) bearishScore += 15;
    } else if (riskSentiment.sentiment === 'risk_off') {
      if (isRiskCurrency && symbol.startsWith('USD')) bullishScore += 15;
      else if (isRiskCurrency) bearishScore += 15;
      if (isSafeCurrency && symbol.startsWith('USD')) bearishScore += 15;
      else if (isSafeCurrency) bullishScore += 15;
    }

    if (bullishScore > bearishScore + 15) {
      return { direction: 'BUY', strength: bullishScore, confidence: bullishScore / 100 };
    } else if (bearishScore > bullishScore + 15) {
      return { direction: 'SELL', strength: bearishScore, confidence: bearishScore / 100 };
    }
    return { direction: 'NEUTRAL', strength: 0, confidence: 0.5 };
  }

  /**
   * Calculate intermarket score (0-100)
   */
  calculateScore(dxyAnalysis, yieldsAnalysis, divergences, riskSentiment) {
    let score = 50;

    // DXY clarity
    if (dxyAnalysis.impact !== 'neutral') score += 15;

    // Yields clarity
    if (yieldsAnalysis.impact !== 'neutral') score += 10;

    // Divergences (reduce score as they indicate uncertainty)
    if (divergences.detected) score -= divergences.patterns.length * 5;

    // Risk sentiment clarity
    if (riskSentiment.sentiment !== 'neutral') score += 15;

    // Alignment bonus
    if (dxyAnalysis.impact === yieldsAnalysis.impact && dxyAnalysis.impact !== 'neutral') {
      score += 10;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  pearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect trend from price data
   */
  detectTrend(data) {
    if (!data || data.length < 5) return 'sideways';
    
    const recent = data.slice(-10);
    const first = recent[0].close;
    const last = recent[recent.length - 1].close;
    const change = (last - first) / first;

    if (change > 0.002) return 'up';
    if (change < -0.002) return 'down';
    return 'sideways';
  }

  /**
   * Get divergence trading implication
   */
  getDivergenceImplication(divergences) {
    if (divergences.length === 0) return 'aligned';
    
    const highSignificance = divergences.filter(d => d.significance > 0.5);
    if (highSignificance.length > 0) {
      return 'caution_divergence';
    }
    return 'minor_divergence';
  }

  /**
   * Get risk sentiment implication
   */
  getRiskImplication(sentiment) {
    switch (sentiment) {
      case 'risk_on':
        return 'favor_risk_currencies';
      case 'risk_off':
        return 'favor_safe_havens';
      default:
        return 'no_clear_bias';
    }
  }
}
