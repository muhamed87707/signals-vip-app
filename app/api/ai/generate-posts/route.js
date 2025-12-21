import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    // Return default prompt when fetching settings
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

        // Check if we have the user's post text
        if (!userPost) {
            return NextResponse.json({ 
                success: false, 
                error: 'Post text is required' 
            });
        }

        // If no API key, return mock posts
        if (!apiKey) {
            const mockPosts = generateMockPosts(userPost, count || 3);
            return NextResponse.json({
                success: true,
                posts: mockPosts,
                message: `Generated ${mockPosts.length} post variations (demo mode)`
            });
        }

        // Use Gemini AI to generate posts
        try {
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
                // Fallback to mock if AI returns empty
                const mockPosts = generateMockPosts(userPost, count || 3);
                return NextResponse.json({
                    success: true,
                    posts: mockPosts,
                    message: 'Generated variations (fallback mode)'
                });
            }

            return NextResponse.json({
                success: true,
                posts: posts,
                message: `Generated ${posts.length} post variations with AI`
            });

        } catch (aiError) {
            console.error('Gemini AI Error:', aiError);
            // Fallback to mock posts on AI error
            const mockPosts = generateMockPosts(userPost, count || 3);
            return NextResponse.json({
                success: true,
                posts: mockPosts,
                message: 'Generated variations (API error fallback)'
            });
        }

    } catch (error) {
        console.error('AI Generate Posts Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to generate posts: ' + error.message 
        });
    }
}

function generateMockPosts(originalPost, count) {
    const emojis = ['🔥', '💎', '📊', '🚀', '💰', '⚡', '🎯', '📈', '⭐', '💪'];
    const posts = [];
    
    for (let i = 0; i < count; i++) {
        const emoji1 = emojis[Math.floor(Math.random() * emojis.length)];
        const emoji2 = emojis[Math.floor(Math.random() * emojis.length)];
        const emoji3 = emojis[Math.floor(Math.random() * emojis.length)];
        
        let variation = '';
        switch (i % 3) {
            case 0:
                variation = `${emoji1} ${originalPost} ${emoji2}\n\n${emoji3} #Trading #Forex #Gold`;
                break;
            case 1:
                variation = `${emoji1}${emoji2} توصية مميزة!\n\n${originalPost}\n\n${emoji3} تابعونا للمزيد!`;
                break;
            case 2:
                variation = `⚡ إشارة قوية ⚡\n\n${originalPost}\n\n${emoji1} ${emoji2} ${emoji3}`;
                break;
        }
        posts.push(variation);
    }
    
    return posts;
}
