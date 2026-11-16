import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, Shield } from 'lucide-react';

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

    if (!userId.trim()) {
      setError('Please enter your assigned User ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(userId.trim(), password, remember);
      const target = res?.redirectDepartment;
      if (target === 'sales') {
        navigate('/sales');
      } else if (target === 'service') {
        navigate('/service');
      } else if (target === 'accounts') {
        navigate('/accounts');
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
      <div className="login-card">
        {/* Brand Banner */}
        <div className="login-brand-header">
          <div className="login-logo-ring">
            <img src="/logo.png" alt="EPI UPS Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">EPI UPS</h1>
          <span className="login-brand-sub">Bangladesh Limited</span>
          <p className="login-subtitle">Centralized Management System</p>
        </div>

        <div className="login-sso-badge">
          <Shield size={14} />
          <span>Unified Single Sign-On (SSO) Portal</span>
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
              <User size={15} /> User ID or Email
            </label>
            <input
              type="text"
              className="text-input"
              placeholder="Enter your assigned User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group-field">
            <label className="form-label">
              <KeyRound size={15} /> Password
            </label>
            <div className="input-with-action">
              <input
                type={showPassword ? 'text' : 'password'}
                className="text-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
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

          <div className="login-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating credentials...</span>
            ) : (
              <>
                <span>Sign In to EPI Workspace</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer-meta">
          <div className="meta-security-badge">
            <Lock size={12} />
            <span>End-to-End Bcrypt Encryption & RBAC Guarded</span>
          </div>
          <p className="login-copy">
            © {new Date().getFullYear()} EPI UPS Bangladesh Limited. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
