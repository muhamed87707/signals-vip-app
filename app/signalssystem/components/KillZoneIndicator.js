'use client';

import { useState, useEffect } from 'react';

/**
 * Kill Zone Indicator Component
 * Shows current trading session and countdown
 * Requirements: 17.8, 17.9
 */
export default function KillZoneIndicator({ killZone, lang = 'en' }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!killZone?.timeToNextZone) return;

    const updateCountdown = () => {
      // Parse time string and calculate remaining
      const parts = killZone.timeToNextZone.match(/(\d+)h\s*(\d+)m/);
      if (parts) {
        const hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(killZone.timeToNextZone);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [killZone]);

  if (!killZone) {
    return (
      <div className="bg-[#111] rounded-lg px-4 py-2 border border-gray-600/20 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  const getSessionInfo = (session) => {
    const sessions = {
      london: { 
        icon: '🇬🇧', 
        name: { en: 'London', ar: 'لندن' },
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-600/20',
        textColor: 'text-blue-400',
      },
      newyork: { 
        icon: '🇺🇸', 
        name: { en: 'New York', ar: 'نيويورك' },
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-600/20',
        textColor: 'text-green-400',
      },
      london_close: { 
        icon: '🌆', 
        name: { en: 'London Close', ar: 'إغلاق لندن' },
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-600/20',
        textColor: 'text-purple-400',
      },
      asian: { 
        icon: '🌏', 
        name: { en: 'Asian', ar: 'آسيا' },
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-600/20',
        textColor: 'text-orange-400',
      },
      off_hours: { 
        icon: '😴', 
        name: { en: 'Off Hours', ar: 'خارج الأوقات' },
        color: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-600/20',
        textColor: 'text-gray-400',
      },
    };
    return sessions[session?.toLowerCase()] || sessions.off_hours;
  };

  const currentSession = getSessionInfo(killZone.currentZone);
  const nextSession = getSessionInfo(killZone.nextZone);

  return (
    <div className={`rounded-xl border overflow-hidden ${
      killZone.isActive 
        ? 'border-green-600/30 bg-green-600/5' 
        : 'border-yellow-600/20 bg-[#111]'
    }`}>
      {/* Main Status */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`relative w-12 h-12 rounded-xl ${currentSession.bgColor} flex items-center justify-center`}>
              <span className="text-2xl">{currentSession.icon}</span>
              {killZone.isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${currentSession.textColor}`}>
                  {killZone.isActive 
                    ? currentSession.name[lang]
                    : (lang === 'ar' ? 'خارج Kill Zone' : 'Outside Kill Zone')
                  }
                </span>
                {killZone.isActive && (
                  <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full">
                    {lang === 'ar' ? 'نشط' : 'ACTIVE'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {killZone.isActive 
                  ? (lang === 'ar' ? 'أفضل وقت للتداول' : 'Optimal trading time')
                  : (lang === 'ar' ? 'انتظر الجلسة القادمة' : 'Wait for next session')
                }
              </p>
            </div>
          </div>

          {/* Volatility Badge */}
          {killZone.volatility && (
            <div className={`px-3 py-1 rounded-lg text-sm ${
              killZone.volatility === 'high' ? 'bg-red-600/20 text-red-400' :
              killZone.volatility === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
              'bg-gray-600/20 text-gray-400'
            }`}>
              {lang === 'ar' ? 'تقلب: ' : 'Vol: '}
              {killZone.volatility === 'high' ? (lang === 'ar' ? 'عالي' : 'High') :
               killZone.volatility === 'medium' ? (lang === 'ar' ? 'متوسط' : 'Med') :
               (lang === 'ar' ? 'منخفض' : 'Low')}
            </div>
          )}
        </div>
      </div>

      {/* Next Session Countdown */}
      {!killZone.isActive && killZone.nextZone && (
        <div className="px-4 py-3 bg-[#0a0a0a] border-t border-yellow-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">
                {lang === 'ar' ? 'القادم:' : 'Next:'}
              </span>
              <span className={`font-medium ${nextSession.textColor}`}>
                {nextSession.icon} {nextSession.name[lang]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">
                {lang === 'ar' ? 'خلال' : 'in'}
              </span>
              <span className="font-mono font-bold text-yellow-400">
                {countdown || killZone.timeToNextZone}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Instruments */}
      {killZone.recommendedInstruments && killZone.recommendedInstruments.length > 0 && (
        <div className="px-4 py-3 border-t border-yellow-600/10">
          <p className="text-xs text-gray-500 mb-2">
            {lang === 'ar' ? 'الأدوات الموصى بها:' : 'Recommended instruments:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {killZone.recommendedInstruments.map((instrument) => (
              <span 
                key={instrument}
                className="px-2 py-1 bg-yellow-600/10 text-yellow-400 text-xs rounded"
              >
                {instrument}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Score Penalty Warning */}
      {!killZone.isActive && (
        <div className="px-4 py-2 bg-red-600/5 border-t border-red-600/20">
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠️</span>
            {lang === 'ar' 
              ? 'التداول خارج Kill Zone يخصم 15 نقطة من درجة التقاء المؤشرات'
              : 'Trading outside Kill Zone reduces confluence score by 15 points'}
          </p>
        </div>
      )}
    </div>
  );
}
