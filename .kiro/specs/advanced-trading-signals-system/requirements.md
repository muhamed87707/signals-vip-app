# Requirements Document

## Introduction

**نظام توصيات التداول الأكثر تقدماً في العالم** - يجمع بين أحدث تقنيات صناديق التحوط، الذكاء الاصطناعي المتقدم، وعلم البيانات الكمي لتقديم توصيات بدقة استثنائية.

### المنهجية الفريدة: "Institutional Edge System" (IES)

النظام يعمل على 10 طبقات من التحليل والتحقق:

1. **Institutional Order Flow**: تتبع تدفق أوامر المؤسسات الكبرى
2. **Smart Money Concepts (SMC)**: منهجية ICT الكاملة
3. **Wyckoff Method**: تحليل مراحل التجميع والتوزيع
4. **Elliott Wave Analysis**: تحليل الموجات للتنبؤ بالحركات
5. **Volume Spread Analysis (VSA)**: تحليل العلاقة بين السعر والحجم
6. **Market Profile**: تحليل توزيع الأسعار والقيمة العادلة
7. **Intermarket Analysis**: تحليل الارتباطات بين الأسواق
8. **Quantitative Models**: نماذج إحصائية متقدمة
9. **Machine Learning Ensemble**: مجموعة نماذج AI متعددة
10. **Real-time Validation**: تحقق فوري من جميع الشروط

**الهدف**: نسبة نجاح 75%+ مع Risk:Reward لا يقل عن 1:2.5

## Glossary

- **IES_Engine**: المحرك الرئيسي (Institutional Edge System)
- **Signal_Generator**: مولد التوصيات بعد اجتياز الفلاتر
- **Multi_Layer_Validator**: نظام التحقق من 10 طبقات
- **SMC_Analyzer**: تحليل Smart Money Concepts
- **Wyckoff_Analyzer**: تحليل مراحل Wyckoff
- **Elliott_Wave_Analyzer**: تحليل موجات Elliott
- **VSA_Analyzer**: تحليل Volume Spread Analysis
- **Market_Profile_Analyzer**: تحليل Market Profile
- **Order_Flow_Analyzer**: تحليل تدفق الأوامر
- **Intermarket_Analyzer**: تحليل الارتباطات
- **AI_Ensemble**: مجموعة نماذج AI
- **Risk_Manager**: إدارة المخاطر الديناميكية
- **Order_Block**: منطقة دخول المؤسسات
- **Fair_Value_Gap**: فجوة القيمة العادلة (FVG)
- **Liquidity_Pool**: تجمع السيولة
- **Break_of_Structure**: كسر الهيكل (BOS)
- **Change_of_Character**: تغير الطابع (CHoCH)
- **Kill_Zone**: أوقات السيولة العالية
- **Confluence_Score**: درجة التقاء المؤشرات (0-100)

## Requirements

### Requirement 1: جلب البيانات متعدد المصادر

**User Story:** As a trader, I want real-time data from multiple sources for accuracy.

#### Acceptance Criteria

1. THE IES_Engine SHALL connect to 3+ data providers (Alpha Vantage, Twelve Data, Yahoo Finance)
2. THE IES_Engine SHALL fetch OHLCV for timeframes: M1, M5, M15, M30, H1, H4, D1, W1
3. THE IES_Engine SHALL validate data across sources and use consensus values
4. THE IES_Engine SHALL maintain 2 years historical data for backtesting
5. THE IES_Engine SHALL update every 30 seconds during market hours
6. WHEN primary source fails, THE IES_Engine SHALL switch to backup within 5 seconds

### Requirement 2: تحليل Smart Money Concepts (SMC)

**User Story:** As a trader, I want full ICT/SMC analysis to trade like institutions.

#### Acceptance Criteria

1. THE SMC_Analyzer SHALL identify Order Blocks (Bullish/Bearish) on all timeframes
2. THE SMC_Analyzer SHALL detect Breaker Blocks and Mitigation Blocks
3. THE SMC_Analyzer SHALL identify Fair Value Gaps (FVG) and Imbalances
4. THE SMC_Analyzer SHALL detect Liquidity Pools (Equal Highs/Lows, Stop Hunts)
5. THE SMC_Analyzer SHALL detect Break of Structure (BOS) with confirmation
6. THE SMC_Analyzer SHALL detect Change of Character (CHoCH) for reversals
7. THE SMC_Analyzer SHALL calculate Premium/Discount Zones
8. THE SMC_Analyzer SHALL identify Optimal Trade Entry (OTE) at 61.8%-79% Fib
9. THE SMC_Analyzer SHALL track Inducement levels
10. WHEN OB + FVG confluence exists, THE Confluence_Score SHALL increase by 25%

