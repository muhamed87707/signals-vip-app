import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Settings from '../../../models/Settings';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        // Always try to find the one settings doc
        let settings = await Settings.findOne();

        // If not exists, return default object (frontend handles it)
        if (!settings) {
            settings = {
                geminiApiKey: '',
                aiPrompt: '',
                selectedModel: 'gemini-2.0-flash',
                generatedPostCount: 50
            };
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Fetch Settings Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { geminiApiKey, aiPrompt, selectedModel, generatedPostCount } = body;

        // Upsert: Try to update first document found, or insert if none
        let settings = await Settings.findOne();

        if (settings) {
            if (geminiApiKey !== undefined) settings.geminiApiKey = geminiApiKey;
            if (aiPrompt !== undefined) settings.aiPrompt = aiPrompt;
            if (selectedModel !== undefined) settings.selectedModel = selectedModel;
            if (generatedPostCount !== undefined) settings.generatedPostCount = generatedPostCount;
            if (body.telegramBotLink !== undefined) settings.telegramBotLink = body.telegramBotLink;
            settings.updatedAt = new Date();
            await settings.save();
        } else {
            settings = await Settings.create({
                geminiApiKey,
                aiPrompt,
                selectedModel,
                generatedPostCount,
                telegramBotLink: body.telegramBotLink
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Update Settings Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
