'use client';
import { useState, useEffect } from 'react';

const content = {
    en: {
        dir: 'ltr',
        brand: 'Abu Al-Dahab',
        nav: { join: 'Join VIP', lang: 'العربية' },
        hero: {
            badge: '✨ Elite Trading Signals',
            title: 'Master Gold & Forex',
            subtitle: 'High-precision trading signals delivered instantly to your Telegram',
            cta: 'Start Trading Now',
            ctaSec: 'View Plans',
        },
        signals: {
            title: 'Live Signals',
            subtitle: 'Real-time market opportunities',
            unlock: 'Unlock This Signal',
            vipOnly: 'VIP Members Only',
            seeDetails: 'Subscribe to see full details',
            buy: 'BUY',
            sell: 'SELL',
        },
        pricing: {
            title: 'Choose Your Plan',
            subtitle: 'Join thousands of successful traders',
            monthly: 'Monthly',
            quarterly: '3 Months',
            yearly: 'Annual',
            perMonth: '/month',
            per3Months: '/3 months',
            perYear: '/year',
            bestValue: 'BEST VALUE',
            save: 'Save',
            features: ['Premium Signals Daily', 'Entry & Exit Levels', 'Risk Management', '24/7 Priority Support'],
            cta: 'Subscribe Now',
        },
        why: {
            title: 'Why Abu Al-Dahab?',
            items: [
                { icon: '🎯', title: 'Precision', desc: 'High accuracy signals' },
                { icon: '⚡', title: 'Speed', desc: 'Instant Telegram alerts' },
                { icon: '🛡️', title: 'Safety', desc: 'Risk management included' },
                { icon: '💎', title: 'Support', desc: '24/7 VIP assistance' },
            ],
        },
        footer: {
            copy: 'All Rights Reserved',
            disclaimer: '⚠️ Trading involves risk. Trade responsibly.',
        },
    },
    ar: {
        dir: 'rtl',
        brand: 'مؤسسة ابو الذهب',
        nav: { join: 'انضم VIP', lang: 'English' },
        hero: {
            badge: '✨ توصيات تداول النخبة',
            title: 'أتقن تداول الذهب والفوركس',
            subtitle: 'توصيات عالية الدقة تصلك فوراً على تليجرام',
            cta: 'ابدأ التداول الآن',
            ctaSec: 'عرض الخطط',
        },
        signals: {
            title: 'التوصيات الحية',
            subtitle: 'فرص السوق لحظة بلحظة',
            unlock: 'افتح هذه التوصية',
            vipOnly: 'حصرياً لأعضاء VIP',
            seeDetails: 'اشترك لرؤية التفاصيل كاملة',
            buy: 'شراء',
            sell: 'بيع',
        },
        pricing: {
            title: 'اختر خطتك',
            subtitle: 'انضم لآلاف المتداولين الناجحين',
            monthly: 'شهري',
            quarterly: '3 أشهر',
            yearly: 'سنوي',
            perMonth: '/شهر',
            per3Months: '/3 أشهر',
            perYear: '/سنة',
            bestValue: 'الأفضل قيمة',
            save: 'وفر',
            features: ['توصيات مميزة يومية', 'نقاط الدخول والخروج', 'إدارة المخاطر', 'دعم أولوية 24/7'],
            cta: 'اشترك الآن',
        },
        why: {
            title: 'لماذا مؤسسة ابو الذهب؟',
            items: [
                { icon: '🎯', title: 'دقة', desc: 'توصيات عالية الدقة' },
                { icon: '⚡', title: 'سرعة', desc: 'تنبيهات فورية على تليجرام' },
                { icon: '🛡️', title: 'أمان', desc: 'إدارة مخاطر متضمنة' },
                { icon: '💎', title: 'دعم', desc: 'مساعدة VIP على مدار الساعة' },
            ],
        },
        footer: {
            copy: 'جميع الحقوق محفوظة',
            disclaimer: '⚠️ التداول ينطوي على مخاطر. تداول بمسؤولية.',
        },
    },
};

