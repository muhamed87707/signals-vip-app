/**
 * Latest COT Data API
 * GET /api/dashboard/cot/latest
 * Requirements: 4.1, 4.4
 */

import { NextResponse } from 'next/server';
import { getLatestCOTData, generateCOTAlert, calculateNetPosition } from '@/lib/cotData';

export async function GET() {
  try {
    const cotData = await getLatestCOTData();
    const alert = generateCOTAlert(cotData);
    const netPosition = calculateNetPosition(cotData);

    // Calculate percentages for histogram
    const total = cotData.managedMoneyLong + cotData.managedMoneyShort;
    const longPercentage = total > 0 ? (cotData.managedMoneyLong / total) * 100 : 50;
    const shortPercentage = total > 0 ? (cotData.managedMoneyShort / total) * 100 : 50;

    return NextResponse.json({
      success: true,
      data: {
        ...cotData,
        netPosition,
        longPercentage: Math.round(longPercentage),
        shortPercentage: Math.round(shortPercentage),
        alert,
      },
    });
  } catch (error) {
    console.error('COT API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch COT data' },
      { status: 500 }
    );
  }
}
