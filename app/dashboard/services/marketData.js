/**
 * Market Data Service
 * Provides mock data for development and structure for real API integration
 * 
 * To integrate real APIs later, replace the mock functions with actual API calls
 * while keeping the same return structure.
 */

// ===== MOCK DATA GENERATORS =====

/**
 * Generate realistic OHLC candlestick data for Gold (XAUUSD)
 */
export function generateGoldCandlestickData(days = 100) {
    const data = [];
    let basePrice = 2600;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random price movement
        const volatility = 15;
        const change = (Math.random() - 0.48) * volatility;
        basePrice += change;

        const open = basePrice + (Math.random() - 0.5) * 10;
        const close = basePrice + (Math.random() - 0.5) * 10;
        const high = Math.max(open, close) + Math.random() * 8;
        const low = Math.min(open, close) - Math.random() * 8;

        data.push({
            time: Math.floor(date.getTime() / 1000),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
        });
    }

    return data;
}

/**
 * Generate line chart data (for area charts)
 */
export function generateLineData(days = 100, baseValue = 100, volatility = 2) {
    const data = [];
    let value = baseValue;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        value += (Math.random() - 0.5) * volatility;

        data.push({
            time: Math.floor(date.getTime() / 1000),
            value: parseFloat(value.toFixed(2)),
        });
    }

    return data;
}

/**
 * Generate volume data
 */
export function generateVolumeData(days = 100) {
    const data = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const volume = Math.floor(Math.random() * 50000000) + 10000000;
        const isUp = Math.random() > 0.5;

        data.push({
            time: Math.floor(date.getTime() / 1000),
            value: volume,
            color: isUp ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        });
    }

    return data;
}

// ===== MACRO INDICATORS DATA =====

/**
 * Get current macro indicators data
 * Structure ready for real API integration
 */
export function getMacroIndicators() {
    return {
        us10y: {
            name: 'US 10Y Treasury',
            symbol: 'US10Y',
            value: 4.52,
            change: 0.03,
            changePercent: 0.67,
            direction: 'up',
            previousClose: 4.49,
            dayHigh: 4.55,
            dayLow: 4.48,
            weekHigh: 4.58,
            weekLow: 4.42,
            // Gold correlation: Inverse - Higher yields = Lower gold
            goldImpact: 'bearish',
            goldImpactStrength: 0.72, // Correlation strength
        },
        dxy: {
            name: 'US Dollar Index',
            symbol: 'DXY',
            value: 104.25,
            change: -0.15,
            changePercent: -0.14,
            direction: 'down',
            previousClose: 104.40,
            dayHigh: 104.52,
            dayLow: 104.18,
            weekHigh: 104.85,
            weekLow: 103.92,
            // Gold correlation: Inverse - Weaker dollar = Higher gold
            goldImpact: 'bullish',
            goldImpactStrength: 0.85,
        },
        realYields: {
            name: 'Real Yields (10Y TIPS)',
            symbol: 'TIPS10Y',
            value: 2.15,
            change: 0.02,
            changePercent: 0.94,
            direction: 'up',
            previousClose: 2.13,
            dayHigh: 2.18,
            dayLow: 2.12,
            weekHigh: 2.22,
            weekLow: 2.08,
            // Gold correlation: Strong inverse - Higher real yields = Lower gold
            goldImpact: 'bearish',
            goldImpactStrength: 0.88,
        },
        fedFundsRate: {
            name: 'Fed Funds Rate',
            symbol: 'FEDFUNDS',
            value: 5.33,
            change: 0,
            changePercent: 0,
            direction: 'neutral',
            target: '5.25-5.50%',
            nextMeeting: '2024-01-31',
            marketExpectation: 'Hold',
            goldImpact: 'neutral',
            goldImpactStrength: 0.65,
        },
        inflation: {
            name: 'CPI YoY',
            symbol: 'USCPI',
            value: 3.4,
            change: 0.2,
            changePercent: 6.25,
            direction: 'up',
            previousReading: 3.2,
            fedTarget: 2.0,
            // Gold correlation: Positive - Higher inflation = Higher gold (hedge)
            goldImpact: 'bullish',
            goldImpactStrength: 0.70,
        },
    };
}

