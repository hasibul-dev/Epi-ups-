import React, { useState, useEffect } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import { ShieldCheck, RefreshCw, Search, Clock, User, Filter } from 'lucide-react';

export default function AuditLogsView() {
  const { token } = useCentralAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit-logs?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.performedBy && log.performedBy.toLowerCase().includes(q)) ||
      (log.targetUserId && log.targetUserId.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q));

    const matchAction = actionFilter === 'all' || log.action === actionFilter;

    return matchSearch && matchAction;
  });

  return (
    <div className="central-admin-content">
      <div className="admin-hero-banner">
        <div className="admin-hero-info">
          <h2>Security & System Audit Log</h2>
          <p>Complete historical log of all login events, account creations, credential changes, and permission assignments.</p>
        </div>
        <div className="admin-hero-actions">
          <button
            className="btn-action-secondary"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin-anim' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-table-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search audit events, users, or details..."
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
              <option value="all">All Action Types</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_UPDATED">User Updated</option>
              <option value="PASSWORD_RESET">Password Reset</option>
              <option value="USER_DEACTIVATED">User Deactivated</option>
              <option value="USER_ACTIVATED">User Activated</option>
              <option value="USER_DELETED">User Deleted</option>
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>Performed By</th>
                <th>Target Employee</th>
                <th>Event Details</th>
                <th>IP Address</th>
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
                filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span className="timestamp-text">
                        {new Date(l.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`activity-action-tag tag-${(l.action || '').toLowerCase()}`}>
                        {l.action}
                      </span>
                    </td>
                    <td>
                      <strong>{l.performedBy}</strong>
                    </td>
                    <td>
                      {l.targetUserId ? <code>{l.targetUserId}</code> : '—'}
                    </td>
                    <td>
                      <span className="audit-detail-text">{l.details}</span>
                    </td>
                    <td>
                      <span className="log-ip">{l.ip}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
