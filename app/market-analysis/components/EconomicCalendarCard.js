'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function EconomicCalendarCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Economic Calendar',
            subtitle: 'Upcoming market-moving events',
            manualCheck: 'Manual Check Required',
            manualCheckDesc: 'Economic calendar data requires verification from official sources for accurate trading decisions.',
            checkLinks: 'Check these sources:',
            investing: 'Investing.com Calendar',
            forexfactory: 'Forex Factory Calendar',
            tradingeconomics: 'Trading Economics Calendar'
        },
        ar: {
            title: 'التقويم الاقتصادي',
            subtitle: 'الأحداث القادمة المؤثرة على السوق',
            manualCheck: 'يتطلب التحقق اليدوي',
            manualCheckDesc: 'بيانات التقويم الاقتصادي تتطلب التحقق من المصادر الرسمية لاتخاذ قرارات تداول دقيقة.',
            checkLinks: 'تحقق من هذه المصادر:',
            investing: 'تقويم Investing.com',
            forexfactory: 'تقويم Forex Factory',
            tradingeconomics: 'تقويم Trading Economics'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/economic-calendar')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="calendar-card"><LoadingSkeleton height="300px" /></div>;

    const urls = data?.manualCheckUrls || {};

    return (
        <div className="calendar-card">
            <div className="card-header">
                <span className="icon">📅</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Manual Check Notice */}
            <div className="manual-check-notice">
                <div className="notice-icon">⚠️</div>
                <h3>{t.manualCheck}</h3>
                <p>{t.manualCheckDesc}</p>
                
                <div className="check-links">
                    <span className="links-label">{t.checkLinks}</span>
                    <div className="links-list">
                        {urls.investing && (
                            <a href={urls.investing} target="_blank" rel="noopener noreferrer" className="check-link">
                                📊 {t.investing}
                            </a>
                        )}
                        {urls.forexfactory && (
                            <a href={urls.forexfactory} target="_blank" rel="noopener noreferrer" className="check-link">
                                📈 {t.forexfactory}
                            </a>
                        )}
                        {urls.tradingeconomics && (
                            <a href={urls.tradingeconomics} target="_blank" rel="noopener noreferrer" className="check-link">
                                🌐 {t.tradingeconomics}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .calendar-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .icon { font-size: 1.5rem; }
                .card-header h2 { font-size: 1rem; color: var(--gold-medium); margin: 0; }
                .card-header p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
                
                .manual-check-notice {
                    padding: 1.5rem;
                    background: rgba(255, 152, 0, 0.1);
                    border: 1px solid rgba(255, 152, 0, 0.3);
                    border-radius: 12px;
                    text-align: center;
                }
                .notice-icon { font-size: 2rem; margin-bottom: 0.5rem; }
                .manual-check-notice h3 {
                    font-size: 1rem;
                    color: #ff9800;
                    margin: 0 0 0.5rem;
                }
                .manual-check-notice p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin: 0 0 1rem;
                    line-height: 1.5;
                }
                .check-links {
                    margin-top: 1rem;
                }
                .links-label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.75rem;
                }
                .links-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .check-link {
                    display: block;
                    padding: 0.75rem 1rem;
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    color: var(--gold-bright);
                    text-decoration: none;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }
                .check-link:hover {
                    background: rgba(184, 134, 11, 0.2);
                    border-color: var(--gold-primary);
                }
            `}</style>
        </div>
    );
}
