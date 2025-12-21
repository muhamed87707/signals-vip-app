import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    return NextResponse.json({
        defaultPrompt: `أنت خبير في كتابة منشورات السوشيال ميديا للتداول والفوركس.
قم بإعادة صياغة المنشور التالي بطرق مختلفة وجذابة مع الحفاظ على المعنى الأساسي.
استخدم الإيموجي بشكل مناسب واجعل المنشورات مثيرة للاهتمام.
اكتب كل نسخة في سطر منفصل.`
    });
}

export async function POST(request) {
    try {
        const { apiKey, model, userPost, customPrompt, count } = await request.json();

        if (!userPost) {
            return NextResponse.json({ 
                success: false, 
                error: 'يرجى كتابة نص المنشور أولاً' 
            });
        }

        if (!apiKey || apiKey.trim() === '') {
            return NextResponse.json({ 
                success: false, 
                error: 'يرجى إضافة Gemini API Key في الإعدادات أولاً' 
            });
        }

        // Use Gemini AI to generate posts
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash' });

        const prompt = customPrompt || `أنت خبير في كتابة منشورات السوشيال ميديا للتداول والفوركس.
قم بإعادة صياغة المنشور التالي بـ ${count || 3} طرق مختلفة وجذابة مع الحفاظ على المعنى الأساسي.
استخدم الإيموجي بشكل مناسب واجعل المنشورات مثيرة للاهتمام.
اكتب كل نسخة منفصلة بسطر فارغ بينها.
لا تضف أي تعليقات أو شروحات، فقط المنشورات.`;

        const fullPrompt = `${prompt}\n\nالمنشور الأصلي:\n${userPost}`;

        const result = await modelInstance.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Split the response into separate posts
        const posts = text
            .split(/\n\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 10)
            .slice(0, count || 3);

        if (posts.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'لم يتم توليد أي منشورات. جرب مرة أخرى.'
            });
        }

        return NextResponse.json({
            success: true,
            posts: posts,
            message: `تم توليد ${posts.length} نسخة بنجاح`
        });

    } catch (error) {
        console.error('AI Generate Posts Error:', error);
        
        let errorMessage = 'فشل في توليد المنشورات';
        
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
            errorMessage = 'مفتاح API غير صالح. تأكد من صحة المفتاح.';
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
            errorMessage = 'تم تجاوز حد الاستخدام. جرب لاحقاً.';
        } else if (error.message?.includes('model')) {
            errorMessage = 'النموذج المحدد غير متاح. جرب نموذج آخر.';
        } else if (error.message) {
            errorMessage = `خطأ: ${error.message}`;
        }
        
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        });
    }
}
