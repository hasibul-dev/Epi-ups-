import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Shield,
  Briefcase,
  Wrench,
  Landmark,
  Sparkles,
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

  const demoAccounts = [
    {
      userId: 'admin',
      password: 'password123',
      deptName: 'Executive Admin',
      title: 'Super Administrator',
      badge: 'Full System Access',
      icon: Shield,
      accent: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.08)',
      border: 'rgba(56, 189, 248, 0.3)',
    },
    {
      userId: 'sales1',
      password: 'password123',
      deptName: 'Sales Department',
      title: 'Sales Executive',
      badge: 'Clients & Quotations',
      icon: Briefcase,
      accent: '#34d399',
      bg: 'rgba(52, 211, 153, 0.08)',
      border: 'rgba(52, 211, 153, 0.3)',
    },
    {
      userId: 'service1',
      password: 'password123',
      deptName: 'Service Department',
      title: 'Technical Engineer',
      badge: 'Servicing & Orders',
      icon: Wrench,
      accent: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.08)',
      border: 'rgba(251, 191, 36, 0.3)',
    },
    {
      userId: 'accounts1',
      password: 'password123',
      deptName: 'Accounts & ERP',
      title: 'Chief Accountant',
      badge: 'Ledger & Mushak-9.1',
      icon: Landmark,
      accent: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.08)',
      border: 'rgba(167, 139, 250, 0.3)',
    },
  ];

  const doLogin = async (uid, pwd, rem) => {
    setError('');
    try {
      setLoading(true);
      const res = await login(uid.trim(), pwd, rem);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter your assigned User ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    doLogin(userId, password, remember);
  };

  const handleQuickDemoLogin = (acc) => {
    setUserId(acc.userId);
    setPassword(acc.password);
    doLogin(acc.userId, acc.password, true);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: 520 }}>
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

        {/* 1-Click Demo Logins Section */}
        <div
          style={{
            marginBottom: 20,
            padding: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={13} style={{ color: '#fbbf24' }} />
              1-Click Department Quick Logins
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>Pre-filled & Instant</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}
          >
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.userId}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '9px 10px',
                    borderRadius: 8,
                    background: acc.bg,
                    border: `1px solid ${acc.border}`,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.filter = 'brightness(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: 6,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: acc.accent,
                      marginTop: 2,
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                      {acc.deptName}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                      ID: <strong style={{ color: acc.accent }}>{acc.userId}</strong>
                    </div>
                    <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 1 }}>
                      {acc.badge}
                    </div>
                  </div>
                </button>
              );
            })}
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
              <User size={15} /> User ID or Email
            </label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. admin, sales1, service1, accounts1"
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
