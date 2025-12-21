'use client';

/**
 * LevelMarkers - Supply/Demand zone markers
 * Requirements: 7.1
 */
export default function LevelMarkers({ title, zones = [], type }) {
  const isSupply = type === 'supply';

  return (
    <div className="level-markers">
      <h4 className="markers-title">{title}</h4>
      <div className="markers-list">
        {zones.length === 0 ? (
          <div className="no-zones">No zones detected</div>
        ) : (
          zones.slice(0, 3).map((zone, i) => (
            <div key={i} className={`marker-item ${isSupply ? 'supply' : 'demand'}`}>
              <div className="marker-range">
                <span className="marker-high">${zone.high?.toFixed(0)}</span>
                <span className="marker-sep">-</span>
                <span className="marker-low">${zone.low?.toFixed(0)}</span>
              </div>
              <div className="marker-meta">
                <span className="strength" style={{ width: `${zone.strength}%` }}></span>
                {zone.tested > 0 && <span className="tested">Tested {zone.tested}x</span>}
              </div>
            </div>
          ))
        )}
      </div>
      <style jsx>{`
        .level-markers { background: var(--dash-bg-tertiary); border-radius: 8px; padding: 0.75rem; }
        .markers-title { font-size: 0.8rem; color: var(--dash-text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
        .markers-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .marker-item { padding: 0.5rem; border-radius: 6px; border-left: 3px solid; }
        .marker-item.supply { border-color: var(--dash-neon-red); background: rgba(255, 68, 68, 0.1); }
        .marker-item.demand { border-color: var(--dash-neon-green); background: rgba(0, 255, 136, 0.1); }
        .marker-range { display: flex; align-items: center; gap: 0.25rem; font-family: 'SF Mono', monospace; font-size: 0.85rem; }
        .marker-high, .marker-low { color: var(--dash-text-primary); }
        .marker-sep { color: var(--dash-text-muted); }
        .marker-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
        .strength { height: 3px; background: var(--dash-gold-primary); border-radius: 2px; }
        .tested { font-size: 0.7rem; color: var(--dash-text-muted); }
        .no-zones { font-size: 0.8rem; color: var(--dash-text-muted); text-align: center; padding: 1rem; }
      `}</style>
    </div>
  );
}
