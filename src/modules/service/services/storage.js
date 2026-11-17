/**
 * EPI Service Department - Persistent Storage Adapter
 * Backed by the Central Unified IndexedDB & LocalStorage Engine
 */

import { unifiedStore } from '../../../services/unifiedStorage.js';

const KEY = 'epi_ups_v1';

export const DB = {
  load() {
    const mem = unifiedStore.memory;
    if (mem && mem.clients && mem.serviceWorks) {
      return {
        clients: mem.clients,
        works: mem.serviceWorks,
        settings: mem.serviceSettings || {
          company: 'EPI UPS Bangladesh Limited — Technical Service Center',
          engineers: 'Sabbir, Tanvir, Rafi, Shanto',
        },
      };
    }
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save(data) {
    if (!data) return;
    if (!unifiedStore.memory) unifiedStore.memory = {};
    unifiedStore.memory.clients = data.clients || [];
    unifiedStore.memory.serviceWorks = data.works || [];
    if (data.settings) {
      unifiedStore.memory.serviceSettings = data.settings;
    }
    unifiedStore.persist();
  },

  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch (_) {}
  },
};
