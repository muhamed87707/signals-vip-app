# Requirements Document

## Introduction

نظام توصيات تداول متقدم يستخدم الذكاء الاصطناعي والتحليل الفني والأساسي لتوليد توصيات تداول عالية الدقة للفوركس والمعادن والمؤشرات. النظام يجمع بين عدة طبقات من التحليل لضمان أعلى مستوى من الدقة والموثوقية.

## Glossary

- **Signal_Engine**: محرك التوصيات الرئيسي الذي يجمع ويحلل جميع البيانات
- **Technical_Analyzer**: محلل التحليل الفني المتقدم
- **Fundamental_Analyzer**: محلل التحليل الأساسي
- **AI_Predictor**: نظام التنبؤ بالذكاء الاصطناعي (Gemini)
- **Risk_Manager**: نظام إدارة المخاطر
- **Confluence_Detector**: كاشف التقاطعات والتأكيدات المتعددة
- **Market_Scanner**: ماسح السوق للفرص
- **Backtester**: نظام اختبار الاستراتيجيات على البيانات التاريخية
- **Signal**: توصية تداول تحتوي على نقطة الدخول والأهداف ووقف الخسارة
- **Confluence_Score**: درجة تقاطع المؤشرات (0-100)
- **Win_Rate**: نسبة نجاح التوصيات
- **Risk_Reward_Ratio**: نسبة المخاطرة للعائد

## Requirements

### Requirement 1: Multi-Timeframe Technical Analysis

**User Story:** As a trader, I want the system to analyze multiple timeframes simultaneously, so that I can identify high-probability trading setups with strong confluence.

#### Acceptance Criteria

1. THE Technical_Analyzer SHALL analyze 6 timeframes simultaneously (M15, H1, H4, D1, W1, M1)
2. WHEN analyzing price action, THE Technical_Analyzer SHALL identify key support and resistance levels using pivot points, Fibonacci retracements, and historical price clusters
3. THE Technical_Analyzer SHALL calculate and display 15+ technical indicators including:
   - Moving Averages (EMA 9, 21, 50, 100, 200)
   - RSI (14) with divergence detection
   - MACD with histogram analysis
   - Bollinger Bands with squeeze detection
   - Stochastic Oscillator
   - ATR for volatility measurement
   - ADX for trend strength
   - Ichimoku Cloud
   - Volume Profile
   - Order Flow analysis
4. WHEN a trend is detected on higher timeframes, THE Technical_Analyzer SHALL look for entry signals on lower timeframes
5. THE Technical_Analyzer SHALL detect chart patterns including:
   - Head and Shoulders (and inverse)
   - Double/Triple Tops and Bottoms
   - Triangles (ascending, descending, symmetrical)
   - Wedges and Flags
   - Cup and Handle
   - Harmonic patterns (Gartley, Butterfly, Bat, Crab)
6. WHEN candlestick patterns are detected, THE Technical_Analyzer SHALL classify them by reliability score

### Requirement 2: Advanced Price Action Analysis

**User Story:** As a trader, I want the system to analyze price action deeply, so that I can understand market structure and smart money movements.

#### Acceptance Criteria

1. THE Technical_Analyzer SHALL identify market structure (Higher Highs, Higher Lows, Lower Highs, Lower Lows)
2. WHEN analyzing price action, THE Technical_Analyzer SHALL detect:
   - Break of Structure (BOS)
   - Change of Character (CHoCH)
   - Fair Value Gaps (FVG)
   - Order Blocks
   - Liquidity pools and stop hunts
3. THE Technical_Analyzer SHALL identify institutional order flow zones
4. WHEN price approaches key levels, THE Technical_Analyzer SHALL calculate probability of bounce vs breakout
5. THE Technical_Analyzer SHALL track and display volume at price (Volume Profile)

### Requirement 3: Fundamental Analysis Integration

**User Story:** As a trader, I want the system to incorporate fundamental analysis, so that I can align my trades with macroeconomic trends.

#### Acceptance Criteria

1. THE Fundamental_Analyzer SHALL monitor and analyze:
   - Central bank interest rate decisions and statements
   - Economic calendar events (NFP, CPI, GDP, PMI, etc.)
   - COT (Commitment of Traders) report data
   - Currency strength index
   - Intermarket correlations
2. WHEN high-impact news is scheduled within 4 hours, THE Signal_Engine SHALL flag signals with news warning
3. THE Fundamental_Analyzer SHALL calculate fundamental bias (bullish/bearish/neutral) for each asset
4. WHEN fundamental and technical analysis align, THE Confluence_Detector SHALL increase signal confidence score
5. THE Fundamental_Analyzer SHALL track DXY correlation with gold and other assets

### Requirement 4: AI-Powered Signal Generation

**User Story:** As a trader, I want AI to analyze all data and generate intelligent signals, so that I can benefit from pattern recognition beyond human capability.

#### Acceptance Criteria

1. THE AI_Predictor SHALL use Gemini AI to analyze:
   - Current market conditions
   - Historical pattern similarities
   - Multi-indicator confluence
   - News sentiment
   - Intermarket relationships
