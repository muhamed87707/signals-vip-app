/**
 * Market Profile Analyzer
 * Calculates Value Area, Point of Control, VAH/VAL
 */

export class MarketProfileAnalyzer {
  constructor(config = {}) {
    this.config = {
      valueAreaPercent: 0.70, // 70% of volume for value area
      tickSize: 0.0001, // Price tick size for profile
      lookbackPeriods: 20, // Number of periods for profile
      ...config,
    };
  }

  /**
   * Perform full Market Profile analysis
   */
  async analyze(marketData) {
    const candles = marketData.H1?.candles || [];
    
    if (candles.length < 20) {
      return this.getEmptyAnalysis();
    }

    // Build TPO (Time Price Opportunity) profile
    const profile = this.buildTPOProfile(candles);
    
    // Calculate Point of Control (POC)
    const poc = this.calculatePOC(profile);
    
    // Calculate Value Area
    const valueArea = this.calculateValueArea(profile, poc);
    
    // Identify profile shape
    const profileShape = this.identifyProfileShape(profile, poc, valueArea);
    
    // Analyze current price position
    const pricePosition = this.analyzePricePosition(candles, poc, valueArea);
    
    // Calculate score
    const score = this.calculateScore(profileShape, pricePosition);

    return {
      profile,
      poc,
      valueArea,
      profileShape,
      pricePosition,
      score,
      bias: this.determineBias(pricePosition, profileShape),
    };
  }

  /**
   * Build TPO (Time Price Opportunity) Profile
   */
  buildTPOProfile(candles) {
    const lookback = Math.min(this.config.lookbackPeriods, candles.length);
    const recentCandles = candles.slice(-lookback);
    
    // Determine price range
    const allHighs = recentCandles.map(c => c.high);
    const allLows = recentCandles.map(c => c.low);
    const rangeHigh = Math.max(...allHighs);
    const rangeLow = Math.min(...allLows);
    
    // Determine tick size based on price
    const avgPrice = (rangeHigh + rangeLow) / 2;
    const tickSize = avgPrice > 100 ? 0.01 : avgPrice > 10 ? 0.001 : this.config.tickSize;
    
    // Create price levels
    const levels = {};
    const numTicks = Math.ceil((rangeHigh - rangeLow) / tickSize);
    
    for (let i = 0; i <= numTicks; i++) {
      const price = rangeLow + (i * tickSize);
      const roundedPrice = Math.round(price / tickSize) * tickSize;
      levels[roundedPrice.toFixed(5)] = {
        price: roundedPrice,
        tpoCount: 0,
        volume: 0,
        periods: [],
      };
    }
    
    // Populate TPO counts
    recentCandles.forEach((candle, periodIndex) => {
      const volume = candle.volume || 1;
      const candleRange = candle.high - candle.low;
      const numLevels = Math.ceil(candleRange / tickSize) || 1;
      const volumePerLevel = volume / numLevels;
      
      for (let price = candle.low; price <= candle.high; price += tickSize) {
        const roundedPrice = Math.round(price / tickSize) * tickSize;
        const key = roundedPrice.toFixed(5);
        
        if (levels[key]) {
          levels[key].tpoCount++;
          levels[key].volume += volumePerLevel;
          levels[key].periods.push(periodIndex);
        }
      }
    });
    
    // Convert to array and sort by price
    const profileArray = Object.values(levels)
      .filter(l => l.tpoCount > 0)
      .sort((a, b) => a.price - b.price);
    
    return {
      levels: profileArray,
      rangeHigh,
      rangeLow,
      tickSize,
      totalTPO: profileArray.reduce((sum, l) => sum + l.tpoCount, 0),
      totalVolume: profileArray.reduce((sum, l) => sum + l.volume, 0),
    };
  }

  /**
   * Calculate Point of Control (POC)
   * The price level with the highest TPO count / volume
   */
  calculatePOC(profile) {
    if (profile.levels.length === 0) {
      return { price: 0, tpoCount: 0, volume: 0 };
    }
    
    // Find level with highest volume (or TPO count)
    let pocLevel = profile.levels[0];
    
    for (const level of profile.levels) {
      if (level.volume > pocLevel.volume) {
        pocLevel = level;
      }
    }
    
    return {
      price: pocLevel.price,
      tpoCount: pocLevel.tpoCount,
      volume: pocLevel.volume,
      percentOfTotal: (pocLevel.volume / profile.totalVolume) * 100,
    };
  }

