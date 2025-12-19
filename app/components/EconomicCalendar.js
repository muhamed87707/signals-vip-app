'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function EconomicCalendar() {
    const containerRef = useRef();
    const { lang, mounted } = useLanguage();

    useEffect(() => {
        if (!mounted) return;

        // Clean up previous widget
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
        script.async = true;

        const config = {
            "colorTheme": "dark",
            "isTransparent": true,
            "width": "100%",
            "height": "650",
            "locale": lang === 'ar' ? 'ar' : 'en',
            "importanceFilter": "1", // High Impact Only (Intensity 3 in TV terms)
            "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF" // Gold is influenced by these
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
    }, [lang, mounted]);

    if (!mounted) return <div style={{ height: '650px' }}></div>;

    return (
        <div className="economic-calendar-wrapper animate-fade-in-up">
            <div className="tradingview-widget-container" ref={containerRef}>
                <div className="tradingview-widget-container__widget"></div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5 }}>
                Real-time premium data provided by TradingView
            </p>
        </div>
    );
}
