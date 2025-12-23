/**
 * IES Engine - المحرك الرئيسي لنظام التوصيات المؤسسي
 * Institutional Edge System Main Engine
 * 
 * Features:
 * - 10 analysis methodologies
 * - Multi-layer validation
 * - AI-powered predictions
 * - Caching for performance
 * - Comprehensive error handling
 */

import { MarketDataProvider } from '../data/marketDataProvider';
import { TechnicalAnalyzer } from '../analyzers/technicalAnalyzer';
import { SMCAnalyzer } from '../analyzers/smcAnalyzer';
import { WyckoffAnalyzer } from '../analyzers/wyckoffAnalyzer';
import { ElliottWaveAnalyzer } from '../analyzers/elliottWaveAnalyzer';
import { VSAAnalyzer } from '../analyzers/vsaAnalyzer';
import { MarketProfileAnalyzer } from '../analyzers/marketProfileAnalyzer';
import { OrderFlowAnalyzer } from '../analyzers/orderFlowAnalyzer';
import { IntermarketAnalyzer } from '../analyzers/intermarketAnalyzer';
import { FundamentalAnalyzer } from '../analyzers/fundamentalAnalyzer';
import { SentimentAnalyzer } from '../analyzers/sentimentAnalyzer';
import { AIEnsemble } from '../ai/aiEnsemble';
import { MultiLayerValidator } from '../validation/multiLayerValidator';
import { ConfluenceCalculator } from './confluenceCalculator';
import { SignalGenerator } from './signalGenerator';
import { RiskManager } from '../risk/riskManager';
import { KillZoneManager } from './killZoneManager';
import { 
  CacheManager, 
  CacheKeys, 
  CacheTTL 
} from '../utils/cache';
import { getLogger } from '../utils/logger';
import { 
  withRetry, 
  safeExecute, 
  withTimeout,
  AnalysisError,
  DataFetchError 
} from '../utils/errorHandler';

export class IESEngine {
  constructor(config = {}) {
    this.config = {
      minConfluenceScore: 80,
      minAIConfidence: 70,
      minValidationLayers: 8,
      enableCaching: true,
      analysisTimeout: 60000, // 60 seconds
      ...config,
    };

    // Initialize utilities
    this.logger = getLogger();
    this.cache = new CacheManager({
      maxSize: 500,
      defaultTTL: CacheTTL.MEDIUM,
    });

    // Initialize components
    this.dataProvider = new MarketDataProvider(config.dataProviderConfig);
    
    // Analyzers
    this.technicalAnalyzer = new TechnicalAnalyzer();
    this.smcAnalyzer = new SMCAnalyzer();
    this.wyckoffAnalyzer = new WyckoffAnalyzer();
    this.elliottAnalyzer = new ElliottWaveAnalyzer();
    this.vsaAnalyzer = new VSAAnalyzer();
    this.marketProfileAnalyzer = new MarketProfileAnalyzer();
    this.orderFlowAnalyzer = new OrderFlowAnalyzer();
    this.intermarketAnalyzer = new IntermarketAnalyzer();
    this.fundamentalAnalyzer = new FundamentalAnalyzer();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    
    // AI & Validation
    this.aiEnsemble = new AIEnsemble(config.aiConfig);
    this.validator = new MultiLayerValidator(this.config);
    
    // Signal Generation
    this.confluenceCalculator = new ConfluenceCalculator();
    this.signalGenerator = new SignalGenerator();
    this.riskManager = new RiskManager(config.riskConfig);
    this.killZoneManager = new KillZoneManager();
  }

  /**
   * Perform full analysis for a symbol
   * @param {string} symbol - Trading symbol (e.g., 'EURUSD')
   * @returns {Promise<Object>} Full analysis result
   */
  async analyze(symbol) {
    const timer = this.logger.startTimer(`analyze:${symbol}`);
    
    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.cache.get(CacheKeys.analysis(symbol));
        if (cached) {
          this.logger.debug(`Cache hit for ${symbol} analysis`);
          return cached;
        }
      }

