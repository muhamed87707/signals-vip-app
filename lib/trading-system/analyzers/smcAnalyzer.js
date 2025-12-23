/**
 * SMC Analyzer - Smart Money Concepts Analyzer
 * Detects institutional trading patterns: Order Blocks, FVGs, Liquidity, Market Structure
 */

export class SMCAnalyzer {
  constructor(config = {}) {
    this.config = {
      orderBlockLookback: 50,
      fvgMinSize: 0.0005, // Minimum FVG size as percentage
      liquidityLookback: 100,
      structureLookback: 50,
      ...config,
    };
  }

  /**
   * Perform full SMC analysis
   */
  async analyze(marketData) {
    const candles = marketData.H1?.candles || [];
    const dailyCandles = marketData.D1?.candles || [];
    
    if (candles.length < 50) {
      return this.getEmptyAnalysis();
    }

    // Detect Order Blocks
    const orderBlocks = this.detectOrderBlocks(candles);
    
    // Detect Fair Value Gaps
    const fvgs = this.detectFVGs(candles);
    
    // Detect Liquidity Zones
    const liquidity = this.detectLiquidityZones(candles);
    
    // Analyze Market Structure
    const structure = this.analyzeMarketStructure(candles);
    
    // Calculate Premium/Discount Zones
    const premiumDiscount = this.calculatePremiumDiscount(candles);
    
    // Calculate OTE Zone (Optimal Trade Entry)
    const oteZone = this.calculateOTEZone(candles, structure);

    // Calculate SMC Score
    const score = this.calculateSMCScore(orderBlocks, fvgs, liquidity, structure, premiumDiscount);

    return {
      orderBlocks,
      fvgs,
      liquidity,
      structure,
      premiumDiscount,
      oteZone,
      score,
      bias: structure.bias,
    };
  }

