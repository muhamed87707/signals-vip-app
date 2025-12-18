'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';

// ===== Components =====
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
    </svg>
);

const ChartIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#gold-gradient-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="gold-gradient-icon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="25%" stopColor="#FFE566" />
                <stop offset="45%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#FFFFFF" />
                <stop offset="75%" stopColor="#FFE566" />
                <stop offset="100%" stopColor="#FFD700" />
                <animate attributeName="x1" values="-50%;150%;-50%" dur="4s" repeatCount="indefinite" />
                <animate attributeName="x2" values="50%;250%;50%" dur="4s" repeatCount="indefinite" />
            </linearGradient>
        </defs>
        <path d="M18 20V10M12 20V4M6 20v-6" />
        <path d="M22 20H2" strokeWidth="2" />
    </svg>
);

const TargetIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#gold-gradient-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v2M12 22v-2M2 12h2M22 12h-2" />
    </svg>
);

const ChatIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#gold-gradient-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const QuoteIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(184, 134, 11, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    </svg>
);

const LockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gold-gradient-lock)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="gold-gradient-lock" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="25%" stopColor="#FFE566" />
                <stop offset="45%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#FFFFFF" />
                <stop offset="75%" stopColor="#FFE566" />
                <stop offset="100%" stopColor="#FFD700" />
                <animate attributeName="x1" values="-50%;150%;-50%" dur="4s" repeatCount="indefinite" />
                <animate attributeName="x2" values="50%;250%;50%" dur="4s" repeatCount="indefinite" />
            </linearGradient>
        </defs>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const BrandAIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="url(#gold-gradient-lock)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Main 'A' Shape - Outer */}
        <path d="M20 3L6 37H12L15 29H25L28 37H34L20 3Z" />
        {/* Inner horizontal bar */}
        <path d="M13 24H27" strokeWidth="1.5" />
        {/* Inner decorative curve (the swoosh) */}
        <path d="M10 32Q20 22 30 32" strokeWidth="1.5" fill="none" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#gold-gradient-lock)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <path d="M2 12h20" />
        <path d="M4 7h16" strokeWidth="1.2" />
        <path d="M4 17h16" strokeWidth="1.2" />
    </svg>
);

