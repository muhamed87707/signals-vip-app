'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Alert System Component
 * Toast notifications, sound alerts, browser push notifications
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */
export default function AlertSystem({ signals = [], lang = 'en' }) {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [previousSignals, setPreviousSignals] = useState([]);

  // Request push notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setPushEnabled(permission === 'granted');
      });
    } else if (Notification.permission === 'granted') {
      setPushEnabled(true);
    }
  }, []);

  // Check for new signals
  useEffect(() => {
    if (previousSignals.length === 0) {
      setPreviousSignals(signals);
      return;
    }

    // Find new signals
    const newSignals = signals.filter(s => 
      !previousSignals.find(ps => ps.id === s.id || ps._id === s._id)
    );

    // Find status changes
    const statusChanges = signals.filter(s => {
      const prev = previousSignals.find(ps => ps.id === s.id || ps._id === s._id);
      return prev && prev.status !== s.status;
    });

    // Notify for new signals
    newSignals.forEach(signal => {
      if (signal.quality === 'institutional' || signal.quality === 'excellent') {
        showNotification({
          type: 'new_signal',
          title: lang === 'ar' ? '🚀 توصية جديدة!' : '🚀 New Signal!',
          message: `${signal.symbol} ${signal.direction?.toUpperCase()} - Score: ${signal.confluenceScore}`,
          priority: 'high',
          signal,
        });
      }
    });

    // Notify for status changes
    statusChanges.forEach(signal => {
      const prev = previousSignals.find(ps => ps.id === signal.id || ps._id === signal._id);
      
      if (signal.status === 'tp1_hit' && prev?.status === 'active') {
        showNotification({
          type: 'tp_hit',
          title: lang === 'ar' ? '✅ TP1 تم!' : '✅ TP1 Hit!',
          message: `${signal.symbol} - ${lang === 'ar' ? 'تم نقل SL إلى BE' : 'SL moved to BE'}`,
          priority: 'medium',
          signal,
        });
      } else if (signal.status === 'sl_hit') {
        showNotification({
          type: 'sl_hit',
          title: lang === 'ar' ? '❌ SL تم!' : '❌ SL Hit!',
          message: `${signal.symbol} - ${signal.pnlPips?.toFixed(1) || 0} pips`,
          priority: 'medium',
          signal,
        });
      }
    });

    setPreviousSignals(signals);
  }, [signals, previousSignals, lang]);

  const showNotification = useCallback(({ type, title, message, priority, signal }) => {
    const id = Date.now();
    
    // Add to toast notifications
    setNotifications(prev => [...prev, { id, type, title, message, priority, signal }]);

    // Play sound
    if (soundEnabled) {
      playSound(type, priority);
    }

    // Show browser notification
    if (pushEnabled && priority === 'high') {
      showBrowserNotification(title, message);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [soundEnabled, pushEnabled]);

  const playSound = (type, priority) => {
    try {
      const audio = new Audio('/cash.mp3');
      audio.volume = priority === 'high' ? 0.8 : 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      console.log('Sound not available');
    }
  };

  const showBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/favicon-32x32.png',
        tag: 'ies-signal',
        renotify: true,
      });
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type, priority) => {
    if (priority === 'high') {
      return 'bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 border-yellow-400';
    }
    if (type === 'tp_hit') {
      return 'bg-green-600/90 border-green-400';
    }
    if (type === 'sl_hit') {
      return 'bg-red-600/90 border-red-400';
    }
    return 'bg-[#111]/90 border-yellow-600/30';
  };

  return (
    <>
      {/* Settings Toggle */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg ${soundEnabled ? 'bg-yellow-600/20 text-yellow-400' : 'bg-gray-600/20 text-gray-400'}`}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>
        <button
          onClick={() => {
            if (!pushEnabled && 'Notification' in window) {
              Notification.requestPermission().then(p => setPushEnabled(p === 'granted'));
            }
          }}
          className={`p-2 rounded-lg ${pushEnabled ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}
          title={pushEnabled ? 'Push On' : 'Push Off'}
        >
          {pushEnabled ? '📲' : '📵'}
        </button>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl border backdrop-blur-sm shadow-lg animate-slide-in ${getNotificationStyle(notification.type, notification.priority)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-white">{notification.title}</h4>
                <p className="text-sm text-white/80">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            {notification.signal && (
              <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70">
                Quality: {notification.signal.quality} | Score: {notification.signal.confluenceScore}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// Hook for using alerts programmatically
export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((alert) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { ...alert, id }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, alert.duration || 5000);
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return { alerts, showAlert, dismissAlert };
}
