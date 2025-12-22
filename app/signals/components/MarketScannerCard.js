'use client';

import { useState, useEffect } from 'react';

export default function MarketScannerCard({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: { en: 'All', ar: 'الكل' } },
    { id: 'forex', label: { en: 'Forex', ar: 'الفوركس' } },
    { id: 'metals', label: { en: 'Metals', ar: 'المعادن' } },
    { id: 'indices', label: { en: 'Indices', ar: 'المؤشرات' } }
  ];

  useEffect(() => {
    fetchScanData();
    const interval = setInterval(fetchScanData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchScanData = async () => {
    try {
      const response = await fetch('/api/trading/scan');
      const data = await response.json();
      if (data.success) {
        setScanData(data);
      }
    } catch (error) {
      console.error('Error fetching scan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (score, direction) => {
    if (score < 50) return 'bg-gray-700';
    
    if (direction === 'BULLISH') {
      if (score >= 80) return 'bg-green-600';
      if (score >= 70) return 'bg-green-500';
      return 'bg-green-400/70';
    } else if (direction === 'BEARISH') {
      if (score >= 80) return 'bg-red-600';
      if (score >= 70) return 'bg-red-500';
      return 'bg-red-400/70';
    }
    
    return 'bg-gray-600';
  };

  const getDirectionIcon = (direction) => {
    if (direction === 'BULLISH') return '↑';
    if (direction === 'BEARISH') return '↓';
    return '→';
  };

  const filterByCategory = (items) => {
    if (selectedCategory === 'all') return items;
    return items?.filter(item => item.category === selectedCategory) || [];
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4af37]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isRTL ? 'ماسح السوق' : 'Market Scanner'}
            </h3>
            <p className="text-sm text-gray-400">
              {isRTL ? 'فحص تلقائي كل 5 دقائق' : 'Auto-scan every 5 minutes'}
            </p>
          </div>
        </div>
        
        {scanData?.lastScan && (
          <div className="text-xs text-gray-500">
            {isRTL ? 'آخر فحص: ' : 'Last scan: '}
            {new Date(scanData.lastScan).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#0a0a0f] text-gray-400 hover:text-white'
            }`}
          >
            {cat.label[language]}
          </button>
        ))}
      </div>

      {/* Heat Map */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">
          {isRTL ? 'خريطة الحرارة' : 'Heat Map'}
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filterByCategory([...(scanData?.opportunities || []), ...(scanData?.watchlist || [])])
            .slice(0, 24)
            .map(item => (
              <div
                key={item.symbol}
                className={`${getHeatColor(item.score, item.direction)} rounded-lg p-2 text-center cursor-pointer hover:opacity-80 transition-opacity`}
                title={`${item.symbol}: ${item.score}% ${item.direction}`}
              >
                <div className="text-xs font-bold text-white truncate">
                  {item.symbol.replace('USD', '')}
                </div>
                <div className="text-xs text-white/80">
                  {getDirectionIcon(item.direction)} {item.score}%
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Opportunities */}
      {scanData?.opportunities?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
            <span>⚡</span>
            {isRTL ? 'فرص عالية' : 'High Opportunities'}
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
              {filterByCategory(scanData.opportunities).length}
            </span>
          </h4>
          <div className="space-y-2">
            {filterByCategory(scanData.opportunities).slice(0, 5).map(opp => (
              <div
                key={opp.symbol}
                className="flex items-center justify-between bg-[#0a0a0f] rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${opp.direction === 'BULLISH' ? 'text-green-400' : 'text-red-400'}`}>
                    {opp.direction === 'BULLISH' ? '📈' : '📉'}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{opp.symbol}</div>
                    <div className="text-xs text-gray-400">
                      {opp.reason?.[language] || opp.reason?.en}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${opp.direction === 'BULLISH' ? 'text-green-400' : 'text-red-400'}`}>
                    {opp.score}%
                  </div>
                  <div className={`text-xs ${opp.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {opp.change24h >= 0 ? '+' : ''}{opp.change24h?.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist */}
      {scanData?.watchlist?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
            <span>👁️</span>
            {isRTL ? 'قائمة المراقبة' : 'Watchlist'}
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              {filterByCategory(scanData.watchlist).length}
            </span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {filterByCategory(scanData.watchlist).slice(0, 10).map(item => (
              <div
                key={item.symbol}
                className="bg-[#0a0a0f] rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <span className={item.direction === 'BULLISH' ? 'text-green-400' : 'text-red-400'}>
                  {getDirectionIcon(item.direction)}
                </span>
                <span className="text-sm text-white">{item.symbol}</span>
                <span className="text-xs text-gray-400">{item.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!scanData?.opportunities?.length && !scanData?.watchlist?.length) && (
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl mb-2 block">🔍</span>
          <p>{isRTL ? 'لا توجد فرص حالياً' : 'No opportunities found'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? 'سيتم الفحص مرة أخرى قريباً' : 'Next scan coming soon'}
          </p>
        </div>
      )}
    </div>
  );
}
