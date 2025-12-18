import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();
        // Fetch all users sorted by creation or name
        const users = await User.find({}).sort({ _id: -1 });
        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { telegramId, isVip, durationMonths, isLifetime, removeUser } = body;

        if (!telegramId) {
            return NextResponse.json({ success: false, error: 'Telegram ID is required' }, { status: 400 });
        }

        // Handle deletion/removal
        if (removeUser) {
            await User.deleteOne({ telegramId });
            return NextResponse.json({ success: true, message: 'User removed' });
        }

        // Find and update or create
        let user = await User.findOne({ telegramId });

        let subscriptionEndDate = null; // Default to null (Lifetime if VIP, or no sub)

        if (isVip) {
            if (isLifetime) {
                subscriptionEndDate = null;
            } else if (durationMonths && durationMonths > 0) {
                const now = new Date();
                // If user already has active subscription, add to it? 
                // For simplicity, let's just set from NOW or restart. 
                // Use case: Admin sets specific duration. 
                // Let's set it from NOW + duration.
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + parseInt(durationMonths));
                subscriptionEndDate = futureDate;
            }
        }

        if (user) {
            user.isVip = isVip;
            // Only update date if it's a VIP update action
            if (isVip) {
                user.subscriptionEndDate = subscriptionEndDate;
            } else {
                // If removing VIP, maybe clear date?
                // Let's keep it null for non-vip
                user.subscriptionEndDate = null;
            }
            await user.save();
        } else {
            user = await User.create({
                telegramId,
                isVip,
                subscriptionEndDate,
                name: 'User'
            });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error('Error in user API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
