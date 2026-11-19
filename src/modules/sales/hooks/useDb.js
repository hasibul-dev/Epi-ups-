import { useState, useEffect, useCallback } from 'react';
import { salesStorage } from '../services/salesStorage.js';
import { RULES, today, addDays, clockTime, uid, formatTime12h, now12h } from '../utils/helpers.js';

export default function useDb() {
  const [db, setDb] = useState(() => salesStorage.getData());
  const [loading, setLoading] = useState(true);

  // Initialize storage engine on mount and subscribe to unified store updates
  useEffect(() => {
    let mounted = true;
    salesStorage.init().then((data) => {
      if (mounted) {
        setDb({ ...data });
        setLoading(false);
      }
    });
    const unsubscribe = salesStorage.store.subscribe(() => {
      if (mounted) {
        setDb({ ...salesStorage.getData() });
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refreshDb = useCallback(async () => {
    setLoading(true);
    const data = await salesStorage.init();
    setDb({ ...data });
    setLoading(false);
  }, []);

  const openLog = (d) => [...(db.office || [])].reverse().find((x) => x.date === d && !x.out);
  const todayLog = (d) => [...(db.office || [])].reverse().find((x) => x.date === d);

  /* ---------- Office Attendance ---------- */
  const officeIn = async () => {
    const d = today();
    if (openLog(d)) {
      alert('Office IN is already active for today.');
      return false;
    }

    const entry = {
      date: d,
      in: new Date().toISOString(),
    };
    salesStorage.recordOfficeIn(entry);
    setDb({ ...salesStorage.getData() });
    alert('✓ Office IN saved locally at ' + clockTime(entry.in));
    return true;
  };

  const officeOut = async () => {
    const d = today();
    const open = openLog(d);
    if (!open) {
      alert('No active Office IN found for today.');
      return false;
    }

    const outTime = new Date().toISOString();
    salesStorage.recordOfficeOut(d, outTime);
    setDb({ ...salesStorage.getData() });
    alert('✓ Office OUT saved locally at ' + clockTime(outTime));
    return true;
  };

  const updateOfficeTimes = async (date, inTime, outTime, newDate) => {
    const formattedIn = inTime ? (String(inTime).includes('T') ? inTime : formatTime12h(inTime)) : '';
    const formattedOut = outTime ? (String(outTime).includes('T') ? outTime : formatTime12h(outTime)) : '';
    const targetDate = newDate || date;

    const officeRecords = (db.office || []).map((o) => {
      if (o.date === date) {
        return {
          ...o,
          date: targetDate,
          in: formattedIn || o.in,
          out: formattedOut || o.out,
        };
      }
      return o;
    });

    salesStorage.memoryDb.office = officeRecords;
    salesStorage.persist();
    setDb({ ...salesStorage.getData() });
    alert('✓ Office attendance times saved permanently in local storage!');
    return true;
  };

  const officeStatus = () => {
    const a = todayLog(today());
    if (!a) return 'Ready for today’s office entry.';
    const tin = a.in ? clockTime(a.in) : '';
    const tout = a.out ? clockTime(a.out) : '';
    if (tin && tout) return `Office IN ${tin} · Office OUT ${tout}`;
    if (tin) return `Office IN ${tin} · Currently IN`;
    return 'Ready for today’s office entry.';
  };

  /* ---------- Clients ---------- */
  const addClient = async (c) => {
    const initialCat = c.category || 'Potential';
    const clientPayload = {
      id: uid(),
      ...c,
      category: initialCat,
      previousStatus: 'Initial: ' + initialCat,
      notes: c.notes || '',
      createdAt: new Date().toISOString(),
    };

    salesStorage.addClient(clientPayload);
    setDb({ ...salesStorage.getData() });
    alert('✓ Client saved to local storage successfully!');
    return true;
  };

  const deleteClient = async (id) => {
    salesStorage.deleteClient(id);
    setDb({ ...salesStorage.getData() });
    alert('✓ Client deleted from local storage.');
    return true;
  };

  const deleteClients = async (ids) => {
    salesStorage.deleteClients(ids);
    setDb({ ...salesStorage.getData() });
    alert(`✓ ${ids.length} client(s) deleted from local storage.`);
    return true;
  };

  const updateClient = async (id, updates) => {
    salesStorage.updateClient(id, updates);
    setDb({ ...salesStorage.getData() });
    alert('✓ Client information updated and saved successfully!');
    return true;
  };

  const updateClientNotes = async (id, notes) => {
    salesStorage.updateClient(id, { notes });
    setDb({ ...salesStorage.getData() });
    alert('✓ Remarks/notes saved to local storage!');
    return true;
  };

  const updateClientNextDate = async (id, nextDate) => {
    if (!nextDate) {
      alert('Please select a valid follow-up date.');
      return false;
    }
    salesStorage.updateClient(id, { nextDate });
    setDb({ ...salesStorage.getData() });
    alert('✓ Next follow-up date updated and saved locally!');
    return true;
  };

  /* Complete client follow-up */
  const doneFollow = async (id, cat, method, notes = '', customNextDate = null) => {
    const completed = today();
    const intervalDays = RULES[cat] ?? 3;
    const next = customNextDate || addDays(completed, intervalDays);

    const client = (db.clients || []).find((c) => c.id === id);
    const clientName = client ? client.name : 'Client Follow-up';

    // Update client record
    salesStorage.updateClient(id, {
      lastDate: completed,
      nextDate: next,
      category: cat,
      previousStatus: client ? client.category : cat,
      lastMethod: method,
      notes: notes || (client ? client.notes : ''),
    });

    // Add to history
    salesStorage.addHistory({
      id: uid(),
      clientId: id,
      clientName: clientName,
      date: completed,
      time: now12h(),
      type: 'Follow-up',
      cat: cat,
      method: method,
      notes: notes,
      nextDate: next,
      status: 'Completed',
    });

    setDb({ ...salesStorage.getData() });
    alert('✓ Follow-up completed and saved to local storage!');
    return true;
  };

  /* ---------- Planned Work ---------- */
  const addWork = async (date, time, text, clientId = '', notes = '') => {
    const formattedTime = time ? formatTime12h(time) : '';
    const workPayload = {
      id: uid(),
      date,
      time: formattedTime,
      text,
      clientId,
      notes: notes || '',
      status: 'Pending',
    };

    salesStorage.addWork(workPayload);
    setDb({ ...salesStorage.getData() });
    alert('✓ Planned work saved to local storage successfully!');
    return true;
  };

  const addNewWork = async (time, text, date = today(), notes = '') => {
    const formattedTime = time ? formatTime12h(time) : now12h();
    const newWorkPayload = {
      id: uid(),
      date: date || today(),
      time: formattedTime,
      text,
      notes: notes || '',
      status: 'Pending',
    };

    salesStorage.addWork(newWorkPayload);
    setDb({ ...salesStorage.getData() });
    alert('✓ Scheduled work saved to local storage successfully!');
    return true;
  };

  const doneActivity = async (id, cat = null, method = 'Task Complete', clientId = null, notes = '') => {
    const intervalDays = cat ? RULES[cat] ?? 3 : 0;
    const nextFollowUpDate = cat ? addDays(today(), intervalDays) : '';

    const targetWork = (db.work || []).find((w) => w.id === id);

    salesStorage.updateWork(id, {
      status: 'Completed',
      completedDate: today(),
    });

    salesStorage.addHistory({
      id: uid(),
      workId: id,
      clientId: clientId || targetWork?.clientId || '',
      date: today(),
      time: now12h(),
      type: 'Activity',
      cat: cat,
      method: method,
      text: targetWork?.text || '',
      notes: notes || targetWork?.notes || '',
      nextDate: nextFollowUpDate,
      status: 'Completed',
    });

    if (clientId && nextFollowUpDate) {
      salesStorage.updateClient(clientId, { nextDate: nextFollowUpDate });
    }

    setDb({ ...salesStorage.getData() });
    alert('✓ Activity completed and saved to local storage!');
    return true;
  };

  const doneNew = async (id) => {
    const targetItem = (db.work || []).find((nw) => String(nw.id) === String(id));
    const todayDate = today();

    salesStorage.updateWork(id, {
      status: 'Completed',
      completedAt: new Date().toISOString(),
    });

    if (targetItem) {
      salesStorage.addHistory({
        id: uid(),
        workId: String(id),
        date: todayDate,
        time: formatTime12h(targetItem.time || new Date()),
        type: 'New Work',
        text: targetItem.text,
        notes: targetItem.notes || '',
        status: 'Completed',
      });
    }

    setDb({ ...salesStorage.getData() });
    alert('✓ Work completed and saved to local storage!');
    return true;
  };

  /* ---------- Edit & Delete Row ---------- */
  const saveEditRow = async (source, id, payload) => {
    if (source === 'office') {
      return await updateOfficeTimes(id, payload.in, payload.out, payload.date);
    }

    if (source === 'manual') {
      return await addHistoricalWork(payload.date, payload.time, payload.text, payload.notes || '', payload.status || 'Completed');
    }

    if (source === 'client' || source === 'clients') {
      salesStorage.updateClient(id, payload);
      setDb({ ...salesStorage.getData() });
      alert('✓ Client record saved permanently in local storage!');
      return true;
    }

    if (source.startsWith('history')) {
      salesStorage.updateHistory(id, {
        ...payload,
        time: payload.time ? formatTime12h(payload.time) : '',
      });
    } else {
      salesStorage.updateWork(id, {
        ...payload,
        time: payload.time ? formatTime12h(payload.time) : '',
      });
    }

    setDb({ ...salesStorage.getData() });
    alert('✓ Record saved permanently in local storage!');
    return true;
  };

  const deleteEditRow = async (source, id) => {
    if (source === 'office') {
      salesStorage.memoryDb.office = (salesStorage.memoryDb.office || []).filter((o) => o.date !== id && o.id !== id);
      salesStorage.persist();
      setDb({ ...salesStorage.getData() });
      alert('✓ Office attendance removed from local storage.');
      return true;
    }

    if (source === 'client' || source === 'clients') {
      salesStorage.deleteClient(id);
      setDb({ ...salesStorage.getData() });
      alert('✓ Client record permanently deleted from local storage.');
      return true;
    }

    if (source.startsWith('history')) {
      salesStorage.deleteHistory(id);
    } else {
      salesStorage.deleteWork(id);
    }

    setDb({ ...salesStorage.getData() });
    alert('✓ Record permanently deleted from local storage.');
    return true;
  };

  const addHistoricalWork = async (date, time, text, notes = '', status = 'Completed') => {
    const formattedTime = time ? formatTime12h(time) : '';
    const doc = {
      id: uid(),
      date,
      time: formattedTime,
      text,
      notes: notes || '',
      type: 'Activity',
      status: status || 'Completed',
    };

    salesStorage.addHistory(doc);
    setDb({ ...salesStorage.getData() });
    alert('✓ Record saved to local history storage!');
    return doc;
  };

  // Export & Import helpers
  const exportJson = () => salesStorage.exportJsonBackup();
  const importJson = (str) => salesStorage.importJsonBackup(str);

  const downloadBackup = () => {
    try {
      const jsonStr = salesStorage.exportJsonBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `epi-sales-backup-${today()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export backup: ' + err.message);
    }
  };

  const importBackup = (fileOrJson) => {
    const currentCounts = {
      clients: (db.clients || []).length,
      work: (db.work || []).length,
      history: (db.history || []).length,
    };
    const confirmed = window.confirm(
      `⚠️ WARNING: OVERWRITE SALES DATA\n\n` +
      `Importing this backup will OVERWRITE your current sales records:\n` +
      `- Current Clients: ${currentCounts.clients}\n` +
      `- Current Work Tasks: ${currentCounts.work}\n` +
      `- Current History: ${currentCounts.history}\n\n` +
      `Existing records will be replaced with the data from the imported backup file.\n` +
      `Are you sure you want to proceed?`
    );
    if (!confirmed) return false;

    try {
      salesStorage.importJsonBackup(fileOrJson);
      setDb({ ...salesStorage.getData() });
      alert('✓ Sales data successfully imported and updated in local storage!');
      return true;
    } catch (err) {
      alert('Error importing backup: ' + err.message);
      return false;
    }
  };

  return {
    db,
    loading,
    dbConnected: true,
    dbStatus: {
      connected: true,
      dbName: 'Local Storage (IndexedDB)',
      lastError: null,
      connectedAt: new Date().toISOString(),
      envKeyDetected: 'local',
      hasUriConfigured: true,
    },
    dbCounts: {
      clients: db.clients?.length || 0,
      work: db.work?.length || 0,
      newWork: db.newWork?.length || 0,
      history: db.history?.length || 0,
      office: db.office?.length || 0,
    },
    hasLocalData: false,
    officeIn,
    officeOut,
    updateOfficeTimes,
    officeStatus,
    todayLog,
    addClient,
    deleteClient,
    deleteClients,
    updateClient,
    updateClientNotes,
    updateClientNextDate,
    doneFollow,
    addWork,
    addNewWork,
    doneActivity,
    doneNew,
    saveEditRow,
    deleteEditRow,
    addHistoricalWork,
    refreshDb,
    exportJson,
    importJson,
    downloadBackup,
    importBackup,
  };
}
