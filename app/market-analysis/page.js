'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { HeroSection, AISummaryCard, COTReportCard, NewsAnalysisCard, BankForecastsCard, TreasuryYieldsCard, DXYAnalysisCard, CurrencyAnalysisCard, IndicesCard, EconomicCalendarCard, FedWatchCard, ExpertOpinionsCard, CorrelationMatrix, FundamentalCard, SupportResistanceCard, AlertsPanel } from './components';

// Navigation sections
const sections = [
    { id: 'overview', labelEn: 'Overview', labelAr: 'نظرة عامة', icon: '📊' },
    { id: 'cot', labelEn: 'COT Report', labelAr: 'تقرير COT', icon: '📈' },
    { id: 'news', labelEn: 'News', labelAr: 'الأخبار', icon: '📰' },
    { id: 'banks', labelEn: 'Bank Forecasts', labelAr: 'توقعات البنوك', icon: '🏦' },
    { id: 'treasury', labelEn: 'Treasury', labelAr: 'السندات', icon: '💵' },
    { id: 'dxy', labelEn: 'DXY', labelAr: 'الدولار', icon: '💲' },
    { id: 'currencies', labelEn: 'Currencies', labelAr: 'العملات', icon: '💱' },
    { id: 'indices', labelEn: 'Indices', labelAr: 'المؤشرات', icon: '📉' },
    { id: 'calendar', labelEn: 'Calendar', labelAr: 'التقويم', icon: '📅' },
    { id: 'fed', labelEn: 'Fed Watch', labelAr: 'الفيدرالي', icon: '🏛️' },
    { id: 'correlation', labelEn: 'Correlations', labelAr: 'الارتباطات', icon: '🔗' },
    { id: 'fundamental', labelEn: 'Fundamentals', labelAr: 'التحليل الأساسي', icon: '⚖️' },
];

