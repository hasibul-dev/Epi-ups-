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

const SUBNAV_TABS = [
  // Digital Marketing (5 focused modules)
  { id: 'overview', label: 'Marketing Dashboard', path: '/marketing', icon: LayoutDashboard },
  { id: 'tasks', label: 'Work / Task Management', path: '/marketing/tasks', icon: CheckSquare },
  { id: 'social', label: 'Content & Social Posts', path: '/marketing/social', icon: Share2 },
  { id: 'campaigns', label: 'Campaign Management', path: '/marketing/campaigns', icon: Target, badgeKey: 'activeCampaigns' },
  { id: 'mkt_rep', label: 'Marketing Reports', path: '/marketing/marketing-reports', icon: FileText },

  // IT Support (5 focused modules)
  { id: 'it_dash', label: 'IT Support Dashboard', path: '/marketing/it-dashboard', icon: Activity },
  { id: 'tickets', label: 'IT Work Management', path: '/marketing/tickets', icon: Ticket, badgeKey: 'openTickets' },
  { id: 'devices', label: 'Basic Device Management', path: '/marketing/devices', icon: Laptop },
  { id: 'it_hist', label: 'IT Work History', path: '/marketing/it-history', icon: History },
  { id: 'it_rep', label: 'IT Reports', path: '/marketing/it-reports', icon: FileCheck },
];

function MarketingItInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, openTicketModal } = useMarketing();

  const rawSlug = location.pathname.replace(/^\/marketing\/?/, '').split('/')[0] || '';
  const currentTab = ROUTE_MAP[rawSlug] || 'overview';

  const badgeCounts = {
    activeCampaigns: data.campaigns.filter((c) => c.status === 'Active').length,
    openTickets: data.tickets.filter((t) => ['Open', 'In Progress'].includes(t.status)).length,
  };

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
      {/* Sleek Enterprise Horizontal Navigation Bar matching EPI Layout */}
      <div className="mkt-subnav-container">
        <div className="mkt-subnav-scroll flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {SUBNAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              const badge = tab.badgeKey ? badgeCounts[tab.badgeKey] : null;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`mkt-subnav-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {badge > 0 && (
                    <span className="mkt-subnav-badge">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => openTicketModal()}
            className="mkt-subnav-btn flex items-center gap-1.5 shrink-0"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              marginLeft: 8,
            }}
            title="Create new IT Support Ticket"
          >
            <Plus size={13} />
            <span>+ Add IT Ticket</span>
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
