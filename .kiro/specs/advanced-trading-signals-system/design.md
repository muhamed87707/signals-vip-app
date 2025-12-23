# Design Document: Advanced Trading Signals System

## Overview

نظام توصيات تداول متقدم يعتمد على تحليل متعدد الأبعاد لتوليد توصيات عالية الدقة. يجمع النظام بين التحليل الفني المتقدم (Multi-Timeframe Analysis, Smart Money Concepts, Price Action)، التحليل الأساسي (Economic Calendar, Interest Rates)، وتحليل المشاعر (COT Report, Retail Positioning) لإنتاج توصيات بنظام Confluence Scoring.

### Key Design Principles

1. **Confluence-Based Signals**: لا يتم توليد توصية إلا عند التقاء عدة عوامل
2. **Risk-First Approach**: كل توصية تتضمن إدارة مخاطر صارمة
3. **Transparency**: شرح مفصل لأسباب كل توصية
4. **Real-Time Updates**: تحديث مستمر للتوصيات مع تغير السوق
5. **Performance Tracking**: تتبع دقيق لأداء كل توصية

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Signal Dashboard UI                          │
│                    (app/signalssystem/page.js)                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Layer                                   │
│              (app/api/trading-signals/route.js)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   Signal Engine     │ │   Risk Manager      │ │  Performance        │
│   (lib/trading/     │ │   (lib/trading/     │ │  Tracker            │
│    signalEngine.js) │ │    riskManager.js)  │ │  (lib/trading/      │
└─────────────────────┘ └─────────────────────┘ │   performance.js)   │
          │                                      └─────────────────────┘
          │
┌─────────┴─────────────────────────────────────────────────────────┐
│                        Analysis Layer                              │
├─────────────────┬─────────────────┬─────────────────┬─────────────┤
│ Technical       │ Pattern         │ Fundamental     │ Sentiment   │
│ Analyzer        │ Recognizer      │ Analyzer        │ Analyzer    │
│ (indicators.js) │ (patterns.js)   │ (fundamental.js)│ (sentiment.js)
└─────────────────┴─────────────────┴─────────────────┴─────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Layer                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Market Data API  │  Economic Calendar  │  COT Data  │  MongoDB    │
│  (prices, candles)│  (news, events)     │  (positions)│  (signals) │
└─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Technical Analyzer Module

```typescript
interface TechnicalAnalysis {
  pair: string;
  timeframe: string;
  timestamp: Date;
  
  // Trend Indicators
  trend: {
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-100
    ema9: number;
    ema21: number;
    ema50: number;
    ema200: number;
  };
  
  // Momentum Indicators
  momentum: {
    rsi: number;
    rsiSignal: 'overbought' | 'oversold' | 'neutral';
    rsiDivergence: 'bullish' | 'bearish' | null;
    macd: { value: number; signal: number; histogram: number };
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    stochastic: { k: number; d: number };
    stochasticSignal: 'overbought' | 'oversold' | 'neutral';
  };
  
  // Volatility
  volatility: {
    atr: number;
    atrPercent: number;
    adx: number;
    trendStrength: 'strong' | 'moderate' | 'weak' | 'no_trend';
  };
  
  // Key Levels
  levels: {
    support: number[];
    resistance: number[];
    pivotPoints: {
      pivot: number;
      r1: number; r2: number; r3: number;
      s1: number; s2: number; s3: number;
    };
  };
}

interface MultiTimeframeAnalysis {
  pair: string;
  analyses: {
    M15: TechnicalAnalysis;
    H1: TechnicalAnalysis;
    H4: TechnicalAnalysis;
    D1: TechnicalAnalysis;
  };
  trendAlignment: boolean;
  alignmentScore: number; // 0-25
  dominantTrend: 'bullish' | 'bearish' | 'mixed';
}
```

### 2. Pattern Recognition Module

