import React from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import { Loading } from './components/ui.jsx';
import { erpStore } from './services/erpStorage.js';

import Dashboard from './pages/Dashboard.jsx';
import Accounts from './pages/Accounts.jsx';
import Journal from './pages/Journal.jsx';
import Banking from './pages/Banking.jsx';
import Expenses from './pages/Expenses.jsx';
import Parties from './pages/Parties.jsx';
import Invoices from './pages/Invoices.jsx';
import Payments from './pages/Payments.jsx';
import Ageing from './pages/Ageing.jsx';
import Inventory from './pages/Inventory.jsx';
import Vat from './pages/Vat.jsx';
import Payroll from './pages/Payroll.jsx';
import Assets from './pages/Assets.jsx';
import Reports from './pages/Reports.jsx';
import Users from './pages/Users.jsx';
import Audit from './pages/Audit.jsx';
import Settings from './pages/Settings.jsx';

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Landmark,
  DollarSign,
  Receipt,
  Users as UsersIcon,
  Package,
  ShieldCheck,
  PieChart,
  Download,
  Sliders,
  History,
} from 'lucide-react';

const Guard = ({ module, children }) => {
  const { can } = useAuth();
  return can(module, 'read') ? (
    children
  ) : (
    <div
      style={{
        margin: '24px',
        padding: '16px 20px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 8,
        color: '#f87171',
        fontSize: 14,
      }}
    >
      Your role does not have permission to access the <strong>{module}</strong> section.
    </div>
  );
};

function ErpContent() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready && !user) return <Loading />;

  const g = (module, el) => <Guard module={module}>{el}</Guard>;

  const quickNav = [
    { to: '/accounts', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/accounts/chart', label: 'Chart of Accounts', icon: BookOpen },
    { to: '/accounts/journal', label: 'Journal', icon: FileText },
    { to: '/accounts/banking', label: 'Banking', icon: Landmark },
    { to: '/accounts/invoices', label: 'Invoices', icon: Receipt },
    { to: '/accounts/expenses', label: 'Expenses', icon: DollarSign },
    { to: '/accounts/payments', label: 'Payments', icon: DollarSign },
    { to: '/accounts/customers', label: 'Customers', icon: UsersIcon },
    { to: '/accounts/suppliers', label: 'Suppliers', icon: UsersIcon },
    { to: '/accounts/payroll', label: 'Payroll', icon: UsersIcon },
    { to: '/accounts/inventory', label: 'Inventory', icon: Package },
    { to: '/accounts/vat', label: 'VAT 9.1', icon: ShieldCheck },
    { to: '/accounts/reports', label: 'Reports', icon: PieChart },
  ];

  return (
    <div className="erp-module-root">
      {/* Sub-Header Quick Navigation */}
      <div className="dept-subnav-bar">
        <div className="dept-subnav-tabs">
          {quickNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`dept-subnav-btn ${isActive ? 'active-erp' : ''}`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="dept-subnav-actions">
          <button
            type="button"
            onClick={() => erpStore.exportDatabase()}
            className="btn btn-secondary sm"
            title="Download Accounts & Ledger JSON Backup"
            style={{ padding: '5px 11px', fontSize: 11.5 }}
          >
            <Download size={13} />
            <span>ERP Backup</span>
          </button>
        </div>
      </div>

      {/* ERP Sub-Routes */}
      <Routes>
        <Route index element={g('dashboard', <Dashboard />)} />
        <Route path="chart" element={g('accounts', <Accounts />)} />
        <Route path="accounts" element={g('accounts', <Accounts />)} />
        <Route path="journal" element={g('journal', <Journal />)} />
        <Route path="banking" element={g('banking', <Banking />)} />
        <Route path="expenses" element={g('expenses', <Expenses />)} />
        <Route path="customers" element={g('sales', <Parties type="customer" />)} />
        <Route path="suppliers" element={g('purchase', <Parties type="supplier" />)} />
        <Route path="invoices" element={g('sales', <Invoices type="sale" />)} />
        <Route path="sales" element={g('sales', <Invoices type="sale" />)} />
        <Route path="bills" element={g('purchase', <Invoices type="purchase" />)} />
        <Route path="purchases" element={g('purchase', <Invoices type="purchase" />)} />
        <Route path="payments" element={g('payments', <Payments />)} />
        <Route path="ageing" element={g('reports', <Ageing type="receivable" />)} />
        <Route path="receivables" element={g('reports', <Ageing type="receivable" />)} />
        <Route path="payables" element={g('reports', <Ageing type="payable" />)} />
        <Route path="inventory" element={g('inventory', <Inventory />)} />
        <Route path="vat" element={g('vat', <Vat />)} />
        <Route path="payroll" element={g('payroll', <Payroll />)} />
        <Route path="assets" element={g('assets', <Assets />)} />
        <Route path="reports" element={g('reports', <Reports />)} />
        <Route path="users" element={g('users', <Users />)} />
        <Route path="audit" element={g('audit', <Audit />)} />
        <Route path="settings" element={g('settings', <Settings />)} />
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </div>
  );
}

export default function ErpModule() {
  return (
    <AuthProvider>
      <ErpContent />
    </AuthProvider>
  );
}
