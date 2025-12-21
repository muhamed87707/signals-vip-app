/**
 * Technical Levels API Endpoint
 * GET /api/dashboard/technical/levels
 * Requirements: 7.1, 7.2
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getTechnicalLevels } from '@/lib/technicalAnalysis';
import { getSMCMarkers } from '@/lib/smcAnalysis';

// Default technical levels (simulated)
const DEFAULT_LEVELS = {
  supply: [
    { type: 'supply', high: 2680, low: 2670, strength: 85, tested: 1 },
    { type: 'supply', high: 2720, low: 2710, strength: 70, tested: 0 },
  ],
  demand: [
    { type: 'demand', high: 2620, low: 2610, strength: 90, tested: 2 },
    { type: 'demand', high: 2580, low: 2570, strength: 75, tested: 0 },
  ],
  orderBlocks: [
    { type: 'bullish_ob', high: 2615, low: 2605, strength: 80, mitigated: false },
    { type: 'bearish_ob', high: 2695, low: 2685, strength: 65, mitigated: false },
  ],
  fvgs: [
    { type: 'bullish_fvg', high: 2645, low: 2640, filled: false, fillPercent: 30 },
    { type: 'bearish_fvg', high: 2665, low: 2660, filled: true, fillPercent: 100 },
  ],
  currentPrice: 2650,
  timestamp: new Date().toISOString(),
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'XAUUSD';
    const timeframe = searchParams.get('timeframe') || 'H4';

    const client = await clientPromise;
    const db = client.db();
    
    const cached = await db.collection('market_data_cache').findOne({
      dataType: 'technical_levels',
      symbol,
      timeframe,
    });

    if (cached && new Date() - new Date(cached.fetchedAt) < 15 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    // Return default levels (in production, calculate from real candle data)
    const levels = {
      ...DEFAULT_LEVELS,
      symbol,
      timeframe,
    };

    await db.collection('market_data_cache').updateOne(
      { dataType: 'technical_levels', symbol, timeframe },
      {
        $set: {
          data: levels,
          fetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: levels,
    });
  } catch (error) {
    console.error('Technical levels API error:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_LEVELS,
      fallback: true,
    });
  }
}
