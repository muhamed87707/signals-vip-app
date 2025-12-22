import mongoose from 'mongoose';

const TradingSettingsSchema = new mongoose.Schema({
  // User identification (for future multi-user support)
  userId: { 
    type: String, 
    default: 'default',
    unique: true,
    index: true
  },
  
  // Account Settings
  account: {
    balance: { type: Number, default: 10000 },
    currency: { type: String, default: 'USD' },
    leverage: { type: Number, default: 100 },
    broker: { type: String }
  },
  
  // Risk Management Settings
  risk: {
    maxRiskPerTrade: { type: Number, default: 2, min: 0.5, max: 5 }, // percentage
    maxDailyDrawdown: { type: Number, default: 3, min: 1, max: 10 }, // percentage
    maxWeeklyDrawdown: { type: Number, default: 6, min: 2, max: 15 }, // percentage
    maxOpenTrades: { type: Number, default: 5, min: 1, max: 10 },
    maxCorrelatedTrades: { type: Number, default: 2, min: 1, max: 5 },
    minRiskReward: { type: Number, default: 2, min: 1.5, max: 5 },
    useVolatilityAdjustment: { type: Boolean, default: true },
    pauseOnDrawdownExceeded: { type: Boolean, default: true }
  },
  
  // Signal Preferences
  signals: {
    minConfluenceScore: { type: Number, default: 70, min: 60, max: 90 },
    acceptedGrades: { 
      type: [String], 
      default: ['A_PLUS', 'A'],
      enum: ['A_PLUS', 'A']
    },
    preferredAssets: {
      forex: { type: Boolean, default: true },
      metals: { type: Boolean, default: true },
      indices: { type: Boolean, default: true }
    },
    specificAssets: [{ type: String }], // Empty = all assets
    excludedAssets: [{ type: String }],
    preferredSessions: {
      asian: { type: Boolean, default: true },
      london: { type: Boolean, default: true },
      newYork: { type: Boolean, default: true },
      overlap: { type: Boolean, default: true }
    },
    avoidNewsEvents: { type: Boolean, default: true },
    newsAvoidanceMinutes: { type: Number, default: 30 }
  },
  
  // Entry Preferences
  entry: {
    preferLimitOrders: { type: Boolean, default: false },
    waitForPullback: { type: Boolean, default: false },
    maxSlippagePips: { type: Number, default: 3 }
  },
  
  // Exit Preferences
  exit: {
    useTrailingStop: { type: Boolean, default: true },
    trailingStopType: { 
      type: String, 
      default: 'ATR',
      enum: ['ATR', 'PERCENTAGE', 'STRUCTURE', 'FIXED']
    },
    trailingStopValue: { type: Number, default: 1.5 }, // ATR multiplier or percentage
    moveToBreakevenAt: { type: Number, default: 1 }, // R-multiple
    partialProfitAt: { type: Number, default: 1 }, // R-multiple
    partialProfitPercent: { type: Number, default: 50 }, // percentage to close
    autoCloseAtTP2: { type: Boolean, default: false }
  },
  
  // Notification Settings
  notifications: {
    enableSound: { type: Boolean, default: true },
    enableBrowser: { type: Boolean, default: true },
    soundVolume: { type: Number, default: 0.7, min: 0, max: 1 },
    notifyOnNewSignal: { type: Boolean, default: true },
    notifyOnTPHit: { type: Boolean, default: true },
    notifyOnSLHit: { type: Boolean, default: true },
    notifyOnSignalUpdate: { type: Boolean, default: true },
    notifyOnHighImpactNews: { type: Boolean, default: true }
  },
  
  // Display Settings
  display: {
    language: { type: String, default: 'ar', enum: ['ar', 'en'] },
    theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
    showConfluenceBreakdown: { type: Boolean, default: true },
    showAIReasoning: { type: Boolean, default: true },
    showTechnicalDetails: { type: Boolean, default: true },
    showFundamentalDetails: { type: Boolean, default: true },
    chartTimeframe: { type: String, default: 'H4' },
    compactMode: { type: Boolean, default: false }
  },
  
  // Auto-Trading Settings (for future implementation)
  autoTrading: {
    enabled: { type: Boolean, default: false },
    onlyAPlusSignals: { type: Boolean, default: true },
    requireManualConfirmation: { type: Boolean, default: true },
    maxAutoTradesPerDay: { type: Number, default: 3 }
  },
  
  // Current State
  state: {
    isPaused: { type: Boolean, default: false },
    pauseReason: { type: String },
    pausedAt: { type: Date },
    currentDailyDrawdown: { type: Number, default: 0 },
    currentWeeklyDrawdown: { type: Number, default: 0 },
    todaySignals: { type: Number, default: 0 },
    todayWins: { type: Number, default: 0 },
    todayLosses: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Method to check if trading is allowed
TradingSettingsSchema.methods.canTrade = function() {
  const issues = [];
  
  if (this.state.isPaused) {
    issues.push({ code: 'PAUSED', message: this.state.pauseReason || 'Trading is paused' });
  }
  
  if (this.state.currentDailyDrawdown >= this.risk.maxDailyDrawdown) {
    issues.push({ code: 'DAILY_DRAWDOWN', message: `Daily drawdown limit (${this.risk.maxDailyDrawdown}%) exceeded` });
  }
  
  if (this.state.currentWeeklyDrawdown >= this.risk.maxWeeklyDrawdown) {
    issues.push({ code: 'WEEKLY_DRAWDOWN', message: `Weekly drawdown limit (${this.risk.maxWeeklyDrawdown}%) exceeded` });
  }
  
  return {
    allowed: issues.length === 0,
    issues
  };
};

// Method to calculate position size
TradingSettingsSchema.methods.calculatePositionSize = function(stopLossPips, symbol) {
  const riskAmount = this.account.balance * (this.risk.maxRiskPerTrade / 100);
  
  // Pip value calculation (simplified - would need real pip values per symbol)
  let pipValue = 10; // Default for standard lot
  if (symbol.includes('JPY')) {
    pipValue = 1000 / 100; // Approximate for JPY pairs
  } else if (symbol === 'XAUUSD') {
    pipValue = 10; // Gold pip value
  } else if (symbol === 'XAGUSD') {
    pipValue = 50; // Silver pip value
  }
  
  const lotSize = riskAmount / (stopLossPips * pipValue);
  
  return {
    lotSize: Math.round(lotSize * 100) / 100,
    riskAmount,
    pipValue,
    stopLossPips
  };
};

// Method to update drawdown
TradingSettingsSchema.methods.updateDrawdown = function(pips, isWin) {
  // Reset daily stats if new day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.state.lastResetDate < today) {
    this.state.currentDailyDrawdown = 0;
    this.state.todaySignals = 0;
    this.state.todayWins = 0;
    this.state.todayLosses = 0;
    this.state.lastResetDate = today;
  }
  
  this.state.todaySignals++;
  
  if (isWin) {
    this.state.todayWins++;
  } else {
    this.state.todayLosses++;
    // Calculate drawdown as percentage of account
    const lossPercent = Math.abs(pips) * 0.01; // Simplified calculation
    this.state.currentDailyDrawdown += lossPercent;
    this.state.currentWeeklyDrawdown += lossPercent;
    
    // Check if should pause
    if (this.risk.pauseOnDrawdownExceeded && this.state.currentDailyDrawdown >= this.risk.maxDailyDrawdown) {
      this.state.isPaused = true;
      this.state.pauseReason = `Daily drawdown limit (${this.risk.maxDailyDrawdown}%) exceeded`;
      this.state.pausedAt = new Date();
    }
  }
  
  return this;
};

// Static method to get or create default settings
TradingSettingsSchema.statics.getSettings = async function(userId = 'default') {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = await this.create({ userId });
  }
  
  return settings;
};

// Static method to reset daily stats
TradingSettingsSchema.statics.resetDailyStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.updateMany(
    { 'state.lastResetDate': { $lt: today } },
    {
      $set: {
        'state.currentDailyDrawdown': 0,
        'state.todaySignals': 0,
        'state.todayWins': 0,
        'state.todayLosses': 0,
        'state.lastResetDate': today
      }
    }
  );
};

export default mongoose.models.TradingSettings || mongoose.model('TradingSettings', TradingSettingsSchema);
