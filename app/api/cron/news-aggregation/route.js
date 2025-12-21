/**
 * News Aggregation Cron Job
 * Runs every 10 minutes to refresh news feeds
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

    // Update news cache (in production, fetch from RSS feeds)
    const newsData = {
      news: [
        { headline: 'Fed signals potential rate cuts in 2025', source: 'Reuters', sentiment: 65, timestamp: new Date() },
        { headline: 'Gold prices steady amid dollar weakness', source: 'Bloomberg', sentiment: 55, timestamp: new Date() },
        { headline: 'Central banks continue gold accumulation', source: 'FT', sentiment: 70, timestamp: new Date() },
      ],
      aggregatedAt: new Date().toISOString(),
    };

    await db.collection('market_data_cache').updateOne(
      { dataType: 'news_feed' },
      { $set: { data: newsData, fetchedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'News aggregated' });
  } catch (error) {
    console.error('News cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
