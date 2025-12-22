/**
 * SmartMoneyAnalyzer - Smart Money Concepts (SMC) Analysis Engine
 * Detects Order Blocks, Fair Value Gaps, Break of Structure, Change of Character
 * Identifies institutional trading patterns and liquidity zones
 */

export class SmartMoneyAnalyzer {
  constructor() {
    this.structurePoints = [];
  }

  /**
   * Main analysis function - analyzes all SMC concepts
   */
  async analyze(priceData) {
    if (!priceData || priceData.length < 100) {
      return { error: 'Insufficient price data', minRequired: 100 };
    }

    const results = {
      timestamp: new Date(),
      marketStructure: this.analyzeMarketStructure(priceData),
      orderBlocks: this.detectOrderBlocks(priceData),
      fairValueGaps: this.detectFairValueGaps(priceData),
      liquidityZones: this.detectLiquidityZones(priceData),
      premiumDiscount: this.calculatePremiumDiscount(priceData),
      summary: null
    };

    results.summary = this.generateSummary(results, priceData);
    return results;
  }

  // ==================== MARKET STRUCTURE ====================

  /**
   * Analyze market structure - HH, HL, LH, LL, BOS, CHoCH
   */
  analyzeMarketStructure(data) {
    const swings = this.findSwingPoints(data);
    const structure = {
      trend: 'NEUTRAL',
      swingHighs: swings.highs,
      swingLows: swings.lows,
      bos: [], // Break of Structure
      choch: [], // Change of Character
      currentBias: 'NEUTRAL'
    };

    // Determine trend from swing points
    if (swings.highs.length >= 2 && swings.lows.length >= 2) {
      const recentHighs = swings.highs.slice(-3);
      const recentLows = swings.lows.slice(-3);

      // Check for Higher Highs and Higher Lows (Uptrend)
      const higherHighs = recentHighs.length >= 2 && 
        recentHighs[recentHighs.length - 1].price > recentHighs[recentHighs.length - 2].price;
      const higherLows = recentLows.length >= 2 && 
        recentLows[recentLows.length - 1].price > recentLows[recentLows.length - 2].price;

      // Check for Lower Highs and Lower Lows (Downtrend)
      const lowerHighs = recentHighs.length >= 2 && 
        recentHighs[recentHighs.length - 1].price < recentHighs[recentHighs.length - 2].price;
      const lowerLows = recentLows.length >= 2 && 
        recentLows[recentLows.length - 1].price < recentLows[recentLows.length - 2].price;

      if (higherHighs && higherLows) {
        structure.trend = 'BULLISH';
        structure.currentBias = 'BULLISH';
      } else if (lowerHighs && lowerLows) {
        structure.trend = 'BEARISH';
        structure.currentBias = 'BEARISH';
      }
    }

    // Detect Break of Structure (BOS)
    structure.bos = this.detectBOS(data, swings);

    // Detect Change of Character (CHoCH)
    structure.choch = this.detectCHoCH(data, swings);

    return structure;
  }

  /**
   * Find swing highs and lows
   */
  findSwingPoints(data, lookback = 3) {
    const swings = { highs: [], lows: [] };

    for (let i = lookback; i < data.length - lookback; i++) {
      let isSwingHigh = true;
      let isSwingLow = true;

      for (let j = 1; j <= lookback; j++) {
        if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) {
          isSwingHigh = false;
        }
        if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) {
          isSwingLow = false;
        }
      }

