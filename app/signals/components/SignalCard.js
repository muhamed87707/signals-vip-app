'use client';

import { useState } from 'react';

export default function SignalCard({ signal, language }) {
  const [expanded, setExpanded] = useState(false);
  const isRTL = language === 'ar';

  const getDirectionColor = (direction) => {
    return direction === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getGradeColor = (grade) => {
    return grade === 'A+' ? 'bg-[#d4af37] text-black' : 'bg-blue-500 text-white';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400';
      case 'TP1_HIT':
      case 'TP2_HIT':
      case 'TP3_HIT': return 'bg-green-500/20 text-green-400';
      case 'STOPPED_OUT': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return typeof price === 'object' ? price.price?.toFixed(5) : price.toFixed(5);
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl border border-[#d4af37]/20 overflow-hidden hover:border-[#d4af37]/40 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-[#d4af37]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">{signal.symbol}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(signal.grade)}`}>
              {signal.grade}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(signal.status)}`}>
              {signal.status}
            </span>
          </div>
          <span className={`text-2xl font-bold ${getDirectionColor(signal.direction)}`}>
            {signal.direction === 'BUY' ? '↑ BUY' : '↓ SELL'}
          </span>
        </div>

        {/* Confluence Score */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">{isRTL ? 'درجة التوافق' : 'Confluence Score'}</span>
            <span className="text-[#d4af37] font-bold">{signal.confluenceScore}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#d4af37] to-[#f4cf57] h-2 rounded-full transition-all"
              style={{ width: `${signal.confluenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Price Levels */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-xs mb-1">{isRTL ? 'الدخول' : 'Entry'}</p>
          <p className="text-white font-mono">{formatPrice(signal.entry)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">{isRTL ? 'وقف الخسارة' : 'Stop Loss'}</p>
          <p className="text-red-400 font-mono">{formatPrice(signal.stopLoss)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">TP1</p>
          <p className="text-green-400 font-mono">{formatPrice(signal.takeProfit1)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">TP2</p>
          <p className="text-green-400 font-mono">{formatPrice(signal.takeProfit2)}</p>
        </div>
        {signal.takeProfit3 && (
          <div>
            <p className="text-gray-400 text-xs mb-1">TP3</p>
            <p className="text-green-400 font-mono">{formatPrice(signal.takeProfit3)}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400 text-xs mb-1">{isRTL ? 'نسبة R:R' : 'R:R Ratio'}</p>
          <p className="text-[#d4af37] font-bold">1:{signal.riskRewardRatio}</p>
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 text-center text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors text-sm"
      >
        {expanded 
          ? (isRTL ? 'إخفاء التفاصيل ▲' : 'Hide Details ▲')
          : (isRTL ? 'عرض التفاصيل ▼' : 'Show Details ▼')}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-[#d4af37]/10 space-y-4">
          {/* AI Reasoning */}
          {signal.aiAnalysis?.reasoning && (
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">
                {isRTL ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
              </h4>
              <p className="text-gray-300 text-sm">
                {signal.aiAnalysis.reasoning[language] || signal.aiAnalysis.reasoning.en}
              </p>
            </div>
          )}

          {/* Key Factors */}
          {signal.aiAnalysis?.keyFactors?.length > 0 && (
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">
                {isRTL ? 'العوامل الرئيسية' : 'Key Factors'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {signal.aiAnalysis.keyFactors.map((factor, i) => (
                  <span 
                    key={i}
                    className={`px-2 py-1 rounded text-xs ${
                      factor.impact === 'BULLISH' ? 'bg-green-500/20 text-green-400' :
                      factor.impact === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {factor.factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {signal.aiAnalysis?.risks && (
            <div>
              <h4 className="text-red-400 font-semibold mb-2">
                {isRTL ? 'المخاطر' : 'Risks'}
              </h4>
              <p className="text-gray-300 text-sm">
                {signal.aiAnalysis.risks[language] || signal.aiAnalysis.risks.en}
              </p>
            </div>
          )}

          {/* Invalidation */}
          {signal.aiAnalysis?.invalidation && (
            <div>
              <h4 className="text-orange-400 font-semibold mb-2">
                {isRTL ? 'شروط الإبطال' : 'Invalidation'}
              </h4>
              <p className="text-gray-300 text-sm">
                {signal.aiAnalysis.invalidation[language] || signal.aiAnalysis.invalidation.en}
              </p>
            </div>
          )}

          {/* Confluence Breakdown */}
          {signal.confluenceBreakdown?.length > 0 && (
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">
                {isRTL ? 'تفصيل التوافق' : 'Confluence Breakdown'}
              </h4>
              <div className="space-y-2">
                {signal.confluenceBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{item.icon} {item.component}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-[#d4af37] h-1.5 rounded-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-white text-sm w-8">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-gray-500 text-xs pt-2 border-t border-gray-700">
            {isRTL ? 'تم الإنشاء: ' : 'Created: '}
            {new Date(signal.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
          </div>
        </div>
      )}
    </div>
  );
}
