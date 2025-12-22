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
  stopLossPips: { type: Number },
  takeProfit1Pips: { type: Number },
  takeProfit2Pips: { type: Number },
  takeProfit3Pips: { type: Number },

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
      bollinger: {
        upper: Number,
        middle: Number,
        lower: Number,
        squeeze: Boolean
      },
      atr: { value: Number, percentile: Number },
      ichimoku: {
        tenkan: Number,
        kijun: Number,
        senkouA: Number,
        senkouB: Number,
        chikou: Number,
        signal: String
      }
    },
    patterns: [{
      name: { type: String },
      type: { type: String, enum: ['CANDLESTICK', 'CHART', 'HARMONIC'] },
      reliability: { type: Number, min: 1, max: 5 },
      direction: { type: String, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] }
    }],
    levels: {
      support: [{ price: Number, strength: Number }],
      resistance: [{ price: Number, strength: Number }],
      pivots: {
        daily: { pp: Number, r1: Number, r2: Number, r3: Number, s1: Number, s2: Number, s3: Number },
        weekly: { pp: Number, r1: Number, r2: Number, s1: Number, s2: Number }
      }
    },
    smartMoney: {
      orderBlocks: [{
        type: { type: String, enum: ['DEMAND', 'SUPPLY'] },
        price: Number,
        strength: Number,
        tested: Boolean
      }],
      fairValueGaps: [{
        type: { type: String, enum: ['BULLISH', 'BEARISH'] },
        high: Number,
        low: Number,
        filled: Boolean
      }],
      liquidityPools: [{
        type: { type: String, enum: ['BUY_SIDE', 'SELL_SIDE'] },
        price: Number
      }],
      structureBreaks: [{
        type: { type: String, enum: ['BOS', 'CHOCH'] },
        direction: { type: String, enum: ['BULLISH', 'BEARISH'] },
        price: Number
      }]
    },
    timeframeAnalysis: {
      M15: { trend: String, signal: String },
      H1: { trend: String, signal: String },
      H4: { trend: String, signal: String },
      D1: { trend: String, signal: String },
      W1: { trend: String, signal: String }
    }
  },

  // Fundamental Analysis Details
  fundamentalAnalysis: {
    bias: { 
      type: String, 
      enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] 
    },
    cotData: {
      commercialNet: Number,
      nonCommercialNet: Number,
      retailNet: Number,
      weeklyChange: Number,
      positioning: String
    },
    currencyStrength: {
      base: { currency: String, strength: Number },
      quote: { currency: String, strength: Number }
    },
    upcomingEvents: [{
      event: String,
      currency: String,
      impact: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
      time: Date,
      forecast: String,
      previous: String
    }],
    newsImpact: {
      sentiment: { type: String, enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] },
      score: Number
    }
  },

  // Sentiment Analysis
  sentimentAnalysis: {
    retailPositioning: {
      longPercent: Number,
      shortPercent: Number,
      signal: String
    },
    institutionalBias: String,
    socialSentiment: Number,
    fearGreedIndex: Number
  },

  // Intermarket Analysis
  intermarketAnalysis: {
    correlatedAssets: [{
      symbol: String,
      correlation: Number,
      currentTrend: String,
      confirms: Boolean
    }],
    dxyCorrelation: Number,
    yieldCorrelation: Number
  },

  // Session Info
  sessionInfo: {
    currentSession: { type: String, enum: ['ASIAN', 'LONDON', 'NEW_YORK', 'OVERLAP'] },
    isOptimalTime: Boolean,
    sessionVolatility: String
  },

  // Performance Tracking
  result: {
    outcome: { 
      type: String, 
      enum: ['WIN', 'LOSS', 'BREAKEVEN', 'PARTIAL_WIN', 'PARTIAL_LOSS'] 
    },
    pips: { type: Number },
    percentage: { type: Number },
    rMultiple: { type: Number }, // Result in terms of R (risk units)
    exitPrice: { type: Number },
    exitTime: { type: Date },
    holdingDuration: { type: Number }, // in minutes
    maxFavorableExcursion: { type: Number }, // Max profit during trade
    maxAdverseExcursion: { type: Number }, // Max drawdown during trade
    exitReason: { 
      type: String, 
      enum: ['TP1', 'TP2', 'TP3', 'SL', 'MANUAL', 'TRAILING_STOP', 'BREAKEVEN', 'EXPIRED'] 
    }
  },

  // Trade Management Updates
  updates: [{
    timestamp: { type: Date, default: Date.now },
    type: { 
      type: String, 
      enum: ['ENTRY', 'MOVE_SL', 'PARTIAL_CLOSE', 'TP_HIT', 'SL_HIT', 'UPDATE', 'CLOSE'] 
    },
    message: {
      ar: String,
      en: String
    },
    price: Number,
    newStopLoss: Number
  }],

  // Historical Comparison
  historicalComparison: {
    similarSetups: Number,
    historicalWinRate: Number,
    averageRMultiple: Number
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
TradingSignalSchema.index({ 'result.outcome': 1 });
TradingSignalSchema.index({ confluenceScore: -1 });

// Virtual for current P/L
TradingSignalSchema.virtual('currentPL').get(function() {
  if (!this.currentPrice || !this.entry) return 0;
  
  const pipMultiplier = this.symbol.includes('JPY') ? 100 : 10000;
  const pips = (this.currentPrice - this.entry) * pipMultiplier;
  
  return this.direction === 'BUY' ? pips : -pips;
});

// Virtual for time since creation
TradingSignalSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to check if signal is still valid
TradingSignalSchema.methods.isValid = function() {
  if (this.status !== 'PENDING' && this.status !== 'ACTIVE') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Method to calculate pips from entry
TradingSignalSchema.methods.calculatePips = function(price) {
  const pipMultiplier = this.symbol.includes('JPY') ? 100 : 10000;
  const pips = (price - this.entry) * pipMultiplier;
  return this.direction === 'BUY' ? pips : -pips;
};

// Static method to get active signals
TradingSignalSchema.statics.getActiveSignals = function() {
  return this.find({ 
    status: { $in: ['PENDING', 'ACTIVE', 'TP1_HIT', 'TP2_HIT'] } 
  }).sort({ createdAt: -1 });
};

// Static method to get signals by performance
TradingSignalSchema.statics.getPerformanceStats = async function(period = 'all') {
  const dateFilter = {};
  const now = new Date();
  
  switch(period) {
    case 'daily':
      dateFilter.createdAt = { $gte: new Date(now.setHours(0,0,0,0)) };
      break;
    case 'weekly':
      dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      break;
    case 'monthly':
      dateFilter.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
      break;
  }

  const signals = await this.find({
    ...dateFilter,
    'result.outcome': { $exists: true }
  });

  const wins = signals.filter(s => s.result.outcome === 'WIN' || s.result.outcome === 'PARTIAL_WIN').length;
  const losses = signals.filter(s => s.result.outcome === 'LOSS' || s.result.outcome === 'PARTIAL_LOSS').length;
  const totalPips = signals.reduce((sum, s) => sum + (s.result.pips || 0), 0);
  
  return {
    total: signals.length,
    wins,
    losses,
    breakeven: signals.filter(s => s.result.outcome === 'BREAKEVEN').length,
    winRate: signals.length > 0 ? (wins / signals.length) * 100 : 0,
    totalPips,
    averagePips: signals.length > 0 ? totalPips / signals.length : 0
  };
};

export default mongoose.models.TradingSignal || mongoose.model('TradingSignal', TradingSignalSchema);
