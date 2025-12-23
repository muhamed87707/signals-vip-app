# Requirements Document

## Introduction

نظام توصيات تداول متقدم وشامل يقدم توصيات عالية الدقة للفوركس والمعادن والمؤشرات. يعتمد النظام على مزيج من التحليل الفني المتقدم، التحليل الأساسي، تحليل المشاعر، والذكاء الاصطناعي لتقديم توصيات احترافية قابلة للتنفيذ.

## Glossary

- **Signal_Engine**: المحرك الرئيسي لتوليد التوصيات بناءً على تحليل متعدد الأبعاد
- **Technical_Analyzer**: وحدة التحليل الفني المتقدم (المؤشرات، الأنماط، الدعم/المقاومة)
- **Fundamental_Analyzer**: وحدة التحليل الأساسي (الأخبار، التقويم الاقتصادي، بيانات البنوك)
- **Sentiment_Analyzer**: وحدة تحليل مشاعر السوق (COT، positioning، social sentiment)
- **Risk_Manager**: وحدة إدارة المخاطر وحساب حجم الصفقة
- **Signal**: توصية تداول تحتوي على نقطة الدخول، وقف الخسارة، الأهداف، ونسبة الثقة
- **Confluence_Score**: درجة التقاء عدة عوامل تحليلية تدعم نفس الاتجاه
- **Market_Session**: جلسة التداول (آسيا، لندن، نيويورك)
- **Timeframe**: الإطار الزمني للتحليل (M15, H1, H4, D1)
- **Entry_Zone**: منطقة الدخول المثالية للصفقة
- **Stop_Loss**: مستوى وقف الخسارة
- **Take_Profit**: مستوى جني الأرباح
- **Risk_Reward_Ratio**: نسبة المخاطرة للعائد

## Requirements

### Requirement 1: Multi-Timeframe Technical Analysis

**User Story:** As a trader, I want the system to analyze multiple timeframes simultaneously, so that I can identify high-probability trade setups with trend alignment.

#### Acceptance Criteria

1. WHEN analyzing a trading pair, THE Technical_Analyzer SHALL analyze at least 4 timeframes (M15, H1, H4, D1) simultaneously
2. WHEN calculating trend direction, THE Technical_Analyzer SHALL use EMA crossovers (9, 21, 50, 200) on each timeframe
3. WHEN all timeframes align in the same direction, THE Signal_Engine SHALL increase the Confluence_Score by 25 points
4. THE Technical_Analyzer SHALL calculate RSI (14), MACD (12,26,9), Stochastic (14,3,3), and ADX (14) for each timeframe
5. WHEN RSI shows divergence with price, THE Technical_Analyzer SHALL flag it as a potential reversal signal
6. THE Technical_Analyzer SHALL identify and store support/resistance levels from H4 and D1 timeframes
7. WHEN price approaches a key support/resistance level, THE Signal_Engine SHALL evaluate for potential entry

### Requirement 2: Price Action Pattern Recognition

**User Story:** As a trader, I want the system to recognize candlestick patterns and chart formations, so that I can trade based on proven price action setups.

#### Acceptance Criteria

1. THE Technical_Analyzer SHALL detect single candlestick patterns (Doji, Hammer, Engulfing, Pin Bar, Inside Bar)
2. THE Technical_Analyzer SHALL detect multi-candlestick patterns (Morning/Evening Star, Three White Soldiers, Three Black Crows)
3. THE Technical_Analyzer SHALL detect chart patterns (Double Top/Bottom, Head & Shoulders, Triangles, Wedges, Flags)
4. WHEN a high-probability pattern forms at a key level, THE Signal_Engine SHALL generate a signal with pattern-based entry
5. THE Technical_Analyzer SHALL calculate pattern reliability score based on historical success rate
6. WHEN pattern reliability exceeds 65%, THE Signal_Engine SHALL include it in confluence calculation

### Requirement 3: Smart Money Concepts Analysis

**User Story:** As a trader, I want the system to identify institutional trading zones, so that I can trade alongside smart money.

