'use client';

import { useState, useEffect } from 'react';
import ModuleCard from '../ModuleCard';
import Heatmap from './Heatmap';
import { getSeasonalityData, getCurrentMonthSeasonality, getBestWorstMonths } from '@/lib/calculations/seasonality';

/**
 * Seasonality - Main container for seasonality analysis
 * Requirements: 10.1, 10.2
 */
export default function Seasonality() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const seasonalData = getSeasonalityData();
    const currentMonth = getCurrentMonthSeasonality();
    const bestWorst = getBestWorstMonths();
    setData({ months: seasonalData, current: currentMonth, bestWorst });
  }, []);

  return (
    <ModuleCard id="seasonality" title="Seasonality" icon="📅">
      {data && (
        <div className="seasonality-content">
          <div className="current-month">
            <span className="current-label">Current Month ({data.current.month})</span>
            <span className={`current-value ${data.current.avg >= 0 ? 'positive' : 'negative'}`}>
              {data.current.avg > 0 ? '+' : ''}{data.current.avg}% avg
            </span>
            <span className="win-rate">{data.current.positive}% positive years</span>
          </div>
          <Heatmap months={data.months} />
          <div className="best-worst">
            <div className="best">
              <span className="bw-label">Best Months</span>
              {data.bestWorst.best.map((m, i) => (
                <span key={i} className="bw-item positive">{m.month} (+{m.avg}%)</span>
              ))}
            </div>
            <div className="worst">
              <span className="bw-label">Worst Months</span>
              {data.bestWorst.worst.map((m, i) => (
                <span key={i} className="bw-item negative">{m.month} ({m.avg}%)</span>
              ))}
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .seasonality-content { display: flex; flex-direction: column; gap: 1rem; }
        .current-month { background: var(--dash-bg-tertiary); border-radius: 10px; padding: 1rem; text-align: center; }
        .current-label { display: block; font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
        .current-value { display: block; font-size: 1.5rem; font-weight: 700; font-family: 'SF Mono', monospace; }
        .current-value.positive { color: var(--dash-neon-green); }
        .current-value.negative { color: var(--dash-neon-red); }
        .win-rate { font-size: 0.8rem; color: var(--dash-text-secondary); }
        .best-worst { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .best, .worst { background: var(--dash-bg-tertiary); border-radius: 8px; padding: 0.75rem; }
        .bw-label { display: block; font-size: 0.7rem; color: var(--dash-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
        .bw-item { display: block; font-size: 0.8rem; font-family: 'SF Mono', monospace; }
        .bw-item.positive { color: var(--dash-neon-green); }
        .bw-item.negative { color: var(--dash-neon-red); }
      `}</style>
    </ModuleCard>
  );
}
