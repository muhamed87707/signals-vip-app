'use client';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

export default function LegalPage() {
    const { t, isRTL } = useLanguage();

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
                        <h2 style={{ color: 'var(--gold-medium)', marginBottom: '1rem', fontSize: '1.5rem' }}>{t.privacyPolicy}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t.privacyText}</p>
                    </section>

                    {/* Terms of Service */}
                    <section style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <h2 style={{ color: 'var(--gold-medium)', marginBottom: '1rem', fontSize: '1.5rem' }}>{t.termsOfService}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{t.termsText}</p>
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
                        <h2 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚠️ {t.riskDisclaimer}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', opacity: 0.9 }}>{t.riskText}</p>
                    </section>
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} {t.brand}. All rights reserved.
                </div>
            </div>
        </div>
    );
}
