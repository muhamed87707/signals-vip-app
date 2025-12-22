# Implementation Plan: AI Trading Signals System

## Overview

تنفيذ نظام توصيات تداول متقدم يستخدم الذكاء الاصطناعي (Gemini) مع تحليل فني وأساسي شامل. النظام يعمل بشكل مستمر ويولد توصيات عالية الدقة للفوركس والمعادن والمؤشرات.

## Tasks

- [x] 1. إعداد البنية الأساسية والنماذج
  - [x] 1.1 إنشاء نموذج TradingSignal في MongoDB
    - إنشاء `models/TradingSignal.js` مع جميع الحقول المطلوبة
    - إضافة الفهارس للأداء
    - _Requirements: 8.1_
  - [x] 1.2 إنشاء نموذج SignalPerformance
    - إنشاء `models/SignalPerformance.js` لتتبع الأداء
    - _Requirements: 8.2_
  - [x] 1.3 إنشاء نموذج UserSettings للتداول
    - إنشاء `models/TradingSettings.js` لإعدادات المستخدم (رأس المال، نسبة المخاطرة)
    - _Requirements: 5.1_

- [x] 2. تطوير محرك التحليل الفني
  - [x] 2.1 إنشاء TechnicalAnalyzer الأساسي
    - إنشاء `lib/trading/TechnicalAnalyzer.js`
    - تنفيذ حساب المتوسطات المتحركة (EMA 9, 21, 50, 100, 200)
    - _Requirements: 1.3_
  - [x] 2.2 تنفيذ مؤشرات الزخم
    - RSI مع كشف الانحرافات
    - MACD مع تحليل الهيستوجرام
    - Stochastic Oscillator
    - _Requirements: 1.3, 21.1_
  - [x] 2.3 تنفيذ مؤشرات التقلب والاتجاه
    - Bollinger Bands مع كشف الضغط
    - ATR للتقلب
    - ADX لقوة الاتجاه
    - _Requirements: 1.3, 41.1_
  - [x] 2.4 تنفيذ Ichimoku Cloud
    - حساب جميع خطوط Ichimoku
    - تحديد إشارات الشراء والبيع
    - _Requirements: 1.3_
  - [ ]* 2.5 كتابة اختبارات للمؤشرات الفنية
    - **Property 1: Indicator Bounds**
    - **Validates: Requirements 1.3**

- [x] 3. تطوير كاشف الأنماط
  - [x] 3.1 كشف أنماط الشموع
    - إنشاء `lib/trading/PatternDetector.js`
    - تنفيذ كشف 40+ نمط شموع
    - _Requirements: 40.1, 40.2_
  - [x] 3.2 كشف أنماط الرسم البياني
    - Head and Shoulders, Double Top/Bottom
    - Triangles, Wedges, Flags
    - _Requirements: 1.5_
  - [x] 3.3 كشف الأنماط الهارمونيك
    - Gartley, Butterfly, Bat, Crab
    - حساب نسب Fibonacci
    - _Requirements: 1.5_
  - [ ]* 3.4 كتابة اختبارات لكشف الأنماط
    - **Property 2: Pattern Detection Accuracy**
    - **Validates: Requirements 1.5, 40.1**

- [x] 4. تطوير تحليل Smart Money Concepts
  - [x] 4.1 كشف Order Blocks
    - تحديد مناطق الطلب والعرض المؤسسية
    - _Requirements: 2.3_
  - [x] 4.2 كشف Fair Value Gaps
    - تحديد الفجوات السعرية
    - _Requirements: 2.2_
  - [x] 4.3 كشف Break of Structure و Change of Character
    - تحليل هيكل السوق
    - _Requirements: 2.2_
  - [x] 4.4 تحديد Liquidity Pools
    - كشف مناطق السيولة وصيد الوقف
    - _Requirements: 2.2_

- [x] 5. تطوير محلل الأطر الزمنية المتعددة
  - [x] 5.1 إنشاء MultiTimeframeAnalyzer
    - إنشاء `lib/trading/MultiTimeframeAnalyzer.js`
    - تحليل 6 أطر زمنية متزامنة
    - _Requirements: 1.1, 1.4_
  - [x] 5.2 حساب توافق الأطر الزمنية
    - تحديد الاتجاه على كل إطار
    - حساب درجة التوافق
    - _Requirements: 1.4_
  - [ ]* 5.3 كتابة اختبارات التوافق
    - **Property 5: Multi-Timeframe Alignment**
    - **Validates: Requirements 1.4**

