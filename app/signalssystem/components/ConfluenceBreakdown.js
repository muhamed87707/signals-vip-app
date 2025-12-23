'use client';

/**
 * Confluence Breakdown Component
 * Displays component scores with visual chart
 * Requirements: 17.4
 */
export default function ConfluenceBreakdown({ confluence, lang = 'en' }) {
  if (!confluence) return null;

  const components = [
    { key: 'smc', label: { en: 'SMC Analysis', ar: 'تحليل SMC' }, weight: 20, color: '#FFD700' },
    { key: 'structure', label: { en: 'Market Structure', ar: 'هيكل السوق' }, weight: 15, color: '#4ADE80' },
    { key: 'wyckoff', label: { en: 'Wyckoff', ar: 'ويكوف' }, weight: 10, color: '#60A5FA' },
    { key: 'vsa', label: { en: 'VSA', ar: 'VSA' }, weight: 10, color: '#A78BFA' },
    { key: 'orderFlow', label: { en: 'Order Flow', ar: 'تدفق الأوامر' }, weight: 10, color: '#F472B6' },
    { key: 'technical', label: { en: 'Technical', ar: 'فني' }, weight: 10, color: '#FB923C' },
    { key: 'intermarket', label: { en: 'Intermarket', ar: 'بين الأسواق' }, weight: 5, color: '#38BDF8' },
    { key: 'fundamental', label: { en: 'Fundamental', ar: 'أساسي' }, weight: 5, color: '#34D399' },
    { key: 'sentiment', label: { en: 'Sentiment', ar: 'المشاعر' }, weight: 5, color: '#E879F9' },
    { key: 'ai', label: { en: 'AI Analysis', ar: 'تحليل AI' }, weight: 10, color: '#FBBF24' },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityInfo = (score) => {
    if (score >= 95) return { label: lang === 'ar' ? 'مؤسسي A+' : 'A+ Institutional', color: 'text-yellow-400', icon: '💎' };
    if (score >= 90) return { label: lang === 'ar' ? 'ممتاز' : 'Excellent', color: 'text-green-400', icon: '⭐⭐⭐⭐⭐' };
    if (score >= 85) return { label: lang === 'ar' ? 'قوي' : 'Strong', color: 'text-blue-400', icon: '⭐⭐⭐⭐' };
    if (score >= 80) return { label: lang === 'ar' ? 'جيد' : 'Good', color: 'text-purple-400', icon: '⭐⭐⭐' };
    return { label: lang === 'ar' ? 'ضعيف' : 'Weak', color: 'text-gray-400', icon: '⭐' };
  };

  const qualityInfo = getQualityInfo(confluence.score);

  return (
    <div className="bg-[#111] rounded-xl border border-yellow-600/10 overflow-hidden">
      {/* Header with Total Score */}
      <div className="p-6 border-b border-yellow-600/10 bg-gradient-to-r from-yellow-600/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {lang === 'ar' ? 'درجة التقاء المؤشرات' : 'Confluence Score'}
            </h3>
            <div className={`text-sm ${qualityInfo.color}`}>
              {qualityInfo.icon} {qualityInfo.label}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(confluence.score)}`}>
              {confluence.score}
            </div>
            <div className="text-sm text-gray-400">/ 100</div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-4">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${confluence.score}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0</span>
            <span className="text-yellow-400">80 (Min)</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-400 mb-4">
          {lang === 'ar' ? 'تفصيل المكونات' : 'Component Breakdown'}
        </h4>
        
        <div className="space-y-3">
          {components.map((comp) => {
            const score = confluence.components?.[comp.key] || 0;
            const weightedScore = (score * comp.weight) / 100;
            
            return (
              <div key={comp.key} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: comp.color }}
                    />
                    <span className="text-sm text-gray-300">{comp.label[lang]}</span>
                    <span className="text-xs text-gray-500">({comp.weight}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                      {score}
                    </span>
                    <span className="text-xs text-gray-500">
                      (+{weightedScore.toFixed(1)})
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 group-hover:opacity-80"
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: comp.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kill Zone Penalty Warning */}
      {confluence.killZonePenalty && (
        <div className="px-6 py-3 bg-red-600/10 border-t border-red-600/20">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>⚠️</span>
            <span>
              {lang === 'ar' 
                ? 'تم خصم 15 نقطة (خارج Kill Zone)'
                : '-15 points (Outside Kill Zone)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