```typescript
interface CandlePattern {
  name: string;
  type: 'reversal' | 'continuation';
  direction: 'bullish' | 'bearish';
  reliability: number; // 0-100
  candles: number; // number of candles in pattern
}

interface ChartPattern {
  name: string;
  type: 'reversal' | 'continuation';
  direction: 'bullish' | 'bearish';
  reliability: number;
  targetPrice: number;
  invalidationLevel: number;
  completionPercent: number;
}

interface SmartMoneyAnalysis {
  orderBlocks: {
    type: 'bullish' | 'bearish';
    priceZone: { high: number; low: number };
    strength: number;
    tested: boolean;
  }[];
  
  fairValueGaps: {
    type: 'bullish' | 'bearish';
    priceZone: { high: number; low: number };
    filled: boolean;
    fillPercent: number;
  }[];
  
  liquidityPools: {
    type: 'buy_side' | 'sell_side';
    price: number;
    strength: number;
    swept: boolean;
  }[];
  
  structureBreaks: {
    type: 'BOS' | 'CHoCH';
    direction: 'bullish' | 'bearish';
    price: number;
    timestamp: Date;
  }[];
}

interface PatternAnalysis {
  pair: string;
  timeframe: string;
  candlePatterns: CandlePattern[];
  chartPatterns: ChartPattern[];
  smartMoney: SmartMoneyAnalysis;
  patternScore: number; // 0-20
}
```

### 3. Fundamental Analyzer Module

```typescript
interface EconomicEvent {
  id: string;
  currency: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  datetime: Date;
  actual: number | null;
  forecast: number | null;
  previous: number | null;
}

interface CentralBankPolicy {
  currency: string;
  bank: string;
  currentRate: number;
  nextMeeting: Date;
  stance: 'hawkish' | 'dovish' | 'neutral';
  rateExpectation: 'hike' | 'cut' | 'hold';
}

interface FundamentalAnalysis {
  pair: string;
  baseCurrency: CentralBankPolicy;
  quoteCurrency: CentralBankPolicy;
  interestRateDifferential: number;
  fundamentalBias: 'bullish' | 'bearish' | 'neutral';
  upcomingEvents: EconomicEvent[];
  newsImpact: 'positive' | 'negative' | 'neutral';
  fundamentalScore: number; // 0-15
}
```

### 4. Sentiment Analyzer Module

```typescript
interface COTData {
  pair: string;
  reportDate: Date;
  commercials: { long: number; short: number; net: number };
  nonCommercials: { long: number; short: number; net: number };
  retailers: { long: number; short: number; net: number };
  netPositionChange: number;
  extremeLevel: 'extreme_long' | 'extreme_short' | null;
}

interface RetailSentiment {
  pair: string;
  longPercent: number;
  shortPercent: number;
  contrarian: boolean;
  signal: 'bullish' | 'bearish' | 'neutral';
}

interface SentimentAnalysis {
  pair: string;
  cot: COTData;
  retail: RetailSentiment;
  compositeSentiment: number; // -100 to +100
  sentimentBias: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // 0-15
}
```

### 5. Signal Engine Module

```typescript
interface Signal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  
  // Entry Details
  entry: {
    price: number;
    zone: { high: number; low: number };
    type: 'limit' | 'market' | 'stop';
  };
  
  // Risk Management
  stopLoss: number;
  takeProfit: {
    tp1: number;
    tp2: number;
    tp3: number;
  };
  riskRewardRatio: number;
  
  // Confluence Analysis
  confluence: {
    total: number; // 0-100
    breakdown: {
      trendAlignment: number; // 0-25
      pattern: number; // 0-20
      smartMoney: number; // 0-20
      fundamental: number; // 0-15
      sentiment: number; // 0-15
      session: number; // 0-5
    };
  };
  
  // Confidence & Reasoning
  confidence: 'low' | 'medium' | 'high' | 'very_high';
  reasoning: {
    technical: string;
    pattern: string;
    fundamental: string;
    sentiment: string;
    summary: string;
  };
  
  // Metadata
  timeframe: string;
  session: 'asia' | 'london' | 'newyork' | 'overlap';
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'triggered' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'stopped' | 'expired' | 'cancelled';
  
  // Performance (after closure)
  result?: {
    outcome: 'win' | 'loss' | 'breakeven';
    pips: number;
    exitPrice: number;
    exitTime: Date;
  };
}

interface SignalGenerationConfig {
  minConfluenceScore: number; // default: 60
  minRiskReward: number; // default: 2
  maxActiveSignals: number; // default: 5
  allowedPairs: string[];
  allowedTimeframes: string[];
  tradingSessions: string[];
}
```

