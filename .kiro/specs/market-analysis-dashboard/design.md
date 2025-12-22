# Design Document: Smart Market Analysis Dashboard

## Overview

مركز تحليل السوق الذكي هو لوحة قيادة شاملة ومتطورة مبنية بـ Next.js 15 تجمع كل المعلومات والتحليلات التي تؤثر على سعر الذهب (XAUUSD) في مكان واحد. تستخدم Gemini 2.0 Flash للتحليل الذكي وتقدم تجربة مستخدم احترافية تليق بمؤسسة مالية ضخمة.

### Key Design Decisions

1. **Component-Based Architecture**: تقسيم اللوحة إلى مكونات مستقلة قابلة لإعادة الاستخدام
2. **Server-Side Data Fetching**: استخدام Next.js API Routes لجلب البيانات من مصادر خارجية
3. **Client-Side Caching**: استخدام SWR/React Query للتخزين المؤقت والتحديث التلقائي
4. **AI Integration**: Gemini 2.0 Flash API لجميع التحليلات الذكية
5. **Real-Time Updates**: WebSocket أو Polling للبيانات الحية
6. **Responsive Design**: Mobile-first مع تصميم متجاوب كامل

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Market Analysis Page                       │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│   │
│  │  │ Hero Section│ │ AI Summary  │ │ Navigation Tabs         ││   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────┘│   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │                    Dashboard Grid                        ││   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ││   │
│  │  │  │COT Report│ │News Feed │ │Bank Fcst │ │Treasury  │   ││   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ││   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ││   │
│  │  │  │DXY Index │ │Currencies│ │Indices   │ │Calendar  │   ││   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ││   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ││   │
│  │  │  │Fed Watch │ │Correlat. │ │Fundament.│ │Experts   │   ││   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                         Next.js API Routes                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │/api/market/ │ │/api/market/ │ │/api/market/ │ │/api/market/ │   │
│  │  gold-price │ │  cot-report │ │  news       │ │  banks      │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │/api/market/ │ │/api/market/ │ │/api/market/ │ │/api/market/ │   │
│  │  treasury   │ │  currencies │ │  indices    │ │  calendar   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐   │
│  │/api/market/ │ │/api/market/ │ │/api/market/ai-analysis      │   │
│  │  fed-watch  │ │  fundament. │ │  (Gemini 2.0 Flash)         │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                      External Data Sources                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Yahoo Fin.  │ │ CFTC (COT)  │ │ News APIs   │ │ Gemini AI   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Treasury.gov│ │ Forex APIs  │ │ Fed Reserve │ │ World Gold  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### File Structure

```
app/
├── market-analysis/
│   ├── page.js                    # Main dashboard page
│   ├── components/
│   │   ├── HeroSection.js         # Gold price hero with AI summary
│   │   ├── NavigationTabs.js      # Section navigation
│   │   ├── GoldPriceTicker.js     # Real-time price ticker
│   │   ├── AISummaryCard.js       # AI-generated market summary
│   │   ├── COTReportCard.js       # COT analysis component
│   │   ├── NewsAnalysisCard.js    # Smart news feed
│   │   ├── BankForecastsCard.js   # Bank predictions table
│   │   ├── ExpertOpinionsCard.js  # Expert analysis feed
│   │   ├── TreasuryYieldsCard.js  # Bond yields analysis
│   │   ├── DXYAnalysisCard.js     # Dollar index analysis
│   │   ├── CurrencyAnalysisCard.js# Currency pairs analysis
│   │   ├── IndicesCard.js         # Stock indices & VIX
│   │   ├── EconomicCalendarCard.js# Smart calendar
│   │   ├── FedWatchCard.js        # Fed policy tracker
│   │   ├── CorrelationMatrix.js   # Asset correlations heatmap
│   │   ├── FundamentalCard.js     # Supply/demand analysis
│   │   ├── SentimentGauge.js      # Overall sentiment meter
│   │   └── common/
│   │       ├── DataCard.js        # Reusable card wrapper
│   │       ├── MiniChart.js       # Small inline charts
│   │       ├── LoadingSkeleton.js # Loading states
│   │       ├── ChangeIndicator.js # Price change badges
│   │       └── RefreshButton.js   # Manual refresh
│   └── hooks/
│       ├── useMarketData.js       # SWR hook for market data
│       ├── useAIAnalysis.js       # Hook for AI analysis
│       └── useRealTimePrice.js    # Real-time price hook
│
├── api/market/
│   ├── gold-price/route.js        # Gold price endpoint
│   ├── cot-report/route.js        # COT data endpoint
│   ├── news/route.js              # News aggregation
│   ├── bank-forecasts/route.js    # Bank predictions
│   ├── expert-opinions/route.js   # Expert analysis
│   ├── treasury-yields/route.js   # Bond yields
│   ├── dxy/route.js               # Dollar index
│   ├── currencies/route.js        # Currency pairs
│   ├── indices/route.js           # Stock indices
│   ├── economic-calendar/route.js # Economic events
│   ├── fed-watch/route.js         # Fed policy data
│   ├── fundamentals/route.js      # Supply/demand data
│   ├── correlations/route.js      # Correlation calculations
│   └── ai-analysis/route.js       # Gemini AI analysis
```

