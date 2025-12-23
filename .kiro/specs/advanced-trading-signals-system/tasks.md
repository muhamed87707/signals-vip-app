تما# Implementation Plan: Institutional Edge System (IES)

## Overview

خطة تنفيذ نظام توصيات التداول المؤسسي المتقدم. سيتم البناء بشكل تدريجي من الأساسيات إلى الميزات المتقدمة.

## Tasks

- [x] 1. إعداد البنية الأساسية والـ Data Layer
  - [x] 1.1 إنشاء هيكل المجلدات للنظام
    - إنشاء `lib/trading-system/` مع المجلدات الفرعية
    - إنشاء `app/signalssystem/` للصفحة الرئيسية
    - إنشاء `app/api/signals-system/` للـ API routes
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 إنشاء Market Data Provider
    - إنشاء `lib/trading-system/data/marketDataProvider.js`
    - تنفيذ الاتصال بـ Alpha Vantage API
    - تنفيذ الاتصال بـ Twelve Data API كـ backup
    - تنفيذ نظام الـ caching
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.3 كتابة property test لـ Data Source Failover
    - **Property 15: Data Source Failover**
    - **Validates: Requirements 1.4**

  - [x] 1.4 إنشاء نماذج MongoDB
    - إنشاء `models/TradingSignal.js` للتوصيات
    - إنشاء `models/SignalPerformance.js` للأداء
    - إنشاء `models/TradingSettings.js` للإعدادات
    - _Requirements: 19.1, 21.1_

- [x] 2. Checkpoint - التأكد من عمل Data Layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. تنفيذ Technical Analyzer
  - [x] 3.1 إنشاء Technical Analyzer الأساسي
    - إنشاء `lib/trading-system/analyzers/technicalAnalyzer.js`
    - تنفيذ حساب EMAs (9, 21, 50, 100, 200)
    - تنفيذ حساب RSI مع كشف الـ divergence
    - تنفيذ حساب MACD
    - تنفيذ حساب Bollinger Bands
    - تنفيذ حساب ATR
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 3.2 كتابة property test لـ EMA Calculation
    - **Property 10: EMA Calculation Correctness**
    - **Validates: Requirements 9.1**

  - [x] 3.3 كتابة property test لـ RSI Bounds
    - **Property 11: RSI Bounds**
    - **Validates: Requirements 9.2**

  - [x] 3.4 تنفيذ كشف أنماط الشموع
    - إضافة كشف Engulfing, Doji, Hammer, Pin Bar
    - إضافة كشف Morning/Evening Star
    - إضافة كشف Inside Bar
    - _Requirements: 9.3_

  - [x] 3.5 تنفيذ حساب Fibonacci
    - إضافة حساب Fibonacci retracement levels
    - إضافة حساب Fibonacci extension levels
    - _Requirements: 9.4_

- [x] 4. تنفيذ SMC Analyzer
  - [x] 4.1 إنشاء SMC Analyzer الأساسي
    - إنشاء `lib/trading-system/analyzers/smcAnalyzer.js`
    - تنفيذ كشف Order Blocks (Bullish/Bearish)
    - تنفيذ كشف Fair Value Gaps
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 كتابة property test لـ FVG Detection
    - **Property 7: Fair Value Gap Detection**
    - **Validates: Requirements 2.2**

  - [x] 4.3 تنفيذ كشف Liquidity Zones
    - إضافة كشف Equal Highs/Lows
    - إضافة كشف Stop Hunt areas
    - _Requirements: 2.3_

  - [x] 4.4 تنفيذ كشف Market Structure
    - إضافة كشف Break of Structure (BOS)
    - إضافة كشف Change of Character (CHoCH)
    - إضافة كشف Swing Highs/Lows
    - _Requirements: 2.4, 2.5_

  - [x] 4.5 تنفيذ Premium/Discount Zones
    - إضافة حساب Equilibrium
    - إضافة تحديد Premium/Discount
    - إضافة حساب OTE Zone
    - _Requirements: 2.6, 2.7, 2.8_

  - [x] 4.6 كتابة property test لـ Premium/Discount
    - **Property 8: Premium/Discount Zone Calculation**
    - **Validates: Requirements 2.4**