  /**
   * Detect Order Blocks (Bullish and Bearish)
   * Order Block: Last opposite candle before a strong move
   */
  detectOrderBlocks(candles) {
    const orderBlocks = [];
    const lookback = Math.min(this.config.orderBlockLookback, candles.length - 3);
    
    for (let i = candles.length - lookback; i < candles.length - 2; i++) {
      const curr = candles[i];
      const next1 = candles[i + 1];
      const next2 = candles[i + 2];
      
      const currBody = Math.abs(curr.close - curr.open);
      const currRange = curr.high - curr.low;
      const next1Body = Math.abs(next1.close - next1.open);
      const next2Body = Math.abs(next2.close - next2.open);
      
      // Bullish Order Block: Bearish candle followed by strong bullish move
      if (curr.close < curr.open) { // Bearish candle
        const strongBullishMove = next1.close > next1.open && next2.close > next2.open;
        const significantMove = (next1Body + next2Body) > currBody * 2;
        
        if (strongBullishMove && significantMove) {
          orderBlocks.push({
            type: 'bullish',
            high: curr.high,
            low: curr.low,
            open: curr.open,
            close: curr.close,
            index: i,
            timestamp: curr.timestamp,
            mitigated: this.isOrderBlockMitigated(candles, i, 'bullish'),
            strength: this.calculateOrderBlockStrength(curr, next1, next2),
          });
        }
      }
      
      // Bearish Order Block: Bullish candle followed by strong bearish move
      if (curr.close > curr.open) { // Bullish candle
        const strongBearishMove = next1.close < next1.open && next2.close < next2.open;
        const significantMove = (next1Body + next2Body) > currBody * 2;
        
        if (strongBearishMove && significantMove) {
          orderBlocks.push({
            type: 'bearish',
            high: curr.high,
            low: curr.low,
            open: curr.open,
            close: curr.close,
            index: i,
            timestamp: curr.timestamp,
            mitigated: this.isOrderBlockMitigated(candles, i, 'bearish'),
            strength: this.calculateOrderBlockStrength(curr, next1, next2),
          });
        }
      }
    }
    
    // Return only unmitigated order blocks, sorted by strength
    return orderBlocks
      .filter(ob => !ob.mitigated)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);
  }

  /**
   * Check if order block has been mitigated (price returned to it)
   */
  isOrderBlockMitigated(candles, obIndex, type) {
    for (let i = obIndex + 3; i < candles.length; i++) {
      if (type === 'bullish') {
        // Bullish OB mitigated if price goes below its low
        if (candles[i].low < candles[obIndex].low) {
          return true;
        }
      } else {
        // Bearish OB mitigated if price goes above its high
        if (candles[i].high > candles[obIndex].high) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Calculate order block strength
   */
  calculateOrderBlockStrength(ob, next1, next2) {
    const obBody = Math.abs(ob.close - ob.open);
    const moveBody = Math.abs(next1.close - next1.open) + Math.abs(next2.close - next2.open);
    const ratio = moveBody / (obBody || 1);
    return Math.min(100, Math.round(ratio * 20));
  }


  /**
   * Detect Fair Value Gaps (FVGs)
   * FVG: Gap between candle 1's low/high and candle 3's high/low
   */
  detectFVGs(candles) {
    const fvgs = [];
    
    for (let i = 2; i < candles.length; i++) {
      const candle1 = candles[i - 2];
      const candle2 = candles[i - 1];
      const candle3 = candles[i];
      
      const avgPrice = (candle2.high + candle2.low) / 2;
      const minGapSize = avgPrice * this.config.fvgMinSize;
      
      // Bullish FVG: Gap up (candle1.high < candle3.low)
      if (candle3.low > candle1.high) {
        const gapSize = candle3.low - candle1.high;
        if (gapSize >= minGapSize) {
          fvgs.push({
            type: 'bullish',
            high: candle3.low,
            low: candle1.high,
            size: gapSize,
            index: i,
            timestamp: candle3.timestamp,
            filled: this.isFVGFilled(candles, i, 'bullish', candle1.high, candle3.low),
            midpoint: (candle3.low + candle1.high) / 2,
          });
        }
      }
      
      // Bearish FVG: Gap down (candle1.low > candle3.high)
      if (candle1.low > candle3.high) {
        const gapSize = candle1.low - candle3.high;
        if (gapSize >= minGapSize) {
          fvgs.push({
            type: 'bearish',
            high: candle1.low,
            low: candle3.high,
            size: gapSize,
            index: i,
            timestamp: candle3.timestamp,
            filled: this.isFVGFilled(candles, i, 'bearish', candle3.high, candle1.low),
            midpoint: (candle1.low + candle3.high) / 2,
          });
        }
      }
    }
    
    // Return only unfilled FVGs, most recent first
    return fvgs
      .filter(fvg => !fvg.filled)
      .slice(-10)
      .reverse();
  }

  /**
   * Check if FVG has been filled
   */
  isFVGFilled(candles, fvgIndex, type, low, high) {
    for (let i = fvgIndex + 1; i < candles.length; i++) {
      if (type === 'bullish') {
        // Bullish FVG filled if price drops into the gap
        if (candles[i].low <= low) {
          return true;
        }
      } else {
        // Bearish FVG filled if price rises into the gap
        if (candles[i].high >= high) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Detect Liquidity Zones (Equal Highs/Lows, Stop Hunt Areas)
   */
  detectLiquidityZones(candles) {
    const zones = {
      equalHighs: [],
      equalLows: [],
      stopHuntAreas: [],
    };
    
    const lookback = Math.min(this.config.liquidityLookback, candles.length);
    const recentCandles = candles.slice(-lookback);
    const tolerance = 0.0002; // 2 pips tolerance for "equal" levels
    
    // Find Equal Highs (liquidity above)
    const highs = recentCandles.map((c, i) => ({ price: c.high, index: i }));
    for (let i = 0; i < highs.length; i++) {
      const equalCount = highs.filter(h => 
        Math.abs(h.price - highs[i].price) / highs[i].price < tolerance
      ).length;
      
      if (equalCount >= 2) {
        const existing = zones.equalHighs.find(z => 
          Math.abs(z.price - highs[i].price) / highs[i].price < tolerance
        );
        if (!existing) {
          zones.equalHighs.push({
            price: highs[i].price,
            touches: equalCount,
            type: 'resistance',
            liquidityType: 'buy_stops',
          });
        }
      }
    }
    
    // Find Equal Lows (liquidity below)
    const lows = recentCandles.map((c, i) => ({ price: c.low, index: i }));
    for (let i = 0; i < lows.length; i++) {
      const equalCount = lows.filter(l => 
        Math.abs(l.price - lows[i].price) / lows[i].price < tolerance
      ).length;
      
      if (equalCount >= 2) {
        const existing = zones.equalLows.find(z => 
          Math.abs(z.price - lows[i].price) / lows[i].price < tolerance
        );
        if (!existing) {
          zones.equalLows.push({
            price: lows[i].price,
            touches: equalCount,
            type: 'support',
            liquidityType: 'sell_stops',
          });
        }
      }
    }
    
    // Detect Stop Hunt patterns (sweep and reversal)
    for (let i = 2; i < recentCandles.length; i++) {
      const prev = recentCandles[i - 1];
      const curr = recentCandles[i];
      
      // Bullish stop hunt: sweep low then close above
      const recentLow = Math.min(...recentCandles.slice(Math.max(0, i - 10), i).map(c => c.low));
      if (curr.low < recentLow && curr.close > prev.close) {
        zones.stopHuntAreas.push({
          type: 'bullish',
          sweepPrice: curr.low,
          closePrice: curr.close,
          index: i,
        });
      }
      
      // Bearish stop hunt: sweep high then close below
      const recentHigh = Math.max(...recentCandles.slice(Math.max(0, i - 10), i).map(c => c.high));
      if (curr.high > recentHigh && curr.close < prev.close) {
        zones.stopHuntAreas.push({
          type: 'bearish',
          sweepPrice: curr.high,
          closePrice: curr.close,
          index: i,
        });
      }
    }
    
    return zones;
  }

  /**
   * Analyze Market Structure (BOS, CHoCH, Swing Points)
   */
  analyzeMarketStructure(candles) {
    const swingPoints = this.findSwingPoints(candles);
    const bos = this.detectBOS(candles, swingPoints);
    const choch = this.detectCHoCH(candles, swingPoints);
    
    // Determine current structure bias
    let bias = 'neutral';
    if (bos.length > 0) {
      const lastBOS = bos[bos.length - 1];
      bias = lastBOS.type === 'bullish' ? 'bullish' : 'bearish';
    }
    if (choch.length > 0) {
      const lastCHoCH = choch[choch.length - 1];
      // CHoCH overrides BOS as it indicates trend change
      bias = lastCHoCH.type === 'bullish' ? 'bullish' : 'bearish';
    }
    
    return {
      swingPoints,
      bos,
      choch,
      bias,
      lastSwingHigh: swingPoints.highs[swingPoints.highs.length - 1],
      lastSwingLow: swingPoints.lows[swingPoints.lows.length - 1],
    };
  }

  /**
   * Find Swing Highs and Lows
   */
  findSwingPoints(candles, lookback = 5) {
    const swingHighs = [];
    const swingLows = [];
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      const curr = candles[i];
      let isSwingHigh = true;
      let isSwingLow = true;
      
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j === i) continue;
        if (candles[j].high >= curr.high) isSwingHigh = false;
        if (candles[j].low <= curr.low) isSwingLow = false;
      }
      
      if (isSwingHigh) {
        swingHighs.push({
          price: curr.high,
          index: i,
          timestamp: curr.timestamp,
        });
      }
      
      if (isSwingLow) {
        swingLows.push({
          price: curr.low,
          index: i,
          timestamp: curr.timestamp,
        });
      }
    }
    
    return { highs: swingHighs, lows: swingLows };
  }

  /**
   * Detect Break of Structure (BOS)
   * BOS: Price breaks previous swing high/low in trend direction
   */
  detectBOS(candles, swingPoints) {
    const bosEvents = [];
    
    // Check for bullish BOS (break above swing high)
    for (let i = 1; i < swingPoints.highs.length; i++) {
      const prevHigh = swingPoints.highs[i - 1];
      const currHigh = swingPoints.highs[i];
      
      if (currHigh.price > prevHigh.price) {
        bosEvents.push({
          type: 'bullish',
          brokenLevel: prevHigh.price,
          breakPrice: currHigh.price,
          index: currHigh.index,
          timestamp: currHigh.timestamp,
        });
      }
    }
    
    // Check for bearish BOS (break below swing low)
    for (let i = 1; i < swingPoints.lows.length; i++) {
      const prevLow = swingPoints.lows[i - 1];
      const currLow = swingPoints.lows[i];
      
      if (currLow.price < prevLow.price) {
        bosEvents.push({
          type: 'bearish',
          brokenLevel: prevLow.price,
          breakPrice: currLow.price,
          index: currLow.index,
          timestamp: currLow.timestamp,
        });
      }
    }
    
    return bosEvents.sort((a, b) => a.index - b.index);
  }

  /**
   * Detect Change of Character (CHoCH)
   * CHoCH: Price breaks structure in opposite direction (trend reversal signal)
   */
  detectCHoCH(candles, swingPoints) {
    const chochEvents = [];
    
    // Need at least 2 swing highs and 2 swing lows
    if (swingPoints.highs.length < 2 || swingPoints.lows.length < 2) {
      return chochEvents;
    }
    
    // Combine and sort all swing points
    const allSwings = [
      ...swingPoints.highs.map(h => ({ ...h, swingType: 'high' })),
      ...swingPoints.lows.map(l => ({ ...l, swingType: 'low' })),
    ].sort((a, b) => a.index - b.index);
    
    // Look for CHoCH patterns
    for (let i = 3; i < allSwings.length; i++) {
      const swing1 = allSwings[i - 3];
      const swing2 = allSwings[i - 2];
      const swing3 = allSwings[i - 1];
      const swing4 = allSwings[i];
      
      // Bullish CHoCH: Lower lows then break above previous lower high
      if (swing1.swingType === 'low' && swing2.swingType === 'high' &&
          swing3.swingType === 'low' && swing4.swingType === 'high') {
        if (swing3.price < swing1.price && swing4.price > swing2.price) {
          chochEvents.push({
            type: 'bullish',
            brokenLevel: swing2.price,
            breakPrice: swing4.price,
            index: swing4.index,
            timestamp: swing4.timestamp,
          });
        }
      }
      
      // Bearish CHoCH: Higher highs then break below previous higher low
      if (swing1.swingType === 'high' && swing2.swingType === 'low' &&
          swing3.swingType === 'high' && swing4.swingType === 'low') {
        if (swing3.price > swing1.price && swing4.price < swing2.price) {
          chochEvents.push({
            type: 'bearish',
            brokenLevel: swing2.price,
            breakPrice: swing4.price,
            index: swing4.index,
            timestamp: swing4.timestamp,
          });
        }
      }
    }
    
    return chochEvents;
  }


  /**
   * Calculate Premium/Discount Zones
   * Premium: Above equilibrium (50% of range) - sell zone
   * Discount: Below equilibrium - buy zone
   */
  calculatePremiumDiscount(candles, lookback = 50) {
    const recentCandles = candles.slice(-lookback);
    
    const rangeHigh = Math.max(...recentCandles.map(c => c.high));
    const rangeLow = Math.min(...recentCandles.map(c => c.low));
    const equilibrium = (rangeHigh + rangeLow) / 2;
    const range = rangeHigh - rangeLow;
    
    const currentPrice = candles[candles.length - 1].close;
    const pricePosition = (currentPrice - rangeLow) / range;
    
    let zone = 'equilibrium';
    if (pricePosition > 0.7) zone = 'premium';
    else if (pricePosition > 0.5) zone = 'slight_premium';
    else if (pricePosition < 0.3) zone = 'discount';
    else if (pricePosition < 0.5) zone = 'slight_discount';
    
    return {
      rangeHigh,
      rangeLow,
      equilibrium,
      currentPrice,
      pricePosition: Math.round(pricePosition * 100),
      zone,
      premiumZone: {
        high: rangeHigh,
        low: equilibrium + (range * 0.2), // 70% level
      },
      discountZone: {
        high: equilibrium - (range * 0.2), // 30% level
        low: rangeLow,
      },
    };
  }

  /**
   * Calculate OTE Zone (Optimal Trade Entry)
   * OTE: 61.8% - 78.6% Fibonacci retracement of the last impulse move
   */
  calculateOTEZone(candles, structure) {
    if (!structure.lastSwingHigh || !structure.lastSwingLow) {
      return null;
    }
    
    const swingHigh = structure.lastSwingHigh.price;
    const swingLow = structure.lastSwingLow.price;
    const range = swingHigh - swingLow;
    
    // Determine direction based on which swing came last
    const highIndex = structure.lastSwingHigh.index;
    const lowIndex = structure.lastSwingLow.index;
    const direction = highIndex > lowIndex ? 'bullish' : 'bearish';
    
    let oteHigh, oteLow;
    
    if (direction === 'bullish') {
      // For bullish, OTE is retracement from high
      oteHigh = swingHigh - (range * 0.618);
      oteLow = swingHigh - (range * 0.786);
    } else {
      // For bearish, OTE is retracement from low
      oteLow = swingLow + (range * 0.618);
      oteHigh = swingLow + (range * 0.786);
    }
    
    const currentPrice = candles[candles.length - 1].close;
    const inOTE = currentPrice >= Math.min(oteHigh, oteLow) && 
                  currentPrice <= Math.max(oteHigh, oteLow);
    
    return {
      direction,
      high: Math.max(oteHigh, oteLow),
      low: Math.min(oteHigh, oteLow),
      midpoint: (oteHigh + oteLow) / 2,
      swingHigh,
      swingLow,
      currentPrice,
      inOTE,
    };
  }

  /**
   * Calculate overall SMC score
   */
  calculateSMCScore(orderBlocks, fvgs, liquidity, structure, premiumDiscount) {
    let score = 50;
    
    // Order Blocks (max +20)
    const strongOBs = orderBlocks.filter(ob => ob.strength > 60);
    score += Math.min(20, strongOBs.length * 5);
    
    // FVGs (max +15)
    score += Math.min(15, fvgs.length * 3);
    
    // Liquidity (max +15)
    const liquidityCount = liquidity.equalHighs.length + liquidity.equalLows.length;
    score += Math.min(15, liquidityCount * 3);
    
    // Structure clarity (max +15)
    if (structure.bos.length > 0) score += 5;
    if (structure.choch.length > 0) score += 10;
    
    // Premium/Discount alignment (max +10)
    if (premiumDiscount.zone === 'discount' || premiumDiscount.zone === 'premium') {
      score += 10;
    } else if (premiumDiscount.zone === 'slight_discount' || premiumDiscount.zone === 'slight_premium') {
      score += 5;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get empty analysis
   */
  getEmptyAnalysis() {
    return {
      orderBlocks: [],
      fvgs: [],
      liquidity: { equalHighs: [], equalLows: [], stopHuntAreas: [] },
      structure: { swingPoints: { highs: [], lows: [] }, bos: [], choch: [], bias: 'neutral' },
      premiumDiscount: { zone: 'equilibrium', pricePosition: 50 },
      oteZone: null,
      score: 0,
      bias: 'neutral',
    };
  }
}

export default SMCAnalyzer;