### Component Interfaces

#### 1. HeroSection Component
```typescript
interface HeroSectionProps {
  goldPrice: number;
  priceChange: number;
  changePercent: number;
  marketStatus: 'bullish' | 'bearish' | 'neutral';
  aiSummary: string;
  lastUpdate: Date;
}
```

#### 2. COTReportCard Component
```typescript
interface COTData {
  reportDate: Date;
  commercial: {
    long: number;
    short: number;
    net: number;
    weeklyChange: number;
  };
  nonCommercial: {
    long: number;
    short: number;
    net: number;
    weeklyChange: number;
  };
  nonReportable: {
    long: number;
    short: number;
    net: number;
  };
  cotIndex: number;
  historicalData: COTHistoricalPoint[];
  aiAnalysis: string;
}
```

#### 3. BankForecastsCard Component
```typescript
interface BankForecast {
  bankName: string;
  logoUrl: string;
  targetPrice: number;
  timeframe: string;
  forecastDate: Date;
  previousTarget?: number;
  stance: 'bullish' | 'bearish' | 'neutral';
}

interface BankForecastsData {
  forecasts: BankForecast[];
  averageTarget: number;
  highestTarget: number;
  lowestTarget: number;
  aiConsensus: string;
}
```

#### 4. TreasuryYieldsCard Component
```typescript
interface TreasuryYields {
  us2y: { value: number; change: number; };
  us5y: { value: number; change: number; };
  us10y: { value: number; change: number; };
  us30y: { value: number; change: number; };
  realYield10y: number;
  yieldCurveInverted: boolean;
  goldCorrelation: number;
  aiAnalysis: string;
}
```

#### 5. NewsAnalysisCard Component
```typescript
interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  url: string;
  category: 'geopolitical' | 'economic' | 'central_bank' | 'technical' | 'other';
  impact: 'high' | 'medium' | 'low';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  aiSummary: string;
  isBreaking: boolean;
}
```

#### 6. CorrelationMatrix Component
```typescript
interface CorrelationData {
  assets: string[];
  matrix: number[][];
  timeframe: '1W' | '1M' | '3M' | '1Y';
  significantChanges: {
    asset: string;
    currentCorr: number;
    historicalAvg: number;
  }[];
}
```

---

## Data Models

### API Response Models

#### Gold Price Response
```javascript
{
  price: 2650.50,
  change: 15.30,
  changePercent: 0.58,
  high24h: 2665.00,
  low24h: 2630.00,
  open: 2635.20,
  timestamp: "2024-12-22T10:30:00Z",
  marketStatus: "open",
  trend: "bullish"
}
```

#### AI Analysis Response
```javascript
{
  summary: "تحليل شامل للسوق...",
  sentiment: "bullish",
  confidence: 0.75,
  topFactors: [
    { factor: "ضعف الدولار", impact: "positive", weight: 0.3 },
    { factor: "توترات جيوسياسية", impact: "positive", weight: 0.25 },
    { factor: "توقعات خفض الفائدة", impact: "positive", weight: 0.2 }
  ],
  supportLevels: [2620, 2600, 2580],
  resistanceLevels: [2670, 2700, 2720],
  scenarios: {
    bullish: { target: 2750, probability: 0.45 },
    neutral: { range: [2600, 2700], probability: 0.35 },
    bearish: { target: 2550, probability: 0.20 }
  },
  generatedAt: "2024-12-22T10:30:00Z"
}
```

