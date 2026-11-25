import { Router } from 'express';
import { authenticateToken, requireDepartment } from '../middleware/auth.js';
import {
  UsersDAO,
  SalesClientsDAO,
  SalesWorkDAO,
  SalesHistoryDAO,
  SalesOfficeDAO,
} from '../db/centralDb.js';

const router = Router();
router.use(authenticateToken);
router.use(requireDepartment('sales'));

/**
 * Check if the requesting user has full administrator privileges in Sales
 */
export function isSalesAdmin(user) {
  if (!user) return false;
  return (
    user.role === 'superadmin' ||
    user.role === 'admin' ||
    user.departmentRoles?.sales === 'admin' ||
    user.isAdmin === true
  );
}

/**
 * Validates whether user can access/modify a specific record
 */
export function canAccessRecord(record, user) {
  if (!record || !user) return false;
  if (isSalesAdmin(user)) return true;
  return (
    record.userId === user.userId ||
    record.user_id === user.userId ||
    record.createdBy === user.userId ||
    record.created_by === user.userId
  );
}

// -------------------------------------------------------------
// 1. Status & User Management
// -------------------------------------------------------------
router.get('/status', (req, res) => {
  res.json({
    success: true,
    department: 'sales',
    user: req.user.userId,
    isAdmin: isSalesAdmin(req.user),
    status: 'operational',
  });
});

/**
 * List all users assigned to the Sales Department
 * (Accessible to Sales Admin for individual user data inspection & management)
 */
router.get('/users', async (req, res) => {
  try {
    const allUsers = await UsersDAO.findAll();
    const salesUsers = allUsers
      .filter(
        (u) =>
          u.role === 'superadmin' ||
          (Array.isArray(u.departments) && u.departments.includes('sales'))
      )
      .map((u) => ({
        id: u.id,
        userId: u.userId,
        name: u.name,
        role: u.role,
        departmentRole: u.departmentRoles?.sales || u.role,
        status: u.status,
      }));

    res.json({
      success: true,
      users: salesUsers,
      total: salesUsers.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'SERVER_ERROR' });
  }
});

