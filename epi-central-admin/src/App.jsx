import React, { useState } from 'react';
import { CentralAuthProvider, useCentralAuth } from './context/CentralAuthContext.jsx';
import InitialSetup from './components/InitialSetup.jsx';
import UnifiedLogin from './components/UnifiedLogin.jsx';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import CentralAdminDashboard from './components/CentralAdminDashboard.jsx';
import DepartmentLauncher from './components/DepartmentLauncher.jsx';
import AuditLogsView from './components/AuditLogsView.jsx';
import AccessDenied from './components/AccessDenied.jsx';
import DepartmentWorkspaceView from './components/DepartmentWorkspaceView.jsx';
import { Briefcase, Wrench, Landmark, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

function MainAppShell() {
  const { user, ready, needsSetup, canAccessDept } = useCentralAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Post-login automatic redirection based on role & assigned department
  React.useEffect(() => {
    if (!user) return;
    if (user.role === 'superadmin') {
      // Super Admin starts on central dashboard
      if (!['dashboard', 'users', 'audit', 'sales', 'service', 'accounts'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    } else {
      const depts = Array.isArray(user.departments) ? user.departments : [];
      if (depts.length === 1) {
        // Direct auto-redirection to employee's assigned department
        setCurrentTab(depts[0]);
      } else if (depts.length > 1) {
        // Multi-department employee: default to department launcher unless already on allowed dept
        if (!depts.includes(currentTab)) {
          setCurrentTab('dashboard');
        }
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [user]);

  if (!ready) {
    return (
      <div className="login-wrapper">
        <div className="loading-spinner-box">
          <img src="/logo.png" alt="EPI Logo" className="loading-logo-pulse" />
          <p>Initializing EPI Central System...</p>
        </div>
      </div>
    );
  }

  // First-time Super Admin initialization required
  if (needsSetup) {
    return <InitialSetup />;
  }

  // Not logged in -> Show Unified Login Portal
  if (!user) {
    return <UnifiedLogin />;
  }

  const isSuperAdmin = user.role === 'superadmin';
  const defaultUserTab = (Array.isArray(user.departments) && user.departments.length === 1)
    ? user.departments[0]
    : 'dashboard';

  const handleLaunchDept = (dept) => {
    setCurrentTab(dept);
  };

  // Render main content area based on currentTab & access permissions
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (isSuperAdmin) {
          return <CentralAdminDashboard onLaunchDept={handleLaunchDept} />;
        }
        return <DepartmentLauncher onLaunchDept={handleLaunchDept} />;

      case 'users':
        if (!isSuperAdmin) {
          return <AccessDenied attemptedDept="User Management" onBack={() => setCurrentTab(defaultUserTab)} />;
        }
        return <CentralAdminDashboard onLaunchDept={handleLaunchDept} />;

      case 'audit':
        if (!isSuperAdmin) {
          return <AccessDenied attemptedDept="Security Logs" onBack={() => setCurrentTab(defaultUserTab)} />;
        }
        return <AuditLogsView />;

      case 'sales':
        if (!canAccessDept('sales')) {
          return <AccessDenied attemptedDept="sales" onBack={() => setCurrentTab(defaultUserTab)} />;
        }
        return <DepartmentWorkspaceView department="sales" onBack={() => setCurrentTab(defaultUserTab)} />;

      case 'service':
        if (!canAccessDept('service')) {
          return <AccessDenied attemptedDept="service" onBack={() => setCurrentTab(defaultUserTab)} />;
        }
        return <DepartmentWorkspaceView department="service" onBack={() => setCurrentTab(defaultUserTab)} />;

      case 'accounts':
        if (!canAccessDept('accounts')) {
          return <AccessDenied attemptedDept="accounts" onBack={() => setCurrentTab(defaultUserTab)} />;
        }
        return <DepartmentWorkspaceView department="accounts" onBack={() => setCurrentTab(defaultUserTab)} />;

      default:
        return isSuperAdmin
          ? <CentralAdminDashboard onLaunchDept={handleLaunchDept} />
          : <DepartmentLauncher onLaunchDept={handleLaunchDept} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className="main-viewport">
        <TopBar
          currentTab={currentTab}
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="main-content-scroll">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CentralAuthProvider>
      <MainAppShell />
    </CentralAuthProvider>
  );
}