- [ ] 6. Checkpoint - التحقق من التحليل الفني
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. تطوير محلل التحليل الأساسي
  - [x] 7.1 إنشاء FundamentalAnalyzer
    - إنشاء `lib/trading/FundamentalAnalyzer.js`
    - _Requirements: 3.1_
  - [x] 7.2 تكامل بيانات COT
    - جلب وتحليل تقرير COT
    - _Requirements: 3.1_
  - [x] 7.3 تكامل التقويم الاقتصادي
    - جلب الأحداث القادمة
    - تقييم التأثير
    - _Requirements: 3.2_
  - [x] 7.4 حساب قوة العملات
    - إنشاء Currency Strength Meter
    - _Requirements: 43.1_

- [x] 8. تطوير محلل المشاعر
  - [x] 8.1 إنشاء SentimentAnalyzer
    - إنشاء `lib/trading/SentimentAnalyzer.js`
    - _Requirements: 16.1_
  - [x] 8.2 تحليل مواقف المتداولين
    - نسبة Long vs Short
    - _Requirements: 16.1_
  - [x] 8.3 تحليل مشاعر الأخبار
    - استخدام Gemini لتحليل الأخبار
    - _Requirements: 16.1_

- [x] 9. تطوير محلل الحجم والسيولة
  - [x] 9.1 إنشاء VolumeAnalyzer
    - إنشاء `lib/trading/VolumeAnalyzer.js`
    - _Requirements: 17.1_
  - [x] 9.2 حساب Volume Profile
    - Point of Control, Value Area
    - _Requirements: 17.1, 34.1_
  - [x] 9.3 حساب VWAP ومؤشرات الحجم
    - OBV, MFI, Chaikin Money Flow
    - _Requirements: 17.1_

- [x] 10. تطوير كاشف Confluence
  - [x] 10.1 إنشاء ConfluenceDetector
    - إنشاء `lib/trading/ConfluenceDetector.js`
    - _Requirements: 6.1_
  - [x] 10.2 تنفيذ حساب الدرجة المرجحة
    - تطبيق الأوزان على كل عامل
    - _Requirements: 6.1_
  - [x] 10.3 تنفيذ تصنيف الدرجات
    - A+ (80-100%), A (70-79%), No Signal (<70%)
    - _Requirements: 6.2, 6.3, 6.4_
  - [ ]* 10.4 كتابة اختبارات Confluence
    - **Property 3: Signal Grade Consistency**
    - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ] 11. Checkpoint - التحقق من المحللات
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. تطوير AI Predictor مع Gemini
  - [x] 12.1 إنشاء AIPredictor
    - إنشاء `lib/trading/AIPredictor.js`
    - _Requirements: 4.1_
  - [x] 12.2 بناء Prompt المتقدم
    - تضمين جميع بيانات التحليل
    - طلب الرد بتنسيق JSON
    - _Requirements: 4.2_
  - [x] 12.3 تنفيذ توليد التوصيات
    - Entry, SL, TP1, TP2, TP3
    - Confidence score
    - _Requirements: 4.2_
  - [x] 12.4 تنفيذ التفسير ثنائي اللغة
    - شرح بالعربية والإنجليزية
    - _Requirements: 50.1, 50.2_
  - [ ]* 12.5 كتابة اختبارات AI Predictor
    - **Property 10: AI Reasoning Completeness**
    - **Validates: Requirements 50.1, 50.2**

- [x] 13. تطوير مدير المخاطر
  - [x] 13.1 إنشاء RiskManager
    - إنشاء `lib/trading/RiskManager.js`
    - _Requirements: 5.1_
  - [x] 13.2 حساب حجم الصفقة
    - بناءً على رأس المال ونسبة المخاطرة
    - _Requirements: 5.1_
  - [x] 13.3 التحقق من نسبة R:R
    - ضمان حد أدنى 1:2
    - _Requirements: 5.2_
  - [x] 13.4 تتبع السحب اليومي
    - إيقاف التوصيات عند تجاوز 3%
    - _Requirements: 5.4_
  - [ ]* 13.5 كتابة اختبارات إدارة المخاطر
    - **Property 2: Risk/Reward Minimum**
    - **Property 4: Position Size Safety**
    - **Validates: Requirements 5.1, 5.2, 5.4**

- [x] 14. تطوير ماسح السوق
  - [x] 14.1 إنشاء MarketScanner
    - إنشاء `lib/trading/MarketScanner.js`
    - _Requirements: 7.1_
  - [x] 14.2 تنفيذ المسح الدوري
    - فحص جميع الأصول كل 5 دقائق
    - _Requirements: 7.3_
  - [x] 14.3 تحديد الفرص المحتملة
    - تصفية الأصول ذات الإمكانية العالية
    - _Requirements: 7.2_

