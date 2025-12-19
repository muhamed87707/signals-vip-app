'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AINewsAnalysis() {
    const { t, lang, mounted } = useLanguage();
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analysis?lang=${lang}`);
            const data = await res.json();
            setAnalysisData(data);
        } catch (error) {
            console.error("Failed to fetch analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted) {
            fetchAnalysis();
        }
    }, [lang, mounted]);

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="ai-analysis-card shimmer" style={{ minHeight: '400px' }}>
                <div className="ai-analysis-header">
                    <div className="ai-pulse-icon loading-skeleton" style={{ width: '60px', height: '60px' }}></div>
                    <div style={{ flex: 1 }}>
                        <div className="loading-skeleton" style={{ height: '24px', width: '60%' }}></div>
                        <div className="loading-skeleton" style={{ height: '16px', width: '40%' }}></div>
                    </div>
                </div>
                <div className="ai-content-body">
                    <div className="loading-skeleton" style={{ height: '100px', width: '100%' }}></div>
                    <div className="loading-skeleton" style={{ height: '150px', width: '100%' }}></div>
                </div>
            </div>
        );
    }

    if (!analysisData) return null;

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
                            onClick={fetchAnalysis}
                            className="refresh-ai-btn"
                            title="Refresh Analysis"
                        >
                            🔄
                        </button>
                    </div>
                    <div className="sentiment-badge" style={{ color: analysisData.sentimentColor || '#ffd700' }}>
                        {t.marketSentiment}: <strong>{analysisData.sentiment}</strong>
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
                        {(analysisData.topNews || []).map((item, idx) => (
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
            `}</style>
        </div>
    );
}
