# Requirements Document

## Introduction

مركز تحليل السوق الذكي (Smart Market Analysis Dashboard) هو لوحة قيادة شاملة ومتطورة تجمع كل المعلومات والتحليلات التي تؤثر على سعر الذهب (XAUUSD) في مكان واحد. تستخدم الذكاء الاصطناعي (Gemini 2.0 Flash) لتحليل البيانات وتقديم رؤى ذكية للمتداولين. مصممة لمؤسسة مالية ضخمة بأعلى معايير الاحترافية والجمال.

## Glossary

- **Dashboard**: لوحة القيادة الرئيسية التي تعرض جميع التحليلات
- **COT_Report**: تقرير التزام المتداولين (Commitment of Traders) الصادر من CFTC
- **DXY**: مؤشر الدولار الأمريكي
- **Treasury_Yields**: عوائد السندات الأمريكية
- **Fed_Watch**: أداة متابعة قرارات الفيدرالي الأمريكي
- **Sentiment_Analyzer**: محلل معنويات السوق بالذكاء الاصطناعي
- **Bank_Forecasts**: توقعات البنوك العالمية لسعر الذهب
- **Expert_Opinions**: آراء الخبراء والمحللين
- **Correlation_Matrix**: مصفوفة الارتباط بين الأصول
- **AI_Engine**: محرك الذكاء الاصطناعي (Gemini 2.0 Flash)
- **Real_Time_Data**: البيانات الحية المحدثة لحظياً
- **Economic_Calendar**: التقويم الاقتصادي للأحداث المؤثرة
- **Technical_Levels**: المستويات الفنية المهمة (دعم/مقاومة)

## Requirements

### Requirement 1: لوحة القيادة الرئيسية (Main Dashboard)

**User Story:** As a trader, I want to see a comprehensive overview of all market factors affecting gold, so that I can make informed trading decisions from one place.

#### Acceptance Criteria

1. WHEN a user visits the market analysis page, THE Dashboard SHALL display a professional hero section with current gold price, daily change percentage, and market status (bullish/bearish/neutral)
2. WHEN the page loads, THE Dashboard SHALL show a real-time gold price ticker with live updates every 5 seconds
3. THE Dashboard SHALL display an AI-generated market summary at the top highlighting the most important factors affecting gold today
4. WHEN the user scrolls, THE Dashboard SHALL present organized sections for each analysis category with smooth animations
5. THE Dashboard SHALL support both Arabic and English languages with proper RTL/LTR layouts
6. WHEN viewing on mobile devices, THE Dashboard SHALL adapt responsively while maintaining all functionality
7. THE Dashboard SHALL use a dark theme with gold accents consistent with the existing platform design

---

### Requirement 2: تحليل تقرير COT (COT Report Analysis)

**User Story:** As a trader, I want to analyze the Commitment of Traders report, so that I can understand institutional positioning in gold futures.

#### Acceptance Criteria

1. WHEN COT data is available, THE COT_Report SHALL display net positions for Commercial, Non-Commercial, and Non-Reportable traders
2. THE COT_Report SHALL show weekly changes in positions with visual indicators (arrows, colors)
3. WHEN displaying historical data, THE COT_Report SHALL render an interactive chart showing position trends over the last 52 weeks
4. THE AI_Engine SHALL analyze COT data and provide interpretation of what the positioning means for gold price
5. THE COT_Report SHALL calculate and display the COT Index (0-100) indicating extreme positioning levels
6. WHEN positions reach extreme levels (>80 or <20), THE COT_Report SHALL highlight this with visual alerts
7. THE COT_Report SHALL show the percentage of longs vs shorts for each trader category with progress bars

---

### Requirement 3: تحليل الأخبار الذكي (Smart News Analysis)

**User Story:** As a trader, I want AI-powered news analysis, so that I can quickly understand how current events affect gold.

#### Acceptance Criteria

1. THE News_Analyzer SHALL fetch and display the latest gold-related news from multiple sources
2. WHEN news is fetched, THE AI_Engine SHALL analyze each news item and assign an impact score (High/Medium/Low)
3. THE AI_Engine SHALL determine sentiment (Bullish/Bearish/Neutral) for each news item
4. THE News_Analyzer SHALL categorize news by type (Geopolitical, Economic, Central Bank, Technical, etc.)
5. WHEN multiple news items are available, THE AI_Engine SHALL generate a consolidated news summary
6. THE News_Analyzer SHALL highlight breaking news with special visual treatment
7. WHEN a user clicks on a news item, THE Dashboard SHALL show the full AI analysis with price impact prediction

---

### Requirement 4: توقعات البنوك العالمية (Global Bank Forecasts)

**User Story:** As a trader, I want to see gold price forecasts from major global banks, so that I can understand institutional expectations.

#### Acceptance Criteria

