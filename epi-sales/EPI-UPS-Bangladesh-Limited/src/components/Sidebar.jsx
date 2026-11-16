import { today } from '../utils/helpers.js';
import {
  Zap,
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  Edit3,
  BarChart3,
  UserPlus,
  CalendarPlus,
  LogOut,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function Sidebar({
  page,
  setPage,
  db,
  user,
  onSignOut,
  isOpen,
  onClose,
}) {
  const tDate = today();
  const todayDueCount =
    (db?.clients?.filter((c) => c.nextDate && c.nextDate <= tDate)?.length || 0) +
    (db?.work?.filter((w) => w.date === tDate && w.status === 'Pending')?.length || 0);
  const totalClientsCount = db?.clients?.length || 0;

  const handleNav = (targetPage) => {
    setPage(targetPage);
    if (onClose) onClose();
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || 'Sales User';
  const displayId = user?.userId || 'sales';
  const isSuper = user?.role === 'superadmin';
  const roleName = isSuper ? 'Super Admin' : (user?.departmentRoles?.sales || 'Sales Representative');
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || 'http://localhost:5050';

  return (
    <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <div className="brand-logo-icon">
            <img src="/logo.png" alt="EPI Logo" className="sidebar-logo-img" />
          </div>
          <div className="brand-text">
            <h2>EPI UPS</h2>
            <span>Bangladesh Limited</span>
          </div>
        </div>
        {onClose && (
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={18} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className="sidebar-content-scroll">
        {/* Navigation Section */}
        <div className="sidebar-nav-group">
          <div className="sidebar-section-title">NAVIGATION MENU</div>

          <button
            className={`sidebar-nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNav('dashboard')}
          >
            <span className="sidebar-item-icon">
              <LayoutDashboard size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Dashboard</span>
          </button>

          <button
            className={`sidebar-nav-item nav-today-highlight ${page === 'today' ? 'active' : ''}`}
            onClick={() => handleNav('today')}
          >
            <span className="sidebar-item-icon">
              <CheckSquare size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Today Work</span>
            {todayDueCount > 0 && <span className="sidebar-badge badge-green">{todayDueCount}</span>}
          </button>

          <button
            className={`sidebar-nav-item ${page === 'clients' ? 'active' : ''}`}
            onClick={() => handleNav('clients')}
          >
            <span className="sidebar-item-icon">
              <Users size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">All Clients</span>
            {totalClientsCount > 0 && <span className="sidebar-badge badge-neutral">{totalClientsCount}</span>}
          </button>

          <button
            className={`sidebar-nav-item ${page === 'reports' ? 'active' : ''}`}
            onClick={() => handleNav('reports')}
          >
            <span className="sidebar-item-icon">
              <Calendar size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Schedule / History</span>
          </button>

          <button
            className={`sidebar-nav-item ${page === 'editData' ? 'active' : ''}`}
            onClick={() => handleNav('editData')}
          >
            <span className="sidebar-item-icon">
              <Edit3 size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Edit Work Data</span>
          </button>

          <button
            className={`sidebar-nav-item nav-summary-highlight ${page === 'dailySummary' ? 'active' : ''}`}
            onClick={() => handleNav('dailySummary')}
          >
            <span className="sidebar-item-icon">
              <BarChart3 size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Work Summary</span>
          </button>
        </div>

        {/* Quick Action Entries */}
        <div className="sidebar-nav-group">
          <div className="sidebar-section-title">QUICK CREATE</div>

          <button
            className={`sidebar-nav-item ${page === 'client' ? 'active' : ''}`}
            onClick={() => handleNav('client')}
          >
            <span className="sidebar-item-icon">
              <UserPlus size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Add Client</span>
          </button>

          <button
            className={`sidebar-nav-item ${page === 'work' ? 'active' : ''}`}
            onClick={() => handleNav('work')}
          >
            <span className="sidebar-item-icon">
              <CalendarPlus size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">Add Work</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer & Centralized User Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" title={`Signed in as ${displayName} (@${displayId}) - ${roleName}`}>
          <div className="sidebar-avatar">{getInitials(displayName)}</div>
          <div className="sidebar-user-meta">
            <div className="sidebar-username">{displayName}</div>
            <div className="sidebar-userrole" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{roleName}</span>
              <span style={{ fontSize: 10, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: 4 }}>
                @{displayId}
              </span>
            </div>
          </div>
        </div>

        <div className="sidebar-security-actions">
          <a
            href={centralUrl}
            className="sidebar-action-btn"
            title="Return to EPI Central Management Portal"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={14} strokeWidth={2} />
            <span>Portal</span>
          </a>

          <button
            className="sidebar-action-btn btn-lock"
            onClick={onSignOut}
            title="Sign out of Central Management session"
            style={{ cursor: 'pointer' }}
          >
            <LogOut size={14} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
