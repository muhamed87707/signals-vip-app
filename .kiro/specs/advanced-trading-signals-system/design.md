# Design Document: Institutional Edge System (IES)

## Overview

نظام توصيات التداول المؤسسي المتقدم (IES) هو نظام شامل يجمع بين 10 منهجيات تحليل متقدمة لتقديم توصيات تداول عالية الدقة. النظام مبني على بنية معمارية modular تسمح بالتوسع والصيانة السهلة.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSTITUTIONAL EDGE SYSTEM (IES)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Alpha Vantage│  │ Twelve Data  │  │ Yahoo Finance│              │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │   │
│  │         └─────────────────┼─────────────────┘                       │   │
│  │                           ▼                                          │   │
│  │              ┌────────────────────────┐                             │   │
│  │              │   Market Data Provider  │                             │   │
│  │              │   (Aggregator + Cache)  │                             │   │
│  │              └────────────┬───────────┘                             │   │
│  └───────────────────────────┼─────────────────────────────────────────┘   │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ANALYSIS LAYER                                  │   │
│  │                                                                       │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │    SMC      │ │   Wyckoff   │ │   Elliott   │ │     VSA     │   │   │
│  │  │  Analyzer   │ │  Analyzer   │ │   Analyzer  │ │  Analyzer   │   │   │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │   │
│  │         │               │               │               │           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │   Market    │ │  Order Flow │ │ Intermarket │ │  Technical  │   │   │
│  │  │  Profile    │ │  Analyzer   │ │  Analyzer   │ │  Analyzer   │   │   │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │   │
│  │         │               │               │               │           │   │
│  │  ┌─────────────┐ ┌─────────────┐                                   │   │
│  │  │ Fundamental │ │  Sentiment  │                                   │   │
│  │  │  Analyzer   │ │  Analyzer   │                                   │   │
│  │  └──────┬──────┘ └──────┬──────┘                                   │   │
│  │         └───────────────┼───────────────────────────────────────┘   │   │
│  └─────────────────────────┼───────────────────────────────────────────┘   │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AI & VALIDATION LAYER                           │   │
│  │                                                                       │   │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────┐    │   │
│  │  │    AI Ensemble      │    │    Multi-Layer Validator        │    │   │
│  │  │  ┌───────────────┐  │    │  ┌─────────────────────────┐   │    │   │
│  │  │  │  Gemini AI    │  │    │  │  10-Layer Validation    │   │    │   │
│  │  │  │  Pattern Rec  │  │    │  │  System                 │   │    │   │
│  │  │  │  Probability  │  │    │  │  (8/10 required)        │   │    │   │
│  │  │  └───────────────┘  │    │  └─────────────────────────┘   │    │   │
│  │  └──────────┬──────────┘    └──────────────┬──────────────────┘    │   │
│  │             └───────────────────────────────┘                       │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SIGNAL GENERATION LAYER                         │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ Confluence      │  │ Signal          │  │ Risk            │     │   │
│  │  │ Calculator      │  │ Generator       │  │ Manager         │     │   │
│  │  │ (Score 0-100)   │  │ (Entry/SL/TP)   │  │ (Position Size) │     │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │   │
│  │           └────────────────────┼────────────────────┘               │   │
│  └────────────────────────────────┼────────────────────────────────────┘   │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PRESENTATION LAYER                              │   │
│  │                                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │  Dashboard  │  │   Signal    │  │   Charts    │  │  Alerts   │  │   │
│  │  │    Page     │  │   Cards     │  │  Component  │  │  System   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture

### System Layers

1. **Data Layer**: جلب وتجميع البيانات من مصادر متعددة
2. **Analysis Layer**: 10 محللات متخصصة تعمل بالتوازي
3. **AI & Validation Layer**: الذكاء الاصطناعي والتحقق متعدد الطبقات
4. **Signal Generation Layer**: توليد التوصيات مع إدارة المخاطر
5. **Presentation Layer**: واجهة المستخدم والتنبيهات

