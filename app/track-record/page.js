'use client';

import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

// Sample track record data (would be fetched from API in production)
const trackRecordData = [
    { date: '2024-12-13', pair: 'XAUUSD', type: 'BUY', entry: 2650.50, tp: 2665.00, sl: 2640.00, result: 'TP', pips: '+145' },
    { date: '2024-12-12', pair: 'XAUUSD', type: 'SELL', entry: 2680.00, tp: 2660.00, sl: 2695.00, result: 'TP', pips: '+200' },
    { date: '2024-12-11', pair: 'EURUSD', type: 'BUY', entry: 1.0520, tp: 1.0580, sl: 1.0480, result: 'TP', pips: '+60' },
    { date: '2024-12-10', pair: 'XAUUSD', type: 'BUY', entry: 2620.00, tp: 2640.00, sl: 2605.00, result: 'SL', pips: '-150' },
    { date: '2024-12-09', pair: 'GBPUSD', type: 'SELL', entry: 1.2750, tp: 1.2680, sl: 1.2800, result: 'TP', pips: '+70' },
    { date: '2024-12-08', pair: 'XAUUSD', type: 'BUY', entry: 2590.00, tp: 2620.00, sl: 2575.00, result: 'TP', pips: '+300' },
    { date: '2024-12-07', pair: 'XAUUSD', type: 'SELL', entry: 2610.00, tp: 2585.00, sl: 2625.00, result: 'TP', pips: '+250' },
    { date: '2024-12-06', pair: 'USDJPY', type: 'BUY', entry: 149.50, tp: 150.50, sl: 148.80, result: 'TP', pips: '+100' },
];

// Calculate stats from data
const calculateStats = (data) => {
    const wins = data.filter(s => s.result === 'TP').length;
    const total = data.length;
    const winRate = Math.round((wins / total) * 100);
    const totalPips = data.reduce((sum, s) => sum + parseInt(s.pips), 0);
    return { winRate, totalPips, wins, losses: total - wins };
};

export default function TrackRecordPage() {
    const { t, toggleLang, isRTL, mounted } = useLanguage();
    const stats = calculateStats(trackRecordData);

    if (!mounted) return null;

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            padding: '2rem 1rem'
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <Link href="/" style={{
                    color: 'var(--gold-medium)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem'
                }}>
                    {t.backToHome}
                </Link>
                <button onClick={toggleLang} style={{
                    background: 'rgba(218, 165, 32, 0.1)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    borderRadius: '50px',
                    padding: '0.5rem 1rem',
                    color: 'var(--gold-medium)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}>
                    {t.langSwitch}
                </button>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="text-gradient" style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem'
                }}>
                    {t.trackRecord}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {t.trackRecordSubtitle}
                </p>
            </div>

            {/* Stats Summary */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto 3rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
            }}>
                {[
                    { label: t.winRate, value: `${stats.winRate}%`, color: '#4caf50' },
                    { label: t.totalPips, value: `+${stats.totalPips}`, color: '#FFD700' },
                    { label: 'Wins', value: stats.wins, color: '#4caf50' },
                    { label: 'Losses', value: stats.losses, color: '#f44336' }
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(184, 134, 11, 0.2)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: stat.color,
                            marginBottom: '0.25rem'
                        }}>
                            {stat.value}
                        </div>
                        <div style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase'
                        }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Signals Table */}
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                overflowX: 'auto'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    background: 'var(--bg-card)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    <thead>
                        <tr style={{ background: 'rgba(184, 134, 11, 0.1)' }}>
                            {['Date', 'Pair', 'Type', 'Entry', 'TP', 'SL', 'Result', 'Pips'].map(h => (
                                <th key={h} style={{
                                    padding: '1rem',
                                    color: 'var(--gold-medium)',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    borderBottom: '1px solid rgba(184, 134, 11, 0.2)'
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {trackRecordData.map((signal, idx) => (
                            <tr key={idx} style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    {signal.date}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'center' }}>
                                    {signal.pair}
                                </td>
                                <td style={{
                                    padding: '1rem',
                                    textAlign: 'center'
                                }}>
                                    <span style={{
                                        background: signal.type === 'BUY' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                        color: signal.type === 'BUY' ? '#4caf50' : '#f44336',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600'
                                    }}>
                                        {signal.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-primary)', textAlign: 'center' }}>
                                    {signal.entry}
                                </td>
                                <td style={{ padding: '1rem', color: '#4caf50', textAlign: 'center' }}>
                                    {signal.tp}
                                </td>
                                <td style={{ padding: '1rem', color: '#f44336', textAlign: 'center' }}>
                                    {signal.sl}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        background: signal.result === 'TP' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                        color: signal.result === 'TP' ? '#4caf50' : '#f44336',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700'
                                    }}>
                                        {signal.result}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '1rem',
                                    color: signal.pips.startsWith('+') ? '#4caf50' : '#f44336',
                                    fontWeight: '700',
                                    textAlign: 'center'
                                }}>
                                    {signal.pips}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <a href="/#pricing" className="btn-primary" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2.5rem',
                    fontSize: '1.1rem'
                }}>
                    {t.ctaButton} →
                </a>
            </div>
        </div>
    );
}
