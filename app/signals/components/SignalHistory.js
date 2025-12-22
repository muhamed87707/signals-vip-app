'use client';

import { useState, useEffect } from 'react';

export default function SignalHistory({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, wins, losses
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const filters = [
    { id: 'all', label: { en: 'All', ar: 'الكل' } },
    { id: 'wins', label: { en: 'Wins', ar: 'الرابحة' } },
    { id: 'losses', label: { en: 'Losses', ar: 'الخاسرة' } }
  ];

  useEffect(() => {
    fetchSignals();
  }, [filter, page]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: 'closed'
      });

      if (filter === 'wins') params.append('result', 'WIN');
      if (filter === 'losses') params.append('result', 'LOSS');

      const response = await fetch(`/api/trading/signals?${params}`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setSignals(data.data);
        } else {
          setSignals(prev => [...prev, ...data.data]);
        }
        setHasMore(data.data.length === 20);
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setSignals([]);
  };

  const getResultColor = (result) => {
    if (result === 'WIN' || result === 'PARTIAL_WIN') return 'text-green-400';
    if (result === 'LOSS') return 'text-red-400';
    return 'text-gray-400';
  };

  const getResultIcon = (result) => {
    if (result === 'WIN') return '✅';
    if (result === 'PARTIAL_WIN') return '🎯';
    if (result === 'LOSS') return '❌';
    return '⏳';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <h3 className="text-lg font-semibold text-white">
            {isRTL ? 'سجل التوصيات' : 'Signal History'}
          </h3>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[#0a0a0f] text-gray-400 hover:text-white'
              }`}
            >
              {f.label[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Signals Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="text-start pb-3">{isRTL ? 'الرمز' : 'Symbol'}</th>
              <th className="text-start pb-3">{isRTL ? 'الاتجاه' : 'Direction'}</th>
              <th className="text-start pb-3">{isRTL ? 'الدخول' : 'Entry'}</th>
              <th className="text-start pb-3">{isRTL ? 'الإغلاق' : 'Exit'}</th>
              <th className="text-start pb-3">{isRTL ? 'النتيجة' : 'Result'}</th>
              <th className="text-start pb-3">{isRTL ? 'النقاط' : 'Pips'}</th>
              <th className="text-start pb-3">{isRTL ? 'التاريخ' : 'Date'}</th>
            </tr>
          </thead>
          <tbody>
            {signals.map(signal => (
              <tr key={signal._id} className="border-b border-gray-800 hover:bg-[#0a0a0f]/50">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{signal.symbol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      signal.grade === 'A+' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {signal.grade}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={signal.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                    {signal.direction === 'BUY' ? '↑ ' : '↓ '}
                    {signal.direction}
                  </span>
                </td>
                <td className="py-3 text-gray-300">
                  {signal.entry?.price?.toFixed(5)}
                </td>
                <td className="py-3 text-gray-300">
                  {signal.exitPrice?.toFixed(5) || '-'}
                </td>
                <td className="py-3">
                  <span className={`flex items-center gap-1 ${getResultColor(signal.result)}`}>
                    {getResultIcon(signal.result)}
                    {signal.result || 'PENDING'}
                  </span>
                </td>
                <td className={`py-3 font-semibold ${
                  (signal.pips || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {signal.pips >= 0 ? '+' : ''}{signal.pips?.toFixed(1) || 0}
                </td>
                <td className="py-3 text-gray-400 text-sm">
                  {formatDate(signal.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#d4af37]"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && signals.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl mb-2 block">📭</span>
          <p>{isRTL ? 'لا توجد توصيات مغلقة' : 'No closed signals'}</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && signals.length > 0 && !loading && (
        <div className="text-center mt-4">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-[#0a0a0f] text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isRTL ? 'تحميل المزيد' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
