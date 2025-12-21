'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleCard from './ModuleCard';
import BiasIndicator from './BiasIndicator';
import LoadingState from './LoadingState';
import DataBadge from './DataBadge';

/**
 * AIAnalysisPanel - Displays Gemini AI market analysis
 * Requirements: 1.2, 1.3, 1.4
 */
export default function AIAnalysisPanel() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/ai/latest');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis');
      }
      
      if (data.analysis) {
        setAnalysis(data.analysis);
        setLastUpdate(new Date(data.createdAt));
        setIsStale(data.isStale);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 15 minutes
  useEffect(() => {
    fetchAnalysis();
    
    const interval = setInterval(fetchAnalysis, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalysis]);

  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = () => {
    if (loading && !analysis) {
      return <LoadingState message="Loading AI analysis..." />;
    }

    if (error && !analysis) {
      return (
        <div className="ai-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchAnalysis} className="retry-btn">
            Retry
          </button>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="ai-empty">
          <span className="empty-icon">🤖</span>
          <p>No analysis available yet</p>
        </div>
      );
    }

    return (
      <div className="ai-analysis-content">
        {/* Bias Indicator */}
        <div className="ai-bias-section">
          <BiasIndicator 
            bias={analysis.bias} 
            confidence={Math.round(analysis.confidence * 100)}
            size="lg"
          />
        </div>

        {/* Summary */}
        <div className="ai-summary-section">
          <h4>Market Summary</h4>
          <p className="ai-summary">{analysis.summary}</p>
        </div>

        {/* Risk Factors */}
        <div className="ai-risks-section">
          <h4>Top 3 Risks</h4>
          <ul className="risk-list">
            {analysis.risk_factors.map((risk, index) => (
              <li key={index} className="risk-item">
                <span className="risk-number">{index + 1}</span>
                <span className="risk-text">{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Levels */}
        <div className="ai-levels-section">
          <h4>Key Levels</h4>
          <div className="levels-grid">
            <div className="levels-column support">
              <span className="levels-label">Support</span>
              {analysis.key_levels.support.length > 0 ? (
                analysis.key_levels.support.map((level, i) => (
                  <span key={i} className="level-value">${level.toFixed(2)}</span>
                ))
              ) : (
                <span className="level-value na">N/A</span>
              )}
            </div>
            <div className="levels-column resistance">
              <span className="levels-label">Resistance</span>
              {analysis.key_levels.resistance.length > 0 ? (
                analysis.key_levels.resistance.map((level, i) => (
                  <span key={i} className="level-value">${level.toFixed(2)}</span>
                ))
              ) : (
                <span className="level-value na">N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ModuleCard
      id="ai-analysis"
      title="AI Market Analysis"
      icon="🧠"
      glowColor="var(--dash-gold-primary)"
      onRefresh={fetchAnalysis}
      updateTime={formatUpdateTime(lastUpdate)}
      badge={isStale ? <DataBadge variant="warning" text="Stale" /> : null}
    >
      <style jsx>{`
        .ai-analysis-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .ai-bias-section {
          display: flex;
          justify-content: center;
        }
        
        .ai-summary-section h4,
        .ai-risks-section h4,
        .ai-levels-section h4 {
          font-size: 0.85rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }
        
        .ai-summary {
          color: var(--dash-text-primary);
          line-height: 1.6;
          font-size: 0.95rem;
        }
        
        .risk-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .risk-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--dash-bg-tertiary);
          border-radius: 8px;
          border-left: 3px solid var(--dash-neon-red);
        }
        
        .risk-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--dash-neon-red);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .risk-text {
          color: var(--dash-text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .levels-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .levels-column {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--dash-bg-tertiary);
          border-radius: 8px;
        }
        
        .levels-column.support {
          border-left: 3px solid var(--dash-neon-green);
        }
        
        .levels-column.resistance {
          border-left: 3px solid var(--dash-neon-red);
        }
        
        .levels-label {
          font-size: 0.75rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        
        .level-value {
          font-size: 1.1rem;
          font-weight: 600;
          font-family: 'SF Mono', monospace;
        }
        
        .levels-column.support .level-value {
          color: var(--dash-neon-green);
        }
        
        .levels-column.resistance .level-value {
          color: var(--dash-neon-red);
        }
        
        .level-value.na {
          color: var(--dash-text-muted);
          font-size: 0.9rem;
        }
        
        .ai-error, .ai-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          color: var(--dash-text-muted);
        }
        
        .error-icon, .empty-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--dash-gold-primary);
          color: var(--dash-bg-primary);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .retry-btn:hover {
          opacity: 0.9;
        }
      `}</style>
      {renderContent()}
    </ModuleCard>
  );
}
