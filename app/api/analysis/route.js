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

        // Inject Current Live Date
        const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const prompt = lang === 'ar'
            ? `أنت المحلل الاستراتيجي الأول. التاريخ اليوم هو: ${today}.
              المهمة: قم بتوليد (استنتاج) بيانات حية لسوق الذهب (XAU) والفوركس بناءً على آخر ما تعرفه عن الوضع الحالي.
              
              المطلوب: رد بصيغة JSON فقط يحتوي على:
              1. market_sentiment: { sentiment: "كلمة واحدة", color: "كود لون", summary: "ملخص 3 أسطر يربط الأحداث ببعضها" }
              2. cot_data: مصفوفة من 4 عناصر (Gold, EUR, GBP, JPY) كل عنصر يحتوي: { asset: "الاسم", long: رقم%, short: رقم%, trend: "bullish/bearish" }. (اجعل الأرقام تقديرية بناءً على تحيز السوق الحالي).
              3. bank_forecasts: مصفوفة من 4 بنوك كبرى (مثل Goldman, JPM) تحتوي: { bank: "اسم البنك", asset: "الأصل", target: "السعر المتوقع", bias: "Bullish/Bearish" }.
              4. top_news: مصفوفة من 3 أخبار عاجلة وحقيقية لهذا الأسبوع { title: "العنوان", impact: "High/Medium", desc: "الوصف" }.
              
              تأكد أن البيانات متناسقة مع تاريخ اليوم (${today}).`
            : `You are the Lead Market Strategist. Today is: ${today}.
              Task: Generate (estimate) live data for Gold (XAU) and Forex based on the current real-time market situation.
              
              Output: JSON only containing:
              1. market_sentiment: { sentiment: "One phrase", color: "Hex Code", summary: "3-line synthesis of events" }
              2. cot_data: Array of 4 items (Gold, EUR, GBP, JPY) each with: { asset: "Name", long: Number%, short: Number%, trend: "bullish/bearish" }. (Estimate these based on current institutional bias).
              3. bank_forecasts: Array of 4 major banks (e.g., Goldman, JPM) with: { bank: "Name", asset: "Asset", target: "Price Target", bias: "Bullish/Bearish" }.
              4. top_news: Array of 3 real breaking news items for this week: { title: "Title", impact: "High/Medium", desc: "Description" }.
              
              Ensure data is consistent with today's date (${today}).`;

        let data;
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Clean the response
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            data = JSON.parse(cleanJson);
        } catch (error) {
            console.error("AI Generation/Parsing Error:", error);
            // Fallback Data if AI fails
            data = {
                market_sentiment: {
                    sentiment: lang === 'ar' ? "تحليل مؤقت (جاري التحديث)" : "Temporary Analysis (Updating...)",
                    color: "#ffd700",
                    summary: lang === 'ar' ? "حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى." : "AI connection error. Please refresh."
                },
                cot_data: [],
                bank_forecasts: [],
                top_news: []
            };
        }

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
