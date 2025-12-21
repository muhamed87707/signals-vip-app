'use client';

import Card, { MetricValue, StatusBadge, Divider } from './Card';

/**
 * Right Panel - Institutional Data
 * Bank Forecasts & COT Report
 */

// Bank Forecast Item
const BankForecast = ({ bank, logo, q1, q2, q3, q4, bias }) => (
    <div className="flex items-center gap-4 py-3 border-b border-slate-800/50 last:border-0">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
            {logo}
        </div>
        <div className="flex-1">
            <p className="text-white text-sm font-medium">{bank}</p>
            <p className={`text-xs ${bias === 'bullish' ? 'text-emerald-400' : bias === 'bearish' ? 'text-red-400' : 'text-slate-400'}`}>
                {bias.charAt(0).toUpperCase() + bias.slice(1)}
            </p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
            <div>
                <p className="text-[10px] text-slate-600">Q1</p>
                <p className="text-xs text-slate-300 font-mono">{q1}</p>
            </div>
            <div>
                <p className="text-[10px] text-slate-600">Q2</p>
                <p className="text-xs text-slate-300 font-mono">{q2}</p>
            </div>
            <div>
                <p className="text-[10px] text-slate-600">Q3</p>
                <p className="text-xs text-slate-300 font-mono">{q3}</p>
            </div>
            <div>
                <p className="text-[10px] text-slate-600">Q4</p>
                <p className="text-xs text-amber-400 font-mono font-semibold">{q4}</p>
            </div>
        </div>
    </div>
);

// Bank Forecasts Section
const BankForecasts = () => (
    <Card title="Bank Gold Forecasts 2024" icon="🏦" accent="gold">
        <div className="space-y-1">
            <BankForecast
                bank="Goldman Sachs"
                logo="🏛️"
                q1="$2,100"
                q2="$2,200"
                q3="$2,400"
                q4="$2,700"
                bias="bullish"
            />
            <BankForecast
                bank="JP Morgan"
                logo="💎"
                q1="$2,050"
                q2="$2,150"
                q3="$2,300"
                q4="$2,500"
                bias="bullish"
            />
            <BankForecast
                bank="UBS"
                logo="🔷"
                q1="$2,000"
                q2="$2,100"
                q3="$2,250"
                q4="$2,400"
                bias="neutral"
            />
            <BankForecast
                bank="Citi"
                logo="🔵"
                q1="$2,100"
                q2="$2,250"
                q3="$2,500"
                q4="$2,800"
                bias="bullish"
            />
            <BankForecast
                bank="HSBC"
                logo="🔴"
                q1="$1,950"
                q2="$2,000"
                q3="$2,100"
                q4="$2,200"
                bias="bearish"
            />
        </div>

        {/* Average Forecast */}
        <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center justify-between">
                <span className="text-amber-500 text-sm font-semibold">Consensus Avg (Q4)</span>
                <span className="text-white font-mono font-bold text-lg">$2,520</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">Based on 12 major banks</p>
        </div>
    </Card>
);

// COT Position Bar
const PositionBar = ({ label, long, short, net }) => {
    const total = long + short;
    const longPercent = (long / total) * 100;

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className={`text-xs font-semibold ${net > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Net: {net > 0 ? '+' : ''}{net.toLocaleString()}
                </span>
            </div>
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                    style={{ width: `${longPercent}%` }}
                />
                <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-400"
                    style={{ width: `${100 - longPercent}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-[10px]">
                <span className="text-emerald-400">Long: {long.toLocaleString()}</span>
                <span className="text-red-400">Short: {short.toLocaleString()}</span>
            </div>
        </div>
    );
};

// COT Report Section
const COTReport = () => (
    <Card title="COT Report (Gold Futures)" icon="📋" accent="blue">
        <div className="flex items-center justify-between mb-4">
            <StatusBadge status="bullish" label="Net Long" />
            <span className="text-slate-500 text-xs">Updated: Dec 19, 2024</span>
        </div>

        <PositionBar
            label="Managed Money"
            long={185420}
            short={42680}
            net={142740}
        />

        <PositionBar
            label="Swap Dealers"
            long={68540}
            short={124680}
            net={-56140}
        />

        <PositionBar
            label="Producers"
            long={45200}
            short={168400}
            net={-123200}
        />

        <Divider className="my-4" />

        {/* Weekly Change */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                <p className="text-slate-500 text-xs mb-1">Weekly Change</p>
                <p className="text-emerald-400 font-mono font-semibold">+12,450</p>
                <p className="text-slate-600 text-[10px]">Net Long Increase</p>
            </div>
            <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                <p className="text-slate-500 text-xs mb-1">Open Interest</p>
                <p className="text-white font-mono font-semibold">524,680</p>
                <p className="text-emerald-400 text-[10px]">+2.3% WoW</p>
            </div>
        </div>

        {/* Interpretation */}
        <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">📊 Interpretation:</span> Managed money increasing long exposure suggests institutional bullish sentiment
            </p>
        </div>
    </Card>
);

// Central Bank Buying
const CentralBankBuying = () => (
    <Card title="Central Bank Gold Buying" icon="🌍" accent="gold">
        <div className="space-y-3">
            {[
                { country: '🇨🇳 China', tonnes: '+225', ytd: '+892', trend: 'up' },
                { country: '🇵🇱 Poland', tonnes: '+130', ytd: '+156', trend: 'up' },
                { country: '🇹🇷 Turkey', tonnes: '+85', ytd: '+148', trend: 'up' },
                { country: '🇮🇳 India', tonnes: '+45', ytd: '+78', trend: 'up' },
                { country: '🇸🇬 Singapore', tonnes: '+28', ytd: '+45', trend: 'up' },
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-300 text-sm">{item.country}</span>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-emerald-400 font-mono text-sm">{item.tonnes}t</p>
                            <p className="text-slate-600 text-[10px]">Q4 2024</p>
                        </div>
                        <div className="text-right">
                            <p className="text-amber-400 font-mono text-sm">{item.ytd}t</p>
                            <p className="text-slate-600 text-[10px]">YTD</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Total */}
        <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center justify-between">
                <span className="text-amber-500 text-sm font-semibold">Total CB Buying (YTD)</span>
                <span className="text-white font-mono font-bold">1,037 tonnes</span>
            </div>
            <p className="text-slate-500 text-xs mt-1">Highest since 1967</p>
        </div>
    </Card>
);

export default function InstitutionalData() {
    return (
        <div className="space-y-4">
            <BankForecasts />
            <COTReport />
            <CentralBankBuying />
        </div>
    );
}
