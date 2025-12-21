'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import MatrixGrid from './MatrixGrid';

/**
 * CorrelationMatrix - Main container for correlation matrix
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export default function CorrelationMatrix() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30D');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dashboard/market/correlation?period=${period}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch correlation data');
      setData(result.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUpdateTime = (date) => date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '';

  return (
    <ModuleCard id="correlation" title="Correlation Matrix" icon="🔗" onRefresh={fetchData} updateTime={formatUpdateTime(lastUpdate)}>
      {loading && !data ? (
        <LoadingState message="Loading correlations..." />
      ) : error && !data ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <div className="correlation-content">
          <div className="period-selector">
            {['7D', '30D', '90D'].map(p => (
              <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <MatrixGrid matrix={data?.matrix} assets={data?.assets} assetInfo={data?.assetInfo} />
          {data?.changes?.length > 0 && (
            <div className="changes-alert">
              <span className="alert-icon">⚡</span>
              <span>{data.changes.length} significant correlation change{data.changes.length > 1 ? 's' : ''} detected</span>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        .correlation-content { display: flex; flex-direction: column; gap: 1rem; }
        .period-selector { display: flex; gap: 0.5rem; }
        .period-btn {
          padding: 0.4rem 0.8rem;
          background: var(--dash-bg-tertiary);
          border: 1px solid var(--dash-border);
          border-radius: 6px;
          color: var(--dash-text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .period-btn:hover { border-color: var(--dash-gold-primary); }
        .period-btn.active { background: var(--dash-gold-primary); color: var(--dash-bg-primary); border-color: var(--dash-gold-primary); }
        .changes-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid var(--dash-gold-primary);
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--dash-gold-primary);
        }
        .error-state { text-align: center; padding: 2rem; color: var(--dash-text-muted); }
        .error-state button { margin-top: 1rem; padding: 0.5rem 1rem; background: var(--dash-gold-primary); border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </ModuleCard>
  );
}
