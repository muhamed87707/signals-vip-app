# Design Document: AI Trading Signals System

## Overview

نظام توصيات تداول متقدم يستخدم الذكاء الاصطناعي (Gemini) مع تحليل فني وأساسي شامل لتوليد توصيات عالية الدقة للفوركس والمعادن والمؤشرات. النظام يعمل بشكل مستمر (24/5) ويولد توصيات فقط عندما تتوفر فرص بدرجة confluence ≥70%.

### Key Design Decisions

1. **Architecture**: Modular microservices-style with separate analyzers
2. **AI Integration**: Gemini 2.0 Flash for analysis and reasoning
3. **Data Sources**: Multiple real-time APIs for redundancy
4. **Signal Generation**: Event-driven, not time-based
5. **Storage**: MongoDB for signals, performance tracking, and learning
6. **Frontend**: React components with real-time updates

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  Dashboard  │ │  Signals    │ │ Performance │ │  Settings   │       │
│  │    Page     │ │    List     │ │   Tracker   │ │    Page     │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Layer (Next.js API Routes)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  /signals   │ │  /analyze   │ │   /scan     │ │   /stats    │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Signal Engine (Core)                            │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      Market Scanner                                │ │
│  │  - Scans all assets every 5 minutes                               │ │
│  │  - Identifies potential setups                                     │ │
│  │  - Triggers deep analysis when opportunity found                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Analysis Pipeline                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │   │
│  │  │  Technical  │ │ Fundamental │ │  Sentiment  │               │   │
│  │  │  Analyzer   │ │  Analyzer   │ │  Analyzer   │               │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │   │
│  │  │   Volume    │ │ Intermarket │ │   Pattern   │               │   │
│  │  │  Analyzer   │ │  Analyzer   │ │  Detector   │               │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   Confluence Detector                              │ │
│  │  - Aggregates all analysis results                                │ │
│  │  - Calculates weighted confluence score                           │ │
│  │  - Determines signal grade (A+, A, or No Signal)                  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      AI Predictor (Gemini)                         │ │
│  │  - Analyzes all data holistically                                 │ │
│  │  - Generates entry/SL/TP levels                                   │ │
│  │  - Provides reasoning in Arabic & English                         │ │
│  │  - Identifies risks and invalidation levels                       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      Risk Manager                                  │ │
│  │  - Validates risk/reward ratio                                    │ │
│  │  - Calculates position size                                       │ │
│  │  - Checks portfolio exposure                                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  MongoDB    │ │  Price APIs │ │  News APIs  │ │  COT Data   │       │
│  │  (Signals)  │ │  (Real-time)│ │  (Sentiment)│ │  (Weekly)   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Market Scanner Service

```javascript
// lib/trading/MarketScanner.js
class MarketScanner {
  constructor() {
    this.assets = {
      forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'],
      metals: ['XAUUSD', 'XAGUSD'],
      indices: ['US30', 'US500', 'US100', 'GER40']
    };
    this.timeframes = ['M15', 'H1', 'H4', 'D1', 'W1', 'M1'];
    this.scanInterval = 5 * 60 * 1000; // 5 minutes
  }

  async scan() {
    const opportunities = [];
    for (const [category, symbols] of Object.entries(this.assets)) {
      for (const symbol of symbols) {
        const setup = await this.analyzeAsset(symbol, category);
        if (setup.potential >= 0.6) {
          opportunities.push(setup);
        }
      }
    }
    return opportunities.sort((a, b) => b.potential - a.potential);
  }

  async analyzeAsset(symbol, category) {
    // Quick analysis to identify potential setups
    const priceData = await this.fetchPriceData(symbol);
    const quickAnalysis = {
      symbol,
      category,
      potential: 0,
      reasons: []
    };
    
    // Check for key conditions
    if (this.isAtKeyLevel(priceData)) quickAnalysis.potential += 0.2;
    if (this.hasCandlePattern(priceData)) quickAnalysis.potential += 0.15;
    if (this.hasIndicatorSignal(priceData)) quickAnalysis.potential += 0.15;
    if (this.isInTrend(priceData)) quickAnalysis.potential += 0.1;
    
    return quickAnalysis;
  }
}
```

