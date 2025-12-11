'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [signals, setSignals] = useState([]);
  const [isVip, setIsVip] = useState(false);
  const [telegramId, setTelegramId] = useState(null);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    // التحقق هل نحن داخل تليجرام أم في المتصفح؟
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      
      // إذا كان هناك منصة تليجرام، نتأكد من وجود user data
      if (tg.initDataUnsafe?.user) {
        setIsInTelegram(true);
        const user = tg.initDataUnsafe.user;
        setTelegramId(user.id);
        fetchData(user.id);
        // توسيع التطبيق ليأخذ كامل الشاشة
        tg.expand(); 
      } else {
        // نحن في المتصفح العادي
        setIsInTelegram(false);
        fetchData(null);
      }
    } else {
      setIsInTelegram(false);
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
      console.error("Error fetching data", error);
    }
  };

  // --- تصميم صفحة المتصفح (Landing Page) ---
  if (!isInTelegram && !telegramId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        {/* Navbar */}
        <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-500">توصيات القناص 🎯</h1>
          <a 
            href="https://t.me/VIPSignals0_Bot" 
            className="bg-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition"
          >
            دخول المشتركين
          </a>
        </nav>

        {/* Hero Section */}
        <div className="text-center py-20 px-4">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            حقق أرباحاً حقيقية <br/> مع أدق <span className="text-blue-500">إشارات الذهب</span>
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            انضم لأكثر من 150 متداول يحققون الأرباح يومياً. نظام آلي، دقة عالية، ونتائج موثقة.
          </p>
          <a 
            href="https://t.me/YOUR_BOT_USERNAME" 
            className="inline-block bg-white text-black text-xl font-bold px-10 py-4 rounded-full hover:bg-gray-200 transition transform hover:scale-105"
          >
            🚀 ابدأ الآن مجاناً عبر تليجرام
          </a>
        </div>

        {/* Live Preview (Show Blurred Signals to entice users) */}
        <div className="max-w-4xl mx-auto p-4">
          <h3 className="text-2xl font-bold mb-6 text-center">آخر الفرص الحية 👇</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {signals.slice(0, 2).map((signal) => (
              <div key={signal._id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <div className="p-4 flex justify-between border-b border-gray-700">
                  <span className="font-bold">{signal.pair}</span>
                  <span className={`px-2 py-1 rounded text-sm ${signal.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {signal.type}
                  </span>
                </div>
                <div className="relative h-48 bg-gray-700">
                  <img src={signal.imageUrl} className="w-full h-full object-cover opacity-50 blur-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black/80 px-4 py-2 rounded-lg text-sm">🔒 للمشتركين فقط</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 py-10 mt-10 border-t border-gray-800">
          © 2024 Sniper Signals. جميع الحقوق محفوظة.
        </footer>
      </div>
    );
  }

  // --- تصميم التطبيق داخل تليجرام (App View) ---
  return (
    <div className="min-h-screen bg-gray-100 p-3 pb-20">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">توصيات القناص 🎯</h1>
        {isVip ? (
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-sm">VIP MEMBER 👑</span>
        ) : (
          <span className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Free Plan</span>
        )}
      </header>

      <div className="space-y-4">
        {signals.map((signal) => (
          <div key={signal._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
              <span className="font-bold text-lg text-gray-800">{signal.pair}</span>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold shadow-sm ${signal.type === 'BUY' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                {signal.type}
              </span>
            </div>

            <div className="relative">
              <img 
                src={signal.imageUrl} 
                alt="Signal Chart" 
                className={`w-full h-64 object-cover transition-all duration-300 ${isVip ? '' : 'blur-md filter'}`} 
              />
              
              {!isVip && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <div className="bg-white/95 p-5 rounded-2xl text-center shadow-2xl max-w-[80%]">
                    <p className="font-bold text-gray-800 mb-1 text-lg">🔒 محتوى VIP</p>
                    <p className="text-xs text-gray-500 mb-3">تفاصيل الدخول والهدف مخفية</p>
                    <div className="h-1 w-10 bg-blue-500 mx-auto rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3">
              {isVip ? (
                 <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-700">
                   <div className="bg-gray-100 p-2 rounded-lg border">دخول: متاح</div>
                   <div className="bg-green-50 p-2 rounded-lg text-green-700 border border-green-200">هدف: متاح</div>
                   <div className="bg-red-50 p-2 rounded-lg text-red-700 border border-red-200">وقف: متاح</div>
                 </div>
              ) : (
                <a 
                  href={`https://t.me/YOUR_BOT_USERNAME`} 
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition transform active:scale-95 cursor-pointer"
                >
                  💎 ترقية لـ VIP (100$)
                </a>
              )}
            </div>
          </div>
        ))}

        {signals.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">جاري انتظار الفرص القوية...</p>
          </div>
        )}
      </div>
      <script src="https://telegram.org/js/telegram-web-app.js" async></script>
    </div>
  );
}