import React, { useState, useEffect } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  Wrench,
  Landmark,
  Maximize2,
  Share2,
} from 'lucide-react';

export default function DepartmentWorkspaceView({ department, onBack }) {
  const { token, user } = useCentralAuth();
  const [ticket, setTicket] = useState('');
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [fullscreen, setFullscreen] = useState(false);

  const getDeptConfig = () => {
    switch (department) {
      case 'sales':
        return {
          title: 'EPI Sales Department',
          subtitle: 'Client Directory, Daily Work Schedules, Follow-ups & Activity Reports',
          port: 5173,
          icon: <Briefcase size={22} />,
          badgeClass: 'badge-blue',
          btnClass: 'sales-btn',
          themeClass: 'sales-theme',
          iconBg: 'sales-bg',
        };
      case 'service':
        return {
          title: 'EPI Service Department',
          subtitle: 'Equipment Servicing, Scheduled Maintenance, Warranty & Calendar Dispatch',
          port: 5174,
          icon: <Wrench size={22} />,
          badgeClass: 'badge-green',
          btnClass: 'service-btn',
          themeClass: 'service-theme',
          iconBg: 'service-bg',
        };
      case 'accounts':
        return {
          title: 'EPI Accounts Department',
          subtitle: 'Double-Entry General Ledger, Invoices, Banking, Payroll & 15% VAT Reports',
          port: 5175,
          icon: <Landmark size={22} />,
          badgeClass: 'badge-amber',
          btnClass: 'accounts-btn',
          themeClass: 'accounts-theme',
          iconBg: 'accounts-bg',
        };
      case 'marketing':
        return {
          title: 'Digital Marketing & IT Support',
          subtitle: 'Campaigns, Social Media Management, Asset Library & IT Support Tickets',
          port: 5173,
          icon: <Share2 size={22} />,
          badgeClass: 'badge-purple',
          btnClass: 'marketing-btn',
          themeClass: 'marketing-theme',
          iconBg: 'marketing-bg',
        };
      default:
        return {
          title: 'Department Workspace',
          subtitle: 'EPI Department Operations',
          port: 5173,
          icon: <Briefcase size={22} />,
          badgeClass: 'badge-blue',
          btnClass: 'sales-btn',
          themeClass: 'sales-theme',
          iconBg: 'sales-bg',
        };
    }
  };

  const config = getDeptConfig();

  // Fetch a secure single-use ticket for SSO
  const fetchSsoTicket = async () => {
    if (!token) return '';
    try {
      setLoading(true);
      const res = await fetch('/api/auth/sso-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ department }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTicket(data.ticket);
        return data.ticket;
      }
    } catch (e) {
      console.warn('SSO ticket fetch note:', e);
    } finally {
      setLoading(false);
    }
    return '';
  };

  useEffect(() => {
    fetchSsoTicket();
  }, [department, token]);

  const getDeptBaseUrl = () => {
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // In local development with start-all.js (separate Vite dev server ports)
    if (isLocalhost && window.location.port !== '5050' && window.location.port !== '4173') {
      return `http://localhost:${config.port}`;
    }

    // Explicit environment variable overrides
    if (department === 'sales' && import.meta.env.VITE_SALES_URL) return import.meta.env.VITE_SALES_URL;
    if (department === 'service' && import.meta.env.VITE_SERVICE_URL) return import.meta.env.VITE_SERVICE_URL;
    if (department === 'accounts' && import.meta.env.VITE_ACCOUNTS_URL) return import.meta.env.VITE_ACCOUNTS_URL;

    // Single-origin unified deployment (e.g. Vercel single-domain /sales, /service, /accounts)
    if (typeof window !== 'undefined' && window.location.origin && !isLocalhost) {
      if (department === 'sales') return `${window.location.origin}/sales`;
      if (department === 'service') return `${window.location.origin}/service`;
      if (department === 'accounts') return `${window.location.origin}/accounts`;
    }

    switch (department) {
      case 'sales':
        return isLocalhost ? `http://localhost:${config.port}` : 'https://epi-sales.vercel.app';
      case 'service':
        return isLocalhost ? `http://localhost:${config.port}` : 'https://epi-service.vercel.app';
      case 'accounts':
        return isLocalhost ? `http://localhost:${config.port}` : 'https://epi-erp.vercel.app';
      default:
        return isLocalhost ? `http://localhost:${config.port}` : 'https://epi-central-admin.vercel.app';
    }
  };

  const handleOpenStandalone = async () => {
    const t = await fetchSsoTicket();
    const base = getDeptBaseUrl();
    const url = t
      ? `${base}/?sso_ticket=${encodeURIComponent(t)}`
      : base;
    window.open(url, '_blank');
  };

  const handleReloadWorkspace = () => {
    fetchSsoTicket().then(() => {
      setIframeKey(Date.now());
    });
  };

  const deptBase = getDeptBaseUrl();
  const iframeSrc = ticket
    ? `${deptBase}/?sso_ticket=${encodeURIComponent(ticket)}`
    : deptBase;

  return (
    <div className={`workspace-view-container ${fullscreen ? 'workspace-fullscreen' : ''}`}>
      {/* Workspace Control Header */}
      <div className={`workspace-header-card ${config.themeClass}`}>
        <div className="workspace-header-info">
          <div className={`workspace-icon-box ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>
        </div>

        <div className="workspace-header-meta">
          <span className="live-badge badge-green">
            <ShieldCheck size={14} /> SSO Verified ({user?.userId})
          </span>

          <button
            className="btn-action-secondary"
            onClick={handleReloadWorkspace}
            title="Reload Workspace"
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            <span className="hide-on-mobile">Reload</span>
          </button>

          <button
            className="btn-action-secondary"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
          >
            <Maximize2 size={14} />
          </button>

          <button
            className={`btn-action-primary ${config.btnClass}`}
            onClick={handleOpenStandalone}
            title={`Open Standalone ${config.title} in New Tab`}
          >
            <ExternalLink size={14} />
            <span>Open Standalone Window</span>
          </button>

          <button
            className="btn-action-secondary"
            onClick={onBack}
            title="Return to Central Dashboard"
          >
            <ArrowLeft size={14} />
            <span className="hide-on-mobile">Back</span>
          </button>
        </div>
      </div>

      {/* Live Workspace Embed Frame */}
      <div className="workspace-iframe-wrapper">
        <iframe
          key={iframeKey}
          src={iframeSrc}
          title={config.title}
          className="workspace-iframe-embed"
          allow="clipboard-write; clipboard-read"
        />
      </div>
    </div>
  );
}
