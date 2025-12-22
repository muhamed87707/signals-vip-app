import { NextResponse } from 'next/server';

// Cache
let cachedFedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1800000; // 30 minutes

/**
 * Fed Watch data - NO SIMULATED PROBABILITIES
 * Real probabilities should come from CME FedWatch Tool
 * Returns guidance for manual checking
 */
async function fetchFedWatchData() {
    // Current Fed Funds Rate (this is public knowledge, not simulated)
    // Last updated: December 2024 - Fed cut to 4.25-4.50%
    const currentRate = {
        lower: 4.25,
        upper: 4.50,
        effective: 4.33,
        lastDecisionDate: '2024-12-18',
        lastDecision: 'Cut 25 bps'
    };

    // Next FOMC meetings (these are scheduled dates, not simulated)
    const meetings = [
        { date: '2025-01-29', daysUntil: calculateDaysUntil('2025-01-29') },
        { date: '2025-03-19', daysUntil: calculateDaysUntil('2025-03-19') },
        { date: '2025-05-07', daysUntil: calculateDaysUntil('2025-05-07') },
        { date: '2025-06-18', daysUntil: calculateDaysUntil('2025-06-18') },
        { date: '2025-07-30', daysUntil: calculateDaysUntil('2025-07-30') },
        { date: '2025-09-17', daysUntil: calculateDaysUntil('2025-09-17') },
        { date: '2025-11-05', daysUntil: calculateDaysUntil('2025-11-05') },
        { date: '2025-12-17', daysUntil: calculateDaysUntil('2025-12-17') }
    ];

    return {
        currentRate,
        nextMeeting: meetings[0],
        upcomingMeetings: meetings,
        
        // NO SIMULATED PROBABILITIES
        probabilities: {
            error: true,
            message: 'Rate probabilities require real-time CME FedWatch data',
            manualCheckUrl: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html'
        },
        
        // NO SIMULATED OFFICIAL STATEMENTS
        officials: {
            error: true,
            message: 'Fed official statements require manual verification',
            manualCheckUrl: 'https://www.federalreserve.gov/newsevents/speeches.htm'
        },
        
        // NO SIMULATED DOT PLOT
        dotPlot: {
            error: true,
            message: 'Dot plot data available after FOMC meetings',
            manualCheckUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'
        },
        
        source: 'Federal Reserve (Scheduled Dates Only)',
        note: 'For rate probabilities, check CME FedWatch Tool directly',
        noteAr: 'لاحتمالات أسعار الفائدة، تحقق من أداة CME FedWatch مباشرة',
        manualCheckUrls: {
            fedwatch: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html',
            fedReserve: 'https://www.federalreserve.gov/',
            fomc: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'
        },
        lastUpdated: new Date().toISOString()
    };
}

function calculateDaysUntil(dateStr) {
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedFedData && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedFedData, cached: true });
        }

        const fedData = await fetchFedWatchData();
        cachedFedData = fedData;
        lastFetchTime = now;

        return NextResponse.json(fedData);
    } catch (error) {
        console.error('Fed Watch API error:', error);
        
        return NextResponse.json({
            error: true,
            message: 'Failed to fetch Fed data: ' + error.message,
            currentRate: { lower: 4.25, upper: 4.50, effective: 4.33 },
            manualCheckUrls: {
                fedwatch: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html'
            },
            lastUpdated: new Date().toISOString()
        }, { status: 500 });
    }
}