// -------------------------------------------------------------
// 2. Clients / Leads Endpoints (Strict User Isolation)
// -------------------------------------------------------------
router.get('/clients', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const requestedUserId = req.query.userId || req.query.user_id;

    let filter = {};
    if (isAdmin) {
      if (requestedUserId && requestedUserId !== 'all') {
        filter.userId = String(requestedUserId).trim();
      }
    } else {
      // Non-admin can ONLY query their own records. Never trust query param for non-admin.
      filter.userId = req.user.userId;
    }

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    const clients = await SalesClientsDAO.findAll(filter);
    res.json({
      success: true,
      data: clients,
      total: clients.length,
      scope: isAdmin ? (requestedUserId ? `user:${requestedUserId}` : 'all') : `user:${req.user.userId}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    // Non-admin can NEVER set another user's ID
    const assignedUserId = isAdmin && req.body.userId ? String(req.body.userId).trim() : req.user.userId;

    const payload = {
      ...req.body,
      userId: assignedUserId,
      user_id: assignedUserId,
      createdBy: req.user.userId,
      created_by: req.user.userId,
      createdByName: req.user.name || req.user.userId,
    };

    const newClient = await SalesClientsDAO.create(payload);
    res.status(201).json({
      success: true,
      data: newClient,
      message: 'Client record created successfully with verified ownership.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/clients/:id', async (req, res) => {
  try {
    const client = await SalesClientsDAO.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(client, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to view this client record.',
        code: 'FORBIDDEN',
      });
    }

    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const existing = await SalesClientsDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify this client record.',
        code: 'FORBIDDEN',
      });
    }

    const updates = { ...req.body };
    // Prevent non-admin from changing record owner
    if (!isSalesAdmin(req.user)) {
      delete updates.userId;
      delete updates.user_id;
      delete updates.createdBy;
      delete updates.created_by;
      delete updates.createdByName;
    }

    const updated = await SalesClientsDAO.update(req.params.id, updates);
    res.json({ success: true, data: updated, message: 'Client record updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/clients/:id', async (req, res) => {
  try {
    const existing = await SalesClientsDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify this client record.',
        code: 'FORBIDDEN',
      });
    }

    const updates = { ...req.body };
    if (!isSalesAdmin(req.user)) {
      delete updates.userId;
      delete updates.user_id;
      delete updates.createdBy;
      delete updates.created_by;
      delete updates.createdByName;
    }

    const updated = await SalesClientsDAO.update(req.params.id, updates);
    res.json({ success: true, data: updated, message: 'Client record updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    const existing = await SalesClientsDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to delete this client record.',
        code: 'FORBIDDEN',
      });
    }

    await SalesClientsDAO.delete(req.params.id);
    res.json({ success: true, message: 'Client record permanently deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/clients', async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of client IDs required.' });
    }

    const isAdmin = isSalesAdmin(req.user);
    if (!isAdmin) {
      // Validate every single record belongs to the user
      for (const id of ids) {
        const client = await SalesClientsDAO.findById(id);
        if (client && !canAccessRecord(client, req.user)) {
          return res.status(403).json({
            success: false,
            error: `Forbidden: You do not own client record #${id}. Bulk deletion aborted.`,
            code: 'FORBIDDEN',
          });
        }
      }
    }

    const deletedCount = await SalesClientsDAO.deleteMany(ids);
    res.json({ success: true, deletedCount, message: `Successfully deleted ${deletedCount} client(s).` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. Work / Planned Tasks Endpoints (Strict User Isolation)
// -------------------------------------------------------------
router.get('/work', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const requestedUserId = req.query.userId || req.query.user_id;

    let filter = {};
    if (isAdmin) {
      if (requestedUserId && requestedUserId !== 'all') {
        filter.userId = String(requestedUserId).trim();
      }
    } else {
      filter.userId = req.user.userId;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) filter.date = req.query.date;

    const works = await SalesWorkDAO.findAll(filter);
    res.json({
      success: true,
      data: works,
      total: works.length,
      scope: isAdmin ? (requestedUserId ? `user:${requestedUserId}` : 'all') : `user:${req.user.userId}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/work', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const assignedUserId = isAdmin && req.body.userId ? String(req.body.userId).trim() : req.user.userId;

    const payload = {
      ...req.body,
      userId: assignedUserId,
      user_id: assignedUserId,
      createdBy: req.user.userId,
      created_by: req.user.userId,
      createdByName: req.user.name || req.user.userId,
    };

    const newWork = await SalesWorkDAO.create(payload);
    res.status(201).json({ success: true, data: newWork, message: 'Work task created successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/work/:id', async (req, res) => {
  try {
    const work = await SalesWorkDAO.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ success: false, error: 'Work task not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(work, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to view this work task.',
        code: 'FORBIDDEN',
      });
    }

    res.json({ success: true, data: work });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/work/:id', async (req, res) => {
  try {
    const existing = await SalesWorkDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Work task not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify this work task.',
        code: 'FORBIDDEN',
      });
    }

    const updates = { ...req.body };
    if (!isSalesAdmin(req.user)) {
      delete updates.userId;
      delete updates.user_id;
      delete updates.createdBy;
      delete updates.created_by;
      delete updates.createdByName;
    }

    const updated = await SalesWorkDAO.update(req.params.id, updates);
    res.json({ success: true, data: updated, message: 'Work task updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/work/:id', async (req, res) => {
  try {
    const existing = await SalesWorkDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Work task not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to delete this work task.',
        code: 'FORBIDDEN',
      });
    }

    await SalesWorkDAO.delete(req.params.id);
    res.json({ success: true, message: 'Work task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 4. Sales History & Logs Endpoints (Strict User Isolation)
// -------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const requestedUserId = req.query.userId || req.query.user_id;

    let filter = {};
    if (isAdmin) {
      if (requestedUserId && requestedUserId !== 'all') {
        filter.userId = String(requestedUserId).trim();
      }
    } else {
      filter.userId = req.user.userId;
    }

    if (req.query.type) filter.type = req.query.type;
    if (req.query.date) filter.date = req.query.date;

    const history = await SalesHistoryDAO.findAll(filter);
    res.json({
      success: true,
      data: history,
      total: history.length,
      scope: isAdmin ? (requestedUserId ? `user:${requestedUserId}` : 'all') : `user:${req.user.userId}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/history', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const assignedUserId = isAdmin && req.body.userId ? String(req.body.userId).trim() : req.user.userId;

    const payload = {
      ...req.body,
      userId: assignedUserId,
      user_id: assignedUserId,
      createdBy: req.user.userId,
      created_by: req.user.userId,
      createdByName: req.user.name || req.user.userId,
    };

    const newHistory = await SalesHistoryDAO.create(payload);
    res.status(201).json({ success: true, data: newHistory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history/:id', async (req, res) => {
  try {
    const item = await SalesHistoryDAO.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'History record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(item, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to view this history record.',
        code: 'FORBIDDEN',
      });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/history/:id', async (req, res) => {
  try {
    const existing = await SalesHistoryDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'History record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify this history record.',
        code: 'FORBIDDEN',
      });
    }

    const updates = { ...req.body };
    if (!isSalesAdmin(req.user)) {
      delete updates.userId;
      delete updates.user_id;
      delete updates.createdBy;
      delete updates.created_by;
      delete updates.createdByName;
    }

    const updated = await SalesHistoryDAO.update(req.params.id, updates);
    res.json({ success: true, data: updated, message: 'History record updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    const existing = await SalesHistoryDAO.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'History record not found', code: 'NOT_FOUND' });
    }

    if (!canAccessRecord(existing, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to delete this history record.',
        code: 'FORBIDDEN',
      });
    }

    await SalesHistoryDAO.delete(req.params.id);
    res.json({ success: true, message: 'History record deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. Office Attendance Endpoints (User-Scoped)
// -------------------------------------------------------------
router.get('/office', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const requestedUserId = req.query.userId || req.query.user_id;

    let filter = {};
    if (isAdmin) {
      if (requestedUserId && requestedUserId !== 'all') {
        filter.userId = String(requestedUserId).trim();
      }
    } else {
      filter.userId = req.user.userId;
    }

    if (req.query.date) filter.date = req.query.date;

    const office = await SalesOfficeDAO.findAll(filter);
    res.json({ success: true, data: office, total: office.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/office/in', async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().slice(0, 10);
    const inTime = req.body.in || new Date().toISOString();

    const existingLogs = await SalesOfficeDAO.findAll({ userId: req.user.userId, date });
    const activeLog = existingLogs.find((l) => !l.out);
    if (activeLog) {
      return res.status(400).json({ success: false, error: 'Office IN is already active for today.' });
    }

    const entry = await SalesOfficeDAO.recordIn({
      date,
      in: inTime,
      userId: req.user.userId,
      user_id: req.user.userId,
      createdBy: req.user.userId,
      created_by: req.user.userId,
      createdByName: req.user.name || req.user.userId,
    });

    res.status(201).json({ success: true, data: entry, message: 'Office IN recorded.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/office/out', async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().slice(0, 10);
    const outTime = req.body.out || new Date().toISOString();

    const ok = await SalesOfficeDAO.recordOut(date, outTime, req.user.userId);
    if (!ok) {
      return res.status(400).json({ success: false, error: 'No active Office IN found to check out.' });
    }

    res.json({ success: true, message: 'Office OUT recorded.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 6. Dashboard & Reporting Summary Endpoint
// -------------------------------------------------------------
router.get('/dashboard', async (req, res) => {
  try {
    const isAdmin = isSalesAdmin(req.user);
    const requestedUserId = req.query.userId || req.query.user_id;

    let filter = {};
    if (isAdmin) {
      if (requestedUserId && requestedUserId !== 'all') {
        filter.userId = String(requestedUserId).trim();
      }
    } else {
      filter.userId = req.user.userId;
    }

    const tDate = new Date().toISOString().slice(0, 10);

    const [clients, work, history] = await Promise.all([
      SalesClientsDAO.findAll(filter),
      SalesWorkDAO.findAll(filter),
      SalesHistoryDAO.findAll(filter),
    ]);

    const potentialClients = clients.filter((c) => c.category === 'Potential').length;
    const quotationClients = clients.filter((c) => c.category === 'Quotation').length;
    const orderWonClients = clients.filter((c) => c.category === 'Order Won').length;

    const todayDueFollowups = clients.filter((c) => c.nextDate && c.nextDate <= tDate).length;
    const todayPendingWork = work.filter((w) => w.date === tDate && w.status === 'Pending').length;
    const totalTodayDue = todayDueFollowups + todayPendingWork;

    res.json({
      success: true,
      summary: {
        totalClients: clients.length,
        potentialClients,
        quotationClients,
        orderWonClients,
        todayDueFollowups,
        todayPendingWork,
        totalTodayDue,
        totalWorkOrders: work.length,
        totalCompletedHistory: history.length,
      },
      scope: isAdmin ? (requestedUserId ? `user:${requestedUserId}` : 'all') : `user:${req.user.userId}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
