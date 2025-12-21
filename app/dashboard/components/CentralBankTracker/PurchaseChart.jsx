'use client';

/**
 * PurchaseChart - Tonnage chart for central bank purchases
 * Requirements: 9.1
 */
export default function PurchaseChart({ purchases = [] }) {
  const maxYtd = Math.max(...purchases.map(p => p.ytd), 1);

  return (
    <div className="purchase-chart">
      <h4 className="chart-title">YTD Gold Purchases (tonnes)</h4>
      <div className="chart-bars">
        {purchases.slice(0, 5).map((p, i) => (
          <div key={i} className="bar-row">
            <span className="bar-label">{p.flag} {p.country}</span>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: `${(p.ytd / maxYtd) * 100}%` }}>
                <span className="bar-value">+{p.ytd}t</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .purchase-chart { background: var(--dash-bg-tertiary); border-radius: 10px; padding: 1rem; }
        .chart-title { font-size: 0.8rem; color: var(--dash-text-muted); margin-bottom: 1rem; text-transform: uppercase; }
        .chart-bars { display: flex; flex-direction: column; gap: 0.75rem; }
        .bar-row { display: flex; align-items: center; gap: 0.75rem; }
        .bar-label { font-size: 0.8rem; color: var(--dash-text-secondary); min-width: 100px; white-space: nowrap; }
        .bar-container { flex: 1; height: 24px; background: var(--dash-bg-secondary); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; background: linear-gradient(90deg, var(--dash-gold-primary), var(--dash-gold-secondary)); display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; min-width: 50px; transition: width 0.5s; }
        .bar-value { font-size: 0.75rem; font-weight: 600; color: var(--dash-bg-primary); }
      `}</style>
    </div>
  );
}
