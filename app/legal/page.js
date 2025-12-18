'use client';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

export default function LegalPage() {
    const { t, isRTL, toggleLang } = useLanguage();

    // Helper to render formatted text with titles
    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            if (!line.trim()) return <div key={index} style={{ height: '1rem' }}></div>;

            if (line.includes('**')) {
                // Remove ** and render as bold header
                const cleanLine = line.replace(/\*\*/g, '');
                return <h3 key={index} style={{
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    fontSize: '1.15rem',
                    marginTop: '2rem',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4'
                }}>{cleanLine}</h3>;
            }
            return <p key={index} style={{
                marginBottom: '0.75rem',
                opacity: 0.9,
                lineHeight: '1.8',
                fontSize: '1rem',
                color: 'var(--text-secondary)'
            }}>{line}</p>;
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            color: 'var(--text-primary)',
            padding: '3rem 1.5rem',
            direction: isRTL ? 'rtl' : 'ltr',
            fontFamily: isRTL ? 'var(--font-cairo)' : 'var(--font-inter)'
        }}>
            <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <Link href="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--gold-primary)',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        transition: 'opacity 0.2s'
                    }} className="hover:opacity-80">
                        {isRTL ? '→' : '←'} {t.backToHome}
                    </Link>

                    <button
                        onClick={toggleLang}
                        style={{
                            background: 'rgba(184, 134, 11, 0.1)',
                            border: '1px solid rgba(184, 134, 11, 0.3)',
                            borderRadius: '50px',
                            padding: '0.5rem 1.2rem',
                            color: 'var(--gold-primary)',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                        className="hover:bg-[rgba(184,134,11,0.2)]"
                    >
                        🌐 {t.langSwitch}
                    </button>
                </div>

                <h1 className="text-gradient" style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '4rem',
                    textAlign: 'center',
                    lineHeight: '1.2'
                }}>{t.legalTitle}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Privacy Policy */}
                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.15)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <h2 style={{
                            color: 'var(--gold-medium)',
                            marginBottom: '1.5rem',
                            fontSize: '2rem',
                            borderBottom: '1px solid rgba(184, 134, 11, 0.1)',
                            paddingBottom: '1rem'
                        }}>{t.privacyPolicy}</h2>
                        <div>
                            {renderContent(t.privacyText)}
                        </div>
                    </section>

                    {/* Terms of Service */}
                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.15)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <h2 style={{
                            color: 'var(--gold-medium)',
                            marginBottom: '1.5rem',
                            fontSize: '2rem',
                            borderBottom: '1px solid rgba(184, 134, 11, 0.1)',
                            paddingBottom: '1rem'
                        }}>{t.termsOfService}</h2>
                        <div>
                            {renderContent(t.termsText)}
                        </div>
                    </section>

                    {/* Risk Disclaimer */}
                    <section style={{
                        background: 'rgba(255, 0, 0, 0.04)',
                        border: '1px solid rgba(255, 60, 60, 0.2)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: isRTL ? 'auto' : 0,
                            right: isRTL ? 0 : 'auto',
                            top: 0,
                            bottom: 0,
                            width: '6px',
                            background: '#ef4444',
                            opacity: 0.8
                        }}></div>
                        <h2 style={{
                            color: '#fca5a5',
                            marginBottom: '1.5rem',
                            fontSize: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            borderBottom: '1px solid rgba(255, 60, 60, 0.1)',
                            paddingBottom: '1rem'
                        }}>
                            ⚠️ {t.riskDisclaimer}
                        </h2>
                        <div>
                            {renderContent(t.riskText)}
                        </div>
                    </section>
                </div>

                <div style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6, fontSize: '0.95rem' }}>
                    &copy; {new Date().getFullYear()} {t.brand}. All rights reserved. • <a href="mailto:Sniper.VIP.Support@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>Sniper.VIP.Support@gmail.com</a>
                </div>
            </div>
        </div>
    );
}
