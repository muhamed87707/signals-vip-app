'use client';

/**
 * Reusable Card Component with Glassmorphism Effect
 * For the Gold & Forex Market Intelligence Dashboard
 */

export default function Card({
    children,
    className = '',
    title = null,
    icon = null,
    accent = 'gold', // 'gold', 'green', 'red', 'blue'
    size = 'default', // 'default', 'large', 'small'
    glow = false,
    noPadding = false
}) {
    const accentColors = {
        gold: 'border-amber-500/20 hover:border-amber-500/40',
        green: 'border-emerald-500/20 hover:border-emerald-500/40',
        red: 'border-red-500/20 hover:border-red-500/40',
        blue: 'border-blue-500/20 hover:border-blue-500/40',
    };

    const glowColors = {
        gold: 'shadow-amber-500/10',
        green: 'shadow-emerald-500/10',
        red: 'shadow-red-500/10',
        blue: 'shadow-blue-500/10',
    };

    const titleColors = {
        gold: 'text-amber-500',
        green: 'text-emerald-500',
        red: 'text-red-500',
        blue: 'text-blue-500',
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl
                bg-slate-900/60 backdrop-blur-xl
                border ${accentColors[accent]}
                transition-all duration-300 ease-out
                ${glow ? `shadow-2xl ${glowColors[accent]}` : 'shadow-lg shadow-black/20'}
                ${noPadding ? '' : 'p-5'}
                ${className}
            `}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent`} />

            {/* Content */}
            <div className="relative z-10">
                {title && (
                    <div className="flex items-center gap-2 mb-4">
                        {icon && (
                            <span className={`text-lg ${titleColors[accent]}`}>
                                {icon}
                            </span>
                        )}
                        <h3 className={`text-sm font-semibold uppercase tracking-wider ${titleColors[accent]}`}>
                            {title}
                        </h3>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

/**
 * Metric Display Component for Key Values
 */
export function MetricValue({
    label,
    value,
    change = null,
    changeType = 'neutral', // 'positive', 'negative', 'neutral'
    size = 'default'
}) {
    const changeColors = {
        positive: 'text-emerald-400',
        negative: 'text-red-400',
        neutral: 'text-slate-400',
    };

    const changeIcons = {
        positive: '▲',
        negative: '▼',
        neutral: '●',
    };

    return (
        <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {label}
            </span>
            <div className="flex items-baseline gap-2">
                <span className={`font-mono font-bold ${size === 'large' ? 'text-3xl' : 'text-xl'} text-white`}>
                    {value}
                </span>
                {change !== null && (
                    <span className={`text-sm font-medium ${changeColors[changeType]} flex items-center gap-1`}>
                        <span className="text-[10px]">{changeIcons[changeType]}</span>
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Status Badge Component
 */
export function StatusBadge({ status, label }) {
    const statusStyles = {
        bullish: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
        neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        active: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            border ${statusStyles[status] || statusStyles.neutral}
        `}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {label}
        </span>
    );
}

/**
 * Section Divider
 */
export function Divider({ className = '' }) {
    return (
        <div className={`h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent ${className}`} />
    );
}
