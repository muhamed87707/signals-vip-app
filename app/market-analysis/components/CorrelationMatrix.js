'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function CorrelationMatrix({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('1M');

    const t = {
        en: {
            title: 'Correlation Matrix',
            subtitle: 'Gold correlations with major assets',
            period: 'Period',
            positive: 'Positive',
            negative: 'Negative',
            strongest: 'Strongest Correlations',
            deviation: 'vs Historical',
            currencies: 'Currencies',
            bonds: 'Bonds',
            indices: 'Indices',
            commodities: 'Commodities',
            crypto: 'Crypto'
        },
        ar: {
            title: 'مصفوفة الارتباط',
            subtitle: 'ارتباطات الذهب مع الأصول الرئيسية',
            period: 'الفترة',
            positive: 'إيجابي',
            negative: 'سلبي',
            strongest: 'أقوى الارتباطات',
            deviation: 'مقارنة بالتاريخي',
            currencies: 'العملات',
            bonds: 'السندات',
            indices: 'المؤشرات',
            commodities: 'السلع',
            crypto: 'العملات الرقمية'
        }
    }[lang] || {};

    useEffect(() => {
        setLoading(true);
        fetch(`/api/market/correlations?period=${period}`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [period]);

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

    if (loading) return <div className="corr-card"><LoadingSkeleton height="400px" /></div>;

    const correlations = data?.correlations || {};
    const categories = data?.categories || {};
    const analysis = data?.aiAnalysis || {};

    return (
        <div className="corr-card">
            <div className="card-header">
                <span className="icon">🔗</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
                <div className="period-selector">
                    {data?.availablePeriods?.map(p => (
                        <button
                            key={p}
                            className={`period-btn ${period === p ? 'active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Correlation Grid by Category */}
            {Object.entries(categories).map(([category, assets]) => (
                <div key={category} className="category-section">
                    <h3>{t[category] || category}</h3>
                    <div className="corr-grid">
                        {assets.map(asset => {
                            const value = correlations[asset];
                            const deviation = data?.deviations?.[asset];
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
                                        {value > 0 ? '+' : ''}{value?.toFixed(2)}
                                    </span>
                                    {deviation?.isSignificant && (
                                        <span className={`deviation ${deviation.deviation > 0 ? 'up' : 'down'}`}>
                                            {deviation.deviation > 0 ? '↑' : '↓'} {Math.abs(deviation.deviation).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Strongest Correlations */}
            <div className="highlights-section">
                <h3>{t.strongest}</h3>
                <div className="highlights-grid">
                    <div className="highlight-col positive">
                        <span className="col-label">{t.positive}</span>
                        {data?.highlights?.strongestPositive?.map(([asset, value]) => (
                            <div key={asset} className="highlight-item">
                                <span>{asset}</span>
                                <span className="value positive">+{value.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="highlight-col negative">
                        <span className="col-label">{t.negative}</span>
                        {data?.highlights?.strongestNegative?.map(([asset, value]) => (
                            <div key={asset} className="highlight-item">
                                <span>{asset}</span>
                                <span className="value negative">{value.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Analysis */}
            {analysis.summary && (
                <div className="ai-analysis">
                    <p>{lang === 'ar' ? analysis.summaryAr : analysis.summary}</p>
                </div>
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
                    flex-wrap: wrap;
                }
                .icon { font-size: 1.5rem; }
                .card-header h2 { font-size: 1rem; color: var(--gold-medium); margin: 0; }
                .card-header p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
                
                .period-selector {
                    margin-left: auto;
                    display: flex;
                    gap: 0.25rem;
                }
                .period-btn {
                    padding: 0.3rem 0.6rem;
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 4px;
                    color: var(--text-secondary);
                    font-size: 0.7rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .period-btn:hover, .period-btn.active {
                    background: rgba(184, 134, 11, 0.2);
                    border-color: var(--gold-primary);
                    color: var(--gold-bright);
                }
                
                .category-section { margin-bottom: 1rem; }
                .category-section h3 {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.5rem;
                }
                
                .corr-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 0.5rem;
                }
                .corr-item {
                    padding: 0.5rem;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .asset-name {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }
                .corr-value {
                    display: block;
                    font-size: 1rem;
                    font-weight: 700;
                }
                .deviation {
                    display: block;
                    font-size: 0.65rem;
                    margin-top: 0.15rem;
                }
                .deviation.up { color: #4caf50; }
                .deviation.down { color: #f44336; }
                
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
                    padding: 0.5rem;
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
                    font-size: 0.75rem;
                    padding: 0.25rem 0;
                }
                .value.positive { color: #4caf50; font-weight: 600; }
                .value.negative { color: #f44336; font-weight: 600; }
                
                .ai-analysis {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(184, 134, 11, 0.1);
                    border-radius: 8px;
                    border-left: 3px solid var(--gold-primary);
                }
                .ai-analysis p {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
}
