'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Modern Lock Icon Component with Shimmer
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

        {/* Shimmer Effect Overlay */}
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            overflow: 'hidden',
            borderRadius: '20px'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%)',
                transform: 'skewX(-25deg) translateX(-150%)',
                animation: 'shimmer 2.5s infinite'
            }}></div>
        </div>

        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 1 }}>
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

// Clock Icon
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const getTimeAgo = (dateStr, lang) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (lang === 'ar') {
        if (seconds < 60) return 'منذ لحظات';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    } else {
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }
};

export default function SignalsPage() {
    const { t, lang, toggleLang, isRTL, mounted } = useLanguage();
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVip, setIsVip] = useState(false);
    const [expirationDate, setExpirationDate] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let telegramId = urlParams.get('telegramId');
        const vipStatus = localStorage.getItem('isVip');
        const savedExpiration = localStorage.getItem('subscriptionEndDate');

        if (vipStatus === 'true') {
            setIsVip(true);
            if (savedExpiration) {
                setExpirationDate(savedExpiration);
            }
        }

        // Telegram Mini App Integrated Logic
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            try {
                tg.expand();
            } catch (e) {
                console.log('Telegram expand failed', e);
            }

            // Auto-login if opened inside Telegram
            const user = tg.initDataUnsafe?.user;
            if (user?.id) {
                telegramId = user.id.toString();
            }
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

            // STRICT VIP SYNC
            if (data.isUserVip) {
                setIsVip(true);
                localStorage.setItem('isVip', 'true');
                if (data.subscriptionEndDate) {
                    setExpirationDate(data.subscriptionEndDate);
                    localStorage.setItem('subscriptionEndDate', data.subscriptionEndDate);
                } else {
                    setExpirationDate(null);
                    localStorage.removeItem('subscriptionEndDate');
                }
            } else {
                // If API says NOT VIP, ensure we reflect that (revoke access)
                setIsVip(false);
                localStorage.removeItem('isVip');
                localStorage.removeItem('subscriptionEndDate');
                setExpirationDate(null);
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

            <div className="container signals-page-container" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem', paddingBottom: '4rem' }}>
                {/* Header */}
                <div className="signals-header-container" style={{
                    marginBottom: '4rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    padding: '3rem 2rem',
                    borderRadius: '30px',
                    border: '1px solid rgba(184, 134, 11, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: '1000px',
                    margin: '0 auto 4rem auto'
                }}>
                    <div className="signals-nav" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                        width: '100%',
                        flexWrap: 'wrap'
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

                    <div className="signals-diamond" style={{
                        fontSize: '4rem',
                        marginBottom: '1rem',
                        animation: 'float 6s ease-in-out infinite',
                        textAlign: 'center',
                        width: '100%'
                    }}>💎</div>
                    <h1 className="text-gradient signals-title" style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        letterSpacing: '-1px',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        {t.signalsTitle}
                    </h1>

                    {/* VIP Status Badge or Join CTA */}
                    {isVip ? (
                        <div className="vip-badge-container" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // Removed gap to control spacing manually for tighter layout
                            background: 'rgba(218, 165, 32, 0.08)',
                            border: '1px solid rgba(218, 165, 32, 0.25)',
                            borderRadius: '50px',
                            padding: '0.4rem 1rem',
                            marginBottom: '2rem',
                            marginTop: '1rem',
                            color: '#FFD700',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            whiteSpace: 'nowrap',
                            maxWidth: '88vw', // Prevent overflow on small screens
                            flexWrap: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            <span className="vip-badge-icon" style={{ fontSize: '1.1rem', lineHeight: 1, marginInlineEnd: '0.4rem' }}>👑</span>
                            <span className="vip-badge-text" style={{ fontWeight: '700', letterSpacing: '0.5px' }}>{t.vipActive}</span>
                            {/* Visible Separator with adjusted spacing */}
                            <span style={{ width: '1px', height: '16px', background: 'rgba(218, 165, 32, 0.8)', margin: '0 0.35rem' }}></span>
                            <span className="vip-badge-text" style={{ color: '#fff', opacity: 0.9 }}>
                                {expirationDate
                                    ? `${t.expiresIn} ${Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24))} ${t.days || 'Days'}`
                                    : t.lifetime}
                            </span>
                        </div>
                    ) : (
                        <a href="/#pricing" className="vip-badge-container" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2) 0%, rgba(218, 165, 32, 0.1) 100%)',
                            border: '1px solid rgba(218, 165, 32, 0.4)',
                            borderRadius: '50px',
                            padding: '0.5rem 1.5rem',
                            marginBottom: '2rem',
                            marginTop: '1rem',
                            color: '#FFD700',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 0 20px rgba(218, 165, 32, 0.15)',
                            animation: 'pulse 2s infinite',
                            whiteSpace: 'nowrap'
                        }}>
                            {t.joinVip} <span style={{ fontSize: '1.1rem' }}>👉</span>
                        </a>
                    )}

                    <p className="signals-subtitle" style={{
                        color: '#9a9ab0',
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6',
                        textAlign: 'center',
                        width: '100%'
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
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '2.5rem',
                        width: '100%',
                        margin: '0 auto'
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
                                    transform: 'translateY(0)',
                                    flex: '0 1 400px', // Flex basis 400px, but can shrink
                                    minWidth: '300px',
                                    maxWidth: '450px', // Prevent becoming too wide
                                    width: '100%'      // Take full width up to max-width
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
                                {/* Signal Image with Auto Height */}
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={signal.imageUrl}
                                        alt="Trading Signal"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block',
                                            filter: isVip ? 'none' : 'blur(4px)',
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
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            zIndex: 2
                                        }}>
                                            <ModernLockIcon />
                                            <h3 className="text-gradient" style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                marginBottom: '0.5rem',
                                                letterSpacing: '0.5px'
                                            }}>{t.unlockTitle}</h3>
                                            <p style={{
                                                color: '#f0f0f0',
                                                fontSize: '0.95rem',
                                                fontWeight: '500',
                                                lineHeight: '1.6',
                                                marginBottom: '1.5rem',
                                                maxWidth: '280px',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
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

                                {/* Signal Info (Footer) */}
                                <div style={{
                                    padding: '0.8rem 1.25rem',
                                    background: '#0f0f18', // Seamless blend
                                    borderTop: 'none',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{
                                            color: '#9a9ab0',
                                            fontSize: '0.8rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '20px',
                                            letterSpacing: '0.5px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <ClockIcon />
                                            {getTimeAgo(signal.createdAt, lang)}
                                        </span>
                                        {isVip && (
                                            <span style={{
                                                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%)',
                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                color: '#4caf50',
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '30px',
                                                fontSize: '0.75rem',
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
                @keyframes shimmer {
                    0% { transform: skewX(-25deg) translateX(-150%); }
                    100% { transform: skewX(-25deg) translateX(150%); }
                }

                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .signals-page-container {
                        padding-top: 0.5rem !important;
                        padding-bottom: 2rem !important;
                    }
                    .signals-header-container {
                        padding: 1rem 0.5rem !important;
                        margin-bottom: 1rem !important;
                        border-radius: 20px !important;
                    }
                    .signals-nav {
                        margin-bottom: 0.5rem !important;
                        gap: 0.6rem !important;
                    }
                    .signals-diamond {
                        font-size: 2rem !important;
                        margin-bottom: 0.2rem !important;
                    }
                    .signals-title {
                        font-size: 1.5rem !important;
                        margin-bottom: 0.3rem !important;
                    }
                    .signals-subtitle {
                        font-size: 0.85rem !important;
                        line-height: 1.3 !important;
                    }
                    .vip-badge-container {
                        margin-bottom: 0.5rem !important;
                        margin-top: 0.2rem !important;
                        padding: 0.25rem 0.6rem !important;
                    }
                    .vip-badge-icon {
                        font-size: 0.9rem !important;
                    }
                    .vip-badge-text {
                        font-size: 0.7rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