### Technology Stack

- **Frontend**: Next.js 15 (React), TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (signals, performance, cache)
- **AI**: Google Gemini AI API
- **Data APIs**: Alpha Vantage, Twelve Data, Yahoo Finance
- **Charts**: Lightweight Charts (TradingView)
- **State Management**: React Context + SWR

## Components and Interfaces

### 1. Market Data Provider

```typescript
interface MarketDataProvider {
  // Fetch OHLCV data for instrument
  getOHLCV(symbol: string, timeframe: Timeframe, bars: number): Promise<Candle[]>;
  
  // Get real-time price
  getCurrentPrice(symbol: string): Promise<Price>;
  
  // Get multiple timeframes at once
  getMultiTimeframe(symbol: string): Promise<MultiTimeframeData>;
  
  // Subscribe to price updates
  subscribe(symbol: string, callback: (price: Price) => void): void;
}

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1' | 'W1';
```

### 2. SMC Analyzer

```typescript
interface SMCAnalyzer {
  // Identify Order Blocks
  findOrderBlocks(candles: Candle[]): OrderBlock[];
  
  // Detect Fair Value Gaps
  findFVGs(candles: Candle[]): FairValueGap[];
  
  // Identify Liquidity Zones
  findLiquidityZones(candles: Candle[]): LiquidityZone[];
  
  // Detect Structure Breaks
  detectBOS(candles: Candle[]): StructureBreak[];
  detectCHoCH(candles: Candle[]): StructureBreak[];
  
  // Calculate Premium/Discount
  getPremiumDiscount(candles: Candle[]): PremiumDiscount;
  
  // Get OTE Zone
  getOTEZone(swing: SwingPoint[]): OTEZone;
  
  // Full SMC Analysis
  analyze(candles: Candle[]): SMCAnalysis;
}

interface OrderBlock {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  timestamp: number;
  strength: number; // 0-100
  mitigated: boolean;
}

interface FairValueGap {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  timestamp: number;
  filled: boolean;
}

interface SMCAnalysis {
  orderBlocks: OrderBlock[];
  fvgs: FairValueGap[];
  liquidityZones: LiquidityZone[];
  structureBreaks: StructureBreak[];
  premiumDiscount: PremiumDiscount;
  oteZone: OTEZone | null;
  score: number; // 0-100
  bias: 'bullish' | 'bearish' | 'neutral';
}
```

### 3. Wyckoff Analyzer

```typescript
interface WyckoffAnalyzer {
  // Identify current phase
  identifyPhase(candles: Candle[]): WyckoffPhase;
  
  // Detect Spring/Upthrust
  detectSpring(candles: Candle[]): SpringPattern | null;
  detectUpthrust(candles: Candle[]): UpthrustPattern | null;
  
  // Identify SOS/SOW
  detectSOS(candles: Candle[]): SignOfStrength | null;
  detectSOW(candles: Candle[]): SignOfWeakness | null;
  
  // Full analysis
  analyze(candles: Candle[]): WyckoffAnalysis;
}

interface WyckoffPhase {
  type: 'accumulation' | 'distribution' | 'markup' | 'markdown' | 'unknown';
  stage: string; // PS, SC, AR, ST, Spring, SOS, etc.
  probability: number; // 0-100
}

interface WyckoffAnalysis {
  phase: WyckoffPhase;
  spring: SpringPattern | null;
  upthrust: UpthrustPattern | null;
  sos: SignOfStrength | null;
  sow: SignOfWeakness | null;
  score: number;
  bias: 'bullish' | 'bearish' | 'neutral';
}
```

### 4. Elliott Wave Analyzer

