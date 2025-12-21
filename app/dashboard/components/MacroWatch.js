'use client';

import { useState, useEffect } from 'react';
import Card, { MetricValue, StatusBadge, Divider } from './Card';
import { getMacroIndicators } from '../services/marketData';

/**
 * Macro Watch Component
 * Displays key macro indicators that drive gold prices
 * with inverse correlation visualization
 */

// Correlation Arrow Component
const CorrelationArrow = ({ direction, strength }) => {
    const isInverse = direction === 'inverse';
    const color = isInverse ? 'text-red-400' : 'text-emerald-400';

    return (
        <div className={`flex items-center gap-1 ${color}`}>
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={isInverse ? 'rotate-180' : ''}
            >
                <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span className="text-xs font-medium">
                {isInverse ? 'Inverse' : 'Positive'}
            </span>
        </div>
    );
};

// Mini Sparkline for trend visualization
const MiniSparkline = ({ data, color = '#f59e0b', height = 30 }) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="opacity-70">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

// Gold Impact Indicator
const GoldImpactIndicator = ({ impact, strength }) => {
    const colors = {
        bullish: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: '📈' },
        bearish: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '📉' },
        neutral: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', icon: '➡️' },
    };

    const style = colors[impact] || colors.neutral;
    const strengthPercent = Math.round(strength * 100);

    return (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${style.bg} border ${style.border}`}>
            <span className="text-sm">{style.icon}</span>
            <div className="flex flex-col">
                <span className={`text-xs font-semibold ${style.text}`}>
                    Gold {impact === 'bullish' ? '+' : impact === 'bearish' ? '-' : '~'}
                </span>
                <div className="flex items-center gap-1">
                    <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${impact === 'bullish' ? 'bg-emerald-500' : impact === 'bearish' ? 'bg-red-500' : 'bg-slate-500'}`}
                            style={{ width: `${strengthPercent}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-slate-500">{strengthPercent}%</span>
                </div>
            </div>
        </div>
    );
};

// Individual Macro Indicator Card
const MacroIndicatorCard = ({ indicator, showCorrelation = true }) => {
    const isUp = indicator.direction === 'up';
    const isDown = indicator.direction === 'down';

    // Generate mock sparkline data
    const sparklineData = Array.from({ length: 20 }, (_, i) =>
        indicator.value + (Math.random() - 0.5) * (indicator.value * 0.02)
    );

    return (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-amber-500/30 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{indicator.symbol}</p>
                    <p className="text-white font-semibold text-sm">{indicator.name}</p>
                </div>
                <MiniSparkline
                    data={sparklineData}
                    color={isUp ? '#10b981' : isDown ? '#ef4444' : '#f59e0b'}
                />
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-white font-mono">
                    {typeof indicator.value === 'number'
                        ? indicator.value.toFixed(2)
                        : indicator.value}
                    {indicator.symbol.includes('Y') || indicator.symbol.includes('CPI') ? '%' : ''}
                </span>
                <span className={`text-sm font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                    {indicator.change >= 0 ? '+' : ''}{indicator.change}
                    {indicator.changePercent ? ` (${indicator.changePercent >= 0 ? '+' : ''}${indicator.changePercent.toFixed(2)}%)` : ''}
                </span>
            </div>

            {/* Day Range */}
            {indicator.dayHigh && indicator.dayLow && (
                <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Day Low: {indicator.dayLow}</span>
                        <span>Day High: {indicator.dayHigh}</span>
                    </div>
                    <div className="relative h-1.5 bg-slate-700 rounded-full">
                        <div
                            className="absolute h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full"
                            style={{
                                left: '0%',
                                width: '100%',
                            }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full border-2 border-amber-500 shadow-lg"
                            style={{
                                left: `${((indicator.value - indicator.dayLow) / (indicator.dayHigh - indicator.dayLow)) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Gold Impact */}
            {showCorrelation && indicator.goldImpact && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500">Gold Impact</span>
                    <GoldImpactIndicator
                        impact={indicator.goldImpact}
                        strength={indicator.goldImpactStrength}
                    />
                </div>
            )}
        </div>
    );
};

// Correlation Matrix Visual
const CorrelationVisual = ({ indicators }) => {
    const items = [
        { name: 'US10Y', impact: indicators.us10y?.goldImpact, strength: indicators.us10y?.goldImpactStrength },
        { name: 'DXY', impact: indicators.dxy?.goldImpact, strength: indicators.dxy?.goldImpactStrength },
        { name: 'Real Yields', impact: indicators.realYields?.goldImpact, strength: indicators.realYields?.goldImpactStrength },
        { name: 'Inflation', impact: indicators.inflation?.goldImpact, strength: indicators.inflation?.goldImpactStrength },
    ];

    // Calculate overall sentiment
    const bullishCount = items.filter(i => i.impact === 'bullish').length;
    const bearishCount = items.filter(i => i.impact === 'bearish').length;
    const overallSentiment = bullishCount > bearishCount ? 'bullish' : bearishCount > bullishCount ? 'bearish' : 'neutral';

    return (
        <div className="p-4 bg-gradient-to-br from-amber-500/5 to-slate-800/30 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-amber-500 font-semibold text-sm">Macro → Gold Impact</h4>
                <StatusBadge
                    status={overallSentiment}
                    label={`Net ${overallSentiment.charAt(0).toUpperCase() + overallSentiment.slice(1)}`}
                />
            </div>

            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-20">{item.name}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${item.impact === 'bullish' ? 'bg-emerald-500' :
                                        item.impact === 'bearish' ? 'bg-red-500' : 'bg-slate-500'
                                    }`}
                                style={{ width: `${(item.strength || 0) * 100}%` }}
                            />
                        </div>
                        <span className={`text-xs font-medium w-16 text-right ${item.impact === 'bullish' ? 'text-emerald-400' :
                                item.impact === 'bearish' ? 'text-red-400' : 'text-slate-400'
                            }`}>
                            {item.impact === 'bullish' ? '↑ Gold' : item.impact === 'bearish' ? '↓ Gold' : '→ Neutral'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-400">
                    <span className="text-amber-500 font-semibold">Analysis: </span>
                    {overallSentiment === 'bullish'
                        ? 'Macro conditions favor gold prices. Weakening dollar and inflation concerns provide tailwinds.'
                        : overallSentiment === 'bearish'
                            ? 'Rising yields and strong dollar create headwinds for gold prices.'
                            : 'Mixed signals from macro indicators. Watch for breakout direction.'}
                </p>
            </div>
        </div>
    );
};

export default function MacroWatch() {
    const [indicators, setIndicators] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        loadIndicators();

        // Refresh every 30 seconds
        const interval = setInterval(loadIndicators, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadIndicators = async () => {
        try {
            // Get mock data (replace with API call later)
            const data = getMacroIndicators();
            setIndicators(data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading macro indicators:', error);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <Card title="Macro Watch" icon="🏛️">
                <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </Card>
        );
    }

    return (
        <Card title="Macro Watch" icon="🏛️" accent="blue">
            {/* Header with last update */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-xs">Key drivers affecting gold prices</p>
                {lastUpdate && (
                    <span className="text-xs text-slate-600">
                        Updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Correlation Visual Summary */}
            <CorrelationVisual indicators={indicators} />

            <Divider className="my-4" />

            {/* Individual Indicators */}
            <div className="space-y-3">
                <MacroIndicatorCard indicator={indicators.us10y} />
                <MacroIndicatorCard indicator={indicators.dxy} />
                <MacroIndicatorCard indicator={indicators.realYields} />
                <MacroIndicatorCard indicator={indicators.inflation} />
            </div>

            {/* Fed Watch */}
            {indicators.fedFundsRate && (
                <>
                    <Divider className="my-4" />
                    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Fed Funds Rate</span>
                            <span className="text-white font-mono font-semibold">{indicators.fedFundsRate.target}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-xs">Next Meeting: {indicators.fedFundsRate.nextMeeting}</span>
                            <span className="text-amber-400 text-xs font-medium">{indicators.fedFundsRate.marketExpectation}</span>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
}
