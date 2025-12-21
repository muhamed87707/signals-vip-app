'use client';

import { useState, useEffect, useCallback } from 'react';
import Card, { StatusBadge, Divider } from './Card';
import { gatherMarketContext } from '../services/marketData';

/**
 * Center Panel - Gemini AI Analysis Hub
 * Phase 4: Integrated with Google Gemini AI for real-time market analysis
 */

// AI Typing Animation
const TypingIndicator = () => (
    <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

// Loading Skeleton
const AnalysisSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700/50 rounded w-4/5"></div>
        <div className="space-y-2 mt-6">
            <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
            <div className="h-3 bg-slate-700/50 rounded w-full"></div>
            <div className="h-3 bg-slate-700/50 rounded w-full"></div>
            <div className="h-3 bg-slate-700/50 rounded w-3/4"></div>
        </div>
    </div>
);

// Markdown Renderer Component
const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    // Parse markdown and render with styling
    const renderMarkdown = (text) => {
        // Split by lines for processing
        const lines = text.split('\n');
        const elements = [];
        let listItems = [];
        let inList = false;

        lines.forEach((line, index) => {
            // Headers
            if (line.startsWith('## ')) {
                if (inList && listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-slate-300">
                            {listItems}
                        </ul>
                    );
                    listItems = [];
                    inList = false;
                }
                elements.push(
                    <h2 key={index} className="text-lg font-bold text-amber-400 mt-4 mb-2">
                        {renderInlineMarkdown(line.replace('## ', ''))}
                    </h2>
                );
            }
            // Bold headers (like **MARKET BIAS**)
            else if (line.match(/^\*\*[A-Z\s]+\*\*:/)) {
                if (inList && listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-slate-300">
                            {listItems}
                        </ul>
                    );
                    listItems = [];
                    inList = false;
                }
                const [header, ...rest] = line.split(':');
                const headerText = header.replace(/\*\*/g, '');
                const content = rest.join(':').trim();

                // Special styling for MARKET BIAS
                if (headerText === 'MARKET BIAS') {
                    const isBullish = content.toLowerCase().includes('bullish');
                    const isBearish = content.toLowerCase().includes('bearish');
                    elements.push(
                        <div key={index} className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <span className="text-amber-500 font-bold text-sm uppercase tracking-wider">{headerText}:</span>
                            <StatusBadge
                                status={isBullish ? 'bullish' : isBearish ? 'bearish' : 'neutral'}
                                label={content}
                            />
                        </div>
                    );
                } else {
                    elements.push(
                        <div key={index} className="mb-3">
                            <span className="text-amber-500 font-bold text-sm uppercase tracking-wider">{headerText}:</span>
                            <span className="text-slate-300 ml-2">{renderInlineMarkdown(content)}</span>
                        </div>
                    );
                }
            }
            // Numbered lists
            else if (line.match(/^\d+\.\s/)) {
                if (!inList) inList = true;
                const content = line.replace(/^\d+\.\s/, '');
                listItems.push(
                    <li key={`item-${index}`} className="text-slate-300 text-sm leading-relaxed">
                        {renderInlineMarkdown(content)}
                    </li>
                );
            }
            // Bullet points
            else if (line.startsWith('- ') || line.startsWith('• ')) {
                if (!inList) inList = true;
                const content = line.replace(/^[-•]\s/, '');
                listItems.push(
                    <li key={`item-${index}`} className="text-slate-300 text-sm leading-relaxed">
                        {renderInlineMarkdown(content)}
                    </li>
                );
            }
            // Regular paragraphs
            else if (line.trim()) {
                if (inList && listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-slate-300">
                            {listItems}
                        </ul>
                    );
                    listItems = [];
                    inList = false;
                }
                elements.push(
                    <p key={index} className="text-slate-300 text-sm leading-relaxed mb-3">
                        {renderInlineMarkdown(line)}
                    </p>
                );
            }
        });

        // Handle remaining list items
        if (listItems.length > 0) {
            elements.push(
                <ul key="final-list" className="list-disc list-inside space-y-1 mb-4 text-slate-300">
                    {listItems}
                </ul>
            );
        }

        return elements;
    };

    // Render inline markdown (bold, italic, code)
    const renderInlineMarkdown = (text) => {
        if (!text) return text;

        // Process bold text (**text**)
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                // Check if it's a price level
                if (boldText.startsWith('$') || boldText.match(/^\d/)) {
                    return (
                        <span key={i} className="font-bold text-amber-400 font-mono">
                            {boldText}
                        </span>
                    );
                }
                return (
                    <span key={i} className="font-bold text-white">
                        {boldText}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="prose prose-invert prose-sm max-w-none">
            {renderMarkdown(content)}
        </div>
    );
};

