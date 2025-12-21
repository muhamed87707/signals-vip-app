'use client';

/**
 * DataBadge - Status badges for various data states
 * @param {Object} props
 * @param {string} props.variant - Badge variant: 'bullish', 'bearish', 'neutral', 'alert', 'info', 'success', 'warning', 'error'
 * @param {string} props.text - Badge text
 * @param {string} props.size - Size: 'sm', 'md', 'lg'
 * @param {boolean} props.pulse - Whether to show pulse animation
 * @param {React.ReactNode} props.icon - Optional icon
 */
export default function DataBadge({
  variant = 'neutral',
  text,
  size = 'md',
  pulse = false,
  icon,
}) {
  const variantStyles = {
    bullish: {
      bg: 'rgba(0, 255, 136, 0.1)',
      border: 'rgba(0, 255, 136, 0.3)',
      color: 'var(--dash-neon-green)',
    },
    bearish: {
      bg: 'rgba(255, 68, 68, 0.1)',
      border: 'rgba(255, 68, 68, 0.3)',
      color: 'var(--dash-neon-red)',
    },
    neutral: {
      bg: 'rgba(255, 215, 0, 0.1)',
      border: 'rgba(255, 215, 0, 0.3)',
      color: 'var(--dash-neutral)',
    },
    alert: {
      bg: 'rgba(255, 165, 0, 0.1)',
      border: 'rgba(255, 165, 0, 0.3)',
      color: '#ffa500',
    },
    info: {
      bg: 'rgba(0, 212, 255, 0.1)',
      border: 'rgba(0, 212, 255, 0.3)',
      color: 'var(--dash-neon-blue)',
    },
    success: {
      bg: 'rgba(0, 255, 136, 0.1)',
      border: 'rgba(0, 255, 136, 0.3)',
      color: 'var(--dash-neon-green)',
    },
    warning: {
      bg: 'rgba(255, 215, 0, 0.1)',
      border: 'rgba(255, 215, 0, 0.3)',
      color: 'var(--dash-neutral)',
    },
    error: {
      bg: 'rgba(255, 68, 68, 0.1)',
      border: 'rgba(255, 68, 68, 0.3)',
      color: 'var(--dash-neon-red)',
    },
    gold: {
      bg: 'linear-gradient(90deg, var(--dash-gold-secondary), var(--dash-gold-primary))',
      border: 'transparent',
      color: '#000',
    },
  };

  const sizeStyles = {
    sm: {
      padding: '0.15rem 0.4rem',
      fontSize: '0.65rem',
      borderRadius: '3px',
    },
    md: {
      padding: '0.25rem 0.6rem',
      fontSize: '0.75rem',
      borderRadius: '4px',
    },
    lg: {
      padding: '0.35rem 0.8rem',
      fontSize: '0.85rem',
      borderRadius: '6px',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;
  const sizing = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`data-badge ${variant} ${pulse ? 'pulse' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: sizing.padding,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: sizing.borderRadius,
        fontSize: sizing.fontSize,
        fontWeight: 600,
        color: style.color,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        animation: pulse ? 'badge-pulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      {text}
    </span>
  );
}

/**
 * ImpactBadge - Shows impact on Gold (Bullish/Bearish/Neutral)
 */
export function ImpactBadge({ impact }) {
  const impactLower = impact?.toLowerCase() || 'neutral';
  
  const config = {
    bullish: { text: 'Bullish for Gold', variant: 'bullish', icon: '↑' },
    bearish: { text: 'Bearish for Gold', variant: 'bearish', icon: '↓' },
    neutral: { text: 'Neutral', variant: 'neutral', icon: '→' },
  };

  const { text, variant, icon } = config[impactLower] || config.neutral;

  return <DataBadge variant={variant} text={text} icon={icon} size="sm" />;
}

/**
 * StatusBadge - Shows connection/data status
 */
export function StatusBadge({ status }) {
  const statusLower = status?.toLowerCase() || 'unknown';
  
  const config = {
    live: { text: 'Live', variant: 'success', pulse: true },
    connected: { text: 'Connected', variant: 'success' },
    disconnected: { text: 'Disconnected', variant: 'error' },
    stale: { text: 'Stale Data', variant: 'warning' },
    loading: { text: 'Loading', variant: 'info', pulse: true },
    error: { text: 'Error', variant: 'error' },
    unknown: { text: 'Unknown', variant: 'neutral' },
  };

  const { text, variant, pulse } = config[statusLower] || config.unknown;

  return <DataBadge variant={variant} text={text} pulse={pulse} size="sm" />;
}

/**
 * ChangeBadge - Shows price/value change with color coding
 */
export function ChangeBadge({ value, suffix = '', prefix = '' }) {
  const numValue = parseFloat(value);
  const isPositive = numValue > 0;
  const isNegative = numValue < 0;
  
  const variant = isPositive ? 'bullish' : isNegative ? 'bearish' : 'neutral';
  const displayValue = isPositive ? `+${value}` : value;
  const icon = isPositive ? '▲' : isNegative ? '▼' : '●';

  return (
    <DataBadge 
      variant={variant} 
      text={`${prefix}${displayValue}${suffix}`} 
      icon={icon}
      size="sm"
    />
  );
}
