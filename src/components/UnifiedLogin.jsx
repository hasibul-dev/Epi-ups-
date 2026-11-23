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
  Share2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function UnifiedLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState('admin');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    {
      id: 'admin',
      name: 'Executive Admin',
      shortName: 'Executive Admin',
      title: 'Super Administrator',
      icon: Shield,
      accent: '#ff4d5e',
      bg: 'rgba(229, 25, 45, 0.12)',
      border: 'rgba(229, 25, 45, 0.38)',
      glow: 'rgba(229, 25, 45, 0.25)',
      gradient: 'linear-gradient(135deg, #e5192d 0%, #ff4d5e 100%)',
    },
    {
      id: 'sales',
      name: 'Sales Department',
      shortName: 'Sales',
      title: 'Commercial & Sales',
      icon: Briefcase,
      accent: '#38bdf8',
      bg: 'rgba(26, 115, 232, 0.12)',
      border: 'rgba(26, 115, 232, 0.38)',
      glow: 'rgba(26, 115, 232, 0.25)',
      gradient: 'linear-gradient(135deg, #0052cc 0%, #1a73e8 100%)',
    },
    {
      id: 'service',
      name: 'Service Department',
      shortName: 'Service',
      title: 'Technical & Engineering',
      icon: Wrench,
      accent: '#34d399',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.38)',
      glow: 'rgba(16, 185, 129, 0.25)',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    },
    {
      id: 'accounts',
      name: 'Accounts & ERP',
      shortName: 'Accounts',
      title: 'Finance & Accounting',
      icon: Landmark,
      accent: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.38)',
      glow: 'rgba(245, 158, 11, 0.25)',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    },
    {
      id: 'marketing',
      name: 'Digital Marketing & IT Support',
      shortName: 'Marketing & IT',
      title: 'Digital Marketing & IT Support',
      icon: Share2,
      accent: '#c084fc',
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.38)',
      glow: 'rgba(168, 85, 247, 0.25)',
      gradient: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
    },
  ];

  const currentDeptObj = departments.find((d) => d.id === selectedDept) || departments[0];

  const handleSelectDept = (deptId) => {
    setSelectedDept(deptId);
    setError('');
  };

  const handleQuickFill = (userVal, passVal, deptVal) => {
    setUserId(userVal);
    setPassword(passVal);
    setSelectedDept(deptVal);
    setError('');
  };

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
      const authUser = res?.user;

      if (!authUser) {
        throw new Error('Authentication failed. No user record returned.');
      }

      const isSuper = authUser.role === 'superadmin';
      const userDepts = authUser.departments || [];

      if (!isSuper && !userDepts.includes(selectedDept)) {
        throw new Error(
          `Access Denied: Your account (@${authUser.userId}) is not authorized to access ${currentDeptObj.name}. Please select your assigned department or contact the Administrator.`
        );
      }

      if (selectedDept === 'sales') {
        navigate('/sales');
      } else if (selectedDept === 'service') {
        navigate('/service');
      } else if (selectedDept === 'accounts') {
        navigate('/accounts');
      } else if (selectedDept === 'marketing') {
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
      {/* Dynamic ambient lighting canvas */}
      <div className="login-ambient-orb login-orb-1" aria-hidden="true" />
      <div className="login-ambient-orb login-orb-2" aria-hidden="true" />
      <div className="login-ambient-orb login-orb-3" aria-hidden="true" />

      <div className="login-card" style={{ maxWidth: 560 }}>
        {/* Brand Banner */}
        <div className="login-brand-header">
          <div className="login-logo-ring">
            <img src="/logo.png" alt="EPI UPS Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">EPI UPS</h1>
          <span className="login-brand-sub">BANGLADESH LIMITED</span>
          <p className="login-subtitle">Centralized Enterprise ERP Management Console</p>
        </div>

        <div className="login-sso-badge">
          <Sparkles size={13} className="text-sky-400" />
          <span>Role-Guarded Enterprise Single Sign-On (SSO) Portal</span>
        </div>

        {/* Department Switcher Pills */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Target Department</span>
            <span style={{ fontSize: 11, color: currentDeptObj.accent, fontWeight: 600 }}>
              {currentDeptObj.name}
            </span>
          </div>

          <div className="login-dept-grid">
            {departments.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleSelectDept(dept.id)}
                  className={`login-dept-pill ${isSelected ? `selected selected-${dept.id}` : ''}`}
                  title={`Select ${dept.name}`}
                  aria-pressed={isSelected}
                >
                  <Icon size={14} className="login-dept-icon" />
                  <span className="login-dept-label">{dept.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Department Indicator */}
        <div
          style={{
            padding: '9px 13px',
            borderRadius: 10,
            background: currentDeptObj.bg,
            border: `1px solid ${currentDeptObj.border}`,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <currentDeptObj.icon size={15} style={{ color: currentDeptObj.accent }} />
            <span style={{ color: '#f1f5f9' }}>
              Target: <strong style={{ color: currentDeptObj.accent }}>{currentDeptObj.name}</strong>
            </span>
          </div>
          <span style={{ fontSize: 10.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} color="#10b981" />
            <span>Active Target</span>
          </span>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="login-alert-danger" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-field">
            <label className="form-label">
              <User size={15} /> User ID or Work Email
            </label>
            <input
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

          <div className="form-group-field">
            <label className="form-label">
              <KeyRound size={15} /> Password
            </label>
            <div className="input-with-action">
              <input
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              <span>Keep session signed in</span>
            </label>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
            style={{
              background: currentDeptObj.gradient || `linear-gradient(135deg, ${currentDeptObj.accent} 0%, #1a73e8 100%)`,
              border: 'none',
              boxShadow: `0 4px 18px ${currentDeptObj.glow || currentDeptObj.border}`,
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="login-spinner-sm" />
                <span>Authenticating credentials...</span>
              </span>
            ) : (
              <>
                <span>Sign In to {currentDeptObj.name}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Bar */}
        <div
          style={{
            marginTop: 20,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 750,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Zap size={12} color="#fbbf24" /> Quick Demo Test Logins
            </span>
            <span style={{ fontSize: 10.5, color: '#64748b' }}>Pass: password123</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'password123', 'admin')}
              className="btn-glass-action btn-glass-red"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="Super Administrator (Full access)"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sales1', 'password123', 'sales')}
              className="btn-glass-action btn-glass-blue"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="Sales Manager"
            >
              Sales
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('service1', 'password123', 'service')}
              className="btn-glass-action btn-glass-emerald"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="Service Lead Engineer"
            >
              Service
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('accounts1', 'password123', 'accounts')}
              className="btn-glass-action btn-glass-amber"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="Chief Accountant"
            >
              Accounts ERP
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('marketing1', 'password123', 'marketing')}
              className="btn-glass-action btn-glass-purple"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="Marketing Manager"
            >
              Marketing
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('it1', 'password123', 'marketing')}
              className="btn-glass-action btn-glass-cyan"
              style={{ fontSize: 11, padding: '3px 8px' }}
              title="IT Support Engineer"
            >
              IT Support
            </button>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="login-footer-meta">
          <div className="meta-security-badge">
            <Lock size={12} />
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
