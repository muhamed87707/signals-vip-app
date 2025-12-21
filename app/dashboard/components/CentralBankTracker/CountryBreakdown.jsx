'use client';

/**
 * CountryBreakdown - Country-by-country breakdown
 * Requirements: 9.2
 */
export default function CountryBreakdown({ purchases = [] }) {
  return (
    <div className="country-breakdown">
      <h4 className="breakdown-title">Monthly Activity</h4>
      <div className="breakdown-list">
        {purchases.slice(0, 6).map((p, i) => (
          <div key={i} className="breakdown-item">
            <div className="country-info">
              <span className="country-flag">{p.flag}</span>
              <div className="country-details">
                <span className="country-name">{p.country}</span>
                <span className="bank-name">{p.bank}</span>
              </div>
            </div>
            <div className="purchase-info">
              <span className="monthly">+{p.monthly}t/mo</span>
              <span className="total">{p.totalHoldings}t total</span>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .country-breakdown { background: var(--dash-bg-tertiary); border-radius: 10px; padding: 1rem; }
        .breakdown-title { font-size: 0.8rem; color: var(--dash-text-muted); margin-bottom: 0.75rem; text-transform: uppercase; }
        .breakdown-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .breakdown-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--dash-bg-secondary); border-radius: 6px; }
        .country-info { display: flex; align-items: center; gap: 0.5rem; }
        .country-flag { font-size: 1.2rem; }
        .country-details { display: flex; flex-direction: column; }
        .country-name { font-size: 0.85rem; color: var(--dash-text-primary); }
        .bank-name { font-size: 0.7rem; color: var(--dash-text-muted); }
        .purchase-info { text-align: right; }
        .monthly { display: block; font-size: 0.85rem; color: var(--dash-neon-green); font-family: 'SF Mono', monospace; }
        .total { font-size: 0.7rem; color: var(--dash-text-muted); }
      `}</style>
    </div>
  );
}
