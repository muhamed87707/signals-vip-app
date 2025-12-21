'use client';

/**
 * ForecastCard - Individual bank forecast display
 * Requirements: 2.2
 */
export default function ForecastCard({ forecast }) {
  const { bankName, forecastPrice, timeframe, analystLogic } = forecast;

  return (
    <div className="forecast-card">
      <div className="card-header">
        <span className="bank-name">{bankName}</span>
        <span className="timeframe">{timeframe}</span>
      </div>
      <div className="forecast-price">${forecastPrice?.toLocaleString()}</div>
      <div className="analyst-logic">{analystLogic}</div>
      <style jsx>{`
        .forecast-card {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
          border-left: 3px solid var(--dash-gold-primary);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .bank-name {
          font-weight: 600;
          color: var(--dash-text-primary);
          font-size: 0.9rem;
        }
        .timeframe {
          font-size: 0.75rem;
          color: var(--dash-text-muted);
          background: var(--dash-bg-secondary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .forecast-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dash-gold-primary);
          font-family: 'SF Mono', monospace;
          margin-bottom: 0.5rem;
        }
        .analyst-logic {
          font-size: 0.8rem;
          color: var(--dash-text-secondary);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
