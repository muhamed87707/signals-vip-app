'use client';

import Card, { MetricValue, StatusBadge } from './Card';

/**
 * Hero Section - Gold Price Chart & Quick Sentiment
 * Main focal point of the dashboard
 */

// Placeholder Chart Component
const PriceChart = () => (
    <div className="relative h-64 w-full">
        {/* Chart Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-slate-800/50 border-dashed" />
            ))}
        </div>

        {/* Placeholder Chart Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Area Fill */}
            <path
                d="M0,180 Q50,160 100,140 T200,120 T300,100 T400,80 T500,90 T600,70 T700,50 T800,60 L800,256 L0,256 Z"
                fill="url(#chartGradient)"
            />
            {/* Line */}
            <path
                d="M0,180 Q50,160 100,140 T200,120 T300,100 T400,80 T500,90 T600,70 T700,50 T800,60"
                fill="none"
                stroke="rgb(245, 158, 11)"
                strokeWidth="2"
            />
        </svg>

        {/* Current Price Marker */}
        <div className="absolute right-4 top-8 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-500 font-mono text-sm">$2,648.50</span>
        </div>

        {/* Time Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[10px] text-slate-600">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>Now</span>
        </div>
    </div>
);

// Quick Stats Row
const QuickStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <MetricValue
                label="24h High"
                value="$2,665.80"
                change="+0.65%"
                changeType="positive"
            />
        </div>
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <MetricValue
                label="24h Low"
                value="$2,632.15"
                change="-0.17%"
                changeType="negative"
            />
        </div>
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <MetricValue
                label="24h Volume"
                value="$48.2B"
                change="+12.3%"
                changeType="positive"
            />
        </div>
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <MetricValue
                label="Open Interest"
                value="$125.8B"
                change="+2.1%"
                changeType="positive"
            />
        </div>
    </div>
);

// Sentiment Gauge
const SentimentGauge = () => (
    <div className="flex flex-col items-center justify-center h-full">
        {/* Gauge Visual */}
        <div className="relative w-32 h-16 overflow-hidden">
            {/* Background Arc */}
            <div className="absolute inset-0 border-8 border-slate-700 rounded-t-full" />
            {/* Colored Arc */}
            <div
                className="absolute inset-0 border-8 border-transparent border-t-emerald-500 border-l-emerald-500 rounded-t-full"
                style={{ transform: 'rotate(-20deg)' }}
            />
            {/* Needle */}
            <div
                className="absolute bottom-0 left-1/2 w-1 h-14 bg-white rounded-full origin-bottom"
                style={{ transform: 'translateX(-50%) rotate(25deg)' }}
            />
            {/* Center Dot */}
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-900 border-2 border-amber-500 rounded-full transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Labels */}
        <div className="flex justify-between w-full mt-4 px-2">
            <span className="text-xs text-red-400">Bearish</span>
            <span className="text-xs text-slate-400">Neutral</span>
            <span className="text-xs text-emerald-400">Bullish</span>
        </div>

        {/* Current Sentiment */}
        <div className="mt-4 text-center">
            <StatusBadge status="bullish" label="Moderately Bullish" />
            <p className="text-slate-500 text-xs mt-2">Based on 12 indicators</p>
        </div>
    </div>
);

export default function HeroSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Chart - Takes 3 columns */}
            <Card
                className="lg:col-span-3"
                title="Gold Spot (XAU/USD)"
                icon="📈"
                glow
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white font-mono">$2,648.50</span>
                        <span className="text-emerald-400 text-lg font-semibold">+$11.85 (+0.45%)</span>
                    </div>
                    <div className="flex gap-2">
                        {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                            <button
                                key={tf}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                                    ${tf === '1D'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <PriceChart />
                <QuickStats />
            </Card>

            {/* Sentiment Panel - Takes 1 column */}
            <Card
                title="Market Sentiment"
                icon="🎯"
                accent="green"
            >
                <SentimentGauge />
            </Card>
        </div>
    );
}
