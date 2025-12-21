# Implementation Plan: Gold & Forex Intelligence Dashboard

## Overview

This implementation plan breaks down the Market Command Center dashboard into discrete, incremental coding tasks. Each task builds on previous work, ensuring no orphaned code. The project uses Next.js with the existing App Router structure, integrating with MongoDB and external APIs.

## Tasks

- [ ] 1. Set up project foundation and core utilities
  - [x] 1.1 Create dashboard directory structure and base layout
    - Create `app/dashboard/` directory with `page.js` and `layout.js`
    - Set up dark theme CSS variables in globals.css
    - Create base dashboard layout with sidebar and main content area
    - _Requirements: 11.1, 11.2_

  - [x] 1.2 Create shared UI components for dashboard modules
    - Create `app/dashboard/components/ModuleCard.jsx` - collapsible card wrapper
    - Create `app/dashboard/components/LoadingState.jsx` - loading indicator
    - Create `app/dashboard/components/BiasIndicator.jsx` - bullish/bearish/neutral display
    - Create `app/dashboard/components/DataBadge.jsx` - status badges
    - _Requirements: 11.3, 11.6_

  - [x] 1.3 Write property tests for module collapse toggle
    - **Property 19: Module Collapse Toggle**
    - **Validates: Requirements 11.3**

- [ ] 2. Implement Gemini AI Service integration
  - [x] 2.1 Create Gemini AI service and API routes
    - Create `lib/gemini.js` - Gemini API client with configuration
    - Create `app/api/dashboard/ai/analyze/route.js` - trigger analysis endpoint
    - Create `app/api/dashboard/ai/latest/route.js` - get latest analysis endpoint
    - Create `app/api/dashboard/ai/sentiment/route.js` - sentiment scoring endpoint
    - Implement prompt templates for market analysis
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Write property tests for AI output structure
    - **Property 1: AI Output Structure Validation**
    - **Validates: Requirements 1.4, 1.6, 1.7**

  - [x] 2.3 Create AI Analysis Panel component
    - Create `app/dashboard/components/AIAnalysisPanel.jsx`
    - Display bias indicator, summary, risk factors, and key levels
    - Add auto-refresh every 15 minutes
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 3. Checkpoint - Verify AI integration
  - Ensure AI service connects and returns valid responses
  - Ensure all tests pass, ask the user if questions arise

- [ ] 4. Implement Market Data Services
  - [x] 4.1 Create market data fetching utilities
    - Create `lib/marketData.js` - AlphaVantage API client
    - Create `lib/fredApi.js` - FRED API client for economic data
    - Implement caching layer for API responses
    - _Requirements: 3.1, 3.3_

  - [x] 4.2 Create market data API routes
    - Create `app/api/dashboard/market/yields/route.js` - bond yields endpoint
    - Create `app/api/dashboard/market/dxy/route.js` - DXY data endpoint
    - Create `app/api/dashboard/market/gold/route.js` - Gold price endpoint
    - Create `app/api/dashboard/market/correlation/route.js` - correlation matrix endpoint
    - _Requirements: 3.1, 3.2, 3.3, 6.1-6.5_

  - [x] 4.3 Write property tests for correlation coefficient
    - **Property 5: Correlation Coefficient Validity**
    - **Validates: Requirements 3.2**

- [ ] 5. Implement Macro Engine Module
  - [x] 5.1 Create yield calculation utilities
    - Create `lib/calculations/yields.js` - real yield calculation
    - Create `lib/calculations/correlation.js` - correlation coefficient calculation
    - _Requirements: 3.2, 3.4_

  - [x] 5.2 Write property tests for real yield calculation
    - **Property 6: Real Yield Calculation**
    - **Validates: Requirements 3.4**

  - [x] 5.3 Create Macro Engine UI components
    - Create `app/dashboard/components/MacroEngine/YieldCharts.jsx` - bond yield charts
    - Create `app/dashboard/components/MacroEngine/RealYieldWidget.jsx` - real yield display
    - Create `app/dashboard/components/MacroEngine/DXYChart.jsx` - dollar index chart
    - Create `app/dashboard/components/MacroEngine/InflationFeed.jsx` - CPI/PPI/PCE feed
    - Create `app/dashboard/components/MacroEngine/index.jsx` - main container
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [x] 5.4 Write property tests for inflation impact tagging
    - **Property 7: Inflation Impact Tagging**
    - **Validates: Requirements 3.5**

- [x] 6. Checkpoint - Verify Macro Engine
  - Ensure yield charts render with real data
  - Ensure calculations are correct
  - Ensure all tests pass, ask the user if questions arise

