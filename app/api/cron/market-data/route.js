/**
 * Market Data Cron Job
 * Runs every 5 minutes to refresh market data
 * Requirements: 1.2
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update market data cache (in production, fetch from APIs)
    const marketData = {
      gold: { price: 2650 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 2 },
      dxy: { value: 104.25 + (Math.random() - 0.5) * 0.5, change: (Math.random() - 0.5) * 0.3 },
      us10y: { yield: 4.42 + (Math.random() - 0.5) * 0.1, change: (Math.random() - 0.5) * 0.05 },
      timestamp: new Date().toISOString(),
    };

    await db.collection('market_data_cache').updateOne(
      { dataType: 'live_prices' },
      { $set: { data: marketData, fetchedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Market data refreshed' });
  } catch (error) {
    console.error('Market data cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
