'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function FedWatchCard({ lang = 'en' }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Fed Watch',
            subtitle: 'Federal Reserve policy tracker',
            currentRate: 'Current Rate',
            nextMeeting: 'Next FOMC Meeting',
            daysUntil: 'days',
            probabilities: 'Rate Probabilities',
            officials: 'Fed Officials',
            dotPlot: 'Dot Plot Projections',
            goldImpact: 'Gold Impact',
            lastDecision: 'Last Decision',
            checkManually: 'Check manually for real-time data',
            dataUnavailable: 'Data requires manual verification',
            upcomingMeetings: 'Upcoming FOMC Meetings'
        },
        ar: {
            title: 'متابعة الفيدرالي',
            subtitle: 'متتبع سياسة الاحتياطي الفيدرالي',
            currentRate: 'السعر الحالي',
            nextMeeting: 'اجتماع FOMC القادم',
            daysUntil: 'يوم',
            probabilities: 'احتمالات الفائدة',
            officials: 'مسؤولو الفيدرالي',
            dotPlot: 'توقعات Dot Plot',
            goldImpact: 'التأثير على الذهب',
            lastDecision: 'آخر قرار',
            checkManually: 'تحقق يدوياً للبيانات الفورية',
            dataUnavailable: 'البيانات تتطلب التحقق اليدوي',
            upcomingMeetings: 'اجتماعات FOMC القادمة'
        }
    }[lang] || {};

    useEffect(() => {
        fetch('/api/market/fed-watch')
            .then(r => r.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="fed-card"><LoadingSkeleton height="400px" /></div>;

    const currentRate = data?.currentRate || {};
    const nextMeeting = data?.nextMeeting || {};
    const upcomingMeetings = data?.upcomingMeetings || [];
    const manualCheckUrls = data?.manualCheckUrls || {};

    return (
        <div className="fed-card">
            <div className="card-header">
                <span className="icon">🏛️</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Current Rate & Next Meeting */}
            <div className="rate-section">
                <div className="rate-box">
                    <span className="label">{t.currentRate}</span>
                    <span className="rate-value">
                        {currentRate.lower || 0}% - {currentRate.upper || 0}%
                    </span>
                    {currentRate.lastDecision && (
                        <span className="last-decision">
                            {t.lastDecision}: {currentRate.lastDecision}
                        </span>
                    )}
                </div>
                <div className="meeting-box">
                    <span className="label">{t.nextMeeting}</span>
                    <span className="meeting-date">{nextMeeting.date || '-'}</span>
                    <span className="days-until">{nextMeeting.daysUntil || 0} {t.daysUntil}</span>
                </div>
            </div>

            {/* Probabilities - Manual Check Required */}
            {data?.probabilities?.error && (
                <div className="manual-check-section">
                    <h3>{t.probabilities}</h3>
                    <div className="manual-check-box">
                        <span className="warning-icon">⚠️</span>
                        <p>{t.dataUnavailable}</p>
                        <a 
                            href={manualCheckUrls.fedwatch} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="check-link"
                        >
                            CME FedWatch Tool →
                        </a>
                    </div>
                </div>
            )}

            {/* Upcoming Meetings */}
            <div className="meetings-section">
                <h3>{t.upcomingMeetings}</h3>
                <div className="meetings-list">
                    {upcomingMeetings.slice(0, 4).map((meeting, idx) => (
                        <div key={idx} className="meeting-item">
                            <span className="meeting-date-small">{meeting.date}</span>
                            <span className="meeting-days">{meeting.daysUntil} {t.daysUntil}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manual Check Links */}
            <div className="links-section">
                <p className="check-note">{t.checkManually}:</p>
                <div className="links-grid">
                    {manualCheckUrls.fedwatch && (
                        <a href={manualCheckUrls.fedwatch} target="_blank" rel="noopener noreferrer">
                            CME FedWatch
                        </a>
                    )}
                    {manualCheckUrls.fedReserve && (
                        <a href={manualCheckUrls.fedReserve} target="_blank" rel="noopener noreferrer">
                            Federal Reserve
                        </a>
                    )}
                    {manualCheckUrls.fomc && (
                        <a href={manualCheckUrls.fomc} target="_blank" rel="noopener noreferrer">
                            FOMC Calendar
                        </a>
                    )}
                </div>
            </div>

            <style jsx>{`
                .fed-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
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
                
                .rate-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .rate-box, .meeting-box {
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 12px;
                    text-align: center;
                }
                .rate-box { border: 1px solid rgba(184, 134, 11, 0.2); }
                .label { display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
                .rate-value { font-size: 1.5rem; font-weight: 700; color: var(--gold-bright); display: block; }
                .last-decision { font-size: 0.7rem; color: var(--text-secondary); display: block; margin-top: 0.25rem; }
                .meeting-date { display: block; font-size: 1rem; font-weight: 600; }
                .days-until { font-size: 0.8rem; color: var(--gold-medium); }
                
                .manual-check-section, .meetings-section { margin-bottom: 1rem; }
                .manual-check-section h3, .meetings-section h3 {
                    font-size: 0.85rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.75rem;
                }
                
                .manual-check-box {
                    padding: 1rem;
                    background: rgba(255, 152, 0, 0.1);
                    border: 1px solid rgba(255, 152, 0, 0.3);
                    border-radius: 8px;
                    text-align: center;
                }
                .warning-icon { font-size: 1.5rem; }
                .manual-check-box p { 
                    font-size: 0.8rem; 
                    color: var(--text-secondary); 
                    margin: 0.5rem 0;
                }
                .check-link {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: rgba(184, 134, 11, 0.2);
                    border-radius: 6px;
                    color: var(--gold-bright);
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .check-link:hover {
                    background: rgba(184, 134, 11, 0.4);
                }
                
                .meetings-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                }
                .meeting-item {
                    padding: 0.5rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 6px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .meeting-date-small { font-size: 0.8rem; font-weight: 500; }
                .meeting-days { font-size: 0.7rem; color: var(--text-secondary); }
                
                .links-section {
                    padding-top: 1rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                }
                .check-note {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin: 0 0 0.5rem;
                }
                .links-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .links-grid a {
                    padding: 0.4rem 0.8rem;
                    background: rgba(184, 134, 11, 0.1);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 6px;
                    color: var(--gold-medium);
                    text-decoration: none;
                    font-size: 0.75rem;
                    transition: all 0.3s;
                }
                .links-grid a:hover {
                    background: rgba(184, 134, 11, 0.2);
                    border-color: var(--gold-primary);
                }
                
                @media (max-width: 768px) {
                    .rate-section { grid-template-columns: 1fr; }
                    .meetings-list { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
