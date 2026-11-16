import React, { useState, useEffect, useCallback } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Wrench,
  Landmark,
  UserPlus,
  RefreshCw,
  KeyRound,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  ShieldAlert,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import UserManagementModal from './UserManagementModal.jsx';
import ResetPasswordModal from './ResetPasswordModal.jsx';

export default function CentralAdminDashboard({ onLaunchDept }) {
  const { token, user: currentUser } = useCentralAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    serviceUsers: 0,
    salesUsers: 0,
    accountsUsers: 0,
    recentLogins: [],
    recentActivities: [],
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [alertNotice, setAlertNotice] = useState(null);

  // Fetch Dashboard Stats and Users list
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) setUsersList(usersData.users);
      }
    } catch (err) {
      console.error('[AdminDashboard] Failed to fetch data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle user status
  const handleToggleStatus = async (user) => {
    if (user.role === 'superadmin') {
      alert('Super Admin accounts cannot be deactivated.');
      return;
    }
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to mark ${user.name} (${user.userId}) as ${nextStatus.toUpperCase()}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertNotice({
          type: 'success',
          msg: `Account status for ${user.userId} updated to ${nextStatus}.`,
        });
        loadData();
      } else {
        alert(data.error || 'Failed to update status.');
      }
    } catch (err) {
      alert('Network error updating status.');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (user.role === 'superadmin') {
      alert('Super Admin accounts cannot be deleted.');
      return;
    }
    if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE employee account "${user.name} (${user.userId})"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertNotice({
          type: 'success',
          msg: `Employee account ${user.userId} has been deleted.`,
        });
        loadData();
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Network error deleting user.');
    }
  };

  // Filter users list
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q));

    const matchDept =
      deptFilter === 'all' ||
      u.role === 'superadmin' ||
      (Array.isArray(u.departments) && u.departments.includes(deptFilter));

    const matchStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchQuery && matchDept && matchStatus;
  });

  return (
    <div className="central-admin-content">
      {/* Alert Notice Banner */}
      {alertNotice && (
        <div className={`alert-toast alert-${alertNotice.type}`}>
          <span>{alertNotice.msg}</span>
          <button className="alert-toast-close" onClick={() => setAlertNotice(null)}>×</button>
        </div>
      )}

      {/* Hero Welcome Bar */}
      <div className="admin-hero-banner">
        <div className="admin-hero-info">
          <h2>Master Administration & Control Hub</h2>
          <p>
            Welcome, <strong>{currentUser?.name}</strong>. Manage department access, provision employee accounts, and monitor system activities.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button
            className="btn-action-secondary"
            onClick={loadData}
            disabled={refreshing}
            title="Refresh statistics"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-anim' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
          <button
            className="btn-action-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={16} />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon icon-blue">
            <Users size={24} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Total Employees</span>
            <span className="stat-val">{stats.totalEmployees}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-green">
            <UserCheck size={24} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Active Accounts</span>
            <span className="stat-val text-green">{stats.activeEmployees}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-red">
            <UserX size={24} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Inactive Accounts</span>
            <span className="stat-val text-red">{stats.inactiveEmployees}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-sales">
            <Briefcase size={24} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Sales Department Users</span>
            <span className="stat-val">{stats.salesUsers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-service">
            <Wrench size={24} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Service Department Users</span>
            <span className="stat-val">{stats.serviceUsers}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon icon-accounts">
            <Landmark size={24} />
          </div>
          <div className="stat-card-data">
            <span className="stat-label">Accounts Department Users</span>
            <span className="stat-val">{stats.accountsUsers}</span>
          </div>
        </div>
      </div>

      {/* Department Workspaces Quick Launcher Banner */}
      <div className="dept-launch-section">
        <div className="section-title-wrap">
          <h3>EPI Department Workspaces</h3>
          <p>Quickly open and manage individual department operational systems</p>
        </div>

        <div className="dept-launch-grid">
          {/* Sales Card */}
          <div className="dept-launch-card card-sales">
            <div className="dept-launch-header">
              <div className="dept-icon-box sales-bg">
                <Briefcase size={22} />
              </div>
              <span className="dept-status-pill">Active CRM</span>
            </div>
            <h4>EPI Sales Department</h4>
            <p>Customer database, pending work orders, follow-up schedules, and daily sales activities.</p>
            <button
              className="btn-launch-dept sales-btn"
              onClick={() => onLaunchDept('sales')}
            >
              Open Sales Workspace <ArrowRight size={16} />
            </button>
          </div>

          {/* Service Card */}
          <div className="dept-launch-card card-service">
            <div className="dept-launch-header">
              <div className="dept-icon-box service-bg">
                <Wrench size={22} />
              </div>
              <span className="dept-status-pill">Active Service Hub</span>
            </div>
            <h4>EPI Service Department</h4>
            <p>Equipment servicing, preventive maintenance, repair work orders, warranty tracking & calendar dispatch.</p>
            <button
              className="btn-launch-dept service-btn"
              onClick={() => onLaunchDept('service')}
            >
              Open Service Workspace <ArrowRight size={16} />
            </button>
          </div>

          {/* Accounts Card */}
          <div className="dept-launch-card card-accounts">
            <div className="dept-launch-header">
              <div className="dept-icon-box accounts-bg">
                <Landmark size={22} />
              </div>
              <span className="dept-status-pill">Active Financials</span>
            </div>
            <h4>EPI Accounts Department</h4>
            <p>General ledger, double-entry vouchers, sales & purchase invoices, banking, payroll, and 15% VAT reports.</p>
            <button
              className="btn-launch-dept accounts-btn"
              onClick={() => onLaunchDept('accounts')}
            >
              Open Accounts Workspace <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="section-title-wrap">
            <h3>Registered Employees & Department Permissions</h3>
            <p>Manage employee user accounts, department access, and password credentials</p>
          </div>
          <button
            className="btn-action-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={16} />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="admin-table-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by User ID, Name, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="toolbar-search-input"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          <div className="filter-select-group">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="all">All Departments</option>
              <option value="sales">Sales Department Only</option>
              <option value="service">Service Department Only</option>
              <option value="accounts">Accounts Department Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive Accounts</option>
            </select>
          </div>
        </div>

        {/* Users Data Table */}
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Employee / User ID</th>
                <th>Role</th>
                <th>Assigned Departments</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-table">
                    No employees matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isSuper = u.role === 'superadmin';

                  return (
                    <tr key={u.id} className={u.status === 'inactive' ? 'row-inactive' : ''}>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="employee-name">{u.name}</span>
                            <span className="employee-id-sub">User ID: <strong>{u.userId}</strong></span>
                            {u.email && <span className="employee-email-sub">{u.email}</span>}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`role-badge ${isSuper ? 'role-superadmin' : 'role-employee'}`}>
                          {isSuper ? 'Super Admin' : 'Employee'}
                        </span>
                      </td>

                      <td>
                        <div className="dept-pills-row">
                          {isSuper ? (
                            <span className="dept-pill dept-all">
                              Full System (All Departments)
                            </span>
                          ) : (
                            <>
                              {u.departments && u.departments.includes('sales') && (
                                <span className="dept-pill dept-sales">Sales</span>
                              )}
                              {u.departments && u.departments.includes('service') && (
                                <span className="dept-pill dept-service">Service</span>
                              )}
                              {u.departments && u.departments.includes('accounts') && (
                                <span className="dept-pill dept-accounts">Accounts</span>
                              )}
                              {(!u.departments || u.departments.length === 0) && (
                                <span className="dept-pill dept-none">None</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={`status-pill ${u.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                          <span className="status-indicator-dot" />
                          {u.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td>
                        <span className="timestamp-text">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never logged in'}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="table-actions-group">
                          <button
                            className="btn-table-icon"
                            title="Edit Employee"
                            onClick={() => setEditingUser(u)}
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            className="btn-table-icon"
                            title="Reset Password"
                            onClick={() => setResetUser(u)}
                          >
                            <KeyRound size={15} />
                          </button>

                          {!isSuper && (
                            <button
                              className={`btn-table-icon ${u.status === 'active' ? 'text-amber' : 'text-green'}`}
                              title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                              onClick={() => handleToggleStatus(u)}
                            >
                              {u.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>
                          )}

                          {!isSuper && (
                            <button
                              className="btn-table-icon text-red"
                              title="Delete Account"
                              onClick={() => handleDeleteUser(u)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column Logs Section: Recent Logins & Recent Audit Activities */}
      <div className="admin-logs-grid">
        {/* Recent Login History */}
        <div className="admin-log-box">
          <div className="log-box-header">
            <div className="section-title-wrap">
              <h4>
                <Clock size={16} /> Recent Employee Logins
              </h4>
              <p>Real-time login session audit</p>
            </div>
          </div>
          <div className="log-list-scroll">
            {stats.recentLogins.length === 0 ? (
              <div className="empty-log-state">No recent login records.</div>
            ) : (
              stats.recentLogins.map((entry, idx) => (
                <div key={idx} className="login-log-item">
                  <div className="log-user-chip">
                    <strong>{entry.name || entry.userId}</strong>
                    <span>({entry.userId})</span>
                  </div>
                  <div className="log-meta">
                    <span className="log-ip">IP: {entry.ip}</span>
                    <span className="log-time">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent User Management / Audit Logs */}
        <div className="admin-log-box">
          <div className="log-box-header">
            <div className="section-title-wrap">
              <h4>
                <ShieldCheck size={16} /> Recent Admin & Security Activities
              </h4>
              <p>System audit trail of permissions and credential updates</p>
            </div>
          </div>
          <div className="log-list-scroll">
            {stats.recentActivities.length === 0 ? (
              <div className="empty-log-state">No audit activities recorded.</div>
            ) : (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="activity-log-item">
                  <div className="activity-badge-line">
                    <span className="activity-action-tag">{act.action}</span>
                    <span className="log-time">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="activity-detail">{act.details}</p>
                  <span className="activity-author">By: {act.performedBy}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal (Add / Edit) */}
      {(showAddModal || editingUser) && (
        <UserManagementModal
          userToEdit={editingUser}
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
          onSaved={(savedUser, temporaryPass) => {
            if (temporaryPass) {
              setAlertNotice({
                type: 'success',
                msg: `Account created for ${savedUser.name} (${savedUser.userId}). Assigned Password: ${temporaryPass}`,
              });
            } else {
              setAlertNotice({
                type: 'success',
                msg: `Account details for ${savedUser.userId} updated.`,
              });
            }
            loadData();
          }}
        />
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <ResetPasswordModal
          targetUser={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={(userId, newPass) => {
            setAlertNotice({
              type: 'success',
              msg: `Password for ${userId} successfully reset to: ${newPass}`,
            });
            loadData();
          }}
        />
      )}
    </div>
  );
}
