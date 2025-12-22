'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

/**
 * NewsAnalysisCard - Gold market news
 * Shows manual check links when data is unavailable
 */
export default function NewsAnalysisCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Market News & Analysis',
            subtitle: 'Latest gold market news',
            dataUnavailable: 'Real-time news requires manual verification',
            checkManually: 'For accurate gold market news, please check the sources below',
            sources: 'Recommended News Sources'
        },
        ar: {
            title: 'أخبار وتحليلات السوق',
            subtitle: 'آخر أخبار سوق الذهب',
            dataUnavailable: 'الأخبار الفورية تتطلب التحقق اليدوي',
            checkManually: 'للحصول على أخبار سوق الذهب الدقيقة، يرجى التحقق من المصادر أدناه',
            sources: 'مصادر الأخبار الموصى بها'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/news')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="news-card"><LoadingSkeleton height="300px" /></div>;
    }

    const manualCheckUrls = data?.manualCheckUrls || {};
    const hasRealData = data?.news && data.news.length > 0;

    return (
        <div className="news-card">
            <div className="news-header">
                <div className="news-title">
                    <span className="news-icon">📰</span>
                    <div>
                        <h2>{t.title}</h2>
                        <p className="subtitle">{t.subtitle}</p>
                    </div>
                </div>
            </div>

            {!hasRealData ? (
                <div className="manual-check-content">
                    <div className="warning-box">
                        <span className="warning-icon">⚠️</span>
                        <h3>{t.dataUnavailable}</h3>
                        <p>{t.checkManually}</p>
                    </div>

                    <div className="sources-section">
                        <h4>{t.sources}</h4>
                        <div className="sources-grid">
                            {Object.entries(manualCheckUrls).map(([key, url]) => (
                                <a 
                                    key={key} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="source-link"
                                >
                                    {formatSourceName(key)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="news-content">
                    {/* Real news would be displayed here */}
                </div>
            )}

            <style jsx>{`
                .news-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                }

                .news-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(90deg, rgba(184, 134, 11, 0.08), transparent);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .news-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .news-icon { font-size: 1.5rem; }

                .news-title h2 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--gold-medium);
                    margin: 0;
                }

                .subtitle {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0.25rem 0 0;
                }

                .manual-check-content {
                    padding: 1.5rem;
                }

                .warning-box {
                    text-align: center;
                    padding: 1.5rem;
                    background: rgba(255, 152, 0, 0.1);
                    border: 1px solid rgba(255, 152, 0, 0.3);
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .warning-icon {
                    font-size: 2rem;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .warning-box h3 {
                    font-size: 1rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.5rem;
                }

                .warning-box p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .sources-section h4 {
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                    margin: 0 0 1rem;
                }

                .sources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 0.75rem;
                }

                .source-link {
                    display: block;
                    padding: 0.75rem 1rem;
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 8px;
                    color: var(--gold-medium);
                    text-decoration: none;
                    font-size: 0.8rem;
                    text-align: center;
                    transition: all 0.3s;
                }

                .source-link:hover {
                    background: rgba(184, 134, 11, 0.2);
                    border-color: var(--gold-primary);
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .sources-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}

function formatSourceName(key) {
    const names = {
        kitco: 'Kitco News',
        reuters: 'Reuters',
        bloomberg: 'Bloomberg',
        investing: 'Investing.com',
        fxstreet: 'FXStreet',
        dailyfx: 'DailyFX'
    };
    return names[key] || key;
}
