import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
    try {
        const { apiKey, prompt } = await request.json();

        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API Key is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const fullPrompt = `Generate 50 distinct, short, high-energy, and professional social media posts (Twitter/Telegram style) for a trading signal. 
        Context: ${prompt}
        Output MUST be a JSON array of strings. Example: ["Post 1", "Post 2"]`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json|```/g, '').trim();

        let posts = [];
        try {
            posts = JSON.parse(cleanText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback: try to split by newlines if JSON fails, or return single item
            posts = [cleanText];
        }

        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error("AI Generation API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
