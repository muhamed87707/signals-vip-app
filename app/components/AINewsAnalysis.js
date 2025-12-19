'use client';

import { useLanguage } from '../context/LanguageContext';

export default function AINewsAnalysis() {
    const { t, lang, mounted } = useLanguage();

    if (!mounted) return null;

    // Updated with high-impact only (Intensity 3) data
    const analysisData = {
        en: {
            sentiment: 'Bullish (Gold Focus)',
            sentimentColor: '#ffd700',
            summary: "Today's high-impact landscape is dominated by the US CPI release (2.7%), confirming a downward inflation trend. This significantly boosts the case for Gold (XAUUSD) as the market anticipates interest rate cuts. The Bank of Japan's rate hike to 0.75% has shifted the dynamic for USDJPY and major yen pairs, creating prime volatility for our VIP signals.",
            topNews: [
                {
                    title: "CRITICAL: US CPI Drops to 2.7%",
                    impact: "High",
                    desc: "Lower inflation increases expectations for Fed easing, directly supporting XAUUSD prices."
                },
                {
                    title: "BoJ Shock: Rates at 0.75%",
                    impact: "High",
                    desc: "Historic rate hike by Japan triggers massive volatility in JPY pairs. Monitor USDJPY levels."
                },
                {
                    title: "Gold Breakout Imminent?",
                    impact: "High",
                    desc: "Technical analysis shows XAUUSD testing major resistance after CPI data. Upside potential remains high."
                }
            ]
        },
        ar: {
            sentiment: 'صعودي (تركيز على الذهب)',
            sentimentColor: '#ffd700',
            summary: "نظرة اليوم للأخبار عالية التأثير يهيمن عليها صدور بيانات التضخم الأمريكية (2.7٪)، مما يؤكد اتجاه التضخم النزولي. هذا يعزز بشكل كبير قوة الذهب (XAUUSD) حيث يترقب السوق خفض أسعار الفائدة. رفع البنك الياباني للفائدة لـ 0.75٪ غير ديناميكية زوج USDJPY وأزواج الين الرئيسية، مما خلق تقلبات قوية لتوصياتنا.",
            topNews: [
                {
                    title: "عاجل: التضخم الأمريكي ينخفض لـ 2.7٪",
                    impact: "عالي",
                    desc: "انخفاض التضخم يزيد من توقعات تيسير الفيدرالي، مما يدعم أسعار الذهب بشكل مباشر."
                },
                {
                    title: "صدمة المركزي الياباني: الفائدة 0.75٪",
                    impact: "عالي",
                    desc: "رفع تاريخي للفائدة يطلق تقلبات ضخمة في أزواج الين. راقب مستويات USDJPY."
                },
                {
                    title: "هل يقترب اختراق الذهب؟",
                    impact: "عالي",
                    desc: "التحليل الفني يظهر اختبار الذهب لمقاومات كبرى بعد بيانات التضخم. فرص الصعود تظل قوية."
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
                                    <span className={`impact-badge impact-high`}>
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
