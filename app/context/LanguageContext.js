'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, arabicTestimonials, englishTestimonials, arabicFAQ, englishFAQ } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('ar');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 1. Check LocalStorage
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang) {
            setLang(savedLang);
        } else {
            // 2. Check Browser Language
            const browserLang = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage) : 'en';
            if (browserLang.startsWith('ar')) {
                setLang('ar');
            } else {
                setLang('en');
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            localStorage.setItem('preferred-language', lang);
        }
    }, [lang, mounted]);

    const toggleLang = () => {
        setLang(prev => prev === 'ar' ? 'en' : 'ar');
    };

    const t = translations[lang] || translations['en'];
    const testimonials = lang === 'ar' ? arabicTestimonials : englishTestimonials;
    const faqs = lang === 'ar' ? arabicFAQ : englishFAQ;
    const isRTL = lang === 'ar';

    // Prevent hydration mismatch by not rendering until mounted? 
    // No, standard practice is to render with default and update.
    // However, for RTL/LTR changes, it might cause layout shift.
    // We suppressHydrationWarning in layout.js already.

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, testimonials, faqs, isRTL, mounted }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
