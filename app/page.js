'use client';
import { useEffect, useState } from 'react';

const translations = {
    en: {
        dir: 'ltr',
        nav: {
            brand: 'Abu Al-Dahab',
            joinNow: 'Join Now',
        },
        hero: {
            badge: '🏆 Premium Trading Signals',
            title1: 'Trade Gold Like',
            title2: 'A Professional',
            description: 'Get accurate trading signals for Gold & Forex delivered directly to your Telegram. Join our VIP community and start your journey to financial freedom.',
            cta: 'Join Telegram Channel',
            ctaSecondary: 'View Pricing',
        },
        features: {
            title: 'Why Choose Us?',
            subtitle: 'Professional signals with proven results',
            items: [
                { icon: '🎯', title: 'High Accuracy', desc: 'Carefully analyzed signals with high win rate' },
                { icon: '⚡', title: 'Instant Alerts', desc: 'Real-time notifications via Telegram' },
                { icon: '📊', title: 'Technical Analysis', desc: 'Daily market analysis and insights' },
                { icon: '🛡️', title: 'Risk Management', desc: 'Clear entry, SL, and TP levels' },
                { icon: '💎', title: 'VIP Support', desc: '24/7 personal support for members' },
                { icon: '📈', title: 'Proven Results', desc: 'Verified track record of success' },
            ],
        },
        pricing: {
            title: 'Membership Plans',
            subtitle: 'Choose the plan that works for you',
            monthly: 'Monthly',
            quarterly: '3 Months',
            yearly: 'Yearly',
            perMonth: '/month',
            perQuarter: '/3 months',
            perYear: '/year',
            savings: 'Save',
            features: ['Daily VIP Signals', 'Entry, SL & TP Levels', 'Market Analysis', '24/7 Support'],
            popular: 'Most Popular',
            subscribe: 'Subscribe Now',
        },
        testimonials: {
            title: 'What Our Members Say',
            items: [
                { name: 'Ahmed K.', role: 'VIP Member', text: 'The accuracy of signals is incredible. Made consistent profits since joining.' },
                { name: 'Sarah M.', role: 'VIP Member', text: 'Best investment I made. The support team is always there to help.' },
                { name: 'Mohammed R.', role: 'VIP Member', text: 'Professional signals with clear instructions. Highly recommended!' },
            ],
        },
        cta: {
            title: 'Ready to Start Trading?',
            subtitle: 'Join thousands of successful traders today',
            button: 'Join Telegram Channel',
        },
        footer: {
            rights: 'All rights reserved.',
            disclaimer: '⚠️ Trading involves significant risk. Past performance does not guarantee future results. Trade responsibly.',
        },
    },
    ar: {
        dir: 'rtl',
        nav: {
            brand: 'مؤسسة ابو الذهب',
            joinNow: 'انضم الآن',
        },
        hero: {
            badge: '🏆 توصيات تداول احترافية',
            title1: 'تداول الذهب',
            title2: 'كالمحترفين',
            description: 'احصل على توصيات تداول دقيقة للذهب والفوركس مباشرة على تليجرام. انضم لمجتمع VIP وابدأ رحلتك نحو الحرية المالية.',
            cta: 'انضم لقناة التليجرام',
            ctaSecondary: 'عرض الأسعار',
        },
        features: {
            title: 'لماذا نحن؟',
            subtitle: 'توصيات احترافية بنتائج مثبتة',
            items: [
                { icon: '🎯', title: 'دقة عالية', desc: 'توصيات مدروسة بنسبة نجاح عالية' },
                { icon: '⚡', title: 'تنبيهات فورية', desc: 'إشعارات لحظية عبر تليجرام' },
                { icon: '📊', title: 'تحليل فني', desc: 'تحليلات يومية شاملة للسوق' },
                { icon: '🛡️', title: 'إدارة مخاطر', desc: 'نقاط دخول وخروج واضحة' },
                { icon: '💎', title: 'دعم VIP', desc: 'دعم شخصي على مدار الساعة' },
                { icon: '📈', title: 'نتائج موثقة', desc: 'سجل مثبت من النجاحات' },
            ],
        },
        pricing: {
            title: 'خطط العضوية',
            subtitle: 'اختر الخطة المناسبة لك',
            monthly: 'شهري',
            quarterly: '3 أشهر',
            yearly: 'سنوي',
            perMonth: '/شهر',
            perQuarter: '/3 أشهر',
            perYear: '/سنة',
            savings: 'وفر',
            features: ['توصيات VIP يومية', 'نقاط الدخول والخروج', 'تحليل السوق', 'دعم 24/7'],
            popular: 'الأكثر طلباً',
            subscribe: 'اشترك الآن',
        },
        testimonials: {
            title: 'ماذا يقول أعضاؤنا',
            items: [
                { name: 'أحمد ك.', role: 'عضو VIP', text: 'دقة التوصيات مذهلة. حققت أرباحاً مستمرة منذ انضمامي.' },
                { name: 'سارة م.', role: 'عضو VIP', text: 'أفضل استثمار قمت به. فريق الدعم دائماً موجود للمساعدة.' },
                { name: 'محمد ر.', role: 'عضو VIP', text: 'توصيات احترافية بتعليمات واضحة. أنصح بها بشدة!' },
            ],
        },
        cta: {
            title: 'مستعد لبدء التداول؟',
            subtitle: 'انضم لآلاف المتداولين الناجحين اليوم',
            button: 'انضم لقناة التليجرام',
        },
        footer: {
            rights: 'جميع الحقوق محفوظة.',
            disclaimer: '⚠️ التداول ينطوي على مخاطر كبيرة. الأداء السابق لا يضمن النتائج المستقبلية. تداول بمسؤولية.',
        },
    },
};

