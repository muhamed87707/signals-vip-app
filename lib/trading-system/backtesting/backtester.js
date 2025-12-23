/**
 * Backtester
 * نظام الاختبار التاريخي
 * 
 * Tests trading strategies on historical data:
 * - Signal generation testing
 * - Performance calculation
 * - Win rate analysis
 * - Drawdown calculation
 */

export class Backtester {
  constructor(config = {}) {
    this.config = {
      initialBalance: 10000,
      riskPerTrade: 1.0, // 1%
      commission: 0, // Per trade
      slippage: 0.5, // Pips
      ...config,
    };
  }

  /**
   * Run backtest on historical data
   * @param {Object} params - Backtest parameters
   * @returns {Object} Backtest results
   */
  async run(params) {
    const {
      symbol,
      candles,
      signalGenerator,
      startDate,
      endDate,
    } = params;

    const trades = [];
    let balance = this.config.initialBalance;
    let equity = balance;
    let maxEquity = balance;
    let maxDrawdown = 0;
    const equityCurve = [{ date: candles[0]?.timestamp, equity: balance }];

    // Simulate trading through historical data
    for (let i = 100; i < candles.length - 20; i++) {
      const historicalCandles = candles.slice(0, i + 1);
      const futureCandles = candles.slice(i + 1, i + 21);

      // Generate signal
      const signal = await this.generateSignal(signalGenerator, symbol, historicalCandles);
      
      if (signal && signal.direction !== 'NEUTRAL') {
        // Simulate trade
        const trade = this.simulateTrade({
          signal,
          entryCandle: candles[i],
          futureCandles,
          balance,
        });

        if (trade) {
          trades.push(trade);
          balance += trade.pnl;
          equity = balance;

          // Track max equity and drawdown
          if (equity > maxEquity) {
            maxEquity = equity;
          }
          const drawdown = (maxEquity - equity) / maxEquity * 100;
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
          }

          equityCurve.push({
            date: trade.exitTime,
            equity,
            trade: trade.id,
          });
        }
      }
    }

    // Calculate statistics
    const stats = this.calculateStatistics(trades, this.config.initialBalance, balance);

