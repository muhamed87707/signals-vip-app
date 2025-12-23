/**
 * Risk Manager
 * إدارة المخاطر
 * 
 * Handles:
 * - Stop Loss calculation
 * - Take Profit levels (TP1, TP2, TP3)
 * - Position sizing
 * - Risk/Reward ratio
 * - Volatility adjustment
 */

export class RiskManager {
  constructor(config = {}) {
    this.config = {
      defaultRiskPercent: 1.0, // 1% risk per trade
      maxRiskPercent: 2.0, // Maximum 2% risk
      minRiskReward: 2.5, // Minimum 1:2.5 R:R
      tpRatios: {
        tp1: 1.5, // 1:1.5 R:R
        tp2: 2.5, // 1:2.5 R:R
        tp3: 4.0, // 1:4 R:R
      },
      partialClosePercents: {
        tp1: 40, // Close 40% at TP1
        tp2: 40, // Close 40% at TP2
        tp3: 20, // Close 20% at TP3
      },
      atrMultiplier: 1.5, // SL = 1.5 * ATR
      maxSlPips: 50, // Maximum SL in pips
      minSlPips: 10, // Minimum SL in pips
      ...config,
    };

    // Pip values for different instruments
    this.pipValues = {
      // Forex majors (4 decimal)
      EURUSD: 0.0001, GBPUSD: 0.0001, AUDUSD: 0.0001, NZDUSD: 0.0001,
      USDCHF: 0.0001, USDCAD: 0.0001,
      // JPY pairs (2 decimal)
      USDJPY: 0.01, EURJPY: 0.01, GBPJPY: 0.01, AUDJPY: 0.01,
      // Metals
      XAUUSD: 0.1, XAGUSD: 0.01,
      // Indices
      US30: 1, US500: 0.1, US100: 0.1,
    };
  }

