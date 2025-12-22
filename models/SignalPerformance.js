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
  partialWins: { type: Number, default: 0 },
  partialLosses: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  
  // Profit Statistics
  totalPips: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 }, // Total pips from winning trades
  grossLoss: { type: Number, default: 0 }, // Total pips from losing trades
  averageWin: { type: Number, default: 0 },
  averageLoss: { type: Number, default: 0 },
  largestWin: { type: Number, default: 0 },
  largestLoss: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 }, // Gross Profit / Gross Loss
  expectancy: { type: Number, default: 0 }, // (Win% × Avg Win) - (Loss% × Avg Loss)
  
  // R-Multiple Statistics
  totalRMultiple: { type: Number, default: 0 },
  averageRMultiple: { type: Number, default: 0 },
  bestRMultiple: { type: Number, default: 0 },
  worstRMultiple: { type: Number, default: 0 },
  
  // Risk Statistics
  maxDrawdown: { type: Number, default: 0 },
  maxDrawdownPercent: { type: Number, default: 0 },
  sharpeRatio: { type: Number, default: 0 },
  sortinoRatio: { type: Number, default: 0 },
  calmarRatio: { type: Number, default: 0 },
  recoveryFactor: { type: Number, default: 0 },
  
  // Streak Statistics
  currentWinStreak: { type: Number, default: 0 },
  currentLossStreak: { type: Number, default: 0 },
  maxWinStreak: { type: Number, default: 0 },
  maxLossStreak: { type: Number, default: 0 },
  maxConsecutiveLosses: { type: Number, default: 0 },
  
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
    averagePips: { type: Number, default: 0 },
    profitFactor: { type: Number, default: 0 }
  }],
  
  // Performance by Grade
  byGrade: {
    aPlus: { 
      signals: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 },
      averageRMultiple: { type: Number, default: 0 }
    },
    a: { 
      signals: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 },
      averageRMultiple: { type: Number, default: 0 }
    }
  },
  
  // Performance by Direction
  byDirection: {
    buy: {
      signals: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      totalPips: { type: Number, default: 0 }
    },
    sell: {
      signals: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
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
  
  // Confluence Score Analysis
  byConfluenceRange: {
    range70to75: { signals: Number, winRate: Number },
    range75to80: { signals: Number, winRate: Number },
    range80to85: { signals: Number, winRate: Number },
    range85to90: { signals: Number, winRate: Number },
    range90to100: { signals: Number, winRate: Number }
  },
  
  // Equity Curve Data Points
  equityCurve: [{
    date: Date,
    cumulativePips: Number,
    cumulativeRMultiple: Number,
    drawdown: Number
  }],
  
  // Calibration Data (predicted vs actual)
  calibration: {
    predictedWinRate: { type: Number },
    actualWinRate: { type: Number },
    calibrationError: { type: Number },
    isOverconfident: { type: Boolean }
  },
  
  // Insights and Recommendations
  insights: [{
    type: { type: String, enum: ['STRENGTH', 'WEAKNESS', 'RECOMMENDATION', 'WARNING'] },
    message: {
      ar: String,
      en: String
    },
    importance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] }
  }],
  
  // Metadata
  lastCalculated: { type: Date, default: Date.now },
  dataQuality: {
    completeness: { type: Number }, // % of signals with complete data
    reliability: { type: Number }
  }
}, {
  timestamps: true
});

// Indexes
SignalPerformanceSchema.index({ period: 1, date: -1 });
SignalPerformanceSchema.index({ 'byAsset.symbol': 1 });

