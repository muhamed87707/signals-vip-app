'use client';

import Card, { StatusBadge, Divider } from './Card';

/**
 * Bottom Section - News Feed & Cross-Asset Correlations
 */

// News Item Component
const NewsItem = ({ source, time, title, impact, sentiment }) => (
    <div className="flex gap-4 p-4 bg-slate-800/20 rounded-xl border border-slate-700/30 hover:border-amber-500/30 transition-all cursor-pointer group">
        <div className="flex-shrink-0">
            <div className={`w-2 h-full rounded-full ${impact === 'high' ? 'bg-red-500' :
                    impact === 'medium' ? 'bg-amber-500' : 'bg-slate-600'
                }`} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-xs font-semibold">{source}</span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-slate-500 text-xs">{time}</span>
                {impact === 'high' && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full font-semibold">
                        HIGH IMPACT
                    </span>
                )}
            </div>
            <h4 className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors line-clamp-2">
                {title}
            </h4>
            <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={sentiment} label={sentiment === 'bullish' ? 'Gold +' : sentiment === 'bearish' ? 'Gold -' : 'Neutral'} />
            </div>
        </div>
    </div>
);

// News Feed Section
const NewsFeed = () => (
    <Card title="Market News & Events" icon="📰" className="h-full">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <NewsItem
                source="Reuters"
                time="5 min ago"
                title="Fed signals potential rate cuts in 2024, markets rally on dovish pivot expectations"
                impact="high"
                sentiment="bullish"
            />
            <NewsItem
                source="Bloomberg"
                time="23 min ago"
                title="US Treasury yields retreat as inflation data comes in softer than expected"
                impact="high"
                sentiment="bullish"
            />
            <NewsItem
                source="FX Street"
                time="1 hour ago"
                title="Gold ETF holdings rise for fifth consecutive day, signaling renewed investor interest"
                impact="medium"
                sentiment="bullish"
            />
            <NewsItem
                source="CNBC"
                time="2 hours ago"
                title="Dollar index weakens as euro gains on ECB hawkish comments"
                impact="medium"
                sentiment="bullish"
            />
            <NewsItem
                source="Kitco"
                time="3 hours ago"
                title="Central banks continue gold accumulation trend, China adds 25 tonnes in November"
                impact="medium"
                sentiment="bullish"
            />
            <NewsItem
                source="WSJ"
                time="4 hours ago"
                title="Geopolitical tensions in Middle East support safe-haven demand"
                impact="low"
                sentiment="bullish"
            />
            <NewsItem
                source="MarketWatch"
                time="5 hours ago"
                title="Technical analysts eye $2,700 as next major resistance for gold"
                impact="low"
                sentiment="neutral"
            />
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-slate-800/50 text-center">
            <button className="text-amber-500 text-sm hover:text-amber-400 transition-colors">
                View All News →
            </button>
        </div>
    </Card>
);

// Correlation Item
const CorrelationItem = ({ asset, correlation, direction, description }) => {
    const isPositive = correlation > 0;
    const absCorrelation = Math.abs(correlation);
    const barWidth = absCorrelation * 100;

    return (
        <div className="p-4 bg-slate-800/20 rounded-xl border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-medium">{asset}</span>
                <span className={`font-mono text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{correlation.toFixed(2)}
                </span>
            </div>

            {/* Correlation Bar */}
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`absolute h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{
                        width: `${barWidth}%`,
                        left: isPositive ? '50%' : `${50 - barWidth}%`
                    }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-lg ${direction === 'up' ? '📈' : direction === 'down' ? '📉' : '➡️'}`}>
                    {direction === 'up' ? '📈' : direction === 'down' ? '📉' : '➡️'}
                </span>
                <span className="text-slate-500 text-xs">{description}</span>
            </div>
        </div>
    );
};

// Cross-Asset Correlations Section
const CrossAssetCorrelations = () => (
    <Card title="Cross-Asset Correlations" icon="🔗" className="h-full">
        <p className="text-slate-500 text-xs mb-4">30-day rolling correlation with Gold (XAU/USD)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CorrelationItem
                asset="US Dollar (DXY)"
                correlation={-0.85}
                direction="down"
                description="Strong inverse - DXY weakness = Gold strength"
            />
            <CorrelationItem
                asset="US 10Y Yield"
                correlation={-0.72}
                direction="down"
                description="Inverse - Lower yields support Gold"
            />
            <CorrelationItem
                asset="S&P 500"
                correlation={0.35}
                direction="up"
                description="Weak positive - Risk-on can lift Gold"
            />
            <CorrelationItem
                asset="Bitcoin"
                correlation={0.45}
                direction="up"
                description="Moderate positive - Both seen as hedges"
            />
            <CorrelationItem
                asset="Silver (XAG)"
                correlation={0.92}
                direction="up"
                description="Very strong - Precious metals move together"
            />
            <CorrelationItem
                asset="VIX"
                correlation={0.28}
                direction="up"
                description="Weak positive - Fear supports Gold"
            />
        </div>

        {/* Correlation Matrix Link */}
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm">Full Correlation Matrix</p>
                    <p className="text-slate-600 text-xs">View all 20+ asset correlations</p>
                </div>
                <button className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg hover:bg-amber-500/30 transition-colors">
                    View Matrix →
                </button>
            </div>
        </div>
    </Card>
);

// Economic Calendar Mini
const EconomicCalendarMini = () => (
    <Card title="Upcoming Events" icon="📅" accent="red">
        <div className="space-y-3">
            {[
                { time: 'Today 14:30', event: 'US Core PCE Price Index', impact: 'high', forecast: '3.8%', previous: '3.9%' },
                { time: 'Today 16:00', event: 'US Consumer Confidence', impact: 'medium', forecast: '104.5', previous: '102.0' },
                { time: 'Tomorrow 10:00', event: 'EU CPI Flash Estimate', impact: 'high', forecast: '2.9%', previous: '2.9%' },
                { time: 'Dec 22 14:30', event: 'US GDP (Final)', impact: 'medium', forecast: '5.2%', previous: '5.2%' },
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/30">
                    <div className={`w-2 h-8 rounded-full ${item.impact === 'high' ? 'bg-red-500' :
                            item.impact === 'medium' ? 'bg-amber-500' : 'bg-slate-600'
                        }`} />
                    <div className="flex-1">
                        <p className="text-slate-300 text-sm font-medium">{item.event}</p>
                        <p className="text-slate-500 text-xs">{item.time}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-amber-400 text-sm font-mono">{item.forecast}</p>
                        <p className="text-slate-600 text-xs">Prev: {item.previous}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-4 text-center">
            <button className="text-amber-500 text-sm hover:text-amber-400 transition-colors">
                Full Calendar →
            </button>
        </div>
    </Card>
);

export default function BottomSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <NewsFeed />
            <CrossAssetCorrelations />
            <EconomicCalendarMini />
        </div>
    );
}
