/**
 * Institutional Edge System (IES)
 * نظام توصيات التداول المؤسسي المتقدم
 * 
 * Main entry point for the trading system
 */

// Core exports
export { IESEngine } from './core/iesEngine';
export { SignalGenerator } from './core/signalGenerator';
export { ConfluenceCalculator } from './core/confluenceCalculator';
export { KillZoneManager } from './core/killZoneManager';

// Data exports
export { MarketDataProvider } from './data/marketDataProvider';

// Analyzer exports
export { TechnicalAnalyzer } from './analyzers/technicalAnalyzer';
export { SMCAnalyzer } from './analyzers/smcAnalyzer';
export { WyckoffAnalyzer } from './analyzers/wyckoffAnalyzer';
export { ElliottWaveAnalyzer } from './analyzers/elliottWaveAnalyzer';
export { VSAAnalyzer } from './analyzers/vsaAnalyzer';
export { MarketProfileAnalyzer } from './analyzers/marketProfileAnalyzer';
export { OrderFlowAnalyzer } from './analyzers/orderFlowAnalyzer';
export { IntermarketAnalyzer } from './analyzers/intermarketAnalyzer';
export { FundamentalAnalyzer } from './analyzers/fundamentalAnalyzer';
export { SentimentAnalyzer } from './analyzers/sentimentAnalyzer';

// AI exports
export { AIEnsemble } from './ai/aiEnsemble';

// Validation exports
export { MultiLayerValidator } from './validation/multiLayerValidator';

// Risk exports
export { RiskManager } from './risk/riskManager';

// Backtesting exports
export { Backtester } from './backtesting/backtester';

// Utility exports
export { 
  CacheManager, 
  getGlobalCache, 
  CacheKeys, 
  CacheTTL 
} from './utils/cache';
export { 
  Logger, 
  getLogger, 
  LOG_LEVELS 
} from './utils/logger';
export {
  IESError,
  DataFetchError,
  AnalysisError,
  ValidationError,
  ConfigurationError,
  ErrorCodes,
  withRetry,
  CircuitBreaker,
  safeExecute,
  withTimeout,
  formatErrorResponse,
} from './utils/errorHandler';

// Constants
export const SUPPORTED_INSTRUMENTS = {
  forex: {
    major: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD'],
    minor: ['EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'GBPAUD', 'EURCAD'],
  },
  metals: ['XAUUSD', 'XAGUSD'],
  indices: ['US30', 'US500', 'US100', 'GER40', 'UK100'],
};

export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

export const CONFLUENCE_WEIGHTS = {
  smc: 0.20,
  structure: 0.15,
  wyckoff: 0.10,
  vsa: 0.10,
  orderFlow: 0.10,
  technical: 0.10,
  intermarket: 0.05,
  fundamental: 0.05,
  sentiment: 0.05,
  ai: 0.10,
};

export const QUALITY_THRESHOLDS = {
  minimum: 80,
  good: 80,
  strong: 85,
  excellent: 90,
  institutional: 95,
};

export const KILL_ZONES = {
  london: { start: 2, end: 5 }, // EST
  newYork: { start: 7, end: 10 }, // EST
  londonClose: { start: 10, end: 12 }, // EST
  asian: { start: 19, end: 2 }, // EST
};