  /**
   * Calculate complete risk management for a signal
   * @param {Object} params - Signal parameters
   * @returns {Object} Risk management details
   */
  calculate(params) {
    const {
      symbol,
      direction,
      entryPrice,
      accountBalance,
      atr,
      swingHigh,
      swingLow,
      orderBlock,
      fvg,
    } = params;

    const stopLoss = this.calculateStopLoss({
      symbol,
      direction,
      entryPrice,
      atr,
      swingHigh,
      swingLow,
      orderBlock,
      fvg,
    });

    const takeProfits = this.calculateTakeProfits({
      symbol,
      direction,
      entryPrice,
      stopLoss,
    });

    const positionSize = this.calculatePositionSize({
      symbol,
      accountBalance,
      entryPrice,
      stopLoss,
      riskPercent: this.config.defaultRiskPercent,
    });

    const riskReward = this.calculateRiskReward(entryPrice, stopLoss, takeProfits);
    const volatilityAdjustment = this.calculateVolatilityAdjustment(atr, symbol);

    return {
      symbol,
      direction,
      entry: entryPrice,
      stopLoss,
      takeProfits,
      positionSize,
      riskReward,
      volatilityAdjustment,
      riskAmount: positionSize.riskAmount,
      potentialProfit: this.calculatePotentialProfit(positionSize, takeProfits, entryPrice, direction),
      isValid: this.validateRiskParameters(stopLoss, takeProfits, riskReward),
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate Stop Loss
   */
  calculateStopLoss(params) {
    const { symbol, direction, entryPrice, atr, swingHigh, swingLow, orderBlock, fvg } = params;
    const pipValue = this.getPipValue(symbol);
    
    let slPrice;
    let slMethod = 'atr';
    let slPips;

    // Method 1: ATR-based SL
    const atrSl = atr * this.config.atrMultiplier;
    
    // Method 2: Structure-based SL (swing high/low)
    let structureSl = null;
    if (direction === 'BUY' && swingLow) {
      structureSl = entryPrice - swingLow;
      slMethod = 'structure';
    } else if (direction === 'SELL' && swingHigh) {
      structureSl = swingHigh - entryPrice;
      slMethod = 'structure';
    }

    // Method 3: Order Block based SL
    let obSl = null;
    if (orderBlock) {
      if (direction === 'BUY') {
        obSl = entryPrice - orderBlock.low;
      } else {
        obSl = orderBlock.high - entryPrice;
      }
      slMethod = 'orderBlock';
    }

    // Choose the tightest valid SL
    const slOptions = [atrSl, structureSl, obSl].filter(sl => sl !== null && sl > 0);
    let chosenSl = Math.min(...slOptions);

    // Apply min/max constraints
    const minSl = this.config.minSlPips * pipValue;
    const maxSl = this.config.maxSlPips * pipValue;
    chosenSl = Math.max(minSl, Math.min(maxSl, chosenSl));

    // Calculate SL price
    if (direction === 'BUY') {
      slPrice = entryPrice - chosenSl;
    } else {
      slPrice = entryPrice + chosenSl;
    }

    slPips = chosenSl / pipValue;

    return {
      price: this.roundPrice(slPrice, symbol),
      pips: Math.round(slPips * 10) / 10,
      method: slMethod,
      distance: chosenSl,
    };
  }

  /**
   * Calculate Take Profit levels
   */
  calculateTakeProfits(params) {
    const { symbol, direction, entryPrice, stopLoss } = params;
    const slDistance = stopLoss.distance;

    const tp1Distance = slDistance * this.config.tpRatios.tp1;
    const tp2Distance = slDistance * this.config.tpRatios.tp2;
    const tp3Distance = slDistance * this.config.tpRatios.tp3;

    let tp1Price, tp2Price, tp3Price;

    if (direction === 'BUY') {
      tp1Price = entryPrice + tp1Distance;
      tp2Price = entryPrice + tp2Distance;
      tp3Price = entryPrice + tp3Distance;
    } else {
      tp1Price = entryPrice - tp1Distance;
      tp2Price = entryPrice - tp2Distance;
      tp3Price = entryPrice - tp3Distance;
    }

    const pipValue = this.getPipValue(symbol);

    return {
      tp1: {
        price: this.roundPrice(tp1Price, symbol),
        pips: Math.round((tp1Distance / pipValue) * 10) / 10,
        ratio: this.config.tpRatios.tp1,
        closePercent: this.config.partialClosePercents.tp1,
      },
      tp2: {
        price: this.roundPrice(tp2Price, symbol),
        pips: Math.round((tp2Distance / pipValue) * 10) / 10,
        ratio: this.config.tpRatios.tp2,
        closePercent: this.config.partialClosePercents.tp2,
      },
      tp3: {
        price: this.roundPrice(tp3Price, symbol),
        pips: Math.round((tp3Distance / pipValue) * 10) / 10,
        ratio: this.config.tpRatios.tp3,
        closePercent: this.config.partialClosePercents.tp3,
      },
    };
  }

  /**
   * Calculate Position Size
   */
  calculatePositionSize(params) {
    const { symbol, accountBalance, entryPrice, stopLoss, riskPercent } = params;
    
    const riskAmount = accountBalance * (riskPercent / 100);
    const slPips = stopLoss.pips;
    const pipValue = this.getPipValue(symbol);

    // Calculate lot size based on risk
    // Risk = Lots * Pips * Pip Value per Lot
    // For standard lot (100,000 units), pip value varies by pair
    const pipValuePerLot = this.getPipValuePerLot(symbol, entryPrice);
    const lots = riskAmount / (slPips * pipValuePerLot);

    // Round to standard lot sizes
    const standardLots = Math.floor(lots * 100) / 100; // Round to 0.01 lots
    const miniLots = Math.floor(lots * 10) / 10; // Round to 0.1 lots
    const microLots = Math.floor(lots * 100) / 100; // Round to 0.01 lots

    return {
      lots: standardLots,
      miniLots,
      microLots,
      units: Math.round(standardLots * 100000),
      riskAmount: Math.round(riskAmount * 100) / 100,
      riskPercent,
      pipValuePerLot,
    };
  }

  /**
   * Calculate Risk/Reward ratios
   */
  calculateRiskReward(entryPrice, stopLoss, takeProfits) {
    const slDistance = stopLoss.distance;

    return {
      tp1: Math.round((takeProfits.tp1.pips / stopLoss.pips) * 100) / 100,
      tp2: Math.round((takeProfits.tp2.pips / stopLoss.pips) * 100) / 100,
      tp3: Math.round((takeProfits.tp3.pips / stopLoss.pips) * 100) / 100,
      average: Math.round(
        ((takeProfits.tp1.pips * 0.4 + takeProfits.tp2.pips * 0.4 + takeProfits.tp3.pips * 0.2) / stopLoss.pips) * 100
      ) / 100,
      meetsMinimum: takeProfits.tp2.ratio >= this.config.minRiskReward,
    };
  }

  /**
   * Calculate volatility adjustment
   */
  calculateVolatilityAdjustment(atr, symbol) {
    const pipValue = this.getPipValue(symbol);
    const atrPips = atr / pipValue;

    // Normal ATR ranges by instrument type
    const normalRanges = {
      forex: { low: 30, high: 80 },
      metals: { low: 100, high: 300 },
      indices: { low: 50, high: 200 },
    };

    const instrumentType = this.getInstrumentType(symbol);
    const range = normalRanges[instrumentType] || normalRanges.forex;

    let adjustment = 1.0;
    let volatilityLevel = 'normal';

    if (atrPips < range.low) {
      adjustment = 1.2; // Increase position size in low volatility
      volatilityLevel = 'low';
    } else if (atrPips > range.high) {
      adjustment = 0.7; // Decrease position size in high volatility
      volatilityLevel = 'high';
    }

    return {
      atrPips: Math.round(atrPips * 10) / 10,
      adjustment,
      volatilityLevel,
      recommendation: this.getVolatilityRecommendation(volatilityLevel),
    };
  }

  /**
   * Calculate potential profit
   */
  calculatePotentialProfit(positionSize, takeProfits, entryPrice, direction) {
    const { lots, pipValuePerLot } = positionSize;

    const tp1Profit = lots * takeProfits.tp1.pips * pipValuePerLot * (takeProfits.tp1.closePercent / 100);
    const tp2Profit = lots * takeProfits.tp2.pips * pipValuePerLot * (takeProfits.tp2.closePercent / 100);
    const tp3Profit = lots * takeProfits.tp3.pips * pipValuePerLot * (takeProfits.tp3.closePercent / 100);

    return {
      tp1: Math.round(tp1Profit * 100) / 100,
      tp2: Math.round(tp2Profit * 100) / 100,
      tp3: Math.round(tp3Profit * 100) / 100,
      total: Math.round((tp1Profit + tp2Profit + tp3Profit) * 100) / 100,
    };
  }

  /**
   * Validate risk parameters
   */
  validateRiskParameters(stopLoss, takeProfits, riskReward) {
    const issues = [];

    // Check SL is within bounds
    if (stopLoss.pips < this.config.minSlPips) {
      issues.push('Stop loss too tight');
    }
    if (stopLoss.pips > this.config.maxSlPips) {
      issues.push('Stop loss too wide');
    }

    // Check R:R meets minimum
    if (!riskReward.meetsMinimum) {
      issues.push(`Risk/Reward below minimum ${this.config.minRiskReward}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get pip value for symbol
   */
  getPipValue(symbol) {
    return this.pipValues[symbol] || 0.0001;
  }

  /**
   * Get pip value per standard lot
   */
  getPipValuePerLot(symbol, price) {
    const instrumentType = this.getInstrumentType(symbol);
    
    // Approximate pip values per standard lot in USD
    if (instrumentType === 'forex') {
      if (symbol.endsWith('USD')) {
        return 10; // $10 per pip for XXX/USD pairs
      } else if (symbol.startsWith('USD')) {
        return 10 / price; // Varies for USD/XXX pairs
      }
      return 10; // Default
    } else if (instrumentType === 'metals') {
      if (symbol === 'XAUUSD') return 10; // $10 per 0.1 move
      if (symbol === 'XAGUSD') return 50; // $50 per 0.01 move
    } else if (instrumentType === 'indices') {
      return 1; // $1 per point
    }
    
    return 10;
  }

  /**
   * Get instrument type
   */
  getInstrumentType(symbol) {
    if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 'metals';
    if (['US30', 'US500', 'US100', 'GER40', 'UK100'].includes(symbol)) return 'indices';
    return 'forex';
  }

  /**
   * Round price to appropriate decimals
   */
  roundPrice(price, symbol) {
    const pipValue = this.getPipValue(symbol);
    const decimals = pipValue === 0.01 ? 3 : pipValue === 0.0001 ? 5 : 2;
    return Math.round(price * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Get volatility recommendation
   */
  getVolatilityRecommendation(level) {
    const recommendations = {
      low: 'Consider wider targets, market may be consolidating',
      normal: 'Standard risk parameters apply',
      high: 'Reduce position size, use wider stops',
    };
    return recommendations[level] || recommendations.normal;
  }

  /**
   * Calculate trailing stop
   */
  calculateTrailingStop(params) {
    const { symbol, direction, entryPrice, currentPrice, atr } = params;
    const pipValue = this.getPipValue(symbol);
    
    // Trail by 1 ATR
    const trailDistance = atr;
    let trailPrice;

    if (direction === 'BUY') {
      trailPrice = currentPrice - trailDistance;
      // Don't trail below entry
      trailPrice = Math.max(trailPrice, entryPrice);
    } else {
      trailPrice = currentPrice + trailDistance;
      // Don't trail above entry
      trailPrice = Math.min(trailPrice, entryPrice);
    }

    return {
      price: this.roundPrice(trailPrice, symbol),
      distance: trailDistance,
      pips: Math.round((trailDistance / pipValue) * 10) / 10,
    };
  }

  /**
   * Calculate break-even level
   */
  calculateBreakEven(params) {
    const { symbol, direction, entryPrice, spread = 0 } = params;
    
    // Add spread to break-even
    let bePrice;
    if (direction === 'BUY') {
      bePrice = entryPrice + spread;
    } else {
      bePrice = entryPrice - spread;
    }

    return {
      price: this.roundPrice(bePrice, symbol),
      moveToBeAfterTP1: true, // Move SL to BE after TP1 hit
    };
  }
}
