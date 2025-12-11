'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function Home() {
    const { lang, toggleLanguage, t, dir, isLoaded } = useLanguage();
    const [signals, setSignals] = useState([]);
    const [isVip, setIsVip] = useState(false);
    const [telegramId, setTelegramId] = useState(null);
    const [isInTelegram, setIsInTelegram] = useState(false);

    useEffect(() => {
        // Telegram Web App initialization
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            if (tg.initDataUnsafe?.user) {
                setIsInTelegram(true);
                const user = tg.initDataUnsafe.user;
                setTelegramId(user.id);
                fetchData(user.id);
            } else {
                setIsInTelegram(false);
                fetchData(null);
            }
        } else {
            setIsInTelegram(false);
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
        }
    };

    if (!isLoaded) {
        return <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#151520]"></div>;
    }

    // Landing Page for Browser Visitors
    if (!isInTelegram) {
        return (
            <div dir={dir} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151520] to-[#0a0a0f] text-white font-sans overflow-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Navbar */}
                <nav className="relative z-10 p-6 glass-strong">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-gold">{t('site_title')}</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleLanguage}
                                className="px-4 py-2 glass rounded-full text-sm font-semibold hover:glass-strong transition"
                            >
                                {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
                            </button>
                            <a
                                href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-bold text-black hover:shadow-lg hover:shadow-yellow-500/50 transition transform hover:scale-105"
                            >
                                {t('login_members')}
                            </a>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative z-10 text-center py-20 md:py-32 px-4">
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                            {t('hero_title')} <br />
                            {t('hero_subtitle')} <span className="text-gold">{t('hero_highlight')}</span>
                        </h2>
                        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                            {t('hero_description')}
                        </p>
                        <a
                            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                            className="inline-block btn-premium text-lg md:text-xl px-12 py-5 animate-scale-in"
                        >
                            {t('hero_cta')}
                        </a>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-3xl md:text-4xl font-bold text-center mb-16">{t('features_title')}</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: t('feature1_title'), desc: t('feature1_desc') },
                                { title: t('feature2_title'), desc: t('feature2_desc') },
                                { title: t('feature3_title'), desc: t('feature3_desc') },
                                { title: t('feature4_title'), desc: t('feature4_desc') },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="glass p-6 rounded-2xl hover:glass-strong transition transform hover:scale-105 animate-slide-up"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Live Signals Preview */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('signals_title')}</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {signals.slice(0, 3).map((signal) => (
                                <div key={signal._id} className="glass rounded-2xl overflow-hidden border border-white/10">
                                    <div className="p-4 flex justify-between items-center bg-white/5">
                                        <span className="font-bold text-lg">{signal.pair}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {signal.type}
                                        </span>
                                    </div>
                                    <div className="relative h-64 bg-gray-900/50">
                                        <img src={signal.imageUrl} alt="Signal" className="w-full h-full object-cover opacity-30 blur-md" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="glass-strong p-6 rounded-xl text-center max-w-xs">
                                                <p className="font-bold text-lg mb-2">{t('signal_locked')}</p>
                                                <p className="text-xs text-gray-400">{t('signal_locked_desc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-3xl md:text-5xl font-bold text-center mb-4">{t('pricing_title')}</h3>
                        <p className="text-gray-400 text-center mb-16 text-lg">{t('pricing_subtitle')}</p>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Monthly Plan */}
                            <div className="glass p-8 rounded-3xl hover:glass-gold transition transform hover:scale-105">
                                <h4 className="text-2xl font-bold mb-2">{t('plan_monthly')}</h4>
                                <div className="mb-6">
                                    <span className="text-5xl font-black text-gold">{t('plan_monthly_price')}</span>
                                    <span className="text-gray-400">{t('plan_monthly_period')}</span>
                                </div>
                                <ul className="space-y-3 mb-8 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature1')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature2')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature3')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature4')}
                                    </li>
                                </ul>
                                <a
                                    href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                                    className="block text-center py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition"
                                >
                                    {t('subscribe_now')}
                                </a>
                            </div>

                            {/* Quarterly Plan - Popular */}
                            <div className="glass-gold p-8 rounded-3xl transform scale-105 relative border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                                    {t('plan_popular')}
                                </div>
                                <h4 className="text-2xl font-bold mb-2">{t('plan_quarterly')}</h4>
                                <div className="mb-6">
                                    <span className="text-5xl font-black text-gold">{t('plan_quarterly_price')}</span>
                                    <span className="text-gray-400">{t('plan_quarterly_period')}</span>
                                </div>
                                <div className="text-green-400 font-bold mb-4 text-sm">{t('plan_save')} $58</div>
                                <ul className="space-y-3 mb-8 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature1')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature2')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature3')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature4')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature5')}
                                    </li>
                                </ul>
                                <a
                                    href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                                    className="block text-center py-3 btn-premium rounded-full"
                                >
                                    {t('subscribe_now')}
                                </a>
                            </div>

                            {/* Yearly Plan - Best Value */}
                            <div className="glass p-8 rounded-3xl hover:glass-gold transition transform hover:scale-105">
                                <div className="text-blue-400 font-bold mb-2 text-sm">{t('plan_best_value')}</div>
                                <h4 className="text-2xl font-bold mb-2">{t('plan_yearly')}</h4>
                                <div className="mb-6">
                                    <span className="text-5xl font-black text-gold">{t('plan_yearly_price')}</span>
                                    <span className="text-gray-400">{t('plan_yearly_period')}</span>
                                </div>
                                <div className="text-green-400 font-bold mb-4 text-sm">{t('plan_save')} $469</div>
                                <ul className="space-y-3 mb-8 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature1')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature2')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature3')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature4')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-400">✓</span> {t('plan_feature5')}
                                    </li>
                                </ul>
                                <a
                                    href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                                    className="block text-center py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition"
                                >
                                    {t('subscribe_now')}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative z-10 py-20 px-4">
                    <div className="max-w-4xl mx-auto glass-strong p-12 rounded-3xl text-center">
                        <h3 className="text-4xl font-bold mb-4">{t('cta_title')}</h3>
                        <p className="text-gray-400 mb-8 text-lg">{t('cta_description')}</p>
                        <a
                            href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                            className="inline-block btn-premium text-xl px-12 py-5"
                        >
                            {t('cta_button')}
                        </a>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 border-t border-white/10 py-10 mt-20">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-gray-500">
                            © {new Date().getFullYear()} Sniper Signals. {t('footer_copyright')}
                        </p>
                    </div>
                </footer>

                {/* Telegram Script */}
                <script src="https://telegram.org/js/telegram-web-app.js" async></script>
            </div>
        );
    }

    // Telegram App View for VIP/Free Users
    return (
        <div dir={dir} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 pb-20">
            <header className="flex justify-between items-center mb-6 glass-strong p-4 rounded-2xl">
                <h1 className="text-xl font-bold text-gray-800">{t('site_title')}</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleLanguage}
                        className="px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold"
                    >
                        {lang === 'en' ? 'AR' : 'EN'}
                    </button>
                    {isVip ? (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                            {t('vip_badge')}
                        </span>
                    ) : (
                        <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full text-xs font-bold">
                            {t('free_badge')}
                        </span>
                    )}
                </div>
            </header>

            <div className="space-y-4">
                {signals.map((signal) => (
                    <div key={signal._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
                            <span className="font-bold text-lg text-gray-800">{signal.pair}</span>
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${signal.type === 'BUY' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                {t(signal.type.toLowerCase())}
                            </span>
                        </div>

                        <div className="relative">
                            <img
                                src={signal.imageUrl}
                                alt="Signal Chart"
                                className={`w-full h-80 object-cover transition-all duration-300 ${isVip ? '' : 'blur-lg filter'}`}
                            />

                            {!isVip && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <div className="bg-white/95 p-6 rounded-2xl text-center shadow-2xl max-w-[85%]">
                                        <p className="font-bold text-gray-800 mb-2 text-lg">{t('signal_locked')}</p>
                                        <p className="text-xs text-gray-500 mb-3">{t('signal_locked_desc')}</p>
                                        <div className="h-1 w-12 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            {isVip ? (
                                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-700">
                                    <div className="bg-gray-100 p-3 rounded-lg border">
                                        {t('entry')}: {t('available')}
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-green-700 border border-green-200">
                                        {t('target')}: {t('available')}
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-red-700 border border-red-200">
                                        {t('stop')}: {t('available')}
                                    </div>
                                </div>
                            ) : (
                                <a
                                    href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'VIPSignals0_Bot'}`}
                                    className="block w-full text-center bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition transform active:scale-95"
                                >
                                    {t('upgrade_vip')} ($79)
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {signals.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-sm">{t('signals_empty')}</p>
                    </div>
                )}
            </div>

            <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        </div>
    );
}
