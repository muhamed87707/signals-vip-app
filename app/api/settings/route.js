import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Settings from '../../../models/Settings';

export async function GET() {
    try {
        await dbConnect();
        
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings({
                geminiApiKey: '',
                selectedModel: 'gemini-2.0-flash',
                generatedPostCount: 3,
                aiPrompt: '',
                twitterApiKey: '',
                twitterApiSecret: '',
                twitterAccessToken: '',
                twitterAccessSecret: ''
            });
            await settings.save();
        }

        return NextResponse.json({
            success: true,
            settings: {
                geminiApiKey: settings.geminiApiKey || '',
                selectedModel: settings.selectedModel || 'gemini-2.0-flash',
                generatedPostCount: settings.generatedPostCount || 3,
                aiPrompt: settings.aiPrompt || '',
                twitterApiKey: settings.twitterApiKey || '',
                twitterApiSecret: settings.twitterApiSecret || '',
                twitterAccessToken: settings.twitterAccessToken || '',
                twitterAccessSecret: settings.twitterAccessSecret || ''
            }
        });

    } catch (error) {
        console.error('Settings GET Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to load settings' 
        });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        
        const body = await request.json();
        const { 
            geminiApiKey, 
            selectedModel, 
            generatedPostCount, 
            aiPrompt,
            twitterApiKey,
            twitterApiSecret,
            twitterAccessToken,
            twitterAccessSecret
        } = body;

        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings();
        }

        // Update AI settings
        if (geminiApiKey !== undefined) settings.geminiApiKey = geminiApiKey;
        if (selectedModel !== undefined) settings.selectedModel = selectedModel;
        if (generatedPostCount !== undefined) settings.generatedPostCount = generatedPostCount;
        if (aiPrompt !== undefined) settings.aiPrompt = aiPrompt;
        
        // Update Twitter settings
        if (twitterApiKey !== undefined) settings.twitterApiKey = twitterApiKey;
        if (twitterApiSecret !== undefined) settings.twitterApiSecret = twitterApiSecret;
        if (twitterAccessToken !== undefined) settings.twitterAccessToken = twitterAccessToken;
        if (twitterAccessSecret !== undefined) settings.twitterAccessSecret = twitterAccessSecret;

        settings.updatedAt = new Date();
        await settings.save();

        return NextResponse.json({
            success: true,
            message: 'Settings saved successfully'
        });

    } catch (error) {
        console.error('Settings POST Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to save settings' 
        });
    }
}
