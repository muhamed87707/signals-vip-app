import { NextResponse } from 'next/server';

// Cache
let cachedCalendar = null;
let lastFetchTime = 0;
const CACHE_DURATION = 600000; // 10 minutes

/**
 * Generate economic calendar events
 */
function generateEconomicCalendar() {
    const now = new Date();
    const events = [];
    
    // High-impact events that affect gold
    const eventTemplates = [
        {
            name: 'FOMC Interest Rate Decision',
            nameAr: 'قرار الفائدة من الفيدرالي',
            country: 'US',
            impact: 'high',
            goldImpact: true,
            category: 'central_bank'
        },
        {
            name: 'Non-Farm Payrolls',
            nameAr: 'الوظائف غير الزراعية',
            country: 'US',
            impact: 'high',
            goldImpact: true,
            category: 'employment'
        },
        {
            name: 'CPI (Consumer Price Index)',
            nameAr: 'مؤشر أسعار المستهلك',
            country: 'US',
            impact: 'high',
            goldImpact: true,
            category: 'inflation'
        },
        {
            name: 'Core PCE Price Index',
            nameAr: 'مؤشر PCE الأساسي',
            country: 'US',
            impact: 'high',
            goldImpact: true,
            category: 'inflation'
        },
        {
            name: 'GDP Growth Rate',
            nameAr: 'معدل نمو الناتج المحلي',
            country: 'US',
            impact: 'high',
            goldImpact: true,
            category: 'growth'
        },
        {
            name: 'ECB Interest Rate Decision',
            nameAr: 'قرار الفائدة من المركزي الأوروبي',
            country: 'EU',
            impact: 'high',
            goldImpact: true,
            category: 'central_bank'
        },
        {
            name: 'Initial Jobless Claims',
            nameAr: 'طلبات إعانة البطالة',
            country: 'US',
            impact: 'medium',
            goldImpact: true,
            category: 'employment'
        },
        {
            name: 'Retail Sales',
            nameAr: 'مبيعات التجزئة',
            country: 'US',
            impact: 'medium',
            goldImpact: false,
            category: 'consumer'
        },
        {
            name: 'ISM Manufacturing PMI',
            nameAr: 'مؤشر PMI التصنيعي',
            country: 'US',
            impact: 'medium',
            goldImpact: true,
            category: 'manufacturing'
        },
        {
            name: 'Fed Chair Powell Speech',
            nameAr: 'خطاب رئيس الفيدرالي باول',
            country: 'US',
            impact: 'high',
            goldImpact: true,
            category: 'speech'
        }
    ];

    // Generate events for next 7 days
    for (let i = 0; i < 7; i++) {
        const eventDate = new Date(now);
        eventDate.setDate(now.getDate() + i);
        
        // Skip weekends
        if (eventDate.getDay() === 0 || eventDate.getDay() === 6) continue;
        
        // Add 1-3 events per day
        const numEvents = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...eventTemplates].sort(() => Math.random() - 0.5);
        
        for (let j = 0; j < numEvents; j++) {
            const template = shuffled[j];
            const hour = 8 + Math.floor(Math.random() * 10); // 8 AM - 6 PM
            eventDate.setHours(hour, Math.random() > 0.5 ? 30 : 0, 0, 0);
            
            const previous = (Math.random() * 5 - 2).toFixed(1);
            const forecast = (parseFloat(previous) + (Math.random() - 0.5)).toFixed(1);
            const actual = i === 0 && Math.random() > 0.7 
                ? (parseFloat(forecast) + (Math.random() - 0.5) * 0.5).toFixed(1) 
                : null;
            
            events.push({
                id: `event-${i}-${j}`,
                ...template,
                datetime: new Date(eventDate).toISOString(),
                date: eventDate.toISOString().split('T')[0],
                time: `${hour.toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`,
                previous: `${previous}%`,
                forecast: `${forecast}%`,
                actual: actual ? `${actual}%` : null,
                isToday: i === 0,
                isPast: actual !== null
            });
        }
    }
    
    // Sort by datetime
    events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    // Find next important event
    const nextImportant = events.find(e => !e.isPast && e.goldImpact && e.impact === 'high');
    
    return {
        events,
        nextImportantEvent: nextImportant,
        todayEvents: events.filter(e => e.isToday),
        highImpactCount: events.filter(e => e.impact === 'high').length,
        goldRelatedCount: events.filter(e => e.goldImpact).length,
        lastUpdated: new Date().toISOString()
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';
        
        const now = Date.now();
        
        if (!forceRefresh && cachedCalendar && (now - lastFetchTime) < CACHE_DURATION) {
            return NextResponse.json({ ...cachedCalendar, cached: true });
        }

        const calendar = generateEconomicCalendar();
        cachedCalendar = calendar;
        lastFetchTime = now;

        return NextResponse.json(calendar);
    } catch (error) {
        console.error('Economic calendar API error:', error);
        if (cachedCalendar) {
            return NextResponse.json({ ...cachedCalendar, cached: true, stale: true });
        }
        return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
    }
}
