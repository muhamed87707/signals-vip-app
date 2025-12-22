'use client';

export default function ActiveSignals({ signals, language }) {
  const isRTL = language === 'ar';

  if (signals.length === 0) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-8 text-center border border-[#d4af37]/20">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-400 text-lg">
          {isRTL ? 'لا توجد توصيات نشطة حالياً' : 'No active signals at the moment'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {isRTL 
            ? 'سيتم عرض التوصيات النشطة هنا عند توليدها'
            : 'Active signals will appear here when generated'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#d4af37]">
          {isRTL ? 'التوصيات النشطة' : 'Active Signals'}
        </h2>
        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
          {signals.length} {isRTL ? 'نشطة' : 'Active'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="text-start py-3 px-4">{isRTL ? 'الرمز' : 'Symbol'}</th>
              <th className="text-start py-3 px-4">{isRTL ? 'الاتجاه' : 'Direction'}</th>
              <th className="text-start py-3 px-4">{isRTL ? 'الدرجة' : 'Grade'}</th>
              <th className="text-start py-3 px-4">{isRTL ? 'الدخول' : 'Entry'}</th>
              <th className="text-start py-3 px-4">{isRTL ? 'وقف الخسارة' : 'SL'}</th>
              <th className="text-start py-3 px-4">TP1</th>
              <th className="text-start py-3 px-4">{isRTL ? 'الربح/الخسارة' : 'P/L'}</th>
              <th className="text-start py-3 px-4">{isRTL ? 'الوقت' : 'Time'}</th>
            </tr>
          </thead>
          <tbody>
            {signals.map(signal => (
              <tr 
                key={signal._id} 
                className="border-b border-gray-800 hover:bg-[#1a1a2e]/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="font-bold text-white">{signal.symbol}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-bold ${signal.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.direction === 'BUY' ? '↑ BUY' : '↓ SELL'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    signal.grade === 'A+' ? 'bg-[#d4af37] text-black' : 'bg-blue-500 text-white'
                  }`}>
                    {signal.grade}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-white">
                  {typeof signal.entry === 'object' ? signal.entry.price?.toFixed(5) : signal.entry?.toFixed(5)}
                </td>
                <td className="py-4 px-4 font-mono text-red-400">
                  {signal.stopLoss?.toFixed(5)}
                </td>
                <td className="py-4 px-4 font-mono text-green-400">
                  {signal.takeProfit1?.toFixed(5)}
                </td>
                <td className="py-4 px-4">
                  <span className={`font-bold ${(signal.currentPips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.currentPips || 0} pips
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-400 text-sm">
                  {new Date(signal.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
