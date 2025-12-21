'use client';

/**
 * Heatmap - Monthly heat map for seasonality
 * Requirements: 10.1, 10.2
 */
export default function Heatmap({ months = [] }) {
  const getColor = (avg) => {
    if (avg >= 2) return 'rgba(0, 255, 136, 0.8)';
    if (avg >= 1) return 'rgba(0, 255, 136, 0.5)';
    if (avg >= 0) return 'rgba(0, 255, 136, 0.2)';
    if (avg >= -1) return 'rgba(255, 68, 68, 0.3)';
    return 'rgba(255, 68, 68, 0.6)';
  };

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {months.map((m, i) => (
          <div
            key={i}
            className="heatmap-cell"
            style={{ backgroundColor: getColor(m.avg) }}
            title={`${m.month}: ${m.avg > 0 ? '+' : ''}${m.avg}% avg, ${m.positive}% positive`}
          >
            <span className="cell-month">{m.month}</span>
            <span className="cell-value">{m.avg > 0 ? '+' : ''}{m.avg}%</span>
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="legend-item"><span className="legend-color" style={{ background: 'rgba(0, 255, 136, 0.8)' }}></span>Strong Bullish</span>
        <span className="legend-item"><span className="legend-color" style={{ background: 'rgba(255, 68, 68, 0.6)' }}></span>Strong Bearish</span>
      </div>
      <style jsx>{`
        .heatmap { background: var(--dash-bg-tertiary); border-radius: 10px; padding: 1rem; }
        .heatmap-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
        .heatmap-cell { padding: 0.5rem; border-radius: 6px; text-align: center; cursor: pointer; transition: transform 0.2s; }
        .heatmap-cell:hover { transform: scale(1.05); }
        .cell-month { display: block; font-size: 0.7rem; color: var(--dash-text-primary); font-weight: 600; }
        .cell-value { display: block; font-size: 0.75rem; font-family: 'SF Mono', monospace; color: var(--dash-text-primary); }
        .heatmap-legend { display: flex; justify-content: center; gap: 1rem; margin-top: 0.75rem; }
        .legend-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; color: var(--dash-text-muted); }
        .legend-color { width: 12px; height: 12px; border-radius: 3px; }
      `}</style>
    </div>
  );
}
