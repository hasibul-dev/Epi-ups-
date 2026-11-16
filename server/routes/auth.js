import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UsersDAO, AuditDAO } from '../db/centralDb.js';
import { authenticateToken, signUserToken } from '../middleware/auth.js';

const router = Router();

// Check if initial Super Admin setup is needed
router.get('/setup-status', async (req, res) => {
  try {
    const adminCount = await UsersDAO.countSuperAdmins();
    res.json({
      success: true,
      needsSetup: adminCount === 0,
      totalAdmins: adminCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// First-time secure Super Admin setup
router.post('/setup-admin', async (req, res) => {
  try {
    const adminCount = await UsersDAO.countSuperAdmins();
    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        error: 'Initial setup has already been completed. Super Admin exists.',
      });
    }

    const { userId, name, email, password } = req.body || {};

    if (!userId || String(userId).trim().length < 3) {
      return res.status(400).json({ success: false, error: 'User ID must be at least 3 characters.' });
    }
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    const cleanUserId = String(userId).trim();
    const cleanName = String(name).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    const passwordHash = await bcrypt.hash(password, 12);

    const superAdmin = await UsersDAO.create({
      userId: cleanUserId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'superadmin',
      departments: ['service', 'sales', 'accounts'],
      departmentRoles: {
        sales: 'admin',
        service: 'admin',
        accounts: 'admin',
      },
      status: 'active',
      createdBy: 'initial-setup',
    });

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: 'INITIAL_SETUP',
      performedBy: cleanUserId,
      targetUserId: cleanUserId,
      details: 'Super Admin account successfully initialized via secure setup.',
      ip,
    });

    const token = signUserToken(superAdmin);

    res.status(201).json({
      success: true,
      message: 'Super Admin successfully initialized.',
      token,
      user: {
        id: superAdmin.id,
        userId: superAdmin.userId,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        departments: superAdmin.departments,
        status: superAdmin.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Centralized Unified Login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body || {};
    const inputId = String(userId || '').trim();
    const inputPass = String(password || '');

    if (!inputId || !inputPass) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both User ID and Password.',
      });
    }

    // Lookup user by User ID or Email
    let user = await UsersDAO.findByUserId(inputId);
    if (!user && inputId.includes('@')) {
      user = await UsersDAO.findByEmail(inputId);
    }

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!user) {
      await AuditDAO.log({
        action: 'LOGIN_FAILED',
        performedBy: inputId,
        details: 'Login attempt with unknown User ID.',
        ip,
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid User ID or password.',
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      await AuditDAO.log({
        action: 'LOGIN_BLOCKED',
        performedBy: user.userId,
        targetUserId: user.userId,
        details: 'Login blocked: Account is deactivated.',
        ip,
      });
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated. Please contact your Super Admin.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(inputPass, user.passwordHash);
    if (!isMatch) {
      await AuditDAO.log({
        action: 'LOGIN_FAILED',
        performedBy: user.userId,
        targetUserId: user.userId,
        details: 'Failed login attempt: Incorrect password.',
        ip,
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid User ID or password.',
      });
    }

    // Record login in history
    await UsersDAO.recordLogin(user.id, { ip, userAgent });

    await AuditDAO.log({
      action: 'LOGIN_SUCCESS',
      performedBy: user.userId,
      targetUserId: user.userId,
      details: `Successful login to EPI Central Management System (${user.role}).`,
      ip,
    });

    const token = signUserToken(user);

    // Compute automatic department redirection
    let redirectDepartment = 'dashboard';
    if (user.role === 'superadmin') {
      redirectDepartment = 'dashboard';
    } else if (Array.isArray(user.departments)) {
      if (user.departments.length === 1) {
        redirectDepartment = user.departments[0];
      } else {
        redirectDepartment = 'dashboard';
      }
    }

    res.json({
      success: true,
      token,
      redirectDepartment,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        departments: user.departments || [],
        departmentRoles: user.departmentRoles || {},
        status: user.status,
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validate active session token & return live user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
  await AuditDAO.log({
    action: 'LOGOUT',
    performedBy: req.user.userId,
    targetUserId: req.user.userId,
    details: 'User logged out of EPI Central Management System.',
    ip,
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Change own password
router.post('/change-own-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long.',
      });
    }

    const liveUser = await UsersDAO.findById(req.user.id);
    if (!liveUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, liveUser.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await UsersDAO.update(liveUser.id, { passwordHash: newHash });

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: 'PASSWORD_CHANGED',
      performedBy: req.user.userId,
      targetUserId: req.user.userId,
      details: 'User changed their own password.',
      ip,
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// In-memory single-use SSO tickets cache
const ssoTickets = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ticket, record] of ssoTickets.entries()) {
    if (now > record.expiresAt) ssoTickets.delete(ticket);
  }
}, 30000);

// Generate a secure, single-use SSO ticket for cross-origin department launch
router.post('/sso-ticket', authenticateToken, async (req, res) => {
  try {
    const { department } = req.body || {};
    const dept = String(department || '').toLowerCase();
    
    // Verify department permission
    if (dept && req.user.role !== 'superadmin') {
      const depts = req.user.departments || [];
      if (!depts.includes(dept)) {
        return res.status(403).json({
          success: false,
          error: `You do not have permission to access the ${dept.toUpperCase()} department.`,
        });
      }
    }

    const ticket = `sso_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const liveUser = await UsersDAO.findById(req.user.id);
    if (!liveUser || liveUser.status !== 'active') {
      return res.status(403).json({ success: false, error: 'User account is not active.' });
    }

    const token = signUserToken(liveUser);

    ssoTickets.set(ticket, {
      ticket,
      token,
      user: {
        id: liveUser.id,
        userId: liveUser.userId,
        name: liveUser.name,
        email: liveUser.email,
        role: liveUser.role,
        departments: liveUser.departments || [],
        departmentRoles: liveUser.departmentRoles || {},
        status: liveUser.status,
      },
      department: dept,
      expiresAt: Date.now() + 60000, // 60 seconds TTL
    });

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single-use SSO ticket exchange endpoint
router.get('/sso-exchange', async (req, res) => {
  try {
    const { ticket, dept } = req.query || {};
    if (!ticket || !ssoTickets.has(ticket)) {
      return res.status(401).json({ success: false, error: 'SSO ticket is invalid or has expired.' });
    }

    const record = ssoTickets.get(ticket);
    ssoTickets.delete(ticket); // Single use: immediately consume ticket

    if (Date.now() > record.expiresAt) {
      return res.status(401).json({ success: false, error: 'SSO ticket has expired.' });
    }

    // Verify department matches if specified
    if (dept) {
      const targetDept = String(dept).toLowerCase();
      if (record.user.role !== 'superadmin' && !record.user.departments.includes(targetDept)) {
        return res.status(403).json({
          success: false,
          error: `Unauthorized: User lacks permission for the ${targetDept} department.`,
        });
      }
    }

    res.json({
      success: true,
      token: record.token,
      user: record.user,
      department: record.department,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
