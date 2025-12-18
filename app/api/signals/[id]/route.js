import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8540134514:AAFFTwFEniwPQriXqFpdkl0CNBhqCk7Daak';
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '@mjhgkhg254';

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

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        if (!id) return NextResponse.json({ success: false, error: 'Signal ID required' }, { status: 400 });

        const signal = await Signal.findById(id);

        if (!signal) {
            return NextResponse.json({ success: false, error: 'Signal not found' }, { status: 404 });
        }

        // Delete from Telegram if message ID exists
        if (signal.telegramMessageId) {
            await deleteTelegramMessage(signal.telegramMessageId);
            console.log(`Deleted Telegram message ${signal.telegramMessageId}`);
        }

        await Signal.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Signal deleted from DB and Telegram' });

    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
