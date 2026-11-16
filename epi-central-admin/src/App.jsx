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
          return <AccessDenied attemptedDept="User Management" onBack={() => setCurrentTab('dashboard')} />;
        }
        return <CentralAdminDashboard onLaunchDept={handleLaunchDept} />;

      case 'audit':
        if (!isSuperAdmin) {
          return <AccessDenied attemptedDept="Security Logs" onBack={() => setCurrentTab('dashboard')} />;
        }
        return <AuditLogsView />;

      case 'sales':
        if (!canAccessDept('sales')) {
          return <AccessDenied attemptedDept="sales" onBack={() => setCurrentTab('dashboard')} />;
        }
        return <DepartmentWorkspaceView department="sales" onBack={() => setCurrentTab('dashboard')} />;

      case 'service':
        if (!canAccessDept('service')) {
          return <AccessDenied attemptedDept="service" onBack={() => setCurrentTab('dashboard')} />;
        }
        return <DepartmentWorkspaceView department="service" onBack={() => setCurrentTab('dashboard')} />;

      case 'accounts':
        if (!canAccessDept('accounts')) {
          return <AccessDenied attemptedDept="accounts" onBack={() => setCurrentTab('dashboard')} />;
        }
        return <DepartmentWorkspaceView department="accounts" onBack={() => setCurrentTab('dashboard')} />;

      default:
        return <CentralAdminDashboard onLaunchDept={handleLaunchDept} />;
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