### Requirement 3: تحليل Wyckoff Method

**User Story:** As a trader, I want Wyckoff analysis to identify accumulation/distribution.

#### Acceptance Criteria

1. THE Wyckoff_Analyzer SHALL identify Accumulation phases (PS, SC, AR, ST, Spring, SOS)
2. THE Wyckoff_Analyzer SHALL identify Distribution phases (PSY, BC, AR, UT, SOW)
3. THE Wyckoff_Analyzer SHALL detect Spring and Upthrust patterns
4. THE Wyckoff_Analyzer SHALL identify Sign of Strength (SOS) and Sign of Weakness (SOW)
5. THE Wyckoff_Analyzer SHALL calculate phase probability (0-100%)
6. WHEN Spring/Upthrust with volume confirmation, THE Confluence_Score SHALL increase by 20%

### Requirement 4: تحليل Elliott Wave

**User Story:** As a trader, I want Elliott Wave analysis for wave structure prediction.

#### Acceptance Criteria

1. THE Elliott_Wave_Analyzer SHALL identify impulse waves (1-2-3-4-5)
2. THE Elliott_Wave_Analyzer SHALL identify corrective waves (A-B-C)
3. THE Elliott_Wave_Analyzer SHALL detect current wave position
4. THE Elliott_Wave_Analyzer SHALL calculate wave targets using Fibonacci
5. THE Elliott_Wave_Analyzer SHALL identify wave invalidation levels
6. WHEN Wave 3 setup detected, THE Confluence_Score SHALL increase by 15%

### Requirement 5: تحليل Volume Spread Analysis (VSA)

**User Story:** As a trader, I want VSA to understand price-volume relationship.

#### Acceptance Criteria

1. THE VSA_Analyzer SHALL detect No Demand and No Supply bars
2. THE VSA_Analyzer SHALL detect Stopping Volume and Climactic Action
3. THE VSA_Analyzer SHALL detect Test bars and Shakeout patterns
4. THE VSA_Analyzer SHALL identify Effort vs Result divergence
5. THE VSA_Analyzer SHALL detect Absorption patterns
6. WHEN VSA confirms SMC setup, THE Confluence_Score SHALL increase by 15%

### Requirement 6: تحليل Market Profile

**User Story:** As a trader, I want Market Profile for value area analysis.

#### Acceptance Criteria

1. THE Market_Profile_Analyzer SHALL calculate Value Area (70% volume)
2. THE Market_Profile_Analyzer SHALL identify Point of Control (POC)
3. THE Market_Profile_Analyzer SHALL calculate VAH and VAL
4. THE Market_Profile_Analyzer SHALL identify Initial Balance
5. THE Market_Profile_Analyzer SHALL detect Single Prints and Poor Highs/Lows
6. WHEN price returns to POC/VA edge, THE Signal_Generator SHALL flag potential trade

### Requirement 7: تحليل Order Flow

**User Story:** As a trader, I want Order Flow analysis to see institutional activity.

#### Acceptance Criteria

1. THE Order_Flow_Analyzer SHALL track large order imbalances (Delta)
2. THE Order_Flow_Analyzer SHALL identify Absorption patterns
3. THE Order_Flow_Analyzer SHALL calculate Cumulative Delta divergence
4. THE Order_Flow_Analyzer SHALL identify Aggressive buyers/sellers
5. THE Order_Flow_Analyzer SHALL detect Exhaustion patterns
6. WHEN Order Flow confirms direction, THE Confluence_Score SHALL increase by 20%

### Requirement 8: تحليل Intermarket

**User Story:** As a trader, I want Intermarket analysis for cross-market relationships.

#### Acceptance Criteria

1. THE Intermarket_Analyzer SHALL track DXY for USD pairs
2. THE Intermarket_Analyzer SHALL track US10Y yields
3. THE Intermarket_Analyzer SHALL track Gold/USD correlation
4. THE Intermarket_Analyzer SHALL track VIX for risk sentiment
5. THE Intermarket_Analyzer SHALL calculate rolling correlations
6. WHEN intermarket divergence detected, THE Signal_Generator SHALL flag caution

### Requirement 9: التحليل الفني المتقدم

**User Story:** As a trader, I want comprehensive technical analysis.