  /**
   * Calculate Value Area (VAH, VAL)
   * The range containing 70% of the volume
   */
  calculateValueArea(profile, poc) {
    if (profile.levels.length === 0) {
      return { vah: 0, val: 0, vpoc: 0, width: 0 };
    }
    
    const targetVolume = profile.totalVolume * this.config.valueAreaPercent;
    let accumulatedVolume = poc.volume;
    
    // Find POC index
    const pocIndex = profile.levels.findIndex(l => l.price === poc.price);
    
    let upperIndex = pocIndex;
    let lowerIndex = pocIndex;
    
    // Expand from POC until we reach target volume
    while (accumulatedVolume < targetVolume && (upperIndex < profile.levels.length - 1 || lowerIndex > 0)) {
      const upperVolume = upperIndex < profile.levels.length - 1 ? profile.levels[upperIndex + 1].volume : 0;
      const lowerVolume = lowerIndex > 0 ? profile.levels[lowerIndex - 1].volume : 0;
      
      if (upperVolume >= lowerVolume && upperIndex < profile.levels.length - 1) {
        upperIndex++;
        accumulatedVolume += profile.levels[upperIndex].volume;
      } else if (lowerIndex > 0) {
        lowerIndex--;
        accumulatedVolume += profile.levels[lowerIndex].volume;
      } else if (upperIndex < profile.levels.length - 1) {
        upperIndex++;
        accumulatedVolume += profile.levels[upperIndex].volume;
      } else {
        break;
      }
    }
    
    const vah = profile.levels[upperIndex].price;
    const val = profile.levels[lowerIndex].price;
    
    return {
      vah, // Value Area High
      val, // Value Area Low
      vpoc: poc.price, // Volume Point of Control
      width: vah - val,
      volumeInVA: accumulatedVolume,
      percentOfRange: ((vah - val) / (profile.rangeHigh - profile.rangeLow)) * 100,
    };
  }

  /**
   * Identify profile shape
   */
  identifyProfileShape(profile, poc, valueArea) {
    if (profile.levels.length < 5) {
      return { shape: 'unknown', description: 'Insufficient data' };
    }
    
    const rangeMiddle = (profile.rangeHigh + profile.rangeLow) / 2;
    const pocPosition = (poc.price - profile.rangeLow) / (profile.rangeHigh - profile.rangeLow);
    
    // Calculate volume distribution
    const upperHalfVolume = profile.levels
      .filter(l => l.price > rangeMiddle)
      .reduce((sum, l) => sum + l.volume, 0);
    const lowerHalfVolume = profile.levels
      .filter(l => l.price <= rangeMiddle)
      .reduce((sum, l) => sum + l.volume, 0);
    
    const volumeSkew = upperHalfVolume / (lowerHalfVolume || 1);
    
    // Determine shape
    let shape = 'normal';
    let description = '';
    
    if (pocPosition > 0.7) {
      shape = 'p_shape';
      description = 'P-Shape: POC at top, potential distribution';
    } else if (pocPosition < 0.3) {
      shape = 'b_shape';
      description = 'B-Shape: POC at bottom, potential accumulation';
    } else if (valueArea.percentOfRange < 30) {
      shape = 'narrow';
      description = 'Narrow profile: Low volatility, potential breakout';
    } else if (valueArea.percentOfRange > 70) {
      shape = 'wide';
      description = 'Wide profile: High volatility, range-bound';
    } else if (volumeSkew > 1.5) {
      shape = 'skewed_up';
      description = 'Skewed up: More activity at higher prices';
    } else if (volumeSkew < 0.67) {
      shape = 'skewed_down';
      description = 'Skewed down: More activity at lower prices';
    } else {
      shape = 'normal';
      description = 'Normal distribution: Balanced activity';
    }
    
    return {
      shape,
      description,
      pocPosition: Math.round(pocPosition * 100),
      volumeSkew: Math.round(volumeSkew * 100) / 100,
    };
  }

