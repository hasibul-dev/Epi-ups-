import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, X, Check } from 'lucide-react';

export default function ChangePasswordModal({ onClose }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (newPass.length < 4) {
      setError('New password must be at least 4 characters long.');
      setSuccess('');
      return;
    }

    if (newPass !== confirmPass) {
      setError('New passwords do not match.');
      setSuccess('');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const activeToken =
        localStorage.getItem('epi_ups_auth_token') ||
        sessionStorage.getItem('epi_ups_auth_token') ||
        localStorage.getItem('epi_ups_password') ||
        '';

      // 1. Persist to MongoDB with backend verification & bcrypt hashing
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-crm-auth': activeToken,
        },
        body: JSON.stringify({
          currentPassword: currentPass.trim(),
          newPassword: newPass.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (data.token) {
          if (localStorage.getItem('epi_ups_auth_unlocked') === 'true') {
            localStorage.setItem('epi_ups_auth_token', data.token);
          }
          if (sessionStorage.getItem('epi_ups_auth_unlocked') === 'true') {
            sessionStorage.setItem('epi_ups_auth_token', data.token);
          }
        }
        localStorage.removeItem('epi_ups_password');
        sessionStorage.removeItem('epi_ups_password');

        setSuccess('Password updated and saved permanently to database!');
        setError('');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.error || 'Failed to update password in database.');
      }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        setError('Password update timed out. Please check your mobile data or Wi-Fi connection.');
      } else {
        setError('Network error while updating password.');
      }
    } finally {
      clearTimeout(timer);
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon">
              <KeyRound size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3>Security &amp; Password Settings</h3>
              <p className="modal-sub">Update portal protection password</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {error && <div className="modal-alert alert-error">{error}</div>}
        {success && <div className="modal-alert alert-success">{success}</div>}

        <form onSubmit={handleSave} className="modal-form">
          <div className="modal-field">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password (min. 4 characters)"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions" style={{ justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Check size={14} strokeWidth={2.4} /> Save Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
