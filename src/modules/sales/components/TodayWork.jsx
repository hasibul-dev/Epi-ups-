import { useState, useEffect, useRef, useCallback } from 'react';
import { CATEGORIES, RULES, METHODS, today, addDays, nowHHMM, now12h, fmt, clockTime, getTaskCategory, formatTime12h, compareTimes } from '../utils/helpers.js';

const isCompleted = (status) => String(status || '').trim().toLowerCase() === 'completed';
import TimePicker12h from './TimePicker12h.jsx';
import ExpandableText from './ExpandableText.jsx';
import {
  PhoneCall,
  CalendarCheck,
  PlusCircle,
  Zap,
  CheckCircle2,
  Edit3,
  Trash2,
  Check,
  Hourglass,
  AlertCircle,
  Clock,
  Calendar,
  X,
} from 'lucide-react';

function TodayTableScroll({ children, className = '' }) {
  const tableContainerRef = useRef(null);
  const stickyScrollbarRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [canScrollHorizontal, setCanScrollHorizontal] = useState(false);

  const updateScrollDimensions = useCallback(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const hasScroll = el.scrollWidth > el.clientWidth + 1;
    setCanScrollHorizontal(hasScroll);
    setScrollWidth(el.scrollWidth);
    if (stickyScrollbarRef.current && Math.abs(stickyScrollbarRef.current.scrollLeft - el.scrollLeft) > 1) {
      stickyScrollbarRef.current.scrollLeft = el.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    updateScrollDimensions();

    const ro = new ResizeObserver(() => {
      updateScrollDimensions();
    });

    ro.observe(el);
    const tableEl = el.querySelector('table');
    if (tableEl) ro.observe(tableEl);

    window.addEventListener('resize', updateScrollDimensions);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScrollDimensions);
    };
  }, [updateScrollDimensions]);

  useEffect(() => {
    updateScrollDimensions();
  });

  useEffect(() => {
    const tableEl = tableContainerRef.current;
    const scrollbarEl = stickyScrollbarRef.current;
    if (!tableEl || !scrollbarEl || !canScrollHorizontal) return;

    let activeSource = null;
    let resetTimer = null;

    const onTableScroll = () => {
      if (activeSource === 'scrollbar') return;
      activeSource = 'table';
      scrollbarEl.scrollLeft = tableEl.scrollLeft;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        activeSource = null;
      }, 50);
    };

    const onScrollbarScroll = () => {
      if (activeSource === 'table') return;
      activeSource = 'scrollbar';
      tableEl.scrollLeft = scrollbarEl.scrollLeft;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        activeSource = null;
      }, 50);
    };

    const onScrollbarWheel = (e) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        scrollbarEl.scrollLeft += e.deltaY;
      }
    };

    tableEl.addEventListener('scroll', onTableScroll, { passive: true });
    scrollbarEl.addEventListener('scroll', onScrollbarScroll, { passive: true });
    scrollbarEl.addEventListener('wheel', onScrollbarWheel, { passive: false });

    return () => {
      tableEl.removeEventListener('scroll', onTableScroll);
      scrollbarEl.removeEventListener('scroll', onScrollbarScroll);
      scrollbarEl.removeEventListener('wheel', onScrollbarWheel);
      clearTimeout(resetTimer);
    };
  }, [canScrollHorizontal]);

  return (
    <div className={`today-table-scroll-wrapper client-table-scroll-wrapper ${className}`.trim()}>
      <div className="table-responsive today-table-scroll client-table-scroll" ref={tableContainerRef}>
        {children}
      </div>
      {canScrollHorizontal && (
        <div
          ref={stickyScrollbarRef}
          className="today-sticky-scrollbar client-sticky-scrollbar"
          title="Drag or scroll horizontally to view all columns"
        >
          <div style={{ width: scrollWidth, height: 1 }} />
        </div>
      )}
    </div>
  );
}

