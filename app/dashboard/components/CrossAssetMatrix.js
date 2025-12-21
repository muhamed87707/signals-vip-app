'use client';

import { useState, useEffect } from 'react';
import Card, { Divider } from './Card';
import { getCrossAssetData, getCorrelationMatrix } from '../services/marketData';

/**
 * Cross-Asset Matrix Component
 * Displays prices and correlations for related assets
 */

// Asset Price Card
const AssetPriceCard = ({ asset, isHighlighted = false }) => {
    const isUp = asset.direction === 'up';
    const isDown = asset.direction === 'down';

    return (
        <div className={`p-3 rounded-xl border transition-all ${isHighlighted
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider">{asset.symbol}</p>
                    <p className="text-white text-sm font-medium">{asset.name}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUp ? 'bg-emerald-500/20' : isDown ? 'bg-red-500/20' : 'bg-slate-500/20'
                    }`}>
                    <span className={`text-lg ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                        {isUp ? '↑' : isDown ? '↓' : '→'}
                    </span>
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">
                    {asset.symbol.includes('/') || asset.symbol === 'DXY'
                        ? asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.price < 100 ? 4 : 2, maximumFractionDigits: asset.price < 100 ? 4 : 2 })
                        : `$${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                </span>
            </div>

            <div className="flex items-center justify-between mt-2">
                <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                    ({asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
                </span>
            </div>

            {/* Day Range Mini Bar */}
            {asset.dayHigh && asset.dayLow && (
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                    <div className="flex justify-between text-[9px] text-slate-600 mb-1">
                        <span>L: {asset.dayLow}</span>
                        <span>H: {asset.dayHigh}</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-slate-600 via-amber-500 to-slate-600 rounded-full"
                            style={{
                                marginLeft: `${((asset.price - asset.dayLow) / (asset.dayHigh - asset.dayLow)) * 100 - 2}%`,
                                width: '4%',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Correlation Heatmap Cell
const CorrelationCell = ({ value, label }) => {
    // Color based on correlation value
    const getColor = (val) => {
        if (val >= 0.7) return 'bg-emerald-500/40 text-emerald-300';
        if (val >= 0.3) return 'bg-emerald-500/20 text-emerald-400';
        if (val > -0.3) return 'bg-slate-500/20 text-slate-400';
        if (val > -0.7) return 'bg-red-500/20 text-red-400';
        return 'bg-red-500/40 text-red-300';
    };

    return (
        <div className={`p-2 rounded-lg text-center ${getColor(value)} transition-all hover:scale-105`}>
            <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-mono font-semibold">
                {value >= 0 ? '+' : ''}{value.toFixed(2)}
            </p>
        </div>
    );
};

// Gold/Silver Ratio Widget
const GoldSilverRatio = ({ gold, silver }) => {
    const ratio = gold.price / silver.price;
    const historicalAvg = 80;
    const isAboveAvg = ratio > historicalAvg;

    return (
        <div className="p-3 bg-gradient-to-br from-amber-500/10 to-slate-800/30 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
                <span className="text-amber-500 text-xs font-semibold">Gold/Silver Ratio</span>
                <span className={`text-xs ${isAboveAvg ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isAboveAvg ? 'Silver Undervalued' : 'Near Average'}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{ratio.toFixed(2)}</span>
                <span className="text-xs text-slate-500">oz Au / oz Ag</span>
            </div>
            <div className="mt-2">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>60 (Silver High)</span>
                    <span>Avg: {historicalAvg}</span>
                    <span>100 (Silver Low)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-30" />
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg"
                        style={{ left: `${((ratio - 60) / 40) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

// Correlation Legend
const CorrelationLegend = () => (
    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/40" />
            <span>Strong +</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/20" />
            <span>Weak +</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-500/20" />
            <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/20" />
            <span>Weak -</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/40" />
            <span>Strong -</span>
        </div>
    </div>
);

export default function CrossAssetMatrix() {
    const [assets, setAssets] = useState({});
    const [correlations, setCorrelations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        loadData();

        // Refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [mounted]);

    const loadData = async () => {
        try {
            const assetData = getCrossAssetData();
            const correlationData = getCorrelationMatrix();
            setAssets(assetData);
            setCorrelations(correlationData);
        } catch (error) {
            console.error('Error loading cross-asset data:', error);
        }
        setIsLoading(false);
    };

    if (!mounted || isLoading) {
        return (
            <Card title="Cross-Asset Matrix" icon="🔗">
                <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </Card>
        );
    }

    return (
        <Card title="Cross-Asset Matrix" icon="🔗" accent="gold">
            <p className="text-slate-500 text-xs mb-4">Related markets and correlations with Gold</p>

            {/* Main Assets Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <AssetPriceCard asset={assets.gold} isHighlighted />
                <AssetPriceCard asset={assets.silver} />
                <AssetPriceCard asset={assets.oil} />
                <AssetPriceCard asset={assets.sp500} />
            </div>

            {/* Gold/Silver Ratio */}
            {assets.gold && assets.silver && (
                <GoldSilverRatio gold={assets.gold} silver={assets.silver} />
            )}

            <Divider className="my-4" />

            {/* Correlation Heatmap */}
            <div className="mb-3">
                <h4 className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">
                    30-Day Correlations with Gold
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {correlations.gold && (
                        <>
                            <CorrelationCell value={correlations.gold.silver} label="Silver" />
                            <CorrelationCell value={correlations.gold.oil} label="Oil" />
                            <CorrelationCell value={correlations.gold.sp500} label="S&P 500" />
                            <CorrelationCell value={correlations.gold.dxy} label="DXY" />
                            <CorrelationCell value={correlations.gold.us10y} label="US10Y" />
                            <CorrelationCell value={correlations.gold.bitcoin} label="Bitcoin" />
                        </>
                    )}
                </div>
            </div>

            <CorrelationLegend />

            {/* Additional Assets */}
            <Divider className="my-4" />

            <div className="grid grid-cols-2 gap-3">
                <AssetPriceCard asset={assets.bitcoin} />
                <AssetPriceCard asset={assets.eurusd} />
            </div>

            {/* Insight Box */}
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <p className="text-xs text-slate-400">
                    <span className="text-amber-500 font-semibold">💡 Insight: </span>
                    {correlations.gold?.dxy < -0.7
                        ? 'Strong inverse correlation with DXY suggests dollar weakness could boost gold.'
                        : correlations.gold?.silver > 0.9
                            ? 'Silver moving in tandem with gold. Watch for ratio mean reversion.'
                            : 'Monitor cross-asset flows for directional signals.'}
                </p>
            </div>
        </Card>
    );
}
