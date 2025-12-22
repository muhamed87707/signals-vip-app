'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

/**
 * BankForecastsCard - Global bank gold price forecasts
 * Shows manual check links when data is unavailable
 */
export default function BankForecastsCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Bank Forecasts',
            subtitle: 'Global investment bank gold price targets',
            dataUnavailable: 'Bank forecasts require manual verification',
            checkManually: 'Check official bank research reports for latest forecasts',
            howToSearch: 'Search for "[Bank Name] gold price forecast 2025"',
            sources: 'Recommended Sources'
        },
        ar: {
            title: 'توقعات البنوك',
            subtitle: 'أهداف أسعار الذهب من البنوك الاستثمارية العالمية',
            dataUnavailable: 'توقعات البنوك تتطلب التحقق اليدوي',
            checkManually: 'تحقق من تقارير البحث الرسمية للبنوك للحصول على أحدث التوقعات',
            howToSearch: 'ابحث عن "توقعات سعر الذهب [اسم البنك] 2025"',
            sources: 'المصادر الموصى بها'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/bank-forecasts')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="bank-card"><LoadingSkeleton height="300px" /></div>;
    }

    const manualCheckUrls = data?.manualCheckUrls || {};
    const hasRealData = data?.banks && data.banks.length > 0;

    return (
        <div className="bank-card">
            <div className="bank-header">
                <div className="bank-title">
                    <span className="bank-icon">🏦</span>
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
                        <p className="search-tip">💡 {t.howToSearch}</p>
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
                // If we have real data, show it
                <div className="banks-content">
                    {/* Real data display would go here */}
                </div>
            )}

            <style jsx>{`
                .bank-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                }

                .bank-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(90deg, rgba(184, 134, 11, 0.08), transparent);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .bank-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .bank-icon { font-size: 1.5rem; }

                .bank-title h2 {
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
                    margin: 0.5rem 0;
                }

                .search-tip {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    display: inline-block;
                    margin-top: 0.5rem;
                }

                .sources-section h4 {
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                    margin: 0 0 1rem;
                }

                .sources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
        goldmanSachs: 'Goldman Sachs',
        jpMorgan: 'JP Morgan',
        ubs: 'UBS',
        citi: 'Citibank',
        hsbc: 'HSBC',
        bankOfAmerica: 'Bank of America',
        kitcoNews: 'Kitco News',
        goldPriceForecast: 'FXStreet'
    };
    return names[key] || key;
}
