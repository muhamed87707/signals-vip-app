'use client';
// Dashboard v2.1 - Production Build Dec 21, 2024
import { useState, useEffect } from 'react';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import MacroEngine from './components/MacroEngine';
import BankForecasts from './components/BankForecasts';
import COTAnalyzer from './components/COTAnalyzer';
import SentimentPanel from './components/SentimentPanel';
import CorrelationMatrix from './components/CorrelationMatrix';
import TechnicalChart from './components/TechnicalChart';
import ScenarioSimulator from './components/ScenarioSimulator';
import CentralBankTracker from './components/CentralBankTracker';
import Seasonality from './components/Seasonality';
import useDashboardStream from './hooks/useDashboardStream';

/**
 * Main Dashboard Page
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const { connected, lastPrice, alerts } = useDashboardStream();
  const [goldPrice, setGoldPrice] = useState({ price: 2650.45, change: 12.30, changePercent: 0.47 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastPrice) {
      setGoldPrice({
        price: lastPrice.price,
        change: lastPrice.change,
        changePercent: (lastPrice.change / lastPrice.price) * 100,
      });
    }
  }, [lastPrice]);

  return (
    <div className="dashboard-content">
      {/* Connection Status */}
      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span>{connected ? 'Live' : 'Reconnecting...'}</span>
      </div>

      {/* Top Stats Bar */}
      <div className="dashboard-stats-bar">
        <div className="stat-card gold-price">
          <div className="stat-icon">🥇</div>
          <div className="stat-info">
            <span className="stat-label">XAUUSD</span>
            <span className="stat-value">${goldPrice.price.toLocaleString()}</span>
            <span className={`stat-change ${goldPrice.change >= 0 ? 'positive' : 'negative'}`}>
              {goldPrice.change >= 0 ? '+' : ''}{goldPrice.change.toFixed(2)} ({goldPrice.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <span className="stat-label">DXY</span>
            <span className="stat-value">104.25</span>
            <span className="stat-change negative">-0.15 (-0.14%)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-label">US10Y</span>
            <span className="stat-value">4.42%</span>
            <span className="stat-change positive">+0.02</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛢️</div>
          <div className="stat-info">
            <span className="stat-label">WTI Oil</span>
            <span className="stat-value">$71.45</span>
            <span className="stat-change positive">+0.85 (+1.20%)</span>
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="alerts-banner">
          <span className="alert-icon">🔔</span>
          <span className="alert-text">{alerts[0].message}</span>
          <span className="alert-time">{new Date(alerts[0].timestamp).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* AI Analysis Panel */}
        <div className="span-2">
          <AIAnalysisPanel />
        </div>

        {/* Bank Forecasts */}
        <BankForecasts />

        {/* Macro Engine */}
        <MacroEngine />

        {/* COT Analyzer */}
        <COTAnalyzer />

        {/* Sentiment Panel */}
        <SentimentPanel />

        {/* Correlation Matrix */}
        <CorrelationMatrix />

        {/* Technical Chart */}
        <TechnicalChart />

        {/* Scenario Simulator */}
        <ScenarioSimulator />

        {/* Central Bank Tracker */}
        <CentralBankTracker />

        {/* Seasonality */}
        <Seasonality />
      </div>

      <style jsx>{`
        .connection-status {
          position: fixed;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          z-index: 100;
        }
        .connection-status.connected {
          background: rgba(0, 255, 136, 0.1);
          color: var(--dash-neon-green);
        }
        .connection-status.disconnected {
          background: rgba(255, 68, 68, 0.1);
          color: var(--dash-neon-red);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }
        .alerts-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid var(--dash-gold-primary);
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .alert-icon { font-size: 1rem; }
        .alert-text { flex: 1; font-size: 0.85rem; color: var(--dash-text-primary); }
        .alert-time { font-size: 0.75rem; color: var(--dash-text-muted); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
