'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function CorrelationMatrix({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Correlation Matrix',
            subtitle: 'Gold correlations with major assets',
            positive: 'Positive Correlations',
            negative: 'Negative Correlations',
            strongest: 'Strongest Correlations',
            dataPoints: 'data points',
            noData: 'Unable to calculate correlations',
            realData: 'Calculated from real 30-day price data',
            asset: 'Asset',
            correlation: 'Correlation'
        },
        ar: {
            title: 'مصفوفة الارتباط',
            subtitle: 'ارتباطات الذهب مع الأصول الرئيسية',
            positive: 'ارتباطات إيجابية',
            negative: 'ارتباطات سلبية',
            strongest: 'أقوى الارتباطات',
            dataPoints: 'نقطة بيانات',
            noData: 'تعذر حساب الارتباطات',
            realData: 'محسوبة من بيانات الأسعار الفعلية لـ 30 يوم',
            asset: 'الأصل',
            correlation: 'الارتباط'
        }
    }[lang] || {};

    useEffect(() => {
        setLoading(true);
        fetch('/api/market/correlations')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    const getCorrelationColor = (value) => {
        if (value >= 0.7) return '#4caf50';
        if (value >= 0.3) return '#8bc34a';
        if (value > -0.3) return '#ff9800';
        if (value > -0.7) return '#ff5722';
        return '#f44336';
    };

    const getCorrelationBg = (value) => {
        const intensity = Math.abs(value);
        if (value > 0) return `rgba(76, 175, 80, ${intensity * 0.4})`;
        return `rgba(244, 67, 54, ${intensity * 0.4})`;
    };

    if (loading) return <div className="corr-card"><LoadingSkeleton height="350px" /></div>;

    const correlations = data?.correlations || {};
    const hasData = data?.hasRealData && Object.keys(correlations).length > 0;

    return (
        <div className="corr-card">
            <div className="card-header">
                <span className="icon">🔗</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {!hasData ? (
                <div className="no-data-notice">
                    <span className="notice-icon">⚠️</span>
                    <p>{t.noData}</p>
                </div>
            ) : (
                <>
                    {/* Real Data Badge */}
                    <div className="real-data-badge">
                        ✓ {lang === 'ar' ? data.noteAr : data.note}
                    </div>

                    {/* Correlation Grid */}
                    <div className="corr-grid">
                        {Object.entries(correlations).map(([asset, corrData]) => {
                            const value = corrData.value;
                            return (
                                <div 
                                    key={asset} 
                                    className="corr-item"
                                    style={{ background: getCorrelationBg(value) }}
                                >
                                    <span className="asset-name">{asset}</span>
                                    <span 
                                        className="corr-value"
                                        style={{ color: getCorrelationColor(value) }}
                                    >
                                        {value > 0 ? '+' : ''}{value.toFixed(3)}
                                    </span>
                                    <span className="data-points">
                                        {corrData.dataPoints} {t.dataPoints}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Strongest Correlations */}
                    {data?.highlights && (
                        <div className="highlights-section">
                            <h3>{t.strongest}</h3>
                            <div className="highlights-grid">
                                <div className="highlight-col positive">
                                    <span className="col-label">{t.positive}</span>
                                    {data.highlights.strongestPositive?.map((item) => (
                                        <div key={item.name} className="highlight-item">
                                            <span>{item.name}</span>
                                            <span className="value positive">+{item.value.toFixed(3)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="highlight-col negative">
                                    <span className="col-label">{t.negative}</span>
                                    {data.highlights.strongestNegative?.map((item) => (
                                        <div key={item.name} className="highlight-item">
                                            <span>{item.name}</span>
                                            <span className="value negative">{item.value.toFixed(3)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
                .corr-card {
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
                
                .no-data-notice {
                    padding: 2rem;
                    background: rgba(255, 152, 0, 0.1);
                    border: 1px solid rgba(255, 152, 0, 0.3);
                    border-radius: 12px;
                    text-align: center;
                }
                .notice-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
                .no-data-notice p {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin: 0;
                }
                
                .real-data-badge {
                    padding: 0.5rem 0.75rem;
                    background: rgba(76, 175, 80, 0.1);
                    border: 1px solid rgba(76, 175, 80, 0.3);
                    border-radius: 8px;
                    color: #4caf50;
                    font-size: 0.75rem;
                    text-align: center;
                    margin-bottom: 1rem;
                }
                
                .corr-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .corr-item {
                    padding: 0.75rem 0.5rem;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .asset-name {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }
                .corr-value {
                    display: block;
                    font-size: 1.1rem;
                    font-weight: 700;
                }
                .data-points {
                    display: block;
                    font-size: 0.6rem;
                    color: var(--text-secondary);
                    margin-top: 0.25rem;
                    opacity: 0.7;
                }
                
                .highlights-section { margin-top: 1rem; }
                .highlights-section h3 {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.5rem;
                }
                .highlights-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .highlight-col {
                    padding: 0.75rem;
                    border-radius: 8px;
                }
                .highlight-col.positive { background: rgba(76, 175, 80, 0.1); }
                .highlight-col.negative { background: rgba(244, 67, 54, 0.1); }
                .col-label {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    text-align: center;
                }
                .highlight-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    padding: 0.3rem 0;
                }
                .value.positive { color: #4caf50; font-weight: 600; }
                .value.negative { color: #f44336; font-weight: 600; }
            `}</style>
        </div>
    );
}
