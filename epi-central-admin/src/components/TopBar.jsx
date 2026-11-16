import React, { useState } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';
import UserProfileModal from './UserProfileModal.jsx';

export default function TopBar({ currentTab, onToggleSidebar }) {
  const { user, logout } = useCentralAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Central Control Center';
      case 'users':
        return 'Employee & Access Management';
      case 'audit':
        return 'Security & Activity Logs';
      case 'sales':
        return 'EPI Sales Department Workspace';
      case 'service':
        return 'EPI Service Department Workspace';
      case 'accounts':
        return 'EPI Accounts Department Workspace';
      default:
        return 'EPI Central Management';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'EPI';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="topbar-mobile-burger"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-title-block">
          <span className="topbar-crumbs">EPI Central Management</span>
          <h1 className="topbar-heading">{getTitle()}</h1>
        </div>
      </div>

      <div className="topbar-right">
        {/* User Profile Pill */}
        <div
          className="user-profile-pill"
          onClick={() => setShowProfileModal(true)}
          style={{ cursor: 'pointer' }}
          title="Click to view full employee profile and security settings"
        >
          <div className="user-avatar-gradient">
            {getInitials(user?.name)}
          </div>
          <div className="user-info-text hide-on-mobile">
            <span className="user-name-display">{user?.name}</span>
            <div className="user-role-line">
              <span className={`role-badge ${user?.role === 'superadmin' ? 'role-superadmin' : 'role-employee'}`}>
                {user?.role === 'superadmin' ? 'Super Admin' : 'Employee'}
              </span>
              <span className="user-id-badge">ID: {user?.userId}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn-logout-header"
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out from the EPI Central System?')) {
              logout();
            }
          }}
          title="Sign Out of Session"
        >
          <LogOut size={16} />
          <span className="hide-on-mobile">Sign Out</span>
        </button>
      </div>

      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </header>
  );
}
