'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import LoadingState from '../LoadingState';
import NewsFeed from './NewsFeed';
import FearGauge from './FearGauge';
import RiskIndex from './RiskIndex';
import { calculateRiskIndex, getFearLevel } from '@/lib/calculations/riskIndex';

/**
 * SentimentPanel - Main container for sentiment analysis
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export default function SentimentPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/news/aggregate');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch news');
      }

      // Calculate risk index from headlines
      const headlines = result.data.news.map(n => n.headline);
      const riskIndex = calculateRiskIndex(headlines);
      const fearLevel = getFearLevel(riskIndex.score);

      // Calculate aggregate sentiment
      const sentiments = result.data.news.map(n => n.sentiment || 0);
      const avgSentiment = sentiments.length > 0 
        ? Math.round(sentiments.reduce((a, b) => a + b, 0) / sentiments.length)
        : 0;

      setData({
        news: result.data.news,
        riskIndex,
        fearLevel,
        sentiment: avgSentiment,
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
    const interval = setInterval(fetchData, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ModuleCard
      id="sentiment"
      title="Sentiment Analysis"
      icon="📰"
      onRefresh={fetchData}
      updateTime={formatUpdateTime(lastUpdate)}
    >
      {loading && !data ? (
        <LoadingState message="Loading sentiment data..." />
      ) : error && !data ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      ) : (
        <div className="sentiment-content">
          <div className="sentiment-top">
            <div className="sentiment-score">
              <span className="score-label">Market Sentiment</span>
              <span className={`score-value ${data?.sentiment >= 0 ? 'positive' : 'negative'}`}>
                {data?.sentiment >= 0 ? '+' : ''}{data?.sentiment}
              </span>
            </div>
            <FearGauge score={data?.riskIndex?.score || 0} level={data?.fearLevel?.level} />
          </div>
          <RiskIndex riskIndex={data?.riskIndex} />
          <NewsFeed news={data?.news} />
        </div>
      )}
      <style jsx>{`
        .sentiment-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sentiment-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .sentiment-score {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .score-label {
          font-size: 0.8rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .score-value {
          font-size: 2.5rem;
          font-weight: 800;
          font-family: 'SF Mono', monospace;
        }
        .score-value.positive {
          color: var(--dash-neon-green);
        }
        .score-value.negative {
          color: var(--dash-neon-red);
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
