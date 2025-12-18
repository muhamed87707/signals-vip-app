
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
    try {
        const { apiKey, model, prompt, baseText } = await req.json();

        if (!apiKey || !prompt || !baseText) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // User requested 'gemini-3-flash', but we need to fallback if it doesn't exist yet, 
        // however, we will try to use the model string provided by user.
        // If it fails, the error will be caught.
        const modelName = model || 'gemini-1.5-flash';
        const generativeModel = genAI.getGenerativeModel({ model: modelName });

        const finalPrompt = `${prompt}\n\nHere is the base text to rewrite/enhance:\n${baseText}\n\nPlease generate exactly 50 distinct variations of this post. Return them as a JSON array of strings, without any markdown formatting outside the JSON.`;

        const result = await generativeModel.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        // Attempt to parse JSON
        let variations = [];
        try {
            // Clean up code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            variations = JSON.parse(cleanText);
        } catch (e) {
            // Fallback: split by newlines if not JSON
            variations = text.split('\n').filter(line => line.trim().length > 0).slice(0, 50);
        }

        return NextResponse.json({ variations });

    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