// Static method to calculate performance from signals
SignalPerformanceSchema.statics.calculateFromSignals = async function(signals, period, date) {
  const closedSignals = signals.filter(s => s.result && s.result.outcome);
  
  if (closedSignals.length === 0) {
    return {
      period,
      date,
      totalSignals: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPips: 0
    };
  }

  const wins = closedSignals.filter(s => 
    s.result.outcome === 'WIN' || s.result.outcome === 'PARTIAL_WIN'
  );
  const losses = closedSignals.filter(s => 
    s.result.outcome === 'LOSS' || s.result.outcome === 'PARTIAL_LOSS'
  );
  const breakeven = closedSignals.filter(s => s.result.outcome === 'BREAKEVEN');

  const totalPips = closedSignals.reduce((sum, s) => sum + (s.result.pips || 0), 0);
  const grossProfit = wins.reduce((sum, s) => sum + Math.max(0, s.result.pips || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, s) => sum + Math.min(0, s.result.pips || 0), 0));

  const winRate = (wins.length / closedSignals.length) * 100;
  const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const expectancy = (winRate / 100 * averageWin) - ((100 - winRate) / 100 * averageLoss);

  // Calculate by asset
  const assetMap = new Map();
  closedSignals.forEach(signal => {
    const key = signal.symbol;
    if (!assetMap.has(key)) {
      assetMap.set(key, {
        symbol: signal.symbol,
        category: signal.category,
        signals: 0,
        wins: 0,
        losses: 0,
        totalPips: 0
      });
    }
    const asset = assetMap.get(key);
    asset.signals++;
    if (signal.result.outcome === 'WIN' || signal.result.outcome === 'PARTIAL_WIN') {
      asset.wins++;
    } else if (signal.result.outcome === 'LOSS' || signal.result.outcome === 'PARTIAL_LOSS') {
      asset.losses++;
    }
    asset.totalPips += signal.result.pips || 0;
  });

  const byAsset = Array.from(assetMap.values()).map(asset => ({
    ...asset,
    winRate: asset.signals > 0 ? (asset.wins / asset.signals) * 100 : 0,
    averagePips: asset.signals > 0 ? asset.totalPips / asset.signals : 0,
    profitFactor: asset.losses > 0 ? asset.wins / asset.losses : asset.wins
  }));

  // Calculate by grade
  const aPlusSignals = closedSignals.filter(s => s.grade === 'A_PLUS');
  const aSignals = closedSignals.filter(s => s.grade === 'A');

  const calculateGradeStats = (gradeSignals) => {
    const gradeWins = gradeSignals.filter(s => 
      s.result.outcome === 'WIN' || s.result.outcome === 'PARTIAL_WIN'
    );
    return {
      signals: gradeSignals.length,
      wins: gradeWins.length,
      losses: gradeSignals.length - gradeWins.length,
      winRate: gradeSignals.length > 0 ? (gradeWins.length / gradeSignals.length) * 100 : 0,
      totalPips: gradeSignals.reduce((sum, s) => sum + (s.result.pips || 0), 0),
      averageRMultiple: gradeSignals.length > 0 
        ? gradeSignals.reduce((sum, s) => sum + (s.result.rMultiple || 0), 0) / gradeSignals.length 
        : 0
    };
  };

  return {
    period,
    date,
    totalSignals: closedSignals.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    winRate,
    totalPips,
    grossProfit,
    grossLoss,
    averageWin,
    averageLoss,
    largestWin: Math.max(...closedSignals.map(s => s.result.pips || 0)),
    largestLoss: Math.min(...closedSignals.map(s => s.result.pips || 0)),
    profitFactor,
    expectancy,
    byAsset,
    byGrade: {
      aPlus: calculateGradeStats(aPlusSignals),
      a: calculateGradeStats(aSignals)
    },
    lastCalculated: new Date()
  };
};

// Static method to get or create performance record
SignalPerformanceSchema.statics.getOrCreate = async function(period, date) {
  let record = await this.findOne({ period, date });
  if (!record) {
    record = new this({ period, date });
    await record.save();
  }
  return record;
};

// Method to generate insights
SignalPerformanceSchema.methods.generateInsights = function() {
  const insights = [];

  // Win rate insights
  if (this.winRate >= 70) {
    insights.push({
      type: 'STRENGTH',
      message: {
        ar: `نسبة نجاح ممتازة ${this.winRate.toFixed(1)}%`,
        en: `Excellent win rate of ${this.winRate.toFixed(1)}%`
      },
      importance: 'HIGH'
    });
  } else if (this.winRate < 50) {
    insights.push({
      type: 'WARNING',
      message: {
        ar: `نسبة النجاح منخفضة ${this.winRate.toFixed(1)}% - راجع استراتيجيتك`,
        en: `Low win rate of ${this.winRate.toFixed(1)}% - review your strategy`
      },
      importance: 'HIGH'
    });
  }

  // Profit factor insights
  if (this.profitFactor >= 2) {
    insights.push({
      type: 'STRENGTH',
      message: {
        ar: `معامل ربح قوي ${this.profitFactor.toFixed(2)}`,
        en: `Strong profit factor of ${this.profitFactor.toFixed(2)}`
      },
      importance: 'HIGH'
    });
  }

  // Best performing asset
  if (this.byAsset && this.byAsset.length > 0) {
    const bestAsset = this.byAsset.reduce((best, current) => 
      current.totalPips > best.totalPips ? current : best
    );
    if (bestAsset.totalPips > 0) {
      insights.push({
        type: 'STRENGTH',
        message: {
          ar: `أفضل أداء على ${bestAsset.symbol} (+${bestAsset.totalPips.toFixed(1)} نقطة)`,
          en: `Best performance on ${bestAsset.symbol} (+${bestAsset.totalPips.toFixed(1)} pips)`
        },
        importance: 'MEDIUM'
      });
    }
  }

  // Grade comparison
  if (this.byGrade) {
    if (this.byGrade.aPlus.winRate > this.byGrade.a.winRate + 10) {
      insights.push({
        type: 'RECOMMENDATION',
        message: {
          ar: 'توصيات A+ تتفوق بشكل ملحوظ - ركز عليها',
          en: 'A+ signals significantly outperform - focus on them'
        },
        importance: 'HIGH'
      });
    }
  }

  this.insights = insights;
  return insights;
};

export default mongoose.models.SignalPerformance || mongoose.model('SignalPerformance', SignalPerformanceSchema);