### 2. Technical Analyzer

```javascript
// lib/trading/TechnicalAnalyzer.js
class TechnicalAnalyzer {
  constructor() {
    this.indicators = [
      'EMA_9', 'EMA_21', 'EMA_50', 'EMA_100', 'EMA_200',
      'RSI_14', 'MACD', 'STOCHASTIC', 'BOLLINGER',
      'ATR_14', 'ADX_14', 'ICHIMOKU', 'VOLUME_PROFILE'
    ];
  }

  async analyze(symbol, timeframes) {
    const results = {
      symbol,
      timestamp: new Date(),
      indicators: {},
      patterns: [],
      levels: {},
      smartMoney: {},
      score: 0,
      bias: 'neutral' // bullish, bearish, neutral
    };

    // Analyze each timeframe
    for (const tf of timeframes) {
      const data = await this.fetchOHLCV(symbol, tf);
      results.indicators[tf] = await this.calculateIndicators(data);
      results.patterns[tf] = await this.detectPatterns(data);
      results.levels[tf] = await this.findKeyLevels(data);
      results.smartMoney[tf] = await this.analyzeSmartMoney(data);
    }

    // Calculate overall technical score
    results.score = this.calculateScore(results);
    results.bias = this.determineBias(results);

    return results;
  }

  async calculateIndicators(data) {
    return {
      ema: {
        ema9: this.calculateEMA(data, 9),
        ema21: this.calculateEMA(data, 21),
        ema50: this.calculateEMA(data, 50),
        ema100: this.calculateEMA(data, 100),
        ema200: this.calculateEMA(data, 200)
      },
      rsi: this.calculateRSI(data, 14),
      macd: this.calculateMACD(data),
      stochastic: this.calculateStochastic(data),
      bollinger: this.calculateBollinger(data),
      atr: this.calculateATR(data, 14),
      adx: this.calculateADX(data, 14),
      ichimoku: this.calculateIchimoku(data)
    };
  }

  async detectPatterns(data) {
    const patterns = [];
    
    // Candlestick patterns
    patterns.push(...this.detectCandlestickPatterns(data));
    
    // Chart patterns
    patterns.push(...this.detectChartPatterns(data));
    
    // Harmonic patterns
    patterns.push(...this.detectHarmonicPatterns(data));
    
    return patterns;
  }

  async analyzeSmartMoney(data) {
    return {
      orderBlocks: this.findOrderBlocks(data),
      fairValueGaps: this.findFVG(data),
      liquidityPools: this.findLiquidityPools(data),
      breakOfStructure: this.detectBOS(data),
      changeOfCharacter: this.detectCHoCH(data)
    };
  }
}
```

### 3. Fundamental Analyzer

```javascript
// lib/trading/FundamentalAnalyzer.js
class FundamentalAnalyzer {
  async analyze(symbol) {
    const results = {
      symbol,
      timestamp: new Date(),
      economicData: {},
      cotData: {},
      currencyStrength: {},
      newsImpact: {},
      score: 0,
      bias: 'neutral'
    };

    // Get relevant currencies for the pair
    const currencies = this.extractCurrencies(symbol);

    // Analyze economic calendar
    results.economicData = await this.getEconomicEvents(currencies);

    // Get COT data
    results.cotData = await this.getCOTData(symbol);

    // Calculate currency strength
    results.currencyStrength = await this.getCurrencyStrength(currencies);

    // Analyze news sentiment
    results.newsImpact = await this.analyzeNewsSentiment(symbol);

    // Calculate score
    results.score = this.calculateFundamentalScore(results);
    results.bias = this.determineFundamentalBias(results);

    return results;
  }

  async getCOTData(symbol) {
    // Fetch and analyze COT report
    const cotReport = await this.fetchCOTReport(symbol);
    return {
      commercials: cotReport.commercialNet,
      nonCommercials: cotReport.nonCommercialNet,
      retailers: cotReport.retailNet,
      weeklyChange: cotReport.weeklyChange,
      positioning: this.interpretCOT(cotReport)
    };
  }
}
```

