import dbConnect from '@/lib/mongodb';
import Signal from '@/models/Signal';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get('telegramId');

  // جلب التوصيات (أحدث 10)
  const signals = await Signal.find({}).sort({ createdAt: -1 }).limit(10);

  // التحقق من حالة المستخدم
  let isVip = false;
  if (telegramId) {
    const user = await User.findOne({ telegramId });
    if (user && user.isVip) {
      isVip = true;
    }
  }

  return NextResponse.json({ signals, isUserVip: isVip });
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  
  // إنشاء توصية جديدة
  const signal = await Signal.create(body);
  return NextResponse.json({ success: true, signal });
}