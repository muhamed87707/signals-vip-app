'use client';

/**
 * ResultDisplay - Price projection result display
 * Requirements: 8.2, 8.3
 */
export default function ResultDisplay({ result }) {
  if (!result) return null;

  const { currentPrice, projectedPrice, totalImpact, percentChange, confidence, explanation } = result;
  const isPositive = totalImpact >= 0;

  return (
    <div className="result-display">
      <div className="result-main">
        <div className="price-projection">
          <span className="projection-label">Projected Price</span>
          <span className={`projection-value ${isPositive ? 'positive' : 'negative'}`}>
            ${projectedPrice?.toLocaleString()}
          </span>
          <span className={`projection-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{totalImpact?.toFixed(2)} ({percentChange > 0 ? '+' : ''}{percentChange}%)
          </span>
        </div>
        <div className="confidence-meter">
          <span className="confidence-label">Confidence</span>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: `${confidence}%` }}></div>
          </div>
          <span className="confidence-value">{confidence}%</span>
        </div>
      </div>
      {explanation && (
        <div className="result-explanation">
          <span className="explanation-icon">💡</span>
          <p>{explanation}</p>
        </div>
      )}
      <style jsx>{`
        .result-display { background: var(--dash-bg-tertiary); border-radius: 10px; padding: 1rem; }
        .result-main { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .price-projection { display: flex; flex-direction: column; align-items: center; }
        .projection-label { font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; }
        .projection-value { font-size: 2rem; font-weight: 800; font-family: 'SF Mono', monospace; }
        .projection-value.positive { color: var(--dash-neon-green); }
        .projection-value.negative { color: var(--dash-neon-red); }
        .projection-change { font-size: 0.85rem; font-family: 'SF Mono', monospace; }
        .projection-change.positive { color: var(--dash-neon-green); }
        .projection-change.negative { color: var(--dash-neon-red); }
        .confidence-meter { display: flex; flex-direction: column; justify-content: center; }
        .confidence-label { font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
        .confidence-bar { height: 8px; background: var(--dash-bg-secondary); border-radius: 4px; overflow: hidden; }
        .confidence-fill { height: 100%; background: var(--dash-gold-primary); transition: width 0.3s; }
        .confidence-value { font-size: 0.85rem; color: var(--dash-gold-primary); margin-top: 0.25rem; text-align: right; }
        .result-explanation { display: flex; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--dash-border); }
        .explanation-icon { font-size: 1rem; }
        .result-explanation p { font-size: 0.8rem; color: var(--dash-text-secondary); line-height: 1.4; margin: 0; }
      `}</style>
    </div>
  );
}
