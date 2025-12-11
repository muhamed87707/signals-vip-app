'use client';

import { useState, useEffect } from 'react';

// ===== Translations =====
const translations = {
    en: {
        brand: 'Abu Al-Dahab Est.',
        langSwitch: 'العربية',
        badge: '✨ Premium Trading Signals',
        heroTitle: 'Master the Markets with',
        heroTitleHighlight: 'Golden Precision',
        heroSubtitle: 'Join an elite community of traders receiving accurate Gold & Forex signals. Make informed decisions, maximize profits, and trade with confidence.',
        ctaButton: 'Start Trading Now',
        loginButton: 'VIP Login',
        featuresTitle: 'Why Choose Us?',
        featuresSubtitle: 'We deliver precision, speed, and results that speak for themselves',
        feature1Title: 'High Accuracy Signals',
        feature1Desc: 'Our signals are carefully analyzed by expert traders with years of experience in the Gold and Forex markets.',
        feature2Title: 'Expert Analysis',
        feature2Desc: 'Each signal comes with detailed technical analysis explaining entry points, stop loss, and take profit levels.',
        feature3Title: '24/7 Support',
        feature3Desc: 'Our dedicated team is here round the clock to answer your questions and guide your trading journey.',
        testimonialsTitle: 'What Our Traders Say',
        testimonialsSubtitle: 'Real feedback from our VIP community members',
        pricingTitle: 'Choose Your Plan',
        pricingSubtitle: 'Simple, transparent pricing with no hidden fees',
        monthly: 'Monthly',
        quarterly: '3 Months',
        yearly: 'Yearly',
        perMonth: '/month',
        perQuarter: '/3 months',
        perYear: '/year',
        popular: 'Most Popular',
        bestValue: 'Best Value',
        youSave: 'You Save',
        subscribe: 'Subscribe Now',
        feature_signals: 'Unlimited trading signals',
        feature_support: 'Priority support',
        feature_analysis: 'Detailed market analysis',
        feature_community: 'VIP community access',
        feature_education: 'Educational resources',
        originalPrice: 'Instead of',
        loginTitle: 'VIP Member Login',
        loginSubtitle: 'Sign in to access your signals',
        continueWithTelegram: 'Continue with Telegram',
        continueWithGoogle: 'Continue with Google',
        disclaimerTitle: '⚠️ Risk Disclaimer',
        disclaimerText: 'Trading in financial markets involves substantial risk and may not be suitable for all investors. Past performance is not indicative of future results. You should carefully consider your investment objectives, level of experience, and risk appetite before trading. Never invest money you cannot afford to lose. The signals provided are for educational purposes only and do not constitute financial advice.',
        footerText: 'All Rights Reserved',
    },
    ar: {
        brand: 'مؤسسة أبو الذهب',
        langSwitch: 'English',
        badge: '✨ توصيات تداول حصرية',
        heroTitle: 'أتقن الأسواق مع',
        heroTitleHighlight: 'دقة ذهبية',
        heroSubtitle: 'انضم إلى مجتمع نخبة من المتداولين الذين يتلقون توصيات دقيقة للذهب والفوركس. اتخذ قرارات واعية، ضاعف أرباحك، وتداول بثقة.',
        ctaButton: 'ابدأ التداول الآن',
        loginButton: 'تسجيل دخول VIP',
        featuresTitle: 'لماذا تختارنا؟',
        featuresSubtitle: 'نقدم الدقة والسرعة ونتائج تتحدث عن نفسها',
        feature1Title: 'توصيات عالية الدقة',
        feature1Desc: 'يتم تحليل توصياتنا بعناية من قبل متداولين خبراء لديهم سنوات من الخبرة في أسواق الذهب والفوركس.',
        feature2Title: 'تحليل الخبراء',
        feature2Desc: 'كل توصية تأتي مع تحليل فني مفصل يشرح نقاط الدخول ووقف الخسارة وجني الأرباح.',
        feature3Title: 'دعم على مدار الساعة',
        feature3Desc: 'فريقنا المتخصص موجود على مدار الساعة للإجابة على أسئلتك وتوجيه رحلتك في التداول.',
        testimonialsTitle: 'ماذا يقول متداولونا',
        testimonialsSubtitle: 'آراء حقيقية من أعضاء مجتمعنا المميز',
        pricingTitle: 'اختر خطتك',
        pricingSubtitle: 'أسعار بسيطة وشفافة بدون رسوم مخفية',
        monthly: 'شهري',
        quarterly: '3 أشهر',
        yearly: 'سنوي',
        perMonth: '/شهر',
        perQuarter: '/3 أشهر',
        perYear: '/سنة',
        popular: 'الأكثر شعبية',
        bestValue: 'أفضل قيمة',
        youSave: 'توفر',
        subscribe: 'اشترك الآن',
        feature_signals: 'توصيات تداول غير محدودة',
        feature_support: 'دعم ذو أولوية',
        feature_analysis: 'تحليل مفصل للسوق',
        feature_community: 'وصول لمجتمع VIP',
        feature_education: 'موارد تعليمية',
        originalPrice: 'بدلاً من',
        loginTitle: 'تسجيل دخول الأعضاء',
        loginSubtitle: 'سجل دخولك للوصول إلى التوصيات',
        continueWithTelegram: 'المتابعة عبر تليجرام',
        continueWithGoogle: 'المتابعة عبر جوجل',
        disclaimerTitle: '⚠️ إخلاء المسؤولية',
        disclaimerText: 'التداول في الأسواق المالية ينطوي على مخاطر كبيرة وقد لا يكون مناسباً لجميع المستثمرين. الأداء السابق لا يضمن النتائج المستقبلية. يجب أن تدرس بعناية أهدافك الاستثمارية ومستوى خبرتك ومدى تحملك للمخاطر قبل التداول. لا تستثمر أبداً أموالاً لا يمكنك تحمل خسارتها. التوصيات المقدمة هي لأغراض تعليمية فقط ولا تمثل نصيحة مالية.',
        footerText: 'جميع الحقوق محفوظة',
    }
};