```typescript
interface ElliottWaveAnalyzer {
  // Identify wave structure
  identifyWaves(candles: Candle[]): WaveStructure;
  
  // Get current wave position
  getCurrentWave(candles: Candle[]): CurrentWave;
  
  // Calculate wave targets
  calculateTargets(wave: CurrentWave): WaveTargets;
  
  // Get invalidation level
  getInvalidation(wave: CurrentWave): number;
  
  // Full analysis
  analyze(candles: Candle[]): ElliottAnalysis;
}

interface WaveStructure {
  type: 'impulse' | 'corrective';
  waves: Wave[];
  degree: 'primary' | 'intermediate' | 'minor';
}

interface ElliottAnalysis {
  structure: WaveStructure;
  currentWave: CurrentWave;
  targets: WaveTargets;
  invalidation: number;
  score: number;
  bias: 'bullish' | 'bearish' | 'neutral';
}
```

### 5. Technical Analyzer

```typescript
interface TechnicalAnalyzer {
  // Calculate indicators
  calculateEMA(candles: Candle[], period: number): number[];
  calculateRSI(candles: Candle[], period: number): RSIResult;
  calculateMACD(candles: Candle[]): MACDResult;
  calculateBollingerBands(candles: Candle[]): BollingerResult;
  calculateATR(candles: Candle[], period: number): number[];
  calculateIchimoku(candles: Candle[]): IchimokuResult;
  
  // Detect patterns
  detectCandlePatterns(candles: Candle[]): CandlePattern[];
  detectChartPatterns(candles: Candle[]): ChartPattern[];
  
  // Detect divergences
  detectDivergences(candles: Candle[]): Divergence[];
  
  // Calculate Fibonacci
  calculateFibonacci(high: number, low: number): FibonacciLevels;
  
  // Full analysis
  analyze(candles: Candle[]): TechnicalAnalysis;
}

interface TechnicalAnalysis {
  trend: TrendAnalysis;
  momentum: MomentumAnalysis;
  volatility: VolatilityAnalysis;
  patterns: PatternAnalysis;
  divergences: Divergence[];
  fibonacci: FibonacciLevels;
  score: number;
  bias: 'bullish' | 'bearish' | 'neutral';
}
```

### 6. AI Ensemble

```typescript
interface AIEnsemble {
  // Analyze setup with Gemini AI
  analyzeSetup(context: AnalysisContext): Promise<AIAnalysis>;
  
  // Find similar historical patterns
  findSimilarPatterns(setup: SetupData): Promise<HistoricalPattern[]>;
  
  // Calculate win probability
  calculateProbability(setup: SetupData): Promise<number>;
  
  // Detect market regime
  detectRegime(candles: Candle[]): MarketRegime;
  
  // Generate reasoning
  generateReasoning(analysis: FullAnalysis): Promise<string[]>;
}

interface AIAnalysis {
  confidence: number; // 0-100
  direction: 'long' | 'short' | 'neutral';
  patternType: string;
  reasoning: string[];
  similarPatterns: HistoricalPattern[];
  winProbability: number;
  regime: MarketRegime;
}

type MarketRegime = 'trending_up' | 'trending_down' | 'ranging' | 'volatile' | 'quiet';
```

### 7. Multi-Layer Validator

```typescript
interface MultiLayerValidator {
  // Validate all 10 layers
  validate(analysis: FullAnalysis): ValidationResult;
  
  // Individual layer validation
  validateHTFTrend(analysis: FullAnalysis): LayerResult;
  validateMarketStructure(analysis: FullAnalysis): LayerResult;
  validateSMCConfluence(analysis: FullAnalysis): LayerResult;
  validateWyckoff(analysis: FullAnalysis): LayerResult;
  validateVSA(analysis: FullAnalysis): LayerResult;
  validateOrderFlow(analysis: FullAnalysis): LayerResult;
  validateTechnical(analysis: FullAnalysis): LayerResult;
  validateIntermarket(analysis: FullAnalysis): LayerResult;
  validateKillZone(analysis: FullAnalysis): LayerResult;
  validateAIConfidence(analysis: FullAnalysis): LayerResult;
}

interface ValidationResult {
  passed: boolean;
  passedLayers: number;
  totalLayers: number;
  layers: LayerResult[];
  criticalLayersFailed: string[];
}

interface LayerResult {
  layer: number;
  name: string;
  passed: boolean;
  score: number;
  reason: string;
}
```