### 4. AI Predictor (Gemini Integration)

```javascript
// lib/trading/AIPredictor.js
class AIPredictor {
  constructor() {
    this.model = 'gemini-2.0-flash';
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async generateSignal(analysisData) {
    const prompt = this.buildPrompt(analysisData);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3, // Lower for more consistent analysis
            maxOutputTokens: 4096
          }
        })
      }
    );

    const result = await response.json();
    return this.parseAIResponse(result);
  }

  buildPrompt(data) {
    return `
أنت محلل تداول محترف. قم بتحليل البيانات التالية وأعطني توصية تداول دقيقة.

## بيانات الأصل: ${data.symbol}

### التحليل الفني:
${JSON.stringify(data.technical, null, 2)}

### التحليل الأساسي:
${JSON.stringify(data.fundamental, null, 2)}

### تحليل المشاعر:
${JSON.stringify(data.sentiment, null, 2)}

### مستويات الدعم والمقاومة:
${JSON.stringify(data.levels, null, 2)}

### Smart Money Analysis:
${JSON.stringify(data.smartMoney, null, 2)}

---

أعطني الرد بالتنسيق JSON التالي:
{
  "shouldTrade": true/false,
  "direction": "BUY" أو "SELL",
  "entry": سعر الدخول,
  "stopLoss": سعر وقف الخسارة,
  "takeProfit1": الهدف الأول,
  "takeProfit2": الهدف الثاني,
  "takeProfit3": الهدف الثالث,
  "confidence": نسبة الثقة (0-100),
  "reasoning": {
    "ar": "الشرح بالعربية",
    "en": "Explanation in English"
  },
  "risks": ["المخاطر"],
  "invalidation": "ما يُبطل التوصية",
  "keyFactors": ["العوامل الرئيسية الداعمة"]
}

تذكر:
1. لا تعطي توصية إلا إذا كانت الثقة > 70%
2. نسبة المخاطرة للعائد يجب أن تكون 1:2 على الأقل
3. كن محافظاً في تحديد وقف الخسارة
4. اشرح بوضوح سبب التوصية
`;
  }

  parseAIResponse(response) {
    try {
      const text = response.candidates[0].content.parts[0].text;
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    return null;
  }
}
```

### 5. Confluence Detector

```javascript
// lib/trading/ConfluenceDetector.js
class ConfluenceDetector {
  constructor() {
    this.weights = {
      technical: 0.30,
      priceAction: 0.25,
      multiTimeframe: 0.20,
      fundamental: 0.15,
      aiConfidence: 0.10
    };
  }

  calculateConfluence(analysisResults) {
    const scores = {
      technical: analysisResults.technical.score,
      priceAction: analysisResults.priceAction.score,
      multiTimeframe: this.calculateMTFScore(analysisResults),
      fundamental: analysisResults.fundamental.score,
      aiConfidence: analysisResults.ai.confidence
    };

    // Calculate weighted score
    let totalScore = 0;
    for (const [key, weight] of Object.entries(this.weights)) {
      totalScore += scores[key] * weight;
    }

    // Determine grade
    let grade = 'NO_SIGNAL';
    if (totalScore >= 80) grade = 'A_PLUS';
    else if (totalScore >= 70) grade = 'A';

    return {
      totalScore,
      grade,
      breakdown: scores,
      weights: this.weights
    };
  }

  calculateMTFScore(results) {
    const timeframes = ['D1', 'H4', 'H1'];
    let alignedCount = 0;
    const primaryBias = results.technical.bias;

    for (const tf of timeframes) {
      if (results.technical.indicators[tf]?.bias === primaryBias) {
        alignedCount++;
      }
    }

    return (alignedCount / timeframes.length) * 100;
  }
}
```

### 6. Risk Manager

