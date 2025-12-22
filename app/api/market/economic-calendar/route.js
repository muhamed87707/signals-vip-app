import { NextResponse } from 'next/server';

// Cache
let cachedCalendar = null;
let lastFetchTime = 0;
const CACHE_DURATION = 600000; // 10 minutes

/**
 * Fetch REAL economic calendar - NO SIMULATED DATA
 * Returns empty with manual check URL if unavailable
 */
async function fetchEconomicCalendar() {
    // Most free economic calendar APIs require API keys
    // Return guidance for manual checking
    
    return {
        error: true,
        message: 'Economic calendar requires manual verification for accurate trading decisions',
        events: [],
        nextImportantEvent: null,
        todayEvents: [],
        highImpactCount: 0,
        goldRelatedCount: 0,
        source: 'Manual Check Required',
        manualCheckUrls: {
            investing: 'https://www.investing.com/economic-calendar/',
            forexfactory: 'https://www.forexfactory.com/calendar',
            tradingeconomics: 'https://tradingeconomics.com/calendar'
        },
        note: 'For accurate economic calendar data, please check the URLs above',
        noteAr: 'للحصول على بيانات التقويم الاقتصادي الدقيقة، يرجى التحقق من الروابط أعلاه',
        lastUpdated: new Date().toISOString()
    };
}

export async function GET(request) {
    try {
        const calendar = await fetchEconomicCalendar();
        return NextResponse.json(calendar);
    } catch (error) {
        console.error('Economic calendar API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Economic calendar unavailable',
            events: [],
            manualCheckUrls: {
                investing: 'https://www.investing.com/economic-calendar/',
                forexfactory: 'https://www.forexfactory.com/calendar'
            },
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
