'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Modern Lock Icon Component (Animated)
const ModernLockIcon = () => (
    <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        animation: 'float 3s ease-in-out infinite' // Floating animation
    }}>
        {/* Glow behind the lock */}
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(184, 134, 11, 0.25) 0%, transparent 70%)',
            filter: 'blur(8px)',
            animation: 'pulse 2s ease-in-out infinite'
        }}></div>

        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                {/* Animated Gold Gradient */}
                <linearGradient id="goldLock" x1="0%" y1="0%" x2="200%" y2="0%">
                    <stop offset="0%" stopColor="#aa771c">
                        <animate attributeName="offset" values="-1; 1" dur="2s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="50%" stopColor="#fffacd">
                        <animate attributeName="offset" values="-0.5; 1.5" dur="2s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#aa771c">
                        <animate attributeName="offset" values="0; 2" dur="2s" repeatCount="indefinite" />
                    </stop>
                </linearGradient>
                {/* Static Gold Gradient for base */}
                <linearGradient id="staticGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFE566" />
                    <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
            </defs>

            {/* Lock Body */}
            <rect x="6" y="11" width="12" height="10" rx="3" stroke="url(#staticGold)" strokeWidth="2" fill="rgba(0,0,0,0.5)" />
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="url(#staticGold)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="url(#staticGold)">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Shiny Overlay Paths (using animated gradient) */}
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="url(#goldLock)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <rect x="6" y="11" width="12" height="10" rx="3" stroke="url(#goldLock)" strokeWidth="2" fill="none" opacity="0.8" />
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
        <div style={{
            minHeight: '100vh',
            background: '#080810',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '50%',
                height: '50%',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.12) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0,
                animation: 'pulse 8s ease-in-out infinite'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(218, 165, 32, 0.08) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: 0,
                animation: 'pulse 10s ease-in-out infinite reverse'
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem', paddingBottom: '4rem' }}>
                {/* Header */}
                <div style={{
                    marginBottom: '4rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    padding: '3rem 2rem',
                    borderRadius: '30px',
                    border: '1px solid rgba(184, 134, 11, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        width: '100%'
                    }}>
                        <a
                            href="/"
                            style={{
                                color: '#DAA520',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.95rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(218, 165, 32, 0.1)',
                                borderRadius: '20px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t.backToHome}
                        </a>
                        <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
                    </div>

                    <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 6s ease-in-out infinite' }}>💎</div>
                    <h1 className="text-gradient" style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        letterSpacing: '-1px'
                    }}>
                        {t.signalsTitle}
                    </h1>
                    <p style={{
                        color: '#9a9ab0',
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>{t.signalsSubtitle}</p>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>💎</div>
                        <p style={{ color: '#9a9ab0' }}>{t.loading}</p>
                    </div>
                ) : signals.length === 0 ? (
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: '4rem',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        background: 'rgba(15, 15, 24, 0.6)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                        <p style={{ color: '#9a9ab0' }}>{t.noSignals}</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        {signals.map((signal, index) => (
                            <div
                                key={signal._id || index}
                                style={{
                                    background: '#0f0f18',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(184, 134, 11, 0.15)',
                                    transition: 'all 0.4s ease',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    transform: 'translateY(0)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(184, 134, 11, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                                    e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.15)';
                                }}
                            >
                                {/* Signal Image */}
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={signal.imageUrl}
                                        alt="Trading Signal"
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            objectFit: 'cover',
                                            filter: isVip ? 'none' : 'blur(6px)', // Reduced blur per feedback
                                            transition: 'filter 0.3s ease',
                                            opacity: isVip ? 1 : 0.8
                                        }}
                                    />

                                    {/* Overlay for non-VIP with Glassmorphism */}
                                    {!isVip && (
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(8, 8, 16, 0.3)', // Higher transparency
                                            backdropFilter: 'blur(8px)', // Reduced blur on glass
                                            WebkitBackdropFilter: 'blur(8px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <ModernLockIcon />
                                            {/* Gold Text with Gradient Animation */}
                                            <h3 className="text-gradient" style={{
                                                fontSize: '1.5rem',
                                                fontWeight: '800',
                                                marginBottom: '0.75rem',
                                                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                            }}>{t.unlockTitle}</h3>

                                            {/* Subtitle with better visibility */}
                                            <p style={{
                                                color: '#f0f0f0', // Brighter white
                                                fontSize: '1rem',
                                                lineHeight: '1.6',
                                                marginBottom: '1.5rem',
                                                maxWidth: '280px',
                                                fontWeight: '500',
                                                textShadow: '0 1px 4px rgba(0,0,0,0.8)' // Adding shadow for contrast
                                            }}>{t.unlockDesc}</p>

                                            <a
                                                href="/#pricing"
                                                className="btn-primary"
                                                style={{
                                                    fontSize: '0.95rem',
                                                    padding: '0.8rem 2rem',
                                                    boxShadow: '0 4px 20px rgba(184, 134, 11, 0.3)'
                                                }}
                                            >
                                                {t.viewPlans}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Signal Info */}
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{
                                            color: '#9a9ab0',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            ⏰ {new Date(signal.createdAt).toLocaleDateString(
                                                lang === 'ar' ? 'ar-EG' : 'en-US',
                                                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                            )}
                                        </span>
                                        {isVip && (
                                            <span style={{
                                                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%)',
                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                color: '#4caf50',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '30px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                letterSpacing: '0.5px'
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
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
