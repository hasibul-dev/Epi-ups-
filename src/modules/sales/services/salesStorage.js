/**
 * EPI Sales Department - Local Data Persistence Architecture
 * Backed by the Central Unified IndexedDB & LocalStorage Engine
 * Enhanced with Strict User-Wise Data Isolation & Role-Based Access Control
 */

import { unifiedStore, assertAuthorizedAdmin } from '../../../services/unifiedStorage.js';

/**
 * Safely resolves the currently active user from arguments or persistent storage
 */
export function resolveUser(user) {
  if (user && user.userId) return user;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('epi_central_user') || sessionStorage.getItem('epi_central_user');
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

/**
 * Checks whether user has full Administrative access in the Sales Department
 */
export function isSalesAdmin(user) {
  const u = resolveUser(user);
  if (!u) return false;
  return (
    u.role === 'superadmin' ||
    u.role === 'admin' ||
    u.departmentRoles?.sales === 'admin' ||
    u.isAdmin === true
  );
}

/**
 * Validates ownership of a specific sales record
 */
export function canAccessRecord(record, user) {
  if (!record) return false;
  const u = resolveUser(user);
  if (!u) return true;
  if (isSalesAdmin(u)) return true;
  return (
    record.userId === u.userId ||
    record.user_id === u.userId ||
    record.createdBy === u.userId ||
    record.created_by === u.userId
  );
}

class SalesStorageEngine {
  constructor() {
    this.store = unifiedStore;
  }

  async init(user) {
    await this.store.init();
    return this.getData(user);
  }

  /**
   * Retrieves data scoped strictly to the requesting user (or all if admin)
   */
  getData(userProp, filterOptions = {}) {
    const user = resolveUser(userProp);
    const mem = this.store.memory || {};
    const allClients = mem.clients || [];
    const allWork = mem.salesWork || [];
    const allHistory = mem.salesHistory || [];
    const allOffice = mem.salesOffice || [];

    if (!user) {
      return {
        clients: allClients,
        work: allWork,
        newWork: [],
        history: allHistory,
        office: allOffice,
      };
    }

    const isAdmin = isSalesAdmin(user);
    const filterUserId = filterOptions.userId || filterOptions.user_id;

    if (isAdmin) {
      if (filterUserId && filterUserId !== 'all') {
        const matchesTarget = (r) =>
          r.userId === filterUserId ||
          r.user_id === filterUserId ||
          r.createdBy === filterUserId ||
          r.created_by === filterUserId;

        return {
          clients: allClients.filter(matchesTarget),
          work: allWork.filter(matchesTarget),
          newWork: [],
          history: allHistory.filter(matchesTarget),
          office: allOffice.filter(matchesTarget),
        };
      }

      return {
        clients: allClients,
        work: allWork,
        newWork: [],
        history: allHistory,
        office: allOffice,
      };
    }

    // Non-admin sales user: STRICT user-level data isolation
    const matchesUser = (r) =>
      r.userId === user.userId ||
      r.user_id === user.userId ||
      r.createdBy === user.userId ||
      r.created_by === user.userId;

    return {
      clients: allClients.filter(matchesUser),
      work: allWork.filter(matchesUser),
      newWork: [],
      history: allHistory.filter(matchesUser),
      office: allOffice.filter(matchesUser),
    };
  }

  persist() {
    this.store.persist();
  }

  // --- Clients CRUD ---
  addClient(client, userProp) {
    const user = resolveUser(userProp);
    const cleanId = String(client.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const isAdmin = isSalesAdmin(user);
    const targetUserId = (isAdmin && client.userId) ? String(client.userId).trim() : (user?.userId || 'sales1');

    const newClient = {
      clientType: 'Sales',
      category: 'Potential',
      ...client,
      id: cleanId,
      userId: targetUserId,
      user_id: targetUserId,
      createdBy: user?.userId || targetUserId,
      created_by: user?.userId || targetUserId,
      createdByName: user?.name || user?.userId || 'Sales User',
      createdAt: client.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.clients || [];
    this.store.memory.clients = [...existing.filter((c) => c.id !== cleanId), newClient];
    this.persist();
    return newClient;
  }

  updateClient(id, updates, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const client = (this.store.memory.clients || []).find((c) => c.id === id);
    if (!client) return false;

    if (user && !canAccessRecord(client, user)) {
      throw new Error('403 Forbidden: You do not have permission to modify this client record.');
    }

    const cleanUpdates = { ...updates };
    if (!isSalesAdmin(user)) {
      delete cleanUpdates.userId;
      delete cleanUpdates.user_id;
      delete cleanUpdates.createdBy;
      delete cleanUpdates.created_by;
      delete cleanUpdates.createdByName;
    }

    this.store.memory.clients = (this.store.memory.clients || []).map((c) =>
      c.id === id ? { ...c, ...cleanUpdates, updatedAt: new Date().toISOString() } : c
    );
    this.persist();
    return true;
  }

  deleteClient(id, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const client = (this.store.memory.clients || []).find((c) => c.id === id);
    if (!client) return false;

    if (user && !canAccessRecord(client, user)) {
      throw new Error('403 Forbidden: You do not have permission to delete this client record.');
    }

    this.store.memory.clients = (this.store.memory.clients || []).filter((c) => c.id !== id);
    this.persist();
    return true;
  }

  deleteClients(ids, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const idSet = new Set(ids);

    if (user && !isSalesAdmin(user)) {
      for (const id of ids) {
        const client = (this.store.memory.clients || []).find((c) => c.id === id);
        if (client && !canAccessRecord(client, user)) {
          throw new Error(`403 Forbidden: You do not have permission to delete client #${id}.`);
        }
      }
    }

    this.store.memory.clients = (this.store.memory.clients || []).filter((c) => !idSet.has(c.id));
    this.persist();
    return true;
  }

  // --- Work CRUD ---
  addWork(work, userProp) {
    const user = resolveUser(userProp);
    const cleanId = String(work.id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const isAdmin = isSalesAdmin(user);
    const targetUserId = (isAdmin && work.userId) ? String(work.userId).trim() : (user?.userId || 'sales1');

    const newWork = {
      status: 'Pending',
      ...work,
      id: cleanId,
      userId: targetUserId,
      user_id: targetUserId,
      createdBy: user?.userId || targetUserId,
      created_by: user?.userId || targetUserId,
      createdByName: user?.name || user?.userId || 'Sales User',
      createdAt: work.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.salesWork || [];
    this.store.memory.salesWork = [...existing.filter((w) => w.id !== cleanId), newWork];
    this.persist();
    return newWork;
  }

  updateWork(id, updates, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const work = (this.store.memory.salesWork || []).find((w) => w.id === id);
    if (!work) return false;

    if (user && !canAccessRecord(work, user)) {
      throw new Error('403 Forbidden: You do not have permission to modify this work record.');
    }

    const cleanUpdates = { ...updates };
    if (!isSalesAdmin(user)) {
      delete cleanUpdates.userId;
      delete cleanUpdates.user_id;
      delete cleanUpdates.createdBy;
      delete cleanUpdates.created_by;
      delete cleanUpdates.createdByName;
    }

    this.store.memory.salesWork = (this.store.memory.salesWork || []).map((w) =>
      w.id === id ? { ...w, ...cleanUpdates, updatedAt: new Date().toISOString() } : w
    );
    this.persist();
    return true;
  }

  deleteWork(id, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const work = (this.store.memory.salesWork || []).find((w) => w.id === id);
    if (!work) return false;

    if (user && !canAccessRecord(work, user)) {
      throw new Error('403 Forbidden: You do not have permission to delete this work record.');
    }

    this.store.memory.salesWork = (this.store.memory.salesWork || []).filter((w) => w.id !== id);
    this.persist();
    return true;
  }

  // --- History CRUD ---
  addHistory(record, userProp) {
    const user = resolveUser(userProp);
    const cleanId = String(record.id || `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const isAdmin = isSalesAdmin(user);
    const targetUserId = (isAdmin && record.userId) ? String(record.userId).trim() : (user?.userId || 'sales1');

    const newRecord = {
      status: 'Completed',
      ...record,
      id: cleanId,
      userId: targetUserId,
      user_id: targetUserId,
      createdBy: user?.userId || targetUserId,
      created_by: user?.userId || targetUserId,
      createdByName: user?.name || user?.userId || 'Sales User',
      createdAt: record.createdAt || new Date().toISOString(),
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.salesHistory || [];
    this.store.memory.salesHistory = [newRecord, ...existing.filter((h) => h.id !== cleanId)];
    this.persist();
    return newRecord;
  }

  updateHistory(id, updates, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const item = (this.store.memory.salesHistory || []).find((h) => h.id === id);
    if (!item) return false;

    if (user && !canAccessRecord(item, user)) {
      throw new Error('403 Forbidden: You do not have permission to modify this history record.');
    }

    const cleanUpdates = { ...updates };
    if (!isSalesAdmin(user)) {
      delete cleanUpdates.userId;
      delete cleanUpdates.user_id;
      delete cleanUpdates.createdBy;
      delete cleanUpdates.created_by;
      delete cleanUpdates.createdByName;
    }

    this.store.memory.salesHistory = (this.store.memory.salesHistory || []).map((h) =>
      h.id === id ? { ...h, ...cleanUpdates } : h
    );
    this.persist();
    return true;
  }

  deleteHistory(id, userProp) {
    if (!this.store.memory) return false;
    const user = resolveUser(userProp);
    const item = (this.store.memory.salesHistory || []).find((h) => h.id === id);
    if (!item) return false;

    if (user && !canAccessRecord(item, user)) {
      throw new Error('403 Forbidden: You do not have permission to delete this history record.');
    }

    this.store.memory.salesHistory = (this.store.memory.salesHistory || []).filter((h) => h.id !== id);
    this.persist();
    return true;
  }

  // --- Office Attendance ---
  recordOfficeIn(entry, userProp) {
    const user = resolveUser(userProp);
    const cleanId = String(entry.id || `off_${Date.now()}`);
    const newEntry = {
      ...entry,
      id: cleanId,
      userId: user?.userId || 'system',
      user_id: user?.userId || 'system',
      createdBy: user?.userId || 'system',
      created_by: user?.userId || 'system',
      createdByName: user?.name || user?.userId || 'Sales User',
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.salesOffice || [];
    this.store.memory.salesOffice = [...existing, newEntry];
    this.persist();
    return newEntry;
  }

  recordOfficeOut(date, outTime, userProp) {
    if (!this.store.memory) return;
    const user = resolveUser(userProp);
    const userId = user?.userId;
    this.store.memory.salesOffice = (this.store.memory.salesOffice || []).map((o) => {
      const matchUser = !userId || o.userId === userId || o.createdBy === userId || o.created_by === userId;
      return o.date === date && !o.out && matchUser ? { ...o, out: outTime } : o;
    });
    this.persist();
  }

  // --- JSON Backup Export & Import ---
  exportDatabase(user) {
    assertAuthorizedAdmin(user);
    return this.store.exportFullBackup(user);
  }

  exportJsonBackup(user) {
    assertAuthorizedAdmin(user);
    return JSON.stringify(
      {
        schema: 'epi_sales_backup_v2',
        exportedAt: new Date().toISOString(),
        data: this.getData(user),
      },
      null,
      2
    );
  }

  importJsonBackup(jsonStr, user) {
    assertAuthorizedAdmin(user);
    const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    const incomingData = parsed.data || parsed;
    if (!this.store.memory) this.store.memory = {};
    if (Array.isArray(incomingData.clients)) this.store.memory.clients = incomingData.clients;
    if (Array.isArray(incomingData.work)) this.store.memory.salesWork = incomingData.work;
    if (Array.isArray(incomingData.newWork)) this.store.memory.salesWork = [...(this.store.memory.salesWork || []), ...incomingData.newWork];
    if (Array.isArray(incomingData.history)) this.store.memory.salesHistory = incomingData.history;
    if (Array.isArray(incomingData.office)) this.store.memory.salesOffice = incomingData.office;
    this.persist();
    return this.getData(user);
  }
}

export const salesStorage = new SalesStorageEngine();