- [ ] 15. Checkpoint - التحقق من المحرك الأساسي
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. تطوير Signal Engine الرئيسي
  - [x] 16.1 إنشاء SignalEngine
    - إنشاء `lib/trading/SignalEngine.js`
    - تجميع جميع المحللات
    - _Requirements: 4.1, 6.1_
  - [x] 16.2 تنفيذ خط أنابيب التوليد
    - Scan → Analyze → Confluence → AI → Risk → Signal
    - _Requirements: 4.1_
  - [x] 16.3 تنفيذ التحقق من صحة البيانات
    - التأكد من حداثة البيانات
    - _Requirements: 13.4_
  - [ ]* 16.4 كتابة اختبارات Signal Engine
    - **Property 8: No Signal Below Threshold**
    - **Property 9: Data Freshness**
    - **Validates: Requirements 6.4, 13.4**

- [x] 17. تطوير APIs للتوصيات
  - [x] 17.1 إنشاء API المسح
    - `app/api/trading/scan/route.js`
    - _Requirements: 7.1_
  - [x] 17.2 إنشاء API التحليل
    - `app/api/trading/analyze/route.js`
    - _Requirements: 4.1_
  - [x] 17.3 إنشاء API توليد التوصيات
    - `app/api/trading/generate-signal/route.js`
    - _Requirements: 4.2_
  - [x] 17.4 إنشاء API إدارة التوصيات
    - `app/api/trading/signals/route.js` (GET, POST)
    - `app/api/trading/signals/[id]/route.js` (GET, PATCH, DELETE)
    - _Requirements: 8.1_
  - [x] 17.5 إنشاء API التوصيات النشطة
    - `app/api/trading/signals/active/route.js`
    - _Requirements: 8.1_

- [x] 18. تطوير APIs البيانات
  - [x] 18.1 إنشاء API الأسعار
    - `app/api/trading/price/[symbol]/route.js`
    - _Requirements: 13.1_
  - [x] 18.2 إنشاء API المؤشرات
    - `app/api/trading/indicators/route.js`
    - _Requirements: 1.3_
  - [x] 18.3 إنشاء API المستويات
    - `app/api/trading/levels/route.js`
    - _Requirements: 1.2_
  - [x] 18.4 إنشاء API الأداء
    - `app/api/trading/performance/route.js`
    - _Requirements: 8.2_

- [ ] 19. Checkpoint - التحقق من APIs
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. تطوير صفحة التوصيات الرئيسية
  - [x] 20.1 إنشاء صفحة trading-signals
    - `app/signals/page.js`
    - _Requirements: 12.1_
  - [x] 20.2 تنفيذ التخطيط الأساسي
    - Header, Navigation, Main Content
    - _Requirements: 12.4, 12.5_

- [x] 21. تطوير مكون SignalCard
  - [x] 21.1 إنشاء SignalCard
    - `app/signals/components/SignalCard.js`
    - _Requirements: 12.2_
  - [x] 21.2 عرض مستويات الأسعار
    - Entry, SL, TP1, TP2, TP3
    - _Requirements: 12.2_
  - [x] 21.3 عرض تحليل Confluence
    - شريط التقدم لكل عامل
    - _Requirements: 12.2_
  - [x] 21.4 عرض تحليل AI
    - الشرح والمخاطر والإبطال
    - _Requirements: 12.2_
  - [x] 21.5 عرض P/L الحالي
    - للتوصيات النشطة
    - _Requirements: 12.6_

- [x] 22. تطوير مكون ActiveSignals
  - [x] 22.1 إنشاء ActiveSignals
    - `app/signals/components/ActiveSignals.js`
    - _Requirements: 12.1_
  - [x] 22.2 عرض قائمة التوصيات النشطة
    - مع التحديث التلقائي
    - _Requirements: 12.6_

- [x] 23. تطوير مكون PerformanceStats
  - [x] 23.1 إنشاء PerformanceStats
    - `app/signals/components/PerformanceStats.js`
    - _Requirements: 8.2_
  - [x] 23.2 عرض الإحصائيات الرئيسية
    - Win Rate, Total Pips, Profit Factor
    - _Requirements: 8.2_
  - [x] 23.3 عرض الرسوم البيانية
    - Equity Curve, Win/Loss distribution
    - _Requirements: 8.2_

