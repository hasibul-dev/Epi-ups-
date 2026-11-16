/**
 * EPI Sales Department - Local Data Persistence Architecture
 * IndexedDB primary engine with synchronous LocalStorage redundancy & automatic migration
 */

const DB_NAME = 'epi_sales_crm_db';
const DB_VERSION = 1;
const LOCAL_STORAGE_BACKUP_KEY = 'epi_sales_data_v1';
const LEGACY_CACHE_KEY = 'epi_ups_cached_db';
const LEGACY_STORAGE_KEY = 'epi_ups_assistant_v1';

const INITIAL_STATE = {
  clients: [],
  work: [],
  newWork: [],
  history: [],
  office: [],
};

// Open or initialize IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const stores = ['clients', 'work', 'newWork', 'history', 'office', 'settings'];
      for (const storeName of stores) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = () => resolve(null); // gracefully fallback if blocked
  });
}

// Load legacy data from LocalStorage
function getLocalStorageBackup() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY) ||
                localStorage.getItem(LEGACY_CACHE_KEY) ||
                localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          clients: Array.isArray(parsed.clients) ? parsed.clients : [],
          work: Array.isArray(parsed.work) ? parsed.work : [],
          newWork: Array.isArray(parsed.newWork) ? parsed.newWork : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
          office: Array.isArray(parsed.office) ? parsed.office : [],
        };
      }
    }
  } catch (e) {
    console.warn('[SalesStorage] Failed to read LocalStorage backup:', e);
  }
  return { ...INITIAL_STATE };
}

// Save backup to LocalStorage for instant sync across tabs and fallback
function saveLocalStorageBackup(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(data));
    localStorage.setItem(LEGACY_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[SalesStorage] LocalStorage quota note:', e);
  }
}

class SalesStorageEngine {
  constructor() {
    this.memoryDb = getLocalStorageBackup();
    this.initialized = false;
    this.idb = null;
  }

  async init() {
    if (this.initialized) return this.memoryDb;

    try {
      this.idb = await openIndexedDB();
      if (this.idb) {
        // Read stores from IndexedDB
        const loaded = await this.readAllFromIdb();
        const totalIdbRecords =
          (loaded.clients?.length || 0) +
          (loaded.work?.length || 0) +
          (loaded.history?.length || 0) +
          (loaded.office?.length || 0);

        const totalMemoryRecords =
          (this.memoryDb.clients?.length || 0) +
          (this.memoryDb.work?.length || 0) +
          (this.memoryDb.history?.length || 0) +
          (this.memoryDb.office?.length || 0);

        if (totalIdbRecords === 0 && totalMemoryRecords > 0) {
          // First run: migrate LocalStorage records into IndexedDB
          await this.syncToIdb(this.memoryDb);
        } else if (totalIdbRecords > 0) {
          this.memoryDb = loaded;
          saveLocalStorageBackup(loaded);
        }
      }
    } catch (err) {
      console.warn('[SalesStorage] IndexedDB initialization notice:', err);
    }

    this.initialized = true;
    return this.memoryDb;
  }

  async readAllFromIdb() {
    if (!this.idb) return { ...this.memoryDb };

    const stores = ['clients', 'work', 'newWork', 'history', 'office'];
    const result = { ...INITIAL_STATE };

    for (const store of stores) {
      try {
        const tx = this.idb.transaction(store, 'readonly');
        const os = tx.objectStore(store);
        const req = os.getAll();
        result[store] = await new Promise((res) => {
          req.onsuccess = () => res(req.result || []);
          req.onerror = () => res([]);
        });
      } catch (e) {
        result[store] = this.memoryDb[store] || [];
      }
    }
    return result;
  }

  async syncToIdb(fullData) {
    if (!this.idb) return;
    const stores = ['clients', 'work', 'newWork', 'history', 'office'];

    for (const store of stores) {
      try {
        const tx = this.idb.transaction(store, 'readwrite');
        const os = tx.objectStore(store);
        os.clear();
        const records = fullData[store] || [];
        for (const item of records) {
          if (item && (item.id || item._id)) {
            const clean = { ...item, id: String(item.id || item._id) };
            os.put(clean);
          }
        }
      } catch (e) {
        console.warn(`[SalesStorage] Failed sync to store ${store}:`, e);
      }
    }
  }

