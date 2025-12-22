'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, ChangeIndicator } from './common';

export default function DXYAnalysisCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Dollar Index (DXY)',
            subtitle: 'US Dollar strength indicator',
            current: 'Current',
            daily: 'Daily',
            weekly: 'Weekly',
            high52w: '52W High',
            low52w: '52W Low',
            goldCorrelation: 'Gold Correlation',
            support: 'Support',
            resistance: 'Resistance',
            trend: 'Trend',
            goldImpact: 'Gold Impact',
            bullish: 'Bullish',
            bearish: 'Bearish',
            neutral: 'Neutral',
            strong: 'Strong USD',
            weak: 'Weak USD',
            moderate: 'Moderate'
        },
        ar: {
            title: 'مؤشر الدولار (DXY)',
            subtitle: 'مؤشر قوة الدولار الأمريكي',
            current: 'الحالي',
            daily: 'يومي',
            weekly: 'أسبوعي',
            high52w: 'أعلى 52 أسبوع',
            low52w: 'أدنى 52 أسبوع',
            goldCorrelation: 'الارتباط بالذهب',
            support: 'الدعم',
            resistance: 'المقاومة',
            trend: 'الاتجاه',
            goldImpact: 'التأثير على الذهب',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            neutral: 'محايد',
            strong: 'دولار قوي',
            weak: 'دولار ضعيف',
            moderate: 'معتدل'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/dxy')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="dxy-card"><LoadingSkeleton height="280px" /></div>;

    return (
        <div className="dxy-card">
            <div className="card-header">
                <span className="icon">💲</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            <div className="main-value">
                <span className="value">{data?.value?.toFixed(3)}</span>
                <ChangeIndicator value={data?.change} suffix="" precision={3} showArrow size="lg" />
            </div>

            <div className="stats-row">
                <div className="stat">
                    <span className="label">{t.daily}</span>
                    <ChangeIndicator value={data?.changePercent} suffix="%" showArrow />
                </div>
                <div className="stat">
                    <span className="label">{t.weekly}</span>
                    <ChangeIndicator value={data?.weekChangePercent} suffix="%" showArrow />
                </div>
                <div className="stat">
                    <span className="label">{t.goldCorrelation}</span>
                    <span className="corr-value">{data?.goldCorrelation}</span>
                </div>
            </div>

            <div className="range-bar">
                <span className="range-label">{t.low52w}: {data?.low52w}</span>
                <div className="bar">
                    <div className="marker" style={{
                        left: `${((data?.value - data?.low52w) / (data?.high52w - data?.low52w)) * 100}%`
                    }}></div>
                </div>
                <span className="range-label">{t.high52w}: {data?.high52w}</span>
            </div>

            <div className="levels-row">
                <div className="level support">
                    <span className="label">{t.support}</span>
                    <div className="values">
                        {data?.technicalLevels?.support?.map((l, i) => (
                            <span key={i}>{l}</span>
                        ))}
                    </div>
                </div>
                <div className="level resistance">
                    <span className="label">{t.resistance}</span>
                    <div className="values">
                        {data?.technicalLevels?.resistance?.map((l, i) => (
                            <span key={i}>{l}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="analysis-badges">
                <span className={`badge ${data?.analysis?.trend}`}>
                    {t.trend}: {t[data?.analysis?.trend] || data?.analysis?.trend}
                </span>
                <span className={`badge ${data?.analysis?.goldImpact}`}>
                    {t.goldImpact}: {t[data?.analysis?.goldImpact] || data?.analysis?.goldImpact}
                </span>
            </div>

            <style jsx>{`
                .dxy-card {
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
                .main-value {
                    display: flex;
                    align-items: baseline;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .main-value .value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--gold-bright);
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .stat { text-align: center; }
                .stat .label { display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
                .corr-value { font-weight: 600; color: #f44336; }
                .range-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }
                .bar {
                    flex: 1;
                    height: 6px;
                    background: linear-gradient(90deg, #4caf50, #ff9800, #f44336);
                    border-radius: 3px;
                    position: relative;
                }
                .marker {
                    position: absolute;
                    top: -4px;
                    width: 4px;
                    height: 14px;
                    background: white;
                    border-radius: 2px;
                    transform: translateX(-50%);
                }
                .levels-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .level {
                    flex: 1;
                    padding: 0.5rem;
                    border-radius: 6px;
                }
                .level.support { background: rgba(76, 175, 80, 0.1); }
                .level.resistance { background: rgba(244, 67, 54, 0.1); }
                .level .label { display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
                .level .values { display: flex; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; }
                .level.support .values { color: #4caf50; }
                .level.resistance .values { color: #f44336; }
                .analysis-badges {
                    display: flex;
                    gap: 0.5rem;
                }
                .badge {
                    flex: 1;
                    text-align: center;
                    padding: 0.4rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .badge.bullish { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
                .badge.bearish { background: rgba(244, 67, 54, 0.15); color: #f44336; }
                .badge.neutral { background: rgba(255, 152, 0, 0.15); color: #ff9800; }
            `}</style>
        </div>
    );
}
