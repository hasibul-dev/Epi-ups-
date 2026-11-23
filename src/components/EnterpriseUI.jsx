import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';

/**
 * Modern Enterprise Stat / KPI Card
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  color = 'blue', // 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'cyan'
  progress, // 0 - 100 percentage bar
  onClick,
  className = '',
  style = {},
}) {
  const colorMap = {
    blue: {
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.28)',
      icon: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.2)',
      progress: '#38bdf8',
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.28)',
      icon: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.2)',
      progress: '#a855f7',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.28)',
      icon: '#34d399',
      glow: 'rgba(16, 185, 129, 0.2)',
      progress: '#10b981',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.28)',
      icon: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.2)',
      progress: '#f59e0b',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.28)',
      icon: '#fca5a5',
      glow: 'rgba(239, 68, 68, 0.2)',
      progress: '#ef4444',
    },
    cyan: {
      bg: 'rgba(34, 211, 238, 0.12)',
      border: 'rgba(34, 211, 238, 0.28)',
      icon: '#22d3ee',
      glow: 'rgba(34, 211, 238, 0.2)',
      progress: '#06b6d4',
    },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`enterprise-stat-card ${onClick ? 'clickable' : ''} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div className="stat-card-top-row">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div
            className="stat-card-icon-box"
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.icon,
            }}
          >
            <Icon size={17} />
          </div>
        )}
      </div>

      <div className="stat-card-metric-value">{value}</div>

      {progress !== undefined && (
        <div className="stat-card-progress-track">
          <div
            className="stat-card-progress-bar"
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              backgroundColor: theme.progress,
            }}
          />
        </div>
      )}

      <div className="stat-card-footer">
        {subtitle && <span className="stat-card-subtext">{subtitle}</span>}
        {trend && (
          <span className={`stat-card-trend trend-${trendType}`}>
            {trendType === 'up' && <ArrowUpRight size={13} />}
            {trendType === 'down' && <ArrowDownRight size={13} />}
            <span>{trend}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Modern Breadcrumbs Trail
 */
export function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <nav className="enterprise-breadcrumbs" aria-label="Breadcrumb">
      {items.map((it, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight size={12} className="breadcrumb-separator" />}
          {it.onClick ? (
            <button type="button" onClick={it.onClick} className="breadcrumb-link">
              {it.label}
            </button>
          ) : (
            <span className={`breadcrumb-item ${idx === items.length - 1 ? 'current' : ''}`}>
              {it.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Modern Enterprise Section / Page Header
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  breadcrumbs,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`enterprise-page-header ${className}`}>
      <div className="page-header-info">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {badge && (
          <div className={`enterprise-header-badge badge-${badgeColor}`}>
            <Sparkles size={12} />
            <span>{badge}</span>
          </div>
        )}
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      {(actions || children) && (
        <div className="page-header-actions">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Modern Enterprise Glass Card Container
 */
export function EnterpriseCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
  className = '',
  style = {},
  noPadding = false,
}) {
  return (
    <div className={`enterprise-glass-card ${className}`} style={style}>
      {(title || actions || badge) && (
        <div className="glass-card-header">
          <div className="glass-card-title-wrap">
            {Icon && <Icon size={16} className="glass-card-header-icon" />}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {title && <h3 className="glass-card-title">{title}</h3>}
                {badge && <span className="glass-card-badge">{badge}</span>}
              </div>
              {subtitle && <p className="glass-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="glass-card-actions">{actions}</div>}
        </div>
      )}
      <div className={`glass-card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Modern Enterprise Status Badge
 */
export function StatusBadge({
  status,
  label,
  variant, // 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  size = 'md',
}) {
  const text = label || status || 'Unknown';
  let badgeVariant = variant;

  if (!badgeVariant && status) {
    const s = String(status).toLowerCase();
    if (s.includes('active') || s.includes('completed') || s.includes('done') || s.includes('resolved') || s.includes('paid')) {
      badgeVariant = 'success';
    } else if (s.includes('pending') || s.includes('progress') || s.includes('waiting') || s.includes('partial')) {
      badgeVariant = 'warning';
    } else if (s.includes('overdue') || s.includes('expired') || s.includes('failed') || s.includes('critical') || s.includes('cancelled')) {
      badgeVariant = 'danger';
    } else if (s.includes('plan') || s.includes('schedule') || s.includes('open')) {
      badgeVariant = 'info';
    } else {
      badgeVariant = 'neutral';
    }
  }

  return (
    <span className={`enterprise-status-badge badge-${badgeVariant || 'neutral'} size-${size}`}>
      <span className="badge-status-dot" />
      <span>{text}</span>
    </span>
  );
}

/**
 * Modern Segmented Tab Switcher
 */
export function SegmentedTabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`enterprise-segmented-tabs ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`segmented-tab-btn ${isActive ? 'active' : ''}`}
          >
            {Icon && <Icon size={14} className="segmented-tab-icon" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`segmented-tab-count ${isActive ? 'count-active' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Modern Search Input with Clear Button
 */
export function SearchInput({ value, onChange, placeholder = 'Search records...', onClear, className = '' }) {
  return (
    <div className={`enterprise-search-wrap ${className}`}>
      <Search size={14} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="enterprise-search-input"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="search-clear-btn"
          title="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/**
 * Modern Filter Pill
 */
export function FilterPill({ label, count, active, onClick, color = 'blue' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`enterprise-filter-pill pill-${color} ${active ? 'active' : ''}`}
    >
      <span>{label}</span>
      {count !== undefined && <span className="filter-pill-badge">{count}</span>}
    </button>
  );
}

/**
 * Standard Action Button
 */
export function ActionButton({
  children,
  icon: Icon,
  variant = 'primary', // 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'purple'
  size = 'md', // 'sm' | 'md' | 'lg'
  onClick,
  disabled = false,
  className = '',
  style = {},
  title = '',
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      className={`enterprise-btn btn-${variant} size-${size} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />}
      <span>{children}</span>
    </button>
  );
}

/**
 * Modern Enterprise Form Field Container
 */
export function FormField({ label, required, hint, icon: Icon, children, className = '' }) {
  return (
    <div className={`enterprise-form-field ${className}`}>
      {label && (
        <label className="enterprise-form-label">
          {Icon && <Icon size={13} className="label-icon" />}
          <span>{label}</span>
          {required && <span className="label-required">*</span>}
        </label>
      )}
      <div className="enterprise-field-control">{children}</div>
      {hint && <small className="enterprise-form-hint">{hint}</small>}
    </div>
  );
}

/**
 * Modern Enterprise Modal Shell
 */
export function EnterpriseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 620,
}) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="enterprise-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="enterprise-modal-container"
        style={{ maxWidth: `${maxWidth}px` }}
        role="dialog"
        aria-modal="true"
      >
        <div className="enterprise-modal-header">
          <div className="modal-title-wrap">
            {Icon && (
              <div className="modal-icon-badge">
                <Icon size={18} />
              </div>
            )}
            <div>
              <h2 className="modal-header-title">{title}</h2>
              {subtitle && <p className="modal-header-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="enterprise-modal-body">{children}</div>

        {footer && <div className="enterprise-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Modern Enterprise Empty State Indicator
 */
export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There are no active entries matching your current filters.',
  action,
}) {
  return (
    <div className="enterprise-empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={28} />
        </div>
      )}
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
