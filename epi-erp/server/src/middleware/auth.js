import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, AuditLog } from '../models/core.js';
import { AccountingError } from '../services/accounting.js';
import { demoUser } from '../services/demoMock.js';

export const MODULES = ['dashboard', 'accounts', 'journal', 'banking', 'sales', 'purchase', 'payments', 'expenses', 'inventory', 'vat', 'payroll', 'assets', 'reports', 'users', 'audit', 'settings'];
const ALL = MODULES.filter((m) => m !== 'users');

// role -> module -> allowed actions (read | write | void)
const rw = ['read', 'write', 'void'];
export const PERMISSIONS = {
  admin: Object.fromEntries(MODULES.map((m) => [m, rw])),
  accountant: { ...Object.fromEntries(ALL.map((m) => [m, rw])), audit: ['read'], settings: ['read'], users: [] },
  manager: { ...Object.fromEntries(ALL.map((m) => [m, ['read']])), sales: ['read', 'write'], purchase: ['read', 'write'], inventory: ['read', 'write'], users: [], settings: ['read'] },
  hr: { dashboard: ['read'], payroll: rw },
  store: { dashboard: ['read'], inventory: rw, sales: ['read'], purchase: ['read'] },
  auditor: { ...Object.fromEntries(ALL.map((m) => [m, ['read']])), users: [] },
};

export const can = (role, module, action) => !!PERMISSIONS[role]?.[module]?.includes(action);

export async function authenticate(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }

  // 1. Verify Central Management System SSO Token
  const centralSecret = process.env.CENTRAL_JWT_SECRET || 'epi_central_management_system_secure_jwt_secret_2026_bd';
  let centralPayload = null;
  try {
    centralPayload = jwt.verify(token, centralSecret);
  } catch (e) {}

  if (centralPayload) {
    const isSuper = centralPayload.role === 'superadmin';
    const hasAccounts = Array.isArray(centralPayload.departments) && centralPayload.departments.includes('accounts');
    if (!isSuper && !hasAccounts) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access the Accounts Department.',
        code: 'FORBIDDEN_DEPARTMENT',
      });
    }

    const assignedRole = isSuper ? 'admin' : (centralPayload.departmentRoles?.accounts || 'accountant');
    req.user = {
      _id: centralPayload.sub || centralPayload.userId || 'central_user',
      id: centralPayload.sub || centralPayload.userId || 'central_user',
      name: centralPayload.name || 'Central Employee',
      email: centralPayload.email || `${centralPayload.userId}@epiups.com.bd`,
      role: assignedRole,
      permissions: PERMISSIONS[assignedRole] || PERMISSIONS.admin,
      active: true,
    };
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET || 'epi-erp-local-demo-jwt-secret-key-32-chars-minimum';
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid authentication token', code: 'TOKEN_INVALID' });
  }

  // 1. Check demo user first (matches demo token instantly)
  if (payload.sub === String(demoUser._id) || payload.email === demoUser.email) {
    req.user = demoUser;
    return next();
  }

  // 2. Check if DB is connected
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const user = await User.findById(payload.sub).lean();
      if (!user || user.active === false) {
        return res.status(401).json({ error: 'Account disabled or not found', code: 'ACCOUNT_DISABLED' });
      }
      req.user = user;
      return next();
    }

    // 3. Fallback for demo mode or in-memory when DB is not connected
    const isDemo = process.env.DEMO_MODE === 'true' ||
      !process.env.MONGODB_URI ||
      process.env.MONGODB_URI === 'demo' ||
      process.env.MONGODB_URI === 'memory';

    if (isDemo) {
      req.user = demoUser;
      return next();
    }

    // 4. In normal DB mode when DB is unavailable: return 503 Service Unavailable, NEVER 401!
    return res.status(503).json({ error: 'Database service is currently unavailable. Please retry in a moment.', code: 'DB_UNAVAILABLE' });
  } catch (dbErr) {
    console.error('Authentication DB lookup error:', dbErr.message);
    // Never return 401 for an internal/database lookup failure!
    return res.status(500).json({ error: 'Authentication service temporarily unavailable', code: 'AUTH_SERVICE_ERROR' });
  }
}

export const guard = (module, action) => (req, res, next) =>
  can(req.user?.role, module, action)
    ? next()
    : res.status(403).json({ error: `Your role (${req.user?.role || 'user'}) cannot ${action} ${module}`, code: 'FORBIDDEN' });

export async function audit(req, action, entity, entityId, summary) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await AuditLog.create({
        user: req.user?._id, userName: req.user?.name, role: req.user?.role,
        action, entity, entityId: entityId ? String(entityId) : undefined, summary, ip: req.ip,
      });
    }
  } catch (e) { console.error('Audit log failed:', e.message); }
}

export const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return res.status(400).json({ error: msg });
  }
  req.body = r.data;
  next();
};

export function errorHandler(err, req, res, _next) {
  if (err instanceof AccountingError) return res.status(err.status).json({ error: err.message });
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    return res.status(409).json({ error: `Duplicate ${field}: it already exists` });
  }
  if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join('; ') });
  if (err.name === 'CastError') return res.status(400).json({ error: `Invalid ${err.path}` });
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
}
