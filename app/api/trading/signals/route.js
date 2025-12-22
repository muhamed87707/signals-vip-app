/**
 * API Route: Trading Signals Management
 * GET /api/trading/signals - Get all signals with filters
 * POST /api/trading/signals - Create a new signal manually
 */

import { NextResponse } from 'next/server';
import TradingSignal from '@/models/TradingSignal';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const symbol = searchParams.get('symbol');
    const grade = searchParams.get('grade');
    const direction = searchParams.get('direction');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }
    
    if (grade) {
      query.grade = grade;
    }
    
    if (direction) {
      query.direction = direction.toUpperCase();
    }

    // Get total count
    const total = await TradingSignal.countDocuments(query);

    // Get signals with pagination
    const signals = await TradingSignal.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: signals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Signals Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['symbol', 'direction', 'entry', 'stopLoss', 'takeProfit1'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create signal
    const signal = new TradingSignal({
      ...body,
      status: 'ACTIVE',
      createdAt: new Date()
    });

    await signal.save();

    return NextResponse.json({
      success: true,
      data: signal
    });

  } catch (error) {
    console.error('Create Signal Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