// ===== Countdown Timer Component =====
const CountdownTimer = ({ t }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay - now;

            if (diff > 0) {
                setTimeLeft({
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (num) => String(num).padStart(2, '0');

    return (
        <div className="countdown-banner">
            <span className="countdown-label">{t.limitedOffer} — {t.offerEndsIn}:</span>
            <div className="countdown-timer">
                <span className="countdown-segment">{pad(timeLeft.hours)}</span>
                <span className="countdown-separator">:</span>
                <span className="countdown-segment">{pad(timeLeft.minutes)}</span>
                <span className="countdown-separator">:</span>
                <span className="countdown-segment">{pad(timeLeft.seconds)}</span>
            </div>
        </div>
    );
};

// ===== Stats Bar Component =====
const StatsBar = ({ t }) => {
    return (
        <div className="stats-bar">
            <div className="stat-item">
                <span className="stat-value">87%</span>
                <span className="stat-label">{t.winRate}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
                <span className="stat-value">+15,420</span>
                <span className="stat-label">{t.totalPips}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
                <span className="stat-value">2,500+</span>
                <span className="stat-label">{t.subscribersCount}</span>
            </div>
        </div>
    );
};

// ===== Profit Simulator Component =====
const ProfitSimulator = ({ t }) => {
    const [balance, setBalance] = useState(1000);

    // Logic: Compounding 2% risk per day
    // Assumptions:
    // - 22 Trading Days
    // - Risk per trade: 2% of current balance
    // - Average Daily Pips: 300 (Conservative end of 300-600)
    // - Stop Loss: 100 pips (To calculate reasonable lot size) -> Risk Reward 1:3
    // - Daily Growth % = 2% risk * 3 (Risk Reward) = 6% daily growth

    // Limit balance input to avoid crashes or unrealistic huge numbers in UI
    const safeBalance = balance > 1000000 ? 1000000 : balance;

    const calculateProjection = (startBalance) => {
        let current = startBalance;
        const dailyGrowthRate = 0.06; // 6% daily (based on 2% risk gaining 300 pips vs 100 pip SL)
        const days = 22;

        for (let i = 0; i < days; i++) {
            current = current * (1 + dailyGrowthRate);
        }
        return current;
    };

    const projectedBalance = calculateProjection(safeBalance);
    const profit = projectedBalance - safeBalance;
    const roi = ((profit / safeBalance) * 100).toFixed(0);

    return (
        <div className="profit-simulator animate-fade-in-up delay-600">
            <h3 className="simulator-title text-gradient">{t.simulatorTitle}</h3>
            <p className="simulator-subtitle" style={{ color: 'var(--gold-medium)', fontSize: '1.05rem' }}>{t.simulatorSubtitle}</p>

            <div className="simulator-content">
                <div className="simulator-input-group">
                    <label className="text-gradient" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '1.1rem' }}>{t.initialBalance}</label>
                    <div className="input-wrapper">
                        <span className="currency-symbol">$</span>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(Number(e.target.value))}
                            min="100"
                            className="balance-input"
                        />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', marginTop: '0.8rem', textAlign: 'center', fontWeight: '500', letterSpacing: '0.5px' }}>
                        {t.riskExplanation}
                    </div>
                </div>

                <div className="simulator-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                </div>

                <div className="simulator-result">
                    <div className="result-label text-gradient" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{t.calculateGrowth}</div>
                    <div className="result-value text-gradient" style={{
                        fontSize: '3rem',
                        filter: 'drop-shadow(0 0 10px rgba(184, 134, 11, 0.4))'
                    }}>${projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="profit-gain" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        +{profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({roi}% {t.gain})
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 6H23V12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="simulator-pips-badge" style={{
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--gold-medium)',
                background: 'rgba(184, 134, 11, 0.1)',
                padding: '0.5rem 1.5rem',
                borderRadius: '50px',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                display: 'inline-block',
                boxShadow: '0 0 15px rgba(184, 134, 11, 0.1)'
            }}>
                ✨ {t.estimatedPips}
            </div>
        </div>
    );
};


// ===== FAQ Accordion Component =====
const FAQAccordion = ({ faqs, t }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="container" style={{ marginBottom: '4rem', marginTop: '4rem' }}>
            <h2 className="section-title">
                {t.faqTitle}
            </h2>
            <p className="section-subtitle">{t.faqSubtitle}</p>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((item, index) => (
                    <div key={index} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                    }}>
                        <button
                            onClick={() => toggle(index)}
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textAlign: 'inherit'
                            }}
                        >
                            <span>{item.q}</span>
                            <span style={{
                                color: 'var(--gold-primary)',
                                transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                                fontSize: '1.2rem'
                            }}>
                                ▼
                            </span>
                        </button>

                        <div style={{
                            maxHeight: openIndex === index ? '500px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease-in-out',
                            opacity: openIndex === index ? 1 : 0.5
                        }}>
                            <div style={{
                                padding: '0 1.5rem 1.5rem 1.5rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                borderTop: '1px solid rgba(184, 134, 11, 0.1)',
                                paddingTop: '1rem'
                            }}>
                                {item.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ===== Terms & Agreement Modal =====
const TermsModal = ({ isOpen, onClose, onConfirm, t, isRTL }) => {
    const [isChecked, setIsChecked] = useState(false);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="animate-fade-in-up" dir={isRTL ? 'rtl' : 'ltr'} style={{
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: '600px',
                borderRadius: '24px',
                border: '1px solid var(--gold-primary)',
                boxShadow: '0 0 50px rgba(184, 134, 11, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(184, 134, 11, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 className="text-gradient" style={{ margin: 0, fontSize: '1.3rem' }}>{t.termsModalTitle}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {/* Body - Scrollwrap */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>{t.termsModalDesc}</p>
                    <div style={{
                        background: 'var(--bg-dark)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        height: '250px',
                        overflowY: 'auto'
                    }}>
                        {t.termsText}
                        {'\n\n'}
                        {t.riskText}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid rgba(184, 134, 11, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        userSelect: 'none'
                    }}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--gold-primary)' }}
                        />
                        <span style={{ color: isChecked ? 'white' : 'var(--text-secondary)', transition: 'color 0.3s' }}>{t.agreeCheckbox}</span>
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.8rem',
                                borderRadius: '12px',
                                background: 'transparent',
                                border: '1px solid var(--text-secondary)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={!isChecked}
                            className="btn-primary"
                            style={{
                                flex: 2,
                                opacity: isChecked ? 1 : 0.5,
                                cursor: isChecked ? 'pointer' : 'not-allowed',
                                filter: isChecked ? 'none' : 'grayscale(1)'
                            }}
                        >
                            {t.continueToPayment}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginModal = ({ isOpen, onClose, t, isRTL }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}>
            <div className="bg-[#0c0c0c] border border-[rgba(184,134,11,0.3)] rounded-3xl p-8 max-w-md w-full relative"
                style={{ boxShadow: '0 0 60px rgba(184,134,11,0.2)' }}
                onClick={e => e.stopPropagation()}
                dir={isRTL ? 'rtl' : 'ltr'}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                    style={isRTL ? { right: 'auto', left: '1rem' } : {}}>×</button>
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">💎</div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t.loginTitle}</h2>
                    <p className="text-gray-400">{t.loginSubtitle}</p>
                </div>
                <div className="space-y-4">
                    <button onClick={() => window.open('https://t.me/your_bot?start=login', '_blank')}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #0088cc 0%, #00a8e8 100%)', boxShadow: '0 4px 15px rgba(0,136,204,0.4)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                        {t.continueWithTelegram}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-700"></div>
                        <span className="text-gray-500 text-sm">{isRTL ? 'أو' : 'or'}</span>
                        <div className="flex-1 h-px bg-gray-700"></div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold transition-all bg-white text-gray-800 hover:bg-gray-100"
                        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {t.continueWithGoogle}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===== Main Page =====
export default function LandingPage() {
    const { t, lang, toggleLang, isRTL, testimonials, mounted, faqs } = useLanguage();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [targetUrl, setTargetUrl] = useState('');

    const handleSubscribe = (url) => {
        setTargetUrl(url);
        setShowTermsModal(true);
    };

    const confirmSubscription = () => {
        window.location.href = targetUrl;
    };
    const currentYear = new Date().getFullYear();

    const monthlyPrice = 79;
    const quarterlyPrice = 149;
    const yearlyPrice = 449;
    const quarterlyOriginal = monthlyPrice * 3;
    const yearlyOriginal = monthlyPrice * 12;
    const quarterlySavings = quarterlyOriginal - quarterlyPrice;
    const yearlySavings = yearlyOriginal - yearlyPrice;

    if (!mounted) return null;

    return (
        <div>
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} t={t} isRTL={isRTL} />
            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} onConfirm={confirmSubscription} t={t} isRTL={isRTL} />

            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <a href="/" className="logo">
                        <span className="logo-icon"><BrandAIcon /></span>
                        <span className="btn-text-shine">{t.brand}</span>
                    </a>
                    <button onClick={toggleLang} className="lang-toggle">
                        <GlobeIcon /> <span className="btn-text-shine">{t.langSwitch}</span>
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-fade-in-up">{t.badge}</div>
                        <h1 className="hero-title animate-fade-in-up delay-100">
                            {t.heroTitle}<br />
                            <span className="text-gradient">{t.heroTitleHighlight}</span>
                        </h1>
                        <p className="hero-subtitle animate-fade-in-up delay-200">{t.heroSubtitle}</p>
                        <StatsBar t={t} />
                        <div className="hero-buttons animate-fade-in-up delay-300">
                            <a href="#pricing" className="btn-primary">{t.ctaButton} →</a>
                            <button onClick={() => setShowLoginModal(true)} className="btn-secondary">
                                <LockIcon /> <span className="btn-text-shine">{t.loginButton}</span>
                            </button>
                        </div>
                        <a href="/track-record" className="track-record-link animate-fade-in-up delay-400" style={{
                            marginTop: '1.5rem',
                            color: 'var(--gold-medium)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(184, 134, 11, 0.1)',
                            borderRadius: '50px',
                            border: '1px solid rgba(184, 134, 11, 0.2)',
                            transition: 'all 0.3s ease'
                        }}>
                            📊 {t.viewTrackRecord}
                        </a>
                    </div>
                </div>
            </section>

            {/* Profit Simulator */}
            <section className="container" style={{ position: 'relative', zIndex: 2 }}>
                <ProfitSimulator t={t} />
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">
                        {t.featuresTitle.split(' ')[0]}{' '}
                        <span className="text-gradient">{t.featuresTitle.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="section-subtitle">{t.featuresSubtitle}</p>
                    <div className="features-grid">
                        <div className="card">
                            <div className="feature-icon"><ChartIcon /></div>
                            <h3 className="feature-title">{t.feature1Title}</h3>
                            <p className="feature-desc">{t.feature1Desc}</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon"><TargetIcon /></div>
                            <h3 className="feature-title">{t.feature2Title}</h3>
                            <p className="feature-desc">{t.feature2Desc}</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon"><ChatIcon /></div>
                            <h3 className="feature-title">{t.feature3Title}</h3>
                            <p className="feature-desc">{t.feature3Desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials">
                <div className="container">
                    <h2 className="section-title">
                        {t.testimonialsTitle.split(' ')[0]}{' '}
                        <span className="text-gradient">{t.testimonialsTitle.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="section-subtitle">{t.testimonialsSubtitle}</p>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-quote-icon"><QuoteIcon /></div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{testimonial.initial}</div>
                                    <div className="testimonial-info">
                                        <div className="testimonial-name">{testimonial.name}</div>
                                        <div className="testimonial-title">{testimonial.title}</div>
                                    </div>
                                    <div className="testimonial-stars">★★★★★</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="pricing">
                <div className="container">
                    <h2 className="section-title">
                        {t.pricingTitle.split(' ')[0]}{' '}
                        <span className="text-gradient">{t.pricingTitle.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="section-subtitle">{t.pricingSubtitle}</p>
                    <CountdownTimer t={t} />
                    <div className="pricing-grid">
                        {/* Monthly */}
                        <div className="pricing-card">
                            <h3 className="pricing-title">{t.monthly}</h3>
                            <div className="pricing-price">${monthlyPrice}<span>{t.perMonth}</span></div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                            </ul>
                            <button onClick={() => handleSubscribe('https://t.me/your_bot')} className="btn-primary" style={{ width: '100%', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>{t.subscribe}</button>
                        </div>
                        {/* Quarterly */}
                        <div className="pricing-card">
                            <h3 className="pricing-title">{t.quarterly}</h3>
                            <div className="pricing-price">${quarterlyPrice}<span>{t.perQuarter}</span></div>
                            <p className="pricing-original">{t.originalPrice} ${quarterlyOriginal}</p>
                            <div className="pricing-savings">✓ {t.youSave} ${quarterlySavings}</div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                                <li><CheckIcon /> {t.feature_community}</li>
                            </ul>
                            <button onClick={() => handleSubscribe('https://t.me/your_bot')} className="btn-primary" style={{ width: '100%', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>{t.subscribe}</button>
                        </div>
                        {/* Yearly */}
                        <div className="pricing-card featured">
                            <span className="pricing-badge">{t.popular}</span>
                            <h3 className="pricing-title">{t.yearly}</h3>
                            <div className="pricing-price">${yearlyPrice}<span>{t.perYear}</span></div>
                            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                <p className="pricing-original" style={{ marginTop: 0 }}>{t.originalPrice} ${yearlyOriginal}</p>
                                <div className="pricing-savings" style={{ marginTop: 0 }}>✓ {t.youSave} ${yearlySavings}</div>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                                <li><CheckIcon /> {t.feature_community}</li>
                                <li><CheckIcon /> {t.feature_education}</li>
                            </ul>
                            <button onClick={() => handleSubscribe('https://t.me/your_bot')} className="btn-primary" style={{ width: '100%', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit' }}>{t.subscribe}</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <FAQAccordion faqs={faqs} t={t} />

            {/* Disclaimer */}
            <section className="disclaimer">
                <div className="container">
                    <div className="disclaimer-content">
                        <p className="disclaimer-title">{t.disclaimerTitle}</p>
                        <p>{t.disclaimerText}</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                    <p>© {currentYear} <span className="footer-brand">{t.brand}</span>. {t.footerText}</p>
                    <a href="/legal" style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        borderBottom: '1px dotted var(--text-secondary)',
                        paddingBottom: '2px',
                        transition: 'all 0.3s ease'
                    }} className="legal-link">
                        {t.legalFooterLink}
                    </a>
                </div>
            </footer>
        </div>
    );
}
