import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key');

    if (!apiKey) {
        return NextResponse.json({ error: 'API Key required' }, { status: 400 });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // Filter for Gemini models that support content generation
        const models = data.models
            ? data.models
                .filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''))
            : ['gemini-1.5-flash']; // Fallback

        return NextResponse.json({ models });
    } catch (error) {
        console.error('Gemini Models Fetch Error:', error);
        return NextResponse.json({ error: error.message, models: ['gemini-1.5-flash'] }, { status: 500 });
    }
}
