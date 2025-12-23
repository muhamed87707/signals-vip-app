'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SignalCard from './components/SignalCard';
import ConfluenceBreakdown from './components/ConfluenceBreakdown';
import ValidationLayers from './components/ValidationLayers';
import KillZoneIndicator from './components/KillZoneIndicator';
import PerformanceStats from './components/PerformanceStats';

/**
 * Signals System Dashboard
 * Requirements: 17.1, 17.2, 17.8, 17.9
 */
export default function SignalsSystemPage() {
  const { lang, isRTL } = useLanguage();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [killZone, setKillZone] = useState(null);
  const [activeTab, setActiveTab] = useState('signals');
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    fetchSignals();
    fetchKillZone();
    const interval = setInterval(() => {
      fetchSignals();
      fetchKillZone();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSignals = async () => {
    try {
      const res = await fetch('/api/signals-system/signals');
      const data = await res.json();
      if (data.success) setSignals(data.signals || []);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKillZone = async () => {
    try {
      const res = await fetch('/api/signals-system/kill-zone');
      const data = await res.json();
      if (data.success) setKillZone(data);
    } catch (error) {
      console.error('Failed to fetch kill zone:', error);
    }
  };

  const fetchAnalysis = async (symbol) => {
    setAnalysisLoading(true);
    try {
      const res = await fetch(`/api/signals-system/analysis/${symbol}`);
      const data = await res.json();
      if (data.success) setAnalysis(data);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleViewSignalDetails = (signal) => {
    setSelectedSignal(signal);
    setActiveTab('analysis');
    if (signal.symbol) setSelectedSymbol(signal.symbol);
  };

  const instruments = [
    { symbol: 'XAUUSD', name: 'Gold' },
    { symbol: 'EURUSD', name: 'EUR/USD' },
    { symbol: 'GBPUSD', name: 'GBP/USD' },
    { symbol: 'USDJPY', name: 'USD/JPY' },
    { symbol: 'US30', name: 'Dow Jones' },
  ];

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="bg-[#111] border-b border-yellow-600/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {lang === 'ar' ? 'نظام التوصيات المؤسسي' : 'Institutional Edge System'}
            </h1>
            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-sm rounded-full">IES v1.0</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${killZone?.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${killZone?.isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm font-medium">
              {killZone?.isActive ? `${killZone.currentZone} Kill Zone` : `Next: ${killZone?.nextZone || '--'}`}
            </span>
          </div>
        </div>
      </header>

      <nav className="bg-[#111] border-b border-yellow-600/10 px-6 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { id: 'signals', icon: '📊', label: { en: 'Signals', ar: 'التوصيات' } },
            { id: 'analysis', icon: '🔍', label: { en: 'Analysis', ar: 'التحليل' } },
            { id: 'performance', icon: '📈', label: { en: 'Performance', ar: 'الأداء' } },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              {tab.icon} {tab.label[lang]}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'signals' && (
          <div className="space-y-8">
            <KillZoneIndicator killZone={killZone} lang={lang} />
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-yellow-400">⚡</span>
                  {lang === 'ar' ? 'التوصيات النشطة' : 'Active Signals'}
                  <span className="text-sm font-normal text-gray-400">({signals.filter(s => s.status === 'active').length})</span>
                </h2>
                <button onClick={fetchSignals} className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-600/30">
                  {lang === 'ar' ? '🔄 تحديث' : '🔄 Refresh'}
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : signals.filter(s => s.status === 'active').length === 0 ? (
                <div className="bg-[#111] rounded-xl p-8 text-center border border-yellow-600/10">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-400">{lang === 'ar' ? 'لا توجد توصيات نشطة حالياً' : 'No active signals'}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {signals.filter(s => s.status === 'active').map((signal) => (
                    <SignalCard key={signal.id || signal._id} signal={signal} lang={lang} onViewDetails={handleViewSignalDetails} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-[#111] rounded-xl p-4 border border-yellow-600/10">
              <div className="flex items-center gap-4 flex-wrap">
                <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)} className="bg-[#0a0a0a] border border-yellow-600/20 rounded-lg px-4 py-2 text-white">
                  {instruments.map((inst) => (<option key={inst.symbol} value={inst.symbol}>{inst.symbol} ({inst.name})</option>))}
                </select>
                <button onClick={() => fetchAnalysis(selectedSymbol)} disabled={analysisLoading} className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {analysisLoading ? '⏳...' : '🔍 Analyze'}
                </button>
              </div>
            </div>
            {analysisLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : analysis ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <ConfluenceBreakdown confluence={analysis.confluence} lang={lang} />
                <ValidationLayers validation={analysis.validation} lang={lang} />
              </div>
            ) : (
              <div className="bg-[#111] rounded-xl p-8 text-center border border-yellow-600/10">
                <p className="text-gray-400">{lang === 'ar' ? 'اختر أداة واضغط تحليل' : 'Select instrument and click Analyze'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && <PerformanceStats lang={lang} />}
      </main>

      <footer className="bg-[#111] border-t border-yellow-600/10 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>⚠️ {lang === 'ar' ? 'التداول ينطوي على مخاطر' : 'Trading involves risk'}</p>
        </div>
      </footer>
    </div>
  );
}
