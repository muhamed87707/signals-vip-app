import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TradingSettings from '@/models/TradingSettings';

// GET - Fetch user settings
export async function GET(request) {
  try {
    await connectDB();

    // For now, use a default user ID (in production, get from auth)
    const userId = 'default';

    let settings = await TradingSettings.findOne({ userId });

    if (!settings) {
      // Return default settings
      settings = {
        capital: 10000,
        riskPerTrade: 1,
        maxDailyDrawdown: 3,
        maxOpenTrades: 5,
        preferredPairs: [],
        notifications: {
          newSignals: true,
          tpHit: true,
          slHit: true,
          sound: true
        },
        display: {
          showConfluence: true,
          showAIAnalysis: true,
          compactMode: false
        }
      };
    }

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Save user settings
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const userId = 'default';

    // Validate settings
    const validatedSettings = {
      userId,
      capital: Math.max(100, Math.min(10000000, body.capital || 10000)),
      riskPerTrade: Math.max(0.5, Math.min(5, body.riskPerTrade || 1)),
      maxDailyDrawdown: Math.max(1, Math.min(10, body.maxDailyDrawdown || 3)),
      maxOpenTrades: Math.max(1, Math.min(10, body.maxOpenTrades || 5)),
      preferredPairs: Array.isArray(body.preferredPairs) ? body.preferredPairs : [],
      notifications: {
        newSignals: body.notifications?.newSignals !== false,
        tpHit: body.notifications?.tpHit !== false,
        slHit: body.notifications?.slHit !== false,
        sound: body.notifications?.sound !== false
      },
      display: {
        showConfluence: body.display?.showConfluence !== false,
        showAIAnalysis: body.display?.showAIAnalysis !== false,
        compactMode: body.display?.compactMode === true
      },
      updatedAt: new Date()
    };

    const settings = await TradingSettings.findOneAndUpdate(
      { userId },
      validatedSettings,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
