/**
 * SignalEngine - Main Trading Signal Generation Engine
 * Orchestrates all analyzers and generates final trading signals
 * Pipeline: Scan → Analyze → Confluence → AI → Risk → Signal
 */

import { TechnicalAnalyzer } from './TechnicalAnalyzer.js';
import { PatternDetector } from './PatternDetector.js';
import { SmartMoneyAnalyzer } from './SmartMoneyAnalyzer.js';
import { MultiTimeframeAnalyzer } from './MultiTimeframeAnalyzer.js';
import { ConfluenceDetector } from './ConfluenceDetector.js';
import { RiskManager } from './RiskManager.js';
import { AIPredictor } from './AIPredictor.js';
import { FundamentalAnalyzer } from './FundamentalAnalyzer.js';
import { SentimentAnalyzer } from './SentimentAnalyzer.js';
import { VolumeAnalyzer } from './VolumeAnalyzer.js';

export class SignalEngine {
  constructor(settings = {}) {
    this.technicalAnalyzer = new TechnicalAnalyzer();
    this.patternDetector = new PatternDetector();
    this.smartMoneyAnalyzer = new SmartMoneyAnalyzer();
    this.multiTimeframeAnalyzer = new MultiTimeframeAnalyzer();
    this.confluenceDetector = new ConfluenceDetector();
    this.riskManager = new RiskManager(settings.risk);
    this.aiPredictor = new AIPredictor();
    this.fundamentalAnalyzer = new FundamentalAnalyzer();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.volumeAnalyzer = new VolumeAnalyzer();

    this.settings = {
      minConfluence: 70,
      minRiskReward: 2,
      scanInterval: 5 * 60 * 1000, // 5 minutes
      ...settings
    };

    // Supported symbols
    this.symbols = {
      forex: [
        'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
        'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURNZD', 'GBPAUD'
      ],
      metals: ['XAUUSD', 'XAGUSD'],
      indices: ['US30', 'US100', 'US500', 'GER40', 'UK100']
    };
  }

