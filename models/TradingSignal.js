import mongoose from 'mongoose';

const TradingSignalSchema = new mongoose.Schema({
  // Basic Info
  symbol: { 
    type: String, 
    required: true, 
    index: true,
    enum: [
      // Forex
      'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY',
      // Metals
      'XAUUSD', 'XAGUSD',
      // Indices
      'US30', 'US500', 'US100', 'GER40'
    ]
  },
  category: {
    type: String,
    enum: ['forex', 'metals', 'indices'],
    required: true
  },
  direction: { 
    type: String, 
    enum: ['BUY', 'SELL'], 
    required: true 
  },
  grade: { 
    type: String, 
    enum: ['A_PLUS', 'A'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'CANCELLED', 'EXPIRED', 'CLOSED'],
    default: 'PENDING',
    index: true
  },

  // Price Levels
  entry: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  takeProfit1: { type: Number, required: true },
  takeProfit2: { type: Number, required: true },
  takeProfit3: { type: Number },
  currentPrice: { type: Number },
  
  // Entry optimization
  limitOrderPrice: { type: Number }, // Better entry if price retraces
  entryZone: {
    min: { type: Number },
    max: { type: Number }
  },
  entryTiming: {
    type: String,
    enum: ['IMMEDIATE', 'WAIT_PULLBACK', 'WAIT_BREAKOUT'],
    default: 'IMMEDIATE'
  },

  // Risk Management
  riskRewardRatio: { type: Number, required: true },
  suggestedLotSize: { type: Number },
  riskPercentage: { type: Number, default: 2 },
  riskAmount: { type: Number },
  potentialProfit: { type: Number },
  stopLossPips: { type: Number },
  takeProfitPips: { type: Number },

  // Confluence Analysis
  confluenceScore: { type: Number, required: true, min: 0, max: 100 },
  confluenceBreakdown: {
    technical: { type: Number, min: 0, max: 100 },
    priceAction: { type: Number, min: 0, max: 100 },
    multiTimeframe: { type: Number, min: 0, max: 100 },
    fundamental: { type: Number, min: 0, max: 100 },
    aiConfidence: { type: Number, min: 0, max: 100 }
  },

  // AI Analysis
  reasoning: {
    ar: { type: String, required: true },
    en: { type: String, required: true }
  },
  keyFactors: [{ type: String }],
  risks: [{ type: String }],
  invalidation: { 
    ar: { type: String },
    en: { type: String }
  },
  scenarios: [{
    condition: { type: String },
    outcome: { type: String }
  }],

  // Technical Analysis Details
  technicalAnalysis: {
    trend: {
      type: String,
      enum: ['STRONG_BULLISH', 'BULLISH', 'NEUTRAL', 'BEARISH', 'STRONG_BEARISH']
    },
    indicators: {
      rsi: { value: Number, signal: String },
      macd: { value: Number, signal: String, histogram: Number },
      stochastic: { k: Number, d: Number, signal: String },
      adx: { value: Number, trend: String },
      ema: {
        ema9: Number,
        ema21: Number,
        ema50: Number,
        ema100: Number,
        ema200: Number
      },
      atr: { value: Number, percentile: Number },
      bollinger: { upper: Number, middle: Number, lower: Number, squeeze: Boolean }
    },
    patterns: [{
      name: { type: String },
      type: { type: String, enum: ['candlestick', 'chart', 'harmonic'] },
      reliability: { type: Number, min: 1, max: 5 },
      timeframe: { type: String }
    }],
    levels: {
      support: [{ price: Number, strength: String }],
      resistance: [{ price: Number, strength: String }],
      pivots: {
        daily: { pp: Number, r1: Number, r2: Number, r3: Number, s1: Number, s2: Number, s3: Number },
        weekly: { pp: Number, r1: Number, r2: Number, s1: Number, s2: Number }
      }
    },
    smartMoney: {
      orderBlocks: [{ price: Number, type: String, strength: String }],
      fairValueGaps: [{ high: Number, low: Number, filled: Boolean }],
      liquidityPools: [{ price: Number, type: String }],
      marketStructure: { type: String, enum: ['BULLISH', 'BEARISH', 'RANGING'] }
    }
  },

  // Fundamental Analysis Details
  fundamentalAnalysis: {
    bias: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
    score: { type: Number, min: 0, max: 100 },
    cotData: {
      commercialNet: { type: Number },
      nonCommercialNet: { type: Number },
      retailNet: { type: Number },
      weeklyChange: { type: Number },
      positioning: { type: String }
    },
    currencyStrength: {
      base: { currency: String, strength: Number },
      quote: { currency: String, strength: Number }
    },
    upcomingEvents: [{
      event: { type: String },
      currency: { type: String },
      impact: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
      time: { type: Date },
      forecast: { type: String },
      previous: { type: String }
    }],
    newsWarning: { type: Boolean, default: false }
  },

  // Sentiment Analysis
  sentimentAnalysis: {
    retailSentiment: { type: Number, min: -100, max: 100 },
    institutionalSentiment: { type: Number, min: -100, max: 100 },
    newsSentiment: { type: Number, min: -100, max: 100 },
    overallSentiment: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] }
  },

  // Session Info
  session: {
    current: { type: String, enum: ['ASIAN', 'LONDON', 'NEW_YORK', 'OVERLAP'] },
    isOptimalTime: { type: Boolean },
    lowLiquidityWarning: { type: Boolean, default: false }
  },

  // Intermarket Confirmation
  intermarketConfirmation: {
    confirmed: { type: Boolean },
    confirmingAssets: [{ symbol: String, direction: String, correlation: Number }],
    divergences: [{ symbol: String, description: String }]
  },

  // Historical Comparison
  historicalComparison: {
    similarSetups: { type: Number },
    historicalWinRate: { type: Number },
    averageReturn: { type: Number }
  },

  // Performance Tracking
  result: {
    outcome: { type: String, enum: ['WIN', 'LOSS', 'BREAKEVEN', 'PARTIAL', 'PENDING'] },
    pips: { type: Number },
    percentage: { type: Number },
    rMultiple: { type: Number },
    exitPrice: { type: Number },
    exitTime: { type: Date },
    exitReason: { type: String },
    holdingDuration: { type: Number }, // in minutes
    maxFavorableExcursion: { type: Number }, // max profit during trade
    maxAdverseExcursion: { type: Number } // max drawdown during trade
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  activatedAt: { type: Date },
  closedAt: { type: Date },
  expiresAt: { type: Date },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
TradingSignalSchema.index({ status: 1, createdAt: -1 });
TradingSignalSchema.index({ symbol: 1, status: 1 });
TradingSignalSchema.index({ grade: 1, status: 1 });
TradingSignalSchema.index({ category: 1, status: 1 });
TradingSignalSchema.index({ 'result.outcome': 1, createdAt: -1 });

// Virtual for current P/L
TradingSignalSchema.virtual('currentPL').get(function() {
  if (!this.currentPrice || !this.entry) return 0;
  const diff = this.direction === 'BUY' 
    ? this.currentPrice - this.entry 
    : this.entry - this.currentPrice;
  
  // Convert to pips based on symbol
  const pipMultiplier = this.symbol.includes('JPY') ? 100 : 10000;
  return Math.round(diff * pipMultiplier * 10) / 10;
});

// Method to check if signal is still valid
TradingSignalSchema.methods.isValid = function() {
  if (this.status !== 'PENDING' && this.status !== 'ACTIVE') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Method to update status based on price
TradingSignalSchema.methods.updateStatus = function(currentPrice) {
  this.currentPrice = currentPrice;
  this.lastUpdated = new Date();

  if (this.status === 'ACTIVE') {
    if (this.direction === 'BUY') {
      if (currentPrice <= this.stopLoss) {
        this.status = 'SL_HIT';
        this.result = {
          outcome: 'LOSS',
          exitPrice: this.stopLoss,
          exitTime: new Date(),
          pips: -this.stopLossPips
        };
      } else if (currentPrice >= this.takeProfit3 && this.takeProfit3) {
        this.status = 'TP3_HIT';
        this.result = { outcome: 'WIN', exitPrice: this.takeProfit3, exitTime: new Date() };
      } else if (currentPrice >= this.takeProfit2) {
        this.status = 'TP2_HIT';
      } else if (currentPrice >= this.takeProfit1) {
        this.status = 'TP1_HIT';
      }
    } else { // SELL
      if (currentPrice >= this.stopLoss) {
        this.status = 'SL_HIT';
        this.result = {
          outcome: 'LOSS',
          exitPrice: this.stopLoss,
          exitTime: new Date(),
          pips: -this.stopLossPips
        };
      } else if (currentPrice <= this.takeProfit3 && this.takeProfit3) {
        this.status = 'TP3_HIT';
        this.result = { outcome: 'WIN', exitPrice: this.takeProfit3, exitTime: new Date() };
      } else if (currentPrice <= this.takeProfit2) {
        this.status = 'TP2_HIT';
      } else if (currentPrice <= this.takeProfit1) {
        this.status = 'TP1_HIT';
      }
    }
  }

  return this;
};

// Static method to get active signals
TradingSignalSchema.statics.getActiveSignals = function() {
  return this.find({ 
    status: { $in: ['PENDING', 'ACTIVE', 'TP1_HIT', 'TP2_HIT'] }
  }).sort({ createdAt: -1 });
};

// Static method to get performance stats
TradingSignalSchema.statics.getPerformanceStats = async function(period = 'all') {
  const dateFilter = {};
  const now = new Date();
  
  if (period === 'daily') {
    dateFilter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
  } else if (period === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter.createdAt = { $gte: weekAgo };
  } else if (period === 'monthly') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter.createdAt = { $gte: monthAgo };
  }

  const signals = await this.find({
    ...dateFilter,
    'result.outcome': { $exists: true, $ne: 'PENDING' }
  });

  const wins = signals.filter(s => s.result?.outcome === 'WIN').length;
  const losses = signals.filter(s => s.result?.outcome === 'LOSS').length;
  const total = wins + losses;

  const totalPips = signals.reduce((sum, s) => sum + (s.result?.pips || 0), 0);
  const avgWin = wins > 0 ? signals.filter(s => s.result?.outcome === 'WIN').reduce((sum, s) => sum + (s.result?.pips || 0), 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(signals.filter(s => s.result?.outcome === 'LOSS').reduce((sum, s) => sum + (s.result?.pips || 0), 0) / losses) : 0;

  return {
    totalSignals: total,
    wins,
    losses,
    winRate: total > 0 ? (wins / total) * 100 : 0,
    totalPips,
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor: avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : 0,
    expectancy: total > 0 ? totalPips / total : 0
  };
};

export default mongoose.models.TradingSignal || mongoose.model('TradingSignal', TradingSignalSchema);
