/**
 * PerformanceTracker - Signal Performance Tracking Engine
 * Automatically updates signal status and calculates performance metrics
 * Tracks win rate, profit factor, Sharpe ratio, and more
 */

export class PerformanceTracker {
  constructor() {
    this.metrics = {
      totalSignals: 0,
      wins: 0,
      losses: 0,
      partialWins: 0,
      breakeven: 0,
      winRate: 0,
      totalPips: 0,
      avgWinPips: 0,
      avgLossPips: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      byGrade: {
        'A+': { total: 0, wins: 0, winRate: 0 },
        'A': { total: 0, wins: 0, winRate: 0 }
      },
      bySymbol: {},
      byDirection: {
        BUY: { total: 0, wins: 0, winRate: 0 },
        SELL: { total: 0, wins: 0, winRate: 0 }
      },
      equityCurve: [],
      monthlyPerformance: {}
    };
  }

  /**
   * Update signal status based on current price
   */
  updateSignalStatus(signal, currentPrice) {
    const updates = {
      currentPrice,
      lastUpdate: new Date()
    };

    const direction = signal.direction;
    const entryPrice = signal.entry?.price || signal.entryPrice;
    const pipSize = this.getPipSize(signal.symbol);

    // Calculate current P/L in pips
    if (direction === 'BUY') {
      updates.currentPips = (currentPrice - entryPrice) / pipSize;
    } else {
      updates.currentPips = (entryPrice - currentPrice) / pipSize;
    }

    // Check if targets hit
    const result = this.checkTargets(signal, currentPrice, direction);
    if (result.status) {
      updates.status = result.status;
      updates.result = result.result;
      updates.exitPrice = currentPrice;
      updates.closedAt = new Date();
      updates.pips = result.pips;
    }

    return { ...signal, ...updates };
  }

  /**
   * Check if price hit any targets
   */
  checkTargets(signal, currentPrice, direction) {
    const entryPrice = signal.entry?.price || signal.entryPrice;
    const pipSize = this.getPipSize(signal.symbol);

    if (direction === 'BUY') {
      // Check Stop Loss
      if (currentPrice <= signal.stopLoss) {
        return {
          status: 'STOPPED_OUT',
          result: 'LOSS',
          pips: (signal.stopLoss - entryPrice) / pipSize
        };
      }
      // Check Take Profits
      if (signal.takeProfit3 && currentPrice >= signal.takeProfit3) {
        return {
          status: 'TP3_HIT',
          result: 'WIN',
          pips: (signal.takeProfit3 - entryPrice) / pipSize
        };
      }
      if (signal.takeProfit2 && currentPrice >= signal.takeProfit2) {
        return {
          status: 'TP2_HIT',
          result: 'WIN',
          pips: (signal.takeProfit2 - entryPrice) / pipSize
        };
      }
      if (signal.takeProfit1 && currentPrice >= signal.takeProfit1) {
        return {
          status: 'TP1_HIT',
          result: 'PARTIAL_WIN',
          pips: (signal.takeProfit1 - entryPrice) / pipSize
        };
      }
    } else {
      // SELL direction
      if (currentPrice >= signal.stopLoss) {
        return {
          status: 'STOPPED_OUT',
          result: 'LOSS',
          pips: (entryPrice - signal.stopLoss) / pipSize
        };
      }
      if (signal.takeProfit3 && currentPrice <= signal.takeProfit3) {
        return {
          status: 'TP3_HIT',
          result: 'WIN',
          pips: (entryPrice - signal.takeProfit3) / pipSize
        };
      }
      if (signal.takeProfit2 && currentPrice <= signal.takeProfit2) {
        return {
          status: 'TP2_HIT',
          result: 'WIN',
          pips: (entryPrice - signal.takeProfit2) / pipSize
        };
      }
      if (signal.takeProfit1 && currentPrice <= signal.takeProfit1) {
        return {
          status: 'TP1_HIT',
          result: 'PARTIAL_WIN',
          pips: (entryPrice - signal.takeProfit1) / pipSize
        };
      }
    }

    return { status: null, result: null };
  }

