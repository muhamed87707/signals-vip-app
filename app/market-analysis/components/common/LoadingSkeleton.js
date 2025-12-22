'use client';

/**
 * LoadingSkeleton - Elegant loading states with gold shimmer effect
 * @param {string} type - Type of skeleton: 'text', 'card', 'chart', 'table', 'price'
 * @param {number} lines - Number of text lines (for type='text')
 * @param {number} rows - Number of table rows (for type='table')
 */
export default function LoadingSkeleton({ type = 'text', lines = 3, rows = 5 }) {
    const renderTextSkeleton = () => (
        <div className="skeleton-text">
            {Array.from({ length: lines }).map((_, i) => (
                <div 
                    key={i} 
                    className="skeleton-line"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );

    const renderCardSkeleton = () => (
        <div className="skeleton-card">
            <div className="skeleton-card-header">
                <div className="skeleton-icon" />
                <div className="skeleton-title" />
            </div>
            <div className="skeleton-card-body">
                <div className="skeleton-line" />
                <div className="skeleton-line" style={{ width: '80%' }} />
                <div className="skeleton-line" style={{ width: '60%' }} />
            </div>
        </div>
    );

    const renderChartSkeleton = () => (
        <div className="skeleton-chart">
            <div className="skeleton-chart-bars">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="skeleton-bar"
                        style={{ height: `${30 + Math.random() * 50}%` }}
                    />
                ))}
            </div>
            <div className="skeleton-chart-axis" />
        </div>
    );

    const renderTableSkeleton = () => (
        <div className="skeleton-table">
            <div className="skeleton-table-header">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-th" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton-table-row">
                    {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="skeleton-td" />
                    ))}
                </div>
            ))}
        </div>
    );

    const renderPriceSkeleton = () => (
        <div className="skeleton-price">
            <div className="skeleton-price-value" />
            <div className="skeleton-price-change" />
        </div>
    );

    const renderSkeleton = () => {
        switch (type) {
            case 'card': return renderCardSkeleton();
            case 'chart': return renderChartSkeleton();
            case 'table': return renderTableSkeleton();
            case 'price': return renderPriceSkeleton();
            default: return renderTextSkeleton();
        }
    };

    return (
        <div className="loading-skeleton">
            {renderSkeleton()}

            <style jsx>{`
                .loading-skeleton {
                    width: 100%;
                }

                /* Base shimmer animation */
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .skeleton-line,
                .skeleton-icon,
                .skeleton-title,
                .skeleton-bar,
                .skeleton-th,
                .skeleton-td,
                .skeleton-price-value,
                .skeleton-price-change,
                .skeleton-chart-axis {
                    background: linear-gradient(
                        90deg,
                        rgba(184, 134, 11, 0.08) 25%,
                        rgba(184, 134, 11, 0.15) 50%,
                        rgba(184, 134, 11, 0.08) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s ease-in-out infinite;
                    border-radius: 4px;
                }

                /* Text Skeleton */
                .skeleton-text {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .skeleton-line {
                    height: 14px;
                }

                /* Card Skeleton */
                .skeleton-card {
                    padding: 1rem;
                }

                .skeleton-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }

                .skeleton-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                }

                .skeleton-title {
                    height: 18px;
                    width: 120px;
                }

                .skeleton-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                /* Chart Skeleton */
                .skeleton-chart {
                    height: 200px;
                    display: flex;
                    flex-direction: column;
                }

                .skeleton-chart-bars {
                    flex: 1;
                    display: flex;
                    align-items: flex-end;
                    gap: 0.5rem;
                    padding: 1rem 0;
                }

                .skeleton-bar {
                    flex: 1;
                    min-height: 20px;
                    border-radius: 4px 4px 0 0;
                }

                .skeleton-chart-axis {
                    height: 2px;
                    width: 100%;
                }

                /* Table Skeleton */
                .skeleton-table {
                    width: 100%;
                }

                .skeleton-table-header {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.15);
                    margin-bottom: 0.5rem;
                }

                .skeleton-th {
                    flex: 1;
                    height: 16px;
                }

                .skeleton-table-row {
                    display: flex;
                    gap: 1rem;
                    padding: 0.6rem 0;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.05);
                }

                .skeleton-td {
                    flex: 1;
                    height: 14px;
                }

                /* Price Skeleton */
                .skeleton-price {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                }

                .skeleton-price-value {
                    height: 48px;
                    width: 180px;
                    border-radius: 8px;
                }

                .skeleton-price-change {
                    height: 24px;
                    width: 120px;
                }
            `}</style>
        </div>
    );
}
