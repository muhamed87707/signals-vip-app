'use client';

/**
 * Histogram - Longs vs Shorts visualization
 * Requirements: 4.2
 */
export default function Histogram({ longPercentage, shortPercentage, managedMoneyLong, managedMoneyShort }) {
  return (
    <div className="cot-histogram">
      <div className="histogram-header">
        <span className="histogram-title">Managed Money Positioning</span>
      </div>
      <div className="histogram-bar">
        <div 
          className="bar-longs" 
          style={{ width: `${longPercentage}%` }}
        >
          <span className="bar-label">Longs {longPercentage}%</span>
        </div>
        <div 
          className="bar-shorts" 
          style={{ width: `${shortPercentage}%` }}
        >
          <span className="bar-label">Shorts {shortPercentage}%</span>
        </div>
      </div>
      <div className="histogram-values">
        <div className="value-item longs">
          <span className="value-label">Long Contracts</span>
          <span className="value-number">{managedMoneyLong?.toLocaleString()}</span>
        </div>
        <div className="value-item shorts">
          <span className="value-label">Short Contracts</span>
          <span className="value-number">{managedMoneyShort?.toLocaleString()}</span>
        </div>
      </div>
      <style jsx>{`
        .cot-histogram {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
        }
        .histogram-header {
          margin-bottom: 0.75rem;
        }
        .histogram-title {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .histogram-bar {
          display: flex;
          height: 36px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .bar-longs {
          background: var(--dash-neon-green);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          transition: width 0.5s ease;
        }
        .bar-shorts {
          background: var(--dash-neon-red);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          transition: width 0.5s ease;
        }
        .bar-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .histogram-values {
          display: flex;
          justify-content: space-between;
        }
        .value-item {
          display: flex;
          flex-direction: column;
        }
        .value-label {
          font-size: 0.75rem;
          color: var(--dash-text-muted);
        }
        .value-number {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'SF Mono', monospace;
        }
        .value-item.longs .value-number {
          color: var(--dash-neon-green);
        }
        .value-item.shorts .value-number {
          color: var(--dash-neon-red);
        }
      `}</style>
    </div>
  );
}