export default function Home() {
    const [lang, setLang] = useState('en');
    const [isVisible, setIsVisible] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const t = translations[lang];
    const telegramLink = "https://t.me/Abou_AlDahab";
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ar')) {
            setLang('ar');
        } else {
            setLang('en');
        }
        setIsVisible(true);

        // Auto-rotate testimonials
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleLang = () => {
        setLang(lang === 'ar' ? 'en' : 'ar');
    };

    const plans = [
        { name: t.pricing.monthly, price: 79, period: t.pricing.perMonth, duration: 'monthly', popular: false },
        { name: t.pricing.quarterly, price: 179, period: t.pricing.perQuarter, duration: 'quarterly', popular: true, save: 58 },
        { name: t.pricing.yearly, price: 479, period: t.pricing.perYear, duration: 'yearly', popular: false, save: 469 },
    ];

    return (
        <div dir={t.dir} className={`min-h-screen bg-[#050510] text-white overflow-x-hidden ${t.dir === 'rtl' ? 'font-arabic' : ''}`}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="orb orb-gold w-[600px] h-[600px] -top-40 -right-40 animate-float"></div>
                <div className="orb orb-purple w-[500px] h-[500px] top-1/2 -left-60 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="orb orb-gold w-[400px] h-[400px] bottom-20 right-1/4 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <h1 className="text-xl md:text-2xl font-bold gold-text">{t.nav.brand}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLang}
                            className="lang-toggle px-3 py-2 rounded-lg border border-white/10 text-sm font-medium hover:border-[#D4AF37]/50"
                        >
                            {lang === 'ar' ? 'EN' : 'عربي'}
                        </button>
                        <a
                            href={telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gold-button px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base"
                        >
                            {t.nav.joinNow}
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
                <div className={`relative z-10 text-center max-w-5xl mx-auto ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
                    {/* Badge */}
                    <div className="inline-block mb-8 px-5 py-2.5 glass-gold rounded-full">
                        <span className="text-[#FFD700] text-sm md:text-base font-medium">{t.hero.badge}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                        {t.hero.title1}
                        <br />
                        <span className="gold-text">{t.hero.title2}</span>
                    </h1>

                    {/* Description */}
                    <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                        {t.hero.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href={telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gold-button animate-pulse-glow px-8 py-4 rounded-full text-lg font-bold flex items-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.152-1.359 5.51-.168.574-.336.766-.551.785-.466.042-.82-.308-1.27-.603-.705-.462-1.103-.75-1.787-1.2-.792-.522-.279-.808.173-1.276.118-.123 2.18-1.998 2.22-2.169.005-.021.01-.1-.037-.142-.047-.042-.116-.027-.166-.016-.07.016-1.19.756-3.359 2.22-.318.218-.606.324-.863.318-.284-.006-.831-.16-1.238-.292-.499-.163-.896-.249-.861-.526.018-.144.216-.292.593-.443 2.325-.964 3.876-1.6 4.653-1.906 2.216-.872 2.676-.823 2.975-.78.066.01.213.022.308.138.08.097.102.225.113.315.012.09.026.295-.015.455z" />
                            </svg>
                            {t.hero.cta}
                        </a>
                        <a
                            href="#pricing"
                            className="px-8 py-4 rounded-full text-lg font-bold glass border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                        >
                            {t.hero.ctaSecondary}
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-6 h-10 border-2 border-[#D4AF37]/40 rounded-full flex justify-center p-2">
                        <div className="w-1 h-2 bg-[#D4AF37] rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="gold-text">{t.features.title}</span>
                        </h2>
                        <p className="text-gray-400 text-lg">{t.features.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {t.features.items.map((feature, index) => (
                            <div
                                key={index}
                                className="glass p-6 rounded-2xl hover:border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-2 group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-[#FFD700]">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="gold-text">{t.pricing.title}</span>
                        </h2>
                        <p className="text-gray-400 text-lg">{t.pricing.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`pricing-card glass rounded-3xl p-8 relative ${plan.popular ? 'popular md:scale-105' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
                                        ⭐ {t.pricing.popular}
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold mb-4 text-white">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-5xl font-bold gold-text">${plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </div>
                                    {plan.save && (
                                        <div className="mt-2 text-green-400 text-sm font-medium">
                                            {t.pricing.savings} ${plan.save}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {t.pricing.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-center gap-3 text-gray-300">
                                            <span className="text-[#D4AF37] text-lg">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={telegramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block text-center py-4 rounded-xl font-bold transition-all ${plan.popular
                                            ? 'gold-button'
                                            : 'glass border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                                        }`}
                                >
                                    {t.pricing.subscribe}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-4 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold">
                            <span className="gold-text">{t.testimonials.title}</span>
                        </h2>
                    </div>

                    <div className="glass-strong rounded-3xl p-8 md:p-12 text-center">
                        <div className="text-6xl mb-6">💬</div>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed italic">
                            "{t.testimonials.items[currentTestimonial].text}"
                        </p>
                        <div className="text-[#FFD700] font-bold text-lg">{t.testimonials.items[currentTestimonial].name}</div>
                        <div className="text-gray-500 text-sm">{t.testimonials.items[currentTestimonial].role}</div>

                        {/* Dots */}
                        <div className="flex justify-center gap-3 mt-8">
                            {t.testimonials.items.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-[#D4AF37] w-8' : 'bg-gray-600 hover:bg-gray-500'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-gold rounded-3xl p-12 md:p-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            <span className="gold-text">{t.cta.title}</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-10">
                            {t.cta.subtitle}
                        </p>
                        <a
                            href={telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gold-button animate-pulse-glow inline-flex items-center gap-3 px-10 py-5 rounded-full text-xl font-bold"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.152-1.359 5.51-.168.574-.336.766-.551.785-.466.042-.82-.308-1.27-.603-.705-.462-1.103-.75-1.787-1.2-.792-.522-.279-.808.173-1.276.118-.123 2.18-1.998 2.22-2.169.005-.021.01-.1-.037-.142-.047-.042-.116-.027-.166-.016-.07.016-1.19.756-3.359 2.22-.318.218-.606.324-.863.318-.284-.006-.831-.16-1.238-.292-.499-.163-.896-.249-.861-.526.018-.144.216-.292.593-.443 2.325-.964 3.876-1.6 4.653-1.906 2.216-.872 2.676-.823 2.975-.78.066.01.213.022.308.138.08.097.102.225.113.315.012.09.026.295-.015.455z" />
                            </svg>
                            {t.cta.button}
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-4 border-t border-white/5 glass">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <span className="text-xl font-bold gold-text">{t.nav.brand}</span>
                        </div>

                        <div className="text-gray-500 text-sm">
                            © {currentYear} {t.nav.brand}. {t.footer.rights}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 text-center text-gray-600 text-xs leading-relaxed max-w-3xl mx-auto">
                        <p>{t.footer.disclaimer}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
