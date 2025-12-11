'use client';

import { useState, useEffect } from 'react';

// ===== Translation Dictionary =====
const translations = {
    en: {
        // Header
        brand: 'Abu Al-Dahab',
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
        subscribe: 'Subscribe Now',
        feature_signals: 'Unlimited trading signals',
        feature_support: 'Priority support',
        feature_analysis: 'Detailed market analysis',
        feature_community: 'VIP community access',
        feature_education: 'Educational resources',

        // Footer
        footerText: 'All Rights Reserved',
    },
    ar: {
        // Header
        brand: 'أبو الذهب',
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
        subscribe: 'اشترك الآن',
        feature_signals: 'توصيات تداول غير محدودة',
        feature_support: 'دعم ذو أولوية',
        feature_analysis: 'تحليل مفصل للسوق',
        feature_community: 'وصول لمجتمع VIP',
        feature_education: 'موارد تعليمية',

        // Footer
        footerText: 'جميع الحقوق محفوظة',
    }
};

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
                                $79<span>{t.perMonth}</span>
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
                        <div className="pricing-card featured">
                            <span className="pricing-badge">{t.popular}</span>
                            <p className="pricing-duration">{t.quarterly}</p>
                            <h3 className="pricing-title">{t.quarterly}</h3>
                            <div className="pricing-price">
                                $179<span>{t.perQuarter}</span>
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

                        {/* Yearly Plan */}
                        <div className="pricing-card">
                            <span className="pricing-badge">{t.bestValue}</span>
                            <p className="pricing-duration">{t.yearly}</p>
                            <h3 className="pricing-title">{t.yearly}</h3>
                            <div className="pricing-price">
                                $479<span>{t.perYear}</span>
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
