/**
 * Elliott Wave Analyzer
 * Detects Elliott Wave patterns: Impulse waves, Corrective waves, Wave targets
 */

export class ElliottWaveAnalyzer {
  constructor(config = {}) {
    this.config = {
      minWaveSize: 0.001, // Minimum wave size as percentage
      lookback: 100,
      ...config,
    };
    
    // Fibonacci ratios for wave relationships
    this.fibRatios = {
      wave2: [0.382, 0.5, 0.618, 0.786],
      wave3: [1.618, 2.0, 2.618],
      wave4: [0.236, 0.382, 0.5],
      wave5: [0.618, 1.0, 1.618],
      waveA: [0.382, 0.5, 0.618],
      waveB: [0.382, 0.5, 0.618, 0.786],
      waveC: [0.618, 1.0, 1.618],
    };
  }

  /**
   * Perform full Elliott Wave analysis
   */
  async analyze(marketData) {
    const candles = marketData.H1?.candles || [];
    
    if (candles.length < 50) {
      return this.getEmptyAnalysis();
    }

    // Find swing points for wave identification
    const swingPoints = this.findSwingPoints(candles);
    
    // Identify wave structure
    const waveStructure = this.identifyWaveStructure(swingPoints, candles);
    
    // Determine current wave position
    const currentWave = this.determineCurrentWave(waveStructure);
    
    // Calculate wave targets
    const targets = this.calculateWaveTargets(waveStructure, currentWave, candles);
    
    // Validate wave rules
    const validation = this.validateWaveRules(waveStructure);
    
    // Calculate score
    const score = this.calculateScore(waveStructure, validation, currentWave);

    return {
      waveStructure,
      currentWave,
      targets,
      validation,
      score,
      bias: this.determineBias(waveStructure, currentWave),
    };
  }

  /**
   * Find swing points for wave identification
   */
  findSwingPoints(candles, lookback = 5) {
    const swings = [];
    
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
        swings.push({
          type: 'high',
          price: curr.high,
          index: i,
          timestamp: curr.timestamp,
        });
      }
      
