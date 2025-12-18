import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get access to API potentially? 
        // Actually the SDK has no direct "listModels" on the instance easily exposed in recent versions without using the Admin API or specific REST call, 
        // BUT `genAI` instance might not expose it directly in all versions.
        // Let's check documentation or use standard REST if SDK fails.
        // The Node SDK usually supports `getGenerativeModel`. listing might require `GoogleGenerativeAI.listModels`? No.
        // It's often `genAI.getGenerativeModel` directly.
        // Let's try to fetch via REST for certainty as SDK version varies.
        // Or better, let's try the simple endpoint: https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            // Filter for 'generateContent' supported models
            const validModels = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => ({
                    name: m.name.replace('models/', ''),
                    displayName: m.displayName || m.name
                }));
            return NextResponse.json({ models: validModels });
        } else {
            return NextResponse.json({ error: data.error?.message || 'Failed to fetch models' }, { status: 500 });
        }

    } catch (error) {
        console.error('Model List Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
