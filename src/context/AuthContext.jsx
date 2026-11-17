import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { centralStore, installCentralFetchInterceptor } from '../modules/admin/services/centralStorage.js';

// Install client-side fetch interceptor for zero-database offline/browser-local persistence
installCentralFetchInterceptor();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('epi_central_user') || sessionStorage.getItem('epi_central_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('epi_central_token') || sessionStorage.getItem('epi_central_token') || null;
  });

  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check setup status & active session on mount
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      if (params.get('logout') === '1') {
        logout();
        window.history.replaceState({}, document.title, window.location.pathname);
        setReady(true);
        setLoading(false);
        return;
      }

      // Check if system requires initial setup
      const res = await fetch('/api/auth/setup-status');
      const data = await res.json();
      
      if (data.needsSetup) {
        setNeedsSetup(true);
        setUser(null);
        setReady(true);
        setLoading(false);
        return;
      }

      setNeedsSetup(false);

      const savedToken = localStorage.getItem('epi_central_token') || sessionStorage.getItem('epi_central_token');
      if (!savedToken) {
        setUser(null);
        setReady(true);
        setLoading(false);
        return;
      }

      // Verify active session with backend / interceptor
      const verifyRes = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.success && verifyData.user) {
          setUser(verifyData.user);
          setToken(savedToken);
          localStorage.setItem('epi_central_user', JSON.stringify(verifyData.user));
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('[AuthContext] Session status check failed:', err);
    } finally {
      setReady(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Login handler
  const login = async (userId, password, remember = true) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    const authToken = data.token;
    const authUser = data.user;
    const redirectDepartment = data.redirectDepartment || 'dashboard';

    if (remember) {
      localStorage.setItem('epi_central_token', authToken);
      localStorage.setItem('epi_central_user', JSON.stringify(authUser));
      // Cross-module compatibility keys
      localStorage.setItem('epi_token', authToken);
      localStorage.setItem('epi_ups_auth_unlocked', 'true');
      localStorage.setItem('epi_ups_auth_token', authToken);
      localStorage.setItem('epi_service_auth_token', authToken);
      localStorage.setItem('epi_user', JSON.stringify(authUser));
    } else {
      sessionStorage.setItem('epi_central_token', authToken);
      sessionStorage.setItem('epi_central_user', JSON.stringify(authUser));
      sessionStorage.setItem('epi_token', authToken);
      localStorage.setItem('epi_token', authToken);
      sessionStorage.setItem('epi_ups_auth_unlocked', 'true');
      localStorage.setItem('epi_user', JSON.stringify(authUser));
    }

    setToken(authToken);
    setUser(authUser);
    setNeedsSetup(false);
    return { user: authUser, redirectDepartment };
  };

  // Initial Super Admin setup handler
  const setupAdmin = async (payload) => {
    const res = await fetch('/api/auth/setup-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to complete Super Admin setup.');
    }

    const authToken = data.token;
    const authUser = data.user;

    localStorage.setItem('epi_central_token', authToken);
    localStorage.setItem('epi_central_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
    setNeedsSetup(false);
    return { user: authUser, redirectDepartment: 'admin' };
  };

  // Logout handler
  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }

    localStorage.removeItem('epi_central_token');
    sessionStorage.removeItem('epi_central_token');
    localStorage.removeItem('epi_token');
    sessionStorage.removeItem('epi_token');
    localStorage.removeItem('epi_central_user');
    sessionStorage.removeItem('epi_central_user');
    localStorage.removeItem('epi_ups_auth_unlocked');
    localStorage.removeItem('epi_ups_auth_token');
    localStorage.removeItem('epi_service_auth_token');
    localStorage.removeItem('epi_service_user');
    localStorage.removeItem('epi_user');

    setToken(null);
    setUser(null);
  };

  // Department Authorization Check
  const canAccessDept = (deptName) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    const depts = Array.isArray(user.departments) ? user.departments : [];
    return depts.includes(String(deptName).toLowerCase());
  };

  // Module permission check for ERP
  const can = (moduleName, action = 'read') => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.role === 'admin') return true;
    const userRole = user.role || 'employee';
    if (userRole === 'accountant') return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        loading,
        needsSetup,
        login,
        setupAdmin,
        logout,
        canAccessDept,
        can,
        checkStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// Backward compatibility alias for existing admin components
export const useCentralAuth = useAuth;
