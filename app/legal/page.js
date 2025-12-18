'use client';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

export default function LegalPage() {
    const { t, isRTL } = useLanguage();

    // Helper to render formatted text with titles
    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            if (!line.trim()) return <div key={index} style={{ height: '0.5rem' }}></div>;

            if (line.includes('**')) {
                // Remove ** and render as bold header
                const cleanLine = line.replace(/\*\*/g, '');
                return <h3 key={index} style={{
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    marginTop: '1.5rem',
                    marginBottom: '0.5rem'
                }}>{cleanLine}</h3>;
            }
            return <p key={index} style={{ marginBottom: '0.5rem', opacity: 0.8, lineHeight: '1.6' }}>{line}</p>;
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            color: 'var(--text-primary)',
            padding: '2rem 1rem',
            direction: isRTL ? 'rtl' : 'ltr'
        }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--gold-primary)',
                    textDecoration: 'none',
                    marginBottom: '2rem',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                }}>
                    {isRTL ? '→' : '←'} {t.backToHome}
                </Link>

                <h1 className="text-gradient" style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '3rem',
                    textAlign: 'center'
                }}>{t.legalTitle}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Privacy Policy */}
                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <h2 style={{ color: 'var(--gold-medium)', marginBottom: '1.5rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(184, 134, 11, 0.1)', paddingBottom: '1rem' }}>{t.privacyPolicy}</h2>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            {renderContent(t.privacyText)}
                        </div>
                    </section>

                    {/* Terms of Service */}
                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <h2 style={{ color: 'var(--gold-medium)', marginBottom: '1.5rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(184, 134, 11, 0.1)', paddingBottom: '1rem' }}>{t.termsOfService}</h2>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            {renderContent(t.termsText)}
                        </div>
                    </section>

                    {/* Risk Disclaimer */}
                    <section style={{
                        background: 'rgba(255, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 0, 0, 0.2)',
                        borderRadius: '24px',
                        padding: '2rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: isRTL ? 'auto' : 0,
                            right: isRTL ? 0 : 'auto',
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            background: '#ef4444'
                        }}></div>
                        <h2 style={{ color: '#f87171', marginBottom: '1.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255, 0, 0, 0.1)', paddingBottom: '1rem' }}>
                            ⚠️ {t.riskDisclaimer}
                        </h2>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            {renderContent(t.riskText)}
                        </div>
                    </section>
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} {t.brand}. All rights reserved.
                </div>
            </div>
        </div>
    );
}
