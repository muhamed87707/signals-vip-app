/**
 * Market Data API Endpoint - All Live Prices
 * GET /api/dashboard/market/gold
 * Requirements: 3.1, 3.3
 */

import { NextResponse } from 'next/server';
import { getGoldPrice, getDXYData, getOilPrice } from '@/lib/marketData';

export async function GET() {
  try {
    // Fetch all market data in parallel
    const [gold, dxy, oil] = await Promise.all([
      getGoldPrice(),
      getDXYData(),
      getOilPrice(),
    ]);

    // Fetch Treasury yield from FRED if available
    let treasury = { us10y: 4.42, change: 0 };
    try {
      const fredResponse = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=2&sort_order=desc`
      );
      const fredData = await fredResponse.json();
      if (fredData.observations && fredData.observations.length >= 2) {
        const latest = parseFloat(fredData.observations[0].value);
        const previous = parseFloat(fredData.observations[1].value);
        treasury = {
          us10y: latest,
          change: latest - previous,
        };
      }
    } catch (e) {
      console.error('FRED API error:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        gold: {
          price: gold.price,
          change: gold.change || 0,
          changePercent: gold.changePercent || 0,
          bidPrice: gold.bidPrice,
          askPrice: gold.askPrice,
          timestamp: gold.timestamp,
          isFallback: gold.isFallback || false,
        },
        dxy: {
          value: dxy.value,
          change: dxy.change,
          changePercent: dxy.changePercent,
          timestamp: dxy.timestamp,
          isFallback: dxy.isFallback || false,
        },
        oil: {
          price: oil.price,
          change: oil.change,
          changePercent: oil.changePercent,
          timestamp: oil.timestamp,
          isFallback: oil.isFallback || false,
        },
        treasury,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch market data',
        data: {
          gold: { price: 2650, change: 0, changePercent: 0, isFallback: true },
          dxy: { value: 104.25, change: 0, changePercent: 0, isFallback: true },
          oil: { price: 71.45, change: 0, changePercent: 0, isFallback: true },
          treasury: { us10y: 4.42, change: 0 },
        }
      },
      { status: 200 }
    );
  }
}
