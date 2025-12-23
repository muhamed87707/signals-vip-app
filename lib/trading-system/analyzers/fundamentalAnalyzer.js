/**
 * Fundamental Analyzer
 * تحليل الأساسيات والأخبار الاقتصادية
 * 
 * Analyzes:
 * - Economic calendar events
 * - News impact classification
 * - News blackout periods
 * - Central bank policies
 */

export class FundamentalAnalyzer {
  constructor(config = {}) {
    this.config = {
      highImpactBlackoutMinutes: 30,
      mediumImpactBlackoutMinutes: 15,
      newsLookAheadHours: 24,
      ...config,
    };

    // Currency to country mapping
    this.currencyCountryMap = {
      USD: ['US', 'United States'],
      EUR: ['EU', 'Eurozone', 'Germany', 'France'],
      GBP: ['UK', 'United Kingdom', 'Britain'],
      JPY: ['JP', 'Japan'],
      CHF: ['CH', 'Switzerland'],
      AUD: ['AU', 'Australia'],
      NZD: ['NZ', 'New Zealand'],
      CAD: ['CA', 'Canada'],
    };

    // High impact events
    this.highImpactEvents = [
      'NFP', 'Non-Farm Payrolls', 'Interest Rate Decision',
      'FOMC', 'ECB', 'BOE', 'BOJ', 'RBA', 'RBNZ', 'BOC', 'SNB',
      'GDP', 'CPI', 'Inflation', 'Employment Change',
      'Retail Sales', 'PMI', 'Trade Balance',
    ];
  }

  /**
   * Analyze fundamentals for a symbol
   * @param {string} symbol - Trading symbol
   * @param {Array} economicEvents - Economic calendar events
   * @param {Array} news - Recent news items
   * @returns {Object} Fundamental analysis
   */
  analyze(symbol, economicEvents = [], news = []) {
    const currencies = this.extractCurrencies(symbol);
    const relevantEvents = this.filterRelevantEvents(economicEvents, currencies);
    const upcomingHighImpact = this.getUpcomingHighImpact(relevantEvents);
    const newsBlackout = this.checkNewsBlackout(relevantEvents);
    const newsAnalysis = this.analyzeNews(news, currencies);
    const centralBankBias = this.analyzeCentralBankBias(currencies, news);

    const signal = this.generateSignal(newsAnalysis, centralBankBias, newsBlackout);
    const score = this.calculateScore(relevantEvents, newsAnalysis, newsBlackout);

    return {
      symbol,
      currencies,
      upcomingEvents: relevantEvents.slice(0, 10),
      upcomingHighImpact,
      newsBlackout,
      newsAnalysis,
      centralBankBias,
      signal,
      score,
      tradingAllowed: !newsBlackout.active,
      timestamp: Date.now(),
    };
  }

  /**
   * Extract currencies from symbol
   */
  extractCurrencies(symbol) {
    const currencies = [];
    const knownCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD', 'XAU', 'XAG'];
    
    knownCurrencies.forEach(curr => {
      if (symbol.includes(curr)) {
        currencies.push(curr);
      }
    });

    // Handle metals
    if (symbol.includes('XAU') || symbol.includes('GOLD')) {
      currencies.push('XAU');
      if (!currencies.includes('USD')) currencies.push('USD');
    }
    if (symbol.includes('XAG') || symbol.includes('SILVER')) {
      currencies.push('XAG');
      if (!currencies.includes('USD')) currencies.push('USD');
    }

    return currencies;
  }