  persist() {
    saveLocalStorageBackup(this.memoryDb);
    this.syncToIdb(this.memoryDb).catch(() => {});
  }

  getData() {
    return this.memoryDb;
  }

  // --- Clients CRUD ---
  addClient(client) {
    const cleanId = String(client.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const newClient = {
      ...client,
      id: cleanId,
      createdAt: client.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryDb.clients = [...(this.memoryDb.clients || []).filter((c) => c.id !== cleanId), newClient];
    this.persist();
    return newClient;
  }

  updateClient(id, updates) {
    this.memoryDb.clients = (this.memoryDb.clients || []).map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    this.persist();
  }

  deleteClient(id) {
    this.memoryDb.clients = (this.memoryDb.clients || []).filter((c) => c.id !== id);
    this.persist();
  }

  deleteClients(ids) {
    const idSet = new Set(ids);
    this.memoryDb.clients = (this.memoryDb.clients || []).filter((c) => !idSet.has(c.id));
    this.persist();
  }

  // --- Work CRUD ---
  addWork(work) {
    const cleanId = String(work.id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const newWork = {
      ...work,
      id: cleanId,
      createdAt: work.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memoryDb.work = [...(this.memoryDb.work || []).filter((w) => w.id !== cleanId), newWork];
    this.persist();
    return newWork;
  }

  updateWork(id, updates) {
    this.memoryDb.work = (this.memoryDb.work || []).map((w) =>
      w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
    );
    this.persist();
  }

  deleteWork(id) {
    this.memoryDb.work = (this.memoryDb.work || []).filter((w) => w.id !== id);
    this.persist();
  }

  // --- History CRUD ---
  addHistory(record) {
    const cleanId = String(record.id || `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const newRecord = {
      ...record,
      id: cleanId,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    this.memoryDb.history = [newRecord, ...(this.memoryDb.history || []).filter((h) => h.id !== cleanId)];
    this.persist();
    return newRecord;
  }

  updateHistory(id, updates) {
    this.memoryDb.history = (this.memoryDb.history || []).map((h) =>
      h.id === id ? { ...h, ...updates } : h
    );
    this.persist();
  }

  deleteHistory(id) {
    this.memoryDb.history = (this.memoryDb.history || []).filter((h) => h.id !== id);
    this.persist();
  }

  // --- Office Attendance ---
  recordOfficeIn(entry) {
    const cleanId = String(entry.id || `off_${Date.now()}`);
    const newEntry = { ...entry, id: cleanId };
    this.memoryDb.office = [...(this.memoryDb.office || []), newEntry];
    this.persist();
    return newEntry;
  }

  recordOfficeOut(date, outTime) {
    this.memoryDb.office = (this.memoryDb.office || []).map((o) =>
      o.date === date && !o.out ? { ...o, out: outTime } : o
    );
    this.persist();
  }

  // --- Export / Import Backup ---
  exportJsonBackup() {
    const dataStr = JSON.stringify(this.memoryDb, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EPI-Sales-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importJsonBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON structure');

      this.memoryDb = {
        clients: Array.isArray(parsed.clients) ? parsed.clients : this.memoryDb.clients,
        work: Array.isArray(parsed.work) ? parsed.work : this.memoryDb.work,
        newWork: Array.isArray(parsed.newWork) ? parsed.newWork : this.memoryDb.newWork,
        history: Array.isArray(parsed.history) ? parsed.history : this.memoryDb.history,
        office: Array.isArray(parsed.office) ? parsed.office : this.memoryDb.office,
      };

      this.persist();
      return { success: true, count: this.getCounts() };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getCounts() {
    return {
      clients: this.memoryDb.clients?.length || 0,
      work: this.memoryDb.work?.length || 0,
      history: this.memoryDb.history?.length || 0,
      office: this.memoryDb.office?.length || 0,
    };
  }
}

export const salesStorage = new SalesStorageEngine();
