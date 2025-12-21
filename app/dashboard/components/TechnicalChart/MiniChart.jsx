'use client';

/**
 * MiniChart - Price chart with levels visualization
 * Requirements: 7.1, 7.3
 */
export default function MiniChart({ currentPrice = 2650, supply = [], demand = [] }) {
  const allLevels = [...supply.map(z => z.high), ...supply.map(z => z.low), ...demand.map(z => z.high), ...demand.map(z => z.low), currentPrice];
  const maxPrice = Math.max(...allLevels) * 1.01;
  const minPrice = Math.min(...allLevels) * 0.99;
  const range = maxPrice - minPrice;

  const getY = (price) => ((maxPrice - price) / range) * 100;

  return (
    <div className="mini-chart">
      <div className="chart-area">
        {/* Supply zones */}
        {supply.map((zone, i) => (
          <div key={`s-${i}`} className="zone supply-zone" style={{ top: `${getY(zone.high)}%`, height: `${((zone.high - zone.low) / range) * 100}%` }}>
            <span className="zone-label">${zone.high.toFixed(0)}</span>
          </div>
        ))}
        {/* Demand zones */}
        {demand.map((zone, i) => (
          <div key={`d-${i}`} className="zone demand-zone" style={{ top: `${getY(zone.high)}%`, height: `${((zone.high - zone.low) / range) * 100}%` }}>
            <span className="zone-label">${zone.low.toFixed(0)}</span>
          </div>
        ))}
        {/* Current price line */}
        <div className="price-line" style={{ top: `${getY(currentPrice)}%` }}>
          <span className="price-label">${currentPrice.toFixed(2)}</span>
        </div>
      </div>
      <style jsx>{`
        .mini-chart { background: var(--dash-bg-tertiary); border-radius: 10px; padding: 1rem; height: 200px; }
        .chart-area { position: relative; height: 100%; }
        .zone { position: absolute; left: 0; right: 0; opacity: 0.3; }
        .supply-zone { background: var(--dash-neon-red); }
        .demand-zone { background: var(--dash-neon-green); }
        .zone-label { position: absolute; right: 5px; top: 2px; font-size: 0.7rem; color: var(--dash-text-secondary); }
        .price-line { position: absolute; left: 0; right: 0; height: 2px; background: var(--dash-gold-primary); }
        .price-label { position: absolute; right: 0; top: -10px; background: var(--dash-gold-primary); color: var(--dash-bg-primary); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
      `}</style>
    </div>
  );
}