2. WHEN generating a signal, THE AI_Predictor SHALL provide:
   - Entry price (exact level)
   - Stop loss level (with ATR-based calculation)
   - Take profit levels (TP1, TP2, TP3)
   - Risk/Reward ratio
   - Confidence score (0-100%)
   - Detailed reasoning in Arabic and English
3. THE AI_Predictor SHALL only generate signals when confluence score exceeds 70%
4. WHEN market conditions are unclear, THE AI_Predictor SHALL recommend "No Trade" with explanation
5. THE AI_Predictor SHALL learn from past signal performance to improve accuracy

### Requirement 5: Risk Management System

**User Story:** As a trader, I want the system to manage risk intelligently, so that I can protect my capital while maximizing returns.

#### Acceptance Criteria

1. THE Risk_Manager SHALL calculate optimal position size based on:
   - Account balance (user input)
   - Risk percentage per trade (1-3%)
   - Stop loss distance
   - Asset volatility (ATR)
2. WHEN generating signals, THE Risk_Manager SHALL ensure minimum 1:2 risk/reward ratio
3. THE Risk_Manager SHALL track daily, weekly, and monthly drawdown limits
4. IF daily loss exceeds 3%, THEN THE Signal_Engine SHALL pause signal generation with warning
5. THE Risk_Manager SHALL calculate and display:
   - Maximum position size
   - Pip value
   - Potential profit/loss in currency
6. WHEN multiple signals are active, THE Risk_Manager SHALL calculate total portfolio exposure

### Requirement 6: Confluence Detection System

**User Story:** As a trader, I want the system to identify when multiple factors align, so that I can take only the highest probability trades.

#### Acceptance Criteria

1. THE Confluence_Detector SHALL score signals based on:
   - Technical indicator alignment (weight: 30%)
   - Price action confirmation (weight: 25%)
   - Multi-timeframe agreement (weight: 20%)
   - Fundamental alignment (weight: 15%)
   - AI confidence (weight: 10%)
2. WHEN confluence score is 80-100%, THE Signal_Engine SHALL classify signal as "A+ Setup"
3. WHEN confluence score is 70-79%, THE Signal_Engine SHALL classify signal as "A Setup"
4. WHEN confluence score is below 70%, THE Signal_Engine SHALL NOT generate a signal
5. THE Confluence_Detector SHALL display visual breakdown of all contributing factors

### Requirement 7: Real-Time Market Scanner

**User Story:** As a trader, I want the system to continuously scan markets for opportunities, so that I don't miss high-probability setups.

#### Acceptance Criteria

1. THE Market_Scanner SHALL monitor these assets continuously:
   - Forex: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD, EURGBP, EURJPY, GBPJPY
   - Metals: XAUUSD (Gold), XAGUSD (Silver)
   - Indices: US30, US500, US100, GER40
2. WHEN a potential setup is detected, THE Market_Scanner SHALL add it to watchlist with alert
3. THE Market_Scanner SHALL refresh analysis every 5 minutes
4. WHEN setup conditions are met, THE Market_Scanner SHALL trigger signal generation
5. THE Market_Scanner SHALL display heat map of opportunities across all assets

### Requirement 8: Signal Performance Tracking

**User Story:** As a trader, I want to track signal performance, so that I can evaluate system accuracy and improve over time.

#### Acceptance Criteria

1. THE Signal_Engine SHALL track for each signal:
   - Entry time and price
   - Exit time and price (TP hit or SL hit)
   - Profit/Loss in pips and percentage
   - Holding duration
   - Maximum favorable/adverse excursion
2. THE Signal_Engine SHALL calculate and display:
   - Overall win rate
   - Average win vs average loss
   - Profit factor
   - Maximum drawdown
   - Sharpe ratio
   - Performance by asset
   - Performance by day/time
3. WHEN displaying statistics, THE Signal_Engine SHALL show last 7 days, 30 days, 90 days, and all-time
4. THE Signal_Engine SHALL generate weekly performance reports

### Requirement 9: Smart Entry Optimization

**User Story:** As a trader, I want the system to optimize entry points, so that I can get the best possible entry price.

#### Acceptance Criteria

1. WHEN a signal is generated, THE Signal_Engine SHALL provide:
   - Immediate entry price
   - Limit order price (better entry if price retraces)
   - Entry zone (acceptable range)
2. THE Signal_Engine SHALL calculate optimal entry based on:
   - Recent support/resistance
   - Fibonacci retracement levels
   - Order block locations
   - Fair value gaps
3. WHEN price is extended from mean, THE Signal_Engine SHALL recommend waiting for pullback
4. THE Signal_Engine SHALL provide entry timing recommendation (immediate, wait for pullback, wait for breakout confirmation)

### Requirement 10: Alert and Notification System

**User Story:** As a trader, I want to receive alerts for important signals, so that I can act on opportunities quickly.

#### Acceptance Criteria

