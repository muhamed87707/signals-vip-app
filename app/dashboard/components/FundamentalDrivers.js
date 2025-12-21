'use client';

import Card, { MetricValue, Divider } from './Card';

/**
 * Left Panel - Fundamental Drivers
 * Displays Treasury Yields, DXY, Inflation Data
 */

// Mini Sparkline Component
const Sparkline = ({ data, color = 'amber' }) => {
    const colors = {
        amber: 'stroke-amber-500',
        green: 'stroke-emerald-500',
        red: 'stroke-red-500',
        blue: 'stroke-blue-500',
    };

    // Generate path from data
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="opacity-60">
            <polyline
                points={points}
                fill="none"
                className={colors[color]}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

// Yield Curve Visual
const YieldCurve = () => (
    <div className="relative h-32 w-full mt-4">
        <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
            {/* Grid */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="rgb(51, 65, 85)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="0" y1="40" x2="200" y2="40" stroke="rgb(51, 65, 85)" strokeWidth="0.5" strokeDasharray="4" />
            <line x1="0" y1="60" x2="200" y2="60" stroke="rgb(51, 65, 85)" strokeWidth="0.5" strokeDasharray="4" />

            {/* Yield Curve Line */}
            <path
                d="M10,55 Q40,50 60,45 T100,35 T140,28 T180,25"
                fill="none"
                stroke="rgb(245, 158, 11)"
                strokeWidth="2"
            />

            {/* Data Points */}
            {[
                { x: 10, y: 55, label: '3M' },
                { x: 60, y: 45, label: '2Y' },
                { x: 100, y: 35, label: '5Y' },
                { x: 140, y: 28, label: '10Y' },
                { x: 180, y: 25, label: '30Y' },
            ].map((point, i) => (
                <g key={i}>
                    <circle cx={point.x} cy={point.y} r="3" fill="rgb(245, 158, 11)" />
                    <text x={point.x} y="75" fill="rgb(100, 116, 139)" fontSize="8" textAnchor="middle">
                        {point.label}
                    </text>
                </g>
            ))}
        </svg>
    </div>
);

// Treasury Yields Section
const TreasuryYields = () => (
    <Card title="US Treasury Yields" icon="🏛️" accent="blue">
        <div className="space-y-3">
            {[
                { label: '2-Year', value: '4.42%', change: '+0.02', type: 'positive', data: [4.35, 4.38, 4.40, 4.39, 4.41, 4.42] },
                { label: '10-Year', value: '4.52%', change: '+0.03', type: 'positive', data: [4.45, 4.48, 4.50, 4.49, 4.51, 4.52] },
                { label: '30-Year', value: '4.68%', change: '+0.01', type: 'positive', data: [4.62, 4.65, 4.66, 4.67, 4.67, 4.68] },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm w-16">{item.label}</span>
                        <Sparkline data={item.data} color="blue" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{item.value}</span>
                        <span className={`text-xs ${item.type === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
        <YieldCurve />
        <p className="text-slate-500 text-xs mt-2 text-center">Yield Curve (Normal)</p>
    </Card>
);

// Dollar Index Section
const DollarIndex = () => (
    <Card title="US Dollar Index (DXY)" icon="💵" accent="green">
        <div className="flex items-center justify-between mb-4">
            <MetricValue
                label="Current"
                value="104.25"
                change="-0.12%"
                changeType="negative"
                size="large"
            />
            <div className="text-right">
                <p className="text-xs text-slate-500">52W Range</p>
                <p className="text-sm text-slate-400">99.58 - 107.35</p>
            </div>
        </div>

        {/* Range Bar */}
        <div className="relative h-2 bg-slate-800 rounded-full mt-4">
            <div
                className="absolute h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                style={{ width: '60%' }}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-amber-500 shadow-lg"
                style={{ left: '60%', transform: 'translate(-50%, -50%)' }}
            />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-slate-600">
            <span>99.58</span>
            <span>107.35</span>
        </div>

        {/* Correlation Note */}
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-400">
                <span className="text-amber-500">⚡ Inverse Correlation:</span> DXY weakness typically supports Gold prices
            </p>
        </div>
    </Card>
);

// Inflation Data Section
const InflationData = () => (
    <Card title="Inflation Metrics" icon="📊" accent="red">
        <div className="space-y-4">
            {[
                { label: 'CPI (YoY)', value: '3.4%', prev: '3.2%', status: 'Rising', color: 'red' },
                { label: 'Core CPI', value: '3.9%', prev: '4.0%', status: 'Falling', color: 'green' },
                { label: 'PCE', value: '2.8%', prev: '2.9%', status: 'Falling', color: 'green' },
                { label: 'PPI', value: '1.0%', prev: '0.9%', status: 'Rising', color: 'red' },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm">{item.label}</p>
                        <p className="text-slate-600 text-xs">Prev: {item.prev}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-mono">{item.value}</p>
                        <p className={`text-xs ${item.color === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.status}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        {/* Fed Target */}
        <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center justify-between">
                <span className="text-amber-500 text-xs font-semibold">Fed Target</span>
                <span className="text-white font-mono">2.0%</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">Current inflation remains above target</p>
        </div>
    </Card>
);

export default function FundamentalDrivers() {
    return (
        <div className="space-y-4">
            <TreasuryYields />
            <DollarIndex />
            <InflationData />
        </div>
    );
}
