import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback Mock Data if API Key is missing
    if (!apiKey || apiKey === 'your_key_here') {
        const mockData = {
            en: {
                sentiment: 'Neutral (Waiting for API)',
                sentimentColor: '#888',
                summary: "The AI is currently in 'Training Mode'. Once the Gemini API key is configured, you will receive real-time, dynamic market pulse summaries for Gold and Forex.",
                topNews: [
                    { title: "System Ready", impact: "High", desc: "Backend infrastructure for AI analysis is live." },
                    { title: "Gemini Integration", impact: "High", desc: "Waiting for API credentials to enable live market scanning." }
                ]
            },
            ar: {
                sentiment: 'حيادي (بانتظار المفتاح)',
                sentimentColor: '#888',
                summary: "الذكاء الاصطناعي حالياً في 'وضع التدريب'. بمجرد إعداد مفتاح Gemini API، ستتلقى ملخصات ديناميكية ومباشرة لنبض السوق للذهب والفوركس.",
                topNews: [
                    { title: "النظام جاهز", impact: "عالي", desc: "البنية التحتية لتحليل الذكاء الاصطناعي جاهزة للعمل." },
                    { title: "دمج Gemini", impact: "عالي", desc: "بانتظار بيانات الاعتماد لتفعيل مسح السوق المباشر." }
                ]
            }
        };

        return NextResponse.json(mockData[lang === 'ar' ? 'ar' : 'en']);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = lang === 'ar'
            ? "قم بتحليل سوق الذهب والفوركس (العملات الرئيسية) حالياً بناءً على ما تعرفه عن تاريخ ديسمبر 2025. أعطني النتيجة بتنسيق JSON حصراً يحتوي على: sentiment (كلمة واحدة), sentimentColor (كود هيكس), summary (فقرة من 3 أسطر), topNews (مصفوفة من 3 عناصر تحتوي title, impact, desc). اللغة يجب أن تكون العربية."
            : "Analyze the current Gold and Forex (Majors) market for December 2025. Provide a JSON response only with: sentiment (one phrase), sentimentColor (hex code), summary (3-line paragraph), topNews (array of 3 objects with title, impact, desc). Language: English.";

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean the response from markdown if necessary
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ error: "Failed to generate AI analysis" }, { status: 500 });
    }
}
