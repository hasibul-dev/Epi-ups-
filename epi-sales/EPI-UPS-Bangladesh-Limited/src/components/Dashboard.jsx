import { useState, useEffect } from 'react';
import { today, fmt, getTaskCategory, formatTime12h } from '../utils/helpers.js';
import ExpandableText from './ExpandableText.jsx';
import {
  Clock,
  Calendar,
  PlusCircle,
  Users,
  Zap,
  Hourglass,
  AlertCircle,
  UserPlus,
  CalendarPlus,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const duration = 650;
    let startTime = null;
    let rafId = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(ease * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplay(end);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value]);

  return <span className="counter-val">{display}</span>;
}

function Cards({ db, setPage }) {
  const d = today();
  const followUpDueCount = db.clients.filter((c) => c.nextDate && c.nextDate <= d).length;
  const plannedCount = db.work.filter((w) => w.date === d && w.status === 'Pending').length;
  const newWorkCount = db.newWork.filter((w) => w.date === d && w.status === 'Pending').length;
  const totalClients = db.clients.length;

  const clientFollowTasks = (db.clients || [])
    .filter((c) => c.nextDate)
    .map((c) => ({
      date: c.nextDate,
      time: '',
      status: 'Pending',
    }));
  const allWorkTasks = [...(db.work || []), ...(db.newWork || []), ...clientFollowTasks];
  const activeCount = allWorkTasks.filter(
    (w) => w.status !== 'Completed' && getTaskCategory(w.date, w.time, w.status) === 'Active'
  ).length;
  const upcomingCount = allWorkTasks.filter(
    (w) => w.status !== 'Completed' && getTaskCategory(w.date, w.time, w.status) === 'Upcoming'
  ).length;
  const overdueCount = allWorkTasks.filter(
    (w) => w.status !== 'Completed' && getTaskCategory(w.date, w.time, w.status) === 'Overdue'
  ).length;

  return (
    <>
      <div className="cards">
        <div className="card card-metric card-followup">
          <div className="card-top">
            <span className="label">
              <span className="card-icon-badge icon-ruby">
                <Clock size={16} strokeWidth={2.4} />
              </span>
              Follow-up Due
            </span>
            <span className="card-pill pill-ruby">Due Today</span>
          </div>
          <b><AnimatedCounter value={followUpDueCount} /></b>
          <div className="card-subtext">Client follow-up due on or before today</div>
        </div>
        <div className="card card-metric card-planned">
          <div className="card-top">
            <span className="label">
              <span className="card-icon-badge icon-flame">
                <Calendar size={16} strokeWidth={2.4} />
              </span>
              Planned Activity
            </span>
            <span className="card-pill pill-flame">Scheduled</span>
          </div>
          <b><AnimatedCounter value={plannedCount} /></b>
          <div className="card-subtext">Assigned tasks for today</div>
        </div>
        <div className="card card-metric card-newwork">
          <div className="card-top">
            <span className="label">
              <span className="card-icon-badge icon-gold">
                <PlusCircle size={16} strokeWidth={2.4} />
              </span>
              New Work
            </span>
            <span className="card-pill pill-gold">Pipeline</span>
          </div>
          <b><AnimatedCounter value={newWorkCount} /></b>
          <div className="card-subtext">Pending new assignments</div>
        </div>
        <div className="card card-metric card-clients">
          <div className="card-top">
            <span className="label">
              <span className="card-icon-badge icon-sunset">
                <Users size={16} strokeWidth={2.4} />
              </span>
              Total Clients
            </span>
            <span className="card-pill pill-sunset">Directory</span>
          </div>
          <b><AnimatedCounter value={totalClients} /></b>
          <div className="card-subtext">Registered corporate accounts</div>
        </div>
      </div>

      <div className="dashboard-status-grid">
        <div
          className="card status-card status-card-active"
          onClick={() => setPage('today')}
          title="Click to view Active Work in Today Work"
        >
          <div className="status-card-header">
            <span className="label">
              <span className="status-card-icon-wrap icon-flame">
                <Zap size={16} strokeWidth={2.4} />
              </span>
              Active Work
            </span>
            <span className="status-indicator-tag tag-flame">Ongoing</span>
          </div>
          <div className="status-card-body">
            <b><AnimatedCounter value={activeCount} /></b>
            <div className="status-card-action">
              <span>View in Today Work</span>
              <ArrowRight size={13} strokeWidth={2.4} />
            </div>
          </div>
        </div>
        <div
          className="card status-card status-card-upcoming"
          onClick={() => setPage('today')}
          title="Click to view Upcoming Work in Today Work"
        >
          <div className="status-card-header">
            <span className="label">
              <span className="status-card-icon-wrap icon-gold">
                <Hourglass size={16} strokeWidth={2.4} />
              </span>
              Upcoming Work
            </span>
            <span className="status-indicator-tag tag-gold">Scheduled</span>
          </div>
          <div className="status-card-body">
            <b><AnimatedCounter value={upcomingCount} /></b>
            <div className="status-card-action">
              <span>View in Today Work</span>
              <ArrowRight size={13} strokeWidth={2.4} />
            </div>
          </div>
        </div>
        <div
          className="card status-card status-card-overdue"
          onClick={() => setPage('today')}
          title="Click to view Overdue Work in Today Work"
        >
          <div className="status-card-header">
            <span className="label">
              <span className="status-card-icon-wrap icon-ruby">
                <AlertCircle size={16} strokeWidth={2.4} />
              </span>
              Overdue Work
            </span>
            <span className="status-indicator-tag tag-ruby">Action Required</span>
          </div>
          <div className="status-card-body">
            <b><AnimatedCounter value={overdueCount} /></b>
            <div className="status-card-action">
              <span>View in Today Work</span>
              <ArrowRight size={13} strokeWidth={2.4} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ScheduleHistory({ db }) {
  const [date, setDate] = useState(today());
  const d = date || today();
  const isToday = d === today();
  const planned = db.work.filter((w) => w.date === d);
  const follow = db.clients.filter((c) => c.nextDate && (isToday ? c.nextDate <= d : c.nextDate === d));
  const completed = db.history.filter((h) => h.date === d);
  const none = !follow.length && !planned.length && !completed.length;

  return (
    <div className="panel schedule-history-panel">
      <div className="head">
        <div>
          <h2>Schedule &amp; History</h2>
          <div className="muted">Select any date to see what happened and what is scheduled.</div>
        </div>
        <div className="schedule-date-badge">
          <Calendar size={14} strokeWidth={2.2} />
          <span>{fmt(d)}</span>
        </div>
      </div>
      <div className="split">
        <div className="datebox">
          <label>
            <Calendar size={13} strokeWidth={2.2} />
            <span>Select Date</span>
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {date !== today() && (
            <button
              type="button"
              className="datebox-reset-btn"
              onClick={() => setDate(today())}
            >
              Reset to Today
            </button>
          )}
        </div>
        <div>
          <div className="head schedule-subhead">
            <div>
              <h2>{fmt(d)}</h2>
            </div>
            <div className="schedule-counts-pill">
              {follow.length + planned.length} Scheduled · {completed.length} Completed
            </div>
          </div>
          <div className="schedule-list">
            {follow.length > 0 && (
              <div className="schedule-section-group">
                <div className="schedule-group-title group-followup">
                  <span className="dot-indicator"></span>
                  CLIENT FOLLOW-UP ({follow.length})
                </div>
                {follow.map((c) => (
                  <div className="schedule-row schedule-row-followup" key={c.id}>
                    <div>
                      <b>{c.name}</b>
                      <div className="kicker">
                        {c.company ? c.company + ' · ' : ''}
                        {c.previousStatus ? `Previous: ${c.previousStatus} · ` : ''}
                        Status: {c.category} · Follow-up Date: {fmt(c.nextDate)}
                      </div>
                    </div>
                    <span className="badge badge-followup">Follow-up</span>
                  </div>
                ))}
              </div>
            )}
            {planned.length > 0 && (
              <div className="schedule-section-group">
                <div className="schedule-group-title group-planned">
                  <span className="dot-indicator"></span>
                  PLANNED ACTIVITY ({planned.length})
                </div>
                {planned.map((w) => (
                  <div className="schedule-row schedule-row-planned" key={w.id}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <b>{w.text}</b>
                        <ExpandableText
                          text={w.text}
                          title="Planned Activity Description"
                          subtitle={w.time ? formatTime12h(w.time) : ''}
                          onlyButton={true}
                        />
                      </div>
                      <div className="kicker" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {w.time ? <span>{formatTime12h(w.time)}</span> : null}
                        {w.notes ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            · Note:
                            <ExpandableText
                              text={w.notes}
                              title={`Activity Note — ${w.text}`}
                              subtitle={w.time ? formatTime12h(w.time) : ''}
                            />
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className={'badge ' + (w.status === 'Completed' ? 'done' : 'badge-planned')}>{w.status}</span>
                  </div>
                ))}
              </div>
            )}
            {completed.length > 0 && (
              <div className="schedule-section-group">
                <div className="schedule-group-title group-completed">
                  <span className="dot-indicator"></span>
                  COMPLETED ON THIS DATE ({completed.length})
                </div>
                {completed.map((h) => (
                  <div className="schedule-row schedule-row-completed" key={h.id}>
                    <div>
                      <b>{h.type}</b>
                      <div className="kicker" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        <span>{h.client || h.text || ''}</span>
                        {h.company ? <span>· {h.company}</span> : null}
                        {h.time ? <span>· {formatTime12h(h.time)}</span> : null}
                        {h.notes ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            · Note:
                            <ExpandableText
                              text={h.notes}
                              title={`Completed Record Note — ${h.client || h.text}`}
                              subtitle={h.company}
                            />
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className="badge done">Completed</span>
                  </div>
                ))}
              </div>
            )}
            {none && <div className="empty">No schedule or history for this date.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAccess({ setPage }) {
  return (
    <div className="panel quick-access-glass">
      <div className="head">
        <div>
          <h2>Quick Access</h2>
          <div className="muted">Direct shortcuts to daily operations and records.</div>
        </div>
      </div>
      <div className="today-grid">
        <button className="today-btn quick-btn" onClick={() => setPage('client')}>
          <div className="ico ico-ruby">
            <UserPlus size={20} strokeWidth={2.2} />
          </div>
          <b>Add Client</b>
          <div className="muted">Create client record</div>
          <div className="quick-arrow"><ArrowRight size={13} strokeWidth={2.4} /></div>
        </button>
        <button className="today-btn quick-btn" onClick={() => setPage('work')}>
          <div className="ico ico-flame">
            <CalendarPlus size={20} strokeWidth={2.2} />
          </div>
          <b>Add Work</b>
          <div className="muted">Plan future activity</div>
          <div className="quick-arrow"><ArrowRight size={13} strokeWidth={2.4} /></div>
        </button>
        <button className="today-btn today-main quick-btn" onClick={() => setPage('today')}>
          <div className="ico ico-fire-main">
            <CheckSquare size={22} strokeWidth={2.4} />
          </div>
          <div className="today-main-body">
            <b>Today Work</b>
            <div className="muted">Follow-up, Activity, New Work &amp; Completed</div>
          </div>
          <div className="quick-arrow"><ArrowRight size={14} strokeWidth={2.4} /></div>
        </button>
        <button className="today-btn quick-btn" onClick={() => setPage('clients')}>
          <div className="ico ico-gold">
            <Users size={20} strokeWidth={2.2} />
          </div>
          <b>All Clients</b>
          <div className="muted">View full client list</div>
          <div className="quick-arrow"><ArrowRight size={13} strokeWidth={2.4} /></div>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ db, setPage }) {
  return (
    <section className="page active">
      <Cards db={db} setPage={setPage} />
      <QuickAccess setPage={setPage} />
      <ScheduleHistory db={db} />
    </section>
  );
}
