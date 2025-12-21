'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { generateGoldCandlestickData, generateVolumeData, createPriceSimulator } from '../services/marketData';

/**
 * Gold Price Chart Component
 * Uses TradingView Lightweight Charts for professional candlestick visualization
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
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
        volumeUpColor: 'rgba(16, 185, 129, 0.3)',
        volumeDownColor: 'rgba(239, 68, 68, 0.3)',
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

export default function GoldPriceChart({ height = 400 }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);

    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const [chartType, setChartType] = useState('candlestick');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const theme = chartTheme.dark;

        // Create chart instance
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: theme.background },
                textColor: theme.textColor,
            },
            grid: {
                vertLines: { color: theme.gridColor },
                horzLines: { color: theme.gridColor },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: theme.crosshairColor,
                    width: 1,
                    style: 2,
                    labelBackgroundColor: theme.crosshairColor,
                },
                horzLine: {
                    color: theme.crosshairColor,
                    width: 1,
                    style: 2,
                    labelBackgroundColor: theme.crosshairColor,
                },
            },
            rightPriceScale: {
                borderColor: theme.borderColor,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: theme.borderColor,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        chartRef.current = chart;

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: theme.upColor,
            downColor: theme.downColor,
            borderDownColor: theme.downColor,
            borderUpColor: theme.upColor,
            wickDownColor: theme.wickDownColor,
            wickUpColor: theme.wickUpColor,
        });
        candlestickSeriesRef.current = candlestickSeries;

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: theme.volumeUpColor,
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.85,
                bottom: 0,
            },
        });
        volumeSeriesRef.current = volumeSeries;

        // Load initial data
        loadChartData();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, []);

    // Load chart data
    const loadChartData = async () => {
        setIsLoading(true);

        try {
            // Generate mock data (replace with API call later)
            const candleData = generateGoldCandlestickData(100);
            const volumeData = generateVolumeData(100);

            if (candlestickSeriesRef.current) {
                candlestickSeriesRef.current.setData(candleData);
            }
            if (volumeSeriesRef.current) {
                volumeSeriesRef.current.setData(volumeData);
            }

            // Set current price from last candle
            if (candleData.length > 0) {
                const lastCandle = candleData[candleData.length - 1];
                const prevCandle = candleData[candleData.length - 2];
                setCurrentPrice(lastCandle.close);
                setPriceChange({
                    value: lastCandle.close - prevCandle.close,
                    percent: ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100,
                });
            }

            // Fit content
            if (chartRef.current) {
                chartRef.current.timeScale().fitContent();
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        }

        setIsLoading(false);
    };

    // Simulate real-time updates
    useEffect(() => {
        if (!candlestickSeriesRef.current || !currentPrice) return;

        const priceSimulator = createPriceSimulator(currentPrice, 0.3);

        const interval = setInterval(() => {
            const tick = priceSimulator();
            setCurrentPrice(tick.price);

            // Update the last candle (in real implementation, this would be more sophisticated)
            // For now, we just update the displayed price
        }, 2000);

        return () => clearInterval(interval);
    }, [currentPrice]);

    // Handle timeframe change
    const handleTimeframeChange = (tf) => {
        setActiveTimeframe(tf);
        loadChartData(); // Reload data for new timeframe
    };

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
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-slate-400">Loading chart...</span>
                        </div>
                    </div>
                )}
                <div
                    ref={chartContainerRef}
                    style={{ height: `${height}px` }}
                    className="rounded-xl overflow-hidden"
                />
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
