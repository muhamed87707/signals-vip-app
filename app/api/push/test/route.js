
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';
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

        const subscribedCount = await PushSubscription.countDocuments({});

        return NextResponse.json({
            status: 'ok',
            vapidConfigured: !!(vapidPublicKey && vapidPrivateKey),
            vapidPublicKeyPreview: vapidPublicKey ? vapidPublicKey.substring(0, 20) + '...' : 'NOT SET',
            subscribedDevicesCount: subscribedCount,
            message: subscribedCount === 0
                ? 'No devices have subscribed to push notifications yet. Users need to click "Enable Alerts" on the signals page.'
                : `${subscribedCount} device(s) are subscribed to push notifications.`
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

        // Find all push subscriptions
        const subscriptions = await PushSubscription.find({});

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscribed devices found. Click "Enable Alerts" on signals page first.' });
        }

        const payload = JSON.stringify({
            title: 'Test Notification 🔔',
            body: 'If you see this, background alerts are working!',
            icon: '/og-image.png',
            url: '/'
        });

        let successCount = 0;
        let failCount = 0;

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            return webpush.sendNotification(pushSubscription, payload)
                .then(() => successCount++)
                .catch(err => {
                    failCount++;
                    console.error(`Push failed:`, err.message);
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired, remove it
                        return PushSubscription.deleteOne({ endpoint: sub.endpoint });
                    }
                });
        });

        await Promise.all(promises);

        return NextResponse.json({
            success: true,
            message: `Sent to ${successCount} device(s). Failed: ${failCount}.`,
            total: subscriptions.length
        });
    } catch (error) {
        console.error('Test Push Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
