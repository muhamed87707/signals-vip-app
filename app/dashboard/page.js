'use client';
// Dashboard v3.0 - Live Data with Refresh Button
import { useState, useEffect, useCallback } from 'react';
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

/**
 * Main Dashboard Page - Live Trading Data
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Market data state
  const [marketData, setMarketData] = useState({
    gold: { price: 0, change: 0, changePercent: 0, loading: true },
    dxy: { value: 0, change: 0, changePercent: 0, loading: true },
    oil: { price: 0, change: 0, changePercent: 0, loading: true },
    us10y: { value: 0, change: 0, loading: true },
  });

  // Fetch all market data
  const fetchMarketData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/dashboard/market/gold');
      const data = await response.json();
      
      if (data.success) {
        setMarketData({
          gold: {
            price: data.data.gold?.price || 0,
            change: data.data.gold?.change || 0,
            changePercent: data.data.gold?.changePercent || 0,
            loading: false,
          },
          dxy: {
            value: data.data.dxy?.value || 0,
            change: data.data.dxy?.change || 0,
            changePercent: data.data.dxy?.changePercent || 0,
            loading: false,
          },
          oil: {
            price: data.data.oil?.price || 0,
            change: data.data.oil?.change || 0,
            changePercent: data.data.oil?.changePercent || 0,
            loading: false,
          },
          us10y: {
            value: data.data.treasury?.us10y || 0,
            change: data.data.treasury?.change || 0,
            loading: false,
          },
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    await fetchMarketData();
  }, [fetchMarketData]);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data on mount and every 60 seconds
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const formatPrice = (price) => {
    if (!price || price === 0) return '---';
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change, percent) => {
    if (change === undefined || change === null) return '---';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent?.toFixed(2) || '0.00'}%)`;
  };

  return (
    <div className="dashboard-content">
      {/* Header with Refresh Button */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Gold Intelligence</h1>
          <span className="current-time">{currentTime}</span>
        </div>
        <div className="header-right">
          {lastUpdate && (
            <span className="last-update">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
            </span>
          )}
          <button 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span className="refresh-icon">🔄</span>
            <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
          </button>
        </div>
      </div>

      {/* Top Stats Bar - Live Data */}
      <div className="dashboard-stats-bar">
        <div className="stat-card gold-price">
          <div className="stat-icon">🥇</div>
          <div className="stat-info">
            <span className="stat-label">XAUUSD</span>
            <span className="stat-value">
              {marketData.gold.loading ? '...' : `$${formatPrice(marketData.gold.price)}`}
            </span>
            <span className={`stat-change ${marketData.gold.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.gold.loading ? '---' : formatChange(marketData.gold.change, marketData.gold.changePercent)}
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <span className="stat-label">DXY</span>
            <span className="stat-value">
              {marketData.dxy.loading ? '...' : formatPrice(marketData.dxy.value)}
            </span>
            <span className={`stat-change ${marketData.dxy.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.dxy.loading ? '---' : formatChange(marketData.dxy.change, marketData.dxy.changePercent)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-label">US10Y</span>
            <span className="stat-value">
              {marketData.us10y.loading ? '...' : `${formatPrice(marketData.us10y.value)}%`}
            </span>
            <span className={`stat-change ${marketData.us10y.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.us10y.loading ? '---' : `${marketData.us10y.change >= 0 ? '+' : ''}${marketData.us10y.change.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛢️</div>
          <div className="stat-info">
            <span className="stat-label">WTI Oil</span>
            <span className="stat-value">
              {marketData.oil.loading ? '...' : `$${formatPrice(marketData.oil.price)}`}
            </span>
            <span className={`stat-change ${marketData.oil.change >= 0 ? 'positive' : 'negative'}`}>
              {marketData.oil.loading ? '---' : formatChange(marketData.oil.change, marketData.oil.changePercent)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* AI Analysis Panel */}
        <div className="span-2">
          <AIAnalysisPanel key={`ai-${refreshKey}`} />
        </div>

        {/* Bank Forecasts */}
        <BankForecasts key={`bank-${refreshKey}`} />

        {/* Macro Engine */}
        <MacroEngine key={`macro-${refreshKey}`} />

        {/* COT Analyzer */}
        <COTAnalyzer key={`cot-${refreshKey}`} />

        {/* Sentiment Panel */}
        <SentimentPanel key={`sentiment-${refreshKey}`} />

        {/* Correlation Matrix */}
        <CorrelationMatrix key={`corr-${refreshKey}`} />

        {/* Technical Chart */}
        <TechnicalChart key={`tech-${refreshKey}`} />

        {/* Scenario Simulator */}
        <ScenarioSimulator key={`sim-${refreshKey}`} />

        {/* Central Bank Tracker */}
        <CentralBankTracker key={`cb-${refreshKey}`} />

        {/* Seasonality */}
        <Seasonality key={`season-${refreshKey}`} />
      </div>

      <style jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .dashboard-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dash-gold-primary, #FFD700);
          margin: 0;
        }
        .current-time {
          font-size: 1rem;
          color: var(--dash-text-muted, #888);
          font-family: monospace;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .last-update {
          font-size: 0.75rem;
          color: var(--dash-text-muted, #888);
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
          border: 1px solid var(--dash-gold-primary, #FFD700);
          border-radius: 8px;
          color: var(--dash-gold-primary, #FFD700);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .refresh-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2));
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }
        .refresh-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .refresh-btn.refreshing .refresh-icon {
          animation: spin 1s linear infinite;
        }
        .refresh-icon {
          font-size: 1rem;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stat-card {
          position: relative;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background: var(--dash-neon-green, #00FF88);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
