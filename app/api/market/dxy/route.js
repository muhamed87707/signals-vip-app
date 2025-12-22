import { NextResponse } from 'next/server';

// Cache
let cachedDXY = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Fetch REAL DXY (Dollar Index) data from Yahoo Finance
 * NO FALLBACK - Returns 0 if data unavailable
 */
async function fetchDXYData() {
    try {
        const response = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?interval=1d&range=3mo',
            { next: { revalidate: 300 } }
        );
        
        if (response.ok) {
            const data = await response.json();
            const result = data.chart?.result?.[0];
            
            if (result) {
                const quote = result.indicators.quote[0];
                const timestamps = result.timestamp;
                const closes = quote.close;
                const highs = quote.high;
                const lows = quote.low;
                
                // Get valid data points
                const validData = [];
                for (let i = 0; i < closes.length; i++) {
                    if (closes[i] !== null) {
                        validData.push({
                            timestamp: timestamps[i],
                            close: closes[i],
                            high: highs[i],
                            low: lows[i]
                        });
                    }
                }
                
                if (validData.length > 0) {
                    const current = validData[validData.length - 1];
                    const previous = validData[validData.length - 2] || current;
                    const weekAgo = validData[validData.length - 6] || previous;
                    
                    // Calculate 52-week high/low from available data
                    const allCloses = validData.map(d => d.close);
                    const high52w = Math.max(...allCloses);
                    const low52w = Math.min(...allCloses);
                    
                    // Historical data for chart
                    const historicalData = validData.slice(-30).map(d => ({
                        date: new Date(d.timestamp * 1000).toISOString().split('T')[0],
                        value: parseFloat(d.close.toFixed(3))
                    }));

                    return {
                        hasRealData: true,
                        value: parseFloat(current.close.toFixed(3)),
                        change: parseFloat((current.close - previous.close).toFixed(3)),
                        changePercent: parseFloat(((current.close - previous.close) / previous.close * 100).toFixed(2)),
                        weekChange: parseFloat((current.close - weekAgo.close).toFixed(3)),
                        weekChangePercent: parseFloat(((current.close - weekAgo.close) / weekAgo.close * 100).toFixed(2)),
                        high52w: parseFloat(high52w.toFixed(3)),
                        low52w: parseFloat(low52w.toFixed(3)),
                        historicalData,
                        dataDate: new Date(current.timestamp * 1000).toISOString()
                    };
                }
            }
        }
    } catch (e) {
        console.error('Yahoo Finance DXY error:', e.message);
    }

    // NO FALLBACK - Return zeros
    return {
        hasRealData: false,
        error: true,
        message: 'Unable to fetch real DXY data',
        value: 0,
        change: 0,
        changePercent: 0,
        weekChange: 0,
        weekChangePercent: 0,
        high52w: 0,
        low52w: 0,
        historicalData: [],
        dataDate: null
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedDXY && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedDXY, cached: true });
        }

        const dxyData = await fetchDXYData();

        // Technical levels - only calculate if we have real data
        const technicalLevels = dxyData.hasRealData ? {
            support: [
                parseFloat((dxyData.value - 1).toFixed(1)),
                parseFloat((dxyData.value - 2).toFixed(1)),
                parseFloat((dxyData.value - 3).toFixed(1))
            ],
            resistance: [
                parseFloat((dxyData.value + 1).toFixed(1)),
                parseFloat((dxyData.value + 2).toFixed(1)),
                parseFloat((dxyData.value + 3).toFixed(1))
            ],
            pivot: parseFloat(dxyData.value.toFixed(1))
        } : null;

        // Analysis - only if we have real data
        const analysis = dxyData.hasRealData ? {
            trend: dxyData.change > 0.2 ? 'bullish' : dxyData.change < -0.2 ? 'bearish' : 'neutral',
            goldImpact: dxyData.change > 0 ? 'bearish_for_gold' : dxyData.change < 0 ? 'bullish_for_gold' : 'neutral',
            strength: dxyData.value > 107 ? 'strong' : dxyData.value < 100 ? 'weak' : 'moderate'
        } : null;

        // Gold correlation note (this is a known relationship, not simulated)
        const goldCorrelationNote = 'DXY and Gold typically have negative correlation (-0.7 to -0.9)';

        const result = {
            ...dxyData,
            technicalLevels,
            analysis,
            goldCorrelationNote,
            source: 'Yahoo Finance',
            lastUpdated: new Date().toISOString()
        };

        // Only cache if we have real data
        if (dxyData.hasRealData) {
            cachedDXY = result;
            lastFetchTime = now;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('DXY API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Failed to fetch DXY: ' + error.message,
            hasRealData: false,
            value: 0,
            change: 0,
            changePercent: 0,
            source: 'Yahoo Finance - ERROR',
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
