import bcrypt from 'bcryptjs';

/**
 * EPI CENTRALIZED MANAGEMENT SYSTEM — Browser-Local Storage Engine
 * 
 * Provides 100% browser-side data persistence (LocalStorage) for Central Admin.
 * Eliminates external MongoDB/cloud database requirement entirely.
 * All employee accounts, credentials, departments, audit logs, and SSO tickets
 * persist directly in the user's browser with full JSON backup & restore support.
 * Passwords are cryptographically hashed using standard bcrypt algorithm.
 */

// Safe bcrypt helpers
function hashPassword(password) {
  try {
    return bcrypt.hashSync(String(password), 10);
  } catch (e) {
    return bcrypt.hashSync(String(password), 8);
  }
}

function verifyPassword(password, hash) {
  try {
    if (!hash) return false;
    // Standard bcrypt hash verification
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compareSync(String(password), hash);
    }
    // Backward compatibility for old plain text during automatic migration
    return hash === password;
  } catch (e) {
    return false;
  }
}

const STORAGE_KEYS = {
  USERS: 'epi_central_users_v1',
  AUDIT: 'epi_central_audit_v1',
  CONFIG: 'epi_central_config_v1',
  SESSION: 'epi_central_token',
  TICKETS: 'epi_central_sso_tickets_v1',
};

// Initial default Super Admin account (bcrypt hashed: 'password123')
const DEFAULT_SUPERADMIN = {
  id: 'usr-admin-01',
  userId: 'admin',
  passwordHash: '$2b$10$KalKOUb5ySkL5cNzchRM0OlFkdSGnCkkgzjgTcScWQxxViI0sXknK',
  name: 'Super Administrator',
  email: 'admin@epiups.com.bd',
  role: 'superadmin',
  departments: ['sales', 'service', 'accounts'],
  departmentRoles: {
    sales: 'admin',
    service: 'admin',
    accounts: 'admin',
  },
  status: 'active',
  loginHistory: [],
  createdAt: new Date().toISOString(),
  lastLogin: null,
};

// Default initial employee accounts for out-of-the-box readiness (bcrypt hashed: 'password123')
const DEFAULT_INITIAL_USERS = [
  DEFAULT_SUPERADMIN,
  {
    id: 'usr-sales-01',
    userId: 'sales1',
    passwordHash: '$2b$10$KalKOUb5ySkL5cNzchRM0OlFkdSGnCkkgzjgTcScWQxxViI0sXknK',
    name: 'Sales Manager',
    email: 'sales@epiups.com.bd',
    role: 'manager',
    departments: ['sales'],
    departmentRoles: { sales: 'manager' },
    status: 'active',
    loginHistory: [],
    createdAt: new Date().toISOString(),
    lastLogin: null,
  },
  {
    id: 'usr-service-01',
    userId: 'service1',
    passwordHash: '$2b$10$KalKOUb5ySkL5cNzchRM0OlFkdSGnCkkgzjgTcScWQxxViI0sXknK',
    name: 'Service Lead Engineer',
    email: 'service@epiups.com.bd',
    role: 'engineer',
    departments: ['service'],
    departmentRoles: { service: 'engineer' },
    status: 'active',
    loginHistory: [],
    createdAt: new Date().toISOString(),
    lastLogin: null,
  },
  {
    id: 'usr-accounts-01',
    userId: 'accounts1',
    passwordHash: '$2b$10$KalKOUb5ySkL5cNzchRM0OlFkdSGnCkkgzjgTcScWQxxViI0sXknK',
    name: 'Chief Accountant',
    email: 'accounts@epiups.com.bd',
    role: 'accountant',
    departments: ['accounts'],
    departmentRoles: { accounts: 'accountant' },
    status: 'active',
    loginHistory: [],
    createdAt: new Date().toISOString(),
    lastLogin: null,
  },
];

class CentralStorageEngine {
  constructor() {
    this.init();
  }

