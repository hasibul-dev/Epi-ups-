import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ExecutiveDashboard from './components/ExecutiveDashboard.jsx';
import UserManagement from './components/UserManagement.jsx';
import AuditLogsView from './components/AuditLogsView.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, Users, ShieldCheck, ArrowRight, Shield } from 'lucide-react';

export default function AdminModule({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const p = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
    if (p === 'users') {
      setActiveTab('users');
    } else if (p === 'audit') {
      setActiveTab('audit');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const handleLaunchDept = (dept) => {
    if (dept === 'sales') navigate('/sales');
    else if (dept === 'service') navigate('/service');
    else if (dept === 'accounts') navigate('/accounts');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') navigate('/admin');
    else if (tab === 'users') navigate('/admin/users');
    else if (tab === 'audit') navigate('/admin/audit');
  };

  return (
    <div className="admin-module-container">
      {/* Admin Module Sub-navigation Bar */}
      <div className="admin-subnav-bar">
        <div className="admin-tabs-group">
          <button
            type="button"
            onClick={() => handleTabChange('dashboard')}
            className={`admin-subnav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={15} />
            <span>Executive Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={`admin-subnav-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={15} />
            <span>User Management</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('audit')}
            className={`admin-subnav-btn ${activeTab === 'audit' ? 'active' : ''}`}
          >
            <ShieldCheck size={15} />
            <span>Security & Audit Logs</span>
          </button>
        </div>

        <div className="admin-session-indicator">
          <span className="session-status-dot" />
          <span className="session-status-text">Super Admin Session</span>
        </div>
      </div>

      {/* Admin Module Content Pages */}
      <div className="admin-page-render">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            onLaunchDept={handleLaunchDept}
            onNavigateUsers={() => handleTabChange('users')}
          />
        )}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'audit' && <AuditLogsView />}
      </div>
    </div>
  );
}