export default function MarketAnalysisPage() {
    const { t, lang, isRTL, mounted, toggleLang } = useLanguage();
    const [activeSection, setActiveSection] = useState('overview');
    const [goldPrice, setGoldPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [showAlerts, setShowAlerts] = useState(false);

    // Fetch gold price
    useEffect(() => {
        const fetchGoldPrice = async () => {
            try {
                const res = await fetch('/api/market/gold-price');
                if (res.ok) {
                    const data = await res.json();
                    setGoldPrice(data);
                    setLastUpdate(new Date());
                }
            } catch (error) {
                console.error('Error fetching gold price:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGoldPrice();
        // Refresh every 30 seconds
        const interval = setInterval(fetchGoldPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/market/gold-price');
            if (res.ok) {
                const data = await res.json();
                setGoldPrice(data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const translations = {
        en: {
            title: 'Smart Market Analysis',
            subtitle: 'Comprehensive AI-powered dashboard for Gold (XAUUSD) analysis',
            goldPrice: 'Gold Price',
            dailyChange: 'Daily Change',
            marketStatus: 'Market Status',
            bullish: 'Bullish',
            bearish: 'Bearish',
            neutral: 'Neutral',
            lastUpdate: 'Last Update',
            refresh: 'Refresh',
            loading: 'Loading...',
            aiSummary: 'AI Market Summary',
            comingSoon: 'Coming Soon',
            backToHome: '← Back to Home',
        },
        ar: {
            title: 'مركز تحليل السوق الذكي',
            subtitle: 'لوحة قيادة شاملة مدعومة بالذكاء الاصطناعي لتحليل الذهب',
            goldPrice: 'سعر الذهب',
            dailyChange: 'التغيير اليومي',
            marketStatus: 'حالة السوق',
            bullish: 'صعودي',
            bearish: 'هبوطي',
            neutral: 'محايد',
            lastUpdate: 'آخر تحديث',
            refresh: 'تحديث',
            loading: 'جاري التحميل...',
            aiSummary: 'ملخص السوق بالذكاء الاصطناعي',
            comingSoon: 'قريباً',
            backToHome: '→ العودة للرئيسية',
        }
    };

    const txt = translations[lang] || translations.en;

    const getMarketStatusColor = (status) => {
        switch (status) {
            case 'bullish': return '#4caf50';
            case 'bearish': return '#f44336';
            default: return '#ff9800';
        }
    };

    const getMarketStatusText = (status) => {
        switch (status) {
            case 'bullish': return txt.bullish;
            case 'bearish': return txt.bearish;
            default: return txt.neutral;
        }
    };

    return (
        <div className="market-analysis-page" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="ma-header">
                <div className="ma-header-content">
                    <Link href="/" className="ma-back-link">
                        {txt.backToHome}
                    </Link>
                    <div className="header-actions">
                        <button 
                            className="alerts-btn"
                            onClick={() => setShowAlerts(!showAlerts)}
                            aria-label="Toggle alerts"
                        >
                            🔔
                        </button>
                        <button onClick={toggleLang} className="lang-toggle">
                            <span className="btn-text-shine">{lang === 'ar' ? 'English' : 'العربية'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Alerts Panel */}
            <AlertsPanel 
                lang={lang} 
                goldPrice={goldPrice} 
                isVisible={showAlerts} 
                onClose={() => setShowAlerts(false)} 
            />

            {/* Hero Section with Gold Price */}
            <HeroSection 
                goldPrice={goldPrice}
                loading={loading}
                onRefresh={handleRefresh}
                lang={lang}
            />

            {/* Navigation Tabs */}
            <nav className="ma-nav">
                <div className="ma-nav-scroll">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`ma-nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span className="nav-icon">{section.icon}</span>
                            <span className="nav-label">{lang === 'ar' ? section.labelAr : section.labelEn}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="ma-main">
                <div className="ma-container">
                    {/* AI Summary Card */}
                    <AISummaryCard lang={lang} />

                    {/* COT Report Card */}
                    <COTReportCard lang={lang} />

                    {/* News Analysis Card */}
                    <NewsAnalysisCard lang={lang} />

                    {/* Bank Forecasts Card */}
                    <BankForecastsCard lang={lang} />

                    {/* Dashboard Grid - Treasury, DXY, Currencies */}
                    <div className="ma-grid three-col">
                        <TreasuryYieldsCard lang={lang} />
                        <DXYAnalysisCard lang={lang} />
                        <CurrencyAnalysisCard lang={lang} />
                    </div>

                    {/* Dashboard Grid - Indices and Calendar */}
                    <div className="ma-grid two-col">
                        <IndicesCard lang={lang} />
                        <EconomicCalendarCard lang={lang} />
                    </div>

                    {/* Fed Watch Card */}
                    <FedWatchCard lang={lang} />

                    {/* Expert Opinions Card */}
                    <ExpertOpinionsCard lang={lang} />

                    {/* Dashboard Grid - Correlation and Fundamentals */}
                    <div className="ma-grid two-col">
                        <CorrelationMatrix lang={lang} />
                        <FundamentalCard lang={lang} />
                    </div>

                    {/* Support & Resistance Card */}
                    <SupportResistanceCard lang={lang} currentPrice={goldPrice?.price || 2650} />
                </div>
            </main>

            <style jsx>{`
                .market-analysis-page {
                    min-height: 100vh;
                    background: var(--bg-dark);
                    color: var(--text-primary);
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Header */
                .ma-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    padding: 1rem 2rem;
                    background: rgba(8, 8, 8, 0.95);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                }

                .ma-header-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .alerts-btn {
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .alerts-btn:hover {
                    background: rgba(184, 134, 11, 0.2);
                    border-color: var(--gold-primary);
                    transform: scale(1.05);
                }

                .ma-back-link {
                    color: var(--gold-medium);
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .ma-back-link:hover {
                    color: var(--gold-bright);
                    transform: translateX(-3px);
                }

                /* Navigation */
                .ma-nav {
                    position: sticky;
                    top: 60px;
                    z-index: 50;
                    background: rgba(8, 8, 8, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                    padding: 0.5rem 0;
                }

                .ma-nav-scroll {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding: 0.5rem 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    scrollbar-width: none;
                }

                .ma-nav-scroll::-webkit-scrollbar {
                    display: none;
                }

                .ma-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 25px;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .ma-nav-item:hover {
                    border-color: var(--gold-primary);
                    color: var(--gold-medium);
                    transform: translateY(-2px);
                }

                .ma-nav-item.active {
                    background: rgba(184, 134, 11, 0.15);
                    border-color: var(--gold-primary);
                    color: var(--gold-bright);
                    box-shadow: 0 4px 15px rgba(184, 134, 11, 0.2);
                }

                .nav-icon {
                    font-size: 1rem;
                }

                /* Main Content */
                .ma-main {
                    padding: 2rem;
                    animation: slideUp 0.6s ease-out;
                }

                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .ma-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Dashboard Grid */
                .ma-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .ma-grid.three-col {
                    grid-template-columns: repeat(3, 1fr);
                }

                .ma-grid.two-col {
                    grid-template-columns: repeat(2, 1fr);
                }

                .ma-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }

                .ma-card:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
                }

                .ma-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .ma-card-icon {
                    font-size: 1.5rem;
                }

                .ma-card-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--gold-medium);
                }

                .ma-card-content {
                    min-height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .coming-soon {
                    color: var(--text-secondary);
                    font-style: italic;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .ma-grid.three-col {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .ma-header {
                        padding: 0.75rem 1rem;
                    }

                    .ma-nav {
                        top: 50px;
                    }

                    .ma-nav-scroll {
                        padding: 0.5rem 1rem;
                    }

                    .ma-main {
                        padding: 1rem;
                    }

                    .ma-grid {
                        grid-template-columns: 1fr;
                    }

                    .ma-grid.three-col {
                        grid-template-columns: 1fr;
                    }

                    .ma-grid.two-col {
                        grid-template-columns: 1fr;
                    }

                    .header-actions {
                        gap: 0.5rem;
                    }

                    .alerts-btn {
                        width: 36px;
                        height: 36px;
                        font-size: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .ma-nav-item {
                        padding: 0.5rem 0.75rem;
                        font-size: 0.75rem;
                    }

                    .nav-icon {
                        font-size: 0.9rem;
                    }
                }

                /* Accessibility - Focus states */
                .ma-nav-item:focus-visible,
                .alerts-btn:focus-visible,
                .lang-toggle:focus-visible {
                    outline: 2px solid var(--gold-bright);
                    outline-offset: 2px;
                }

                /* Reduced motion preference */
                @media (prefers-reduced-motion: reduce) {
                    .market-analysis-page,
                    .ma-main,
                    .ma-nav-item,
                    .ma-card,
                    .alerts-btn {
                        animation: none;
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
}
