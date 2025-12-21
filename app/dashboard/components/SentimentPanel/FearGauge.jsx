'use client';

/**
 * FearGauge - Visual fear/greed gauge
 * Requirements: 5.4
 */
export default function FearGauge({ score, level }) {
  const getGaugeColor = (score) => {
    if (score >= 70) return 'var(--dash-neon-red)';
    if (score >= 50) return 'var(--dash-neutral)';
    if (score >= 30) return 'var(--dash-neon-blue)';
    return 'var(--dash-neon-green)';
  };

  const color = getGaugeColor(score);
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="fear-gauge">
      <div className="gauge-header">
        <span className="gauge-title">Fear Index</span>
      </div>
      <div className="gauge-container">
        <div className="gauge-arc">
          <div className="gauge-fill" style={{ background: `conic-gradient(${color} ${score}%, var(--dash-bg-secondary) 0)` }} />
          <div className="gauge-center">
            <span className="gauge-value" style={{ color }}>{score}</span>
          </div>
        </div>
      </div>
      <div className="gauge-label" style={{ color }}>
        {level || 'Moderate'}
      </div>
      <div className="gauge-scale">
        <span>Greed</span>
        <span>Fear</span>
      </div>
      <style jsx>{`
        .fear-gauge {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
        }
        .gauge-header {
          margin-bottom: 0.5rem;
        }
        .gauge-title {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .gauge-container {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }
        .gauge-arc {
          position: relative;
          width: 120px;
          height: 60px;
          overflow: hidden;
        }
        .gauge-fill {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          transform: rotate(-90deg);
        }
        .gauge-center {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 40px;
          background: var(--dash-bg-tertiary);
          border-radius: 40px 40px 0 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
        }
        .gauge-value {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: 'SF Mono', monospace;
        }
        .gauge-label {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .gauge-scale {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--dash-text-muted);
        }
      `}</style>
    </div>
  );
}