### 6. Risk Manager Module

```typescript
interface RiskCalculation {
  pair: string;
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLoss: number;
  
  // Calculated Values
  pipValue: number;
  stopLossPips: number;
  riskAmount: number;
  lotSize: number;
  
  // Take Profit Analysis
  takeProfit: {
    tp1: { price: number; pips: number; reward: number; rr: number };
    tp2: { price: number; pips: number; reward: number; rr: number };
    tp3: { price: number; pips: number; reward: number; rr: number };
  };
}

interface PortfolioRisk {
  totalExposure: number;
  activeSignals: number;
  correlatedPairs: string[][];
  maxDrawdown: number;
  warning: string | null;
}
```

## Data Models

### MongoDB Schema: TradingSignal

```javascript
const TradingSignalSchema = new Schema({
  // Signal Identification
  signalId: { type: String, required: true, unique: true },
  pair: { type: String, required: true, index: true },
  direction: { type: String, enum: ['BUY', 'SELL'], required: true },
  
  // Entry Details
  entry: {
    price: { type: Number, required: true },
    zoneHigh: { type: Number, required: true },
    zoneLow: { type: Number, required: true },
    type: { type: String, enum: ['limit', 'market', 'stop'], default: 'limit' }
  },
  
  // Risk Management
  stopLoss: { type: Number, required: true },
  takeProfit1: { type: Number, required: true },
  takeProfit2: { type: Number, required: true },
  takeProfit3: { type: Number, required: true },
  riskRewardRatio: { type: Number, required: true },
  
  // Confluence Scores
  confluenceTotal: { type: Number, required: true },
  confluenceTrend: { type: Number, default: 0 },
  confluencePattern: { type: Number, default: 0 },
  confluenceSmartMoney: { type: Number, default: 0 },
  confluenceFundamental: { type: Number, default: 0 },
  confluenceSentiment: { type: Number, default: 0 },
  confluenceSession: { type: Number, default: 0 },
  
  // Confidence & Analysis
  confidence: { type: String, enum: ['low', 'medium', 'high', 'very_high'], required: true },
  reasoningTechnical: { type: String },
  reasoningPattern: { type: String },
  reasoningFundamental: { type: String },
  reasoningSentiment: { type: String },
  reasoningSummary: { type: String, required: true },
  
  // Metadata
  timeframe: { type: String, required: true },
  session: { type: String, enum: ['asia', 'london', 'newyork', 'overlap'] },
  status: { 
    type: String, 
    enum: ['active', 'triggered', 'tp1_hit', 'tp2_hit', 'tp3_hit', 'stopped', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, required: true },
  triggeredAt: { type: Date },
  closedAt: { type: Date },
  
  // Result (populated after closure)
  resultOutcome: { type: String, enum: ['win', 'loss', 'breakeven'] },
  resultPips: { type: Number },
  resultExitPrice: { type: Number },
  
  // Analysis Snapshots (for audit)
  analysisSnapshot: { type: Schema.Types.Mixed }
});
```

### MongoDB Schema: SignalPerformance

