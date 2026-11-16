import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, KeyRound, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function InitialSetup() {
  const { setupAdmin } = useAuth();
  const navigate = useNavigate();
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
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Setup failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: 520 }}>
        <div className="login-brand-header">
          <div className="login-logo-ring">
            <ShieldCheck size={36} color="#1a73e8" />
          </div>
          <h1 className="login-title">First-Time System Setup</h1>
          <p className="login-subtitle">Initialize Master Super Admin Account</p>
        </div>

        <div style={{ background: 'rgba(26, 115, 232, 0.08)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(26, 115, 232, 0.25)', marginBottom: 20, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
          Welcome to the <strong>EPI Centralized Management System</strong>. Please create your primary Super Administrator account. This master account has complete administrative control over all 4 departments (Admin, Sales, Service, and ERP / Accounts).
        </div>

        {error && (
          <div className="login-alert-danger" style={{ marginBottom: 16 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-field">
            <label className="form-label">
              <User size={15} /> Super Admin User ID
            </label>
            <input
              type="text"
              className="text-input font-mono"
              placeholder="e.g. admin"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label">Administrator Full Name</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Md. Rifat Habibullah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label">
              <Mail size={15} /> Official Email Address (Optional)
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
                <KeyRound size={15} /> Master Password
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
                className="text-input font-mono"
                placeholder="At least 8 characters"
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
            <label className="form-label">Confirm Master Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="text-input font-mono"
              placeholder="Re-enter master password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={submitting}
            style={{ marginTop: 12 }}
          >
            {submitting ? (
              <span>Initializing secure admin account...</span>
            ) : (
              <>
                <span>Complete Initial Setup</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
