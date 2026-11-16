import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { Icons } from './icons.jsx';
import { cap } from '../lib/format.js';

const NAV = [
  ['Overview', [['/', 'Dashboard', 'dashboard', 'dashboard']]],
  ['Accounting', [
    ['/accounts', 'Chart of Accounts', 'book', 'accounts'],
    ['/journal', 'Journal & Vouchers', 'journal', 'journal'],
    ['/banking', 'Cash & Bank', 'bank', 'banking'],
    ['/expenses', 'Expenses', 'wallet', 'expenses'],
  ]],
  ['Sales & Purchase', [
    ['/customers', 'Customers', 'users', 'sales'],
    ['/sales', 'Sales Invoices', 'receipt', 'sales'],
    ['/suppliers', 'Suppliers', 'users', 'purchase'],
    ['/purchases', 'Purchase Bills', 'cart', 'purchase'],
    ['/payments', 'Receipts & Payments', 'wallet', 'payments'],
    ['/receivables', 'Receivables', 'chart', 'reports'],
    ['/payables', 'Payables', 'chart', 'reports'],
  ]],
  ['Operations', [
    ['/inventory', 'Inventory & Stock', 'box', 'inventory'],
    ['/vat', 'VAT & Tax', 'percent', 'vat'],
    ['/payroll', 'Employees & Payroll', 'payroll', 'payroll'],
    ['/assets', 'Fixed Assets', 'asset', 'assets'],
  ]],
  ['Reports & Admin', [
    ['/reports', 'Financial Reports', 'chart', 'reports'],
    ['/users', 'Users & Roles', 'shield', 'users'],
    ['/audit', 'Audit Logs', 'log', 'audit'],
    ['/settings', 'Settings', 'gear', 'settings'],
  ]],
];

export default function Layout() {
  const { user, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || 'http://localhost:5050';
  const close = () => setOpen(false);
  const getInitials = (name) => {
    if (!name) return 'AC';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || 'Accounts User';
  const displayId = user?.userId || user?.id || 'admin';
  const roleName = user?.isSuperAdmin ? 'Super Admin' : (user?.role ? cap(user.role) : 'Accountant');

  return (
    <div className="app">
      <div className={`backdrop ${open ? 'open' : ''}`} onClick={close} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><img src="/logo.png" alt="EPI" /><div><b>EPI UPS Bangladesh</b><small>ERP &amp; Accounting</small></div></div>
        <nav className="nav" aria-label="Main">
          {NAV.map(([group, items]) => {
            const visible = items.filter(([, , , mod]) => can(mod, 'read'));
            if (!visible.length) return null;
            return (
              <div key={group}>
                <h4>{group}</h4>
                {visible.map(([to, label, icon]) => {
                  const Ico = Icons[icon];
                  return <NavLink key={to} to={to} end={to === '/'} onClick={close}><Ico />{label}</NavLink>;
                })}
              </div>
            );
          })}
          
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4>Central Control</h4>
            <a href={centralUrl} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', color: '#38bdf8', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
              <Icons.shield width="18" height="18" /> Central Admin Portal
            </a>
          </div>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icons.menu width="20" height="20" /></button>
          <div className="grow muted hide-sm">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div className="grow show-sm" />
          <div className="userbox" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ fontWeight: 700 }}>{getInitials(displayName)}</div>
            <div className="hide-sm">
              <div style={{ fontWeight: 600, lineHeight: 1.1 }}>{displayName}</div>
              <small className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{roleName}</span>
                <span style={{ fontSize: 10, color: 'var(--primary, #0052cc)' }}>@{displayId}</span>
              </small>
            </div>
            <a href={centralUrl} className="btn sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} title="Return to Central Portal">
              <Icons.shield width="14" height="14" /> <span className="hide-sm">Portal</span>
            </a>
            <button className="btn sm" onClick={logout} title="Sign out of Central session"><Icons.logout width="15" height="15" /> <span className="hide-sm">Sign out</span></button>
          </div>
        </header>
        <main className="content" key={loc.pathname}><Outlet /></main>
      </div>
    </div>
  );
}
