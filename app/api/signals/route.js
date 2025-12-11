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
    let imageUrl = body.imageUrl;

    // Upload to ImgBB if it's a base64 string
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        const API_KEY = 'b22927160ecad0d183ebc9a28d05ce9c';
        const base64Data = imageUrl.split(',')[1];

        const formData = new FormData();
        formData.append('image', base64Data);

        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadRes.json();

        if (uploadData.success) {
          imageUrl = uploadData.data.url;
        } else {
          console.error('ImgBB Upload Error:', uploadData);
          // Fallback or throw? For now throw to notify user
          throw new Error('Failed to upload image to ImgBB');
        }
      } catch (uploadError) {
        console.error('ImgBB Exception:', uploadError);
        throw new Error('Image upload failed');
      }
    }

    const signal = await Signal.create({
      pair: body.pair,
      type: body.type,
      imageUrl: imageUrl,
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