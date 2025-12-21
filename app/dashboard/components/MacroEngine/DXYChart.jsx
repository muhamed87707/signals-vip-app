'use client';

/**
 * DXYChart - Dollar Index display
 * Requirements: 3.3
 */
export default function DXYChart({ dxy }) {
  const changeColor = (dxy?.change || 0) >= 0 ? 'var(--dash-neon-green)' : 'var(--dash-neon-red)';
  const goldImpact = (dxy?.change || 0) < 0 ? 'Bullish' : (dxy?.change || 0) > 0 ? 'Bearish' : 'Neutral';

  return (
    <div className="dxy-chart">
      <div className="dxy-header">
        <span className="dxy-label">💵 DXY (Dollar Index)</span>
      </div>
      <div className="dxy-value">
        {(dxy?.value || 104.25).toFixed(2)}
      </div>
      <div className="dxy-change" style={{ color: changeColor }}>
        {(dxy?.change || 0) >= 0 ? '+' : ''}{(dxy?.change || 0).toFixed(2)} 
        ({(dxy?.changePercent || 0) >= 0 ? '+' : ''}{(dxy?.changePercent || 0).toFixed(2)}%)
      </div>
      <div className="dxy-impact">
        <span className="impact-label">Gold Impact:</span>
        <span className={`impact-value ${goldImpact.toLowerCase()}`}>{goldImpact}</span>
      </div>
      <style jsx>{`
        .dxy-chart {
          background: var(--dash-bg-tertiary);
          border-radius: 12px;
          padding: 1rem;
        }
        .dxy-header {
          margin-bottom: 0.5rem;
        }
        .dxy-label {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .dxy-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--dash-text-primary);
          font-family: 'SF Mono', monospace;
        }
        .dxy-change {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .dxy-impact {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid var(--dash-border-primary);
          font-size: 0.85rem;
        }
        .impact-label {
          color: var(--dash-text-muted);
        }
        .impact-value {
          font-weight: 600;
        }
        .impact-value.bullish { color: var(--dash-neon-green); }
        .impact-value.bearish { color: var(--dash-neon-red); }
        .impact-value.neutral { color: var(--dash-neutral); }
      `}</style>
    </div>
  );
}
