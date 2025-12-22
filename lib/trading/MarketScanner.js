/**
 * MarketScanner - Automated Market Scanning Engine
 * Scans all supported symbols periodically for trading opportunities
 * Runs every 5 minutes to identify high-probability setups
 */

import { SignalEngine } from './SignalEngine.js';

export class MarketScanner {
  constructor(settings = {}) {
    this.signalEngine = new SignalEngine(settings);
    
    this.settings = {
      scanInterval: 5 * 60 * 1000,  // 5 minutes
      minScore: 60,                  // Minimum score for watchlist
      signalThreshold: 70,           // Minimum for signal generation
      maxConcurrent: 5,              // Max concurrent scans
      ...settings
    };

    // Supported symbols by category
    this.symbols = {
      forex: [
        'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
        'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURNZD', 'GBPAUD'
      ],
      metals: ['XAUUSD', 'XAGUSD'],
      indices: ['US30', 'US100', 'US500', 'GER40', 'UK100']
    };

    // Scanner state
    this.isRunning = false;
    this.lastScan = null;
    this.scanResults = [];
    this.opportunities = [];
    this.watchlist = [];
    this.scanInterval = null;
  }

  /**
   * Start the scanner
   */
  start(priceDataProvider) {
    if (this.isRunning) {
      console.log('Scanner already running');
      return;
    }

    this.isRunning = true;
    this.priceDataProvider = priceDataProvider;
    
    // Run initial scan
    this.scan();

    // Set up periodic scanning
    this.scanInterval = setInterval(() => {
      this.scan();
    }, this.settings.scanInterval);

    console.log('Market scanner started');
  }

