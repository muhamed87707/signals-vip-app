'use client';

import { useState, useEffect } from 'react';

// ===== Translation Dictionary =====
const translations = {
    en: {
        // Header
        brand: 'Abu Al-Dahab Est.',
        langSwitch: 'العربية',

        // Hero
        badge: '✨ Premium Trading Signals',
        heroTitle: 'Master the Markets with',
        heroTitleHighlight: 'Golden Precision',
        heroSubtitle: 'Join an elite community of traders receiving accurate Gold & Forex signals. Make informed decisions, maximize profits, and trade with confidence.',
        ctaButton: 'Start Trading Now',

        // Features
        featuresTitle: 'Why Choose Us?',
        featuresSubtitle: 'We deliver precision, speed, and results that speak for themselves',
        feature1Title: 'High Accuracy Signals',
        feature1Desc: 'Our signals are carefully analyzed by expert traders with years of experience in the Gold and Forex markets.',
        feature2Title: 'Real-Time Alerts',
        feature2Desc: 'Receive instant notifications directly to your Telegram. Never miss a profitable opportunity again.',
        feature3Title: 'Expert Analysis',
        feature3Desc: 'Each signal comes with detailed technical analysis explaining entry points, stop loss, and take profit levels.',
        feature4Title: '24/7 Support',
        feature4Desc: 'Our dedicated team is here round the clock to answer your questions and guide your trading journey.',

        // Testimonials
        testimonialsTitle: 'What Our Traders Say',
        testimonialsSubtitle: 'Real feedback from our VIP community members',

        // Pricing
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
        save: 'Save',
        subscribe: 'Subscribe Now',
        feature_signals: 'Unlimited trading signals',
        feature_support: 'Priority support',
        feature_analysis: 'Detailed market analysis',
        feature_community: 'VIP community access',
        feature_education: 'Educational resources',
        originalPrice: 'Instead of',

        // Disclaimer
        disclaimerTitle: '⚠️ Risk Disclaimer',
        disclaimerText: 'Trading in financial markets involves substantial risk and may not be suitable for all investors. Past performance is not indicative of future results. You should carefully consider your investment objectives, level of experience, and risk appetite before trading. Never invest money you cannot afford to lose. The signals provided are for educational purposes only and do not constitute financial advice.',

        // Footer
        footerText: 'All Rights Reserved',
    },
    ar: {
        // Header
        brand: 'مؤسسة أبو الذهب',
        langSwitch: 'English',

        // Hero
        badge: '✨ توصيات تداول حصرية',
        heroTitle: 'أتقن الأسواق مع',
        heroTitleHighlight: 'دقة ذهبية',
        heroSubtitle: 'انضم إلى مجتمع نخبة من المتداولين الذين يتلقون توصيات دقيقة للذهب والفوركس. اتخذ قرارات واعية، ضاعف أرباحك، وتداول بثقة.',
        ctaButton: 'ابدأ التداول الآن',

        // Features
        featuresTitle: 'لماذا تختارنا؟',
        featuresSubtitle: 'نقدم الدقة والسرعة ونتائج تتحدث عن نفسها',
        feature1Title: 'توصيات عالية الدقة',
        feature1Desc: 'يتم تحليل توصياتنا بعناية من قبل متداولين خبراء لديهم سنوات من الخبرة في أسواق الذهب والفوركس.',
        feature2Title: 'تنبيهات فورية',
        feature2Desc: 'استلم إشعارات فورية مباشرة على تليجرام. لا تفوت أي فرصة مربحة بعد الآن.',
        feature3Title: 'تحليل الخبراء',
        feature3Desc: 'كل توصية تأتي مع تحليل فني مفصل يشرح نقاط الدخول ووقف الخسارة وجني الأرباح.',
        feature4Title: 'دعم على مدار الساعة',
        feature4Desc: 'فريقنا المتخصص موجود على مدار الساعة للإجابة على أسئلتك وتوجيه رحلتك في التداول.',

        // Testimonials
        testimonialsTitle: 'ماذا يقول متداولونا',
        testimonialsSubtitle: 'آراء حقيقية من أعضاء مجتمعنا المميز',

        // Pricing
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
        save: 'وفّر',
        subscribe: 'اشترك الآن',
        feature_signals: 'توصيات تداول غير محدودة',
        feature_support: 'دعم ذو أولوية',
        feature_analysis: 'تحليل مفصل للسوق',
        feature_community: 'وصول لمجتمع VIP',
        feature_education: 'موارد تعليمية',
        originalPrice: 'بدلاً من',

        // Disclaimer
        disclaimerTitle: '⚠️ إخلاء المسؤولية',
        disclaimerText: 'التداول في الأسواق المالية ينطوي على مخاطر كبيرة وقد لا يكون مناسباً لجميع المستثمرين. الأداء السابق لا يضمن النتائج المستقبلية. يجب أن تدرس بعناية أهدافك الاستثمارية ومستوى خبرتك ومدى تحملك للمخاطر قبل التداول. لا تستثمر أبداً أموالاً لا يمكنك تحمل خسارتها. التوصيات المقدمة هي لأغراض تعليمية فقط ولا تمثل نصيحة مالية.',

        // Footer
        footerText: 'جميع الحقوق محفوظة',
    }
};

