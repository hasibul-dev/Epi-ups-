import React, { useState, useEffect } from 'react';
import {
  today,
  addDays,
  fmt,
  getTaskCategory,
  formatTime12h,
  compareTimes,
} from '../utils/helpers.js';
import TimePicker12h from './TimePicker12h.jsx';
import ExpandableText from './ExpandableText.jsx';
import {
  Check,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

function EditRow({ row, onSave, onDelete }) {
  const [rowDate, setRowDate] = useState(row.date || today());
  const [time, setTime] = useState(row.time || '');
  const [text, setText] = useState(row.text || '');
  const [notes, setNotes] = useState(row.notes || '');
  const [status, setStatus] = useState(row.status || 'Pending');
  const [isSaving, setIsSaving] = useState(false);

  const isFollow = row.source === 'history-follow';

  useEffect(() => {
    setRowDate(row.date || today());
    setTime(row.time || '');
    setText(row.text || '');
    setNotes(row.notes || '');
    setStatus(row.status || 'Pending');
  }, [row.id, row.date, row.time, row.text, row.notes, row.status]);

  const category = getTaskCategory(rowDate, time, status);

  const getCategoryBadge = () => {
    if (status === 'Completed') return <span className="badge done">Completed</span>;
    if (category === 'Overdue')
      return (
        <span className="badge badge-overdue">
          Overdue
        </span>
      );
    if (category === 'Upcoming')
      return (
        <span className="badge badge-upcoming">
          Upcoming
        </span>
      );
    return (
      <span className="badge badge-active">
        Active
      </span>
    );
  };

  const handleSave = async () => {
    if (!text.trim()) return alert('Work / Client description cannot be empty.');
    if (!rowDate) return alert('Date cannot be empty.');

    setIsSaving(true);
    try {
      await onSave(row.source, row.id, {
        date: rowDate,
        time: time || '',
        text: text.trim(),
        notes: notes.trim(),
        status,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    onDelete(row.source, row.id);
  };

  return (
    <tr>
      <td style={{ minWidth: 135 }}>
        <input
          type="date"
          value={rowDate}
          onChange={(e) => setRowDate(e.target.value)}
          title="Scheduled Date"
        />
      </td>
      <td style={{ minWidth: 155 }}>
        <TimePicker12h
          value={time}
          onChange={(newTime) => setTime(newTime)}
        />
      </td>
      <td>
        <span className="badge">{row.type}</span>
      </td>
      <td>{getCategoryBadge()}</td>
      <td style={{ minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task / Client work"
            style={{ flex: 1 }}
          />
          {text && (
            <ExpandableText
              text={text}
              title="Work Description"
              subtitle={fmt(rowDate)}
              onlyButton={true}
            />
          )}
        </div>
      </td>
      <td style={{ minWidth: 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add remark or notes..."
            style={{ flex: 1 }}
          />
          {notes && (
            <ExpandableText
              text={notes}
              title="Remarks / Notes"
              subtitle={text || fmt(rowDate)}
              onlyButton={true}
            />
          )}
        </div>
      </td>
      <td>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>
        <button className="data-edit" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : <><Check size={11} strokeWidth={2.4} /> Save</>}
        </button>{' '}
        <button className="data-delete" onClick={handleDelete} disabled={isSaving}>
          <Trash2 size={11} strokeWidth={2.2} /> Delete
        </button>
      </td>
    </tr>
  );
}

export default function EditWorkData({ store }) {
  const { db } = store;
  const [date, setDate] = useState(today());
  const [viewAll, setViewAll] = useState(false);
  const d = date || today();

  const rows = [];
  const workList = viewAll ? db.work || [] : (db.work || []).filter((w) => w.date === d);
  const newWorkList = viewAll ? db.newWork || [] : (db.newWork || []).filter((w) => w.date === d);

  // Work List
  workList.forEach((w) =>
    rows.push({
      id: w.id,
      source: 'work',
      date: w.date,
      time: w.time || '',
      type: 'Activity',
      text: w.text,
      notes: w.notes || '',
      status: w.status,
    })
  );

  // New Work List
  newWorkList.forEach((w) =>
    rows.push({
      id: w.id,
      source: 'new',
      date: w.date || today(),
      time: w.time || '',
      type: 'New Work',
      text: w.text,
      notes: w.notes || '',
      status: w.status,
    })
  );

  // Follow-up history and standalone historical tasks
  const workIds = new Set((db.work || []).map((w) => String(w.id)));
  const newWorkIds = new Set((db.newWork || []).map((w) => String(w.id)));

  const historyList = viewAll
    ? db.history || []
    : (db.history || []).filter((h) => h.date === d);

  historyList.forEach((h) => {
    // Avoid duplicating office entries or records already represented in work/newWork
    if (h.type === 'Office IN' || h.type === 'Office OUT') return;
    if (h.workId && workIds.has(String(h.workId))) return;
    if (h.newWorkId && newWorkIds.has(String(h.newWorkId))) return;

    if (h.type === 'Follow-up') {
      rows.push({
        id: h.id,
        source: 'history-follow',
        date: h.date,
        time: h.time || '',
        type: 'Follow-up',
        text:
          (h.client || '') +
          (h.company ? ' — ' + h.company : '') +
          (h.previousStatus ? ' (Prev: ' + h.previousStatus + ')' : '') +
          (h.category ? ' → ' + h.category : '') +
          (h.followType ? ' — ' + h.followType : '') +
          (h.nextDate ? ' [Next: ' + fmt(h.nextDate) + ']' : ''),
        notes: h.notes || '',
        status: 'Completed',
      });
    } else {
      rows.push({
        id: h.id,
        source: 'history',
        date: h.date,
        time: h.time || '',
        type: h.type || 'Activity',
        text: h.text || h.type || 'Historical Task',
        notes: h.notes || '',
        status: 'Completed',
      });
    }
  });

  // Sort primarily by date descending, secondarily by time ascending
  rows.sort((a, b) => {
    const dDiff = (b.date || '').localeCompare(a.date || '');
    if (dDiff !== 0) return dDiff;
    return compareTimes(a.time, b.time);
  });

  const del = (source, id) => {
    if (!confirm('Delete this saved record permanently? This cannot be undone.')) return;
    store.deleteEditRow(source, id);
  };

  const addHistorical = () => {
    const targetDate = prompt('Enter date (YYYY-MM-DD):', d);
    if (!targetDate) return;
    const time = prompt('Enter time in 12-hour AM/PM format (example: 10:30 AM):', '10:00 AM');
    if (time === null) return;
    const text = prompt('Enter the work/activity description:', '');
    if (text === null || !text.trim()) return;
    const notes = prompt('Enter remark/notes (optional):', '') || '';
    store.addHistoricalWork(targetDate, formatTime12h(time), text.trim(), notes.trim());
  };

  return (
    <section className="page active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Edit Work Data</h2>
            <div className="muted">
              Select any date or view all records. You can update dates, exact 12-hour AM/PM times, work text, remarks, or delete records.
            </div>
          </div>
          <div>
            <button
              className={viewAll ? 'primary' : 'secondary'}
              onClick={() => setViewAll(!viewAll)}
              style={{ fontSize: 12, padding: '7px 12px' }}
            >
              {viewAll ? 'Showing All Records (Click for Date View)' : 'Show All Dates'}
            </button>
          </div>
        </div>

        {!viewAll && (
          <div className="grid">
            <div>
              <label>Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 8, flexWrap: 'wrap' }}>
              <button className="secondary" onClick={() => setDate(addDays(d, -1))}>
                <ChevronLeft size={13} strokeWidth={2.2} /> Previous Day
              </button>
              <button className="secondary" onClick={() => setDate(today())}>
                Today
              </button>
              <button className="secondary" onClick={() => setDate(addDays(d, 1))}>
                Next Day <ChevronRight size={13} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="head">
          <div>
            <h2>{viewAll ? 'All Work Records' : `Work Records — ${fmt(d)}`}</h2>
            <div className="muted">
              {rows.length} record(s) found. All changes save permanently to the database with AM/PM time accuracy.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="primary" onClick={addHistorical}>
              <Plus size={14} strokeWidth={2.2} /> Add Work to This Date
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time (12-Hour AM/PM)</th>
                <th>Type</th>
                <th>Category</th>
                <th>Work / Client / Event</th>
                <th>Remarks / Notes</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
                  <EditRow
                    key={`${r.source}-${r.id}-${r.date}`}
                    row={r}
                    onSave={store.saveEditRow}
                    onDelete={del}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty">
                    No work or office records found for this date.
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
