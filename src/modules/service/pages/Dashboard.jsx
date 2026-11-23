import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import WorkTable from '../components/WorkTable.jsx';
import { clientType, isOverdue, isUpcomingSoon, warr } from '../services/domain.js';
import { TODAY } from '../services/dates.js';
import {
  Users,
  UserPlus,
  CalendarPlus,
  Zap,
  Wrench,
  Settings2,
  ClipboardList,
  History,
  FileText,
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  EnterpriseCard,
  StatusBadge,
  ActionButton,
} from '../../../components/EnterpriseUI.jsx';

export default function Dashboard({ go }) {
  const { s, addWork, addClient } = useApp();
  const T = TODAY();
  const today = (s.works || []).filter((w) => w.date === T);
  const completedToday = today.filter((w) => w.status === 'done');
  const overdue = (s.works || []).filter((w) => isOverdue(w));
  const upcoming = (s.works || []).filter((w) => isUpcomingSoon(w, 2));

  const salesClients = (s.clients || []).filter((c) => clientType(c) === 'Sales');
  const servicingClients = (s.clients || []).filter((c) => clientType(c) === 'Servicing');
  const maintenanceClients = (s.clients || []).filter((c) => clientType(c) === 'Maintenance');
  const installationWorks = (s.works || []).filter((w) => w.category === 'Installation');
  const generalWorks = (s.works || []).filter((w) => w.category === 'General');
  const expiring = salesClients.filter((c) => warr(c).active && warr(c).left <= 30).length;

  return (
    <div className="service-enterprise-dashboard" style={{ padding: '0 4px' }}>
      {/* 1. Modern Enterprise Page Header */}
      <PageHeader
        badge="Service Operations Root"
        badgeColor="green"
        title="Service & Engineering Command Center"
        subtitle="Industrial UPS installation, preventive maintenance contracts, repair work orders, and field dispatch for EPI UPS Bangladesh Limited."
        actions={
          <>
            <ActionButton
              variant="secondary"
              icon={Zap}
              size="md"
              onClick={() => addWork(T, 'Installation')}
              title="Schedule a new equipment installation"
            >
              + Installation
            </ActionButton>

            <ActionButton
              variant="secondary"
              icon={CalendarPlus}
              size="md"
              onClick={() => addWork(T)}
              title="Manually schedule a new work task"
            >
              + Add Work
            </ActionButton>

            <ActionButton
              variant="primary"
              icon={UserPlus}
              size="md"
              onClick={() => addClient('Sales')}
              title="Register a new client or maintenance contract"
            >
              + Add Client
            </ActionButton>
          </>
        }
      />

      {/* 2. Key Metrics Stat Cards Grid (7 Modern Stat Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          title="Scheduled Today"
          value={today.length}
          subtitle="Tasks assigned for today"
          icon={CalendarCheck}
          color="blue"
          onClick={() => go('today')}
        />

        <StatCard
          title="Completed Today"
          value={completedToday.length}
          subtitle="Finished work orders"
          icon={CheckCircle2}
          color="green"
          trend={`${completedToday.length} Done`}
          trendType="up"
          onClick={() => go('today')}
        />

        <StatCard
          title="Upcoming (Next 2D)"
          value={upcoming.length}
          subtitle="Due within 48 hours"
          icon={CalendarClock}
          color="cyan"
          onClick={() => go('upcoming')}
        />

        <StatCard
          title="Overdue Tasks"
          value={overdue.length}
          subtitle="Passed scheduled deadline"
          icon={AlertTriangle}
          color="red"
          trend={overdue.length > 0 ? 'Urgent Action' : 'All Clear'}
          trendType={overdue.length > 0 ? 'down' : 'up'}
          onClick={() => go('today')}
        />

        <StatCard
          title="Installations"
          value={installationWorks.length}
          subtitle="Commissioning jobs"
          icon={Zap}
          color="amber"
          onClick={() => go('installation')}
        />

        <StatCard
          title="Sales Clients"
          value={salesClients.length}
          subtitle="Commercial directory"
          icon={Users}
          color="purple"
          onClick={() => go('clients')}
        />

        <StatCard
          title="Warranty ≤30D"
          value={expiring}
          subtitle="Expiring coverage soon"
          icon={ShieldCheck}
          color={expiring > 0 ? 'red' : 'green'}
          trend={expiring > 0 ? 'Renewal Notice' : 'Protected'}
          trendType={expiring > 0 ? 'down' : 'up'}
          onClick={() => go('warranty')}
        />
      </div>

      {/* 3. Five Industrial Sectors Command Hub */}
      <EnterpriseCard
        title="Industrial Sectors & Service Routing"
        subtitle="Partitioned engineering work orders across all 5 operational industrial sectors"
        icon={Sparkles}
        badge="5 Sectors"
        style={{ marginBottom: 20 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {/* Servicing Sector */}
          <div
            onClick={() => go('servicing')}
            style={{
              cursor: 'pointer',
              padding: '14px',
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(245, 158, 11, 0.16)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wrench size={17} />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: '#ffffff' }}>Servicing</strong>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {servicingClients.length} Accounts
                </div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#fbbf24' }} />
          </div>

          {/* Maintenance Sector */}
          <div
            onClick={() => go('maintenance')}
            style={{
              cursor: 'pointer',
              padding: '14px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.16)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Settings2 size={17} />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: '#ffffff' }}>Maintenance</strong>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {maintenanceClients.length} Accounts
                </div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#34d399' }} />
          </div>

          {/* Installation Sector */}
          <div
            onClick={() => go('installation')}
            style={{
              cursor: 'pointer',
              padding: '14px',
              borderRadius: 12,
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.16)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={17} />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: '#ffffff' }}>Installation</strong>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {installationWorks.length} Work Orders
                </div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#38bdf8' }} />
          </div>

          {/* General Engineering */}
          <div
            onClick={() => go('general')}
            style={{
              cursor: 'pointer',
              padding: '14px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClipboardList size={17} />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: '#ffffff' }}>General Work</strong>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {generalWorks.length} Tasks
                </div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#cbd5e1' }} />
          </div>

          {/* Complete Work History */}
          <div
            onClick={() => go('history')}
            style={{
              cursor: 'pointer',
              padding: '14px',
              borderRadius: 12,
              background: 'rgba(168, 85, 247, 0.06)',
              border: '1px solid rgba(168, 85, 247, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(168, 85, 247, 0.16)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History size={17} />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: '#ffffff' }}>Work History</strong>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>All Archive Records</div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#c084fc' }} />
          </div>
        </div>
      </EnterpriseCard>

      {/* 4. Overdue Work Alert Banner (if any overdue) */}
      {overdue.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 750, color: '#fca5a5', margin: 0 }}>
                  Overdue Work Orders & Maintenance ({overdue.length})
                </h3>
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                  Tasks whose target completion date passed without sign-off
                </span>
              </div>
            </div>
            <ActionButton
              variant="danger"
              size="sm"
              icon={ArrowRight}
              onClick={() => go('today')}
            >
              Manage Overdue
            </ActionButton>
          </div>
          <WorkTable list={overdue} />
        </div>
      )}

      {/* 5. Two-Column Dispatch: Today Work & Upcoming Work */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Today's Work Column */}
        <EnterpriseCard
          title="Today's Work Orders"
          subtitle={`${today.length} task${today.length === 1 ? '' : 's'} scheduled for today`}
          icon={CalendarCheck}
          badge={`${today.length} Orders`}
          actions={
            <div style={{ display: 'flex', gap: 8 }}>
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => go('today')}
              >
                View All
              </ActionButton>
              <ActionButton
                variant="primary"
                size="sm"
                onClick={() => addWork(T)}
              >
                + Add Work
              </ActionButton>
            </div>
          }
        >
          <WorkTable list={today} empty="Nothing scheduled today 🎉" />
        </EnterpriseCard>

        {/* Upcoming Work Orders Column */}
        <EnterpriseCard
          title="Upcoming Work (Next 2 Days)"
          subtitle={`${upcoming.length} task${upcoming.length === 1 ? '' : 's'} due within 48h`}
          icon={CalendarClock}
          badge={`${upcoming.length} Pending`}
          actions={
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={() => go('upcoming')}
            >
              View All
            </ActionButton>
          }
        >
          <WorkTable list={upcoming} empty="No upcoming work in the next 2 days." />
        </EnterpriseCard>
      </div>
    </div>
  );
}
