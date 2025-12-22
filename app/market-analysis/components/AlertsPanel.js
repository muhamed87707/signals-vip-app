'use client';

import { useState, useEffect } from 'react';

export default function AlertsPanel({ lang = 'en', goldPrice, isVisible, onClose }) {
    const [alerts, setAlerts] = useState([]);

    const t = {
        en: {
            title: 'Market Alerts',
            noAlerts: 'No active alerts',
            dismiss: 'Dismiss',
            dismissAll: 'Dismiss All',
            high: 'High',
            medium: 'Medium',
            low: 'Low',
            priceAlert: 'Price Alert',
            eventAlert: 'Event Alert',
            technicalAlert: 'Technical Alert',
            newsAlert: 'News Alert'
        },
        ar: {
            title: 'تنبيهات السوق',
            noAlerts: 'لا توجد تنبيهات نشطة',
            dismiss: 'إخفاء',
            dismissAll: 'إخفاء الكل',
            high: 'عالي',
            medium: 'متوسط',
            low: 'منخفض',
            priceAlert: 'تنبيه سعر',
            eventAlert: 'تنبيه حدث',
            technicalAlert: 'تنبيه فني',
            newsAlert: 'تنبيه خبر'
        }
    }[lang] || {};

    // Generate alerts based on market conditions
    useEffect(() => {
        const generateAlerts = () => {
            const newAlerts = [];
            const price = goldPrice?.price || 2650;
            const change = goldPrice?.change || 0;
            const changePercent = goldPrice?.changePercent || 0;

            // Price movement alerts
            if (Math.abs(changePercent) > 1) {
                newAlerts.push({
                    id: 'price-move',
                    type: 'price',
                    priority: 'high',
                    title: lang === 'ar' ? 'حركة سعرية كبيرة' : 'Significant Price Movement',
                    message: lang === 'ar' 
                        ? `الذهب ${change > 0 ? 'ارتفع' : 'انخفض'} بنسبة ${Math.abs(changePercent).toFixed(2)}%`
                        : `Gold ${change > 0 ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}%`,
                    time: new Date()
                });
            }

            // Key level alerts
            if (price > 2700) {
                newAlerts.push({
                    id: 'resistance-2700',
                    type: 'technical',
                    priority: 'medium',
                    title: lang === 'ar' ? 'اختراق مقاومة' : 'Resistance Breakout',
                    message: lang === 'ar' ? 'الذهب فوق مستوى 2700$' : 'Gold above $2700 level',
                    time: new Date()
                });
            }

            if (price < 2600) {
                newAlerts.push({
                    id: 'support-2600',
                    type: 'technical',
                    priority: 'medium',
                    title: lang === 'ar' ? 'كسر دعم' : 'Support Break',
                    message: lang === 'ar' ? 'الذهب تحت مستوى 2600$' : 'Gold below $2600 level',
                    time: new Date()
                });
            }

            setAlerts(newAlerts);
        };

        generateAlerts();
    }, [goldPrice, lang]);

    const dismissAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const dismissAll = () => {
        setAlerts([]);
    };

    const getPriorityColor = (priority) => {
        const colors = { high: '#f44336', medium: '#ff9800', low: '#4caf50' };
        return colors[priority] || '#ff9800';
    };

    const getTypeIcon = (type) => {
        const icons = { price: '💰', event: '📅', technical: '📊', news: '📰' };
        return icons[type] || '🔔';
    };

    if (!isVisible) return null;

    return (
        <div className="alerts-panel">
            <div className="alerts-header">
                <h3>🔔 {t.title}</h3>
                <div className="header-actions">
                    {alerts.length > 0 && (
                        <button className="dismiss-all" onClick={dismissAll}>{t.dismissAll}</button>
                    )}
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
            </div>

            <div className="alerts-list">
                {alerts.length === 0 ? (
                    <div className="no-alerts">{t.noAlerts}</div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className="alert-item" style={{ borderLeftColor: getPriorityColor(alert.priority) }}>
                            <div className="alert-icon">{getTypeIcon(alert.type)}</div>
                            <div className="alert-content">
                                <div className="alert-header">
                                    <span className="alert-title">{alert.title}</span>
                                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(alert.priority) }}>
                                        {t[alert.priority]}
                                    </span>
                                </div>
                                <p className="alert-message">{alert.message}</p>
                                <span className="alert-time">
                                    {alert.time.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <button className="dismiss-btn" onClick={() => dismissAlert(alert.id)}>×</button>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .alerts-panel {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    width: 350px;
                    max-height: 500px;
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    overflow: hidden;
                }
                .alerts-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.2);
                    background: rgba(184, 134, 11, 0.1);
                }
                .alerts-header h3 { margin: 0; font-size: 1rem; color: var(--gold-medium); }
                .header-actions { display: flex; gap: 0.5rem; align-items: center; }
                .dismiss-all {
                    padding: 0.25rem 0.5rem;
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 4px;
                    color: var(--text-secondary);
                    font-size: 0.7rem;
                    cursor: pointer;
                }
                .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    line-height: 1;
                }
                .alerts-list { max-height: 400px; overflow-y: auto; padding: 0.5rem; }
                .no-alerts { text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem; }
                .alert-item {
                    display: flex;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    border-left: 3px solid;
                    margin-bottom: 0.5rem;
                }
                .alert-icon { font-size: 1.25rem; }
                .alert-content { flex: 1; }
                .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
                .alert-title { font-size: 0.85rem; font-weight: 600; }
                .priority-badge { padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.6rem; color: white; }
                .alert-message { font-size: 0.75rem; color: var(--text-secondary); margin: 0 0 0.25rem; }
                .alert-time { font-size: 0.65rem; color: var(--text-secondary); }
                .dismiss-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    cursor: pointer;
                    opacity: 0.5;
                }
                .dismiss-btn:hover { opacity: 1; }
            `}</style>
        </div>
    );
}
