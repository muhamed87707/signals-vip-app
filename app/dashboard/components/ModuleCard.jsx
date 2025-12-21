'use client';

import { useState } from 'react';

/**
 * ModuleCard - Collapsible card wrapper for dashboard modules
 * @param {Object} props
 * @param {string} props.id - Module ID for anchor linking
 * @param {string} props.title - Module title
 * @param {React.ReactNode} props.icon - Module icon (emoji or component)
 * @param {React.ReactNode} props.children - Module content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.defaultCollapsed - Initial collapsed state
 * @param {React.ReactNode} props.badge - Optional badge element
 * @param {React.ReactNode} props.headerActions - Optional header action buttons
 * @param {string} props.glowColor - Optional glow color for special modules
 * @param {Function} props.onRefresh - Optional refresh callback
 * @param {string} props.updateTime - Optional last update time string
 */
export default function ModuleCard({
  id,
  title,
  icon,
  children,
  className = '',
  defaultCollapsed = false,
  badge,
  headerActions,
  glowColor,
  onRefresh,
  updateTime,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const cardStyle = glowColor ? {
    borderColor: glowColor,
    boxShadow: `0 0 20px ${glowColor}20`,
  } : {};

  return (
    <section 
      id={id} 
      className={`module-card ${className} ${collapsed ? 'collapsed' : ''}`}
      style={cardStyle}
    >
      <div className="module-header">
        <div className="module-title">
          {icon && <span className="module-icon">{icon}</span>}
          <h2>{title}</h2>
          {badge && badge}
        </div>
        <div className="module-actions">
          {updateTime && (
            <span className="update-time">Updated: {updateTime}</span>
          )}
          {onRefresh && (
            <button 
              className="refresh-btn" 
              onClick={onRefresh}
              aria-label="Refresh"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          )}
          {headerActions}
          <button 
            className="collapse-btn" 
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!collapsed}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="module-content">
          {children}
        </div>
      )}
    </section>
  );
}
