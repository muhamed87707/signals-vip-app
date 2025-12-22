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
            consensus: 'Consensus',
            bullish: 'Bullish',
            bearish: 'Bearish',
            neutral: 'Neutral',
            target: 'Target',
            avgTarget: 'Avg Target',
            highTarget: 'High',
            lowTarget: 'Low',
            timeframe: 'Timeframe',
            credibility: 'Credibility'
        },
        ar: {
            title: 'آراء الخبراء',
            subtitle: 'آراء المحللين حول الذهب',
            consensus: 'الإجماع',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            neutral: 'محايد',
            target: 'الهدف',
            avgTarget: 'متوسط الهدف',
            highTarget: 'الأعلى',
            lowTarget: 'الأدنى',
            timeframe: 'الإطار الزمني',
            credibility: 'المصداقية'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/expert-opinions')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    const getSentimentColor = (sentiment) => {
        const colors = { bullish: '#4caf50', bearish: '#f44336', neutral: '#ff9800' };
        return colors[sentiment] || '#ff9800';
    };

    if (loading) return <div className="expert-card"><LoadingSkeleton height="400px" /></div>;

    const experts = data?.experts || [];
    const consensus = data?.consensus || {};
    const targets = data?.targets || {};
    const analysis = data?.aiAnalysis || {};

    return (
        <div className="expert-card">
            <div className="card-header">
                <span className="icon">👨‍💼</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Consensus Meter */}
            <div className="consensus-section">
                <h3>{t.consensus}</h3>
                <div className="consensus-bar">
                    <div 
                        className="bar-segment bullish" 
                        style={{ width: `${consensus.bullishPercentage || 0}%` }}
                    />
                    <div 
                        className="bar-segment neutral" 
                        style={{ width: `${(consensus.neutral / experts.length) * 100 || 0}%` }}
                    />
                    <div 
                        className="bar-segment bearish" 
                        style={{ width: `${(consensus.bearish / experts.length) * 100 || 0}%` }}
                    />
                </div>
                <div className="consensus-labels">
                    <span className="bullish">{t.bullish}: {consensus.bullish}</span>
                    <span className="neutral">{t.neutral}: {consensus.neutral}</span>
                    <span className="bearish">{t.bearish}: {consensus.bearish}</span>
                </div>
            </div>

            {/* Target Prices */}
            <div className="targets-section">
                <div className="target-item main">
                    <span className="label">{t.avgTarget}</span>
                    <span className="value">${targets.average?.toLocaleString()}</span>
                </div>
                <div className="target-item">
                    <span className="label">{t.highTarget}</span>
                    <span className="value high">${targets.high?.toLocaleString()}</span>
                </div>
                <div className="target-item">
                    <span className="label">{t.lowTarget}</span>
                    <span className="value low">${targets.low?.toLocaleString()}</span>
                </div>
            </div>

            {/* Expert List */}
            <div className="experts-list">
                {experts.slice(0, 4).map((expert, idx) => (
                    <div key={idx} className="expert-item">
                        <div className="expert-header">
                            <div className="expert-info">
                                <span className="expert-name">
                                    {lang === 'ar' ? expert.nameAr : expert.name}
                                </span>
                                <span className="expert-title">
                                    {lang === 'ar' ? expert.titleAr : expert.title}
                                </span>
                            </div>
                            <span 
                                className="sentiment-badge"
                                style={{ backgroundColor: getSentimentColor(expert.sentiment) }}
                            >
                                {t[expert.sentiment]}
                            </span>
                        </div>
                        <p className="expert-quote">
                            "{lang === 'ar' ? expert.quoteAr : expert.quote}"
                        </p>
                        <div className="expert-meta">
                            <span>{t.target}: ${expert.target?.toLocaleString()}</span>
                            <span>{t.timeframe}: {expert.timeframe}</span>
                            <span className="credibility">
                                {t.credibility}: {expert.credibility}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Summary */}
            {analysis.consensusSummary && (
                <div className="ai-summary">
                    <p>{lang === 'ar' ? analysis.consensusSummaryAr : analysis.consensusSummary}</p>
                    {analysis.keyThemes && (
                        <div className="themes">
                            {(lang === 'ar' ? analysis.keyThemesAr : analysis.keyThemes)?.map((theme, i) => (
                                <span key={i} className="theme-tag">{theme}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .expert-card {
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
                
                .consensus-section { margin-bottom: 1rem; }
                .consensus-section h3 {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.5rem;
                }
                .consensus-bar {
                    display: flex;
                    height: 12px;
                    border-radius: 6px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.1);
                }
                .bar-segment { height: 100%; }
                .bar-segment.bullish { background: #4caf50; }
                .bar-segment.neutral { background: #ff9800; }
                .bar-segment.bearish { background: #f44336; }
                .consensus-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 0.5rem;
                    font-size: 0.7rem;
                }
                .consensus-labels .bullish { color: #4caf50; }
                .consensus-labels .neutral { color: #ff9800; }
                .consensus-labels .bearish { color: #f44336; }
                
                .targets-section {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .target-item {
                    padding: 0.5rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                    text-align: center;
                }
                .target-item.main {
                    border: 1px solid rgba(184, 134, 11, 0.3);
                }
                .target-item .label {
                    display: block;
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                }
                .target-item .value {
                    display: block;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--gold-bright);
                }
                .target-item .value.high { color: #4caf50; font-size: 0.9rem; }
                .target-item .value.low { color: #f44336; font-size: 0.9rem; }
                
                .experts-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .expert-item {
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }
                .expert-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }
                .expert-name {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .expert-title {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }
                .sentiment-badge {
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: white;
                }
                .expert-quote {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    font-style: italic;
                    margin: 0 0 0.5rem;
                    line-height: 1.4;
                }
                .expert-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                }
                .credibility { color: var(--gold-medium); }
                
                .ai-summary {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(184, 134, 11, 0.1);
                    border-radius: 8px;
                    border-left: 3px solid var(--gold-primary);
                }
                .ai-summary p {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0 0 0.5rem;
                    line-height: 1.5;
                }
                .themes { display: flex; flex-wrap: wrap; gap: 0.25rem; }
                .theme-tag {
                    padding: 0.15rem 0.4rem;
                    background: rgba(184, 134, 11, 0.2);
                    border-radius: 4px;
                    font-size: 0.65rem;
                    color: var(--gold-medium);
                }
            `}</style>
        </div>
    );
}
