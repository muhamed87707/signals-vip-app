/**
 * Analysis API Route
 * GET: Get full analysis for a symbol
 */

import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { symbol } = params;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Import IES Engine dynamically
    const { IESEngine } = await import('@/lib/trading-system/core/iesEngine');
    
    const engine = new IESEngine({
      minConfluenceScore: 80,
      minAIConfidence: 70,
      minValidationLayers: 8,
    });

    const analysis = await engine.analyze(symbol.toUpperCase());

    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      timestamp: Date.now(),
      ...analysis,
    });
  } catch (error) {
    console.error('Error analyzing symbol:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
