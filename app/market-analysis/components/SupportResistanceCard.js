'use client';

import { useState, useEffect } from 'react';
import { LoadingSkeleton } from './common';

export default function SupportResistanceCard({ lang = 'en', currentPrice = 2650 }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'Support & Resistance',
            subtitle: 'AI-generated key price levels',
            resistance: 'Resistance',
            support: 'Support',
            current: 'Current Price',
            scenarios: 'Price Scenarios',
            bullish: 'Bullish',
            neutral: 'Neutral',
            bearish: 'Bearish',
            probability: 'Probability',
            target: 'Target',
            keyLevel: 'Key Level'
        },
        ar: {
            title: 'الدعم والمقاومة',
            subtitle: 'مستويات الأسعار الرئيسية بالذكاء الاصطناعي',
            resistance: 'مقاومة',
            support: 'دعم',
            current: 'السعر الحالي',
            scenarios: 'سيناريوهات السعر',
            bullish: 'صعودي',
            neutral: 'محايد',
            bearish: 'هبوطي',
            probability: 'الاحتمالية',
            target: 'الهدف',
            keyLevel: 'مستوى رئيسي'
        }
    }[lang] || {};

    // Simulated AI-generated levels (would come from AI analysis API)
    const levels = {
        resistance: [
            { price: 2720, strength: 'strong', type: 'psychological' },
            { price: 2700, strength: 'medium', type: 'technical' },
            { price: 2680, strength: 'weak', type: 'recent high' }
        ],
        support: [
            { price: 2620, strength: 'weak', type: 'recent low' },
            { price: 2600, strength: 'medium', type: 'psychological' },
            { price: 2550, strength: 'strong', type: 'major support' }
        ],
        scenarios: [
            { type: 'bullish', probability: 45, target: 2750, description: 'Break above 2700 targets 2750' },
            { type: 'neutral', probability: 35, target: 2650, description: 'Range-bound between 2600-2700' },
            { type: 'bearish', probability: 20, target: 2550, description: 'Break below 2600 targets 2550' }
        ]
    };

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setData(levels);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) return <div className="sr-card"><LoadingSkeleton height="350px" /></div>;

    const getStrengthColor = (strength) => {
        const colors = { strong: '#4caf50', medium: '#ff9800', weak: '#9e9e9e' };
        return colors[strength] || '#9e9e9e';
    };

    const getScenarioColor = (type) => {
        const colors = { bullish: '#4caf50', neutral: '#ff9800', bearish: '#f44336' };
        return colors[type] || '#ff9800';
    };

    return (
        <div className="sr-card">
            <div className="card-header">
                <span className="icon">📍</span>
                <div>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>
            </div>

            {/* Visual Price Ladder */}
            <div className="price-ladder">
                {/* Resistance Levels */}
                {data?.resistance?.map((level, idx) => (
                    <div key={`r-${idx}`} className="level resistance">
                        <span className="price">${level.price}</span>
                        <div className="level-bar">
                            <div className="bar-fill" style={{ 
                                width: level.strength === 'strong' ? '100%' : level.strength === 'medium' ? '66%' : '33%',
                                backgroundColor: getStrengthColor(level.strength)
                            }} />
                        </div>
                        <span className="type">{t.resistance}</span>
                    </div>
                ))}
                
                {/* Current Price */}
                <div className="level current">
                    <span className="price">${currentPrice}</span>
                    <div className="current-marker">◆</div>
                    <span className="type">{t.current}</span>
                </div>
                
                {/* Support Levels */}
                {data?.support?.map((level, idx) => (
                    <div key={`s-${idx}`} className="level support">
                        <span className="price">${level.price}</span>
                        <div className="level-bar">
                            <div className="bar-fill" style={{ 
                                width: level.strength === 'strong' ? '100%' : level.strength === 'medium' ? '66%' : '33%',
                                backgroundColor: getStrengthColor(level.strength)
                            }} />
                        </div>
                        <span className="type">{t.support}</span>
                    </div>
                ))}
            </div>

            {/* Scenarios */}
            <div className="scenarios-section">
                <h3>{t.scenarios}</h3>
                <div className="scenarios-grid">
                    {data?.scenarios?.map((scenario, idx) => (
                        <div key={idx} className={`scenario ${scenario.type}`}>
                            <div className="scenario-header">
                                <span className="scenario-type" style={{ color: getScenarioColor(scenario.type) }}>
                                    {t[scenario.type]}
                                </span>
                                <span className="scenario-prob">{scenario.probability}%</span>
                            </div>
                            <div className="scenario-target">
                                <span className="label">{t.target}</span>
                                <span className="value">${scenario.target}</span>
                            </div>
                            <p className="scenario-desc">{scenario.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .sr-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    padding: 1.25rem;
                }
                .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
                .icon { font-size: 1.5rem; }
                .card-header h2 { font-size: 1rem; color: var(--gold-medium); margin: 0; }
                .card-header p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
                
                .price-ladder { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
                .level {
                    display: grid;
                    grid-template-columns: 70px 1fr 80px;
                    gap: 0.5rem;
                    align-items: center;
                    padding: 0.4rem 0.5rem;
                    border-radius: 6px;
                }
                .level.resistance { background: rgba(244, 67, 54, 0.1); }
                .level.support { background: rgba(76, 175, 80, 0.1); }
                .level.current { 
                    background: rgba(184, 134, 11, 0.2);
                    border: 1px solid var(--gold-primary);
                }
                .level .price { font-size: 0.85rem; font-weight: 600; }
                .level.resistance .price { color: #f44336; }
                .level.support .price { color: #4caf50; }
                .level.current .price { color: var(--gold-bright); }
                .level-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
                .bar-fill { height: 100%; border-radius: 3px; }
                .current-marker { text-align: center; color: var(--gold-bright); font-size: 1rem; }
                .type { font-size: 0.65rem; color: var(--text-secondary); text-align: right; }
                
                .scenarios-section h3 { font-size: 0.85rem; color: var(--gold-medium); margin: 0 0 0.75rem; }
                .scenarios-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
                .scenario {
                    padding: 0.5rem;
                    background: rgba(0,0,0,0.15);
                    border-radius: 8px;
                    border-top: 2px solid;
                }
                .scenario.bullish { border-color: #4caf50; }
                .scenario.neutral { border-color: #ff9800; }
                .scenario.bearish { border-color: #f44336; }
                .scenario-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
                .scenario-type { font-size: 0.75rem; font-weight: 600; }
                .scenario-prob { font-size: 0.7rem; color: var(--text-secondary); }
                .scenario-target { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
                .scenario-target .label { font-size: 0.65rem; color: var(--text-secondary); }
                .scenario-target .value { font-size: 0.85rem; font-weight: 600; color: var(--gold-bright); }
                .scenario-desc { font-size: 0.65rem; color: var(--text-secondary); margin: 0; line-height: 1.3; }
                
                @media (max-width: 768px) {
                    .scenarios-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
