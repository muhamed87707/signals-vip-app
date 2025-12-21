'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import PurchaseChart from './PurchaseChart';
import CountryBreakdown from './CountryBreakdown';

/**
 * CentralBankTracker - Main container for central bank gold tracking
 * Requirements: 9.1, 9.2, 9.3
 */
export default function CentralBankTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/dashboard/central-banks/purchases');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch data');
      setData(result.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUpdateTime = (date) => date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '';

  return (
    <ModuleCard id="central-banks" title="Central Bank Tracker" icon="🏛️" onRefresh={fetchData} updateTime={formatUpdateTime(lastUpdate)}>
      {loading && !data ? (
        <LoadingState message="Loading central bank data..." />
      ) : error && !data ? (
        <div className="error-state"><p>⚠️ {error}</p><button onClick={fetchData}>Retry</button></div>
      ) : (
        <div className="cb-content">
          <div className="cb-stats">
            <div className="stat"><span className="stat-value">{data?.globalStats?.ytdNetPurchases}t</span><span className="stat-label">YTD Net Purchases</span></div>
            <div className="stat"><span className="stat-value">{data?.globalStats?.buyingCountries}</span><span className="stat-label">Buying Countries</span></div>
          </div>
          <PurchaseChart purchases={data?.purchases} />
          <CountryBreakdown purchases={data?.purchases} />
        </div>
      )}
      <style jsx>{`
        .cb-content { display: flex; flex-direction: column; gap: 1rem; }
        .cb-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .stat { background: var(--dash-bg-tertiary); border-radius: 8px; padding: 1rem; text-align: center; }
        .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--dash-gold-primary); font-family: 'SF Mono', monospace; }
        .stat-label { font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; }
        .error-state { text-align: center; padding: 2rem; color: var(--dash-text-muted); }
        .error-state button { margin-top: 1rem; padding: 0.5rem 1rem; background: var(--dash-gold-primary); border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </ModuleCard>
  );
}
