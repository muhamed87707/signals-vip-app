/**
 * RiskManager - Risk Management Engine
 * Calculates position size, validates R:R ratio, tracks daily drawdown
 * Ensures minimum 1:2 risk/reward ratio
 */

export class RiskManager {
  constructor(settings = {}) {
    this.defaultSettings = {
      accountBalance: 10000,
      riskPerTrade: 1,           // 1% per trade
      maxDailyDrawdown: 3,       // 3% max daily loss
      minRiskReward: 2,          // Minimum 1:2 R:R
      maxOpenTrades: 5,
      maxCorrelatedTrades: 2,    // Max trades on correlated pairs
      pipValues: {
        // Standard lot pip values for major pairs
        'EURUSD': 10,
        'GBPUSD': 10,
        'USDJPY': 9.1,
        'USDCHF': 10.2,
        'AUDUSD': 10,
        'NZDUSD': 10,
        'USDCAD': 7.5,
        'XAUUSD': 1,    // Gold - $1 per 0.01 lot per pip
        'XAGUSD': 0.5,  // Silver
        'US30': 1,      // Dow Jones
        'US100': 1,     // Nasdaq
        'US500': 1      // S&P 500
      }
    };

    this.settings = { ...this.defaultSettings, ...settings };
    this.dailyPnL = 0;
    this.openTrades = [];
  }

  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Calculate position size based on risk parameters
   */
  calculatePositionSize(params) {
    const {
      symbol,
      entryPrice,
      stopLoss,
      accountBalance = this.settings.accountBalance,
      riskPercent = this.settings.riskPerTrade
    } = params;

    // Calculate risk amount in account currency
    const riskAmount = accountBalance * (riskPercent / 100);

    // Calculate stop loss distance in pips
    const pipSize = this.getPipSize(symbol);
    const slDistance = Math.abs(entryPrice - stopLoss);
    const slPips = slDistance / pipSize;

    // Get pip value for the symbol
    const pipValue = this.getPipValue(symbol);

    // Calculate lot size
    // Position Size = Risk Amount / (SL Pips × Pip Value)
    const lotSize = riskAmount / (slPips * pipValue);

    // Round to standard lot sizes
    const standardLot = Math.floor(lotSize * 100) / 100;
    const miniLot = Math.floor(lotSize * 10) / 10;
    const microLot = Math.floor(lotSize * 100) / 100;

    return {
      symbol,
      entryPrice,
      stopLoss,
      slPips: Math.round(slPips * 10) / 10,
      riskAmount: Math.round(riskAmount * 100) / 100,
      riskPercent,
      recommendedLots: {
        standard: Math.max(0.01, standardLot),
        mini: Math.max(0.01, miniLot),
        micro: Math.max(0.01, microLot)
      },
      pipValue,
      potentialLoss: Math.round(slPips * pipValue * standardLot * 100) / 100
    };
  }

  /**
   * Validate risk/reward ratio
   */
  validateRiskReward(params) {
    const {
      entryPrice,
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      direction
    } = params;

    const slDistance = Math.abs(entryPrice - stopLoss);
    
    const results = {
      valid: false,
      ratios: {},
      recommendation: null
    };

    // Calculate R:R for each TP
    if (takeProfit1) {
      const tp1Distance = Math.abs(takeProfit1 - entryPrice);
      results.ratios.tp1 = Math.round((tp1Distance / slDistance) * 100) / 100;
    }

    if (takeProfit2) {
      const tp2Distance = Math.abs(takeProfit2 - entryPrice);
      results.ratios.tp2 = Math.round((tp2Distance / slDistance) * 100) / 100;
    }

    if (takeProfit3) {
      const tp3Distance = Math.abs(takeProfit3 - entryPrice);
      results.ratios.tp3 = Math.round((tp3Distance / slDistance) * 100) / 100;
    }

    // Validate minimum R:R (at least TP1 should meet minimum)
    results.valid = results.ratios.tp1 >= this.settings.minRiskReward;

    // Generate recommendation
    if (!results.valid) {
      const minTP = direction === 'BUY' 
        ? entryPrice + (slDistance * this.settings.minRiskReward)
        : entryPrice - (slDistance * this.settings.minRiskReward);
      
      results.recommendation = {
        ar: `TP1 يجب أن يكون على الأقل ${this.settings.minRiskReward}:1 - الحد الأدنى المقترح: ${minTP.toFixed(5)}`,
        en: `TP1 must be at least ${this.settings.minRiskReward}:1 - Minimum suggested: ${minTP.toFixed(5)}`
      };
    }

    // Calculate average R:R
    const ratioValues = Object.values(results.ratios);
    results.averageRR = ratioValues.length > 0 
      ? Math.round((ratioValues.reduce((a, b) => a + b, 0) / ratioValues.length) * 100) / 100
      : 0;

    return results;
  }

