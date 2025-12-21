import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Settings from '../../../models/Settings';

export async function GET() {
    try {
        await dbConnect();
        
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = new Settings({
                geminiApiKey: '',
                selectedModel: 'gemini-2.0-flash',
                generatedPostCount: 3,
                aiPrompt: 'Generate 3 variations of this trading signal post.'
            });
            await settings.save();
        }

        return NextResponse.json({
            success: true,
            settings: {
                geminiApiKey: settings.geminiApiKey || '',
                selectedModel: settings.selectedModel || 'gemini-2.0-flash',
                generatedPostCount: settings.generatedPostCount || 3,
                aiPrompt: settings.aiPrompt || 'Generate 3 variations of this trading signal post.'
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
        
        const { geminiApiKey, selectedModel, generatedPostCount, aiPrompt } = await request.json();

        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = new Settings();
        }

        // Update settings
        if (geminiApiKey !== undefined) settings.geminiApiKey = geminiApiKey;
        if (selectedModel !== undefined) settings.selectedModel = selectedModel;
        if (generatedPostCount !== undefined) settings.generatedPostCount = generatedPostCount;
        if (aiPrompt !== undefined) settings.aiPrompt = aiPrompt;

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