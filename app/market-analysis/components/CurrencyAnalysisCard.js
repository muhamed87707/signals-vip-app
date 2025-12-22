'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, ChangeIndicator } from './common';

export default function CurrencyAnalysisCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Currency Analysis',
            subtitle: 'Major pairs affecting gold',
            pair: 'Pair',
            price: 'Price',
            change: 'Change',
            correlation: 'Gold Corr.',
            strength: 'Currency Strength',
            alignment: 'Currency Alignment',
            aligned: 'Aligned',
            mixed: 'Mixed',
            goldImpact: 'Gold Impact',
            bullish: 'Bullish',
            bearish: 'Bearish',
            neutral: 'Neutral'
        },
        ar: {
            title: 'تحليل العملات',
            subtitle: 'الأزواج الرئيسية المؤثرة على الذهب',
            pair: 'الزوج',
            price: 'السعر',
            change: 'التغيير',
            correlation: 'ارتباط الذهب',
            strength: 'قوة العملات',
            alignment: 'محاذاة العملات',
            aligned: 'متوافقة',
            mixed: 'متباينة',
            goldImpact: 'التأثير على الذهب',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            neutral: 'محايد'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/currencies')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="currency-card"><LoadingSkeleton height="350px" /></div>;

    const currencies = data?.currencies || [];
    const strength = data?.strength || {};
    const alignment = data?.alignment || {};

    return (
        <div className="currency-card">
            <div className="card-header">
                <span className="icon">💱</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Alignment Alert */}
            {alignment.aligned && (
                <div className={`alignment-alert ${alignment.goldImpact}`}>
                    {t.alignment}: {t.aligned} - {t.goldImpact}: {t[alignment.goldImpact]}
                </div>
            )}

            {/* Currency Pairs Table */}
            <div className="pairs-list">
                {currencies.map((c, idx) => (
                    <div key={idx} className="pair-row">
                        <div className="pair-name">
                            <span className="name">{lang === 'ar' ? c.nameAr : c.name}</span>
                        </div>
                        <div className="pair-price">{c.value?.toFixed(4)}</div>
                        <div className="pair-change">
                            <ChangeIndicator value={c.changePercent} suffix="%" showArrow />
                        </div>
                        <div className="pair-corr">
                            <span className={c.goldCorrelation > 0 ? 'positive' : 'negative'}>
                                {c.goldCorrelation > 0 ? '+' : ''}{c.goldCorrelation}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Currency Strength Meter */}
            <div className="strength-section">
                <h3>{t.strength}</h3>
                <div className="strength-bars">
                    {Object.entries(strength).map(([currency, value]) => (
                        <div key={currency} className="strength-item">
                            <span className="currency-label">{currency}</span>
                            <div className="strength-bar">
                                <div 
                                    className={`bar-fill ${value > 55 ? 'strong' : value < 45 ? 'weak' : 'neutral'}`}
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                            <span className="strength-value">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .currency-card {
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
                
                .alignment-alert {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 1rem;
                }
                .alignment-alert.bullish { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
                .alignment-alert.bearish { background: rgba(244, 67, 54, 0.15); color: #f44336; }
                
                .pairs-list { margin-bottom: 1rem; }
                .pair-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
                    gap: 0.5rem;
                    padding: 0.6rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 6px;
                    margin-bottom: 0.4rem;
                    align-items: center;
                }
                .pair-row:hover { background: rgba(0, 0, 0, 0.2); }
                .pair-name .name { font-size: 0.85rem; font-weight: 600; }
                .pair-price { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
                .pair-corr { text-align: right; font-size: 0.8rem; font-weight: 600; }
                .pair-corr .positive { color: #4caf50; }
                .pair-corr .negative { color: #f44336; }
                
                .strength-section h3 {
                    font-size: 0.85rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.75rem;
                }
                .strength-bars { display: flex; flex-direction: column; gap: 0.4rem; }
                .strength-item {
                    display: grid;
                    grid-template-columns: 40px 1fr 30px;
                    gap: 0.5rem;
                    align-items: center;
                }
                .currency-label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
                .strength-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s;
                }
                .bar-fill.strong { background: #4caf50; }
                .bar-fill.weak { background: #f44336; }
                .bar-fill.neutral { background: #ff9800; }
                .strength-value { font-size: 0.7rem; color: var(--text-secondary); text-align: right; }
                
                @media (max-width: 768px) {
                    .pair-row { grid-template-columns: 1fr 1fr; }
                    .pair-corr { display: none; }
                }
            `}</style>
        </div>
    );
}