  /**
   * Check if trade is allowed based on daily drawdown
   */
  checkDailyDrawdown() {
    const maxLoss = this.settings.accountBalance * (this.settings.maxDailyDrawdown / 100);
    const currentDrawdown = Math.abs(Math.min(0, this.dailyPnL));
    const remainingRisk = maxLoss - currentDrawdown;

    return {
      allowed: currentDrawdown < maxLoss,
      currentDrawdown: Math.round(currentDrawdown * 100) / 100,
      maxDrawdown: Math.round(maxLoss * 100) / 100,
      remainingRisk: Math.round(remainingRisk * 100) / 100,
      drawdownPercent: Math.round((currentDrawdown / this.settings.accountBalance) * 10000) / 100,
      message: currentDrawdown >= maxLoss ? {
        ar: 'تم الوصول للحد الأقصى للخسارة اليومية - توقف عن التداول',
        en: 'Daily drawdown limit reached - stop trading'
      } : null
    };
  }

  /**
   * Update daily P&L
   */
  updateDailyPnL(pnl) {
    this.dailyPnL += pnl;
    return this.checkDailyDrawdown();
  }

  /**
   * Reset daily P&L (call at start of new trading day)
   */
  resetDailyPnL() {
    this.dailyPnL = 0;
  }


  /**
   * Calculate optimal stop loss based on ATR
   */
  calculateATRStopLoss(params) {
    const {
      entryPrice,
      atr,
      direction,
      multiplier = 2
    } = params;

    const slDistance = atr * multiplier;

    const stopLoss = direction === 'BUY'
      ? entryPrice - slDistance
      : entryPrice + slDistance;

    return {
      stopLoss: Math.round(stopLoss * 100000) / 100000,
      distance: Math.round(slDistance * 100000) / 100000,
      atrMultiplier: multiplier
    };
  }

  /**
   * Calculate take profit levels based on R:R
   */
  calculateTakeProfits(params) {
    const {
      entryPrice,
      stopLoss,
      direction,
      ratios = [2, 3, 5] // Default R:R ratios for TP1, TP2, TP3
    } = params;

    const slDistance = Math.abs(entryPrice - stopLoss);
    const takeProfits = {};

    ratios.forEach((ratio, index) => {
      const tpDistance = slDistance * ratio;
      const tp = direction === 'BUY'
        ? entryPrice + tpDistance
        : entryPrice - tpDistance;

      takeProfits[`tp${index + 1}`] = {
        price: Math.round(tp * 100000) / 100000,
        ratio: ratio,
        distance: Math.round(tpDistance * 100000) / 100000
      };
    });

    return takeProfits;
  }

  /**
   * Check correlation between pairs
   */
  checkCorrelation(symbol1, symbol2) {
    const correlations = {
      // Highly correlated pairs
      'EURUSD-GBPUSD': 0.85,
      'EURUSD-USDCHF': -0.90,
      'AUDUSD-NZDUSD': 0.90,
      'USDJPY-USDCHF': 0.60,
      'XAUUSD-XAGUSD': 0.85,
      'US30-US500': 0.95,
      'US100-US500': 0.90
    };

    const key1 = `${symbol1}-${symbol2}`;
    const key2 = `${symbol2}-${symbol1}`;

    return correlations[key1] || correlations[key2] || 0;
  }

