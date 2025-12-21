'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import YieldCharts from './YieldCharts';
import RealYieldWidget from './RealYieldWidget';
import DXYChart from './DXYChart';
import InflationFeed from './InflationFeed';

/**
 * MacroEngine - Main container for macro analysis
 * Requirements: 3.1, 3.3, 3.4, 3.5
 */
export default function MacroEngine() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [yieldsRes, dxyRes] = await Promise.all([
        fetch('/api/dashboard/market/yields'),
        fetch('/api/dashboard/market/dxy'),
      ]);

      const yieldsData = await yieldsRes.json();
      const dxyData = await dxyRes.json();

      setData({
        yields: yieldsData.data?.yields,
        realYield: yieldsData.data?.realYield,
        dxy: dxyData.data,
        inflation: {
          cpi: { value: 3.2, impact: 'Bullish', date: '2024-12' },
          ppi: { value: 2.1, impact: 'Neutral', date: '2024-12' },
          pce: { value: 2.8, impact: 'Neutral', date: '2024-11' },
        },
      });
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ModuleCard
      id="macro-engine"
      title="Macro Engine"
      icon="📊"
      onRefresh={fetchData}
      updateTime={formatUpdateTime(lastUpdate)}
    >
      {loading && !data ? (
        <LoadingState message="Loading macro data..." />
      ) : error && !data ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <div className="macro-grid">
          <YieldCharts yields={data?.yields} />
          <RealYieldWidget 
            realYield={data?.realYield?.realYield}
            nominal10Y={data?.realYield?.nominal10Y}
            inflation={data?.realYield?.breakevenInflation}
          />
          <DXYChart dxy={data?.dxy} />
          <InflationFeed inflation={data?.inflation} />
        </div>
      )}
      <style jsx>{`
        .macro-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .macro-grid {
            grid-template-columns: 1fr;
          }
        }
        .error-state {
          text-align: center;
          padding: 2rem;
          color: var(--dash-text-muted);
        }
        .error-state button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--dash-gold-primary);
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </ModuleCard>
  );
}