    return {
      symbol,
      period: {
        start: startDate || candles[0]?.timestamp,
        end: endDate || candles[candles.length - 1]?.timestamp,
        totalCandles: candles.length,
      },
      trades,
      totalTrades: trades.length,
      stats,
      equityCurve,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      finalBalance: Math.round(balance * 100) / 100,
      returnPercent: Math.round(((balance - this.config.initialBalance) / this.config.initialBalance) * 10000) / 100,
    };
  }

  /**
   * Generate signal using the signal generator
   */
  async generateSignal(signalGenerator, symbol, candles) {
    try {
      if (typeof signalGenerator === 'function') {
        return await signalGenerator(symbol, candles);
      } else if (signalGenerator?.generateSignal) {
        return await signalGenerator.generateSignal(symbol, candles);
      }
      return null;
    } catch (error) {
      console.error('Signal generation error:', error);
      return null;
    }
  }

  /**
   * Simulate a trade
   */
  simulateTrade(params) {
    const { signal, entryCandle, futureCandles, balance } = params;
    
    if (!signal || !entryCandle || !futureCandles.length) {
      return null;
    }

    const entryPrice = entryCandle.close;
    const direction = signal.direction;
    const stopLoss = signal.stopLoss?.price || this.calculateDefaultSL(entryPrice, direction);
    const tp1 = signal.takeProfits?.tp1?.price || this.calculateDefaultTP(entryPrice, stopLoss, direction, 1.5);
    const tp2 = signal.takeProfits?.tp2?.price || this.calculateDefaultTP(entryPrice, stopLoss, direction, 2.5);
    const tp3 = signal.takeProfits?.tp3?.price || this.calculateDefaultTP(entryPrice, stopLoss, direction, 4.0);

    // Calculate position size
    const riskAmount = balance * (this.config.riskPerTrade / 100);
    const slDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount / slDistance;

    // Simulate through future candles
    let exitPrice = null;
    let exitReason = null;
    let exitTime = null;
    let tp1Hit = false;
    let tp2Hit = false;

    for (const candle of futureCandles) {
      // Check stop loss
      if (direction === 'BUY') {
        if (candle.low <= stopLoss) {
          exitPrice = stopLoss - (this.config.slippage * 0.0001);
          exitReason = 'stop_loss';
          exitTime = candle.timestamp;
          break;
        }
        // Check take profits
        if (!tp1Hit && candle.high >= tp1) {
          tp1Hit = true;
        }
        if (!tp2Hit && candle.high >= tp2) {
          tp2Hit = true;
        }
        if (candle.high >= tp3) {
          exitPrice = tp3;
          exitReason = 'tp3';
          exitTime = candle.timestamp;
          break;
        }
      } else {
        if (candle.high >= stopLoss) {
          exitPrice = stopLoss + (this.config.slippage * 0.0001);
          exitReason = 'stop_loss';
          exitTime = candle.timestamp;
          break;
        }
        if (!tp1Hit && candle.low <= tp1) {
          tp1Hit = true;
        }
        if (!tp2Hit && candle.low <= tp2) {
          tp2Hit = true;
        }
        if (candle.low <= tp3) {
          exitPrice = tp3;
          exitReason = 'tp3';
          exitTime = candle.timestamp;
          break;
        }
      }
    }

    // If no exit, use last candle close
    if (!exitPrice) {
      exitPrice = futureCandles[futureCandles.length - 1].close;
      exitReason = 'timeout';
      exitTime = futureCandles[futureCandles.length - 1].timestamp;
    }

    // Calculate P&L
    let pnl;
    if (direction === 'BUY') {
      pnl = (exitPrice - entryPrice) * positionSize;
    } else {
      pnl = (entryPrice - exitPrice) * positionSize;
    }

    // Apply commission
    pnl -= this.config.commission * 2; // Entry and exit

    return {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: signal.symbol,
      direction,
      entryPrice,
      entryTime: entryCandle.timestamp,
      exitPrice,
      exitTime,
      exitReason,
      stopLoss,
      tp1,
      tp2,
      tp3,
      tp1Hit,
      tp2Hit,
      positionSize,
      pnl: Math.round(pnl * 100) / 100,
      pnlPercent: Math.round((pnl / balance) * 10000) / 100,
      isWin: pnl > 0,
      confluenceScore: signal.confluenceScore,
    };
  }

  /**
   * Calculate default stop loss
   */
  calculateDefaultSL(entryPrice, direction) {
    const slDistance = entryPrice * 0.01; // 1% default
    return direction === 'BUY' 
      ? entryPrice - slDistance 
      : entryPrice + slDistance;
  }

  /**
   * Calculate default take profit
   */
  calculateDefaultTP(entryPrice, stopLoss, direction, ratio) {
    const slDistance = Math.abs(entryPrice - stopLoss);
    const tpDistance = slDistance * ratio;
    return direction === 'BUY'
      ? entryPrice + tpDistance
      : entryPrice - tpDistance;
  }

  /**
   * Calculate trading statistics
   */
  calculateStatistics(trades, initialBalance, finalBalance) {
    if (trades.length === 0) {
      return this.getEmptyStats();
    }

    const wins = trades.filter(t => t.isWin);
    const losses = trades.filter(t => !t.isWin);
    
    const winRate = (wins.length / trades.length) * 100;
    const avgWin = wins.length > 0 
      ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length 
      : 0;
    const avgLoss = losses.length > 0 
      ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
      : 0;
    
    const profitFactor = avgLoss > 0 
      ? (wins.reduce((sum, t) => sum + t.pnl, 0)) / Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))
      : wins.length > 0 ? Infinity : 0;

    const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);

    // Calculate consecutive wins/losses
    let maxConsecWins = 0;
    let maxConsecLosses = 0;
    let currentConsecWins = 0;
    let currentConsecLosses = 0;

    trades.forEach(trade => {
      if (trade.isWin) {
        currentConsecWins++;
        currentConsecLosses = 0;
        maxConsecWins = Math.max(maxConsecWins, currentConsecWins);
      } else {
        currentConsecLosses++;
        currentConsecWins = 0;
        maxConsecLosses = Math.max(maxConsecLosses, currentConsecLosses);
      }
    });

    // Calculate Sharpe Ratio (simplified)
    const returns = trades.map(t => t.pnlPercent);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

    // Exit reason breakdown
    const exitReasons = {};
    trades.forEach(t => {
      exitReasons[t.exitReason] = (exitReasons[t.exitReason] || 0) + 1;
    });

    return {
      totalTrades: trades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: Math.round(winRate * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      maxConsecutiveWins: maxConsecWins,
      maxConsecutiveLosses: maxConsecLosses,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      totalPnL: Math.round((finalBalance - initialBalance) * 100) / 100,
      returnPercent: Math.round(((finalBalance - initialBalance) / initialBalance) * 10000) / 100,
      exitReasons,
      avgHoldingPeriod: this.calculateAvgHoldingPeriod(trades),
    };
  }

  /**
   * Calculate average holding period
   */
  calculateAvgHoldingPeriod(trades) {
    if (trades.length === 0) return 0;

    const totalHoldingTime = trades.reduce((sum, t) => {
      const entryTime = new Date(t.entryTime).getTime();
      const exitTime = new Date(t.exitTime).getTime();
      return sum + (exitTime - entryTime);
    }, 0);

    const avgMs = totalHoldingTime / trades.length;
    const avgHours = avgMs / (1000 * 60 * 60);
    
    return Math.round(avgHours * 10) / 10;
  }

  /**
   * Get empty statistics
   */
  getEmptyStats() {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      sharpeRatio: 0,
      totalPnL: 0,
      returnPercent: 0,
      exitReasons: {},
      avgHoldingPeriod: 0,
    };
  }

  /**
   * Generate backtest report
   */
  generateReport(results) {
    const { stats, trades, equityCurve, maxDrawdown, finalBalance, returnPercent } = results;

    return {
      summary: {
        totalTrades: stats.totalTrades,
        winRate: `${stats.winRate}%`,
        profitFactor: stats.profitFactor,
        returnPercent: `${returnPercent}%`,
        maxDrawdown: `${maxDrawdown}%`,
        sharpeRatio: stats.sharpeRatio,
      },
      performance: {
        initialBalance: this.config.initialBalance,
        finalBalance,
        totalPnL: stats.totalPnL,
        avgWin: stats.avgWin,
        avgLoss: stats.avgLoss,
        expectancy: stats.expectancy,
      },
      riskMetrics: {
        maxDrawdown: `${maxDrawdown}%`,
        maxConsecutiveLosses: stats.maxConsecutiveLosses,
        avgHoldingPeriod: `${stats.avgHoldingPeriod} hours`,
      },
      tradeBreakdown: {
        wins: stats.winningTrades,
        losses: stats.losingTrades,
        exitReasons: stats.exitReasons,
      },
      equityCurve: equityCurve.slice(-100), // Last 100 points
      recentTrades: trades.slice(-10), // Last 10 trades
    };
  }

  /**
   * Compare multiple strategies
   */
  compareStrategies(results) {
    return results.map(r => ({
      name: r.name || 'Strategy',
      winRate: r.stats.winRate,
      profitFactor: r.stats.profitFactor,
      returnPercent: r.returnPercent,
      maxDrawdown: r.maxDrawdown,
      sharpeRatio: r.stats.sharpeRatio,
      totalTrades: r.stats.totalTrades,
    })).sort((a, b) => b.sharpeRatio - a.sharpeRatio);
  }
}
