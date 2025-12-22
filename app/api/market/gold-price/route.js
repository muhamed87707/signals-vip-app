import { NextResponse } from 'next/server';

// Cache for gold price data
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Fetch gold price from Yahoo Finance API
 */
async function fetchGoldPrice() {
    try {
        // Yahoo Finance API for Gold (GC=F is Gold Futures)
        const response = await fetch(
            'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=5d',
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                next: { revalidate: 30 }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from Yahoo Finance');
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];
        
        if (!result) {
            throw new Error('Invalid response structure');
        }

        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        const timestamps = result.timestamp;

        // Get current price
        const currentPrice = meta.regularMarketPrice || quote?.close?.[quote.close.length - 1];
        const previousClose = meta.previousClose || meta.chartPreviousClose;
        
        // Calculate change
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        // Get high/low from recent data
        const recentHighs = quote?.high?.slice(-5) || [];
        const recentLows = quote?.low?.slice(-5) || [];
        const high24h = Math.max(...recentHighs.filter(v => v));
        const low24h = Math.min(...recentLows.filter(v => v));

        // Determine trend
        let trend = 'neutral';
        if (changePercent > 0.3) trend = 'bullish';
        else if (changePercent < -0.3) trend = 'bearish';

        return {
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            previousClose: previousClose,
            high24h: high24h,
            low24h: low24h,
            open: meta.regularMarketOpen || quote?.open?.[quote.open.length - 1],
            timestamp: new Date().toISOString(),
            marketStatus: meta.marketState === 'REGULAR' ? 'open' : 'closed',
            trend: trend,
            source: 'Yahoo Finance',
            symbol: 'XAU/USD'
        };
    } catch (error) {
        console.error('Yahoo Finance error:', error);
        // Fallback to alternative source or return cached/mock data
        return fetchFallbackPrice();
    }
}

/**
 * Fallback price fetcher using alternative API
 */
async function fetchFallbackPrice() {
    try {
        // Try alternative free API
        const response = await fetch(
            'https://api.metals.live/v1/spot/gold',
            { next: { revalidate: 30 } }
        );

        if (response.ok) {
            const data = await response.json();
            if (data && data[0]) {
                const price = data[0].price;
                return {
                    price: price,
                    change: 0,
                    changePercent: 0,
                    previousClose: price,
                    high24h: price,
                    low24h: price,
                    open: price,
                    timestamp: new Date().toISOString(),
                    marketStatus: 'unknown',
                    trend: 'neutral',
                    source: 'Metals.live',
                    symbol: 'XAU/USD'
                };
            }
        }
    } catch (e) {
        console.error('Fallback API error:', e);
    }

    // Return mock data as last resort
    return getMockGoldPrice();
}

/**
 * Mock gold price for development/fallback
 */
function getMockGoldPrice() {
    const basePrice = 2650;
    const randomChange = (Math.random() - 0.5) * 30;
    const price = basePrice + randomChange;
    const change = randomChange;
    const changePercent = (change / basePrice) * 100;

    return {
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        previousClose: basePrice,
        high24h: parseFloat((price + Math.random() * 15).toFixed(2)),
        low24h: parseFloat((price - Math.random() * 15).toFixed(2)),
        open: parseFloat((basePrice + (Math.random() - 0.5) * 10).toFixed(2)),
        timestamp: new Date().toISOString(),
        marketStatus: 'simulated',
        trend: change > 5 ? 'bullish' : change < -5 ? 'bearish' : 'neutral',
        source: 'Mock Data',
        symbol: 'XAU/USD'
    };
}

export async function GET(request) {
    try {
        const now = Date.now();
        
        // Return cached data if still valid
        if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json(cachedData, {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Fetch fresh data
        const goldData = await fetchGoldPrice();
        
        // Update cache
        cachedData = goldData;
        lastFetchTime = now;

        return NextResponse.json(goldData, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                'X-Cache': 'MISS'
            }
        });
    } catch (error) {
        console.error('Gold price API error:', error);
        
        // Return cached data on error if available
        if (cachedData) {
            return NextResponse.json({
                ...cachedData,
                isStale: true
            }, {
                headers: {
                    'X-Cache': 'STALE'
                }
            });
        }

        return NextResponse.json(
            { error: 'Failed to fetch gold price', message: error.message },
            { status: 500 }
        );
    }
}
