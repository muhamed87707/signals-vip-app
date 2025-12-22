'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, ChangeIndicator } from './common';

export default function IndicesCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Indices & Stocks',
            subtitle: 'Market indices and gold miners',
            mainIndices: 'Main Indices',
            miningStocks: 'Gold Mining Stocks',
            riskSentiment: 'Risk Sentiment',
            goldSPRatio: 'Gold/S&P Ratio',
            vixAlert: '⚠️ VIX Spike Alert',
            riskOn: 'Risk-On',
            riskOff: 'Risk-Off',
            neutral: 'Neutral',
            goldImpact: 'Gold Impact',
            bullish: 'Bullish',
            bearish: 'Bearish',
            extremeFear: 'Extreme Fear',
            elevated: 'Elevated',
            normal: 'Normal',
            overvalued: 'Gold Overvalued',
            undervalued: 'Gold Undervalued',
            fairValue: 'Fair Value'
        },
        ar: {
            title: 'المؤشرات والأسهم',
            subtitle: 'مؤشرات السوق وأسهم التعدين',
            mainIndices: 'المؤشرات الرئيسية',
            miningStocks: 'أسهم شركات التعدين',
            riskSentiment: 'معنويات المخاطرة',
            goldSPRatio: 'نسبة الذهب/S&P',
            vixAlert: '⚠️ تنبيه ارتفاع VIX',
            riskOn: 'شهية المخاطرة',
            riskOff: 'تجنب المخاطرة',
            neutral: 'محايد',
            goldImpact: 'التأثير على الذهب',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            extremeFear: 'خوف شديد',
            elevated: 'مرتفع',
            normal: 'طبيعي',
            overvalued: 'الذهب مبالغ فيه',
            undervalued: 'الذهب مقيم بأقل',
            fairValue: 'قيمة عادلة'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/indices')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="indices-card"><LoadingSkeleton height="350px" /></div>;

    const indices = data?.indices || [];
    const mining = data?.miningStocks || [];
    const risk = data?.riskAnalysis || {};
    const ratio = data?.goldSPRatio || {};

    return (
        <div className="indices-card">
            <div className="card-header">
                <span className="icon">📉</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* VIX Alert */}
            {risk.vixSpike && (
                <div className="vix-alert">{t.vixAlert}</div>
            )}

            {/* Main Indices */}
            <div className="section">
                <h3>{t.mainIndices}</h3>
                <div className="indices-grid">
                    {indices.map((idx, i) => (
                        <div key={i} className={`index-item ${idx.isVIX ? 'vix' : ''}`}>
                            <span className="index-name">{lang === 'ar' ? idx.nameAr : idx.name}</span>
                            <span className="index-value">
                                {idx.isVIX ? idx.value?.toFixed(2) : idx.value?.toLocaleString()}
                            </span>
                            <ChangeIndicator value={idx.changePercent} suffix="%" showArrow />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mining Stocks */}
            <div className="section">
                <h3>{t.miningStocks}</h3>
                <div className="mining-grid">
                    {mining.map((stock, i) => (
                        <div key={i} className="mining-item">
                            <span className="stock-name">{lang === 'ar' ? stock.nameAr : stock.name}</span>
                            <span className="stock-value">${stock.value?.toFixed(2)}</span>
                            <ChangeIndicator value={stock.changePercent} suffix="%" showArrow />
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Analysis */}
            <div className="analysis-row">
                <div className="analysis-item">
                    <span className="label">{t.riskSentiment}</span>
                    <span className={`badge ${risk.sentiment}`}>
                        {risk.sentiment === 'risk_on' ? t.riskOn : 
                         risk.sentiment === 'risk_off' ? t.riskOff : t.neutral}
                    </span>
                </div>
                <div className="analysis-item">
                    <span className="label">{t.goldImpact}</span>
                    <span className={`badge ${risk.goldImpact}`}>
                        {t[risk.goldImpact] || risk.goldImpact}
                    </span>
                </div>
            </div>

            {/* Gold/S&P Ratio */}
            <div className="ratio-section">
                <span className="ratio-label">{t.goldSPRatio}</span>
                <span className="ratio-value">{ratio.ratio}</span>
                <span className={`ratio-signal ${ratio.signal}`}>
                    {ratio.signal === 'gold_overvalued' ? t.overvalued :
                     ratio.signal === 'gold_undervalued' ? t.undervalued : t.fairValue}
                </span>
            </div>

            <style jsx>{`
                .indices-card {
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
                
                .vix-alert {
                    padding: 0.5rem;
                    background: rgba(244, 67, 54, 0.15);
                    border: 1px solid rgba(244, 67, 54, 0.3);
                    border-radius: 8px;
                    color: #f44336;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 1rem;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                .section { margin-bottom: 1rem; }
                .section h3 {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.5rem;
                }
                
                .indices-grid, .mining-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                }
                
                .index-item, .mining-item {
                    display: flex;
                    flex-direction: column;
                    padding: 0.6rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                }
                .index-item.vix {
                    background: rgba(244, 67, 54, 0.1);
                    border: 1px solid rgba(244, 67, 54, 0.2);
                }
                
                .index-name, .stock-name {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }
                .index-value, .stock-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                
                .analysis-row {
                    display: flex;
                    gap: 0.75rem;
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
                .analysis-item .label { font-size: 0.7rem; color: var(--text-secondary); }
                .badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
                .badge.risk_on, .badge.bearish { background: rgba(244, 67, 54, 0.15); color: #f44336; }
                .badge.risk_off, .badge.bullish { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
                .badge.neutral { background: rgba(255, 152, 0, 0.15); color: #ff9800; }
                
                .ratio-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.6rem;
                    background: rgba(184, 134, 11, 0.05);
                    border-radius: 8px;
                }
                .ratio-label { font-size: 0.75rem; color: var(--text-secondary); }
                .ratio-value { font-size: 1rem; font-weight: 700; color: var(--gold-medium); }
                .ratio-signal {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }
                .ratio-signal.gold_overvalued { background: rgba(244, 67, 54, 0.15); color: #f44336; }
                .ratio-signal.gold_undervalued { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
                .ratio-signal.fair_value { background: rgba(255, 152, 0, 0.15); color: #ff9800; }
            `}</style>
        </div>
    );
}
