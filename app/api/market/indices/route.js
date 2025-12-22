import { NextResponse } from 'next/server';

// Cache
let cachedIndices = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

const INDICES = [
    { symbol: '^GSPC', name: 'S&P 500', nameAr: 'إس آند بي 500' },
    { symbol: '^DJI', name: 'Dow Jones', nameAr: 'داو جونز' },
    { symbol: '^IXIC', name: 'NASDAQ', nameAr: 'ناسداك' },
    { symbol: '^VIX', name: 'VIX', nameAr: 'مؤشر الخوف' }
];

const MINING_STOCKS = [
    { symbol: 'GDX', name: 'Gold Miners ETF', nameAr: 'صندوق شركات التعدين' },
    { symbol: 'GDXJ', name: 'Junior Gold Miners', nameAr: 'شركات التعدين الصغيرة' }
];

/**
 * Fetch REAL indices data from Yahoo Finance
 * NO FALLBACK - Returns 0 if data unavailable
 */
async function fetchIndicesData() {
    const indices = [];
    let hasAnyRealData = false;
    
    for (const index of [...INDICES, ...MINING_STOCKS]) {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=5d`,
                { next: { revalidate: 300 } }
            );
            
            if (response.ok) {
                const data = await response.json();
                const result = data.chart?.result?.[0];
                
                if (result) {
                    const quote = result.indicators.quote[0];
                    const timestamps = result.timestamp;
                    const closes = quote.close;
                    
                    // Get last valid values
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
                        hasAnyRealData = true;
                        indices.push({
                            symbol: index.symbol,
                            name: index.name,
                            nameAr: index.nameAr,
                            value: parseFloat(current.toFixed(2)),
                            change: previous ? parseFloat((current - previous).toFixed(2)) : 0,
                            changePercent: previous ? parseFloat(((current - previous) / previous * 100).toFixed(2)) : 0,
                            isVIX: index.symbol === '^VIX',
                            isMining: index.symbol === 'GDX' || index.symbol === 'GDXJ',
                            hasRealData: true,
                            dataDate: lastTimestamp ? new Date(lastTimestamp * 1000).toISOString() : null
                        });
                        continue;
                    }
                }
            }
        } catch (e) {
            console.error(`Failed to fetch ${index.symbol}:`, e.message);
        }
        
        // NO FALLBACK - Set to 0 if unavailable
        indices.push({
            symbol: index.symbol,
            name: index.name,
            nameAr: index.nameAr,
            value: 0,
            change: 0,
            changePercent: 0,
            isVIX: index.symbol === '^VIX',
            isMining: index.symbol === 'GDX' || index.symbol === 'GDXJ',
            hasRealData: false,
            error: true,
            dataDate: null
        });
    }
    
    return { indices, hasAnyRealData };
}

/**
 * Analyze risk sentiment based on real data only
 */
function analyzeRiskSentiment(indices) {
    const sp500 = indices.find(i => i.symbol === '^GSPC' && i.hasRealData);
    const vix = indices.find(i => i.symbol === '^VIX' && i.hasRealData);
    
    if (!vix || !sp500) {
        return {
            sentiment: 'unknown',
            goldImpact: 'unknown',
            vixLevel: 'unknown',
            vixSpike: false,
            hasRealData: false
        };
    }
    
    let sentiment = 'neutral';
    let goldImpact = 'neutral';
    
    if (vix.value > 25) {
        sentiment = 'risk_off';
        goldImpact = 'bullish_for_gold';
    } else if (vix.value < 15 && sp500.changePercent > 0.5) {
        sentiment = 'risk_on';
        goldImpact = 'bearish_for_gold';
    }
    
    return {
        sentiment,
        goldImpact,
        vixLevel: vix.value > 30 ? 'extreme_fear' : vix.value > 20 ? 'elevated' : 'normal',
        vixSpike: vix.changePercent > 15,
        hasRealData: true
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedIndices && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedIndices, cached: true });
        }

        const { indices, hasAnyRealData } = await fetchIndicesData();
        const mainIndices = indices.filter(i => !i.isMining);
        const miningStocks = indices.filter(i => i.isMining);
        const riskAnalysis = analyzeRiskSentiment(indices);

        const result = {
            indices: mainIndices,
            miningStocks,
            riskAnalysis,
            hasRealData: hasAnyRealData,
            source: 'Yahoo Finance',
            lastUpdated: new Date().toISOString()
        };

        // Only cache if we have real data
        if (hasAnyRealData) {
            cachedIndices = result;
            lastFetchTime = now;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Indices API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Failed to fetch indices: ' + error.message,
            indices: INDICES.map(i => ({ ...i, value: 0, change: 0, changePercent: 0, hasRealData: false, error: true })),
            miningStocks: MINING_STOCKS.map(i => ({ ...i, value: 0, change: 0, changePercent: 0, hasRealData: false, error: true })),
            riskAnalysis: { sentiment: 'unknown', goldImpact: 'unknown', hasRealData: false },
            hasRealData: false,
            source: 'Yahoo Finance - ERROR',
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
