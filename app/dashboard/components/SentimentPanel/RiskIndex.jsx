'use client';

/**
 * RiskIndex - Keyword breakdown display
 * Requirements: 5.3
 */
export default function RiskIndex({ riskIndex }) {
  const keywords = riskIndex?.keywords || { war: 0, sanctions: 0, tariffs: 0, recession: 0 };
  const maxCount = Math.max(...Object.values(keywords), 1);

  const keywordConfig = {
    war: { label: 'War/Conflict', icon: '⚔️', color: 'var(--dash-neon-red)' },
    sanctions: { label: 'Sanctions', icon: '🚫', color: 'var(--dash-neutral)' },
    tariffs: { label: 'Tariffs', icon: '📦', color: 'var(--dash-neon-blue)' },
    recession: { label: 'Recession', icon: '📉', color: 'var(--dash-neon-purple)' },
  };

  return (
    <div className="risk-index">
      <div className="risk-header">
        <span className="risk-title">Geopolitical Risk Breakdown</span>
        <span className="risk-score">Score: {riskIndex?.score || 0}</span>
      </div>
      <div className="keyword-list">
        {Object.entries(keywords).map(([key, count]) => {
          const config = keywordConfig[key];
          const percentage = (count / maxCount) * 100;
          return (
            <div key={key} className="keyword-item">
              <div className="keyword-header">
                <span className="keyword-icon">{config.icon}</span>
                <span className="keyword-label">{config.label}</span>
                <span className="keyword-count">{count}</span>
              </div>
              <div className="keyword-bar">
                <div 
                  className="keyword-fill" 
                  style={{ width: `${percentage}%`, background: config.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .risk-index {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
        }
        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .risk-title {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .risk-score {
          font-size: 0.8rem;
          color: var(--dash-gold-primary);
          font-weight: 600;
        }
        .keyword-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .keyword-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .keyword-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .keyword-icon {
          font-size: 0.9rem;
        }
        .keyword-label {
          flex: 1;
          font-size: 0.8rem;
          color: var(--dash-text-secondary);
        }
        .keyword-count {
          font-size: 0.8rem;
          color: var(--dash-text-primary);
          font-weight: 600;
          font-family: 'SF Mono', monospace;
        }
        .keyword-bar {
          height: 6px;
          background: var(--dash-bg-secondary);
          border-radius: 3px;
          overflow: hidden;
        }
        .keyword-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
}
