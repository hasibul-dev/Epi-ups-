import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export default function UnifiedLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = userId.trim();
    if (!cleanUser) {
      setError('Please enter your assigned User ID or Work Email.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(cleanUser, password, remember);
      const authUser = res?.user;

      if (!authUser) {
        throw new Error('Authentication failed. No user record returned.');
      }

      // Automatic department redirection based on authenticated user record
      const isSuper = authUser.role === 'superadmin';
      const userDepts = authUser.departments || [];

      if (isSuper) {
        navigate('/admin');
      } else if (userDepts.includes('sales')) {
        navigate('/sales');
      } else if (userDepts.includes('service')) {
        navigate('/service');
      } else if (userDepts.includes('accounts')) {
        navigate('/accounts');
      } else if (userDepts.includes('marketing')) {
        navigate('/marketing');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Dynamic ambient lighting canvas with floating subtle gradient orbs */}
      <div className="login-ambient-orb login-orb-1" aria-hidden="true" />
      <div className="login-ambient-orb login-orb-2" aria-hidden="true" />
      <div className="login-ambient-orb login-orb-3" aria-hidden="true" />

      {/* Main Glassmorphism Login Card */}
      <div className="login-card login-card-redesign">
        {/* Top Gradient Highlight Bar */}
        <div className="login-card-top-bar" />

        {/* 1. EPI UPS Logo, Title & Taglines */}
        <div className="login-brand-header">
          {/* 1. Logo */}
          <div className="login-logo-ring">
            <img src="/logo.png" alt="EPI UPS Logo" className="login-logo-img" />
          </div>

          {/* 2. EPI UPS */}
          <h1 className="login-title">EPI UPS</h1>

          {/* 3. BANGLADESH LIMITED */}
          <span className="login-brand-sub">BANGLADESH LIMITED</span>

          {/* 4. Centralized Enterprise ERP Management Console */}
          <p className="login-subtitle">Centralized Enterprise ERP Management Console</p>
        </div>

        {/* 5. Secure Enterprise Single Sign-On badge */}
        <div className="login-sso-badge">
          <ShieldCheck size={14} className="text-cyan-400 flex-shrink-0" />
          <span>Secure Enterprise Single Sign-On</span>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="login-alert-danger" role="alert">
            <AlertCircle size={17} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* 6. User ID or Work Email input */}
          <div className="form-group-field">
            <label className="form-label" htmlFor="login-username-input">
              <User size={14} className="text-sky-400" />
              <span>User ID or Work Email</span>
            </label>
            <input
              id="login-username-input"
              type="text"
              className="text-input"
              placeholder="e.g. admin, sales1, service1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
              autoFocus
              autoComplete="username"
            />
          </div>

          {/* 7. Password input & 8. Show / Hide Password icon */}
          <div className="form-group-field">
            <label className="form-label" htmlFor="login-password-input">
              <KeyRound size={14} className="text-purple-400" />
              <span>Password</span>
            </label>
            <div className="input-with-action">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                className="text-input"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-inline-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Session options */}
          <div className="login-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Keep session signed in</span>
            </label>
          </div>

          {/* 9. One Sign In button */}
          <button
            type="submit"
            className="login-submit-btn-premium group"
            disabled={loading || !userId.trim() || !password}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="login-spinner-sm" />
                <span>Authenticating credentials...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign In to Enterprise ERP</span>
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>
        </form>

        {/* 10. Small security and copyright footer */}
        <div className="login-footer-meta">
          <div className="meta-security-badge">
            <Lock size={12} className="text-emerald-400" />
            <span>Enterprise-Grade Bcrypt Encryption & RBAC Guarded</span>
          </div>
          <p className="login-copy">
            © {new Date().getFullYear()} EPI UPS Bangladesh Limited. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
