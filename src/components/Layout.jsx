import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { unifiedStore } from '../services/unifiedStorage.js';
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
  ClipboardList,
  Database,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Share2,
  Megaphone,
  Target,
  Image,
  Palette,
  Activity,
  Headphones,
  Laptop,
  Wifi,
  FileCheck,
  UserPlus,
  CalendarPlus,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  CheckSquare,
} from 'lucide-react';

export default function Layout() {
  const { user, logout, canAccessDept } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('epi_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [snapshot, setSnapshot] = useState(() => unifiedStore.getSnapshot());

  // Listen to live data changes to keep sidebar badges updated
  React.useEffect(() => {
    const handleUpdate = () => {
      setSnapshot(unifiedStore.getSnapshot());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('epi_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('epi_data_updated', handleUpdate);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('epi_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleResetDemo = async () => {
    if (
      window.confirm(
        '⚠️ WARNING: OVERWRITE WITH DEMO DATA\n\n' +
        'This will REPLACE all current records across all 5 departments with default commercial demo datasets.\n' +
        'Are you sure you want to proceed?'
      )
    ) {
      await unifiedStore.resetDemoData();
      alert('Demo data successfully restored across all departments!');
      window.location.reload();
    }
  };

  const handleExportBackup = () => {
    unifiedStore.exportFullBackup();
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const confirmed = window.confirm(
        `⚠️ WARNING: OVERWRITE ENTIRE SYSTEM DATA\n\n` +
        `Restoring this system backup will OVERWRITE all department data in your browser:\n` +
        `- Executive Admin user records\n` +
        `- Sales CRM clients & follow-ups\n` +
        `- Service & Servicing work orders\n` +
        `- Accounts / ERP ledgers & vouchers\n` +
        `- Digital Marketing & IT Support records\n\n` +
        `Existing records will be completely replaced with data from the backup file.\n` +
        `Are you sure you want to proceed?`
      );
      if (!confirmed) return;
      try {
        const text = await file.text();
        await unifiedStore.importFullBackup(text);
        alert('✓ EPI System Backup successfully restored!');
        window.location.reload();
      } catch (err) {
        alert('Failed to restore backup: ' + err.message);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'WARNING: Are you sure you want to clear local records? This removes clients, sales work, service orders, and ERP books from this browser.'
      )
    ) {
      unifiedStore.clearAllData();
      alert('Local records cleared.');
      window.location.reload();
    }
  };

  const pathname = location.pathname;
  const isSuperAdmin = user?.role === 'superadmin';

  // Determine active department based on URL path
  let activeDept = 'admin';
  if (pathname.startsWith('/sales')) activeDept = 'sales';
  else if (pathname.startsWith('/service')) activeDept = 'service';
  else if (pathname.startsWith('/accounts')) activeDept = 'accounts';
  else if (pathname.startsWith('/marketing')) activeDept = 'marketing';
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

  // Dynamic notification counters for navigation badges
  const tDate = new Date().toISOString().slice(0, 10);
  const salesTodayCount =
    (snapshot?.salesWork || []).filter((w) => w.date === tDate && w.status !== 'Completed').length +
    (snapshot?.clients || []).filter((c) => c.nextDate && c.nextDate <= tDate && c.status !== 'Completed').length;

  const serviceTodayCount = (snapshot?.serviceWorks || []).filter(
    (w) => w.date === tDate && w.status !== 'done'
  ).length;

  const mktPendingTasks = (snapshot?.marketingData?.tasks || []).filter(
    (t) => t.status !== 'Done' && t.status !== 'Completed'
  ).length;

  const mktActiveCampaigns = (snapshot?.marketingData?.campaigns || []).filter(
    (c) => c.status === 'Active'
  ).length;

  const itOpenTickets = (snapshot?.marketingData?.tickets || []).filter((t) =>
    ['Open', 'In Progress'].includes(t.status)
  ).length;

  // Grouped Navigation Items for each department
  const getSidebarNav = () => {
    switch (activeDept) {
      case 'admin':
        return [
          {
            group: 'CENTRAL CONTROL',
            items: [
              { to: '/admin', label: 'Executive Dashboard', icon: LayoutDashboard, end: true },
              { to: '/admin/users', label: 'User Management', icon: Users },
              { to: '/admin/audit', label: 'Security & Audit Logs', icon: ShieldCheck },
            ],
          },
        ];
      case 'sales':
        return [
          {
            group: 'CORE OPERATIONS',
            items: [
              { to: '/sales', label: 'Sales Dashboard', icon: LayoutDashboard, end: true },
              { to: '/sales/today', label: "Today's Work", icon: CalendarCheck, badge: salesTodayCount },
              { to: '/sales/summary', label: 'Daily Summary', icon: ClipboardList },
            ],
          },
          {
            group: 'CLIENTS & WORK',
            items: [
              { to: '/sales/clients', label: 'Clients Master', icon: Briefcase },
              { to: '/sales/new-client', label: 'Add Client', icon: UserPlus },
              { to: '/sales/new-work', label: 'Add Work', icon: CalendarPlus },
              { to: '/sales/edit-data', label: 'Edit Work Data', icon: Edit3 },
              { to: '/sales/history', label: 'Work History', icon: History },
            ],
          },
          {
            group: 'REPORTS & ANALYTICS',
            items: [
              { to: '/sales/reports', label: 'Sales Reports & Print', icon: FileText },
            ],
          },
        ];
      case 'service':
        return [
          {
            group: 'CORE OPERATIONS',
            items: [
              { to: '/service', label: 'Service Dashboard', icon: LayoutDashboard, end: true },
              { to: '/service/today', label: 'Today Work', icon: CalendarCheck, badge: serviceTodayCount },
              { to: '/service/upcoming', label: 'Upcoming Work', icon: CalendarClock },
              { to: '/service/calendar', label: 'Calendar / Dispatch', icon: Calendar },
            ],
          },
          {
            group: 'CLIENT SECTORS',
            items: [
              { to: '/service/clients', label: 'Sales Clients', icon: Briefcase },
              { to: '/service/servicing', label: 'Servicing Clients', icon: Wrench },
              { to: '/service/maintenance', label: 'Maintenance Clients', icon: Settings2 },
              { to: '/service/installation', label: 'Installation Sector', icon: Zap },
              { to: '/service/general', label: 'General Work', icon: ClipboardList },
              { to: '/service/warranty', label: 'Warranty Tracking', icon: ShieldCheck },
            ],
          },
          {
            group: 'WORK ORDERS',
            items: [
              { to: '/service/new-order', label: 'Add Work Order', icon: PlusCircle },
              { to: '/service/history', label: 'Work History', icon: History },
            ],
          },
          {
            group: 'REPORTS & SETTINGS',
            items: [
              { to: '/service/reports', label: 'Schedule & Reports (Print)', icon: FileText },
              { to: '/service/settings', label: 'Service Settings', icon: Sliders },
            ],
          },
        ];
      case 'accounts':
        return [
          {
            group: 'CORE ACCOUNTING',
            items: [
              { to: '/accounts', label: 'Financial Dashboard', icon: LayoutDashboard, end: true },
              { to: '/accounts/chart', label: 'Chart of Accounts', icon: BookOpen },
              { to: '/accounts/journal', label: 'Journal & Vouchers', icon: FileText },
              { to: '/accounts/banking', label: 'Cash & Bank', icon: Landmark },
              { to: '/accounts/expenses', label: 'Expenses Ledger', icon: DollarSign },
            ],
          },
          {
            group: 'SALES & PURCHASES',
            items: [
              { to: '/accounts/customers', label: 'Customers', icon: Users },
              { to: '/accounts/suppliers', label: 'Suppliers', icon: Briefcase },
              { to: '/accounts/invoices', label: 'Sales Invoices', icon: Receipt },
              { to: '/accounts/bills', label: 'Purchase Bills', icon: FileText },
              { to: '/accounts/payments', label: 'Receipts & Payments', icon: DollarSign },
            ],
          },
          {
            group: 'REPORTS & COMPLIANCE',
            items: [
              { to: '/accounts/ageing', label: 'Ageing Analysis', icon: History },
              { to: '/accounts/inventory', label: 'Inventory Items', icon: Package },
              { to: '/accounts/vat', label: 'VAT Mushak-9.1', icon: ShieldCheck },
              { to: '/accounts/payroll', label: 'Payroll & Salaries', icon: Users },
              { to: '/accounts/assets', label: 'Fixed Assets', icon: Landmark },
              { to: '/accounts/reports', label: 'Financial Reports & Print', icon: PieChart },
              { to: '/accounts/settings', label: 'Accounts Settings', icon: Sliders },
            ],
          },
        ];
      case 'marketing':
        return [
          {
            group: 'DIGITAL MARKETING',
            items: [
              { to: '/marketing', label: 'Marketing Dashboard', icon: LayoutDashboard, end: true },
              { to: '/marketing/tasks', label: 'Work / Task Management', icon: CheckSquare, badge: mktPendingTasks },
              { to: '/marketing/social', label: 'Content & Social Posts', icon: Share2 },
              { to: '/marketing/campaigns', label: 'Campaign Management', icon: Target, badge: mktActiveCampaigns },
              { to: '/marketing/marketing-reports', label: 'Marketing Reports & Print', icon: FileText },
            ],
          },
          {
            group: 'IT SUPPORT HELPDESK',
            items: [
              { to: '/marketing/it-dashboard', label: 'IT Support Dashboard', icon: Activity },
              { to: '/marketing/tickets', label: 'IT Work Management', icon: Headphones, badge: itOpenTickets },
              { to: '/marketing/devices', label: 'Basic Device Management', icon: Laptop },
              { to: '/marketing/it-history', label: 'IT Work History', icon: History },
              { to: '/marketing/it-reports', label: 'IT Reports & Print', icon: FileCheck },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const navGroups = getSidebarNav();

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

            {(isSuperAdmin || canAccessDept('marketing')) && (
              <NavLink
                to="/marketing"
                className={({ isActive }) => `dept-tab ${isActive || activeDept === 'marketing' ? 'active-marketing' : ''}`}
              >
                <Share2 size={15} />
                <span>Marketing & IT</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* User Profile & Logout & Data Hub */}
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handleResetDemo}
            className="btn btn-secondary topbar-data-btn"
            title="Reset and reload realistic Bangladesh commercial UPS demo data"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 11px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              background: 'rgba(251, 191, 36, 0.1)',
              color: '#fbbf24',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="btn btn-secondary topbar-data-btn"
            title="Download full JSON backup of all 4 departments"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 11px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.08)',
              color: '#38bdf8',
            }}
          >
            <Download size={13} />
            <span>Backup</span>
          </button>

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
              <div style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Database & Backup
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                  <button
                    onClick={handleResetDemo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      color: '#fbbf24',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '4px 0',
                    }}
                  >
                    <RotateCcw size={14} /> Reset Demo Seed Data
                  </button>
                  <button
                    onClick={handleExportBackup}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '4px 0',
                    }}
                  >
                    <Download size={14} /> Export System Backup (.json)
                  </button>
                  <button
                    onClick={handleImportBackup}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      color: '#34d399',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '4px 0',
                    }}
                  >
                    <Upload size={14} /> Import Backup (.json)
                  </button>
                  <button
                    onClick={handleClearData}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '4px 0',
                    }}
                  >
                    <Trash2 size={14} /> Clear Local Storage
                  </button>
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
        {/* Universal Modular Sidebar with Expand/Collapse & Grouped Navigation */}
        <aside
          className={`app-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''} ${
            sidebarCollapsed ? 'sidebar-collapsed' : ''
          }`}
        >
          <div className="sidebar-header-line">
            {!sidebarCollapsed && (
              <span className="sidebar-dept-tag">
                {activeDept === 'admin' && 'CENTRAL CONTROL'}
                {activeDept === 'sales' && 'SALES DEPARTMENT'}
                {activeDept === 'service' && 'SERVICE DEPARTMENT'}
                {activeDept === 'accounts' && 'ACCOUNTS & ERP'}
                {activeDept === 'marketing' && 'DIGITAL MARKETING & IT'}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <button
                type="button"
                className="sidebar-collapse-toggle"
                onClick={toggleSidebar}
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label="Toggle Sidebar Collapse"
              >
                {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Mobile Menu"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Department Switcher (Visible on mobile/tablet drawer) */}
          <div className="sidebar-mobile-depts">
            <span className="mobile-depts-label">Switch Department</span>
            <div className="mobile-depts-grid">
              {isSuperAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `mobile-dept-btn ${isActive || activeDept === 'admin' ? 'active-admin' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield size={13} />
                  <span>Admin</span>
                </NavLink>
              )}

              {(isSuperAdmin || canAccessDept('sales')) && (
                <NavLink
                  to="/sales"
                  className={({ isActive }) => `mobile-dept-btn ${isActive || activeDept === 'sales' ? 'active-sales' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase size={13} />
                  <span>Sales</span>
                </NavLink>
              )}

              {(isSuperAdmin || canAccessDept('service')) && (
                <NavLink
                  to="/service"
                  className={({ isActive }) => `mobile-dept-btn ${isActive || activeDept === 'service' ? 'active-service' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Wrench size={13} />
                  <span>Service</span>
                </NavLink>
              )}

              {(isSuperAdmin || canAccessDept('accounts')) && (
                <NavLink
                  to="/accounts"
                  className={({ isActive }) => `mobile-dept-btn ${isActive || activeDept === 'accounts' ? 'active-accounts' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Landmark size={13} />
                  <span>ERP</span>
                </NavLink>
              )}

              {(isSuperAdmin || canAccessDept('marketing')) && (
                <NavLink
                  to="/marketing"
                  className={({ isActive }) => `mobile-dept-btn ${isActive || activeDept === 'marketing' ? 'active-marketing' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Share2 size={13} />
                  <span>Mkt & IT</span>
                </NavLink>
              )}
            </div>
          </div>

          <div className="sidebar-scroll">
            <nav className="sidebar-nav-list">
              {navGroups.map((groupObj, gIdx) => (
                <div key={gIdx} className="sidebar-group">
                  {!sidebarCollapsed && (
                    <div className="sidebar-group-title">{groupObj.group}</div>
                  )}
                  {groupObj.items.map((item, idx) => {
                    const Icon = item.icon || FileText;
                    return (
                      <NavLink
                        key={idx}
                        to={item.to}
                        end={item.end}
                        title={sidebarCollapsed ? `${groupObj.group}: ${item.label}` : undefined}
                        className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={17} className="nav-icon" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                        {item.badge > 0 && (
                          <span
                            className="sidebar-badge"
                            style={
                              activeDept === 'sales'
                                ? { background: '#0052cc' }
                                : activeDept === 'service'
                                ? { background: '#059669' }
                                : activeDept === 'marketing'
                                ? { background: '#7c3aed' }
                                : undefined
                            }
                            title={`${item.badge} pending / scheduled`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-logout-link" onClick={handleLogout}>
              <LogOut size={16} />
              {!sidebarCollapsed && <span>Log Out</span>}
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
