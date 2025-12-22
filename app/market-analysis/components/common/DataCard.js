'use client';

import { useState } from 'react';

/**
 * DataCard - Reusable card wrapper for dashboard sections
 * @param {string} title - Card title
 * @param {string} icon - Emoji icon
 * @param {React.ReactNode} children - Card content
 * @param {boolean} loading - Loading state
 * @param {function} onRefresh - Refresh callback
 * @param {string} lastUpdate - Last update timestamp
 * @param {boolean} collapsible - Allow collapse
 * @param {string} className - Additional CSS classes
 */
export default function DataCard({ 
    title, 
    icon, 
    children, 
    loading = false, 
    onRefresh, 
    lastUpdate,
    collapsible = false,
    className = '',
    headerExtra
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`data-card ${className} ${collapsed ? 'collapsed' : ''}`}>
            <div className="data-card-header">
                <div className="data-card-title">
                    {icon && <span className="data-card-icon">{icon}</span>}
                    <h3>{title}</h3>
                </div>
                <div className="data-card-actions">
                    {headerExtra}
                    {onRefresh && (
                        <button 
                            className="data-card-refresh" 
                            onClick={onRefresh}
                            disabled={loading}
                            title="Refresh"
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                className={loading ? 'spinning' : ''}
                            >
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                        </button>
                    )}
                    {collapsible && (
                        <button 
                            className="data-card-collapse"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            
            {!collapsed && (
                <div className="data-card-content">
                    {loading ? (
                        <div className="data-card-loading">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            )}
            
            {lastUpdate && !collapsed && (
                <div className="data-card-footer">
                    <span className="last-update-text">
                        Last update: {lastUpdate}
                    </span>
                </div>
            )}

            <style jsx>{`
                .data-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .data-card:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
                }

                .data-card.collapsed {
                    border-color: rgba(184, 134, 11, 0.1);
                }

                .data-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                    background: rgba(184, 134, 11, 0.03);
                }

                .data-card.collapsed .data-card-header {
                    border-bottom: none;
                }

                .data-card-title {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .data-card-icon {
                    font-size: 1.25rem;
                }

                .data-card-title h3 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--gold-medium);
                    margin: 0;
                }

                .data-card-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .data-card-refresh,
                .data-card-collapse {
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 6px;
                    padding: 0.4rem;
                    cursor: pointer;
                    color: var(--gold-medium);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .data-card-refresh:hover,
                .data-card-collapse:hover {
                    background: rgba(184, 134, 11, 0.1);
                    border-color: var(--gold-primary);
                }

                .data-card-refresh:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .spinning {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .data-card-content {
                    padding: 1.25rem;
                    min-height: 120px;
                }

                .data-card-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 120px;
                }

                .loading-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(184, 134, 11, 0.2);
                    border-top-color: var(--gold-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .data-card-footer {
                    padding: 0.6rem 1.25rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.08);
                    background: rgba(0, 0, 0, 0.2);
                }

                .last-update-text {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
