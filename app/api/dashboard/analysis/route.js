import { NextResponse } from 'next/server';

/**
 * Gemini AI Market Analysis API Route
 * Phase 4: AI Brain Integration
 * 
 * Receives market context data and returns AI-generated analysis
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCQSH-Uu1hecLKvOz-dNp6gTiEMz3DYf-4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System prompt for the AI Chief Market Strategist
const SYSTEM_PROMPT = `You are a Senior Hedge Fund Manager and Chief Market Strategist specializing in Gold and Precious Metals markets. You have 25+ years of experience at top-tier institutions like Goldman Sachs and Bridgewater Associates.

Your analysis style:
- Professional and concise executive summary format
- Data-driven with specific price levels mentioned in **bold**
- Clear bias statement (Bullish/Bearish/Neutral) with conviction level
- Actionable insights for institutional traders
- Risk-aware with specific risk factors identified

Format your response as follows:
1. **MARKET BIAS**: [Bullish/Bearish/Neutral] - [Conviction: High/Medium/Low]
2. **EXECUTIVE SUMMARY**: 2-3 sentences on the current market state
3. **KEY LEVELS**: Support and resistance levels in bold
4. **TOP 3 RISKS**: Numbered list of key risks to monitor
5. **CATALYST WATCH**: Upcoming events that could move the market

Keep the total response under 300 words. Use markdown formatting for emphasis.`;

export async function POST(request) {
    try {
        const { marketContext } = await request.json();

        if (!marketContext) {
            return NextResponse.json(
                { error: 'Market context data is required' },
                { status: 400 }
            );
        }

        // Construct the dynamic prompt with market data
        const userPrompt = `Analyze the following real-time market data and provide your professional assessment:

## GOLD MARKET DATA
- **Current Price**: $${marketContext.goldPrice?.toLocaleString() || '2,648.50'}
- **24h Change**: ${marketContext.goldChange > 0 ? '+' : ''}${marketContext.goldChange || '+0.45'}%
- **24h High**: $${marketContext.goldHigh?.toLocaleString() || '2,665.80'}
- **24h Low**: $${marketContext.goldLow?.toLocaleString() || '2,632.15'}

## MACRO INDICATORS
- **US 10Y Treasury Yield**: ${marketContext.us10y || '4.52'}% (${marketContext.us10yChange > 0 ? '↑' : '↓'} ${Math.abs(marketContext.us10yChange || 0.03)}%)
- **US Dollar Index (DXY)**: ${marketContext.dxy || '104.25'} (${marketContext.dxyChange > 0 ? '↑' : '↓'} ${Math.abs(marketContext.dxyChange || 0.15)}%)
- **Real Yields (10Y TIPS)**: ${marketContext.realYields || '2.15'}%

## COT REPORT DATA (Managed Money)
- **Long Positions**: ${marketContext.cotLongPercent || '87'}%
- **Short Positions**: ${marketContext.cotShortPercent || '13'}%
- **Net Position**: ${marketContext.cotNetPosition?.toLocaleString() || '+243,240'} contracts
- **Overcrowded Warning**: ${marketContext.cotOvercrowded ? '⚠️ YES - Longs above 80%' : 'No'}

## BANK FORECASTS
- **Average Consensus Target**: $${marketContext.bankConsensus?.toLocaleString() || '2,717'}
- **Bullish Banks**: ${marketContext.bullishBanks || '4'} of ${marketContext.totalBanks || '6'}
- **Price Range**: $${marketContext.bankTargetLow?.toLocaleString() || '2,650'} - $${marketContext.bankTargetHigh?.toLocaleString() || '2,800'}

## SENTIMENT
- **Market Sentiment Score**: ${marketContext.sentimentScore || '65'}/100
- **Sentiment Label**: ${marketContext.sentimentLabel || 'Bullish'}

Based on this data, provide your professional market analysis.`;

        // Call Gemini API
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: SYSTEM_PROMPT },
                            { text: userPrompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_NONE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_NONE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_NONE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_NONE'
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate analysis', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Extract the generated text
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Unable to generate analysis at this time.';

        return NextResponse.json({
            success: true,
            analysis: generatedText,
            timestamp: new Date().toISOString(),
            model: 'gemini-2.0-flash',
        });

    } catch (error) {
        console.error('Market Analysis API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// GET endpoint for health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'Gemini Market Analysis',
        model: 'gemini-2.0-flash',
        timestamp: new Date().toISOString(),
    });
}
