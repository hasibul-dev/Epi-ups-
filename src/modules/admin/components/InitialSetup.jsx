import React, { useState } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import { ShieldCheck, User, KeyRound, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function InitialSetup() {
  const { setupAdmin } = useCentralAuth();
  const [userId, setUserId] = useState('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Please enter a Super Admin User ID.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter the Super Admin full name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await setupAdmin({
        userId: userId.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err.message || 'Setup failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card setup-card">
        {/* Brand Banner */}
        <div className="login-brand-header">
          <div className="login-logo-ring">
            <img src="/logo.png" alt="EPI UPS Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">EPI CENTRAL ADMIN</h1>
          <p className="login-subtitle">Master System Initialization & Setup</p>
        </div>

        <div className="setup-notice-banner">
          <ShieldCheck size={20} className="setup-shield-icon" />
          <div>
            <strong>First-Time Super Admin Configuration</strong>
            <p>Configure the initial master administrator account. This account will have full authority across Service, Sales, and Accounts departments.</p>
          </div>
        </div>

        {error && (
          <div className="login-alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-field">
            <label className="form-label">
              <User size={15} /> Super Admin User ID <span className="req">*</span>
            </label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. admin or epi_admin"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={submitting}
            />
            <span className="field-hint">Used to sign in to the EPI Central Admin panel.</span>
          </div>

          <div className="form-group-field">
            <label className="form-label">
              <User size={15} /> Administrator Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Master Administrator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label">
              <Mail size={15} /> Administrator Email (Optional)
            </label>
            <input
              type="email"
              className="text-input"
              placeholder="admin@epiups.com.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group-field">
            <div className="field-header-split">
              <label className="form-label">
                <KeyRound size={15} /> Master Password <span className="req">*</span>
              </label>
              <button
                type="button"
                className="btn-text-action"
                onClick={generateStrongPassword}
                tabIndex={-1}
              >
                <Sparkles size={13} /> Auto-Generate
              </button>
            </div>
            <div className="input-with-action">
              <input
                type={showPassword ? 'text' : 'password'}
                className="text-input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="input-inline-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group-field">
            <label className="form-label">
              <KeyRound size={15} /> Confirm Master Password <span className="req">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="text-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={submitting}
          >
            {submitting ? 'Initializing Master System...' : (
              <>
                Initialize Super Admin & Open Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="setup-footer-note">
          Security policy: No default or hardcoded credentials. All credentials are encrypted with bcrypt and stored locally.
        </div>
      </div>
    </div>
  );
}
