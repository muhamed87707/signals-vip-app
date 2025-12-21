'use client';

/**
 * ConsensusDisplay - Average institutional price display
 * Requirements: 2.3
 */
export default function ConsensusDisplay({ consensusPrice, count, timeframe = 'Year-End' }) {
  return (
    <div className="consensus-display">
      <div className="consensus-header">
        <span className="consensus-label">Institutional Consensus</span>
        <span className="bank-count">{count} Banks</span>
      </div>
      <div className="consensus-price">
        ${consensusPrice?.toLocaleString() || 'N/A'}
      </div>
      <div className="consensus-timeframe">{timeframe}</div>
      <style jsx>{`
        .consensus-display {
          background: linear-gradient(135deg, var(--dash-gold-primary)15, var(--dash-bg-tertiary));
          border: 1px solid var(--dash-gold-primary)40;
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
        }
        .consensus-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .consensus-label {
          font-size: 0.8rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .bank-count {
          font-size: 0.75rem;
          color: var(--dash-gold-primary);
          background: var(--dash-gold-primary)20;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .consensus-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--dash-gold-primary);
          font-family: 'SF Mono', monospace;
          text-shadow: 0 0 30px var(--dash-gold-primary)40;
        }
        .consensus-timeframe {
          font-size: 0.85rem;
          color: var(--dash-text-secondary);
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}
