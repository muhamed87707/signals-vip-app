'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Modern Lock Icon Component
const ModernLockIcon = () => (
    <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        animation: 'float 3s ease-in-out infinite'
    }}>
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%)',
            filter: 'blur(5px)'
        }}></div>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldLock" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFE566" />
                    <stop offset="50%" stopColor="#B8860B" />
                    <stop offset="100%" stopColor="#705C0B" />
                </linearGradient>
            </defs>
            <rect x="6" y="11" width="12" height="10" rx="3" stroke="url(#goldLock)" strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="url(#goldLock)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="url(#goldLock)" />
        </svg>
    </div>
);

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

                                    {/* Overlay for non-VIP with Glassmorphism */}
                                    {!isVip && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(8, 8, 16, 0.4)',
                                            backdropFilter: 'blur(12px)',
                                            WebkitBackdropFilter: 'blur(12px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <ModernLockIcon />
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
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
}