1. WHEN a new A+ or A signal is generated, THE Signal_Engine SHALL display prominent notification
2. THE Signal_Engine SHALL provide audio alert option for new signals
3. WHEN a signal's TP or SL is hit, THE Signal_Engine SHALL notify with result
4. WHEN market conditions change significantly, THE Signal_Engine SHALL update signal status
5. THE Signal_Engine SHALL allow users to set custom alert preferences

### Requirement 11: Backtesting and Validation

**User Story:** As a trader, I want to see historical performance of the strategy, so that I can trust the system's signals.

#### Acceptance Criteria

1. THE Backtester SHALL test signal generation logic on historical data
2. WHEN displaying backtest results, THE Backtester SHALL show:
   - Total trades
   - Win rate
   - Profit factor
   - Maximum drawdown
   - Equity curve
3. THE Backtester SHALL validate that strategy performs consistently across different market conditions
4. THE Backtester SHALL identify optimal parameters for each asset

### Requirement 12: User Interface and Experience

**User Story:** As a trader, I want a professional and intuitive interface, so that I can quickly understand and act on signals.

#### Acceptance Criteria

1. THE Signal_Engine SHALL display signals in a clear, organized dashboard
2. WHEN viewing a signal, THE Signal_Engine SHALL show:
   - Asset name and direction (BUY/SELL)
   - Entry, SL, TP levels with visual chart
   - Confluence score with breakdown
   - AI reasoning
   - Risk calculator
3. THE Signal_Engine SHALL support Arabic and English languages
4. THE Signal_Engine SHALL be responsive for mobile and desktop
5. THE Signal_Engine SHALL use dark theme with gold accents (matching existing design)
6. WHEN a signal is active, THE Signal_Engine SHALL show real-time P/L

### Requirement 13: Data Quality and Reliability

**User Story:** As a trader, I want reliable and accurate data, so that I can trust the analysis and signals.

#### Acceptance Criteria

1. THE Signal_Engine SHALL fetch real-time price data from reliable APIs
2. WHEN data fetch fails, THE Signal_Engine SHALL display error and retry automatically
3. THE Signal_Engine SHALL validate data integrity before analysis
4. WHEN data is stale (>1 minute old), THE Signal_Engine SHALL display warning
5. THE Signal_Engine SHALL use multiple data sources for redundancy

### Requirement 14: Session and Timing Analysis

**User Story:** As a trader, I want the system to consider trading sessions, so that signals are generated during optimal market hours.

#### Acceptance Criteria

1. THE Signal_Engine SHALL identify current trading session (Asian, London, New York, Overlap)
2. WHEN generating signals, THE Signal_Engine SHALL consider session volatility patterns
3. THE Signal_Engine SHALL flag signals generated during low-liquidity periods
4. WHEN major session opens, THE Signal_Engine SHALL scan for breakout opportunities
5. THE Signal_Engine SHALL display session times in user's local timezone

### Requirement 15: Correlation and Divergence Analysis

**User Story:** As a trader, I want the system to analyze correlations, so that I can avoid overexposure and identify divergence opportunities.

#### Acceptance Criteria

1. THE Signal_Engine SHALL calculate real-time correlations between assets
2. WHEN generating multiple signals, THE Signal_Engine SHALL warn about correlated positions
3. WHEN divergence is detected between correlated assets, THE Signal_Engine SHALL flag potential opportunity
4. THE Signal_Engine SHALL display correlation matrix for all monitored assets
5. WHEN DXY diverges from gold, THE Signal_Engine SHALL generate alert

### Requirement 16: Market Sentiment Analysis

**User Story:** As a trader, I want the system to analyze market sentiment from multiple sources, so that I can understand crowd psychology and position accordingly.

#### Acceptance Criteria

1. THE Sentiment_Analyzer SHALL analyze:
   - Retail trader positioning (% long vs short)
   - Institutional positioning from COT data
   - Social media sentiment (Twitter/X financial accounts)
   - News sentiment using NLP
   - Fear & Greed Index
   - VIX (Volatility Index) levels
2. WHEN retail sentiment is extremely one-sided (>75%), THE Signal_Engine SHALL consider contrarian signals
3. THE Sentiment_Analyzer SHALL calculate composite sentiment score (-100 to +100)
4. WHEN sentiment diverges from price action, THE Signal_Engine SHALL flag potential reversal
5. THE Sentiment_Analyzer SHALL track sentiment changes over time (momentum)

### Requirement 17: Liquidity and Volume Analysis

**User Story:** As a trader, I want the system to analyze liquidity and volume, so that I can identify institutional activity and avoid low-liquidity traps.

#### Acceptance Criteria

1. THE Volume_Analyzer SHALL calculate:
   - Volume Profile (Point of Control, Value Area High/Low)
   - Volume Weighted Average Price (VWAP)
   - On-Balance Volume (OBV)
   - Accumulation/Distribution Line
   - Money Flow Index (MFI)
   - Chaikin Money Flow
2. WHEN unusual volume spike is detected, THE Signal_Engine SHALL flag potential breakout/reversal
3. THE Volume_Analyzer SHALL identify volume divergences with price
4. WHEN price moves on low volume, THE Signal_Engine SHALL reduce signal confidence
5. THE Volume_Analyzer SHALL identify institutional accumulation/distribution zones

