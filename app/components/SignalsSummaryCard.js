'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SignalsSummaryCard({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/trading/performance');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] rounded-2xl p-6 border border-[#d4af37]/30">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] rounded-2xl p-6 border border-[#d4af37]/30 hover:border-[#d4af37]/50 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isRTL ? 'توصيات الذكاء الاصطناعي' : 'AI Trading Signals'}
            </h3>
            <p className="text-sm text-gray-400">
              {isRTL ? 'أداء مباشر' : 'Live Performance'}
            </p>
          </div>
        </div>
        <Link 
          href="/signals"
          className="px-4 py-2 bg-[#d4af37] text-black rounded-lg font-semibold text-sm hover:bg-[#f4cf57] transition-colors"
        >
          {isRTL ? 'عرض الكل' : 'View All'}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-[#0a0a0f]/50 rounded-xl">
          <p className="text-2xl font-bold text-green-400">
            {stats?.winRate || 0}%
          </p>
          <p className="text-xs text-gray-400">
            {isRTL ? 'نسبة النجاح' : 'Win Rate'}
          </p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0f]/50 rounded-xl">
          <p className={`text-2xl font-bold ${(stats?.totalPips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats?.totalPips >= 0 ? '+' : ''}{stats?.totalPips || 0}
          </p>
          <p className="text-xs text-gray-400">
            {isRTL ? 'إجمالي النقاط' : 'Total Pips'}
          </p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0f]/50 rounded-xl">
          <p className="text-2xl font-bold text-[#d4af37]">
            {stats?.profitFactor || 0}
          </p>
          <p className="text-xs text-gray-400">
            {isRTL ? 'معامل الربح' : 'Profit Factor'}
          </p>
        </div>
      </div>

      {/* Recent Signals Preview */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-gray-400">
            {isRTL ? 'النظام نشط' : 'System Active'}
          </span>
        </div>
        <span className="text-gray-500">
          {isRTL ? 'تحديث كل 5 دقائق' : 'Updates every 5 min'}
        </span>
      </div>
    </div>
  );
}
