
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req) {
    try {
        await dbConnect();
        const { telegramId, subscription } = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Missing subscription data' }, { status: 400 });
        }

        // Upsert: Update if endpoint exists, otherwise create new
        await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                telegramId: telegramId || null,
                createdAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, message: 'Subscription saved' });
    } catch (error) {
        console.error('Push Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