### Requirement 18: Volatility-Based Position Sizing

**User Story:** As a trader, I want position sizing to adapt to market volatility, so that I can maintain consistent risk across different market conditions.

#### Acceptance Criteria

1. THE Risk_Manager SHALL calculate dynamic position size using:
   - ATR (Average True Range) for volatility measurement
   - Historical volatility percentile
   - Implied volatility when available
   - Current spread as % of ATR
2. WHEN volatility is high (ATR > 1.5x average), THE Risk_Manager SHALL reduce position size by 50%
3. WHEN volatility is low (ATR < 0.5x average), THE Risk_Manager SHALL allow larger position size
4. THE Risk_Manager SHALL display volatility regime (Low/Normal/High/Extreme)
5. WHEN spread exceeds 20% of ATR, THE Signal_Engine SHALL warn about execution risk

### Requirement 19: Multi-Asset Confirmation System

**User Story:** As a trader, I want the system to check related assets for confirmation, so that I can validate signals with intermarket analysis.

#### Acceptance Criteria

1. THE Intermarket_Analyzer SHALL check confirmations:
   - For XAUUSD: Check DXY (inverse), US10Y yields (inverse), Silver (positive)
   - For EURUSD: Check DXY (inverse), EURGBP, EUR strength index
   - For Indices: Check VIX (inverse), bond yields, sector rotation
2. WHEN 3+ related assets confirm signal direction, THE Confluence_Detector SHALL add +15% to confidence
3. WHEN related assets diverge, THE Signal_Engine SHALL reduce confidence or skip signal
4. THE Intermarket_Analyzer SHALL display confirmation status for each signal
5. THE Intermarket_Analyzer SHALL track lead-lag relationships between assets

### Requirement 20: Statistical Edge Validation

**User Story:** As a trader, I want the system to validate statistical edge before generating signals, so that I only take trades with proven probability.

#### Acceptance Criteria

1. THE Statistical_Validator SHALL calculate for each setup type:
   - Historical win rate (minimum 100 samples)
   - Average R-multiple (reward/risk)
   - Expectancy (win rate × avg win - loss rate × avg loss)
   - Maximum consecutive losses
   - Recovery factor
2. WHEN setup expectancy is negative, THE Signal_Engine SHALL NOT generate signal
3. THE Statistical_Validator SHALL require minimum 55% win rate OR 1:2.5 R:R for signal generation
4. WHEN setup is in drawdown period, THE Signal_Engine SHALL reduce position size
5. THE Statistical_Validator SHALL display statistical edge metrics for each signal

### Requirement 21: Price Momentum and Acceleration Analysis

**User Story:** As a trader, I want the system to analyze momentum and acceleration, so that I can identify trend strength and potential exhaustion.

#### Acceptance Criteria

1. THE Momentum_Analyzer SHALL calculate:
   - Rate of Change (ROC) across multiple periods
   - Momentum oscillator
   - Price acceleration (second derivative)
   - Trend strength using ADX
   - Momentum divergences with price
2. WHEN momentum is accelerating in signal direction, THE Signal_Engine SHALL increase confidence
3. WHEN momentum is decelerating, THE Signal_Engine SHALL warn of potential reversal
4. THE Momentum_Analyzer SHALL identify momentum exhaustion patterns
5. WHEN hidden divergence is detected, THE Signal_Engine SHALL flag trend continuation opportunity

### Requirement 22: Order Flow and Market Microstructure

**User Story:** As a trader, I want the system to analyze order flow, so that I can understand real-time supply and demand dynamics.

#### Acceptance Criteria

1. THE OrderFlow_Analyzer SHALL analyze:
   - Bid/Ask imbalance
   - Large order detection (institutional footprint)
   - Stop hunt patterns
   - Liquidity grab patterns
   - Delta (buying vs selling pressure)
2. WHEN large buy orders are detected at support, THE Signal_Engine SHALL increase bullish confidence
3. WHEN stop hunt pattern completes, THE Signal_Engine SHALL look for reversal entry
4. THE OrderFlow_Analyzer SHALL identify absorption patterns (large orders absorbed without price movement)
5. WHEN delta diverges from price, THE Signal_Engine SHALL flag potential reversal

### Requirement 23: Time-Based Pattern Analysis

**User Story:** As a trader, I want the system to analyze time-based patterns, so that I can identify optimal entry times and recurring patterns.

#### Acceptance Criteria

1. THE Time_Analyzer SHALL identify:
   - Best performing hours for each asset
   - Day-of-week patterns
   - Month-end/quarter-end flows
   - Session open/close patterns
   - News release timing patterns
2. WHEN current time matches high-probability window, THE Signal_Engine SHALL increase confidence
3. THE Time_Analyzer SHALL avoid signals during historically poor-performing times
4. WHEN approaching major session close, THE Signal_Engine SHALL warn about potential volatility
5. THE Time_Analyzer SHALL display optimal trading windows for each asset

### Requirement 24: Adaptive Strategy Selection

