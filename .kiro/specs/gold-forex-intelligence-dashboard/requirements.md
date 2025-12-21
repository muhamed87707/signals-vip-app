# Requirements Document

## Introduction

This document defines the requirements for a comprehensive "Market Command Center" dashboard specifically designed for Gold (XAUUSD) and Forex analysis. The dashboard serves as a "Single Source of Truth" for institutional traders, combining live data, fundamental analysis, institutional forecasts, and AI-powered insights using Google's Gemini model.

## Glossary

- **Dashboard**: The main Market Command Center web page
- **Gemini_AI_Engine**: The Google Gemini API integration that analyzes aggregated market data
- **COT_Analyzer**: The Commitment of Traders report analysis module
- **Bank_Forecasts_Module**: The institutional bank predictions display component
- **Macro_Engine**: The fundamental and macroeconomic analysis engine
- **Sentiment_Analyzer**: The news and sentiment analysis component
- **Correlation_Matrix**: The cross-asset correlation display module
- **Technical_Engine**: The automated technical analysis component
- **Real_Yields**: Calculated value of (Nominal 10Y Yield) - (US Inflation Rate/Breakeven)
- **Bias_Score**: AI-generated market direction indicator (Bullish/Bearish/Neutral)

## Requirements

### Requirement 1: Gemini AI Core Integration

**User Story:** As a trader, I want AI-powered market analysis that runs automatically, so that I receive continuous institutional-grade insights without manual intervention.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Gemini_AI_Engine SHALL connect to Google Gemini API using the provided credentials
2. THE Gemini_AI_Engine SHALL execute analysis every 15 minutes via scheduled task
3. WHEN analysis runs, THE Gemini_AI_Engine SHALL ingest data from COT reports, US 10Y Yields, DXY movement, and geopolitical news
4. THE Gemini_AI_Engine SHALL generate a Bias_Score (Bullish/Bearish/Neutral) with detailed explanation
5. WHEN generating analysis, THE Gemini_AI_Engine SHALL act as a Senior Hedge Fund Strategist persona
6. THE Gemini_AI_Engine SHALL predict the next move for Gold and list top 3 risks
7. THE Gemini_AI_Engine SHALL output analysis in JSON format with fields: bias, summary, risk_factors, key_levels

### Requirement 2: Institutional Bank Forecasts Module

**User Story:** As a trader, I want to see global banks' Gold predictions in one place, so that I can understand institutional consensus.

#### Acceptance Criteria

1. THE Bank_Forecasts_Module SHALL display forecasts from JP Morgan, Goldman Sachs, Citi, Morgan Stanley, UBS, and Commerzbank
2. WHEN displaying forecasts, THE Bank_Forecasts_Module SHALL show Bank Name, Forecast Price, Timeframe (Q1/Q2/Year-End), and Analyst Logic
3. THE Bank_Forecasts_Module SHALL calculate and display the Average Institutional Consensus Price automatically
4. THE Bank_Forecasts_Module SHALL present data using horizontal timeline or smart cards visualization
5. WHEN forecast data is unavailable via API, THE Dashboard SHALL provide an Admin Input panel for manual entry

### Requirement 3: Fundamental & Macroeconomic Engine

**User Story:** As a trader, I want to analyze macroeconomic factors affecting Gold, so that I can make informed fundamental decisions.

#### Acceptance Criteria

1. THE Macro_Engine SHALL display live charts of US02Y, US10Y, and US30Y bond yields
2. THE Macro_Engine SHALL calculate and display correlation coefficient between US10Y and XAUUSD in real-time
3. THE Macro_Engine SHALL display live DXY (Dollar Index) analysis
4. THE Macro_Engine SHALL calculate and display Real_Yields widget using formula: (Nominal 10Y Yield) - (US Inflation Rate/Breakeven)
5. THE Macro_Engine SHALL display live feed of CPI, PPI, and PCE data with "Impact on Gold" tags
6. WHEN data updates, THE Macro_Engine SHALL refresh visualizations automatically

### Requirement 4: COT Report Analyzer