  /**
   * Generate signal for a single symbol
   */
  async generateSignal(symbol, priceDataByTimeframe) {
    const startTime = Date.now();
    
    const result = {
      symbol,
      timestamp: new Date(),
      status: 'PROCESSING',
      signal: null,
      analysis: {},
      confluence: null,
      aiPrediction: null,
      risk: null,
      processingTime: 0
    };

    try {
      // Step 1: Technical Analysis (H4 as primary)
      const primaryTF = priceDataByTimeframe['H4'] || priceDataByTimeframe['H1'];
      if (!primaryTF || primaryTF.length < 200) {
        result.status = 'ERROR';
        result.error = 'Insufficient price data';
        return result;
      }

      result.analysis.technical = await this.technicalAnalyzer.analyze(primaryTF, 'H4');

      // Step 2: Pattern Detection
      result.analysis.patterns = await this.patternDetector.analyze(primaryTF);

      // Step 3: Smart Money Analysis
      result.analysis.smartMoney = await this.smartMoneyAnalyzer.analyze(primaryTF);

      // Step 4: Multi-Timeframe Analysis
      result.analysis.multiTimeframe = await this.multiTimeframeAnalyzer.analyze(priceDataByTimeframe);

      // Step 4.5: Fundamental Analysis
      result.analysis.fundamental = await this.fundamentalAnalyzer.analyze(symbol);

      // Step 4.6: Sentiment Analysis
      result.analysis.sentiment = await this.sentimentAnalyzer.analyze(symbol);

      // Step 4.7: Volume Analysis
      result.analysis.volume = this.volumeAnalyzer.analyze(primaryTF);

      // Step 5: Calculate Confluence
      result.confluence = this.confluenceDetector.calculate({
        technical: result.analysis.technical,
        patterns: result.analysis.patterns,
        smartMoney: result.analysis.smartMoney,
        multiTimeframe: result.analysis.multiTimeframe,
        fundamental: result.analysis.fundamental,
        sentiment: result.analysis.sentiment,
        volume: result.analysis.volume
      });

      // Step 6: Check if confluence meets threshold
      if (result.confluence.totalScore < this.settings.minConfluence) {
        result.status = 'NO_SIGNAL';
        result.reason = {
          en: `Confluence score (${result.confluence.totalScore}%) below threshold (${this.settings.minConfluence}%)`,
          ar: `درجة التوافق (${result.confluence.totalScore}%) أقل من الحد الأدنى (${this.settings.minConfluence}%)`
        };
        result.processingTime = Date.now() - startTime;
        return result;
      }

      // Step 7: AI Prediction
      const currentPrice = primaryTF[primaryTF.length - 1].close;
      result.aiPrediction = await this.aiPredictor.generateSignal({
        symbol,
        currentPrice,
        technical: result.analysis.technical,
        patterns: result.analysis.patterns,
        smartMoney: result.analysis.smartMoney,
        multiTimeframe: result.analysis.multiTimeframe,
        confluence: result.confluence
      });

      if (!result.aiPrediction.success) {
        result.status = 'AI_ERROR';
        result.error = result.aiPrediction.error;
        result.processingTime = Date.now() - startTime;
        return result;
      }

      const aiSignal = result.aiPrediction.signal;

      // Step 8: Validate AI Signal
      const validation = this.aiPredictor.validateSignal(aiSignal, result.confluence.totalScore);
      if (!validation.valid) {
        result.status = 'INVALID_SIGNAL';
        result.validationErrors = validation.errors;
        result.processingTime = Date.now() - startTime;
        return result;
      }

      // Step 9: Risk Management
      if (aiSignal.recommendation !== 'NO_TRADE') {
        result.risk = this.calculateRisk(symbol, aiSignal, currentPrice);
        
        // Validate trade
        const tradeValidation = this.riskManager.validateNewTrade({ symbol });
        if (!tradeValidation.allowed) {
          result.status = 'RISK_BLOCKED';
          result.riskErrors = tradeValidation.errors;
          result.processingTime = Date.now() - startTime;
          return result;
        }
      }

      // Step 10: Build Final Signal
      result.signal = this.buildFinalSignal(symbol, aiSignal, result);
      result.status = 'SUCCESS';
      result.processingTime = Date.now() - startTime;

      return result;

    } catch (error) {
      result.status = 'ERROR';
      result.error = error.message;
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }


  /**
   * Calculate risk parameters for signal
   */
  calculateRisk(symbol, aiSignal, currentPrice) {
    const direction = aiSignal.recommendation;
    
    // Calculate position size
    const positionSize = this.riskManager.calculatePositionSize({
      symbol,
      entryPrice: aiSignal.entry.price || currentPrice,
      stopLoss: aiSignal.stopLoss
    });

    // Validate R:R
    const rrValidation = this.riskManager.validateRiskReward({
      entryPrice: aiSignal.entry.price || currentPrice,
      stopLoss: aiSignal.stopLoss,
      takeProfit1: aiSignal.takeProfit1,
      takeProfit2: aiSignal.takeProfit2,
      takeProfit3: aiSignal.takeProfit3,
      direction
    });

    // Calculate take profits if not provided
    let takeProfits = {
      tp1: aiSignal.takeProfit1,
      tp2: aiSignal.takeProfit2,
      tp3: aiSignal.takeProfit3
    };

    if (!takeProfits.tp1) {
      const calculated = this.riskManager.calculateTakeProfits({
        entryPrice: aiSignal.entry.price || currentPrice,
        stopLoss: aiSignal.stopLoss,
        direction,
        ratios: [2, 3, 5]
      });
      takeProfits = {
        tp1: calculated.tp1.price,
        tp2: calculated.tp2.price,
        tp3: calculated.tp3.price
      };
    }

    return {
      positionSize,
      riskReward: rrValidation,
      takeProfits,
      dailyDrawdown: this.riskManager.checkDailyDrawdown()
    };
  }

  /**
   * Build final signal object
   */
  buildFinalSignal(symbol, aiSignal, result) {
    const currentPrice = result.analysis.technical.price.current;
    
    return {
      // Basic Info
      symbol,
      direction: aiSignal.recommendation,
      grade: result.confluence.grade,
      confidence: aiSignal.confidence,
      confluenceScore: result.confluence.totalScore,

      // Entry
      entry: {
        price: aiSignal.entry.price || currentPrice,
        type: aiSignal.entry.type || 'MARKET'
      },

      // Levels
      stopLoss: aiSignal.stopLoss,
      takeProfit1: result.risk?.takeProfits?.tp1 || aiSignal.takeProfit1,
      takeProfit2: result.risk?.takeProfits?.tp2 || aiSignal.takeProfit2,
      takeProfit3: result.risk?.takeProfits?.tp3 || aiSignal.takeProfit3,

      // Risk
      riskRewardRatio: aiSignal.riskRewardRatio,
      recommendedLotSize: result.risk?.positionSize?.recommendedLots?.standard,
      riskAmount: result.risk?.positionSize?.riskAmount,
      slPips: result.risk?.positionSize?.slPips,

      // Analysis Summary
      technicalTrend: result.analysis.technical.trend,
      smcBias: result.analysis.smartMoney?.summary?.smcBias,
      mtfAlignment: result.analysis.multiTimeframe?.alignment?.aligned,
      
      // Patterns
      topPatterns: result.analysis.patterns?.summary?.topPatterns || [],
      
      // AI Analysis
      reasoning: aiSignal.reasoning,
      keyFactors: aiSignal.keyFactors,
      risks: aiSignal.risks,
      invalidation: aiSignal.invalidation,
      marketCondition: aiSignal.marketCondition,
      expectedTimeframe: aiSignal.timeframe,

      // Confluence Breakdown
      confluenceBreakdown: result.confluence.breakdown,
      confluenceReasons: result.confluence.reasons,
      confluenceWarnings: result.confluence.warnings,

      // Metadata
      timestamp: new Date(),
      status: 'ACTIVE',
      processingTime: result.processingTime
    };
  }

  /**
   * Scan all symbols for opportunities
   */
  async scanMarket(priceDataProvider) {
    const opportunities = [];
    const allSymbols = [
      ...this.symbols.forex,
      ...this.symbols.metals,
      ...this.symbols.indices
    ];

    for (const symbol of allSymbols) {
      try {
        // Get price data for all timeframes
        const priceData = await priceDataProvider(symbol);
        
        if (!priceData) continue;

        // Quick confluence check
        const technical = await this.technicalAnalyzer.analyze(priceData['H4'] || priceData['H1'], 'H4');
        const smartMoney = await this.smartMoneyAnalyzer.analyze(priceData['H4'] || priceData['H1']);
        const mtf = await this.multiTimeframeAnalyzer.analyze(priceData);

        const quickCheck = this.confluenceDetector.quickCheck({
          technical,
          smartMoney,
          multiTimeframe: mtf
        });

        if (quickCheck.potential) {
          opportunities.push({
            symbol,
            score: quickCheck.score,
            direction: quickCheck.direction,
            trend: technical.trend,
            smcBias: smartMoney?.summary?.smcBias
          });
        }
      } catch (error) {
        console.error(`Scan error for ${symbol}:`, error.message);
      }
    }

    // Sort by score
    return opportunities.sort((a, b) => b.score - a.score);
  }

  /**
   * Get watchlist of potential setups
   */
  async getWatchlist(priceDataProvider) {
    const opportunities = await this.scanMarket(priceDataProvider);
    
    return opportunities
      .filter(o => o.score >= 60 && o.score < 70)
      .map(o => ({
        symbol: o.symbol,
        score: o.score,
        direction: o.direction,
        reason: {
          en: `Potential ${o.direction.toLowerCase()} setup forming`,
          ar: `إعداد ${o.direction === 'BULLISH' ? 'صاعد' : 'هابط'} محتمل قيد التشكل`
        }
      }));
  }

  /**
   * Update signal status
   */
  updateSignalStatus(signal, currentPrice) {
    const updates = {
      currentPrice,
      lastUpdate: new Date()
    };

    // Calculate current P/L
    const direction = signal.direction;
    const entryPrice = signal.entry.price;
    
    if (direction === 'BUY') {
      updates.currentPips = (currentPrice - entryPrice) / this.riskManager.getPipSize(signal.symbol);
      updates.currentPnL = updates.currentPips * this.riskManager.getPipValue(signal.symbol) * (signal.recommendedLotSize || 0.01);
    } else {
      updates.currentPips = (entryPrice - currentPrice) / this.riskManager.getPipSize(signal.symbol);
      updates.currentPnL = updates.currentPips * this.riskManager.getPipValue(signal.symbol) * (signal.recommendedLotSize || 0.01);
    }

    // Check if targets hit
    if (direction === 'BUY') {
      if (currentPrice <= signal.stopLoss) {
        updates.status = 'STOPPED_OUT';
        updates.result = 'LOSS';
      } else if (currentPrice >= signal.takeProfit3) {
        updates.status = 'TP3_HIT';
        updates.result = 'WIN';
      } else if (currentPrice >= signal.takeProfit2) {
        updates.status = 'TP2_HIT';
        updates.result = 'WIN';
      } else if (currentPrice >= signal.takeProfit1) {
        updates.status = 'TP1_HIT';
        updates.result = 'PARTIAL_WIN';
      }
    } else {
      if (currentPrice >= signal.stopLoss) {
        updates.status = 'STOPPED_OUT';
        updates.result = 'LOSS';
      } else if (currentPrice <= signal.takeProfit3) {
        updates.status = 'TP3_HIT';
        updates.result = 'WIN';
      } else if (currentPrice <= signal.takeProfit2) {
        updates.status = 'TP2_HIT';
        updates.result = 'WIN';
      } else if (currentPrice <= signal.takeProfit1) {
        updates.status = 'TP1_HIT';
        updates.result = 'PARTIAL_WIN';
      }
    }

    return { ...signal, ...updates };
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      ready: true,
      settings: this.settings,
      supportedSymbols: this.symbols,
      riskSummary: this.riskManager.getRiskSummary()
    };
  }
}

export default SignalEngine;
