'use client';

import { useLanguage } from '../context/LanguageContext';
import EconomicCalendar from '../components/EconomicCalendar';
import AINewsAnalysis from '../components/AINewsAnalysis';
import COTReport from '../components/COTReport';
import BankAnalysis from '../components/BankAnalysis';

export default function AnalysisPage() {
    const { t, lang, mounted } = useLanguage();

    if (!mounted) return null;

    return (
        <main className="analysis-hub min-h-screen pt-32 pb-20 overflow-x-hidden">
            <div className="container mx-auto px-6">
                {/* Hero Section */}
                <header className="analysis-header text-center mb-16 animate-fade-in">
                    <span className="analysis-badge">{lang === 'ar' ? 'بوابة الاستخبارات المالية' : 'Financial Intelligence Portal'}</span>
                    <h1 className="analysis-title-main">
                        {lang === 'ar' ? 'لوحة القيادة المؤسسية' : 'Institutional Command Center'}
                    </h1>
                    <p className="analysis-subtitle-main max-w-2xl mx-auto">
                        {lang === 'ar'
                            ? 'رؤية كلية وشاملة للسوق تربط بين تمركز الحيتان، توقعات البنوك، والأحداث العالمية عبر الذكاء الاصطناعي.'
                            : 'A holistic market view correlating whale positioning, bank forecasts, and global events via advanced AI.'}
                    </p>
                </header>

                {/* Dashboard Grid */}
                <div className="institutional-grid">
                    {/* Top Row: Fundamentals & Sentiment */}
                    <div className="grid-item calendar-cell">
                        <EconomicCalendar />
                    </div>
                    <div className="grid-item cot-cell">
                        <COTReport />
                    </div>

                    {/* Middle Row: AI Strategy (Full Width) */}
                    <div className="grid-item ai-strategy-cell">
                        <AINewsAnalysis />
                    </div>

                    {/* Bottom Row: Bank Forecasts & Tools */}
                    <div className="grid-item bank-cell">
                        <BankAnalysis />
                    </div>

                    {/* Placeholder for future Correlation Tool */}
                    <div className="grid-item extra-cell">
                        <div className="coming-soon-card">
                            <div className="card-inner">
                                <span className="coming-icon">🔗</span>
                                <h4>{lang === 'ar' ? 'مصفوفة الارتباطات' : 'Correlation Matrix'}</h4>
                                <p>{lang === 'ar' ? 'قريباً: تحليل العلاقة بين الذهب والدولار والعوائد.' : 'Coming Soon: Gold vs USD vs Yields correlation.'}</p>
                            </div>
                        </div>
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
                    margin-bottom: 1.5rem;
                }
                .analysis-title-main {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 900;
                    background: linear-gradient(135deg, #fff 0%, #b8860b 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
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
                    gap: 2.5rem;
                    margin-top: 2rem;
                }

                .ai-strategy-cell {
                    grid-column: span 2;
                }

                .grid-item {
                    height: 100%;
                }

                .coming-soon-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(184, 134, 11, 0.2);
                    border-radius: 20px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    min-height: 300px;
                }
                .coming-icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; filter: grayscale(1) opacity(0.5); }
                .coming-soon-card h4 { color: rgba(255,255,255,0.4); margin-bottom: 0.5rem; }
                .coming-soon-card p { color: rgba(255,255,255,0.2); font-size: 0.9rem; }

                @media (max-width: 1200px) {
                    .institutional-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .ai-strategy-cell {
                        grid-column: span 1;
                    }
                }
            `}</style>
        </main>
    );
}
