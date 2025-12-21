'use client';

import { useState, useCallback } from 'react';
import ModuleCard from '../ModuleCard';
import Slider from './Slider';
import ResultDisplay from './ResultDisplay';

/**
 * ScenarioSimulator - Main container for scenario simulation
 * Requirements: 8.1, 8.2, 8.3
 */
export default function ScenarioSimulator() {
  const [scenario, setScenario] = useState({
    fedRateChange: 0,
    dxyChange: 0,
    inflationChange: 0,
    geopoliticalRisk: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/simulator/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, currentPrice: 2650 }),
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  }, [scenario]);

  const updateScenario = (key, value) => {
    setScenario(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    const presets = {
      dovish: { fedRateChange: -50, dxyChange: -2, inflationChange: 0.2, geopoliticalRisk: 0 },
      hawkish: { fedRateChange: 25, dxyChange: 1.5, inflationChange: -0.1, geopoliticalRisk: 0 },
      riskOff: { fedRateChange: 0, dxyChange: -1, inflationChange: 0, geopoliticalRisk: 80 },
    };
    if (presets[preset]) setScenario(presets[preset]);
  };

  return (
    <ModuleCard id="simulator" title="Scenario Simulator" icon="🎯">
      <div className="simulator-content">
        <div className="presets">
          <button onClick={() => applyPreset('dovish')}>Dovish Fed</button>
          <button onClick={() => applyPreset('hawkish')}>Hawkish Fed</button>
          <button onClick={() => applyPreset('riskOff')}>Risk-Off</button>
        </div>
        <div className="sliders">
          <Slider label="Fed Rate Change" value={scenario.fedRateChange} onChange={(v) => updateScenario('fedRateChange', v)} min={-100} max={100} step={25} unit="bps" marks={['-100', '0', '+100']} />
          <Slider label="DXY Change" value={scenario.dxyChange} onChange={(v) => updateScenario('dxyChange', v)} min={-5} max={5} step={0.5} unit=" pts" marks={['-5', '0', '+5']} />
          <Slider label="Inflation Change" value={scenario.inflationChange} onChange={(v) => updateScenario('inflationChange', v)} min={-1} max={1} step={0.1} unit="%" marks={['-1%', '0', '+1%']} />
          <Slider label="Geopolitical Risk" value={scenario.geopoliticalRisk} onChange={(v) => updateScenario('geopoliticalRisk', v)} min={0} max={100} step={10} marks={['Low', 'Med', 'High']} />
        </div>
        <button className="run-btn" onClick={runSimulation} disabled={loading}>
          {loading ? 'Calculating...' : 'Run Simulation'}
        </button>
        <ResultDisplay result={result} />
      </div>
      <style jsx>{`
        .simulator-content { display: flex; flex-direction: column; gap: 1rem; }
        .presets { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .presets button { padding: 0.4rem 0.8rem; background: var(--dash-bg-tertiary); border: 1px solid var(--dash-border); border-radius: 6px; color: var(--dash-text-secondary); cursor: pointer; font-size: 0.75rem; }
        .presets button:hover { border-color: var(--dash-gold-primary); }
        .sliders { display: flex; flex-direction: column; }
        .run-btn { padding: 0.75rem; background: var(--dash-gold-primary); border: none; border-radius: 8px; color: var(--dash-bg-primary); font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .run-btn:hover { opacity: 0.9; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </ModuleCard>
  );
}
