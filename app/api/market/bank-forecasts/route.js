import { NextResponse } from 'next/server';

// Cache
let cachedForecasts = null;
let lastFetchTime = 0;
const CACHE_DURATION = 86400000; // 24 hours (forecasts don't change often)

/**
 * Bank forecasts data - Updated periodically from public sources
 * Prices are target prices for end of 2025 / 12 months ahead
 */
function getBankForecasts() {
    const now = new Date();
    const currentGoldPrice = 2650; // Approximate current price
    
    const banks = [
        {
            id: 'goldman',
            name: 'Goldman Sachs',
            nameAr: 'جولدمان ساكس',
            logo: '🏦',
            country: 'US',
            target: 3000,
            previousTarget: 2700,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-15',
            analyst: 'Lina Thomas',
            notes: 'Strong central bank demand and geopolitical risks',
            notesAr: 'طلب قوي من البنوك المركزية ومخاطر جيوسياسية'
        },
        {
            id: 'jpmorgan',
            name: 'JP Morgan',
            nameAr: 'جي بي مورغان',
            logo: '🏛️',
            country: 'US',
            target: 2950,
            previousTarget: 2600,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-10',
            analyst: 'Natasha Kaneva',
            notes: 'Fed rate cuts to support gold prices',
            notesAr: 'خفض الفيدرالي للفائدة سيدعم أسعار الذهب'
        },
        {
            id: 'ubs',
            name: 'UBS',
            nameAr: 'يو بي إس',
            logo: '🔴',
            country: 'CH',
            target: 2800,
            previousTarget: 2500,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-12',
            analyst: 'Giovanni Staunovo',
            notes: 'Diversification demand remains strong',
            notesAr: 'الطلب على التنويع لا يزال قوياً'
        },
        {
            id: 'citi',
            name: 'Citibank',
            nameAr: 'سيتي بنك',
            logo: '🔵',
            country: 'US',
            target: 3000,
            previousTarget: 2800,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-08',
            analyst: 'Aakash Doshi',
            notes: 'Bull case scenario with continued ETF inflows',
            notesAr: 'سيناريو صعودي مع استمرار تدفقات صناديق ETF'
        },
        {
            id: 'hsbc',
            name: 'HSBC',
            nameAr: 'إتش إس بي سي',
            logo: '🔴',
            country: 'UK',
            target: 2700,
            previousTarget: 2500,
            timeframe: '12M',
            rating: 'neutral',
            lastUpdated: '2024-12-05',
            analyst: 'James Steel',
            notes: 'Balanced outlook with potential headwinds',
            notesAr: 'نظرة متوازنة مع رياح معاكسة محتملة'
        },
        {
            id: 'bofa',
            name: 'Bank of America',
            nameAr: 'بنك أوف أمريكا',
            logo: '🏦',
            country: 'US',
            target: 2750,
            previousTarget: 2400,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-11',
            analyst: 'Michael Widmer',
            notes: 'Structural bull market continues',
            notesAr: 'استمرار السوق الصاعد الهيكلي'
        },
        {
            id: 'commerzbank',
            name: 'Commerzbank',
            nameAr: 'كوميرز بنك',
            logo: '🟡',
            country: 'DE',
            target: 2600,
            previousTarget: 2300,
            timeframe: '12M',
            rating: 'neutral',
            lastUpdated: '2024-12-06',
            analyst: 'Carsten Fritsch',
            notes: 'Limited upside from current levels',
            notesAr: 'صعود محدود من المستويات الحالية'
        },
        {
            id: 'ing',
            name: 'ING Bank',
            nameAr: 'آي إن جي',
            logo: '🟠',
            country: 'NL',
            target: 2850,
            previousTarget: 2550,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-09',
            analyst: 'Warren Patterson',
            notes: 'Central bank buying to remain supportive',
            notesAr: 'مشتريات البنوك المركزية ستظل داعمة'
        },
        {
            id: 'standard',
            name: 'Standard Chartered',
            nameAr: 'ستاندرد تشارترد',
            logo: '🟢',
            country: 'UK',
            target: 2900,
            previousTarget: 2650,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-07',
            analyst: 'Suki Cooper',
            notes: 'Safe haven demand to persist',
            notesAr: 'الطلب على الملاذ الآمن سيستمر'
        },
        {
            id: 'macquarie',
            name: 'Macquarie',
            nameAr: 'ماكواري',
            logo: '🟣',
            country: 'AU',
            target: 2500,
            previousTarget: 2200,
            timeframe: '12M',
            rating: 'bearish',
            lastUpdated: '2024-12-04',
            analyst: 'Marcus Garvey',
            notes: 'Expects correction from current highs',
            notesAr: 'يتوقع تصحيحاً من القمم الحالية'
        },
        {
            id: 'anz',
            name: 'ANZ Bank',
            nameAr: 'إيه إن زد',
            logo: '🔵',
            country: 'AU',
            target: 2750,
            previousTarget: 2450,
            timeframe: '12M',
            rating: 'neutral',
            lastUpdated: '2024-12-10',
            analyst: 'Daniel Hynes',
            notes: 'Consolidation expected before next leg higher',
            notesAr: 'توقع تماسك قبل الموجة الصعودية التالية'
        },
        {
            id: 'societe',
            name: 'Société Générale',
            nameAr: 'سوسيتيه جنرال',
            logo: '🔴',
            country: 'FR',
            target: 2800,
            previousTarget: 2500,
            timeframe: '12M',
            rating: 'bullish',
            lastUpdated: '2024-12-08',
            analyst: 'Florent Pele',
            notes: 'Positive momentum to continue',
            notesAr: 'الزخم الإيجابي سيستمر'
        }
    ];

    // Calculate statistics
    const targets = banks.map(b => b.target);
    const avgTarget = targets.reduce((a, b) => a + b, 0) / targets.length;
    const maxTarget = Math.max(...targets);
    const minTarget = Math.min(...targets);
    const bullishCount = banks.filter(b => b.rating === 'bullish').length;
    const bearishCount = banks.filter(b => b.rating === 'bearish').length;
    const neutralCount = banks.filter(b => b.rating === 'neutral').length;

    return {
        banks: banks.sort((a, b) => b.target - a.target),
        statistics: {
            averageTarget: Math.round(avgTarget),
            highestTarget: maxTarget,
            lowestTarget: minTarget,
            currentPrice: currentGoldPrice,
            upsideFromAvg: (((avgTarget - currentGoldPrice) / currentGoldPrice) * 100).toFixed(1),
            consensus: bullishCount > bearishCount + neutralCount ? 'bullish' : 
                       bearishCount > bullishCount + neutralCount ? 'bearish' : 'mixed',
            bullishCount,
            bearishCount,
            neutralCount,
            totalBanks: banks.length
        },
        lastUpdated: now.toISOString()
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedForecasts && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedForecasts, cached: true });
        }

        const forecasts = getBankForecasts();
        cachedForecasts = forecasts;
        lastFetchTime = now;

        return NextResponse.json(forecasts, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800'
            }
        });
    } catch (error) {
        console.error('Bank forecasts API error:', error);
        if (cachedForecasts) {
            return NextResponse.json({ ...cachedForecasts, cached: true, stale: true });
        }
        return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 });
    }
}
