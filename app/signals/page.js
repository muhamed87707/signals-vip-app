'use client';

import { useState, useEffect, useRef } from 'react';
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

// ===== LOT SIZE CALCULATOR COMPONENT =====
const LotSizeCalculator = ({ t, isRTL }) => {
    const [balance, setBalance] = useState(1000);
    const [riskPercent, setRiskPercent] = useState(2);

    // Fixed stop loss at 100 pips
    const stopLoss = 100;
    const pipValue = 10; // $10 per pip for 1 standard lot
    const riskAmount = (balance * riskPercent) / 100;
    const lotSize = riskAmount / (stopLoss * pipValue);
    // Minimum lot size is 0.01
    const formattedLot = Math.max(0.01, Math.floor(lotSize * 100) / 100);

    const riskButtons = [
        { percent: 1, label: t.riskLow || 'آمن', labelEn: 'Safe', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: 'rgba(74, 222, 128, 0.4)' },
        { percent: 2, label: t.riskMedium || 'معتدل', labelEn: 'Moderate', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.4)' },
        { percent: 3, label: t.riskFast || 'سريع', labelEn: 'Fast', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)' }
    ];

    const currentRisk = riskButtons.find(r => r.percent === riskPercent) || riskButtons[1];

    return (
        <div style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-darker) 100%)',
            border: '2px solid rgba(184, 134, 11, 0.3)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2.5rem auto',
            boxShadow: 'var(--shadow-gold)'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 className="text-gradient" style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    display: 'inline-block' // needed for text-gradient sometimes
                }}>{t.calcTitle}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.calcSubtitle}</p>
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Account Balance */}
                <div>
                    <label style={{ display: 'block', color: 'var(--gold-medium)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t.accountBalance}
                    </label>
                    <input
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(184, 134, 11, 0.2)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--gold-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(184, 134, 11, 0.2)'}
                    />
                </div>

                {/* Risk Percentage Buttons */}
                <div>
                    <label style={{ display: 'block', color: 'var(--gold-medium)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                        {t.riskPercent}
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {riskButtons.map((btn) => (
                            <button
                                key={btn.percent}
                                onClick={() => setRiskPercent(btn.percent)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 0.5rem',
                                    background: riskPercent === btn.percent ? btn.bg : 'rgba(255, 255, 255, 0.03)',
                                    border: `2px solid ${riskPercent === btn.percent ? btn.border : 'rgba(255, 255, 255, 0.1)'}`,
                                    borderRadius: '12px',
                                    color: riskPercent === btn.percent ? btn.color : 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{btn.percent}%</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Result Display */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'rgba(184, 134, 11, 0.05)',
                border: '1px solid rgba(184, 134, 11, 0.2)',
                borderRadius: '16px',
                textAlign: 'center'
            }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t.recommendedLot}</p>
                <div className="text-gradient" style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem'
                }}>
                    {formattedLot.toFixed(2)}
                </div>
            </div>

            {/* Safety Tip */}
            <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(74, 222, 128, 0.05)',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#4ade80',
                fontSize: '0.8rem'
            }}>
                {t.safetyTip}
            </div>
        </div>
    );
};