      // 1. Fetch market data for multiple timeframes
      const marketData = await withRetry(
        () => withTimeout(
          () => this.dataProvider.getMultiTimeframe(symbol),
          this.config.analysisTimeout
        ),
        { maxRetries: 2, baseDelay: 1000 }
      );
      
      // 2. Run all analyzers in parallel with error handling
      const analysisResults = await Promise.allSettled([
        safeExecute(() => this.technicalAnalyzer.analyze(marketData), { error: 'Technical analysis failed' }),
        safeExecute(() => this.smcAnalyzer.analyze(marketData), { error: 'SMC analysis failed' }),
        safeExecute(() => this.wyckoffAnalyzer.analyze(marketData), { error: 'Wyckoff analysis failed' }),
        safeExecute(() => this.elliottAnalyzer.analyze(marketData), { error: 'Elliott analysis failed' }),
        safeExecute(() => this.vsaAnalyzer.analyze(marketData), { error: 'VSA analysis failed' }),
        safeExecute(() => this.marketProfileAnalyzer.analyze(marketData), { error: 'Market Profile analysis failed' }),
        safeExecute(() => this.orderFlowAnalyzer.analyze(marketData), { error: 'Order Flow analysis failed' }),
        safeExecute(() => this.intermarketAnalyzer.analyze(symbol, marketData), { error: 'Intermarket analysis failed' }),
        safeExecute(() => this.fundamentalAnalyzer.analyze(symbol), { error: 'Fundamental analysis failed' }),
        safeExecute(() => this.sentimentAnalyzer.analyze(symbol), { error: 'Sentiment analysis failed' }),
      ]);

      // Extract results
      const [
        technicalAnalysis,
        smcAnalysis,
        wyckoffAnalysis,
        elliottAnalysis,
        vsaAnalysis,
        marketProfileAnalysis,
        orderFlowAnalysis,
        intermarketAnalysis,
        fundamentalAnalysis,
        sentimentAnalysis,
      ] = analysisResults.map(r => r.status === 'fulfilled' ? r.value : r.reason);

      // 3. Get AI analysis
      const aiAnalysis = await safeExecute(
        () => this.aiEnsemble.analyze({
          symbol,
          marketData,
          technical: technicalAnalysis,
          smc: smcAnalysis,
          wyckoff: wyckoffAnalysis,
          elliott: elliottAnalysis,
          vsa: vsaAnalysis,
          marketProfile: marketProfileAnalysis,
          orderFlow: orderFlowAnalysis,
          intermarket: intermarketAnalysis,
          fundamental: fundamentalAnalysis,
          sentiment: sentimentAnalysis,
        }),
        { confidence: 50, direction: 'NEUTRAL', error: 'AI analysis failed' }
      );

      // 4. Compile full analysis
      const fullAnalysis = {
        symbol,
        timestamp: Date.now(),
        marketData,
        analysis: {
          technical: technicalAnalysis,
          smc: smcAnalysis,
          wyckoff: wyckoffAnalysis,
          elliott: elliottAnalysis,
          vsa: vsaAnalysis,
          marketProfile: marketProfileAnalysis,
          orderFlow: orderFlowAnalysis,
          intermarket: intermarketAnalysis,
          fundamental: fundamentalAnalysis,
          sentiment: sentimentAnalysis,
          ai: aiAnalysis,
        },
        killZone: this.killZoneManager.getCurrentKillZone(),
      };

      // 5. Validate through 10 layers
      const validation = this.validator.validate(fullAnalysis);

      // 6. Calculate confluence score
      const confluence = this.confluenceCalculator.calculate(fullAnalysis);

      // 7. Apply kill zone penalty if outside trading hours
      if (!fullAnalysis.killZone.isActive) {
        confluence.score = Math.max(0, confluence.score - 15);
        confluence.killZonePenalty = true;
      }

      const result = {
        ...fullAnalysis,
        validation,
        confluence,
      };