```javascript
// lib/trading/RiskManager.js
class RiskManager {
  constructor() {
    this.maxRiskPerTrade = 0.02; // 2%
    this.maxDailyDrawdown = 0.03; // 3%
    this.minRiskReward = 2; // 1:2
  }

  validateSignal(signal, accountBalance) {
    const validation = {
      isValid: true,
      issues: [],
      adjustments: {}
    };

    // Check risk/reward ratio
    const riskReward = this.calculateRiskReward(signal);
    if (riskReward < this.minRiskReward) {
      validation.isValid = false;
      validation.issues.push(`Risk/Reward ${riskReward.toFixed(2)} is below minimum ${this.minRiskReward}`);
    }

    // Calculate position size
    const positionSize = this.calculatePositionSize(
      accountBalance,
      signal.entry,
      signal.stopLoss,
      signal.symbol
    );

    validation.positionSize = positionSize;
    validation.riskAmount = accountBalance * this.maxRiskPerTrade;
    validation.potentialProfit = this.calculatePotentialProfit(signal, positionSize);

    return validation;
  }

  calculatePositionSize(balance, entry, stopLoss, symbol) {
    const riskAmount = balance * this.maxRiskPerTrade;
    const pipValue = this.getPipValue(symbol);
    const stopLossPips = Math.abs(entry - stopLoss) / pipValue;
    
    return riskAmount / (stopLossPips * pipValue);
  }

  calculateRiskReward(signal) {
    const risk = Math.abs(signal.entry - signal.stopLoss);
    const reward = Math.abs(signal.takeProfit2 - signal.entry);
    return reward / risk;
  }
}
```

## Data Models

### Signal Model

```javascript
// models/TradingSignal.js
import mongoose from 'mongoose';

const TradingSignalSchema = new mongoose.Schema({
  // Basic Info
  symbol: { type: String, required: true, index: true },
  direction: { type: String, enum: ['BUY', 'SELL'], required: true },
  grade: { type: String, enum: ['A_PLUS', 'A'], required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },

  // Price Levels
  entry: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  takeProfit1: { type: Number, required: true },
  takeProfit2: { type: Number, required: true },
  takeProfit3: { type: Number },
  currentPrice: { type: Number },

  // Risk Management
  riskRewardRatio: { type: Number, required: true },
  suggestedLotSize: { type: Number },
  riskPercentage: { type: Number, default: 2 },

  // Confluence Analysis
  confluenceScore: { type: Number, required: true },
  confluenceBreakdown: {
    technical: { type: Number },
    priceAction: { type: Number },
    multiTimeframe: { type: Number },
    fundamental: { type: Number },
    aiConfidence: { type: Number }
  },

  // AI Analysis
  reasoning: {
    ar: { type: String },
    en: { type: String }
  },
  keyFactors: [{ type: String }],
  risks: [{ type: String }],
  invalidation: { type: String },

  // Technical Details
  technicalAnalysis: {
    indicators: { type: mongoose.Schema.Types.Mixed },
    patterns: [{ type: String }],
    levels: { type: mongoose.Schema.Types.Mixed },
    smartMoney: { type: mongoose.Schema.Types.Mixed }
  },

  // Fundamental Details
  fundamentalAnalysis: {
    bias: { type: String },
    cotData: { type: mongoose.Schema.Types.Mixed },
    upcomingEvents: [{ type: mongoose.Schema.Types.Mixed }]
  },

  // Performance Tracking
  result: {
    outcome: { type: String, enum: ['WIN', 'LOSS', 'BREAKEVEN', 'PARTIAL'] },
    pips: { type: Number },
    percentage: { type: Number },
    exitPrice: { type: Number },
    exitTime: { type: Date },
    holdingDuration: { type: Number } // in minutes
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  activatedAt: { type: Date },
  closedAt: { type: Date },
  expiresAt: { type: Date }
});

// Indexes for performance
TradingSignalSchema.index({ status: 1, createdAt: -1 });
TradingSignalSchema.index({ symbol: 1, status: 1 });

export default mongoose.models.TradingSignal || mongoose.model('TradingSignal', TradingSignalSchema);
```

### Performance Stats Model