#### Bank Forecasts Response
```javascript
{
  forecasts: [
    {
      bankName: "Goldman Sachs",
      logoUrl: "/images/banks/gs.png",
      targetPrice: 2800,
      timeframe: "Q1 2025",
      forecastDate: "2024-12-15",
      previousTarget: 2700,
      stance: "bullish",
      analystName: "Jeff Currie"
    }
    // ... more banks
  ],
  statistics: {
    average: 2720,
    median: 2700,
    highest: 3000,
    lowest: 2400,
    bullishCount: 12,
    bearishCount: 3
  }
}
```

---


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


Based on the prework analysis, here are the consolidated correctness properties:

### Property 1: Language Direction Consistency
*For any* language setting (Arabic or English), the dashboard layout direction SHALL match the language (ar=RTL, en=LTR), and all text elements SHALL be properly aligned.
**Validates: Requirements 1.5**

### Property 2: COT Data Display Completeness
*For any* valid COT report data, the component SHALL display net positions for all three trader categories (Commercial, Non-Commercial, Non-Reportable), weekly changes with correct directional indicators, and percentage breakdowns that sum to 100% per category.
**Validates: Requirements 2.1, 2.2, 2.7**

### Property 3: COT Index Calculation Correctness
*For any* COT position data, the calculated COT Index SHALL be a value between 0 and 100, and extreme levels (>80 or <20) SHALL trigger visual alerts.
**Validates: Requirements 2.5, 2.6**

### Property 4: News Classification Completeness
*For any* news item processed by the AI Engine, it SHALL have a valid impact score (High/Medium/Low), sentiment (Bullish/Bearish/Neutral), and category assigned.
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 5: News Summary Generation
*For any* array of news items with length > 0, the AI Engine SHALL generate a consolidated summary string.
**Validates: Requirements 3.5**

### Property 6: Bank Forecasts Data Integrity
*For any* array of bank forecasts, the component SHALL correctly calculate the average (sum/count), identify the highest and lowest targets, and sort forecasts by target price.
**Validates: Requirements 4.3, 4.4, 4.6**

### Property 7: Bank Forecast Change Detection
*For any* bank forecast where previousTarget differs from targetPrice, the change SHALL be highlighted with before/after comparison.
**Validates: Requirements 4.5**

### Property 8: Expert Opinion Sentiment Aggregation
*For any* set of expert opinions, the sentiment meter SHALL correctly reflect the aggregate stance based on the distribution of bullish/bearish/neutral opinions.
**Validates: Requirements 5.4**

### Property 9: Treasury Yields Display Completeness
*For any* treasury yields data, all four maturities (2Y, 5Y, 10Y, 30Y) SHALL be displayed with their daily, weekly, and monthly changes.
**Validates: Requirements 6.1, 6.2**

### Property 10: Yield Curve Inversion Detection
*For any* treasury yields data where the 2Y yield exceeds the 10Y yield, the dashboard SHALL display an inversion alert.
**Validates: Requirements 6.4**

### Property 11: Real Yield Calculation
*For any* nominal yield and inflation expectation values, the real yield SHALL equal (nominal yield - inflation expectation).
**Validates: Requirements 6.5**

### Property 12: Correlation Coefficient Validity
*For any* calculated correlation coefficient, the value SHALL be between -1 and 1 inclusive.
**Validates: Requirements 6.7, 7.4, 8.4, 9.6**

### Property 13: Currency Analysis Completeness
*For any* currency data, all five major pairs (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD) SHALL be displayed with directional change indicators.
**Validates: Requirements 8.1, 8.2**

### Property 14: Currency Alignment Detection
*For any* set of currency movements, when 4 or more currencies align in the same gold-impact direction, the dashboard SHALL highlight this alignment.
**Validates: Requirements 8.6**

### Property 15: Indices Display Completeness
*For any* indices data, S&P 500, Dow Jones, NASDAQ, and VIX SHALL all be displayed with the gold/S&P ratio correctly calculated.
**Validates: Requirements 9.1, 9.4**

### Property 16: VIX Spike Alert
*For any* VIX value exceeding the defined threshold (e.g., >25), the dashboard SHALL display a gold catalyst alert.
**Validates: Requirements 9.2**

