'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AINewsAnalysis({ data, onRefresh, isLoading }) {
    const { t, lang, mounted } = useLanguage();

    if (!mounted) return null;

    if (isLoading || !data) {
        return (
            <div className="ai-analysis-card shimmer" style={{ minHeight: '400px' }}>
                <div className="ai-analysis-header">
                    <div className="ai-pulse-icon loading-skeleton" style={{ width: '60px', height: '60px' }}></div>
                    <div style={{ flex: 1 }}>
                        <div className="loading-skeleton" style={{ height: '24px', width: '60%' }}></div>
                    </div>
                </div>
                <div className="ai-content-body">
                    <div className="loading-skeleton" style={{ height: '100px', width: '100%' }}></div>
                    <div className="loading-skeleton" style={{ height: '150px', width: '100%' }}></div>
                </div>
            </div>
        );
    }

    // Extract sentiment data from the unified response with safety checks
    const analysisData = data?.market_sentiment || {
        sentiment: t.loading,
        color: '#888',
        summary: t.loading
    };
    const topNews = data?.top_news || [];

    return (
        <div className="ai-analysis-card animate-fade-in-up">
            <div className="ai-analysis-header">
                <div className="ai-pulse-icon">
                    <div className="pulse-ring"></div>
                    <span className="brain-icon">🧠</span>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="ai-analysis-title">{t.aiInsights}</h3>
                        <button
                            onClick={onRefresh}
                            className={`refresh-ai-btn ${isLoading ? 'spinning' : ''}`}
                            title="Refresh Dashboard"
                            disabled={isLoading}
                        >
                            🔄
                        </button>
                    </div>
                    <div className="sentiment-badge" style={{ color: analysisData.sentimentColor || '#ffd700' }}>
                        {t.marketSentiment}: <strong>{analysisData.sentiment}</strong>
                        {analysisData.lastUpdated && <span style={{ marginLeft: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>({analysisData.lastUpdated})</span>}
                    </div>
                </div>
            </div>

            <div className="ai-content-body">
                <div className="ai-summary-box">
                    <h4>{t.aiSummary}</h4>
                    <p>{analysisData.summary}</p>
                </div>

                <div className="top-news-section">
                    <h4>{t.topNews}</h4>
                    <div className="news-grid">
                        {(topNews || []).map((item, idx) => (
                            <div key={idx} className="news-item">
                                <div className="news-item-top">
                                    <span className="news-item-title">{item.title}</span>
                                    <span className={`impact-badge impact-high`}>
                                        {t.impact}: {item.impact}
                                    </span>
                                </div>
                                <p className="news-item-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .refresh-ai-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    opacity: 0.6;
                    transition: all 0.3s ease;
                }
                .refresh-ai-btn:hover {
                    opacity: 1;
                    transform: rotate(180deg);
                }
                .refresh-ai-btn.spinning {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
