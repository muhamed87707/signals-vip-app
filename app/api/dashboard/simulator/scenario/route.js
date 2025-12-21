/**
 * Scenario Simulator API Endpoint
 * POST /api/dashboard/simulator/scenario
 * Requirements: 8.1, 8.2, 8.3
 */

import { NextResponse } from 'next/server';
import { calculateScenario, generateExplanation, getPresetScenarios } from '@/lib/scenarioSimulator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { scenario, currentPrice = 2650 } = body;

    if (!scenario) {
      return NextResponse.json({ success: false, error: 'Scenario parameters required' }, { status: 400 });
    }

    const result = calculateScenario(scenario, currentPrice);
    const explanation = generateExplanation(result);

    return NextResponse.json({
      success: true,
      data: { ...result, explanation },
    });
  } catch (error) {
    console.error('Scenario API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate scenario' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const presets = getPresetScenarios();
    return NextResponse.json({ success: true, data: { presets } });
  } catch (error) {
    console.error('Scenario presets error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get presets' }, { status: 500 });
  }
}
