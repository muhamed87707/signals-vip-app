'use client';

/**
 * InflationFeed - CPI/PPI/PCE data display
 * Requirements: 3.5
 */
export default function InflationFeed({ inflation }) {
  const data = [
    { 
      label: 'CPI', 
      value: inflation?.cpi?.value || 3.2, 
      impact: inflation?.cpi?.impact || 'Bullish',
      date: inflation?.cpi?.date || 'N/A',
    },
    { 
      label: 'PPI', 
      value: inflation?.ppi?.value || 2.1, 
      impact: inflation?.ppi?.impact || 'Neutral',
      date: inflation?.ppi?.date || 'N/A',
    },
    { 
      label: 'PCE', 
      value: inflation?.pce?.value || 2.8, 
      impact: inflation?.pce?.impact || 'Neutral',
      date: inflation?.pce?.date || 'N/A',
    },
  ];

  const impactColors = {
    Bullish: 'var(--dash-neon-green)',
    Bearish: 'var(--dash-neon-red)',
    Neutral: 'var(--dash-neutral)',
  };

  return (
    <div className="inflation-feed">
      <div className="feed-header">
        <span className="feed-title">📊 Inflation Data</span>
      </div>
      <div className="inflation-items">
        {data.map((item) => (
          <div key={item.label} className="inflation-item">
            <div className="item-header">
              <span className="item-label">{item.label}</span>
              <span 
                className="item-impact"
                style={{ 
                  color: impactColors[item.impact],
                  background: `${impactColors[item.impact]}20`,
                }}
              >
                {item.impact}
              </span>
            </div>
            <div className="item-value">{item.value}%</div>
            <div className="item-date">{item.date}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .inflation-feed {
          background: var(--dash-bg-tertiary);
          border-radius: 12px;
          padding: 1rem;
        }
        .feed-header {
          margin-bottom: 1rem;
        }
        .feed-title {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .inflation-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .inflation-item {
          padding: 0.75rem;
          background: var(--dash-bg-secondary);
          border-radius: 8px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .item-label {
          font-size: 0.8rem;
          color: var(--dash-text-muted);
          font-weight: 600;
        }
        .item-impact {
          font-size: 0.7rem;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .item-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dash-text-primary);
          font-family: 'SF Mono', monospace;
        }
        .item-date {
          font-size: 0.7rem;
          color: var(--dash-text-muted);
        }
      `}</style>
    </div>
  );
}
