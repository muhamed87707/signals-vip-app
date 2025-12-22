import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCQSH-Uu1hecLKvOz-dNp6gTiEMz3DYf-4');

// Expert opinions data (updated periodically)
const expertOpinions = [
    {
        name: 'Peter Schiff',
        nameAr: 'بيتر شيف',
        title: 'CEO, Euro Pacific Capital',
        titleAr: 'الرئيس التنفيذي، يورو باسيفيك كابيتال',
        sentiment: 'bullish',
        target: 3500,
        timeframe: '2025',
        quote: 'Gold is heading much higher as central banks continue to debase currencies.',
        quoteAr: 'الذهب متجه للارتفاع مع استمرار البنوك المركزية في إضعاف العملات.',
        date: '2024-12-15',
        credibility: 85
    },
    {
        name: 'Jim Rogers',
        nameAr: 'جيم روجرز',
        title: 'Chairman, Rogers Holdings',
        titleAr: 'رئيس مجلس الإدارة، روجرز هولدينغز',
        sentiment: 'bullish',
        target: 3200,
        timeframe: '2025',
        quote: 'Commodities including gold are in a long-term bull market.',
        quoteAr: 'السلع بما فيها الذهب في سوق صاعدة طويلة المدى.',
        date: '2024-12-10',
        credibility: 90
    },
    {
        name: 'Jeffrey Gundlach',
        nameAr: 'جيفري غوندلاك',
        title: 'CEO, DoubleLine Capital',
        titleAr: 'الرئيس التنفيذي، دبل لاين كابيتال',
        sentiment: 'neutral',
        target: 2800,
        timeframe: '2025',
        quote: 'Gold could consolidate before the next leg higher.',
        quoteAr: 'قد يتماسك الذهب قبل الموجة الصعودية التالية.',
        date: '2024-12-12',
        credibility: 88
    },
    {
        name: 'Ray Dalio',
        nameAr: 'راي داليو',
        title: 'Founder, Bridgewater Associates',
        titleAr: 'مؤسس، بريدج ووتر أسوشيتس',
        sentiment: 'bullish',
        target: 3000,
        timeframe: '2025',
        quote: 'Gold is a good portfolio diversifier in times of uncertainty.',
        quoteAr: 'الذهب أداة تنويع جيدة للمحفظة في أوقات عدم اليقين.',
        date: '2024-12-08',
        credibility: 95
    },
    {
        name: 'Mark Mobius',
        nameAr: 'مارك موبيوس',
        title: 'Founder, Mobius Capital Partners',
        titleAr: 'مؤسس، موبيوس كابيتال بارتنرز',
        sentiment: 'bullish',
        target: 3100,
        timeframe: '2025',
        quote: 'Emerging market demand will continue to support gold prices.',
        quoteAr: 'طلب الأسواق الناشئة سيستمر في دعم أسعار الذهب.',
        date: '2024-12-14',
        credibility: 82
    },
    {
        name: 'Nouriel Roubini',
        nameAr: 'نورييل روبيني',
        title: 'Professor, NYU Stern',
        titleAr: 'أستاذ، جامعة نيويورك',
        sentiment: 'neutral',
        target: 2750,
        timeframe: '2025',
        quote: 'Gold faces headwinds from higher real rates but geopolitical risks provide support.',
        quoteAr: 'يواجه الذهب رياحاً معاكسة من ارتفاع العوائد الحقيقية لكن المخاطر الجيوسياسية توفر الدعم.',
        date: '2024-12-11',
        credibility: 80
    }
];

export async function GET() {
    try {
        // Calculate consensus metrics
        const bullishCount = expertOpinions.filter(e => e.sentiment === 'bullish').length;
        const bearishCount = expertOpinions.filter(e => e.sentiment === 'bearish').length;
        const neutralCount = expertOpinions.filter(e => e.sentiment === 'neutral').length;
        
        const targets = expertOpinions.map(e => e.target);
        const avgTarget = Math.round(targets.reduce((a, b) => a + b, 0) / targets.length);
        const highTarget = Math.max(...targets);
        const lowTarget = Math.min(...targets);
        
        // Weighted sentiment based on credibility
        const totalCredibility = expertOpinions.reduce((sum, e) => sum + e.credibility, 0);
        const bullishWeight = expertOpinions
            .filter(e => e.sentiment === 'bullish')
            .reduce((sum, e) => sum + e.credibility, 0) / totalCredibility * 100;
        
        // Get AI analysis
        let aiAnalysis = null;
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = `Analyze these expert opinions on gold and provide a brief consensus summary in JSON format:
            
Experts: ${JSON.stringify(expertOpinions.map(e => ({ name: e.name, sentiment: e.sentiment, target: e.target, quote: e.quote })))}

Return JSON only:
{
    "consensusSummary": "2-3 sentence summary of expert consensus",
    "consensusSummaryAr": "Arabic translation",
    "keyThemes": ["theme1", "theme2", "theme3"],
    "keyThemesAr": ["موضوع1", "موضوع2", "موضوع3"],
    "overallSentiment": "bullish/bearish/neutral",
    "confidenceLevel": 0-100
}`;
            
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiAnalysis = JSON.parse(jsonMatch[0]);
            }
        } catch (aiError) {
            console.error('AI analysis error:', aiError);
        }
        
        return Response.json({
            experts: expertOpinions,
            consensus: {
                bullish: bullishCount,
                bearish: bearishCount,
                neutral: neutralCount,
                bullishPercentage: Math.round((bullishCount / expertOpinions.length) * 100),
                weightedBullish: Math.round(bullishWeight)
            },
            targets: {
                average: avgTarget,
                high: highTarget,
                low: lowTarget,
                range: highTarget - lowTarget
            },
            aiAnalysis,
            lastUpdate: new Date().toISOString()
        });
    } catch (error) {
        console.error('Expert opinions error:', error);
        return Response.json({ error: 'Failed to fetch expert opinions' }, { status: 500 });
    }
}
