'use client';
import { useEffect, useState } from 'react';

const translations = {
    en: {
        dir: 'ltr',
        nav: {
            brand: 'Abu Al-Dahab',
            home: 'Home',
        },
        header: {
            title: 'Trading Signals',
            vipBadge: 'VIP Member',
            freeBadge: 'Free User',
        },
        signal: {
            locked: '🔒 VIP Only',
            lockedDesc: 'Subscribe to unlock this signal',
            entry: 'Entry',
            sl: 'Stop Loss',
            tp: 'Take Profit',
            available: 'Available ✓',
        },
        subscribe: {
            title: 'Unlock Premium Signals',
            desc: 'Get access to all trading signals with clear entry, SL & TP levels',
            plans: [
                { name: 'Monthly', price: '$79', period: '/month' },
                { name: '3 Months', price: '$179', period: '/3 months', save: 'Save $58' },
                { name: 'Yearly', price: '$479', period: '/year', save: 'Save $469' },
            ],
            cta: 'Subscribe Now',
        },
        empty: 'No signals available at the moment...',
        loading: 'Loading signals...',
    },
    ar: {
        dir: 'rtl',
        nav: {
            brand: 'مؤسسة ابو الذهب',
            home: 'الرئيسية',
        },
        header: {
            title: 'توصيات التداول',
            vipBadge: 'عضو VIP',
            freeBadge: 'مستخدم مجاني',
        },
        signal: {
            locked: '🔒 VIP فقط',
            lockedDesc: 'اشترك لفتح هذه التوصية',
            entry: 'الدخول',
            sl: 'وقف الخسارة',
            tp: 'الهدف',
            available: 'متاح ✓',
        },
        subscribe: {
            title: 'افتح التوصيات المميزة',
            desc: 'احصل على جميع التوصيات مع نقاط الدخول والخروج الواضحة',
            plans: [
                { name: 'شهري', price: '$79', period: '/شهر' },
                { name: '3 أشهر', price: '$179', period: '/3 أشهر', save: 'وفر $58' },
                { name: 'سنوي', price: '$479', period: '/سنة', save: 'وفر $469' },
            ],
            cta: 'اشترك الآن',
        },
        empty: 'لا توجد توصيات متاحة حالياً...',
        loading: 'جاري تحميل التوصيات...',
    },
};

export default function SignalsPage() {
    const [signals, setSignals] = useState([]);
    const [isVip, setIsVip] = useState(false);
    const [telegramId, setTelegramId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('en');
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);

    const t = translations[lang];
    const telegramLink = "https://t.me/Abou_AlDahab";
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ar')) {
            setLang('ar');
        }

        // Initialize Telegram WebApp
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            const user = tg.initDataUnsafe?.user;
            if (user) {
                setTelegramId(user.id);
                fetchData(user.id);
            } else {
                fetchData(null);
            }
        } else {
            fetchData(null);
        }
    }, []);

    const fetchData = async (id) => {
        try {
            const res = await fetch(`/api/signals?telegramId=${id || ''}`);
            const data = await res.json();
            if (data.signals) setSignals(data.signals);
            if (data.isUserVip) setIsVip(data.isUserVip);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLang = () => {
        setLang(lang === 'ar' ? 'en' : 'ar');
    };

    return (
        <div dir={t.dir} className="min-h-screen bg-[#050510] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="orb orb-gold w-[400px] h-[400px] -top-20 -right-20 animate-float opacity-20"></div>
                <div className="orb orb-purple w-[300px] h-[300px] bottom-40 -left-20 animate-float opacity-20" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <h1 className="text-lg font-bold gold-text">{t.nav.brand}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleLang}
                            className="px-2 py-1 rounded-lg border border-white/10 text-xs hover:border-[#D4AF37]/50"
                        >
                            {lang === 'ar' ? 'EN' : 'عربي'}
                        </button>
                        {isVip ? (
                            <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-bold">
                                {t.header.vipBadge} 👑
                            </span>
                        ) : (
                            <span className="bg-white/10 text-gray-400 px-3 py-1 rounded-full text-xs">
                                {t.header.freeBadge}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-20 pb-24 px-4 max-w-4xl mx-auto">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold">{t.header.title}</h2>
                </header>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">{t.loading}</p>
                    </div>
                ) : signals.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">📊</span>
                        <p className="text-gray-400">{t.empty}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {signals.map((signal) => (
                            <div key={signal._id} className="glass rounded-2xl overflow-hidden">
                                {/* Signal Header */}
                                <div className="p-4 flex justify-between items-center border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg">{signal.pair}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${signal.type === 'BUY'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {signal.type}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        {new Date(signal.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                    </span>
                                </div>

                                {/* Signal Image */}
                                <div className="relative">
                                    <img
                                        src={signal.imageUrl}
                                        alt="Signal"
                                        className={`w-full h-64 object-cover transition-all duration-300 ${!isVip ? 'blur-signal' : ''}`}
                                    />

                                    {/* Locked Overlay for Non-VIP */}
                                    {!isVip && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                            <div className="glass-strong p-6 rounded-2xl text-center max-w-xs mx-4">
                                                <span className="text-4xl block mb-3">🔐</span>
                                                <p className="font-bold text-lg mb-2">{t.signal.locked}</p>
                                                <p className="text-gray-400 text-sm mb-4">{t.signal.lockedDesc}</p>
                                                <button
                                                    onClick={() => setShowSubscribeModal(true)}
                                                    className="gold-button px-6 py-2.5 rounded-full text-sm font-bold"
                                                >
                                                    {t.subscribe.cta}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Signal Details */}
                                {isVip && (
                                    <div className="p-4 grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-gray-400 text-xs mb-1">{t.signal.entry}</div>
                                            <div className="font-bold text-white">{t.signal.available}</div>
                                        </div>
                                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                            <div className="text-gray-400 text-xs mb-1">{t.signal.sl}</div>
                                            <div className="font-bold text-red-400">{t.signal.available}</div>
                                        </div>
                                        <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                            <div className="text-gray-400 text-xs mb-1">{t.signal.tp}</div>
                                            <div className="font-bold text-green-400">{t.signal.available}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Subscribe Modal */}
            {showSubscribeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowSubscribeModal(false)}>
                    <div className="glass-strong rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <span className="text-5xl block mb-4">💎</span>
                            <h3 className="text-2xl font-bold gold-text mb-2">{t.subscribe.title}</h3>
                            <p className="text-gray-400 text-sm">{t.subscribe.desc}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {t.subscribe.plans.map((plan, index) => (
                                <div key={index} className={`p-4 rounded-xl border transition-all ${index === 1 ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10' : 'border-white/10 bg-white/5'}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-white">{plan.name}</div>
                                            {plan.save && <div className="text-green-400 text-xs">{plan.save}</div>}
                                        </div>
                                        <div className="text-left">
                                            <span className="text-2xl font-bold gold-text">{plan.price}</span>
                                            <span className="text-gray-500 text-sm">{plan.period}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href={telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full gold-button py-4 rounded-xl text-center font-bold text-lg"
                        >
                            {t.subscribe.cta}
                        </a>

                        <button
                            onClick={() => setShowSubscribeModal(false)}
                            className="block w-full text-center text-gray-500 text-sm mt-4 hover:text-gray-300"
                        >
                            ✕ {lang === 'ar' ? 'إغلاق' : 'Close'}
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 py-3 text-center">
                <span className="text-gray-500 text-xs">© {currentYear} {t.nav.brand}</span>
            </footer>

            {/* Telegram Script */}
            <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        </div>
    );
}
