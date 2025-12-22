import mongoose from 'mongoose';

const SignalPerformanceSchema = new mongoose.Schema({
  // Period identification
  period: { 
    type: String, 
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'], 
    required: true,
    index: true
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  
  // Overall Statistics
  totalSignals: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  breakeven: { type: Number, default: 0 },
  partial: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  
  // Profit Statistics
  totalPips: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 },
  grossLoss: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  averageWin: { type: Number, default: 0 },
  averageLoss: { type: Number, default: 0 },
  largestWin: { type: Number, default: 0 },
  largestLoss: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 },
  expectancy: { type: Number, default: 0 },
  averageRMultiple: { type: Number, default: 0 },
  
  // Risk Statistics
  maxDrawdown: { type: Number, default: 0 },
  maxDrawdownPercent: { type: Number, default: 0 },
  sharpeRatio: { type: Number, default: 0 },
  sortinoRatio: { type: Number, default: 0 },
  maxConsecutiveWins: { type: Number, default: 0 },
  maxConsecutiveLosses: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 }, // positive = wins, negative = losses
  recoveryFactor: { type: Number, default: 0 },
  
  // Time Statistics
  averageHoldingTime: { type: Number, default: 0 }, // in minutes
  shortestTrade: { type: Number, default: 0 },
  longestTrade: { type: Number, default: 0 },
  
  // Performance by Asset
  byAsset: [{
    symbol: { type: String },
    category: { type: String },
    signals: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    totalPips: { type: Number, default: 0 },
    profitFactor: { type: Number, default: 0 }
  }],
  
  // Performance by Category
  byCategory: {
    forex: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    metals: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    indices: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    }
  },
  
  // Performance by Grade
  byGrade: {
    aPlus: { 
      signals: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    a: { 
      signals: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    }
  },
  
  // Performance by Direction
  byDirection: {
    buy: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    sell: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    }
  },
  
  // Performance by Session
  bySession: {
    asian: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    london: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    newYork: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    overlap: {
      signals: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    }
  },
  
  // Performance by Day of Week
  byDayOfWeek: {
    monday: { signals: Number, winRate: Number, totalPips: Number },
    tuesday: { signals: Number, winRate: Number, totalPips: Number },
    wednesday: { signals: Number, winRate: Number, totalPips: Number },
    thursday: { signals: Number, winRate: Number, totalPips: Number },
    friday: { signals: Number, winRate: Number, totalPips: Number }
  },
  
  // Equity Curve Data Points
  equityCurve: [{
    date: { type: Date },
    equity: { type: Number },
    drawdown: { type: Number }
  }],
  
  // Calibration Data (predicted vs actual)
  calibration: {
    predictedWinRate: { type: Number },
    actualWinRate: { type: Number },
    calibrationError: { type: Number },
    isOverconfident: { type: Boolean }
  },
  
  // Best and Worst Trades
  bestTrade: {
    signalId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingSignal' },
    symbol: { type: String },
    pips: { type: Number },
    date: { type: Date }
  },
  worstTrade: {
    signalId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingSignal' },
    symbol: { type: String },
    pips: { type: Number },
    date: { type: Date }
  }
}, {
  timestamps: true
});

// Indexes
SignalPerformanceSchema.index({ period: 1, date: -1 });

// Static method to update or create daily stats
SignalPerformanceSchema.statics.updateDailyStats = async function(date = new Date()) {
  const TradingSignal = mongoose.model('TradingSignal');
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const signals = await TradingSignal.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    'result.outcome': { $exists: true, $ne: 'PENDING' }
  });
  
  if (signals.length === 0) return null;
  
  const stats = calculateStats(signals);
  
  return this.findOneAndUpdate(
    { period: 'DAILY', date: startOfDay },
    { $set: stats },
    { upsert: true, new: true }
  );
};

// Static method to get performance summary
SignalPerformanceSchema.statics.getSummary = async function(period = 'WEEKLY') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'DAILY':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'WEEKLY':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'MONTHLY':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0);
  }
  
  return this.findOne({ 
    period,
    date: { $gte: startDate }
  }).sort({ date: -1 });
};

// Helper function to calculate stats from signals
function calculateStats(signals) {
  const wins = signals.filter(s => s.result?.outcome === 'WIN');
  const losses = signals.filter(s => s.result?.outcome === 'LOSS');
  const total = signals.length;
  
  const totalPips = signals.reduce((sum, s) => sum + (s.result?.pips || 0), 0);
  const grossProfit = wins.reduce((sum, s) => sum + (s.result?.pips || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, s) => sum + (s.result?.pips || 0), 0));
  
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  
  // Calculate by asset
  const assetMap = {};
  signals.forEach(s => {
    if (!assetMap[s.symbol]) {
      assetMap[s.symbol] = { symbol: s.symbol, category: s.category, signals: 0, wins: 0, losses: 0, totalPips: 0 };
    }
    assetMap[s.symbol].signals++;
    if (s.result?.outcome === 'WIN') assetMap[s.symbol].wins++;
    if (s.result?.outcome === 'LOSS') assetMap[s.symbol].losses++;
    assetMap[s.symbol].totalPips += s.result?.pips || 0;
  });
  
  const byAsset = Object.values(assetMap).map(a => ({
    ...a,
    winRate: a.signals > 0 ? (a.wins / a.signals) * 100 : 0,
    profitFactor: a.losses > 0 ? a.wins / a.losses : a.wins
  }));
  
  return {
    totalSignals: total,
    wins: wins.length,
    losses: losses.length,
    winRate: total > 0 ? (wins.length / total) * 100 : 0,
    totalPips,
    grossProfit,
    grossLoss,
    netProfit: grossProfit - grossLoss,
    averageWin: avgWin,
    averageLoss: avgLoss,
    largestWin: wins.length > 0 ? Math.max(...wins.map(s => s.result?.pips || 0)) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses.map(s => s.result?.pips || 0)) : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit,
    expectancy: total > 0 ? totalPips / total : 0,
    byAsset
  };
}

export default mongoose.models.SignalPerformance || mongoose.model('SignalPerformance', SignalPerformanceSchema);
