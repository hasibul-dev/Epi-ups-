import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UsersDAO, AuditDAO } from './db.js';
import { authenticateToken, requireSuperAdmin } from './middleware.js';

const router = Router();

// Strictly guard all admin endpoints: Token required + Super Admin role required
router.use(authenticateToken);
router.use(requireSuperAdmin);

// -------------------------------------------------------------
// Central Admin Stats Dashboard
// -------------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const allUsers = await UsersDAO.findAll();
    
    const totalEmployees = allUsers.length;
    const activeEmployees = allUsers.filter((u) => u.status === 'active').length;
    const inactiveEmployees = allUsers.filter((u) => u.status === 'inactive').length;
    
    const serviceUsers = allUsers.filter(
      (u) => u.role === 'superadmin' || (Array.isArray(u.departments) && u.departments.includes('service'))
    ).length;

    const salesUsers = allUsers.filter(
      (u) => u.role === 'superadmin' || (Array.isArray(u.departments) && u.departments.includes('sales'))
    ).length;

    const accountsUsers = allUsers.filter(
      (u) => u.role === 'superadmin' || (Array.isArray(u.departments) && u.departments.includes('accounts'))
    ).length;

    // Collect recent logins across users
    const allLogins = [];
    for (const u of allUsers) {
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
    const recentLogins = allLogins.slice(0, 15);

    // Collect recent audit activities
    const recentActivities = await AuditDAO.getRecent(15);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        serviceUsers,
        salesUsers,
        accountsUsers,
        recentLogins,
        recentActivities,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// User Management Endpoints
// -------------------------------------------------------------

// List all registered users
router.get('/users', async (req, res) => {
  try {
    const users = await UsersDAO.findAll();
    const sanitized = users.map((u) => ({
      id: u.id,
      userId: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
      departments: u.departments || [],
      departmentRoles: u.departmentRoles || {},
      status: u.status,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      loginCount: Array.isArray(u.loginHistory) ? u.loginHistory.length : 0,
    }));
    res.json({ success: true, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new employee account
router.post('/users', async (req, res) => {
  try {
    const { userId, name, email, password, departments, departmentRoles, status } = req.body || {};

    const cleanUserId = String(userId || '').trim();
    const cleanName = String(name || '').trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const rawPassword = String(password || '');

    if (!cleanUserId || cleanUserId.length < 3) {
      return res.status(400).json({ success: false, error: 'User ID must be at least 3 characters.' });
    }
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Employee name is required.' });
    }
    if (!rawPassword || rawPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    // Check for duplicate userId
    const existing = await UsersDAO.findByUserId(cleanUserId);
    if (existing) {
      return res.status(409).json({ success: false, error: `User ID "${cleanUserId}" is already in use.` });
    }

    // Validate departments
    const validDepts = ['service', 'sales', 'accounts'];
    const assignedDepts = Array.isArray(departments)
      ? departments.filter((d) => validDepts.includes(String(d).toLowerCase()))
      : [];

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const newUser = await UsersDAO.create({
      userId: cleanUserId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'employee',
      departments: assignedDepts,
      departmentRoles: departmentRoles || {},
      status: status === 'inactive' ? 'inactive' : 'active',
      createdBy: req.user.userId,
    });

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: 'USER_CREATED',
      performedBy: req.user.userId,
      targetUserId: cleanUserId,
      details: `Created employee ${cleanName} (${cleanUserId}) with access to [${assignedDepts.join(', ')}].`,
      ip,
    });

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully.',
      user: {
        id: newUser.id,
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departments: newUser.departments,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update employee details
router.put('/users/:id', async (req, res) => {
  try {
    const targetUser = await UsersDAO.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Employee account not found.' });
    }

    const { name, email, departments, departmentRoles, status } = req.body || {};

    const updates = {};
    if (name) updates.name = String(name).trim();
    if (email !== undefined) updates.email = String(email).trim().toLowerCase();

    // Prevent Super Admin from removing their own admin role or deactivating themselves
    if (targetUser.role === 'superadmin' && String(targetUser.id) === String(req.user.id)) {
      if (status === 'inactive') {
        return res.status(400).json({ success: false, error: 'You cannot deactivate your own Super Admin account.' });
      }
    } else {
      if (status) updates.status = status === 'inactive' ? 'inactive' : 'active';
      if (Array.isArray(departments)) {
        const validDepts = ['service', 'sales', 'accounts'];
        updates.departments = departments.filter((d) => validDepts.includes(String(d).toLowerCase()));
      }
      if (departmentRoles && typeof departmentRoles === 'object') {
        updates.departmentRoles = departmentRoles;
      }
    }

    const updated = await UsersDAO.update(targetUser.id, updates);

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: 'USER_UPDATED',
      performedBy: req.user.userId,
      targetUserId: targetUser.userId,
      details: `Updated details for ${targetUser.userId}. Departments: [${(updated.departments || []).join(', ')}], Status: ${updated.status}.`,
      ip,
    });

    res.json({
      success: true,
      message: 'Employee updated successfully.',
      user: {
        id: updated.id,
        userId: updated.userId,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        departments: updated.departments,
        status: updated.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset employee password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const targetUser = await UsersDAO.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Employee account not found.' });
    }

    const { newPassword } = req.body || {};
    const cleanPassword = String(newPassword || '');

    if (!cleanPassword || cleanPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long.',
      });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 12);
    await UsersDAO.update(targetUser.id, { passwordHash });

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: 'PASSWORD_RESET',
      performedBy: req.user.userId,
      targetUserId: targetUser.userId,
      details: `Reset password for employee ${targetUser.userId}.`,
      ip,
    });

    res.json({
      success: true,
      message: `Password for ${targetUser.userId} has been successfully reset.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle account activation status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const targetUser = await UsersDAO.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Employee account not found.' });
    }

    if (targetUser.role === 'superadmin' && String(targetUser.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, error: 'You cannot change your own Super Admin status.' });
    }

    const nextStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    await UsersDAO.update(targetUser.id, { status: nextStatus });

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: nextStatus === 'active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      performedBy: req.user.userId,
      targetUserId: targetUser.userId,
      details: `Changed account status of ${targetUser.userId} to ${nextStatus}.`,
      ip,
    });

    res.json({
      success: true,
      message: `Account status updated to ${nextStatus}.`,
      status: nextStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete an employee account
router.delete('/users/:id', async (req, res) => {
  try {
    const targetUser = await UsersDAO.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Employee account not found.' });
    }

    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ success: false, error: 'Super Admin accounts cannot be deleted.' });
    }

    await UsersDAO.delete(targetUser.id);

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    await AuditDAO.log({
      action: 'USER_DELETED',
      performedBy: req.user.userId,
      targetUserId: targetUser.userId,
      details: `Deleted employee account ${targetUser.name} (${targetUser.userId}).`,
      ip,
    });

    res.json({
      success: true,
      message: `Employee account ${targetUser.userId} deleted successfully.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// View full Audit Log history
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await AuditDAO.getRecent(limit);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
