'use client';

import { useState, useEffect } from 'react';

export default function SettingsPanel({ language = 'en', onClose }) {
  const isRTL = language === 'ar';
  const [settings, setSettings] = useState({
    capital: 10000,
    riskPerTrade: 1,
    maxDailyDrawdown: 3,
    maxOpenTrades: 5,
    preferredPairs: [],
    notifications: {
      newSignals: true,
      tpHit: true,
      slHit: true,
      sound: true
    },
    display: {
      showConfluence: true,
      showAIAnalysis: true,
      compactMode: false
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const allPairs = {
    forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD'],
    metals: ['XAUUSD', 'XAGUSD'],
    indices: ['US30', 'US100', 'US500']
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/trading/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/trading/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const togglePair = (pair) => {
    setSettings(prev => ({
      ...prev,
      preferredPairs: prev.preferredPairs.includes(pair)
        ? prev.preferredPairs.filter(p => p !== pair)
        : [...prev.preferredPairs, pair]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#d4af37]/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-semibold text-white">
              {isRTL ? 'الإعدادات' : 'Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Risk Management */}
          <section>
            <h3 className="text-lg font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
              <span>💰</span>
              {isRTL ? 'إدارة المخاطر' : 'Risk Management'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {isRTL ? 'رأس المال ($)' : 'Capital ($)'}
                </label>
                <input
                  type="number"
                  value={settings.capital}
                  onChange={(e) => setSettings(prev => ({ ...prev, capital: Number(e.target.value) }))}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {isRTL ? 'المخاطرة لكل صفقة (%)' : 'Risk per Trade (%)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="5"
                  value={settings.riskPerTrade}
                  onChange={(e) => setSettings(prev => ({ ...prev, riskPerTrade: Number(e.target.value) }))}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {isRTL ? 'الحد الأقصى للسحب اليومي (%)' : 'Max Daily Drawdown (%)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={settings.maxDailyDrawdown}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDailyDrawdown: Number(e.target.value) }))}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {isRTL ? 'الحد الأقصى للصفقات المفتوحة' : 'Max Open Trades'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxOpenTrades}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxOpenTrades: Number(e.target.value) }))}
                  className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Preferred Pairs */}
          <section>
            <h3 className="text-lg font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
              <span>📊</span>
              {isRTL ? 'الأزواج المفضلة' : 'Preferred Pairs'}
            </h3>
            
            {Object.entries(allPairs).map(([category, pairs]) => (
              <div key={category} className="mb-4">
                <p className="text-sm text-gray-400 mb-2 capitalize">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {pairs.map(pair => (
                    <button
                      key={pair}
                      onClick={() => togglePair(pair)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        settings.preferredPairs.includes(pair)
                          ? 'bg-[#d4af37] text-black'
                          : 'bg-[#0a0a0f] text-gray-400 hover:text-white'
                      }`}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-lg font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
              <span>🔔</span>
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'newSignals', label: { en: 'New Signals', ar: 'توصيات جديدة' } },
                { key: 'tpHit', label: { en: 'Take Profit Hit', ar: 'وصول الهدف' } },
                { key: 'slHit', label: { en: 'Stop Loss Hit', ar: 'وصول وقف الخسارة' } },
                { key: 'sound', label: { en: 'Sound Alerts', ar: 'تنبيهات صوتية' } }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300">{item.label[language]}</span>
                  <div
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [item.key]: !prev.notifications[item.key]
                      }
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings.notifications[item.key] ? 'bg-[#d4af37]' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Display Options */}
          <section>
            <h3 className="text-lg font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
              <span>🎨</span>
              {isRTL ? 'خيارات العرض' : 'Display Options'}
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'showConfluence', label: { en: 'Show Confluence Details', ar: 'عرض تفاصيل التوافق' } },
                { key: 'showAIAnalysis', label: { en: 'Show AI Analysis', ar: 'عرض تحليل الذكاء الاصطناعي' } },
                { key: 'compactMode', label: { en: 'Compact Mode', ar: 'الوضع المضغوط' } }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300">{item.label[language]}</span>
                  <div
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      display: {
                        ...prev.display,
                        [item.key]: !prev.display[item.key]
                      }
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings.display[item.key] ? 'bg-[#d4af37]' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.display[item.key] ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-[#d4af37] text-black rounded-lg font-semibold hover:bg-[#f4cf57] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : saved ? (
              <>
                <span>✓</span>
                {isRTL ? 'تم الحفظ!' : 'Saved!'}
              </>
            ) : (
              <>
                <span>💾</span>
                {isRTL ? 'حفظ' : 'Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
