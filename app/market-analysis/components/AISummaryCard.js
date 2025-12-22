'use client';

import { useState, useEffect } from 'react';
import { DataCard, LoadingSkeleton, TrendBadge, ChangeIndicator } from './common';

/**
 * AISummaryCard - AI-generated market summary and analysis
 */
export default function AISummaryCard({ lang = 'en' }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const translations = {
        en: {
            title: 'AI Market Analysis',
            summary: 'Market Summary',
            sentiment: 'Market Sentiment',
            confidence: 'Confidence',
            topFactors: 'Top Influencing Factors',
            support: 'Support Levels',
            resistance: 'Resistance Levels',
            scenarios: 'Price Scenarios',
            bullishScenario: 'Bullish Scenario',
            neutralScenario: 'Neutral Scenario',
            bearishScenario: 'Bearish Scenario',
            target: 'Target',
            probability: 'Probability',
            range: 'Range',
            triggers: 'Triggers',
            shortTerm: '24-48h Outlook',
            keyLevels: 'Key Levels to Watch',
            riskFactors: 'Risk Factors',
            showMore: 'Show More Details',
            showLess: 'Show Less',
            poweredBy: 'Powered by Gemini AI',
            lastUpdate: 'Last Update',
            refresh: 'Refresh Analysis',
            loading: 'Generating AI Analysis...',
            error: 'Failed to load analysis'
        },
        ar: {
            title: 'تحليل السوق بالذكاء الاصطناعي',
            summary: 'ملخص السوق',
            sentiment: 'اتجاه السوق',
            confidence: 'مستوى الثقة',
            topFactors: 'أهم العوامل المؤثرة',
            support: 'مستويات الدعم',
            resistance: 'مستويات المقاومة',
            scenarios: 'سيناريوهات السعر',
            bullishScenario: 'السيناريو الصعودي',
            neutralScenario: 'السيناريو المحايد',
            bearishScenario: 'السيناريو الهبوطي',
            target: 'الهدف',
            probability: 'الاحتمالية',
            range: 'النطاق',
            triggers: 'المحفزات',
            shortTerm: 'توقعات 24-48 ساعة',
            keyLevels: 'المستويات المهمة للمراقبة',
            riskFactors: 'عوامل المخاطرة',
            showMore: 'عرض المزيد من التفاصيل',
            showLess: 'عرض أقل',
            poweredBy: 'مدعوم بـ Gemini AI',
            lastUpdate: 'آخر تحديث',
            refresh: 'تحديث التحليل',
            loading: 'جاري توليد التحليل...',
            error: 'فشل في تحميل التحليل'
        }
    };

    const t = translations[lang] || translations.en;

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/market/ai-analysis');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setAnalysis(data);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const formatTime = (date) => {
        if (!date) return '---';
        return date.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.7) return '#4caf50';
        if (confidence >= 0.5) return '#ff9800';
        return '#f44336';
    };

    const getSummary = () => {
        if (!analysis) return '';
        return lang === 'ar' ? analysis.summaryAr : analysis.summary;
    };

    const getFactorName = (factor) => {
        return lang === 'ar' ? factor.factorAr : factor.factor;
    };

    const getFactorExplanation = (factor) => {
        return lang === 'ar' ? factor.explanationAr : factor.explanation;
    };

    return (
        <div className="ai-summary-card">
            <div className="ai-card-header">
                <div className="ai-title">
                    <span className="ai-icon">🧠</span>
                    <h2>{t.title}</h2>
                </div>
                <div className="ai-actions">
                    <button 
                        className="refresh-btn"
                        onClick={fetchAnalysis}
                        disabled={loading}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'spinning' : ''}>
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ai-card-content">
                {loading && !analysis ? (
                    <div className="ai-loading">
                        <div className="loading-animation">
                            <div className="pulse-ring"></div>
                            <span className="brain-icon">🧠</span>
                        </div>
                        <p>{t.loading}</p>
                    </div>
                ) : error && !analysis ? (
                    <div className="ai-error">
                        <p>{t.error}</p>
                        <button onClick={fetchAnalysis}>{t.refresh}</button>
                    </div>
                ) : analysis ? (
                    <>
                        {/* Summary Section */}
                        <div className="summary-section">
                            <p className="summary-text">{getSummary()}</p>
                        </div>

                        {/* Sentiment & Confidence */}
                        <div className="sentiment-row">
                            <div className="sentiment-item">
                                <span className="label">{t.sentiment}</span>
                                <TrendBadge trend={analysis.sentiment} lang={lang} size="md" />
                            </div>
                            <div className="sentiment-item">
                                <span className="label">{t.confidence}</span>
                                <div className="confidence-bar">
                                    <div 
                                        className="confidence-fill"
                                        style={{ 
                                            width: `${(analysis.confidence || 0) * 100}%`,
                                            backgroundColor: getConfidenceColor(analysis.confidence)
                                        }}
                                    />
                                    <span className="confidence-value">
                                        {((analysis.confidence || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Factors */}
                        <div className="factors-section">
                            <h3>{t.topFactors}</h3>
                            <div className="factors-list">
                                {analysis.topFactors?.slice(0, 3).map((factor, idx) => (
                                    <div key={idx} className="factor-item">
                                        <div className="factor-header">
                                            <span className={`impact-dot ${factor.impact}`}></span>
                                            <span className="factor-name">{getFactorName(factor)}</span>
                                            <span className="factor-weight">{(factor.weight * 100).toFixed(0)}%</span>
                                        </div>
                                        <p className="factor-explanation">{getFactorExplanation(factor)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Levels */}
                        <div className="levels-section">
                            <div className="levels-group">
                                <h4>{t.support}</h4>
                                <div className="levels-values">
                                    {analysis.supportLevels?.map((level, idx) => (
                                        <span key={idx} className="level support">${level}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="levels-group">
                                <h4>{t.resistance}</h4>
                                <div className="levels-values">
                                    {analysis.resistanceLevels?.map((level, idx) => (
                                        <span key={idx} className="level resistance">${level}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details */}
                        {expanded && (
                            <div className="expanded-details">
                                {/* Scenarios */}
                                <div className="scenarios-section">
                                    <h3>{t.scenarios}</h3>
                                    <div className="scenarios-grid">
                                        <div className="scenario bullish">
                                            <h4>📈 {t.bullishScenario}</h4>
                                            <p>{t.target}: <strong>${analysis.scenarios?.bullish?.target}</strong></p>
                                            <p>{t.probability}: <strong>{((analysis.scenarios?.bullish?.probability || 0) * 100).toFixed(0)}%</strong></p>
                                        </div>
                                        <div className="scenario neutral">
                                            <h4>➡️ {t.neutralScenario}</h4>
                                            <p>{t.range}: <strong>${analysis.scenarios?.neutral?.range?.[0]} - ${analysis.scenarios?.neutral?.range?.[1]}</strong></p>
                                            <p>{t.probability}: <strong>{((analysis.scenarios?.neutral?.probability || 0) * 100).toFixed(0)}%</strong></p>
                                        </div>
                                        <div className="scenario bearish">
                                            <h4>📉 {t.bearishScenario}</h4>
                                            <p>{t.target}: <strong>${analysis.scenarios?.bearish?.target}</strong></p>
                                            <p>{t.probability}: <strong>{((analysis.scenarios?.bearish?.probability || 0) * 100).toFixed(0)}%</strong></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Short Term Outlook */}
                                <div className="outlook-section">
                                    <h3>{t.shortTerm}</h3>
                                    <p>{lang === 'ar' ? analysis.shortTermOutlookAr : analysis.shortTermOutlook}</p>
                                </div>

                                {/* Risk Factors */}
                                <div className="risk-section">
                                    <h3>⚠️ {t.riskFactors}</h3>
                                    <ul>
                                        {(lang === 'ar' ? analysis.riskFactorsAr : analysis.riskFactors)?.map((risk, idx) => (
                                            <li key={idx}>{risk}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Toggle Button */}
                        <button 
                            className="toggle-details"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? t.showLess : t.showMore}
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Footer */}
                        <div className="ai-footer">
                            <span className="powered-by">✨ {t.poweredBy}</span>
                            {lastUpdate && (
                                <span className="last-update">{t.lastUpdate}: {formatTime(lastUpdate)}</span>
                            )}
                        </div>
                    </>
                ) : null}
            </div>

            <style jsx>{`
                .ai-summary-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.25);
                    border-radius: 20px;
                    overflow: hidden;
                    margin-bottom: 2rem;
                }

                .ai-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(90deg, rgba(184, 134, 11, 0.1), transparent);
                    border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                }

                .ai-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .ai-icon {
                    font-size: 1.5rem;
                }

                .ai-title h2 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    background: var(--gradient-gold-text);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                }

                .refresh-btn {
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    padding: 0.5rem;
                    cursor: pointer;
                    color: var(--gold-medium);
                    transition: all 0.2s;
                }

                .refresh-btn:hover {
                    background: rgba(184, 134, 11, 0.1);
                }

                .refresh-btn:disabled {
                    opacity: 0.5;
                }

                :global(.spinning) {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .ai-card-content {
                    padding: 1.5rem;
                }

                /* Loading State */
                .ai-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    gap: 1rem;
                }

                .loading-animation {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pulse-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 2px solid var(--gold-primary);
                    border-radius: 50%;
                    animation: pulse-ring 1.5s ease-out infinite;
                }

                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                .brain-icon {
                    font-size: 2rem;
                    animation: pulse 1s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .ai-loading p {
                    color: var(--text-secondary);
                    font-style: italic;
                }

                /* Summary */
                .summary-section {
                    margin-bottom: 1.5rem;
                }

                .summary-text {
                    font-size: 1rem;
                    line-height: 1.7;
                    color: var(--text-primary);
                }

                /* Sentiment Row */
                .sentiment-row {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }

                .sentiment-item {
                    flex: 1;
                }

                .sentiment-item .label {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .confidence-bar {
                    height: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                }

                .confidence-fill {
                    height: 100%;
                    border-radius: 12px;
                    transition: width 0.5s ease;
                }

                .confidence-value {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: white;
                }

                /* Factors */
                .factors-section h3,
                .scenarios-section h3,
                .outlook-section h3,
                .risk-section h3 {
                    font-size: 0.9rem;
                    color: var(--gold-medium);
                    margin-bottom: 0.75rem;
                }

                .factors-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .factor-item {
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                    border-left: 3px solid var(--gold-primary);
                }

                .factor-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .impact-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .impact-dot.positive { background: #4caf50; }
                .impact-dot.negative { background: #f44336; }
                .impact-dot.neutral { background: #ff9800; }

                .factor-name {
                    flex: 1;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .factor-weight {
                    font-size: 0.8rem;
                    color: var(--gold-medium);
                }

                .factor-explanation {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0;
                }

                /* Levels */
                .levels-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin: 1.5rem 0;
                }

                .levels-group h4 {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .levels-values {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .level {
                    padding: 0.3rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .level.support {
                    background: rgba(76, 175, 80, 0.15);
                    color: #4caf50;
                }

                .level.resistance {
                    background: rgba(244, 67, 54, 0.15);
                    color: #f44336;
                }

                /* Expanded Details */
                .expanded-details {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.15);
                }

                .scenarios-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .scenario {
                    padding: 1rem;
                    border-radius: 12px;
                    background: rgba(0, 0, 0, 0.2);
                }

                .scenario h4 {
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .scenario.bullish { border-left: 3px solid #4caf50; }
                .scenario.neutral { border-left: 3px solid #ff9800; }
                .scenario.bearish { border-left: 3px solid #f44336; }

                .scenario p {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin: 0.25rem 0;
                }

                .scenario strong {
                    color: var(--text-primary);
                }

                .outlook-section,
                .risk-section {
                    margin-top: 1rem;
                }

                .outlook-section p {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                .risk-section ul {
                    margin: 0;
                    padding-left: 1.25rem;
                }

                .risk-section li {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    margin-bottom: 0.25rem;
                }

                /* Toggle Button */
                .toggle-details {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.75rem;
                    margin-top: 1rem;
                    background: transparent;
                    border: 1px dashed rgba(184, 134, 11, 0.3);
                    border-radius: 8px;
                    color: var(--gold-medium);
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-details:hover {
                    background: rgba(184, 134, 11, 0.1);
                    border-style: solid;
                }

                .toggle-details svg {
                    transition: transform 0.3s;
                }

                /* Footer */
                .ai-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(184, 134, 11, 0.1);
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .powered-by {
                    color: var(--gold-medium);
                }

                /* Error State */
                .ai-error {
                    text-align: center;
                    padding: 2rem;
                }

                .ai-error p {
                    color: #f44336;
                    margin-bottom: 1rem;
                }

                .ai-error button {
                    padding: 0.5rem 1rem;
                    background: var(--gold-primary);
                    border: none;
                    border-radius: 8px;
                    color: #1a1a1a;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .sentiment-row {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .levels-section {
                        grid-template-columns: 1fr;
                    }

                    .scenarios-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
