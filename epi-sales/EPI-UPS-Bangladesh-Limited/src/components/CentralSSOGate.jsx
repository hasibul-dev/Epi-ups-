import React from 'react';
import { ShieldAlert, ArrowRight, Lock, ExternalLink } from 'lucide-react';

export default function CentralSSOGate({ user, permissionDenied }) {
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || 'http://localhost:5050';

  if (permissionDenied && user) {
    return (
      <div className="lock-wrapper">
        <div className="lock-card" style={{ maxWidth: 460, textAlign: 'center' }}>
          <div className="lock-header">
            <div className="lock-logo-badge" style={{ background: 'rgba(229, 25, 45, 0.15)', borderColor: 'rgba(229, 25, 45, 0.3)' }}>
              <ShieldAlert size={36} color="#f87171" />
            </div>
            <h1 className="lock-title" style={{ color: '#f87171' }}>Access Restricted</h1>
            <p className="lock-sub">
              Your employee account (<code style={{ color: '#38bdf8' }}>@{user.userId || user.name}</code>) is not assigned to the <strong>EPI Sales Department</strong>.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: 24, fontSize: 13, color: '#94a3b8', lineHeight: 1.6, textAlign: 'left' }}>
            <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>Department Permission Required</div>
            The EPI Centralized Management System enforces strict department-based access control. Contact your Super Admin to grant you access to Sales.
          </div>

          <a
            href={centralUrl}
            className="lock-submit-btn"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span>Return to Central Portal</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="lock-wrapper">
      <div className="lock-card" style={{ maxWidth: 460, textAlign: 'center' }}>
        <div className="lock-header">
          <div className="lock-logo-badge">
            <img src="/logo.png" alt="EPI Logo" className="lock-logo-img" />
          </div>
          <h1 className="lock-title">EPI Sales Department</h1>
          <p className="lock-sub">
            Centralized Single Sign-On (SSO) Portal
          </p>
        </div>

        <div style={{ background: 'rgba(0, 82, 204, 0.08)', padding: '16px', borderRadius: 12, border: '1px solid rgba(0, 82, 204, 0.25)', marginBottom: 24, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, textAlign: 'left' }}>
          <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={15} /> Unified Central Authentication
          </div>
          All employee logins and department permissions are managed centrally from the EPI Central Control Center. Direct standalone logins are disabled.
        </div>

        <a
          href={centralUrl}
          className="lock-submit-btn"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span>Sign In via Central Portal</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
