import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, getToken, setRefreshToken, clearTokens, setUnauthorizedHandler } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const central = localStorage.getItem('epi_central_user');
      if (central) {
        const u = JSON.parse(central);
        const isSuper = u.role === 'superadmin';
        const hasAccess = isSuper || (Array.isArray(u.departments) && u.departments.includes('accounts'));
        if (hasAccess) {
          const assignedRole = isSuper ? 'admin' : (u.departmentRoles?.accounts || 'accountant');
          return {
            id: u.id || u.userId,
            userId: u.userId || u.id,
            name: u.name,
            email: u.email || `${u.userId}@epiups.com.bd`,
            role: assignedRole,
            departments: u.departments || ['accounts'],
            departmentRoles: u.departmentRoles || {},
            isSuperAdmin: isSuper,
            permissions: {
              dashboard: ['read', 'write', 'void'],
              accounts: ['read', 'write', 'void'],
              journal: ['read', 'write', 'void'],
              banking: ['read', 'write', 'void'],
              sales: ['read', 'write', 'void'],
              purchase: ['read', 'write', 'void'],
              payments: ['read', 'write', 'void'],
              expenses: ['read', 'write', 'void'],
              inventory: ['read', 'write', 'void'],
              vat: ['read', 'write', 'void'],
              payroll: ['read', 'write', 'void'],
              assets: ['read', 'write', 'void'],
              reports: ['read', 'write', 'void'],
              users: isSuper ? ['read', 'write', 'void'] : [],
              audit: ['read'],
              settings: ['read', 'write'],
            },
          };
        }
      }
      const cached = localStorage.getItem('epi_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedUser, setDeniedUser] = useState(null);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem('epi_user');
    localStorage.removeItem('epi_central_user');
    localStorage.removeItem('epi_central_token');
    localStorage.removeItem('epi_ups_auth_unlocked');
    localStorage.removeItem('epi_ups_auth_token');
    localStorage.removeItem('epi_service_auth_token');
    setUser(null);
    window.location.href = '/';
  }, []);

  // Central Management System SSO ticket listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoTicket = params.get('sso_ticket');
    if (ssoTicket) {
      // Direct client-side ticket resolution for browser-local persistence
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(ssoTicket))));
        if (decoded && decoded.user) {
          const u = decoded.user;
          const isSuper = u.role === 'superadmin';
          const hasAccess = isSuper || (Array.isArray(u.departments) && u.departments.includes('accounts'));
          if (hasAccess) {
            const assignedRole = isSuper ? 'admin' : (u.departmentRoles?.accounts || 'accountant');
            const accountsUser = {
              id: u.id || u.userId,
              userId: u.userId || u.id,
              name: u.name,
              email: u.email || `${u.userId}@epiups.com.bd`,
              role: assignedRole,
              departments: u.departments || ['accounts'],
              departmentRoles: u.departmentRoles || {},
              isSuperAdmin: isSuper,
              permissions: {
                dashboard: ['read', 'write', 'void'],
                accounts: ['read', 'write', 'void'],
                journal: ['read', 'write', 'void'],
                banking: ['read', 'write', 'void'],
                sales: ['read', 'write', 'void'],
                purchase: ['read', 'write', 'void'],
                payments: ['read', 'write', 'void'],
                expenses: ['read', 'write', 'void'],
                inventory: ['read', 'write', 'void'],
                vat: ['read', 'write', 'void'],
                payroll: ['read', 'write', 'void'],
                assets: ['read', 'write', 'void'],
                reports: ['read', 'write', 'void'],
                users: isSuper ? ['read', 'write', 'void'] : [],
                audit: ['read'],
                settings: ['read', 'write'],
              },
            };
            const localToken = 'erp-token-' + Date.now();
            setToken(localToken);
            localStorage.setItem('epi_user', JSON.stringify(accountsUser));
            localStorage.setItem('epi_central_user', JSON.stringify(u));
            setUser(accountsUser);
            setAccessDenied(false);
            setDeniedUser(null);
            setReady(true);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          } else {
            setAccessDenied(true);
            setDeniedUser(u);
            setReady(true);
            return;
          }
        }
      } catch (_) {}

      fetch(`${CENTRAL_URL}/api/auth/sso-exchange?ticket=${encodeURIComponent(ssoTicket)}&dept=accounts`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            setToken(data.token);
            const isSuper = data.user.role === 'superadmin';
            const assignedRole = isSuper ? 'admin' : (data.user.departmentRoles?.accounts || 'accountant');
            const accountsUser = {
              id: data.user.id || data.user.userId,
              userId: data.user.userId || data.user.id,
              name: data.user.name,
              email: data.user.email || `${data.user.userId}@epiups.com.bd`,
              role: assignedRole,
              departments: data.user.departments || ['accounts'],
              departmentRoles: data.user.departmentRoles || {},
              isSuperAdmin: isSuper,
              permissions: {
                dashboard: ['read', 'write', 'void'],
                accounts: ['read', 'write', 'void'],
                journal: ['read', 'write', 'void'],
                banking: ['read', 'write', 'void'],
                sales: ['read', 'write', 'void'],
                purchase: ['read', 'write', 'void'],
                payments: ['read', 'write', 'void'],
                expenses: ['read', 'write', 'void'],
                inventory: ['read', 'write', 'void'],
                vat: ['read', 'write', 'void'],
                payroll: ['read', 'write', 'void'],
                assets: ['read', 'write', 'void'],
                reports: ['read', 'write', 'void'],
                users: isSuper ? ['read', 'write', 'void'] : [],
                audit: ['read'],
                settings: ['read', 'write'],
              },
            };
            localStorage.setItem('epi_user', JSON.stringify(accountsUser));
            localStorage.setItem('epi_central_user', JSON.stringify(data.user));
            setUser(accountsUser);
            setAccessDenied(false);
            setDeniedUser(null);
            setReady(true);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setAccessDenied(true);
            setDeniedUser(data.user || null);
            setReady(true);
          }
        })
        .catch((e) => {
          console.warn('SSO ticket exchange note:', e);
          setReady(true);
        });
    }

    // Cross-tab Central Logout Listener
    const handleStorageChange = (e) => {
      if ((e.key === 'epi_central_token' && !e.newValue) || (e.key === 'epi_user' && !e.newValue)) {
        clearTokens();
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    const tok = getToken();
    if (!tok) {
      clearTokens();
      setUser(null);
      setReady(true);
      return;
    }

    let active = true;
    // Verify session in background without killing valid local state on transient network failures
    api.get('/auth/me')
      .then((r) => {
        if (active && r?.user) {
          setUser(r.user);
          localStorage.setItem('epi_user', JSON.stringify(r.user));
        }
      })
      .catch((err) => {
        // Only log out if credentials are fundamentally rejected (already handled by 401 interceptor)
        console.warn('Session background check notice:', err.message);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    // Periodic silent refresh every 20 minutes to prevent token expiration during active use
    const refreshTimer = setInterval(() => {
      if (getToken()) {
        api.post('/auth/refresh', {})
          .then((r) => {
            if (r?.user) {
              setUser(r.user);
              localStorage.setItem('epi_user', JSON.stringify(r.user));
            }
          })
          .catch(() => {});
      }
    }, 20 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(refreshTimer);
    };
  }, [logout]);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    setToken(r.token);
    if (r.refreshToken) setRefreshToken(r.refreshToken);
    if (r.user) {
      localStorage.setItem('epi_user', JSON.stringify(r.user));
      setUser(r.user);
    }
    return r.user;
  };

  const setup = async (payload) => {
    const r = await api.post('/auth/setup', payload);
    setToken(r.token);
    if (r.refreshToken) setRefreshToken(r.refreshToken);
    if (r.user) {
      localStorage.setItem('epi_user', JSON.stringify(r.user));
      setUser(r.user);
    }
    return r.user;
  };

  const can = (module, action = 'read') => {
    if (!user) return false;
    if (user.role === 'superadmin' || user.isSuperAdmin || user.role === 'admin') return true;
    if (user.permissions && user.permissions[module]) {
      return user.permissions[module].includes(action);
    }
    if (user.departments && user.departments.includes('accounts')) {
      return true;
    }
    return false;
  };

  return (
    <Ctx.Provider value={{ user, ready, login, setup, logout, can, accessDenied, deniedUser }}>
      {children}
    </Ctx.Provider>
  );
}
