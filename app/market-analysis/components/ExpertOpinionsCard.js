'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function ExpertOpinionsCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Expert Opinions',
            subtitle: 'Market analyst views on gold',
            dataUnavailable: 'Expert opinions require manual verification',
            checkManually: 'Expert opinions change frequently. Please verify from official sources.',
            sources: 'Recommended Sources',
            notableExperts: 'Notable Experts to Follow'
        },
        ar: {
            title: 'آراء الخبراء',
            subtitle: 'آراء المحللين حول الذهب',
            dataUnavailable: 'آراء الخبراء تتطلب التحقق اليدوي',
            checkManually: 'آراء الخبراء تتغير بشكل متكرر. يرجى التحقق من المصادر الرسمية.',
            sources: 'المصادر الموصى بها',
            notableExperts: 'خبراء بارزون للمتابعة'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/expert-opinions')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="expert-card"><LoadingSkeleton height="300px" /></div>;

    const manualCheckUrls = data?.manualCheckUrls || {};
    const notableExperts = data?.notableExperts || {};
    const hasRealData = data?.experts && data.experts.length > 0;

    return (
        <div className="expert-card">
            <div className="card-header">
                <span className="icon">👨‍💼</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {!hasRealData ? (
                <div className="manual-check-content">
                    <div className="warning-box">
                        <span className="warning-icon">⚠️</span>
                        <h3>{t.dataUnavailable}</h3>
                        <p>{t.checkManually}</p>
                    </div>

                    {/* Notable Experts */}
                    {notableExperts.names && (
                        <div className="experts-section">
                            <h4>{t.notableExperts}</h4>
                            <div className="experts-list">
                                {notableExperts.names.map((name, idx) => (
                                    <span key={idx} className="expert-tag">{name}</span>
                                ))}
                            </div>
                        </div>
                    )}

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
                <div className="experts-content">
                    {/* Real data would be displayed here */}
                </div>
            )}

            <style jsx>{`
                .expert-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
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
                
                .manual-check-content {
                    padding: 0.5rem;
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

                .experts-section {
                    margin-bottom: 1.5rem;
                }

                .experts-section h4, .sources-section h4 {
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.75rem;
                }

                .experts-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .expert-tag {
                    padding: 0.4rem 0.8rem;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .sources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
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
        kitcoExperts: 'Kitco Experts',
        fxstreet: 'FXStreet',
        tradingview: 'TradingView',
        investing: 'Investing.com',
        dailyfx: 'DailyFX'
    };
    return names[key] || key;
}