**User Story:** As a trader, I want the system to adapt strategy based on market regime, so that I use the right approach for current conditions.

#### Acceptance Criteria

1. THE Regime_Detector SHALL identify market regime:
   - Trending (strong directional movement)
   - Ranging (sideways consolidation)
   - Volatile (high ATR, choppy)
   - Quiet (low ATR, tight range)
   - Breakout (transitioning from range)
2. WHEN market is trending, THE Signal_Engine SHALL use trend-following strategies
3. WHEN market is ranging, THE Signal_Engine SHALL use mean-reversion strategies
4. WHEN market is volatile, THE Signal_Engine SHALL reduce position size and widen stops
5. THE Regime_Detector SHALL display current regime and confidence level

### Requirement 25: Machine Learning Pattern Recognition

**User Story:** As a trader, I want the system to use ML for pattern recognition, so that I can identify complex patterns humans might miss.

#### Acceptance Criteria

1. THE ML_Analyzer SHALL use Gemini AI to identify:
   - Complex chart patterns
   - Hidden correlations
   - Anomaly detection
   - Similar historical setups
   - Pattern completion probability
2. WHEN ML identifies high-probability pattern, THE Signal_Engine SHALL include in analysis
3. THE ML_Analyzer SHALL compare current setup to historical similar setups
4. WHEN historical similar setups had >65% success rate, THE Signal_Engine SHALL increase confidence
5. THE ML_Analyzer SHALL continuously learn from new data and outcomes

### Requirement 26: Risk-Adjusted Signal Scoring

**User Story:** As a trader, I want signals scored by risk-adjusted potential, so that I can prioritize the best opportunities.

#### Acceptance Criteria

1. THE Signal_Scorer SHALL calculate composite score using:
   - Expected value (probability × reward - probability × risk)
   - Sharpe ratio of similar historical trades
   - Current drawdown status
   - Correlation with existing positions
   - Time to target estimate
2. THE Signal_Scorer SHALL rank all active signals by risk-adjusted score
3. WHEN multiple signals are available, THE Signal_Engine SHALL highlight top 3 by score
4. THE Signal_Scorer SHALL penalize signals with poor risk/reward
5. THE Signal_Scorer SHALL display score breakdown for transparency

### Requirement 27: Dynamic Stop Loss Management

**User Story:** As a trader, I want intelligent stop loss management, so that I can protect profits while giving trades room to breathe.

#### Acceptance Criteria

1. THE StopLoss_Manager SHALL provide:
   - Initial stop loss (ATR-based)
   - Breakeven trigger level
   - Trailing stop options (ATR trail, structure trail, % trail)
   - Partial profit taking levels
2. WHEN price reaches 1R profit, THE StopLoss_Manager SHALL recommend moving stop to breakeven
3. WHEN price reaches 2R profit, THE StopLoss_Manager SHALL recommend taking 50% profit
4. THE StopLoss_Manager SHALL adjust stops based on market structure (swing highs/lows)
5. WHEN volatility increases significantly, THE StopLoss_Manager SHALL widen trailing stop

### Requirement 28: News Impact Prediction

**User Story:** As a trader, I want the system to predict news impact, so that I can prepare for volatility and avoid bad entries.

#### Acceptance Criteria

1. THE News_Predictor SHALL analyze:
   - Historical impact of similar news events
   - Consensus vs actual deviation probability
   - Pre-news positioning
   - Expected volatility spike
2. WHEN high-impact news is within 30 minutes, THE Signal_Engine SHALL pause new signals
3. THE News_Predictor SHALL estimate expected price range post-news
4. WHEN news result deviates significantly from consensus, THE Signal_Engine SHALL look for momentum entry
5. THE News_Predictor SHALL display countdown to next high-impact event

### Requirement 29: Portfolio Heat Map and Exposure

**User Story:** As a trader, I want to see portfolio exposure visually, so that I can manage overall risk effectively.

#### Acceptance Criteria

1. THE Portfolio_Manager SHALL display:
   - Total exposure by currency
   - Total exposure by asset class
   - Correlation-adjusted exposure
   - Maximum potential loss
   - Current P/L across all positions
2. WHEN total exposure exceeds 5% of account, THE Portfolio_Manager SHALL warn
3. THE Portfolio_Manager SHALL show heat map of correlated positions
4. WHEN adding new signal would exceed risk limits, THE Signal_Engine SHALL block or reduce size
5. THE Portfolio_Manager SHALL calculate portfolio beta and volatility

### Requirement 30: Signal Confidence Calibration

**User Story:** As a trader, I want confidence scores to be well-calibrated, so that 80% confidence signals actually win 80% of the time.

#### Acceptance Criteria

1. THE Calibration_System SHALL track:
   - Predicted confidence vs actual win rate
   - Calibration error over time
   - Overconfidence/underconfidence bias
2. WHEN calibration error exceeds 10%, THE Calibration_System SHALL adjust confidence calculations
3. THE Calibration_System SHALL display calibration chart (predicted vs actual)
4. WHEN system is overconfident, THE Calibration_System SHALL reduce displayed confidence
5. THE Calibration_System SHALL report calibration metrics in weekly reports