      if (isSwingLow) {
        swings.push({
          type: 'low',
          price: curr.low,
          index: i,
          timestamp: curr.timestamp,
        });
      }
    }
    
    return swings.sort((a, b) => a.index - b.index);
  }

  /**
   * Identify wave structure from swing points
   */
  identifyWaveStructure(swingPoints, candles) {
    if (swingPoints.length < 5) {
      return { type: 'unknown', waves: [], degree: 'minor' };
    }

    // Try to identify impulse wave (5-wave structure)
    const impulseWave = this.identifyImpulseWave(swingPoints);
    
    // Try to identify corrective wave (3-wave structure)
    const correctiveWave = this.identifyCorrectiveWave(swingPoints);
    
    // Determine which pattern is more likely
    if (impulseWave.confidence > correctiveWave.confidence) {
      return {
        type: 'impulse',
        direction: impulseWave.direction,
        waves: impulseWave.waves,
        degree: this.determineWaveDegree(impulseWave.waves, candles),
        confidence: impulseWave.confidence,
      };
    } else if (correctiveWave.confidence > 0) {
      return {
        type: 'corrective',
        direction: correctiveWave.direction,
        waves: correctiveWave.waves,
        degree: this.determineWaveDegree(correctiveWave.waves, candles),
        confidence: correctiveWave.confidence,
      };
    }
    
    return { type: 'unknown', waves: [], degree: 'minor', confidence: 0 };
  }

  /**
   * Identify impulse wave (5-wave pattern)
   */
  identifyImpulseWave(swingPoints) {
    const waves = [];
    let confidence = 0;
    let direction = 'bullish';
    
    // Need at least 6 swing points for 5 waves
    if (swingPoints.length < 6) {
      return { waves: [], confidence: 0, direction };
    }
    
    // Try bullish impulse (starts with low)
    const bullishWaves = this.tryBullishImpulse(swingPoints);
    
    // Try bearish impulse (starts with high)
    const bearishWaves = this.tryBearishImpulse(swingPoints);
    
    if (bullishWaves.confidence > bearishWaves.confidence) {
      return { ...bullishWaves, direction: 'bullish' };
    } else {
      return { ...bearishWaves, direction: 'bearish' };
    }
  }

  /**
   * Try to identify bullish impulse wave
   */
  tryBullishImpulse(swingPoints) {
    const waves = [];
    let confidence = 0;
    
    // Find alternating low-high-low-high-low-high pattern
    const lows = swingPoints.filter(s => s.type === 'low');
    const highs = swingPoints.filter(s => s.type === 'high');
    
    if (lows.length < 3 || highs.length < 2) {
      return { waves, confidence };
    }
    
    // Wave 0 (start) - first significant low
    const wave0 = lows[0];
    
    // Wave 1 - first high after wave 0
    const wave1Candidates = highs.filter(h => h.index > wave0.index);
    if (wave1Candidates.length === 0) return { waves, confidence };
    const wave1 = wave1Candidates[0];
    
    // Wave 2 - low after wave 1 (must be above wave 0)
    const wave2Candidates = lows.filter(l => l.index > wave1.index && l.price > wave0.price);
    if (wave2Candidates.length === 0) return { waves, confidence };
    const wave2 = wave2Candidates[0];
    
    // Wave 3 - high after wave 2 (must be above wave 1)
    const wave3Candidates = highs.filter(h => h.index > wave2.index && h.price > wave1.price);
    if (wave3Candidates.length === 0) return { waves, confidence };
    const wave3 = wave3Candidates[0];
    
    // Wave 4 - low after wave 3 (must be above wave 1 high - no overlap rule)
    const wave4Candidates = lows.filter(l => l.index > wave3.index && l.price > wave1.price);
    if (wave4Candidates.length === 0) return { waves, confidence };
    const wave4 = wave4Candidates[0];
    
    // Wave 5 - high after wave 4
    const wave5Candidates = highs.filter(h => h.index > wave4.index);
    const wave5 = wave5Candidates.length > 0 ? wave5Candidates[0] : null;
    
    waves.push(
      { label: '0', ...wave0 },
      { label: '1', ...wave1 },
      { label: '2', ...wave2 },
      { label: '3', ...wave3 },
      { label: '4', ...wave4 },
    );
    
    if (wave5) {
      waves.push({ label: '5', ...wave5 });
    }
    
    // Calculate confidence based on wave relationships
    confidence = this.calculateImpulseConfidence(waves);
    
    return { waves, confidence };
  }

  /**
   * Try to identify bearish impulse wave
   */
  tryBearishImpulse(swingPoints) {
    const waves = [];
    let confidence = 0;
    
    const lows = swingPoints.filter(s => s.type === 'low');
    const highs = swingPoints.filter(s => s.type === 'high');
    
    if (highs.length < 3 || lows.length < 2) {
      return { waves, confidence };
    }
    
    // Wave 0 (start) - first significant high
    const wave0 = highs[0];
    
    // Wave 1 - first low after wave 0
    const wave1Candidates = lows.filter(l => l.index > wave0.index);
    if (wave1Candidates.length === 0) return { waves, confidence };
    const wave1 = wave1Candidates[0];
    
    // Wave 2 - high after wave 1 (must be below wave 0)
    const wave2Candidates = highs.filter(h => h.index > wave1.index && h.price < wave0.price);
    if (wave2Candidates.length === 0) return { waves, confidence };
    const wave2 = wave2Candidates[0];
    
    // Wave 3 - low after wave 2 (must be below wave 1)
    const wave3Candidates = lows.filter(l => l.index > wave2.index && l.price < wave1.price);
    if (wave3Candidates.length === 0) return { waves, confidence };
    const wave3 = wave3Candidates[0];
    
    // Wave 4 - high after wave 3 (must be below wave 1 low - no overlap rule)
    const wave4Candidates = highs.filter(h => h.index > wave3.index && h.price < wave1.price);
    if (wave4Candidates.length === 0) return { waves, confidence };
    const wave4 = wave4Candidates[0];
    
    // Wave 5 - low after wave 4
    const wave5Candidates = lows.filter(l => l.index > wave4.index);
    const wave5 = wave5Candidates.length > 0 ? wave5Candidates[0] : null;
    
    waves.push(
      { label: '0', ...wave0 },
      { label: '1', ...wave1 },
      { label: '2', ...wave2 },
      { label: '3', ...wave3 },
      { label: '4', ...wave4 },
    );
    
    if (wave5) {
      waves.push({ label: '5', ...wave5 });
    }
    
    confidence = this.calculateImpulseConfidence(waves);
    
    return { waves, confidence };
  }

  /**
   * Calculate impulse wave confidence
   */
  calculateImpulseConfidence(waves) {
    if (waves.length < 5) return 0;
    
    let confidence = 50;
    
    // Wave 3 should be the longest (most common)
    const wave1Size = Math.abs(waves[1].price - waves[0].price);
    const wave3Size = Math.abs(waves[3].price - waves[2].price);
    const wave5Size = waves[5] ? Math.abs(waves[5].price - waves[4].price) : 0;
    
    if (wave3Size > wave1Size && wave3Size > wave5Size) {
      confidence += 20;
    }
    
    // Wave 2 retracement check (typically 38.2% - 78.6%)
    const wave2Retrace = Math.abs(waves[2].price - waves[1].price) / wave1Size;
    if (wave2Retrace >= 0.382 && wave2Retrace <= 0.786) {
      confidence += 15;
    }
    
    // Wave 4 retracement check (typically 23.6% - 50%)
    if (waves.length >= 5) {
      const wave4Retrace = Math.abs(waves[4].price - waves[3].price) / wave3Size;
      if (wave4Retrace >= 0.236 && wave4Retrace <= 0.5) {
        confidence += 15;
      }
    }
    
    return Math.min(100, confidence);
  }

  /**
   * Identify corrective wave (ABC pattern)
   */
  identifyCorrectiveWave(swingPoints) {
    const waves = [];
    let confidence = 0;
    let direction = 'bearish'; // Correction against bullish trend
    
    if (swingPoints.length < 4) {
      return { waves, confidence, direction };
    }
    
    // Try to find ABC pattern
    const lows = swingPoints.filter(s => s.type === 'low');
    const highs = swingPoints.filter(s => s.type === 'high');
    
    // Bearish correction (A down, B up, C down)
    if (highs.length >= 2 && lows.length >= 2) {
      const waveA_start = highs[highs.length - 3] || highs[0];
      const waveA_end = lows.find(l => l.index > waveA_start.index);
      
      if (waveA_end) {
        const waveB_end = highs.find(h => h.index > waveA_end.index && h.price < waveA_start.price);
        
        if (waveB_end) {
          const waveC_end = lows.find(l => l.index > waveB_end.index);
          
          if (waveC_end) {
            waves.push(
              { label: 'A_start', ...waveA_start },
              { label: 'A', ...waveA_end },
              { label: 'B', ...waveB_end },
              { label: 'C', ...waveC_end },
            );
            
            confidence = this.calculateCorrectiveConfidence(waves);
            direction = 'bearish';
          }
        }
      }
    }
    
    return { waves, confidence, direction };
  }

  /**
   * Calculate corrective wave confidence
   */
  calculateCorrectiveConfidence(waves) {
    if (waves.length < 4) return 0;
    
    let confidence = 40;
    
    const waveASize = Math.abs(waves[1].price - waves[0].price);
    const waveBSize = Math.abs(waves[2].price - waves[1].price);
    const waveCSize = Math.abs(waves[3].price - waves[2].price);
    
    // Wave B typically retraces 38.2% - 78.6% of wave A
    const waveBRetrace = waveBSize / waveASize;
    if (waveBRetrace >= 0.382 && waveBRetrace <= 0.786) {
      confidence += 20;
    }
    
    // Wave C often equals wave A or is 1.618 of wave A
    const waveCRatio = waveCSize / waveASize;
    if (Math.abs(waveCRatio - 1) < 0.1 || Math.abs(waveCRatio - 1.618) < 0.1) {
      confidence += 20;
    }
    
    return Math.min(100, confidence);
  }

  /**
   * Determine wave degree based on size
   */
  determineWaveDegree(waves, candles) {
    if (waves.length < 2) return 'minor';
    
    const totalMove = Math.abs(waves[waves.length - 1].price - waves[0].price);
    const avgPrice = candles[candles.length - 1].close;
    const movePercent = (totalMove / avgPrice) * 100;
    
    if (movePercent > 10) return 'primary';
    if (movePercent > 5) return 'intermediate';
    if (movePercent > 2) return 'minor';
    return 'minute';
  }

  /**
   * Determine current wave position
   */
  determineCurrentWave(waveStructure) {
    if (waveStructure.type === 'unknown' || waveStructure.waves.length === 0) {
      return { wave: 'unknown', position: 'unknown' };
    }
    
    const waves = waveStructure.waves;
    const lastWave = waves[waves.length - 1];
    
    if (waveStructure.type === 'impulse') {
      if (waves.length <= 2) return { wave: '1', position: 'early' };
      if (waves.length === 3) return { wave: '2', position: 'correction' };
      if (waves.length === 4) return { wave: '3', position: 'impulse' };
      if (waves.length === 5) return { wave: '4', position: 'correction' };
      if (waves.length >= 6) return { wave: '5', position: 'final' };
    }
    
    if (waveStructure.type === 'corrective') {
      if (waves.length <= 2) return { wave: 'A', position: 'early' };
      if (waves.length === 3) return { wave: 'B', position: 'retracement' };
      if (waves.length >= 4) return { wave: 'C', position: 'final' };
    }
    
    return { wave: 'unknown', position: 'unknown' };
  }

  /**
   * Calculate wave targets
   */
  calculateWaveTargets(waveStructure, currentWave, candles) {
    const targets = [];
    
    if (waveStructure.waves.length < 2) return targets;
    
    const waves = waveStructure.waves;
    const currentPrice = candles[candles.length - 1].close;
    
    if (waveStructure.type === 'impulse' && waveStructure.direction === 'bullish') {
      if (currentWave.wave === '3' || currentWave.wave === '2') {
        // Wave 3 targets (1.618, 2.0, 2.618 of wave 1)
        const wave1Size = Math.abs(waves[1].price - waves[0].price);
        const wave2End = waves[2]?.price || currentPrice;
        
        this.fibRatios.wave3.forEach(ratio => {
          targets.push({
            label: `Wave 3 (${ratio}x)`,
            price: wave2End + (wave1Size * ratio),
            type: 'extension',
          });
        });
      }
      
      if (currentWave.wave === '5' || currentWave.wave === '4') {
        // Wave 5 targets
        const wave1Size = Math.abs(waves[1].price - waves[0].price);
        const wave4End = waves[4]?.price || currentPrice;
        
        this.fibRatios.wave5.forEach(ratio => {
          targets.push({
            label: `Wave 5 (${ratio}x)`,
            price: wave4End + (wave1Size * ratio),
            type: 'extension',
          });
        });
      }
    }
    
    return targets;
  }

  /**
   * Validate Elliott Wave rules
   */
  validateWaveRules(waveStructure) {
    const rules = {
      wave2NotBelowWave0: true,
      wave3NotShortest: true,
      wave4NotOverlapWave1: true,
    };
    
    if (waveStructure.type !== 'impulse' || waveStructure.waves.length < 5) {
      return { valid: false, rules, violations: ['Incomplete wave structure'] };
    }
    
    const waves = waveStructure.waves;
    const violations = [];
    
    // Rule 1: Wave 2 cannot retrace more than 100% of wave 1
    if (waveStructure.direction === 'bullish') {
      if (waves[2].price < waves[0].price) {
        rules.wave2NotBelowWave0 = false;
        violations.push('Wave 2 retraced below wave 0 start');
      }
    }
    
    // Rule 2: Wave 3 cannot be the shortest impulse wave
    const wave1Size = Math.abs(waves[1].price - waves[0].price);
    const wave3Size = Math.abs(waves[3].price - waves[2].price);
    const wave5Size = waves[5] ? Math.abs(waves[5].price - waves[4].price) : Infinity;
    
    if (wave3Size < wave1Size && wave3Size < wave5Size) {
      rules.wave3NotShortest = false;
      violations.push('Wave 3 is the shortest wave');
    }
    
    // Rule 3: Wave 4 cannot overlap wave 1 territory
    if (waveStructure.direction === 'bullish') {
      if (waves[4].price < waves[1].price) {
        rules.wave4NotOverlapWave1 = false;
        violations.push('Wave 4 overlaps wave 1');
      }
    }
    
    return {
      valid: violations.length === 0,
      rules,
      violations,
    };
  }

  /**
   * Determine bias
   */
  determineBias(waveStructure, currentWave) {
    if (waveStructure.type === 'unknown') return 'neutral';
    
    if (waveStructure.type === 'impulse') {
      if (waveStructure.direction === 'bullish') {
        if (['1', '3', '5'].includes(currentWave.wave)) return 'bullish';
        if (['2', '4'].includes(currentWave.wave)) return 'neutral';
      } else {
        if (['1', '3', '5'].includes(currentWave.wave)) return 'bearish';
        if (['2', '4'].includes(currentWave.wave)) return 'neutral';
      }
    }
    
    if (waveStructure.type === 'corrective') {
      return waveStructure.direction === 'bullish' ? 'bearish' : 'bullish';
    }
    
    return 'neutral';
  }

  /**
   * Calculate score
   */
  calculateScore(waveStructure, validation, currentWave) {
    let score = 30;
    
    // Wave structure clarity
    if (waveStructure.type !== 'unknown') {
      score += 20;
    }
    
    // Confidence
    score += (waveStructure.confidence || 0) * 0.3;
    
    // Validation
    if (validation.valid) {
      score += 20;
    } else {
      score -= validation.violations.length * 5;
    }
    
    // Current wave position
    if (currentWave.position === 'impulse') score += 10;
    if (currentWave.wave === '3') score += 10; // Wave 3 is strongest
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Get empty analysis
   */
  getEmptyAnalysis() {
    return {
      waveStructure: { type: 'unknown', waves: [], degree: 'minor', confidence: 0 },
      currentWave: { wave: 'unknown', position: 'unknown' },
      targets: [],
      validation: { valid: false, rules: {}, violations: [] },
      score: 0,
      bias: 'neutral',
    };
  }
}

export default ElliottWaveAnalyzer;
