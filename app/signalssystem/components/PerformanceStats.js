'use client';

import { useState, useEffect } from 'react';

/**
 * Performance Statistics Component
 * Displays win rate, profit factor, equity curve
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6
 */
export default function PerformanceStats({ lang = 'en' }) {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchPerformance();
  }, [period]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/signals-system/performance?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setPerformance(data);
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: 'today', label: { en: 'Today', ar: 'اليوم' } },
    { value: 'week', label: { en: 'Week', ar: 'أسبوع' } },
    { value: 'month', label: { en: 'Month', ar: 'شهر' } },
    { value: 'quarter', label: { en: 'Quarter', ar: 'ربع سنة' } },
    { value: 'year', label: { en: 'Year', ar: 'سنة' } },
    { value: 'all', label: { en: 'All Time', ar: 'الكل' } },
  ];

  const getStatColor = (value, type) => {
    if (type === 'winRate') {
      if (value >= 70) return 'text-green-400';
      if (value >= 50) return 'text-yellow-400';
      return 'text-red-400';
    }
    if (type === 'profitFactor') {
      if (value >= 2) return 'text-green-400';
      if (value >= 1) return 'text-yellow-400';
      return 'text-red-400';
    }
    if (type === 'pips') {
      return value >= 0 ? 'text-green-400' : 'text-red-400';
    }
    return 'text-white';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#111] rounded-xl p-6 border border-yellow-600/10 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = performance?.performance || {};

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-yellow-600 text-black'
                : 'bg-[#111] text-gray-400 hover:text-white border border-yellow-600/20'
            }`}
          >
            {p.label[lang]}
          </button>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Win Rate */}
        <StatCard
          icon="🎯"
          label={lang === 'ar' ? 'نسبة النجاح' : 'Win Rate'}
          value={`${stats.winRate || 0}%`}
          valueColor={getStatColor(stats.winRate, 'winRate')}
          subtext={`${stats.totalWins || 0}W / ${stats.totalLosses || 0}L`}
        />

        {/* Profit Factor */}
        <StatCard
          icon="📊"
          label={lang === 'ar' ? 'معامل الربح' : 'Profit Factor'}
          value={stats.profitFactor?.toFixed(2) || '0.00'}
          valueColor={getStatColor(stats.profitFactor, 'profitFactor')}
          subtext={stats.profitFactor >= 2 ? '✓ Excellent' : stats.profitFactor >= 1 ? '○ Good' : '✗ Poor'}
        />

        {/* Total Pips */}
        <StatCard
          icon="💰"
          label={lang === 'ar' ? 'إجمالي النقاط' : 'Total Pips'}
          value={`${stats.totalPips >= 0 ? '+' : ''}${stats.totalPips || 0}`}
          valueColor={getStatColor(stats.totalPips, 'pips')}
          subtext={`Avg: ${stats.averagePips?.toFixed(1) || 0} pips`}
        />

        {/* Max Drawdown */}
        <StatCard
          icon="📉"
          label={lang === 'ar' ? 'أقصى تراجع' : 'Max Drawdown'}
          value={`${stats.maxDrawdown?.toFixed(2) || 0}%`}
          valueColor={stats.maxDrawdown > 10 ? 'text-red-400' : 'text-yellow-400'}
          subtext={lang === 'ar' ? 'من الذروة' : 'from peak'}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Expectancy */}
        <div className="bg-[#111] rounded-xl p-4 border border-yellow-600/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">
              {lang === 'ar' ? 'التوقع' : 'Expectancy'}
            </span>
            <span className={`font-bold ${getStatColor(stats.expectancy, 'pips')}`}>
              {stats.expectancy?.toFixed(1) || 0} pips
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {lang === 'ar' ? 'متوسط الربح المتوقع لكل صفقة' : 'Expected profit per trade'}
          </p>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-[#111] rounded-xl p-4 border border-yellow-600/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">
              {lang === 'ar' ? 'نسبة شارب' : 'Sharpe Ratio'}
            </span>
            <span className={`font-bold ${stats.sharpeRatio >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
              {stats.sharpeRatio?.toFixed(2) || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {lang === 'ar' ? 'العائد المعدل بالمخاطر' : 'Risk-adjusted return'}
          </p>
        </div>

        {/* Consecutive */}
        <div className="bg-[#111] rounded-xl p-4 border border-yellow-600/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">
              {lang === 'ar' ? 'متتالية' : 'Consecutive'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">{stats.maxConsecutiveWins || 0}W</span>
              <span className="text-gray-500">/</span>
              <span className="text-red-400 font-bold">{stats.maxConsecutiveLosses || 0}L</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {lang === 'ar' ? 'أقصى سلسلة ربح/خسارة' : 'Max win/loss streak'}
          </p>
        </div>
      </div>

      {/* Performance by Quality */}
      {performance?.byQuality && Object.keys(performance.byQuality).length > 0 && (
        <div className="bg-[#111] rounded-xl p-6 border border-yellow-600/10">
          <h3 className="text-lg font-bold mb-4">
            {lang === 'ar' ? 'الأداء حسب الجودة' : 'Performance by Quality'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-yellow-600/10">
                  <th className="text-left py-2">{lang === 'ar' ? 'الجودة' : 'Quality'}</th>
                  <th className="text-right py-2">{lang === 'ar' ? 'الصفقات' : 'Trades'}</th>
                  <th className="text-right py-2">{lang === 'ar' ? 'نسبة النجاح' : 'Win Rate'}</th>
                  <th className="text-right py-2">{lang === 'ar' ? 'النقاط' : 'Pips'}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(performance.byQuality).map(([quality, data]) => (
                  <tr key={quality} className="border-b border-yellow-600/5">
                    <td className="py-2 capitalize">{quality}</td>
                    <td className="text-right py-2">{data.totalWins + data.totalLosses}</td>
                    <td className={`text-right py-2 ${getStatColor(data.winRate, 'winRate')}`}>
                      {data.winRate?.toFixed(1)}%
                    </td>
                    <td className={`text-right py-2 ${getStatColor(data.totalPips, 'pips')}`}>
                      {data.totalPips >= 0 ? '+' : ''}{data.totalPips?.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equity Curve Placeholder */}
      {performance?.equityCurve && performance.equityCurve.length > 0 && (
        <div className="bg-[#111] rounded-xl p-6 border border-yellow-600/10">
          <h3 className="text-lg font-bold mb-4">
            {lang === 'ar' ? 'منحنى رأس المال' : 'Equity Curve'}
          </h3>
          <div className="h-48 flex items-center justify-center text-gray-500">
            {/* Chart would go here - using placeholder */}
            <div className="text-center">
              <p className="text-4xl mb-2">📈</p>
              <p>{lang === 'ar' ? 'الرسم البياني قريباً' : 'Chart coming soon'}</p>
              <p className="text-sm mt-2">
                {performance.equityCurve.length} {lang === 'ar' ? 'نقطة بيانات' : 'data points'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, valueColor, subtext }) {
  return (
    <div className="bg-[#111] rounded-xl p-5 border border-yellow-600/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${valueColor}`}>
        {value}
      </div>
      {subtext && (
        <p className="text-xs text-gray-500 mt-1">{subtext}</p>
      )}
    </div>
  );
}
