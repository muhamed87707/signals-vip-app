/**
 * AI Analysis Trigger Endpoint
 * POST /api/dashboard/ai/analyze
 * Requirements: 1.1, 1.3, 1.4
 */

import { NextResponse } from 'next/server';
import { analyzeMarket } from '@/lib/gemini';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    // Get market context from request body
    const context = await request.json();
    
    // Validate required context fields
    if (!context.cotData && !context.yields && !context.news) {
      return NextResponse.json(
        { error: 'Market context must include at least one data source' },
        { status: 400 }
      );
    }
    
    // Run AI analysis
    const analysis = await analyzeMarket(context);
    
    // Store in MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection('ai_analyses').insertOne({
      analysis,
      context,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
    
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'AI analysis failed' },
      { status: 500 }
    );
  }
}
