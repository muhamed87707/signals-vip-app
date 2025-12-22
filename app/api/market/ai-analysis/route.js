import { NextResponse } from 'next/server';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCQSH-Uu1hecLKvOz-dNp6gTiEMz3DYf-4';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Cache for AI analysis
let cachedAnalysis = null;
let lastAnalysisTime = 0;
const CACHE_DURATION = 600000; // 10 minutes

/**
 * Generate AI analysis prompt for gold market
 */
function generateAnalysisPrompt(marketData = {}) {
    const { goldPrice, dxy, treasury, news } = marketData;
    
    return `You are an expert gold market analyst. Analyze the current gold market conditions and provide a comprehensive analysis.

Current Market Data:
- Gold Price: $${goldPrice?.price || 'N/A'} (${goldPrice?.changePercent > 0 ? '+' : ''}${goldPrice?.changePercent?.toFixed(2) || 'N/A'}%)
- DXY (Dollar Index): ${dxy || 'N/A'}
- 10Y Treasury Yield: ${treasury || 'N/A'}%
- Recent News: ${news || 'General market conditions'}

Please provide your analysis in the following JSON format:
{
    "summary": "A 2-3 sentence executive summary of the current gold market situation in both English and Arabic",
    "summaryAr": "ملخص تنفيذي من 2-3 جمل عن وضع سوق الذهب الحالي",
    "sentiment": "bullish" or "bearish" or "neutral",
    "confidence": 0.0 to 1.0 (your confidence level),
    "topFactors": [
        {
            "factor": "Factor name",
            "factorAr": "اسم العامل بالعربية",
            "impact": "positive" or "negative" or "neutral",
            "weight": 0.0 to 1.0,
            "explanation": "Brief explanation",
            "explanationAr": "شرح مختصر بالعربية"
        }
    ],
    "supportLevels": [2620, 2600, 2580],
    "resistanceLevels": [2670, 2700, 2720],
    "scenarios": {
        "bullish": {
            "target": 2750,
            "probability": 0.45,
            "triggers": ["List of bullish triggers"],
            "triggersAr": ["قائمة المحفزات الصعودية"]
        },
        "neutral": {
            "range": [2600, 2700],
            "probability": 0.35
        },
        "bearish": {
            "target": 2550,
            "probability": 0.20,
            "triggers": ["List of bearish triggers"],
            "triggersAr": ["قائمة المحفزات الهبوطية"]
        }
    },
    "shortTermOutlook": "24-48 hour outlook",
    "shortTermOutlookAr": "التوقعات لـ 24-48 ساعة القادمة",
    "keyLevelsToWatch": "Important price levels to monitor",
    "keyLevelsToWatchAr": "المستويات السعرية المهمة للمراقبة",
    "riskFactors": ["List of risk factors"],
    "riskFactorsAr": ["قائمة عوامل المخاطرة"]
}

Respond ONLY with valid JSON, no additional text.`;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(prompt) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error('No content in Gemini response');
        }

        // Parse JSON from response (handle markdown code blocks)
        let jsonStr = textContent;
        if (textContent.includes('```json')) {
            jsonStr = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (textContent.includes('```')) {
            jsonStr = textContent.replace(/```\n?/g, '');
        }

        return JSON.parse(jsonStr.trim());
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

/**
 * Generate fallback analysis when API fails
 */
function generateFallbackAnalysis(goldPrice) {
    const price = goldPrice?.price || 2650;
    const change = goldPrice?.changePercent || 0;
    
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    if (change > 0.5) {
        sentiment = 'bullish';
        confidence = 0.6;
    } else if (change < -0.5) {
        sentiment = 'bearish';
        confidence = 0.6;
    }

    return {
        summary: `Gold is currently trading at $${price.toFixed(2)} with a ${change >= 0 ? 'positive' : 'negative'} daily change of ${change.toFixed(2)}%. Market conditions suggest a ${sentiment} short-term outlook.`,
        summaryAr: `يتداول الذهب حالياً عند $${price.toFixed(2)} مع تغيير يومي ${change >= 0 ? 'إيجابي' : 'سلبي'} بنسبة ${change.toFixed(2)}%. تشير ظروف السوق إلى توقعات ${sentiment === 'bullish' ? 'صعودية' : sentiment === 'bearish' ? 'هبوطية' : 'محايدة'} على المدى القصير.`,
        sentiment,
        confidence,
        topFactors: [
            {
                factor: "Dollar Strength",
                factorAr: "قوة الدولار",
                impact: change >= 0 ? "positive" : "negative",
                weight: 0.3,
                explanation: "USD movements inversely affect gold prices",
                explanationAr: "تحركات الدولار تؤثر عكسياً على أسعار الذهب"
            },
            {
                factor: "Treasury Yields",
                factorAr: "عوائد السندات",
                impact: "neutral",
                weight: 0.25,
                explanation: "Bond yields impact gold's opportunity cost",
                explanationAr: "عوائد السندات تؤثر على تكلفة الفرصة البديلة للذهب"
            },
            {
                factor: "Market Sentiment",
                factorAr: "معنويات السوق",
                impact: sentiment === 'bullish' ? "positive" : sentiment === 'bearish' ? "negative" : "neutral",
                weight: 0.2,
                explanation: "Overall risk appetite in financial markets",
                explanationAr: "شهية المخاطرة العامة في الأسواق المالية"
            }
        ],
        supportLevels: [
            Math.round(price - 30),
            Math.round(price - 50),
            Math.round(price - 70)
        ],
        resistanceLevels: [
            Math.round(price + 20),
            Math.round(price + 50),
            Math.round(price + 70)
        ],
        scenarios: {
            bullish: {
                target: Math.round(price + 100),
                probability: sentiment === 'bullish' ? 0.45 : 0.25,
                triggers: ["Weak USD", "Geopolitical tensions", "Fed dovish signals"],
                triggersAr: ["ضعف الدولار", "التوترات الجيوسياسية", "إشارات تيسيرية من الفيدرالي"]
            },
            neutral: {
                range: [Math.round(price - 50), Math.round(price + 50)],
                probability: sentiment === 'neutral' ? 0.5 : 0.35
            },
            bearish: {
                target: Math.round(price - 100),
                probability: sentiment === 'bearish' ? 0.45 : 0.2,
                triggers: ["Strong USD", "Rising yields", "Risk-on sentiment"],
                triggersAr: ["قوة الدولار", "ارتفاع العوائد", "شهية المخاطرة"]
            }
        },
        shortTermOutlook: `Gold is expected to trade within the $${Math.round(price - 30)} - $${Math.round(price + 30)} range in the next 24-48 hours.`,
        shortTermOutlookAr: `من المتوقع أن يتداول الذهب ضمن نطاق $${Math.round(price - 30)} - $${Math.round(price + 30)} خلال الـ 24-48 ساعة القادمة.`,
        keyLevelsToWatch: `Watch $${Math.round(price - 30)} support and $${Math.round(price + 20)} resistance`,
        keyLevelsToWatchAr: `راقب دعم $${Math.round(price - 30)} ومقاومة $${Math.round(price + 20)}`,
        riskFactors: ["Unexpected Fed announcements", "Geopolitical events", "Economic data releases"],
        riskFactorsAr: ["إعلانات غير متوقعة من الفيدرالي", "أحداث جيوسياسية", "إصدارات البيانات الاقتصادية"],
        generatedAt: new Date().toISOString(),
        source: "Fallback Analysis"
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        // Return cached analysis if valid and not forcing refresh
        if (!forceRefresh && cachedAnalysis && (now - lastAnalysisTime) < CACHE_DURATION) {
            return NextResponse.json({
                ...cachedAnalysis,
                cached: true
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Fetch current gold price for context
        let goldPrice = null;
        try {
            const priceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/market/gold-price`);
            if (priceRes.ok) {
                goldPrice = await priceRes.json();
            }
        } catch (e) {
            console.log('Could not fetch gold price for AI context');
        }

        // Generate analysis
        let analysis;
        try {
            const prompt = generateAnalysisPrompt({ goldPrice });
            analysis = await callGeminiAPI(prompt);
            analysis.generatedAt = new Date().toISOString();
            analysis.source = "Gemini AI";
        } catch (aiError) {
            console.error('AI analysis failed, using fallback:', aiError);
            analysis = generateFallbackAnalysis(goldPrice);
        }

        // Update cache
        cachedAnalysis = analysis;
        lastAnalysisTime = now;

        return NextResponse.json(analysis, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
                'X-Cache': 'MISS'
            }
        });
    } catch (error) {
        console.error('AI Analysis API error:', error);
        
        // Return cached data on error if available
        if (cachedAnalysis) {
            return NextResponse.json({
                ...cachedAnalysis,
                cached: true,
                stale: true
            }, {
                headers: {
                    'X-Cache': 'STALE'
                }
            });
        }

        return NextResponse.json(
            { error: 'Failed to generate analysis', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { marketData, customPrompt } = body;

        const prompt = customPrompt || generateAnalysisPrompt(marketData);
        const analysis = await callGeminiAPI(prompt);
        
        analysis.generatedAt = new Date().toISOString();
        analysis.source = "Gemini AI (Custom)";

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('AI Analysis POST error:', error);
        return NextResponse.json(
            { error: 'Failed to generate analysis', message: error.message },
            { status: 500 }
        );
    }
}