#### Acceptance Criteria

1. THE Technical_Analyzer SHALL identify Order Blocks (last opposing candle before impulsive move)
2. THE Technical_Analyzer SHALL identify Fair Value Gaps (FVG) and Imbalances in price
3. THE Technical_Analyzer SHALL identify Liquidity Pools (equal highs/lows, stop hunt zones)
4. THE Technical_Analyzer SHALL identify Break of Structure (BOS) and Change of Character (CHoCH)
5. WHEN price returns to an Order Block with confluence, THE Signal_Engine SHALL generate a signal
6. THE Technical_Analyzer SHALL track institutional accumulation/distribution zones
7. WHEN a liquidity sweep occurs followed by reversal pattern, THE Signal_Engine SHALL flag high-probability reversal

### Requirement 4: Fundamental Analysis Integration

**User Story:** As a trader, I want the system to consider economic events and news, so that I avoid trading during high-impact events or capitalize on them.

#### Acceptance Criteria

1. THE Fundamental_Analyzer SHALL fetch and parse economic calendar data for major currencies
2. WHEN a high-impact news event is within 30 minutes, THE Signal_Engine SHALL pause signal generation for affected pairs
3. THE Fundamental_Analyzer SHALL analyze interest rate differentials between currency pairs
4. THE Fundamental_Analyzer SHALL track central bank policy stance (hawkish/dovish/neutral)
5. WHEN interest rate differential favors a direction, THE Signal_Engine SHALL add 10 points to Confluence_Score
6. THE Fundamental_Analyzer SHALL monitor GDP, CPI, NFP, and unemployment data trends
7. IF fundamental bias aligns with technical bias, THEN THE Signal_Engine SHALL increase confidence level by 15%

### Requirement 5: Market Sentiment Analysis

**User Story:** As a trader, I want the system to analyze market sentiment, so that I can understand crowd positioning and potential reversals.

#### Acceptance Criteria

1. THE Sentiment_Analyzer SHALL fetch and analyze COT (Commitment of Traders) report data
2. THE Sentiment_Analyzer SHALL calculate net positioning changes for commercials and speculators
3. WHEN speculator positioning reaches extreme levels (>80% or <20%), THE Sentiment_Analyzer SHALL flag potential reversal
4. THE Sentiment_Analyzer SHALL analyze retail trader positioning from available broker data
5. WHEN retail traders are heavily positioned one way (>70%), THE Signal_Engine SHALL consider contrarian signals
6. THE Sentiment_Analyzer SHALL calculate a composite sentiment score (-100 to +100)
7. WHEN sentiment aligns with technical analysis, THE Signal_Engine SHALL add 15 points to Confluence_Score

### Requirement 6: Signal Generation with Confluence Scoring

**User Story:** As a trader, I want signals with a clear confluence score, so that I can prioritize high-probability trades.

#### Acceptance Criteria

1. THE Signal_Engine SHALL only generate signals when Confluence_Score exceeds 60 points
2. THE Signal_Engine SHALL calculate Confluence_Score from: trend alignment (25), pattern (20), SMC (20), fundamentals (15), sentiment (15), session (5)
3. WHEN generating a signal, THE Signal_Engine SHALL provide: pair, direction, entry zone, stop loss, 3 take profit levels
4. THE Signal_Engine SHALL calculate Risk_Reward_Ratio and only generate signals with RR >= 1:2
5. THE Signal_Engine SHALL assign confidence level (Low: 60-70, Medium: 70-80, High: 80-90, Very High: 90+)
6. THE Signal_Engine SHALL provide detailed reasoning for each signal component
7. WHEN market conditions change significantly, THE Signal_Engine SHALL update or invalidate existing signals

### Requirement 7: Risk Management System

**User Story:** As a trader, I want the system to calculate optimal position sizing and risk parameters, so that I can manage my capital effectively.

#### Acceptance Criteria

