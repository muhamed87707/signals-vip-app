'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import Histogram from './Histogram';
import AlertBanner from './AlertBanner';

/**
 * COTAnalyzer - Main container for COT analysis
 * Requirements: 4.2, 4.3
 */
export default function COTAnalyzer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/cot/latest');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch COT data');
      }

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
    // COT data updates weekly, refresh every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatReportDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ModuleCard
      id="cot-analyzer"
      title="COT Analyzer"
      icon="📈"
      onRefresh={fetchData}
      updateTime={formatUpdateTime(lastUpdate)}
    >
      {loading && !data ? (
        <LoadingState message="Loading COT data..." />
      ) : error && !data ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <div className="cot-content">
          {data?.alert && <AlertBanner alert={data.alert} />}
          
          <div className="cot-summary">
            <div className="summary-item">
              <span className="summary-label">Net Position</span>
              <span className={`summary-value ${data?.netPosition >= 0 ? 'positive' : 'negative'}`}>
                {data?.netPosition >= 0 ? '+' : ''}{data?.netPosition?.toLocaleString()}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Report Date</span>
              <span className="summary-value">{formatReportDate(data?.reportDate)}</span>
            </div>
          </div>

          <Histogram 
            longPercentage={data?.longPercentage || 50}
            shortPercentage={data?.shortPercentage || 50}
            managedMoneyLong={data?.managedMoneyLong}
            managedMoneyShort={data?.managedMoneyShort}
          />

          <div className="cot-context">
            <div className="context-item">
              <span className="context-label">Historic High</span>
              <span className="context-value">{data?.historicHigh?.toLocaleString()}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Historic Low</span>
              <span className="context-value">{data?.historicLow?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .cot-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .cot-summary {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: var(--dash-bg-tertiary);
          border-radius: 8px;
        }
        .summary-item {
          display: flex;
          flex-direction: column;
        }
        .summary-label {
          font-size: 0.75rem;
          color: var(--dash-text-muted);
        }
        .summary-value {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: 'SF Mono', monospace;
        }
        .summary-value.positive {
          color: var(--dash-neon-green);
        }
        .summary-value.negative {
          color: var(--dash-neon-red);
        }
        .cot-context {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }
        .context-item {
          display: flex;
          flex-direction: column;
        }
        .context-label {
          color: var(--dash-text-muted);
        }
        .context-value {
          color: var(--dash-text-secondary);
          font-family: 'SF Mono', monospace;
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
