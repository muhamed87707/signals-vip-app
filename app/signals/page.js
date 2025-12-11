'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SignalsPage() {
    const { t, lang, toggleLang, isRTL, mounted } = useLanguage();
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVip, setIsVip] = useState(false);

    useEffect(() => {
        // Check VIP status (from URL param or localStorage)
        const urlParams = new URLSearchParams(window.location.search);
        const telegramId = urlParams.get('telegramId');
        const vipStatus = localStorage.getItem('isVip');

        if (vipStatus === 'true') {
            setIsVip(true);
        }

        fetchSignals(telegramId);
    }, []);

    const fetchSignals = async (telegramId) => {
        try {
            const url = telegramId
                ? `/api/signals?telegramId=${telegramId}`
                : '/api/signals';
            const res = await fetch(url);
            const data = await res.json();
            setSignals(data.signals || []);
            if (data.isUserVip) {
                setIsVip(true);
                localStorage.setItem('isVip', 'true');
            }
        } catch (err) {
            console.error('Error fetching signals:', err);
        }
        setLoading(false);
    };

    if (!mounted) return null;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #080810 0%, #0f0f18 100%)',
                padding: '2rem'
            }}
        >
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <a
                            href="/"
                            style={{
                                color: '#DAA520',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.95rem'
                            }}
                        >
                            {t.backToHome}
                        </a>
                        <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
                    </div>

                    <h1 className="text-gradient" style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem'
                    }}>
                        💎 {t.signalsTitle}
                    </h1>
                    <p style={{ color: '#9a9ab0', fontSize: '1.1rem' }}>{t.signalsSubtitle}</p>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}>💎</div>
                        <p style={{ color: '#9a9ab0' }}>{t.loading}</p>
                    </div>
                ) : signals.length === 0 ? (
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: '4rem',
                        border: '1px solid rgba(184, 134, 11, 0.2)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                        <p style={{ color: '#9a9ab0' }}>{t.noSignals}</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '2rem'
                    }}>
                        {signals.map((signal, index) => (
                            <div
                                key={signal._id || index}
                                style={{
                                    background: '#0f0f18',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(184, 134, 11, 0.15)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {/* Signal Image */}
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={signal.imageUrl}
                                        alt="Trading Signal"
                                        style={{
                                            width: '100%',
                                            height: '280px',
                                            objectFit: 'cover',
                                            filter: isVip ? 'none' : 'blur(15px)',
                                            transition: 'filter 0.3s ease'
                                        }}
                                    />

                                    {/* Overlay for non-VIP */}
                                    {!isVip && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(8, 8, 16, 0.85)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                fontSize: '2.5rem',
                                                marginBottom: '1rem',
                                                background: 'linear-gradient(180deg, #E6BE44 0%, #B8860B 50%, #705C0B 100%)',
                                                backgroundSize: '200% 100%',
                                                animation: 'goldShine 3s linear infinite',
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 0 30px rgba(184, 134, 11, 0.4)'
                                            }}>
                                                🔒
                                            </div>
                                            <h3 style={{
                                                color: '#DAA520',
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                marginBottom: '0.5rem'
                                            }}>{t.unlockTitle}</h3>
                                            <p style={{
                                                color: '#9a9ab0',
                                                fontSize: '0.9rem',
                                                lineHeight: '1.6',
                                                marginBottom: '1.5rem'
                                            }}>{t.unlockDesc}</p>
                                            <a
                                                href="/#pricing"
                                                className="btn-primary"
                                                style={{
                                                    fontSize: '0.9rem',
                                                    padding: '0.75rem 1.5rem'
                                                }}
                                            >
                                                {t.viewPlans}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Signal Info */}
                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{
                                            color: '#9a9ab0',
                                            fontSize: '0.85rem'
                                        }}>
                                            {t.posted}: {new Date(signal.createdAt).toLocaleDateString(
                                                lang === 'ar' ? 'ar-EG' : 'en-US',
                                                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                            )}
                                        </span>
                                        {isVip && (
                                            <span style={{
                                                background: 'rgba(76, 175, 80, 0.1)',
                                                color: '#4caf50',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}>
                                                ✓ VIP
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
