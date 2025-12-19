'use client';

import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const { lang, mounted } = useLanguage();

    if (!mounted) return <div style={{ height: '650px' }}></div>;

    // Investing.com Language IDs from user: 3 (AR), 1 (EN)
    const investingLang = lang === 'ar' ? '3' : '1';

    // Custom colors to match the site (Dark theme with Gold accents)
    const bgColor = "%230a0a0a"; // var(--bg-dark) equivalent
    const textColor = "%23ffffff";
    const accentColor = "%23b8860b"; // var(--gold-primary)

    // Countries list provided by user
    const countries = "25,17,26,10,37,5,35,4,12,22,193,6,72,43";

    const iframeSrc = `https://sslecal2.investing.com?ecoDayBackground=${bgColor}&innerBorderColor=${bgColor}&borderColor=${accentColor}&headerColor=${accentColor}&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone,timeselector,filters&countries=${countries}&calType=day&timeZone=65&lang=${investingLang}`;

    return (
        <div className="economic-calendar-wrapper animate-fade-in-up" style={{ minHeight: '650px', background: 'var(--bg-card)' }}>
            <div style={{ position: 'relative', width: '100%', height: '600px', overflow: 'hidden', borderRadius: '16px' }}>
                <iframe
                    src={iframeSrc}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    allowTransparency="true"
                    marginWidth="0"
                    marginHeight="0"
                    title="Investing.com Economic Calendar"
                    style={{
                        filter: 'invert(0.9) hue-rotate(180deg) brightness(1.2) contrast(0.9)',
                        // Note: Some widgets require CSS filters to truly match dark mode if the params are limited
                        mixBlendMode: 'lighten'
                    }}
                ></iframe>
                {/* Overlay to handle some styling gaps if necessary */}
            </div>
            <div className="calendar-footer" style={{ padding: '1rem', textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {lang === 'ar' ? (
                        <>التقويم الاقتصادي المباشر مقدم من المنفذ المالي الرائد <a href="https://sa.investing.com/" rel="nofollow" target="_blank" style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>Investing.com السعودية</a></>
                    ) : (
                        <>Real-time Economic Calendar provided by <a href="https://www.investing.com/" rel="nofollow" target="_blank" style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>Investing.com</a></>
                    )}
                </span>
            </div>
        </div>
    );
}
