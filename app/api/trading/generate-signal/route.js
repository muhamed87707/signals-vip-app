/**
 * API Route: Generate Trading Signal
 * POST /api/trading/generate-signal
 * Generates a new trading signal for a specific symbol
 */

import { NextResponse } from 'next/server';
import { SignalEngine } from '@/lib/trading';
import TradingSignal from '@/models/TradingSignal';
import connectDB from '@/lib/mongodb';

// Price data fetcher (using free APIs)
async function fetchPriceData(symbol, timeframe, count = 500) {
  try {
    // Using Twelve Data API (free tier available)
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    
    // Map timeframes
    const tfMap = {
      'M15': '15min',
      'H1': '1h',
      'H4': '4h',
      'D1': '1day',
      'W1': '1week',
      'MN': '1month'
    };

    const interval = tfMap[timeframe] || '4h';
    
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${count}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    // Transform to our format
    return data.values?.map(candle => ({
      time: new Date(candle.datetime),
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume || 0)
    })).reverse() || [];

  } catch (error) {
    console.error(`Error fetching ${symbol} ${timeframe}:`, error);
    return null;
  }
}

// Fetch all timeframes for a symbol
async function fetchAllTimeframes(symbol) {
  const timeframes = ['M15', 'H1', 'H4', 'D1', 'W1'];
  const priceData = {};

  await Promise.all(
    timeframes.map(async (tf) => {
      const data = await fetchPriceData(symbol, tf);
      if (data && data.length > 0) {
        priceData[tf] = data;
      }
    })
  );

  return priceData;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { symbol, settings } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Initialize signal engine
    const engine = new SignalEngine(settings);

    // Fetch price data for all timeframes
    const priceData = await fetchAllTimeframes(symbol);

    if (!priceData['H4'] && !priceData['H1']) {
      return NextResponse.json(
        { error: 'Unable to fetch price data' },
        { status: 500 }
      );
    }

    // Generate signal
    const result = await engine.generateSignal(symbol, priceData);

    // If signal generated successfully, save to database
    if (result.status === 'SUCCESS' && result.signal) {
      await connectDB();
      
      const tradingSignal = new TradingSignal({
        symbol: result.signal.symbol,
        direction: result.signal.direction,
        grade: result.signal.grade,
        confluenceScore: result.signal.confluenceScore,
        confidence: result.signal.confidence,
        entry: result.signal.entry,
        stopLoss: result.signal.stopLoss,
        takeProfit1: result.signal.takeProfit1,
        takeProfit2: result.signal.takeProfit2,
        takeProfit3: result.signal.takeProfit3,
        riskRewardRatio: result.signal.riskRewardRatio,
        technicalAnalysis: {
          trend: result.signal.technicalTrend,
          score: result.analysis.technical?.score,
          indicators: result.analysis.technical?.indicators
        },
        smartMoneyAnalysis: {
          bias: result.signal.smcBias,
          orderBlocks: result.analysis.smartMoney?.orderBlocks,
          fairValueGaps: result.analysis.smartMoney?.fairValueGaps,
          marketStructure: result.analysis.smartMoney?.marketStructure
        },
        patternAnalysis: {
          patterns: result.signal.topPatterns,
          bias: result.analysis.patterns?.summary?.bias
        },
        multiTimeframeAnalysis: {
          aligned: result.signal.mtfAlignment,
          overallBias: result.analysis.multiTimeframe?.overallBias
        },
        aiAnalysis: {
          reasoning: result.signal.reasoning,
          keyFactors: result.signal.keyFactors,
          risks: result.signal.risks,
          invalidation: result.signal.invalidation
        },
        confluenceBreakdown: result.signal.confluenceBreakdown,
        status: 'ACTIVE',
        createdAt: new Date()
      });

      await tradingSignal.save();
      result.signalId = tradingSignal._id;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Generate Signal Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
