
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import webpush from 'web-push';

// Configure Web Push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(
            vapidSubject,
            vapidPublicKey,
            vapidPrivateKey
        );
    } catch (err) {
        console.error('VAPID Configuration Error:', err);
    }
}

// GET: Diagnostic endpoint to check push notification status
export async function GET(req) {
    try {
        await dbConnect();

        const subscribedUsers = await User.countDocuments({ pushSubscription: { $ne: null } });
        const totalUsers = await User.countDocuments({});

        return NextResponse.json({
            status: 'ok',
            vapidConfigured: !!(vapidPublicKey && vapidPrivateKey),
            vapidPublicKeyPreview: vapidPublicKey ? vapidPublicKey.substring(0, 20) + '...' : 'NOT SET',
            subscribedUsersCount: subscribedUsers,
            totalUsersCount: totalUsers,
            message: subscribedUsers === 0
                ? 'No users have subscribed to push notifications yet. Users need to click "Enable Alerts" on the signals page.'
                : `${subscribedUsers} user(s) are subscribed to push notifications.`
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        if (!vapidPublicKey || !vapidPrivateKey) {
            return NextResponse.json({ error: 'Server missing VAPID keys' }, { status: 500 });
        }

        await dbConnect();

        // Find users with a subscription
        const users = await User.find({ pushSubscription: { $ne: null } });

        if (users.length === 0) {
            return NextResponse.json({ message: 'No subscribed users found' });
        }

        const payload = JSON.stringify({
            title: 'Test Notification 🔔',
            body: 'If you see this, background alerts are working!',
            icon: '/og-image.png',
            url: '/'
        });

        let successCount = 0;
        let failCount = 0;

        const promises = users.map(user => {
            return webpush.sendNotification(user.pushSubscription, payload)
                .then(() => successCount++)
                .catch(err => {
                    failCount++;
                    console.error(`Push failed for ${user.telegramId}:`, err.message);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        user.pushSubscription = null;
                        return user.save();
                    }
                });
        });

        await Promise.all(promises);

        return NextResponse.json({
            success: true,
            message: `Sent to ${successCount} users. Failed for ${failCount}.`,
            total: users.length
        });
    } catch (error) {
        console.error('Test Push Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
