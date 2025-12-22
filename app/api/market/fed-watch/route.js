import { NextResponse } from 'next/server';

// Cache
let cachedFedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1800000; // 30 minutes

/**
 * Generate Fed Watch data
 */
function generateFedWatchData() {
    const now = new Date();
    
    // Current Fed Funds Rate
    const currentRate = {
        lower: 4.25,
        upper: 4.50,
        effective: 4.33
    };

    // Next FOMC meetings
    const meetings = [
        { date: '2025-01-29', daysUntil: calculateDaysUntil('2025-01-29') },
        { date: '2025-03-19', daysUntil: calculateDaysUntil('2025-03-19') },
        { date: '2025-05-07', daysUntil: calculateDaysUntil('2025-05-07') },
        { date: '2025-06-18', daysUntil: calculateDaysUntil('2025-06-18') }
    ];

    // Rate probabilities for next meeting (CME FedWatch style)
    const nextMeetingProbs = {
        cut50: 5 + Math.random() * 5,
        cut25: 25 + Math.random() * 15,
        hold: 55 + Math.random() * 10,
        hike25: 3 + Math.random() * 5
    };
    
    // Normalize to 100%
    const total = Object.values(nextMeetingProbs).reduce((a, b) => a + b, 0);
    Object.keys(nextMeetingProbs).forEach(k => {
        nextMeetingProbs[k] = parseFloat((nextMeetingProbs[k] / total * 100).toFixed(1));
    });

    // Fed officials statements
    const officials = [
        {
            name: 'Jerome Powell',
            nameAr: 'جيروم باول',
            title: 'Fed Chair',
            titleAr: 'رئيس الفيدرالي',
            stance: 'neutral',
            date: '2024-12-18',
            quote: 'We will continue to make decisions meeting by meeting based on incoming data.',
            quoteAr: 'سنستمر في اتخاذ القرارات اجتماعاً تلو الآخر بناءً على البيانات الواردة.'
        },
        {
            name: 'Christopher Waller',
            nameAr: 'كريستوفر والر',
            title: 'Fed Governor',
            titleAr: 'محافظ الفيدرالي',
            stance: 'hawkish',
            date: '2024-12-15',
            quote: 'Inflation remains above target, we need to stay vigilant.',
            quoteAr: 'التضخم لا يزال فوق المستهدف، نحتاج للبقاء يقظين.'
        },
        {
            name: 'Mary Daly',
            nameAr: 'ماري دالي',
            title: 'SF Fed President',
            titleAr: 'رئيسة فيدرالي سان فرانسيسكو',
            stance: 'dovish',
            date: '2024-12-12',
            quote: 'The labor market is cooling, which gives us room to be patient.',
            quoteAr: 'سوق العمل يبرد، مما يمنحنا مجالاً للتحلي بالصبر.'
        },
        {
            name: 'Raphael Bostic',
            nameAr: 'رافائيل بوستيك',
            title: 'Atlanta Fed President',
            titleAr: 'رئيس فيدرالي أتلانتا',
            stance: 'neutral',
            date: '2024-12-10',
            quote: 'We are in a good position to assess the data before acting.',
            quoteAr: 'نحن في وضع جيد لتقييم البيانات قبل التصرف.'
        }
    ];

    // Dot plot summary (median projections)
    const dotPlot = {
        2025: { median: 3.75, range: [3.25, 4.25] },
        2026: { median: 3.25, range: [2.75, 3.75] },
        2027: { median: 3.00, range: [2.50, 3.50] },
        longerRun: { median: 2.75, range: [2.50, 3.00] }
    };

    // Stance analysis
    const hawkishCount = officials.filter(o => o.stance === 'hawkish').length;
    const dovishCount = officials.filter(o => o.stance === 'dovish').length;
    const overallStance = hawkishCount > dovishCount ? 'hawkish' : 
                          dovishCount > hawkishCount ? 'dovish' : 'neutral';

    // Gold impact analysis
    const goldImpact = nextMeetingProbs.cut25 + nextMeetingProbs.cut50 > 40 ? 'bullish' :
                       nextMeetingProbs.hike25 > 10 ? 'bearish' : 'neutral';

    return {
        currentRate,
        nextMeeting: meetings[0],
        upcomingMeetings: meetings,
        probabilities: nextMeetingProbs,
        officials,
        dotPlot,
        analysis: {
            overallStance,
            hawkishCount,
            dovishCount,
            neutralCount: officials.length - hawkishCount - dovishCount,
            goldImpact,
            marketExpectation: nextMeetingProbs.hold > 50 ? 'hold' : 
                               nextMeetingProbs.cut25 > nextMeetingProbs.hold ? 'cut' : 'uncertain'
        },
        lastUpdated: now.toISOString()
    };
}

function calculateDaysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target - now;
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

        const fedData = generateFedWatchData();
        cachedFedData = fedData;
        lastFetchTime = now;

        return NextResponse.json(fedData);
    } catch (error) {
        console.error('Fed Watch API error:', error);
        if (cachedFedData) {
            return NextResponse.json({ ...cachedFedData, cached: true, stale: true });
        }
        return NextResponse.json({ error: 'Failed to fetch Fed data' }, { status: 500 });
    }
}
