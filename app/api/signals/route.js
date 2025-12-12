import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import User from '@/models/User';
import { NextResponse } from 'next/server';

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

async function sendToTelegram(imageUrl) {
    if (!imageUrl) return null;

    try {
        // Updated Caption and Button Text as requested
        const text = `🔥 *توصية VIP جديدة!* 💎
تم نشر صفقة قوية للمشتركين فقط. نسبة نجاح عالية وأرباح متوقعة ممتازة! 🚀
اضغط بالأسفل لكشف التوصية ومشاهدة التفاصيل 👇

🔥 *New VIP Signal!* 💎
A high-potential trade has been posted for premium subscribers! 🚀
Click below to reveal the signal 👇`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHANNEL_ID,
                photo: imageUrl,
                caption: text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: "💎 Show Signal | إظهار التوصية 💎", url: "https://t.me/AbouAlDahab_bot/app?startapp=true" }
                    ]]
                }
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

        if (telegramId && telegramId !== 'null' && telegramId !== 'undefined') {
            const idString = String(telegramId);
            const user = await User.findOne({ telegramId: idString });
            if (user && user.isVip) isVip = true;
        }

        return NextResponse.json({ signals, isUserVip: isVip });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ signals: [], isUserVip: false }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        let { pair, type, imageUrl, telegramImage, sendToTelegram: shouldSend } = body;

        // 1. Upload Main Image (Clear)
        const clearImageUrl = await uploadToImgBB(imageUrl);
        if (!clearImageUrl) throw new Error('Failed to upload main image');

        let telegramMessageId = null;

        // 2. Upload Telegram Image (Blurred) if requested
        if (shouldSend && telegramImage) {
            const blurredUrl = await uploadToImgBB(telegramImage);
            if (blurredUrl) {
                // Send and capture Message ID
                telegramMessageId = await sendToTelegram(blurredUrl);
            }
        }

        // 3. Save to DB with Message ID
        const signal = await Signal.create({
            pair,
            type,
            imageUrl: clearImageUrl,
            telegramMessageId: telegramMessageId?.toString()
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
