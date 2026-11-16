import React, { useState } from 'react';
import { X, KeyRound, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';

export default function ResetPasswordModal({ targetUser, onClose, onSuccess }) {
  const { token } = useCentralAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 14; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${targetUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      onSuccess(targetUser.userId, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Error resetting password.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <KeyRound size={20} className="modal-header-icon" />
            <div>
              <h3>Reset Employee Password</h3>
              <p>Assign a new password for {targetUser.name} ({targetUser.userId})</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="login-alert-danger" style={{ margin: '14px 20px 0' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-group-field">
            <div className="field-header-split">
              <label className="form-label">New Password</label>
              <button
                type="button"
                className="btn-text-action"
                onClick={generatePassword}
              >
                <Sparkles size={13} /> Auto-Generate
              </button>
            </div>
            <div className="input-with-action">
              <input
                type={showPassword ? 'text' : 'password'}
                className="text-input"
                placeholder="Enter or generate new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
              {password && (
                <button
                  type="button"
                  className="input-inline-btn"
                  onClick={copyToClipboard}
                  title="Copy password to clipboard"
                >
                  {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            <span className="field-hint">
              Minimum 8 characters. Share this password securely with the employee.
            </span>
          </div>

          <div className="modal-actions-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !password}
            >
              {submitting ? 'Resetting...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
