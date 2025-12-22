'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton, ChangeIndicator, TrendBadge, RefreshButton } from './common';

/**
 * HeroSection - Main hero with gold price display
 * @param {object} goldPrice - Gold price data
 * @param {boolean} loading - Loading state
 * @param {function} onRefresh - Refresh callback
 * @param {string} lang - Current language
 */
export default function HeroSection({ goldPrice, loading, onRefresh, lang = 'en' }) {
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        if (goldPrice?.timestamp) {
            setLastUpdate(new Date(goldPrice.timestamp));
        }
    }, [goldPrice]);

    const translations = {
        en: {
            title: 'Smart Market Analysis',
            subtitle: 'Comprehensive AI-powered dashboard for Gold (XAUUSD) analysis',
            goldPrice: 'Gold Price',
            dailyChange: 'Daily Change',
            marketStatus: 'Market Status',
            high: '24h High',
            low: '24h Low',
            open: 'Open',
            lastUpdate: 'Last Update',
            marketOpen: 'Market Open',
            marketClosed: 'Market Closed',
            source: 'Source'
        },
        ar: {
            title: 'مركز تحليل السوق الذكي',
            subtitle: 'لوحة قيادة شاملة مدعومة بالذكاء الاصطناعي لتحليل الذهب',
            goldPrice: 'سعر الذهب',
            dailyChange: 'التغيير اليومي',
            marketStatus: 'حالة السوق',
            high: 'أعلى سعر 24س',
            low: 'أدنى سعر 24س',
            open: 'سعر الافتتاح',
            lastUpdate: 'آخر تحديث',
            marketOpen: 'السوق مفتوح',
            marketClosed: 'السوق مغلق',
            source: 'المصدر'
        }
    };

    const t = translations[lang] || translations.en;

    const formatPrice = (price) => {
        if (!price) return '---';
        return price.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const formatTime = (date) => {
        if (!date) return '---';
        return date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <section className="hero-section">
            {/* Title */}
            <div className="hero-content">
                <h1 className="hero-title text-gradient">{t.title}</h1>
                <p className="hero-subtitle">{t.subtitle}</p>
            </div>

            {/* Gold Price Card */}
            <div className="gold-price-container">
                <div className="gold-price-card">
                    {/* Header */}
                    <div className="card-header">
                        <div className="card-title">
                            <span className="gold-icon">🥇</span>
                            <span>{t.goldPrice} (XAU/USD)</span>
                        </div>
                        <RefreshButton 
                            onClick={onRefresh} 
                            loading={loading}
                            size="sm"
                        />
                    </div>

                    {/* Main Price */}
                    {loading && !goldPrice ? (
                        <div className="price-loading">
                            <LoadingSkeleton type="price" />
                        </div>
                    ) : goldPrice ? (
                        <>
                            <div className="main-price">
                                <span className="price-value">
                                    ${formatPrice(goldPrice.price)}
                                </span>
                                <div className="price-change">
                                    <ChangeIndicator 
                                        value={goldPrice.change}
                                        percentage={goldPrice.changePercent}
                                        size="lg"
                                        prefix="$"
                                    />
                                </div>
                            </div>

                            {/* Trend Badge */}
                            <div className="trend-container">
                                <span className="trend-label">{t.marketStatus}:</span>
                                <TrendBadge trend={goldPrice.trend} lang={lang} />
                            </div>

                            {/* Price Details Grid */}
                            <div className="price-details">
                                <div className="detail-item">
                                    <span className="detail-label">{t.high}</span>
                                    <span className="detail-value high">${formatPrice(goldPrice.high24h)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t.low}</span>
                                    <span className="detail-value low">${formatPrice(goldPrice.low24h)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t.open}</span>
                                    <span className="detail-value">${formatPrice(goldPrice.open)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t.source}</span>
                                    <span className="detail-value source">{goldPrice.source}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="card-footer">
                                <span className={`market-status ${goldPrice.marketStatus}`}>
                                    <span className="status-dot"></span>
                                    {goldPrice.marketStatus === 'open' ? t.marketOpen : t.marketClosed}
                                </span>
                                <span className="last-update">
                                    {t.lastUpdate}: {formatTime(lastUpdate)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="price-error">
                            Unable to load price data
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .hero-section {
                    padding: 7rem 2rem 3rem;
                    text-align: center;
                    background: linear-gradient(180deg, rgba(184, 134, 11, 0.05) 0%, transparent 100%);
                    position: relative;
                }

                .hero-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        linear-gradient(rgba(184, 134, 11, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(184, 134, 11, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                }

                .hero-content {
                    max-width: 800px;
                    margin: 0 auto 2rem;
                    position: relative;
                    z-index: 1;
                }

                .hero-title {
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    font-weight: 800;
                    margin-bottom: 1rem;
                }

                .hero-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    line-height: 1.7;
                }

                /* Gold Price Card */
                .gold-price-container {
                    display: flex;
                    justify-content: center;
                    position: relative;
                    z-index: 1;
                }

                .gold-price-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.25);
                    border-radius: 24px;
                    padding: 1.5rem 2rem;
                    min-width: 360px;
                    max-width: 420px;
                    position: relative;
                    overflow: hidden;
                }

                .gold-price-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--gradient-gold-metallic);
                    background-size: 200% 100%;
                    animation: goldShine 3s linear infinite;
                }

                @keyframes goldShine {
                    0% { background-position: 200% center; }
                    100% { background-position: 0% center; }
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                }

                .card-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: var(--gold-medium);
                }

                .gold-icon {
                    font-size: 1.5rem;
                }

                /* Main Price */
                .main-price {
                    text-align: center;
                    margin-bottom: 1rem;
                }

                .price-value {
                    display: block;
                    font-size: 3rem;
                    font-weight: 800;
                    background: var(--gradient-gold-text);
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: goldShine 3s linear infinite;
                    line-height: 1.2;
                    margin-bottom: 0.5rem;
                }

                .price-change {
                    display: flex;
                    justify-content: center;
                }

                /* Trend */
                .trend-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }

                .trend-label {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                /* Price Details */
                .price-details {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .detail-label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .detail-value.high {
                    color: #4caf50;
                }

                .detail-value.low {
                    color: #f44336;
                }

                .detail-value.source {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                }

                /* Footer */
                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                    font-size: 0.75rem;
                }

                .market-status {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: var(--text-secondary);
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ff9800;
                }

                .market-status.open .status-dot {
                    background: #4caf50;
                    box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
                    animation: pulse 2s infinite;
                }

                .market-status.closed .status-dot {
                    background: #f44336;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .last-update {
                    color: var(--text-secondary);
                }

                /* Loading & Error States */
                .price-loading {
                    padding: 2rem 0;
                }

                .price-error {
                    padding: 2rem;
                    text-align: center;
                    color: #f44336;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-section {
                        padding: 6rem 1rem 2rem;
                    }

                    .gold-price-card {
                        min-width: auto;
                        width: 100%;
                        max-width: 360px;
                        padding: 1.25rem 1.5rem;
                    }

                    .price-value {
                        font-size: 2.5rem;
                    }

                    .price-details {
                        padding: 0.75rem;
                    }

                    .card-footer {
                        flex-direction: column;
                        gap: 0.5rem;
                        text-align: center;
                    }
                }
            `}</style>
        </section>
    );
}
