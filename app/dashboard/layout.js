'use client';

import { useState } from 'react';
import Link from 'next/link';
import './dashboard.css';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const modules = [
    { id: 'ai-analysis', name: 'AI Analysis', icon: '🧠', href: '#ai-analysis' },
    { id: 'bank-forecasts', name: 'Bank Forecasts', icon: '🏦', href: '#bank-forecasts' },
    { id: 'macro-engine', name: 'Macro Engine', icon: '📊', href: '#macro-engine' },
    { id: 'cot-analyzer', name: 'COT Analyzer', icon: '📈', href: '#cot-analyzer' },
    { id: 'sentiment', name: 'Sentiment', icon: '📰', href: '#sentiment' },
    { id: 'correlation', name: 'Correlation', icon: '🔗', href: '#correlation' },
    { id: 'technical', name: 'Technical', icon: '📉', href: '#technical' },
    { id: 'simulator', name: 'Simulator', icon: '🎯', href: '#simulator' },
    { id: 'central-banks', name: 'Central Banks', icon: '🏛️', href: '#central-banks' },
    { id: 'seasonality', name: 'Seasonality', icon: '📅', href: '#seasonality' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <Link href="/dashboard" className="dashboard-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Gold Intelligence</span>
          </Link>
        </div>
        
        <div className="dashboard-header-center">
          <div className="ai-status">
            <span className="ai-status-dot"></span>
            <span className="ai-status-text">AI Active</span>
          </div>
          <div className="last-update">
            Last Update: <span id="last-update-time">--:--</span>
          </div>
        </div>

        <div className="dashboard-header-right">
          <Link href="/" className="back-to-home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
          <button className="settings-btn" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            {modules.map((module) => (
              <a 
                key={module.id} 
                href={module.href}
                className="sidebar-nav-item"
                title={module.name}
              >
                <span className="nav-icon">{module.icon}</span>
                {!sidebarCollapsed && <span className="nav-text">{module.name}</span>}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