      if (isSwingHigh) {
        swings.highs.push({
          index: i,
          price: data[i].high,
          time: data[i].time,
          broken: false
        });
      }
      if (isSwingLow) {
        swings.lows.push({
          index: i,
          price: data[i].low,
          time: data[i].time,
          broken: false
        });
      }
    }

    return swings;
  }

  /**
   * Detect Break of Structure (BOS)
   * BOS occurs when price breaks a swing high/low in the direction of the trend
   */
  detectBOS(data, swings) {
    const bosEvents = [];
    const currentPrice = data[data.length - 1].close;

    // Check for bullish BOS (break above swing high in uptrend)
    for (let i = 0; i < swings.highs.length - 1; i++) {
      const swingHigh = swings.highs[i];
      // Check if any subsequent candle broke this high
      for (let j = swingHigh.index + 1; j < data.length; j++) {
        if (data[j].close > swingHigh.price && !swingHigh.broken) {
          swingHigh.broken = true;
          bosEvents.push({
            type: 'BULLISH_BOS',
            level: swingHigh.price,
            brokenAt: j,
            time: data[j].time,
            description: 'Break of Structure - Bullish continuation'
          });
          break;
        }
      }
    }

    // Check for bearish BOS (break below swing low in downtrend)
    for (let i = 0; i < swings.lows.length - 1; i++) {
      const swingLow = swings.lows[i];
      for (let j = swingLow.index + 1; j < data.length; j++) {
        if (data[j].close < swingLow.price && !swingLow.broken) {
          swingLow.broken = true;
          bosEvents.push({
            type: 'BEARISH_BOS',
            level: swingLow.price,
            brokenAt: j,
            time: data[j].time,
            description: 'Break of Structure - Bearish continuation'
          });
          break;
        }
      }
    }

    // Return only recent BOS events
    return bosEvents.slice(-5);
  }

  /**
   * Detect Change of Character (CHoCH)
   * CHoCH occurs when price breaks structure against the prevailing trend
   */
  detectCHoCH(data, swings) {
    const chochEvents = [];

    // Determine prevailing trend
    const recentHighs = swings.highs.slice(-4);
    const recentLows = swings.lows.slice(-4);

    if (recentHighs.length < 2 || recentLows.length < 2) return chochEvents;

    // Check if we were in uptrend and broke a swing low (bearish CHoCH)
    const wasUptrend = recentHighs[recentHighs.length - 2].price < recentHighs[recentHighs.length - 1].price;
    if (wasUptrend) {
      const lastSwingLow = recentLows[recentLows.length - 1];
      const currentPrice = data[data.length - 1].close;
      if (currentPrice < lastSwingLow.price) {
        chochEvents.push({
          type: 'BEARISH_CHOCH',
          level: lastSwingLow.price,
          description: 'Change of Character - Potential trend reversal to bearish',
          significance: 'HIGH'
        });
      }
    }

    // Check if we were in downtrend and broke a swing high (bullish CHoCH)
    const wasDowntrend = recentLows[recentLows.length - 2].price > recentLows[recentLows.length - 1].price;
    if (wasDowntrend) {
      const lastSwingHigh = recentHighs[recentHighs.length - 1];
      const currentPrice = data[data.length - 1].close;
      if (currentPrice > lastSwingHigh.price) {
        chochEvents.push({
          type: 'BULLISH_CHOCH',
          level: lastSwingHigh.price,
          description: 'Change of Character - Potential trend reversal to bullish',
          significance: 'HIGH'
        });
      }
    }

    return chochEvents;
  }


  // ==================== ORDER BLOCKS ====================

  /**
   * Detect Order Blocks (OB)
   * Order blocks are the last opposite candle before a strong move
   */
  detectOrderBlocks(data) {
    const orderBlocks = {
      bullish: [],
      bearish: []
    };

    for (let i = 5; i < data.length - 1; i++) {
      const candle = data[i];
      const nextCandles = data.slice(i + 1, Math.min(i + 6, data.length));
      
      if (nextCandles.length < 3) continue;

      const isBearishCandle = candle.close < candle.open;
      const isBullishCandle = candle.close > candle.open;

      // Bullish Order Block: Last bearish candle before strong bullish move
      if (isBearishCandle) {
        const moveUp = this.calculateMove(nextCandles, 'UP');
        const avgRange = this.calculateAverageRange(data.slice(i - 10, i));
        
        if (moveUp > avgRange * 2) {
          orderBlocks.bullish.push({
            index: i,
            high: candle.high,
            low: candle.low,
            open: candle.open,
            close: candle.close,
            time: candle.time,
            strength: moveUp / avgRange,
            mitigated: this.isOBMitigated(candle, data.slice(i + 1)),
            type: 'BULLISH_OB',
            description: 'Bullish Order Block - Institutional buying zone'
          });
        }
      }

      // Bearish Order Block: Last bullish candle before strong bearish move
      if (isBullishCandle) {
        const moveDown = this.calculateMove(nextCandles, 'DOWN');
        const avgRange = this.calculateAverageRange(data.slice(i - 10, i));
        
        if (moveDown > avgRange * 2) {
          orderBlocks.bearish.push({
            index: i,
            high: candle.high,
            low: candle.low,
            open: candle.open,
            close: candle.close,
            time: candle.time,
            strength: moveDown / avgRange,
            mitigated: this.isOBMitigated(candle, data.slice(i + 1), 'bearish'),
            type: 'BEARISH_OB',
            description: 'Bearish Order Block - Institutional selling zone'
          });
        }
      }
    }

    // Return only unmitigated and recent order blocks
    return {
      bullish: orderBlocks.bullish.filter(ob => !ob.mitigated).slice(-5),
      bearish: orderBlocks.bearish.filter(ob => !ob.mitigated).slice(-5)
    };
  }

  calculateMove(candles, direction) {
    if (candles.length === 0) return 0;
    
    if (direction === 'UP') {
      const highestHigh = Math.max(...candles.map(c => c.high));
      return highestHigh - candles[0].open;
    } else {
      const lowestLow = Math.min(...candles.map(c => c.low));
      return candles[0].open - lowestLow;
    }
  }

  calculateAverageRange(candles) {
    if (candles.length === 0) return 0;
    const ranges = candles.map(c => c.high - c.low);
    return ranges.reduce((a, b) => a + b, 0) / ranges.length;
  }

  isOBMitigated(ob, subsequentData, type = 'bullish') {
    for (const candle of subsequentData) {
      if (type === 'bullish') {
        // Bullish OB is mitigated when price returns and touches the OB zone
        if (candle.low <= ob.high && candle.low >= ob.low) {
          return true;
        }
      } else {
        // Bearish OB is mitigated when price returns and touches the OB zone
        if (candle.high >= ob.low && candle.high <= ob.high) {
          return true;
        }
      }
    }
    return false;
  }

  // ==================== FAIR VALUE GAPS ====================

  /**
   * Detect Fair Value Gaps (FVG)
   * FVG is a 3-candle pattern where there's a gap between candle 1 and candle 3
   */
  detectFairValueGaps(data) {
    const fvgs = {
      bullish: [],
      bearish: []
    };

    for (let i = 2; i < data.length; i++) {
      const c1 = data[i - 2];
      const c2 = data[i - 1];
      const c3 = data[i];

      // Bullish FVG: Gap up - c1 high < c3 low
      if (c1.high < c3.low) {
        const gapSize = c3.low - c1.high;
        const avgRange = this.calculateAverageRange(data.slice(Math.max(0, i - 10), i));
        
        if (gapSize > avgRange * 0.3) {
          fvgs.bullish.push({
            index: i - 1,
            top: c3.low,
            bottom: c1.high,
            size: gapSize,
            time: c2.time,
            filled: this.isFVGFilled(c1.high, c3.low, data.slice(i + 1), 'bullish'),
            type: 'BULLISH_FVG',
            description: 'Bullish Fair Value Gap - Price imbalance zone'
          });
        }
      }

      // Bearish FVG: Gap down - c1 low > c3 high
      if (c1.low > c3.high) {
        const gapSize = c1.low - c3.high;
        const avgRange = this.calculateAverageRange(data.slice(Math.max(0, i - 10), i));
        
        if (gapSize > avgRange * 0.3) {
          fvgs.bearish.push({
            index: i - 1,
            top: c1.low,
            bottom: c3.high,
            size: gapSize,
            time: c2.time,
            filled: this.isFVGFilled(c3.high, c1.low, data.slice(i + 1), 'bearish'),
            type: 'BEARISH_FVG',
            description: 'Bearish Fair Value Gap - Price imbalance zone'
          });
        }
      }
    }

    // Return only unfilled and recent FVGs
    return {
      bullish: fvgs.bullish.filter(fvg => !fvg.filled).slice(-5),
      bearish: fvgs.bearish.filter(fvg => !fvg.filled).slice(-5)
    };
  }

  isFVGFilled(bottom, top, subsequentData, type) {
    for (const candle of subsequentData) {
      if (type === 'bullish') {
        // Bullish FVG filled when price drops into the gap
        if (candle.low <= top && candle.low >= bottom) {
          return true;
        }
      } else {
        // Bearish FVG filled when price rises into the gap
        if (candle.high >= bottom && candle.high <= top) {
          return true;
        }
      }
    }
    return false;
  }


  // ==================== LIQUIDITY ZONES ====================

  /**
   * Detect Liquidity Zones
   * Areas where stop losses are likely clustered (equal highs/lows, swing points)
   */
  detectLiquidityZones(data) {
    const zones = {
      buySideLiquidity: [], // Above price - stop losses of shorts
      sellSideLiquidity: [] // Below price - stop losses of longs
    };

    const currentPrice = data[data.length - 1].close;

    // Find equal highs (buy-side liquidity)
    const equalHighs = this.findEqualLevels(data, 'high');
    for (const level of equalHighs) {
      if (level.price > currentPrice) {
        zones.buySideLiquidity.push({
          price: level.price,
          touches: level.touches,
          strength: Math.min(level.touches, 5),
          type: 'EQUAL_HIGHS',
          description: 'Buy-side liquidity - Stop losses of short positions'
        });
      }
    }

    // Find equal lows (sell-side liquidity)
    const equalLows = this.findEqualLevels(data, 'low');
    for (const level of equalLows) {
      if (level.price < currentPrice) {
        zones.sellSideLiquidity.push({
          price: level.price,
          touches: level.touches,
          strength: Math.min(level.touches, 5),
          type: 'EQUAL_LOWS',
          description: 'Sell-side liquidity - Stop losses of long positions'
        });
      }
    }

    // Find swing highs as liquidity (previous highs)
    const swings = this.findSwingPoints(data);
    for (const high of swings.highs.slice(-10)) {
      if (high.price > currentPrice && !zones.buySideLiquidity.find(z => Math.abs(z.price - high.price) / high.price < 0.002)) {
        zones.buySideLiquidity.push({
          price: high.price,
          touches: 1,
          strength: 2,
          type: 'SWING_HIGH',
          description: 'Swing high liquidity target'
        });
      }
    }

    // Find swing lows as liquidity
    for (const low of swings.lows.slice(-10)) {
      if (low.price < currentPrice && !zones.sellSideLiquidity.find(z => Math.abs(z.price - low.price) / low.price < 0.002)) {
        zones.sellSideLiquidity.push({
          price: low.price,
          touches: 1,
          strength: 2,
          type: 'SWING_LOW',
          description: 'Swing low liquidity target'
        });
      }
    }

    // Sort by proximity to current price
    zones.buySideLiquidity.sort((a, b) => a.price - b.price);
    zones.sellSideLiquidity.sort((a, b) => b.price - a.price);

    return {
      buySideLiquidity: zones.buySideLiquidity.slice(0, 5),
      sellSideLiquidity: zones.sellSideLiquidity.slice(0, 5)
    };
  }

  findEqualLevels(data, type, tolerance = 0.001) {
    const levels = [];
    const prices = data.map(d => d[type]);

    for (let i = 0; i < prices.length; i++) {
      let touches = 1;
      const price = prices[i];

      for (let j = i + 1; j < prices.length; j++) {
        const diff = Math.abs(prices[j] - price) / price;
        if (diff < tolerance) {
          touches++;
        }
      }

      if (touches >= 2) {
        // Check if we already have a similar level
        const existing = levels.find(l => Math.abs(l.price - price) / price < tolerance);
        if (existing) {
          existing.touches = Math.max(existing.touches, touches);
        } else {
          levels.push({ price, touches });
        }
      }
    }

    return levels.sort((a, b) => b.touches - a.touches).slice(0, 10);
  }

  // ==================== PREMIUM/DISCOUNT ====================

  /**
   * Calculate Premium/Discount zones
   * Based on the current range, determine if price is in premium (expensive) or discount (cheap)
   */
  calculatePremiumDiscount(data) {
    const lookback = Math.min(50, data.length);
    const recentData = data.slice(-lookback);

    const highestHigh = Math.max(...recentData.map(d => d.high));
    const lowestLow = Math.min(...recentData.map(d => d.low));
    const range = highestHigh - lowestLow;
    const equilibrium = (highestHigh + lowestLow) / 2;
    const currentPrice = data[data.length - 1].close;

    // Calculate zones
    const premiumZone = {
      top: highestHigh,
      bottom: equilibrium + (range * 0.25),
      description: 'Premium Zone - Expensive area, look for sells'
    };

    const discountZone = {
      top: equilibrium - (range * 0.25),
      bottom: lowestLow,
      description: 'Discount Zone - Cheap area, look for buys'
    };

    // Determine current position
    let currentZone = 'EQUILIBRIUM';
    let bias = 'NEUTRAL';

    if (currentPrice >= premiumZone.bottom) {
      currentZone = 'PREMIUM';
      bias = 'BEARISH'; // Look for sells in premium
    } else if (currentPrice <= discountZone.top) {
      currentZone = 'DISCOUNT';
      bias = 'BULLISH'; // Look for buys in discount
    }

    // Calculate percentage position in range
    const positionInRange = ((currentPrice - lowestLow) / range) * 100;

    return {
      highestHigh: Math.round(highestHigh * 100000) / 100000,
      lowestLow: Math.round(lowestLow * 100000) / 100000,
      equilibrium: Math.round(equilibrium * 100000) / 100000,
      premiumZone,
      discountZone,
      currentZone,
      bias,
      positionInRange: Math.round(positionInRange),
      description: `Price is in ${currentZone} zone (${Math.round(positionInRange)}% of range)`
    };
  }

  // ==================== SUMMARY ====================

  /**
   * Generate comprehensive SMC summary
   */
  generateSummary(results, data) {
    const currentPrice = data[data.length - 1].close;
    
    // Count active zones
    const activeBullishOBs = results.orderBlocks.bullish.length;
    const activeBearishOBs = results.orderBlocks.bearish.length;
    const activeBullishFVGs = results.fairValueGaps.bullish.length;
    const activeBearishFVGs = results.fairValueGaps.bearish.length;

    // Determine overall SMC bias
    let smcBias = 'NEUTRAL';
    let confidence = 'LOW';

    // Structure bias
    const structureBias = results.marketStructure.currentBias;
    
    // Premium/Discount bias
    const pdBias = results.premiumDiscount.bias;

    // CHoCH is a strong signal
    const hasChoch = results.marketStructure.choch.length > 0;
    const chochDirection = hasChoch ? results.marketStructure.choch[0].type.includes('BULLISH') ? 'BULLISH' : 'BEARISH' : null;

    // Calculate bias
    let bullishScore = 0;
    let bearishScore = 0;

    if (structureBias === 'BULLISH') bullishScore += 2;
    else if (structureBias === 'BEARISH') bearishScore += 2;

    if (pdBias === 'BULLISH') bullishScore += 1;
    else if (pdBias === 'BEARISH') bearishScore += 1;

    if (chochDirection === 'BULLISH') bullishScore += 3;
    else if (chochDirection === 'BEARISH') bearishScore += 3;

    bullishScore += activeBullishOBs;
    bearishScore += activeBearishOBs;

    if (bullishScore > bearishScore + 2) {
      smcBias = 'BULLISH';
      confidence = bullishScore > 5 ? 'HIGH' : 'MEDIUM';
    } else if (bearishScore > bullishScore + 2) {
      smcBias = 'BEARISH';
      confidence = bearishScore > 5 ? 'HIGH' : 'MEDIUM';
    }

    // Find nearest POI (Point of Interest)
    const nearestPOI = this.findNearestPOI(results, currentPrice);

    return {
      smcBias,
      confidence,
      structureTrend: results.marketStructure.trend,
      hasChoch,
      chochDirection,
      activeBullishOBs,
      activeBearishOBs,
      activeBullishFVGs,
      activeBearishFVGs,
      currentZone: results.premiumDiscount.currentZone,
      nearestPOI,
      recommendation: this.generateRecommendation(smcBias, results, currentPrice)
    };
  }

  findNearestPOI(results, currentPrice) {
    const pois = [];

    // Add Order Blocks
    for (const ob of results.orderBlocks.bullish) {
      pois.push({ type: 'BULLISH_OB', price: ob.low, distance: Math.abs(currentPrice - ob.low) });
    }
    for (const ob of results.orderBlocks.bearish) {
      pois.push({ type: 'BEARISH_OB', price: ob.high, distance: Math.abs(currentPrice - ob.high) });
    }

    // Add FVGs
    for (const fvg of results.fairValueGaps.bullish) {
      pois.push({ type: 'BULLISH_FVG', price: fvg.bottom, distance: Math.abs(currentPrice - fvg.bottom) });
    }
    for (const fvg of results.fairValueGaps.bearish) {
      pois.push({ type: 'BEARISH_FVG', price: fvg.top, distance: Math.abs(currentPrice - fvg.top) });
    }

    // Sort by distance
    pois.sort((a, b) => a.distance - b.distance);

    return pois[0] || null;
  }

  generateRecommendation(bias, results, currentPrice) {
    if (bias === 'BULLISH') {
      const nearestOB = results.orderBlocks.bullish[0];
      const nearestFVG = results.fairValueGaps.bullish[0];
      
      return {
        direction: 'BUY',
        entryZone: nearestOB ? { from: nearestOB.low, to: nearestOB.high } : 
                   nearestFVG ? { from: nearestFVG.bottom, to: nearestFVG.top } : null,
        reason: results.marketStructure.choch.length > 0 ? 
                'CHoCH confirmed bullish reversal' : 
                'Bullish market structure with active demand zones'
      };
    } else if (bias === 'BEARISH') {
      const nearestOB = results.orderBlocks.bearish[0];
      const nearestFVG = results.fairValueGaps.bearish[0];
      
      return {
        direction: 'SELL',
        entryZone: nearestOB ? { from: nearestOB.low, to: nearestOB.high } : 
                   nearestFVG ? { from: nearestFVG.bottom, to: nearestFVG.top } : null,
        reason: results.marketStructure.choch.length > 0 ? 
                'CHoCH confirmed bearish reversal' : 
                'Bearish market structure with active supply zones'
      };
    }

    return {
      direction: 'WAIT',
      entryZone: null,
      reason: 'No clear SMC bias - wait for structure confirmation'
    };
  }
}

export default SmartMoneyAnalyzer;