### Property 17: Economic Calendar Event Completeness
*For any* economic event, it SHALL have date, time, importance level, and when available, previous/forecast/actual values displayed.
**Validates: Requirements 10.1, 10.3**

### Property 18: Event Countdown Accuracy
*For any* upcoming major event, the countdown timer SHALL accurately reflect the time remaining until the event.
**Validates: Requirements 10.7**

### Property 19: Fed Rate Probability Sum
*For any* Fed Watch rate decision probabilities, the sum of all probabilities (hike + hold + cut) SHALL equal 100%.
**Validates: Requirements 11.2**

### Property 20: Correlation Matrix Size
*For any* correlation matrix, it SHALL contain correlations for at least 15 assets across all specified timeframes (1W, 1M, 3M, 1Y).
**Validates: Requirements 12.1, 12.3**

### Property 21: Correlation Heatmap Color Mapping
*For any* correlation value in the matrix, the heatmap color SHALL correctly represent the correlation strength (positive=green shades, negative=red shades, neutral=gray).
**Validates: Requirements 12.2**

### Property 22: AI Analysis Output Structure
*For any* AI analysis response, it SHALL contain a valid sentiment (bullish/bearish/neutral), confidence level (0-1), exactly 3 top factors, and three scenarios (bullish, neutral, bearish).
**Validates: Requirements 14.2, 14.3, 14.5**

### Property 23: Support/Resistance Level Ordering
*For any* AI-generated support and resistance levels, support levels SHALL be in descending order and resistance levels SHALL be in ascending order.
**Validates: Requirements 14.4**

### Property 24: Cache TTL Behavior
*For any* cached API response, when the TTL expires, a fresh request SHALL be made, and the cache SHALL be updated with the new response.
**Validates: Requirements 16.1, 16.2**

### Property 25: API Failure Fallback
*For any* API failure when cached data exists, the dashboard SHALL display the cached data with a "stale" indicator visible to the user.
**Validates: Requirements 16.6**

### Property 26: Timestamp Display
*For any* data section on the dashboard, a last-updated timestamp SHALL be displayed and SHALL reflect the actual time the data was fetched.
**Validates: Requirements 16.3**

---

## Error Handling

### API Error Handling Strategy

```javascript
// Error types and handling
const ErrorTypes = {
  NETWORK_ERROR: 'network_error',
  API_RATE_LIMIT: 'rate_limit',
  INVALID_RESPONSE: 'invalid_response',
  AI_GENERATION_FAILED: 'ai_failed',
  DATA_STALE: 'data_stale'
};

// Error handling flow
async function fetchWithFallback(endpoint, cacheKey) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    cache.set(cacheKey, data);
    return { data, isStale: false };
  } catch (error) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return { data: cachedData, isStale: true };
    }
    throw error;
  }
}
```

### User-Facing Error States

1. **Loading State**: Skeleton loaders with gold shimmer effect
2. **Stale Data**: Yellow warning badge with "Last updated X minutes ago"
3. **No Data**: Empty state with retry button
4. **API Error**: Error card with explanation and retry option
5. **AI Unavailable**: Fallback to data-only display without AI analysis

---

## Testing Strategy

### Unit Tests
- Component rendering tests for all dashboard cards
- Data transformation and calculation functions
- Utility functions (formatting, date handling, etc.)

### Property-Based Tests
Using a property-based testing library (e.g., fast-check for JavaScript):

1. **COT Index Calculation**: For any valid position data, index is always 0-100
2. **Correlation Calculations**: For any two price series, correlation is always -1 to 1
3. **Percentage Calculations**: For any breakdown, percentages always sum to 100
4. **Sorting Functions**: For any array, sorted output maintains all elements
5. **Cache Behavior**: For any TTL, expired cache triggers refresh

### Integration Tests
- API endpoint response validation
- AI analysis integration with Gemini
- Real-time data update flow
- Language switching behavior

### E2E Tests
- Full dashboard load and interaction
- Navigation between sections
- Mobile responsiveness
- Accessibility compliance

### Test Configuration
- Minimum 100 iterations per property test
- Each property test tagged with: **Feature: market-analysis-dashboard, Property {number}: {property_text}**

