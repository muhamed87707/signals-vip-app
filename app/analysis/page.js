'use client';

import { useLanguage } from '../context/LanguageContext';
import EconomicCalendar from '../components/EconomicCalendar';
import AINewsAnalysis from '../components/AINewsAnalysis';
import Link from 'next/link';

export default function AnalysisPage() {
    const { t, isRTL, mounted, toggleLang } = useLanguage();

    if (!mounted) return null;

    return (
        <div className="analysis-page" dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="header">
                <div className="container header-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <a href="/" className="logo">
                            <span className="btn-text-shine">{t.brand}</span>
                        </a>
                        <button
                            onClick={toggleLang}
                            className="lang-toggle-blog"
                            style={{
                                background: 'rgba(184, 134, 11, 0.1)',
                                border: '1px solid rgba(184, 134, 11, 0.3)',
                                borderRadius: '50px',
                                padding: '0.4rem 1rem',
                                color: 'var(--gold-primary)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🌐 {t.langSwitch}
                        </button>
                    </div>
                    <Link href="/" className="back-link">
                        {t.backToHome}
                    </Link>
                </div>
            </header>

            <section className="analysis-hero">
                <div className="container">
                    <div className="hero-badge animate-fade-in-up">{t.analysisTitle}</div>
                    <h1 className="hero-title animate-fade-in-up delay-100">
                        {t.analysisHeroTitle}
                    </h1>
                    <p className="hero-subtitle animate-fade-in-up delay-200">
                        {t.analysisHeroSubtitle}
                    </p>
                </div>
            </section>

            <main className="container">
                <div className="analysis-grid">
                    <div className="calendar-section">
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--gold-primary)' }}>{t.economicCalendar}</h2>
                        </div>
                        <EconomicCalendar />
                    </div>

                    <div className="ai-section">
                        <AINewsAnalysis />
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container footer-content" style={{ textAlign: 'center' }}>
                    <p>© {new Date().getFullYear()} {t.brand}. {t.footerText}</p>
                </div>
            </footer>
        </div>
    );
}