// ===== REFERRAL CARD COMPONENT =====
const ReferralCard = ({ t, telegramId, isRTL }) => {
    const [referralData, setReferralData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (telegramId) {
            setLoading(true);
            fetch(`/api/referral?telegramId=${telegramId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setReferralData(data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [telegramId]);

    const copyToClipboard = () => {
        if (referralData?.referralLink) {
            navigator.clipboard.writeText(referralData.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Placeholder state for users not connected via Telegram
    if (!telegramId) {
        return (
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                border: '1px solid rgba(184, 134, 11, 0.2)',
                padding: '2rem',
                margin: '2rem auto',
                maxWidth: '800px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
                opacity: 0.8
            }}>
                <h3 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    {t.referralTitle}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {t.referralDesc}
                </p>
                <div style={{
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(184, 134, 11, 0.3)',
                    color: 'var(--text-secondary)'
                }}>
                    ⚠️ Open this page via Telegram Bot to generate your referral link
                </div>
            </div>
        );
    }

    if (loading || !referralData) {
        return (
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                padding: '3rem',
                margin: '2rem auto',
                maxWidth: '800px',
                textAlign: 'center',
                border: '1px solid rgba(184, 134, 11, 0.1)'
            }}>
                <div style={{ animation: 'pulse 1.5s infinite', fontSize: '2rem' }}>💎</div>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading referral data...</p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid rgba(184, 134, 11, 0.2)',
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '800px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'var(--gradient-gold-metallic)'
            }}></div>

            <h3 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {t.referralTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {t.referralDesc}
            </p>

            <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                flexWrap: 'wrap',
                flexDirection: isRTL ? 'row-reverse' : 'row'
            }}>
                <div style={{
                    flex: 1,
                    color: 'var(--gold-primary)',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    direction: 'ltr',
                    textAlign: isRTL ? 'right' : 'left'
                }}>
                    {referralData.referralLink}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="btn-primary"
                    style={{
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem',
                        minWidth: '100px',
                        cursor: 'pointer'
                    }}
                >
                    {copied ? t.linkCopied : t.copyLink}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', textAlign: 'center', direction: isRTL ? 'rtl' : 'ltr' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{isRTL ? 'الأصدقاء المدعوين' : 'Invited Friends'}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{referralData.referralCount}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.2) 0%, rgba(184,134,11,0.1) 100%)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--gold-primary)' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gold-medium)', marginBottom: '0.3rem', fontWeight: '600' }}>{isRTL ? 'أيام VIP المكتسبة' : 'VIP Days Earned'}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold-primary)' }}>+{referralData.referralRewardsEarned * 7} {isRTL ? 'يوم' : 'Days'}</div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '3rem',
                marginTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '1.5rem'
            }}>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                        {referralData.referralCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {t.membersCount}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function SignalsPage() {
    const { t, lang, toggleLang, isRTL, mounted } = useLanguage();
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVip, setIsVip] = useState(false);
    const [expirationDate, setExpirationDate] = useState(null);
    const [telegramId, setTelegramId] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(false); // Track if audio context is allowed

    // Keep track of the latest signal ID to detect new ones
    const latestSignalIdRef = useRef(null);
    const audioRef = useRef(null);

    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [browserInfo, setBrowserInfo] = useState({ supported: true, reason: '' });

    // Detect browser capabilities on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const ua = navigator.userAgent || '';
        const uaLower = ua.toLowerCase();

        // Comprehensive in-app browser detection
        const inAppBrowserPatterns = [
            // Telegram
            { name: 'Telegram', pattern: /telegram/i, hasProxy: () => !!window.TelegramWebviewProxy },
            // Facebook/Meta
            { name: 'Facebook', pattern: /FBAN|FBAV|FB_IAB|FBIOS|FBSS/i },
            { name: 'Messenger', pattern: /Messenger/i },
            { name: 'Instagram', pattern: /Instagram/i },
            // Twitter/X
            { name: 'Twitter', pattern: /Twitter/i },
            // LinkedIn
            { name: 'LinkedIn', pattern: /LinkedInApp/i },
            // Snapchat
            { name: 'Snapchat', pattern: /Snapchat/i },
            // TikTok
            { name: 'TikTok', pattern: /TikTok|musical_ly/i },
            // Pinterest
            { name: 'Pinterest', pattern: /Pinterest/i },
            // WhatsApp (rarely has webview but check anyway)
            { name: 'WhatsApp', pattern: /WhatsApp/i },
            // Line
            { name: 'Line', pattern: /Line\//i },
            // WeChat
            { name: 'WeChat', pattern: /MicroMessenger|WeChat/i },
            // Generic WebView detection for Android
            { name: 'WebView', pattern: /wv\)|WebView/i },
        ];

        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);
        const isMobile = isIOS || isAndroid; // Simple mobile detection

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        const hasPushManager = 'PushManager' in window;
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasNotification = 'Notification' in window;

        // Hide/Disable for Mobile Devices as per user request
        if (isMobile) {
            setBrowserInfo({
                supported: false,
                reason: 'mobile_disabled',
                isHidden: true, // New flag to completely hide the button
                message: ''
            });
            return;
        }

        // Check for in-app browsers (Desktop apps rarely have this issue, but good to keep)
        let detectedApp = null;
        for (const app of inAppBrowserPatterns) {
            if (app.pattern.test(ua) || (app.hasProxy && app.hasProxy())) {
                detectedApp = app.name;
                break;
            }
        }

        if (detectedApp) {
            setBrowserInfo({
                supported: false,
                reason: 'inapp',
                appName: detectedApp,
                message: lang === 'ar'
                    ? `أنت تستخدم متصفح ${detectedApp} المدمج.\n\nلتفعيل الإشعارات:\n1. انسخ رابط الموقع\n2. افتحه في متصفح Chrome أو Safari`
                    : `You are using ${detectedApp}'s built-in browser.\n\nTo enable notifications:\n1. Copy the website link\n2. Open it in Chrome or Safari`
            });
        } else if (isIOS && !isStandalone) {
            setBrowserInfo({
                supported: false,
                reason: 'ios',
                message: lang === 'ar'
                    ? 'لتفعيل الإشعارات على iPhone:\n1. اضغط على زر المشاركة ⬆️\n2. اختر "إضافة إلى الشاشة الرئيسية"\n3. افتح التطبيق من الشاشة الرئيسية'
                    : 'To enable notifications on iPhone:\n1. Tap the Share button ⬆️\n2. Choose "Add to Home Screen"\n3. Open the app from Home Screen'
            });
        } else if (!hasNotification || !hasServiceWorker || !hasPushManager) {
            setBrowserInfo({
                supported: false,
                reason: 'browser',
                message: lang === 'ar'
                    ? 'هذا المتصفح لا يدعم الإشعارات. جرب Chrome أو Edge.'
                    : 'This browser does not support notifications. Try Chrome or Edge.'
            });
        } else {
            setBrowserInfo({ supported: true, reason: '' });
        }
    }, [lang, mounted]);

    // Initialize Audio and check notification status
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/cash.wav');

            // Check if notifications are already granted
            if (Notification.permission === 'granted') {
                setNotificationsEnabled(true);
            }
        }
    }, []);

    // Auto-prompt for notification permission after 3 seconds
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (typeof Notification === 'undefined') return;

        // Only prompt if permission is 'default' (not yet asked)
        if (Notification.permission === 'default') {
            const timer = setTimeout(() => {
                handleEnableSound();
            }, 3000); // 3 second delay for better UX

            return () => clearTimeout(timer);
        }
    }, [mounted]); // Run after component mounts

    const handleEnableSound = async () => {
        // Check if browser supports notifications
        if (!browserInfo.supported) {
            alert(browserInfo.message);
            return;
        }

        // If already enabled, DISABLE notifications
        if (notificationsEnabled) {
            try {
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();

                    if (subscription) {
                        // Unsubscribe from browser
                        await subscription.unsubscribe();

                        // Remove from server
                        await fetch('/api/push/unsubscribe', {
                            method: 'POST',
                            body: JSON.stringify({ endpoint: subscription.endpoint }),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
                setNotificationsEnabled(false);
                alert(t.notificationsDisabled || 'Notifications Disabled 🔕');
            } catch (error) {
                console.error('Error disabling notifications:', error);
                alert('Error: ' + error.message);
            }
            return;
        }

        // ENABLE notifications
        if (typeof Notification !== 'undefined') {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // Register Service Worker and Subscribe to Push
                    if ('serviceWorker' in navigator) {
                        try {
                            await navigator.serviceWorker.register('/sw.js');
                            const registration = await navigator.serviceWorker.ready;

                            // Subscribe to Push
                            const subscription = await registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFI2iHpeuWixiyvPI58zQaRquTCQkgJrnwHc8W-ZOdYMxCvCM2ZcD3yE5Shs4pgywmCWROFj6xabsjK5QpA-i5Y'
                            });

                            // Send Subscription to Server
                            const response = await fetch('/api/push/subscribe', {
                                method: 'POST',
                                body: JSON.stringify({
                                    telegramId: telegramId || null,
                                    subscription: subscription.toJSON()
                                }),
                                headers: { 'Content-Type': 'application/json' }
                            });

                            const result = await response.json();

                            if (result.success) {
                                setNotificationsEnabled(true);
                                alert(t.notificationsEnabled || 'Notifications Enabled! ✅');
                            } else {
                                alert('Error: ' + (result.error || 'Unknown error'));
                            }
                        } catch (swError) {
                            console.error('SW/Push Error:', swError);
                            alert('Error: ' + swError.message);
                        }
                    } else {
                        alert(t.swNotSupported || 'This browser does not support background notifications.');
                    }
                } else {
                    // Permission is 'denied' - show detailed reset instructions
                    const resetMessage = lang === 'ar'
                        ? `الإشعارات محظورة حالياً.\n\nلإعادة التفعيل في Chrome:\n1. اضغط على ⋮ (ثلاث نقاط) أعلى المتصفح\n2. اختر "الإعدادات"\n3. اختر "إعدادات الموقع"\n4. اختر "الإشعارات"\n5. ابحث عن هذا الموقع واحذفه\n6. عد للموقع واضغط تفعيل مجدداً`
                        : `Notifications are currently blocked.\n\nTo reset in Chrome:\n1. Tap ⋮ (three dots) at top\n2. Choose "Settings"\n3. Choose "Site settings"\n4. Choose "Notifications"\n5. Find this site and remove it\n6. Return and try enabling again`;
                    alert(resetMessage);
                }
            } catch (error) {
                console.error('Permission request failed', error);
                alert('Error: ' + error.message);
            }
        } else {
            alert(t.browserNotSupported || 'This browser does not support notifications.');
        }
    };

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio autoplay blocked:', e));
        }

        // fire system notification
        if (Notification.permission === 'granted') {
            new Notification(t.newSignalTitle || 'New Signal Alert! 💰', {
                body: t.newSignalBody || 'A new trading signal has been posted.',
                icon: '/og-image.png' // consistent with site branding
            });
        }
    };



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

        if (telegramId) setTelegramId(telegramId);

        fetchSignals(telegramId, true); // Initial fetch

        // POLLING: Check for new signals every 30 seconds
        const interval = setInterval(() => {
            fetchSignals(telegramId, false); // Background fetch
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchSignals = async (tid, showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const url = tid
                ? `/api/signals?telegramId=${tid}`
                : '/api/signals';
            const res = await fetch(url);
            const data = await res.json();
            const newSignals = data.signals || [];

            setSignals(newSignals);

            // Check for new signals logic
            if (newSignals.length > 0) {
                const newestId = newSignals[0]._id;
                // If we have a previous ID and it's different (and we have signals), it's a new signal
                if (latestSignalIdRef.current && latestSignalIdRef.current !== newestId) {
                    playNotificationSound();
                }
                latestSignalIdRef.current = newestId;
            }

            // STRICT VIP SYNC

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
            background: 'var(--bg-dark)',
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

            <div className="container signals-page-container" style={{ position: 'relative', zIndex: 1, paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '1600px', margin: '0 auto' }}>
                {/* Header */}
                <div className="signals-header-container" style={{
                    marginBottom: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    padding: '2rem 3rem',
                    borderRadius: '30px',
                    border: '2px solid rgba(184, 134, 11, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: '900px',
                    margin: '0 auto 2.5rem auto'
                }}>
                    <div className="signals-nav" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1.5rem',
                        marginBottom: '0.8rem', // Further reduced margin
                        width: '100%',
                        flexWrap: 'wrap'
                    }}>
                        <a
                            href="/"
                            style={{
                                color: 'var(--gold-medium)',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.95rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(218, 165, 32, 0.05)',
                                borderRadius: '20px',
                                transition: 'all 0.3s ease',
                                border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)';
                                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(218, 165, 32, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(218, 165, 32, 0.05)';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <span>🏠</span>
                            {t.backToHome}
                        </a>
                        <button
                            onClick={toggleLang}
                            style={{
                                color: 'var(--gold-medium)',
                                border: '1px solid transparent',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.95rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(218, 165, 32, 0.05)',
                                borderRadius: '20px',
                                transition: 'all 0.3s ease',
                                fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)';
                                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(218, 165, 32, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(218, 165, 32, 0.05)';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            🌐 {t.langSwitch}
                        </button>

                        {/* Notifications Toggle - Hide on Mobile */}
                        {!browserInfo.isHidden && (
                            <button
                                onClick={handleEnableSound}
                                style={{
                                    border: '1px solid rgba(218, 165, 32, 0.3)',
                                    color: 'var(--gold-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.95rem',
                                    padding: '0.5rem 1rem',
                                    background: notificationsEnabled ? 'rgba(218, 165, 32, 0.15)' : 'rgba(218, 165, 32, 0.05)',
                                    borderRadius: '20px',
                                    transition: 'all 0.3s ease',
                                    fontFamily: 'inherit'
                                }}
                                title={notificationsEnabled ? "Alerts Enabled" : "Enable Sound Alerts"}
                            >
                                {notificationsEnabled ? '🔔' : '🔕'} {notificationsEnabled ? (t.alertsOn || "On") : (t.alertsOff || "Enable Alerts")}
                            </button>
                        )}
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
                    {/* VIP Status Badge or Join CTA */}
                    {isVip ? (
                        <div className="vip-badge-container" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(218, 165, 32, 0.1)',
                            border: '1px solid rgba(218, 165, 32, 0.3)',
                            borderRadius: '50px',
                            padding: '0.5rem 1.25rem',
                            marginBottom: '2rem',
                            marginTop: '1rem',
                            color: 'var(--gold-primary)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 20px rgba(184, 134, 11, 0.15)',
                            whiteSpace: 'nowrap',
                            maxWidth: '90vw',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            <span className="vip-badge-icon" style={{ fontSize: '1.2rem', lineHeight: 1, marginInlineEnd: '0.5rem' }}>👑</span>
                            <span className="vip-badge-text" style={{ letterSpacing: '0.5px' }}>{t.vipActive}</span>
                            {/* Visible Separator with adjusted spacing */}
                            <span style={{ width: '1px', height: '16px', background: 'var(--gold-primary)', margin: '0 0.5rem', opacity: 0.5 }}></span>
                            <span className="vip-badge-text" style={{ color: 'var(--text-secondary)', opacity: 1, fontSize: '0.85rem' }}>
                                {expirationDate
                                    ? <>{t.expiresIn} <span style={{ color: 'var(--gold-medium)', fontWeight: '700' }}>{Math.ceil((new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24))}</span> {t.days || 'Days'}</>
                                    : t.lifetime}
                            </span>
                        </div>
                    ) : (
                        <a href="/#pricing" className="vip-badge-container" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            background: 'var(--gradient-gold-button)',
                            backgroundSize: '200% 100%',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '0.8rem 2.5rem',
                            marginBottom: '2rem',
                            marginTop: '1rem',
                            color: '#1a1a1a',
                            fontSize: '1rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: 'var(--shadow-gold)',
                            animation: 'goldShine 3s linear infinite',
                            animationDirection: isRTL ? 'reverse' : 'normal',
                            whiteSpace: 'nowrap'
                        }}>
                            {t.joinVip}<span style={{ fontSize: '1.2rem' }}>🚀</span>
                        </a>
                    )}

                    <p className="signals-subtitle" style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6',
                        textAlign: 'center',
                        width: '100%'
                    }}>{t.signalsSubtitle}</p>
                </div>

                {/* Lot Size Calculator */}
                <LotSizeCalculator t={t} isRTL={isRTL} />

                {/* Referral Program */}
                <ReferralCard t={t} telegramId={telegramId} isRTL={isRTL} />

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>💎</div>
                        <p style={{ color: 'var(--text-secondary)' }}>{t.loading}</p>
                    </div>
                ) : signals.length === 0 ? (
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: '4rem',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                        <p style={{ color: 'var(--text-secondary)' }}>{t.noSignals}</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '2rem',
                        width: '100%',
                        maxWidth: '1400px',
                        margin: '0 auto',
                        padding: '0 2rem'
                    }}>
                        {signals.map((signal, index) => (
                            <div
                                key={signal._id || index}
                                style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(184, 134, 11, 0.2)',
                                    transition: 'all 0.4s ease',
                                    boxShadow: 'var(--shadow-card)',
                                    transform: 'translateY(0)',
                                    flex: '1 1 380px',
                                    minWidth: '320px',
                                    maxWidth: '500px',
                                    width: '100%'
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
                                    {/* Free Preview Badge for first signal */}
                                    {!isVip && index === 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            left: '1rem',
                                            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                                            color: 'white',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            zIndex: 5,
                                            boxShadow: '0 2px 10px rgba(76, 175, 80, 0.4)'
                                        }}>
                                            🎁 {t.freeSignalBadge}
                                        </div>
                                    )}
                                    <img
                                        src={signal.imageUrl}
                                        alt="Trading Signal"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block',
                                            filter: isVip ? 'none' : (index === 0 ? 'none' : 'blur(4px)'),
                                            transition: 'filter 0.3s ease'
                                        }}
                                    />



                                    {/* Overlay for non-VIP with Glassmorphism - Skip first signal */}
                                    {!isVip && index !== 0 && (
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
                                    padding: '0.5rem 1rem', // Reduced padding
                                    background: '#0c0c0c',
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
                                            fontSize: '0.75rem', // Smaller text
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '0.2rem 0.6rem', // More compact badge
                                            borderRadius: '15px',
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
                                                padding: '0.2rem 0.6rem', // More compact badge
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
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
                        padding-top: 0.75rem !important;
                        padding-bottom: 2rem !important;
                    }
                    .signals-header-container {
                        padding: 1.25rem 1rem !important;
                        margin-bottom: 1rem !important; /* Reduced margin */
                        border-radius: 20px !important;
                    }
                    .signals-nav {
                        margin-bottom: 0.8rem !important;
                        gap: 0.8rem !important;
                    }
                    .signals-diamond {
                        font-size: 2.5rem !important;
                        margin-bottom: 0.5rem !important;
                    }
                    .signals-title {
                        font-size: 1.8rem !important;
                        margin-bottom: 0.5rem !important;
                    }
                    .signals-subtitle {
                        font-size: 0.95rem !important;
                        line-height: 1.4 !important;
                    }
                    .vip-badge-container {
                        margin-bottom: 1rem !important;
                        margin-top: 0.5rem !important;
                        padding: 0.3rem 0.8rem !important;
                    }
                    .vip-badge-icon {
                        font-size: 1rem !important;
                    }
                    .vip-badge-text {
                        font-size: 0.75rem !important;
                    }
                }
                    .signals-diamond {
                        font-size: 2.5rem !important;
                        margin-bottom: 0.5rem !important;
                    }
                    .signals-title {
                        font-size: 1.8rem !important;
                        margin-bottom: 0.5rem !important;
                    }
                    .signals-subtitle {
                        font-size: 0.95rem !important;
                        line-height: 1.4 !important;
                    }
                    .vip-badge-container {
                        margin-bottom: 1rem !important;
                        margin-top: 0.5rem !important;
                        padding: 0.3rem 0.8rem !important;
                    }
                    .vip-badge-icon {
                        font-size: 1rem !important;
                    }
                    .vip-badge-text {
                        font-size: 0.75rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
