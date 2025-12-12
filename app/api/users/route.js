import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ isVip: -1, createdAt: -1 });
        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { telegramId, isVip, duration } = body;

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Telegram ID is required' }, { status: 400 });
        }

        let updateData = { isVip };
        if (isVip && duration) {
            const now = new Date();
            let expiry = new Date();
            updateData.vipStartDate = now;

            switch (duration) {
                case '1m': expiry.setMonth(now.getMonth() + 1); break;
                case '3m': expiry.setMonth(now.getMonth() + 3); break;
                case '6m': expiry.setMonth(now.getMonth() + 6); break;
                case '1y': expiry.setFullYear(now.getFullYear() + 1); break;
                case 'lifetime': expiry = new Date('2099-12-31'); break; // Far future
                default: expiry.setMonth(now.getMonth() + 1); // Default 1 month
            }
            updateData.vipExpiryDate = expiry;
        }

        // Find and update or create
        let user = await User.findOneAndUpdate(
            { telegramId },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Error in user API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const telegramId = searchParams.get('telegramId');

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Telegram ID required' }, { status: 400 });
        }

        // We don't delete the user, just revoke VIP
        const user = await User.findOneAndUpdate(
            { telegramId },
            { isVip: false, vipExpiryDate: null },
            { new: true }
        );

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
