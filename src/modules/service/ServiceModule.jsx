import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { fmt, TODAY } from './services/dates.js';
import Dashboard from './pages/Dashboard.jsx';
import TodayWork from './pages/TodayWork.jsx';
import UpcomingWork from './pages/UpcomingWork.jsx';
import Clients from './pages/Clients.jsx';
import SectorWorkPage from './pages/SectorWorkPage.jsx';
import Warranty from './pages/Warranty.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import NewWork from './pages/NewWork.jsx';
import History from './pages/History.jsx';
import Report from './pages/Report.jsx';
import Settings from './pages/Settings.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  Briefcase,
  Wrench,
  Settings2,
  Zap,
  ClipboardList,
  ShieldCheck,
  Calendar,
  PlusCircle,
  History as HistoryIcon,
  FileText,
  Sliders,
  Download
} from 'lucide-react';

function ServiceShell({ initialPage = 'dashboard' }) {
  const [page, setPage] = useState(initialPage);
  const [reportPreset, setReportPreset] = useState({ clientId: '', reportType: '' });
  const { s } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    if (initialPage) {
      setPage(initialPage);
    }
  }, [initialPage]);

  const go = (nextPage) => {
    setReportPreset({ clientId: '', reportType: '' });
    setPage(nextPage);
  };

  const openClientReport = (clientIdOrCategory, category = 'Sales') => {
    if (
      typeof clientIdOrCategory === 'string' &&
      ['Sales', 'Servicing', 'Maintenance', 'Installation', 'General'].includes(clientIdOrCategory)
    ) {
      const map = {
        Sales: 'sales',
        Servicing: 'servicing',
        Maintenance: 'maintenance',
        Installation: 'installation',
        General: 'general',
      };
      setReportPreset({ clientId: '', reportType: map[clientIdOrCategory] || '' });
      setPage('srep');
      return;
    }

    const map = {
      Sales: 'sales',
      Servicing: 'servicing',
      Maintenance: 'maintenance',
      Installation: 'installation',
      General: 'general',
    };
    setReportPreset({ clientId: clientIdOrCategory, reportType: map[category] || 'sales' });
    setPage('srep');
  };

  const pages = {
    dashboard: <Dashboard go={go} />,
    today: <TodayWork />,
    upcoming: <UpcomingWork />,
    clients: <Clients category="Sales" onPrintClient={openClientReport} />,
    servicing: <Clients category="Servicing" onPrintClient={openClientReport} />,
    maintenance: <Clients category="Maintenance" onPrintClient={openClientReport} />,
    installation: <SectorWorkPage category="Installation" onPrintReport={openClientReport} />,
    general: <SectorWorkPage category="General" onPrintReport={openClientReport} />,
    warranty: <Warranty />,
    calendar: <CalendarPage />,
    new: <NewWork />,
    history: <History onPrintClient={openClientReport} />,
    srep: (
      <Report
        preselectClientId={reportPreset.clientId}
        preselectReport={reportPreset.reportType}
      />
    ),
    settings: <Settings />,
  };

  const T = TODAY();
  const todayPendingCount = (s.works || []).filter(
    (w) => (w.date === T && w.status === 'pending') || (w.date < T && w.status === 'pending')
  ).length;
  const upcomingPendingCount = (s.works || []).filter((w) => w.date > T && w.status === 'pending').length;

  const quickNav = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'today', label: 'Today Work', icon: CalendarCheck, count: todayPendingCount },
    { key: 'upcoming', label: 'Upcoming', icon: CalendarClock, count: upcomingPendingCount },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'clients', label: 'Sales Clients', icon: Briefcase },
    { key: 'servicing', label: 'Servicing', icon: Wrench },
    { key: 'maintenance', label: 'Maintenance', icon: Settings2 },
    { key: 'installation', label: 'Installation', icon: Zap },
    { key: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { key: 'new', label: 'Add Work Order', icon: PlusCircle },
    { key: 'history', label: 'Work History', icon: HistoryIcon },
    { key: 'srep', label: 'Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="service-module-root" style={{ padding: '20px 24px' }}>
      {/* Sub-Header Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {quickNav.map((btn) => {
            const Icon = btn.icon;
            const active = page === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => go(btn.key)}
                className={`btn ${active ? 'btn-primary-highlight' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#34d399' : '#94a3b8',
                }}
              >
                <Icon size={14} />
                <span>{btn.label}</span>
                {btn.count > 0 && (
                  <span style={{ background: '#e5192d', color: '#fff', padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                    {btn.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Page Rendering */}
      <div className="service-content-body">
        {pages[page] || pages.dashboard}
      </div>
    </div>
  );
}

export default function ServiceModule({ initialPage }) {
  return (
    <AppProvider>
      <ServiceShell initialPage={initialPage} />
    </AppProvider>
  );
}

