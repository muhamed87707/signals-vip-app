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
    balance: { type: Number, default: 10000 }, // Account balance in USD
    currency: { type: String, default: 'USD' },
    leverage: { type: Number, default: 100 },
    broker: { type: String }
  },

  // Risk Management Settings
  riskManagement: {
    riskPerTrade: { type: Number, default: 2, min: 0.5, max: 5 }, // % of account per trade
    maxDailyRisk: { type: Number, default: 6, min: 1, max: 10 }, // Max daily risk %
    maxDailyLoss: { type: Number, default: 3, min: 1, max: 5 }, // Pause signals after this % loss
    maxOpenTrades: { type: Number, default: 5, min: 1, max: 10 },
    maxCorrelatedTrades: { type: Number, default: 2 }, // Max trades on correlated pairs
    minRiskReward: { type: Number, default: 2, min: 1.5, max: 5 }, // Minimum R:R ratio
    useTrailingStop: { type: Boolean, default: true },
    trailingStopATRMultiple: { type: Number, default: 1.5 },
    moveToBreakevenAt: { type: Number, default: 1 }, // Move SL to BE at 1R profit
    partialCloseAt: { type: Number, default: 2 }, // Close 50% at 2R profit
    partialClosePercent: { type: Number, default: 50 }
  },

  // Signal Preferences
  signalPreferences: {
    minConfluenceScore: { type: Number, default: 70, min: 60, max: 90 },
    preferredGrades: { 
      type: [String], 
      default: ['A_PLUS', 'A'],
      enum: ['A_PLUS', 'A']
    },
    preferredAssets: {
      forex: { type: [String], default: ['EURUSD', 'GBPUSD', 'XAUUSD'] },
      metals: { type: [String], default: ['XAUUSD', 'XAGUSD'] },
      indices: { type: [String], default: ['US30', 'US500'] }
    },
    excludedAssets: { type: [String], default: [] },
    preferredSessions: {
      type: [String],
      default: ['LONDON', 'NEW_YORK', 'OVERLAP'],
      enum: ['ASIAN', 'LONDON', 'NEW_YORK', 'OVERLAP']
    },
    avoidNewsMinutes: { type: Number, default: 30 }, // Avoid signals X minutes before high-impact news
    preferredTimeframes: {
      type: [String],
      default: ['H1', 'H4', 'D1'],
      enum: ['M15', 'H1', 'H4', 'D1', 'W1']
    }
  },

  // Notification Settings
  notifications: {
    enabled: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    soundVolume: { type: Number, default: 0.7, min: 0, max: 1 },
    notifyOnNewSignal: { type: Boolean, default: true },
    notifyOnTPHit: { type: Boolean, default: true },
    notifyOnSLHit: { type: Boolean, default: true },
    notifyOnSignalUpdate: { type: Boolean, default: true },
    notifyOnHighImpactNews: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    email: { type: String }
  },

  // Display Settings
  display: {
    language: { type: String, default: 'ar', enum: ['ar', 'en'] },
    theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
    showConfluenceBreakdown: { type: Boolean, default: true },
    showTechnicalDetails: { type: Boolean, default: true },
    showFundamentalDetails: { type: Boolean, default: true },
    showAIReasoning: { type: Boolean, default: true },
    showRiskCalculator: { type: Boolean, default: true },
    showPerformanceStats: { type: Boolean, default: true },
    chartTimeframe: { type: String, default: 'H4' },
    compactMode: { type: Boolean, default: false },
    showPipsInMoney: { type: Boolean, default: true } // Show profit in $ alongside pips
  },

  // Auto-Trading Settings (for future implementation)
  autoTrading: {
    enabled: { type: Boolean, default: false },
    onlyAPlusSignals: { type: Boolean, default: true },
    maxAutoTradesPerDay: { type: Number, default: 3 },
    requireConfirmation: { type: Boolean, default: true }
  },

  // Analysis Preferences
  analysisPreferences: {
    technicalWeight: { type: Number, default: 30, min: 10, max: 50 },
    priceActionWeight: { type: Number, default: 25, min: 10, max: 40 },
    multiTimeframeWeight: { type: Number, default: 20, min: 10, max: 30 },
    fundamentalWeight: { type: Number, default: 15, min: 5, max: 30 },
    aiWeight: { type: Number, default: 10, min: 5, max: 20 },
    useSmartMoneyConcepts: { type: Boolean, default: true },
    useHarmonicPatterns: { type: Boolean, default: true },
    useWyckoffAnalysis: { type: Boolean, default: true },
    useElliottWave: { type: Boolean, default: false },
    useSentimentAnalysis: { type: Boolean, default: true }
  },

  // Daily Tracking
  dailyTracking: {
    date: { type: Date },
    tradesOpened: { type: Number, default: 0 },
    currentDailyPL: { type: Number, default: 0 },
    isPaused: { type: Boolean, default: false },
    pauseReason: { type: String }
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Validate that weights sum to 100
TradingSettingsSchema.pre('save', function(next) {
  const weights = this.analysisPreferences;
  const total = weights.technicalWeight + weights.priceActionWeight + 
                weights.multiTimeframeWeight + weights.fundamentalWeight + weights.aiWeight;
  
  if (total !== 100) {
    // Normalize weights to sum to 100
    const factor = 100 / total;
    weights.technicalWeight = Math.round(weights.technicalWeight * factor);
    weights.priceActionWeight = Math.round(weights.priceActionWeight * factor);
    weights.multiTimeframeWeight = Math.round(weights.multiTimeframeWeight * factor);
    weights.fundamentalWeight = Math.round(weights.fundamentalWeight * factor);
    weights.aiWeight = 100 - weights.technicalWeight - weights.priceActionWeight - 
                       weights.multiTimeframeWeight - weights.fundamentalWeight;
  }
  
  this.updatedAt = new Date();
  next();
});

// Reset daily tracking at midnight
TradingSettingsSchema.methods.resetDailyTracking = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.dailyTracking.date || this.dailyTracking.date < today) {
    this.dailyTracking = {
      date: today,
      tradesOpened: 0,
      currentDailyPL: 0,
      isPaused: false,
      pauseReason: null
    };
  }
  return this;
};

