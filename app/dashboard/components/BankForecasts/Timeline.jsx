'use client';

/**
 * Timeline - Horizontal timeline of forecasts
 * Requirements: 2.4
 */
export default function Timeline({ forecasts }) {
  const sortedForecasts = [...(forecasts || [])].sort((a, b) => a.forecastPrice - b.forecastPrice);
  const minPrice = sortedForecasts[0]?.forecastPrice || 0;
  const maxPrice = sortedForecasts[sortedForecasts.length - 1]?.forecastPrice || 0;
  const range = maxPrice - minPrice || 1;

  return (
    <div className="timeline">
      <div className="timeline-header">
        <span className="timeline-label">Price Range</span>
        <span className="range-text">${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}</span>
      </div>
      <div className="timeline-track">
        {sortedForecasts.map((forecast, index) => {
          const position = ((forecast.forecastPrice - minPrice) / range) * 100;
          return (
            <div
              key={index}
              className="timeline-marker"
              style={{ left: `${Math.min(Math.max(position, 5), 95)}%` }}
              title={`${forecast.bankName}: $${forecast.forecastPrice.toLocaleString()}`}
            >
              <div className="marker-dot" />
              <div className="marker-label">{forecast.bankName?.split(' ')[0]}</div>
            </div>
          );
        })}
      </div>
      <div className="timeline-scale">
        <span>${minPrice.toLocaleString()}</span>
        <span>${maxPrice.toLocaleString()}</span>
      </div>
      <style jsx>{`
        .timeline {
          background: var(--dash-bg-tertiary);
          border-radius: 10px;
          padding: 1rem;
        }
        .timeline-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .timeline-label {
          font-size: 0.8rem;
          color: var(--dash-text-muted);
          text-transform: uppercase;
        }
        .range-text {
          font-size: 0.8rem;
          color: var(--dash-text-secondary);
        }
        .timeline-track {
          position: relative;
          height: 40px;
          background: var(--dash-bg-secondary);
          border-radius: 20px;
          margin-bottom: 0.5rem;
        }
        .timeline-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .marker-dot {
          width: 12px;
          height: 12px;
          background: var(--dash-gold-primary);
          border-radius: 50%;
          border: 2px solid var(--dash-bg-primary);
        }
        .marker-label {
          font-size: 0.65rem;
          color: var(--dash-text-muted);
          margin-top: 0.25rem;
          white-space: nowrap;
        }
        .timeline-scale {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--dash-text-muted);
        }
      `}</style>
    </div>
  );
}
