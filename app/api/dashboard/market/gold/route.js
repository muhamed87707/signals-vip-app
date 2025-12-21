/**
 * Market Data API Endpoint - All Live Prices
 * GET /api/dashboard/market/gold
 * Requirements: 3.1, 3.3
 */

import { NextResponse } from 'next/server';
import { getGoldPrice, getDXYData, getOilPrice, getTreasuryYield } from '@/lib/marketData';

export async function GET() {
  try {
    // Fetch all market data in parallel
    const [gold, dxy, oil, treasury] = await Promise.all([
      getGoldPrice(),
      getDXYData(),
      getOilPrice(),
      getTreasuryYield(),
    ]);

    // Treasury yield from our service
    const treasuryData = {
      us10y: treasury.value,
      change: treasury.change,
      source: treasury.source,
      isFallback: treasury.isFallback || false,
    };

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
        treasury: treasuryData,
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
