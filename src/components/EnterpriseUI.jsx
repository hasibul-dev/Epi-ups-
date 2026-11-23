import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

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
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.28)',
      icon: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.2)',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.28)',
      icon: '#34d399',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.28)',
      icon: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.28)',
      icon: '#fca5a5',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
    cyan: {
      bg: 'rgba(34, 211, 238, 0.12)',
      border: 'rgba(34, 211, 238, 0.28)',
      icon: '#22d3ee',
      glow: 'rgba(34, 211, 238, 0.2)',
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
 * Modern Enterprise Section / Page Header
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`enterprise-page-header ${className}`}>
      <div className="page-header-info">
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
  actions,
  children,
  className = '',
  style = {},
  noPadding = false,
}) {
  return (
    <div className={`enterprise-glass-card ${className}`} style={style}>
      {(title || actions) && (
        <div className="glass-card-header">
          <div className="glass-card-title-wrap">
            {Icon && <Icon size={16} className="glass-card-header-icon" />}
            <div>
              {title && <h3 className="glass-card-title">{title}</h3>}
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