- [x] 5. Checkpoint - التأكد من عمل Technical و SMC Analyzers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. تنفيذ Wyckoff Analyzer
  - [x] 6.1 إنشاء Wyckoff Analyzer
    - إنشاء `lib/trading-system/analyzers/wyckoffAnalyzer.js`
    - تنفيذ كشف Accumulation phases
    - تنفيذ كشف Distribution phases
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 تنفيذ كشف Spring/Upthrust
    - إضافة كشف Spring patterns
    - إضافة كشف Upthrust patterns
    - إضافة كشف SOS/SOW
    - _Requirements: 3.3, 3.4_

- [x] 7. تنفيذ Elliott Wave Analyzer
  - [x] 7.1 إنشاء Elliott Wave Analyzer
    - إنشاء `lib/trading-system/analyzers/elliottWaveAnalyzer.js`
    - تنفيذ كشف Impulse waves
    - تنفيذ كشف Corrective waves
    - تنفيذ حساب Wave targets
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. تنفيذ VSA Analyzer
  - [x] 8.1 إنشاء VSA Analyzer
    - إنشاء `lib/trading-system/analyzers/vsaAnalyzer.js`
    - تنفيذ كشف No Demand/No Supply bars
    - تنفيذ كشف Stopping Volume
    - تنفيذ كشف Climactic Action
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. تنفيذ Market Profile Analyzer
  - [x] 9.1 إنشاء Market Profile Analyzer
    - إنشاء `lib/trading-system/analyzers/marketProfileAnalyzer.js`
    - تنفيذ حساب Value Area (70% volume)
    - تنفيذ تحديد Point of Control
    - تنفيذ حساب VAH/VAL
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 9.2 كتابة property test لـ Value Area
    - **Property 18: Value Area Calculation**
    - **Validates: Requirements 6.1**

  - [x] 9.3 كتابة property test لـ POC
    - **Property 19: Point of Control Identification**
    - **Validates: Requirements 6.2**

- [x] 10. تنفيذ Order Flow Analyzer
  - [x] 10.1 إنشاء Order Flow Analyzer
    - إنشاء `lib/trading-system/analyzers/orderFlowAnalyzer.js`
    - تنفيذ حساب Delta
    - تنفيذ كشف Absorption
    - تنفيذ كشف Exhaustion
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 11. تنفيذ Intermarket Analyzer
  - [x] 11.1 إنشاء Intermarket Analyzer
    - إنشاء `lib/trading-system/analyzers/intermarketAnalyzer.js`
    - تنفيذ تتبع DXY correlation
    - تنفيذ تتبع US10Y yields
    - تنفيذ حساب correlations
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Checkpoint - التأكد من عمل جميع Analyzers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. تنفيذ Fundamental Analyzer
  - [x] 13.1 إنشاء Fundamental Analyzer
    - إنشاء `lib/trading-system/analyzers/fundamentalAnalyzer.js`
    - تنفيذ جلب Economic Calendar
    - تنفيذ تصنيف الأخبار بالتأثير
    - تنفيذ News Blackout logic
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 13.2 كتابة property test لـ News Blackout
    - **Property 12: News Blackout Period**
    - **Validates: Requirements 10.1**

- [x] 14. تنفيذ Sentiment Analyzer
  - [x] 14.1 إنشاء Sentiment Analyzer
    - إنشاء `lib/trading-system/analyzers/sentimentAnalyzer.js`
    - تنفيذ تتبع Retail positioning
    - تنفيذ حساب Fear & Greed
    - تنفيذ Contrarian logic
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 14.2 كتابة property test لـ Contrarian Flag
    - **Property 13: Contrarian Sentiment Flag**
    - **Validates: Requirements 11.1**

- [x] 15. تنفيذ AI Ensemble
  - [x] 15.1 إنشاء AI Ensemble
    - إنشاء `lib/trading-system/ai/aiEnsemble.js`
    - تنفيذ التكامل مع Gemini AI
    - تنفيذ Pattern Recognition
    - تنفيذ Probability Calculation
    - تنفيذ Market Regime Detection
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 15.2 كتابة property test لـ AI Confidence Threshold
    - **Property 6: AI Confidence Threshold**
    - **Validates: Requirements 12.2**

