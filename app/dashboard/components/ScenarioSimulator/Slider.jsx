'use client';

/**
 * Slider - Rate adjustment slider component
 * Requirements: 8.1
 */
export default function Slider({ label, value, onChange, min, max, step = 1, unit = '', marks = [] }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-container">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value > 0 ? '+' : ''}{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input"
        style={{ background: `linear-gradient(to right, var(--dash-gold-primary) 0%, var(--dash-gold-primary) ${percentage}%, var(--dash-bg-tertiary) ${percentage}%, var(--dash-bg-tertiary) 100%)` }}
      />
      {marks.length > 0 && (
        <div className="slider-marks">
          {marks.map((mark, i) => (
            <span key={i} className="mark">{mark}</span>
          ))}
        </div>
      )}
      <style jsx>{`
        .slider-container { margin-bottom: 1rem; }
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .slider-label { font-size: 0.85rem; color: var(--dash-text-secondary); }
        .slider-value { font-family: 'SF Mono', monospace; font-size: 0.85rem; color: var(--dash-gold-primary); font-weight: 600; }
        .slider-input { width: 100%; height: 6px; border-radius: 3px; appearance: none; cursor: pointer; }
        .slider-input::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--dash-gold-primary); cursor: pointer; }
        .slider-marks { display: flex; justify-content: space-between; margin-top: 0.25rem; }
        .mark { font-size: 0.7rem; color: var(--dash-text-muted); }
      `}</style>
    </div>
  );
}