function FollowRow({ client: c, onDone, onUpdateNextDate }) {
  const [cat, setCat] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState(c.notes || '');
  const [generalDate, setGeneralDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingFollowDate, setIsEditingFollowDate] = useState(false);
  const [followDateInput, setFollowDateInput] = useState(c.nextDate || today());
  const [isSavingDate, setIsSavingDate] = useState(false);

  const handleCatChange = (e) => {
    const val = e.target.value;
    setCat(val);
    if (val !== 'General') {
      setGeneralDate('');
    }
  };

  const done = async () => {
    if (!cat || !method) {
      alert('Please select both Result (Category) and Follow-up Method before clicking Done.');
      return;
    }
    if (cat === 'General' && !generalDate) {
      alert('Please choose a follow-up date for General.');
      return;
    }
    if (cat === 'General' && generalDate < today()) {
      alert('Please select a valid future date.');
      return;
    }
    setIsSubmitting(true);
    try {
      const scheduledNextDate = cat === 'General'
        ? generalDate
        : addDays(today(), RULES[cat] ?? 3);
      await onDone(c.id, cat, method, notes.trim(), scheduledNextDate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNextDate = async () => {
    if (!followDateInput) {
      alert('Please select a valid follow-up date.');
      return;
    }
    setIsSavingDate(true);
    try {
      if (onUpdateNextDate) {
        await onUpdateNextDate(c.id, followDateInput);
      }
      setIsEditingFollowDate(false);
    } finally {
      setIsSavingDate(false);
    }
  };

  const isOverdue = c.nextDate && c.nextDate < today();

  return (
    <tr>
      <td>
        <b>{c.name}</b>
        {c.desig && <div className="kicker">{c.desig}</div>}
        {(c.createdByName || c.createdBy) && (
          <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              👤 {c.createdByName || c.createdBy}
            </span>
          </div>
        )}
      </td>
      <td>
        <div>{c.company || '—'}</div>
        {c.address && <div className="kicker">{c.address}</div>}
      </td>
      <td>
        <div>{c.phone ? <a href={`tel:${c.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{c.phone}</a> : '—'}</div>
        {c.email && (
          <div className="kicker">
            <a href={`mailto:${c.email}`} style={{ color: '#1877d2' }}>✉ {c.email}</a>
          </div>
        )}
      </td>
      <td>
        <span className="badge">{c.previousStatus || c.category || 'Potential'}</span>
      </td>
      <td style={{ minWidth: 155 }}>
        {isEditingFollowDate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="date"
              value={followDateInput}
              onChange={(e) => setFollowDateInput(e.target.value)}
              style={{ fontSize: 11, padding: '4px 6px', width: 125 }}
            />
            <button
              className="data-edit"
              style={{
                padding: '4px 7px',
                fontSize: 11,
                background: '#059669',
                color: '#fff',
                fontWeight: 700,
              }}
              onClick={handleSaveNextDate}
              disabled={isSavingDate}
              title="Save date"
            >
              {isSavingDate ? '...' : <Check size={11} strokeWidth={2.4} />}
            </button>
            <button
              className="secondary"
              style={{ padding: '4px 6px', fontSize: 11 }}
              onClick={() => setIsEditingFollowDate(false)}
              title="Cancel"
            >
              <X size={11} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{fmt(c.nextDate)}</span>
            {isOverdue && <span className="badge warn" style={{ fontSize: 10 }}>Overdue</span>}
            <button
              className="edit-btn"
              style={{ padding: '2px 6px', fontSize: 10, marginLeft: 'auto' }}
              onClick={() => {
                setFollowDateInput(c.nextDate || today());
                setIsEditingFollowDate(true);
              }}
              title="Edit Next Follow-up Date"
            >
              <Edit3 size={10} strokeWidth={2.2} /> Edit
            </button>
          </div>
        )}
      </td>
      <td style={{ minWidth: 150 }}>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Remark / note..."
          style={{ fontSize: 12, padding: '6px 8px' }}
        />
      </td>
      <td style={{ minWidth: 160 }}>
        <select value={cat} onChange={handleCatChange} style={{ width: '100%' }}>
          <option value="">Select Result</option>
          {CATEGORIES.map((x) => {
            const days = x === 'Potential' ? 3 : x === 'Quotation' ? 7 : x === 'Sale' ? 30 : 10;
            return <option key={x} value={x}>{x} (+{days}d)</option>;
          })}
          <option value="General">General</option>
        </select>
        {cat === 'General' && (
          <div style={{ marginTop: 5 }}>
            <input
              type="date"
              value={generalDate}
              min={today()}
              onChange={(e) => setGeneralDate(e.target.value)}
              title="Select follow-up date"
              style={{ fontSize: 11, padding: '4px 6px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        )}
      </td>
      <td>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">Select Method</option>
          {METHODS.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </td>
      <td>
        <button className="primary" onClick={done} disabled={isSubmitting} style={{ padding: '6px 12px', fontSize: 12 }}>
          {isSubmitting ? 'Saving...' : <><Check size={13} strokeWidth={2.4} /> DONE</>}
        </button>
      </td>
    </tr>
  );
}

function FollowUpSection({ db, onDone, onUpdateNextDate }) {
  const due = db.clients.filter((c) => c.nextDate && c.nextDate <= today());

  return (
    <div className="section active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Client Follow-up</h2>
            <div className="muted">Select next result, method, and notes. Next follow-up is scheduled automatically or customizable.</div>
          </div>
          {due.length > 0 && <span className="badge">{due.length} Due Today</span>}
        </div>
        <TodayTableScroll>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Previous Status</th>
                <th>Follow-up Date</th>
                <th>Remarks / Notes</th>
                <th>Next Result</th>
                <th>Follow-up Method</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {due.length ? due.map((c) => (
                <FollowRow
                  key={c.id}
                  client={c}
                  onDone={onDone}
                  onUpdateNextDate={onUpdateNextDate}
                />
              )) : (
                <tr><td colSpan="9" className="empty">No client follow-up due today. All scheduled client follow-ups are up to date!</td></tr>
              )}
            </tbody>
          </table>
        </TodayTableScroll>
      </div>
    </div>
  );
}

function ActivityRow({ w, onDoneActivity, onSaveRow, onDeleteRow }) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(w.time ? formatTime12h(w.time) : '');
  const [text, setText] = useState(w.text || '');
  const [notes, setNotes] = useState(w.notes || '');
  const [status, setStatus] = useState(w.status || 'Pending');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return alert('Activity description cannot be empty.');
    setIsSaving(true);
    try {
      await onSaveRow('work', w.id, {
        date: w.date,
        time: time ? formatTime12h(time) : '',
        text: text.trim(),
        notes: notes.trim(),
        status,
      });
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete this planned activity from the database?\n\n"${w.text}"\n\nThis will completely remove it from all views.`
      )
    ) {
      return;
    }
    onDeleteRow('work', w.id);
  };

  if (editing) {
    return (
      <tr style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)' }}>
        <td style={{ minWidth: 155 }}>
          <TimePicker12h value={time} onChange={setTime} />
        </td>
        <td style={{ minWidth: 200 }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Work activity description..."
          />
        </td>
        <td>
          <span className="badge">Activity</span>
        </td>
        <td style={{ minWidth: 160 }}>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Remarks or notes..."
          />
        </td>
        <td style={{ whiteSpace: 'nowrap' }}>
          <button className="data-edit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : <><Check size={12} strokeWidth={2.4} /> Save</>}
          </button>{' '}
          <button className="secondary" onClick={() => setEditing(false)} disabled={isSaving}>
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  const cat = getTaskCategory(w.date, w.time, w.status);
  return (
    <tr>
      <td>{w.time ? formatTime12h(w.time) : '—'}</td>
      <td style={{ minWidth: 160 }}>
        <ExpandableText
          text={w.text}
          title="Activity Description"
          subtitle={w.time ? formatTime12h(w.time) : ''}
        />
        {(w.createdByName || w.createdBy) && (
          <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              👤 {w.createdByName || w.createdBy}
            </span>
          </div>
        )}
      </td>
      <td>
        {w.status === 'Completed' ? (
          <span className="badge done">Completed</span>
        ) : cat === 'Overdue' ? (
          <span className="badge badge-overdue">
            Overdue
          </span>
        ) : (
          <span className="badge badge-active">
            Active
          </span>
        )}
      </td>
      <td style={{ minWidth: 160 }}>
        <ExpandableText
          text={w.notes}
          title="Remarks / Notes"
          subtitle={w.text}
        />
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>
        {w.status !== 'Completed' && (
          <>
            <button className="primary" onClick={() => onDoneActivity(w.id)} style={{ marginRight: 6, padding: '5px 10px', fontSize: 12 }}>
              <Check size={12} strokeWidth={2.4} /> DONE
            </button>
          </>
        )}
        <button className="data-edit" onClick={() => setEditing(true)} title="Edit this activity">
          <Edit3 size={12} strokeWidth={2.2} /> Edit
        </button>{' '}
        <button className="data-delete" onClick={handleDelete} title="Permanently delete from database">
          <Trash2 size={12} strokeWidth={2.2} /> Delete
        </button>
      </td>
    </tr>
  );
}

export function ActivitySection({
  db,
  onDoneActivity,
  onDoneFollow,
  onUpdateNextDate,
  onSaveRow,
  onDeleteRow,
}) {
  const d = today();
  const acts = db.work.filter((w) => w.date === d);
  const dueClients = db.clients.filter((c) => c.nextDate && c.nextDate <= d);

  return (
    <div className="section active">
      {/* Planned Activities Panel */}
      <div className="panel">
        <div className="head">
          <div>
            <h2>Daily Activity (Manually Assigned Tasks)</h2>
            <div className="muted">Manually planned tasks for today.</div>
          </div>
        </div>
        <TodayTableScroll>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
                <th>Category</th>
                <th>Remarks / Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {acts.map((w) => (
                <ActivityRow
                  key={w.id}
                  w={w}
                  onDoneActivity={onDoneActivity}
                  onSaveRow={onSaveRow}
                  onDeleteRow={onDeleteRow}
                />
              ))}
              {!acts.length && (
                <tr>
                  <td colSpan="5" className="empty">
                    No manual activity recorded for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TodayTableScroll>
      </div>

      {/* Automatic Client Follow-up Tasks shown right alongside manually assigned tasks */}
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="head">
          <div>
            <h2>Automatic Client Follow-up Tasks (Due Today)</h2>
            <div className="muted">Scheduled follow-up tasks due today. Complete with result to automatically create and schedule the next follow-up.</div>
          </div>
          {dueClients.length > 0 && <span className="badge">{dueClients.length} Due</span>}
        </div>
        <TodayTableScroll>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Previous Status</th>
                <th>Follow-up Date</th>
                <th>Remarks / Notes</th>
                <th>Next Result</th>
                <th>Follow-up Method</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dueClients.length ? dueClients.map((c) => (
                <FollowRow
                  key={c.id}
                  client={c}
                  onDone={onDoneFollow}
                  onUpdateNextDate={onUpdateNextDate}
                />
              )) : (
                <tr><td colSpan="9" className="empty">No automatic client follow-up due for today.</td></tr>
              )}
            </tbody>
          </table>
        </TodayTableScroll>
      </div>
    </div>
  );
}

function NewWorkRow({ w, onDone, onSaveRow, onDeleteRow }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(w.date || today());
  const [time, setTime] = useState(w.time ? formatTime12h(w.time) : '');
  const [text, setText] = useState(w.text || '');
  const [notes, setNotes] = useState(w.notes || '');
  const [status, setStatus] = useState(w.status || 'Pending');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDate(w.date || today());
    setTime(w.time ? formatTime12h(w.time) : '');
    setText(w.text || '');
    setNotes(w.notes || '');
    setStatus(w.status || 'Pending');
  }, [w.date, w.time, w.text, w.notes, w.status]);

  const handleSave = async () => {
    if (!text.trim()) return alert('Work description cannot be empty.');
    setIsSaving(true);
    try {
      // Editing completed work must preserve its completed status unless explicitly changed to Pending
      const resolvedStatus = status || (isCompleted(w.status) ? 'Completed' : 'Pending');
      await onSaveRow('new', w.id, {
        date,
        time: time ? formatTime12h(time) : '',
        text: text.trim(),
        notes: notes.trim(),
        status: resolvedStatus,
      });
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete this scheduled work from the database?\n\n"${w.text}"\n\nThis will completely remove it from all views.`
      )
    ) {
      return;
    }
    onDeleteRow('new', w.id);
  };

  if (editing) {
    return (
      <tr style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)' }}>
        <td style={{ minWidth: 135 }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 130 }}
          />
        </td>
        <td style={{ minWidth: 155 }}>
          <TimePicker12h value={time} onChange={setTime} />
        </td>
        <td style={{ minWidth: 200 }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Work description..."
          />
        </td>
        <td style={{ minWidth: 160 }}>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Remarks / notes..."
          />
        </td>
        <td>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </td>
        <td style={{ whiteSpace: 'nowrap' }}>
          <button className="data-edit" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : <><Check size={12} strokeWidth={2.4} /> Save</>}
          </button>{' '}
          <button className="secondary" onClick={() => setEditing(false)} disabled={isSaving}>
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <b>{fmt(w.date)}</b>
      </td>
      <td>{w.time ? formatTime12h(w.time) : '—'}</td>
      <td style={{ minWidth: 160 }}>
        <ExpandableText
          text={w.text}
          title="Work Description"
          subtitle={`${fmt(w.date)} ${w.time ? '· ' + formatTime12h(w.time) : ''}`}
        />
      </td>
      <td style={{ minWidth: 160 }}>
        <ExpandableText
          text={w.notes}
          title="Remarks / Notes"
          subtitle={w.text}
        />
      </td>
      <td>
        {w.status === 'Completed' ? (
          <span className="badge done">Completed</span>
        ) : w.category === 'Overdue' ? (
          <span className="badge badge-overdue">
            Overdue
          </span>
        ) : w.category === 'Upcoming' ? (
          <span className="badge badge-upcoming">
            Upcoming
          </span>
        ) : (
          <span className="badge badge-active">
            Active
          </span>
        )}
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>
        {w.status !== 'Completed' && (
          <button className="primary" onClick={() => onDone(w.id)} style={{ marginRight: 6, padding: '5px 10px', fontSize: 12 }}>
            <Check size={12} strokeWidth={2.4} /> DONE
          </button>
        )}
        <button className="data-edit" onClick={() => setEditing(true)} title="Edit this work">
          <Edit3 size={12} strokeWidth={2.2} /> Edit
        </button>{' '}
        <button className="data-delete" onClick={handleDelete} title="Permanently delete from database">
          <Trash2 size={12} strokeWidth={2.2} /> Delete
        </button>
      </td>
    </tr>
  );
}

function NewWorkSection({ db, onAdd, onDone, onSaveRow, onDeleteRow }) {
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(now12h());
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('all');

  const add = async () => {
    if (!text.trim()) return alert('Work description is required.');
    const ok = await onAdd(formatTime12h(time) || now12h(), text.trim(), date || today(), notes.trim());
    if (ok) {
      setText('');
      setNotes('');
    }
  };

  // Get all remaining scheduled work items (hide completed immediately from directory, filters & counts)
  const allNewWork = db.newWork || [];
  const remainingWork = allNewWork.filter((w) => !isCompleted(w.status));

  const categorized = remainingWork.map((w) => ({
    ...w,
    category: getTaskCategory(w.date, w.time, w.status),
  }));

  const activeCount = categorized.filter((w) => w.category === 'Active').length;
  const upcomingCount = categorized.filter((w) => w.category === 'Upcoming').length;
  const overdueCount = categorized.filter((w) => w.category === 'Overdue').length;

  const getRank = (cat) => {
    if (cat === 'Overdue') return 1;
    if (cat === 'Active') return 2;
    if (cat === 'Upcoming') return 3;
    return 4;
  };

  const validFilter = ['all', 'active', 'upcoming', 'overdue'].includes(filter) ? filter : 'all';

  const filtered = categorized
    .filter((w) => {
      if (validFilter === 'active') return w.category === 'Active';
      if (validFilter === 'upcoming') return w.category === 'Upcoming';
      if (validFilter === 'overdue') return w.category === 'Overdue';
      return true;
    })
    .sort((a, b) => {
      // 1. Group priority: Overdue work first, then today's work (Active), then upcoming work
      const rankA = getRank(a.category);
      const rankB = getRank(b.category);
      if (rankA !== rankB) return rankA - rankB;

      // 2. Within each group: Assigned Date ascending (earliest first)
      const dComp = (a.date || '').localeCompare(b.date || '');
      if (dComp !== 0) return dComp;

      // 3. Within same date: Assigned Time ascending (earliest first)
      return compareTimes(a.time, b.time);
    });

  return (
    <div className="section active">
      {/* Create New Work Panel */}
      <div className="panel">
        <div className="head">
          <div>
            <h2>Create New Work</h2>
            <div className="muted">Assign a task with scheduled date, time, and remarks. It will be categorized as Active, Upcoming, or Overdue automatically.</div>
          </div>
        </div>
        <div className="grid">
          <div>
            <label>Assigned Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>Assigned Time (12-hour AM/PM) *</label>
            <TimePicker12h value={time} onChange={setTime} />
          </div>
          <div className="full">
            <label>Work Description *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: Emergency UPS site inspection at Meghna Group..."
              style={{ minHeight: 70 }}
            />
          </div>
          <div className="full">
            <label>Remarks / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important notes, contact person, or remarks..."
            />
          </div>
        </div>
        <br />
        <button className="primary" onClick={add}>
          <PlusCircle size={15} strokeWidth={2.2} /> Add Scheduled Work
        </button>
      </div>

      {/* Categorized Work List */}
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="head">
          <div>
            <h2>Scheduled Work Directory</h2>
            <div className="muted">Tasks automatically categorized by scheduled date, time, and status.</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className={validFilter === 'all' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '6px 11px' }}
              onClick={() => setFilter('all')}
            >
              All ({categorized.length})
            </button>
            <button
              className={validFilter === 'active' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '6px 11px' }}
              onClick={() => setFilter('active')}
            >
              <Zap size={12} strokeWidth={2.2} /> Active ({activeCount})
            </button>
            <button
              className={validFilter === 'upcoming' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '6px 11px' }}
              onClick={() => setFilter('upcoming')}
            >
              <Hourglass size={12} strokeWidth={2.2} /> Upcoming ({upcomingCount})
            </button>
            <button
              className={validFilter === 'overdue' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '6px 11px' }}
              onClick={() => setFilter('overdue')}
            >
              <AlertCircle size={12} strokeWidth={2.2} /> Overdue ({overdueCount})
            </button>
          </div>
        </div>

        <TodayTableScroll>
          <table>
            <thead>
              <tr>
                <th>Assigned Date</th>
                <th>Time</th>
                <th>Work Description</th>
                <th>Remarks / Notes</th>
                <th>Category</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((w) => (
                  <NewWorkRow
                    key={w.id}
                    w={w}
                    onDone={onDone}
                    onSaveRow={onSaveRow}
                    onDeleteRow={onDeleteRow}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty">
                    No work items found for {validFilter} view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TodayTableScroll>
      </div>
    </div>
  );
}

function WorkStatusSection({ db, onDoneActivity, onDoneNew }) {
  const [filter, setFilter] = useState('all');

  // Gather all tasks across planned work and new work
  const allTasks = [];

  (db.work || []).forEach((w) => {
    allTasks.push({
      id: w.id,
      source: 'work',
      sourceLabel: 'Planned Work',
      date: w.date,
      time: w.time || '',
      text: w.text,
      notes: w.notes || '',
      status: w.status,
      category: getTaskCategory(w.date, w.time, w.status),
    });
  });

  (db.newWork || []).forEach((w) => {
    allTasks.push({
      id: w.id,
      source: 'new',
      sourceLabel: 'New Work',
      date: w.date,
      time: w.time || '',
      text: w.text,
      notes: w.notes || '',
      status: w.status,
      category: getTaskCategory(w.date, w.time, w.status),
    });
  });

  // Client follow-up tasks due or upcoming
  (db.clients || []).forEach((c) => {
    if (c.nextDate) {
      allTasks.push({
        id: 'c-' + c.id,
        source: 'client',
        sourceLabel: 'Client Follow-up',
        date: c.nextDate,
        time: '',
        text: `Follow-up: ${c.name} (${c.company})`,
        notes: c.notes || '',
        status: 'Pending',
        category: getTaskCategory(c.nextDate, '', 'Pending'),
      });
    }
  });

  const activeCount = allTasks.filter((t) => t.status !== 'Completed' && t.category === 'Active').length;
  const upcomingCount = allTasks.filter((t) => t.status !== 'Completed' && t.category === 'Upcoming').length;
  const overdueCount = allTasks.filter((t) => t.status !== 'Completed' && t.category === 'Overdue').length;

  const filtered = allTasks.filter((t) => {
    if (filter === 'active') return t.status !== 'Completed' && t.category === 'Active';
    if (filter === 'upcoming') return t.status !== 'Completed' && t.category === 'Upcoming';
    if (filter === 'overdue') return t.status !== 'Completed' && t.category === 'Overdue';
    return true;
  }).sort((a, b) => {
    const dComp = (b.date || '').localeCompare(a.date || '');
    if (dComp !== 0) return dComp;
    return compareTimes(a.time, b.time);
  });

  return (
    <div className="section active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Work Status &amp; Scheduling</h2>
            <div className="muted">Real-time overview of Active Work, Upcoming Work, and Overdue Work across all sections.</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className={filter === 'all' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '7px 12px' }}
              onClick={() => setFilter('all')}
            >
              All Tasks ({allTasks.length})
            </button>
            <button
              className={filter === 'active' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '7px 12px' }}
              onClick={() => setFilter('active')}
            >
              <Zap size={12} strokeWidth={2.2} /> Active Work ({activeCount})
            </button>
            <button
              className={filter === 'upcoming' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '7px 12px' }}
              onClick={() => setFilter('upcoming')}
            >
              <Hourglass size={12} strokeWidth={2.2} /> Upcoming Work ({upcomingCount})
            </button>
            <button
              className={filter === 'overdue' ? 'primary' : 'secondary'}
              style={{ fontSize: 11, padding: '7px 12px' }}
              onClick={() => setFilter('overdue')}
            >
              <AlertCircle size={12} strokeWidth={2.2} /> Overdue Work ({overdueCount})
            </button>
          </div>
        </div>

        <TodayTableScroll>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Task / Details</th>
                <th>Remarks / Notes</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((t) => (
                  <tr key={`${t.source}-${t.id}`}>
                    <td><b>{fmt(t.date)}</b></td>
                    <td>{t.time ? formatTime12h(t.time) : '—'}</td>
                    <td><span className="badge">{t.sourceLabel}</span></td>
                    <td style={{ minWidth: 160 }}>
                      <ExpandableText
                        text={t.text}
                        title="Task / Details"
                        subtitle={`${t.sourceLabel} · ${fmt(t.date)}`}
                      />
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <ExpandableText
                        text={t.notes}
                        title="Remarks / Notes"
                        subtitle={t.text}
                      />
                    </td>
                    <td>
                      {t.status === 'Completed' ? (
                        <span className="badge done">Completed</span>
                      ) : t.category === 'Overdue' ? (
                        <span className="badge badge-overdue">Overdue</span>
                      ) : t.category === 'Upcoming' ? (
                        <span className="badge badge-upcoming">Upcoming</span>
                      ) : (
                        <span className="badge badge-active">Active</span>
                      )}
                    </td>
                    <td>
                      {t.status === 'Completed' ? (
                        <span className="badge done">Completed</span>
                      ) : (
                        <span className="badge">{t.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty">
                    No tasks found in {filter} category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TodayTableScroll>
      </div>
    </div>
  );
}

function CompletedRow({ h, onSaveRow, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(h.time ? formatTime12h(h.time) : '');
  const [text, setText] = useState(h.text || h.client || h.type || '');
  const [notes, setNotes] = useState(h.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return alert('Description cannot be empty.');
    setIsSaving(true);
    try {
      await onSaveRow('history', h.id, {
        date: h.date,
        time: time ? formatTime12h(time) : '',
        text: text.trim(),
        notes: notes.trim(),
        status: 'Completed',
      });
      setEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (editing) {
    return (
      <div
        className="schedule-row"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(20px)',
          padding: 16,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
              Time (12h AM/PM)
            </label>
            <TimePicker12h value={time} onChange={setTime} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
              Work / Client Description
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Task description..."
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
              Remarks / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Remarks or notes..."
            />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="data-edit" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : <><Check size={12} strokeWidth={2.4} /> Save</>}
            </button>
            <button
              className="secondary"
              onClick={() => setEditing(false)}
              disabled={isSaving}
              style={{ padding: '7px 12px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-row" key={h.id}>
      <div>
        <span className="badge done">Completed</span>
        <b style={{ marginLeft: 8 }}>{h.type}</b>
        <div className="kicker" style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <span>{h.client || h.text || ''}</span>
          {h.company && <span>· {h.company}</span>}
          {h.previousStatus && h.category && <span>· Previous: {h.previousStatus} → Result: {h.category}</span>}
          {h.followType && <span>· Method: {h.followType}</span>}
          {h.nextDate && <span>· Next Follow-up: {fmt(h.nextDate)}</span>}
          {h.notes && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              · Note:
              <ExpandableText
                text={h.notes}
                title={`Completed Record Notes — ${h.client || h.text}`}
                subtitle={h.company}
              />
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <span className="kicker">
          {h.time ? formatTime12h(h.time) : ''}
          {h.category && !h.previousStatus ? ' · ' + h.category : ''}
        </span>
        <br />
        <button className="data-edit" onClick={() => setEditing(true)} title="Edit completed record">
          <Edit3 size={12} strokeWidth={2.2} /> Edit
        </button>{' '}
        <button
          className="data-delete"
          onClick={() => onDelete(h.id)}
          title="Permanently delete from database"
        >
          <Trash2 size={12} strokeWidth={2.2} /> Delete
        </button>
      </div>
    </div>
  );
}

function CompletedSection({ db, onSaveRow, onDelete }) {
  const ch = db.history.filter((h) => h.date === today()).slice().reverse();

  return (
    <div className="section active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Completed Today</h2>
            <div className="muted">
              Review completed activities. Any edits or deletions are saved permanently to the cloud database.
            </div>
          </div>
          {ch.length > 0 && <span className="badge done">{ch.length} Completed</span>}
        </div>
        <div>
          {ch.length ? (
            ch.map((h) => (
              <CompletedRow key={h.id} h={h} onSaveRow={onSaveRow} onDelete={onDelete} />
            ))
          ) : (
            <div className="empty">No completed records for today.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'follow', icon: PhoneCall, title: 'Follow-up', sub: 'Client follow-up due today' },
  { id: 'activity', icon: CalendarCheck, title: 'Activity', sub: 'Planned work & follow-ups' },
  { id: 'new', icon: PlusCircle, title: 'New Work', sub: 'Assign date, time & notes' },
  { id: 'status', icon: Zap, title: 'Work Status', sub: 'Active, Upcoming & Overdue' },
  { id: 'complete', icon: CheckCircle2, title: 'Completed', sub: 'Completed today' },
];

export default function TodayWork({ store, setPage }) {
  const [tab, setTab] = useState('follow');
  const { db } = store;

  const deleteHistory = (id) => {
    if (
      !confirm(
        'Are you sure you want to permanently delete this record from the database? This cannot be undone and will remove it from all views.'
      )
    ) {
      return;
    }
    store.deleteEditRow('history', id);
  };

  return (
    <section className="page active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Today Work</h2>
            <div className="muted">{fmt(today())}</div>
          </div>
        </div>
        <div className="today-grid">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={'today-btn' + (tab === t.id ? ' active' : '')}
                onClick={() => setTab(t.id)}
              >
                <div className="ico">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <b>{t.title}</b>
                <div className="muted">{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'follow' && (
        <FollowUpSection
          db={db}
          onDone={store.doneFollow}
          onUpdateNextDate={store.updateClientNextDate}
        />
      )}
      {tab === 'activity' && (
        <ActivitySection
          db={db}
          onDoneActivity={store.doneActivity}
          onDoneFollow={store.doneFollow}
          onUpdateNextDate={store.updateClientNextDate}
          onSaveRow={store.saveEditRow}
          onDeleteRow={store.deleteEditRow}
        />
      )}
      {tab === 'new' && (
        <NewWorkSection
          db={db}
          onAdd={store.addNewWork}
          onDone={store.doneNew}
          onSaveRow={store.saveEditRow}
          onDeleteRow={store.deleteEditRow}
        />
      )}
      {tab === 'status' && (
        <WorkStatusSection
          db={db}
          onDoneActivity={store.doneActivity}
          onDoneNew={store.doneNew}
        />
      )}
      {tab === 'complete' && (
        <CompletedSection
          db={db}
          onDelete={deleteHistory}
          onSaveRow={store.saveEditRow}
        />
      )}
    </section>
  );
}
