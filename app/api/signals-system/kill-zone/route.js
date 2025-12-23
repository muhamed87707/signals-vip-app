/**
 * Kill Zone API Route
 * GET: Get current kill zone status
 */

import { NextResponse } from 'next/server';
import { KillZoneManager } from '@/lib/trading-system/core/killZoneManager';

export async function GET() {
  try {
    const killZoneManager = new KillZoneManager();
    const killZoneStatus = killZoneManager.getCurrentKillZone();
    const volatilityExpectation = killZoneManager.getVolatilityExpectation();
    const bestInstruments = killZoneManager.getBestInstrumentsForSession();

    return NextResponse.json({
      success: true,
      ...killZoneStatus,
      volatility: volatilityExpectation,
      recommendedInstruments: bestInstruments,
    });
  } catch (error) {
    console.error('Error getting kill zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get kill zone status' },
      { status: 500 }
    );
  }
}
