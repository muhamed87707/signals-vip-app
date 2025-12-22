/**
 * API Route: Trading Performance Statistics
 * GET /api/trading/performance - Get performance stats
 */

import { NextResponse } from 'next/server';
import TradingSignal from '@/models/TradingSignal';
import SignalPerformance from '@/models/SignalPerformance';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get closed signals
    const closedSignals = await TradingSignal.find({
      status: { $in: ['TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'STOPPED_OUT', 'CLOSED'] },
      closedAt: { $gte: startDate }
    }).lean();

    // Calculate statistics
    const totalSignals = closedSignals.length;
    const wins = closedSignals.filter(s => 
      ['TP1_HIT', 'TP2_HIT', 'TP3_HIT'].includes(s.status)
    ).length;
    const losses = closedSignals.filter(s => s.status === 'STOPPED_OUT').length;

    const winRate = totalSignals > 0 ? (wins / totalSignals) * 100 : 0;

    // Calculate total pips
    let totalPips = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    closedSignals.forEach(signal => {
      if (signal.resultPips) {
        totalPips += signal.resultPips;
        if (signal.resultPips > 0) {
          totalProfit += signal.resultPips;
        } else {
          totalLoss += Math.abs(signal.resultPips);
        }
      }
    });

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    // Get by symbol breakdown
    const bySymbol = {};
    closedSignals.forEach(signal => {
      if (!bySymbol[signal.symbol]) {
        bySymbol[signal.symbol] = { wins: 0, losses: 0, pips: 0 };
      }
      if (['TP1_HIT', 'TP2_HIT', 'TP3_HIT'].includes(signal.status)) {
        bySymbol[signal.symbol].wins++;
      } else if (signal.status === 'STOPPED_OUT') {
        bySymbol[signal.symbol].losses++;
      }
      bySymbol[signal.symbol].pips += signal.resultPips || 0;
    });

    // Get by grade breakdown
    const byGrade = {
      'A+': { count: 0, wins: 0, losses: 0 },
      'A': { count: 0, wins: 0, losses: 0 }
    };

    closedSignals.forEach(signal => {
      if (byGrade[signal.grade]) {
        byGrade[signal.grade].count++;
        if (['TP1_HIT', 'TP2_HIT', 'TP3_HIT'].includes(signal.status)) {
          byGrade[signal.grade].wins++;
        } else if (signal.status === 'STOPPED_OUT') {
          byGrade[signal.grade].losses++;
        }
      }
    });

    // Get active signals count
    const activeSignals = await TradingSignal.countDocuments({ status: 'ACTIVE' });

    return NextResponse.json({
      success: true,
      period,
      stats: {
        totalSignals,
        activeSignals,
        wins,
        losses,
        winRate: Math.round(winRate * 100) / 100,
        totalPips: Math.round(totalPips * 10) / 10,
        profitFactor: Math.round(profitFactor * 100) / 100,
        averagePipsPerTrade: totalSignals > 0 ? Math.round((totalPips / totalSignals) * 10) / 10 : 0
      },
      bySymbol,
      byGrade,
      recentSignals: closedSignals.slice(0, 10).map(s => ({
        symbol: s.symbol,
        direction: s.direction,
        grade: s.grade,
        status: s.status,
        resultPips: s.resultPips,
        closedAt: s.closedAt
      }))
    });

  } catch (error) {
    console.error('Performance Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
