/**
 * Sentiment Scoring Endpoint
 * POST /api/dashboard/ai/sentiment
 * Requirements: 5.2
 */

import { NextResponse } from 'next/server';
import { scoreSentiment } from '@/lib/gemini';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { headlines } = await request.json();
    
    // Validate headlines
    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return NextResponse.json(
        { error: 'Headlines array is required' },
        { status: 400 }
      );
    }
    
    // Score sentiment using Gemini
    const sentiment = await scoreSentiment(headlines);
    
    // Store in MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('news_sentiment').insertOne({
      headlines,
      sentiment,
      analyzedAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      sentiment,
    });
  } catch (error) {
    console.error('Sentiment scoring error:', error);
    return NextResponse.json(
      { error: error.message || 'Sentiment analysis failed' },
      { status: 500 }
    );
  }
}
