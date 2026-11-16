import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CentralAuthContext = createContext(null);

export function CentralAuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
        localStorage.removeItem('epi_central_token');
        sessionStorage.removeItem('epi_central_token');
        localStorage.removeItem('epi_central_user');
        setToken(null);
        setUser(null);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

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

      // Verify session with server
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
        } else {
          // Token rejected
          logout();
        }
      } else {
        // Invalid or expired token
        logout();
      }
    } catch (err) {
      console.error('[CentralAuth] Status check failed:', err);
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

    if (remember) {
      localStorage.setItem('epi_central_token', authToken);
    } else {
      sessionStorage.setItem('epi_central_token', authToken);
    }

    setToken(authToken);
    setUser(authUser);
    setNeedsSetup(false);
    return authUser;
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
    setToken(authToken);
    setUser(authUser);
    setNeedsSetup(false);
    return authUser;
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
    localStorage.removeItem('epi_central_user');
    // Clear cross-department SSO tokens
    localStorage.removeItem('epi_ups_auth_unlocked');
    localStorage.removeItem('epi_ups_auth_token');
    localStorage.removeItem('epi_user');
    localStorage.removeItem('epi_service_auth_token');
    localStorage.removeItem('epi_service_user');
    setToken(null);
    setUser(null);
  };

  // Helper to check department permissions
  const canAccessDept = (deptName) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    const depts = user.departments || [];
    return depts.includes(String(deptName).toLowerCase());
  };

  // Refresh user data from server
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  return (
    <CentralAuthContext.Provider
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
        refreshUser,
        checkStatus,
      }}
    >
      {children}
    </CentralAuthContext.Provider>
  );
}

export function useCentralAuth() {
  const ctx = useContext(CentralAuthContext);
  if (!ctx) {
    throw new Error('useCentralAuth must be used within a CentralAuthProvider');
  }
  return ctx;
}
