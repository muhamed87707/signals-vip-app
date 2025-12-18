import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { apiKey, model, prompt, count } = await request.json();

        if (!apiKey || !prompt) {
            return NextResponse.json({ error: 'API Key and Prompt are required' }, { status: 400 });
        }

        const selectedModel = model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

        // Optimize: Provide systemic instruction to generate MULTIPLE variations in ONE call to save tokens/latency
        // content generation 50 separate times is slow. Better to ask for a list of 50.

        const refinedPrompt = `${prompt}\n\nIMPORTANT: Generate exactly ${count || 50} distinct variations of this post. Return them as a numbered list from 1 to 50. Do not include any intro/outro text. Just the variations.`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: refinedPrompt }]
                }],
                generationConfig: {
                    temperature: 0.9, // High creativity
                    maxOutputTokens: 8192,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse the numbered list
        // Regex to split by "1. ", "2. ", etc. or "\n" if list format fails
        // Simple approach: Split by newline, filter empty/short lines.
        // A robust regex for numbered list: /^\d+\.?\s+/gm

        const variations = text.split(/\n/).map(line => {
            // Remove leading numbers like "1. " or "50)"
            return line.replace(/^[\d\.\)]+\s+/, '').trim();
        }).filter(line => line.length > 10); // Filter out noise

        // If fewer than requested, maybe AI grouped them. But for now return what we got.

        return NextResponse.json({ variations, raw: text });

    } catch (error) {
        console.error('Gemini Generate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