// AI Analysis Display Component
const AIAnalysisDisplay = ({ analysis, isLoading, error, onRefresh, lastUpdated }) => {
    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="text-red-400 font-semibold">Analysis Error</h4>
                </div>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm"
                >
                    Try Again ↻
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <TypingIndicator />
                    </div>
                    <div>
                        <p className="text-white font-semibold">Analyzing Market Data...</p>
                        <p className="text-slate-500 text-xs">Gemini AI is processing your request</p>
                    </div>
                </div>
                <AnalysisSkeleton />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 border border-amber-500/20 p-6">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        <h4 className="text-amber-500 font-bold text-lg">AI Market Analysis</h4>
                    </div>
                    {lastUpdated && (
                        <span className="text-xs text-slate-500">
                            Updated: {new Date(lastUpdated).toLocaleTimeString()}
                        </span>
                    )}
                </div>

                {/* Analysis Content */}
                <div className="mb-4">
                    <MarkdownRenderer content={analysis} />
                </div>

                {/* Refresh Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span>Powered by Gemini 2.0 Flash</span>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-all text-sm font-medium"
                    >
                        <span>↻</span>
                        Refresh Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

// Key Insights List (Static fallback)
const KeyInsights = () => (
    <div className="space-y-3">
        {[
            { icon: '🎯', text: 'Strong support identified at $2,620 level', priority: 'high' },
            { icon: '📈', text: 'RSI showing bullish divergence on 4H timeframe', priority: 'medium' },
            { icon: '🏦', text: 'Fed rate cut expectations increasing for Q1 2024', priority: 'high' },
            { icon: '💹', text: 'ETF inflows positive for 5 consecutive days', priority: 'medium' },
            { icon: '⚠️', text: 'Watch for resistance at $2,680 psychological level', priority: 'low' },
        ].map((insight, i) => (
            <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-slate-800/30
                    ${insight.priority === 'high'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-slate-700/30'
                    }`}
            >
                <span className="text-lg">{insight.icon}</span>
                <p className="text-slate-300 text-sm flex-1">{insight.text}</p>
                {insight.priority === 'high' && (
                    <span className="text-[10px] text-amber-500 uppercase tracking-wider font-semibold">Key</span>
                )}
            </div>
        ))}
    </div>
);

// Market Context Summary
const MarketContextSummary = ({ context }) => {
    if (!context) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <p className="text-xs text-slate-500 mb-1">Gold Price</p>
                <p className="text-white font-mono font-bold">${context.goldPrice?.toLocaleString()}</p>
                <p className={`text-xs ${context.goldChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {context.goldChange > 0 ? '+' : ''}{context.goldChange?.toFixed(2)}%
                </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <p className="text-xs text-slate-500 mb-1">US 10Y Yield</p>
                <p className="text-white font-mono font-bold">{context.us10y}%</p>
                <p className={`text-xs ${context.us10yChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {context.us10yChange > 0 ? '↑' : '↓'} {Math.abs(context.us10yChange)}%
                </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <p className="text-xs text-slate-500 mb-1">COT Longs</p>
                <p className="text-white font-mono font-bold">{context.cotLongPercent}%</p>
                {context.cotOvercrowded && (
                    <p className="text-xs text-red-400">⚠️ Overcrowded</p>
                )}
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                <p className="text-xs text-slate-500 mb-1">Bank Consensus</p>
                <p className="text-white font-mono font-bold">${context.bankConsensus?.toLocaleString()}</p>
                <p className="text-xs text-emerald-400">{context.bullishBanks}/{context.totalBanks} Bullish</p>
            </div>
        </div>
    );
};

export default function AIAnalysisHub() {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [marketContext, setMarketContext] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch AI analysis
    const fetchAnalysis = useCallback(async () => {
        if (!mounted) return;

        setIsLoading(true);
        setError(null);

        try {
            // Gather current market context
            const context = gatherMarketContext();
            setMarketContext(context);

            // Call the API
            const response = await fetch('/api/dashboard/analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ marketContext: context }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch analysis');
            }

            const data = await response.json();

            if (data.success && data.analysis) {
                setAnalysis(data.analysis);
                setLastUpdated(data.timestamp);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (err) {
            console.error('Analysis fetch error:', err);
            setError(err.message || 'Failed to generate analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [mounted]);

    // Initial fetch on mount
    useEffect(() => {
        if (mounted) {
            // Set initial market context immediately
            try {
                const context = gatherMarketContext();
                setMarketContext(context);
            } catch (e) {
                console.error('Error gathering market context:', e);
            }
            // Delay API call slightly to ensure hydration is complete
            const timer = setTimeout(() => {
                fetchAnalysis();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [mounted, fetchAnalysis]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        if (!mounted) return;

        const interval = setInterval(() => {
            if (!isLoading) {
                fetchAnalysis();
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [mounted, fetchAnalysis, isLoading]);

    // Show loading state during SSR/hydration
    if (!mounted) {
        return (
            <Card
                className="h-full"
                title="Gemini AI Analysis Hub"
                icon="🤖"
                glow
                accent="gold"
            >
                <div className="flex items-center justify-center py-12">
                    <TypingIndicator />
                </div>
            </Card>
        );
    }

    return (
        <Card
            className="h-full"
            title="Gemini AI Analysis Hub"
            icon="🤖"
            glow
            accent="gold"
        >
            {/* Header with Status */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <span className="text-xl">✨</span>
                    </div>
                    <div>
                        <p className="text-white font-semibold">Real-time Market Intelligence</p>
                        <p className="text-slate-500 text-xs">Powered by Gemini 2.0 Flash</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className={`text-xs font-medium ${isLoading ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isLoading ? 'Analyzing...' : 'Live Analysis'}
                    </span>
                </div>
            </div>

            {/* Market Context Summary */}
            <MarketContextSummary context={marketContext} />

            {/* AI Analysis Display */}
            <AIAnalysisDisplay
                analysis={analysis}
                isLoading={isLoading}
                error={error}
                onRefresh={fetchAnalysis}
                lastUpdated={lastUpdated}
            />

            <Divider className="my-6" />

            {/* Key Insights */}
            <div className="mb-6">
                <h4 className="text-slate-400 text-sm font-semibold mb-4 flex items-center gap-2">
                    <span>💡</span> Key Market Insights
                </h4>
                <KeyInsights />
            </div>

            {/* AI Status Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <span>Model: gemini-2.0-flash</span>
                    <span>•</span>
                    <span>Auto-refresh: 5 min</span>
                </div>
                <button
                    onClick={fetchAnalysis}
                    disabled={isLoading}
                    className={`text-xs transition-colors ${isLoading
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-amber-500 hover:text-amber-400'
                        }`}
                >
                    {isLoading ? 'Analyzing...' : 'Refresh Analysis ↻'}
                </button>
            </div>
        </Card>
    );
}
