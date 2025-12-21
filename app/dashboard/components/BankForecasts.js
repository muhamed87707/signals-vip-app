'use client';

/**
 * Bank Forecasts Component
 * Phase 3: Institutional Intelligence Modules
 * 
 * Displays major bank price targets for Gold with sentiment indicators
 * and calculates average consensus price
 */

import Card, { StatusBadge } from './Card';

// Mock data for bank forecasts
const forecasts = [
    { bank: "Goldman Sachs", target: 2700, sentiment: "Bullish", horizon: "Q4 2025", logo: "🏦" },
    { bank: "JP Morgan", target: 2650, sentiment: "Neutral", horizon: "Q4 2025", logo: "🏛️" },
    { bank: "Citi", target: 2800, sentiment: "Bullish", horizon: "Q1 2026", logo: "🏢" },
    { bank: "Morgan Stanley", target: 2720, sentiment: "Bullish", horizon: "Q4 2025", logo: "📊" },
    { bank: "UBS", target: 2680, sentiment: "Neutral", horizon: "Q1 2026", logo: "🇨🇭" },
    { bank: "HSBC", target: 2750, sentiment: "Bullish", horizon: "Q4 2025", logo: "🌏" },
];

// Calculate average consensus price
const averageConsensus = Math.round(
    forecasts.reduce((sum, f) => sum + f.target, 0) / forecasts.length
);

// Individual Bank Forecast Card
const ForecastCard = ({ bank, target, sentiment, horizon, logo }) => {
    const sentimentColors = {
        Bullish: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        Bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
        Neutral: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };

    const sentimentIcons = {
        Bullish: '↑',
        Bearish: '↓',
        Neutral: '→',
    };

    return (
        <div className="flex-shrink-0 w-64 bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 hover:border-amber-500/30 transition-all duration-300 hover:bg-slate-800/60">
            {/* Bank Header */}
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{logo}</span>
                <div>
                    <h4 className="text-sm font-semibold text-white">{bank}</h4>
                    <p className="text-[10px] text-slate-500">{horizon}</p>
                </div>
            </div>

            {/* Target Price */}
            <div className="mb-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Price Target</p>
                <p className="text-2xl font-bold font-mono text-amber-400">${target.toLocaleString()}</p>
            </div>

            {/* Sentiment Badge */}
            <div className="flex items-center justify-between">
                <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    border ${sentimentColors[sentiment]}
                `}>
                    <span>{sentimentIcons[sentiment]}</span>
                    {sentiment}
                </span>

                {/* Difference from current */}
                <span className="text-[10px] text-slate-500">
                    vs $2,645 current
                </span>
            </div>
        </div>
    );
};

// Consensus Badge Component
const ConsensusBadge = ({ average }) => {
    const bullishCount = forecasts.filter(f => f.sentiment === 'Bullish').length;
    const totalCount = forecasts.length;
    const bullishPercentage = Math.round((bullishCount / totalCount) * 100);

    return (
        <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-xl p-4 border border-amber-500/20 mb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Average Consensus */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Average Consensus Price</p>
                        <p className="text-3xl font-bold font-mono text-amber-400">${average.toLocaleString()}</p>
                    </div>
                </div>

                {/* Sentiment Distribution */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Bullish Consensus</p>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${bullishPercentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-emerald-400">{bullishPercentage}%</span>
                        </div>
                    </div>
                    <StatusBadge
                        status={bullishPercentage >= 60 ? 'bullish' : bullishPercentage >= 40 ? 'neutral' : 'bearish'}
                        label={`${bullishCount}/${totalCount} Bullish`}
                    />
                </div>
            </div>

            {/* Price Range Indicator */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Target Range</span>
                    <span>${Math.min(...forecasts.map(f => f.target)).toLocaleString()} - ${Math.max(...forecasts.map(f => f.target)).toLocaleString()}</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full">
                    {/* Range bar */}
                    <div
                        className="absolute h-full bg-gradient-to-r from-amber-500/50 to-emerald-500/50 rounded-full"
                        style={{
                            left: '0%',
                            width: '100%'
                        }}
                    />
                    {/* Average marker */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 shadow-lg"
                        style={{
                            left: `${((average - Math.min(...forecasts.map(f => f.target))) / (Math.max(...forecasts.map(f => f.target)) - Math.min(...forecasts.map(f => f.target)))) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default function BankForecasts() {
    return (
        <Card
            title="Bank Forecasts"
            icon="🏦"
            accent="gold"
            className="h-full"
        >
            {/* Consensus Badge */}
            <ConsensusBadge average={averageConsensus} />

            {/* Horizontal Scrolling Cards */}
            <div className="relative">
                {/* Gradient Fade Left */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/80 to-transparent z-10 pointer-events-none" />

                {/* Scrollable Container */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {forecasts.map((forecast, index) => (
                        <ForecastCard key={index} {...forecast} />
                    ))}
                </div>

                {/* Gradient Fade Right */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/80 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-3 border-t border-slate-700/50">
                <p className="text-[10px] text-slate-500 text-center">
                    📊 Data aggregated from major investment bank research reports • Updated weekly
                </p>
            </div>
        </Card>
    );
}
