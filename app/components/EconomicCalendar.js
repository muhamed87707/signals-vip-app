'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const containerRef = useRef();
    const { lang } = useLanguage();

    useEffect(() => {
        // Clean up previous widget if any
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
        script.async = true;

        // Widget configuration
        const config = {
            "colorTheme": "dark",
            "isTransparent": true,
            "width": "100%",
            "height": "600",
            "locale": lang === 'ar' ? 'ar' : 'en',
            "importanceFilter": "-1,0,1",
            "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF"
        };

        script.innerHTML = JSON.stringify(config);

        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [lang]);

    return (
        <div className="economic-calendar-wrapper animate-fade-in-up">
            <div className="tradingview-widget-container" ref={containerRef}>
                <div className="tradingview-widget-container__widget"></div>
            </div>
        </div>
    );
}