#### Acceptance Criteria

1. THE Technical_Analyzer SHALL calculate EMAs (9, 21, 50, 100, 200)
2. THE Technical_Analyzer SHALL calculate RSI, MACD, Stochastic, ADX
3. THE Technical_Analyzer SHALL calculate Bollinger Bands, ATR, Ichimoku
4. THE Technical_Analyzer SHALL detect 20+ candlestick patterns
5. THE Technical_Analyzer SHALL detect chart patterns (H&S, Double Top/Bottom, Triangles)
6. THE Technical_Analyzer SHALL calculate Fibonacci levels
7. THE Technical_Analyzer SHALL identify divergences (hidden and regular)
8. THE Technical_Analyzer SHALL calculate pivot points

### Requirement 10: التحليل الأساسي

**User Story:** As a trader, I want fundamental analysis to avoid news traps.

#### Acceptance Criteria

1. THE Fundamental_Analyzer SHALL fetch economic calendar
2. THE Fundamental_Analyzer SHALL categorize news by impact (High/Medium/Low)
3. WHEN high-impact news within 1 hour, THE Signal_Generator SHALL pause signals
4. THE Fundamental_Analyzer SHALL track COT report data
5. THE Fundamental_Analyzer SHALL track interest rate differentials
6. THE Fundamental_Analyzer SHALL provide fundamental bias

### Requirement 11: تحليل مشاعر السوق

**User Story:** As a trader, I want sentiment analysis to identify crowded trades.

#### Acceptance Criteria

1. THE Sentiment_Analyzer SHALL track retail positioning
2. THE Sentiment_Analyzer SHALL calculate Fear & Greed Index
3. THE Sentiment_Analyzer SHALL track COT sentiment
4. WHEN retail >80% one direction, THE Signal_Generator SHALL consider contrarian
5. THE Sentiment_Analyzer SHALL provide sentiment score (-100 to +100)

### Requirement 12: نظام AI المتقدم

**User Story:** As a trader, I want AI analysis for pattern recognition.

#### Acceptance Criteria

1. THE AI_Ensemble SHALL use Gemini AI for analysis
2. THE AI_Ensemble SHALL analyze current vs 10,000+ historical patterns
3. THE AI_Ensemble SHALL calculate win probability
4. THE AI_Ensemble SHALL detect market regime (Trending/Ranging/Volatile)
5. THE AI_Ensemble SHALL provide confidence score (0-100%)
6. THE AI_Ensemble SHALL explain reasoning in natural language
7. WHEN AI confidence < 70%, THE Signal_Generator SHALL not generate signal

### Requirement 13: نظام التحقق من 10 طبقات

**User Story:** As a trader, I want rigorous validation for high-probability setups only.

#### Acceptance Criteria

1. THE Multi_Layer_Validator SHALL verify Layer 1: HTF Trend Alignment
2. THE Multi_Layer_Validator SHALL verify Layer 2: Market Structure (BOS/CHoCH)
3. THE Multi_Layer_Validator SHALL verify Layer 3: SMC Confluence (OB+FVG+Liquidity)
4. THE Multi_Layer_Validator SHALL verify Layer 4: Wyckoff Phase
5. THE Multi_Layer_Validator SHALL verify Layer 5: VSA Confirmation
6. THE Multi_Layer_Validator SHALL verify Layer 6: Order Flow Direction
7. THE Multi_Layer_Validator SHALL verify Layer 7: Technical Confluence
8. THE Multi_Layer_Validator SHALL verify Layer 8: Intermarket Alignment
9. THE Multi_Layer_Validator SHALL verify Layer 9: Kill Zone Timing
10. THE Multi_Layer_Validator SHALL verify Layer 10: AI Confidence > 70%
11. WHEN critical layers (1,2,3,10) fail, THE Signal_Generator SHALL reject
12. THE Signal_Generator SHALL require minimum 8/10 layers passing

### Requirement 14: حساب Confluence Score

**User Story:** As a trader, I want confluence score showing signal strength.

#### Acceptance Criteria

1. THE IES_Engine SHALL calculate Confluence_Score (0-100)
2. THE Confluence_Score weights: SMC 20%, Structure 15%, Wyckoff 10%, VSA 10%, Order Flow 10%, Technical 10%, Intermarket 5%, Fundamental 5%, Sentiment 5%, AI 10%
3. WHEN score < 80, THE Signal_Generator SHALL not generate signal
4. WHEN score 80-84, label "Good Setup ⭐⭐⭐"
5. WHEN score 85-89, label "Strong Setup ⭐⭐⭐⭐"
6. WHEN score 90-94, label "Excellent Setup ⭐⭐⭐⭐⭐"
7. WHEN score 95-100, label "A+ Institutional Setup 💎"

