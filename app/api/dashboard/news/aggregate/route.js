/**
 * Aggregated News API
 * GET /api/dashboard/news/aggregate
 * Requirements: 5.1
 */

import { NextResponse } from 'next/server';
import { aggregateNews, hasAllSources } from '@/lib/newsAggregator';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourcesParam = searchParams.get('sources');
    
    const sources = sourcesParam 
      ? sourcesParam.split(',') 
      : ['Reuters', 'Bloomberg', 'CentralBank'];

    const news = await aggregateNews(sources);
    const hasAll = hasAllSources(news, sources);

    return NextResponse.json({
      success: true,
      data: {
        news,
        count: news.length,
        sources: [...new Set(news.map(n => n.source))],
        hasAllSources: hasAll,
      },
    });
  } catch (error) {
    console.error('News aggregation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate news' },
      { status: 500 }
    );
  }
}