      // Cache the result
      if (this.config.enableCaching) {
        this.cache.set(CacheKeys.analysis(symbol), result, CacheTTL.SHORT);
      }

      this.logger.endTimer(timer, { symbol, confluenceScore: confluence.score });
      return result;
    } catch (error) {
      this.logger.error(`Analysis failed for ${symbol}`, { error: error.message });
      throw new AnalysisError(`Analysis failed for ${symbol}: ${error.message}`, 'IESEngine');
    }
  }

  /**
   * Generate trading signal if conditions are met
   * @param {string} symbol - Trading symbol
   * @returns {Promise<Object|null>} Signal or null if conditions not met
   */
  async generateSignal(symbol) {
    const timer = this.logger.startTimer(`generateSignal:${symbol}`);
    
    try {
      const analysis = await this.analyze(symbol);
      
      // Check if signal should be generated
      if (!this.shouldGenerateSignal(analysis)) {
        const reason = this.getRejectReason(analysis);
        this.logger.info(`Signal rejected for ${symbol}`, { reason });
        
        return {
          signal: null,
          analysis,
          reason,
        };
      }

      // Generate signal with risk management
      const signal = this.signalGenerator.generate(analysis);
      const riskAdjustedSignal = this.riskManager.adjustSignal(signal, analysis);

      this.logger.info(`Signal generated for ${symbol}`, {
        direction: riskAdjustedSignal.direction,
        confluenceScore: analysis.confluence.score,
      });

      this.logger.endTimer(timer, { symbol, signalGenerated: true });

      return {
        signal: riskAdjustedSignal,
        analysis,
      };
    } catch (error) {
      this.logger.error(`Signal generation failed for ${symbol}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Check if signal should be generated based on validation
   */
  shouldGenerateSignal(analysis) {
    const { validation, confluence } = analysis;
    const { ai } = analysis.analysis;

    // Check minimum confluence score
    if (confluence.score < this.config.minConfluenceScore) {
      return false;
    }

    // Check AI confidence
    if (ai.confidence < this.config.minAIConfidence) {
      return false;
    }

    // Check validation layers
    if (validation.passedLayers < this.config.minValidationLayers) {
      return false;
    }

    // Check critical layers (1, 2, 3, 10)
    if (validation.criticalLayersFailed.length > 0) {
      return false;
    }

    // Check for high-impact news
    if (analysis.analysis.fundamental.newsBlackout) {
      return false;
    }

    return true;
  }

  /**
   * Get reason why signal was rejected
   */
  getRejectReason(analysis) {
    const { validation, confluence } = analysis;
    const { ai, fundamental } = analysis.analysis;

    if (confluence.score < this.config.minConfluenceScore) {
      return `Confluence score too low: ${confluence.score} (minimum: ${this.config.minConfluenceScore})`;
    }

    if (ai.confidence < this.config.minAIConfidence) {
      return `AI confidence too low: ${ai.confidence}% (minimum: ${this.config.minAIConfidence}%)`;
    }

    if (validation.passedLayers < this.config.minValidationLayers) {
      return `Not enough validation layers passed: ${validation.passedLayers}/10 (minimum: ${this.config.minValidationLayers})`;
    }

    if (validation.criticalLayersFailed.length > 0) {
      return `Critical layers failed: ${validation.criticalLayersFailed.join(', ')}`;
    }

    if (fundamental.newsBlackout) {
      return `News blackout period: ${fundamental.upcomingNews?.event}`;
    }

    return 'Unknown reason';
  }

  /**
   * Get supported instruments
   */
  getSupportedInstruments() {
    return this.dataProvider.getSupportedInstruments();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.logger.getMetrics();
  }

  /**
   * Clear analysis cache
   */
  clearCache(symbol = null) {
    if (symbol) {
      this.cache.delete(CacheKeys.analysis(symbol));
      this.cache.delete(CacheKeys.signal(symbol));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Destroy engine and cleanup resources
   */
  destroy() {
    this.cache.destroy();
  }
}

export default IESEngine;