### 8. Signal Generator

```typescript
interface SignalGenerator {
  // Generate signal from validated analysis
  generateSignal(analysis: FullAnalysis, validation: ValidationResult): Signal | null;
  
  // Calculate entry price
  calculateEntry(analysis: FullAnalysis): number;
  
  // Calculate stop loss
  calculateStopLoss(analysis: FullAnalysis): StopLoss;
  
  // Calculate take profits
  calculateTakeProfits(entry: number, sl: number): TakeProfits;
}

interface Signal {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  confluenceScore: number;
  quality: 'good' | 'strong' | 'excellent' | 'institutional';
  reasoning: string[];
  validationLayers: LayerResult[];
  timestamp: number;
  expiresAt: number;
  status: 'active' | 'tp1_hit' | 'tp2_hit' | 'tp3_hit' | 'sl_hit' | 'expired';
}
```

### 9. Confluence Calculator

```typescript
interface ConfluenceCalculator {
  // Calculate overall confluence score
  calculate(analysis: FullAnalysis): ConfluenceResult;
  
  // Get component scores
  getComponentScores(analysis: FullAnalysis): ComponentScores;
}

interface ConfluenceResult {
  score: number; // 0-100
  quality: 'poor' | 'fair' | 'good' | 'strong' | 'excellent' | 'institutional';
  components: ComponentScores;
  breakdown: ScoreBreakdown[];
}

interface ComponentScores {
  smc: number;           // 20%
  structure: number;     // 15%
  wyckoff: number;       // 10%
  vsa: number;           // 10%
  orderFlow: number;     // 10%
  technical: number;     // 10%
  intermarket: number;   // 5%
  fundamental: number;   // 5%
  sentiment: number;     // 5%
  ai: number;            // 10%
}
```

### 10. Risk Manager

```typescript
interface RiskManager {
  // Calculate position size
  calculatePositionSize(
    accountBalance: number,
    riskPercent: number,
    entry: number,
    stopLoss: number,
    symbol: string
  ): PositionSize;
  
  // Calculate risk-reward ratio
  calculateRR(entry: number, sl: number, tp: number): number;
  
  // Check correlation risk
  checkCorrelationRisk(newSignal: Signal, activeSignals: Signal[]): CorrelationWarning[];
  
  // Adjust for volatility
  adjustForVolatility(signal: Signal, atr: number, avgAtr: number): Signal;
}

interface PositionSize {
  lots: number;
  units: number;
  riskAmount: number;
  riskPercent: number;
}
```

## Data Models

### Signal Model (MongoDB)

```typescript
interface SignalDocument {
  _id: ObjectId;
  symbol: string;
  direction: 'long' | 'short';
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  confluenceScore: number;
  quality: string;
  reasoning: string[];
  validationLayers: LayerResult[];
  
  // Analysis snapshot
  analysis: {
    smc: SMCAnalysis;
    wyckoff: WyckoffAnalysis;
    elliott: ElliottAnalysis;
    technical: TechnicalAnalysis;
    ai: AIAnalysis;
  };
  
  // Status tracking
  status: string;
  tp1HitAt: Date | null;
  tp2HitAt: Date | null;
  tp3HitAt: Date | null;
  slHitAt: Date | null;
  closedAt: Date | null;
  closePrice: number | null;
  pnlPips: number | null;
  pnlPercent: number | null;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}
```

### Performance Model (MongoDB)

