'use client';

import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const { t, lang, mounted } = useLanguage();

    if (!mounted) return <div style={{ minHeight: '800px' }}></div>;

    // Investing.com Language IDs: 3 (AR), 1 (EN)
    const investingLang = lang === 'ar' ? '3' : '1';

    // Constructing the URL with 'calType=week' for history and 'ecoDayBackground' for dark base
    const iframeSrc = `https://sslecal2.investing.com?ecoDayBackground=%230a0a0a&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone,timeselector,filters&countries=25,17,26,10,37,5,35,4,12,22,193,6,72,43&calType=week&timeZone=65&lang=${investingLang}`;

    return (
        <div className="premium-calendar-card animate-fade-in-up">
            <div className="calendar-card-header">
                <div className="calendar-icon-wrapper">
                    <span className="calendar-emoji">📅</span>
                </div>
                <div className="calendar-header-text">
                    <h3 className="calendar-title">
                        {lang === 'ar' ? 'الجدول الأسبوعي للأحداث' : 'Weekly Economic Outlook'}
                    </h3>
                    <p className="calendar-subtitle">
                        {lang === 'ar' ? 'نظرة شاملة على أحداث الأسبوع (الماضية والقادمة)' : 'Comprehensive view of weekly events (Past & Future)'}
                    </p>
                </div>
            </div>

            <div className="calendar-iframe-wrapper">
                <div className="refined-filter-container">
                    <iframe
                        src={iframeSrc}
                        width="100%"
                        height="700"
                        frameBorder="0"
                        allowTransparency="true"
                        marginWidth="0"
                        marginHeight="0"
                        title="Investing.com Economic Calendar"
                        className="investing-iframe"
                    ></iframe>
                </div>
            </div>

            <div className="calendar-card-footer">
                <div className="powered-by-wrapper">
                    <span className="powered-text">
                        {lang === 'ar' ? 'بيانات حصرية مقدمة من' : 'Exclusively provided by'}
                    </span>
                    <a href="https://sa.investing.com/" rel="nofollow" target="_blank" className="gold-link">
                        Investing.com {lang === 'ar' && 'السعودية'}
                    </a>
                </div>
                <div className="calendar-status-badges">
                    <span className="badge-item">{lang === 'ar' ? 'عرض أسبوعي' : 'Weekly View'}</span>
                    <span className="badge-item">{lang === 'ar' ? 'عالي التأثير' : 'High Impact'}</span>
                </div>
            </div>

            <style jsx>{`
                .premium-calendar-card {
                    background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
                    border: 1px solid rgba(184, 134, 11, 0.25);
                    border-radius: 28px;
                    padding: 2.5rem;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(15px);
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }

                .calendar-card-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .calendar-icon-wrapper {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark));
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    box-shadow: 0 8px 20px rgba(184, 134, 11, 0.4);
                }

                .calendar-title {
                    font-size: 1.8rem;
                    color: var(--white);
                    margin: 0;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .calendar-subtitle {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin: 0.3rem 0 0 0;
                    opacity: 0.8;
                }

                .calendar-iframe-wrapper {
                    border-radius: 20px;
                    overflow: hidden;
                    background: #000;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                }

                .refined-filter-container {
                    /* Refined filter for better clarity while maintaining dark theme */
                    filter: invert(92%) hue-rotate(180deg) brightness(1.05) contrast(1.1);
                    mix-blend-mode: lighten;
                }

                .investing-iframe {
                    border: none;
                    display: block;
                }

                .calendar-card-footer {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .powered-text {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-right: 6px;
                }

                .gold-link {
                    font-size: 12px;
                    color: var(--gold-primary);
                    font-weight: 700;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .gold-link:hover {
                    color: var(--white);
                    text-shadow: 0 0 10px rgba(255,255,255,0.3);
                }

                .calendar-status-badges {
                    display: flex;
                    gap: 0.8rem;
                }

                .badge-item {
                    background: rgba(184, 134, 11, 0.15);
                    color: var(--gold-primary);
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 600;
                    border: 1px solid rgba(184, 134, 11, 0.2);
                }

                @media (max-width: 992px) {
                    .premium-calendar-card {
                        padding: 1.5rem;
                    }
                    .calendar-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
