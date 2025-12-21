'use client';

/**
 * YieldCharts - Displays bond yield data
 * Requirements: 3.1
 */
export default function YieldCharts({ yields }) {
  const yieldData = [
    { label: '2Y', value: yields?.us02y || 0, color: 'var(--dash-neon-blue)' },
    { label: '10Y', value: yields?.us10y || 0, color: 'var(--dash-gold-primary)' },
    { label: '30Y', value: yields?.us30y || 0, color: 'var(--dash-neon-purple)' },
  ];

  const maxYield = Math.max(...yieldData.map(d => d.value), 5);

  return (
    <div className="yield-charts">
      <div className="chart-header">
        <span className="chart-title">Treasury Yields</span>
      </div>
      <div className="yield-bars">
        {yieldData.map((item) => (
          <div key={item.label} className="yield-bar-container">
            <div className="yield-label">{item.label}</div>
            <div className="yield-bar-wrapper">
              <div 
                className="yield-bar"
                style={{ 
                  width: `${(item.value / maxYield) * 100}%`,
                  background: item.color,
                }}
              />
            </div>
            <div className="yield-value" style={{ color: item.color }}>
              {item.value.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
      <div className="yield-spread">
        <span className="spread-label">2s10s Spread:</span>
        <span className={`spread-value ${(yields?.us10y - yields?.us02y) < 0 ? 'inverted' : ''}`}>
          {((yields?.us10y || 0) - (yields?.us02y || 0)).toFixed(2)}%
          {(yields?.us10y - yields?.us02y) < 0 && ' (Inverted)'}
        </span>
      </div>
      <style jsx>{`
        .yield-charts {
          background: var(--dash-bg-tertiary);
          border-radius: 12px;
          padding: 1rem;
        }
        .chart-header {
          margin-bottom: 1rem;
        }
        .chart-title {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .yield-bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .yield-bar-container {
          display: grid;
          grid-template-columns: 40px 1fr 60px;
          align-items: center;
          gap: 0.5rem;
        }
        .yield-label {
          font-size: 0.85rem;
          color: var(--dash-text-secondary);
          font-weight: 600;
        }
        .yield-bar-wrapper {
          height: 8px;
          background: var(--dash-bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .yield-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .yield-value {
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'SF Mono', monospace;
          text-align: right;
        }
        .yield-spread {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--dash-border-primary);
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .spread-label {
          color: var(--dash-text-muted);
        }
        .spread-value {
          color: var(--dash-text-primary);
          font-weight: 600;
        }
        .spread-value.inverted {
          color: var(--dash-neon-red);
        }
      `}</style>
    </div>
  );
}
