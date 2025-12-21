'use client';

/**
 * BiasIndicator - Displays market bias (Bullish/Bearish/Neutral)
 * @param {Object} props
 * @param {string} props.bias - 'bullish', 'bearish', or 'neutral'
 * @param {number} props.confidence - Confidence percentage (0-100)
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} props.showLabel - Whether to show the "Current Bias" label
 * @param {boolean} props.animated - Whether to animate the indicator
 */
export default function BiasIndicator({
  bias = 'neutral',
  confidence,
  size = 'md',
  showLabel = true,
  animated = true,
}) {
  const biasLower = bias.toLowerCase();
  
  const biasConfig = {
    bullish: {
      label: 'BULLISH',
      icon: '📈',
      color: 'var(--dash-neon-green)',
      bgColor: 'rgba(0, 255, 136, 0.1)',
      borderColor: 'rgba(0, 255, 136, 0.3)',
    },
    bearish: {
      label: 'BEARISH',
      icon: '📉',
      color: 'var(--dash-neon-red)',
      bgColor: 'rgba(255, 68, 68, 0.1)',
      borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    neutral: {
      label: 'NEUTRAL',
      icon: '➡️',
      color: 'var(--dash-neutral)',
      bgColor: 'rgba(255, 215, 0, 0.1)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
  };

  const config = biasConfig[biasLower] || biasConfig.neutral;

  const sizeStyles = {
    sm: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      iconSize: '1.25rem',
    },
    md: {
      padding: '1.5rem 2rem',
      fontSize: '1.5rem',
      iconSize: '1.5rem',
    },
    lg: {
      padding: '2rem 3rem',
      fontSize: '2rem',
      iconSize: '2rem',
    },
  };

  const styles = sizeStyles[size] || sizeStyles.md;

  return (
    <div 
      className={`bias-indicator ${biasLower} ${animated ? 'animated' : ''}`}
      style={{
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        padding: styles.padding,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: size === 'sm' ? '100px' : '150px',
        transition: 'all 0.3s ease',
      }}
    >
      {showLabel && (
        <span 
          className="bias-label"
          style={{
            fontSize: '0.75rem',
            color: 'var(--dash-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Current Bias
        </span>
      )}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '0.5rem 0',
        }}
      >
        <span style={{ fontSize: styles.iconSize }}>{config.icon}</span>
        <span 
          className="bias-value"
          style={{
            fontSize: styles.fontSize,
            fontWeight: 800,
            color: config.color,
            textShadow: animated ? `0 0 20px ${config.color}40` : 'none',
          }}
        >
          {config.label}
        </span>
      </div>
      {confidence !== undefined && (
        <div style={{ width: '100%', marginTop: '0.5rem' }}>
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--dash-text-muted)',
              marginBottom: '0.25rem',
            }}
          >
            <span>Confidence</span>
            <span style={{ color: config.color }}>{confidence}%</span>
          </div>
          <div 
            style={{
              height: '4px',
              background: 'var(--dash-bg-tertiary)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div 
              style={{
                height: '100%',
                width: `${confidence}%`,
                background: config.color,
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * MiniBiasIndicator - Compact version for inline use
 */
export function MiniBiasIndicator({ bias = 'neutral' }) {
  const biasLower = bias.toLowerCase();
  
  const config = {
    bullish: { label: 'Bullish', color: 'var(--dash-neon-green)', icon: '▲' },
    bearish: { label: 'Bearish', color: 'var(--dash-neon-red)', icon: '▼' },
    neutral: { label: 'Neutral', color: 'var(--dash-neutral)', icon: '●' },
  };

  const { label, color, icon } = config[biasLower] || config.neutral;

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.5rem',
        background: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: color,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