  /**
   * Analyze current price position relative to profile
   */
  analyzePricePosition(candles, poc, valueArea) {
    const currentPrice = candles[candles.length - 1].close;
    
    let position = 'in_value_area';
    let signal = 'neutral';
    
    if (currentPrice > valueArea.vah) {
      position = 'above_value_area';
      signal = 'bullish'; // Price accepted above VA
    } else if (currentPrice < valueArea.val) {
      position = 'below_value_area';
      signal = 'bearish'; // Price accepted below VA
    } else if (Math.abs(currentPrice - poc.price) / poc.price < 0.001) {
      position = 'at_poc';
      signal = 'neutral'; // At fair value
    } else if (currentPrice > poc.price) {
      position = 'above_poc';
      signal = 'slight_bullish';
    } else {
      position = 'below_poc';
      signal = 'slight_bearish';
    }
    
    // Calculate distance from key levels
    const distanceFromPOC = ((currentPrice - poc.price) / poc.price) * 100;
    const distanceFromVAH = ((currentPrice - valueArea.vah) / valueArea.vah) * 100;
    const distanceFromVAL = ((currentPrice - valueArea.val) / valueArea.val) * 100;
    
    return {
      currentPrice,
      position,
      signal,
      distanceFromPOC: Math.round(distanceFromPOC * 100) / 100,
      distanceFromVAH: Math.round(distanceFromVAH * 100) / 100,
      distanceFromVAL: Math.round(distanceFromVAL * 100) / 100,
      nearestLevel: this.findNearestLevel(currentPrice, poc, valueArea),
    };
  }

  /**
   * Find nearest significant level
   */
  findNearestLevel(currentPrice, poc, valueArea) {
    const levels = [
      { name: 'POC', price: poc.price },
      { name: 'VAH', price: valueArea.vah },
      { name: 'VAL', price: valueArea.val },
    ];
    
    let nearest = levels[0];
    let minDistance = Math.abs(currentPrice - levels[0].price);
    
    for (const level of levels) {
      const distance = Math.abs(currentPrice - level.price);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = level;
      }
    }
    
    return {
      name: nearest.name,
      price: nearest.price,
      distance: minDistance,
      percentDistance: (minDistance / currentPrice) * 100,
    };
  }

  /**
   * Determine bias
   */
  determineBias(pricePosition, profileShape) {
    let bullishScore = 0;
    let bearishScore = 0;
    
    // Price position
    if (pricePosition.signal === 'bullish') bullishScore += 2;
    if (pricePosition.signal === 'bearish') bearishScore += 2;
    if (pricePosition.signal === 'slight_bullish') bullishScore += 1;
    if (pricePosition.signal === 'slight_bearish') bearishScore += 1;
    
    // Profile shape
    if (profileShape.shape === 'b_shape') bullishScore += 1; // Accumulation
    if (profileShape.shape === 'p_shape') bearishScore += 1; // Distribution
    if (profileShape.shape === 'skewed_up') bullishScore += 1;
    if (profileShape.shape === 'skewed_down') bearishScore += 1;
    
    if (bullishScore > bearishScore) return 'bullish';
    if (bearishScore > bullishScore) return 'bearish';
    return 'neutral';
  }

  /**
   * Calculate score
   */
  calculateScore(profileShape, pricePosition) {
    let score = 50;
    
    // Profile clarity
    if (profileShape.shape !== 'unknown') {
      score += 15;
    }
    
    // Clear position signal
    if (pricePosition.signal === 'bullish' || pricePosition.signal === 'bearish') {
      score += 20;
    } else if (pricePosition.signal === 'slight_bullish' || pricePosition.signal === 'slight_bearish') {
      score += 10;
    }
    
    // Near significant level
    if (pricePosition.nearestLevel.percentDistance < 0.5) {
      score += 15;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get empty analysis
   */
  getEmptyAnalysis() {
    return {
      profile: { levels: [], rangeHigh: 0, rangeLow: 0, totalVolume: 0 },
      poc: { price: 0, volume: 0 },
      valueArea: { vah: 0, val: 0, vpoc: 0, width: 0 },
      profileShape: { shape: 'unknown', description: 'Insufficient data' },
      pricePosition: { position: 'unknown', signal: 'neutral' },
      score: 0,
      bias: 'neutral',
    };
  }
}

export default MarketProfileAnalyzer;
