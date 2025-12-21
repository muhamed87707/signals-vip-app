'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { generateGoldCandlestickData, generateVolumeData, createPriceSimulator } from '../services/marketData';

/**
 * Gold Price Chart Component
 * Simple SVG-based chart as fallback for TradingView
 */

// Chart Theme Configuration
const chartTheme = {
    dark: {
        background: 'transparent',
        textColor: '#9ca3af',
        gridColor: 'rgba(42, 46, 57, 0.3)',
        borderColor: 'rgba(42, 46, 57, 0.5)',
        crosshairColor: '#f59e0b',
        upColor: '#10b981',
        downColor: '#ef4444',
    },
};

// Timeframe Options
const timeframes = [
    { label: '1H', value: '1H', minutes: 60 },
    { label: '4H', value: '4H', minutes: 240 },
    { label: '1D', value: '1D', minutes: 1440 },
    { label: '1W', value: '1W', minutes: 10080 },
    { label: '1M', value: '1M', minutes: 43200 },
];

// Chart Type Options
const chartTypes = [
    { label: 'Candles', value: 'candlestick', icon: '📊' },
    { label: 'Line', value: 'line', icon: '📈' },
    { label: 'Area', value: 'area', icon: '📉' },
];

// Simple SVG Candlestick Chart
const SimpleCandlestickChart = ({ data, width, height }) => {
    if (!data || data.length === 0) return null;

    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Scale functions
    const xScale = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (price) => padding.top + ((maxPrice - price) / priceRange) * chartHeight;

    const candleWidth = Math.max(2, (chartWidth / data.length) * 0.7);

    return (
        <svg width={width} height={height} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding.top + ratio * chartHeight;
                const price = maxPrice - ratio * priceRange;
                return (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke={chartTheme.dark.gridColor}
                            strokeDasharray="2,2"
                        />
                        <text
                            x={width - padding.right + 5}
                            y={y + 4}
                            fill={chartTheme.dark.textColor}
                            fontSize="10"
                        >
                            ${price.toFixed(0)}
                        </text>
                    </g>
                );
            })}

            {/* Candlesticks */}
            {data.map((candle, i) => {
                const x = xScale(i);
                const isUp = candle.close >= candle.open;
                const color = isUp ? chartTheme.dark.upColor : chartTheme.dark.downColor;

                const bodyTop = yScale(Math.max(candle.open, candle.close));
                const bodyBottom = yScale(Math.min(candle.open, candle.close));
                const bodyHeight = Math.max(1, bodyBottom - bodyTop);

                return (
                    <g key={i}>
                        {/* Wick */}
                        <line
                            x1={x}
                            y1={yScale(candle.high)}
                            x2={x}
                            y2={yScale(candle.low)}
                            stroke={color}
                            strokeWidth="1"
                        />
                        {/* Body */}
                        <rect
                            x={x - candleWidth / 2}
                            y={bodyTop}
                            width={candleWidth}
                            height={bodyHeight}
                            fill={isUp ? color : color}
                            stroke={color}
                            strokeWidth="1"
                        />
                    </g>
                );
            })}

            {/* Current price line */}
            {data.length > 0 && (
                <g>
                    <line
                        x1={padding.left}
                        y1={yScale(data[data.length - 1].close)}
                        x2={width - padding.right}
                        y2={yScale(data[data.length - 1].close)}
                        stroke={chartTheme.dark.crosshairColor}
                        strokeDasharray="4,2"
                        strokeWidth="1"
                    />
                    <rect
                        x={width - padding.right}
                        y={yScale(data[data.length - 1].close) - 10}
                        width="55"
                        height="20"
                        fill={chartTheme.dark.crosshairColor}
                        rx="3"
                    />
                    <text
                        x={width - padding.right + 5}
                        y={yScale(data[data.length - 1].close) + 4}
                        fill="#000"
                        fontSize="11"
                        fontWeight="bold"
                    >
                        ${data[data.length - 1].close.toFixed(0)}
                    </text>
                </g>
            )}
        </svg>
    );
};

