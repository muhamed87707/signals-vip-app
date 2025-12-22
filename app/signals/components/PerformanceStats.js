'use client';

import { useState } from 'react';

export default function PerformanceStats({ performance, language }) {
  const isRTL = language === 'ar';
  const [period, setPeriod] = useState('30d');

  if (!performance) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-8 text-center border border-[#d4af37]/20">
        <p className="text-gray-400">{isRTL ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}</p>
      </div>
    );
  }

  const stats = performance.stats || {};

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#d4af37]">
          {isRTL ? 'إحصائيات الأداء' : 'Performance Statistics'}
        </h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1 rounded-lg text-sm transition-colors ${
                period === p 
                  ? 'bg-[#d4af37] text-black' 
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
              }`}
            >
              {p === 'all' ? (isRTL ? 'الكل' : 'All') : p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <p className="text-gray-400 text-sm mb-2">{isRTL ? 'نسبة النجاح' : 'Win Rate'}</p>
          <p className="text-4xl font-bold text-green-400">{stats.winRate || 0}%</p>
          <p className="text-gray-500 text-xs mt-2">
            {stats.wins || 0} {isRTL ? 'فوز' : 'wins'} / {stats.losses || 0} {isRTL ? 'خسارة' : 'losses'}
          </p>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <p className="text-gray-400 text-sm mb-2">{isRTL ? 'إجمالي النقاط' : 'Total Pips'}</p>
          <p className={`text-4xl font-bold ${(stats.totalPips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalPips > 0 ? '+' : ''}{stats.totalPips || 0}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {isRTL ? 'متوسط' : 'Avg'}: {stats.averagePipsPerTrade || 0} {isRTL ? 'نقطة/صفقة' : 'pips/trade'}
          </p>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <p className="text-gray-400 text-sm mb-2">{isRTL ? 'معامل الربح' : 'Profit Factor'}</p>
          <p className="text-4xl font-bold text-[#d4af37]">{stats.profitFactor || 0}</p>
          <p className="text-gray-500 text-xs mt-2">
            {isRTL ? 'الربح / الخسارة' : 'Profit / Loss'}
          </p>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <p className="text-gray-400 text-sm mb-2">{isRTL ? 'إجمالي التوصيات' : 'Total Signals'}</p>
          <p className="text-4xl font-bold text-white">{stats.totalSignals || 0}</p>
          <p className="text-gray-500 text-xs mt-2">
            {stats.activeSignals || 0} {isRTL ? 'نشطة' : 'active'}
          </p>
        </div>
      </div>

      {/* By Grade */}
      {performance.byGrade && (
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
            {isRTL ? 'الأداء حسب الدرجة' : 'Performance by Grade'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(performance.byGrade).map(([grade, data]) => (
              <div key={grade} className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-bold ${
                    grade === 'A+' ? 'bg-[#d4af37] text-black' : 'bg-blue-500 text-white'
                  }`}>
                    {grade}
                  </span>
                  <span className="text-gray-400">{data.count} {isRTL ? 'توصية' : 'signals'}</span>
                </div>
                <div className="text-end">
                  <p className="text-green-400">{data.wins} {isRTL ? 'فوز' : 'W'}</p>
                  <p className="text-red-400">{data.losses} {isRTL ? 'خسارة' : 'L'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Symbol */}
      {performance.bySymbol && Object.keys(performance.bySymbol).length > 0 && (
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
            {isRTL ? 'الأداء حسب الرمز' : 'Performance by Symbol'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="text-start py-2">{isRTL ? 'الرمز' : 'Symbol'}</th>
                  <th className="text-start py-2">{isRTL ? 'فوز' : 'Wins'}</th>
                  <th className="text-start py-2">{isRTL ? 'خسارة' : 'Losses'}</th>
                  <th className="text-start py-2">{isRTL ? 'النقاط' : 'Pips'}</th>
                  <th className="text-start py-2">{isRTL ? 'نسبة النجاح' : 'Win Rate'}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(performance.bySymbol).map(([symbol, data]) => {
                  const total = data.wins + data.losses;
                  const winRate = total > 0 ? ((data.wins / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={symbol} className="border-b border-gray-800">
                      <td className="py-3 font-bold text-white">{symbol}</td>
                      <td className="py-3 text-green-400">{data.wins}</td>
                      <td className="py-3 text-red-400">{data.losses}</td>
                      <td className={`py-3 ${data.pips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.pips > 0 ? '+' : ''}{data.pips?.toFixed(1)}
                      </td>
                      <td className="py-3 text-[#d4af37]">{winRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Signals */}
      {performance.recentSignals?.length > 0 && (
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
          <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
            {isRTL ? 'آخر التوصيات المغلقة' : 'Recent Closed Signals'}
          </h3>
          <div className="space-y-2">
            {performance.recentSignals.map((signal, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{signal.symbol}</span>
                  <span className={signal.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                    {signal.direction}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    signal.grade === 'A+' ? 'bg-[#d4af37] text-black' : 'bg-blue-500 text-white'
                  }`}>
                    {signal.grade}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${
                    signal.status.includes('TP') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {signal.resultPips > 0 ? '+' : ''}{signal.resultPips?.toFixed(1)} pips
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    signal.status.includes('TP') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {signal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