```javascript
// models/SignalPerformance.js
import mongoose from 'mongoose';

const SignalPerformanceSchema = new mongoose.Schema({
  period: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'], required: true },
  date: { type: Date, required: true },
  
  // Overall Stats
  totalSignals: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  breakeven: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  
  // Profit Stats
  totalPips: { type: Number, default: 0 },
  averageWin: { type: Number, default: 0 },
  averageLoss: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 },
  expectancy: { type: Number, default: 0 },
  
  // Risk Stats
  maxDrawdown: { type: Number, default: 0 },
  sharpeRatio: { type: Number, default: 0 },
  maxConsecutiveLosses: { type: Number, default: 0 },
  
  // By Asset
  byAsset: [{
    symbol: String,
    signals: Number,
    winRate: Number,
    totalPips: Number
  }],
  
  // By Grade
  byGrade: {
    aPlus: { signals: Number, winRate: Number },
    a: { signals: Number, winRate: Number }
  }
});

export default mongoose.models.SignalPerformance || mongoose.model('SignalPerformance', SignalPerformanceSchema);
```


## API Endpoints

### Signal Generation APIs

```javascript
// app/api/trading/scan/route.js
// GET - Trigger market scan
// Returns: List of potential opportunities

// app/api/trading/analyze/route.js
// POST - Deep analysis for specific asset
// Body: { symbol, timeframes }
// Returns: Complete analysis with confluence score

// app/api/trading/generate-signal/route.js
// POST - Generate trading signal
// Body: { symbol, analysisData }
// Returns: Complete signal with entry/SL/TP

// app/api/trading/signals/route.js
// GET - Get all signals (with filters)
// Query: { status, symbol, grade, limit }
// Returns: List of signals

// app/api/trading/signals/[id]/route.js
// GET - Get specific signal details
// PATCH - Update signal status
// DELETE - Cancel signal

// app/api/trading/signals/active/route.js
// GET - Get all active signals
// Returns: Active signals with current P/L

// app/api/trading/performance/route.js
// GET - Get performance statistics
// Query: { period: 'daily' | 'weekly' | 'monthly' | 'all' }
// Returns: Performance metrics
```

### Data APIs

```javascript
// app/api/trading/price/[symbol]/route.js
// GET - Get real-time price for symbol

// app/api/trading/indicators/route.js
// POST - Calculate indicators for symbol
// Body: { symbol, timeframe, indicators }

// app/api/trading/levels/route.js
// POST - Get support/resistance levels
// Body: { symbol, timeframe }

// app/api/trading/cot/route.js
// GET - Get COT report data

// app/api/trading/calendar/route.js
// GET - Get economic calendar events

// app/api/trading/strength/route.js
// GET - Get currency strength meter
```

## Frontend Components

### Main Dashboard Component

```javascript
// app/trading-signals/page.js
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  SignalsDashboard,
  ActiveSignals,
  SignalCard,
  PerformanceStats,
  MarketScanner,
  WatchList,
  RiskCalculator,
  AlertsPanel
} from './components';

export default function TradingSignalsPage() {
  const { lang } = useLanguage();
  const [activeSignals, setActiveSignals] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    // Fetch active signals, watchlist, and performance
  };

  return (
    <div className="trading-signals-page">
      {/* Header with stats summary */}
      <PerformanceStats data={performance} lang={lang} />
      
      {/* Active Signals */}
      <ActiveSignals signals={activeSignals} lang={lang} />
      
      {/* Watchlist - Potential setups */}
      <WatchList items={watchlist} lang={lang} />
      
      {/* Market Scanner */}
      <MarketScanner lang={lang} />
      
      {/* Risk Calculator */}
      <RiskCalculator lang={lang} />
    </div>
  );
}
```

### Signal Card Component