```javascript
const SignalPerformanceSchema = new Schema({
  // Period
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'all_time'], required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  
  // Overall Stats
  totalSignals: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  breakeven: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  
  // Profit Stats
  totalPips: { type: Number, default: 0 },
  averagePips: { type: Number, default: 0 },
  averageRR: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 },
  
  // Breakdown by Pair
  byPair: [{
    pair: String,
    signals: Number,
    winRate: Number,
    totalPips: Number
  }],
  
  // Breakdown by Confidence
  byConfidence: [{
    confidence: String,
    signals: Number,
    winRate: Number,
    totalPips: Number
  }],
  
  // Best/Worst
  bestSignal: { type: Schema.Types.ObjectId, ref: 'TradingSignal' },
  worstSignal: { type: Schema.Types.ObjectId, ref: 'TradingSignal' },
  
  updatedAt: { type: Date, default: Date.now }
});
```


## Technical Indicator Calculations

### EMA (Exponential Moving Average)
```javascript
function calculateEMA(prices, period) {
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}
```

### RSI (Relative Strength Index)
```javascript
function calculateRSI(prices, period = 14) {
  let gains = 0, losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
  }
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}
```

### MACD
```javascript
function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMAArray(prices, fastPeriod);
  const slowEMA = calculateEMAArray(prices, slowPeriod);
  
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMAArray(macdLine, signalPeriod);
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
  
  return { macdLine, signalLine, histogram };
}
```

### ATR (Average True Range)
```javascript
function calculateATR(candles, period = 14) {
  const trueRanges = candles.map((candle, i) => {
    if (i === 0) return candle.high - candle.low;
    const prevClose = candles[i - 1].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - prevClose),
      Math.abs(candle.low - prevClose)
    );
  });
  
  return trueRanges.slice(-period).reduce((a, b) => a + b) / period;
}
```

### ADX (Average Directional Index)
```javascript
function calculateADX(candles, period = 14) {
  // Calculate +DM, -DM, TR
  const dm = candles.map((candle, i) => {
    if (i === 0) return { plusDM: 0, minusDM: 0, tr: candle.high - candle.low };
    
    const prevCandle = candles[i - 1];
    const upMove = candle.high - prevCandle.high;
    const downMove = prevCandle.low - candle.low;
    
    return {
      plusDM: upMove > downMove && upMove > 0 ? upMove : 0,
      minusDM: downMove > upMove && downMove > 0 ? downMove : 0,
      tr: Math.max(
        candle.high - candle.low,
        Math.abs(candle.high - prevCandle.close),
        Math.abs(candle.low - prevCandle.close)
      )
    };
  });
  
  // Smooth and calculate DI+, DI-, DX, ADX
  // ... (full implementation in lib/trading/indicators.js)
}
```

## Smart Money Concepts Detection

### Order Block Detection
```javascript
function detectOrderBlocks(candles, lookback = 50) {
  const orderBlocks = [];
  
  for (let i = lookback; i < candles.length - 3; i++) {
    const current = candles[i];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];
    
    // Bullish Order Block: Last bearish candle before bullish impulse
    if (isBearishCandle(current) && 
        isBullishImpulse(next1, next2) &&
        next2.close > current.high) {
      orderBlocks.push({
        type: 'bullish',
        priceZone: { high: current.high, low: current.low },
        index: i,
        strength: calculateOBStrength(candles, i),
        tested: false
      });
    }
    
    // Bearish Order Block: Last bullish candle before bearish impulse
    if (isBullishCandle(current) && 
        isBearishImpulse(next1, next2) &&
        next2.close < current.low) {
      orderBlocks.push({
        type: 'bearish',
        priceZone: { high: current.high, low: current.low },
        index: i,
        strength: calculateOBStrength(candles, i),
        tested: false
      });
    }
  }
  
  return orderBlocks;
}
```

