import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Briefcase,
  Wrench,
  Landmark,
  CalendarCheck,
  CalendarClock,
  Calendar,
  FileText,
  Sliders,
  DollarSign,
  Receipt,
  BookOpen,
  PieChart,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  ChevronDown,
  Layers,
  History,
  PlusCircle,
  Package,
  Settings2,
  Zap,
  ClipboardList
} from 'lucide-react';

export default function Layout() {
  const { user, logout, canAccessDept } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const pathname = location.pathname;
  const isSuperAdmin = user?.role === 'superadmin';

  // Determine active department based on URL path
  let activeDept = 'admin';
  if (pathname.startsWith('/sales')) activeDept = 'sales';
  else if (pathname.startsWith('/service')) activeDept = 'service';
  else if (pathname.startsWith('/accounts')) activeDept = 'accounts';
  else if (pathname.startsWith('/admin')) activeDept = 'admin';
  else {
    activeDept = user?.role === 'superadmin' ? 'admin' : (user?.departments?.[0] || 'admin');
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'EP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Nav Items for each department
  const getSidebarNav = () => {
    switch (activeDept) {
      case 'admin':
        return [
          { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard, end: true },
          { to: '/admin/users', label: 'User Management', icon: Users },
          { to: '/admin/audit', label: 'Security & Audit Logs', icon: ShieldCheck },
        ];
      case 'sales':
        return [
          { to: '/sales', label: 'Sales Dashboard', icon: LayoutDashboard, end: true },
          { to: '/sales/clients', label: 'Clients Master', icon: Briefcase },
          { to: '/sales/schedule', label: 'Today Work Schedule', icon: CalendarCheck },
          { to: '/sales/summary', label: 'Work Summary & Follow-ups', icon: ClipboardList },
          { to: '/sales/reports', label: 'Activity Reports & Print', icon: FileText },
        ];
      case 'service':
        return [
          { to: '/service', label: 'Service Dashboard', icon: LayoutDashboard, end: true },
          { to: '/service/today', label: 'Today Work', icon: CalendarCheck },
          { to: '/service/upcoming', label: 'Upcoming Work', icon: CalendarClock },
          { to: '/service/calendar', label: 'Calendar / Dispatch', icon: Calendar },
          { to: '/service/clients', label: 'Sales Clients', icon: Briefcase },
          { to: '/service/servicing', label: 'Servicing Clients', icon: Wrench },
          { to: '/service/maintenance', label: 'Maintenance Clients', icon: Settings2 },
          { to: '/service/installation', label: 'Installation Sector', icon: Zap },
          { to: '/service/general', label: 'General Work', icon: ClipboardList },
          { to: '/service/warranty', label: 'Warranty Tracking', icon: ShieldCheck },
          { to: '/service/new-order', label: 'Add Work Order', icon: PlusCircle },
          { to: '/service/history', label: 'Work History', icon: History },
          { to: '/service/reports', label: 'Schedule & Reports', icon: FileText },
          { to: '/service/settings', label: 'Service Settings', icon: Sliders },
        ];
      case 'accounts':
        return [
          { to: '/accounts', label: 'Financial Dashboard', icon: LayoutDashboard, end: true },
          { to: '/accounts/chart', label: 'Chart of Accounts', icon: BookOpen },
          { to: '/accounts/journal', label: 'Journal & Vouchers', icon: FileText },
          { to: '/accounts/banking', label: 'Cash & Bank', icon: Landmark },
          { to: '/accounts/expenses', label: 'Expenses Ledger', icon: DollarSign },
          { to: '/accounts/customers', label: 'Customers', icon: Users },
          { to: '/accounts/suppliers', label: 'Suppliers', icon: Briefcase },
          { to: '/accounts/invoices', label: 'Sales Invoices', icon: Receipt },
          { to: '/accounts/bills', label: 'Purchase Bills', icon: FileText },
          { to: '/accounts/payments', label: 'Receipts & Payments', icon: DollarSign },
          { to: '/accounts/ageing', label: 'Ageing Analysis', icon: History },
          { to: '/accounts/inventory', label: 'Inventory Items', icon: Package },
          { to: '/accounts/vat', label: 'VAT Mushak-9.1', icon: ShieldCheck },
          { to: '/accounts/payroll', label: 'Payroll & Salaries', icon: Users },
          { to: '/accounts/assets', label: 'Fixed Assets', icon: Landmark },
          { to: '/accounts/reports', label: 'Financial Reports', icon: PieChart },
          { to: '/accounts/settings', label: 'Accounts Settings', icon: Sliders },
        ];
      default:
        return [];
    }
  };

  const navItems = getSidebarNav();

  return (
    <div className="app-layout">
      {/* Universal Top Navigation Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="topbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="EPI Logo" className="brand-logo-img" />
            <div className="brand-text-block">
              <span className="brand-name">EPI UPS</span>
              <span className="brand-corp">Bangladesh Limited</span>
            </div>
          </div>

          {/* Department Switcher Tabs */}
          <nav className="dept-tabs-nav">
            {isSuperAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `dept-tab ${isActive || activeDept === 'admin' ? 'active-admin' : ''}`}
              >
                <Shield size={15} />
                <span>Admin</span>
              </NavLink>
            )}

            {(isSuperAdmin || canAccessDept('sales')) && (
              <NavLink
                to="/sales"
                className={({ isActive }) => `dept-tab ${isActive || activeDept === 'sales' ? 'active-sales' : ''}`}
              >
                <Briefcase size={15} />
                <span>Sales</span>
              </NavLink>
            )}

            {(isSuperAdmin || canAccessDept('service')) && (
              <NavLink
                to="/service"
                className={({ isActive }) => `dept-tab ${isActive || activeDept === 'service' ? 'active-service' : ''}`}
              >
                <Wrench size={15} />
                <span>Service</span>
              </NavLink>
            )}

            {(isSuperAdmin || canAccessDept('accounts')) && (
              <NavLink
                to="/accounts"
                className={({ isActive }) => `dept-tab ${isActive || activeDept === 'accounts' ? 'active-accounts' : ''}`}
              >
                <Landmark size={15} />
                <span>ERP / Accounts</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="topbar-right">
          <div className="user-profile-badge" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
            <div className="user-avatar-circle">
              {getInitials(user?.name)}
            </div>
            <div className="user-details-box">
              <span className="user-name-text">{user?.name}</span>
              <div className="user-meta-line">
                <span className="user-id-pill">@{user?.userId}</span>
                <span className={`user-role-badge role-${user?.role || 'employee'}`}>
                  {isSuperAdmin ? 'Super Admin' : (user?.role || 'Staff')}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="dropdown-arrow" />
          </div>

          {profileDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <strong>{user?.name}</strong>
                <span>{user?.email || `${user?.userId}@epiups.com.bd`}</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-depts-preview">
                <span className="depts-title">Assigned Departments:</span>
                <div className="depts-pill-row">
                  {isSuperAdmin ? (
                    <span className="dept-pill dept-all">Full System Access</span>
                  ) : (
                    user?.departments?.map((d) => (
                      <span key={d} className={`dept-pill dept-${d}`}>{d.toUpperCase()}</span>
                    ))
                  )}
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-logout-btn" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="app-body-container">
        {/* Universal Modular Sidebar */}
        <aside className={`app-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header-line">
            <span className="sidebar-dept-tag">
              {activeDept === 'admin' && 'CENTRAL CONTROL'}
              {activeDept === 'sales' && 'SALES DEPARTMENT'}
              {activeDept === 'service' && 'SERVICE DEPARTMENT'}
              {activeDept === 'accounts' && 'ACCOUNTS & ERP'}
            </span>
            <button className="sidebar-close-btn" onClick={() => setMobileMenuOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="sidebar-scroll">
            <nav className="sidebar-nav-list">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={idx}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={17} className="nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-logout-link" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main Content Area */}
        <main className="app-main-viewport">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