export default function Home() {
    const [lang, setLang] = useState('en');
    const [signals, setSignals] = useState([]);
    const [isVip, setIsVip] = useState(false);
    const [loading, setLoading] = useState(true);

    const t = content[lang];
    const year = new Date().getFullYear();
    const tgLink = "https://t.me/Abou_AlDahab";

    useEffect(() => {
        // Detect language
        const browserLang = navigator.language || navigator.userLanguage;
        setLang(browserLang.startsWith('ar') ? 'ar' : 'en');

        // Fetch signals
        fetch('/api/signals')
            .then(res => res.json())
            .then(data => {
                setSignals(data.signals || []);
                setIsVip(data.isUserVip || false);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div dir={t.dir} className="min-h-screen relative">

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 glass-strong">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">👑</span>
                        <h1 className="text-xl font-bold text-gold">{t.brand}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-sm text-gray-400 hover:text-white transition">
                            {t.nav.lang}
                        </button>
                        <a href={tgLink} target="_blank" className="hidden sm:block btn-premium text-sm px-6 py-2">
                            {t.nav.join}
                        </a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="pt-32 pb-24 px-4 text-center relative overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[150px] animate-pulse"></div>

                <div className="max-w-4xl mx-auto relative z-10 animate-fadeInUp">
                    <div className="inline-block mb-6 px-4 py-2 glass-gold rounded-full">
                        <span className="text-sm font-semibold text-gold">{t.hero.badge}</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                        <span className="text-gold">{t.hero.title}</span>
                    </h1>

                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t.hero.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#pricing" className="btn-premium">
                            {t.hero.cta}
                        </a>
                        <a href="#signals" className="glass px-8 py-4 rounded-full font-semibold hover:glass-strong transition">
                            {t.hero.ctaSec}
                        </a>
                    </div>
                </div>
            </section>

            {/* SIGNALS */}
            <section id="signals" className="py-20 px-4 bg-gradient-to-b from-transparent to-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-3">{t.signals.title}</h2>
                        <p className="text-gray-400">{t.signals.subtitle}</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : signals.length === 0 ? (
                        <div className="text-center py-20 glass rounded-3xl">
                            <p className="text-gray-400">No active signals</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {signals.slice(0, 6).map((signal) => (
                                <div key={signal._id} className="glass rounded-3xl overflow-hidden hover:glass-strong transition group">
                                    {/* Header */}
                                    <div className="p-4 flex justify-between items-center border-b border-white/5">
                                        <span className="font-bold text-lg">{signal.pair}</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {signal.type === 'BUY' ? t.signals.buy : t.signals.sell}
                                        </span>
                                    </div>

                                    {/* Image */}
                                    <div className="relative h-64 bg-gray-900 overflow-hidden">
                                        <img
                                            src={signal.imageUrl}
                                            alt="Chart"
                                            className={`w-full h-full object-cover transition-all duration-500 ${!isVip ? 'blur-lg scale-110 opacity-40' : 'group-hover:scale-105'
                                                }`}
                                        />

                                        {!isVip && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-black/50">
                                                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                    <span className="text-3xl">🔒</span>
                                                </div>
                                                <p className="text-white font-bold mb-2">{t.signals.vipOnly}</p>
                                                <p className="text-gray-300 text-sm mb-4 text-center">{t.signals.seeDetails}</p>
                                                <a href="#pricing" className="bg-gold text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-yellow-400 transition">
                                                    {t.signals.unlock}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {isVip && (
                                        <div className="p-4 bg-black/20 text-center">
                                            <p className="text-xs text-green-400">✓ Full details available</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* WHY US */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">{t.why.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {t.why.items.map((item, i) => (
                            <div key={i} className="glass p-8 rounded-3xl text-center hover:glass-gold transition group">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-gold">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-black/20 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">{t.pricing.title}</h2>
                        <p className="text-gray-400">{t.pricing.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Monthly */}
                        <div className="glass p-8 rounded-3xl hover:glass-strong transition">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-300 mb-4">{t.pricing.monthly}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black text-white">$79</span>
                                    <span className="text-gray-500">{t.pricing.perMonth}</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {t.pricing.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <span className="text-green-400">✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href={tgLink} target="_blank" className="block w-full text-center glass-strong py-3 rounded-xl font-bold hover:bg-white/10 transition">
                                {t.pricing.cta}
                            </a>
                        </div>

                        {/* Quarterly (Featured) */}
                        <div className="glass-gold p-8 rounded-3xl relative border-2 border-gold/50 transform md:scale-105">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black px-4 py-1 rounded-full text-xs font-bold">
                                {t.pricing.bestValue}
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gold mb-4">{t.pricing.quarterly}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black text-white">$179</span>
                                    <span className="text-gray-400">{t.pricing.per3Months}</span>
                                </div>
                                <p className="text-sm text-green-400 mt-2">{t.pricing.save} $58</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {t.pricing.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-200">
                                        <span className="text-gold">✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href={tgLink} target="_blank" className="block w-full text-center btn-premium py-3 rounded-xl">
                                {t.pricing.cta}
                            </a>
                        </div>

                        {/* Yearly */}
                        <div className="glass p-8 rounded-3xl hover:glass-strong transition">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-300 mb-4">{t.pricing.yearly}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black text-white">$479</span>
                                    <span className="text-gray-500">{t.pricing.perYear}</span>
                                </div>
                                <p className="text-sm text-green-400 mt-2">{t.pricing.save} $469</p>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {t.pricing.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        <span className="text-green-400">✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href={tgLink} target="_blank" className="block w-full text-center glass-strong py-3 rounded-xl font-bold hover:bg-white/10 transition">
                                {t.pricing.cta}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-10 px-4 text-center">
                <p className="text-gray-500 text-sm mb-2">© {year} {t.brand}. {t.footer.copy}</p>
                <p className="text-gray-600 text-xs">{t.footer.disclaimer}</p>
            </footer>

            <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        </div>
    );
}
