'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from './context/LanguageContext';

export default function Home() {
    const [signals, setSignals] = useState([]);
    const [isVip, setIsVip] = useState(false);
    const [telegramId, setTelegramId] = useState(null);
    const { t, language, toggleLanguage, dir } = useLanguage();

    useEffect(() => {
        // Basic Telegram Web App Initialization
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
            console.error("Failed to fetch data", error);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen pb-20">
            {/* Navbar with Language Toggle */}
            <nav className="flex justify-between items-center p-5 max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-tighter">
                    <span className="text-white">ABOU</span>
                    <span className="text-gradient-gold"> AL-DAHAB</span>
                </div>
                <button
                    onClick={toggleLanguage}
                    className="glass-card px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                    <span>🌐</span>
                    {language === 'en' ? 'EN' : 'AR'}
                </button>
            </nav>

            {/* Hero Section */}
            <header className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full glass-card text-xs font-semibold text-gold-secondary uppercase tracking-wider animate-fadeInUp">
                        {isVip ? t.vipTag : '#1 Trading Community'}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <span className="block text-white">{t.heroTitle.split(' ')[0]}</span>
                        <span className="text-gradient-gold">{t.heroTitle.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        {t.heroSubtitle}
                    </p>

                    {!isVip && (
                        <a
                            href="https://t.me/Abou_AlDahab"
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-black transition-all duration-200 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full hover:from-yellow-300 hover:to-yellow-500 hover:scale-105 shadow-lg shadow-yellow-500/20 animate-float"
                        >
                            {t.subscribe}
                        </a>
                    )}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 space-y-20">

                {/* Live Signals Section */}
                <section>
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <span className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-transparent rounded-full"></span>
                        {t.premiumAccess}
                    </h3>

                    <div className="space-y-6">
                        {signals.length > 0 ? signals.map((signal) => (
                            <div key={signal._id} className="glass-card rounded-3xl overflow-hidden group hover:border-yellow-500/30 transition-all duration-300">
                                {/* Card Header */}
                                <div className="p-5 flex justify-between items-center glass-panel">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {signal.type === 'BUY' ? 'B' : 'S'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-white">{signal.pair}</h4>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                {signal.type === 'BUY' ? t.buy : t.sell}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {new Date(signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Signal Visual */}
                                <div className="relative h-64 md:h-80 bg-black/50 overflow-hidden">
                                    <img
                                        src={signal.imageUrl}
                                        alt="Chart"
                                        className={`w-full h-full object-cover transition-all duration-700 ${isVip ? 'hover:scale-110' : 'blur-xl opacity-60 scale-105'}`}
                                    />

                                    {!isVip && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">{t.lockedContent}</h4>
                                            <p className="text-sm text-gray-300 mb-6 max-w-xs">{t.unlockNow}</p>
                                            <a href="https://t.me/Abou_AlDahab" className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-sm font-bold text-white transition-all">
                                                {t.subscribe}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                {isVip && (
                                    <div className="p-4 grid grid-cols-3 gap-0 divide-x divide-gray-800/50 bg-black/20 text-center text-sm">
                                        <div className="py-2">
                                            <div className="text-gray-500 text-xs mb-1">Status</div>
                                            <div className="text-green-400 font-bold">{t.available}</div>
                                        </div>
                                        <div className="py-2">
                                            <div className="text-gray-500 text-xs mb-1">{t.target}</div>
                                            <div className="text-white font-mono">----</div>
                                        </div>
                                        <div className="py-2">
                                            <div className="text-gray-500 text-xs mb-1">{t.stop}</div>
                                            <div className="text-white font-mono">----</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-20 text-gray-500 glass-card rounded-2xl">
                                <p>No active signals at the moment</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pricing Section - Only for Non-VIP */}
                {!isVip && (
                    <section className="py-10">
                        <h3 className="text-center text-3xl font-bold mb-12 text-white">{t.pricingTitle}</h3>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Plan 1 */}
                            <div className="glass-card p-8 rounded-3xl relative hover:transform hover:-translate-y-2 transition-all duration-300">
                                <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t.monthly}</div>
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-bold text-white">$79</span>
                                </div>
                                <a href="https://t.me/Abou_AlDahab" className="block w-full py-3 rounded-xl border border-white/20 text-center font-bold hover:bg-white hover:text-black transition-all">
                                    {t.subscribe}
                                </a>
                            </div>

                            {/* Plan 2 - Popular */}
                            <div className="glass-card p-8 rounded-3xl relative transform md:-translate-y-4 border-yellow-500/30 shadow-yellow-500/10 shadow-2xl">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                                <div className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-4">{t.threeMonths}</div>
                                <div className="flex items-baseline mb-6">
                                    <span className="text-5xl font-bold text-white">$179</span>
                                </div>
                                <a href="https://t.me/Abou_AlDahab" className="block w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-center font-bold hover:shadow-lg transition-all">
                                    {t.subscribe}
                                </a>
                            </div>

                            {/* Plan 3 */}
                            <div className="glass-card p-8 rounded-3xl relative hover:transform hover:-translate-y-2 transition-all duration-300">
                                <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">{t.yearly}</div>
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-bold text-white">$479</span>
                                </div>
                                <a href="https://t.me/Abou_AlDahab" className="block w-full py-3 rounded-xl border border-white/20 text-center font-bold hover:bg-white hover:text-black transition-all">
                                    {t.subscribe}
                                </a>
                            </div>
                        </div>
                    </section>
                )}

            </div>

            {/* Footer */}
            <footer className="mt-20 py-8 text-center text-gray-600 text-sm font-medium border-t border-white/5">
                <p>&copy; {currentYear} Abou Al-Dahab. {t.footerRights}.</p>
            </footer>

            <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        </div>
    );
}