// ===== CROSS-ASSET DATA =====

/**
 * Get cross-asset prices for correlation matrix
 */
export function getCrossAssetData() {
    return {
        gold: {
            symbol: 'XAU/USD',
            name: 'Gold',
            price: 2648.50,
            change: 11.85,
            changePercent: 0.45,
            direction: 'up',
            dayHigh: 2665.80,
            dayLow: 2632.15,
        },
        silver: {
            symbol: 'XAG/USD',
            name: 'Silver',
            price: 31.25,
            change: 0.42,
            changePercent: 1.36,
            direction: 'up',
            dayHigh: 31.58,
            dayLow: 30.82,
            goldRatio: 84.75, // Gold/Silver ratio
        },
        oil: {
            symbol: 'WTI',
            name: 'Crude Oil',
            price: 72.85,
            change: -0.65,
            changePercent: -0.88,
            direction: 'down',
            dayHigh: 73.92,
            dayLow: 72.45,
        },
        sp500: {
            symbol: 'SPX',
            name: 'S&P 500',
            price: 4768.50,
            change: 13.25,
            changePercent: 0.28,
            direction: 'up',
            dayHigh: 4775.20,
            dayLow: 4752.80,
        },
        bitcoin: {
            symbol: 'BTC/USD',
            name: 'Bitcoin',
            price: 43250,
            change: 985,
            changePercent: 2.33,
            direction: 'up',
            dayHigh: 43850,
            dayLow: 42180,
        },
        eurusd: {
            symbol: 'EUR/USD',
            name: 'Euro',
            price: 1.0485,
            change: 0.0008,
            changePercent: 0.08,
            direction: 'up',
            dayHigh: 1.0512,
            dayLow: 1.0468,
        },
    };
}

// ===== CORRELATION MATRIX =====

/**
 * Get correlation matrix data
 * Values range from -1 (perfect inverse) to +1 (perfect positive)
 */
export function getCorrelationMatrix() {
    return {
        gold: {
            gold: 1.00,
            silver: 0.92,
            oil: 0.35,
            sp500: 0.15,
            dxy: -0.85,
            us10y: -0.72,
            bitcoin: 0.45,
        },
        silver: {
            gold: 0.92,
            silver: 1.00,
            oil: 0.42,
            sp500: 0.22,
            dxy: -0.78,
            us10y: -0.65,
            bitcoin: 0.52,
        },
        oil: {
            gold: 0.35,
            silver: 0.42,
            oil: 1.00,
            sp500: 0.48,
            dxy: -0.55,
            us10y: 0.25,
            bitcoin: 0.28,
        },
    };
}

// ===== REAL-TIME PRICE SIMULATION =====

/**
 * Simulate real-time price updates
 * Returns a function to get the next price tick
 */
export function createPriceSimulator(basePrice, volatility = 0.5) {
    let currentPrice = basePrice;

    return () => {
        const change = (Math.random() - 0.5) * volatility;
        currentPrice += change;

        return {
            price: parseFloat(currentPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            timestamp: Date.now(),
        };
    };
}

// ===== API INTEGRATION HELPERS =====

/**
 * Placeholder for real API integration
 * Replace these with actual API calls when ready
 */
export const MarketDataAPI = {
    // Gold price from external API
    async getGoldPrice() {
        // TODO: Replace with real API call
        // Example: return fetch('https://api.example.com/gold').then(r => r.json());
        return getCrossAssetData().gold;
    },

    // Treasury yields from FRED or similar
    async getTreasuryYields() {
        // TODO: Replace with real API call
        return getMacroIndicators().us10y;
    },

    // Dollar index
    async getDXY() {
        // TODO: Replace with real API call
        return getMacroIndicators().dxy;
    },

    // Historical OHLC data
    async getHistoricalData(symbol, interval = '1D', limit = 100) {
        // TODO: Replace with real API call
        return generateGoldCandlestickData(limit);
    },
};

export default MarketDataAPI;
