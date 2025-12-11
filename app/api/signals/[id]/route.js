import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Signal ID required' }, { status: 400 });
        }

        await Signal.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