// ===== Testimonials Data =====
const testimonials = [
    {
        name: { ar: 'أحمد الشمري', en: 'Ahmed Al-Shammari' },
        title: { ar: 'متداول منذ سنتين', en: 'Trader for 2 years' },
        text: {
            ar: 'توصيات دقيقة جداً ونتائج ممتازة. حققت أرباحاً ممتازة خلال شهرين فقط. أنصح الجميع بالاشتراك.',
            en: 'Very accurate signals and excellent results. I made great profits in just two months. I recommend everyone to subscribe.'
        },
        initial: 'أ'
    },
    {
        name: { ar: 'محمد العتيبي', en: 'Mohammed Al-Otaibi' },
        title: { ar: 'مستثمر في الذهب', en: 'Gold Investor' },
        text: {
            ar: 'أفضل خدمة توصيات جربتها على الإطلاق. الدعم الفني سريع والتحليلات مفصلة ومفيدة جداً.',
            en: 'Best signal service I have ever tried. Technical support is fast and the analysis is detailed and very useful.'
        },
        initial: 'م'
    },
    {
        name: { ar: 'خالد السيد', en: 'Khaled El-Sayed' },
        title: { ar: 'متداول فوركس', en: 'Forex Trader' },
        text: {
            ar: 'التوصيات تصلني في الوقت المناسب دائماً. نسبة النجاح عالية جداً وأنا سعيد بالنتائج.',
            en: 'Signals always reach me at the right time. Success rate is very high and I am happy with the results.'
        },
        initial: 'خ'
    }
];

// ===== Check Icon Component =====
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
    </svg>
);

