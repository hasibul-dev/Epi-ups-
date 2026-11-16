import { fmt, today } from '../utils/helpers.js';
import {
  Menu,
  CheckSquare,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const PAGE_INFO = {
  dashboard: { title: 'Dashboard', desc: 'Overview, today’s activity, and follow-up metrics' },
  today: { title: 'Today Work', desc: 'Daily client follow-up, activities & new work entries' },
  clients: { title: 'All Clients', desc: 'Master client directory & export records' },
  reports: { title: 'Schedule / History', desc: 'Weekly work, schedule & historical logs' },
  editData: { title: 'Edit Work Data', desc: 'Modify or correct saved entries' },
  dailySummary: { title: 'Work Summary', desc: 'Follow-up performance & category statistics' },
  client: { title: 'Add Client', desc: 'Register a new customer profile' },
  work: { title: 'Add Work', desc: 'Schedule future work & planned tasks' },
};

export default function TopBar({
  page,
  setPage,
  todayDueCount,
  onToggleSidebar,
  user,
  onSignOut,
}) {
  const current = PAGE_INFO[page] || { title: 'Assistant', desc: 'EPI UPS Management' };
  const todayFormatted = fmt(today());
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || 'http://localhost:5050';

  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || 'Sales Employee';
  const displayId = user?.userId || 'sales';
  const isSuper = user?.role === 'superadmin';
  const roleName = isSuper ? 'Super Admin' : (user?.departmentRoles?.sales || 'Sales Representative');

  return (
    <header className="topbar">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="topbar-left">
        <button
          className="topbar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <div className="topbar-page-meta">
          <h1 className="topbar-page-title">{current.title}</h1>
          <p className="topbar-page-desc">{current.desc}</p>
        </div>
      </div>

      {/* Center: Always Visible Today Work Action */}
      <div className="topbar-center-actions">
        {/* Today Work Header Button */}
        <button
          className={`topbar-today-btn ${page === 'today' ? 'active' : ''}`}
          onClick={() => setPage('today')}
          title="Go to Today Work"
        >
          <span className="topbar-btn-ico">
            <CheckSquare size={15} strokeWidth={2.4} />
          </span>
          <span className="topbar-btn-text">Today Work</span>
          {todayDueCount > 0 && <span className="topbar-today-badge">{todayDueCount}</span>}
        </button>
      </div>

      {/* Right: Date, Portal Link & Central User Avatar */}
      <div className="topbar-right">
        <div className="topbar-date-pill">
          <Calendar size={14} strokeWidth={2} />
          <span>{todayFormatted}</span>
        </div>

        <a
          href={centralUrl}
          className="topbar-portal-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 10,
            background: 'rgba(0, 82, 204, 0.12)',
            border: '1px solid rgba(0, 82, 204, 0.28)',
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.16s ease',
          }}
          title="Return to EPI Central Management Portal"
        >
          <ExternalLink size={13} strokeWidth={2.2} />
          <span>Central Portal</span>
        </a>

        <div
          className="topbar-avatar"
          title={`${displayName} (@${displayId}) · ${roleName} · EPI Sales Department`}
          style={{ cursor: 'pointer' }}
        >
          {getInitials(displayName)}
        </div>
      </div>
    </header>
  );
}
