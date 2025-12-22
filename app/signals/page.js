'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SignalCard from './components/SignalCard';
import ActiveSignals from './components/ActiveSignals';
import PerformanceStats from './components/PerformanceStats';
import WatchList from './components/WatchList';
import RiskCalculator from './components/RiskCalculator';
import MarketScannerCard from './components/MarketScannerCard';
import SignalAlerts from './components/SignalAlerts';
import SignalHistory from './components/SignalHistory';
import SettingsPanel from './components/SettingsPanel';

export default function SignalsPage() {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState('signals');
  const [signals, setSignals] = useState([]);
  const [activeSignals, setActiveSignals] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const symbols = {
    forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD'],
    metals: ['XAUUSD', 'XAGUSD'],
    indices: ['US30', 'US100', 'US500']
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [signalsRes, activeRes, perfRes] = await Promise.all([
        fetch('/api/trading/signals?limit=20'),
        fetch('/api/trading/signals/active'),
        fetch('/api/trading/performance')
      ]);

      const signalsData = await signalsRes.json();
      const activeData = await activeRes.json();
      const perfData = await perfRes.json();

      if (signalsData.success) setSignals(signalsData.data);
      if (activeData.success) setActiveSignals(activeData.data);
      if (perfData.success) setPerformance(perfData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSignal = async () => {
    if (!selectedSymbol) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/trading/generate-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol })
      });

      const result = await response.json();
      
      if (result.status === 'SUCCESS') {
        fetchData();
        alert(isRTL ? 'تم توليد التوصية بنجاح!' : 'Signal generated successfully!');
      } else {
        alert(result.reason?.[language] || result.error || 'No signal generated');
      }
    } catch (error) {
      console.error('Error generating signal:', error);
      alert(isRTL ? 'خطأ في توليد التوصية' : 'Error generating signal');
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { id: 'signals', label: { en: 'Signals', ar: 'التوصيات' } },
    { id: 'active', label: { en: 'Active', ar: 'النشطة' } },
    { id: 'scanner', label: { en: 'Scanner', ar: 'الماسح' } },
    { id: 'history', label: { en: 'History', ar: 'السجل' } },
    { id: 'performance', label: { en: 'Performance', ar: 'الأداء' } },
    { id: 'calculator', label: { en: 'Calculator', ar: 'الحاسبة' } }
  ];

  return (
    <div className={`min-h-screen bg-[#0a0a0f] text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0a0a0f] border-b border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#d4af37]">
                {isRTL ? 'توصيات التداول الذكية' : 'AI Trading Signals'}
              </h1>
              <p className="text-gray-400 mt-1">
                {isRTL 
                  ? 'توصيات عالية الدقة مدعومة بالذكاء الاصطناعي'
                  : 'High-accuracy signals powered by AI'}
              </p>
            </div>

            {/* Generate Signal */}
            <div className="flex items-center gap-3">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-[#1a1a2e] border border-[#d4af37]/30 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
              >
                <option value="">{isRTL ? 'اختر الرمز' : 'Select Symbol'}</option>
                <optgroup label={isRTL ? 'الفوركس' : 'Forex'}>
                  {symbols.forex.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
                <optgroup label={isRTL ? 'المعادن' : 'Metals'}>
                  {symbols.metals.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
                <optgroup label={isRTL ? 'المؤشرات' : 'Indices'}>
                  {symbols.indices.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              </select>

              <button
                onClick={generateSignal}
                disabled={!selectedSymbol || generating}
                className="bg-[#d4af37] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#f4cf57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isRTL ? 'جاري التحليل...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    {isRTL ? 'توليد توصية' : 'Generate Signal'}
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-[#1a1a2e] border border-[#d4af37]/30 rounded-lg text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                title={isRTL ? 'الإعدادات' : 'Settings'}
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#d4af37] text-black'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                }`}
              >
                {tab.label[language]}
                {tab.id === 'active' && activeSignals.length > 0 && (
                  <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeSignals.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
          </div>
        ) : (
          <>
            {/* Signals Tab */}
            {activeTab === 'signals' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                {performance && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#d4af37]/20">
                      <p className="text-gray-400 text-sm">{isRTL ? 'نسبة النجاح' : 'Win Rate'}</p>
                      <p className="text-2xl font-bold text-green-400">{performance.stats?.winRate || 0}%</p>
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#d4af37]/20">
                      <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي النقاط' : 'Total Pips'}</p>
                      <p className={`text-2xl font-bold ${(performance.stats?.totalPips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performance.stats?.totalPips || 0}
                      </p>
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#d4af37]/20">
                      <p className="text-gray-400 text-sm">{isRTL ? 'معامل الربح' : 'Profit Factor'}</p>
                      <p className="text-2xl font-bold text-[#d4af37]">{performance.stats?.profitFactor || 0}</p>
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#d4af37]/20">
                      <p className="text-gray-400 text-sm">{isRTL ? 'التوصيات النشطة' : 'Active Signals'}</p>
                      <p className="text-2xl font-bold text-blue-400">{activeSignals.length}</p>
                    </div>
                  </div>
                )}

                {/* Signals List */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-[#d4af37]">
                    {isRTL ? 'أحدث التوصيات' : 'Latest Signals'}
                  </h2>
                  
                  {signals.length === 0 ? (
                    <div className="bg-[#1a1a2e] rounded-xl p-8 text-center border border-[#d4af37]/20">
                      <p className="text-gray-400">
                        {isRTL ? 'لا توجد توصيات حالياً' : 'No signals available'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {isRTL 
                          ? 'اختر رمزاً واضغط على "توليد توصية" لإنشاء توصية جديدة'
                          : 'Select a symbol and click "Generate Signal" to create a new signal'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {signals.map(signal => (
                        <SignalCard key={signal._id} signal={signal} language={language} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Signals Tab */}
            {activeTab === 'active' && (
              <ActiveSignals signals={activeSignals} language={language} />
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <PerformanceStats performance={performance} language={language} />
            )}

            {/* Calculator Tab */}
            {activeTab === 'calculator' && (
              <RiskCalculator language={language} />
            )}

            {/* Scanner Tab */}
            {activeTab === 'scanner' && (
              <div className="space-y-6">
                <MarketScannerCard language={language} />
                <WatchList language={language} />
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <SignalHistory language={language} />
            )}
          </>
        )}
      </div>

      {/* Alerts Sidebar */}
      <div className="fixed bottom-4 right-4 w-80 z-40 hidden lg:block">
        <SignalAlerts language={language} onNewSignal={fetchData} />
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel language={language} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
