import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  KeyRound,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Eye,
  Filter,
  Briefcase,
  Wrench,
  Landmark,
  ShieldAlert,
  Printer,
} from 'lucide-react';
import { printFormattedReport } from '../../../services/reportExport.js';
import UserManagementModal from './UserManagementModal.jsx';
import ResetPasswordModal from './ResetPasswordModal.jsx';
import LoginHistoryModal from './LoginHistoryModal.jsx';

export default function UserManagement() {
  const { token, user: currentUser } = useCentralAuth();

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
  const [historyUser, setHistoryUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [alertNotice, setAlertNotice] = useState(null);

  // Fetch Users list
  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUsersList(data.users);
      }
    } catch (err) {
      console.error('[UserManagement] Failed to fetch users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
        loadUsers();
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
        loadUsers();
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

  // Calculate live user stats
  const totalCount = usersList.length;
  const activeCount = usersList.filter((u) => u.status === 'active').length;
  const inactiveCount = usersList.filter((u) => u.status === 'inactive').length;
  const salesCount = usersList.filter((u) => u.role === 'superadmin' || u.departments?.includes('sales')).length;
  const serviceCount = usersList.filter((u) => u.role === 'superadmin' || u.departments?.includes('service')).length;
  const accountsCount = usersList.filter((u) => u.role === 'superadmin' || u.departments?.includes('accounts')).length;
  const marketingCount = usersList.filter((u) => u.role === 'superadmin' || u.departments?.includes('marketing')).length;

  const handlePrintDirectory = () => {
    printFormattedReport({
      title: 'ENTERPRISE EMPLOYEE DIRECTORY & RBAC ACCESS AUDIT',
      department: 'CENTRAL ADMINISTRATION',
      dateRange: 'Active Directory State',
      summary: {
        'Total Users': totalCount,
        'Active Accounts': activeCount,
        'Sales Team': salesCount,
        'Service Team': serviceCount,
        'Accounts Team': accountsCount,
        'Marketing Team': marketingCount,
      },
      headers: ['User ID', 'Full Name', 'Email', 'Role', 'Departments', 'Status', 'Last Login'],
      rows: filteredUsers.map((u) => [
        u.userId,
        u.name,
        u.email || '—',
        u.role === 'superadmin' ? 'Super Administrator' : u.role || 'Staff',
        Array.isArray(u.departments) ? u.departments.join(', ').toUpperCase() : 'ALL',
        u.status === 'active' ? 'Active' : 'Inactive',
        u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-GB') : 'Never',
      ]),
      orientation: 'landscape',
    });
  };

  return (
    <div className="central-admin-content user-management-page">
      {/* Alert Notice Banner */}
      {alertNotice && (
        <div className={`alert-toast alert-${alertNotice.type}`}>
          <span>{alertNotice.msg}</span>
          <button className="alert-toast-close" onClick={() => setAlertNotice(null)}>×</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-info">
          <div className="admin-hero-badge">
            <Users size={13} />
            <span>ACCESS CONTROL & ROLES</span>
          </div>
          <h2>Employee & User Administration</h2>
          <p>
            Provision employee credentials, assign departmental access permissions, reset passwords, and manage active accounts across all 4 operational units.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button
            type="button"
            className="btn-action-secondary"
            onClick={handlePrintDirectory}
            title="Print Official Employee Directory & Access Audit"
          >
            <Printer size={14} />
            <span>Print Staff Directory</span>
          </button>

          <button
            type="button"
            className="btn-action-secondary"
            onClick={loadUsers}
            disabled={refreshing}
            title="Refresh user list"
          >
            <RefreshCw size={14} className={refreshing ? 'spin-anim' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="btn-action-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={15} />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Pills */}
      <div className="user-metric-pills-row">
        <div className="user-metric-pill">
          <Users size={14} className="text-blue" />
          <span>Total: <strong>{totalCount}</strong></span>
        </div>
        <div className="user-metric-pill">
          <UserCheck size={14} className="text-green" />
          <span>Active: <strong>{activeCount}</strong></span>
        </div>
        {inactiveCount > 0 && (
          <div className="user-metric-pill">
            <UserX size={14} className="text-red" />
            <span>Inactive: <strong>{inactiveCount}</strong></span>
          </div>
        )}
        <div className="user-metric-pill">
          <Briefcase size={14} className="text-blue" />
          <span>Sales Staff: <strong>{salesCount}</strong></span>
        </div>
        <div className="user-metric-pill">
          <Wrench size={14} className="text-emerald" />
          <span>Service Staff: <strong>{serviceCount}</strong></span>
        </div>
        <div className="user-metric-pill">
          <Landmark size={14} className="text-amber" />
          <span>Accounts Staff: <strong>{accountsCount}</strong></span>
        </div>
      </div>

      {/* User Management Section */}
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="section-title-wrap">
            <h3>Registered Employee Accounts</h3>
            <p>Complete directory of all provisioned accounts, department roles, and security credentials</p>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="admin-table-toolbar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
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
              <option value="marketing">Digital Marketing & IT Support Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts Only</option>
              <option value="inactive">Inactive Accounts Only</option>
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
                          {isSuper
                            ? 'Super Admin'
                            : u.role === 'marketing_manager'
                            ? 'Marketing Manager'
                            : u.role === 'marketing_executive'
                            ? 'Marketing Executive'
                            : u.role === 'it_manager'
                            ? 'IT Manager'
                            : u.role === 'it_technician'
                            ? 'IT Technician'
                            : u.role === 'engineer'
                            ? 'Service Engineer'
                            : u.role === 'accountant'
                            ? 'Accountant'
                            : u.role === 'manager'
                            ? 'Manager'
                            : 'Employee'}
                        </span>
                      </td>

                      <td>
                        <div className="dept-pills-row">
                          {isSuper ? (
                            <span className="dept-pill dept-all">
                              Full System Access
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
                              {u.departments && u.departments.includes('marketing') && (
                                <span className="dept-pill dept-marketing">Marketing & IT</span>
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
                            type="button"
                            className="btn-table-icon"
                            title="View User Details"
                            onClick={() => setDetailUser(u)}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            className="btn-table-icon"
                            title="Edit Employee"
                            onClick={() => setEditingUser(u)}
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            type="button"
                            className="btn-table-icon"
                            title="Reset Password"
                            onClick={() => setResetUser(u)}
                          >
                            <KeyRound size={14} />
                          </button>

                          <button
                            type="button"
                            className="btn-table-icon"
                            title="View Login History"
                            onClick={() => setHistoryUser(u)}
                          >
                            <Clock size={14} />
                          </button>

                          {!isSuper && (
                            <button
                              type="button"
                              className={`btn-table-icon ${u.status === 'active' ? 'text-amber' : 'text-green'}`}
                              title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                              onClick={() => handleToggleStatus(u)}
                            >
                              {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                          )}

                          {!isSuper && (
                            <button
                              type="button"
                              className="btn-table-icon text-red"
                              title="Delete Account"
                              onClick={() => handleDeleteUser(u)}
                            >
                              <Trash2 size={14} />
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
            loadUsers();
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
            loadUsers();
          }}
        />
      )}

      {/* Login History Modal */}
      {historyUser && (
        <LoginHistoryModal
          user={historyUser}
          onClose={() => setHistoryUser(null)}
        />
      )}

      {/* View User Details Modal */}
      {detailUser && typeof document !== 'undefined' && createPortal(
        <div className="modal-backdrop" onClick={() => setDetailUser(null)}>
          <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-header-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3>Employee Details</h3>
                  <p>Comprehensive account information &amp; permissions</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailUser(null)}>
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg, #1a73e8, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {detailUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 3px', fontSize: 15, color: '#fff' }}>{detailUser.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                    <span>User ID: <strong style={{ color: '#38bdf8' }}>@{detailUser.userId}</strong></span>
                    <span>•</span>
                    <span>{detailUser.email || `${detailUser.userId}@epiups.com.bd`}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>System Role</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: detailUser.role === 'superadmin' ? '#38bdf8' : '#e2e8f0', marginTop: 3 }}>
                    {detailUser.role === 'superadmin' ? 'Super Administrator' : (detailUser.role || 'Staff Employee')}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Account Status</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: detailUser.status === 'active' ? '#10b981' : '#ef4444', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: detailUser.status === 'active' ? '#10b981' : '#ef4444' }} />
                    {detailUser.status === 'active' ? 'Active & Unlocked' : 'Inactive / Suspended'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Authorized Departments</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {detailUser.role === 'superadmin' ? (
                    <span className="dept-pill dept-all" style={{ padding: '4px 10px', fontSize: 11.5 }}>Full System Access (Admin, Sales, Service, Accounts)</span>
                  ) : (
                    detailUser.departments && detailUser.departments.length > 0 ? (
                      detailUser.departments.map((d) => (
                        <span key={d} className={`dept-pill dept-${d}`} style={{ padding: '4px 10px', fontSize: 11.5 }}>
                          {d.toUpperCase()} DEPARTMENT
                        </span>
                      ))
                    ) : (
                      <span className="dept-pill dept-none" style={{ padding: '4px 10px', fontSize: 11.5 }}>No departments assigned</span>
                    )
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: 11.5, color: '#94a3b8', lineHeight: 1.6 }}>
                <div><strong>Created At:</strong> {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString() : 'System initialization'}</div>
                <div><strong>Last Login:</strong> {detailUser.lastLogin ? new Date(detailUser.lastLogin).toLocaleString() : 'Never logged in'}</div>
                <div><strong>Security Hash:</strong> Bcrypt Salted (Cost 10)</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const u = detailUser;
                    setDetailUser(null);
                    setResetUser(u);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <KeyRound size={13} /> Reset Password
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const u = detailUser;
                    setDetailUser(null);
                    setEditingUser(u);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <Edit size={13} /> Edit Account
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