  /**
   * Validate new trade against open positions
   */
  validateNewTrade(newTrade) {
    const validation = {
      allowed: true,
      warnings: [],
      errors: []
    };

    // Check max open trades
    if (this.openTrades.length >= this.settings.maxOpenTrades) {
      validation.allowed = false;
      validation.errors.push({
        ar: `الحد الأقصى للصفقات المفتوحة (${this.settings.maxOpenTrades}) تم الوصول إليه`,
        en: `Maximum open trades (${this.settings.maxOpenTrades}) reached`
      });
    }

    // Check correlation
    let correlatedCount = 0;
    for (const trade of this.openTrades) {
      const correlation = this.checkCorrelation(newTrade.symbol, trade.symbol);
      if (Math.abs(correlation) > 0.7) {
        correlatedCount++;
        if (correlatedCount >= this.settings.maxCorrelatedTrades) {
          validation.warnings.push({
            ar: `تحذير: صفقة مرتبطة بـ ${trade.symbol} (ارتباط: ${correlation})`,
            en: `Warning: Correlated with ${trade.symbol} (correlation: ${correlation})`
          });
        }
      }
    }

    if (correlatedCount >= this.settings.maxCorrelatedTrades) {
      validation.allowed = false;
      validation.errors.push({
        ar: 'الحد الأقصى للصفقات المرتبطة تم الوصول إليه',
        en: 'Maximum correlated trades reached'
      });
    }

    // Check daily drawdown
    const drawdownCheck = this.checkDailyDrawdown();
    if (!drawdownCheck.allowed) {
      validation.allowed = false;
      validation.errors.push(drawdownCheck.message);
    }

    return validation;
  }

  /**
   * Add trade to open positions
   */
  addOpenTrade(trade) {
    this.openTrades.push({
      id: trade.id || Date.now(),
      symbol: trade.symbol,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      stopLoss: trade.stopLoss,
      takeProfits: trade.takeProfits,
      lotSize: trade.lotSize,
      openTime: new Date()
    });
  }

  /**
   * Remove trade from open positions
   */
  closeTrade(tradeId, pnl) {
    const index = this.openTrades.findIndex(t => t.id === tradeId);
    if (index !== -1) {
      this.openTrades.splice(index, 1);
      this.updateDailyPnL(pnl);
    }
  }

  /**
   * Get pip size for symbol
   */
  getPipSize(symbol) {
    // JPY pairs have 2 decimal places
    if (symbol.includes('JPY')) return 0.01;
    // Gold
    if (symbol === 'XAUUSD') return 0.1;
    // Silver
    if (symbol === 'XAGUSD') return 0.01;
    // Indices
    if (['US30', 'US100', 'US500', 'GER40', 'UK100'].includes(symbol)) return 1;
    // Standard forex pairs
    return 0.0001;
  }

  /**
   * Get pip value for symbol
   */
  getPipValue(symbol) {
    return this.settings.pipValues[symbol] || 10;
  }

  /**
   * Calculate potential profit/loss
   */
  calculatePotentialPnL(params) {
    const {
      symbol,
      entryPrice,
      currentPrice,
      lotSize,
      direction
    } = params;

    const pipSize = this.getPipSize(symbol);
    const pipValue = this.getPipValue(symbol);

    let priceDiff;
    if (direction === 'BUY') {
      priceDiff = currentPrice - entryPrice;
    } else {
      priceDiff = entryPrice - currentPrice;
    }

    const pips = priceDiff / pipSize;
    const pnl = pips * pipValue * lotSize;

    return {
      pips: Math.round(pips * 10) / 10,
      pnl: Math.round(pnl * 100) / 100,
      pnlPercent: Math.round((pnl / this.settings.accountBalance) * 10000) / 100
    };
  }

  /**
   * Get risk summary
   */
  getRiskSummary() {
    const drawdown = this.checkDailyDrawdown();
    
    return {
      accountBalance: this.settings.accountBalance,
      riskPerTrade: this.settings.riskPerTrade,
      maxDailyDrawdown: this.settings.maxDailyDrawdown,
      currentDailyPnL: Math.round(this.dailyPnL * 100) / 100,
      drawdownStatus: drawdown,
      openTradesCount: this.openTrades.length,
      maxOpenTrades: this.settings.maxOpenTrades,
      openTrades: this.openTrades.map(t => ({
        symbol: t.symbol,
        direction: t.direction,
        entryPrice: t.entryPrice
      }))
    };
  }
}

export default RiskManager;
