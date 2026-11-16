import React from 'react';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  const auth = useAuth() || {};
  const { accessDenied, deniedUser } = auth;
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5050' : 'https://epi-central-admin.vercel.app');

  if (accessDenied) {
    return (
      <div className="login-wrap">
        <div className="card login" style={{ maxWidth: 460, textAlign: 'center', padding: '36px 32px', borderColor: 'rgba(229, 25, 45, 0.4)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(229, 25, 45, 0.15)', border: '1px solid rgba(229, 25, 45, 0.3)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#ff2a3b', fontSize: 26, fontWeight: 700 }}>
            !
          </div>
          <h2 style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 700, color: '#f87171' }}>Access Restricted</h2>
          <p className="muted" style={{ margin: '0 0 20px', fontSize: 13.5 }}>
            Your employee account (<code style={{ color: '#38bdf8' }}>@{deniedUser?.userId || deniedUser?.name || 'employee'}</code>) is not assigned to the <strong>EPI Accounts / ERP Department</strong>.
          </p>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: '14px 16px', textAlign: 'left', marginBottom: 24, fontSize: 13, lineHeight: 1.5, color: '#94a3b8' }}>
            <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>
              Department Permission Required
            </div>
            The EPI Centralized Management System enforces strict department-based access control. Contact your Super Admin to grant you access to the Accounts department.
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
            <span>Return to Central Portal</span>
            <span>→</span>
          </a>
        </div>
      </div>
    );
  }

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
