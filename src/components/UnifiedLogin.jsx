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
      title: 'Super Administrator',
      desc: 'Central control hub & user provisioning',
      icon: Shield,
      accent: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.35)',
    },
    {
      id: 'sales',
      name: 'Sales Department',
      title: 'Commercial & Sales',
      desc: 'Clients master, follow-ups & quotations',
      icon: Briefcase,
      accent: '#34d399',
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.35)',
    },
    {
      id: 'service',
      name: 'Service Department',
      title: 'Technical & Engineering',
      desc: 'Servicing, maintenance & installation',
      icon: Wrench,
      accent: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.1)',
      border: 'rgba(251, 191, 36, 0.35)',
    },
    {
      id: 'accounts',
      name: 'Accounts & ERP',
      title: 'Finance & Accounting',
      desc: 'General ledger, Mushak-9.1 & invoices',
      icon: Landmark,
      accent: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.1)',
      border: 'rgba(167, 139, 250, 0.35)',
    },
  ];

  const currentDeptObj = departments.find((d) => d.id === selectedDept) || departments[0];

  const handleSelectDept = (deptId) => {
    setSelectedDept(deptId);
    setError('');
    // Note: Do NOT fill User ID or Password. User must type manually.
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
      // Authenticate with centralized bcrypt credential verification
      const res = await login(userId.trim(), password, remember);
      const authUser = res?.user;

      if (!authUser) {
        throw new Error('Authentication failed. No user record returned.');
      }

      // Check role & department permissions for the selected department
      const isSuper = authUser.role === 'superadmin';
      const userDepts = authUser.departments || [];

      if (!isSuper && !userDepts.includes(selectedDept)) {
        throw new Error(
          `Access Denied: Your account (@${authUser.userId}) is not authorized to access ${currentDeptObj.name}. Please select your assigned department or contact the Administrator.`
        );
      }

      // Route to the selected authorized department
      if (selectedDept === 'sales') {
        navigate('/sales');
      } else if (selectedDept === 'service') {
        navigate('/service');
      } else if (selectedDept === 'accounts') {
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
      <div className="login-card" style={{ maxWidth: 540 }}>
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
          <span>Department-Guarded Single Sign-On (SSO) Portal</span>
        </div>

        {/* 1. Department Selection Options */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
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
            <span>Step 1: Select Target Department</span>
            <span style={{ fontSize: 11, color: currentDeptObj.accent, fontWeight: 600 }}>
              {currentDeptObj.name}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}
          >
            {departments.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleSelectDept(dept.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '11px 12px',
                    borderRadius: 9,
                    background: isSelected ? dept.bg : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected
                      ? `2px solid ${dept.accent}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 0 12px ${dept.border}` : 'none',
                  }}
                >
                  <div
                    style={{
                      background: isSelected ? dept.border : 'rgba(255, 255, 255, 0.05)',
                      padding: 7,
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#ffffff' : dept.accent,
                      marginTop: 2,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: isSelected ? '#ffffff' : '#e2e8f0',
                      }}
                    >
                      {dept.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: isSelected ? dept.accent : '#64748b',
                        marginTop: 2,
                      }}
                    >
                      {dept.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Department Indicator */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: currentDeptObj.bg,
            border: `1px solid ${currentDeptObj.border}`,
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <currentDeptObj.icon size={16} style={{ color: currentDeptObj.accent }} />
            <span style={{ color: '#f1f5f9' }}>
              Signing in to: <strong style={{ color: currentDeptObj.accent }}>{currentDeptObj.name}</strong>
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Manual Credential Check</span>
        </div>

        {error && (
          <div className="login-alert-danger" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Manual Authentication Form */}
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
                placeholder="Enter password"
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
            style={{
              background: `linear-gradient(135deg, ${currentDeptObj.accent} 0%, #1a73e8 100%)`,
              border: 'none',
              boxShadow: `0 4px 14px ${currentDeptObj.border}`,
            }}
          >
            {loading ? (
              <span>Authenticating credentials...</span>
            ) : (
              <>
                <span>Sign In to {currentDeptObj.name}</span>
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
