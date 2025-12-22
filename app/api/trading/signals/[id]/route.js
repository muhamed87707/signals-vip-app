/**
 * API Route: Single Signal Management
 * GET /api/trading/signals/[id] - Get signal by ID
 * PATCH /api/trading/signals/[id] - Update signal
 * DELETE /api/trading/signals/[id] - Delete signal
 */

import { NextResponse } from 'next/server';
import TradingSignal from '@/models/TradingSignal';
import connectDB from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const signal = await TradingSignal.findById(id).lean();

    if (!signal) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: signal
    });

  } catch (error) {
    console.error('Get Signal Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Update signal
    const signal = await TradingSignal.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!signal) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: signal
    });

  } catch (error) {
    console.error('Update Signal Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const signal = await TradingSignal.findByIdAndDelete(id);

    if (!signal) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signal deleted successfully'
    });

  } catch (error) {
    console.error('Delete Signal Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
