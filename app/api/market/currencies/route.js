import { NextResponse } from 'next/server';

// Cache
let cachedCurrencies = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Currency pairs that affect gold prices
 */
const CURRENCY_PAIRS = [
    { symbol: 'EURUSD=X', name: 'EUR/USD', nameAr: 'يورو/دولار', goldCorrelation: 0.65 },
    { symbol: 'GBPUSD=X', name: 'GBP/USD', nameAr: 'جنيه/دولار', goldCorrelation: 0.55 },
    { symbol: 'USDJPY=X', name: 'USD/JPY', nameAr: 'دولار/ين', goldCorrelation: -0.45, inverse: true },
    { symbol: 'USDCHF=X', name: 'USD/CHF', nameAr: 'دولار/فرنك', goldCorrelation: -0.60, inverse: true },
    { symbol: 'AUDUSD=X', name: 'AUD/USD', nameAr: 'أسترالي/دولار', goldCorrelation: 0.70 }
];

async function fetchCurrencyData() {
    const currencies = [];
    
    for (const pair of CURRENCY_PAIRS) {
        try {
            const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${pair.symbol}?interval=1d&range=5d`
            );
            
            if (response.ok) {
                const data = await response.json();
                const result = data.chart?.result?.[0];
                
                if (result) {
                    const quote = result.indicators.quote[0];
                    const closes = quote.close.filter(c => c !== null);
                    const current = closes[closes.length - 1];
                    const previous = closes[closes.length - 2] || current;
                    
                    currencies.push({
                        ...pair,
                        value: parseFloat(current.toFixed(5)),
                        change: parseFloat((current - previous).toFixed(5)),
                        changePercent: parseFloat(((current - previous) / previous * 100).toFixed(2))
                    });
                    continue;
                }
            }
        } catch (e) {
            console.log(`Failed to fetch ${pair.symbol}`);
        }
        
        // Fallback to generated data
        currencies.push(generateCurrencyData(pair));
    }
    
    return currencies;
}

function generateCurrencyData(pair) {
    const baseValues = {
        'EURUSD=X': 1.05,
        'GBPUSD=X': 1.27,
        'USDJPY=X': 150.5,
        'USDCHF=X': 0.88,
        'AUDUSD=X': 0.64
    };
    
    const base = baseValues[pair.symbol] || 1;
    const variance = (Math.random() - 0.5) * (base * 0.02);
    const value = base + variance;
    const change = (Math.random() - 0.5) * (base * 0.01);
    
    return {
        ...pair,
        value: parseFloat(value.toFixed(5)),
        change: parseFloat(change.toFixed(5)),
        changePercent: parseFloat(((change / value) * 100).toFixed(2))
    };
}

/**
 * Calculate currency strength index
 */
function calculateCurrencyStrength(currencies) {
    const strength = {
        USD: 50,
        EUR: 50,
        GBP: 50,
        JPY: 50,
        CHF: 50,
        AUD: 50
    };
    
    currencies.forEach(c => {
        const change = c.changePercent;
        
        if (c.symbol === 'EURUSD=X') {
            strength.EUR += change * 10;
            strength.USD -= change * 10;
        } else if (c.symbol === 'GBPUSD=X') {
            strength.GBP += change * 10;
            strength.USD -= change * 10;
        } else if (c.symbol === 'USDJPY=X') {
            strength.USD += change * 10;
            strength.JPY -= change * 10;
        } else if (c.symbol === 'USDCHF=X') {
            strength.USD += change * 10;
            strength.CHF -= change * 10;
        } else if (c.symbol === 'AUDUSD=X') {
            strength.AUD += change * 10;
            strength.USD -= change * 10;
        }
    });
    
    // Normalize to 0-100
    Object.keys(strength).forEach(key => {
        strength[key] = Math.max(0, Math.min(100, Math.round(strength[key])));
    });
    
    return strength;
}

/**
 * Check if currencies are aligned (all moving same direction vs USD)
 */
function checkCurrencyAlignment(currencies) {
    const usdBearish = currencies.filter(c => {
        if (c.inverse) return c.changePercent < 0;
        return c.changePercent > 0;
    }).length;
    
    const usdBullish = currencies.filter(c => {
        if (c.inverse) return c.changePercent > 0;
        return c.changePercent < 0;
    }).length;
    
    if (usdBearish >= 4) return { aligned: true, direction: 'usd_weak', goldImpact: 'bullish' };
    if (usdBullish >= 4) return { aligned: true, direction: 'usd_strong', goldImpact: 'bearish' };
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

        const currencies = await fetchCurrencyData();
        const strength = calculateCurrencyStrength(currencies);
        const alignment = checkCurrencyAlignment(currencies);

        const result = {
            currencies,
            strength,
            alignment,
            analysis: {
                usdTrend: strength.USD > 55 ? 'bullish' : strength.USD < 45 ? 'bearish' : 'neutral',
                goldImpact: alignment.goldImpact,
                summary: alignment.aligned 
                    ? `Currencies ${alignment.direction === 'usd_weak' ? 'aligned against' : 'aligned with'} USD`
                    : 'Mixed currency movements'
            },
            lastUpdated: new Date().toISOString()
        };

        cachedCurrencies = result;
        lastFetchTime = now;

        return NextResponse.json(result);
    } catch (error) {
        console.error('Currencies API error:', error);
        if (cachedCurrencies) {
            return NextResponse.json({ ...cachedCurrencies, cached: true, stale: true });
        }
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 });
    }
}
