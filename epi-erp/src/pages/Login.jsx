import React from 'react';
import { Icons } from '../components/icons.jsx';

export default function Login() {
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || 'http://localhost:5050';

  return (
    <div className="login-wrap">
      <div className="card login" style={{ maxWidth: 440, textAlign: 'center', padding: '36px 32px' }}>
        <img src="/logo.png" alt="EPI" style={{ height: 48, margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: 20, margin: '0 0 6px', fontWeight: 700 }}>EPI Accounts Department</h2>
        <p className="muted" style={{ margin: '0 0 24px', fontSize: 13.5 }}>
          Unified Single Sign-On (SSO) Portal
        </p>

        <div style={{ background: 'rgba(0, 82, 204, 0.08)', border: '1px solid rgba(0, 82, 204, 0.25)', borderRadius: 10, padding: '14px 16px', textAlign: 'left', marginBottom: 24, fontSize: 13, lineHeight: 1.5, color: 'var(--fg)' }}>
          <div style={{ fontWeight: 600, color: 'var(--primary, #0052cc)', marginBottom: 4 }}>
            Centralized Access Control
          </div>
          Employee authentication and accounting permissions are managed exclusively from the <strong>EPI Central Admin Panel</strong>. Local login forms and standalone password setups are disabled.
        </div>

        <a
          href={centralUrl}
          className="btn primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 20px',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          <span>Sign In via Central Portal</span>
          <span>→</span>
        </a>

        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--muted, #64748b)' }}>
          EPI UPS Bangladesh Limited · Double-Entry Financial System
        </div>
      </div>
    </div>
  );
}
