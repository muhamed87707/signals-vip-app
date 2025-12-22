import { NextResponse } from 'next/server';

// Cache
let cachedCurrencies = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Currency pairs that affect gold prices
 * Gold correlation values are based on historical analysis (not simulated)
 */
const CURRENCY_PAIRS = [
    { symbol: 'EURUSD=X', name: 'EUR/USD', nameAr: 'يورو/دولار', typicalGoldCorrelation: 0.65 },
    { symbol: 'GBPUSD=X', name: 'GBP/USD', nameAr: 'جنيه/دولار', typicalGoldCorrelation: 0.55 },
    { symbol: 'USDJPY=X', name: 'USD/JPY', nameAr: 'دولار/ين', typicalGoldCorrelation: -0.45, inverse: true },
    { symbol: 'USDCHF=X', name: 'USD/CHF', nameAr: 'دولار/فرنك', typicalGoldCorrelation: -0.60, inverse: true },
    { symbol: 'AUDUSD=X', name: 'AUD/USD', nameAr: 'أسترالي/دولار', typicalGoldCorrelation: 0.70 }
];

/**
 * Fetch REAL currency data from Yahoo Finance
 * NO FALLBACK - Returns 0 if data unavailable
 */
async function fetchCurrencyData() {
    const currencies = [];
    let hasAnyRealData = false;
    
    for (const pair of CURRENCY_PAIRS) {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${pair.symbol}?interval=1d&range=5d`,
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
                        currencies.push({
                            symbol: pair.symbol,
                            name: pair.name,
                            nameAr: pair.nameAr,
                            inverse: pair.inverse || false,
                            typicalGoldCorrelation: pair.typicalGoldCorrelation,
                            value: parseFloat(current.toFixed(5)),
                            change: previous ? parseFloat((current - previous).toFixed(5)) : 0,
                            changePercent: previous ? parseFloat(((current - previous) / previous * 100).toFixed(2)) : 0,
                            hasRealData: true,
                            dataDate: lastTimestamp ? new Date(lastTimestamp * 1000).toISOString() : null
                        });
                        continue;
                    }
                }
            }
        } catch (e) {
            console.error(`Failed to fetch ${pair.symbol}:`, e.message);
        }
        
        // NO FALLBACK - Set to 0 if unavailable
        currencies.push({
            symbol: pair.symbol,
            name: pair.name,
            nameAr: pair.nameAr,
            inverse: pair.inverse || false,
            typicalGoldCorrelation: pair.typicalGoldCorrelation,
            value: 0,
            change: 0,
            changePercent: 0,
            hasRealData: false,
            error: true,
            dataDate: null
        });
    }
    
    return { currencies, hasAnyRealData };
}

/**
 * Check if currencies are aligned (all moving same direction vs USD)
 * Only calculate if we have real data
 */
function checkCurrencyAlignment(currencies) {
    const validCurrencies = currencies.filter(c => c.hasRealData);
    
    if (validCurrencies.length < 3) {
        return { aligned: false, direction: 'insufficient_data', goldImpact: 'unknown' };
    }
    
    const usdBearish = validCurrencies.filter(c => {
        if (c.inverse) return c.changePercent < 0;
        return c.changePercent > 0;
    }).length;
    
    const usdBullish = validCurrencies.filter(c => {
        if (c.inverse) return c.changePercent > 0;
        return c.changePercent < 0;
    }).length;
    
    if (usdBearish >= 4) return { aligned: true, direction: 'usd_weak', goldImpact: 'bullish_for_gold' };
    if (usdBullish >= 4) return { aligned: true, direction: 'usd_strong', goldImpact: 'bearish_for_gold' };
    return { aligned: false, direction: 'mixed', goldImpact: 'neutral' };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedCurrencies && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedCurrencies, cached: true });
        }

        const { currencies, hasAnyRealData } = await fetchCurrencyData();
        const alignment = checkCurrencyAlignment(currencies);

        const result = {
            currencies,
            hasRealData: hasAnyRealData,
            alignment,
            analysis: hasAnyRealData ? {
                goldImpact: alignment.goldImpact,
                summary: alignment.aligned 
                    ? `Currencies ${alignment.direction === 'usd_weak' ? 'aligned against' : 'aligned with'} USD`
                    : 'Mixed currency movements'
            } : null,
            source: 'Yahoo Finance',
            lastUpdated: new Date().toISOString()
        };

        // Only cache if we have real data
        if (hasAnyRealData) {
            cachedCurrencies = result;
            lastFetchTime = now;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Currencies API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Failed to fetch currencies: ' + error.message,
            currencies: CURRENCY_PAIRS.map(p => ({
                ...p,
                value: 0,
                change: 0,
                changePercent: 0,
                hasRealData: false,
                error: true
            })),
            hasRealData: false,
            source: 'Yahoo Finance - ERROR',
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
