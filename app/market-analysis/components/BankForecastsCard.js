'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, TrendBadge } from './common';

/**
 * BankForecastsCard - Global bank gold price forecasts
 */
export default function BankForecastsCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('target');

    const translations = {
        en: {
            title: 'Bank Forecasts',
            subtitle: 'Global investment bank gold price targets',
            bank: 'Bank',
            target: 'Target',
            change: 'Change',
            rating: 'Rating',
            analyst: 'Analyst',
            notes: 'Notes',
            average: 'Average Target',
            highest: 'Highest',
            lowest: 'Lowest',
            current: 'Current Price',
            upside: 'Avg. Upside',
            consensus: 'Consensus',
            bullish: 'Bullish',
            bearish: 'Bearish',
            neutral: 'Neutral',
            mixed: 'Mixed',
            sortByTarget: 'Sort by Target',
            sortByChange: 'Sort by Change',
            loading: 'Loading forecasts...',
            error: 'Failed to load forecasts',
            refresh: 'Refresh',
            banks: 'banks'
        },
        ar: {
            title: 'توقعات البنوك',
            subtitle: 'أهداف أسعار الذهب من البنوك الاستثمارية العالمية',
            bank: 'البنك',
            target: 'الهدف',
            change: 'التغيير',
            rating: 'التقييم',
            analyst: 'المحلل',
            notes: 'ملاحظات',
            average: 'متوسط الهدف',
            highest: 'الأعلى',
            lowest: 'الأدنى',
            current: 'السعر الحالي',
            upside: 'متوسط الصعود',
            consensus: 'الإجماع',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            neutral: 'محايد',
            mixed: 'متباين',
            sortByTarget: 'ترتيب حسب الهدف',
            sortByChange: 'ترتيب حسب التغيير',
            loading: 'جاري تحميل التوقعات...',
            error: 'فشل في تحميل التوقعات',
            refresh: 'تحديث',
            banks: 'بنك'
        }
    };

    const t = translations[lang] || translations.en;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/market/bank-forecasts');
            if (!res.ok) throw new Error('Failed to fetch');
            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getRatingColor = (rating) => {
        const colors = {
            bullish: '#4caf50',
            bearish: '#f44336',
            neutral: '#ff9800'
        };
        return colors[rating] || '#ff9800';
    };

    const getRatingText = (rating) => {
        const texts = { bullish: t.bullish, bearish: t.bearish, neutral: t.neutral };
        return texts[rating] || rating;
    };

    const getConsensusText = (consensus) => {
        const texts = { bullish: t.bullish, bearish: t.bearish, neutral: t.neutral, mixed: t.mixed };
        return texts[consensus] || consensus;
    };

    const sortedBanks = data?.banks?.slice().sort((a, b) => {
        if (sortBy === 'target') return b.target - a.target;
        if (sortBy === 'change') return (b.target - b.previousTarget) - (a.target - a.previousTarget);
        return 0;
    }) || [];

    if (loading && !data) {
        return <div className="bank-card loading-state"><LoadingSkeleton height="400px" /></div>;
    }

    if (error && !data) {
        return (
            <div className="bank-card error-state">
                <p>{t.error}</p>
                <button onClick={fetchData}>{t.refresh}</button>
            </div>
        );
    }

    const stats = data?.statistics;

    return (
        <div className="bank-card">
            <div className="bank-header">
                <div className="bank-title">
                    <span className="bank-icon">🏦</span>
                    <div>
                        <h2>{t.title}</h2>
                        <p className="subtitle">{t.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="stats-grid">
                <div className="stat-item highlight">
                    <span className="stat-label">{t.average}</span>
                    <span className="stat-value gold">${stats?.averageTarget}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">{t.highest}</span>
                    <span className="stat-value green">${stats?.highestTarget}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">{t.lowest}</span>
                    <span className="stat-value red">${stats?.lowestTarget}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">{t.upside}</span>
                    <span className={`stat-value ${parseFloat(stats?.upsideFromAvg) >= 0 ? 'green' : 'red'}`}>
                        {stats?.upsideFromAvg > 0 ? '+' : ''}{stats?.upsideFromAvg}%
                    </span>
                </div>
            </div>

            {/* Consensus Bar */}
            <div className="consensus-section">
                <div className="consensus-header">
                    <span>{t.consensus}: <strong style={{ color: getRatingColor(stats?.consensus) }}>{getConsensusText(stats?.consensus)}</strong></span>
                    <span className="bank-count">{stats?.totalBanks} {t.banks}</span>
                </div>
                <div className="consensus-bar">
                    <div className="bar-segment bullish" style={{ width: `${(stats?.bullishCount / stats?.totalBanks) * 100}%` }}>
                        {stats?.bullishCount}
                    </div>
                    <div className="bar-segment neutral" style={{ width: `${(stats?.neutralCount / stats?.totalBanks) * 100}%` }}>
                        {stats?.neutralCount}
                    </div>
                    <div className="bar-segment bearish" style={{ width: `${(stats?.bearishCount / stats?.totalBanks) * 100}%` }}>
                        {stats?.bearishCount}
                    </div>
                </div>
                <div className="consensus-legend">
                    <span><span className="dot bullish"></span> {t.bullish}</span>
                    <span><span className="dot neutral"></span> {t.neutral}</span>
                    <span><span className="dot bearish"></span> {t.bearish}</span>
                </div>
            </div>

            {/* Sort Options */}
            <div className="sort-options">
                <button className={sortBy === 'target' ? 'active' : ''} onClick={() => setSortBy('target')}>
                    {t.sortByTarget}
                </button>
                <button className={sortBy === 'change' ? 'active' : ''} onClick={() => setSortBy('change')}>
                    {t.sortByChange}
                </button>
            </div>

            {/* Banks Table */}
            <div className="banks-list">
                {sortedBanks.map((bank) => {
                    const change = bank.target - bank.previousTarget;
                    const changePercent = ((change / bank.previousTarget) * 100).toFixed(1);
                    
                    return (
                        <div key={bank.id} className="bank-row">
                            <div className="bank-info">
                                <span className="bank-logo">{bank.logo}</span>
                                <div className="bank-details">
                                    <span className="bank-name">{lang === 'ar' ? bank.nameAr : bank.name}</span>
                                    <span className="bank-country">{bank.country}</span>
                                </div>
                            </div>
                            <div className="bank-target">
                                <span className="target-price">${bank.target}</span>
                                <span className={`target-change ${change >= 0 ? 'up' : 'down'}`}>
                                    {change >= 0 ? '↑' : '↓'} ${Math.abs(change)} ({changePercent}%)
                                </span>
                            </div>
                            <div className="bank-rating">
                                <span className="rating-badge" style={{ backgroundColor: getRatingColor(bank.rating) }}>
                                    {getRatingText(bank.rating)}
                                </span>
                            </div>
                            <div className="bank-notes">
                                <span className="notes-text">{lang === 'ar' ? bank.notesAr : bank.notes}</span>
                                <span className="analyst-name">{bank.analyst}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .bank-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .bank-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(90deg, rgba(184, 134, 11, 0.08), transparent);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .bank-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .bank-icon { font-size: 1.5rem; }

                .bank-title h2 {
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

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    background: rgba(0, 0, 0, 0.1);
                }

                .stat-item {
                    text-align: center;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                }

                .stat-item.highlight {
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                }

                .stat-label {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }

                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .stat-value.gold { color: var(--gold-medium); }
                .stat-value.green { color: #4caf50; }
                .stat-value.red { color: #f44336; }

                /* Consensus */
                .consensus-section {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .consensus-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .bank-count { color: var(--text-secondary); }

                .consensus-bar {
                    display: flex;
                    height: 24px;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .bar-segment {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    min-width: 24px;
                }

                .bar-segment.bullish { background: #4caf50; }
                .bar-segment.neutral { background: #ff9800; }
                .bar-segment.bearish { background: #f44336; }

                .consensus-legend {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 4px;
                }

                .dot.bullish { background: #4caf50; }
                .dot.neutral { background: #ff9800; }
                .dot.bearish { background: #f44336; }

                /* Sort Options */
                .sort-options {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                }

                .sort-options button {
                    padding: 0.4rem 0.8rem;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sort-options button:hover {
                    border-color: var(--gold-primary);
                }

                .sort-options button.active {
                    background: rgba(184, 134, 11, 0.15);
                    border-color: var(--gold-primary);
                    color: var(--gold-bright);
                }

                /* Banks List */
                .banks-list {
                    padding: 0 1.5rem 1.5rem;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .bank-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 0.8fr 1.5fr;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    align-items: center;
                }

                .bank-row:hover {
                    background: rgba(0, 0, 0, 0.2);
                }

                .bank-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .bank-logo { font-size: 1.25rem; }

                .bank-details {
                    display: flex;
                    flex-direction: column;
                }

                .bank-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .bank-country {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                .bank-target {
                    text-align: center;
                }

                .target-price {
                    display: block;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--gold-medium);
                }

                .target-change {
                    font-size: 0.7rem;
                }

                .target-change.up { color: #4caf50; }
                .target-change.down { color: #f44336; }

                .bank-rating {
                    text-align: center;
                }

                .rating-badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: white;
                }

                .bank-notes {
                    display: flex;
                    flex-direction: column;
                }

                .notes-text {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    line-height: 1.3;
                }

                .analyst-name {
                    font-size: 0.65rem;
                    color: var(--gold-medium);
                    margin-top: 0.25rem;
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
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .bank-row {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }
                    .bank-target, .bank-rating { text-align: left; }
                }
            `}</style>
        </div>
    );
}
