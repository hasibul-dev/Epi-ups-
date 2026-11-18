import React, { useState, useEffect, useCallback } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Clock,
  User,
  Filter,
  ShieldAlert,
  Calendar,
  Activity,
  KeyRound,
  UserPlus,
} from 'lucide-react';

export default function AuditLogsView() {
  const { token } = useCentralAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit-logs?limit=250', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase().trim();
    const action = String(log.action || '').toLowerCase();
    const performedBy = String(log.performedBy || log.userName || log.userId || '').toLowerCase();
    const targetUserId = String(log.targetUserId || '').toLowerCase();
    const details = String(log.details || '').toLowerCase();
    const ip = String(log.ip || '').toLowerCase();

    const matchSearch =
      !q ||
      action.includes(q) ||
      performedBy.includes(q) ||
      targetUserId.includes(q) ||
      details.includes(q) ||
      ip.includes(q);

    const matchAction =
      actionFilter === 'all' ||
      log.action === actionFilter ||
      (actionFilter === 'LOGIN' && (log.action === 'USER_LOGIN' || log.action === 'LOGIN_SUCCESS' || log.action === 'LOGIN_FAILED')) ||
      (actionFilter === 'CREDENTIALS' && (log.action === 'RESET_PASSWORD' || log.action === 'PASSWORD_RESET')) ||
      (actionFilter === 'ACCOUNTS' && (log.action === 'CREATE_USER' || log.action === 'UPDATE_USER' || log.action === 'STATUS_CHANGE' || log.action === 'DELETE_USER'));

    // Date filtering
    let matchDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp || log.at || Date.now());
      const now = new Date();
      if (dateFilter === 'today') {
        matchDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchDate = logDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchDate = logDate >= thirtyDaysAgo;
      }
    }

    return matchSearch && matchAction && matchDate;
  });

  // Calculate audit stats
  const totalEvents = logs.length;
  const loginEvents = logs.filter((l) => l.action?.includes('LOGIN')).length;
  const credentialEvents = logs.filter((l) => l.action?.includes('PASSWORD') || l.action?.includes('RESET')).length;
  const userLifecycleEvents = logs.filter((l) => l.action?.includes('USER') || l.action?.includes('STATUS')).length;

  return (
    <div className="central-admin-content audit-logs-page">
      {/* Hero Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-info">
          <div className="admin-hero-badge">
            <ShieldCheck size={13} />
            <span>IMMUTABLE AUDIT LOG</span>
          </div>
          <h2>Security & System Audit Trail</h2>
          <p>
            Chronological audit log tracking authentication attempts, credential modifications, user management events, and system administration.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button
            type="button"
            className="btn-action-secondary"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
        </div>
      </div>

      {/* Audit Stats Summary Chips */}
      <div className="user-metric-pills-row">
        <div className="user-metric-pill">
          <Activity size={14} className="text-blue" />
          <span>Total Events: <strong>{totalEvents}</strong></span>
        </div>
        <div className="user-metric-pill">
          <Clock size={14} className="text-emerald" />
          <span>Login Records: <strong>{loginEvents}</strong></span>
        </div>
        <div className="user-metric-pill">
          <KeyRound size={14} className="text-amber" />
          <span>Credential Events: <strong>{credentialEvents}</strong></span>
        </div>
        <div className="user-metric-pill">
          <UserPlus size={14} className="text-purple" />
          <span>Account Changes: <strong>{userLifecycleEvents}</strong></span>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="section-title-wrap">
            <h3>Audit Records & Security Events</h3>
            <p>Search and filter system logs by action category, user ID, or date range</p>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="admin-table-toolbar">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by action, user, IP, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="toolbar-search-input"
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <div className="filter-select-group">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="all">All Action Categories</option>
              <option value="LOGIN">Logins & Sessions</option>
              <option value="CREDENTIALS">Password & Credentials</option>
              <option value="ACCOUNTS">Account Provisioning</option>
              <option value="CREATE_USER">User Created</option>
              <option value="UPDATE_USER">User Updated</option>
              <option value="RESET_PASSWORD">Password Reset</option>
              <option value="STATUS_CHANGE">Status Changed</option>
              <option value="DELETE_USER">User Deleted</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>Performed By</th>
                <th>Target User</th>
                <th>Event Details</th>
                <th>IP / Origin</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-table">
                    No audit records matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => {
                  const actionStr = String(l.action || 'ACTION');
                  const timeStr = l.timestamp || l.at || Date.now();
                  const author = l.performedBy || l.userName || l.userId || 'System';
                  const target = l.targetUserId || (l.details?.match(/@\w+/) ? l.details.match(/@\w+/)[0] : null);

                  return (
                    <tr key={l.id}>
                      <td>
                        <span className="timestamp-text">
                          {new Date(timeStr).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`activity-action-tag tag-${actionStr.toLowerCase()}`}>
                          {actionStr}
                        </span>
                      </td>
                      <td>
                        <strong className="text-slate-200">{author}</strong>
                      </td>
                      <td>
                        {target ? <code>{target}</code> : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <span className="audit-detail-text">{l.details}</span>
                      </td>
                      <td>
                        <span className="log-ip">{l.ip || '127.0.0.1'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
