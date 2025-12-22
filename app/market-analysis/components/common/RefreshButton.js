'use client';

/**
 * RefreshButton - Manual refresh button with loading state
 * @param {function} onClick - Click handler
 * @param {boolean} loading - Loading state
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} variant - Variant: 'icon', 'text', 'full'
 * @param {string} label - Button label (for text/full variants)
 */
export default function RefreshButton({ 
    onClick, 
    loading = false, 
    size = 'md',
    variant = 'icon',
    label = 'Refresh'
}) {
    const sizeConfig = {
        sm: { iconSize: 14, padding: '0.3rem', fontSize: '0.75rem' },
        md: { iconSize: 18, padding: '0.5rem', fontSize: '0.85rem' },
        lg: { iconSize: 22, padding: '0.6rem', fontSize: '0.95rem' }
    };

    const config = sizeConfig[size] || sizeConfig.md;

    const RefreshIcon = () => (
        <svg 
            width={config.iconSize} 
            height={config.iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={`refresh-icon ${loading ? 'spinning' : ''}`}
        >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
    );

    return (
        <button 
            className={`refresh-button ${variant}`}
            onClick={onClick}
            disabled={loading}
            title={label}
            style={{ 
                padding: variant === 'icon' ? config.padding : `${config.padding} 1rem`,
                fontSize: config.fontSize
            }}
        >
            <RefreshIcon />
            {(variant === 'text' || variant === 'full') && (
                <span className="refresh-label">{loading ? 'Loading...' : label}</span>
            )}

            <style jsx>{`
                .refresh-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    background: transparent;
                    border: 1px solid rgba(184, 134, 11, 0.25);
                    border-radius: 8px;
                    color: var(--gold-medium);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }

                .refresh-button:hover:not(:disabled) {
                    background: rgba(184, 134, 11, 0.1);
                    border-color: var(--gold-primary);
                    color: var(--gold-bright);
                }

                .refresh-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .refresh-button.full {
                    background: rgba(184, 134, 11, 0.1);
                }

                .refresh-button.full:hover:not(:disabled) {
                    background: rgba(184, 134, 11, 0.2);
                }

                :global(.refresh-icon) {
                    flex-shrink: 0;
                }

                :global(.refresh-icon.spinning) {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .refresh-label {
                    white-space: nowrap;
                }
            `}</style>
        </button>
    );
}