  /**
   * Filter events relevant to the symbol's currencies
   */
  filterRelevantEvents(events, currencies) {
    if (!events || events.length === 0) return [];

    return events.filter(event => {
      const eventCountry = event.country || event.currency || '';
      return currencies.some(curr => {
        const countries = this.currencyCountryMap[curr] || [curr];
        return countries.some(country => 
          eventCountry.toUpperCase().includes(country.toUpperCase())
        );
      });
    }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }

  /**
   * Get upcoming high impact events
   */
  getUpcomingHighImpact(events) {
    const now = Date.now();
    const lookAhead = this.config.newsLookAheadHours * 60 * 60 * 1000;

    return events.filter(event => {
      const eventTime = new Date(event.datetime).getTime();
      const isUpcoming = eventTime > now && eventTime < now + lookAhead;
      const isHighImpact = this.isHighImpactEvent(event);
      return isUpcoming && isHighImpact;
    });
  }

  /**
   * Check if event is high impact
   */
  isHighImpactEvent(event) {
    const impact = (event.impact || event.importance || '').toLowerCase();
    if (impact === 'high' || impact === '3' || impact === 'red') return true;

    const title = (event.title || event.event || '').toUpperCase();
    return this.highImpactEvents.some(e => title.includes(e.toUpperCase()));
  }

  /**
   * Check if we're in a news blackout period
   */
  checkNewsBlackout(events) {
    const now = Date.now();
    let blackoutUntil = null;
    let blackoutReason = null;
    let blackoutEvent = null;

    events.forEach(event => {
      const eventTime = new Date(event.datetime).getTime();
      const isHighImpact = this.isHighImpactEvent(event);
      const blackoutMinutes = isHighImpact 
        ? this.config.highImpactBlackoutMinutes 
        : this.config.mediumImpactBlackoutMinutes;
      
      const blackoutStart = eventTime - blackoutMinutes * 60 * 1000;
      const blackoutEnd = eventTime + blackoutMinutes * 60 * 1000;

      if (now >= blackoutStart && now <= blackoutEnd) {
        if (!blackoutUntil || blackoutEnd > blackoutUntil) {
          blackoutUntil = blackoutEnd;
          blackoutReason = event.title || event.event;
          blackoutEvent = event;
        }
      }
    });

    return {
      active: blackoutUntil !== null,
      until: blackoutUntil,
      reason: blackoutReason,
      event: blackoutEvent,
      minutesRemaining: blackoutUntil ? Math.ceil((blackoutUntil - now) / 60000) : 0,
    };
  }

  /**
   * Analyze news sentiment
   */
  analyzeNews(news, currencies) {
    if (!news || news.length === 0) {
      return {
        sentiment: 'neutral',
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0,
        recentNews: [],
      };
    }

    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;

    const relevantNews = news.filter(item => {
      const text = (item.title + ' ' + (item.description || '')).toUpperCase();
      return currencies.some(curr => text.includes(curr));
    });

    relevantNews.forEach(item => {
      const sentiment = this.classifyNewsSentiment(item);
      if (sentiment === 'bullish') bullishCount++;
      else if (sentiment === 'bearish') bearishCount++;
      else neutralCount++;
    });

    const totalSentiment = bullishCount - bearishCount;
    const sentiment = totalSentiment > 2 ? 'bullish' 
                    : totalSentiment < -2 ? 'bearish' 
                    : 'neutral';

    return {
      sentiment,
      bullishCount,
      bearishCount,
      neutralCount,
      recentNews: relevantNews.slice(0, 5),
    };
  }

  /**
   * Classify news sentiment
   */
  classifyNewsSentiment(newsItem) {
    const text = (newsItem.title + ' ' + (newsItem.description || '')).toLowerCase();
    
    const bullishKeywords = [
      'surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'bullish',
      'strong', 'beat', 'exceed', 'growth', 'recovery', 'hawkish',
      'rate hike', 'tightening', 'positive', 'optimism',
    ];
    
    const bearishKeywords = [
      'fall', 'drop', 'decline', 'plunge', 'crash', 'bearish',
      'weak', 'miss', 'below', 'contraction', 'recession', 'dovish',
      'rate cut', 'easing', 'negative', 'pessimism', 'concern',
    ];

    let bullishScore = 0;
    let bearishScore = 0;

    bullishKeywords.forEach(kw => {
      if (text.includes(kw)) bullishScore++;
    });

    bearishKeywords.forEach(kw => {
      if (text.includes(kw)) bearishScore++;
    });

    if (bullishScore > bearishScore) return 'bullish';
    if (bearishScore > bullishScore) return 'bearish';
    return 'neutral';
  }

  /**
   * Analyze central bank bias
   */
  analyzeCentralBankBias(currencies, news) {
    const biases = {};

    currencies.forEach(curr => {
      biases[curr] = this.getCentralBankBias(curr, news);
    });

    return biases;
  }

  /**
   * Get central bank bias for a currency
   */
  getCentralBankBias(currency, news) {
    // Default biases based on current market conditions
    const defaultBiases = {
      USD: { bias: 'hawkish', rate: 5.25, nextMove: 'hold' },
      EUR: { bias: 'hawkish', rate: 4.50, nextMove: 'hold' },
      GBP: { bias: 'hawkish', rate: 5.25, nextMove: 'hold' },
      JPY: { bias: 'dovish', rate: -0.10, nextMove: 'hold' },
      CHF: { bias: 'neutral', rate: 1.75, nextMove: 'hold' },
      AUD: { bias: 'hawkish', rate: 4.35, nextMove: 'hold' },
      NZD: { bias: 'hawkish', rate: 5.50, nextMove: 'cut' },
      CAD: { bias: 'neutral', rate: 5.00, nextMove: 'cut' },
    };

    return defaultBiases[currency] || { bias: 'neutral', rate: null, nextMove: 'unknown' };
  }

  /**
   * Generate trading signal from fundamentals
   */
  generateSignal(newsAnalysis, centralBankBias, newsBlackout) {
    // Don't generate signal during blackout
    if (newsBlackout.active) {
      return {
        direction: 'NEUTRAL',
        strength: 0,
        reason: 'news_blackout',
        confidence: 0,
      };
    }

    let bullishScore = 0;
    let bearishScore = 0;

    // News sentiment
    if (newsAnalysis.sentiment === 'bullish') bullishScore += 30;
    else if (newsAnalysis.sentiment === 'bearish') bearishScore += 30;

    // Central bank bias comparison
    const biasValues = Object.values(centralBankBias);
    const hawkishCount = biasValues.filter(b => b.bias === 'hawkish').length;
    const dovishCount = biasValues.filter(b => b.bias === 'dovish').length;

    if (hawkishCount > dovishCount) bullishScore += 20;
    else if (dovishCount > hawkishCount) bearishScore += 20;

    if (bullishScore > bearishScore + 15) {
      return {
        direction: 'BUY',
        strength: bullishScore,
        reason: 'fundamental_bullish',
        confidence: bullishScore / 100,
      };
    } else if (bearishScore > bullishScore + 15) {
      return {
        direction: 'SELL',
        strength: bearishScore,
        reason: 'fundamental_bearish',
        confidence: bearishScore / 100,
      };
    }

    return {
      direction: 'NEUTRAL',
      strength: 0,
      reason: 'no_clear_fundamental_bias',
      confidence: 0.5,
    };
  }

  /**
   * Calculate fundamental score (0-100)
   */
  calculateScore(events, newsAnalysis, newsBlackout) {
    let score = 50;

    // Penalize during blackout
    if (newsBlackout.active) {
      score -= 30;
    }

    // News clarity
    if (newsAnalysis.sentiment !== 'neutral') {
      score += 15;
    }

    // Upcoming high impact events (reduce score due to uncertainty)
    const upcomingHigh = events.filter(e => this.isHighImpactEvent(e));
    score -= upcomingHigh.length * 5;

    // News volume
    const totalNews = newsAnalysis.bullishCount + newsAnalysis.bearishCount + newsAnalysis.neutralCount;
    if (totalNews > 5) score += 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get economic calendar for next 24 hours
   */
  async getEconomicCalendar() {
    // This would typically fetch from an API
    // Returning mock structure for now
    return [];
  }

  /**
   * Check if trading is allowed based on fundamentals
   */
  isTradingAllowed(symbol, events = []) {
    const currencies = this.extractCurrencies(symbol);
    const relevantEvents = this.filterRelevantEvents(events, currencies);
    const blackout = this.checkNewsBlackout(relevantEvents);
    return !blackout.active;
  }
}
