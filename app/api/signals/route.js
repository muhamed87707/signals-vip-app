import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    // جلب التوصيات
    const signals = await Signal.find({}).sort({ createdAt: -1 }).limit(20);

    let isVip = false;

    // التحقق من المستخدم
    if (telegramId && telegramId !== 'null' && telegramId !== 'undefined') {
      const idString = String(telegramId);
      const user = await User.findOne({ telegramId: idString });

      if (user && user.isVip) {
        isVip = true;
      }
    }

    return NextResponse.json({ signals, isUserVip: isVip });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ signals: [], isUserVip: false }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const signal = await Signal.create({
      pair: body.pair,
      type: body.type,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json({ success: true, signal });
  } catch (error) {
    console.error("Post Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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