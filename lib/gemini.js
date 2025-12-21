/**
 * Gemini AI Service for Market Analysis
 * Feature: gold-forex-intelligence-dashboard
 * Requirements: 1.1, 1.4, 1.5, 1.6, 1.7
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
const MODEL_CONFIG = {
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
};

// System prompt for market analysis
const MARKET_ANALYSIS_PROMPT = `You are a Senior Hedge Fund Strategist and Chief Investment Officer specializing in Gold (XAUUSD) and Forex markets. 

Analyze the provided market data and provide institutional-grade insights.

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format:
{
  "bias": "Bullish" | "Bearish" | "Neutral",
  "summary": "Your detailed market analysis summary",
  "risk_factors": ["Risk 1", "Risk 2", "Risk 3"],
  "key_levels": {
    "support": [number, number],
    "resistance": [number, number]
  },
  "confidence": 0.0-1.0
}

Do not include any text outside the JSON object.`;

// Sentiment scoring prompt
const SENTIMENT_PROMPT = `You are a financial sentiment analyst. Analyze the following news headlines and provide a sentiment score.

IMPORTANT: Respond with ONLY valid JSON in this exact format:
{
  "score": -100 to +100 (negative = bearish, positive = bullish),
  "breakdown": {
    "positive": count of positive headlines,
    "negative": count of negative headlines,
    "neutral": count of neutral headlines
  }
}

Do not include any text outside the JSON object.`;

/**
 * Analyze market data using Gemini AI
 * @param {Object} context - Market context data
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeMarket(context) {
  try {
    const model = genAI.getGenerativeModel(MODEL_CONFIG);
    
    const contextString = formatMarketContext(context);
    const prompt = `${MARKET_ANALYSIS_PROMPT}\n\nMarket Data:\n${contextString}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const analysis = parseJSONResponse(text);
    
    // Validate and return
    return validateAnalysis(analysis);
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Score sentiment of news headlines
 * @param {string[]} headlines - Array of news headlines
 * @returns {Promise<Object>} Sentiment score result
 */
export async function scoreSentiment(headlines) {
  try {
    const model = genAI.getGenerativeModel(MODEL_CONFIG);
    
    const headlinesText = headlines.map((h, i) => `${i + 1}. ${h}`).join('\n');
    const prompt = `${SENTIMENT_PROMPT}\n\nHeadlines:\n${headlinesText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const sentiment = parseJSONResponse(text);
    
    // Validate score range
    if (sentiment.score < -100 || sentiment.score > 100) {
      sentiment.score = Math.max(-100, Math.min(100, sentiment.score));
    }
    
    return sentiment;
  } catch (error) {
    console.error('Sentiment scoring error:', error);
    throw new Error(`Sentiment analysis failed: ${error.message}`);
  }
}

/**
 * Format market context for AI prompt
 */
function formatMarketContext(context) {
  const parts = [];
  
  if (context.cotData) {
    parts.push(`COT Data:
- Net Position: ${context.cotData.netPosition}
- Managed Money Long: ${context.cotData.managedMoneyLong}
- Managed Money Short: ${context.cotData.managedMoneyShort}`);
  }
  
  if (context.yields) {
    parts.push(`Bond Yields:
- US 2Y: ${context.yields.us02y}%
- US 10Y: ${context.yields.us10y}%
- US 30Y: ${context.yields.us30y}%`);
  }
  
  if (context.dxyMovement !== undefined) {
    parts.push(`DXY Movement: ${context.dxyMovement > 0 ? '+' : ''}${context.dxyMovement}%`);
  }
  
  if (context.news && context.news.length > 0) {
    const newsText = context.news.slice(0, 5).map(n => `- ${n.headline}`).join('\n');
    parts.push(`Recent News:\n${newsText}`);
  }
  
  if (context.bankForecasts && context.bankForecasts.length > 0) {
    const forecastText = context.bankForecasts
      .map(f => `- ${f.bankName}: $${f.forecastPrice} (${f.timeframe})`)
      .join('\n');
    parts.push(`Bank Forecasts:\n${forecastText}`);
  }
  
  return parts.join('\n\n');
}

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
function parseJSONResponse(text) {
  // Remove markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }
  
  return JSON.parse(cleanText.trim());
}

/**
 * Validate AI analysis output structure
 */
function validateAnalysis(analysis) {
  const validBias = ['Bullish', 'Bearish', 'Neutral'];
  
  if (!validBias.includes(analysis.bias)) {
    analysis.bias = 'Neutral';
  }
  
  if (!analysis.summary || typeof analysis.summary !== 'string') {
    analysis.summary = 'Analysis unavailable';
  }
  
  if (!Array.isArray(analysis.risk_factors)) {
    analysis.risk_factors = [];
  }
  // Ensure exactly 3 risk factors
  while (analysis.risk_factors.length < 3) {
    analysis.risk_factors.push('Risk factor unavailable');
  }
  analysis.risk_factors = analysis.risk_factors.slice(0, 3);
  
  if (!analysis.key_levels) {
    analysis.key_levels = { support: [], resistance: [] };
  }
  if (!Array.isArray(analysis.key_levels.support)) {
    analysis.key_levels.support = [];
  }
  if (!Array.isArray(analysis.key_levels.resistance)) {
    analysis.key_levels.resistance = [];
  }
  
  if (typeof analysis.confidence !== 'number') {
    analysis.confidence = 0.5;
  }
  analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));
  
  analysis.timestamp = new Date();
  
  return analysis;
}

export default {
  analyzeMarket,
  scoreSentiment,
};