### Requirement 31: Wyckoff Method Analysis

**User Story:** As a trader, I want the system to apply Wyckoff methodology, so that I can identify accumulation and distribution phases like institutional traders.

#### Acceptance Criteria

1. THE Wyckoff_Analyzer SHALL identify:
   - Accumulation phases (PS, SC, AR, ST, Spring, SOS, LPS)
   - Distribution phases (PSY, BC, AR, ST, UTAD, SOW, LPSY)
   - Mark-up and Mark-down phases
   - Composite Man activity
2. WHEN Spring or UTAD pattern is detected, THE Signal_Engine SHALL generate high-priority signal
3. THE Wyckoff_Analyzer SHALL identify cause and effect (count) for price targets
4. WHEN price is in accumulation phase, THE Signal_Engine SHALL look for long entries
5. THE Wyckoff_Analyzer SHALL display current Wyckoff phase for each asset

### Requirement 32: Elliott Wave Analysis

**User Story:** As a trader, I want Elliott Wave analysis, so that I can identify wave structures and predict future price movements.

#### Acceptance Criteria

1. THE Elliott_Analyzer SHALL identify:
   - Impulse waves (1-2-3-4-5)
   - Corrective waves (A-B-C)
   - Wave degree (from minute to supercycle)
   - Current wave position
2. WHEN Wave 3 or Wave C is starting, THE Signal_Engine SHALL generate high-confidence signal
3. THE Elliott_Analyzer SHALL calculate Fibonacci targets for each wave
4. WHEN wave count is invalidated, THE Signal_Engine SHALL update analysis immediately
5. THE Elliott_Analyzer SHALL provide alternative wave counts with probabilities

### Requirement 33: Supply and Demand Zone Analysis

**User Story:** As a trader, I want precise supply and demand zones, so that I can identify institutional entry points.

#### Acceptance Criteria

1. THE SupplyDemand_Analyzer SHALL identify:
   - Fresh zones (never tested)
   - Tested zones (touched but held)
   - Broken zones (now flipped)
   - Zone strength (based on departure strength)
2. WHEN price approaches fresh zone, THE Signal_Engine SHALL prepare signal
3. THE SupplyDemand_Analyzer SHALL calculate zone quality score (1-10)
4. WHEN multiple zones cluster, THE Signal_Engine SHALL mark as high-probability area
5. THE SupplyDemand_Analyzer SHALL track zone success rate historically

### Requirement 34: Market Profile Analysis

**User Story:** As a trader, I want Market Profile analysis, so that I can understand value areas and auction market theory.

#### Acceptance Criteria

1. THE MarketProfile_Analyzer SHALL calculate:
   - Point of Control (POC)
   - Value Area High (VAH)
   - Value Area Low (VAL)
   - Initial Balance
   - Single prints (low volume nodes)
2. WHEN price is outside value area, THE Signal_Engine SHALL look for mean reversion
3. WHEN price breaks and holds above VAH, THE Signal_Engine SHALL look for continuation long
4. THE MarketProfile_Analyzer SHALL identify balance vs imbalance days
5. WHEN single prints are created, THE Signal_Engine SHALL mark as potential support/resistance

### Requirement 35: Fractal and Multi-Dimensional Analysis

**User Story:** As a trader, I want fractal analysis across dimensions, so that I can see self-similar patterns at all scales.

#### Acceptance Criteria

1. THE Fractal_Analyzer SHALL identify:
   - Bill Williams fractals
   - Fractal dimension of price
   - Self-similar patterns across timeframes
   - Chaos theory indicators (Alligator, AO, AC)
2. WHEN fractal breakout occurs on multiple timeframes, THE Signal_Engine SHALL increase confidence
3. THE Fractal_Analyzer SHALL calculate Hurst exponent for trend persistence
4. WHEN Hurst > 0.5, THE Signal_Engine SHALL favor trend-following
5. WHEN Hurst < 0.5, THE Signal_Engine SHALL favor mean-reversion

### Requirement 36: Options Flow and Gamma Analysis

**User Story:** As a trader, I want options flow analysis, so that I can see where big money is positioning.

#### Acceptance Criteria

1. THE Options_Analyzer SHALL track (where available):
   - Put/Call ratio
   - Unusual options activity
   - Max pain levels
   - Gamma exposure levels
   - Options expiration dates
2. WHEN unusual call buying is detected, THE Signal_Engine SHALL increase bullish bias
3. WHEN approaching max pain, THE Signal_Engine SHALL expect price gravitation
4. THE Options_Analyzer SHALL identify gamma squeeze potential
5. WHEN large options expire, THE Signal_Engine SHALL warn of potential volatility

### Requirement 37: Seasonal and Cyclical Analysis

**User Story:** As a trader, I want seasonal pattern analysis, so that I can align trades with historical tendencies.

#### Acceptance Criteria

1. THE Seasonal_Analyzer SHALL calculate:
   - Monthly seasonal patterns (last 10+ years)
   - Weekly patterns within months
   - Holiday effects
   - Quarter-end rebalancing effects
   - Election cycle patterns
