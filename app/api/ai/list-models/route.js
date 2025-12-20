import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { apiKey } = await request.json();

        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API key required' }, { status: 400 });
        }

        // Fetch models from Google Generative AI API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: data.error?.message || 'Failed to fetch models'
            }, { status: response.status });
        }

        // Filter for text generation models only
        const models = (data.models || [])
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => ({
                id: m.name.replace('models/', ''),
                displayName: m.displayName || m.name.replace('models/', ''),
                description: m.description || ''
            }));

        return NextResponse.json({ success: true, models });
    } catch (error) {
        console.error('List Models Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
