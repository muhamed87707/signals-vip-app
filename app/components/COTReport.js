'use client';

import { useLanguage } from '../context/LanguageContext';

export default function COTReport() {
    const { lang, mounted } = useLanguage();

    if (!mounted) return <div style={{ minHeight: '400px' }}></div>;

    // Mock/Sample COT Data - Ideally fetched from a specialized financial API or curated manually
    const cotData = [
        { asset: lang === 'ar' ? 'الذهب (XAU)' : 'Gold (XAU)', long: 72, short: 28, trend: 'bullish' },
        { asset: lang === 'ar' ? 'اليورو (EUR)' : 'Euro (EUR)', long: 45, short: 55, trend: 'bearish' },
        { asset: lang === 'ar' ? 'الجنيه الإسترليني (GBP)' : 'GB Pound (GBP)', long: 60, short: 40, trend: 'bullish' },
        { asset: lang === 'ar' ? 'ين ياباني (JPY)' : 'Yen (JPY)', long: 30, short: 70, trend: 'bearish' },
    ];

    return (
        <div className="cot-report-card animate-fade-in-up">
            <div className="cot-header">
                <div className="cot-icon">📊</div>
                <div className="cot-header-text">
                    <h3>{lang === 'ar' ? 'تقرير التزام المتداولين (COT)' : 'COT Report Analysis'}</h3>
                    <p>{lang === 'ar' ? 'تمركُز صنّاع السوق والحيتان' : 'Institutional Market Positioning'}</p>
                </div>
            </div>

            <div className="cot-content">
                {cotData.map((item, idx) => (
                    <div key={idx} className="cot-item">
                        <div className="cot-item-header">
                            <span className="asset-name">{item.asset}</span>
                            <span className={`sentiment-label ${item.trend}`}>
                                {item.trend === 'bullish' ? (lang === 'ar' ? 'شرائي' : 'Bullish') : (lang === 'ar' ? 'بيعي' : 'Bearish')}
                            </span>
                        </div>
                        <div className="cot-bar-container">
                            <div className="cot-bar-long" style={{ width: `${item.long}%` }}>
                                <span className="bar-label">{item.long}%</span>
                            </div>
                            <div className="cot-bar-short" style={{ width: `${item.short}%` }}>
                                <span className="bar-label">{item.short}%</span>
                            </div>
                        </div>
                        <div className="cot-labels">
                            <span>{lang === 'ar' ? 'عقود شراء' : 'Longs'}</span>
                            <span>{lang === 'ar' ? 'عقود بيع' : 'Shorts'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .cot-report-card {
                    background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 20px;
                    padding: 1.5rem;
                    height: 100%;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
                }
                .cot-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .cot-icon {
                    font-size: 1.8rem;
                    background: var(--gold-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .cot-header-text h3 {
                    color: white;
                    margin: 0;
                    font-size: 1.2rem;
                }
                .cot-header-text p {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    margin: 0;
                }
                .cot-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                }
                .cot-item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                .asset-name {
                    font-weight: 600;
                    color: white;
                    font-size: 0.9rem;
                }
                .sentiment-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .sentiment-label.bullish { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .sentiment-label.bearish { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .cot-bar-container {
                    height: 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    display: flex;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .cot-bar-long {
                    background: linear-gradient(90deg, #166534, #22c55e);
                    display: flex;
                    align-items: center;
                    padding-left: 8px;
                    transition: width 1s ease-in-out;
                }
                .cot-bar-short {
                    background: linear-gradient(90deg, #991b1b, #ef4444);
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 8px;
                    transition: width 1s ease-in-out;
                }
                .bar-label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }
                .cot-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-top: 0.3rem;
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
}
