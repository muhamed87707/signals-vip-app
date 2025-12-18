import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import User from '@/models/User';
import PushSubscription from '@/models/PushSubscription';
import { NextResponse } from 'next/server';

const IMGBB_API_KEY = 'b22927160ecad0d183ebc9a28d05ce9c';
const TELEGRAM_BOT_TOKEN = '8540134514:AAFFTwFEniwPQriXqFpdkl0CNBhqCk7Daak';
const TELEGRAM_CHANNEL_ID = '@mjhgkhg254';
import webpush from 'web-push';

// Configure Web Push (using env credentials or fallbacks if not yet loaded)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );
}

async function broadcastVipSignal(signalTitle) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('VAPID keys not configured, skipping push notifications.');
        return;
    }

    try {
        // Find all push subscriptions (independent of user login)
        const subscriptions = await PushSubscription.find({});

        if (subscriptions.length === 0) {
            console.log('No push subscriptions found to broadcast to.');
            return;
        }

        const payload = JSON.stringify({
            title: '🔥 New VIP Signal Posted!',
            body: signalTitle || 'Check the app now for details.',
            icon: '/og-image.png',
            url: '/'
        });

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            return webpush.sendNotification(pushSubscription, payload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired/invalid - remove it
                        return PushSubscription.deleteOne({ endpoint: sub.endpoint });
                    }
                    console.error('Push failed:', err.message);
                });
        });

        await Promise.all(promises);
        console.log(`Push notification sent to ${subscriptions.length} device(s).`);
    } catch (error) {
        console.error('Broadcast Error:', error);
    }
}

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

// Helper to delete from Telegram
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

// Helper to send to Telegram (Updated for AI Content)
async function sendToTelegram(imageUrl, caption) {
    if (!imageUrl) return null;

    try {
        // Use AI content if provided, otherwise default caption
        const text = caption || `🔥 *توصية VIP جديدة!* 💎
تم نشر صفقة قوية للمشتركين فقط. نسبة نجاح عالية وأرباح متوقعة ممتازة! 🚀
اضغط بالأسفل لكشف التوصية ومشاهدة التفاصيل 👇

🔥 *New VIP Signal!* 💎
A high-potential trade has been posted for premium subscribers! 🚀
Click below to reveal the signal details 👇`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHANNEL_ID,
                photo: imageUrl,
                caption: text,
                parse_mode: 'Markdown', // OR 'HTML' if AI generates HTML, but Markdown is safer usually
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

        // 4. Send Web Push Notification
        // You can customize title based on Pair/Type if available, e.g., "New Signal: XAUUSD BUY"
        await broadcastVipSignal(`New Signal: ${pair || 'VIP'} ${type || ''}`);

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
