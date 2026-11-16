import React from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Briefcase,
  Wrench,
  Landmark,
  X,
  Layers,
  Lock,
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, isOpen, onClose }) {
  const { user, canAccessDept } = useCentralAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const handleNav = (tabId) => {
    setTab(tabId);
    if (onClose) onClose();
  };

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
        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="sidebar-nav-group">
            <div className="sidebar-section-title">CENTRAL CONTROL CENTER</div>

            <button
              className={`sidebar-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('dashboard')}
            >
              <span className="sidebar-item-icon">
                <LayoutDashboard size={18} />
              </span>
              <span className="sidebar-item-label">Central Dashboard</span>
            </button>

            <button
              className={`sidebar-nav-item ${currentTab === 'users' ? 'active' : ''}`}
              onClick={() => handleNav('users')}
            >
              <span className="sidebar-item-icon">
                <Users size={18} />
              </span>
              <span className="sidebar-item-label">User Management</span>
            </button>

            <button
              className={`sidebar-nav-item ${currentTab === 'audit' ? 'active' : ''}`}
              onClick={() => handleNav('audit')}
            >
              <span className="sidebar-item-icon">
                <ShieldCheck size={18} />
              </span>
              <span className="sidebar-item-label">Security & Audit Logs</span>
            </button>
          </div>
        )}

        {/* Department Workspaces Section */}
        <div className="sidebar-nav-group">
          <div className="sidebar-section-title">
            {isSuperAdmin ? 'DEPARTMENT ACCESS & WORKSPACES' : 'MY ASSIGNED DEPARTMENTS'}
          </div>

          {/* Sales Department */}
          {(isSuperAdmin || canAccessDept('sales')) && (
            <button
              className={`sidebar-nav-item nav-dept-sales ${currentTab === 'sales' ? 'active' : ''}`}
              onClick={() => handleNav('sales')}
            >
              <span className="sidebar-item-icon">
                <Briefcase size={18} />
              </span>
              <span className="sidebar-item-label">Sales Department</span>
              <span className="sidebar-badge badge-blue">Sales</span>
            </button>
          )}

          {/* Service Department */}
          {(isSuperAdmin || canAccessDept('service')) && (
            <button
              className={`sidebar-nav-item nav-dept-service ${currentTab === 'service' ? 'active' : ''}`}
              onClick={() => handleNav('service')}
            >
              <span className="sidebar-item-icon">
                <Wrench size={18} />
              </span>
              <span className="sidebar-item-label">Service Department</span>
              <span className="sidebar-badge badge-green">Service</span>
            </button>
          )}

          {/* Accounts Department */}
          {(isSuperAdmin || canAccessDept('accounts')) && (
            <button
              className={`sidebar-nav-item nav-dept-accounts ${currentTab === 'accounts' ? 'active' : ''}`}
              onClick={() => handleNav('accounts')}
            >
              <span className="sidebar-item-icon">
                <Landmark size={18} />
              </span>
              <span className="sidebar-item-label">Accounts Department</span>
              <span className="sidebar-badge badge-amber">Accounts</span>
            </button>
          )}

          {/* If user has no departments assigned */}
          {!isSuperAdmin && (!user?.departments || user.departments.length === 0) && (
            <div className="sidebar-no-depts-note">
              <Lock size={16} />
              <span>No department permissions assigned yet. Contact Super Admin.</span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer-badge">
        <div className="system-status-indicator">
          <span className="status-dot-pulse" />
          <span>EPI Central System v1.0</span>
        </div>
      </div>
    </aside>
  );
}
