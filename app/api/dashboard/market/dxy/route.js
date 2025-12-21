/**
 * DXY (Dollar Index) API Endpoint
 * GET /api/dashboard/market/dxy
 * Requirements: 3.3
 */

import { NextResponse } from 'next/server';
import { getDXYData } from '@/lib/marketData';

export async function GET() {
  try {
    const dxy = await getDXYData();

    return NextResponse.json({
      success: true,
      data: dxy,
    });
  } catch (error) {
    console.error('DXY API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch DXY data' },
      { status: 500 }
    );
  }
}
