'use client';
import { useState } from 'react';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  
  // بيانات التوصية
  const [pair, setPair] = useState('');
  const [type, setType] = useState('BUY');
  const [imageUrl, setImageUrl] = useState('');

  // بيانات المستخدم لتفعيله
  const [newVipId, setNewVipId] = useState('');

  const checkPass = () => {
    // هنا كلمة المرور البسيطة 12345
    if (password === '12345') setIsAuth(true);
    else alert('كلمة المرور خطأ');
  };

  const publishSignal = async () => {
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pair, type, imageUrl }),
    });
    if (res.ok) {
      alert('تم نشر التوصية بنجاح ✅');
      setPair(''); setImageUrl('');
    }
  };

  const addVipUser = async () => {
    // هذه دالة سريعة لإضافة مستخدم (سنحتاج API لها لكن لنسهل الأمر سنعتمد على الادخال اليدوي في الداتا بيس لاحقا أو نضيف لها كود بسيط)
    alert('حالياً، سنضيف المستخدمين من قاعدة البيانات مباشرة للتبسيط، أو يمكنك طلب كود إضافي لذلك.');
  };

  if (!isAuth) {
    return (
      <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">دخول الأدمن 🔒</h1>
        <input type="password" placeholder="كلمة المرور" className="border p-2" onChange={e => setPassword(e.target.value)} />
        <button onClick={checkPass} className="bg-black text-white p-2 rounded">دخول</button>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">لوحة التحكم 🚀</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">نشر توصية جديدة</h2>
        <div className="flex flex-col gap-3">
          <input placeholder="اسم الزوج (مثال: GOLD)" className="border p-2 rounded" value={pair} onChange={e => setPair(e.target.value)} />
          <select className="border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
            <option value="BUY">شراء (BUY) 🟢</option>
            <option value="SELL">بيع (SELL) 🔴</option>
          </select>
          <input placeholder="رابط الصورة المباشر (من imgbb)" className="border p-2 rounded" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <button onClick={publishSignal} className="bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">نشر التوصية 📢</button>
        </div>
      </div>
    </div>
  );
}