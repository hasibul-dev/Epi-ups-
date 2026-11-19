import React, { useState, useEffect, useCallback } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Wrench,
  Landmark,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Clock,
  Download,
  Upload,
  Activity,
  HardDrive,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { centralStore } from '../services/centralStorage.js';

export default function ExecutiveDashboard({ onLaunchDept, onNavigateUsers }) {
  const { token, user: currentUser } = useCentralAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    serviceUsers: 0,
    salesUsers: 0,
    accountsUsers: 0,
    marketingUsers: 0,
    recentLogins: [],
    recentActivities: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertNotice, setAlertNotice] = useState(null);

  // Fetch Dashboard Stats
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data.stats);
      }
    } catch (err) {
      console.error('[ExecutiveDashboard] Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="central-admin-content executive-dashboard-page">
      {/* Alert Notice Toast */}
      {alertNotice && (
        <div className={`alert-toast alert-${alertNotice.type}`}>
          <span>{alertNotice.msg}</span>
          <button className="alert-toast-close" onClick={() => setAlertNotice(null)}>×</button>
        </div>
      )}

      {/* Hero Welcome & Control Overview Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-info">
          <div className="admin-hero-badge">
            <span className="live-pulse-dot" />
            <span>EXECUTIVE CONTROL CENTER</span>
          </div>
          <h2>Executive Operations & System Overview</h2>
          <p>
            Welcome, <strong>{currentUser?.name || 'Administrator'}</strong>. Real-time enterprise monitoring, department operations, and security overview for EPI UPS Bangladesh Limited.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button
            type="button"
            className="btn-action-secondary"
            onClick={() => {
              try {
                centralStore.exportDatabase();
                setAlertNotice({ type: 'success', msg: 'System database exported successfully.' });
              } catch (e) {
                alert('Export failed: ' + e.message);
              }
            }}
            title="Download JSON backup of all accounts and audit logs"
          >
            <Download size={14} />
            <span>Export Backup</span>
          </button>

          <label
            className="btn-action-secondary"
            style={{ cursor: 'pointer', margin: 0 }}
            title="Restore database from JSON backup file"
          >
            <Upload size={14} />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  try {
                    const res = centralStore.importDatabase(evt.target.result);
                    setAlertNotice({ type: 'success', msg: `Backup restored! Loaded ${res.userCount} accounts.` });
                    loadData();
                  } catch (err) {
                    alert('Import error: ' + err.message);
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>

          <button
            type="button"
            className="btn-action-secondary"
            onClick={loadData}
            disabled={refreshing}
            title="Refresh statistics"
          >
            <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {onNavigateUsers && (
            <button
              type="button"
              className="btn-action-primary"
              onClick={onNavigateUsers}
              title="Go to Employee & User Management"
            >
              <Users size={15} />
              <span>User Management</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon icon-blue">
            <Users size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Total Employees</span>
            <span className="stat-val">{stats.totalEmployees}</span>
            <span className="stat-subtext">Registered system users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-green">
            <UserCheck size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Active Accounts</span>
            <span className="stat-val text-green">{stats.activeEmployees}</span>
            <span className="stat-subtext">Authorized & ready</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-red">
            <UserX size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Inactive Accounts</span>
            <span className="stat-val text-red">{stats.inactiveEmployees}</span>
            <span className="stat-subtext">Deactivated access</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-sales">
            <Briefcase size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Sales Department</span>
            <span className="stat-val">{stats.salesUsers}</span>
            <span className="stat-subtext">CRM & pipeline staff</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-service">
            <Wrench size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Service Department</span>
            <span className="stat-val">{stats.serviceUsers}</span>
            <span className="stat-subtext">Engineers & field technicians</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-accounts">
            <Landmark size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Accounts & ERP</span>
            <span className="stat-val">{stats.accountsUsers}</span>
            <span className="stat-subtext">Finance & invoicing team</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-marketing" style={{ color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)' }}>
            <Share2 size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Marketing & IT</span>
            <span className="stat-val" style={{ color: '#c084fc' }}>{stats.marketingUsers || 0}</span>
            <span className="stat-subtext">Digital growth & tech support</span>
          </div>
        </div>
      </div>

      {/* System Status & Important Notifications Banner */}
      <div className="system-health-banner">
        <div className="health-item">
          <div className="health-icon health-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="health-info">
            <span className="health-title">Browser-Local Storage</span>
            <span className="health-desc">Zero cloud DB required. IndexedDB & LocalStorage synchronized.</span>
          </div>
        </div>

        <div className="health-item">
          <div className="health-icon health-blue">
            <ShieldCheck size={18} />
          </div>
          <div className="health-info">
            <span className="health-title">Security & RBAC</span>
            <span className="health-desc">Bcrypt hash encryption with strict departmental route guards.</span>
          </div>
        </div>

        <div className="health-item">
          <div className="health-icon health-purple">
            <Activity size={18} />
          </div>
          <div className="health-info">
            <span className="health-title">Live Systems Online</span>
            <span className="health-desc">All 4 enterprise modules fully operational and integrated.</span>
          </div>
        </div>
      </div>

      {/* Department Workspaces Quick Launcher Banner */}
      <div className="dept-launch-section">
        <div className="section-title-wrap">
          <div className="section-title-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <h3>Department Workspaces</h3>
            <p>Direct single-click access into operational departments for authorized administrators</p>
          </div>
        </div>

        <div className="dept-launch-grid">
          {/* Sales Card */}
          <div className="dept-launch-card card-sales">
            <div className="dept-launch-header">
              <div className="dept-icon-box sales-bg">
                <Briefcase size={20} />
              </div>
              <span className="dept-status-pill">Active CRM</span>
            </div>
            <h4>EPI Sales Department</h4>
            <p>Customer database, pending work orders, follow-up schedules, quotation preparation, and daily sales activities.</p>
            <button
              type="button"
              className="btn-launch-dept sales-btn"
              onClick={() => onLaunchDept('sales')}
            >
              <span>Open Sales Workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Service Card */}
          <div className="dept-launch-card card-service">
            <div className="dept-launch-header">
              <div className="dept-icon-box service-bg">
                <Wrench size={20} />
              </div>
              <span className="dept-status-pill">Active Service Hub</span>
            </div>
            <h4>EPI Service Department</h4>
            <p>Equipment servicing, preventive maintenance, repair work orders, warranty tracking, and calendar dispatch.</p>
            <button
              type="button"
              className="btn-launch-dept service-btn"
              onClick={() => onLaunchDept('service')}
            >
              <span>Open Service Workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Accounts Card */}
          <div className="dept-launch-card card-accounts">
            <div className="dept-launch-header">
              <div className="dept-icon-box accounts-bg">
                <Landmark size={20} />
              </div>
              <span className="dept-status-pill">Active Financials</span>
            </div>
            <h4>EPI Accounts & ERP</h4>
            <p>General ledger, double-entry vouchers, sales & purchase invoices, banking, payroll, and 15% Mushak VAT reports.</p>
            <button
              type="button"
              className="btn-launch-dept accounts-btn"
              onClick={() => onLaunchDept('accounts')}
            >
              <span>Open Accounts Workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Digital Marketing & IT Support Card */}
          <div className="dept-launch-card card-marketing" style={{ borderColor: 'rgba(168, 85, 247, 0.35)' }}>
            <div className="dept-launch-header">
              <div className="dept-icon-box marketing-bg" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c084fc' }}>
                <Share2 size={20} />
              </div>
              <span className="dept-status-pill" style={{ color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.35)' }}>Active Digital Hub</span>
            </div>
            <h4>Digital Marketing & IT Support</h4>
            <p>Social media campaigns, advertisement tracking, editorial calendar, asset library, and internal IT support tickets.</p>
            <button
              type="button"
              className="btn-launch-dept marketing-btn"
              style={{ background: 'linear-gradient(135deg, #7e22ce, #a855f7)', color: '#fff' }}
              onClick={() => onLaunchDept('marketing')}
            >
              <span>Open Marketing & IT Workspace</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Logs Section: Recent Logins & Recent Audit Activities */}
      <div className="admin-logs-grid">
        {/* Recent Login History */}
        <div className="admin-log-box">
          <div className="log-box-header">
            <div className="section-title-wrap">
              <h4>
                <Clock size={16} /> Recent User Logins
              </h4>
              <p>Real-time login session audit across all departments</p>
            </div>
          </div>
          <div className="log-list-scroll">
            {stats.recentLogins.length === 0 ? (
              <div className="log-empty-state">No login sessions recorded yet.</div>
            ) : (
              stats.recentLogins.map((entry, idx) => (
                <div key={idx} className="log-entry-item">
                  <div className="log-entry-avatar">
                    {entry.name ? entry.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="log-entry-body">
                    <div className="log-entry-title">
                      <strong>{entry.name || 'Unknown User'}</strong>
                      <span className="log-entry-userid">({entry.userId})</span>
                    </div>
                    <div className="log-entry-meta">
                      <span className="log-entry-time">
                        <Clock size={11} /> {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="log-entry-ip">IP: {entry.ip || 'Local Browser'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="admin-log-box">
          <div className="log-box-header">
            <div className="section-title-wrap">
              <h4>
                <Activity size={16} /> Recent System Activities
              </h4>
              <p>Administrative changes, security events, and audit trail</p>
            </div>
          </div>
          <div className="log-list-scroll">
            {stats.recentActivities.length === 0 ? (
              <div className="log-empty-state">No recent activity recorded yet.</div>
            ) : (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="log-entry-item">
                  <div className={`log-entry-badge-icon badge-${(act.action || 'info').toLowerCase()}`}>
                    <ShieldCheck size={14} />
                  </div>
                  <div className="log-entry-body">
                    <div className="log-entry-title">
                      <span className={`activity-action-tag tag-${(act.action || '').toLowerCase()}`}>
                        {act.action}
                      </span>
                      <span className="log-entry-user">by {act.performedBy || act.userName || 'System'}</span>
                    </div>
                    <p className="log-entry-details">{act.details}</p>
                    <div className="log-entry-meta">
                      <span className="log-entry-time">
                        <Clock size={11} /> {new Date(act.timestamp || act.at || Date.now()).toLocaleString()}
                      </span>
                      {act.targetUserId && (
                        <span className="log-entry-target">Target: @{act.targetUserId}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Callout to User Management */}
      {onNavigateUsers && (
        <div className="user-management-callout-card">
          <div className="callout-content">
            <div className="callout-icon">
              <Users size={24} />
            </div>
            <div>
              <h4>Looking to manage corporate employees and permissions?</h4>
              <p>Add new staff accounts, modify department access rights, deactivate users, or reset employee passwords.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-action-primary"
            onClick={onNavigateUsers}
          >
            <span>Open User Management</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
