import { useState, useEffect, useCallback, useMemo } from 'react';
import { salesStorage, isSalesAdmin } from '../services/salesStorage.js';
import { isAuthorizedAdmin } from '../../../services/unifiedStorage.js';
import { RULES, today, addDays, clockTime, uid, formatTime12h, now12h } from '../utils/helpers.js';

function getFallbackUser() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('epi_central_user') || sessionStorage.getItem('epi_central_user');
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export default function useDb(userProp) {
  const activeUser = useMemo(() => userProp || getFallbackUser(), [userProp]);
  const isAdmin = useMemo(() => isSalesAdmin(activeUser), [activeUser]);

  // Admin filter state: 'all' or specific sales user ID
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');

  const getScopedData = useCallback(() => {
    return salesStorage.getData(activeUser, {
      userId: isAdmin ? selectedUserFilter : activeUser?.userId,
    });
  }, [activeUser, isAdmin, selectedUserFilter]);

  const [db, setDb] = useState(() => getScopedData());
  const [loading, setLoading] = useState(true);

  // Dynamic list of sales users (available to Admin for filtering)
  const [salesUsers, setSalesUsers] = useState([]);
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('epi_central_users_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSalesUsers(
              parsed.filter(
                (u) =>
                  u.role === 'superadmin' ||
                  (Array.isArray(u.departments) && u.departments.includes('sales'))
              )
            );
          }
        }
      }
    } catch {}
  }, []);

  // Initialize storage engine on mount and subscribe to unified store updates
  useEffect(() => {
    let mounted = true;
    salesStorage.init(activeUser).then(() => {
      if (mounted) {
        setDb(getScopedData());
        setLoading(false);
      }
    });

    const unsubscribe = salesStorage.store.subscribe(() => {
      if (mounted) {
        setDb(getScopedData());
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [activeUser, getScopedData]);

  // Update data whenever activeUser or admin filter changes
  useEffect(() => {
    setDb(getScopedData());
  }, [activeUser, selectedUserFilter, getScopedData]);

  const refreshDb = useCallback(async () => {
    setLoading(true);
    await salesStorage.init(activeUser);
    setDb(getScopedData());
    setLoading(false);
  }, [activeUser, getScopedData]);

  // Attendance user scoping
  const openLog = (d) =>
    [...(db.office || [])]
      .reverse()
      .find((x) => x.date === d && !x.out && (isAdmin || x.userId === activeUser?.userId || !x.userId));

  const todayLog = (d) =>
    [...(db.office || [])]
      .reverse()
      .find((x) => x.date === d && (isAdmin || x.userId === activeUser?.userId || !x.userId));

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
    salesStorage.recordOfficeIn(entry, activeUser);
    setDb(getScopedData());
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
    salesStorage.recordOfficeOut(d, outTime, activeUser);
    setDb(getScopedData());
    alert('✓ Office OUT saved locally at ' + clockTime(outTime));
    return true;
  };

  const updateOfficeTimes = async (date, inTime, outTime, newDate) => {
    const formattedIn = inTime ? (String(inTime).includes('T') ? inTime : formatTime12h(inTime)) : '';
    const formattedOut = outTime ? (String(outTime).includes('T') ? outTime : formatTime12h(outTime)) : '';
    const targetDate = newDate || date;

    const officeRecords = (salesStorage.store.memory?.salesOffice || []).map((o) => {
      const matchUser = !activeUser?.userId || o.userId === activeUser.userId || isAdmin;
      if (o.date === date && matchUser) {
        return {
          ...o,
          date: targetDate,
          in: formattedIn || o.in,
          out: formattedOut || o.out,
        };
      }
      return o;
    });

    if (!salesStorage.store.memory) salesStorage.store.memory = {};
    salesStorage.store.memory.salesOffice = officeRecords;
    salesStorage.persist();
    setDb(getScopedData());
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

    salesStorage.addClient(clientPayload, activeUser);
    setDb(getScopedData());
    alert('✓ Client saved to local storage successfully!');
    return true;
  };

  const deleteClient = async (id) => {
    try {
      salesStorage.deleteClient(id, activeUser);
      setDb(getScopedData());
      alert('✓ Client deleted from local storage.');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const deleteClients = async (ids) => {
    try {
      salesStorage.deleteClients(ids, activeUser);
      setDb(getScopedData());
      alert(`✓ ${ids.length} client(s) deleted from local storage.`);
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const updateClient = async (id, updates) => {
    try {
      salesStorage.updateClient(id, updates, activeUser);
      setDb(getScopedData());
      alert('✓ Client information updated and saved successfully!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const updateClientNotes = async (id, notes) => {
    try {
      salesStorage.updateClient(id, { notes }, activeUser);
      setDb(getScopedData());
      alert('✓ Remarks/notes saved to local storage!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const updateClientNextDate = async (id, nextDate) => {
    if (!nextDate) {
      alert('Please select a valid follow-up date.');
      return false;
    }
    try {
      salesStorage.updateClient(id, { nextDate }, activeUser);
      setDb(getScopedData());
      alert('✓ Next follow-up date updated and saved locally!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  /* Complete client follow-up */
  const doneFollow = async (id, cat, method, notes = '', customNextDate = null) => {
    const completed = today();
    const intervalDays = RULES[cat] ?? 3;
    const next = customNextDate || addDays(completed, intervalDays);

    const client = (db.clients || []).find((c) => c.id === id);
    const clientName = client ? client.name : 'Client Follow-up';

    try {
      // Update client record
      salesStorage.updateClient(
        id,
        {
          lastDate: completed,
          nextDate: next,
          category: cat,
          previousStatus: client ? client.category : cat,
          lastMethod: method,
          notes: notes || (client ? client.notes : ''),
        },
        activeUser
      );

      // Add to history
      salesStorage.addHistory(
        {
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
        },
        activeUser
      );

      setDb(getScopedData());
      alert('✓ Follow-up completed and saved to local storage!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
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

    salesStorage.addWork(workPayload, activeUser);
    setDb(getScopedData());
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

    salesStorage.addWork(newWorkPayload, activeUser);
    setDb(getScopedData());
    alert('✓ Scheduled work saved to local storage successfully!');
    return true;
  };

  const doneActivity = async (id, cat = null, method = 'Task Complete', clientId = null, notes = '') => {
    const intervalDays = cat ? RULES[cat] ?? 3 : 0;
    const nextFollowUpDate = cat ? addDays(today(), intervalDays) : '';

    const targetWork = (db.work || []).find((w) => w.id === id);

    try {
      salesStorage.updateWork(
        id,
        {
          status: 'Completed',
          completedDate: today(),
        },
        activeUser
      );

      salesStorage.addHistory(
        {
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
        },
        activeUser
      );

      if (clientId && nextFollowUpDate) {
        salesStorage.updateClient(clientId, { nextDate: nextFollowUpDate }, activeUser);
      }

      setDb(getScopedData());
      alert('✓ Activity completed and saved to local storage!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const doneNew = async (id) => {
    const targetItem = (db.work || []).find((nw) => String(nw.id) === String(id));
    const todayDate = today();

    try {
      salesStorage.updateWork(
        id,
        {
          status: 'Completed',
          completedAt: new Date().toISOString(),
        },
        activeUser
      );

      if (targetItem) {
        salesStorage.addHistory(
          {
            id: uid(),
            workId: String(id),
            date: todayDate,
            time: formatTime12h(targetItem.time || new Date()),
            type: 'New Work',
            text: targetItem.text,
            notes: targetItem.notes || '',
            status: 'Completed',
          },
          activeUser
        );
      }

      setDb(getScopedData());
      alert('✓ Work completed and saved to local storage!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  /* ---------- Edit & Delete Row ---------- */
  const saveEditRow = async (source, id, payload) => {
    if (source === 'office') {
      return await updateOfficeTimes(id, payload.in, payload.out, payload.date);
    }

    if (source === 'manual') {
      return await addHistoricalWork(
        payload.date,
        payload.time,
        payload.text,
        payload.notes || '',
        payload.status || 'Completed'
      );
    }

    try {
      if (source === 'client' || source === 'clients') {
        salesStorage.updateClient(id, payload, activeUser);
        setDb(getScopedData());
        alert('✓ Client record saved permanently in local storage!');
        return true;
      }

      if (source.startsWith('history')) {
        salesStorage.updateHistory(
          id,
          {
            ...payload,
            time: payload.time ? formatTime12h(payload.time) : '',
          },
          activeUser
        );
      } else {
        salesStorage.updateWork(
          id,
          {
            ...payload,
            time: payload.time ? formatTime12h(payload.time) : '',
          },
          activeUser
        );
      }

      setDb(getScopedData());
      alert('✓ Record saved permanently in local storage!');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  const deleteEditRow = async (source, id) => {
    try {
      if (source === 'office') {
        if (!salesStorage.store.memory) salesStorage.store.memory = {};
        salesStorage.store.memory.salesOffice = (salesStorage.store.memory.salesOffice || []).filter(
          (o) => o.date !== id && o.id !== id
        );
        salesStorage.persist();
        setDb(getScopedData());
        alert('✓ Office attendance removed from local storage.');
        return true;
      }

      if (source === 'client' || source === 'clients') {
        salesStorage.deleteClient(id, activeUser);
        setDb(getScopedData());
        alert('✓ Client record permanently deleted from local storage.');
        return true;
      }

      if (source.startsWith('history')) {
        salesStorage.deleteHistory(id, activeUser);
      } else {
        salesStorage.deleteWork(id, activeUser);
      }

      setDb(getScopedData());
      alert('✓ Record permanently deleted from local storage.');
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
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

    salesStorage.addHistory(doc, activeUser);
    setDb(getScopedData());
    alert('✓ Record saved to local history storage!');
    return doc;
  };

  // Export & Import helpers
  const exportJson = () => salesStorage.exportJsonBackup(activeUser);
  const importJson = (str) => salesStorage.importJsonBackup(str, activeUser);

  const downloadBackup = () => {
    if (!isAuthorizedAdmin(activeUser)) {
      alert('Unauthorized: Only users with the Admin/Super Administrator role can export data/backups.');
      return;
    }
    try {
      const jsonStr = salesStorage.exportJsonBackup(activeUser);
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
    if (!isAuthorizedAdmin(activeUser)) {
      alert('Unauthorized: Only users with the Admin/Super Administrator role can import or upload data/backups.');
      return false;
    }
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
      salesStorage.importJsonBackup(fileOrJson, activeUser);
      setDb(getScopedData());
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
    user: activeUser,
    isAdmin,
    salesUsers,
    selectedUserFilter,
    setSelectedUserFilter,
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