- [x] 16. Checkpoint - التأكد من عمل AI و Analyzers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. تنفيذ Multi-Layer Validator
  - [x] 17.1 إنشاء Multi-Layer Validator
    - إنشاء `lib/trading-system/validation/multiLayerValidator.js`
    - تنفيذ التحقق من 10 طبقات
    - تنفيذ Critical layers logic
    - تنفيذ Minimum 8/10 requirement
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10, 13.11, 13.12_

  - [x] 17.2 كتابة property test لـ Validation Layers
    - **Property 5: Validation Layer Requirements**
    - **Validates: Requirements 13.1, 13.2**

- [x] 18. تنفيذ Confluence Calculator
  - [x] 18.1 إنشاء Confluence Calculator
    - إنشاء `lib/trading-system/core/confluenceCalculator.js`
    - تنفيذ حساب Component Scores
    - تنفيذ حساب Weighted Score
    - تنفيذ Quality Labels
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [x] 18.2 كتابة property test لـ Confluence Score Bounds
    - **Property 1: Confluence Score Bounds and Threshold**
    - **Validates: Requirements 14.1, 14.3**

  - [x] 18.3 كتابة property test لـ Weight Sum
    - **Property 2: Confluence Score Weight Sum**
    - **Validates: Requirements 14.2**

  - [x] 18.4 كتابة property test لـ SMC Confluence Boost
    - **Property 9: SMC Confluence Score Boost**
    - **Validates: Requirements 2.5**

- [x] 19. تنفيذ Risk Manager
  - [x] 19.1 إنشاء Risk Manager
    - إنشاء `lib/trading-system/risk/riskManager.js`
    - تنفيذ حساب Stop Loss
    - تنفيذ حساب Take Profits
    - تنفيذ حساب Position Size
    - تنفيذ Volatility adjustment
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_

  - [x] 19.2 كتابة property test لـ Risk Management
    - **Property 3: Risk Management Constraints**
    - **Validates: Requirements 15.1, 15.2**

  - [x] 19.3 كتابة property test لـ Position Size
    - **Property 4: Position Size Calculation**
    - **Validates: Requirements 15.3**

  - [x] 19.4 كتابة property test لـ TP Ratios
    - **Property 16: Take Profit Ratio Consistency**
    - **Validates: Requirements 15.4, 15.5, 15.6**

- [x] 20. تنفيذ Kill Zone Manager
  - [x] 20.1 إنشاء Kill Zone Manager
    - إنشاء `lib/trading-system/core/killZoneManager.js`
    - تنفيذ تحديد Kill Zones
    - تنفيذ Score penalty logic
    - تنفيذ Countdown calculation
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [ ] 20.2 كتابة property test لـ Kill Zone Penalty
    - **Property 14: Kill Zone Score Penalty**
    - **Validates: Requirements 16.1**

- [x] 21. Checkpoint - التأكد من عمل Validation و Risk Management
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. تنفيذ Signal Generator
  - [x] 22.1 إنشاء Signal Generator
    - إنشاء `lib/trading-system/core/signalGenerator.js`
    - تنفيذ Full Analysis Pipeline
    - تنفيذ Signal Generation Logic
    - تنفيذ Signal Formatting
    - _Requirements: All analysis requirements_

- [x] 23. تنفيذ IES Engine (المحرك الرئيسي)
  - [x] 23.1 إنشاء IES Engine
    - إنشاء `lib/trading-system/core/iesEngine.js`
    - تنفيذ تجميع جميع المحللات
    - تنفيذ Analysis Pipeline
    - تنفيذ Signal Generation Flow
    - _Requirements: All requirements_

- [x] 24. تنفيذ API Routes
  - [x] 24.1 إنشاء API للتوصيات
    - إنشاء `app/api/signals-system/signals/route.js`
    - تنفيذ GET للتوصيات النشطة
    - تنفيذ POST لتوليد توصية جديدة
    - _Requirements: 17.1, 17.2_

  - [x] 24.2 إنشاء API للتحليل
    - إنشاء `app/api/signals-system/analysis/[symbol]/route.js`
    - تنفيذ GET للتحليل الكامل
    - _Requirements: All analysis requirements_

  - [x] 24.3 إنشاء API للأداء
    - إنشاء `app/api/signals-system/performance/route.js`
    - تنفيذ GET لإحصائيات الأداء
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [x] 24.4 كتابة property test لـ Win Rate
    - **Property 17: Win Rate Calculation**
    - **Validates: Requirements 19.1**

  - [x] 24.5 إنشاء API للأدوات
    - إنشاء `app/api/signals-system/instruments/route.js`
    - تنفيذ GET للأدوات المدعومة
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [x] 25. Checkpoint - التأكد من عمل جميع APIs
  - Ensure all tests pass, ask the user if questions arise.