// ===== Testimonials =====
const arabicTestimonials = [
    { name: 'أحمد الشمري', title: 'متداول منذ سنتين', text: 'توصيات دقيقة جداً ونتائج ممتازة. حققت أرباحاً ممتازة خلال شهرين فقط.', initial: 'أ' },
    { name: 'محمد العتيبي', title: 'مستثمر في الذهب', text: 'أفضل خدمة توصيات جربتها. الدعم الفني سريع والتحليلات مفصلة ومفيدة.', initial: 'م' },
    { name: 'خالد السيد', title: 'متداول فوركس', text: 'التوصيات تصلني في الوقت المناسب. نسبة النجاح عالية جداً وأنا سعيد بالنتائج.', initial: 'خ' },
    { name: 'عبدالله الحربي', title: 'متداول محترف', text: 'بعد تجربة عدة خدمات، هذه الأفضل بلا منازع. التحليلات عميقة والنتائج مبهرة.', initial: 'ع' },
    { name: 'سعود المالكي', title: 'مستثمر مبتدئ', text: 'كنت مبتدئاً ولكن أصبحت أفهم السوق بشكل أفضل. شكراً جزيلاً!', initial: 'س' },
    { name: 'فهد القحطاني', title: 'متداول ذهب', text: 'دقة التوصيات مذهلة! أحقق أرباح ثابتة شهرياً والدعم متاح دائماً.', initial: 'ف' }
];

const englishTestimonials = [
    { name: 'James Mitchell', title: 'Professional Trader', text: 'Incredibly accurate signals. My portfolio has grown significantly since joining. Highly recommended!', initial: 'J' },
    { name: 'Michael Thompson', title: 'Gold Investor', text: 'The best signal service I have ever used. Exceptional support and top-notch analysis.', initial: 'M' },
    { name: 'David Anderson', title: 'Forex Trader', text: 'Signals are always on time with an impressive success rate. Couldnt be happier!', initial: 'D' },
    { name: 'Robert Williams', title: 'Part-time Trader', text: 'Perfect for a busy schedule. I follow the signals and results speak for themselves.', initial: 'R' },
    { name: 'Chris Johnson', title: 'Beginner Trader', text: 'Started with zero experience. The resources helped me understand the market quickly.', initial: 'C' },
    { name: 'Daniel Brown', title: 'Investment Analyst', text: 'As a professional, I appreciate the depth of analysis. Consistently profitable signals.', initial: 'D' }
];

