'use client';

/**
 * Validation Layers Component
 * Displays 10 validation layers status
 * Requirements: 17.7
 */
export default function ValidationLayers({ validation, lang = 'en' }) {
  if (!validation) return null;

  const layerNames = {
    1: { en: 'HTF Trend Alignment', ar: 'توافق الاتجاه العام' },
    2: { en: 'Market Structure (BOS/CHoCH)', ar: 'هيكل السوق' },
    3: { en: 'SMC Confluence', ar: 'تقاطع SMC' },
    4: { en: 'Wyckoff Phase', ar: 'مرحلة ويكوف' },
    5: { en: 'VSA Confirmation', ar: 'تأكيد VSA' },
    6: { en: 'Order Flow Direction', ar: 'اتجاه تدفق الأوامر' },
    7: { en: 'Technical Confluence', ar: 'التقاء فني' },
    8: { en: 'Intermarket Alignment', ar: 'توافق الأسواق' },
    9: { en: 'Kill Zone Timing', ar: 'توقيت Kill Zone' },
    10: { en: 'AI Confidence > 70%', ar: 'ثقة AI > 70%' },
  };

  const criticalLayers = [1, 2, 3, 10];

  const getLayerIcon = (layer) => {
    const icons = {
      1: '📊', 2: '🏗️', 3: '💰', 4: '📈', 5: '📉',
      6: '🔄', 7: '⚙️', 8: '🌐', 9: '⏰', 10: '🤖',
    };
    return icons[layer] || '•';
  };

  return (
    <div className="bg-[#111] rounded-xl border border-yellow-600/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-yellow-600/10 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          {lang === 'ar' ? 'طبقات التحقق (10)' : 'Validation Layers (10)'}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${
            validation.passed ? 'text-green-400' : 'text-red-400'
          }`}>
            {validation.passedLayers}
          </span>
          <span className="text-gray-400">/ 10</span>
        </div>
      </div>

      {/* Status Summary */}
      <div className={`px-4 py-3 ${
        validation.passed 
          ? 'bg-green-600/10 border-b border-green-600/20' 
          : 'bg-red-600/10 border-b border-red-600/20'
      }`}>
        <div className="flex items-center gap-2">
          <span className={validation.passed ? 'text-green-400' : 'text-red-400'}>
            {validation.passed ? '✓' : '✗'}
          </span>
          <span className={`text-sm ${validation.passed ? 'text-green-400' : 'text-red-400'}`}>
            {validation.passed 
              ? (lang === 'ar' ? 'جميع الشروط مستوفاة' : 'All conditions met')
              : (lang === 'ar' ? 'الشروط غير مستوفاة' : 'Conditions not met')
            }
          </span>
        </div>
        {validation.criticalLayersFailed?.length > 0 && (
          <div className="mt-2 text-xs text-red-400">
            {lang === 'ar' ? 'طبقات حرجة فاشلة: ' : 'Critical layers failed: '}
            {validation.criticalLayersFailed.join(', ')}
          </div>
        )}
      </div>

      {/* Layers List */}
      <div className="divide-y divide-yellow-600/5">
        {validation.layers?.map((layer, index) => {
          const layerNum = index + 1;
          const isCritical = criticalLayers.includes(layerNum);
          
          return (
            <div 
              key={layerNum}
              className={`px-4 py-3 flex items-center justify-between hover:bg-yellow-600/5 transition-colors ${
                isCritical ? 'bg-yellow-600/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getLayerIcon(layerNum)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {layerNames[layerNum]?.[lang] || layer.name}
                    </span>
                    {isCritical && (
                      <span className="px-1.5 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                        {lang === 'ar' ? 'حرج' : 'Critical'}
                      </span>
                    )}
                  </div>
                  {layer.reason && (
                    <p className="text-xs text-gray-500 mt-0.5">{layer.reason}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Score */}
                <span className={`text-sm font-medium ${
                  layer.score >= 70 ? 'text-green-400' :
                  layer.score >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {layer.score}%
                </span>
                
                {/* Pass/Fail Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  layer.passed 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {layer.passed ? '✓' : '✗'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-[#0a0a0a] border-t border-yellow-600/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              {lang === 'ar' ? 'طبقة حرجة' : 'Critical Layer'}
            </span>
            <span>
              {lang === 'ar' ? 'الحد الأدنى: 8/10 طبقات' : 'Minimum: 8/10 layers'}
            </span>
          </div>
          <span>
            {lang === 'ar' ? 'الطبقات الحرجة: 1, 2, 3, 10' : 'Critical: 1, 2, 3, 10'}
          </span>
        </div>
      </div>
    </div>
  );
}