// ===== Main Page Component =====
export default function LandingPage() {
    const [lang, setLang] = useState('en');
    const [mounted, setMounted] = useState(false);

    const t = translations[lang];
    const isRTL = lang === 'ar';
    const currentYear = new Date().getFullYear();

    // Pricing calculations
    const monthlyPrice = 79;
    const quarterlyPrice = 179;
    const yearlyPrice = 479;
    const quarterlyOriginal = monthlyPrice * 3; // $237
    const yearlyOriginal = monthlyPrice * 12; // $948
    const quarterlySavings = quarterlyOriginal - quarterlyPrice; // $58
    const yearlySavings = yearlyOriginal - yearlyPrice; // $469
    const quarterlyDiscount = Math.round((quarterlySavings / quarterlyOriginal) * 100); // 24%
    const yearlyDiscount = Math.round((yearlySavings / yearlyOriginal) * 100); // 49%

    // Detect browser language on mount
    useEffect(() => {
        setMounted(true);

        // Check localStorage first
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            setLang(savedLang);
            return;
        }

        // Detect from browser
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ar')) {
            setLang('ar');
        }
    }, []);

    // Toggle language
    const toggleLang = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setLang(newLang);
        localStorage.setItem('preferred-language', newLang);
    };

    // Update document direction
    useEffect(() => {
        if (mounted) {
            document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }
    }, [lang, isRTL, mounted]);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ===== Header ===== */}
            <header className="header">
                <div className="container header-content">
                    <a href="/" className="logo">
                        <span className="logo-icon">💎</span>
                        <span>{t.brand}</span>
                    </a>
                    <button onClick={toggleLang} className="lang-toggle">
                        🌐 {t.langSwitch}
                    </button>
                </div>
            </header>

            {/* ===== Hero Section ===== */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-fade-in-up">
                            {t.badge}
                        </div>
                        <h1 className="hero-title animate-fade-in-up delay-100">
                            {t.heroTitle}
                            <br />
                            <span className="text-gradient">{t.heroTitleHighlight}</span>
                        </h1>
                        <p className="hero-subtitle animate-fade-in-up delay-200">
                            {t.heroSubtitle}
                        </p>
                        <a href="#pricing" className="btn-primary animate-fade-in-up delay-300">
                            {t.ctaButton} →
                        </a>
                    </div>
                </div>
            </section>

            {/* ===== Features Section ===== */}
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
                            <div className="feature-icon">⚡</div>
                            <h3 className="feature-title">{t.feature2Title}</h3>
                            <p className="feature-desc">{t.feature2Desc}</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="feature-title">{t.feature3Title}</h3>
                            <p className="feature-desc">{t.feature3Desc}</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon">💬</div>
                            <h3 className="feature-title">{t.feature4Title}</h3>
                            <p className="feature-desc">{t.feature4Desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Testimonials Section ===== */}
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
                                <div className="testimonial-stars">★★★★★</div>
                                <p className="testimonial-text">"{testimonial.text[lang]}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{testimonial.initial}</div>
                                    <div>
                                        <div className="testimonial-name">{testimonial.name[lang]}</div>
                                        <div className="testimonial-title">{testimonial.title[lang]}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Pricing Section ===== */}
            <section id="pricing" className="pricing">
                <div className="container">
                    <h2 className="section-title">
                        {t.pricingTitle.split(' ')[0]}{' '}
                        <span className="text-gradient">{t.pricingTitle.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="section-subtitle">{t.pricingSubtitle}</p>

                    <div className="pricing-grid">
                        {/* Monthly Plan */}
                        <div className="pricing-card">
                            <p className="pricing-duration">{t.monthly}</p>
                            <h3 className="pricing-title">{t.monthly}</h3>
                            <div className="pricing-price">
                                ${monthlyPrice}<span>{t.perMonth}</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                            </ul>
                            <a href="https://t.me/your_bot" className="btn-primary" style={{ width: '100%' }}>
                                {t.subscribe}
                            </a>
                        </div>

                        {/* Quarterly Plan */}
                        <div className="pricing-card">
                            <span className="pricing-badge">{t.bestValue}</span>
                            <p className="pricing-duration">{t.quarterly}</p>
                            <h3 className="pricing-title">{t.quarterly}</h3>
                            <p className="pricing-original">{t.originalPrice} ${quarterlyOriginal}</p>
                            <div className="pricing-price">
                                ${quarterlyPrice}<span>{t.perQuarter}</span>
                            </div>
                            <div className="pricing-discount">
                                {t.save} {quarterlyDiscount}% (${quarterlySavings})
                            </div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                                <li><CheckIcon /> {t.feature_community}</li>
                            </ul>
                            <a href="https://t.me/your_bot" className="btn-primary" style={{ width: '100%' }}>
                                {t.subscribe}
                            </a>
                        </div>

                        {/* Yearly Plan - Most Popular */}
                        <div className="pricing-card featured">
                            <span className="pricing-badge">{t.popular}</span>
                            <p className="pricing-duration">{t.yearly}</p>
                            <h3 className="pricing-title">{t.yearly}</h3>
                            <p className="pricing-original">{t.originalPrice} ${yearlyOriginal}</p>
                            <div className="pricing-price">
                                ${yearlyPrice}<span>{t.perYear}</span>
                            </div>
                            <div className="pricing-discount">
                                {t.save} {yearlyDiscount}% (${yearlySavings})
                            </div>
                            <ul className="pricing-features">
                                <li><CheckIcon /> {t.feature_signals}</li>
                                <li><CheckIcon /> {t.feature_analysis}</li>
                                <li><CheckIcon /> {t.feature_support}</li>
                                <li><CheckIcon /> {t.feature_community}</li>
                                <li><CheckIcon /> {t.feature_education}</li>
                            </ul>
                            <a href="https://t.me/your_bot" className="btn-primary" style={{ width: '100%' }}>
                                {t.subscribe}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Disclaimer Section ===== */}
            <section className="disclaimer">
                <div className="container">
                    <div className="disclaimer-content">
                        <p className="disclaimer-title">{t.disclaimerTitle}</p>
                        <p>{t.disclaimerText}</p>
                    </div>
                </div>
            </section>

            {/* ===== Footer ===== */}
            <footer className="footer">
                <div className="container footer-content">
                    <p>
                        © {currentYear} <span className="footer-brand">{t.brand}</span>. {t.footerText}
                    </p>
                </div>
            </footer>
        </div>
    );
}
