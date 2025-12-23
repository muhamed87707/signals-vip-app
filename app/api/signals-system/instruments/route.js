/**
 * Instruments API Route
 * GET: Get supported trading instruments
 */

import { NextResponse } from 'next/server';

// Supported instruments configuration
const INSTRUMENTS = {
  forex: {
    majors: [
      { symbol: 'EURUSD', name: 'Euro / US Dollar', pip: 0.0001, spread: 0.8 },
      { symbol: 'GBPUSD', name: 'British Pound / US Dollar', pip: 0.0001, spread: 1.0 },
      { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', pip: 0.01, spread: 0.9 },
      { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', pip: 0.0001, spread: 1.2 },
      { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', pip: 0.0001, spread: 1.0 },
      { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', pip: 0.0001, spread: 1.5 },
      { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', pip: 0.0001, spread: 1.2 },
    ],
    crosses: [
      { symbol: 'EURGBP', name: 'Euro / British Pound', pip: 0.0001, spread: 1.2 },
      { symbol: 'EURJPY', name: 'Euro / Japanese Yen', pip: 0.01, spread: 1.5 },
      { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', pip: 0.01, spread: 2.0 },
      { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', pip: 0.01, spread: 1.8 },
      { symbol: 'EURAUD', name: 'Euro / Australian Dollar', pip: 0.0001, spread: 2.0 },
      { symbol: 'EURCHF', name: 'Euro / Swiss Franc', pip: 0.0001, spread: 1.5 },
      { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', pip: 0.0001, spread: 2.5 },
    ],
  },
  metals: [
    { symbol: 'XAUUSD', name: 'Gold / US Dollar', pip: 0.01, spread: 25 },
    { symbol: 'XAGUSD', name: 'Silver / US Dollar', pip: 0.001, spread: 2.5 },
  ],
  indices: [
    { symbol: 'US30', name: 'Dow Jones Industrial Average', pip: 1, spread: 2.0 },
    { symbol: 'US500', name: 'S&P 500', pip: 0.1, spread: 0.5 },
    { symbol: 'US100', name: 'NASDAQ 100', pip: 0.1, spread: 1.0 },
    { symbol: 'GER40', name: 'DAX 40', pip: 0.1, spread: 1.5 },
    { symbol: 'UK100', name: 'FTSE 100', pip: 0.1, spread: 1.5 },
  ],
};

// Correlation matrix for risk management
const CORRELATIONS = {
  'EURUSD-GBPUSD': 0.85,
  'EURUSD-USDCHF': -0.90,
  'EURUSD-USDJPY': -0.30,
  'GBPUSD-EURGBP': -0.70,
  'AUDUSD-NZDUSD': 0.90,
  'XAUUSD-EURUSD': 0.40,
  'XAUUSD-USDJPY': -0.35,
  'US30-US500': 0.95,
  'US500-US100': 0.92,
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const symbol = searchParams.get('symbol');

    // If specific symbol requested, return details
    if (symbol) {
      const instrument = findInstrument(symbol.toUpperCase());
      if (!instrument) {
        return NextResponse.json(
          { success: false, error: 'Instrument not found' },
          { status: 404 }
        );
      }

      const correlations = getCorrelations(symbol.toUpperCase());
      
      return NextResponse.json({
        success: true,
        instrument,
        correlations,
      });
    }

    // If category requested, return filtered list
    if (category) {
      const instruments = getByCategory(category);
      return NextResponse.json({
        success: true,
        category,
        instruments,
        count: instruments.length,
      });
    }

    // Return all instruments
    const allInstruments = getAllInstruments();
    
    return NextResponse.json({
      success: true,
      instruments: INSTRUMENTS,
      all: allInstruments,
      count: allInstruments.length,
      correlations: CORRELATIONS,
    });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instruments' },
      { status: 500 }
    );
  }
}

function findInstrument(symbol) {
  // Search in forex majors
  let found = INSTRUMENTS.forex.majors.find(i => i.symbol === symbol);
  if (found) return { ...found, category: 'forex', subcategory: 'majors' };

  // Search in forex crosses
  found = INSTRUMENTS.forex.crosses.find(i => i.symbol === symbol);
  if (found) return { ...found, category: 'forex', subcategory: 'crosses' };

  // Search in metals
  found = INSTRUMENTS.metals.find(i => i.symbol === symbol);
  if (found) return { ...found, category: 'metals' };

  // Search in indices
  found = INSTRUMENTS.indices.find(i => i.symbol === symbol);
  if (found) return { ...found, category: 'indices' };

  return null;
}

function getByCategory(category) {
  switch (category.toLowerCase()) {
    case 'forex':
      return [...INSTRUMENTS.forex.majors, ...INSTRUMENTS.forex.crosses];
    case 'forex-majors':
      return INSTRUMENTS.forex.majors;
    case 'forex-crosses':
      return INSTRUMENTS.forex.crosses;
    case 'metals':
      return INSTRUMENTS.metals;
    case 'indices':
      return INSTRUMENTS.indices;
    default:
      return [];
  }
}

function getAllInstruments() {
  return [
    ...INSTRUMENTS.forex.majors.map(i => ({ ...i, category: 'forex', subcategory: 'majors' })),
    ...INSTRUMENTS.forex.crosses.map(i => ({ ...i, category: 'forex', subcategory: 'crosses' })),
    ...INSTRUMENTS.metals.map(i => ({ ...i, category: 'metals' })),
    ...INSTRUMENTS.indices.map(i => ({ ...i, category: 'indices' })),
  ];
}

function getCorrelations(symbol) {
  const correlations = [];
  
  for (const [pair, value] of Object.entries(CORRELATIONS)) {
    const [sym1, sym2] = pair.split('-');
    if (sym1 === symbol) {
      correlations.push({ symbol: sym2, correlation: value });
    } else if (sym2 === symbol) {
      correlations.push({ symbol: sym1, correlation: value });
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}