### Requirement 15: إدارة المخاطر الديناميكية

**User Story:** As a trader, I want intelligent risk management.

#### Acceptance Criteria

1. THE Risk_Manager SHALL calculate SL below/above structure
2. THE Risk_Manager SHALL use maximum 1.5x ATR for SL
3. THE Risk_Manager SHALL place SL beyond liquidity zones
4. THE Risk_Manager SHALL calculate TP1 at 1:1.5 RR (50% close)
5. THE Risk_Manager SHALL calculate TP2 at 1:2.5 RR (30% close)
6. THE Risk_Manager SHALL calculate TP3 at 1:4 RR (20% close)
7. THE Risk_Manager SHALL ensure minimum 1:2 RR
8. THE Risk_Manager SHALL calculate position size for 1% risk
9. THE Risk_Manager SHALL move SL to BE after TP1
10. WHEN ATR > 2x average, THE Risk_Manager SHALL reduce position 50%

### Requirement 16: Kill Zones

**User Story:** As a trader, I want to trade during optimal hours only.

#### Acceptance Criteria

1. THE IES_Engine SHALL identify London Kill Zone (02:00-05:00 EST)
2. THE IES_Engine SHALL identify NY Kill Zone (07:00-10:00 EST)
3. THE IES_Engine SHALL identify London Close (10:00-12:00 EST)
4. THE IES_Engine SHALL identify Asian Session (19:00-02:00 EST)
5. WHEN outside Kill Zones, THE Confluence_Score SHALL decrease by 15%
6. THE IES_Engine SHALL show countdown to next Kill Zone

### Requirement 17: واجهة المستخدم

**User Story:** As a trader, I want professional interface for quick decisions.

#### Acceptance Criteria

1. THE System SHALL display Dashboard with market overview
2. THE System SHALL show Signal Card: Entry, SL, TP1, TP2, TP3, Score
3. THE System SHALL display real-time P&L
4. THE System SHALL show interactive chart with levels
5. THE System SHALL display Confluence breakdown
6. THE System SHALL show Signal Reasoning
7. THE System SHALL display 10 validation layers status
8. THE System SHALL show Kill Zone indicator
9. THE System SHALL support dark mode with gold accents
10. THE System SHALL be responsive (mobile/desktop)
11. THE System SHALL support Arabic and English

### Requirement 18: نظام التنبيهات

**User Story:** As a trader, I want notifications for opportunities.

#### Acceptance Criteria

1. WHEN A+ signal generated, THE System SHALL send priority notification
2. WHEN TP1 hit, THE System SHALL notify "SL moved to BE"
3. WHEN SL hit, THE System SHALL notify with loss amount
4. THE System SHALL play sounds for notifications
5. THE System SHALL support browser push notifications

### Requirement 19: سجل الأداء

**User Story:** As a trader, I want performance analytics.

#### Acceptance Criteria

1. THE System SHALL track: Win Rate, Profit Factor, Average RR, Max Drawdown
2. THE System SHALL display performance by instrument and timeframe
3. THE System SHALL show Equity Curve
4. THE System SHALL calculate Sharpe and Sortino Ratios
5. THE System SHALL provide daily/weekly/monthly summaries
6. THE System SHALL track performance by Confluence Score ranges

### Requirement 20: الأدوات المدعومة

**User Story:** As a trader, I want multiple instruments.

#### Acceptance Criteria

1. THE System SHALL support Major Forex: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, NZD/USD, USD/CAD
2. THE System SHALL support Crosses: EUR/GBP, EUR/JPY, GBP/JPY, AUD/JPY
3. THE System SHALL support Metals: XAU/USD, XAG/USD
4. THE System SHALL support Indices: US30, US500, US100, GER40, UK100
5. THE System SHALL show correlation warnings

### Requirement 21: Backtesting

**User Story:** As a trader, I want backtesting to verify performance.

#### Acceptance Criteria

1. THE Backtester SHALL test on 2+ years historical data
2. THE Backtester SHALL provide: Win Rate, Profit Factor, Max Drawdown
3. THE Backtester SHALL support custom date ranges
4. THE Backtester SHALL generate visual reports
5. WHEN backtest win rate < 60%, THE System SHALL flag for review
