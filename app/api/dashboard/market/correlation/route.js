/**
 * Correlation Matrix API Endpoint
 * GET /api/dashboard/market/correlation
 * Requirements: 6.1-6.5
 */

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { 
  calculateFullCorrelationMatrix, 
  DEFAULT_CORRELATION_ASSETS 
} from '@/lib/calculations/correlation';

// Default correlation matrix data (simulated historical correlations)
const DEFAULT_MATRIX_DATA = {
  assets: ['XAUUSD', 'DXY', 'US10Y', 'XAGUSD', 'AUDUSD', 'USDJPY'],
  matrix: {
    XAUUSD: { XAUUSD: 1, DXY: -0.78, US10Y: -0.72, XAGUSD: 0.89, AUDUSD: 0.65, USDJPY: -0.45 },
    DXY: { XAUUSD: -0.78, DXY: 1, US10Y: 0.55, XAGUSD: -0.72, AUDUSD: -0.82, USDJPY: 0.68 },
    US10Y: { XAUUSD: -0.72, DXY: 0.55, US10Y: 1, XAGUSD: -0.65, AUDUSD: -0.48, USDJPY: 0.42 },
    XAGUSD: { XAUUSD: 0.89, DXY: -0.72, US10Y: -0.65, XAGUSD: 1, AUDUSD: 0.58, USDJPY: -0.38 },
    AUDUSD: { XAUUSD: 0.65, DXY: -0.82, US10Y: -0.48, XAGUSD: 0.58, AUDUSD: 1, USDJPY: -0.52 },
    USDJPY: { XAUUSD: -0.45, DXY: 0.68, US10Y: 0.42, XAGUSD: -0.38, AUDUSD: -0.52, USDJPY: 1 },
  },
  previousMatrix: {
    XAUUSD: { XAUUSD: 1, DXY: -0.75, US10Y: -0.68, XAGUSD: 0.88, AUDUSD: 0.62, USDJPY: -0.42 },
    DXY: { XAUUSD: -0.75, DXY: 1, US10Y: 0.52, XAGUSD: -0.70, AUDUSD: -0.80, USDJPY: 0.65 },
    US10Y: { XAUUSD: -0.68, DXY: 0.52, US10Y: 1, XAGUSD: -0.62, AUDUSD: -0.45, USDJPY: 0.40 },
    XAGUSD: { XAUUSD: 0.88, DXY: -0.70, US10Y: -0.62, XAGUSD: 1, AUDUSD: 0.55, USDJPY: -0.35 },
    AUDUSD: { XAUUSD: 0.62, DXY: -0.80, US10Y: -0.45, XAGUSD: 0.55, AUDUSD: 1, USDJPY: -0.50 },
    USDJPY: { XAUUSD: -0.42, DXY: 0.65, US10Y: 0.40, XAGUSD: -0.35, AUDUSD: -0.50, USDJPY: 1 },
  },
};

/**
 * Build full matrix with change highlighting
 */
function buildFullMatrix(data, previousData, threshold = 0.1) {
  const assets = data.assets;
  const result = {
    assets,
    assetInfo: DEFAULT_CORRELATION_ASSETS,
    matrix: {},
    changes: [],
    period: data.period || '30D',
    timestamp: new Date().toISOString(),
  };

  for (const asset1 of assets) {
    result.matrix[asset1] = {};
    for (const asset2 of assets) {
      const current = data.matrix[asset1]?.[asset2] ?? 0;
      const previous = previousData?.matrix?.[asset1]?.[asset2] ?? null;
      const change = previous !== null ? current - previous : 0;
      const hasSignificantChange = Math.abs(change) >= threshold;

      // Determine strength and color
      const abs = Math.abs(current);
      let strength = 'negligible';
      if (abs >= 0.8) strength = 'very-strong';
      else if (abs >= 0.6) strength = 'strong';
      else if (abs >= 0.4) strength = 'moderate';
      else if (abs >= 0.2) strength = 'weak';

      let color;
      if (current >= 0.8) color = 'rgba(0, 255, 136, 0.9)';
      else if (current >= 0.6) color = 'rgba(0, 255, 136, 0.7)';
      else if (current >= 0.4) color = 'rgba(0, 255, 136, 0.5)';
      else if (current >= 0.2) color = 'rgba(0, 255, 136, 0.3)';
      else if (current > -0.2) color = 'rgba(128, 128, 128, 0.3)';
      else if (current > -0.4) color = 'rgba(255, 68, 68, 0.3)';
      else if (current > -0.6) color = 'rgba(255, 68, 68, 0.5)';
      else if (current > -0.8) color = 'rgba(255, 68, 68, 0.7)';
      else color = 'rgba(255, 68, 68, 0.9)';

      result.matrix[asset1][asset2] = {
        value: current,
        previous,
        change,
        hasSignificantChange,
        strength,
        color,
      };

      if (hasSignificantChange && asset1 < asset2) {
        result.changes.push({
          asset1,
          asset2,
          previous,
          current,
          change,
          direction: change > 0 ? 'strengthened' : 'weakened',
        });
      }
    }
  }

  return result;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30D';
    const threshold = parseFloat(searchParams.get('threshold')) || 0.1;

    // Try to get cached correlation data from MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    const cached = await db.collection('market_data_cache').findOne({
      dataType: 'correlation_matrix',
      period,
    });

    if (cached && new Date() - new Date(cached.fetchedAt) < 60 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    // Build full matrix with change detection
    const matrixData = {
      ...DEFAULT_MATRIX_DATA,
      period,
    };
    
    const fullMatrix = buildFullMatrix(matrixData, DEFAULT_MATRIX_DATA, threshold);

    // Cache the result
    await db.collection('market_data_cache').updateOne(
      { dataType: 'correlation_matrix', period },
      {
        $set: {
          data: fullMatrix,
          fetchedAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: fullMatrix,
    });
  } catch (error) {
    console.error('Correlation API error:', error);
    
    // Return fallback data
    const fallbackMatrix = buildFullMatrix(DEFAULT_MATRIX_DATA, DEFAULT_MATRIX_DATA, 0.1);
    
    return NextResponse.json({
      success: true,
      data: fallbackMatrix,
      fallback: true,
    });
  }
}
