/**
 * AIPredictor - AI-Powered Signal Generation using Gemini
 * Analyzes all data and generates trading signals with explanations
 * Uses Gemini 2.0 Flash for fast, accurate predictions
 */

export class AIPredictor {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-2.0-flash';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Generate trading signal using AI analysis
   */
  async generateSignal(analysisData) {
    const {
      symbol,
      technical,
      patterns,
      smartMoney,
      multiTimeframe,
      fundamental,
      sentiment,
      volume,
      confluence,
      currentPrice
    } = analysisData;

    // Build comprehensive prompt
    const prompt = this.buildPrompt(analysisData);

    try {
      const response = await this.callGemini(prompt);
      const parsed = this.parseResponse(response);
      
      return {
        success: true,
        signal: parsed,
        rawResponse: response
      };
    } catch (error) {
      console.error('AI Prediction Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  buildPrompt(data) {
    const { symbol, currentPrice, technical, patterns, smartMoney, multiTimeframe, confluence } = data;

    return `You are an expert forex and commodities trader with 20+ years of experience. Analyze the following market data and provide a trading recommendation.

## SYMBOL: ${symbol}
## CURRENT PRICE: ${currentPrice}
## CONFLUENCE SCORE: ${confluence?.totalScore || 'N/A'}%
## CONFLUENCE GRADE: ${confluence?.grade || 'N/A'}

### TECHNICAL ANALYSIS:
- Trend: ${technical?.trend || 'N/A'}
- Technical Score: ${technical?.score || 'N/A'}/100
- EMA Alignment: ${JSON.stringify(technical?.indicators?.ema?.alignment || {})}
- RSI: ${technical?.indicators?.rsi?.value || 'N/A'} (${technical?.indicators?.rsi?.signal || 'N/A'})
- RSI Divergence: ${JSON.stringify(technical?.indicators?.rsi?.divergence || 'None')}
- MACD: ${JSON.stringify(technical?.indicators?.macd || {})}
- Stochastic: ${JSON.stringify(technical?.indicators?.stochastic || {})}
- Bollinger: ${JSON.stringify(technical?.indicators?.bollinger || {})}
- ATR: ${JSON.stringify(technical?.indicators?.atr || {})}
- ADX: ${JSON.stringify(technical?.indicators?.adx || {})}
- Ichimoku: ${JSON.stringify(technical?.indicators?.ichimoku || {})}
- Technical Signals: ${JSON.stringify(technical?.signals || [])}

### PATTERN ANALYSIS:
- Candlestick Patterns: ${JSON.stringify(patterns?.candlePatterns || [])}
- Chart Patterns: ${JSON.stringify(patterns?.chartPatterns || [])}
- Harmonic Patterns: ${JSON.stringify(patterns?.harmonicPatterns || [])}
- Pattern Bias: ${patterns?.summary?.bias || 'N/A'}

### SMART MONEY CONCEPTS:
- Market Structure: ${JSON.stringify(smartMoney?.marketStructure || {})}
- Order Blocks: ${JSON.stringify(smartMoney?.orderBlocks || {})}
- Fair Value Gaps: ${JSON.stringify(smartMoney?.fairValueGaps || {})}
- Premium/Discount: ${JSON.stringify(smartMoney?.premiumDiscount || {})}
- SMC Bias: ${smartMoney?.summary?.smcBias || 'N/A'}

### MULTI-TIMEFRAME ANALYSIS:
- Overall Bias: ${multiTimeframe?.overallBias || 'N/A'}
- Alignment: ${JSON.stringify(multiTimeframe?.alignment || {})}
- Confluence Score: ${multiTimeframe?.confluenceScore || 'N/A'}%

### CONFLUENCE BREAKDOWN:
${JSON.stringify(confluence?.breakdown || [], null, 2)}

---

Based on this comprehensive analysis, provide a trading recommendation in the following JSON format ONLY (no other text):

{
  "recommendation": "BUY" | "SELL" | "NO_TRADE",
  "confidence": 0-100,
  "entry": {
    "price": number,
    "type": "MARKET" | "LIMIT" | "STOP"
  },
  "stopLoss": number,
  "takeProfit1": number,
  "takeProfit2": number,
  "takeProfit3": number,
  "riskRewardRatio": number,
  "reasoning": {
    "en": "English explanation of why this trade setup is valid or why no trade",
    "ar": "شرح بالعربية لسبب صحة هذه الصفقة أو سبب عدم التداول"
  },
  "keyFactors": [
    {"factor": "factor name", "impact": "BULLISH" | "BEARISH" | "NEUTRAL", "weight": "HIGH" | "MEDIUM" | "LOW"}
  ],
  "risks": {
    "en": "English description of main risks",
    "ar": "وصف بالعربية للمخاطر الرئيسية"
  },
  "invalidation": {
    "en": "What would invalidate this trade",
    "ar": "ما الذي سيبطل هذه الصفقة"
  },
  "timeframe": "Expected holding period",
  "marketCondition": "TRENDING" | "RANGING" | "VOLATILE"
}

IMPORTANT RULES:
1. Only recommend BUY or SELL if confluence score >= 70%
2. Minimum risk/reward ratio must be 1:2
3. Stop loss must be at a logical technical level (support/resistance, order block, etc.)
4. Take profits should be at key levels
5. If conditions are not favorable, recommend NO_TRADE
6. Be conservative - quality over quantity
7. Consider all timeframes for the decision
8. Factor in Smart Money Concepts for institutional perspective`;
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    const url = `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API Error: ${error}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  }


  /**
   * Parse Gemini response to extract JSON
   */
  parseResponse(response) {
    try {
      // Try to extract JSON from response
      let jsonStr = response;
      
      // Remove markdown code blocks if present
      if (response.includes('```json')) {
        jsonStr = response.split('```json')[1].split('```')[0];
      } else if (response.includes('```')) {
        jsonStr = response.split('```')[1].split('```')[0];
      }

      // Clean up the string
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.recommendation) {
        throw new Error('Missing recommendation field');
      }

      // Ensure all required fields exist with defaults
      return {
        recommendation: parsed.recommendation,
        confidence: parsed.confidence || 0,
        entry: parsed.entry || { price: 0, type: 'MARKET' },
        stopLoss: parsed.stopLoss || 0,
        takeProfit1: parsed.takeProfit1 || 0,
        takeProfit2: parsed.takeProfit2 || 0,
        takeProfit3: parsed.takeProfit3 || 0,
        riskRewardRatio: parsed.riskRewardRatio || 0,
        reasoning: parsed.reasoning || { en: '', ar: '' },
        keyFactors: parsed.keyFactors || [],
        risks: parsed.risks || { en: '', ar: '' },
        invalidation: parsed.invalidation || { en: '', ar: '' },
        timeframe: parsed.timeframe || 'Unknown',
        marketCondition: parsed.marketCondition || 'UNKNOWN'
      };
    } catch (error) {
      console.error('Parse Error:', error);
      // Return a safe default
      return {
        recommendation: 'NO_TRADE',
        confidence: 0,
        entry: { price: 0, type: 'MARKET' },
        stopLoss: 0,
        takeProfit1: 0,
        takeProfit2: 0,
        takeProfit3: 0,
        riskRewardRatio: 0,
        reasoning: {
          en: 'Unable to parse AI response',
          ar: 'تعذر تحليل استجابة الذكاء الاصطناعي'
        },
        keyFactors: [],
        risks: { en: 'Parse error', ar: 'خطأ في التحليل' },
        invalidation: { en: '', ar: '' },
        timeframe: 'Unknown',
        marketCondition: 'UNKNOWN'
      };
    }
  }

  /**
   * Validate AI signal against rules
   */
  validateSignal(signal, confluenceScore) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Rule 1: Confluence score must be >= 70%
    if (confluenceScore < 70 && signal.recommendation !== 'NO_TRADE') {
      validation.valid = false;
      validation.errors.push({
        en: `Confluence score (${confluenceScore}%) is below minimum threshold (70%)`,
        ar: `درجة التوافق (${confluenceScore}%) أقل من الحد الأدنى (70%)`
      });
    }

    // Rule 2: R:R must be >= 2
    if (signal.riskRewardRatio < 2 && signal.recommendation !== 'NO_TRADE') {
      validation.valid = false;
      validation.errors.push({
        en: `Risk/Reward ratio (${signal.riskRewardRatio}) is below minimum (2)`,
        ar: `نسبة المخاطرة/العائد (${signal.riskRewardRatio}) أقل من الحد الأدنى (2)`
      });
    }

    // Rule 3: Stop loss must be set
    if (!signal.stopLoss && signal.recommendation !== 'NO_TRADE') {
      validation.valid = false;
      validation.errors.push({
        en: 'Stop loss is not set',
        ar: 'لم يتم تحديد وقف الخسارة'
      });
    }

    // Rule 4: At least one take profit must be set
    if (!signal.takeProfit1 && signal.recommendation !== 'NO_TRADE') {
      validation.valid = false;
      validation.errors.push({
        en: 'Take profit is not set',
        ar: 'لم يتم تحديد هدف الربح'
      });
    }

    // Warning: Low confidence
    if (signal.confidence < 70 && signal.recommendation !== 'NO_TRADE') {
      validation.warnings.push({
        en: `AI confidence is low (${signal.confidence}%)`,
        ar: `ثقة الذكاء الاصطناعي منخفضة (${signal.confidence}%)`
      });
    }

    return validation;
  }

  /**
   * Generate quick analysis without full signal
   */
  async quickAnalysis(symbol, currentPrice, trend, confluenceScore) {
    const prompt = `Quick market analysis for ${symbol} at ${currentPrice}:
- Trend: ${trend}
- Confluence: ${confluenceScore}%

Provide a brief 2-sentence analysis in JSON format:
{
  "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": {
    "en": "English summary",
    "ar": "ملخص بالعربية"
  }
}`;

    try {
      const response = await this.callGemini(prompt);
      return this.parseResponse(response);
    } catch (error) {
      return {
        bias: 'NEUTRAL',
        summary: {
          en: 'Analysis unavailable',
          ar: 'التحليل غير متاح'
        }
      };
    }
  }

  /**
   * Analyze news impact
   */
  async analyzeNewsImpact(newsItems, symbol) {
    if (!newsItems || newsItems.length === 0) {
      return { impact: 'NEUTRAL', analysis: { en: 'No news', ar: 'لا توجد أخبار' } };
    }

    const prompt = `Analyze the impact of these news items on ${symbol}:
${newsItems.map(n => `- ${n.title} (${n.impact})`).join('\n')}

Respond in JSON:
{
  "impact": "BULLISH" | "BEARISH" | "NEUTRAL",
  "strength": "HIGH" | "MEDIUM" | "LOW",
  "analysis": {
    "en": "English analysis",
    "ar": "تحليل بالعربية"
  }
}`;

    try {
      const response = await this.callGemini(prompt);
      return this.parseResponse(response);
    } catch (error) {
      return {
        impact: 'NEUTRAL',
        strength: 'LOW',
        analysis: {
          en: 'Unable to analyze news',
          ar: 'تعذر تحليل الأخبار'
        }
      };
    }
  }

  /**
   * Get market commentary
   */
  async getMarketCommentary(symbol, analysisData) {
    const prompt = `Provide a professional market commentary for ${symbol} based on:
- Current trend: ${analysisData.technical?.trend}
- Key patterns: ${analysisData.patterns?.summary?.topPatterns?.join(', ') || 'None'}
- SMC bias: ${analysisData.smartMoney?.summary?.smcBias}

Write a 3-4 sentence professional commentary in JSON:
{
  "commentary": {
    "en": "English commentary",
    "ar": "تعليق بالعربية"
  },
  "keyLevels": {
    "support": [numbers],
    "resistance": [numbers]
  },
  "outlook": "BULLISH" | "BEARISH" | "NEUTRAL"
}`;

    try {
      const response = await this.callGemini(prompt);
      return this.parseResponse(response);
    } catch (error) {
      return {
        commentary: {
          en: 'Commentary unavailable',
          ar: 'التعليق غير متاح'
        },
        keyLevels: { support: [], resistance: [] },
        outlook: 'NEUTRAL'
      };
    }
  }
}

export default AIPredictor;
