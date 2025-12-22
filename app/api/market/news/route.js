import { NextResponse } from 'next/server';

// Cache
let cachedNews = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Fetch REAL gold news - NO SIMULATED NEWS
 * Returns empty with manual check URLs if unavailable
 */
async function fetchGoldNews() {
    // Try NewsAPI (requires API key)
    // Try GNews (requires API key)
    // Most news APIs require paid subscriptions for reliable access
    
    // Return guidance for manual checking
    return {
        error: true,
        message: 'Real-time news requires manual verification for trading decisions',
        messageAr: 'الأخبار الفورية تتطلب التحقق اليدوي لقرارات التداول',
        
        news: [],
        aiSummary: null,
        totalCount: 0,
        
        note: 'For accurate gold market news, please check the sources below',
        noteAr: 'للحصول على أخبار سوق الذهب الدقيقة، يرجى التحقق من المصادر أدناه',
        
        manualCheckUrls: {
            kitco: 'https://www.kitco.com/news/',
            reuters: 'https://www.reuters.com/markets/commodities/',
            bloomberg: 'https://www.bloomberg.com/markets/commodities',
            investing: 'https://www.investing.com/commodities/gold-news',
            fxstreet: 'https://www.fxstreet.com/news/gold-news',
            dailyfx: 'https://www.dailyfx.com/gold-price'
        },
        
        source: 'Manual Check Required',
        lastUpdated: new Date().toISOString()
    };
}

export async function GET(request) {
    try {
        const news = await fetchGoldNews();
        return NextResponse.json(news);
    } catch (error) {
        console.error('News API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'News unavailable',
            news: [],
            manualCheckUrls: {
                kitco: 'https://www.kitco.com/news/',
                reuters: 'https://www.reuters.com/markets/commodities/'
            },
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
