'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, ChangeIndicator } from './common';

export default function TreasuryYieldsCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Treasury Yields',
            subtitle: 'US Government Bond Yields',
            yield2Y: '2-Year',
            yield5Y: '5-Year',
            yield10Y: '10-Year',
            yield30Y: '30-Year',
            spread: '2s10s Spread',
            realYield: 'Real Yield (10Y)',
            goldCorrelation: 'Gold Correlation',
            yieldCurve: 'Yield Curve',
            inverted: 'Inverted ⚠️',
            flat: 'Flat',
            normal: 'Normal',
            impact: 'Gold Impact',
            bullish: 'Bullish',
            bearish: 'Bearish',
            neutral: 'Neutral',
            rising: 'Rising',
            falling: 'Falling',
            stable: 'Stable'
        },
        ar: {
            title: 'عوائد السندات',
            subtitle: 'عوائد سندات الخزانة الأمريكية',
            yield2Y: 'سنتان',
            yield5Y: '5 سنوات',
            yield10Y: '10 سنوات',
            yield30Y: '30 سنة',
            spread: 'فارق 2-10 سنوات',
            realYield: 'العائد الحقيقي (10Y)',
            goldCorrelation: 'الارتباط بالذهب',
            yieldCurve: 'منحنى العائد',
            inverted: 'معكوس ⚠️',
            flat: 'مسطح',
            normal: 'طبيعي',
            impact: 'التأثير على الذهب',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            neutral: 'محايد',
            rising: 'صاعد',
            falling: 'هابط',
            stable: 'مستقر'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/treasury-yields')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="treasury-card"><LoadingSkeleton height="300px" /></div>;

    const yields = data?.yields || {};
    const curveStatus = data?.analysis?.yieldCurve;
    const curveText = curveStatus === 'inverted' ? t.inverted : curveStatus === 'flat' ? t.flat : t.normal;

    return (
        <div className="treasury-card">
            <div className="card-header">
                <span className="icon">💵</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            <div className="yields-grid">
                {['2Y', '5Y', '10Y', '30Y'].map(tenor => (
                    <div key={tenor} className={`yield-item ${tenor === '10Y' ? 'highlight' : ''}`}>
                        <span className="tenor">{t[`yield${tenor}`]}</span>
                        <span className="value">{yields[tenor]?.value?.toFixed(3)}%</span>
                        <ChangeIndicator value={yields[tenor]?.change} suffix="%" precision={3} showArrow />
                    </div>
                ))}
            </div>

            <div className="metrics-row">
                <div className="metric">
                    <span className="label">{t.spread}</span>
                    <span className={`value ${data?.isInverted ? 'warning' : ''}`}>
                        {data?.spread2s10s?.toFixed(3)}%
                    </span>
                </div>
                <div className="metric">
                    <span className="label">{t.realYield}</span>
                    <span className="value">{data?.realYield?.toFixed(2)}%</span>
                </div>
                <div className="metric">
                    <span className="label">{t.goldCorrelation}</span>
                    <span className="value">{data?.goldCorrelation}</span>
                </div>
            </div>

            <div className="analysis-row">
                <div className="analysis-item">
                    <span className="label">{t.yieldCurve}</span>
                    <span className={`badge ${curveStatus}`}>{curveText}</span>
                </div>
                <div className="analysis-item">
                    <span className="label">{t.impact}</span>
                    <span className={`badge ${data?.analysis?.realYieldImpact}`}>
                        {t[data?.analysis?.realYieldImpact] || data?.analysis?.realYieldImpact}
                    </span>
                </div>
            </div>

            {/* Simple Yield Curve Visualization */}
            <div className="curve-chart">
                <div className="curve-line">
                    {['2Y', '5Y', '10Y', '30Y'].map((tenor, idx) => (
                        <div key={tenor} className="curve-point" style={{
                            left: `${idx * 33}%`,
                            bottom: `${((yields[tenor]?.value || 4) - 3.5) * 50}%`
                        }}>
                            <span className="point-dot"></span>
                            <span className="point-label">{tenor}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .treasury-card {
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
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }
                .icon { font-size: 1.5rem; }
                .card-header h2 {
                    font-size: 1rem;
                    color: var(--gold-medium);
                    margin: 0;
                }
                .card-header p {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin: 0;
                }
                .yields-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .yield-item {
                    text-align: center;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                }
                .yield-item.highlight {
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                }
                .tenor {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }
                .value {
                    display: block;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .value.warning { color: #f44336; }
                .metrics-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    margin-bottom: 0.75rem;
                }
                .metric { text-align: center; }
                .metric .label {
                    display: block;
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                }
                .metric .value {
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .analysis-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .analysis-item {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 6px;
                }
                .analysis-item .label { font-size: 0.75rem; color: var(--text-secondary); }
                .badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
                .badge.inverted { background: rgba(244, 67, 54, 0.2); color: #f44336; }
                .badge.flat { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
                .badge.normal { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
                .badge.bullish { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
                .badge.bearish { background: rgba(244, 67, 54, 0.2); color: #f44336; }
                .badge.neutral { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
                .curve-chart {
                    height: 80px;
                    position: relative;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    padding: 1rem;
                }
                .curve-line { position: relative; height: 100%; }
                .curve-point {
                    position: absolute;
                    transform: translateX(-50%);
                }
                .point-dot {
                    display: block;
                    width: 8px;
                    height: 8px;
                    background: var(--gold-primary);
                    border-radius: 50%;
                    margin: 0 auto;
                }
                .point-label {
                    font-size: 0.6rem;
                    color: var(--text-secondary);
                }
                @media (max-width: 768px) {
                    .yields-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </div>
    );
}
