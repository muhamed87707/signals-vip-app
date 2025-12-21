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

async function sendToTelegram(imageUrl, customPost = null, isVip = true, buttonType = 'none', type = 'SIGNAL') {
    if (!imageUrl) return null;

    try {
        // Default VIP caption
        let text = `🔥 *توصية VIP جديدة!* 💎
تم نشر صفقة قوية للمشتركين فقط. نسبة نجاح عالية وأرباح متوقعة ممتازة! 🚀
اضغط بالأسفل لكشف التوصية ومشاهدة التفاصيل 👇

🔥 *New VIP Signal!* 💎
A high-potential trade has been posted for premium subscribers! 🚀
Click below to reveal the signal 👇`;

        // Logic for Regular vs Signal
        if (type === 'REGULAR') {
            text = customPost || '';
        } else if (customPost) {
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

async function editTelegramMessage(messageId, newCaption, buttonType = 'none') {
    if (!messageId) return;
    try {
        // Construct Inline Keyboard based on Button Type (Same logic as sendToTelegram)
        let inlineKeyboard = [];
        if (buttonType === 'share') {
            const shareText = encodeURIComponent("اشترك الآن في قناة أبو الذهب للتوصيات القوية! 🚀💰\nSubscribe now to Abu Al-Dahab's premium signals channel! 🚀💰\n👉 @Abou_AlDahab");
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me/Abou_AlDahab")}&text=${shareText}`;
            inlineKeyboard = [[{ text: "📤 Share Post | مشاركة المنشور 📤", url: shareUrl }]];
        } else if (buttonType === 'subscribe') {
            inlineKeyboard = [[{ text: "🔥 Subscribe Now | اشترك الآن 🔥", url: "https://t.me/AbouAlDahab_bot" }]];
        } else if (buttonType === 'view_signal') {
            inlineKeyboard = [[{ text: "💎 Show Signal | إظهار التوصية 💎", url: "https://signals-vip-app.vercel.app/signals" }]];
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageCaption`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHANNEL_ID,
                message_id: messageId,
                caption: newCaption || undefined,
                parse_mode: 'Markdown',
                reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : { inline_keyboard: [] }
            })
        });
    } catch (error) {
        console.error('Telegram Edit Failed:', error);
    }
}

async function editTelegramMedia(messageId, imageUrl, caption, buttonType = 'none') {
    if (!messageId || !imageUrl) return;
    try {
        let inlineKeyboard = [];
        if (buttonType === 'share') {
            const shareText = encodeURIComponent("اشترك الآن في قناة أبو الذهب للتوصيات القوية! 🚀💰\nSubscribe now to Abu Al-Dahab's premium signals channel! 🚀💰\n👉 @Abou_AlDahab");
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent("https://t.me/Abou_AlDahab")}&text=${shareText}`;
            inlineKeyboard = [[{ text: "📤 Share Post | مشاركة المنشور 📤", url: shareUrl }]];
        } else if (buttonType === 'subscribe') {
            inlineKeyboard = [[{ text: "🔥 Subscribe Now | اشترك الآن 🔥", url: "https://t.me/AbouAlDahab_bot" }]];
        } else if (buttonType === 'view_signal') {
            inlineKeyboard = [[{ text: "💎 Show Signal | إظهار التوصية 💎", url: "https://signals-vip-app.vercel.app/signals" }]];
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageMedia`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHANNEL_ID,
                message_id: messageId,
                media: {
                    type: 'photo',
                    media: imageUrl,
                    caption: caption || undefined,
                    parse_mode: 'Markdown'
                },
                reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : { inline_keyboard: [] }
            })
        });
    } catch (error) {
        console.error('Telegram Media Edit Failed:', error);
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const telegramId = searchParams.get('telegramId');
        const isAdmin = searchParams.get('admin') === 'true';

        // Admin sees all, public sees only non-REGULAR posts
        const query = isAdmin ? {} : { type: { $ne: 'REGULAR' } };
        const signals = await Signal.find(query).sort({ createdAt: -1 }).limit(10);
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
            sendToTwitter: shouldSendTwitter,
            isVip = true,
            customPost = null,
            telegramButtonType // Extract new field
        } = body;

        // 1. Upload Main Image (Clear)
        const clearImageUrl = await uploadToImgBB(imageUrl);
        if (!clearImageUrl) throw new Error('Failed to upload main image');

        let telegramMessageId = null;
        let twitterTweetId = null;

        // 2. Handle Telegram posting based on VIP status
        if (shouldSend) {
            if (type === 'REGULAR') {
                // Regular Post: Send as is without blurring
                telegramMessageId = await sendToTelegram(clearImageUrl, customPost, false, telegramButtonType, 'REGULAR');
            } else if (isVip && telegramImage) {
                // VIP: Upload blurred image and send with VIP caption
                const blurredUrl = await uploadToImgBB(telegramImage);
                if (blurredUrl) {
                    telegramMessageId = await sendToTelegram(blurredUrl, customPost, true, telegramButtonType, 'SIGNAL');
                }
            } else {
                // Free: Send clear image with free caption
                telegramMessageId = await sendToTelegram(clearImageUrl, customPost, false, telegramButtonType, 'SIGNAL');
            }
        }

        // 3. Handle Twitter posting
        if (shouldSendTwitter) {
            try {
                const twitterRes = await fetch(new URL('/api/twitter', request.url).origin + '/api/twitter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: customPost ? customPost.replace(/\*/g, '') : '',
                        imageUrl: clearImageUrl
                    })
                });
                const twitterData = await twitterRes.json();
                if (twitterData.success) {
                    twitterTweetId = twitterData.tweetId;
                }
            } catch (twitterError) {
                console.error('Twitter Post Failed:', twitterError);
            }
        }

        // 4. Save to DB with all fields
        const signal = await Signal.create({
            pair,
            type,
            imageUrl: clearImageUrl,
            isVip,
            customPost,
            telegramButtonType,
            telegramMessageId: telegramMessageId?.toString(),
            twitterTweetId: twitterTweetId?.toString(),
            socialMediaPosts: {
                telegram: telegramMessageId?.toString(),
                twitter: twitterTweetId?.toString()
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
            
            // Delete from Twitter if tweet ID exists
            if (signal.twitterTweetId) {
                try {
                    await fetch(new URL('/api/twitter', request.url).origin + '/api/twitter?tweetId=' + signal.twitterTweetId, {
                        method: 'DELETE'
                    });
                } catch (twitterError) {
                    console.error('Twitter Delete Failed:', twitterError);
                }
            }
            
            await Signal.findByIdAndDelete(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, customPost, telegramButtonType, imageUrl, telegramImage, type, isVip } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Signal ID required' }, { status: 400 });

        const signal = await Signal.findById(id);
        if (!signal) return NextResponse.json({ success: false, error: 'Signal not found' }, { status: 404 });

        let finalImageUrl = signal.imageUrl;

        // If a new image is provided
        if (imageUrl && !imageUrl.startsWith('http')) {
            // 1. Upload new Main Image
            const clearImageUrl = await uploadToImgBB(imageUrl);
            if (clearImageUrl) {
                finalImageUrl = clearImageUrl;

                // 2. Handle Telegram Update with new Media
                if (signal.telegramMessageId) {
                    let telegramUrl = clearImageUrl;
                    if (type === 'SIGNAL' && isVip && telegramImage) {
                        const blurredUrl = await uploadToImgBB(telegramImage);
                        if (blurredUrl) telegramUrl = blurredUrl;
                    }
                    await editTelegramMedia(signal.telegramMessageId, telegramUrl, customPost, telegramButtonType);
                }
            }
        } else {
            // Only update text/buttons
            if (signal.telegramMessageId) {
                await editTelegramMessage(signal.telegramMessageId, customPost, telegramButtonType);
            }
        }

        // Update DB
        signal.customPost = customPost;
        signal.telegramButtonType = telegramButtonType;
        signal.imageUrl = finalImageUrl;
        signal.type = type || signal.type;
        signal.isVip = isVip !== undefined ? isVip : signal.isVip;

        await signal.save();

        return NextResponse.json({ success: true, signal });
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
