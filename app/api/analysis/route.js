import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback Mock Data if API Key is missing
    if (!apiKey || apiKey === 'your_key_here' || apiKey === '') {
        const mockData = {
            en: {
                sentiment: 'Neutral (Waiting for API)',
                sentimentColor: '#888',
                summary: "The AI is currently in 'Training Mode'. Once the Gemini API key is configured, you will receive real-time, dynamic market pulse summaries for Gold and Forex.",
                topNews: [
                    { title: "System Ready", impact: "High", desc: "Backend infrastructure for AI analysis is live." },
                    { title: "Gemini Integration", impact: "High", desc: "Waiting for API credentials to enable live market scanning." }
                ],
                lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            },
            ar: {
                sentiment: 'حيادي (بانتظار المفتاح)',
                sentimentColor: '#888',
                summary: "الذكاء الاصطناعي حالياً في 'وضع التدريب'. بمجرد إعداد مفتاح Gemini API، ستتلقى ملخصات ديناميكية ومباشرة لنبض السوق للذهب والفوركس.",
                topNews: [
                    { title: "النظام جاهز", impact: "عالي", desc: "البنية التحتية لتحليل الذكاء الاصطناعي جاهزة للعمل." },
                    { title: "دمج Gemini", impact: "عالي", desc: "بانتظار بيانات الاعتماد لتفعيل مسح السوق المباشر." }
                ],
                lastUpdated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
        };

        return NextResponse.json(mockData[lang === 'ar' ? 'ar' : 'en']);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = lang === 'ar'
            ? `أنت الآن "المخطط الاستراتيجي العالمي" لموقع أبو الذهب. قم بتحليل سوق الذهب والفوركس (العملات الرئيسية) بناءً على:
              1. تقارير COT (تمركز الحيتان وصناع السوق).
              2. توقعات البنوك الاستثمارية الكبرى (Goldman Sachs, JPM).
              3. الأحداث الاقتصادية العالمية لعام 2025.
              أعطني النتيجة بتنسيق JSON حصراً يحتوي على: 
              - sentiment (عبارة قوية ومختصرة مثل "تفاؤل مؤسسي حذر")
              - sentimentColor (كود هيكس ذهبي أو أخضر أو أحمر)
              - summary (3 أسطر عميقة تربط بين تمركز الحيتان وتوقعات البنوك)
              - topNews (مصفوفة من 3 عناصر استخباراتية تحتوي title, impact, desc).
              اللغة: العربية.`
            : `You are the "AI Master Strategist" for Abu Al-Dahab. Analyze Gold and Forex markets by synthesizing:
              1. COT Reports (Whale and Institutional positioning).
              2. Major Bank Forecasts (Goldman, JPM price targets).
              3. Current 2025 global economic landscape.
              Provide a JSON-only response with:
              - sentiment (Institutional-grade phrase like "Cautious Institutional Bullishness")
              - sentimentColor (Hex code for Gold, Green, or Red)
              - summary (3 deep lines correlating whale positioning with bank targets)
              - topNews (Array of 3 intelligence items with title, impact, desc).
              Language: English.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean the response from markdown if necessary
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return NextResponse.json({
            ...data,
            lastUpdated: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        });
    } catch (error) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ error: "Failed to generate AI analysis" }, { status: 500 });
    }
}
