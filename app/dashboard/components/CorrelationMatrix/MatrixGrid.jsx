'use client';

/**
 * MatrixGrid - Heat map grid for correlation matrix
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export default function MatrixGrid({ matrix, assets, assetInfo }) {
  if (!matrix || !assets || assets.length === 0) {
    return <div className="no-data">No correlation data available</div>;
  }

  const getAssetLabel = (assetId) => {
    const info = assetInfo?.find(a => a.id === assetId);
    return info ? `${info.symbol} ${info.name}` : assetId;
  };

  const getShortLabel = (assetId) => {
    const info = assetInfo?.find(a => a.id === assetId);
    return info?.symbol || assetId.slice(0, 3);
  };

  return (
    <div className="matrix-container">
      <div className="matrix-grid" style={{ gridTemplateColumns: `80px repeat(${assets.length}, 1fr)` }}>
        {/* Header row */}
        <div className="matrix-cell header corner"></div>
        {assets.map(asset => (
          <div key={`h-${asset}`} className="matrix-cell header" title={getAssetLabel(asset)}>
            {getShortLabel(asset)}
          </div>
        ))}

        {/* Data rows */}
        {assets.map(rowAsset => (
          <>
            <div key={`r-${rowAsset}`} className="matrix-cell header row-header" title={getAssetLabel(rowAsset)}>
              {getShortLabel(rowAsset)}
            </div>
            {assets.map(colAsset => {
              const cell = matrix[rowAsset]?.[colAsset];
              if (!cell) return <div key={`${rowAsset}-${colAsset}`} className="matrix-cell">-</div>;
              
              return (
                <div
                  key={`${rowAsset}-${colAsset}`}
                  className={`matrix-cell ${cell.hasSignificantChange ? 'changed' : ''}`}
                  style={{ backgroundColor: cell.color }}
                  title={`${rowAsset} vs ${colAsset}: ${cell.value?.toFixed(2)}`}
                >
                  <span className="cell-value">{cell.value?.toFixed(2)}</span>
                  {cell.hasSignificantChange && (
                    <span className={`change-indicator ${cell.change > 0 ? 'up' : 'down'}`}>
                      {cell.change > 0 ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      <style jsx>{`
        .matrix-container { overflow-x: auto; }
        .matrix-grid {
          display: grid;
          gap: 2px;
          min-width: 400px;
        }
        .matrix-cell {
          padding: 0.5rem;
          text-align: center;
          font-size: 0.75rem;
          font-family: 'SF Mono', monospace;
          border-radius: 4px;
          position: relative;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .matrix-cell.header {
          background: var(--dash-bg-tertiary);
          font-weight: 600;
          color: var(--dash-text-secondary);
        }
        .matrix-cell.corner { background: transparent; }
        .matrix-cell.row-header { justify-content: flex-end; padding-right: 0.75rem; }
        .matrix-cell.changed { animation: pulse 2s infinite; box-shadow: 0 0 8px var(--dash-gold-primary); }
        .cell-value { color: var(--dash-text-primary); font-weight: 500; }
        .change-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 0.6rem;
        }
        .change-indicator.up { color: var(--dash-neon-green); }
        .change-indicator.down { color: var(--dash-neon-red); }
        .no-data { text-align: center; padding: 2rem; color: var(--dash-text-muted); }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
