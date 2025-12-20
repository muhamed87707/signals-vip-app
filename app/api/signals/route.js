import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const IMGBB_API_KEY = 'b22927160ecad0d183ebc9a28d05ce9c';
const TELEGRAM_BOT_TOKEN = '8540134514:AAFFTwFEniwPQriXqFpdkl0CNBhqCk7Daak';
const TELEGRAM_CHANNEL_ID = '@mjhgkhg254';

async function uploadToImgBB(base64Image) {
    if (!base64Image || !base64Image.startsWith('data:image')) return null;

    try {
        const base64Data = base64Image.split(',')[1];
        const formData = new FormData();
        formData.append('image', base64Data);

        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        const uploadData = await uploadRes.json();
        return uploadData.success ? uploadData.data.url : null;
    } catch (error) {
        console.error('ImgBB Upload Failed:', error);
        return null;
    }
}

async function sendToTelegram(imageUrl, customPost = null, isVip = true, buttonType = 'none') {
    if (!imageUrl) return null;

    try {
        // Default VIP caption
        let text = `🔥 *توصية VIP جديدة!* 💎
تم نشر صفقة قوية للمشتركين فقط. نسبة نجاح عالية وأرباح متوقعة ممتازة! 🚀
اضغط بالأسفل لكشف التوصية ومشاهدة التفاصيل 👇

🔥 *New VIP Signal!* 💎
A high-potential trade has been posted for premium subscribers! 🚀
Click below to reveal the signal 👇`;

        // Use custom post if provided, or free signal caption
        if (customPost) {
            text = customPost;
        } else if (!isVip) {
            text = `📊 *توصية مجانية جديدة!* 🎁
استمتع بهذه الصفقة المجانية من مؤسسة أبو الذهب! 💰

📊 *New FREE Signal!* 🎁
Enjoy this free trade from Abu Al-Dahab Institution! 💰`;
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        // Construct Inline Keyboard based on Button Type
        let inlineKeyboard = [];

        if (buttonType === 'share') {
            // Share Button
            const shareText = encodeURIComponent("اشترك الآن في قناة أبو الذهب للتوصيات القوية! 🚀💰\nSubscribe now to Abu Al-Dahab's premium signals channel! 🚀💰\n👉 @Abou_AlDahab");
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me/Abou_AlDahab")}&text=${shareText}`;

            inlineKeyboard = [[
                { text: "📤 Share Post | مشاركة المنشور 📤", url: shareUrl }
            ]];
        } else if (buttonType === 'subscribe') {
            // Subscribe Button
            inlineKeyboard = [[
                { text: "🔥 Subscribe Now | اشترك الآن 🔥", url: "https://t.me/AbouAlDahab_bot" }
            ]];
        } else if (buttonType === 'view_signal') {
            // View Signal Button (Standard) - Unify Label
            const btnLabel = "💎 Show Signal | إظهار التوصية 💎";
            inlineKeyboard = [[
                { text: btnLabel, url: "https://signals-vip-app.vercel.app/signals" }
            ]];
        }
        // If buttonType is 'none', inlineKeyboard remains []

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHANNEL_ID,
                photo: imageUrl,
                caption: text,
                parse_mode: 'Markdown',
                reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined
            })
        });

        const data = await response.json();
        if (data.ok && data.result) {
            return data.result.message_id;
        }
        return null;
    } catch (error) {
        console.error('Telegram Post Failed:', error);
        return null;
    }
}


async function deleteTelegramMessage(messageId) {
    if (!messageId) return;
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHANNEL_ID,
                message_id: messageId
            })
        });
    } catch (error) {
        console.error('Telegram Delete Failed:', error);
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const telegramId = searchParams.get('telegramId');

        const signals = await Signal.find({}).sort({ createdAt: -1 }).limit(10);
        let isVip = false;
        let subscriptionEndDate = null;

        if (telegramId && telegramId !== 'null' && telegramId !== 'undefined') {
            const idString = String(telegramId);
            const user = await User.findOne({ telegramId: idString });

            if (user && user.isVip) {
                // Check if expired
                if (user.subscriptionEndDate) {
                    const now = new Date();
                    const end = new Date(user.subscriptionEndDate);
                    if (now > end) {
                        // Expired
                        user.isVip = false;
                        user.subscriptionEndDate = null;
                        await user.save();
                        isVip = false;
                    } else {
                        // Active with end date
                        isVip = true;
                        subscriptionEndDate = user.subscriptionEndDate;
                    }
                } else {
                    // Active Lifetime (isVip=true, date=null)
                    isVip = true;
                    subscriptionEndDate = null;
                }
            }
        }

        return NextResponse.json({ signals, isUserVip: isVip, subscriptionEndDate });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ signals: [], isUserVip: false }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        let {
            pair,
            type,
            imageUrl,
            telegramImage,
            sendToTelegram: shouldSend,
            isVip = true,
            customPost = null,
            telegramButtonType // Extract new field
        } = body;

        // 1. Upload Main Image (Clear)
        const clearImageUrl = await uploadToImgBB(imageUrl);
        if (!clearImageUrl) throw new Error('Failed to upload main image');

        let telegramMessageId = null;

        // 2. Handle Telegram posting based on VIP status
        if (shouldSend) {
            if (isVip && telegramImage) {
                // VIP: Upload blurred image and send with VIP caption
                const blurredUrl = await uploadToImgBB(telegramImage);
                if (blurredUrl) {
                    telegramMessageId = await sendToTelegram(blurredUrl, customPost, true, telegramButtonType);
                }
            } else {
                // Free: Send clear image with free caption
                telegramMessageId = await sendToTelegram(clearImageUrl, customPost, false, telegramButtonType);
            }
        }

        // 3. Save to DB with all fields
        const signal = await Signal.create({
            pair,
            type,
            imageUrl: clearImageUrl,
            isVip,
            customPost,
            telegramMessageId: telegramMessageId?.toString(),
            socialMediaPosts: {
                telegram: telegramMessageId?.toString()
            }
        });

        return NextResponse.json({ success: true, signal });
    } catch (error) {
        console.error("Post Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Signal ID required' }, { status: 400 });

        const signal = await Signal.findById(id);
        if (signal) {
            // Delete from Telegram if message ID exists
            if (signal.telegramMessageId) {
                await deleteTelegramMessage(signal.telegramMessageId);
            }
            await Signal.findByIdAndDelete(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
