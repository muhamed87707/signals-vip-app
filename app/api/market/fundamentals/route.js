import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCQSH-Uu1hecLKvOz-dNp6gTiEMz3DYf-4');

// Fundamental data (would be updated from real sources)
const fundamentalData = {
    supplyDemand: {
        annualSupply: 4800, // tonnes
        mineProduction: 3600,
        recycling: 1200,
        annualDemand: 4900,
        jewelry: 2100,
        investment: 1200,
        centralBanks: 1000,
        technology: 300,
        other: 300,
        deficit: 100 // demand - supply
    },
    regionalDemand: [
        { region: 'China', regionAr: 'الصين', percentage: 28, trend: 'up' },
        { region: 'India', regionAr: 'الهند', percentage: 24, trend: 'up' },
        { region: 'Middle East', regionAr: 'الشرق الأوسط', percentage: 12, trend: 'stable' },
        { region: 'Europe', regionAr: 'أوروبا', percentage: 15, trend: 'down' },
        { region: 'North America', regionAr: 'أمريكا الشمالية', percentage: 12, trend: 'stable' },
        { region: 'Others', regionAr: 'أخرى', percentage: 9, trend: 'up' }
    ],
    etfHoldings: {
        totalTonnes: 3150,
        change1W: -12,
        change1M: -28,
        change3M: 45,
        changeYTD: 120,
        majorETFs: [
            { name: 'SPDR Gold (GLD)', holdings: 870, change: -5 },
            { name: 'iShares Gold (IAU)', holdings: 420, change: -2 },
            { name: 'SPDR Gold Mini (GLDM)', holdings: 85, change: 1 },
            { name: 'Aberdeen Physical Gold', holdings: 180, change: -1 }
        ]
    },
    centralBanks: {
        totalReserves: 36500, // tonnes
        ytdNetPurchases: 800,
        topBuyers: [
            { country: 'China', countryAr: 'الصين', purchases: 225, reserves: 2250 },
            { country: 'Poland', countryAr: 'بولندا', purchases: 130, reserves: 420 },
            { country: 'Turkey', countryAr: 'تركيا', purchases: 95, reserves: 580 },
            { country: 'India', countryAr: 'الهند', purchases: 75, reserves: 840 },
            { country: 'Czech Republic', countryAr: 'التشيك', purchases: 45, reserves: 45 }
        ],
        topHolders: [
            { country: 'USA', countryAr: 'أمريكا', reserves: 8133 },
            { country: 'Germany', countryAr: 'ألمانيا', reserves: 3352 },
            { country: 'Italy', countryAr: 'إيطاليا', reserves: 2452 },
            { country: 'France', countryAr: 'فرنسا', reserves: 2437 },
            { country: 'Russia', countryAr: 'روسيا', reserves: 2333 }
        ]
    },
    seasonality: {
        currentMonth: 'December',
        historicalPerformance: 1.2, // average % change
        strongMonths: ['January', 'August', 'September'],
        weakMonths: ['March', 'June'],
        pattern: 'Historically positive in December due to year-end positioning'
    },
    productionCosts: {
        aisc: 1350, // All-in sustaining cost per oz
        marginalCost: 1500,
        topProducers: [
            { company: 'Newmont', cost: 1275 },
            { company: 'Barrick', cost: 1320 },
            { company: 'Agnico Eagle', cost: 1180 },
            { company: 'Kinross', cost: 1450 }
        ]
    }
};

export async function GET() {
    try {
        // Get AI analysis
        let aiAnalysis = null;
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = `Analyze these gold fundamental data and provide insights:

Supply/Demand: ${JSON.stringify(fundamentalData.supplyDemand)}
ETF Holdings: Total ${fundamentalData.etfHoldings.totalTonnes}t, 1M change: ${fundamentalData.etfHoldings.change1M}t
Central Bank Purchases YTD: ${fundamentalData.centralBanks.ytdNetPurchases}t
Production Cost (AISC): $${fundamentalData.productionCosts.aisc}/oz

Return JSON only:
{
    "summary": "3-4 sentence fundamental analysis",
    "summaryAr": "Arabic translation",
    "supplyDemandOutlook": "bullish/bearish/neutral",
    "etfTrend": "accumulation/distribution/neutral",
    "centralBankTrend": "strong buying/moderate buying/selling",
    "keyFactors": ["factor1", "factor2", "factor3"],
    "keyFactorsAr": ["عامل1", "عامل2", "عامل3"],
    "priceFloor": "estimated price floor based on costs",
    "overallBias": "bullish/bearish/neutral"
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
            ...fundamentalData,
            aiAnalysis,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Fundamentals error:', error);
        return Response.json({ error: 'Failed to fetch fundamentals' }, { status: 500 });
    }
}
