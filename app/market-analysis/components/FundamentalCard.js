'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function FundamentalCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('supply');

    const t = {
        en: {
            title: 'Fundamental Analysis',
            subtitle: 'Supply, demand & market structure',
            supply: 'Supply/Demand',
            etf: 'ETF Holdings',
            centralBanks: 'Central Banks',
            seasonality: 'Seasonality',
            annualSupply: 'Annual Supply',
            annualDemand: 'Annual Demand',
            deficit: 'Deficit',
            tonnes: 't',
            mineProduction: 'Mine Production',
            recycling: 'Recycling',
            jewelry: 'Jewelry',
            investment: 'Investment',
            technology: 'Technology'
        },
        ar: {
            title: 'التحليل الأساسي',
            subtitle: 'العرض والطلب وهيكل السوق',
            supply: 'العرض/الطلب',
            etf: 'حيازات ETF',
            centralBanks: 'البنوك المركزية',
            seasonality: 'الموسمية',
            annualSupply: 'العرض السنوي',
            annualDemand: 'الطلب السنوي',
            deficit: 'العجز',
            tonnes: 'طن',
            mineProduction: 'إنتاج المناجم',
            recycling: 'إعادة التدوير',
            jewelry: 'المجوهرات',
            investment: 'الاستثمار',
            technology: 'التكنولوجيا'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/fundamentals')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="fund-card"><LoadingSkeleton height="400px" /></div>;

    const sd = data?.supplyDemand || {};
    const etf = data?.etfHoldings || {};
    const cb = data?.centralBanks || {};
    const analysis = data?.aiAnalysis || {};

    const tabs = [
        { id: 'supply', label: t.supply },
        { id: 'etf', label: t.etf },
        { id: 'centralBanks', label: t.centralBanks }
    ];

    return (
        <div className="fund-card">
            <div className="card-header">
                <span className="icon">⚖️</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Supply/Demand Tab */}
            {activeTab === 'supply' && (
                <div className="tab-content">
                    <div className="sd-overview">
                        <div className="sd-item supply">
                            <span className="label">{t.annualSupply}</span>
                            <span className="value">{sd.annualSupply?.toLocaleString()} {t.tonnes}</span>
                        </div>
                        <div className="sd-item demand">
                            <span className="label">{t.annualDemand}</span>
                            <span className="value">{sd.annualDemand?.toLocaleString()} {t.tonnes}</span>
                        </div>
                        <div className="sd-item deficit">
                            <span className="label">{t.deficit}</span>
                            <span className="value">{sd.deficit?.toLocaleString()} {t.tonnes}</span>
                        </div>
                    </div>
                    <div className="breakdown">
                        <div className="breakdown-col">
                            <h4>{t.annualSupply}</h4>
                            <div className="bar-item">
                                <span>{t.mineProduction}</span>
                                <div className="bar"><div style={{width: `${(sd.mineProduction/sd.annualSupply)*100}%`}}/></div>
                                <span>{sd.mineProduction}t</span>
                            </div>
                            <div className="bar-item">
                                <span>{t.recycling}</span>
                                <div className="bar"><div style={{width: `${(sd.recycling/sd.annualSupply)*100}%`}}/></div>
                                <span>{sd.recycling}t</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ETF Tab */}
            {activeTab === 'etf' && (
                <div className="tab-content">
                    <div className="etf-overview">
                        <div className="etf-total">
                            <span className="label">Total Holdings</span>
                            <span className="value">{etf.totalTonnes?.toLocaleString()} {t.tonnes}</span>
                        </div>
                        <div className="etf-changes">
                            <div className={`change ${etf.change1W >= 0 ? 'up' : 'down'}`}>
                                <span>1W</span><span>{etf.change1W > 0 ? '+' : ''}{etf.change1W}t</span>
                            </div>
                            <div className={`change ${etf.change1M >= 0 ? 'up' : 'down'}`}>
                                <span>1M</span><span>{etf.change1M > 0 ? '+' : ''}{etf.change1M}t</span>
                            </div>
                            <div className={`change ${etf.changeYTD >= 0 ? 'up' : 'down'}`}>
                                <span>YTD</span><span>{etf.changeYTD > 0 ? '+' : ''}{etf.changeYTD}t</span>
                            </div>
                        </div>
                    </div>
                    <div className="etf-list">
                        {etf.majorETFs?.map((e, i) => (
                            <div key={i} className="etf-item">
                                <span className="name">{e.name}</span>
                                <span className="holdings">{e.holdings}t</span>
                                <span className={`change ${e.change >= 0 ? 'up' : 'down'}`}>
                                    {e.change > 0 ? '+' : ''}{e.change}t
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Central Banks Tab */}
            {activeTab === 'centralBanks' && (
                <div className="tab-content">
                    <div className="cb-overview">
                        <div className="cb-stat">
                            <span className="label">Total Reserves</span>
                            <span className="value">{cb.totalReserves?.toLocaleString()} {t.tonnes}</span>
                        </div>
                        <div className="cb-stat highlight">
                            <span className="label">YTD Net Purchases</span>
                            <span className="value">+{cb.ytdNetPurchases?.toLocaleString()} {t.tonnes}</span>
                        </div>
                    </div>
                    <h4>Top Buyers (YTD)</h4>
                    <div className="cb-list">
                        {cb.topBuyers?.slice(0, 4).map((c, i) => (
                            <div key={i} className="cb-item">
                                <span className="country">{lang === 'ar' ? c.countryAr : c.country}</span>
                                <span className="purchases">+{c.purchases}t</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Analysis */}
            {analysis.summary && (
                <div className="ai-analysis">
                    <p>{lang === 'ar' ? analysis.summaryAr : analysis.summary}</p>
                </div>
            )}

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
                .tabs { display: flex; gap: 0.25rem; margin-bottom: 1rem; }
                .tab {
                    flex: 1; padding: 0.5rem; background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.2); border-radius: 6px;
                    color: var(--text-secondary); font-size: 0.75rem; cursor: pointer;
                }
                .tab:hover, .tab.active {
                    background: rgba(184, 134, 11, 0.15);
                    border-color: var(--gold-primary); color: var(--gold-bright);
                }
                .sd-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
                .sd-item { padding: 0.5rem; background: rgba(0,0,0,0.15); border-radius: 8px; text-align: center; }
                .sd-item .label { display: block; font-size: 0.65rem; color: var(--text-secondary); }
                .sd-item .value { display: block; font-size: 1rem; font-weight: 700; }
                .sd-item.supply .value { color: #4caf50; }
                .sd-item.demand .value { color: #ff9800; }
                .sd-item.deficit .value { color: #f44336; }
                .breakdown h4 { font-size: 0.75rem; color: var(--gold-medium); margin: 0 0 0.5rem; }
                .bar-item { display: grid; grid-template-columns: 100px 1fr 50px; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem; font-size: 0.7rem; }
                .bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
                .bar div { height: 100%; background: var(--gold-primary); border-radius: 3px; }
                .etf-overview { margin-bottom: 1rem; }
                .etf-total { text-align: center; padding: 0.75rem; background: rgba(184,134,11,0.1); border-radius: 8px; margin-bottom: 0.5rem; }
                .etf-total .label { display: block; font-size: 0.7rem; color: var(--text-secondary); }
                .etf-total .value { font-size: 1.25rem; font-weight: 700; color: var(--gold-bright); }
                .etf-changes { display: flex; justify-content: center; gap: 1rem; }
                .etf-changes .change { font-size: 0.75rem; }
                .etf-changes .change.up { color: #4caf50; }
                .etf-changes .change.down { color: #f44336; }
                .etf-list { display: flex; flex-direction: column; gap: 0.25rem; }
                .etf-item { display: grid; grid-template-columns: 1fr 60px 50px; gap: 0.5rem; padding: 0.4rem; background: rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; }
                .etf-item .change.up { color: #4caf50; }
                .etf-item .change.down { color: #f44336; }
                .cb-overview { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
                .cb-stat { padding: 0.5rem; background: rgba(0,0,0,0.15); border-radius: 8px; text-align: center; }
                .cb-stat.highlight { border: 1px solid rgba(76,175,80,0.3); }
                .cb-stat .label { display: block; font-size: 0.65rem; color: var(--text-secondary); }
                .cb-stat .value { font-size: 1rem; font-weight: 700; }
                .cb-stat.highlight .value { color: #4caf50; }
                h4 { font-size: 0.75rem; color: var(--gold-medium); margin: 0 0 0.5rem; }
                .cb-list { display: flex; flex-direction: column; gap: 0.25rem; }
                .cb-item { display: flex; justify-content: space-between; padding: 0.4rem; background: rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; }
                .cb-item .purchases { color: #4caf50; font-weight: 600; }
                .ai-analysis { margin-top: 1rem; padding: 0.75rem; background: rgba(184,134,11,0.1); border-radius: 8px; border-left: 3px solid var(--gold-primary); }
                .ai-analysis p { font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
            `}</style>
        </div>
    );
}
