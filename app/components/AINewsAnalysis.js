'use client';

import { useLanguage } from '../context/LanguageContext';

export default function AINewsAnalysis() {
    const { t, lang, isRTL } = useLanguage();

    // In a real app, this would be fetched from an API
    // Updated with real market data from Dec 19, 2025
    const analysisData = {
        en: {
            sentiment: 'Bullish Tilt',
            sentimentColor: '#ffd700', // Gold
            summary: "Today's market is defined by a cool down in US inflation (CPI at 2.7%), which has solidified expectations for Fed rate cuts in 2026. While Gold (XAUUSD) is seeing a temporary pull-back due to profit-taking, the long-term fundamentals remain exceptionally strong. The Bank of Japan's historic rate hike to 0.75% is adding volatility to JPY pairs.",
            topNews: [
                {
                    title: "US CPI Softer Than Expected",
                    impact: "High",
                    desc: "Inflation dropped to 2.7%, boosting late-2025 rate cut bets."
                },
                {
                    title: "BoJ Hikes Rates to 0.75%",
                    impact: "High",
                    desc: "Highest rates in 30 years for Japan, causing Yen volatility."
                },
                {
                    title: "Gold Resistance at $4,355",
                    impact: "Medium",
                    desc: "XAUUSD faces technical resistance but remains in an ascending triangle."
                }
            ]
        },
        ar: {
            sentiment: 'ميل صعودي',
            sentimentColor: '#ffd700',
            summary: "يتحدد سوق اليوم بتباطؤ التضخم الأمريكي (CPI عند 2.7٪)، مما عزز التوقعات بخفض أسعار الفائدة الفيدرالية في عام 2026. وبينما يشهد الذهب (XAUUSD) تراجعاً مؤقتاً بسبب جني الأرباح، تظل الأساسيات طويلة المدى قوية بشكل استثنائي. رفع البنك المركزي الياباني لأسعار الفائدة إلى 0.75٪ يضيف تقلبات كبيرة لأزواج الين.",
            topNews: [
                {
                    title: "التضخم الأمريكي أقل من المتوقع",
                    impact: "عالي",
                    desc: "انخفاض التضخم إلى 2.7٪ يعزز رهانات خفض الفائدة."
                },
                {
                    title: "المركزي الياباني يرفع الفائدة لـ 0.75٪",
                    impact: "عالي",
                    desc: "أعلى مستوى للفائدة في اليابان منذ 30 عاماً."
                },
                {
                    title: "مقاومة الذهب عند 4,355 دولار",
                    impact: "متوسط",
                    desc: "يواجه الذهب مقاومة فنية لكنه لا يزال في مسار صاعد."
                }
            ]
        }
    };

    const data = analysisData[lang] || analysisData['en'];

    return (
        <div className="ai-analysis-card animate-fade-in-up delay-100">
            <div className="ai-analysis-header">
                <div className="ai-pulse-icon">
                    <div className="pulse-ring"></div>
                    <span className="brain-icon">🧠</span>
                </div>
                <div>
                    <h3 className="ai-analysis-title">{t.aiInsights}</h3>
                    <div className="sentiment-badge" style={{ color: data.sentimentColor }}>
                        {t.marketSentiment}: <strong>{data.sentiment}</strong>
                    </div>
                </div>
            </div>

            <div className="ai-content-body">
                <div className="ai-summary-box">
                    <h4>{t.aiSummary}</h4>
                    <p>{data.summary}</p>
                </div>

                <div className="top-news-section">
                    <h4>{t.topNews}</h4>
                    <div className="news-grid">
                        {data.topNews.map((item, idx) => (
                            <div key={idx} className="news-item">
                                <div className="news-item-top">
                                    <span className="news-item-title">{item.title}</span>
                                    <span className={`impact-badge impact-${item.impact === 'High' || item.impact === 'عالي' ? 'high' : 'medium'}`}>
                                        {t.impact}: {item.impact}
                                    </span>
                                </div>
                                <p className="news-item-desc">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
