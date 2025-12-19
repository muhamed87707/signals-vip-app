'use client';

import { useLanguage } from '../context/LanguageContext';

export default function BankAnalysis() {
    const { lang, mounted } = useLanguage();

    if (!mounted) return <div style={{ minHeight: '400px' }}></div>;

    const bankForecasts = [
        { bank: 'Goldman Sachs', target: '2850', bias: 'Bullish', asset: 'Gold' },
        { bank: 'JP Morgan', target: '1.14', bias: 'Bearish', asset: 'EUR/USD' },
        { bank: 'Morgan Stanley', target: '1.35', bias: 'Bullish', asset: 'GBP/USD' },
        { bank: 'UBS', target: '2900', bias: 'Bullish', asset: 'Gold' },
    ];

    const translations = {
        title: lang === 'ar' ? 'توقعات البنوك العالمية' : 'Global Bank Forecasts',
        subtitle: lang === 'ar' ? 'مستهدفات الأسعار والتحيز المؤسسي' : 'Price Targets & Institutional Bias',
        bank: lang === 'ar' ? 'البنك' : 'Bank',
        target: lang === 'ar' ? 'المستهدف' : 'Target',
        bias: lang === 'ar' ? 'الاتجاه' : 'Bias',
        bullish: lang === 'ar' ? 'صعودي' : 'Bullish',
        bearish: lang === 'ar' ? 'هبوطي' : 'Bearish'
    };

    return (
        <div className="bank-analysis-card animate-fade-in-up">
            <div className="bank-header">
                <div className="bank-icon-seal">🏦</div>
                <div className="bank-header-text">
                    <h3>{translations.title}</h3>
                    <p>{translations.subtitle}</p>
                </div>
            </div>

            <div className="bank-table-wrapper">
                <table className="bank-table">
                    <thead>
                        <tr>
                            <th>{translations.bank}</th>
                            <th>Asset</th>
                            <th>{translations.target}</th>
                            <th>{translations.bias}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bankForecasts.map((item, idx) => (
                            <tr key={idx}>
                                <td className="bank-name">{item.bank}</td>
                                <td className="asset-tag">{item.asset}</td>
                                <td className="target-price">{item.target}</td>
                                <td>
                                    <span className={`bias-indicator ${item.bias.toLowerCase()}`}>
                                        {item.bias === 'Bullish' ? translations.bullish : translations.bearish}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .bank-analysis-card {
                    background: linear-gradient(135deg, rgba(25, 25, 25, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 20px;
                    padding: 1.5rem;
                    height: 100%;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
                }
                .bank-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .bank-icon-seal {
                    font-size: 1.8rem;
                    color: var(--gold-primary);
                }
                .bank-header-text h3 {
                    color: white;
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                .bank-header-text p {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    margin: 0;
                }
                .bank-table-wrapper {
                    overflow-x: auto;
                }
                .bank-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                :global([dir="rtl"]) .bank-table {
                    text-align: right;
                }
                .bank-table th {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.75rem;
                    padding: 0.8rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .bank-table td {
                    padding: 1rem 0.8rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
                    font-size: 0.85rem;
                    color: white;
                }
                .bank-name {
                    font-weight: 600;
                    color: var(--gold-primary) !important;
                }
                .asset-tag {
                    font-family: monospace;
                    opacity: 0.7;
                }
                .target-price {
                    font-weight: 700;
                    font-family: 'Inter', sans-serif;
                }
                .bias-indicator {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                }
                .bias-indicator.bullish {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }
                .bias-indicator.bearish {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </div>
    );
}
