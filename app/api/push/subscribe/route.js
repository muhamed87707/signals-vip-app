
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req) {
    try {
        await dbConnect();
        const { telegramId, subscription } = await req.json();

        if (!telegramId || !subscription) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findOne({ telegramId });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.pushSubscription = subscription;
        await user.save();

        return NextResponse.json({ success: true, message: 'Subscription saved' });
    } catch (error) {
        console.error('Push Subscription Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
