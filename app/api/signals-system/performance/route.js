/**
 * Performance API Route
 * GET: Get performance statistics
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TradingSignal from '@/models/TradingSignal';
import SignalPerformance from '@/models/SignalPerformance';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const symbol = searchParams.get('symbol');

    // Build date filter
    const dateFilter = getDateFilter(period);
    
    // Build query
    const query = {
      status: { $in: ['tp1_hit', 'tp2_hit', 'tp3_hit', 'sl_hit', 'expired'] },
      ...dateFilter,
    };
    
    if (symbol) {
      query.symbol = symbol.toUpperCase();
    }

    // Fetch closed signals
    const signals = await TradingSignal.find(query).lean();

    // Calculate performance metrics
    const performance = calculatePerformance(signals);

    // Get performance by symbol
    const bySymbol = calculateBySymbol(signals);

    // Get performance by quality
    const byQuality = calculateByQuality(signals);

    // Get equity curve data
    const equityCurve = calculateEquityCurve(signals);

    return NextResponse.json({
      success: true,
      period,
      performance,
      bySymbol,
      byQuality,
      equityCurve,
      totalSignals: signals.length,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance' },
      { status: 500 }
    );
  }
}

function getDateFilter(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'all':
    default:
      return {};
  }

  return { closedAt: { $gte: startDate } };
}

function calculatePerformance(signals) {
  if (signals.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      averageRR: 0,
      totalPips: 0,
      averagePips: 0,
      maxDrawdown: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      expectancy: 0,
    };
  }

  const wins = signals.filter(s => ['tp1_hit', 'tp2_hit', 'tp3_hit'].includes(s.status));
  const losses = signals.filter(s => s.status === 'sl_hit');
  
  const winRate = (wins.length / signals.length) * 100;
  
  // Calculate total pips
  const totalWinPips = wins.reduce((sum, s) => sum + (s.pnlPips || 0), 0);
  const totalLossPips = Math.abs(losses.reduce((sum, s) => sum + (s.pnlPips || 0), 0));
  const totalPips = totalWinPips - totalLossPips;
  
  // Profit factor
  const profitFactor = totalLossPips > 0 ? totalWinPips / totalLossPips : totalWinPips;
  
  // Average RR
  const avgWinRR = wins.length > 0 ? wins.reduce((sum, s) => sum + (s.actualRR || 0), 0) / wins.length : 0;
  const avgLossRR = losses.length > 0 ? losses.reduce((sum, s) => sum + (s.actualRR || 0), 0) / losses.length : 0;
  const averageRR = avgWinRR - Math.abs(avgLossRR);
  
  // Average pips
  const averagePips = totalPips / signals.length;
  
  // Max consecutive wins/losses
  const { maxConsecutiveWins, maxConsecutiveLosses } = calculateConsecutive(signals);
  
  // Max drawdown
  const maxDrawdown = calculateMaxDrawdown(signals);
  
  // Sharpe & Sortino ratios (simplified)
  const returns = signals.map(s => s.pnlPercent || 0);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  
  const negativeReturns = returns.filter(r => r < 0);
  const downDev = negativeReturns.length > 0 
    ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
    : 0;
  const sortinoRatio = downDev > 0 ? (avgReturn / downDev) * Math.sqrt(252) : 0;
  
  // Expectancy
  const avgWin = wins.length > 0 ? totalWinPips / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossPips / losses.length : 0;
  const expectancy = (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss);

  return {
    winRate: Math.round(winRate * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    averageRR: Math.round(averageRR * 100) / 100,
    totalPips: Math.round(totalPips * 10) / 10,
    averagePips: Math.round(averagePips * 10) / 10,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    sortinoRatio: Math.round(sortinoRatio * 100) / 100,
    expectancy: Math.round(expectancy * 10) / 10,
    totalWins: wins.length,
    totalLosses: losses.length,
  };
}

function calculateConsecutive(signals) {
  let maxWins = 0, maxLosses = 0;
  let currentWins = 0, currentLosses = 0;

  const sorted = [...signals].sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt));

  for (const signal of sorted) {
    if (['tp1_hit', 'tp2_hit', 'tp3_hit'].includes(signal.status)) {
      currentWins++;
      currentLosses = 0;
      maxWins = Math.max(maxWins, currentWins);
    } else if (signal.status === 'sl_hit') {
      currentLosses++;
      currentWins = 0;
      maxLosses = Math.max(maxLosses, currentLosses);
    }
  }

  return { maxConsecutiveWins: maxWins, maxConsecutiveLosses: maxLosses };
}

function calculateMaxDrawdown(signals) {
  const sorted = [...signals].sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt));
  
  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;

  for (const signal of sorted) {
    cumulative += signal.pnlPercent || 0;
    peak = Math.max(peak, cumulative);
    const drawdown = peak - cumulative;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown;
}

function calculateBySymbol(signals) {
  const bySymbol = {};

  for (const signal of signals) {
    if (!bySymbol[signal.symbol]) {
      bySymbol[signal.symbol] = [];
    }
    bySymbol[signal.symbol].push(signal);
  }

  const result = {};
  for (const [symbol, symbolSignals] of Object.entries(bySymbol)) {
    result[symbol] = calculatePerformance(symbolSignals);
  }

  return result;
}

function calculateByQuality(signals) {
  const byQuality = {};

  for (const signal of signals) {
    const quality = signal.quality || 'unknown';
    if (!byQuality[quality]) {
      byQuality[quality] = [];
    }
    byQuality[quality].push(signal);
  }

  const result = {};
  for (const [quality, qualitySignals] of Object.entries(byQuality)) {
    result[quality] = calculatePerformance(qualitySignals);
  }

  return result;
}

function calculateEquityCurve(signals) {
  const sorted = [...signals].sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt));
  
  let cumulative = 0;
  const curve = [];

  for (const signal of sorted) {
    cumulative += signal.pnlPercent || 0;
    curve.push({
      date: signal.closedAt,
      equity: Math.round(cumulative * 100) / 100,
      signal: signal.symbol,
      result: signal.status,
    });
  }

  return curve;
}