2. WHEN current period has >65% historical bullish tendency, THE Signal_Engine SHALL add bullish bias
3. THE Seasonal_Analyzer SHALL display seasonal chart overlay
4. WHEN seasonal and technical align, THE Signal_Engine SHALL increase confidence by 10%
5. THE Seasonal_Analyzer SHALL identify best and worst months for each asset

### Requirement 38: Divergence Detection System

**User Story:** As a trader, I want comprehensive divergence detection, so that I can identify potential reversals early.

#### Acceptance Criteria

1. THE Divergence_Detector SHALL identify:
   - Regular bullish divergence (price lower low, indicator higher low)
   - Regular bearish divergence (price higher high, indicator lower high)
   - Hidden bullish divergence (price higher low, indicator lower low)
   - Hidden bearish divergence (price lower high, indicator higher high)
   - Triple divergence (strongest signal)
2. THE Divergence_Detector SHALL check divergence on: RSI, MACD, Stochastic, OBV, MFI
3. WHEN divergence appears on 3+ indicators, THE Signal_Engine SHALL generate high-priority alert
4. THE Divergence_Detector SHALL calculate divergence strength score
5. WHEN divergence is confirmed by price action, THE Signal_Engine SHALL generate signal

### Requirement 39: Pivot Point and Key Level System

**User Story:** As a trader, I want multiple pivot point calculations, so that I can identify key institutional levels.

#### Acceptance Criteria

1. THE Pivot_Calculator SHALL calculate:
   - Standard pivots (daily, weekly, monthly)
   - Fibonacci pivots
   - Camarilla pivots
   - Woodie pivots
   - DeMark pivots
2. WHEN multiple pivot types cluster within 10 pips, THE Signal_Engine SHALL mark as strong level
3. THE Pivot_Calculator SHALL identify pivot confluence zones
4. WHEN price reacts at pivot level, THE Signal_Engine SHALL look for entry
5. THE Pivot_Calculator SHALL track pivot level success rate

### Requirement 40: Candlestick Pattern Recognition (Advanced)

**User Story:** As a trader, I want advanced candlestick analysis, so that I can read price action like a professional.

#### Acceptance Criteria

1. THE Candlestick_Analyzer SHALL identify 40+ patterns including:
   - Single: Doji, Hammer, Shooting Star, Marubozu, Spinning Top
   - Double: Engulfing, Harami, Piercing, Dark Cloud, Tweezer
   - Triple: Morning/Evening Star, Three White Soldiers, Three Black Crows
   - Complex: Three Inside Up/Down, Abandoned Baby, Kicker
2. THE Candlestick_Analyzer SHALL rate pattern reliability (1-5 stars)
3. WHEN pattern appears at key level, THE Signal_Engine SHALL increase confidence
4. THE Candlestick_Analyzer SHALL consider pattern context (trend, location)
5. WHEN multiple patterns confirm, THE Signal_Engine SHALL generate signal

### Requirement 41: Trend Strength Quantification

**User Story:** As a trader, I want precise trend strength measurement, so that I can avoid trading against strong trends.

#### Acceptance Criteria

1. THE Trend_Analyzer SHALL calculate:
   - ADX with +DI/-DI
   - Aroon indicator
   - Trend intensity index
   - Linear regression slope
   - Price position relative to moving averages
2. WHEN ADX > 25 and +DI > -DI, THE Signal_Engine SHALL only look for long signals
3. THE Trend_Analyzer SHALL classify trend as: Strong, Moderate, Weak, No Trend
4. WHEN trend strength is increasing, THE Signal_Engine SHALL favor trend continuation
5. THE Trend_Analyzer SHALL identify trend exhaustion signals

### Requirement 42: Gap Analysis

**User Story:** As a trader, I want gap analysis, so that I can trade gap fills and breakaway gaps.

#### Acceptance Criteria

1. THE Gap_Analyzer SHALL identify:
   - Common gaps (likely to fill)
   - Breakaway gaps (trend initiation)
   - Runaway gaps (trend continuation)
   - Exhaustion gaps (trend ending)
2. WHEN common gap is detected, THE Signal_Engine SHALL look for gap fill trade
3. WHEN breakaway gap occurs with volume, THE Signal_Engine SHALL look for continuation
4. THE Gap_Analyzer SHALL track gap fill statistics
5. WHEN unfilled gap exists nearby, THE Signal_Engine SHALL mark as potential target

### Requirement 43: Currency Strength Meter

**User Story:** As a trader, I want real-time currency strength analysis, so that I can pair strong currencies against weak ones.

#### Acceptance Criteria

1. THE Strength_Meter SHALL calculate strength for: USD, EUR, GBP, JPY, CHF, AUD, CAD, NZD
2. THE Strength_Meter SHALL use multiple timeframe analysis for strength
3. WHEN pairing strongest vs weakest currency, THE Signal_Engine SHALL increase confidence
4. THE Strength_Meter SHALL display strength change momentum
5. WHEN strength divergence occurs, THE Signal_Engine SHALL flag opportunity