```javascript
// app/trading-signals/components/SignalCard.js
'use client';

export default function SignalCard({ signal, lang, expanded = false }) {
  const isArabic = lang === 'ar';
  
  const gradeColors = {
    'A_PLUS': '#4caf50',
    'A': '#8bc34a'
  };

  const directionColors = {
    'BUY': '#4caf50',
    'SELL': '#f44336'
  };

  return (
    <div className="signal-card">
      {/* Header */}
      <div className="signal-header">
        <div className="signal-symbol">
          <span className="direction-badge" style={{ backgroundColor: directionColors[signal.direction] }}>
            {signal.direction}
          </span>
          <h3>{signal.symbol}</h3>
        </div>
        <div className="signal-grade" style={{ backgroundColor: gradeColors[signal.grade] }}>
          {signal.grade === 'A_PLUS' ? 'A+' : 'A'} ({signal.confluenceScore}%)
        </div>
      </div>

      {/* Price Levels */}
      <div className="price-levels">
        <div className="level entry">
          <span className="label">{isArabic ? 'الدخول' : 'Entry'}</span>
          <span className="value">{signal.entry.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</span>
        </div>
        <div className="level stop-loss">
          <span className="label">{isArabic ? 'وقف الخسارة' : 'Stop Loss'}</span>
          <span className="value">{signal.stopLoss.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</span>
        </div>
        <div className="level take-profit">
          <span className="label">{isArabic ? 'الهدف 1' : 'TP1'}</span>
          <span className="value">{signal.takeProfit1.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</span>
        </div>
        <div className="level take-profit">
          <span className="label">{isArabic ? 'الهدف 2' : 'TP2'}</span>
          <span className="value">{signal.takeProfit2.toFixed(signal.symbol.includes('JPY') ? 3 : 5)}</span>
        </div>
      </div>

      {/* Risk/Reward */}
      <div className="risk-reward">
        <span>{isArabic ? 'نسبة المخاطرة/العائد' : 'Risk/Reward'}: 1:{signal.riskRewardRatio.toFixed(1)}</span>
      </div>

      {/* Confluence Breakdown */}
      {expanded && (
        <div className="confluence-breakdown">
          <h4>{isArabic ? 'تحليل Confluence' : 'Confluence Analysis'}</h4>
          <div className="breakdown-bars">
            {Object.entries(signal.confluenceBreakdown).map(([key, value]) => (
              <div key={key} className="breakdown-item">
                <span className="breakdown-label">{key}</span>
                <div className="breakdown-bar">
                  <div className="bar-fill" style={{ width: `${value}%` }}></div>
                </div>
                <span className="breakdown-value">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      {expanded && (
        <div className="ai-reasoning">
          <h4>{isArabic ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}</h4>
          <p>{isArabic ? signal.reasoning.ar : signal.reasoning.en}</p>
          
          <div className="key-factors">
            <h5>{isArabic ? 'العوامل الرئيسية' : 'Key Factors'}</h5>
            <ul>
              {signal.keyFactors.map((factor, i) => (
                <li key={i}>✅ {factor}</li>
              ))}
            </ul>
          </div>

          <div className="risks">
            <h5>{isArabic ? 'المخاطر' : 'Risks'}</h5>
            <ul>
              {signal.risks.map((risk, i) => (
                <li key={i}>⚠️ {risk}</li>
              ))}
            </ul>
          </div>

          <div className="invalidation">
            <h5>{isArabic ? 'ما يُبطل التوصية' : 'Invalidation'}</h5>
            <p>❌ {signal.invalidation}</p>
          </div>
        </div>
      )}

      {/* Current P/L if active */}
      {signal.status === 'ACTIVE' && (
        <div className="current-pl" style={{ 
          backgroundColor: signal.currentPL >= 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'
        }}>
          <span>{isArabic ? 'الربح/الخسارة الحالي' : 'Current P/L'}</span>
          <span className={signal.currentPL >= 0 ? 'profit' : 'loss'}>
            {signal.currentPL >= 0 ? '+' : ''}{signal.currentPL} pips
          </span>
        </div>
      )}
    </div>
  );
}
```

### Performance Dashboard Component

