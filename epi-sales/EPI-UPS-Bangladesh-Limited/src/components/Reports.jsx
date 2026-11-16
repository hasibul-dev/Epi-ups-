import { useState, useEffect, useRef } from 'react';
import { today, addDays, fmt, inRange, formatTime12h, compareTimes, now12h } from '../utils/helpers.js';
import { PrintHeader, PrintSignatures } from './PrintHeader.jsx';
import ExpandableText from './ExpandableText.jsx';
import {
  Printer,
  Plus,
  Save,
  Check,
  Trash2,
  RefreshCw,
} from 'lucide-react';

const TITLES = { work: 'Work Report', schedule: 'Schedule Report', history: 'History Report' };

const isCompleted = (status) => String(status || '').trim().toLowerCase() === 'completed';

function buildRows(db, type, from, to) {
  const rows = [];
  const historyWorkIds = new Set(
    (db.history || [])
      .flatMap((h) => [h.workId, h.id])
      .filter((v) => v !== null && v !== undefined && v !== '')
      .map(String)
  );
  const historyNewWorkIds = new Set(
    (db.history || [])
      .flatMap((h) => [h.newWorkId, h.id])
      .filter((v) => v !== null && v !== undefined && v !== '')
      .map(String)
  );
  const historyClientFollowUps = new Set(
    (db.history || [])
      .filter((h) => h.type === 'Follow-up' && h.clientId && h.date)
      .map((h) => `${String(h.clientId)}_${String(h.date)}`)
  );

  if (type === 'work') {
    (db.history || [])
      .filter((h) => inRange(h.date, from, to))
      .forEach((h) =>
        rows.push({
          key: 'h-' + h.id,
          rawId: h.id,
          source: 'history',
          date: h.date,
          time: h.time ? formatTime12h(h.time) : '',
          activity:
            h.text ||
            (h.client ? `${h.type} - ${h.client}${h.company ? ' - ' + h.company : ''}` : h.type || '') +
            (h.notes ? ` [Note: ${h.notes}]` : ''),
          notes: h.notes || '',
          status: h.status || 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.work || [])
      .filter((w) => inRange(w.date, from, to) && (!isCompleted(w.status) || !historyWorkIds.has(String(w.id))))
      .forEach((w) =>
        rows.push({
          key: 'w-' + w.id,
          rawId: w.id,
          source: 'work',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: w.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
    (db.newWork || [])
      .filter((w) => inRange(w.date, from, to) && (!isCompleted(w.status) || !historyNewWorkIds.has(String(w.id))))
      .forEach((w) =>
        rows.push({
          key: 'n-' + w.id,
          rawId: w.id,
          source: 'new',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: w.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
    (db.clients || [])
      .filter(
        (c) =>
          c.nextDate &&
          inRange(c.nextDate, from, to) &&
          isCompleted(c.status) &&
          !historyClientFollowUps.has(`${String(c.id)}_${String(c.nextDate)}`)
      )
      .forEach((c) =>
        rows.push({
          key: 'fc-' + c.id,
          rawId: c.id,
          source: 'client',
          date: c.nextDate,
          time: '',
          activity: `Follow-up - ${c.name} - ${c.company}` + (c.notes ? ` [Note: ${c.notes}]` : ''),
          notes: c.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
  } else if (type === 'schedule') {
    (db.clients || [])
      .filter((c) => c.nextDate && inRange(c.nextDate, from, to) && !isCompleted(c.status))
      .forEach((c) =>
        rows.push({
          key: 'f-' + c.id,
          rawId: c.id,
          source: 'client',
          date: c.nextDate,
          time: '',
          activity: `Follow-up - ${c.name} - ${c.company}` + (c.notes ? ` [Note: ${c.notes}]` : ''),
          notes: c.notes || '',
          status: c.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
    (db.work || [])
      .filter((w) => inRange(w.date, from, to) && !isCompleted(w.status))
      .forEach((w) =>
        rows.push({
          key: 'w-' + w.id,
          rawId: w.id,
          source: 'work',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: w.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
  } else {
    (db.history || [])
      .filter((h) => inRange(h.date, from, to))
      .forEach((h) =>
        rows.push({
          key: 'h-' + h.id,
          rawId: h.id,
          source: 'history',
          date: h.date,
          time: h.time ? formatTime12h(h.time) : '',
          activity:
            h.text ||
            (h.client ? `${h.type} - ${h.client}${h.company ? ' - ' + h.company : ''}` : h.type || '') +
            (h.notes ? ` [Note: ${h.notes}]` : ''),
          notes: h.notes || '',
          status: h.status || 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.work || [])
      .filter(
        (w) =>
          inRange(w.date, from, to) &&
          isCompleted(w.status) &&
          !historyWorkIds.has(String(w.id))
      )
      .forEach((w) =>
        rows.push({
          key: 'w-' + w.id,
          rawId: w.id,
          source: 'work',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.newWork || [])
      .filter(
        (w) =>
          inRange(w.date, from, to) &&
          isCompleted(w.status) &&
          !historyNewWorkIds.has(String(w.id))
      )
      .forEach((w) =>
        rows.push({
          key: 'n-' + w.id,
          rawId: w.id,
          source: 'new',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.clients || [])
      .filter(
        (c) =>
          c.nextDate &&
          inRange(c.nextDate, from, to) &&
          isCompleted(c.status) &&
          !historyClientFollowUps.has(`${String(c.id)}_${String(c.nextDate)}`)
      )
      .forEach((c) =>
        rows.push({
          key: 'fc-' + c.id,
          rawId: c.id,
          source: 'client',
          date: c.nextDate,
          time: '',
          activity: `Follow-up - ${c.name} - ${c.company}` + (c.notes ? ` [Note: ${c.notes}]` : ''),
          notes: c.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
  }

  return rows.sort((a, b) => {
    const dComp = (a.date || '').localeCompare(b.date || '');
    if (dComp !== 0) return dComp;
    return compareTimes(a.time, b.time);
  });
}

export default function Reports({ db, store, onPrint }) {
  const [type, setType] = useState('work');
  const [from, setFrom] = useState(addDays(today(), -6));
  const [to, setTo] = useState(today());
  const [rows, setRows] = useState([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const lastRow = useRef(null);

  // Auto-regenerate whenever db, type, from, or to changes
  useEffect(() => {
    setRows(buildRows(db, type, from || today(), to || from || today()));
  }, [db, type, from, to]);

  const setPreset = (preset) => {
    const t = today();
    if (preset === 'today') {
      setFrom(t);
      setTo(t);
    } else if (preset === 'yesterday') {
      const y = addDays(t, -1);
      setFrom(y);
      setTo(y);
    } else if (preset === '7days') {
      setFrom(addDays(t, -6));
      setTo(t);
    } else if (preset === '30days') {
      setFrom(addDays(t, -29));
      setTo(t);
    } else if (preset === 'thisMonth') {
      const parts = t.split('-');
      setFrom(`${parts[0]}-${parts[1]}-01`);
      setTo(t);
    } else if (preset === 'all') {
      setFrom('2020-01-01');
      setTo('2099-12-31');
    }
  };

  const edit = (i, key, value) => {
    setRows((p) =>
      p.map((r, idx) => (idx === i ? { ...r, [key]: value, isModified: true } : r))
    );
  };

  const handleSaveRow = async (target) => {
    const r = typeof target === 'number' ? rows[target] : target;
    if (!r) return;
    if (!r.activity || !r.activity.trim()) {
      alert('Activity description cannot be empty.');
      return;
    }
    if (!r.date) {
      alert('Date cannot be empty.');
      return;
    }

    setRows((p) => p.map((row) => (row.key === r.key ? { ...row, isSaving: true } : row)));

    try {
      const formattedTime = r.time ? formatTime12h(r.time) : '';

      if (r.source === 'manual') {
        if (type === 'schedule') {
          if (!store?.addWork) {
            alert('Database store is not connected.');
            return;
          }
          const success = await store.addWork(
            r.date,
            formattedTime,
            r.activity.trim(),
            '',
            r.notes || ''
          );
          if (success) {
            if (isCompleted(r.status)) {
              setRows((p) => p.filter((row) => row.key !== r.key));
            } else {
              setRows((p) =>
                p.map((row) =>
                  row.key === r.key
                    ? {
                        ...row,
                        time: formattedTime,
                        isModified: false,
                        isSaving: false,
                      }
                    : row
                )
              );
            }
          }
        } else {
          if (!store?.addHistoricalWork) {
            alert('Database store is not connected.');
            return;
          }
          const newDoc = await store.addHistoricalWork(
            r.date,
            formattedTime,
            r.activity.trim(),
            r.notes || '',
            r.status || 'Completed'
          );
          if (newDoc) {
            setRows((p) =>
              p.map((row) =>
                row.key === r.key
                  ? {
                      ...row,
                      rawId: newDoc.id,
                      source: 'history',
                      key: 'h-' + newDoc.id,
                      time: formattedTime,
                      isModified: false,
                      isSaving: false,
                    }
                  : row
              )
            );
          }
        }
      } else {
        if (!store?.saveEditRow) {
          alert('Database store is not connected.');
          return;
        }
        const success = await store.saveEditRow(r.source, r.rawId, {
          date: r.date,
          time: formattedTime,
          text: r.activity.trim(),
          notes: r.notes || '',
          status: r.status,
        });
        if (success) {
          if (type === 'schedule' && isCompleted(r.status)) {
            setRows((p) => p.filter((row) => row.key !== r.key));
          } else {
            setRows((p) =>
              p.map((row) =>
                row.key === r.key
                  ? {
                      ...row,
                      time: formattedTime,
                      isModified: false,
                      isSaving: false,
                    }
                  : row
              )
            );
          }
        }
      }
    } finally {
      setRows((p) => p.map((row) => (row.key === r.key ? { ...row, isSaving: false } : row)));
    }
  };

  const handleDeleteRow = async (target) => {
    const r = typeof target === 'number' ? rows[target] : target;
    if (!r) return;
    const previewName = r.activity ? `"${r.activity.trim()}"` : 'this record';
    if (
      !confirm(
        `Are you sure you want to permanently delete ${previewName} from the database?\n\nDate: ${fmt(r.date)}\n\nThis will completely remove it from all views.`
      )
    ) {
      return;
    }

    if (r.source === 'manual' && !r.rawId) {
      // Unpersisted row
      setRows((p) => p.filter((row) => row.key !== r.key));
      return;
    }

    setRows((p) => p.map((row) => (row.key === r.key ? { ...row, isSaving: true } : row)));

    try {
      if (!store?.deleteEditRow) {
        alert('Database store is not connected.');
        return;
      }
      const ok = await store.deleteEditRow(r.source, r.rawId);
      if (ok) {
        setRows((p) => p.filter((row) => row.key !== r.key));
      }
    } finally {
      setRows((p) => p.map((row) => (row.key === r.key ? { ...row, isSaving: false } : row)));
    }
  };

  const handleSaveAllModified = async () => {
    const targets = rows.filter((r) => r.isModified || r.source === 'manual');

    if (targets.length === 0) return;

    setIsSavingAll(true);
    try {
      for (const target of targets) {
        await handleSaveRow(target);
      }
    } finally {
      setIsSavingAll(false);
    }
  };

  const add = () => {
    const newRow = {
      key: 'manual-' + Date.now(),
      rawId: null,
      source: 'manual',
      date: to || today(),
      time: now12h(),
      activity: '',
      notes: '',
      status: type === 'schedule' ? 'Pending' : 'Completed',
      isModified: true,
      isSaving: false,
    };
    setRows((p) => [...p, newRow]);
    setTimeout(() => lastRow.current?.querySelector('input[type="text"]')?.focus(), 50);
  };

  const print = () => {
    const f = from || today();
    const t = to || f;
    onPrint(
      <div className="print-page">
        <PrintHeader title={TITLES[type]} />
        <div className="print-meta">
          <div>
            <b>Name:</b> MD Habibullah<br />
            <b>Designation:</b> Engineer, Business Development
          </div>
          <div>
            <b>Start Date:</b> {fmt(f)}<br />
            <b>End Date:</b> {fmt(t)}
          </div>
        </div>
        <div className="print-line"></div>
        <table className="print-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.key}>
                  <td>{fmt(r.date)}</td>
                  <td>{r.time ? formatTime12h(r.time) : '—'}</td>
                  <td>{r.activity}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No records for selected date range.</td>
              </tr>
            )}
          </tbody>
        </table>
        <PrintSignatures />
      </div>
    );
  };

  const modifiedCount = rows.filter((r) => r.isModified || r.source === 'manual').length;

  return (
    <section className="page active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Work Report</h2>
            <div className="muted">
              Generate, filter by any date range, edit records with permanent database Save, or delete permanently.
            </div>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', alignSelf: 'center', marginRight: 4 }}>
            Date Range Presets:
          </span>
          <button className="secondary" style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setPreset('today')}>
            Today
          </button>
          <button className="secondary" style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setPreset('yesterday')}>
            Yesterday
          </button>
          <button className="secondary" style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setPreset('7days')}>
            Last 7 Days
          </button>
          <button className="secondary" style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setPreset('30days')}>
            Last 30 Days
          </button>
          <button className="secondary" style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setPreset('thisMonth')}>
            This Month
          </button>
          <button className="secondary" style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setPreset('all')}>
            All Time
          </button>
        </div>

        <div className="report-toolbar">
          <div className="field">
            <label>Report Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="work">Work Report</option>
              <option value="schedule">Schedule Report</option>
              <option value="history">History Report</option>
            </select>
          </div>
          <div className="field">
            <label>Start Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>End Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button className="primary" onClick={() => setRows(buildRows(db, type, from || today(), to || from || today()))}>
            <RefreshCw size={13} strokeWidth={2.2} /> Refresh Preview
          </button>
          <button className="secondary" onClick={print}>
            <Printer size={13} strokeWidth={2.2} /> Print
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="head">
          <div>
            <h2>
              {TITLES[type]} ({rows.length} Records)
            </h2>
            <div className="muted">
              Edit any information and click <b>Save</b> to permanently update the database and all views immediately.
            </div>
          </div>
          <div className="report-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {modifiedCount > 0 && (
              <button
                className="primary"
                onClick={handleSaveAllModified}
                disabled={isSavingAll}
                style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
              >
                <Save size={13} strokeWidth={2.2} /> {isSavingAll ? 'Saving All...' : `Save All Changes (${modifiedCount})`}
              </button>
            )}
            <button className="secondary" onClick={add}>
              <Plus size={13} strokeWidth={2.2} /> Add Row
            </button>
            <button className="primary" onClick={print}>
              <Printer size={13} strokeWidth={2.2} /> Print Report
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time (12h AM/PM)</th>
                <th>Activity Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r, i) => (
                  <tr
                    key={r.key}
                    id={'rr-' + i}
                    ref={i === rows.length - 1 ? lastRow : null}
                    style={{
                      background: r.isModified ? 'rgba(245, 158, 11, 0.06)' : undefined,
                      borderLeft: r.isModified ? '3px solid #f59e0b' : undefined,
                    }}
                  >
                    <td>
                      <input
                        className="report-edit"
                        type="date"
                        value={r.date}
                        onChange={(e) => edit(i, 'date', e.target.value)}
                        style={{ width: 130 }}
                      />
                    </td>
                    <td>
                      <input
                        className="report-edit"
                        type="text"
                        placeholder="10:00 AM"
                        value={r.time || ''}
                        onChange={(e) => edit(i, 'time', e.target.value)}
                        style={{ width: 110 }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          className="report-edit"
                          type="text"
                          value={r.activity}
                          onChange={(e) => edit(i, 'activity', e.target.value)}
                          placeholder="Activity / Work task details..."
                          style={{ flex: 1 }}
                        />
                        {r.activity && (
                          <ExpandableText
                            text={r.activity}
                            title="Activity Description & Notes"
                            subtitle={`${fmt(r.date)} ${r.time ? '· ' + r.time : ''}`}
                            onlyButton={true}
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        className="report-edit"
                        value={r.status}
                        onChange={(e) => edit(i, 'status', e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Completed</option>
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="data-edit"
                        style={{
                          background: r.isModified || r.source === 'manual' ? '#059669' : undefined,
                          color: r.isModified || r.source === 'manual' ? '#fff' : undefined,
                          fontWeight: 700,
                        }}
                        onClick={() => handleSaveRow(i)}
                        disabled={r.isSaving}
                        title="Save changes permanently to database"
                      >
                        {r.isSaving ? 'Saving...' : <><Check size={11} strokeWidth={2.4} /> Save</>}
                      </button>{' '}
                      <button
                        className="data-delete"
                        onClick={() => handleDeleteRow(i)}
                        disabled={r.isSaving}
                        title="Permanently delete from database"
                      >
                        <Trash2 size={11} strokeWidth={2.2} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty">
                    No records found for the selected date range ({fmt(from)} to {fmt(to)}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
