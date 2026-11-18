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
  const { s, addWork, addClient } = useApp();
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
    { key: 'general', label: 'General Work', icon: ClipboardList },
    { key: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { key: 'new', label: 'Add Work Order', icon: PlusCircle },
    { key: 'history', label: 'Work History', icon: HistoryIcon },
    { key: 'srep', label: 'Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Sliders },
  ];

  const exportServiceBackup = () => {
    const backup = {
      system: 'EPI Service Department',
      exportedAt: new Date().toISOString(),
      clients: s.clients || [],
      works: s.works || [],
      settings: s.settings || {},
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EPI-Service-Backup-${TODAY()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="service-module-root">
      {/* Sub-Header Navigation Tabs & Actions */}
      <div className="dept-subnav-bar">
        <div className="dept-subnav-tabs">
          {quickNav.map((btn) => {
            const Icon = btn.icon;
            const active = page === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => go(btn.key)}
                className={`dept-subnav-btn ${active ? 'active-service' : ''}`}
              >
                <Icon size={13} />
                <span>{btn.label}</span>
                {btn.count > 0 && (
                  <span className="dept-subnav-badge">
                    {btn.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="dept-subnav-actions">
          <button
            type="button"
            onClick={() => addWork(TODAY(), 'Servicing')}
            className="btn btn-primary-highlight sm"
            style={{ padding: '5px 11px', fontSize: 11.5 }}
          >
            <PlusCircle size={13} />
            <span>+ Add Work</span>
          </button>
          <button
            type="button"
            onClick={() => addClient('Sales')}
            className="btn btn-secondary sm"
            style={{ padding: '5px 11px', fontSize: 11.5 }}
          >
            <Briefcase size={13} />
            <span>+ Add Client</span>
          </button>
          <button
            type="button"
            onClick={exportServiceBackup}
            className="btn btn-secondary sm"
            title="Download Service Database Backup (JSON)"
            style={{ padding: '5px 11px', fontSize: 11.5 }}
          >
            <Download size={13} />
            <span>Backup</span>
          </button>
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

