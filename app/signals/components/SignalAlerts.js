'use client';

import { useState, useEffect, useRef } from 'react';

export default function SignalAlerts({ language = 'en', onNewSignal }) {
  const isRTL = language === 'ar';
  const [alerts, setAlerts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const audioRef = useRef(null);
  const lastSignalIdRef = useRef(null);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Poll for new signals
    const checkForNewSignals = async () => {
      try {
        const response = await fetch('/api/trading/signals/active');
        const data = await response.json();
        
        if (data.success && data.data?.length > 0) {
          const latestSignal = data.data[0];
          
          // Check if this is a new signal
          if (latestSignal._id !== lastSignalIdRef.current) {
            const isNew = lastSignalIdRef.current !== null;
            lastSignalIdRef.current = latestSignal._id;
            
            if (isNew) {
              handleNewSignal(latestSignal);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for signals:', error);
      }
    };

    checkForNewSignals();
    const interval = setInterval(checkForNewSignals, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNewSignal = (signal) => {
    // Add to alerts
    const alert = {
      id: signal._id,
      type: 'NEW_SIGNAL',
      symbol: signal.symbol,
      direction: signal.direction,
      grade: signal.grade,
      timestamp: new Date(),
      message: {
        en: `New ${signal.grade} ${signal.direction} signal for ${signal.symbol}`,
        ar: `توصية ${signal.direction === 'BUY' ? 'شراء' : 'بيع'} جديدة ${signal.grade} لـ ${signal.symbol}`
      }
    };

    setAlerts(prev => [alert, ...prev].slice(0, 10));

    // Play sound
    if (soundEnabled) {
      playAlertSound();
    }

    // Show browser notification
    if (showNotifications && 'Notification' in window && Notification.permission === 'granted') {
      showBrowserNotification(alert);
    }

    // Callback
    if (onNewSignal) {
      onNewSignal(signal);
    }
  };

  const playAlertSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const showBrowserNotification = (alert) => {
    try {
      new Notification(isRTL ? 'توصية جديدة!' : 'New Signal!', {
        body: alert.message[language],
        icon: '/icon-192.png',
        badge: '/favicon-32x32.png',
        tag: alert.id,
        requireInteraction: true
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const getAlertIcon = (type, direction) => {
    if (type === 'NEW_SIGNAL') {
      return direction === 'BUY' ? '📈' : '📉';
    }
    if (type === 'TP_HIT') return '🎯';
    if (type === 'SL_HIT') return '🛑';
    return '🔔';
  };

  const getAlertColor = (type, direction) => {
    if (type === 'NEW_SIGNAL') {
      return direction === 'BUY' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10';
    }
    if (type === 'TP_HIT') return 'border-green-500/50 bg-green-500/10';
    if (type === 'SL_HIT') return 'border-red-500/50 bg-red-500/10';
    return 'border-[#d4af37]/50 bg-[#d4af37]/10';
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#d4af37]/20">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/cash.mp3" preload="auto" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <h3 className="font-semibold text-white">
            {isRTL ? 'التنبيهات' : 'Alerts'}
          </h3>
          {alerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-gray-700 text-gray-400'
            }`}
            title={isRTL ? 'الصوت' : 'Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Notification Toggle */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors ${
              showNotifications ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-gray-700 text-gray-400'
            }`}
            title={isRTL ? 'الإشعارات' : 'Notifications'}
          >
            {showNotifications ? '🔔' : '🔕'}
          </button>

          {/* Clear All */}
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-xs text-gray-400 hover:text-white"
            >
              {isRTL ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <span className="text-3xl mb-2 block">🔕</span>
            <p className="text-sm">
              {isRTL ? 'لا توجد تنبيهات جديدة' : 'No new alerts'}
            </p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.type, alert.direction)} animate-fadeIn`}
            >
              <span className="text-xl">{getAlertIcon(alert.type, alert.direction)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{alert.symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    alert.grade === 'A+' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.grade}
                  </span>
                </div>
                <p className="text-sm text-gray-300 truncate">
                  {alert.message[language]}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Test Alert Button (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => handleNewSignal({
            _id: Date.now().toString(),
            symbol: 'EURUSD',
            direction: 'BUY',
            grade: 'A+'
          })}
          className="mt-4 w-full py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
        >
          Test Alert
        </button>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