  /**
   * Record closed trade
   */
  recordTrade(signal) {
    const result = signal.result;
    const pips = signal.pips || 0;
    const grade = signal.grade;
    const symbol = signal.symbol;
    const direction = signal.direction;

    // Update totals
    this.metrics.totalSignals++;
    this.metrics.totalPips += pips;

    // Update win/loss counts
    if (result === 'WIN') {
      this.metrics.wins++;
      this.metrics.consecutiveWins++;
      this.metrics.consecutiveLosses = 0;
      this.metrics.maxConsecutiveWins = Math.max(
        this.metrics.maxConsecutiveWins,
        this.metrics.consecutiveWins
      );
    } else if (result === 'PARTIAL_WIN') {
      this.metrics.partialWins++;
      this.metrics.consecutiveWins++;
      this.metrics.consecutiveLosses = 0;
    } else if (result === 'LOSS') {
      this.metrics.losses++;
      this.metrics.consecutiveLosses++;
      this.metrics.consecutiveWins = 0;
      this.metrics.maxConsecutiveLosses = Math.max(
        this.metrics.maxConsecutiveLosses,
        this.metrics.consecutiveLosses
      );
    }

    // Update by grade
    if (grade && this.metrics.byGrade[grade]) {
      this.metrics.byGrade[grade].total++;
      if (result === 'WIN' || result === 'PARTIAL_WIN') {
        this.metrics.byGrade[grade].wins++;
      }
    }

    // Update by symbol
    if (!this.metrics.bySymbol[symbol]) {
      this.metrics.bySymbol[symbol] = { total: 0, wins: 0, pips: 0 };
    }
    this.metrics.bySymbol[symbol].total++;
    this.metrics.bySymbol[symbol].pips += pips;
    if (result === 'WIN' || result === 'PARTIAL_WIN') {
      this.metrics.bySymbol[symbol].wins++;
    }

    // Update by direction
    if (this.metrics.byDirection[direction]) {
      this.metrics.byDirection[direction].total++;
      if (result === 'WIN' || result === 'PARTIAL_WIN') {
        this.metrics.byDirection[direction].wins++;
      }
    }

    // Update equity curve
    const lastEquity = this.metrics.equityCurve.length > 0
      ? this.metrics.equityCurve[this.metrics.equityCurve.length - 1].equity
      : 0;
    this.metrics.equityCurve.push({
      date: new Date(),
      pips,
      equity: lastEquity + pips
    });

    // Update monthly performance
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    if (!this.metrics.monthlyPerformance[monthKey]) {
      this.metrics.monthlyPerformance[monthKey] = { trades: 0, wins: 0, pips: 0 };
    }
    this.metrics.monthlyPerformance[monthKey].trades++;
    this.metrics.monthlyPerformance[monthKey].pips += pips;
    if (result === 'WIN' || result === 'PARTIAL_WIN') {
      this.metrics.monthlyPerformance[monthKey].wins++;
    }

    // Recalculate derived metrics
    this.calculateDerivedMetrics();
  }