1. THE Risk_Manager SHALL calculate position size based on account balance, risk percentage, and stop loss distance
2. THE Risk_Manager SHALL enforce maximum risk per trade (default 1-2% of account)
3. THE Risk_Manager SHALL calculate and display potential profit/loss in pips and currency
4. THE Risk_Manager SHALL suggest trailing stop levels based on ATR
5. WHEN multiple signals are active, THE Risk_Manager SHALL calculate total portfolio exposure
6. IF total exposure exceeds 5%, THEN THE Risk_Manager SHALL warn the user
7. THE Risk_Manager SHALL provide lot size recommendations for different account sizes

### Requirement 8: Real-Time Market Data Integration

**User Story:** As a trader, I want the system to use real-time market data, so that signals are based on current market conditions.

#### Acceptance Criteria

1. THE Signal_Engine SHALL fetch real-time price data for all supported pairs
2. THE Signal_Engine SHALL support Forex pairs (majors, minors, exotics), Gold (XAUUSD), Silver (XAGUSD), and major indices
3. WHEN price data is delayed more than 5 seconds, THE Signal_Engine SHALL display a warning
4. THE Signal_Engine SHALL update technical indicators in real-time as new candles form
5. THE Signal_Engine SHALL detect and handle market gaps appropriately
6. WHEN spread widens abnormally, THE Signal_Engine SHALL pause signal generation for that pair

### Requirement 9: Signal Performance Tracking

**User Story:** As a trader, I want to track signal performance, so that I can evaluate system accuracy and improve over time.

#### Acceptance Criteria

1. THE Signal_Engine SHALL track each signal's outcome (win/loss/breakeven)
2. THE Signal_Engine SHALL calculate and display: win rate, average RR, profit factor, max drawdown
3. THE Signal_Engine SHALL store historical signals with entry, exit, and result data
4. THE Signal_Engine SHALL provide performance breakdown by pair, timeframe, and signal type
5. WHEN a signal hits TP or SL, THE Signal_Engine SHALL automatically update its status
6. THE Signal_Engine SHALL generate weekly and monthly performance reports
7. THE Signal_Engine SHALL identify best and worst performing setups for optimization

### Requirement 10: User Interface and Notifications

**User Story:** As a trader, I want a clear dashboard with real-time notifications, so that I never miss a trading opportunity.

#### Acceptance Criteria

1. THE System SHALL display active signals in a clear, organized dashboard
2. THE System SHALL show signal details: pair, direction, entry, SL, TP levels, confluence score, reasoning
3. THE System SHALL provide visual charts with marked entry zones, SL, and TP levels
4. WHEN a new high-confidence signal is generated, THE System SHALL send a notification
5. THE System SHALL support filtering signals by pair, confidence level, and timeframe
6. THE System SHALL display market session indicator (Asia, London, New York, overlap)
7. THE System SHALL provide a signal history view with performance metrics
8. THE System SHALL support both Arabic and English languages

### Requirement 11: Market Session Awareness

**User Story:** As a trader, I want the system to consider market sessions, so that signals are generated during optimal trading times.

#### Acceptance Criteria

1. THE Signal_Engine SHALL identify current market session and session overlaps
2. WHEN generating signals during session overlap (London-NY), THE Signal_Engine SHALL add 5 points to Confluence_Score
3. THE Signal_Engine SHALL avoid generating signals during low-liquidity periods (late NY, early Asia)
4. THE Signal_Engine SHALL adjust volatility expectations based on current session
5. WHEN Asian session is active, THE Signal_Engine SHALL prioritize JPY and AUD pairs
6. WHEN London session is active, THE Signal_Engine SHALL prioritize EUR and GBP pairs

### Requirement 12: Signal Serialization and Storage

**User Story:** As a developer, I want signals to be properly serialized and stored, so that they can be retrieved and analyzed later.

#### Acceptance Criteria

1. WHEN storing a signal, THE System SHALL encode it using JSON format with all required fields
2. THE System SHALL validate signal data before storage to ensure completeness
3. THE Pretty_Printer SHALL format Signal objects back into valid JSON for API responses
4. FOR ALL valid Signal objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property)
5. THE System SHALL support querying signals by date range, pair, status, and confidence level
