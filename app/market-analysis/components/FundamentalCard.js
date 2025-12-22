'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function FundamentalCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Fundamental Analysis',
            subtitle: 'Supply, demand & market structure',
            manualCheck: 'Manual Research Required',
            manualCheckDesc: 'Fundamental data requires verification from official sources like World Gold Council for accurate analysis.',
            checkLinks: 'Official Data Sources:',
            supplyDemand: 'Supply & Demand Statistics',
            etfHoldings: 'Global ETF Holdings',
            centralBanks: 'Central Bank Reserves',
            seasonality: 'Seasonal Patterns',
            miningCosts: 'Mining Production Costs',
            worldGoldCouncil: 'World Gold Council Hub'
        },
        ar: {
            title: 'التحليل الأساسي',
            subtitle: 'العرض والطلب وهيكل السوق',
            manualCheck: 'يتطلب البحث اليدوي',
            manualCheckDesc: 'البيانات الأساسية تتطلب التحقق من المصادر الرسمية مثل مجلس الذهب العالمي للتحليل الدقيق.',
            checkLinks: 'مصادر البيانات الرسمية:',
            supplyDemand: 'إحصائيات العرض والطلب',
            etfHoldings: 'حيازات ETF العالمية',
            centralBanks: 'احتياطيات البنوك المركزية',
            seasonality: 'الأنماط الموسمية',
            miningCosts: 'تكاليف إنتاج التعدين',
            worldGoldCouncil: 'مركز مجلس الذهب العالمي'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/fundamentals')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="fund-card"><LoadingSkeleton height="350px" /></div>;

    const urls = data?.manualCheckUrls || {};

    return (
        <div className="fund-card">
            <div className="card-header">
                <span className="icon">⚖️</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Manual Check Notice */}
            <div className="manual-check-notice">
                <div className="notice-icon">📊</div>
                <h3>{t.manualCheck}</h3>
                <p>{t.manualCheckDesc}</p>
                
                {/* Seasonality Note */}
                {data?.seasonality?.note && (
                    <div className="seasonality-note">
                        <span className="note-icon">📅</span>
                        <p>{lang === 'ar' ? data.seasonality.noteAr : data.seasonality.note}</p>
                    </div>
                )}
                
                <div className="check-links">
                    <span className="links-label">{t.checkLinks}</span>
                    <div className="links-grid">
                        {urls.worldGoldCouncil && (
                            <a href={urls.worldGoldCouncil} target="_blank" rel="noopener noreferrer" className="check-link primary">
                                🏆 {t.worldGoldCouncil}
                            </a>
                        )}
                        {urls.supplyDemand && (
                            <a href={urls.supplyDemand} target="_blank" rel="noopener noreferrer" className="check-link">
                                📈 {t.supplyDemand}
                            </a>
                        )}
                        {urls.etfHoldings && (
                            <a href={urls.etfHoldings} target="_blank" rel="noopener noreferrer" className="check-link">
                                💰 {t.etfHoldings}
                            </a>
                        )}
                        {urls.centralBankReserves && (
                            <a href={urls.centralBankReserves} target="_blank" rel="noopener noreferrer" className="check-link">
                                🏦 {t.centralBanks}
                            </a>
                        )}
                        {urls.seasonality && (
                            <a href={urls.seasonality} target="_blank" rel="noopener noreferrer" className="check-link">
                                📅 {t.seasonality}
                            </a>
                        )}
                        {urls.miningCosts && (
                            <a href={urls.miningCosts} target="_blank" rel="noopener noreferrer" className="check-link">
                                ⛏️ {t.miningCosts}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .fund-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                }
                .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
                .icon { font-size: 1.5rem; }
                .card-header h2 { font-size: 1rem; color: var(--gold-medium); margin: 0; }
                .card-header p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
                
                .manual-check-notice {
                    padding: 1.5rem;
                    background: rgba(255, 152, 0, 0.1);
                    border: 1px solid rgba(255, 152, 0, 0.3);
                    border-radius: 12px;
                    text-align: center;
                }
                .notice-icon { font-size: 2rem; margin-bottom: 0.5rem; }
                .manual-check-notice h3 {
                    font-size: 1rem;
                    color: #ff9800;
                    margin: 0 0 0.5rem;
                }
                .manual-check-notice p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin: 0 0 1rem;
                    line-height: 1.5;
                }
                
                .seasonality-note {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: rgba(184, 134, 11, 0.1);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    text-align: ${lang === 'ar' ? 'right' : 'left'};
                }
                .seasonality-note .note-icon { font-size: 1.25rem; }
                .seasonality-note p {
                    font-size: 0.8rem;
                    color: var(--gold-bright);
                    margin: 0;
                }
                
                .check-links { margin-top: 1rem; }
                .links-label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.75rem;
                }
                .links-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 0.5rem;
                }
                .check-link {
                    display: block;
                    padding: 0.6rem 0.75rem;
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    color: var(--gold-bright);
                    text-decoration: none;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }
                .check-link:hover {
                    background: rgba(184, 134, 11, 0.2);
                    border-color: var(--gold-primary);
                }
                .check-link.primary {
                    grid-column: 1 / -1;
                    background: rgba(184, 134, 11, 0.15);
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