1. THE Bank_Forecasts SHALL display forecasts from at least 15 major global banks (Goldman Sachs, JP Morgan, UBS, etc.)
2. WHEN displaying forecasts, THE Dashboard SHALL show bank name, logo, target price, timeframe, and date of forecast
3. THE Bank_Forecasts SHALL calculate and display the average forecast price across all banks
4. THE Bank_Forecasts SHALL show the range (highest and lowest) of forecasts with visual representation
5. WHEN a bank updates its forecast, THE Dashboard SHALL highlight the change with before/after comparison
6. THE Bank_Forecasts SHALL sort banks by forecast price (bullish to bearish) with visual indicators
7. THE AI_Engine SHALL analyze bank forecasts and provide a consensus interpretation

---

### Requirement 5: آراء الخبراء (Expert Opinions)

**User Story:** As a trader, I want to see opinions from gold market experts, so that I can consider professional perspectives.

#### Acceptance Criteria

1. THE Expert_Opinions SHALL display analysis from recognized gold market experts and analysts
2. WHEN displaying opinions, THE Dashboard SHALL show expert name, affiliation, opinion summary, and date
3. THE Expert_Opinions SHALL categorize opinions by stance (Bullish/Bearish/Neutral) with visual badges
4. THE Dashboard SHALL display a sentiment meter showing the overall expert consensus
5. WHEN an expert provides price targets, THE Dashboard SHALL display them prominently
6. THE AI_Engine SHALL synthesize expert opinions and identify common themes or divergences

---

### Requirement 6: تحليل عوائد السندات (Treasury Yields Analysis)

**User Story:** As a trader, I want to analyze US Treasury yields, so that I can understand their inverse correlation with gold.

#### Acceptance Criteria

1. THE Treasury_Yields SHALL display current yields for 2Y, 5Y, 10Y, and 30Y US Treasury bonds
2. WHEN yields change, THE Dashboard SHALL show daily, weekly, and monthly changes with color coding
3. THE Treasury_Yields SHALL display an interactive yield curve chart
4. WHEN the yield curve inverts, THE Dashboard SHALL highlight this with a special alert
5. THE Dashboard SHALL show the real yield (nominal yield minus inflation expectations)
6. THE AI_Engine SHALL analyze yield movements and explain their impact on gold
7. THE Treasury_Yields SHALL display the correlation coefficient between yields and gold price

---

### Requirement 7: تحليل مؤشر الدولار (DXY Analysis)

**User Story:** As a trader, I want to analyze the US Dollar Index, so that I can understand its inverse relationship with gold.

#### Acceptance Criteria

1. THE DXY_Analyzer SHALL display the current DXY value with real-time updates
2. WHEN DXY changes, THE Dashboard SHALL show daily, weekly, and monthly percentage changes
3. THE DXY_Analyzer SHALL display an interactive chart with gold price overlay for correlation visualization
4. THE Dashboard SHALL calculate and display the rolling correlation between DXY and gold
5. THE AI_Engine SHALL analyze DXY movements and their implications for gold
6. WHEN DXY reaches key technical levels, THE Dashboard SHALL highlight potential gold impact

---

### Requirement 8: تحليل العملات المؤثرة (Currency Analysis)

**User Story:** As a trader, I want to analyze major currencies affecting gold, so that I can understand currency-driven gold movements.

#### Acceptance Criteria

1. THE Currency_Analyzer SHALL display EUR/USD, GBP/USD, USD/JPY, USD/CHF, and AUD/USD rates
2. WHEN currencies move, THE Dashboard SHALL show changes with directional indicators
3. THE Dashboard SHALL display a currency strength meter for major currencies
4. THE Currency_Analyzer SHALL show correlation coefficients between each currency pair and gold
5. THE AI_Engine SHALL analyze currency movements and their combined effect on gold
6. THE Dashboard SHALL highlight when multiple currencies align in gold-supportive or gold-negative direction

---

### Requirement 9: تحليل المؤشرات والأسهم (Indices & Stocks Analysis)

**User Story:** As a trader, I want to analyze stock indices and gold-related stocks, so that I can understand risk sentiment and gold equity performance.

#### Acceptance Criteria

1. THE Indices_Analyzer SHALL display S&P 500, Dow Jones, NASDAQ, and VIX (Fear Index)
2. WHEN VIX spikes, THE Dashboard SHALL highlight this as a potential gold catalyst
3. THE Dashboard SHALL display gold mining stocks performance (GDX, GDXJ, major miners)
4. THE Indices_Analyzer SHALL show the gold/S&P 500 ratio for relative performance
5. THE AI_Engine SHALL analyze risk sentiment based on indices and explain gold implications
6. THE Dashboard SHALL display correlation between gold and major indices

---

### Requirement 10: التقويم الاقتصادي الذكي (Smart Economic Calendar)

**User Story:** As a trader, I want an AI-enhanced economic calendar, so that I can prepare for market-moving events.

#### Acceptance Criteria

