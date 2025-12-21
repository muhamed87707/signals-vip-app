/**
 * Update/Delete Bank Forecast API
 * PUT/DELETE /api/dashboard/forecasts/[id]
 * Requirements: 2.5
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import BankForecast from '@/models/BankForecast';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    await clientPromise;

    const forecast = await BankForecast.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!forecast) {
      return NextResponse.json(
        { error: 'Forecast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error('Update forecast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update forecast' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await clientPromise;

    const forecast = await BankForecast.findByIdAndDelete(id);

    if (!forecast) {
      return NextResponse.json(
        { error: 'Forecast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Forecast deleted successfully',
    });
  } catch (error) {
    console.error('Delete forecast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete forecast' },
      { status: 500 }
    );
  }
}
