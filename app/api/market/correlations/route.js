import { NextResponse } from 'next/server';

/**
 * Correlations - Calculate REAL correlations from actual price data
 * NO SIMULATED CORRELATION VALUES
 */

// Cache
let cachedCorrelations = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Fetch historical prices and calculate real correlations
 */
async function calculateRealCorrelations() {
    const assets = [
        { symbol: 'GC=F', name: 'Gold' },
        { symbol: 'DX-Y.NYB', name: 'DXY' },
        { symbol: '^TNX', name: 'US10Y' },
        { symbol: 'EURUSD=X', name: 'EUR/USD' },
        { symbol: '^GSPC', name: 'S&P500' },
        { symbol: 'SI=F', name: 'Silver' },
        { symbol: 'CL=F', name: 'Oil' },
        { symbol: '^VIX', name: 'VIX' }
    ];

    const priceData = {};
    let hasAnyData = false;

    // Fetch 30 days of data for each asset
    for (const asset of assets) {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${asset.symbol}?interval=1d&range=1mo`,
                { next: { revalidate: 3600 } }
            );

            if (response.ok) {
                const data = await response.json();
                const result = data.chart?.result?.[0];

                if (result) {
                    const closes = result.indicators.quote[0].close.filter(c => c !== null);
                    if (closes.length > 5) {
                        priceData[asset.name] = closes;
                        hasAnyData = true;
                    }
                }
            }
        } catch (e) {
            console.error(`Failed to fetch ${asset.symbol}:`, e.message);
        }
    }

    if (!hasAnyData || !priceData['Gold']) {
        return {
            error: true,
            message: 'Unable to calculate correlations - insufficient price data',
            correlations: {},
            hasRealData: false,
            source: 'Yahoo Finance - INSUFFICIENT DATA',
            lastUpdated: new Date().toISOString()
        };
    }

    // Calculate correlations with Gold
    const correlations = {};
    const goldPrices = priceData['Gold'];

    for (const [assetName, prices] of Object.entries(priceData)) {
        if (assetName === 'Gold') continue;

        // Align data lengths
        const minLength = Math.min(goldPrices.length, prices.length);
        const goldSlice = goldPrices.slice(-minLength);
        const assetSlice = prices.slice(-minLength);

        if (minLength >= 5) {
            const correlation = calculatePearsonCorrelation(goldSlice, assetSlice);
            correlations[assetName] = {
                value: parseFloat(correlation.toFixed(3)),
                dataPoints: minLength,
                hasRealData: true
            };
        }
    }

    // Sort by absolute correlation value
    const sorted = Object.entries(correlations)
        .sort((a, b) => Math.abs(b[1].value) - Math.abs(a[1].value));

    const strongestPositive = sorted.filter(([_, v]) => v.value > 0).slice(0, 3);
    const strongestNegative = sorted.filter(([_, v]) => v.value < 0).slice(0, 3);

    return {
        error: false,
        period: '1M',
        correlations,
        highlights: {
            strongestPositive: strongestPositive.map(([name, data]) => ({ name, ...data })),
            strongestNegative: strongestNegative.map(([name, data]) => ({ name, ...data }))
        },
        hasRealData: true,
        note: 'Correlations calculated from actual 30-day price data',
        noteAr: 'الارتباطات محسوبة من بيانات الأسعار الفعلية لـ 30 يوم',
        source: 'Yahoo Finance (Calculated)',
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x, y) {
    const n = x.length;
    if (n !== y.length || n < 2) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';

        const now = Date.now();

        if (!forceRefresh && cachedCorrelations && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedCorrelations, cached: true });
        }

        const correlations = await calculateRealCorrelations();

        // Only cache if we have real data
        if (correlations.hasRealData) {
            cachedCorrelations = correlations;
            lastFetchTime = now;
        }

        return NextResponse.json(correlations);
    } catch (error) {
        console.error('Correlations error:', error);
        return NextResponse.json({
            error: true,
            message: 'Failed to calculate correlations: ' + error.message,
            correlations: {},
            hasRealData: false,
            source: 'ERROR',
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