1. THE Economic_Calendar SHALL display upcoming economic events with date, time, and importance level
2. WHEN an event is gold-relevant, THE Dashboard SHALL highlight it with special styling
3. THE Economic_Calendar SHALL show previous, forecast, and actual values for each event
4. THE AI_Engine SHALL provide pre-event analysis explaining potential gold impact scenarios
5. WHEN an event result is released, THE AI_Engine SHALL provide immediate impact analysis
6. THE Economic_Calendar SHALL filter events by importance (High/Medium/Low) and relevance to gold
7. THE Dashboard SHALL show a countdown timer for the next major gold-impacting event

---

### Requirement 11: متابعة الفيدرالي الأمريكي (Fed Watch)

**User Story:** As a trader, I want to track Federal Reserve policy expectations, so that I can anticipate interest rate impacts on gold.

#### Acceptance Criteria

1. THE Fed_Watch SHALL display current Fed Funds Rate and next meeting date
2. THE Fed_Watch SHALL show market-implied probabilities for rate decisions (hike/hold/cut)
3. WHEN Fed officials speak, THE Dashboard SHALL display their statements with hawk/dove classification
4. THE Fed_Watch SHALL track and display the Fed dot plot projections
5. THE AI_Engine SHALL analyze Fed communications and explain implications for gold
6. THE Dashboard SHALL show historical Fed decisions and gold price reactions

---

### Requirement 12: مصفوفة الارتباط (Correlation Matrix)

**User Story:** As a trader, I want to see correlations between gold and other assets, so that I can understand intermarket relationships.

#### Acceptance Criteria

1. THE Correlation_Matrix SHALL display correlations between gold and at least 15 related assets
2. WHEN displaying correlations, THE Dashboard SHALL use a color-coded heatmap visualization
3. THE Correlation_Matrix SHALL show correlations for multiple timeframes (1W, 1M, 3M, 1Y)
4. THE Dashboard SHALL highlight when correlations deviate significantly from historical norms
5. THE AI_Engine SHALL analyze correlation changes and explain their significance

---

### Requirement 13: التحليل الأساسي الشامل (Comprehensive Fundamental Analysis)

**User Story:** As a trader, I want a complete fundamental analysis summary, so that I can understand all factors affecting gold.

#### Acceptance Criteria

1. THE Fundamental_Analyzer SHALL display gold supply and demand data (mining production, central bank buying, ETF flows)
2. THE Dashboard SHALL show physical gold demand by region (China, India, Middle East, etc.)
3. THE Fundamental_Analyzer SHALL display gold ETF holdings (GLD, IAU) with daily changes
4. THE Dashboard SHALL show central bank gold reserves and recent purchases/sales
5. THE AI_Engine SHALL generate a comprehensive fundamental analysis report
6. THE Dashboard SHALL display seasonal patterns and their current relevance

---

### Requirement 14: ملخص الذكاء الاصطناعي (AI Summary & Recommendations)

**User Story:** As a trader, I want AI-generated insights and recommendations, so that I can get actionable intelligence.

#### Acceptance Criteria

1. THE AI_Engine SHALL generate a daily market brief summarizing all factors affecting gold
2. WHEN analyzing data, THE AI_Engine SHALL provide a clear bullish/bearish/neutral bias with confidence level
3. THE AI_Engine SHALL identify the top 3 factors most likely to move gold in the next 24-48 hours
4. THE Dashboard SHALL display AI-generated support and resistance levels based on all analyses
5. THE AI_Engine SHALL provide scenario analysis (best case, worst case, base case) for gold price
6. WHEN market conditions change significantly, THE AI_Engine SHALL generate alert notifications
7. THE AI_Engine SHALL use Gemini 2.0 Flash model for all analyses

---

### Requirement 15: التصميم والأداء (Design & Performance)

**User Story:** As a user, I want a beautiful, fast, and professional interface, so that I can efficiently analyze the market.

#### Acceptance Criteria

1. THE Dashboard SHALL load initial content within 3 seconds on standard connections
2. THE Dashboard SHALL use lazy loading for charts and heavy components
3. WHEN data is loading, THE Dashboard SHALL display elegant skeleton loaders
4. THE Dashboard SHALL implement smooth scroll animations and micro-interactions
5. THE Dashboard SHALL use consistent gold/dark theme matching the existing platform
6. THE Dashboard SHALL be fully accessible (WCAG 2.1 AA compliant)
7. THE Dashboard SHALL support keyboard navigation for all interactive elements

---

### Requirement 16: التخزين المؤقت والتحديث (Caching & Updates)

**User Story:** As a user, I want fresh data with optimal performance, so that I can trust the information while having a smooth experience.

#### Acceptance Criteria

1. THE Dashboard SHALL cache API responses with appropriate TTL (Time To Live) per data type
2. WHEN cached data expires, THE Dashboard SHALL fetch fresh data in the background
3. THE Dashboard SHALL display last update timestamp for each data section
4. WHEN a user manually refreshes, THE Dashboard SHALL fetch fresh data for that section
5. THE Dashboard SHALL implement rate limiting to prevent API abuse
6. IF an API fails, THEN THE Dashboard SHALL display cached data with a stale indicator

