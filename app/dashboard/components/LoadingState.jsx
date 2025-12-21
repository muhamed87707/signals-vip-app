'use client';

/**
 * LoadingState - Loading indicator component for dashboard modules
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.variant - Style variant: 'spinner', 'pulse', 'skeleton'
 */
export default function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'spinner'
}) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  if (variant === 'skeleton') {
    return (
      <div className={`loading-skeleton ${sizeClasses[size]}`}>
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`loading-pulse ${sizeClasses[size]}`}>
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
        {message && <span className="loading-message">{message}</span>}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={`loading-spinner ${sizeClasses[size]}`}>
      <div className="spinner">
        <svg viewBox="0 0 50 50">
          <circle 
            cx="25" 
            cy="25" 
            r="20" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {message && <span className="loading-message">{message}</span>}
    </div>
  );
}

/**
 * LoadingSkeleton - Skeleton loader for specific content types
 */
export function LoadingSkeleton({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'stat':
        return (
          <div className="skeleton-stat">
            <div className="skeleton-line skeleton-icon"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-label"></div>
              <div className="skeleton-line skeleton-value"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="skeleton-list-item">
            <div className="skeleton-line skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-text"></div>
              <div className="skeleton-line skeleton-text short"></div>
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="skeleton-chart">
            <div className="skeleton-bars">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="skeleton-bar" 
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                ></div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-text"></div>
            <div className="skeleton-line skeleton-text"></div>
            <div className="skeleton-line skeleton-text short"></div>
          </div>
        );
    }
  };

  return (
    <div className="skeleton-container">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