- [ ] 7. Implement Bank Forecasts Module
  - [x] 7.1 Create Bank Forecasts data model and API
    - Create `models/BankForecast.js` - MongoDB model
    - Create `app/api/dashboard/forecasts/list/route.js` - list forecasts
    - Create `app/api/dashboard/forecasts/create/route.js` - create forecast (admin)
    - Create `app/api/dashboard/forecasts/[id]/route.js` - update/delete forecast
    - Implement consensus price calculation
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 7.2 Write property tests for consensus price calculation
    - **Property 3: Consensus Price Calculation**
    - **Validates: Requirements 2.3**

  - [x] 7.3 Create Bank Forecasts UI components
    - Create `app/dashboard/components/BankForecasts/ForecastCard.jsx` - individual bank card
    - Create `app/dashboard/components/BankForecasts/ConsensusDisplay.jsx` - average price
    - Create `app/dashboard/components/BankForecasts/Timeline.jsx` - horizontal timeline
    - Create `app/dashboard/components/BankForecasts/index.jsx` - main container
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 7.4 Write property tests for forecast display completeness
    - **Property 4: Bank Forecast Display Completeness**
    - **Validates: Requirements 2.2**

- [ ] 8. Implement COT Analyzer Module
  - [x] 8.1 Create COT data service and API
    - Create `lib/cotData.js` - CFTC data fetching
    - Create `app/api/dashboard/cot/latest/route.js` - latest COT data endpoint
    - Implement historic high/low tracking
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 8.2 Create COT Analyzer UI components
    - Create `app/dashboard/components/COTAnalyzer/Histogram.jsx` - longs vs shorts chart
    - Create `app/dashboard/components/COTAnalyzer/AlertBanner.jsx` - overcrowded alert
    - Create `app/dashboard/components/COTAnalyzer/index.jsx` - main container
    - _Requirements: 4.2, 4.3_

  - [x] 8.3 Write property tests for COT histogram accuracy
    - **Property 8: COT Histogram Data Accuracy**
    - **Validates: Requirements 4.2**

  - [x] 8.4 Write property tests for overcrowded alert generation
    - **Property 9: COT Overcrowded Alert Generation**
    - **Validates: Requirements 4.3**

- [x] 9. Checkpoint - Verify COT and Bank Forecasts
  - Ensure COT data displays correctly
  - Ensure bank forecasts render with consensus
  - Ensure all tests pass, ask the user if questions arise

- [ ] 10. Implement Sentiment Analysis Module
  - [x] 10.1 Create news aggregation service
    - Create `lib/newsAggregator.js` - RSS feed aggregation
    - Create `app/api/dashboard/news/aggregate/route.js` - aggregated news endpoint
    - Implement source filtering (Reuters, Bloomberg, Central Banks)
    - _Requirements: 5.1_

  - [x] 10.2 Write property tests for news source aggregation
    - **Property 10: News Source Aggregation**
    - **Validates: Requirements 5.1**

  - [x] 10.3 Create sentiment scoring integration
    - Extend `lib/gemini.js` with sentiment scoring function
    - Create geopolitical risk index calculation in `lib/calculations/riskIndex.js`
    - _Requirements: 5.2, 5.3_

  - [x] 10.4 Write property tests for sentiment score range
    - **Property 11: Sentiment Score Range**
    - **Validates: Requirements 5.2**

  - [x] 10.5 Write property tests for geopolitical risk index
    - **Property 12: Geopolitical Risk Index Completeness**
    - **Validates: Requirements 5.3, 5.4**

  - [x] 10.6 Create Sentiment Panel UI components
    - Create `app/dashboard/components/SentimentPanel/NewsFeed.jsx` - scrolling headlines
    - Create `app/dashboard/components/SentimentPanel/FearGauge.jsx` - visual gauge
    - Create `app/dashboard/components/SentimentPanel/RiskIndex.jsx` - keyword breakdown
    - Create `app/dashboard/components/SentimentPanel/index.jsx` - main container
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Implement Correlation Matrix Module
  - [x] 11.1 Create correlation calculation service
    - Extend `lib/calculations/correlation.js` with multi-asset support
    - Create `app/api/dashboard/market/correlation/route.js` - full matrix endpoint
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 11.2 Create Correlation Matrix UI component
    - Create `app/dashboard/components/CorrelationMatrix/MatrixGrid.jsx` - heat map grid
    - Create `app/dashboard/components/CorrelationMatrix/index.jsx` - main container
    - Implement change highlighting
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 11.3 Write property tests for correlation change highlighting
    - **Property 13: Correlation Change Highlighting**
    - **Validates: Requirements 6.5**

- [x] 12. Checkpoint - Verify Sentiment and Correlation
  - Ensure news feeds aggregate correctly
  - Ensure sentiment scores display
  - Ensure correlation matrix renders
  - Ensure all tests pass, ask the user if questions arise