### Fair Value Gap Detection
```javascript
function detectFVG(candles) {
  const fvgs = [];
  
  for (let i = 2; i < candles.length; i++) {
    const candle1 = candles[i - 2];
    const candle2 = candles[i - 1];
    const candle3 = candles[i];
    
    // Bullish FVG: Gap between candle1 high and candle3 low
    if (candle3.low > candle1.high) {
      fvgs.push({
        type: 'bullish',
        priceZone: { high: candle3.low, low: candle1.high },
        index: i - 1,
        filled: false,
        fillPercent: 0
      });
    }
    
    // Bearish FVG: Gap between candle1 low and candle3 high
    if (candle3.high < candle1.low) {
      fvgs.push({
        type: 'bearish',
        priceZone: { high: candle1.low, low: candle3.high },
        index: i - 1,
        filled: false,
        fillPercent: 0
      });
    }
  }
  
  return fvgs;
}
```

### Liquidity Pool Detection
```javascript
function detectLiquidityPools(candles, threshold = 3) {
  const pools = [];
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  
  // Find equal highs (buy-side liquidity)
  for (let i = 0; i < highs.length - threshold; i++) {
    const equalHighs = findEqualLevels(highs.slice(i), threshold);
    if (equalHighs.length >= threshold) {
      pools.push({
        type: 'buy_side',
        price: highs[i],
        strength: equalHighs.length,
        swept: false
      });
    }
  }
  
  // Find equal lows (sell-side liquidity)
  for (let i = 0; i < lows.length - threshold; i++) {
    const equalLows = findEqualLevels(lows.slice(i), threshold);
    if (equalLows.length >= threshold) {
      pools.push({
        type: 'sell_side',
        price: lows[i],
        strength: equalLows.length,
        swept: false
      });
    }
  }
  
  return pools;
}
```

## Confluence Scoring Algorithm

```javascript
function calculateConfluenceScore(analysis) {
  let score = 0;
  const breakdown = {
    trendAlignment: 0,
    pattern: 0,
    smartMoney: 0,
    fundamental: 0,
    sentiment: 0,
    session: 0
  };
  
  // 1. Trend Alignment (max 25 points)
  const { mtfAnalysis } = analysis;
  if (mtfAnalysis.trendAlignment) {
    breakdown.trendAlignment = 25;
  } else {
    // Partial score based on alignment
    const alignedTimeframes = countAlignedTimeframes(mtfAnalysis);
    breakdown.trendAlignment = Math.floor((alignedTimeframes / 4) * 25);
  }
  
  // 2. Pattern Score (max 20 points)
  const { patterns } = analysis;
  if (patterns.candlePatterns.length > 0 || patterns.chartPatterns.length > 0) {
    const bestPattern = getBestPattern(patterns);
    breakdown.pattern = Math.floor((bestPattern.reliability / 100) * 20);
  }
  
  // 3. Smart Money Score (max 20 points)
  const { smartMoney } = analysis;
  let smcScore = 0;
  if (smartMoney.orderBlocks.length > 0) smcScore += 8;
  if (smartMoney.fairValueGaps.length > 0) smcScore += 6;
  if (smartMoney.structureBreaks.length > 0) smcScore += 6;
  breakdown.smartMoney = Math.min(smcScore, 20);
  
  // 4. Fundamental Score (max 15 points)
  const { fundamental } = analysis;
  if (fundamental.fundamentalBias !== 'neutral') {
    breakdown.fundamental = 10;
    if (fundamental.interestRateDifferential > 1) {
      breakdown.fundamental += 5;
    }
  }
  
  // 5. Sentiment Score (max 15 points)
  const { sentiment } = analysis;
  if (sentiment.sentimentBias !== 'neutral') {
    breakdown.sentiment = 10;
    if (sentiment.cot.extremeLevel) {
      breakdown.sentiment += 5;
    }
  }
  
  // 6. Session Score (max 5 points)
  const { session } = analysis;
  if (session === 'overlap') {
    breakdown.session = 5;
  } else if (session === 'london' || session === 'newyork') {
    breakdown.session = 3;
  }
  
  // Calculate total
  score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  
  return { total: score, breakdown };
}
```