  /**
   * Calculate derived metrics
   */
  calculateDerivedMetrics() {
    const { wins, losses, partialWins, totalSignals, equityCurve } = this.metrics;

    // Win rate
    if (totalSignals > 0) {
      this.metrics.winRate = ((wins + partialWins) / totalSignals) * 100;
    }

    // Average win/loss pips
    const winningTrades = equityCurve.filter(t => t.pips > 0);
    const losingTrades = equityCurve.filter(t => t.pips < 0);

    if (winningTrades.length > 0) {
      this.metrics.avgWinPips = winningTrades.reduce((sum, t) => sum + t.pips, 0) / winningTrades.length;
    }
    if (losingTrades.length > 0) {
      this.metrics.avgLossPips = Math.abs(losingTrades.reduce((sum, t) => sum + t.pips, 0) / losingTrades.length);
    }

    // Profit factor
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pips, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pips, 0));
    this.metrics.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Max drawdown
    this.metrics.maxDrawdown = this.calculateMaxDrawdown();

    // Sharpe ratio (simplified)
    this.metrics.sharpeRatio = this.calculateSharpeRatio();

    // Update win rates by grade
    Object.keys(this.metrics.byGrade).forEach(grade => {
      const g = this.metrics.byGrade[grade];
      g.winRate = g.total > 0 ? (g.wins / g.total) * 100 : 0;
    });

    // Update win rates by symbol
    Object.keys(this.metrics.bySymbol).forEach(symbol => {
      const s = this.metrics.bySymbol[symbol];
      s.winRate = s.total > 0 ? (s.wins / s.total) * 100 : 0;
    });

    // Update win rates by direction
    Object.keys(this.metrics.byDirection).forEach(dir => {
      const d = this.metrics.byDirection[dir];
      d.winRate = d.total > 0 ? (d.wins / d.total) * 100 : 0;
    });
  }

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown() {
    const { equityCurve } = this.metrics;
    if (equityCurve.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = equityCurve[0].equity;

    for (const point of equityCurve) {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = peak - point.equity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate Sharpe ratio (simplified)
   */
  calculateSharpeRatio() {
    const { equityCurve } = this.metrics;
    if (equityCurve.length < 10) return 0;

    const returns = equityCurve.map(p => p.pips);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;
    
    // Annualized (assuming ~250 trading days)
    return (avgReturn / stdDev) * Math.sqrt(250);
  }

  /**
   * Get pip size for symbol
   */
  getPipSize(symbol) {
    if (symbol.includes('JPY')) return 0.01;
    if (symbol === 'XAUUSD') return 0.1;
    if (symbol === 'XAGUSD') return 0.01;
    if (['US30', 'US100', 'US500', 'GER40', 'UK100'].includes(symbol)) return 1;
    return 0.0001;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      totalSignals: this.metrics.totalSignals,
      wins: this.metrics.wins,
      losses: this.metrics.losses,
      partialWins: this.metrics.partialWins,
      winRate: Math.round(this.metrics.winRate * 10) / 10,
      totalPips: Math.round(this.metrics.totalPips * 10) / 10,
      avgWinPips: Math.round(this.metrics.avgWinPips * 10) / 10,
      avgLossPips: Math.round(this.metrics.avgLossPips * 10) / 10,
      profitFactor: Math.round(this.metrics.profitFactor * 100) / 100,
      sharpeRatio: Math.round(this.metrics.sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(this.metrics.maxDrawdown * 10) / 10,
      maxConsecutiveWins: this.metrics.maxConsecutiveWins,
      maxConsecutiveLosses: this.metrics.maxConsecutiveLosses
    };
  }

  /**
   * Get performance by grade
   */
  getPerformanceByGrade() {
    return Object.entries(this.metrics.byGrade).map(([grade, data]) => ({
      grade,
      total: data.total,
      wins: data.wins,
      winRate: Math.round(data.winRate * 10) / 10
    }));
  }

  /**
   * Get performance by symbol
   */
  getPerformanceBySymbol() {
    return Object.entries(this.metrics.bySymbol)
      .map(([symbol, data]) => ({
        symbol,
        total: data.total,
        wins: data.wins,
        pips: Math.round(data.pips * 10) / 10,
        winRate: Math.round(data.winRate * 10) / 10
      }))
      .sort((a, b) => b.pips - a.pips);
  }

  /**
   * Get equity curve data
   */
  getEquityCurve() {
    return this.metrics.equityCurve.map(point => ({
      date: point.date,
      equity: Math.round(point.equity * 10) / 10
    }));
  }

  /**
   * Get monthly performance
   */
  getMonthlyPerformance() {
    return Object.entries(this.metrics.monthlyPerformance)
      .map(([month, data]) => ({
        month,
        trades: data.trades,
        wins: data.wins,
        pips: Math.round(data.pips * 10) / 10,
        winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  /**
   * Load metrics from database
   */
  loadMetrics(data) {
    if (data) {
      this.metrics = { ...this.metrics, ...data };
    }
  }

  /**
   * Export metrics for storage
   */
  exportMetrics() {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      totalSignals: 0,
      wins: 0,
      losses: 0,
      partialWins: 0,
      breakeven: 0,
      winRate: 0,
      totalPips: 0,
      avgWinPips: 0,
      avgLossPips: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      byGrade: {
        'A+': { total: 0, wins: 0, winRate: 0 },
        'A': { total: 0, wins: 0, winRate: 0 }
      },
      bySymbol: {},
      byDirection: {
        BUY: { total: 0, wins: 0, winRate: 0 },
        SELL: { total: 0, wins: 0, winRate: 0 }
      },
      equityCurve: [],
      monthlyPerformance: {}
    };
  }
}

export default PerformanceTracker;