- [ ] 13. Implement Technical Analysis Module
  - [x] 13.1 Create technical analysis service
    - Create `lib/technicalAnalysis.js` - supply/demand zone detection
    - Create `lib/smcAnalysis.js` - Order Blocks and FVG detection
    - Create `app/api/dashboard/technical/levels/route.js` - technical levels endpoint
    - _Requirements: 7.1, 7.2_

  - [x] 13.2 Write property tests for technical level validity
    - **Property 14: Technical Level Validity**
    - **Validates: Requirements 7.1**

  - [x] 13.3 Write property tests for SMC marker validity
    - **Property 15: SMC Marker Validity**
    - **Validates: Requirements 7.2**

  - [x] 13.4 Create Technical Chart UI component
    - Create `app/dashboard/components/TechnicalChart/MiniChart.jsx` - price chart with levels
    - Create `app/dashboard/components/TechnicalChart/LevelMarkers.jsx` - S/D zone markers
    - Create `app/dashboard/components/TechnicalChart/SMCMarkers.jsx` - OB/FVG markers
    - Create `app/dashboard/components/TechnicalChart/index.jsx` - main container
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14. Implement Scenario Simulator
  - [x] 14.1 Create scenario simulation service
    - Create `lib/scenarioSimulator.js` - historical elasticity calculations
    - Create `app/api/dashboard/simulator/scenario/route.js` - simulation endpoint
    - Integrate with Gemini for explanations
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 14.2 Write property tests for scenario simulation output
    - **Property 16: Scenario Simulation Output**
    - **Validates: Requirements 8.2, 8.3**

  - [x] 14.3 Create Scenario Simulator UI component
    - Create `app/dashboard/components/ScenarioSimulator/Slider.jsx` - rate adjustment slider
    - Create `app/dashboard/components/ScenarioSimulator/ResultDisplay.jsx` - price projection
    - Create `app/dashboard/components/ScenarioSimulator/index.jsx` - main container
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 15. Checkpoint - Verify Technical and Simulator
  - Ensure technical levels display on chart
  - Ensure scenario simulator calculates correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 16. Implement Central Bank Tracker
  - [x] 16.1 Create central bank data service and API
    - Create `lib/centralBankData.js` - gold purchase data fetching
    - Create `app/api/dashboard/central-banks/purchases/route.js` - purchases endpoint
    - _Requirements: 9.1, 9.2_

  - [x] 16.2 Write property tests for central bank data coverage
    - **Property 17: Central Bank Data Coverage**
    - **Validates: Requirements 9.2**

  - [x] 16.3 Create Central Bank Tracker UI component
    - Create `app/dashboard/components/CentralBankTracker/PurchaseChart.jsx` - tonnage chart
    - Create `app/dashboard/components/CentralBankTracker/CountryBreakdown.jsx` - by country
    - Create `app/dashboard/components/CentralBankTracker/index.jsx` - main container
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 17. Implement Seasonality Module
  - [x] 17.1 Create seasonality calculation service
    - Create `lib/calculations/seasonality.js` - monthly performance calculation
    - Implement historical data analysis
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 17.2 Write property tests for seasonality data completeness
    - **Property 18: Seasonality Data Completeness**
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [x] 17.3 Create Seasonality Heatmap UI component
    - Create `app/dashboard/components/Seasonality/Heatmap.jsx` - monthly heat map
    - Create `app/dashboard/components/Seasonality/index.jsx` - main container
    - _Requirements: 10.1, 10.2_

- [ ] 18. Implement Real-time Updates
  - [x] 18.1 Create Server-Sent Events infrastructure
    - Create `app/api/dashboard/stream/route.js` - SSE endpoint
    - Implement event types for price updates, AI updates, alerts
    - _Requirements: 11.4_

  - [x] 18.2 Create client-side real-time hook
    - Create `app/dashboard/hooks/useDashboardStream.js` - SSE consumer hook
    - Integrate with dashboard state management
    - _Requirements: 11.4_

- [ ] 19. Implement Cron Jobs for Scheduled Tasks
  - [x] 19.1 Create cron job handlers
    - Create `app/api/cron/ai-analysis/route.js` - 15-minute AI analysis
    - Create `app/api/cron/market-data/route.js` - 5-minute market data refresh
    - Create `app/api/cron/news-aggregation/route.js` - 10-minute news refresh
    - Configure Vercel cron or alternative scheduler
    - _Requirements: 1.2_

  - [x] 19.2 Write property tests for market context completeness
    - **Property 2: Market Context Completeness**
    - **Validates: Requirements 1.3**

- [ ] 20. Final Integration and Polish
  - [x] 20.1 Assemble main dashboard page
    - Wire all modules into `app/dashboard/page.js`
    - Implement module ordering and visibility settings
    - Add responsive grid layout
    - _Requirements: 11.2, 11.3_

  - [x] 20.2 Implement error handling and loading states
    - Add error boundaries to each module
    - Implement graceful degradation
    - Add loading skeletons
    - _Requirements: 11.6_

  - [x] 20.3 Write property tests for loading state display
    - **Property 20: Loading State Display**
    - **Validates: Requirements 11.6**

- [x] 21. Final Checkpoint - Complete System Verification
  - Verify all modules render and function correctly
  - Verify real-time updates work
  - Verify AI analysis runs on schedule
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The project uses existing Next.js App Router structure
- MongoDB connection already configured in `lib/mongodb.js`
