import { useState, useEffect } from 'react';
import { DB } from '../services/storage.js';
import { seed } from '../services/seed.js';
import { sync } from '../services/domain.js';
import { unifiedStore } from '../../../services/unifiedStorage.js';

// Single app state { clients, works, settings } backed by Unified IndexedDB.
export function useStore() {
  const [state, setState] = useState(() => sync(DB.load() || seed()));

  // Auto-subscribe to unified store updates (e.g. from Reset Demo Data or cross-department sync)
  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => {
      const loaded = DB.load();
      if (loaded) {
        setState(() => sync(loaded));
      }
    });
    return () => unsub();
  }, []);

  // upd(fn): apply a change, re-run reminder sync, and save permanently
  const upd = (fn) => {
    setState((p) => {
      const next = sync(fn(p));
      DB.save(next);
      return next;
    });
  };

  return [state, upd, setState];
}
