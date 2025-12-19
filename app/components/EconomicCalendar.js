'use client';

import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const { lang, isRTL } = useLanguage();

    // Investing.com Language IDs: 1 (EN), 18 (AR)
    const investingLang = lang === 'ar' ? 18 : 1;

    // We construct the iframe URL based on Investing.com widget standards
    // Importance 3 only (High significance)
    // Currencies include: USD (5), EUR (25), GBP (4), JPY (35), AUD (15), CAD (6), CHF (12)
    const baseUrl = "https://www.investing.com/widgets/economic_calendar";
    const params = new URLSearchParams({
        "lang": investingLang,
        "importance": "3", // Only High Impact
        "countries": "5,25,4,35,15,6,12", // Main countries affecting Forex & Gold
        "calType": "day",
        "timeZone": "55",
        "quotes": "1,2,3,4,5,7,8,9,10" // Major pairs
    });

    const iframeSrc = `${baseUrl}?${params.toString()}`;

    return (
        <div className="economic-calendar-wrapper animate-fade-in-up" style={{ minHeight: '650px' }}>
            <iframe
                src={iframeSrc}
                width="100%"
                height="600"
                frameBorder="0"
                allowTransparency="true"
                marginWidth="0"
                marginHeight="0"
                title="Investing.com Economic Calendar"
                style={{ borderRadius: '12px' }}
            ></iframe>
            <div className="calendar-footer-link" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                <a href="https://www.investing.com/" target="_blank" rel="nofollow" style={{ color: 'var(--gold-primary)', textDecoration: 'none' }}>
                    Real-time Economic Calendar provided by Investing.com
                </a>
            </div>
        </div>
    );
}
