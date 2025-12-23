/**
 * Signals API Route
 * GET: Fetch active signals
 * POST: Generate new signal (admin only)
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TradingSignal from '@/models/TradingSignal';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Build query
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    // Fetch signals
    const signals = await TradingSignal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Calculate real-time P&L for active signals
    const signalsWithPnL = signals.map(signal => ({
      ...signal,
      id: signal._id.toString(),
      // P&L will be calculated on frontend with live prices
    }));

    return NextResponse.json({
      success: true,
      signals: signalsWithPnL,
      meta: {
        total: signals.length,
        active: signals.filter(s => s.status === 'active').length,
      },
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { symbol, action } = body;

    if (action === 'generate') {
      // Import IES Engine dynamically to avoid issues
      const { IESEngine } = await import('@/lib/trading-system/core/iesEngine');
      
      const engine = new IESEngine({
        minConfluenceScore: 80,
        minAIConfidence: 70,
        minValidationLayers: 8,
      });

      const result = await engine.generateSignal(symbol);

      if (result.signal) {
        // Save signal to database
        const savedSignal = await TradingSignal.create({
          ...result.signal,
          analysisSnapshot: result.analysis,
        });

        return NextResponse.json({
          success: true,
          signal: savedSignal,
          message: 'Signal generated successfully',
        });
      } else {
        return NextResponse.json({
          success: false,
          reason: result.reason,
          analysis: result.analysis,
          message: 'No signal generated - conditions not met',
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error generating signal:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
