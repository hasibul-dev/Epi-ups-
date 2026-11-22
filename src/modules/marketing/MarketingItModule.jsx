import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MarketingProvider, useMarketing } from './context/MarketingContext.jsx';

// Pages
import CombinedDashboard from './pages/CombinedDashboard.jsx';
import MarketingDashboard from './pages/MarketingDashboard.jsx';
import CampaignsPage from './pages/CampaignsPage.jsx';
import ContentCalendarPage from './pages/ContentCalendarPage.jsx';
import SocialMediaPage from './pages/SocialMediaPage.jsx';
import AdsManagementPage from './pages/AdsManagementPage.jsx';
import AssetLibraryPage from './pages/AssetLibraryPage.jsx';
import CreativeRequestsPage from './pages/CreativeRequestsPage.jsx';
import MarketingTasksPage from './pages/MarketingTasksPage.jsx';
import MarketingReportsPage from './pages/MarketingReportsPage.jsx';
import ItDashboard from './pages/ItDashboard.jsx';
import ItTicketsPage from './pages/ItTicketsPage.jsx';
import ItHistoryPage from './pages/ItHistoryPage.jsx';
import DeviceInventoryPage from './pages/DeviceInventoryPage.jsx';
import SoftwareAccountsPage from './pages/SoftwareAccountsPage.jsx';
import NetworkMaintenancePage from './pages/NetworkMaintenancePage.jsx';
import ItReportsPage from './pages/ItReportsPage.jsx';

// Modals
import CampaignModal from './components/CampaignModal.jsx';
import PostModal from './components/PostModal.jsx';
import AdModal from './components/AdModal.jsx';
import AssetModal from './components/AssetModal.jsx';
import CreativeModal from './components/CreativeModal.jsx';
import TaskModal from './components/TaskModal.jsx';
import TicketModal from './components/TicketModal.jsx';
import DeviceModal from './components/DeviceModal.jsx';
import TicketDetailsModal from './components/TicketDetailsModal.jsx';

import {
  LayoutDashboard,
  Megaphone,
  Target,
  Calendar,
  Share2,
  DollarSign,
  FolderArchive,
  Palette,
  CheckSquare,
  FileText,
  Activity,
  Ticket,
  Laptop,
  ShieldCheck,
  Network,
  FileCheck,
  History,
  Plus,
  Download,
} from 'lucide-react';

const ROUTE_MAP = {
  '': 'overview',
  'marketing-dashboard': 'overview',
  dashboard: 'overview',
  tasks: 'tasks',
  social: 'social',
  posts: 'social',
  calendar: 'calendar',
  campaigns: 'campaigns',
  'marketing-reports': 'mkt_rep',
  'it-dashboard': 'it_dash',
  tickets: 'tickets',
  devices: 'devices',
  'it-history': 'it_hist',
  history: 'it_hist',
  'it-reports': 'it_rep',
  ads: 'ads',
  assets: 'assets',
  'creative-requests': 'creatives',
  software: 'software',
  maintenance: 'maintenance',
};

function MarketingItInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, openTaskModal, openTicketModal, exportBackup } = useMarketing();

  const rawSlug = location.pathname.replace(/^\/marketing\/?/, '').split('/')[0] || '';
  const currentTab = ROUTE_MAP[rawSlug] || 'overview';

  const pendingTasksCount = (data.tasks || []).filter(
    (t) => t.status !== 'Done' && t.status !== 'Completed'
  ).length;

  const navButtons = [
    {
      key: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/marketing',
    },
    {
      key: 'tasks',
      label: 'Work / Task Management',
      icon: CheckSquare,
      path: '/marketing/tasks',
      count: pendingTasksCount,
    },
    {
      key: 'addWork',
      label: '+ Add Work',
      icon: Plus,
      highlight: true,
      action: () => openTaskModal(),
    },
    {
      key: 'addTicket',
      label: '+ Add IT Ticket',
      icon: Ticket,
      action: () => openTicketModal(),
    },
  ];

  // Render current active page
  const renderPage = () => {
    switch (currentTab) {
      case 'overview':
        return <CombinedDashboard />;
      case 'mkt_dash':
        return <MarketingDashboard />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'calendar':
        return <ContentCalendarPage />;
      case 'social':
        return <SocialMediaPage />;
      case 'ads':
        return <AdsManagementPage />;
      case 'assets':
        return <AssetLibraryPage />;
      case 'creatives':
        return <CreativeRequestsPage />;
      case 'tasks':
        return <MarketingTasksPage />;
      case 'mkt_rep':
        return <MarketingReportsPage />;
      case 'it_dash':
        return <ItDashboard />;
      case 'tickets':
        return <ItTicketsPage />;
      case 'devices':
        return <DeviceInventoryPage />;
      case 'it_hist':
        return <ItHistoryPage />;
      case 'software':
        return <SoftwareAccountsPage />;
      case 'maintenance':
        return <NetworkMaintenancePage />;
      case 'it_rep':
        return <ItReportsPage />;
      default:
        return <CombinedDashboard />;
    }
  };

  return (
    <div className="marketing-module-wrapper space-y-4">
      {/* Sub-Header Navigation Tabs & Actions matching EPI Standard */}
      <div className="dept-subnav-bar">
        <div className="dept-subnav-tabs">
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            const active =
              (btn.key === 'overview' && currentTab === 'overview') ||
              (btn.key === 'tasks' && currentTab === 'tasks');

            return (
              <button
                key={btn.key}
                type="button"
                onClick={btn.action ? btn.action : () => navigate(btn.path)}
                className={`dept-subnav-btn ${active ? 'active-marketing' : ''}`}
                style={
                  btn.highlight
                    ? {
                        borderColor: 'rgba(168, 85, 247, 0.4)',
                        background: 'rgba(168, 85, 247, 0.1)',
                        color: '#f3e8ff',
                        fontWeight: 700,
                      }
                    : btn.key === 'addTicket'
                    ? {
                        borderColor: 'rgba(245, 158, 11, 0.35)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#fef3c7',
                        fontWeight: 700,
                      }
                    : undefined
                }
              >
                <Icon size={14} />
                <span>{btn.label}</span>
                {btn.count > 0 && (
                  <span className="dept-subnav-badge" style={{ background: '#a855f7' }}>
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
            onClick={exportBackup}
            className="btn btn-secondary"
            title="Download Marketing & IT Support Database Backup (JSON)"
            style={{
              padding: '8px 16px',
              fontSize: 13,
              minHeight: 38,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 8,
              color: '#cbd5e1',
            }}
          >
            <Download size={14} />
            <span>Backup</span>
          </button>
        </div>
      </div>

      {/* Main Active Page Content */}
      <main className="marketing-page-content">
        {renderPage()}
      </main>

      {/* Modals */}
      <CampaignModal />
      <PostModal />
      <AdModal />
      <AssetModal />
      <CreativeModal />
      <TaskModal />
      <TicketModal />
      <DeviceModal />
      <TicketDetailsModal />
    </div>
  );
}

export default function MarketingItModule() {
  return (
    <MarketingProvider>
      <MarketingItInner />
    </MarketingProvider>
  );
}
