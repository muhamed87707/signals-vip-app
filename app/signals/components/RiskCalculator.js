'use client';

import { useState, useEffect } from 'react';

export default function RiskCalculator({ language }) {
  const isRTL = language === 'ar';

  const [inputs, setInputs] = useState({
    accountBalance: 10000,
    riskPercent: 1,
    entryPrice: '',
    stopLoss: '',
    symbol: 'EURUSD'
  });

  const [results, setResults] = useState(null);

  const pipSizes = {
    'EURUSD': 0.0001,
    'GBPUSD': 0.0001,
    'USDJPY': 0.01,
    'USDCHF': 0.0001,
    'AUDUSD': 0.0001,
    'NZDUSD': 0.0001,
    'USDCAD': 0.0001,
    'XAUUSD': 0.1,
    'XAGUSD': 0.01,
    'US30': 1,
    'US100': 1,
    'US500': 1
  };

  const pipValues = {
    'EURUSD': 10,
    'GBPUSD': 10,
    'USDJPY': 9.1,
    'USDCHF': 10.2,
    'AUDUSD': 10,
    'NZDUSD': 10,
    'USDCAD': 7.5,
    'XAUUSD': 1,
    'XAGUSD': 0.5,
    'US30': 1,
    'US100': 1,
    'US500': 1
  };

  useEffect(() => {
    calculate();
  }, [inputs]);

  const calculate = () => {
    const { accountBalance, riskPercent, entryPrice, stopLoss, symbol } = inputs;

    if (!entryPrice || !stopLoss) {
      setResults(null);
      return;
    }

    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const pipSize = pipSizes[symbol] || 0.0001;
    const pipValue = pipValues[symbol] || 10;

    // Calculate risk amount
    const riskAmount = accountBalance * (riskPercent / 100);

    // Calculate SL distance in pips
    const slDistance = Math.abs(entry - sl);
    const slPips = slDistance / pipSize;

    // Calculate lot size
    const lotSize = riskAmount / (slPips * pipValue);

    // Calculate take profits (1:2, 1:3, 1:5)
    const direction = entry > sl ? 'BUY' : 'SELL';
    const tp1 = direction === 'BUY' ? entry + (slDistance * 2) : entry - (slDistance * 2);
    const tp2 = direction === 'BUY' ? entry + (slDistance * 3) : entry - (slDistance * 3);
    const tp3 = direction === 'BUY' ? entry + (slDistance * 5) : entry - (slDistance * 5);

    setResults({
      riskAmount: riskAmount.toFixed(2),
      slPips: slPips.toFixed(1),
      lotSize: Math.max(0.01, lotSize).toFixed(2),
      direction,
      tp1: tp1.toFixed(5),
      tp2: tp2.toFixed(5),
      tp3: tp3.toFixed(5),
      potentialProfit1: (slPips * 2 * pipValue * lotSize).toFixed(2),
      potentialProfit2: (slPips * 3 * pipValue * lotSize).toFixed(2),
      potentialProfit3: (slPips * 5 * pipValue * lotSize).toFixed(2)
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
        <h2 className="text-xl font-semibold text-[#d4af37] mb-6">
          {isRTL ? 'حاسبة حجم الصفقة' : 'Position Size Calculator'}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {isRTL ? 'الرمز' : 'Symbol'}
              </label>
              <select
                value={inputs.symbol}
                onChange={(e) => setInputs({ ...inputs, symbol: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
              >
                <optgroup label={isRTL ? 'الفوركس' : 'Forex'}>
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="USDJPY">USDJPY</option>
                  <option value="USDCHF">USDCHF</option>
                  <option value="AUDUSD">AUDUSD</option>
                  <option value="NZDUSD">NZDUSD</option>
                  <option value="USDCAD">USDCAD</option>
                </optgroup>
                <optgroup label={isRTL ? 'المعادن' : 'Metals'}>
                  <option value="XAUUSD">XAUUSD (Gold)</option>
                  <option value="XAGUSD">XAGUSD (Silver)</option>
                </optgroup>
                <optgroup label={isRTL ? 'المؤشرات' : 'Indices'}>
                  <option value="US30">US30 (Dow)</option>
                  <option value="US100">US100 (Nasdaq)</option>
                  <option value="US500">US500 (S&P)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {isRTL ? 'رأس المال ($)' : 'Account Balance ($)'}
              </label>
              <input
                type="number"
                value={inputs.accountBalance}
                onChange={(e) => setInputs({ ...inputs, accountBalance: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {isRTL ? 'نسبة المخاطرة (%)' : 'Risk Percent (%)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={inputs.riskPercent}
                onChange={(e) => setInputs({ ...inputs, riskPercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {isRTL ? 'سعر الدخول' : 'Entry Price'}
              </label>
              <input
                type="number"
                step="0.00001"
                value={inputs.entryPrice}
                onChange={(e) => setInputs({ ...inputs, entryPrice: e.target.value })}
                placeholder="1.08500"
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {isRTL ? 'وقف الخسارة' : 'Stop Loss'}
              </label>
              <input
                type="number"
                step="0.00001"
                value={inputs.stopLoss}
                onChange={(e) => setInputs({ ...inputs, stopLoss: e.target.value })}
                placeholder="1.08200"
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {results ? (
              <>
                <div className="bg-[#0a0a0f] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">{isRTL ? 'الاتجاه' : 'Direction'}</p>
                  <p className={`text-2xl font-bold ${results.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                    {results.direction === 'BUY' ? '↑ BUY' : '↓ SELL'}
                  </p>
                </div>

                <div className="bg-[#0a0a0f] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">{isRTL ? 'حجم الصفقة' : 'Lot Size'}</p>
                  <p className="text-2xl font-bold text-[#d4af37]">{results.lotSize} lots</p>
                </div>

                <div className="bg-[#0a0a0f] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">{isRTL ? 'مبلغ المخاطرة' : 'Risk Amount'}</p>
                  <p className="text-xl font-bold text-red-400">${results.riskAmount}</p>
                  <p className="text-gray-500 text-xs">{results.slPips} pips</p>
                </div>

                <div className="bg-[#0a0a0f] rounded-lg p-4 space-y-2">
                  <p className="text-gray-400 text-sm mb-2">{isRTL ? 'أهداف الربح' : 'Take Profits'}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TP1 (1:2)</span>
                    <div className="text-end">
                      <span className="text-green-400 font-mono">{results.tp1}</span>
                      <span className="text-gray-500 text-xs block">+${results.potentialProfit1}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TP2 (1:3)</span>
                    <div className="text-end">
                      <span className="text-green-400 font-mono">{results.tp2}</span>
                      <span className="text-gray-500 text-xs block">+${results.potentialProfit2}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TP3 (1:5)</span>
                    <div className="text-end">
                      <span className="text-green-400 font-mono">{results.tp3}</span>
                      <span className="text-gray-500 text-xs block">+${results.potentialProfit3}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#0a0a0f] rounded-lg p-8 text-center">
                <p className="text-gray-400">
                  {isRTL 
                    ? 'أدخل سعر الدخول ووقف الخسارة لحساب حجم الصفقة'
                    : 'Enter entry price and stop loss to calculate position size'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-[#1a1a2e] rounded-xl p-6 border border-[#d4af37]/20">
        <h3 className="text-lg font-semibold text-[#d4af37] mb-4">
          {isRTL ? 'نصائح إدارة المخاطر' : 'Risk Management Tips'}
        </h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li>• {isRTL ? 'لا تخاطر بأكثر من 1-2% من رأس المال في صفقة واحدة' : 'Never risk more than 1-2% of your account on a single trade'}</li>
          <li>• {isRTL ? 'استخدم دائماً وقف خسارة' : 'Always use a stop loss'}</li>
          <li>• {isRTL ? 'الحد الأدنى لنسبة المخاطرة/العائد هو 1:2' : 'Minimum risk/reward ratio should be 1:2'}</li>
          <li>• {isRTL ? 'لا تفتح أكثر من 3-5 صفقات في نفس الوقت' : 'Don\'t open more than 3-5 trades at the same time'}</li>
          <li>• {isRTL ? 'توقف عن التداول إذا خسرت 3% من رأس المال في يوم واحد' : 'Stop trading if you lose 3% of your account in one day'}</li>
        </ul>
      </div>
    </div>
  );
}