  init() {
    if (typeof localStorage === 'undefined') return;
    try {
      const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!existingUsers) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_INITIAL_USERS));
      } else {
        // Automatically migrate any legacy records: hash plain passwords, ensure loginHistory
        try {
          const parsed = JSON.parse(existingUsers);
          let modified = false;
          for (const u of parsed) {
            if (u.password && !u.passwordHash) {
              u.passwordHash = hashPassword(u.password);
              delete u.password;
              modified = true;
            }
            if (!Array.isArray(u.loginHistory)) {
              u.loginHistory = [];
              modified = true;
            }
          }
          if (modified) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));
          }
        } catch (_) {}
      }

      const existingAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (!existingAudit) {
        const initLog = [
          {
            id: 'log-init-01',
            at: new Date().toISOString(),
            userId: 'system',
            userName: 'System Initialization',
            action: 'INITIALIZE',
            details: 'Central Admin browser-local data storage initialized successfully with bcrypt security',
            ip: '127.0.0.1 (Local Browser)',
          },
        ];
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(initLog));
      }

      const existingConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (!existingConfig) {
        localStorage.setItem(
          STORAGE_KEYS.CONFIG,
          JSON.stringify({
            setupComplete: true,
            systemName: 'EPI Centralized Management System',
            company: 'EPI UPS Bangladesh Limited',
            storageMode: 'browser-local',
          })
        );
      }
    } catch (e) {
      console.warn('[CentralStorage] LocalStorage access warning:', e);
    }
  }

  // --- Helpers ---
  getUsers() {
    if (typeof localStorage === 'undefined') return DEFAULT_INITIAL_USERS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : DEFAULT_INITIAL_USERS;
    } catch {
      return DEFAULT_INITIAL_USERS;
    }
  }

  saveUsers(users) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('[CentralStorage] Failed to save users:', e);
    }
  }

  getAuditLogs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  addAudit(userId, userName, action, details) {
    try {
      const logs = this.getAuditLogs();
      logs.unshift({
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        at: new Date().toISOString(),
        userId: userId || 'unknown',
        userName: userName || 'Unknown User',
        action: String(action || 'ACTION').toUpperCase(),
        details: String(details || ''),
        ip: (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : '127.0.0.1 (Browser)',
      });
      // Cap at 500 logs to preserve browser storage
      if (logs.length > 500) logs.length = 500;
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs));
    } catch (e) {
      console.warn('[CentralStorage] Failed to save audit log:', e);
    }
  }

  getConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return raw ? JSON.parse(raw) : { setupComplete: true };
    } catch {
      return { setupComplete: true };
    }
  }

  saveConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
    } catch (e) {
      console.warn('[CentralStorage] Failed to save config:', e);
    }
  }

  // --- Auth & Sessions ---
  getSetupStatus() {
    const config = this.getConfig();
    const users = this.getUsers();
    const hasSuperAdmin = users.some((u) => u.role === 'superadmin' && u.status === 'active');
    return {
      success: true,
      needsSetup: !hasSuperAdmin || config.setupComplete === false,
    };
  }

  setupAdmin({ userId, password, name, email }) {
    if (!userId || !password) {
      throw new Error('User ID and Password are required');
    }
    if (String(password).length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const users = this.getUsers().filter((u) => u.role !== 'superadmin');
    const adminUser = {
      id: 'usr-admin-' + Date.now(),
      userId: userId.trim(),
      passwordHash: hashPassword(password),
      name: (name || 'Super Administrator').trim(),
      email: (email || `${userId}@epiups.com.bd`).trim(),
      role: 'superadmin',
      departments: ['sales', 'service', 'accounts'],
      departmentRoles: { sales: 'admin', service: 'admin', accounts: 'admin' },
      status: 'active',
      loginHistory: [
        {
          timestamp: new Date().toISOString(),
          ip: (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : '127.0.0.1 (Browser)',
          userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : 'Web Browser',
        }
      ],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    users.unshift(adminUser);
    this.saveUsers(users);

    const config = this.getConfig();
    config.setupComplete = true;
    this.saveConfig(config);

    this.addAudit(adminUser.userId, adminUser.name, 'INITIAL_SETUP', 'Super Admin account initialized with bcrypt password hashing');

    const token = this.generateSessionToken(adminUser);
    const safeUser = this.sanitizeUser(adminUser);
    return { success: true, token, user: safeUser, redirectDepartment: 'dashboard' };
  }

  login(userId, password) {
    if (!userId || !password) {
      throw new Error('User ID and password are required');
    }
    const cleanUserId = userId.trim().toLowerCase();
    const users = this.getUsers();
    const found = users.find((u) => u.userId.toLowerCase() === cleanUserId);

    if (!found) {
      throw new Error('Invalid User ID or Password.');
    }
    if (found.status === 'inactive') {
      throw new Error('Account is deactivated. Contact Super Admin.');
    }

    // Verify bcrypt password hash
    const passOk = verifyPassword(password, found.passwordHash || found.password);
    if (!passOk) {
      throw new Error('Invalid User ID or Password.');
    }

    // Upgrade to bcrypt hash if was stored as legacy plain
    if (found.password && !found.passwordHash) {
      found.passwordHash = hashPassword(found.password);
      delete found.password;
    }

    // Record login entry in history
    if (!Array.isArray(found.loginHistory)) {
      found.loginHistory = [];
    }
    const loginEntry = {
      timestamp: new Date().toISOString(),
      ip: (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : '127.0.0.1 (Browser)',
      userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : 'Web Browser',
    };
    found.loginHistory.unshift(loginEntry);
    if (found.loginHistory.length > 50) found.loginHistory.length = 50;
    found.lastLogin = loginEntry.timestamp;
    this.saveUsers(users);

    this.addAudit(found.userId, found.name, 'USER_LOGIN', `User signed into Central Admin via browser session`);

    // Compute direct department redirection
    let redirectDepartment = 'dashboard';
    if (found.role === 'superadmin') {
      redirectDepartment = 'dashboard';
    } else if (Array.isArray(found.departments)) {
      if (found.departments.length === 1) {
        redirectDepartment = found.departments[0];
      } else {
        redirectDepartment = 'dashboard';
      }
    }

    const token = this.generateSessionToken(found);
    return {
      success: true,
      token,
      user: this.sanitizeUser(found),
      redirectDepartment,
    };
  }

  getCurrentUser(token) {
    if (!token) return null;
    try {
      const decoded = this.verifySessionToken(token);
      if (!decoded) return null;
      const users = this.getUsers();
      const user = users.find((u) => u.id === decoded.id || u.userId === decoded.userId);
      if (!user || user.status === 'inactive') return null;
      return this.sanitizeUser(user);
    } catch {
      return null;
    }
  }

  generateSessionToken(user) {
    const payload = {
      id: user.id,
      userId: user.userId,
      role: user.role,
      name: user.name,
      departments: user.departments,
      departmentRoles: user.departmentRoles,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    return 'epi_token_' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  verifySessionToken(token) {
    if (!token || !token.startsWith('epi_token_')) return null;
    try {
      const raw = decodeURIComponent(escape(atob(token.replace('epi_token_', ''))));
      const payload = JSON.parse(raw);
      if (payload.exp && Date.now() > payload.exp) return null;
      return payload;
    } catch {
      return null;
    }
  }

  sanitizeUser(user) {
    if (!user) return null;
    const { password, passwordHash, ...safe } = user;
    return safe;
  }

  // --- SSO Tickets ---
  createSsoTicket(department, user) {
    if (!user) throw new Error('User required for SSO ticket');
    const targetDept = String(department || '').toLowerCase();
    
    // Enforce department authorization when generating ticket
    const isSuper = user.role === 'superadmin';
    const hasDept = isSuper || (Array.isArray(user.departments) && user.departments.includes(targetDept));
    if (!hasDept) {
      throw new Error(`Unauthorized: User does not have permission for ${targetDept} department.`);
    }

    const ticketId = 'sso_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const payload = {
      ticketId,
      department: targetDept,
      user: this.sanitizeUser(user),
      createdAt: Date.now(),
      exp: Date.now() + 5 * 60 * 1000, // 5 min validity
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
      const tickets = raw ? JSON.parse(raw) : {};
      tickets[ticketId] = payload;
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (_) {}

    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  exchangeSsoTicket(ticketString, targetDept) {
    if (!ticketString) throw new Error('Missing ticket');
    let payload = null;
    try {
      const raw = decodeURIComponent(escape(atob(ticketString)));
      payload = JSON.parse(raw);
    } catch {
      try {
        const rawMap = localStorage.getItem(STORAGE_KEYS.TICKETS);
        const map = rawMap ? JSON.parse(rawMap) : {};
        payload = map[ticketString];
      } catch (_) {}
    }

    if (!payload || !payload.user) {
      throw new Error('Invalid or expired SSO ticket');
    }

    const { user, department } = payload;
    const isSuper = user.role === 'superadmin';
    const deptMatch = !department || department === targetDept || isSuper;
    const userHasDept = isSuper || (Array.isArray(user.departments) && user.departments.includes(targetDept));

    if (!deptMatch || !userHasDept) {
      throw new Error(`Unauthorized: User does not have permission for ${targetDept} department.`);
    }

    const token = this.generateSessionToken(user);
    return {
      success: true,
      token,
      user,
      department: targetDept,
    };
  }

  // --- User Management CRUD ---
  getStats() {
    const users = this.getUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const inactiveUsers = users.filter((u) => u.status === 'inactive').length;
    const departmentCounts = {
      sales: users.filter((u) => u.status === 'active' && (u.role === 'superadmin' || u.departments?.includes('sales'))).length,
      service: users.filter((u) => u.status === 'active' && (u.role === 'superadmin' || u.departments?.includes('service'))).length,
      accounts: users.filter((u) => u.status === 'active' && (u.role === 'superadmin' || u.departments?.includes('accounts'))).length,
    };

    // Gather recent logins across users
    const allLogins = [];
    for (const u of users) {
      if (Array.isArray(u.loginHistory)) {
        for (const entry of u.loginHistory) {
          allLogins.push({
            userId: u.userId,
            name: u.name,
            timestamp: entry.timestamp,
            ip: entry.ip,
            userAgent: entry.userAgent,
          });
        }
      }
    }
    allLogins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      success: true,
      stats: {
        totalEmployees: totalUsers,
        activeEmployees: activeUsers,
        inactiveEmployees: inactiveUsers,
        serviceUsers: departmentCounts.service,
        salesUsers: departmentCounts.sales,
        accountsUsers: departmentCounts.accounts,
        recentLogins: allLogins.slice(0, 15),
        recentActivities: this.getAuditLogs().slice(0, 15),
      },
    };
  }

  listUsers() {
    return {
      success: true,
      users: this.getUsers().map((u) => ({
        ...this.sanitizeUser(u),
        loginCount: Array.isArray(u.loginHistory) ? u.loginHistory.length : 0,
      })),
    };
  }

  getUserLoginHistory(id) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id || u.userId === id);
    if (!user) throw new Error('User not found');
    return {
      success: true,
      userId: user.userId,
      name: user.name,
      history: Array.isArray(user.loginHistory) ? user.loginHistory : [],
    };
  }

  createUser(data, currentAdmin) {
    const { userId, password, name, email, role, departments, departmentRoles } = data;
    if (!userId || !password) {
      throw new Error('User ID and Password are required');
    }
    if (String(password).length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const cleanUserId = userId.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((u) => u.userId.toLowerCase() === cleanUserId)) {
      throw new Error(`User ID "${userId}" is already registered. Choose another.`);
    }

    const newUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      userId: userId.trim(),
      passwordHash: hashPassword(password),
      name: (name || userId).trim(),
      email: (email || `${userId}@epiups.com.bd`).trim(),
      role: role || 'employee',
      departments: Array.isArray(departments) ? departments : [],
      departmentRoles: departmentRoles || {},
      status: 'active',
      loginHistory: [],
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.addAudit(
      currentAdmin?.userId || 'admin',
      currentAdmin?.name || 'Super Admin',
      'CREATE_USER',
      `Created employee account "${newUser.name}" (${newUser.userId}) with departments [${newUser.departments.join(', ')}]`
    );

    return { success: true, user: this.sanitizeUser(newUser) };
  }

  updateUser(id, data, currentAdmin) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');

    const u = users[idx];
    if (data.name !== undefined) u.name = data.name.trim();
    if (data.email !== undefined) u.email = data.email.trim();
    if (data.role !== undefined && u.role !== 'superadmin') u.role = data.role;
    if (data.departments !== undefined && u.role !== 'superadmin') u.departments = data.departments;
    if (data.departmentRoles !== undefined) u.departmentRoles = data.departmentRoles;

    users[idx] = u;
    this.saveUsers(users);
    this.addAudit(
      currentAdmin?.userId || 'admin',
      currentAdmin?.name || 'Super Admin',
      'UPDATE_USER',
      `Updated user details for "${u.name}" (${u.userId})`
    );

    return { success: true, user: this.sanitizeUser(u) };
  }

  toggleUserStatus(id, currentAdmin) {
    const users = this.getUsers();
    const u = users.find((x) => x.id === id);
    if (!u) throw new Error('User not found');
    if (u.role === 'superadmin') throw new Error('Super Admin account cannot be deactivated');

    u.status = u.status === 'active' ? 'inactive' : 'active';
    this.saveUsers(users);
    this.addAudit(
      currentAdmin?.userId || 'admin',
      currentAdmin?.name || 'Super Admin',
      'STATUS_CHANGE',
      `Changed account status of ${u.userId} to ${u.status.toUpperCase()}`
    );

    return { success: true, user: this.sanitizeUser(u) };
  }

  resetPassword(id, newPassword, currentAdmin) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const users = this.getUsers();
    const u = users.find((x) => x.id === id);
    if (!u) throw new Error('User not found');

    u.passwordHash = hashPassword(newPassword);
    delete u.password;
    this.saveUsers(users);
    this.addAudit(
      currentAdmin?.userId || 'admin',
      currentAdmin?.name || 'Super Admin',
      'RESET_PASSWORD',
      `Reset password for account "${u.name}" (${u.userId})`
    );

    return { success: true, message: 'Password reset successfully.' };
  }

  deleteUser(id, currentAdmin) {
    let users = this.getUsers();
    const u = users.find((x) => x.id === id);
    if (!u) throw new Error('User not found');
    if (u.role === 'superadmin') throw new Error('Super Admin account cannot be deleted');

    users = users.filter((x) => x.id !== id);
    this.saveUsers(users);
    this.addAudit(
      currentAdmin?.userId || 'admin',
      currentAdmin?.name || 'Super Admin',
      'DELETE_USER',
      `Permanently deleted employee account "${u.name}" (${u.userId})`
    );

    return { success: true, message: 'User deleted.' };
  }

  updateProfile(data, currentUser) {
    if (!currentUser) throw new Error('Unauthorized');
    const users = this.getUsers();
    const u = users.find((x) => x.id === currentUser.id || x.userId === currentUser.userId);
    if (!u) throw new Error('User not found');

    if (data.name) u.name = data.name.trim();
    if (data.email) u.email = data.email.trim();
    if (data.newPassword) {
      if (data.currentPassword && !verifyPassword(data.currentPassword, u.passwordHash || u.password)) {
        throw new Error('Current password does not match.');
      }
      if (data.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }
      u.passwordHash = hashPassword(data.newPassword);
      delete u.password;
    }

    this.saveUsers(users);
    this.addAudit(u.userId, u.name, 'UPDATE_PROFILE', `User updated own personal profile settings`);
    return { success: true, user: this.sanitizeUser(u) };
  }

  // --- Database Export & Import for Browser Persistence ---
  exportDatabase() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      system: 'EPI Central Management System',
      users: this.getUsers(),
      audit: this.getAuditLogs(),
      config: this.getConfig(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epi_central_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  importDatabase(jsonStr) {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      if (!parsed || !Array.isArray(parsed.users)) {
        throw new Error('Invalid backup file format');
      }
      this.saveUsers(parsed.users);
      if (Array.isArray(parsed.audit)) {
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(parsed.audit));
      }
      if (parsed.config) {
        this.saveConfig(parsed.config);
      }
      return { success: true, userCount: parsed.users.length };
    } catch (e) {
      throw new Error('Failed to import backup: ' + e.message);
    }
  }
}