// Simple Line Chart
const SimpleLineChart = ({ data, width, height }) => {
    if (!data || data.length === 0) return null;

    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const xScale = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (price) => padding.top + ((maxPrice - price) / priceRange) * chartHeight;

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.close)}`).join(' ');
    const areaPath = `${linePath} L ${xScale(data.length - 1)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    return (
        <svg width={width} height={height} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding.top + ratio * chartHeight;
                const price = maxPrice - ratio * priceRange;
                return (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke={chartTheme.dark.gridColor}
                            strokeDasharray="2,2"
                        />
                        <text
                            x={width - padding.right + 5}
                            y={y + 4}
                            fill={chartTheme.dark.textColor}
                            fontSize="10"
                        >
                            ${price.toFixed(0)}
                        </text>
                    </g>
                );
            })}

            {/* Area fill */}
            <path
                d={areaPath}
                fill="url(#areaGradient)"
                opacity="0.3"
            />

            {/* Line */}
            <path
                d={linePath}
                fill="none"
                stroke={chartTheme.dark.crosshairColor}
                strokeWidth="2"
            />

            {/* Gradient definition */}
            <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.dark.crosshairColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={chartTheme.dark.crosshairColor} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Current price indicator */}
            {data.length > 0 && (
                <g>
                    <circle
                        cx={xScale(data.length - 1)}
                        cy={yScale(data[data.length - 1].close)}
                        r="4"
                        fill={chartTheme.dark.crosshairColor}
                    />
                    <rect
                        x={width - padding.right}
                        y={yScale(data[data.length - 1].close) - 10}
                        width="55"
                        height="20"
                        fill={chartTheme.dark.crosshairColor}
                        rx="3"
                    />
                    <text
                        x={width - padding.right + 5}
                        y={yScale(data[data.length - 1].close) + 4}
                        fill="#000"
                        fontSize="11"
                        fontWeight="bold"
                    >
                        ${data[data.length - 1].close.toFixed(0)}
                    </text>
                </g>
            )}
        </svg>
    );
};

export default function GoldPriceChart({ height = 400 }) {
    const chartContainerRef = useRef(null);
    const [chartData, setChartData] = useState([]);
    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const [chartType, setChartType] = useState('candlestick');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [containerWidth, setContainerWidth] = useState(800);
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load chart data
    const loadChartData = useCallback(() => {
        setIsLoading(true);
        try {
            const candleData = generateGoldCandlestickData(50);
            setChartData(candleData);

            if (candleData.length > 0) {
                const lastCandle = candleData[candleData.length - 1];
                const prevCandle = candleData[candleData.length - 2];
                setCurrentPrice(lastCandle.close);
                setPriceChange({
                    value: lastCandle.close - prevCandle.close,
                    percent: ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100,
                });
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
        setIsLoading(false);
    }, []);

    // Initialize
    useEffect(() => {
        if (!mounted) return;
        loadChartData();
    }, [mounted, loadChartData]);

    // Handle resize
    useEffect(() => {
        if (!mounted || !chartContainerRef.current) return;

        const updateWidth = () => {
            if (chartContainerRef.current) {
                setContainerWidth(chartContainerRef.current.clientWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [mounted]);

    // Simulate real-time updates
    useEffect(() => {
        if (!mounted || !currentPrice) return;

        const priceSimulator = createPriceSimulator(currentPrice, 0.3);

        const interval = setInterval(() => {
            const tick = priceSimulator();
            setCurrentPrice(tick.price);
        }, 3000);

        return () => clearInterval(interval);
    }, [mounted, currentPrice]);

    const handleTimeframeChange = (tf) => {
        setActiveTimeframe(tf);
        loadChartData();
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-4">
                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white font-mono">
                        ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                    </span>
                    {priceChange && (
                        <span className={`text-lg font-semibold ${priceChange.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {priceChange.value >= 0 ? '+' : ''}{priceChange.value.toFixed(2)}
                            ({priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%)
                        </span>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {/* Chart Type Selector */}
                    <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                        {chartTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setChartType(type.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${chartType === type.value
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                                title={type.label}
                            >
                                {type.icon}
                            </button>
                        ))}
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => handleTimeframeChange(tf.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTimeframe === tf.value
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative" ref={chartContainerRef}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-slate-400">Loading chart...</span>
                        </div>
                    </div>
                )}
                <div
                    style={{ height: `${height}px` }}
                    className="rounded-xl overflow-hidden bg-slate-900/30"
                >
                    {chartType === 'candlestick' ? (
                        <SimpleCandlestickChart data={chartData} width={containerWidth} height={height} />
                    ) : (
                        <SimpleLineChart data={chartData} width={containerWidth} height={height} />
                    )}
                </div>
            </div>

            {/* Chart Footer - Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
                {[
                    { label: '24h High', value: '$2,665.80', color: 'text-emerald-400' },
                    { label: '24h Low', value: '$2,632.15', color: 'text-red-400' },
                    { label: '24h Volume', value: '$48.2B', color: 'text-slate-300' },
                    { label: 'Open Interest', value: '$125.8B', color: 'text-slate-300' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                        <p className={`font-mono font-semibold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
