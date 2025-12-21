'use client';

/**
 * SMCMarkers - Order Blocks and FVG markers
 * Requirements: 7.2
 */
export default function SMCMarkers({ orderBlocks = [], fvgs = [] }) {
  return (
    <div className="smc-markers">
      <h4 className="smc-title">Smart Money Concepts</h4>
      <div className="smc-grid">
        <div className="smc-section">
          <span className="section-label">Order Blocks</span>
          {orderBlocks.length === 0 ? (
            <span className="no-data">None detected</span>
          ) : (
            orderBlocks.slice(0, 2).map((ob, i) => (
              <div key={i} className={`smc-item ${ob.type}`}>
                <span className="smc-icon">{ob.type === 'bullish_ob' ? '🟢' : '🔴'}</span>
                <span className="smc-range">${ob.low?.toFixed(0)} - ${ob.high?.toFixed(0)}</span>
                {ob.mitigated && <span className="mitigated">✓</span>}
              </div>
            ))
          )}
        </div>
        <div className="smc-section">
          <span className="section-label">Fair Value Gaps</span>
          {fvgs.length === 0 ? (
            <span className="no-data">None detected</span>
          ) : (
            fvgs.slice(0, 2).map((fvg, i) => (
              <div key={i} className={`smc-item ${fvg.type}`}>
                <span className="smc-icon">{fvg.type === 'bullish_fvg' ? '📈' : '📉'}</span>
                <span className="smc-range">${fvg.low?.toFixed(0)} - ${fvg.high?.toFixed(0)}</span>
                {fvg.filled && <span className="filled">Filled</span>}
              </div>
            ))
          )}
        </div>
      </div>
      <style jsx>{`
        .smc-markers { background: var(--dash-bg-tertiary); border-radius: 8px; padding: 0.75rem; }
        .smc-title { font-size: 0.8rem; color: var(--dash-text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
        .smc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .smc-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .section-label { font-size: 0.75rem; color: var(--dash-gold-primary); }
        .smc-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; padding: 0.25rem 0; }
        .smc-icon { font-size: 0.7rem; }
        .smc-range { font-family: 'SF Mono', monospace; color: var(--dash-text-secondary); }
        .mitigated, .filled { font-size: 0.65rem; color: var(--dash-text-muted); background: var(--dash-bg-secondary); padding: 2px 4px; border-radius: 3px; }
        .no-data { font-size: 0.75rem; color: var(--dash-text-muted); }
      `}</style>
    </div>
  );
}
