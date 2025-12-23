'use client';

import { useState } from 'react';

/**
 * Signal Card Component
 * Displays trading signal with entry, SL, TPs, and reasoning
 * Requirements: 17.2, 17.3, 17.4, 17.5, 17.6
 */
export default function SignalCard({ signal, lang = 'en', onViewDetails }) {
  const [expanded, setExpanded] = useState(false);

  const getDirectionColor = (direction) => 
    direction === 'long' ? 'text-green-400' : 'text-red-400';
  
  const getDirectionBg = (direction) => 
    direction === 'long' ? 'bg-green-600/20' : 'bg-red-600/20';
  
  const getDirectionIcon = (direction) => 
    direction === 'long' ? '📈' : '📉';

  const getQualityGradient = (quality) => {
    switch (quality) {
      case 'institutional': return 'from-yellow-400 to-yellow-600';
      case 'excellent': return 'from-green-400 to-green-600';
      case 'strong': return 'from-blue-400 to-blue-600';
      case 'good': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getQualityLabel = (quality) => {
    const labels = {
      institutional: { en: 'A+ Institutional 💎', ar: 'مؤسسي A+ 💎' },
      excellent: { en: 'Excellent ⭐⭐⭐⭐⭐', ar: 'ممتاز ⭐⭐⭐⭐⭐' },
      strong: { en: 'Strong ⭐⭐⭐⭐', ar: 'قوي ⭐⭐⭐⭐' },
      good: { en: 'Good ⭐⭐⭐', ar: 'جيد ⭐⭐⭐' },
    };
    return labels[quality]?.[lang] || quality;
  };

  const formatPrice = (price, symbol) => {
    if (!price) return '--';
    // Gold and indices have different decimal places
    const decimals = symbol?.includes('XAU') || symbol?.includes('US') ? 2 : 5;
    return price.toFixed(decimals);
  };

  const calculateRR = (entry, sl, tp) => {
    if (!entry || !sl || !tp) return '--';
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return (reward / risk).toFixed(1);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-blue-600/20 text-blue-400', label: lang === 'ar' ? 'نشط' : 'Active' },
      tp1_hit: { color: 'bg-green-600/20 text-green-400', label: 'TP1 ✓' },
      tp2_hit: { color: 'bg-green-600/20 text-green-400', label: 'TP2 ✓' },
      tp3_hit: { color: 'bg-green-600/20 text-green-400', label: 'TP3 ✓' },
      sl_hit: { color: 'bg-red-600/20 text-red-400', label: 'SL ✗' },
      expired: { color: 'bg-gray-600/20 text-gray-400', label: lang === 'ar' ? 'منتهي' : 'Expired' },
    };
    return badges[status] || badges.active;
  };

  const statusBadge = getStatusBadge(signal.status);

  return (
    <div className="bg-[#111] rounded-xl border border-yellow-600/10 hover:border-yellow-600/30 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-yellow-600/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${getDirectionBg(signal.direction)} flex items-center justify-center text-xl`}>
              {getDirectionIcon(signal.direction)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{signal.symbol}</span>
                <span className={`text-sm font-medium ${getDirectionColor(signal.direction)}`}>
                  {signal.direction?.toUpperCase()}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>
          
          {/* Confluence Score */}
          <div className="text-center">
            <div className={`text-2xl font-bold bg-gradient-to-r ${getQualityGradient(signal.quality)} bg-clip-text text-transparent`}>
              {signal.confluenceScore}
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
        </div>
      </div>

      {/* Price Levels */}
      <div className="p-4 space-y-3">
        {/* Entry */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{lang === 'ar' ? 'الدخول' : 'Entry'}</span>
          <span className="font-mono font-medium">{formatPrice(signal.entry, signal.symbol)}</span>
        </div>

        {/* Stop Loss */}
        <div className="flex items-center justify-between">
          <span className="text-red-400 text-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            {lang === 'ar' ? 'وقف الخسارة' : 'Stop Loss'}
          </span>
          <span className="font-mono text-red-400">{formatPrice(signal.stopLoss, signal.symbol)}</span>
        </div>

        {/* Take Profits */}
        <div className="space-y-2 pt-2 border-t border-yellow-600/5">
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              TP1 (50%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-green-400">{formatPrice(signal.takeProfit1, signal.symbol)}</span>
              <span className="text-xs text-gray-500">1:{calculateRR(signal.entry, signal.stopLoss, signal.takeProfit1)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              TP2 (30%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-green-400">{formatPrice(signal.takeProfit2, signal.symbol)}</span>
              <span className="text-xs text-gray-500">1:{calculateRR(signal.entry, signal.stopLoss, signal.takeProfit2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              TP3 (20%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-green-400">{formatPrice(signal.takeProfit3, signal.symbol)}</span>
              <span className="text-xs text-gray-500">1:{calculateRR(signal.entry, signal.stopLoss, signal.takeProfit3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Badge */}
      <div className={`px-4 py-2 bg-gradient-to-r ${getQualityGradient(signal.quality)} bg-opacity-10`}>
        <div className="text-center text-sm font-medium">
          {getQualityLabel(signal.quality)}
        </div>
      </div>

      {/* Expandable Reasoning */}
      {signal.reasoning && signal.reasoning.length > 0 && (
        <div className="border-t border-yellow-600/10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>{lang === 'ar' ? 'أسباب التوصية' : 'Signal Reasoning'}</span>
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {expanded && (
            <div className="px-4 pb-4 space-y-2">
              {signal.reasoning.map((reason, i) => (
                <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Details Button */}
      {onViewDetails && (
        <div className="p-4 border-t border-yellow-600/10">
          <button
            onClick={() => onViewDetails(signal)}
            className="w-full py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-600/30 transition-colors"
          >
            {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </button>
        </div>
      )}
    </div>
  );
}
