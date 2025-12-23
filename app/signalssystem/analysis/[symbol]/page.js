'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import ConfluenceBreakdown from '../../components/ConfluenceBreakdown';
import ValidationLayers from '../../components/ValidationLayers';
import SignalCard from '../../components/SignalCard';

/**
 * Full Analysis Page for a specific symbol
 * Requirements: 17.4
 */
export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, isRTL } = useLanguage();
  const symbol = params.symbol?.toUpperCase();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (symbol) {
      fetchAnalysis();
    }
  }, [symbol]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/signals-system/analysis/${symbol}`);
      const data = await res.json();
      if (data.success) {
        setAnalysis(data);
      } else {
        setError(data.error || 'Failed to fetch analysis');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSignal = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/signals-system/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, action: 'generate' }),
      });
      const data = await res.json();
      if (data.success && data.signal) {
        alert(lang === 'ar' ? 'تم إنشاء التوصية بنجاح!' : 'Signal generated successfully!');
        router.push('/signalssystem');
      } else {
        alert(data.reason || data.message || 'Could not generate signal');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const getBiasColor = (bias) => {
    if (bias === 'bullish' || bias === 'long') return 'text-green-400';
    if (bias === 'bearish' || bias === 'short') return 'text-red-400';
    return 'text-gray-400';
  };

  const getBiasIcon = (bias) => {
    if (bias === 'bullish' || bias === 'long') return '📈';
    if (bias === 'bearish' || bias === 'short') return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{lang === 'ar' ? 'جاري تحليل 10 طبقات...' : 'Analyzing 10 layers...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchAnalysis} className="px-6 py-2 bg-yellow-600 rounded-lg">
            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="bg-[#111] border-b border-yellow-600/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
              ← {lang === 'ar' ? 'رجوع' : 'Back'}
            </button>
            <h1 className="text-2xl font-bold">{symbol}</h1>
            {analysis?.analysis?.smc?.bias && (
              <span className={`px-3 py-1 rounded-full text-sm ${getBiasColor(analysis.analysis.smc.bias)} bg-opacity-20`}>
                {getBiasIcon(analysis.analysis.smc.bias)} {analysis.analysis.smc.bias}
              </span>
            )}
          </div>
          <button onClick={fetchAnalysis} className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm">
            🔄 {lang === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            icon="📊"
            label={lang === 'ar' ? 'درجة التقاء' : 'Confluence'}
            value={analysis?.confluence?.score || 0}
            suffix="/100"
            color={analysis?.confluence?.score >= 80 ? 'text-green-400' : 'text-yellow-400'}
          />
          <SummaryCard
            icon="✓"
            label={lang === 'ar' ? 'طبقات ناجحة' : 'Layers Passed'}
            value={analysis?.validation?.passedLayers || 0}
            suffix="/10"
            color={analysis?.validation?.passed ? 'text-green-400' : 'text-red-400'}
          />
          <SummaryCard
            icon="🤖"
            label={lang === 'ar' ? 'ثقة AI' : 'AI Confidence'}
            value={analysis?.analysis?.ai?.confidence || 0}
            suffix="%"
            color={analysis?.analysis?.ai?.confidence >= 70 ? 'text-green-400' : 'text-yellow-400'}
          />
          <SummaryCard
            icon={getBiasIcon(analysis?.analysis?.smc?.bias)}
            label={lang === 'ar' ? 'الاتجاه' : 'Bias'}
            value={analysis?.analysis?.smc?.bias || 'neutral'}
            color={getBiasColor(analysis?.analysis?.smc?.bias)}
          />
        </div>

        {/* Main Analysis Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ConfluenceBreakdown confluence={analysis?.confluence} lang={lang} />
          <ValidationLayers validation={analysis?.validation} lang={lang} />
        </div>

        {/* Analysis Details */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* SMC Analysis */}
          <AnalysisCard
            title={lang === 'ar' ? 'تحليل SMC' : 'SMC Analysis'}
            icon="💰"
            data={analysis?.analysis?.smc}
            items={[
              { label: 'Order Blocks', value: analysis?.analysis?.smc?.orderBlocks?.length || 0 },
              { label: 'FVGs', value: analysis?.analysis?.smc?.fvgs?.length || 0 },
              { label: 'Structure Breaks', value: analysis?.analysis?.smc?.structureBreaks?.length || 0 },
              { label: 'Bias', value: analysis?.analysis?.smc?.bias, color: getBiasColor(analysis?.analysis?.smc?.bias) },
            ]}
          />

          {/* Technical Analysis */}
          <AnalysisCard
            title={lang === 'ar' ? 'التحليل الفني' : 'Technical Analysis'}
            icon="📈"
            data={analysis?.analysis?.technical}
            items={[
              { label: 'Trend', value: analysis?.analysis?.technical?.trend?.direction },
              { label: 'RSI', value: analysis?.analysis?.technical?.momentum?.rsi?.toFixed(1) },
              { label: 'Patterns', value: analysis?.analysis?.technical?.patterns?.candlestick?.length || 0 },
              { label: 'Bias', value: analysis?.analysis?.technical?.bias, color: getBiasColor(analysis?.analysis?.technical?.bias) },
            ]}
          />

          {/* Wyckoff Analysis */}
          <AnalysisCard
            title={lang === 'ar' ? 'تحليل ويكوف' : 'Wyckoff Analysis'}
            icon="🏛️"
            data={analysis?.analysis?.wyckoff}
            items={[
              { label: 'Phase', value: analysis?.analysis?.wyckoff?.phase?.type },
              { label: 'Stage', value: analysis?.analysis?.wyckoff?.phase?.stage },
              { label: 'Probability', value: `${analysis?.analysis?.wyckoff?.phase?.probability || 0}%` },
              { label: 'Bias', value: analysis?.analysis?.wyckoff?.bias, color: getBiasColor(analysis?.analysis?.wyckoff?.bias) },
            ]}
          />

          {/* AI Analysis */}
          <AnalysisCard
            title={lang === 'ar' ? 'تحليل AI' : 'AI Analysis'}
            icon="🤖"
            data={analysis?.analysis?.ai}
            items={[
              { label: 'Confidence', value: `${analysis?.analysis?.ai?.confidence || 0}%` },
              { label: 'Direction', value: analysis?.analysis?.ai?.direction, color: getBiasColor(analysis?.analysis?.ai?.direction) },
              { label: 'Regime', value: analysis?.analysis?.ai?.regime },
              { label: 'Win Prob', value: `${analysis?.analysis?.ai?.winProbability || 0}%` },
            ]}
          />

          {/* Fundamental Analysis */}
          <AnalysisCard
            title={lang === 'ar' ? 'التحليل الأساسي' : 'Fundamental Analysis'}
            icon="📰"
            data={analysis?.analysis?.fundamental}
            items={[
              { label: 'News Blackout', value: analysis?.analysis?.fundamental?.newsBlackout ? 'Yes ⚠️' : 'No ✓' },
              { label: 'Bias', value: analysis?.analysis?.fundamental?.bias },
              { label: 'Impact Events', value: analysis?.analysis?.fundamental?.upcomingNews?.length || 0 },
            ]}
          />

          {/* Sentiment Analysis */}
          <AnalysisCard
            title={lang === 'ar' ? 'تحليل المشاعر' : 'Sentiment Analysis'}
            icon="💭"
            data={analysis?.analysis?.sentiment}
            items={[
              { label: 'Score', value: analysis?.analysis?.sentiment?.score },
              { label: 'Retail Position', value: `${analysis?.analysis?.sentiment?.retailPosition || 0}%` },
              { label: 'Contrarian', value: analysis?.analysis?.sentiment?.contrarian ? 'Yes' : 'No' },
            ]}
          />
        </div>

        {/* Generate Signal Button */}
        {analysis?.validation?.passed && analysis?.confluence?.score >= 80 && (
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 rounded-xl p-6 border border-yellow-600/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-yellow-400">
                  {lang === 'ar' ? '✨ شروط التوصية مستوفاة!' : '✨ Signal conditions met!'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {lang === 'ar' 
                    ? 'جميع الشروط مستوفاة لإنشاء توصية عالية الجودة'
                    : 'All conditions are met to generate a high-quality signal'}
                </p>
              </div>
              <button
                onClick={generateSignal}
                disabled={generating}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg font-bold text-black hover:opacity-90 disabled:opacity-50"
              >
                {generating 
                  ? (lang === 'ar' ? '⏳ جاري الإنشاء...' : '⏳ Generating...')
                  : (lang === 'ar' ? '🚀 إنشاء توصية' : '🚀 Generate Signal')
                }
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value, suffix, color }) {
  return (
    <div className="bg-[#111] rounded-xl p-4 border border-yellow-600/10">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color || 'text-white'}`}>
        {value}{suffix}
      </div>
    </div>
  );
}

function AnalysisCard({ title, icon, items }) {
  return (
    <div className="bg-[#111] rounded-xl p-4 border border-yellow-600/10">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{item.label}</span>
            <span className={item.color || 'text-white'}>{item.value || '--'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
