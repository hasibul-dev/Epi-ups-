/**
 * EPI Sales Department - Local Data Persistence Architecture
 * Backed by the Central Unified IndexedDB & LocalStorage Engine
 */

import { unifiedStore, assertAuthorizedAdmin } from '../../../services/unifiedStorage.js';

class SalesStorageEngine {
  constructor() {
    this.store = unifiedStore;
  }

  async init() {
    await this.store.init();
    return this.getData();
  }

  getData() {
    const mem = this.store.memory || {};
    return {
      clients: mem.clients || [],
      work: mem.salesWork || [],
      newWork: [],
      history: mem.salesHistory || [],
      office: mem.salesOffice || [],
    };
  }

  persist() {
    this.store.persist();
  }

  // --- Clients CRUD ---
  addClient(client) {
    const cleanId = String(client.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const newClient = {
      clientType: 'Sales',
      category: 'Potential',
      ...client,
      id: cleanId,
      createdAt: client.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.clients || [];
    this.store.memory.clients = [...existing.filter((c) => c.id !== cleanId), newClient];
    this.persist();
    return newClient;
  }

  updateClient(id, updates) {
    if (!this.store.memory) return;
    this.store.memory.clients = (this.store.memory.clients || []).map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    this.persist();
  }

  deleteClient(id) {
    if (!this.store.memory) return;
    this.store.memory.clients = (this.store.memory.clients || []).filter((c) => c.id !== id);
    this.persist();
  }

  deleteClients(ids) {
    if (!this.store.memory) return;
    const idSet = new Set(ids);
    this.store.memory.clients = (this.store.memory.clients || []).filter((c) => !idSet.has(c.id));
    this.persist();
  }

  // --- Work CRUD ---
  addWork(work) {
    const cleanId = String(work.id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const newWork = {
      status: 'Pending',
      ...work,
      id: cleanId,
      createdAt: work.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.salesWork || [];
    this.store.memory.salesWork = [...existing.filter((w) => w.id !== cleanId), newWork];
    this.persist();
    return newWork;
  }

  updateWork(id, updates) {
    if (!this.store.memory) return;
    this.store.memory.salesWork = (this.store.memory.salesWork || []).map((w) =>
      w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
    );
    this.persist();
  }

  deleteWork(id) {
    if (!this.store.memory) return;
    this.store.memory.salesWork = (this.store.memory.salesWork || []).filter((w) => w.id !== id);
    this.persist();
  }

  // --- History CRUD ---
  addHistory(record) {
    const cleanId = String(record.id || `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const newRecord = {
      status: 'Completed',
      ...record,
      id: cleanId,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.salesHistory || [];
    this.store.memory.salesHistory = [newRecord, ...existing.filter((h) => h.id !== cleanId)];
    this.persist();
    return newRecord;
  }

  updateHistory(id, updates) {
    if (!this.store.memory) return;
    this.store.memory.salesHistory = (this.store.memory.salesHistory || []).map((h) =>
      h.id === id ? { ...h, ...updates } : h
    );
    this.persist();
  }

  deleteHistory(id) {
    if (!this.store.memory) return;
    this.store.memory.salesHistory = (this.store.memory.salesHistory || []).filter((h) => h.id !== id);
    this.persist();
  }

  // --- Office Attendance ---
  recordOfficeIn(entry) {
    const cleanId = String(entry.id || `off_${Date.now()}`);
    const newEntry = { ...entry, id: cleanId };
    if (!this.store.memory) this.store.memory = {};
    const existing = this.store.memory.salesOffice || [];
    this.store.memory.salesOffice = [...existing, newEntry];
    this.persist();
    return newEntry;
  }

  recordOfficeOut(date, outTime) {
    if (!this.store.memory) return;
    this.store.memory.salesOffice = (this.store.memory.salesOffice || []).map((o) =>
      o.date === date && !o.out ? { ...o, out: outTime } : o
    );
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
        data: this.getData(),
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
    if (Array.isArray(incomingData.clients)) this.store.memory.salesClients = incomingData.clients;
    if (Array.isArray(incomingData.work)) this.store.memory.salesWork = incomingData.work;
    if (Array.isArray(incomingData.newWork)) this.store.memory.salesWork = [...(this.store.memory.salesWork || []), ...incomingData.newWork];
    if (Array.isArray(incomingData.history)) this.store.memory.salesHistory = incomingData.history;
    if (Array.isArray(incomingData.office)) this.store.memory.salesOffice = incomingData.office;
    this.persist();
    return this.getData();
  }
}

export const salesStorage = new SalesStorageEngine();
