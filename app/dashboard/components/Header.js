'use client';

import { useState, useEffect } from 'react';

/**
 * Dashboard Header Component
 * Contains Logo, Navigation, and Global Market Status Ticker
 */

// Market Status Ticker Data (Placeholder)
const tickerData = [
    { symbol: 'XAU/USD', price: '2,648.50', change: '+0.45%', type: 'positive' },
    { symbol: 'DXY', price: '104.25', change: '-0.12%', type: 'negative' },
    { symbol: 'US10Y', price: '4.52%', change: '+0.03', type: 'positive' },
    { symbol: 'EUR/USD', price: '1.0485', change: '+0.08%', type: 'positive' },
    { symbol: 'GBP/USD', price: '1.2545', change: '-0.15%', type: 'negative' },
    { symbol: 'BTC/USD', price: '43,250', change: '+2.35%', type: 'positive' },
    { symbol: 'S&P 500', price: '4,768', change: '+0.28%', type: 'positive' },
    { symbol: 'VIX', price: '12.45', change: '-3.2%', type: 'negative' },
];

// Logo Component
const Logo = () => (
    <div className="flex items-center gap-3">
        <div className="relative">
            {/* Gold Ring */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-amber-500 font-bold text-lg">G</span>
                </div>
            </div>
            {/* Pulse Effect */}
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
        </div>
        <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight">Gold Intel</span>
            <span className="text-slate-500 text-[10px] uppercase tracking-widest">Market Intelligence</span>
        </div>
    </div>
);

// Market Status Indicator
const MarketStatus = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-400">
                Markets {isOpen ? 'Open' : 'Closed'}
            </span>
        </div>
    );
};

// Ticker Item Component
const TickerItem = ({ symbol, price, change, type }) => (
    <div className="flex items-center gap-3 px-4 whitespace-nowrap">
        <span className="text-slate-400 text-sm font-medium">{symbol}</span>
        <span className="text-white font-mono text-sm">{price}</span>
        <span className={`text-xs font-medium ${type === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
            {change}
        </span>
    </div>
);

// Scrolling Ticker Component
const MarketTicker = () => {
    return (
        <div className="relative overflow-hidden flex-1 mx-6">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10" />

            {/* Scrolling Content */}
            <div className="flex animate-scroll-left">
                {[...tickerData, ...tickerData].map((item, index) => (
                    <TickerItem key={index} {...item} />
                ))}
            </div>
        </div>
    );
};

// Time Display
const TimeDisplay = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-end">
            <span className="text-white font-mono text-sm">
                {time.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="text-slate-500 text-[10px] uppercase">
                {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
        </div>
    );
};

export default function Header() {
    return (
        <header className="relative z-50">
            {/* Main Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <Logo />

                <div className="hidden lg:flex items-center gap-6">
                    <MarketStatus />
                    <TimeDisplay />
                </div>
            </div>

            {/* Ticker Bar */}
            <div className="flex items-center h-10 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/30">
                <div className="flex items-center px-4 border-r border-slate-800/50">
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Live</span>
                </div>
                <MarketTicker />
            </div>
        </header>
    );
}
