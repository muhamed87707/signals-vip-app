'use client';

export default function WatchList({ watchlist = [], language }) {
  const isRTL = language === 'ar';

  if (watchlist.length === 0) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
        <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
          {isRTL ? 'قائمة المراقبة' : 'Watch List'}
        </h3>
        <p className="text-gray-400 text-center py-4">
          {isRTL ? 'لا توجد فرص قيد المراقبة حالياً' : 'No opportunities being watched'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
      <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
        {isRTL ? 'قائمة المراقبة' : 'Watch List'}
        <span className="text-gray-400 text-sm font-normal ml-2">
          ({watchlist.length} {isRTL ? 'فرصة' : 'opportunities'})
        </span>
      </h3>

      <div className="space-y-3">
        {watchlist.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg hover:bg-[#0a0a0f]/80 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-white">{item.symbol}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                item.direction === 'BULLISH' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {item.direction === 'BULLISH' ? '↑' : '↓'} {item.direction}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-end">
                <p className="text-[#d4af37] font-bold">{item.score}%</p>
                <p className="text-gray-500 text-xs">{isRTL ? 'درجة التوافق' : 'Confluence'}</p>
              </div>
              
              <div className="w-16 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-[#d4af37] h-2 rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-xs mt-4 text-center">
        {isRTL 
          ? 'هذه الفرص قريبة من عتبة التوصية (70%) - راقبها للحصول على إشارات محتملة'
          : 'These opportunities are near the signal threshold (70%) - watch for potential signals'}
      </p>
    </div>
  );
}
