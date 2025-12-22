/**
 * API Route: Active Trading Signals
 * GET /api/trading/signals/active - Get all active signals
 */

import { NextResponse } from 'next/server';
import TradingSignal from '@/models/TradingSignal';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();

    // Get active signals
    const signals = await TradingSignal.find({
      status: 'ACTIVE'
    })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate current P/L for each signal (would need real-time prices)
    const signalsWithPnL = signals.map(signal => ({
      ...signal,
      // These would be calculated with real-time prices
      currentPips: 0,
      currentPnL: 0,
      currentPnLPercent: 0
    }));

    return NextResponse.json({
      success: true,
      count: signals.length,
      data: signalsWithPnL
    });

  } catch (error) {
    console.error('Get Active Signals Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
