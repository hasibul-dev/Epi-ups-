import React, { useState } from 'react';
import {
  Zap,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

const CONFIGURED_USERNAME = 'rifathabibullah';

export default function LockScreen({ onUnlock }) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('epi_ups_username') || CONFIGURED_USERNAME;
  });
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const token = data.token;

        if (remember) {
          localStorage.setItem('epi_ups_auth_remember', 'true');
          localStorage.setItem('epi_ups_auth_unlocked', 'true');
          localStorage.setItem('epi_ups_auth_token', token);
          localStorage.setItem('epi_ups_username', username.trim());
          localStorage.removeItem('epi_ups_password');
        } else {
          localStorage.removeItem('epi_ups_auth_remember');
          localStorage.removeItem('epi_ups_auth_unlocked');
          localStorage.removeItem('epi_ups_auth_token');
          localStorage.removeItem('epi_ups_password');
          sessionStorage.setItem('epi_ups_auth_unlocked', 'true');
          sessionStorage.setItem('epi_ups_auth_token', token);
          sessionStorage.setItem('epi_ups_username', username.trim());
          sessionStorage.removeItem('epi_ups_password');
        }

        if (onUnlock) {
          onUnlock(token);
        }
      } else {
        setError(data.error || 'Invalid username or password. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        setError('Login connection timed out (15s). On mobile data, your operator (GP/Robi/Banglalink) may have high latency or DNS delays. Please retry or use Wi-Fi / 1.1.1.1 WARP.');
      } else {
        setError('Cannot connect to authentication service. Please check your internet connection or use Wi-Fi.');
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
    }
  };

  return (
    <div className="lock-wrapper">
      <div className={`lock-card ${shake ? 'shake-animation' : ''}`}>
        <div className="lock-header">
          <div className="lock-logo-badge">
            <img src="/logo.png" alt="EPI Logo" className="lock-logo-img" />
          </div>
          <h2>EPI UPS (Bangladesh) Ltd.</h2>
          <p className="lock-sub">Business Development Assistant &amp; CRM</p>
          <div className="lock-badge-pill">
            <span className="dot-pulse"></span> Authorized Staff Portal
          </div>
        </div>

        <div className="lock-body">
          <div className="lock-shield-title">
            <div className="lock-icon-circle">
              <Lock size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3>Sign In</h3>
              <p>Enter your credentials to access the CRM portal</p>
            </div>
          </div>

          {error && (
            <div className="lock-error-msg">
              <AlertCircle size={18} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="lock-form">
            <div className="lock-input-group">
              <label htmlFor="portal-user">Username</label>
              <div className="lock-input-container">
                <span className="lock-input-icon">
                  <User size={18} strokeWidth={2} />
                </span>
                <input
                  id="portal-user"
                  type="text"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="lock-input-group">
              <label htmlFor="portal-pass">Password</label>
              <div className="lock-input-container">
                <span className="lock-input-icon">
                  <Lock size={18} strokeWidth={2} />
                </span>
                <input
                  id="portal-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="lock-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="lock-remember-row">
              <label className="lock-checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button type="submit" className="lock-submit-btn" disabled={isLoading}>
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </form>
        </div>

        <div className="lock-footer">
          <small>&copy; {new Date().getFullYear()} EPI UPS (Bangladesh) Limited. All rights reserved.</small>
        </div>
      </div>
    </div>
  );
}
