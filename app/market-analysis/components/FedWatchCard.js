'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function FedWatchCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Fed Watch',
            subtitle: 'Federal Reserve policy tracker',
            currentRate: 'Current Rate',
            nextMeeting: 'Next FOMC Meeting',
            daysUntil: 'days',
            probabilities: 'Rate Probabilities',
            cut50: '-50 bps',
            cut25: '-25 bps',
            hold: 'Hold',
            hike25: '+25 bps',
            officials: 'Fed Officials',
            hawkish: 'Hawkish',
            dovish: 'Dovish',
            neutral: 'Neutral',
            dotPlot: 'Dot Plot Projections',
            goldImpact: 'Gold Impact',
            bullish: 'Bullish',
            bearish: 'Bearish',
            stance: 'Overall Stance'
        },
        ar: {
            title: 'متابعة الفيدرالي',
            subtitle: 'متتبع سياسة الاحتياطي الفيدرالي',
            currentRate: 'السعر الحالي',
            nextMeeting: 'اجتماع FOMC القادم',
            daysUntil: 'يوم',
            probabilities: 'احتمالات الفائدة',
            cut50: '-50 نقطة',
            cut25: '-25 نقطة',
            hold: 'تثبيت',
            hike25: '+25 نقطة',
            officials: 'مسؤولو الفيدرالي',
            hawkish: 'متشدد',
            dovish: 'متساهل',
            neutral: 'محايد',
            dotPlot: 'توقعات Dot Plot',
            goldImpact: 'التأثير على الذهب',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            stance: 'الموقف العام'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/fed-watch')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="fed-card"><LoadingSkeleton height="400px" /></div>;

    const probs = data?.probabilities || {};
    const analysis = data?.analysis || {};

    const getStanceColor = (stance) => {
        const colors = { hawkish: '#f44336', dovish: '#4caf50', neutral: '#ff9800' };
        return colors[stance] || '#ff9800';
    };

    return (
        <div className="fed-card">
            <div className="card-header">
                <span className="icon">🏛️</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Current Rate & Next Meeting */}
            <div className="rate-section">
                <div className="rate-box">
                    <span className="label">{t.currentRate}</span>
                    <span className="rate-value">
                        {data?.currentRate?.lower}% - {data?.currentRate?.upper}%
                    </span>
                </div>
                <div className="meeting-box">
                    <span className="label">{t.nextMeeting}</span>
                    <span className="meeting-date">{data?.nextMeeting?.date}</span>
                    <span className="days-until">{data?.nextMeeting?.daysUntil} {t.daysUntil}</span>
                </div>
            </div>

            {/* Rate Probabilities */}
            <div className="probs-section">
                <h3>{t.probabilities}</h3>
                <div className="probs-grid">
                    {[
                        { key: 'cut50', label: t.cut50, color: '#4caf50' },
                        { key: 'cut25', label: t.cut25, color: '#8bc34a' },
                        { key: 'hold', label: t.hold, color: '#ff9800' },
                        { key: 'hike25', label: t.hike25, color: '#f44336' }
                    ].map(item => (
                        <div key={item.key} className="prob-item">
                            <span className="prob-label">{item.label}</span>
                            <div className="prob-bar">
                                <div 
                                    className="prob-fill" 
                                    style={{ width: `${probs[item.key] || 0}%`, backgroundColor: item.color }}
                                />
                            </div>
                            <span className="prob-value">{probs[item.key]?.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Officials Statements */}
            <div className="officials-section">
                <h3>{t.officials}</h3>
                <div className="officials-list">
                    {data?.officials?.slice(0, 3).map((official, idx) => (
                        <div key={idx} className="official-item">
                            <div className="official-header">
                                <span className="official-name">
                                    {lang === 'ar' ? official.nameAr : official.name}
                                </span>
                                <span 
                                    className="stance-badge"
                                    style={{ backgroundColor: getStanceColor(official.stance) }}
                                >
                                    {t[official.stance]}
                                </span>
                            </div>
                            <span className="official-title">
                                {lang === 'ar' ? official.titleAr : official.title}
                            </span>
                            <p className="official-quote">
                                "{lang === 'ar' ? official.quoteAr : official.quote}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analysis Summary */}
            <div className="analysis-row">
                <div className="analysis-item">
                    <span className="label">{t.stance}</span>
                    <span className="badge" style={{ backgroundColor: getStanceColor(analysis.overallStance) }}>
                        {t[analysis.overallStance]}
                    </span>
                </div>
                <div className="analysis-item">
                    <span className="label">{t.goldImpact}</span>
                    <span className={`badge ${analysis.goldImpact}`}>
                        {t[analysis.goldImpact]}
                    </span>
                </div>
            </div>

            <style jsx>{`
                .fed-card {
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
                
                .rate-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .rate-box, .meeting-box {
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 12px;
                    text-align: center;
                }
                .rate-box { border: 1px solid rgba(184, 134, 11, 0.2); }
                .label { display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
                .rate-value { font-size: 1.5rem; font-weight: 700; color: var(--gold-bright); }
                .meeting-date { display: block; font-size: 1rem; font-weight: 600; }
                .days-until { font-size: 0.8rem; color: var(--gold-medium); }
                
                .probs-section, .officials-section { margin-bottom: 1rem; }
                .probs-section h3, .officials-section h3 {
                    font-size: 0.85rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.75rem;
                }
                
                .probs-grid { display: flex; flex-direction: column; gap: 0.5rem; }
                .prob-item {
                    display: grid;
                    grid-template-columns: 70px 1fr 50px;
                    gap: 0.5rem;
                    align-items: center;
                }
                .prob-label { font-size: 0.75rem; color: var(--text-secondary); }
                .prob-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .prob-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
                .prob-value { font-size: 0.8rem; font-weight: 600; text-align: right; }
                
                .officials-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .official-item {
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }
                .official-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .official-name { font-size: 0.85rem; font-weight: 600; }
                .stance-badge {
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: white;
                }
                .official-title { font-size: 0.7rem; color: var(--text-secondary); }
                .official-quote {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    font-style: italic;
                    margin: 0.5rem 0 0;
                    line-height: 1.4;
                }
                
                .analysis-row { display: flex; gap: 0.75rem; }
                .analysis-item {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 6px;
                }
                .badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: white;
                }
                .badge.bullish { background: rgba(76, 175, 80, 0.8); }
                .badge.bearish { background: rgba(244, 67, 54, 0.8); }
                .badge.neutral { background: rgba(255, 152, 0, 0.8); }
                
                @media (max-width: 768px) {
                    .rate-section { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
