import { NextResponse } from 'next/server';

// Cache
let cachedYields = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Fetch REAL Treasury yields from Yahoo Finance
 * NO FALLBACK - Returns 0 if data unavailable
 */
async function fetchTreasuryYields() {
    const symbols = [
        { symbol: '^IRX', name: '3M' },   // 13-week T-Bill
        { symbol: '^FVX', name: '5Y' },   // 5-Year Treasury
        { symbol: '^TNX', name: '10Y' },  // 10-Year Treasury
        { symbol: '^TYX', name: '30Y' }   // 30-Year Treasury
    ];
    
    const yields = {};
    let hasRealData = false;
    let dataTimestamp = null;

    for (const { symbol, name } of symbols) {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
                { next: { revalidate: 300 } }
            );
            
            if (response.ok) {
                const data = await response.json();
                const result = data.chart?.result?.[0];
                
                if (result) {
                    const quote = result.indicators.quote[0];
                    const timestamps = result.timestamp;
                    const closes = quote.close;
                    
                    // Get last valid close
                    let current = null;
                    let previous = null;
                    let lastTimestamp = null;
                    
                    for (let i = closes.length - 1; i >= 0; i--) {
                        if (closes[i] !== null) {
                            if (current === null) {
                                current = closes[i];
                                lastTimestamp = timestamps[i];
                            } else if (previous === null) {
                                previous = closes[i];
                                break;
                            }
                        }
                    }
                    
                    if (current !== null) {
                        hasRealData = true;
                        if (!dataTimestamp && lastTimestamp) {
                            dataTimestamp = new Date(lastTimestamp * 1000).toISOString();
                        }
                        
                        yields[name] = {
                            value: parseFloat(current.toFixed(3)),
                            change: previous ? parseFloat((current - previous).toFixed(3)) : 0,
                            changePercent: previous ? parseFloat(((current - previous) / previous * 100).toFixed(2)) : 0,
                            dataDate: lastTimestamp ? new Date(lastTimestamp * 1000).toISOString().split('T')[0] : null
                        };
                        continue;
                    }
                }
            }
        } catch (e) {
            console.error(`Failed to fetch ${symbol}:`, e.message);
        }
        
        // NO FALLBACK - Set to 0 if unavailable
        yields[name] = {
            value: 0,
            change: 0,
            changePercent: 0,
            dataDate: null,
            error: true
        };
    }

    // Calculate spread and analysis only if we have real data
    const spread2s10s = yields['10Y'].value && yields['5Y'].value 
        ? parseFloat((yields['10Y'].value - yields['5Y'].value).toFixed(3))
        : 0;
    
    const isInverted = spread2s10s < 0;
    
    // Real yield calculation (10Y - inflation expectation)
    // Note: This uses an estimate for inflation expectation
    const inflationExpectation = 2.5; // This should ideally come from TIPS breakeven
    const realYield = yields['10Y'].value 
        ? parseFloat((yields['10Y'].value - inflationExpectation).toFixed(3))
        : 0;

    return {
        yields,
        spread2s10s,
        isInverted,
        realYield,
        inflationExpectation,
        hasRealData,
        analysis: hasRealData ? {
            yieldCurve: isInverted ? 'inverted' : spread2s10s < 0.5 ? 'flat' : 'normal',
            realYieldImpact: realYield > 2 ? 'bearish_for_gold' : realYield < 1 ? 'bullish_for_gold' : 'neutral',
            trend: yields['10Y'].change > 0 ? 'rising' : yields['10Y'].change < 0 ? 'falling' : 'stable'
        } : null,
        source: 'Yahoo Finance',
        dataDate: dataTimestamp,
        lastUpdated: new Date().toISOString()
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedYields && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedYields, cached: true });
        }

        const yields = await fetchTreasuryYields();
        
        // Only cache if we have real data
        if (yields.hasRealData) {
            cachedYields = yields;
            lastFetchTime = now;
        }

        return NextResponse.json(yields);
    } catch (error) {
        console.error('Treasury yields API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Failed to fetch treasury yields: ' + error.message,
            yields: {
                '3M': { value: 0, change: 0, changePercent: 0, error: true },
                '5Y': { value: 0, change: 0, changePercent: 0, error: true },
                '10Y': { value: 0, change: 0, changePercent: 0, error: true },
                '30Y': { value: 0, change: 0, changePercent: 0, error: true }
            },
            spread2s10s: 0,
            isInverted: false,
            realYield: 0,
            hasRealData: false,
            source: 'Yahoo Finance - ERROR',
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