- [x] 24. تطوير مكون WatchList
  - [x] 24.1 إنشاء WatchList
    - `app/signals/components/WatchList.js`
    - _Requirements: 7.2_
  - [x] 24.2 عرض الفرص المحتملة
    - مع سبب المراقبة
    - _Requirements: 7.2_

- [x] 25. تطوير مكون RiskCalculator
  - [x] 25.1 إنشاء RiskCalculator
    - `app/signals/components/RiskCalculator.js`
    - _Requirements: 5.5_
  - [x] 25.2 حساب حجم الصفقة
    - إدخال رأس المال ونسبة المخاطرة
    - _Requirements: 5.5_
  - [x] 25.3 عرض النتائج
    - Lot size, Risk amount, Potential profit
    - _Requirements: 5.5_

- [x] 26. تطوير مكون MarketScanner UI
  - [x] 26.1 إنشاء MarketScannerCard
    - `app/signals/components/MarketScannerCard.js`
    - _Requirements: 7.5_
  - [x] 26.2 عرض Heat Map
    - خريطة حرارية للفرص
    - _Requirements: 7.5_

- [ ] 27. Checkpoint - التحقق من الواجهة
  - Ensure all tests pass, ask the user if questions arise.

- [x] 28. تطوير نظام التنبيهات
  - [x] 28.1 إنشاء AlertsSystem
    - `app/signals/components/SignalAlerts.js`
    - _Requirements: 10.1_
  - [x] 28.2 تنبيهات التوصيات الجديدة
    - صوت + إشعار مرئي
    - _Requirements: 10.2_
  - [x] 28.3 تنبيهات الوصول للأهداف
    - عند ضرب TP أو SL
    - _Requirements: 10.3_

- [x] 29. تطوير تتبع الأداء
  - [x] 29.1 إنشاء PerformanceTracker
    - `lib/trading/PerformanceTracker.js`
    - _Requirements: 8.1_
  - [x] 29.2 حساب الإحصائيات
    - Win rate, Profit factor, Sharpe ratio
    - _Requirements: 8.2_
  - [x] 29.3 تحديث الأداء تلقائياً
    - عند إغلاق كل صفقة
    - _Requirements: 8.1_

- [x] 30. تطوير مكونات إضافية
  - [x] 30.1 إنشاء SignalHistory
    - `app/signals/components/SignalHistory.js`
    - _Requirements: 8.3_
  - [x] 30.2 إنشاء SettingsPanel
    - `app/signals/components/SettingsPanel.js`
    - _Requirements: 10.5_
  - [x] 30.3 إنشاء index.js للتصدير
    - `app/signals/components/index.js`

- [x] 31. تكامل الصفحة الكاملة
  - [x] 31.1 ربط جميع المكونات
    - في صفحة trading-signals
    - _Requirements: 12.1_
  - [x] 31.2 تنفيذ التحديث التلقائي
    - كل 30 ثانية
    - _Requirements: 12.6_
  - [x] 31.3 تنفيذ الدعم ثنائي اللغة
    - العربية والإنجليزية
    - _Requirements: 12.3_

- [ ] 32. Checkpoint - التحقق من التكامل
  - Ensure all tests pass, ask the user if questions arise.

- [x] 33. تحسينات الأداء والأمان
  - [x] 33.1 تنفيذ التخزين المؤقت
    - للبيانات المتكررة
    - `lib/trading/cache.js`
    - _Requirements: 13.1_
  - [x] 33.2 تنفيذ معالجة الأخطاء
    - Fallback عند فشل API
    - `lib/trading/errorHandler.js`
    - _Requirements: 13.2_
  - [x] 33.3 تنفيذ Rate Limiting
    - لحماية APIs
    - `lib/trading/rateLimiter.js`
    - _Requirements: 13.1_

- [x] 34. إضافة رابط في الصفحة الرئيسية
  - [x] 34.1 إضافة رابط Trading Signals
    - في القائمة الرئيسية
  - [x] 34.2 إضافة بطاقة في الصفحة الرئيسية
    - مع ملخص الأداء
    - `app/components/SignalsSummaryCard.js`

- [ ] 35. Final Checkpoint - الاختبار النهائي
  - Ensure all tests pass, ask the user if questions arise.
  - التحقق من عمل جميع الميزات
  - اختبار على أجهزة مختلفة

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- النظام يستخدم Gemini API Key الموجود في المشروع
- التصميم يتبع نفس نمط التصميم الحالي (Dark theme with gold accents)
