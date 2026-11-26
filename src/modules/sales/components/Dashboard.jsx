import React, { useState, useEffect } from 'react';
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
  Briefcase,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  ListTodo,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  EnterpriseCard,
  StatusBadge,
  ActionButton,
} from '../../../components/EnterpriseUI.jsx';

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

  return <span>{display}</span>;
}

export default function Dashboard({ db, setPage }) {
  const d = today();
  const followUpDueCount = (db.clients || []).filter((c) => c.nextDate && c.nextDate <= d).length;
  const plannedCount = (db.work || []).filter((w) => w.date === d && w.status === 'Pending').length;
  const newWorkCount = (db.newWork || []).filter((w) => w.date === d && w.status === 'Pending').length;
  const totalClients = (db.clients || []).length;

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

  // Selected date for schedule history
  const [selectedDate, setSelectedDate] = useState(d);
  const curDate = selectedDate || d;
  const isDateToday = curDate === d;

  const plannedForDate = (db.work || []).filter((w) => w.date === curDate);
  const followForDate = (db.clients || []).filter((c) =>
    c.nextDate && (isDateToday ? c.nextDate <= curDate : c.nextDate === curDate)
  );
  const completedForDate = (db.history || []).filter((h) => h.date === curDate);
  const isHistoryEmpty = !followForDate.length && !plannedForDate.length && !completedForDate.length;

  return (
    <div className="sales-enterprise-dashboard" style={{ padding: '0 4px' }}>
      {/* 1. Modern Enterprise Page Header */}
      <PageHeader
        badge="Enterprise Sales CRM"
        badgeColor="blue"
        title="Sales & CRM Command Center"
        subtitle="Real-time corporate client pipeline, automated follow-up scheduling, and daily activity dispatch for EPI UPS Bangladesh Limited."
        actions={
          <>
            <ActionButton
              variant="secondary"
              icon={CheckSquare}
              size="md"
              onClick={() => setPage('today')}
              title="View all activities scheduled for today"
            >
              Today's Work ({activeCount + followUpDueCount})
            </ActionButton>

            <ActionButton
              variant="primary"
              icon={UserPlus}
              size="md"
              onClick={() => setPage('client')}
              title="Register a new corporate client account"
            >
              + Add Client
            </ActionButton>
          </>
        }
      />

      {/* 2. Top KPI Metric Cards (4 Modern Stat Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          title="Follow-up Due"
          value={<AnimatedCounter value={followUpDueCount} />}
          subtitle="Client follow-up due on or before today"
          icon={Clock}
          color="red"
          trend="Action Required"
          trendType="down"
          onClick={() => setPage('today')}
        />

        <StatCard
          title="Planned Activity"
          value={<AnimatedCounter value={plannedCount} />}
          subtitle="Assigned tasks for today"
          icon={Calendar}
          color="blue"
          trend="Scheduled"
          trendType="neutral"
          onClick={() => setPage('today')}
        />

        <StatCard
          title="New Work Pipeline"
          value={<AnimatedCounter value={newWorkCount} />}
          subtitle="Pending new client assignments"
          icon={PlusCircle}
          color="amber"
          trend="Incoming"
          trendType="up"
          onClick={() => setPage('today')}
        />

        <StatCard
          title="Total Clients"
          value={<AnimatedCounter value={totalClients} />}
          subtitle="Registered corporate accounts"
          icon={Users}
          color="purple"
          trend="Directory"
          trendType="up"
          onClick={() => setPage('clients')}
        />
      </div>

      {/* 3. Operational Dispatch Status Bar (Active / Upcoming / Overdue) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {/* Active Work Card */}
        <div
          onClick={() => setPage('today')}
          style={{
            cursor: 'pointer',
            padding: '16px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(14, 22, 42, 0.72) 0%, rgba(9, 14, 28, 0.68) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
          className="hover:border-sky-400"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Active Work
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: 2 }}>
                <AnimatedCounter value={activeCount} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#38bdf8', fontWeight: 650 }}>
            <span>View Tasks</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Upcoming Work Card */}
        <div
          onClick={() => setPage('today')}
          style={{
            cursor: 'pointer',
            padding: '16px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(14, 22, 42, 0.72) 0%, rgba(9, 14, 28, 0.68) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hourglass size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Upcoming Schedule
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: 2 }}>
                <AnimatedCounter value={upcomingCount} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#fbbf24', fontWeight: 650 }}>
            <span>View Upcoming</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Overdue Work Card */}
        <div
          onClick={() => setPage('today')}
          style={{
            cursor: 'pointer',
            padding: '16px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(14, 22, 42, 0.72) 0%, rgba(9, 14, 28, 0.68) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Overdue Attention
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f87171', lineHeight: 1.1, marginTop: 2 }}>
                <AnimatedCounter value={overdueCount} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f87171', fontWeight: 650 }}>
            <span>Resolve Now</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* 4. Main Two-Column Operational Hub */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Left Column: Interactive Schedule & History Timeline */}
        <EnterpriseCard
          title="Schedule & Engagement Timeline"
          subtitle="Audit past interactions and future scheduled engagements for any selected date"
          icon={CalendarDays}
          badge={fmt(curDate)}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  background: 'rgba(14, 22, 40, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 7,
                  color: '#ffffff',
                  padding: '4px 8px',
                  fontSize: 12,
                }}
              />
              {!isDateToday && (
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedDate(d)}
                >
                  Reset Today
                </ActionButton>
              )}
            </div>
          }
        >
          <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {/* Follow-up Group */}
            {followForDate.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    color: '#f87171',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                  <span>Client Follow-Ups Due ({followForDate.length})</span>
                </div>
                {followForDate.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 6,
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.18)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: '#ffffff' }}>{c.name}</strong>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                        {c.company ? `${c.company} · ` : ''}
                        Status: <strong style={{ color: '#cbd5e1' }}>{c.category}</strong> · Due:{' '}
                        {fmt(c.nextDate)}
                      </div>
                    </div>
                    <StatusBadge status="warning" label="Follow-up" size="sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Planned Activity Group */}
            {plannedForDate.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    color: '#38bdf8',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                  <span>Planned Activities ({plannedForDate.length})</span>
                </div>
                {plannedForDate.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 6,
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.18)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 13, color: '#ffffff' }}>{w.text}</strong>
                        <ExpandableText
                          text={w.text}
                          title="Planned Activity Description"
                          subtitle={w.time ? formatTime12h(w.time) : ''}
                          onlyButton={true}
                        />
                      </div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                        {w.time ? <span>{formatTime12h(w.time)} · </span> : null}
                        {w.notes ? <span>Note: {w.notes.slice(0, 40)}...</span> : null}
                      </div>
                    </div>
                    <StatusBadge status={w.status} size="sm" />
                  </div>
                ))}
              </div>
            )}

            {/* Completed Group */}
            {completedForDate.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    color: '#34d399',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  <span>Completed on Date ({completedForDate.length})</span>
                </div>
                {completedForDate.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 6,
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.18)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: '#ffffff' }}>{h.type}</strong>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                        {h.client || h.text || ''}
                        {h.company ? ` · ${h.company}` : ''}
                        {h.time ? ` · ${formatTime12h(h.time)}` : ''}
                      </div>
                    </div>
                    <StatusBadge status="completed" label="Completed" variant="success" size="sm" />
                  </div>
                ))}
              </div>
            )}

            {isHistoryEmpty && (
              <div style={{ padding: '36px 0', textAlign: 'center', color: '#64748b', fontSize: 12.5 }}>
                No scheduled activities or engagement records for this date.
              </div>
            )}
          </div>
        </EnterpriseCard>

        {/* Right Column: Quick Access & Operational Short-cuts */}
        <EnterpriseCard
          title="Quick Operations & Directory Hub"
          subtitle="Instant shortcuts to critical daily sales workflows and corporate records"
          icon={ListTodo}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            {/* Add Client Card */}
            <div
              onClick={() => setPage('client')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserPlus size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 13.5, color: '#ffffff' }}>Add Client</strong>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                  Register new corporate client account
                </p>
              </div>
            </div>

            {/* Add Work Card */}
            <div
              onClick={() => setPage('work')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarPlus size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 13.5, color: '#ffffff' }}>Add Work</strong>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                  Plan future meeting or proposal task
                </p>
              </div>
            </div>

            {/* Today's Work Center Card */}
            <div
              onClick={() => setPage('today')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckSquare size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 13.5, color: '#ffffff' }}>Today Work</strong>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                  Execute daily follow-ups & visits
                </p>
              </div>
            </div>

            {/* Corporate Directory Card */}
            <div
              onClick={() => setPage('clients')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(168, 85, 247, 0.06)',
                border: '1px solid rgba(168, 85, 247, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <strong style={{ fontSize: 13.5, color: '#ffffff' }}>Clients Master</strong>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                  Search full corporate client base
                </p>
              </div>
            </div>
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
}