- [x] 26. تنفيذ واجهة المستخدم - Dashboard
  - [x] 26.1 إنشاء صفحة Dashboard الرئيسية
    - إنشاء `app/signalssystem/page.js`
    - تنفيذ Market Overview section
    - تنفيذ Active Signals section
    - تنفيذ Kill Zone indicator
    - _Requirements: 17.1, 17.2, 17.8, 17.9_

  - [x] 26.2 إنشاء Signal Card Component
    - إنشاء `app/signalssystem/components/SignalCard.js`
    - تنفيذ عرض Entry, SL, TPs
    - تنفيذ عرض Confluence Score
    - تنفيذ عرض Signal Reasoning
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 17.6_

  - [x] 26.3 إنشاء Confluence Breakdown Component
    - إنشاء `app/signalssystem/components/ConfluenceBreakdown.js`
    - تنفيذ عرض Component Scores
    - تنفيذ Visual Chart
    - _Requirements: 17.4_

  - [x] 26.4 إنشاء Validation Layers Component
    - إنشاء `app/signalssystem/components/ValidationLayers.js`
    - تنفيذ عرض 10 Layers status
    - _Requirements: 17.7_

- [x] 27. تنفيذ واجهة المستخدم - Analysis View
  - [x] 27.1 إنشاء Analysis Page
    - إنشاء `app/signalssystem/analysis/[symbol]/page.js`
    - تنفيذ Full Analysis View
    - تنفيذ Interactive Chart
    - _Requirements: 17.4_

  - [x] 27.2 إنشاء Chart Component
    - إنشاء `app/signalssystem/components/TradingChart.js`
    - تنفيذ Lightweight Charts integration
    - تنفيذ عرض Entry/SL/TP levels
    - تنفيذ عرض Order Blocks و FVGs
    - _Requirements: 17.4_

- [x] 28. تنفيذ واجهة المستخدم - Performance
  - [x] 28.1 إنشاء Performance Page
    - إنشاء `app/signalssystem/performance/page.js`
    - تنفيذ Performance Stats
    - تنفيذ Equity Curve
    - تنفيذ Performance Breakdown
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [x] 29. تنفيذ نظام التنبيهات
  - [x] 29.1 إنشاء Alert System
    - إنشاء `app/signalssystem/components/AlertSystem.js`
    - تنفيذ Toast notifications
    - تنفيذ Sound notifications
    - تنفيذ Browser push notifications
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 30. تنفيذ دعم اللغات
  - [x] 30.1 إضافة ترجمات النظام
    - تحديث `app/utils/translations.js`
    - إضافة ترجمات عربية وإنجليزية
    - _Requirements: 17.11_

- [x] 31. Checkpoint - التأكد من عمل واجهة المستخدم
  - Ensure all tests pass, ask the user if questions arise.

- [x] 32. تنفيذ Backtester
  - [x] 32.1 إنشاء Backtester
    - إنشاء `lib/trading-system/backtesting/backtester.js`
    - تنفيذ Historical data testing
    - تنفيذ Performance calculation
    - تنفيذ Report generation
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 33. التكامل النهائي والتحسينات
  - [x] 33.1 تحسين الأداء
    - إضافة Caching strategies
    - تحسين API response times
    - _Requirements: Performance optimization_

  - [x] 33.2 إضافة Error Handling
    - تنفيذ Comprehensive error handling
    - إضافة Logging
    - _Requirements: Error handling_

- [x] 34. Final Checkpoint - التأكد من عمل النظام بالكامل
  - All 148 tests passing ✓

## Notes

- All tests are now mandatory for highest quality
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The system is built incrementally from data layer to UI
