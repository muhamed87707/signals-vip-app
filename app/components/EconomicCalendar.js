'use client';

import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const { t, lang, mounted } = useLanguage();

    if (!mounted) return <div style={{ minHeight: '600px' }}></div>;

    // The user's exact snippet logic for Arabic (3) and English (1)
    const investingLang = lang === 'ar' ? '3' : '1';

    // Constructing the URL with the user's preferred importance and countries
    const iframeSrc = `https://sslecal2.investing.com?ecoDayBackground=%230a0a0a&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone,timeselector,filters&countries=25,17,26,10,37,5,35,4,12,22,193,6,72,43&calType=day&timeZone=65&lang=${investingLang}`;

    return (
        <div className="premium-calendar-card animate-fade-in-up">
            <div className="calendar-card-header">
                <div className="calendar-icon-wrapper">
                    <span className="calendar-emoji">📅</span>
                </div>
                <div className="calendar-header-text">
                    <h3 className="calendar-title">{t.economicCalendar}</h3>
                    <p className="calendar-subtitle">
                        {lang === 'ar' ? 'متابعة الأحداث الاقتصادية العالمية المؤثرة' : 'Track major global economic drivers'}
                    </p>
                </div>
            </div>

            <div className="calendar-iframe-wrapper">
                <div className="dark-mode-filter-container">
                    <iframe
                        src={iframeSrc}
                        width="100%"
                        height="480"
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
                <p className="localhost-notice">
                    {lang === 'ar'
                        ? '* في حال عدم ظهور البيانات، يرجى تفعيل الموقع على النطاق الرسمي.'
                        : '* Data might be blocked on localhost for security; check on live domain.'}
                </p>
            </div>

            <style jsx>{`
                .premium-calendar-card {
                    background: linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }

                .premium-calendar-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(184, 134, 11, 0.05) 0%, transparent 70%);
                    pointer-events: none;
                }

                .calendar-card-header {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .calendar-icon-wrapper {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark));
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: 0 5px 15px rgba(184, 134, 11, 0.3);
                }

                .calendar-title {
                    font-size: 1.5rem;
                    color: var(--white);
                    margin: 0;
                    font-weight: 700;
                }

                .calendar-subtitle {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin: 0.2rem 0 0 0;
                }

                .calendar-iframe-wrapper {
                    border-radius: 16px;
                    overflow: hidden;
                    background: #000;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .dark-mode-filter-container {
                    /* Advanced Filter to make Investing.com look natively dark */
                    filter: invert(90%) hue-rotate(180deg) brightness(1.1) contrast(1.1);
                    mix-blend-mode: lighten;
                }

                .investing-iframe {
                    border: none;
                }

                .calendar-card-footer {
                    margin-top: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .powered-text {
                    font-size: 11px;
                    color: var(--text-secondary);
                    margin-right: 5px;
                }

                .gold-link {
                    font-size: 11px;
                    color: var(--gold-primary);
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .gold-link:hover {
                    color: var(--white);
                }

                .localhost-notice {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.3);
                    margin: 0;
                    font-style: italic;
                }

                @media (max-width: 768px) {
                    .premium-calendar-card {
                        padding: 1.5rem;
                    }
                    .calendar-card-footer {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
