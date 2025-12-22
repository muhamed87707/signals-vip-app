'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, TrendBadge, ImpactBadge } from './common';

/**
 * NewsAnalysisCard - Gold market news with AI analysis
 */
export default function NewsAnalysisCard({ lang = 'en' }) {
    const [newsData, setNewsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [expandedNews, setExpandedNews] = useState(null);

    const translations = {
        en: {
            title: 'Market News & Analysis',
            subtitle: 'Latest gold market news with AI insights',
            all: 'All',
            fed: 'Fed',
            currency: 'Currency',
            fundamental: 'Fundamental',
            geopolitical: 'Geopolitical',
            technical: 'Technical',
            breaking: 'BREAKING',
            hoursAgo: 'hours ago',
            minutesAgo: 'minutes ago',
            justNow: 'Just now',
            readMore: 'Read more',
            aiSummary: 'AI News Summary',
            keyThemes: 'Key Themes',
            overallSentiment: 'Overall Sentiment',
            loading: 'Loading news...',
            error: 'Failed to load news',
            refresh: 'Refresh',
            noNews: 'No news available'
        },
        ar: {
            title: 'أخبار وتحليلات السوق',
            subtitle: 'آخر أخبار سوق الذهب مع رؤى الذكاء الاصطناعي',
            all: 'الكل',
            fed: 'الفيدرالي',
            currency: 'العملات',
            fundamental: 'أساسي',
            geopolitical: 'جيوسياسي',
            technical: 'فني',
            breaking: 'عاجل',
            hoursAgo: 'ساعات مضت',
            minutesAgo: 'دقائق مضت',
            justNow: 'الآن',
            readMore: 'اقرأ المزيد',
            aiSummary: 'ملخص الأخبار بالذكاء الاصطناعي',
            keyThemes: 'المواضيع الرئيسية',
            overallSentiment: 'الاتجاه العام',
            loading: 'جاري تحميل الأخبار...',
            error: 'فشل في تحميل الأخبار',
            refresh: 'تحديث',
            noNews: 'لا توجد أخبار متاحة'
        }
    };

    const t = translations[lang] || translations.en;

    const categories = [
        { id: 'all', label: t.all },
        { id: 'fed', label: t.fed },
        { id: 'currency', label: t.currency },
        { id: 'fundamental', label: t.fundamental },
        { id: 'geopolitical', label: t.geopolitical },
        { id: 'technical', label: t.technical }
    ];

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/market/news');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setNewsData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 5) return t.justNow;
        if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`;
        return `${diffHours} ${t.hoursAgo}`;
    };

    const getSentimentColor = (sentiment) => {
        const colors = {
            bullish: '#4caf50',
            bearish: '#f44336',
            neutral: '#ff9800'
        };
        return colors[sentiment] || '#ff9800';
    };

    const getImpactColor = (impact) => {
        const colors = {
            high: '#f44336',
            medium: '#ff9800',
            low: '#4caf50'
        };
        return colors[impact] || '#ff9800';
    };

    const filteredNews = newsData?.news?.filter(
        news => filter === 'all' || news.category === filter
    ) || [];

    if (loading && !newsData) {
        return (
            <div className="news-card loading-state">
                <LoadingSkeleton height="400px" />
            </div>
        );
    }

    if (error && !newsData) {
        return (
            <div className="news-card error-state">
                <p>{t.error}</p>
                <button onClick={fetchNews}>{t.refresh}</button>
            </div>
        );
    }

    return (
        <div className="news-card">
            <div className="news-header">
                <div className="news-title">
                    <span className="news-icon">📰</span>
                    <div>
                        <h2>{t.title}</h2>
                        <p className="subtitle">{t.subtitle}</p>
                    </div>
                </div>
                <button className="refresh-btn" onClick={fetchNews} disabled={loading}>
                    🔄
                </button>
            </div>

            {/* AI Summary */}
            {newsData?.aiSummary && (
                <div className="ai-summary">
                    <div className="ai-summary-header">
                        <span>🧠 {t.aiSummary}</span>
                        <span 
                            className="sentiment-badge"
                            style={{ backgroundColor: getSentimentColor(newsData.aiSummary.overallSentiment) }}
                        >
                            {newsData.aiSummary.overallSentiment}
                        </span>
                    </div>
                    <p className="ai-summary-text">
                        {lang === 'ar' ? newsData.aiSummary.summaryAr : newsData.aiSummary.summary}
                    </p>
                    {newsData.aiSummary.keyThemes && (
                        <div className="key-themes">
                            <span className="themes-label">{t.keyThemes}:</span>
                            {(lang === 'ar' ? newsData.aiSummary.keyThemesAr : newsData.aiSummary.keyThemes)?.map((theme, idx) => (
                                <span key={idx} className="theme-tag">{theme}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Category Filter */}
            <div className="category-filter">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
                        onClick={() => setFilter(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* News List */}
            <div className="news-list">
                {filteredNews.length === 0 ? (
                    <p className="no-news">{t.noNews}</p>
                ) : (
                    filteredNews.map((news, idx) => (
                        <div 
                            key={news.id || idx} 
                            className={`news-item ${news.isBreaking ? 'breaking' : ''}`}
                            onClick={() => setExpandedNews(expandedNews === idx ? null : idx)}
                        >
                            {news.isBreaking && (
                                <span className="breaking-badge">{t.breaking}</span>
                            )}
                            <div className="news-item-header">
                                <h3>{lang === 'ar' ? news.titleAr : news.title}</h3>
                                <div className="news-meta">
                                    <span className="news-source">{news.source}</span>
                                    <span className="news-time">{formatTimeAgo(news.publishedAt)}</span>
                                </div>
                            </div>
                            <div className="news-badges">
                                <span 
                                    className="sentiment-dot"
                                    style={{ backgroundColor: getSentimentColor(news.sentiment) }}
                                    title={news.sentiment}
                                />
                                <span 
                                    className="impact-badge"
                                    style={{ backgroundColor: getImpactColor(news.impact) }}
                                >
                                    {news.impact}
                                </span>
                                <span className="category-badge">{news.category}</span>
                            </div>
                            {expandedNews === idx && (
                                <div className="news-expanded">
                                    <p>{lang === 'ar' ? news.descriptionAr : news.description}</p>
                                    {news.url && (
                                        <a href={news.url} target="_blank" rel="noopener noreferrer" className="read-more">
                                            {t.readMore} →
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .news-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .news-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(90deg, rgba(184, 134, 11, 0.08), transparent);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .news-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .news-icon { font-size: 1.5rem; }

                .news-title h2 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--gold-medium);
                    margin: 0;
                }

                .subtitle {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0.25rem 0 0;
                }

                .refresh-btn {
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    padding: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .refresh-btn:hover { background: rgba(184, 134, 11, 0.1); }
                .refresh-btn:disabled { opacity: 0.5; }

                /* AI Summary */
                .ai-summary {
                    margin: 1rem 1.5rem;
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.05);
                    border-radius: 12px;
                    border: 1px solid rgba(184, 134, 11, 0.15);
                }

                .ai-summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                }

                .sentiment-badge {
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: white;
                    text-transform: uppercase;
                }

                .ai-summary-text {
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    line-height: 1.6;
                    margin: 0;
                }

                .key-themes {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    align-items: center;
                }

                .themes-label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .theme-tag {
                    padding: 0.2rem 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                /* Category Filter */
                .category-filter {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0 1.5rem;
                    overflow-x: auto;
                    scrollbar-width: none;
                }

                .category-filter::-webkit-scrollbar { display: none; }

                .filter-btn {
                    padding: 0.4rem 0.8rem;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .filter-btn:hover {
                    border-color: var(--gold-primary);
                    color: var(--gold-medium);
                }

                .filter-btn.active {
                    background: rgba(184, 134, 11, 0.15);
                    border-color: var(--gold-primary);
                    color: var(--gold-bright);
                }

                /* News List */
                .news-list {
                    padding: 1rem 1.5rem;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .news-item {
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 12px;
                    margin-bottom: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                    position: relative;
                }

                .news-item:hover {
                    background: rgba(0, 0, 0, 0.25);
                    border-color: rgba(184, 134, 11, 0.2);
                }

                .news-item.breaking {
                    border-color: #f44336;
                    background: rgba(244, 67, 54, 0.05);
                }

                .breaking-badge {
                    position: absolute;
                    top: -8px;
                    right: 10px;
                    padding: 0.2rem 0.5rem;
                    background: #f44336;
                    color: white;
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 4px;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .news-item-header h3 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem;
                    line-height: 1.4;
                }

                .news-meta {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .news-source { color: var(--gold-medium); }

                .news-badges {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    align-items: center;
                }

                .sentiment-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .impact-badge {
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: white;
                    text-transform: uppercase;
                }

                .category-badge {
                    padding: 0.15rem 0.4rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                }

                .news-expanded {
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .news-expanded p {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0;
                }

                .read-more {
                    display: inline-block;
                    margin-top: 0.5rem;
                    color: var(--gold-medium);
                    font-size: 0.75rem;
                    text-decoration: none;
                }

                .read-more:hover { text-decoration: underline; }

                .no-news {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 2rem;
                }

                /* Loading & Error */
                .loading-state, .error-state {
                    padding: 3rem;
                    text-align: center;
                }

                .error-state p { color: #f44336; margin-bottom: 1rem; }

                .error-state button {
                    padding: 0.5rem 1rem;
                    background: var(--gold-primary);
                    border: none;
                    border-radius: 8px;
                    color: #1a1a1a;
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .news-list { max-height: 400px; }
                }
            `}</style>
        </div>
    );
}