export const centralStore = new CentralStorageEngine();

/**
 * Installs a transparent browser-level fetch interceptor.
 * Intercepts all `/api/auth/*` and `/api/admin/*` network requests
 * and resolves them directly from browser-local storage.
 * Eliminates the need for any Node backend server or MongoDB!
 */
export function installCentralFetchInterceptor() {
  if (typeof window === 'undefined') return;
  if (window.__centralFetchInterceptorInstalled) return;
  window.__centralFetchInterceptorInstalled = true;

  const originalFetch = window.fetch;

  window.fetch = async function (resource, options = {}) {
    const urlStr = typeof resource === 'string' ? resource : resource?.url || '';
    
    // Check if this is an API call for Central Admin
    if (urlStr.startsWith('/api/auth') || urlStr.startsWith('/api/admin')) {
      try {
        const method = (options.method || 'GET').toUpperCase();
        const headers = options.headers || {};
        const authHeader = headers.Authorization || headers.authorization || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const currentUser = token ? centralStore.getCurrentUser(token) : null;

        let body = {};
        if (options.body) {
          try {
            body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          } catch (_) {}
        }

        const urlObj = new URL(urlStr, window.location.origin);
        const path = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // --- AUTH ROUTES ---
        if (path === '/api/auth/setup-status') {
          return createJsonResponse(centralStore.getSetupStatus());
        }

        if (path === '/api/auth/setup-admin' && method === 'POST') {
          return createJsonResponse(centralStore.setupAdmin(body));
        }

        if (path === '/api/auth/login' && method === 'POST') {
          return createJsonResponse(centralStore.login(body.userId, body.password));
        }

        if (path === '/api/auth/logout' && method === 'POST') {
          return createJsonResponse({ success: true, message: 'Logged out.' });
        }

        if (path === '/api/auth/me') {
          if (!currentUser) {
            return createJsonResponse({ error: 'Unauthorized session' }, 401);
          }
          return createJsonResponse({ success: true, user: currentUser });
        }

        if (path === '/api/auth/sso-ticket' && method === 'POST') {
          if (!currentUser) return createJsonResponse({ error: 'Unauthorized' }, 401);
          const ticket = centralStore.createSsoTicket(body.department, currentUser);
          return createJsonResponse({ success: true, ticket });
        }

        if (path === '/api/auth/sso-exchange') {
          const ticket = searchParams.get('ticket');
          const dept = searchParams.get('dept');
          const result = centralStore.exchangeSsoTicket(ticket, dept);
          return createJsonResponse(result);
        }

        // --- ADMIN ROUTES (Requires authentication) ---
        if (path.startsWith('/api/admin')) {
          if (!currentUser) {
            return createJsonResponse({ error: 'Authentication required' }, 401);
          }

          if (path === '/api/admin/stats') {
            return createJsonResponse(centralStore.getStats());
          }

          if (path === '/api/admin/users' && method === 'GET') {
            return createJsonResponse(centralStore.listUsers());
          }

          if (path === '/api/admin/users' && method === 'POST') {
            if (currentUser.role !== 'superadmin') {
              return createJsonResponse({ error: 'Forbidden: Super Admin only' }, 403);
            }
            return createJsonResponse(centralStore.createUser(body, currentUser));
          }

          const userMatch = path.match(/^\/api\/admin\/users\/([^\/]+)$/);
          if (userMatch) {
            const targetId = userMatch[1];
            if (currentUser.role !== 'superadmin') {
              return createJsonResponse({ error: 'Forbidden: Super Admin only' }, 403);
            }
            if (method === 'PUT') {
              return createJsonResponse(centralStore.updateUser(targetId, body, currentUser));
            }
            if (method === 'DELETE') {
              return createJsonResponse(centralStore.deleteUser(targetId, currentUser));
            }
          }

          const statusMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/status$/);
          if (statusMatch && method === 'PATCH') {
            if (currentUser.role !== 'superadmin') {
              return createJsonResponse({ error: 'Forbidden: Super Admin only' }, 403);
            }
            return createJsonResponse(centralStore.toggleUserStatus(statusMatch[1], currentUser));
          }

          const resetMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/reset-password$/);
          if (resetMatch && method === 'POST') {
            if (currentUser.role !== 'superadmin') {
              return createJsonResponse({ error: 'Forbidden: Super Admin only' }, 403);
            }
            return createJsonResponse(centralStore.resetPassword(resetMatch[1], body.newPassword, currentUser));
          }

          const historyMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/login-history$/);
          if (historyMatch && method === 'GET') {
            if (currentUser.role !== 'superadmin') {
              return createJsonResponse({ error: 'Forbidden: Super Admin only' }, 403);
            }
            return createJsonResponse(centralStore.getUserLoginHistory(historyMatch[1]));
          }

          if (path === '/api/admin/audit') {
            return createJsonResponse({ success: true, logs: centralStore.getAuditLogs() });
          }

          if (path === '/api/admin/profile' && method === 'PUT') {
            return createJsonResponse(centralStore.updateProfile(body, currentUser));
          }
        }
      } catch (err) {
        return createJsonResponse({ error: err.message || 'Operation failed' }, 400);
      }
    }

    // Default: pass through to real network fetch
    return originalFetch.apply(this, arguments);
  };
}

function createJsonResponse(data, status = 200) {
  const jsonStr = JSON.stringify(data);
  return new Response(jsonStr, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
