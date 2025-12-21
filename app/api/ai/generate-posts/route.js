import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_PROMPT = `You are a professional social media manager for a premium forex/gold trading signals service called "Abu Al-Dahab Institution".

Your task is to rewrite the user's post in different variations while:
1. Keeping the core message and any specific trading details intact
2. Making each variation unique in tone, style, and word choice
3. Using appropriate emojis (💎🔥📈💰🚀👑)
4. Including urgency and exclusivity
5. Supporting both Arabic and English audiences
6. Keeping posts concise (under 280 characters when possible)

Return ONLY a JSON array of strings, no other text. Example format:
["Post variation 1", "Post variation 2", ...]`;

export async function POST(request) {
    try {
        const { apiKey, model, userPost, customPrompt, count = 50 } = await request.json();

        if (!apiKey || !userPost) {
            return NextResponse.json({
                success: false,
                error: 'API key and user post are required'
            }, { status: 400 });
        }

        const selectedModel = model || 'gemini-2.0-flash';
        const prompt = customPrompt || DEFAULT_PROMPT;

        const fullPrompt = `${prompt}

User's original post to rewrite:
"${userPost}"

Generate exactly ${count} unique variations. Return ONLY the JSON array, no markdown or extra text.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 8192
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: data.error?.message || 'Failed to generate posts'
            }, { status: response.status });
        }

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON array from response
        let posts = [];
        try {
            // Try to extract JSON array from the response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                posts = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.error('Parse error:', parseError);
            // If parsing fails, split by newlines as fallback
            posts = text.split('\n').filter(p => p.trim()).slice(0, count);
        }

        return NextResponse.json({
            success: true,
            posts: posts.slice(0, count)
        });
    } catch (error) {
        console.error('Generate Posts Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        defaultPrompt: DEFAULT_PROMPT
    });
}
