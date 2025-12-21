/**
 * Gold Price API Endpoint
 * GET /api/dashboard/market/gold
 * Requirements: 3.1
 */

import { NextResponse } from 'next/server';
import { getGoldPrice } from '@/lib/marketData';

export async function GET() {
  try {
    const gold = await getGoldPrice();

    return NextResponse.json({
      success: true,
      data: gold,
    });
  } catch (error) {
    console.error('Gold API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gold price' },
      { status: 500 }
    );
  }
}