**User Story:** As a trader, I want to visualize Commitment of Traders data, so that I can understand institutional positioning.

#### Acceptance Criteria

1. THE COT_Analyzer SHALL fetch latest CFTC Gold Non-Commercial Net Positions
2. THE COT_Analyzer SHALL display histogram showing Managed Money (Hedge Funds) Longs vs Shorts
3. WHEN Longs reach historic highs, THE COT_Analyzer SHALL display "Overcrowded Trade Alert"
4. THE COT_Analyzer SHALL update data when new COT reports are released

### Requirement 5: News & Sentiment Analysis

**User Story:** As a trader, I want AI-processed news sentiment, so that I can gauge market mood quickly.

#### Acceptance Criteria

1. THE Sentiment_Analyzer SHALL aggregate headlines from Reuters, Bloomberg, and Central Bank statements
2. WHEN headlines are received, THE Sentiment_Analyzer SHALL feed them to Gemini for sentiment scoring (-100 to +100)
3. THE Sentiment_Analyzer SHALL create a Geopolitical Risk Index tracking keywords: War, Sanctions, Tariffs, Recession
4. THE Sentiment_Analyzer SHALL display a "Fear Gauge" specifically for Gold based on the risk index

### Requirement 6: Cross-Asset Correlation Matrix

**User Story:** As a trader, I want to see correlations between Gold and other assets, so that I can identify market relationships.

#### Acceptance Criteria

1. THE Correlation_Matrix SHALL display correlation with Oil (WTI/Brent)
2. THE Correlation_Matrix SHALL display correlation with Silver and Copper
3. THE Correlation_Matrix SHALL display correlation with SPX500 and NASDAQ indices
4. THE Correlation_Matrix SHALL display correlation with USDJPY and AUDUSD currency pairs
5. WHEN correlations change significantly, THE Correlation_Matrix SHALL highlight the change

### Requirement 7: Technical Confluence Analysis

**User Story:** As a trader, I want automated technical analysis, so that I can identify key price levels without manual charting.

#### Acceptance Criteria

1. THE Technical_Engine SHALL identify Key Supply/Demand Zones automatically
2. THE Technical_Engine SHALL display Smart Money Concepts (SMC) markers including Order Blocks and Fair Value Gaps
3. THE Technical_Engine SHALL render analysis on a mini-chart component

### Requirement 8: Scenario Simulator

**User Story:** As a trader, I want to simulate "what-if" scenarios, so that I can understand potential market reactions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a slider tool for scenario simulation
2. WHEN user adjusts "Fed rate cut" slider, THE Gemini_AI_Engine SHALL calculate theoretical Gold price based on historical elasticity
3. THE Dashboard SHALL display simulation results with AI-generated explanation

### Requirement 9: Central Bank Gold Buying Tracker

**User Story:** As a trader, I want to track central bank gold purchases, so that I can monitor this major price driver.

#### Acceptance Criteria

1. THE Dashboard SHALL display a dedicated widget for central bank gold tonnage purchases
2. THE Dashboard SHALL track purchases from PBoC (China), Russia, and Poland
3. WHEN new purchase data is available, THE Dashboard SHALL update the widget automatically

### Requirement 10: Seasonality Analysis

**User Story:** As a trader, I want to see Gold's historical seasonal patterns, so that I can factor timing into my analysis.

#### Acceptance Criteria

1. THE Dashboard SHALL display a heat map showing Gold's average performance by month
2. THE Dashboard SHALL highlight historically strong months (e.g., January)
3. THE Dashboard SHALL calculate seasonality based on historical data

### Requirement 11: User Interface & Experience

**User Story:** As a trader, I want a professional dark-themed interface, so that I can work comfortably during long trading sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL use dark mode with neon/gold accents (Bloomberg Terminal aesthetic)
2. THE Dashboard SHALL be fully responsive across desktop and tablet devices
3. THE Dashboard SHALL provide collapsible modules for customization
4. THE Dashboard SHALL support real-time data updates without page refresh
5. THE Dashboard SHALL use clean typography optimized for data density
6. WHEN modules load, THE Dashboard SHALL display loading states appropriately