```typescript
interface PerformanceDocument {
  _id: ObjectId;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
  startDate: Date;
  endDate: Date;
  
  // Core metrics
  totalSignals: number;
  winningSignals: number;
  losingSignals: number;
  winRate: number;
  
  // Profit metrics
  totalPips: number;
  averagePips: number;
  profitFactor: number;
  expectancy: number;
  
  // Risk metrics
  maxDrawdown: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  sharpeRatio: number;
  sortinoRatio: number;
  
  // Breakdown
  bySymbol: Record<string, SymbolPerformance>;
  byQuality: Record<string, QualityPerformance>;
  byTimeframe: Record<string, TimeframePerformance>;
  
  updatedAt: Date;
}
```

### Cache Model (MongoDB)

```typescript
interface CacheDocument {
  _id: ObjectId;
  key: string; // e.g., "EURUSD_H1_analysis"
  data: any;
  expiresAt: Date;
  createdAt: Date;
}
```


## API Endpoints

### Signal System API

```
GET  /api/signals-system/signals          - Get active signals
GET  /api/signals-system/signals/:id      - Get signal details
GET  /api/signals-system/analysis/:symbol - Get full analysis for symbol
POST /api/signals-system/generate         - Trigger signal generation
GET  /api/signals-system/performance      - Get performance stats
GET  /api/signals-system/instruments      - Get supported instruments
GET  /api/signals-system/market-data      - Get market data
```

### Request/Response Examples

```typescript
// GET /api/signals-system/signals
interface GetSignalsResponse {
  signals: Signal[];
  meta: {
    total: number;
    active: number;
    today: number;
  };
}

// GET /api/signals-system/analysis/:symbol
interface GetAnalysisResponse {
  symbol: string;
  timestamp: number;
  analysis: {
    smc: SMCAnalysis;
    wyckoff: WyckoffAnalysis;
    elliott: ElliottAnalysis;
    vsa: VSAAnalysis;
    marketProfile: MarketProfileAnalysis;
    orderFlow: OrderFlowAnalysis;
    intermarket: IntermarketAnalysis;
    technical: TechnicalAnalysis;
    fundamental: FundamentalAnalysis;
    sentiment: SentimentAnalysis;
    ai: AIAnalysis;
  };
  validation: ValidationResult;
  confluence: ConfluenceResult;
  potentialSignal: Signal | null;
}
```

## Error Handling

### Error Types

```typescript
enum ErrorCode {
  DATA_FETCH_FAILED = 'DATA_FETCH_FAILED',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_SYMBOL = 'INVALID_SYMBOL',
  MARKET_CLOSED = 'MARKET_CLOSED',
}

interface APIError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: number;
}
```

### Error Handling Strategy

1. **Data Fetch Errors**: Automatic failover to backup sources
2. **Analysis Errors**: Log and skip affected component, continue with others
3. **AI Errors**: Use cached analysis or skip AI layer
4. **Rate Limits**: Implement exponential backoff and caching

## Testing Strategy

### Unit Tests
- Test each analyzer independently with mock data
- Test confluence calculation with various scenarios
- Test risk management calculations

### Integration Tests
- Test full analysis pipeline
- Test signal generation flow
- Test API endpoints

### Property-Based Tests
- Test that confluence score is always 0-100
- Test that SL is always beyond entry in correct direction
- Test that TP levels maintain proper RR ratios


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Confluence Score Bounds and Threshold

*For any* analysis result, the Confluence Score SHALL always be between 0 and 100 inclusive, AND no signal SHALL be generated when the score is below 80.

**Validates: Requirements 14.1, 14.3**

### Property 2: Confluence Score Weight Sum

*For any* confluence calculation, the sum of all component weights (SMC 20% + Structure 15% + Wyckoff 10% + VSA 10% + Order Flow 10% + Technical 10% + Intermarket 5% + Fundamental 5% + Sentiment 5% + AI 10%) SHALL equal exactly 100%.

**Validates: Requirements 14.2**

### Property 3: Risk Management Constraints

*For any* generated signal, the Stop Loss SHALL be placed on the opposite side of entry (below for long, above for short), AND the Risk:Reward ratio to TP2 SHALL be at least 1:2.

**Validates: Requirements 15.1, 15.2**

