import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCQSH-Uu1hecLKvOz-dNp6gTiEMz3DYf-4');

// Correlation data with gold (simulated - would come from real calculations)
const correlationData = {
    '1W': {
        DXY: -0.82,
        'US10Y': -0.65,
        'US2Y': -0.58,
        'EUR/USD': 0.78,
        'GBP/USD': 0.72,
        'USD/JPY': -0.45,
        'USD/CHF': -0.68,
        'S&P500': -0.25,
        'NASDAQ': -0.30,
        'VIX': 0.55,
        'Silver': 0.92,
        'Platinum': 0.75,
        'Copper': 0.48,
        'Oil': 0.35,
        'Bitcoin': 0.28
    },
    '1M': {
        DXY: -0.78,
        'US10Y': -0.72,
        'US2Y': -0.68,
        'EUR/USD': 0.75,
        'GBP/USD': 0.68,
        'USD/JPY': -0.52,
        'USD/CHF': -0.72,
        'S&P500': -0.18,
        'NASDAQ': -0.22,
        'VIX': 0.48,
        'Silver': 0.88,
        'Platinum': 0.72,
        'Copper': 0.55,
        'Oil': 0.42,
        'Bitcoin': 0.35
    },
    '3M': {
        DXY: -0.75,
        'US10Y': -0.68,
        'US2Y': -0.62,
        'EUR/USD': 0.72,
        'GBP/USD': 0.65,
        'USD/JPY': -0.48,
        'USD/CHF': -0.70,
        'S&P500': -0.12,
        'NASDAQ': -0.15,
        'VIX': 0.42,
        'Silver': 0.85,
        'Platinum': 0.68,
        'Copper': 0.52,
        'Oil': 0.38,
        'Bitcoin': 0.42
    },
    '1Y': {
        DXY: -0.72,
        'US10Y': -0.58,
        'US2Y': -0.52,
        'EUR/USD': 0.68,
        'GBP/USD': 0.62,
        'USD/JPY': -0.42,
        'USD/CHF': -0.65,
        'S&P500': 0.15,
        'NASDAQ': 0.12,
        'VIX': 0.35,
        'Silver': 0.82,
        'Platinum': 0.65,
        'Copper': 0.58,
        'Oil': 0.32,
        'Bitcoin': 0.48
    }
};

// Historical averages for comparison
const historicalAverages = {
    DXY: -0.70,
    'US10Y': -0.55,
    'US2Y': -0.50,
    'EUR/USD': 0.68,
    'GBP/USD': 0.60,
    'USD/JPY': -0.40,
    'USD/CHF': -0.62,
    'S&P500': 0.05,
    'NASDAQ': 0.02,
    'VIX': 0.38,
    'Silver': 0.85,
    'Platinum': 0.70,
    'Copper': 0.50,
    'Oil': 0.30,
    'Bitcoin': 0.35
};

const assetCategories = {
    currencies: ['DXY', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF'],
    bonds: ['US10Y', 'US2Y'],
    indices: ['S&P500', 'NASDAQ', 'VIX'],
    commodities: ['Silver', 'Platinum', 'Copper', 'Oil'],
    crypto: ['Bitcoin']
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '1M';
        
        const currentCorrelations = correlationData[period] || correlationData['1M'];
        
        // Calculate deviations from historical averages
        const deviations = {};
        Object.keys(currentCorrelations).forEach(asset => {
            const current = currentCorrelations[asset];
            const historical = historicalAverages[asset];
            deviations[asset] = {
                current,
                historical,
                deviation: +(current - historical).toFixed(2),
                isSignificant: Math.abs(current - historical) > 0.15
            };
        });
        
        // Find strongest correlations
        const sorted = Object.entries(currentCorrelations)
            .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
        
        const strongestPositive = sorted.filter(([_, v]) => v > 0).slice(0, 3);
        const strongestNegative = sorted.filter(([_, v]) => v < 0).slice(0, 3);
        
        // Get AI analysis
        let aiAnalysis = null;
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = `Analyze these gold correlations and identify notable patterns:

Current ${period} correlations: ${JSON.stringify(currentCorrelations)}
Historical averages: ${JSON.stringify(historicalAverages)}

Return JSON only:
{
    "summary": "2-3 sentence analysis of current correlation patterns",
    "summaryAr": "Arabic translation",
    "notableChanges": ["change1", "change2"],
    "notableChangesAr": ["تغيير1", "تغيير2"],
    "tradingImplication": "bullish/bearish/neutral",
    "keyInsight": "One key insight",
    "keyInsightAr": "Arabic translation"
}`;
            
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiAnalysis = JSON.parse(jsonMatch[0]);
            }
        } catch (aiError) {
            console.error('AI analysis error:', aiError);
        }
        
        return Response.json({
            period,
            correlations: currentCorrelations,
            deviations,
            categories: assetCategories,
            highlights: {
                strongestPositive,
                strongestNegative
            },
            availablePeriods: Object.keys(correlationData),
            aiAnalysis,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Correlations error:', error);
        return Response.json({ error: 'Failed to fetch correlations' }, { status: 500 });
    }
}
