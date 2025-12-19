'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import EconomicCalendar from '../components/EconomicCalendar';
import AINewsAnalysis from '../components/AINewsAnalysis';
import COTReport from '../components/COTReport';
import BankAnalysis from '../components/BankAnalysis';

export default function AnalysisPage() {
    const { t, lang, mounted } = useLanguage();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/analysis?lang=${lang}`);
            const data = await res.json();
            setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (mounted) {
            fetchDashboardData();
        }
    }, [lang, mounted]);

    if (!mounted) return null;

    return (
        <main className="analysis-hub min-h-screen pt-32 pb-20 overflow-x-hidden">
            <div className="container mx-auto px-6">
                {/* Hero Section */}
                <header className="analysis-header text-center mb-12 animate-fade-in">
                    <span className="analysis-badge">{lang === 'ar' ? 'بوابة الاستخبارات المالية' : 'Financial Intelligence Portal'}</span>
                    <h1 className="analysis-title-main">
                        {lang === 'ar' ? 'لوحة القيادة المؤسسية' : 'Institutional Command Center'}
                    </h1>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={fetchDashboardData}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-gold-500/10 text-gold-500 px-6 py-2 rounded-full hover:bg-gold-500/20 transition-all border border-gold-500/30"
                        >
                            <span className={isLoading ? "animate-spin" : ""}>🔄</span>
                            {isLoading
                                ? (lang === 'ar' ? 'جاري تحليل الأسواق...' : 'Scanning Markets...')
                                : (lang === 'ar' ? 'تحديث البيانات الحية' : 'Update Live Intelligence')}
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="institutional-grid">
                    {/* Top Row: Fundamentals & Sentiment */}
                    <div className="grid-item calendar-cell">
                        <EconomicCalendar />
                    </div>
                    <div className="grid-item cot-cell">
                        <COTReport data={dashboardData?.cot_data} />
                    </div>

                    {/* Middle Row: AI Strategy (Full Width) */}
                    <div className="grid-item ai-strategy-cell">
                        <AINewsAnalysis
                            data={dashboardData}
                            isLoading={isLoading}
                            onRefresh={fetchDashboardData}
                        />
                    </div>

                    {/* Bottom Row: Bank Forecasts (Full Width now since Correlation is gone) */}
                    <div className="grid-item bank-cell" style={{ gridColumn: 'span 2' }}>
                        <BankAnalysis data={dashboardData?.bank_forecasts} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .analysis-hub {
                    background: radial-gradient(circle at top right, rgba(184, 134, 11, 0.05), transparent 40%),
                                radial-gradient(circle at bottom left, rgba(184, 134, 11, 0.05), transparent 40%);
                }
                .analysis-badge {
                    background: rgba(184, 134, 11, 0.1);
                    color: var(--gold-primary);
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    display: inline-block;
                    margin-bottom: 1rem;
                }
                .analysis-title-main {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 900;
                    background: linear-gradient(135deg, #fff 0%, #b8860b 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.5rem;
                    letter-spacing: -1px;
                }
                .analysis-subtitle-main {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .institutional-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2rem;
                    margin-top: 3rem;
                }

                .ai-strategy-cell {
                    grid-column: span 2;
                }

                .grid-item {
                    height: 100%;
                }

                @media (max-width: 1200px) {
                    .institutional-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .ai-strategy-cell, .bank-cell {
                        grid-column: span 1 !important;
                    }
                }
            `}</style>
        </main>
    );
}
