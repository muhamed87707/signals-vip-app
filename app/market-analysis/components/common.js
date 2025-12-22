// Common components for Market Analysis

// Loading Spinner Component
export function LoadingSpinner({ size = 'medium', color = 'gold' }) {
    const sizeMap = {
        small: '20px',
        medium: '40px',
        large: '60px'
    };
    
    return (
        <div className="loading-spinner" style={{ width: sizeMap[size], height: sizeMap[size] }}>
            <style jsx>{`
                .loading-spinner {
                    border: 3px solid rgba(184, 134, 11, 0.2);
                    border-top-color: var(--gold-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// Error Message Component
export function ErrorMessage({ message, onRetry, lang = 'en' }) {
    const retryText = lang === 'ar' ? 'إعادة المحاولة' : 'Retry';
    
    return (
        <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="retry-btn">
                    {retryText}
                </button>
            )}
            <style jsx>{`
                .error-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    color: var(--text-secondary);
                }
                .error-icon { font-size: 1.5rem; }
                .error-message p { margin: 0; text-align: center; }
                .retry-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(184, 134, 11, 0.2);
                    border: 1px solid var(--gold-primary);
                    border-radius: 6px;
                    color: var(--gold-medium);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .retry-btn:hover {
                    background: rgba(184, 134, 11, 0.3);
                }
            `}</style>
        </div>
    );
}

// Card Wrapper Component
export function Card({ children, className = '', title, icon, lang = 'en' }) {
    return (
        <div className={`ma-card ${className}`}>
            {(title || icon) && (
                <div className="ma-card-header">
                    {icon && <span className="ma-card-icon">{icon}</span>}
                    {title && <h3>{title}</h3>}
                </div>
            )}
            <div className="ma-card-content">
                {children}
            </div>
            <style jsx>{`
                .ma-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(184, 134, 11, 0.15);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }
                .ma-card:hover {
                    border-color: rgba(184, 134, 11, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
                }
                .ma-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                }
                .ma-card-icon { font-size: 1.5rem; }
                .ma-card-header h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--gold-medium);
                    margin: 0;
                }
                .ma-card-content { min-height: 100px; }
            `}</style>
        </div>
    );
}

// No Data Message Component
export function NoDataMessage({ lang = 'en', checkUrl, checkText }) {
    const t = {
        en: {
            noData: 'No data available',
            checkManually: 'Check manually'
        },
        ar: {
            noData: 'لا توجد بيانات متاحة',
            checkManually: 'تحقق يدوياً'
        }
    }[lang] || {};

    return (
        <div className="no-data-message">
            <span className="no-data-icon">📊</span>
            <p>{t.noData}</p>
            {checkUrl && (
                <a href={checkUrl} target="_blank" rel="noopener noreferrer" className="check-link">
                    {checkText || t.checkManually} ↗
                </a>
            )}
            <style jsx>{`
                .no-data-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 2rem;
                    color: var(--text-secondary);
                }
                .no-data-icon { font-size: 2rem; opacity: 0.5; }
                .no-data-message p { margin: 0; }
                .check-link {
                    color: var(--gold-medium);
                    text-decoration: none;
                    font-size: 0.85rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid rgba(184, 134, 11, 0.3);
                    border-radius: 6px;
                    transition: all 0.3s;
                }
                .check-link:hover {
                    background: rgba(184, 134, 11, 0.1);
                    border-color: var(--gold-primary);
                }
            `}</style>
        </div>
    );
}

// Badge Component
export function Badge({ children, variant = 'default', size = 'medium' }) {
    const variants = {
        default: { bg: 'rgba(184, 134, 11, 0.2)', color: 'var(--gold-medium)' },
        success: { bg: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' },
        danger: { bg: 'rgba(244, 67, 54, 0.2)', color: '#f44336' },
        warning: { bg: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' },
        info: { bg: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }
    };
    
    const sizeMap = {
        small: { padding: '0.15rem 0.4rem', fontSize: '0.65rem' },
        medium: { padding: '0.25rem 0.6rem', fontSize: '0.75rem' },
        large: { padding: '0.35rem 0.8rem', fontSize: '0.85rem' }
    };

    const style = variants[variant] || variants.default;
    const sizeStyle = sizeMap[size] || sizeMap.medium;

    return (
        <span 
            className="badge"
            style={{ 
                backgroundColor: style.bg, 
                color: style.color,
                padding: sizeStyle.padding,
                fontSize: sizeStyle.fontSize
            }}
        >
            {children}
            <style jsx>{`
                .badge {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 4px;
                    font-weight: 600;
                }
            `}</style>
        </span>
    );
}
