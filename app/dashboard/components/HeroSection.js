'use client';

import { useState, useEffect } from 'react';
import Card, { MetricValue, StatusBadge } from './Card';
import GoldPriceChart from './GoldPriceChart';
import { getCrossAssetData } from '../services/marketData';

/**
 * Hero Section - Gold Price Chart & Quick Sentiment
 * Main focal point of the dashboard with TradingView chart
 */

// Sentiment Gauge Component
const SentimentGauge = ({ sentiment = 65 }) => {
    // sentiment: 0-100, where 0 = extreme bearish, 50 = neutral, 100 = extreme bullish
    const getSentimentLabel = (value) => {
        if (value >= 80) return { label: 'Extreme Greed', color: 'text-emerald-400' };
        if (value >= 60) return { label: 'Bullish', color: 'text-emerald-400' };
        if (value >= 40) return { label: 'Neutral', color: 'text-slate-400' };
        if (value >= 20) return { label: 'Bearish', color: 'text-red-400' };
        return { label: 'Extreme Fear', color: 'text-red-400' };
    };

    const { label, color } = getSentimentLabel(sentiment);
    const rotation = (sentiment / 100) * 180 - 90; // -90 to 90 degrees

    return (
        <div className="flex flex-col items-center justify-center h-full py-4">
            {/* Gauge Visual */}
            <div className="relative w-40 h-20 mb-4">
                {/* Background Arc */}
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="25%" stopColor="#f97316" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="75%" stopColor="#84cc16" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                    {/* Background track */}
                    <path
                        d="M 10 45 A 35 35 0 0 1 90 45"
                        fill="none"
                        stroke="rgba(51, 65, 85, 0.5)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Colored arc */}
                    <path
                        d="M 10 45 A 35 35 0 0 1 90 45"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(sentiment / 100) * 110} 110`}
                    />
                </svg>

                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1 h-16 origin-bottom transition-transform duration-500"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                    <div className="w-full h-full bg-gradient-to-t from-white to-transparent rounded-full" />
                </div>

                {/* Center dot */}
                <div className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 translate-y-1/2 bg-slate-900 border-2 border-amber-500 rounded-full" />
            </div>

            {/* Labels */}
            <div className="flex justify-between w-full px-2 mb-4">
                <span className="text-[10px] text-red-400">Fear</span>
                <span className="text-[10px] text-slate-400">Neutral</span>
                <span className="text-[10px] text-emerald-400">Greed</span>
            </div>

            {/* Current Sentiment */}
            <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{sentiment}</div>
                <StatusBadge
                    status={sentiment >= 50 ? 'bullish' : 'bearish'}
                    label={label}
                />
            </div>

            {/* Indicator Sources */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 w-full">
                <p className="text-[10px] text-slate-500 text-center mb-2">Based on 12 indicators</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {[
                        { name: 'RSI', value: 62, bullish: true },
                        { name: 'MACD', value: 'Buy', bullish: true },
                        { name: 'MA Cross', value: 'Above', bullish: true },
                        { name: 'Volume', value: 'High', bullish: true },
                    ].map((indicator, i) => (
                        <div key={i} className="flex items-center justify-between px-2 py-1 bg-slate-800/30 rounded">
                            <span className="text-slate-500">{indicator.name}</span>
                            <span className={indicator.bullish ? 'text-emerald-400' : 'text-red-400'}>
                                {indicator.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Quick Stats Row
const QuickStats = ({ data }) => {
    const stats = [
        { label: '24h High', value: `$${data?.dayHigh?.toLocaleString() || '2,665.80'}`, color: 'text-emerald-400' },
        { label: '24h Low', value: `$${data?.dayLow?.toLocaleString() || '2,632.15'}`, color: 'text-red-400' },
        { label: '24h Volume', value: '$48.2B', color: 'text-slate-300' },
        { label: 'Open Interest', value: '$125.8B', color: 'text-slate-300' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className={`font-mono font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default function HeroSection() {
    const [goldData, setGoldData] = useState(null);
    const [sentiment, setSentiment] = useState(65);
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Load gold data
        const data = getCrossAssetData();
        setGoldData(data.gold);

        // Simulate sentiment changes
        const interval = setInterval(() => {
            setSentiment(prev => {
                const change = (Math.random() - 0.5) * 5;
                return Math.max(0, Math.min(100, prev + change));
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [mounted]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Chart - Takes 3 columns */}
            <Card
                className="lg:col-span-3"
                title="Gold Spot (XAU/USD)"
                icon="📈"
                glow
                noPadding
            >
                <div className="p-5">
                    <GoldPriceChart height={350} />
                </div>
            </Card>

            {/* Sentiment Panel - Takes 1 column */}
            <Card
                title="Market Sentiment"
                icon="🎯"
                accent="green"
            >
                <SentimentGauge sentiment={Math.round(sentiment)} />
            </Card>
        </div>
    );
}
