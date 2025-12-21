'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import ForecastCard from './ForecastCard';
import ConsensusDisplay from './ConsensusDisplay';
import Timeline from './Timeline';

/**
 * BankForecasts - Main container for bank forecasts module
 * Requirements: 2.1, 2.2, 2.4
 */
export default function BankForecasts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/forecasts/list');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch forecasts');
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
  }, [fetchData]);

  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ModuleCard
      id="bank-forecasts"
      title="Bank Forecasts"
      icon="🏦"
      onRefresh={fetchData}
      updateTime={formatUpdateTime(lastUpdate)}
    >
      {loading && !data ? (
        <LoadingState message="Loading forecasts..." />
      ) : error && !data ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <div className="forecasts-content">
          <ConsensusDisplay 
            consensusPrice={data?.consensusPrice} 
            count={data?.count || 0}
          />
          <Timeline forecasts={data?.forecasts} />
          <div className="forecasts-grid">
            {data?.forecasts?.map((forecast, index) => (
              <ForecastCard key={index} forecast={forecast} />
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        .forecasts-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .forecasts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .forecasts-grid {
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