  /**
   * Stop the scanner
   */
  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isRunning = false;
    console.log('Market scanner stopped');
  }

  /**
   * Run a single scan
   */
  async scan() {
    const startTime = Date.now();
    const results = {
      timestamp: new Date(),
      scanned: 0,
      opportunities: [],
      watchlist: [],
      signals: [],
      errors: []
    };

    try {
      const allSymbols = this.getAllSymbols();
      
      // Scan in batches
      for (let i = 0; i < allSymbols.length; i += this.settings.maxConcurrent) {
        const batch = allSymbols.slice(i, i + this.settings.maxConcurrent);
        const batchResults = await Promise.all(
          batch.map(symbol => this.scanSymbol(symbol))
        );
        
        batchResults.forEach(result => {
          results.scanned++;
          
          if (result.error) {
            results.errors.push({ symbol: result.symbol, error: result.error });
            return;
          }

          // Categorize by score
          if (result.score >= this.settings.signalThreshold) {
            results.opportunities.push(result);
          } else if (result.score >= this.settings.minScore) {
            results.watchlist.push(result);
          }
        });
      }

      // Sort by score
      results.opportunities.sort((a, b) => b.score - a.score);
      results.watchlist.sort((a, b) => b.score - a.score);

      // Update state
      this.lastScan = results.timestamp;
      this.scanResults = results;
      this.opportunities = results.opportunities;
      this.watchlist = results.watchlist;

      results.duration = Date.now() - startTime;
      
      console.log(`Scan complete: ${results.scanned} symbols, ${results.opportunities.length} opportunities, ${results.watchlist.length} watchlist`);

    } catch (error) {
      results.error = error.message;
      console.error('Scan error:', error);
    }

    return results;
  }

  /**
   * Scan a single symbol
   */
  async scanSymbol(symbol) {
    const result = {
      symbol,
      timestamp: new Date(),
      score: 0,
      direction: 'NEUTRAL',
      category: this.getSymbolCategory(symbol),
      analysis: null,
      reason: null
    };

    try {
      // Get price data
      const priceData = await this.priceDataProvider(symbol);
      
      if (!priceData) {
        result.error = 'No price data available';
        return result;
      }

      // Quick analysis
      const primaryTF = priceData['H4'] || priceData['H1'];
      if (!primaryTF || primaryTF.length < 100) {
        result.error = 'Insufficient price data';
        return result;
      }

      // Run quick confluence check
      const quickCheck = await this.signalEngine.confluenceDetector.quickCheck({
        technical: await this.signalEngine.technicalAnalyzer.analyze(primaryTF, 'H4'),
        smartMoney: await this.signalEngine.smartMoneyAnalyzer.analyze(primaryTF),
        multiTimeframe: await this.signalEngine.multiTimeframeAnalyzer.analyze(priceData)
      });

      result.score = quickCheck.score;
      result.direction = quickCheck.direction;
      result.potential = quickCheck.potential;

      // Get current price info
      const currentCandle = primaryTF[primaryTF.length - 1];
      result.currentPrice = currentCandle.close;
      result.change24h = this.calculate24hChange(primaryTF);

      // Generate reason
      result.reason = this.generateReason(result, quickCheck);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }


  /**
   * Get all symbols
   */
  getAllSymbols() {
    return [
      ...this.symbols.forex,
      ...this.symbols.metals,
      ...this.symbols.indices
    ];
  }

  /**
   * Get symbol category
   */
  getSymbolCategory(symbol) {
    if (this.symbols.forex.includes(symbol)) return 'forex';
    if (this.symbols.metals.includes(symbol)) return 'metals';
    if (this.symbols.indices.includes(symbol)) return 'indices';
    return 'other';
  }

  /**
   * Calculate 24h change
   */
  calculate24hChange(candles) {
    if (candles.length < 6) return 0; // Assuming H4 candles, 6 = 24h
    
    const current = candles[candles.length - 1].close;
    const previous = candles[candles.length - 6].close;
    
    return ((current - previous) / previous) * 100;
  }

  /**
   * Generate reason for opportunity
   */
  generateReason(result, quickCheck) {
    const reasons = {
      en: [],
      ar: []
    };

    if (result.score >= 70) {
      reasons.en.push(`High confluence score (${result.score}%)`);
      reasons.ar.push(`درجة توافق عالية (${result.score}%)`);
    } else if (result.score >= 60) {
      reasons.en.push(`Moderate confluence score (${result.score}%)`);
      reasons.ar.push(`درجة توافق متوسطة (${result.score}%)`);
    }

    if (result.direction === 'BULLISH') {
      reasons.en.push('Bullish setup forming');
      reasons.ar.push('إعداد صاعد قيد التشكل');
    } else if (result.direction === 'BEARISH') {
      reasons.en.push('Bearish setup forming');
      reasons.ar.push('إعداد هابط قيد التشكل');
    }

    return {
      en: reasons.en.join(' - '),
      ar: reasons.ar.join(' - ')
    };
  }

  /**
   * Get opportunities by category
   */
  getOpportunitiesByCategory(category = null) {
    if (!category) return this.opportunities;
    return this.opportunities.filter(o => o.category === category);
  }

  /**
   * Get watchlist by category
   */
  getWatchlistByCategory(category = null) {
    if (!category) return this.watchlist;
    return this.watchlist.filter(w => w.category === category);
  }

  /**
   * Get heat map data
   */
  getHeatMap() {
    const heatMap = {
      forex: {},
      metals: {},
      indices: {}
    };

    // Process all scan results
    [...this.opportunities, ...this.watchlist].forEach(result => {
      const category = result.category;
      heatMap[category][result.symbol] = {
        score: result.score,
        direction: result.direction,
        change24h: result.change24h,
        color: this.getHeatColor(result.score, result.direction)
      };
    });

    return heatMap;
  }

  /**
   * Get heat color based on score and direction
   */
  getHeatColor(score, direction) {
    if (score < 50) return 'neutral';
    
    if (direction === 'BULLISH') {
      if (score >= 80) return 'strong-bullish';
      if (score >= 70) return 'bullish';
      return 'weak-bullish';
    } else if (direction === 'BEARISH') {
      if (score >= 80) return 'strong-bearish';
      if (score >= 70) return 'bearish';
      return 'weak-bearish';
    }
    
    return 'neutral';
  }

  /**
   * Get scanner status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastScan: this.lastScan,
      nextScan: this.lastScan 
        ? new Date(this.lastScan.getTime() + this.settings.scanInterval)
        : null,
      totalSymbols: this.getAllSymbols().length,
      opportunities: this.opportunities.length,
      watchlist: this.watchlist.length,
      settings: this.settings
    };
  }

  /**
   * Get top opportunities
   */
  getTopOpportunities(limit = 5) {
    return this.opportunities.slice(0, limit).map(o => ({
      symbol: o.symbol,
      score: o.score,
      direction: o.direction,
      category: o.category,
      currentPrice: o.currentPrice,
      change24h: o.change24h,
      reason: o.reason
    }));
  }

  /**
   * Check if symbol has opportunity
   */
  hasOpportunity(symbol) {
    return this.opportunities.some(o => o.symbol === symbol);
  }

  /**
   * Get symbol analysis
   */
  getSymbolAnalysis(symbol) {
    const opportunity = this.opportunities.find(o => o.symbol === symbol);
    if (opportunity) return { type: 'opportunity', ...opportunity };

    const watchlistItem = this.watchlist.find(w => w.symbol === symbol);
    if (watchlistItem) return { type: 'watchlist', ...watchlistItem };

    return null;
  }

  /**
   * Force scan specific symbols
   */
  async scanSpecificSymbols(symbols) {
    const results = [];
    
    for (const symbol of symbols) {
      const result = await this.scanSymbol(symbol);
      results.push(result);
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const summary = {
      lastScan: this.lastScan,
      totalScanned: this.scanResults?.scanned || 0,
      byCategory: {
        forex: { opportunities: 0, watchlist: 0 },
        metals: { opportunities: 0, watchlist: 0 },
        indices: { opportunities: 0, watchlist: 0 }
      },
      topBullish: [],
      topBearish: [],
      averageScore: 0
    };

    // Count by category
    this.opportunities.forEach(o => {
      summary.byCategory[o.category].opportunities++;
    });
    this.watchlist.forEach(w => {
      summary.byCategory[w.category].watchlist++;
    });

    // Top bullish/bearish
    const bullish = this.opportunities.filter(o => o.direction === 'BULLISH');
    const bearish = this.opportunities.filter(o => o.direction === 'BEARISH');
    
    summary.topBullish = bullish.slice(0, 3).map(o => o.symbol);
    summary.topBearish = bearish.slice(0, 3).map(o => o.symbol);

    // Average score
    const allScores = [...this.opportunities, ...this.watchlist].map(o => o.score);
    summary.averageScore = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    return summary;
  }
}

export default MarketScanner;
