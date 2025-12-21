/**
 * Bond Yields API Endpoint
 * GET /api/dashboard/market/yields
 * Requirements: 3.1
 */

import { NextResponse } from 'next/server';
import { getBondYields, getRealYield } from '@/lib/fredApi';

export async function GET() {
  try {
    const [yields, realYield] = await Promise.all([
      getBondYields(),
      getRealYield(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        yields,
        realYield,
      },
    });
  } catch (error) {
    console.error('Yields API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch yields' },
      { status: 500 }
    );
  }
}
