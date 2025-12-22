/**
 * SentimentAnalyzer - Market Sentiment Analysis Engine
 * Analyzes retail positioning, news sentiment, and market mood
 * Uses contrarian approach for retail positioning
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class SentimentAnalyzer {
  constructor() {
    this.genAI = process.env.GEMINI_API_KEY 
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;
    
    // Sentiment thresholds
    this.extremeThreshold = 75; // % for extreme positioning
    this.contrarian = true; // Use contrarian approach for retail
  }

  /**
   * Main analysis function
   */
  async analyze(symbol, newsData = null) {
    const result = {
      symbol,
      timestamp: new Date(),
      retailPositioning: null,
      newsSentiment: null,
      socialSentiment: null,
      fearGreed: null,
      overallSentiment: 'NEUTRAL',
      confidence: 0,
      summary: {}
    };

    try {
      // Analyze retail positioning
      result.retailPositioning = await this.analyzeRetailPositioning(symbol);
      
      // Analyze news sentiment
      if (newsData || this.genAI) {
        result.newsSentiment = await this.analyzeNewsSentiment(symbol, newsData);
      }
      
      // Calculate Fear & Greed (for indices and gold)
      result.fearGreed = this.calculateFearGreed(symbol);
      
      // Calculate overall sentiment
      result.overallSentiment = this.calculateOverallSentiment(result);
      result.confidence = this.calculateConfidence(result);
      result.summary = this.generateSummary(result);

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Analyze retail positioning (contrarian indicator)
   */
  async analyzeRetailPositioning(symbol) {
    const result = {
      symbol,
      longPercent: 50,
      shortPercent: 50,
      ratio: 1,
      extreme: false,
      bias: 'NEUTRAL',
      contrarianSignal: 'NEUTRAL',
      source: 'estimated'
    };

    try {
      // In production, fetch from broker APIs (IG, OANDA, Myfxbook)
      // For now, use estimated values based on market conditions
      const positioning = await this.fetchRetailPositioning(symbol);
      
      if (positioning) {
        result.longPercent = positioning.long;
        result.shortPercent = positioning.short;
        result.ratio = positioning.long / positioning.short;
        result.source = positioning.source;
      }

      // Check for extreme positioning
      result.extreme = result.longPercent >= this.extremeThreshold || 
                       result.shortPercent >= this.extremeThreshold;

      // Determine bias (what retail is doing)
      if (result.longPercent > 60) result.bias = 'BULLISH';
      else if (result.shortPercent > 60) result.bias = 'BEARISH';

      // Contrarian signal (opposite of retail)
      if (this.contrarian) {
        if (result.longPercent >= this.extremeThreshold) {
          result.contrarianSignal = 'BEARISH'; // Retail too long = sell
        } else if (result.shortPercent >= this.extremeThreshold) {
          result.contrarianSignal = 'BULLISH'; // Retail too short = buy
        }
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Fetch retail positioning data
   */
  async fetchRetailPositioning(symbol) {
    // In production, fetch from:
    // - IG Client Sentiment
    // - OANDA Order Book
    // - Myfxbook Outlook
    // - DailyFX Sentiment
    
    // Return null - will be populated with real data
    return null;
  }

  /**
   * Analyze news sentiment using AI
   */
  async analyzeNewsSentiment(symbol, newsData = null) {
    const result = {
      symbol,
      sentiment: 'NEUTRAL',
      score: 0,
      confidence: 'LOW',
      headlines: [],
      aligned: false
    };

    try {
      // If news data provided, analyze it
      if (newsData && newsData.length > 0) {
        result.headlines = newsData.slice(0, 10);
        
        if (this.genAI) {
          const analysis = await this.analyzeHeadlinesWithAI(symbol, newsData);
          result.sentiment = analysis.sentiment;
          result.score = analysis.score;
          result.confidence = analysis.confidence;
          result.reasoning = analysis.reasoning;
        }
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }


  /**
   * Analyze headlines with Gemini AI
   */
  async analyzeHeadlinesWithAI(symbol, headlines) {
    if (!this.genAI) {
      return { sentiment: 'NEUTRAL', score: 0, confidence: 'LOW' };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Analyze the following news headlines for ${symbol} and determine the market sentiment.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h.title || h}`).join('\n')}

Respond in JSON format:
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "score": -100 to 100 (negative = bearish, positive = bullish),
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": {
    "en": "Brief explanation in English",
    "ar": "شرح مختصر بالعربية"
  },
  "keyThemes": ["theme1", "theme2"]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

    } catch (error) {
      console.error('AI sentiment analysis error:', error);
    }

    return { sentiment: 'NEUTRAL', score: 0, confidence: 'LOW' };
  }

  /**
   * Calculate Fear & Greed Index (simplified)
   */
  calculateFearGreed(symbol) {
    // In production, calculate based on:
    // - VIX (for indices)
    // - Put/Call ratio
    // - Market momentum
    // - Safe haven demand
    // - Junk bond demand
    // - Stock price breadth
    // - Stock price strength

    const result = {
      value: 50,
      label: 'NEUTRAL',
      extreme: false,
      signal: 'NEUTRAL'
    };

    // For gold (XAUUSD), inverse relationship with risk appetite
    if (symbol === 'XAUUSD' || symbol === 'XAGUSD') {
      result.assetType = 'SAFE_HAVEN';
    }

    // Determine label
    if (result.value <= 20) {
      result.label = 'EXTREME_FEAR';
      result.extreme = true;
      result.signal = 'BULLISH'; // Contrarian
    } else if (result.value <= 40) {
      result.label = 'FEAR';
      result.signal = 'BULLISH';
    } else if (result.value >= 80) {
      result.label = 'EXTREME_GREED';
      result.extreme = true;
      result.signal = 'BEARISH'; // Contrarian
    } else if (result.value >= 60) {
      result.label = 'GREED';
      result.signal = 'BEARISH';
    }

    return result;
  }

  /**
   * Calculate overall sentiment
   */
  calculateOverallSentiment(analysis) {
    let bullishScore = 0;
    let bearishScore = 0;

    // Retail positioning (contrarian)
    if (analysis.retailPositioning?.contrarianSignal === 'BULLISH') {
      bullishScore += 40;
    } else if (analysis.retailPositioning?.contrarianSignal === 'BEARISH') {
      bearishScore += 40;
    }

    // News sentiment
    if (analysis.newsSentiment?.sentiment === 'BULLISH') {
      bullishScore += 30;
    } else if (analysis.newsSentiment?.sentiment === 'BEARISH') {
      bearishScore += 30;
    }

    // Fear & Greed
    if (analysis.fearGreed?.signal === 'BULLISH') {
      bullishScore += 30;
    } else if (analysis.fearGreed?.signal === 'BEARISH') {
      bearishScore += 30;
    }

    if (bullishScore > bearishScore + 20) return 'BULLISH';
    if (bearishScore > bullishScore + 20) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Calculate confidence level
   */
  calculateConfidence(analysis) {
    let confidence = 50;

    // Extreme retail positioning = higher confidence
    if (analysis.retailPositioning?.extreme) confidence += 20;

    // High confidence news sentiment
    if (analysis.newsSentiment?.confidence === 'HIGH') confidence += 15;
    else if (analysis.newsSentiment?.confidence === 'MEDIUM') confidence += 8;

    // Extreme fear/greed
    if (analysis.fearGreed?.extreme) confidence += 15;

    // Alignment bonus
    const signals = [
      analysis.retailPositioning?.contrarianSignal,
      analysis.newsSentiment?.sentiment,
      analysis.fearGreed?.signal
    ].filter(s => s && s !== 'NEUTRAL');

    const allBullish = signals.every(s => s === 'BULLISH');
    const allBearish = signals.every(s => s === 'BEARISH');
    
    if ((allBullish || allBearish) && signals.length >= 2) {
      confidence += 10;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Generate summary
   */
  generateSummary(analysis) {
    const summary = {
      sentiment: analysis.overallSentiment,
      confidence: analysis.confidence,
      keyFactors: [],
      warnings: [],
      description: { en: '', ar: '' }
    };

    // Key factors
    if (analysis.retailPositioning?.extreme) {
      const direction = analysis.retailPositioning.contrarianSignal;
      summary.keyFactors.push({
        en: `Extreme retail positioning (${analysis.retailPositioning.longPercent}% long) - contrarian ${direction.toLowerCase()}`,
        ar: `مراكز التجزئة متطرفة (${analysis.retailPositioning.longPercent}% شراء) - إشارة معاكسة ${direction === 'BULLISH' ? 'صاعدة' : 'هابطة'}`
      });
    }

    if (analysis.newsSentiment?.sentiment !== 'NEUTRAL') {
      summary.keyFactors.push({
        en: `News sentiment is ${analysis.newsSentiment.sentiment.toLowerCase()}`,
        ar: `مشاعر الأخبار ${analysis.newsSentiment.sentiment === 'BULLISH' ? 'إيجابية' : 'سلبية'}`
      });
    }

    if (analysis.fearGreed?.extreme) {
      summary.keyFactors.push({
        en: `${analysis.fearGreed.label.replace('_', ' ')} detected`,
        ar: `تم اكتشاف ${analysis.fearGreed.label === 'EXTREME_FEAR' ? 'خوف شديد' : 'طمع شديد'}`
      });
    }

    // Warnings
    if (analysis.retailPositioning?.ratio > 3 || analysis.retailPositioning?.ratio < 0.33) {
      summary.warnings.push({
        en: 'Extreme positioning may indicate imminent reversal',
        ar: 'المراكز المتطرفة قد تشير إلى انعكاس وشيك'
      });
    }

    // Description
    summary.description = {
      en: `Market sentiment is ${analysis.overallSentiment.toLowerCase()} with ${analysis.confidence}% confidence`,
      ar: `مشاعر السوق ${analysis.overallSentiment === 'BULLISH' ? 'إيجابية' : analysis.overallSentiment === 'BEARISH' ? 'سلبية' : 'محايدة'} بثقة ${analysis.confidence}%`
    };

    return summary;
  }

  /**
   * Get contrarian signal
   */
  getContrarianSignal(symbol) {
    return this.analyzeRetailPositioning(symbol).then(positioning => {
      if (positioning.extreme) {
        return {
          signal: positioning.contrarianSignal,
          strength: 'STRONG',
          reason: {
            en: `Retail is ${positioning.longPercent > 50 ? 'extremely long' : 'extremely short'} - fade the crowd`,
            ar: `التجزئة ${positioning.longPercent > 50 ? 'في مراكز شراء متطرفة' : 'في مراكز بيع متطرفة'} - عاكس الجمهور`
          }
        };
      }
      return { signal: 'NEUTRAL', strength: 'WEAK' };
    });
  }

  /**
   * Analyze social media sentiment (placeholder for future implementation)
   */
  async analyzeSocialSentiment(symbol) {
    // In production, analyze:
    // - Twitter/X mentions
    // - Reddit discussions
    // - TradingView ideas
    // - StockTwits
    
    return {
      symbol,
      sentiment: 'NEUTRAL',
      volume: 0,
      trending: false
    };
  }
}

export default SentimentAnalyzer;
