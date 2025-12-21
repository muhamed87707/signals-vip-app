/**
 * List Bank Forecasts API
 * GET /api/dashboard/forecasts/list
 * Requirements: 2.1, 2.3
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import BankForecast from '@/models/BankForecast';

// Default forecasts for demo
const DEFAULT_FORECASTS = [
  { bankName: 'Goldman Sachs', forecastPrice: 2900, timeframe: 'Year-End', analystLogic: 'Strong central bank demand and geopolitical uncertainty support higher prices' },
  { bankName: 'JP Morgan', forecastPrice: 2800, timeframe: 'Year-End', analystLogic: 'Real yields expected to decline as Fed cuts rates' },
  { bankName: 'Citi', forecastPrice: 2700, timeframe: 'Year-End', analystLogic: 'Dollar weakness and inflation hedging demand' },
  { bankName: 'Morgan Stanley', forecastPrice: 2750, timeframe: 'Year-End', analystLogic: 'Portfolio diversification flows continue' },
  { bankName: 'UBS', forecastPrice: 2650, timeframe: 'Year-End', analystLogic: 'Moderate upside with rate cut expectations' },
  { bankName: 'Commerzbank', forecastPrice: 2600, timeframe: 'Year-End', analystLogic: 'European demand remains supportive' },
];

/**
 * Calculate consensus price from forecasts
 */
function calculateConsensus(forecasts) {
  if (!forecasts || forecasts.length === 0) return null;
  const sum = forecasts.reduce((acc, f) => acc + f.forecastPrice, 0);
  return Math.round(sum / forecasts.length);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe');

    let forecasts;
    let consensusPrice;

    try {
      // Try to get from MongoDB
      await clientPromise;
      const query = timeframe ? { timeframe } : {};
      forecasts = await BankForecast.find(query).sort({ createdAt: -1 });
      
      if (forecasts.length === 0) {
        // Use defaults if no data
        forecasts = DEFAULT_FORECASTS;
      }
    } catch (dbError) {
      console.error('DB error, using defaults:', dbError);
      forecasts = DEFAULT_FORECASTS;
    }

    consensusPrice = calculateConsensus(forecasts);

    return NextResponse.json({
      success: true,
      data: {
        forecasts,
        consensusPrice,
        count: forecasts.length,
      },
    });
  } catch (error) {
    console.error('Forecasts list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch forecasts' },
      { status: 500 }
    );
  }
}
