'use client';

import Card, { StatusBadge, Divider } from './Card';

/**
 * Center Panel - Gemini AI Analysis Hub
 * The largest and most prominent section of the dashboard
 */

// AI Typing Animation
const TypingIndicator = () => (
    <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

// AI Analysis Card
const AIAnalysisCard = ({ title, content, confidence, sentiment, timestamp }) => (
    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-amber-500/30 transition-all">
        <div className="flex items-start justify-between mb-3">
            <h4 className="text-white font-semibold text-sm">{title}</h4>
            <StatusBadge status={sentiment} label={sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} />
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-3">{content}</p>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Confidence:</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${confidence}%` }}
                    />
                </div>
                <span className="text-xs text-amber-500">{confidence}%</span>
            </div>
            <span className="text-xs text-slate-600">{timestamp}</span>
        </div>
    </div>
);

// Key Insights List
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

// Trade Recommendation Box
const TradeRecommendation = () => (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-800/50 to-slate-900 border border-amber-500/30 p-5">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <h4 className="text-amber-500 font-bold text-lg">AI Trade Recommendation</h4>
                </div>
                <StatusBadge status="bullish" label="BUY Signal" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-500 text-xs mb-1">Entry Zone</p>
                    <p className="text-white font-mono font-bold">$2,640-2,650</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-500 text-xs mb-1">Stop Loss</p>
                    <p className="text-red-400 font-mono font-bold">$2,615</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-500 text-xs mb-1">Take Profit</p>
                    <p className="text-emerald-400 font-mono font-bold">$2,700</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-slate-500 text-xs">Risk/Reward</p>
                        <p className="text-amber-400 font-semibold">1:2.5</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Confidence</p>
                        <p className="text-amber-400 font-semibold">87%</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-all text-sm">
                    View Full Analysis →
                </button>
            </div>
        </div>
    </div>
);

// Analysis Tabs
const AnalysisTabs = ({ activeTab, setActiveTab }) => (
    <div className="flex gap-2 mb-6">
        {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'technical', label: 'Technical', icon: '📈' },
            { id: 'fundamental', label: 'Fundamental', icon: '🏛️' },
            { id: 'sentiment', label: 'Sentiment', icon: '🎭' },
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.id
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
            >
                <span>{tab.icon}</span>
                {tab.label}
            </button>
        ))}
    </div>
);

export default function AIAnalysisHub() {
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
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-medium">Live Analysis</span>
                </div>
            </div>

            {/* Trade Recommendation */}
            <TradeRecommendation />

            <Divider className="my-6" />

            {/* Key Insights */}
            <div className="mb-6">
                <h4 className="text-slate-400 text-sm font-semibold mb-4 flex items-center gap-2">
                    <span>💡</span> Key Market Insights
                </h4>
                <KeyInsights />
            </div>

            <Divider className="my-6" />

            {/* Analysis Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AIAnalysisCard
                    title="Technical Outlook"
                    content="Gold maintains bullish structure above the 50-day MA. MACD showing positive momentum with histogram expansion. Key resistance at $2,680."
                    confidence={85}
                    sentiment="bullish"
                    timestamp="2 min ago"
                />
                <AIAnalysisCard
                    title="Fundamental View"
                    content="Weakening DXY and rising rate cut expectations provide tailwinds. Central bank buying remains robust. Watch for CPI data impact."
                    confidence={78}
                    sentiment="bullish"
                    timestamp="5 min ago"
                />
                <AIAnalysisCard
                    title="Sentiment Analysis"
                    content="Retail sentiment turning bullish (65% long). Institutional positioning shows accumulation. Social media buzz increasing."
                    confidence={72}
                    sentiment="neutral"
                    timestamp="8 min ago"
                />
                <AIAnalysisCard
                    title="Risk Assessment"
                    content="Moderate risk environment. VIX at low levels suggests complacency. Geopolitical tensions remain supportive for safe-haven demand."
                    confidence={80}
                    sentiment="bullish"
                    timestamp="12 min ago"
                />
            </div>

            {/* AI Status Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <span>Last updated: Just now</span>
                    <span>•</span>
                    <span>Next refresh in 30s</span>
                </div>
                <button className="text-amber-500 text-xs hover:text-amber-400 transition-colors">
                    Refresh Analysis ↻
                </button>
            </div>
        </Card>
    );
}
