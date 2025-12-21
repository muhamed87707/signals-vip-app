/**
 * AI Analysis Cron Job
 * Runs every 15 minutes to update AI analysis
 * Requirements: 1.2
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    // Verify cron secret (for Vercel cron)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Trigger AI analysis (in production, call Gemini API)
    const analysis = {
      bias: 'bullish',
      confidence: 75,
      summary: 'Gold remains supported by dovish Fed expectations and geopolitical tensions.',
      keyLevels: { support: [2620, 2600], resistance: [2680, 2700] },
      riskFactors: ['Fed policy uncertainty', 'Dollar strength'],
      timestamp: new Date().toISOString(),
    };

    await db.collection('ai_analysis').insertOne({
      ...analysis,
      createdAt: new Date(),
    });

    // Keep only last 100 analyses
    const count = await db.collection('ai_analysis').countDocuments();
    if (count > 100) {
      const oldest = await db.collection('ai_analysis')
        .find().sort({ createdAt: 1 }).limit(count - 100).toArray();
      const idsToDelete = oldest.map(doc => doc._id);
      await db.collection('ai_analysis').deleteMany({ _id: { $in: idsToDelete } });
    }

    return NextResponse.json({ success: true, message: 'AI analysis updated' });
  } catch (error) {
    console.error('AI cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
