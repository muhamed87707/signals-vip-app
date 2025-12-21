/**
 * Central Bank Purchases API Endpoint
 * GET /api/dashboard/central-banks/purchases
 * Requirements: 9.1, 9.2
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getCentralBankData, getTopBuyers, getTopHolders } from '@/lib/centralBankData';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const client = await clientPromise;
    const db = client.db();
    
    const cached = await db.collection('market_data_cache').findOne({
      dataType: 'central_bank_purchases',
    });

    if (cached && new Date() - new Date(cached.fetchedAt) < 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    let data;
    switch (type) {
      case 'buyers':
        data = { buyers: getTopBuyers(10) };
        break;
      case 'holders':
        data = { holders: getTopHolders(10) };
        break;
      default:
        data = getCentralBankData();
    }

    await db.collection('market_data_cache').updateOne(
      { dataType: 'central_bank_purchases' },
      {
        $set: {
          data,
          fetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Central bank API error:', error);
    return NextResponse.json({
      success: true,
      data: getCentralBankData(),
      fallback: true,
    });
  }
}
