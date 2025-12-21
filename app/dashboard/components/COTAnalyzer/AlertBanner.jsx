'use client';

/**
 * AlertBanner - Overcrowded trade alert
 * Requirements: 4.3
 */
export default function AlertBanner({ alert }) {
  if (!alert) return null;

  const severityColors = {
    high: { bg: 'var(--dash-neon-red)20', border: 'var(--dash-neon-red)', text: 'var(--dash-neon-red)' },
    medium: { bg: 'var(--dash-neutral)20', border: 'var(--dash-neutral)', text: 'var(--dash-neutral)' },
    low: { bg: 'var(--dash-neon-blue)20', border: 'var(--dash-neon-blue)', text: 'var(--dash-neon-blue)' },
  };

  const colors = severityColors[alert.severity] || severityColors.medium;

  return (
    <div 
      className="alert-banner"
      style={{ 
        background: colors.bg, 
        borderColor: colors.border,
      }}
    >
      <span className="alert-icon">⚠️</span>
      <span className="alert-message" style={{ color: colors.text }}>
        {alert.message}
      </span>
      <style jsx>{`
        .alert-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid;
          animation: pulse 2s infinite;
        }
        .alert-icon {
          font-size: 1.25rem;
        }
        .alert-message {
          font-size: 0.9rem;
          font-weight: 600;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