// ===== Components =====
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
    </svg>
);

const LoginModal = ({ isOpen, onClose, t, isRTL }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={onClose}>
            <div className="bg-[#0f0f18] border border-[rgba(184,134,11,0.3)] rounded-3xl p-8 max-w-md w-full relative"
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
    const [lang, setLang] = useState('en');
    const [mounted, setMounted] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const t = translations[lang];
    const isRTL = lang === 'ar';
    const currentYear = new Date().getFullYear();
    const testimonials = lang === 'ar' ? arabicTestimonials : englishTestimonials;

    const monthlyPrice = 79;
    const quarterlyPrice = 179;
    const yearlyPrice = 479;
    const quarterlyOriginal = monthlyPrice * 3;
    const yearlyOriginal = monthlyPrice * 12;
    const quarterlySavings = quarterlyOriginal - quarterlyPrice;
    const yearlySavings = yearlyOriginal - yearlyPrice;

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            setLang(savedLang);
            return;
        }
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ar')) setLang('ar');
    }, []);

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setLang(newLang);
        localStorage.setItem('preferred-language', newLang);
    };

    useEffect(() => {
        if (mounted) {
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }
    }, [lang, isRTL, mounted]);

    if (!mounted) return null;

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} t={t} isRTL={isRTL} />

            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <a href="/" className="logo">
                        <span className="logo-icon">💎</span>
                        <span>{t.brand}</span>
                    </a>
                    <button onClick={toggleLang} className="lang-toggle">🌐 {t.langSwitch}</button>
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
                        <div className="hero-buttons animate-fade-in-up delay-300">
                            <a href="#pricing" className="btn-primary">{t.ctaButton} →</a>
                            <button onClick={() => setShowLoginModal(true)} className="btn-secondary">🔐 {t.loginButton}</button>
                        </div>
                    </div>
                </div>
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
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">{t.feature1Title}</h3>
                            <p className="feature-desc">{t.feature1Desc}</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="feature-title">{t.feature2Title}</h3>
                            <p className="feature-desc">{t.feature2Desc}</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon">💬</div>
                            <h3 className="feature-title">{t.feature3Title}</h3>
                            <p className="feature-desc">{t.feature3Desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Stars next to name */}
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
                            <a href="https://t.me/your_bot" className="btn-primary" style={{ width: '100%' }}>{t.subscribe}</a>
                        </div>
                        {/* Quarterly */}
                        <div className="pricing-card">
                            <span className="pricing-badge">{t.bestValue}</span>
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
                            <a href="https://t.me/your_bot" className="btn-primary" style={{ width: '100%' }}>{t.subscribe}</a>
                        </div>
                        {/* Yearly - Most Popular */}
                        <div className="pricing-card featured">
                            <span className="pricing-badge">{t.popular}</span>
                            <h3 className="pricing-title">{t.yearly}</h3>
                            <div className="pricing-price">${yearlyPrice}<span>{t.perYear}</span></div>
                            <p className="pricing-original">{t.originalPrice} ${yearlyOriginal}</p>
                            <div className="pricing-savings">✓ {t.youSave} ${yearlySavings}</div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                                <li><CheckIcon /> {t.feature_community}</li>
                                <li><CheckIcon /> {t.feature_education}</li>
                            </ul>
                            <a href="https://t.me/your_bot" className="btn-primary" style={{ width: '100%' }}>{t.subscribe}</a>
                        </div>
                    </div>
                </div>
            </section>

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
                <div className="container footer-content">
                    <p>© {currentYear} <span className="footer-brand">{t.brand}</span>. {t.footerText}</p>
                </div>
            </footer>
        </div>
    );
}
