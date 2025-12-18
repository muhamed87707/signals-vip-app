
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req) {
    try {
        await dbConnect();
        const { endpoint } = await req.json();

        if (!endpoint) {
            return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
        }

        // Delete subscription by endpoint
        const result = await PushSubscription.deleteOne({ endpoint });

        if (result.deletedCount > 0) {
            return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
        } else {
            return NextResponse.json({ success: true, message: 'Subscription not found (already unsubscribed)' });
        }
    } catch (error) {
        console.error('Unsubscribe Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
