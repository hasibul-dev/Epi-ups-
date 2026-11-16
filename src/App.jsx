import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import UnifiedLogin from './components/UnifiedLogin.jsx';
import InitialSetup from './components/InitialSetup.jsx';
import AccessDenied from './components/AccessDenied.jsx';

import AdminModule from './modules/admin/AdminModule.jsx';
import SalesModule from './modules/sales/SalesModule.jsx';
import ServiceModule from './modules/service/ServiceModule.jsx';
import ErpModule from './modules/erp/ErpModule.jsx';

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#050811',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '3px solid rgba(255, 255, 255, 0.08)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: 18,
        }}
      />
      <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
        EPI UPS Bangladesh Limited
      </div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
        Initializing Central Management System...
      </div>
    </div>
  );
}

function RequireDept({ dept, children }) {
  const { user, canAccessDept } = useAuth();
  if (!user) return <UnifiedLogin />;
  if (!canAccessDept(dept)) {
    return <AccessDenied attemptedDept={dept} />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <UnifiedLogin />;
  if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
  const depts = user.departments || [];
  if (depts.includes('sales')) return <Navigate to="/sales" replace />;
  if (depts.includes('service')) return <Navigate to="/service" replace />;
  if (depts.includes('accounts')) return <Navigate to="/accounts" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  const { user, ready, needsSetup, loading } = useAuth();

  if (!ready && loading) {
    return <LoadingScreen />;
  }

  if (needsSetup) {
    return <InitialSetup />;
  }

  if (!user) {
    return <UnifiedLogin />;
  }

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="admin/*"
            element={
              <RequireDept dept="admin">
                <AdminModule />
              </RequireDept>
            }
          />
          <Route
            path="sales/*"
            element={
              <RequireDept dept="sales">
                <SalesModule />
              </RequireDept>
            }
          />
          <Route
            path="service/*"
            element={
              <RequireDept dept="service">
                <ServiceModule />
              </RequireDept>
            }
          />
          <Route
            path="accounts/*"
            element={
              <RequireDept dept="accounts">
                <ErpModule />
              </RequireDept>
            }
          />
          <Route path="*" element={<RootRedirect />} />
        </Route>
      </Routes>
      <div id="print-mount" style={{ display: 'none' }} />
    </>
  );
}
