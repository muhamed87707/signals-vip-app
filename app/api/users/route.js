import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { telegramId, isVip } = body;

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Telegram ID is required' }, { status: 400 });
        }

        // Find and update or create
        let user = await User.findOne({ telegramId });

        if (user) {
            user.isVip = isVip;
            await user.save();
        } else {
            user = await User.create({ telegramId, isVip, name: 'User' });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Error in user API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
