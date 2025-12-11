'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [signals, setSignals] = useState([]);
  const [isVip, setIsVip] = useState(false);
  const [telegramId, setTelegramId] = useState(null);

  useEffect(() => {
    // كود تهيئة تليجرام ويب آب
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTelegramId(user.id);
        fetchData(user.id);
      } else {
        fetchData(null);
      }
    } else {
      fetchData(null);
    }
  }, []);

  const fetchData = async (id) => {
    try {
      const res = await fetch(`/api/signals?telegramId=${id || ''}`);
      const data = await res.json();
      if (data.signals) setSignals(data.signals);
      if (data.isUserVip) setIsVip(data.isUserVip);
    } catch (error) {
      console.error("فشل في جلب البيانات", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 pb-20">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">توصيات القناص 🎯</h1>
        {isVip ? (
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">VIP 👑</span>
        ) : (
          <span className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-xs">Free User</span>
        )}
      </header>

      <div className="space-y-4">
        {signals.map((signal) => (
          <div key={signal._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* رأس البطاقة */}
            <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
              <span className="font-bold text-lg">{signal.pair}</span>
              <span className={`px-2 py-1 rounded text-sm font-bold ${signal.type === 'BUY' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {signal.type}
              </span>
            </div>

            {/* الصورة - وهنا يحدث السحر */}
            <div className="relative">
              <img 
                src={signal.imageUrl} 
                alt="Signal Chart" 
                className={`w-full h-64 object-cover transition-all duration-300 ${isVip ? '' : 'blur-md filter'}`} 
              />
              
              {!isVip && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-white/90 p-4 rounded-xl text-center shadow-2xl backdrop-blur-sm">
                    <p className="font-bold text-gray-800 mb-2">🔒 للمشتركين فقط</p>
                    <p className="text-xs text-gray-600">اشترك الآن لفتح التوصية</p>
                  </div>
                </div>
              )}
            </div>

            {/* الأزرار السفلية */}
            <div className="p-3">
              {isVip ? (
                 <div className="grid grid-cols-2 gap-2 text-center text-sm">
                   <div className="bg-green-50 p-2 rounded text-green-800 font-bold">هدف: متاح ✅</div>
                   <div className="bg-red-50 p-2 rounded text-red-800 font-bold">وقف: متاح ✅</div>
                 </div>
              ) : (
                // هنا التعديل: تحويل الزر لرابط مباشر لحسابك
                <a 
                  href="https://t.me/YOUR_TELEGRAM_USERNAME" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  💎 اشترك بـ 100$
                </a>
              )}
            </div>
          </div>
        ))}
        
        {signals.length === 0 && (
          <div className="text-center text-gray-400 mt-10">لا توجد توصيات حالياً...</div>
        )}
      </div>
      
      {/* سكريبت تليجرام الضروري */}
      <script src="https://telegram.org/js/telegram-web-app.js" async></script>
    </div>
  );
}