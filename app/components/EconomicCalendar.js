'use client';

import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const { lang, mounted } = useLanguage();

    if (!mounted) return <div style={{ minHeight: '500px' }}></div>;

    // The user's exact snippet for Arabic
    const arabicSnippet = `
        <iframe src="https://sslecal2.investing.com?ecoDayBackground=%23000000&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone,timeselector,filters&countries=25,17,26,10,37,5,35,4,12,22,193,6,72,43&calType=day&timeZone=65&lang=3" width="650" height="467" frameborder="0" allowtransparency="true" marginwidth="0" marginheight="0"></iframe>
        <div class="poweredBy" style="font-family: Arial, Helvetica, sans-serif; text-align:right; direction:rtl;">
            <span style="font-size: 11px;color: #ffffff;text-decoration: none; opacity: 0.7;">
                التقويم الاقتصادي المباشر مقدم من المنفذ المالي الرائد 
                <a href="https://sa.investing.com/" rel="nofollow" target="_blank" style="font-size: 11px;color: #b8860b; font-weight: bold;" class="underline_link">Investing.com السعودية</a> .
            </span>
        </div>
    `;

    // English version of the same snippet (lang=1)
    const englishSnippet = `
        <iframe src="https://sslecal2.investing.com?ecoDayBackground=%23000000&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone,timeselector,filters&countries=25,17,26,10,37,5,35,4,12,22,193,6,72,43&calType=day&timeZone=65&lang=1" width="650" height="467" frameborder="0" allowtransparency="true" marginwidth="0" marginheight="0"></iframe>
        <div class="poweredBy" style="font-family: Arial, Helvetica, sans-serif; text-align:left; direction:ltr;">
            <span style="font-size: 11px;color: #ffffff;text-decoration: none; opacity: 0.7;">
                Real-time Economic Calendar provided by  
                <a href="https://www.investing.com/" rel="nofollow" target="_blank" style="font-size: 11px;color: #b8860b; font-weight: bold;" class="underline_link">Investing.com</a> .
            </span>
        </div>
    `;

    return (
        <div className="economic-calendar-wrapper animate-fade-in-up" style={{
            minHeight: '550px',
            background: '#000000',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
            <div
                className="investing-widget-container"
                dangerouslySetInnerHTML={{ __html: lang === 'ar' ? arabicSnippet : englishSnippet }}
                style={{ width: '100%', maxWidth: '650px', position: 'relative' }}
            />

            <div className="calendar-note" style={{ marginTop: '1.5rem', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                {lang === 'ar' ?
                    "* إذا لم يظهر التقويم، يرجى التأكد من تشغيل الموقع على دومين حقيقي حيث أن Investing.com قد يحظر العرض على localhost لأسباب أمنية." :
                    "* If the calendar doesn't appear, please ensure you're on a live domain as Investing.com may block localhost for security reasons."
                }
            </div>
        </div>
    );
}
