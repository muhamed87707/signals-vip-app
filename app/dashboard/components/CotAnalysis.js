'use client';

/**
 * COT Report Analyzer Component
 * Phase 3: Institutional Intelligence Modules
 * 
 * Visualizes Commitment of Traders (COT) data with progress bars
 * and overcrowded position warnings
 */

import { useState, useEffect } from 'react';
import Card, { StatusBadge } from './Card';

// Mock COT data for Gold futures
const cotData = {
    reportDate: "Dec 17, 2024",
    asset: "Gold (GC)",
    managedMoney: {
        longs: 285420,
        shorts: 42180,
        spreading: 89650,
        netPosition: 243240,
        weeklyChange: 12450,
    },
    commercials: {
        longs: 125680,
        shorts: 298540,
        netPosition: -172860,
        weeklyChange: -8920,
    },
    nonReportable: {
        longs: 45230,
        shorts: 28650,
        netPosition: 16580,
        weeklyChange: 2340,
    },
    openInterest: {
        total: 548920,
        weeklyChange: 15670,
    }
};

// Calculate percentages
const calculatePercentage = (longs, shorts) => {
    const total = longs + shorts;
    return {
        longPercent: Math.round((longs / total) * 100),
        shortPercent: Math.round((shorts / total) * 100),
    };
};

// Position Bar Component
const PositionBar = ({ label, longs, shorts, icon, showWarning = false }) => {
    const { longPercent, shortPercent } = calculatePercentage(longs, shorts);
    const isOvercrowded = longPercent > 80 || shortPercent > 80;
    const overcrowdedSide = longPercent > 80 ? 'long' : shortPercent > 80 ? 'short' : null;

    return (
        <div className="mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium text-white">{label}</span>
                </div>
                {showWarning && isOvercrowded && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                        ⚠️ Overcrowded {overcrowdedSide === 'long' ? 'Longs' : 'Shorts'}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
                {/* Long Side (Green) */}
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${longPercent}%` }}
                >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
                        {longPercent}%
                    </span>
                </div>

                {/* Short Side (Red) */}
                <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-500 transition-all duration-500"
                    style={{ width: `${shortPercent}%` }}
                >
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
                        {shortPercent}%
                    </span>
                </div>

                {/* Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 -translate-x-1/2" />
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                <span>Longs: {longs.toLocaleString()}</span>
                <span>Shorts: {shorts.toLocaleString()}</span>
            </div>
        </div>
    );
};

// Net Position Indicator
const NetPositionIndicator = ({ label, netPosition, weeklyChange, icon }) => {
    const isPositive = netPosition > 0;
    const changeIsPositive = weeklyChange > 0;

    return (
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{netPosition.toLocaleString()}
                </span>
                <span className={`text-xs ${changeIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {changeIsPositive ? '▲' : '▼'} {Math.abs(weeklyChange).toLocaleString()}
                </span>
            </div>
        </div>
    );
};

// Overcrowded Warning Banner
const OvercrowdedWarning = ({ data }) => {
    const { longPercent } = calculatePercentage(data.managedMoney.longs, data.managedMoney.shorts);
    const isOvercrowded = longPercent > 80;

    if (!isOvercrowded) return null;

    return (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                    <span className="text-xl">🚨</span>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-red-400">Overcrowded Long Position Warning</h4>
                    <p className="text-xs text-slate-400">
                        Managed Money longs at {longPercent}% - historically signals potential reversal risk
                    </p>
                </div>
                <StatusBadge status="bearish" label="High Risk" />
            </div>
        </div>
    );
};

// Historical Context Mini Chart
const HistoricalContext = () => {
    // Mock historical data points (last 8 weeks)
    const historicalData = [72, 68, 75, 78, 82, 79, 85, 87];
    const maxVal = Math.max(...historicalData);
    const minVal = Math.min(...historicalData);

    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">8-Week Long % Trend</span>
                <span className="text-xs text-amber-400">Current: {historicalData[historicalData.length - 1]}%</span>
            </div>
            <div className="flex items-end gap-1 h-12">
                {historicalData.map((value, index) => {
                    const height = ((value - minVal) / (maxVal - minVal)) * 100;
                    const isLast = index === historicalData.length - 1;
                    const isOvercrowded = value > 80;

                    return (
                        <div
                            key={index}
                            className={`flex-1 rounded-t transition-all duration-300 ${isOvercrowded
                                    ? 'bg-gradient-to-t from-red-600 to-red-400'
                                    : isLast
                                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                                        : 'bg-gradient-to-t from-slate-600 to-slate-500'
                                }`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`Week ${index + 1}: ${value}%`}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between mt-1 text-[8px] text-slate-600">
                <span>8w ago</span>
                <span>Now</span>
            </div>
        </div>
    );
};

export default function CotAnalysis() {
    const [data, setData] = useState(cotData);

    // Simulate data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({
                ...prev,
                managedMoney: {
                    ...prev.managedMoney,
                    longs: prev.managedMoney.longs + Math.floor((Math.random() - 0.3) * 1000),
                    shorts: prev.managedMoney.shorts + Math.floor((Math.random() - 0.5) * 500),
                }
            }));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const { longPercent } = calculatePercentage(data.managedMoney.longs, data.managedMoney.shorts);

    return (
        <Card
            title="COT Report Analyzer"
            icon="📊"
            accent={longPercent > 80 ? 'red' : 'blue'}
            className="h-full"
        >
            {/* Report Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                <div>
                    <p className="text-xs text-slate-500">CFTC Report</p>
                    <p className="text-sm font-semibold text-white">{data.asset}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500">Report Date</p>
                    <p className="text-sm font-mono text-amber-400">{data.reportDate}</p>
                </div>
            </div>

            {/* Overcrowded Warning */}
            <OvercrowdedWarning data={data} />

            {/* Position Bars */}
            <div className="space-y-2">
                <PositionBar
                    label="Managed Money (Hedge Funds)"
                    longs={data.managedMoney.longs}
                    shorts={data.managedMoney.shorts}
                    icon="💼"
                    showWarning={true}
                />

                <PositionBar
                    label="Commercials (Producers/Merchants)"
                    longs={data.commercials.longs}
                    shorts={data.commercials.shorts}
                    icon="🏭"
                    showWarning={false}
                />

                <PositionBar
                    label="Non-Reportable (Retail)"
                    longs={data.nonReportable.longs}
                    shorts={data.nonReportable.shorts}
                    icon="👥"
                    showWarning={false}
                />
            </div>

            {/* Net Positions Grid */}
            <div className="grid grid-cols-3 gap-3 mt-4">
                <NetPositionIndicator
                    label="Managed Money Net"
                    netPosition={data.managedMoney.netPosition}
                    weeklyChange={data.managedMoney.weeklyChange}
                    icon="💼"
                />
                <NetPositionIndicator
                    label="Commercial Net"
                    netPosition={data.commercials.netPosition}
                    weeklyChange={data.commercials.weeklyChange}
                    icon="🏭"
                />
                <NetPositionIndicator
                    label="Open Interest"
                    netPosition={data.openInterest.total}
                    weeklyChange={data.openInterest.weeklyChange}
                    icon="📈"
                />
            </div>

            {/* Historical Context */}
            <HistoricalContext />

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-700/50">
                <p className="text-[10px] text-slate-500 text-center">
                    📅 Data from CFTC Commitment of Traders Report • Updated every Friday
                </p>
            </div>
        </Card>
    );
}
