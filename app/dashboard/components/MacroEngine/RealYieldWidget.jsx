'use client';

/**
 * RealYieldWidget - Displays real yield calculation
 * Requirements: 3.4
 */
export default function RealYieldWidget({ realYield, nominal10Y, inflation }) {
  const impact = realYield < 0 ? 'Bullish' : realYield > 1 ? 'Bearish' : 'Neutral';
  const impactColor = {
    Bullish: 'var(--dash-neon-green)',
    Bearish: 'var(--dash-neon-red)',
    Neutral: 'var(--dash-neutral)',
  }[impact];

  return (
    <div className="real-yield-widget">
      <div className="widget-header">
        <span className="widget-label">Real Yield</span>
        <span className="widget-formula">(10Y - Inflation)</span>
      </div>
      <div className="widget-value" style={{ color: impactColor }}>
        {realYield >= 0 ? '+' : ''}{realYield?.toFixed(2)}%
      </div>
      <div className="widget-breakdown">
        <div className="breakdown-item">
          <span>10Y Nominal</span>
          <span>{nominal10Y?.toFixed(2)}%</span>
        </div>
        <div className="breakdown-item">
          <span>Inflation</span>
          <span>{inflation?.toFixed(2)}%</span>
        </div>
      </div>
      <div className="widget-impact" style={{ background: `${impactColor}20`, borderColor: impactColor }}>
        <span style={{ color: impactColor }}>{impact} for Gold</span>
      </div>
      <style jsx>{`
        .real-yield-widget {
          background: var(--dash-bg-tertiary);
          border-radius: 12px;
          padding: 1rem;
        }
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .widget-label {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .widget-formula {
          font-size: 0.7rem;
          color: var(--dash-text-muted);
        }
        .widget-value {
          font-size: 2rem;
          font-weight: 700;
          font-family: 'SF Mono', monospace;
          margin-bottom: 0.75rem;
        }
        .widget-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.75rem;
          font-size: 0.8rem;
        }
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          color: var(--dash-text-secondary);
        }
        .widget-impact {
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
