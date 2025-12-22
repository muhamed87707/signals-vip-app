'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function EconomicCalendarCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const t = {
        en: {
            title: 'Economic Calendar',
            subtitle: 'Upcoming market-moving events',
            all: 'All',
            high: 'High Impact',
            goldRelated: 'Gold Related',
            today: 'Today',
            event: 'Event',
            time: 'Time',
            previous: 'Previous',
            forecast: 'Forecast',
            actual: 'Actual',
            nextEvent: 'Next Important Event',
            countdown: 'Countdown',
            noEvents: 'No events scheduled'
        },
        ar: {
            title: 'التقويم الاقتصادي',
            subtitle: 'الأحداث القادمة المؤثرة على السوق',
            all: 'الكل',
            high: 'تأثير عالي',
            goldRelated: 'متعلق بالذهب',
            today: 'اليوم',
            event: 'الحدث',
            time: 'الوقت',
            previous: 'السابق',
            forecast: 'المتوقع',
            actual: 'الفعلي',
            nextEvent: 'الحدث المهم القادم',
            countdown: 'العد التنازلي',
            noEvents: 'لا توجد أحداث مجدولة'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/economic-calendar')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    const getFilteredEvents = () => {
        if (!data?.events) return [];
        switch (filter) {
            case 'high': return data.events.filter(e => e.impact === 'high');
            case 'gold': return data.events.filter(e => e.goldImpact);
            default: return data.events;
        }
    };

    const getImpactColor = (impact) => {
        const colors = { high: '#f44336', medium: '#ff9800', low: '#4caf50' };
        return colors[impact] || '#ff9800';
    };

    const formatCountdown = (datetime) => {
        const diff = new Date(datetime) - new Date();
        if (diff < 0) return 'Past';
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
        return `${hours}h ${mins}m`;
    };

    if (loading) return <div className="calendar-card"><LoadingSkeleton height="400px" /></div>;

    const events = getFilteredEvents();
    const nextEvent = data?.nextImportantEvent;

    return (
        <div className="calendar-card">
            <div className="card-header">
                <span className="icon">📅</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Next Important Event Countdown */}
            {nextEvent && (
                <div className="next-event">
                    <div className="next-event-label">{t.nextEvent}</div>
                    <div className="next-event-name">{lang === 'ar' ? nextEvent.nameAr : nextEvent.name}</div>
                    <div className="next-event-countdown">
                        <span className="countdown-label">{t.countdown}:</span>
                        <span className="countdown-value">{formatCountdown(nextEvent.datetime)}</span>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                    {t.all}
                </button>
                <button className={filter === 'high' ? 'active' : ''} onClick={() => setFilter('high')}>
                    {t.high}
                </button>
                <button className={filter === 'gold' ? 'active' : ''} onClick={() => setFilter('gold')}>
                    🥇 {t.goldRelated}
                </button>
            </div>

            {/* Events List */}
            <div className="events-list">
                {events.length === 0 ? (
                    <p className="no-events">{t.noEvents}</p>
                ) : (
                    events.slice(0, 10).map((event) => (
                        <div key={event.id} className={`event-row ${event.isToday ? 'today' : ''} ${event.isPast ? 'past' : ''}`}>
                            <div className="event-time">
                                <span className="date">{event.date}</span>
                                <span className="time">{event.time}</span>
                            </div>
                            <div className="event-info">
                                <div className="event-name">
                                    {event.goldImpact && <span className="gold-badge">🥇</span>}
                                    {lang === 'ar' ? event.nameAr : event.name}
                                </div>
                                <div className="event-meta">
                                    <span className="country">{event.country}</span>
                                    <span className="impact" style={{ backgroundColor: getImpactColor(event.impact) }}>
                                        {event.impact}
                                    </span>
                                </div>
                            </div>
                            <div className="event-values">
                                <div className="value-item">
                                    <span className="label">{t.previous}</span>
                                    <span className="value">{event.previous}</span>
                                </div>
                                <div className="value-item">
                                    <span className="label">{t.forecast}</span>
                                    <span className="value">{event.forecast}</span>
                                </div>
                                <div className="value-item">
                                    <span className="label">{t.actual}</span>
                                    <span className={`value ${event.actual ? 'released' : ''}`}>
                                        {event.actual || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .calendar-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .icon { font-size: 1.5rem; }
                .card-header h2 { font-size: 1rem; color: var(--gold-medium); margin: 0; }
                .card-header p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
                
                .next-event {
                    padding: 1rem;
                    background: linear-gradient(135deg, rgba(184, 134, 11, 0.1), rgba(184, 134, 11, 0.05));
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    text-align: center;
                }
                .next-event-label { font-size: 0.7rem; color: var(--text-secondary); }
                .next-event-name { font-size: 0.95rem; font-weight: 600; color: var(--gold-bright); margin: 0.25rem 0; }
                .next-event-countdown { display: flex; justify-content: center; gap: 0.5rem; align-items: center; }
                .countdown-label { font-size: 0.75rem; color: var(--text-secondary); }
                .countdown-value { font-size: 1.1rem; font-weight: 700; color: var(--gold-medium); }
                
                .filter-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .filter-tabs button {
                    flex: 1;
                    padding: 0.5rem;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-tabs button:hover { border-color: var(--gold-primary); }
                .filter-tabs button.active {
                    background: rgba(184, 134, 11, 0.15);
                    border-color: var(--gold-primary);
                    color: var(--gold-bright);
                }
                
                .events-list { max-height: 350px; overflow-y: auto; }
                .event-row {
                    display: grid;
                    grid-template-columns: 80px 1fr 150px;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    align-items: center;
                }
                .event-row.today { border-left: 3px solid var(--gold-primary); }
                .event-row.past { opacity: 0.6; }
                
                .event-time { text-align: center; }
                .event-time .date { display: block; font-size: 0.7rem; color: var(--text-secondary); }
                .event-time .time { display: block; font-size: 0.85rem; font-weight: 600; }
                
                .event-name { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem; }
                .gold-badge { font-size: 0.75rem; }
                .event-meta { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
                .country { font-size: 0.7rem; color: var(--text-secondary); }
                .impact {
                    font-size: 0.6rem;
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                    color: white;
                    text-transform: uppercase;
                }
                
                .event-values { display: flex; gap: 0.5rem; }
                .value-item { text-align: center; }
                .value-item .label { display: block; font-size: 0.6rem; color: var(--text-secondary); }
                .value-item .value { font-size: 0.8rem; font-weight: 600; }
                .value-item .value.released { color: var(--gold-bright); }
                
                .no-events { text-align: center; color: var(--text-secondary); padding: 2rem; }
                
                @media (max-width: 768px) {
                    .event-row { grid-template-columns: 1fr; gap: 0.5rem; }
                    .event-values { justify-content: space-between; }
                }
            `}</style>
        </div>
    );
}