### Property 4: Position Size Calculation

*For any* position size calculation with account balance B, risk percent R, entry E, and stop loss S, the calculated risk amount SHALL equal B × R, and the position size SHALL result in exactly that risk if SL is hit.

**Validates: Requirements 15.3**

### Property 5: Validation Layer Requirements

*For any* signal generation attempt, the signal SHALL only be generated if at least 8 out of 10 validation layers pass, AND if any critical layer (1, 2, 3, or 10) fails, the signal SHALL be rejected regardless of other layers.

**Validates: Requirements 13.1, 13.2**

### Property 6: AI Confidence Threshold

*For any* analysis where AI confidence is below 70%, the Signal Generator SHALL not produce a signal.

**Validates: Requirements 12.2**

### Property 7: Fair Value Gap Detection

*For any* sequence of 3 consecutive candles where candle[0].high < candle[2].low (bullish FVG) or candle[0].low > candle[2].high (bearish FVG), the SMC Analyzer SHALL detect and return a Fair Value Gap.

**Validates: Requirements 2.2**

### Property 8: Premium/Discount Zone Calculation

*For any* price range with high H and low L, the equilibrium SHALL be (H + L) / 2, prices above equilibrium SHALL be in Premium Zone, and prices below SHALL be in Discount Zone.

**Validates: Requirements 2.4**

### Property 9: SMC Confluence Score Boost

*For any* analysis where both an Order Block and Fair Value Gap exist at the same price level, the Confluence Score SHALL increase by exactly 25 points (capped at 100).

**Validates: Requirements 2.5**

### Property 10: EMA Calculation Correctness

*For any* series of closing prices and EMA period P, the calculated EMA SHALL match the standard formula: EMA = Price × k + EMA_prev × (1-k) where k = 2/(P+1).

**Validates: Requirements 9.1**

### Property 11: RSI Bounds

*For any* RSI calculation, the result SHALL always be between 0 and 100 inclusive.

**Validates: Requirements 9.2**

### Property 12: News Blackout Period

*For any* signal generation attempt within 1 hour of a high-impact news event for the signal's currency pair, the Signal Generator SHALL not produce a signal.

**Validates: Requirements 10.1**

### Property 13: Contrarian Sentiment Flag

*For any* analysis where retail sentiment is greater than 80% in one direction, the system SHALL flag potential contrarian opportunity in the opposite direction.

**Validates: Requirements 11.1**

### Property 14: Kill Zone Score Penalty

*For any* analysis performed outside of defined Kill Zones (London, NY, Asian sessions), the Confluence Score SHALL be reduced by 15 points.

**Validates: Requirements 16.1**

### Property 15: Data Source Failover

*For any* data fetch where the primary source fails, the system SHALL automatically attempt backup sources within 5 seconds and return valid data if any source succeeds.

**Validates: Requirements 1.4**

### Property 16: Take Profit Ratio Consistency

*For any* signal with entry E and stop loss S, TP1 SHALL be at 1:1.5 RR, TP2 SHALL be at 1:2.5 RR, and TP3 SHALL be at 1:4 RR from entry.

**Validates: Requirements 15.4, 15.5, 15.6**

### Property 17: Win Rate Calculation

*For any* performance period, Win Rate SHALL equal (Winning Signals / Total Closed Signals) × 100, and SHALL be between 0 and 100.

**Validates: Requirements 19.1**

### Property 18: Value Area Calculation

*For any* Market Profile calculation, the Value Area SHALL contain exactly 70% of the total volume, centered around the Point of Control.

**Validates: Requirements 6.1**

### Property 19: Point of Control Identification

*For any* Market Profile calculation, the Point of Control SHALL be the price level with the highest traded volume.

**Validates: Requirements 6.2**

### Property 20: Signal Expiration

*For any* generated signal, it SHALL have an expiration time, and after expiration, the signal status SHALL change to 'expired' if not already closed.

**Validates: Requirements implied by signal lifecycle**
