import jwt from 'jsonwebtoken';
import { UsersDAO } from '../db/centralDb.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'epi_central_management_system_secure_jwt_secret_2026_bd';
export const TOKEN_EXPIRY = '24h';

export function signUserToken(user) {
  return jwt.sign(
    {
      sub: String(user.id || user._id),
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role, // 'superadmin' | 'employee' | 'manager' | 'engineer' | 'accountant'
      departments: user.departments || [],
      departmentRoles: user.departmentRoles || {},
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export async function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-central-token']) {
    token = req.headers['x-central-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No session token provided.',
      code: 'AUTH_REQUIRED',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Validate live account status against database
    const liveUser = await UsersDAO.findById(payload.sub || payload.userId);
    if (!liveUser) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or has been deleted.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (liveUser.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'User account is deactivated. Access revoked.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    req.user = {
      _id: liveUser.id,
      id: liveUser.id,
      userId: liveUser.userId,
      name: liveUser.name,
      email: liveUser.email,
      role: liveUser.role,
      departments: liveUser.departments || [],
      departmentRoles: liveUser.departmentRoles || {},
      status: liveUser.status,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please sign in again.',
      code: 'TOKEN_INVALID',
    });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Only Super Admin can perform this action.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }
  next();
}

export function requireDepartment(departmentName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user.role === 'superadmin') {
      return next();
    }

    const assignedDepts = Array.isArray(req.user.departments) ? req.user.departments : [];
    if (!assignedDepts.includes(String(departmentName).toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: You do not have permissions for ${departmentName} department.`,
        code: 'DEPT_FORBIDDEN',
        requiredDepartment: departmentName,
        assignedDepartments: assignedDepts,
      });
    }

    next();
  };
}