// Check if trading should be paused
TradingSettingsSchema.methods.shouldPauseTrading = function() {
  this.resetDailyTracking();
  
  const dailyLossPercent = Math.abs(this.dailyTracking.currentDailyPL) / this.account.balance * 100;
  
  if (dailyLossPercent >= this.riskManagement.maxDailyLoss && this.dailyTracking.currentDailyPL < 0) {
    this.dailyTracking.isPaused = true;
    this.dailyTracking.pauseReason = 'MAX_DAILY_LOSS';
    return true;
  }
  
  if (this.dailyTracking.tradesOpened >= this.riskManagement.maxOpenTrades) {
    this.dailyTracking.isPaused = true;
    this.dailyTracking.pauseReason = 'MAX_TRADES_REACHED';
    return true;
  }
  
  return false;
};

// Calculate position size for a signal
TradingSettingsSchema.methods.calculatePositionSize = function(entry, stopLoss, symbol) {
  const riskAmount = this.account.balance * (this.riskManagement.riskPerTrade / 100);
  
  // Determine pip value based on symbol
  let pipValue = 0.0001; // Default for most pairs
  if (symbol.includes('JPY')) {
    pipValue = 0.01;
  } else if (symbol === 'XAUUSD') {
    pipValue = 0.1; // Gold
  } else if (symbol === 'XAGUSD') {
    pipValue = 0.01; // Silver
  } else if (['US30', 'US500', 'US100', 'GER40'].includes(symbol)) {
    pipValue = 1; // Indices
  }
  
  const stopLossPips = Math.abs(entry - stopLoss) / pipValue;
  
  // Calculate lot size
  // Standard lot = 100,000 units, pip value ≈ $10 for most pairs
  const pipValuePerLot = symbol.includes('JPY') ? 1000 : 10;
  const lotSize = riskAmount / (stopLossPips * pipValuePerLot);
  
  return {
    lotSize: Math.round(lotSize * 100) / 100, // Round to 2 decimals
    riskAmount,
    stopLossPips,
    pipValue,
    potentialLoss: riskAmount,
    potentialProfit1R: riskAmount,
    potentialProfit2R: riskAmount * 2,
    potentialProfit3R: riskAmount * 3
  };
};

// Get confluence weights as object
TradingSettingsSchema.methods.getConfluenceWeights = function() {
  return {
    technical: this.analysisPreferences.technicalWeight / 100,
    priceAction: this.analysisPreferences.priceActionWeight / 100,
    multiTimeframe: this.analysisPreferences.multiTimeframeWeight / 100,
    fundamental: this.analysisPreferences.fundamentalWeight / 100,
    aiConfidence: this.analysisPreferences.aiWeight / 100
  };
};

// Static method to get or create default settings
TradingSettingsSchema.statics.getSettings = async function(userId = 'default') {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = new this({ userId });
    await settings.save();
  }
  return settings.resetDailyTracking();
};

// Static method to update settings
TradingSettingsSchema.statics.updateSettings = async function(userId = 'default', updates) {
  const settings = await this.findOneAndUpdate(
    { userId },
    { $set: updates, updatedAt: new Date() },
    { new: true, upsert: true }
  );
  return settings;
};

export default mongoose.models.TradingSettings || mongoose.model('TradingSettings', TradingSettingsSchema);
