/**
 * Create Bank Forecast API (Admin)
 * POST /api/dashboard/forecasts/create
 * Requirements: 2.5
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import BankForecast from '@/models/BankForecast';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { bankName, forecastPrice, timeframe, analystLogic } = body;
    
    if (!bankName || !forecastPrice || !timeframe || !analystLogic) {
      return NextResponse.json(
        { error: 'Missing required fields: bankName, forecastPrice, timeframe, analystLogic' },
        { status: 400 }
      );
    }

    // Validate bank name
    const validBanks = ['JP Morgan', 'Goldman Sachs', 'Citi', 'Morgan Stanley', 'UBS', 'Commerzbank'];
    if (!validBanks.includes(bankName)) {
      return NextResponse.json(
        { error: `Invalid bank name. Must be one of: ${validBanks.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate timeframe
    const validTimeframes = ['Q1', 'Q2', 'Q3', 'Q4', 'Year-End'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}` },
        { status: 400 }
      );
    }

    await clientPromise;

    const forecast = new BankForecast({
      bankName,
      forecastPrice,
      timeframe,
      analystLogic,
      analyst: body.analyst,
      createdBy: body.createdBy || 'admin',
    });

    await forecast.save();

    return NextResponse.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error('Create forecast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create forecast' },
      { status: 500 }
    );
  }
}
