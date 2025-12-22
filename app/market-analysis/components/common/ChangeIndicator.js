'use client';

/**
 * ChangeIndicator - Visual indicator for price/value changes
 * @param {number} value - The change value
 * @param {number} percentage - The change percentage (optional)
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {boolean} showIcon - Show arrow icon
 * @param {boolean} showPercentage - Show percentage
 * @param {string} prefix - Value prefix (e.g., '$', '+')
 * @param {string} suffix - Value suffix (e.g., '%', 'pips')
 * @param {number} decimals - Decimal places
 */
export default function ChangeIndicator({ 
    value, 
    percentage,
    size = 'md',
    showIcon = true,
    showPercentage = true,
    prefix = '',
    suffix = '',
    decimals = 2
}) {
    const isPositive = value >= 0;
    const isNeutral = value === 0;
    
    const getColor = () => {
        if (isNeutral) return '#ff9800';
        return isPositive ? '#4caf50' : '#f44336';
    };

    const getBgColor = () => {
        if (isNeutral) return 'rgba(255, 152, 0, 0.1)';
        return isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
    };

    const formatValue = (val) => {
        if (val === null || val === undefined) return '---';
        const formatted = Math.abs(val).toFixed(decimals);
        const sign = val >= 0 ? '+' : '-';
        return `${sign}${prefix}${formatted}${suffix}`;
    };

    const sizeClasses = {
        sm: { fontSize: '0.75rem', padding: '0.2rem 0.5rem', iconSize: 12 },
        md: { fontSize: '0.9rem', padding: '0.3rem 0.6rem', iconSize: 16 },
        lg: { fontSize: '1.1rem', padding: '0.4rem 0.8rem', iconSize: 20 }
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;

    return (
        <span 
            className="change-indicator"
            style={{
                color: getColor(),
                backgroundColor: getBgColor(),
                fontSize: currentSize.fontSize,
                padding: currentSize.padding
            }}
        >
            {showIcon && (
                <svg 
                    width={currentSize.iconSize} 
                    height={currentSize.iconSize} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                    className="change-icon"
                    style={{ 
                        transform: isNeutral ? 'rotate(90deg)' : (isPositive ? 'rotate(0deg)' : 'rotate(180deg)')
                    }}
                >
                    {isNeutral ? (
                        <line x1="5" y1="12" x2="19" y2="12" />
                    ) : (
                        <>
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </>
                    )}
                </svg>
            )}
            <span className="change-value">{formatValue(value)}</span>
            {showPercentage && percentage !== undefined && (
                <span className="change-percentage">({percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%)</span>
            )}

            <style jsx>{`
                .change-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    border-radius: 6px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .change-icon {
                    flex-shrink: 0;
                }

                .change-value {
                    font-variant-numeric: tabular-nums;
                }

                .change-percentage {
                    opacity: 0.85;
                    font-size: 0.9em;
                }
            `}</style>
        </span>
    );
}

/**
 * TrendBadge - Shows bullish/bearish/neutral trend
 */
export function TrendBadge({ trend, size = 'md', lang = 'en' }) {
    const trends = {
        bullish: { 
            color: '#4caf50', 
            bg: 'rgba(76, 175, 80, 0.15)',
            labelEn: 'Bullish',
            labelAr: 'صعودي',
            icon: '📈'
        },
        bearish: { 
            color: '#f44336', 
            bg: 'rgba(244, 67, 54, 0.15)',
            labelEn: 'Bearish',
            labelAr: 'هبوطي',
            icon: '📉'
        },
        neutral: { 
            color: '#ff9800', 
            bg: 'rgba(255, 152, 0, 0.15)',
            labelEn: 'Neutral',
            labelAr: 'محايد',
            icon: '➡️'
        }
    };

    const trendData = trends[trend] || trends.neutral;
    const label = lang === 'ar' ? trendData.labelAr : trendData.labelEn;

    const sizeStyles = {
        sm: { fontSize: '0.7rem', padding: '0.2rem 0.5rem' },
        md: { fontSize: '0.85rem', padding: '0.3rem 0.75rem' },
        lg: { fontSize: '1rem', padding: '0.4rem 1rem' }
    };

    const currentSize = sizeStyles[size] || sizeStyles.md;

    return (
        <span 
            className="trend-badge"
            style={{
                color: trendData.color,
                backgroundColor: trendData.bg,
                borderColor: trendData.color,
                ...currentSize
            }}
        >
            <span className="trend-icon">{trendData.icon}</span>
            <span className="trend-label">{label}</span>

            <style jsx>{`
                .trend-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    border-radius: 20px;
                    border: 1px solid;
                    font-weight: 600;
                }

                .trend-icon {
                    font-size: 0.9em;
                }
            `}</style>
        </span>
    );
}

/**
 * ImpactBadge - Shows impact level (High/Medium/Low)
 */
export function ImpactBadge({ impact, size = 'sm', lang = 'en' }) {
    const impacts = {
        high: { 
            color: '#f44336', 
            bg: 'rgba(244, 67, 54, 0.15)',
            labelEn: 'High',
            labelAr: 'مرتفع'
        },
        medium: { 
            color: '#ff9800', 
            bg: 'rgba(255, 152, 0, 0.15)',
            labelEn: 'Medium',
            labelAr: 'متوسط'
        },
        low: { 
            color: '#4caf50', 
            bg: 'rgba(76, 175, 80, 0.15)',
            labelEn: 'Low',
            labelAr: 'منخفض'
        }
    };

    const impactData = impacts[impact?.toLowerCase()] || impacts.medium;
    const label = lang === 'ar' ? impactData.labelAr : impactData.labelEn;

    return (
        <span 
            className="impact-badge"
            style={{
                color: impactData.color,
                backgroundColor: impactData.bg,
                fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
                padding: size === 'sm' ? '0.15rem 0.4rem' : '0.2rem 0.5rem'
            }}
        >
            {label}

            <style jsx>{`
                .impact-badge {
                    display: inline-block;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </span>
    );
}