### Requirement 44: Smart Money Index Tracking

**User Story:** As a trader, I want to track smart money movements, so that I can follow institutional traders.

#### Acceptance Criteria

1. THE SmartMoney_Tracker SHALL analyze:
   - First 30 minutes vs last hour trading patterns
   - Large transaction detection
   - Dark pool activity indicators
   - Institutional accumulation/distribution
2. WHEN smart money is accumulating, THE Signal_Engine SHALL favor long positions
3. THE SmartMoney_Tracker SHALL calculate smart money confidence index
4. WHEN retail and smart money diverge, THE Signal_Engine SHALL follow smart money
5. THE SmartMoney_Tracker SHALL display smart money flow direction

### Requirement 45: Risk Event Calendar Integration

**User Story:** As a trader, I want comprehensive risk event tracking, so that I can avoid or prepare for volatility events.

#### Acceptance Criteria

1. THE RiskEvent_Tracker SHALL monitor:
   - Central bank meetings and speeches
   - Economic data releases
   - Geopolitical events
   - Earnings reports (for indices)
   - OPEC meetings (for commodities)
   - Options expiration dates
2. WHEN high-risk event is within 2 hours, THE Signal_Engine SHALL add warning to signals
3. THE RiskEvent_Tracker SHALL estimate expected volatility for each event
4. WHEN multiple risk events cluster, THE Signal_Engine SHALL recommend reduced position size
5. THE RiskEvent_Tracker SHALL display risk calendar with impact ratings

### Requirement 46: Price Target Calculation System

**User Story:** As a trader, I want multiple price target methods, so that I can set realistic take profit levels.

#### Acceptance Criteria

1. THE Target_Calculator SHALL use:
   - Fibonacci extensions (127.2%, 161.8%, 261.8%)
   - Measured moves (AB=CD)
   - Previous swing highs/lows
   - Round numbers and psychological levels
   - Average True Range multiples
   - Supply/Demand zones
2. WHEN multiple methods agree on target, THE Signal_Engine SHALL mark as high-probability target
3. THE Target_Calculator SHALL provide 3 targets (conservative, moderate, aggressive)
4. THE Target_Calculator SHALL calculate probability of reaching each target
5. WHEN target conflicts with strong resistance, THE Signal_Engine SHALL adjust or warn

### Requirement 47: Trade Journal and Learning System

**User Story:** As a trader, I want automatic trade journaling, so that I can learn from past trades and improve.

#### Acceptance Criteria

1. THE Journal_System SHALL record for each signal:
   - All analysis factors at signal time
   - Entry, exit, and result
   - Market conditions
   - Screenshots of chart at entry
   - What worked and what didn't
2. THE Journal_System SHALL identify patterns in winning vs losing trades
3. WHEN similar setup to past winner appears, THE Signal_Engine SHALL note similarity
4. THE Journal_System SHALL generate insights (e.g., "Your win rate is 20% higher during London session")
5. THE Journal_System SHALL track improvement over time

### Requirement 48: Execution Quality Analysis

**User Story:** As a trader, I want execution analysis, so that I can optimize entry timing.

#### Acceptance Criteria

1. THE Execution_Analyzer SHALL track:
   - Slippage on entries and exits
   - Best entry timing within signal window
   - Missed opportunities analysis
   - Early vs late entry performance
2. THE Execution_Analyzer SHALL recommend optimal entry timing based on history
3. WHEN signal is generated, THE Execution_Analyzer SHALL suggest wait for pullback or enter immediately
4. THE Execution_Analyzer SHALL calculate cost of poor execution
5. THE Execution_Analyzer SHALL identify best execution strategies per asset

### Requirement 49: Confidence Interval and Probability Cones

**User Story:** As a trader, I want probability-based price projections, so that I can understand likely price ranges.

#### Acceptance Criteria

1. THE Probability_Engine SHALL calculate:
   - 1 standard deviation price range (68% probability)
   - 2 standard deviation range (95% probability)
   - Probability of reaching TP before SL
   - Expected time to target
2. THE Probability_Engine SHALL display probability cones on chart
3. WHEN TP is within 1 SD, THE Signal_Engine SHALL rate as high probability
4. THE Probability_Engine SHALL update probabilities in real-time
5. WHEN probability of success drops below 50%, THE Signal_Engine SHALL recommend exit

### Requirement 50: AI Reasoning Transparency

**User Story:** As a trader, I want to understand AI reasoning, so that I can trust and learn from the system.

#### Acceptance Criteria

1. THE AI_Predictor SHALL provide detailed reasoning including:
   - Key factors supporting the signal
   - Key risks and concerns
   - Confidence breakdown by factor
   - Similar historical setups and outcomes
   - What would invalidate the signal
2. THE AI_Predictor SHALL explain in both Arabic and English
3. WHEN confidence is borderline, THE AI_Predictor SHALL explain uncertainty
4. THE AI_Predictor SHALL highlight most important factor in decision
5. THE AI_Predictor SHALL provide "If X happens, then Y" scenarios
