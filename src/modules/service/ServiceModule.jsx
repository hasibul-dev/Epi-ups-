import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const ROUTE_TO_PAGE = {
  '': 'dashboard',
  dashboard: 'dashboard',
  today: 'today',
  upcoming: 'upcoming',
  calendar: 'calendar',
  clients: 'clients',
  'sales-clients': 'clients',
  servicing: 'servicing',
  maintenance: 'maintenance',
  installation: 'installation',
  general: 'general',
  warranty: 'warranty',
  new: 'new',
  'new-order': 'new',
  history: 'history',
  reports: 'srep',
  srep: 'srep',
  settings: 'settings',
};

const PAGE_TO_ROUTE = {
  dashboard: '/service',
  today: '/service/today',
  upcoming: '/service/upcoming',
  calendar: '/service/calendar',
  clients: '/service/clients',
  servicing: '/service/servicing',
  maintenance: '/service/maintenance',
  installation: '/service/installation',
  general: '/service/general',
  warranty: '/service/warranty',
  new: '/service/new-order',
  history: '/service/history',
  srep: '/service/reports',
  settings: '/service/settings',
};

function ServiceShell({ initialPage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportPreset, setReportPreset] = useState({ clientId: '', reportType: '' });
  const { s, addWork, addClient } = useApp();
  const { user } = useAuth();

  // Synchronize active page directly from React Router URL location
  const rawSlug = location.pathname.replace(/^\/service\/?/, '').split('/')[0] || '';
  const page = ROUTE_TO_PAGE[rawSlug] || initialPage || 'dashboard';

  const go = (nextPage) => {
    setReportPreset({ clientId: '', reportType: '' });
    const targetRoute = PAGE_TO_ROUTE[nextPage] || `/service/${nextPage}`;
    navigate(targetRoute);
  };

  const openClientReport = (clientIdOrCategory, category = 'Sales') => {
    const map = {
      Sales: 'sales',
      Servicing: 'servicing',
      Maintenance: 'maintenance',
      Installation: 'installation',
      General: 'general',
    };

    if (
      typeof clientIdOrCategory === 'string' &&
      ['Sales', 'Servicing', 'Maintenance', 'Installation', 'General'].includes(clientIdOrCategory)
    ) {
      setReportPreset({ clientId: '', reportType: map[clientIdOrCategory] || '' });
      navigate('/service/reports');
      return;
    }

    setReportPreset({ clientId: clientIdOrCategory, reportType: map[category] || 'sales' });
    navigate('/service/reports');
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

  // Context-aware Add Work category based on current page
  const getContextualCategory = () => {
    if (page === 'installation') return 'Installation';
    if (page === 'general') return 'General';
    if (page === 'maintenance') return 'Maintenance';
    if (page === 'servicing') return 'Servicing';
    return 'Servicing';
  };

  // Context-aware Add Client type based on current page
  const getContextualClientType = () => {
    if (page === 'servicing') return 'Servicing';
    if (page === 'maintenance') return 'Maintenance';
    return 'Sales';
  };

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
            onClick={() => addWork(TODAY(), getContextualCategory())}
            className="btn btn-primary-highlight sm"
            style={{ padding: '5px 11px', fontSize: 11.5 }}
            title={`Add new ${getContextualCategory()} work order`}
          >
            <PlusCircle size={13} />
            <span>+ Add Work</span>
          </button>
          <button
            type="button"
            onClick={() => addClient(getContextualClientType())}
            className="btn btn-secondary sm"
            style={{ padding: '5px 11px', fontSize: 11.5 }}
            title={`Register new ${getContextualClientType()} client`}
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

