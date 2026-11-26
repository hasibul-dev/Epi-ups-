import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, ShieldCheck, KeyRound, Check, AlertCircle, Briefcase, Wrench, Landmark } from 'lucide-react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';

export default function UserProfileModal({ onClose }) {
  const { user, token } = useCentralAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSuperAdmin = user?.role === 'superadmin';

  const getInitials = (name) => {
    if (!name) return 'EPI';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/change-own-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess('Your password has been successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const departments = user?.departments || [];

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-user-mgmt" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon" style={{ background: 'rgba(0, 82, 204, 0.15)', color: '#38bdf8' }}>
              <User size={20} />
            </div>
            <div>
              <h3>Employee Profile &amp; Security</h3>
              <p className="modal-subtitle">Centralized Account Information &amp; Credentials</p>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 24px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #0052cc' : '2px solid transparent',
              color: activeTab === 'profile' ? '#fff' : '#94a3b8',
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            User Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid #0052cc' : '2px solid transparent',
              color: activeTab === 'password' ? '#fff' : '#94a3b8',
              padding: '8px 14px',
              fontWeight: 600,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <KeyRound size={14} /> Change Password
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="modal-body" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #0052cc 0%, #e5192d 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(0, 82, 204, 0.3)',
                }}
              >
                {getInitials(user?.name)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 18, color: '#f8fafc', fontWeight: 700 }}>{user?.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>User ID: <code style={{ color: '#38bdf8' }}>@{user?.userId}</code></span>
                  <span style={{ fontSize: 11, background: isSuperAdmin ? 'rgba(229, 25, 45, 0.15)' : 'rgba(0, 82, 204, 0.15)', color: isSuperAdmin ? '#f87171' : '#60a5fa', padding: '2px 8px', borderRadius: 999, fontWeight: 700, textTransform: 'uppercase' }}>
                    {isSuperAdmin ? 'Super Admin' : 'Employee'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>Email Address</span>
                <div style={{ fontSize: 13.5, color: '#e2e8f0', marginTop: 4, fontWeight: 500 }}>
                  {user?.email || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Not configured</span>}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>Account Status</span>
                <div style={{ fontSize: 13.5, color: '#34d399', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Active
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                Authorized Department Access &amp; Roles
              </span>
              <div style={{ display: 'grid', gap: 8 }}>
                {/* Sales */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: (isSuperAdmin || departments.includes('sales')) ? 'rgba(0, 82, 204, 0.08)' : 'rgba(255, 255, 255, 0.02)', border: (isSuperAdmin || departments.includes('sales')) ? '1px solid rgba(0, 82, 204, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Briefcase size={16} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f1f5f9' }}>EPI Sales Department</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                        Role: {isSuperAdmin ? 'Full Administrator' : (user?.departmentRoles?.sales || 'Sales Representative')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: (isSuperAdmin || departments.includes('sales')) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)', color: (isSuperAdmin || departments.includes('sales')) ? '#34d399' : '#64748b' }}>
                    {(isSuperAdmin || departments.includes('sales')) ? 'Authorized' : 'Restricted'}
                  </span>
                </div>

                {/* Service */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: (isSuperAdmin || departments.includes('service')) ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)', border: (isSuperAdmin || departments.includes('service')) ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Wrench size={16} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f1f5f9' }}>EPI Service Department</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                        Role: {isSuperAdmin ? 'Full Administrator' : (user?.departmentRoles?.service || 'Service Engineer')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: (isSuperAdmin || departments.includes('service')) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)', color: (isSuperAdmin || departments.includes('service')) ? '#34d399' : '#64748b' }}>
                    {(isSuperAdmin || departments.includes('service')) ? 'Authorized' : 'Restricted'}
                  </span>
                </div>

                {/* Accounts */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: (isSuperAdmin || departments.includes('accounts')) ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)', border: (isSuperAdmin || departments.includes('accounts')) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Landmark size={16} color="#34d399" />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f1f5f9' }}>EPI Accounts Department (ERP)</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                        Role: {isSuperAdmin ? 'Full Administrator' : (user?.departmentRoles?.accounts || 'Accountant')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: (isSuperAdmin || departments.includes('accounts')) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)', color: (isSuperAdmin || departments.includes('accounts')) ? '#34d399' : '#64748b' }}>
                    {(isSuperAdmin || departments.includes('accounts')) ? 'Authorized' : 'Restricted'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button type="button" className="btn-modal-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="modal-body" style={{ padding: '20px 24px' }}>
            {error && (
              <div className="login-alert alert-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="login-alert alert-success" style={{ marginBottom: 16, background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing password"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={() => setActiveTab('profile')}>
                Back to Profile
              </button>
              <button type="submit" className="btn-modal-submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