## Signal Generation Flow

```javascript
async function generateSignal(pair, timeframe) {
  // 1. Fetch market data
  const candles = await fetchCandles(pair, timeframe);
  const currentPrice = candles[candles.length - 1].close;
  
  // 2. Run all analyses
  const mtfAnalysis = await runMultiTimeframeAnalysis(pair);
  const patterns = await detectPatterns(candles);
  const smartMoney = await analyzeSmartMoney(candles);
  const fundamental = await analyzeFundamentals(pair);
  const sentiment = await analyzeSentiment(pair);
  const session = getCurrentSession();
  
  // 3. Calculate confluence score
  const confluence = calculateConfluenceScore({
    mtfAnalysis, patterns, smartMoney, fundamental, sentiment, session
  });
  
  // 4. Check minimum threshold
  if (confluence.total < 60) {
    return null; // No signal
  }
  
  // 5. Determine direction
  const direction = determineDirection(mtfAnalysis, patterns, smartMoney);
  
  // 6. Calculate entry, SL, TP
  const entry = calculateEntryZone(currentPrice, smartMoney, patterns);
  const stopLoss = calculateStopLoss(entry, smartMoney, mtfAnalysis);
  const takeProfit = calculateTakeProfitLevels(entry, stopLoss, smartMoney);
  
  // 7. Validate risk/reward
  const rr = calculateRiskReward(entry.price, stopLoss, takeProfit.tp2);
  if (rr < 2) {
    return null; // RR too low
  }
  
  // 8. Generate reasoning
  const reasoning = generateReasoning({
    mtfAnalysis, patterns, smartMoney, fundamental, sentiment
  });
  
  // 9. Create signal object
  const signal = {
    id: generateSignalId(),
    pair,
    direction,
    entry,
    stopLoss,
    takeProfit,
    riskRewardRatio: rr,
    confluence,
    confidence: getConfidenceLevel(confluence.total),
    reasoning,
    timeframe,
    session,
    createdAt: new Date(),
    expiresAt: calculateExpiry(timeframe),
    status: 'active'
  };
  
  // 10. Save and return
  await saveSignal(signal);
  return signal;
}
```

## Error Handling

### Market Data Errors
```javascript
class MarketDataError extends Error {
  constructor(message, pair, source) {
    super(message);
    this.name = 'MarketDataError';
    this.pair = pair;
    this.source = source;
  }
}

// Handle stale data
if (Date.now() - lastUpdate > 5000) {
  throw new MarketDataError('Data is stale', pair, 'price_feed');
}

// Handle missing data
if (!candles || candles.length < requiredCandles) {
  throw new MarketDataError('Insufficient candle data', pair, 'candle_feed');
}
```

### Signal Validation Errors
```javascript
function validateSignal(signal) {
  const errors = [];
  
  if (!signal.pair) errors.push('Missing pair');
  if (!signal.direction) errors.push('Missing direction');
  if (!signal.entry?.price) errors.push('Missing entry price');
  if (!signal.stopLoss) errors.push('Missing stop loss');
  if (signal.riskRewardRatio < 1) errors.push('Invalid risk/reward ratio');
  if (signal.confluence?.total < 60) errors.push('Confluence score too low');
  
  if (errors.length > 0) {
    throw new ValidationError('Invalid signal', errors);
  }
  
  return true;
}
```

## Testing Strategy

### Unit Tests
- Test each indicator calculation with known values
- Test pattern detection with sample candle data
- Test confluence scoring with mock analysis data
- Test signal validation logic

### Property-Based Tests
- Signal serialization round-trip
- Confluence score bounds (0-100)
- Risk/reward calculation consistency
- Entry/SL/TP price relationships

### Integration Tests
- Full signal generation pipeline
- API endpoint responses
- Database operations
