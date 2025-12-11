'use client';
import { useState, useEffect } from 'react';
import { getTranslation } from '@/lib/translations';

export function useLanguage() {
    const [lang, setLang] = useState('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check localStorage first
        const savedLang = localStorage.getItem('preferred_language');

        if (savedLang) {
            setLang(savedLang);
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            const detectedLang = browserLang.startsWith('ar') ? 'ar' : 'en';
            setLang(detectedLang);
            localStorage.setItem('preferred_language', detectedLang);
        }

        setIsLoaded(true);
    }, []);

    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setLang(newLang);
        localStorage.setItem('preferred_language', newLang);
    };

    const t = (key) => getTranslation(lang, key);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return { lang, setLang, toggleLanguage, t, dir, isLoaded };
}
