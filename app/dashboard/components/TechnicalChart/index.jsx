'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import MiniChart from './MiniChart';
import LevelMarkers from './LevelMarkers';
import SMCMarkers from './SMCMarkers';

/**
 * TechnicalChart - Main container for technical analysis
 * Requirements: 7.1, 7.2, 7.3
 */
export default function TechnicalChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('H4');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard/technical/levels?timeframe=${timeframe}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch technical data');
      setData(result.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUpdateTime = (date) => date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '';

  return (
    <ModuleCard id="technical" title="Technical Analysis" icon="📉" onRefresh={fetchData} updateTime={formatUpdateTime(lastUpdate)}>
      {loading && !data ? (
        <LoadingState message="Loading technical levels..." />
      ) : error && !data ? (
        <div className="error-state"><p>⚠️ {error}</p><button onClick={fetchData}>Retry</button></div>
      ) : (
        <div className="technical-content">
          <div className="timeframe-selector">
            {['H1', 'H4', 'D1'].map(tf => (
              <button key={tf} className={`tf-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>{tf}</button>
            ))}
          </div>
          <MiniChart currentPrice={data?.currentPrice} supply={data?.supply} demand={data?.demand} />
          <div className="levels-grid">
            <LevelMarkers title="Supply Zones" zones={data?.supply} type="supply" />
            <LevelMarkers title="Demand Zones" zones={data?.demand} type="demand" />
          </div>
          <SMCMarkers orderBlocks={data?.orderBlocks} fvgs={data?.fvgs} />
        </div>
      )}
      <style jsx>{`
        .technical-content { display: flex; flex-direction: column; gap: 1rem; }
        .timeframe-selector { display: flex; gap: 0.5rem; }
        .tf-btn { padding: 0.4rem 0.8rem; background: var(--dash-bg-tertiary); border: 1px solid var(--dash-border); border-radius: 6px; color: var(--dash-text-secondary); cursor: pointer; font-size: 0.8rem; }
        .tf-btn:hover { border-color: var(--dash-gold-primary); }
        .tf-btn.active { background: var(--dash-gold-primary); color: var(--dash-bg-primary); }
        .levels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .error-state { text-align: center; padding: 2rem; color: var(--dash-text-muted); }
        .error-state button { margin-top: 1rem; padding: 0.5rem 1rem; background: var(--dash-gold-primary); border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </ModuleCard>
  );
}
