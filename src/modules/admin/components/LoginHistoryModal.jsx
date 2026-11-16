import React, { useState, useEffect } from 'react';
import { X, Clock, Shield, Globe, Monitor, RefreshCw, UserCheck } from 'lucide-react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';

export default function LoginHistoryModal({ user, onClose }) {
  const { token } = useCentralAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/admin/users/${user.id}/login-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setHistory(data.history || []);
        } else {
          setError(data.error || 'Failed to fetch login history.');
        }
      } catch (err) {
        setError(err.message || 'Network error fetching login history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, token]);

  const formatDate = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  const parseUserAgent = (ua) => {
    if (!ua || ua === 'Unknown') return 'Web Browser / Client';
    if (ua.includes('Windows')) return 'Windows Desktop';
    if (ua.includes('Macintosh')) return 'Mac OS Desktop';
    if (ua.includes('Android')) return 'Android Mobile';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Device';
    if (ua.includes('Linux')) return 'Linux Workstation';
    return 'Web Browser';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Clock size={22} className="modal-header-icon" />
            <div>
              <h3>Login History & Session Audit</h3>
              <p>
                Authentication activity for <strong>{user?.name}</strong> (<code>@{user?.userId}</code>)
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {error && (
            <div className="login-alert-danger" style={{ marginBottom: 16 }}>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 8px' }} />
              <p>Loading security audit logs...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
              <Shield size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>No recorded login activity yet for this account.</p>
              <span style={{ fontSize: 12, color: '#475569' }}>
                Login timestamps and client metadata will automatically appear here when this user signs in.
              </span>
            </div>
          ) : (
            <div className="history-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="users-table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Date & Time</th>
                    <th>IP Address</th>
                    <th>Device / Client</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f1f5f9', fontWeight: 500 }}>
                          <Clock size={13} color="#38bdf8" />
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                          <Globe size={13} color="#a78bfa" />
                          <code style={{ fontSize: 12, color: '#e2e8f0' }}>{entry.ip || '127.0.0.1'}</code>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                          <Monitor size={13} color="#34d399" />
                          <span>{parseUserAgent(entry.userAgent)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-actions-footer">
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Total Recorded Sessions: <strong>{history.length}</strong>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
