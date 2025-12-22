'use client';

import { useState, useEffect } from 'react';
import { DataCard, LoadingSkeleton, TrendBadge, ChangeIndicator } from './common';

/**
 * COTReportCard - Commitment of Traders Report Analysis
 * Shows positions of Commercial, Non-Commercial, and Small Speculators
 */
export default function COTReportCard({ lang = 'en' }) {
    const [cotData, setCotData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChart, setShowChart] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const translations = {
        en: {
            title: 'COT Report Analysis',
            subtitle: 'Commitment of Traders - Gold Futures',
            reportDate: 'Report Date',
            releaseDate: 'Release Date',
            commercial: 'Commercial',
            commercialDesc: 'Hedgers (Producers/Consumers)',
            nonCommercial: 'Non-Commercial',
            nonCommercialDesc: 'Large Speculators (Funds)',
            smallSpec: 'Small Speculators',
            smallSpecDesc: 'Retail Traders',
            long: 'Long',
            short: 'Short',
            net: 'Net Position',
            change: 'Weekly Change',
            openInterest: 'Open Interest',
            cotIndex: 'COT Index',
            cotIndexDesc: '52-Week Positioning',
            extremeBullish: 'Extreme Bullish',
            bullish: 'Bullish',
            neutral: 'Neutral',
            bearish: 'Bearish',
            extremeBearish: 'Extreme Bearish',
            showChart: 'Show Historical Chart',
            hideChart: 'Hide Chart',
            aiAnalysis: 'AI Analysis',
            generateAI: 'Generate AI Analysis',
            contracts: 'contracts',
            loading: 'Loading COT data...',
            error: 'Failed to load COT data',
            refresh: 'Refresh'
        },
        ar: {
            title: 'تحليل تقرير COT',
            subtitle: 'التزامات المتداولين - عقود الذهب الآجلة',
            reportDate: 'تاريخ التقرير',
            releaseDate: 'تاريخ الإصدار',
            commercial: 'التجاريون',
            commercialDesc: 'المتحوطون (المنتجون/المستهلكون)',
            nonCommercial: 'غير التجاريين',
            nonCommercialDesc: 'كبار المضاربين (الصناديق)',
            smallSpec: 'صغار المضاربين',
            smallSpecDesc: 'المتداولون الأفراد',
            long: 'شراء',
            short: 'بيع',
            net: 'صافي المركز',
            change: 'التغيير الأسبوعي',
            openInterest: 'العقود المفتوحة',
            cotIndex: 'مؤشر COT',
            cotIndexDesc: 'التموضع خلال 52 أسبوع',
            extremeBullish: 'صعودي للغاية',
            bullish: 'صعودي',
            neutral: 'محايد',
            bearish: 'هبوطي',
            extremeBearish: 'هبوطي للغاية',
            showChart: 'عرض الرسم البياني التاريخي',
            hideChart: 'إخفاء الرسم',
            aiAnalysis: 'تحليل الذكاء الاصطناعي',
            generateAI: 'توليد تحليل AI',
            contracts: 'عقد',
            loading: 'جاري تحميل بيانات COT...',
            error: 'فشل في تحميل بيانات COT',
            refresh: 'تحديث'
        }
    };

    const t = translations[lang] || translations.en;

    const fetchCOTData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/market/cot-report');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setCotData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAIAnalysis = async () => {
        if (!cotData) return;
        setLoadingAI(true);
        try {
            const res = await fetch('/api/market/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customPrompt: `Analyze this COT (Commitment of Traders) data for Gold futures and provide insights:
                    
Non-Commercial (Large Specs): Net ${cotData.nonCommercial.net} contracts (${cotData.nonCommercial.change > 0 ? '+' : ''}${cotData.nonCommercial.change} weekly change)
Commercial (Hedgers): Net ${cotData.commercial.net} contracts
Small Speculators: Net ${cotData.smallSpeculators.net} contracts
COT Index: ${cotData.cotIndex.value} (${cotData.cotIndex.signal})
Open Interest: ${cotData.openInterest.total}

Provide analysis in JSON format:
{
    "analysis": "2-3 sentence analysis in English",
    "analysisAr": "تحليل من 2-3 جمل بالعربية",
    "signal": "bullish" or "bearish" or "neutral",
    "keyInsights": ["insight1", "insight2"],
    "keyInsightsAr": ["رؤية1", "رؤية2"]
}`
                })
            });
            if (res.ok) {
                const data = await res.json();
                setAiAnalysis(data);
            }
        } catch (err) {
            console.error('AI analysis error:', err);
        } finally {
            setLoadingAI(false);
        }
    };

    useEffect(() => {
        fetchCOTData();
    }, []);

    const formatNumber = (num) => {
        if (num === undefined || num === null) return '---';
        return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(num);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCOTSignalText = (signal) => {
        const signals = {
            extreme_bullish: t.extremeBullish,
            bullish: t.bullish,
            neutral: t.neutral,
            bearish: t.bearish,
            extreme_bearish: t.extremeBearish
        };
        return signals[signal] || t.neutral;
    };

    const getCOTSignalColor = (signal) => {
        const colors = {
            extreme_bullish: '#00c853',
            bullish: '#4caf50',
            neutral: '#ff9800',
            bearish: '#f44336',
            extreme_bearish: '#b71c1c'
        };
        return colors[signal] || '#ff9800';
    };

    const renderPositionBar = (long, short, color) => {
        const total = long + short;
        const longPercent = (long / total) * 100;
        return (
            <div className="position-bar">
                <div className="bar-fill long" style={{ width: `${longPercent}%`, backgroundColor: color }} />
                <div className="bar-fill short" style={{ width: `${100 - longPercent}%` }} />
            </div>
        );
    };

    if (loading && !cotData) {
        return (
            <div className="cot-card loading-state">
                <LoadingSkeleton height="400px" />
            </div>
        );
    }

    if (error && !cotData) {
        return (
            <div className="cot-card error-state">
                <p>{t.error}</p>
                <button onClick={fetchCOTData}>{t.refresh}</button>
            </div>
        );
    }

    return (
        <div className="cot-card">
            <div className="cot-header">
                <div className="cot-title">
                    <span className="cot-icon">📊</span>
                    <div>
                        <h2>{t.title}</h2>
                        <p className="subtitle">{t.subtitle}</p>
                    </div>
                </div>
                <div className="cot-meta">
                    <span>{t.reportDate}: {formatDate(cotData?.reportDate)}</span>
                </div>
            </div>

            <div className="cot-content">
                {/* COT Index Gauge */}
                <div className="cot-index-section">
                    <h3>{t.cotIndex}</h3>
                    <div className="cot-gauge">
                        <div className="gauge-track">
                            <div 
                                className="gauge-fill"
                                style={{ 
                                    width: `${cotData?.cotIndex?.value || 50}%`,
                                    backgroundColor: getCOTSignalColor(cotData?.cotIndex?.signal)
                                }}
                            />
                            <div 
                                className="gauge-marker"
                                style={{ left: `${cotData?.cotIndex?.value || 50}%` }}
                            />
                        </div>
                        <div className="gauge-labels">
                            <span>0</span>
                            <span className="gauge-value">
                                {cotData?.cotIndex?.value}%
                            </span>
                            <span>100</span>
                        </div>
                        <div className="gauge-signal" style={{ color: getCOTSignalColor(cotData?.cotIndex?.signal) }}>
                            {getCOTSignalText(cotData?.cotIndex?.signal)}
                        </div>
                    </div>
                </div>

                {/* Traders Positions Grid */}
                <div className="positions-grid">
                    {/* Non-Commercial (Large Specs) */}
                    <div className="position-card highlight">
                        <div className="position-header">
                            <h4>{t.nonCommercial}</h4>
                            <span className="position-desc">{t.nonCommercialDesc}</span>
                        </div>
                        <div className="position-data">
                            <div className="position-row">
                                <span className="label">{t.long}</span>
                                <span className="value green">{formatNumber(cotData?.nonCommercial?.long)}</span>
                            </div>
                            <div className="position-row">
                                <span className="label">{t.short}</span>
                                <span className="value red">{formatNumber(cotData?.nonCommercial?.short)}</span>
                            </div>
                            {renderPositionBar(cotData?.nonCommercial?.long || 0, cotData?.nonCommercial?.short || 0, '#4caf50')}
                            <div className="position-row net">
                                <span className="label">{t.net}</span>
                                <span className={`value ${cotData?.nonCommercial?.net >= 0 ? 'green' : 'red'}`}>
                                    {cotData?.nonCommercial?.net >= 0 ? '+' : ''}{formatNumber(cotData?.nonCommercial?.net)}
                                </span>
                            </div>
                            <div className="position-row change">
                                <span className="label">{t.change}</span>
                                <ChangeIndicator 
                                    value={cotData?.nonCommercial?.change} 
                                    suffix={` ${t.contracts}`}
                                    showArrow
                                />
                            </div>
                        </div>
                    </div>

                    {/* Commercial (Hedgers) */}
                    <div className="position-card">
                        <div className="position-header">
                            <h4>{t.commercial}</h4>
                            <span className="position-desc">{t.commercialDesc}</span>
                        </div>
                        <div className="position-data">
                            <div className="position-row">
                                <span className="label">{t.long}</span>
                                <span className="value green">{formatNumber(cotData?.commercial?.long)}</span>
                            </div>
                            <div className="position-row">
                                <span className="label">{t.short}</span>
                                <span className="value red">{formatNumber(cotData?.commercial?.short)}</span>
                            </div>
                            {renderPositionBar(cotData?.commercial?.long || 0, cotData?.commercial?.short || 0, '#2196f3')}
                            <div className="position-row net">
                                <span className="label">{t.net}</span>
                                <span className={`value ${cotData?.commercial?.net >= 0 ? 'green' : 'red'}`}>
                                    {cotData?.commercial?.net >= 0 ? '+' : ''}{formatNumber(cotData?.commercial?.net)}
                                </span>
                            </div>
                            <div className="position-row change">
                                <span className="label">{t.change}</span>
                                <ChangeIndicator 
                                    value={cotData?.commercial?.change} 
                                    suffix={` ${t.contracts}`}
                                    showArrow
                                />
                            </div>
                        </div>
                    </div>

                    {/* Small Speculators */}
                    <div className="position-card">
                        <div className="position-header">
                            <h4>{t.smallSpec}</h4>
                            <span className="position-desc">{t.smallSpecDesc}</span>
                        </div>
                        <div className="position-data">
                            <div className="position-row">
                                <span className="label">{t.long}</span>
                                <span className="value green">{formatNumber(cotData?.smallSpeculators?.long)}</span>
                            </div>
                            <div className="position-row">
                                <span className="label">{t.short}</span>
                                <span className="value red">{formatNumber(cotData?.smallSpeculators?.short)}</span>
                            </div>
                            {renderPositionBar(cotData?.smallSpeculators?.long || 0, cotData?.smallSpeculators?.short || 0, '#ff9800')}
                            <div className="position-row net">
                                <span className="label">{t.net}</span>
                                <span className={`value ${cotData?.smallSpeculators?.net >= 0 ? 'green' : 'red'}`}>
                                    {cotData?.smallSpeculators?.net >= 0 ? '+' : ''}{formatNumber(cotData?.smallSpeculators?.net)}
                                </span>
                            </div>
                            <div className="position-row change">
                                <span className="label">{t.change}</span>
                                <ChangeIndicator 
                                    value={cotData?.smallSpeculators?.change} 
                                    suffix={` ${t.contracts}`}
                                    showArrow
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Open Interest */}
                <div className="open-interest-section">
                    <div className="oi-item">
                        <span className="oi-label">{t.openInterest}</span>
                        <span className="oi-value">{formatNumber(cotData?.openInterest?.total)}</span>
                        <ChangeIndicator value={cotData?.openInterest?.change} showArrow />
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="ai-section">
                    <div className="ai-header">
                        <h3>🧠 {t.aiAnalysis}</h3>
                        {!aiAnalysis && (
                            <button 
                                className="generate-ai-btn"
                                onClick={fetchAIAnalysis}
                                disabled={loadingAI}
                            >
                                {loadingAI ? '...' : t.generateAI}
                            </button>
                        )}
                    </div>
                    {aiAnalysis && (
                        <div className="ai-content">
                            <p>{lang === 'ar' ? aiAnalysis.analysisAr : aiAnalysis.analysis}</p>
                            {aiAnalysis.keyInsights && (
                                <ul className="ai-insights">
                                    {(lang === 'ar' ? aiAnalysis.keyInsightsAr : aiAnalysis.keyInsights)?.map((insight, idx) => (
                                        <li key={idx}>{insight}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Historical Chart Toggle */}
                <button 
                    className="chart-toggle"
                    onClick={() => setShowChart(!showChart)}
                >
                    {showChart ? t.hideChart : t.showChart}
                </button>

                {/* Simple Historical Chart */}
                {showChart && cotData?.historicalData && (
                    <div className="historical-chart">
                        <div className="chart-container">
                            {cotData.historicalData.slice(-26).map((week, idx) => {
                                const maxNet = Math.max(...cotData.historicalData.map(d => Math.abs(d.nonCommercialNet)));
                                const height = (Math.abs(week.nonCommercialNet) / maxNet) * 100;
                                const isPositive = week.nonCommercialNet >= 0;
                                return (
                                    <div key={idx} className="chart-bar-wrapper">
                                        <div 
                                            className={`chart-bar ${isPositive ? 'positive' : 'negative'}`}
                                            style={{ height: `${height}%` }}
                                            title={`${week.date}: ${formatNumber(week.nonCommercialNet)}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <p className="chart-label">{t.nonCommercial} {t.net} (26 weeks)</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .cot-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .cot-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(90deg, rgba(184, 134, 11, 0.08), transparent);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .cot-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .cot-icon { font-size: 1.5rem; }

                .cot-title h2 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--gold-medium);
                    margin: 0;
                }

                .subtitle {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0.25rem 0 0;
                }

                .cot-meta {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .cot-content { padding: 1.5rem; }

                /* COT Index Gauge */
                .cot-index-section {
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }

                .cot-index-section h3 {
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                    margin: 0 0 0.75rem;
                }

                .cot-gauge { text-align: center; }

                .gauge-track {
                    height: 12px;
                    background: linear-gradient(90deg, #b71c1c, #f44336, #ff9800, #4caf50, #00c853);
                    border-radius: 6px;
                    position: relative;
                    overflow: hidden;
                }

                .gauge-marker {
                    position: absolute;
                    top: -4px;
                    width: 4px;
                    height: 20px;
                    background: white;
                    border-radius: 2px;
                    transform: translateX(-50%);
                    box-shadow: 0 0 8px rgba(255,255,255,0.5);
                }

                .gauge-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .gauge-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .gauge-signal {
                    margin-top: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                /* Positions Grid */
                .positions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .position-card {
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 12px;
                    padding: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .position-card.highlight {
                    border-color: rgba(184, 134, 11, 0.3);
                    background: rgba(184, 134, 11, 0.05);
                }

                .position-header {
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .position-header h4 {
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    margin: 0;
                }

                .position-desc {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                .position-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.3rem 0;
                }

                .position-row .label {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .position-row .value {
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .position-row .value.green { color: #4caf50; }
                .position-row .value.red { color: #f44336; }

                .position-row.net {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                }

                .position-bar {
                    display: flex;
                    height: 6px;
                    border-radius: 3px;
                    overflow: hidden;
                    margin: 0.5rem 0;
                }

                .bar-fill.long { background: #4caf50; }
                .bar-fill.short { background: #f44336; }

                /* Open Interest */
                .open-interest-section {
                    display: flex;
                    justify-content: center;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .oi-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .oi-label {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .oi-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--gold-medium);
                }

                /* AI Section */
                .ai-section {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(184, 134, 11, 0.05);
                    border-radius: 12px;
                    border: 1px solid rgba(184, 134, 11, 0.15);
                }

                .ai-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .ai-header h3 {
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                    margin: 0;
                }

                .generate-ai-btn {
                    padding: 0.4rem 0.8rem;
                    background: var(--gold-primary);
                    border: none;
                    border-radius: 6px;
                    color: #1a1a1a;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .generate-ai-btn:hover { opacity: 0.9; }
                .generate-ai-btn:disabled { opacity: 0.5; }

                .ai-content p {
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    line-height: 1.6;
                    margin: 0;
                }

                .ai-insights {
                    margin: 0.75rem 0 0;
                    padding-left: 1.25rem;
                }

                .ai-insights li {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.25rem;
                }

                /* Chart Toggle */
                .chart-toggle {
                    width: 100%;
                    padding: 0.6rem;
                    margin-top: 1rem;
                    background: transparent;
                    border: 1px dashed rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    color: var(--gold-medium);
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .chart-toggle:hover {
                    background: rgba(184, 134, 11, 0.1);
                    border-style: solid;
                }

                /* Historical Chart */
                .historical-chart {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }

                .chart-container {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 120px;
                    gap: 2px;
                }

                .chart-bar-wrapper {
                    flex: 1;
                    height: 100%;
                    display: flex;
                    align-items: flex-end;
                }

                .chart-bar {
                    width: 100%;
                    border-radius: 2px 2px 0 0;
                    transition: height 0.3s;
                }

                .chart-bar.positive { background: #4caf50; }
                .chart-bar.negative { background: #f44336; }

                .chart-label {
                    text-align: center;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin: 0.75rem 0 0;
                }

                /* Loading & Error States */
                .loading-state, .error-state {
                    padding: 3rem;
                    text-align: center;
                }

                .error-state p {
                    color: #f44336;
                    margin-bottom: 1rem;
                }

                .error-state button {
                    padding: 0.5rem 1rem;
                    background: var(--gold-primary);
                    border: none;
                    border-radius: 8px;
                    color: #1a1a1a;
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .positions-grid { grid-template-columns: 1fr; }
                    .cot-header { flex-direction: column; gap: 0.5rem; }
                }
            `}</style>
        </div>
    );
}
