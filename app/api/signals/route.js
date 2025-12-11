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
    const signals = await Signal.find({}).sort({ createdAt: -1 }).limit(10);

    let isVip = false;
    
    // التحقق من المستخدم (مع حل مشكلة النص والرقم)
    if (telegramId && telegramId !== 'null' && telegramId !== 'undefined') {
      // نحول الآيدي القادم من الرابط إلى نص صريح
      const idString = String(telegramId);
      
      const user = await User.findOne({ telegramId: idString });
      
      if (user && user.isVip) {
        isVip = true;
      } else {
        // (اختياري) للتجربة: إذا لم يجد المستخدم يطبع في سجل السيرفر
        console.log(`User not found or not VIP: ${idString}`);
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
    
    const signal = await Signal.create(body);
    return NextResponse.json({ success: true, signal });
  } catch (error) {
    console.error("Post Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}