```javascript
// app/trading-signals/components/PerformanceStats.js
'use client';

export default function PerformanceStats({ data, lang }) {
  const isArabic = lang === 'ar';

  if (!data) return null;

  return (
    <div className="performance-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">{isArabic ? 'نسبة النجاح' : 'Win Rate'}</span>
          <span className="stat-value">{data.winRate.toFixed(1)}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{isArabic ? 'إجمالي النقاط' : 'Total Pips'}</span>
          <span className="stat-value" style={{ color: data.totalPips >= 0 ? '#4caf50' : '#f44336' }}>
            {data.totalPips >= 0 ? '+' : ''}{data.totalPips}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{isArabic ? 'معامل الربح' : 'Profit Factor'}</span>
          <span className="stat-value">{data.profitFactor.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{isArabic ? 'الصفقات' : 'Trades'}</span>
          <span className="stat-value">{data.wins}W / {data.losses}L</span>
        </div>
      </div>
    </div>
  );
}
```

## Error Handling

```javascript
// lib/trading/ErrorHandler.js
class TradingErrorHandler {
  static handleDataFetchError(error, source) {
    console.error(`Data fetch error from ${source}:`, error);
    
    // Return cached data if available
    const cachedData = this.getCachedData(source);
    if (cachedData && !this.isStale(cachedData)) {
      return { data: cachedData, fromCache: true };
    }
    
    // Return error state
    return { 
      error: true, 
      message: `Unable to fetch data from ${source}`,
      retryAfter: 60 
    };
  }

  static handleAnalysisError(error, symbol) {
    console.error(`Analysis error for ${symbol}:`, error);
    
    return {
      error: true,
      symbol,
      message: 'Analysis failed - skipping this asset',
      shouldRetry: true
    };
  }

  static handleAIError(error) {
    console.error('AI prediction error:', error);
    
    // Fall back to rule-based signal generation
    return {
      error: true,
      fallbackMode: true,
      message: 'AI unavailable - using rule-based analysis'
    };
  }
}
```

## Testing Strategy

### Unit Tests
- Test each analyzer independently
- Test confluence score calculation
- Test risk management calculations
- Test signal validation logic

### Integration Tests
- Test full signal generation pipeline
- Test API endpoints
- Test real-time price updates

### Property-Based Tests
- Test that confluence scores are always 0-100
- Test that risk/reward calculations are consistent
- Test that position sizing never exceeds limits

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Confluence Score Bounds
*For any* analysis result, the confluence score SHALL always be between 0 and 100 inclusive.
**Validates: Requirements 6.1, 6.2**

### Property 2: Risk/Reward Minimum
*For any* generated signal, the risk/reward ratio SHALL be at least 1:2.
**Validates: Requirements 5.2**

### Property 3: Signal Grade Consistency
*For any* signal with confluence score ≥80%, the grade SHALL be A_PLUS. For scores 70-79%, grade SHALL be A.
**Validates: Requirements 6.2, 6.3**

### Property 4: Position Size Safety
*For any* calculated position size, the risk amount SHALL NOT exceed the configured maximum risk percentage of account balance.
**Validates: Requirements 5.1, 5.4**

### Property 5: Multi-Timeframe Alignment
*For any* signal, at least 2 of 3 major timeframes (D1, H4, H1) SHALL agree on direction.
**Validates: Requirements 1.4**

### Property 6: Stop Loss Validity
*For any* BUY signal, stop loss SHALL be below entry. For SELL signals, stop loss SHALL be above entry.
**Validates: Requirements 4.2**

### Property 7: Take Profit Ordering
*For any* signal, TP1 < TP2 < TP3 for BUY signals, and TP1 > TP2 > TP3 for SELL signals.
**Validates: Requirements 4.2**

### Property 8: No Signal Below Threshold
*For any* analysis with confluence score < 70%, NO signal SHALL be generated.
**Validates: Requirements 6.4**

### Property 9: Data Freshness
*For any* signal generation, price data SHALL NOT be older than 60 seconds.
**Validates: Requirements 13.4**

### Property 10: AI Reasoning Completeness
*For any* generated signal, reasoning SHALL be provided in both Arabic and English.
**Validates: Requirements 50.1, 50.2**
