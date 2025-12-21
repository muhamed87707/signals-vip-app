/**
 * Get Latest AI Analysis Endpoint
 * GET /api/dashboard/ai/latest
 * Requirements: 1.4
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get the most recent analysis
    const latestAnalysis = await db.collection('ai_analyses')
      .findOne(
        {},
        { sort: { createdAt: -1 } }
      );
    
    if (!latestAnalysis) {
      return NextResponse.json({
        success: true,
        analysis: null,
        message: 'No analysis available yet',
      });
    }
    
    // Check if analysis is stale (older than 15 minutes)
    const isStale = new Date() > new Date(latestAnalysis.expiresAt);
    
    return NextResponse.json({
      success: true,
      analysis: latestAnalysis.analysis,
      createdAt: latestAnalysis.createdAt,
      isStale,
    });
  } catch (error) {
    console.error('Get latest analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
