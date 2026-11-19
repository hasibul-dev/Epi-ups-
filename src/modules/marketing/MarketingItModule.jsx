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
} from 'lucide-react';

const ROUTE_MAP = {
  '': 'overview',
  'marketing-dashboard': 'mkt_dash',
  campaigns: 'campaigns',
  calendar: 'calendar',
  social: 'social',
  ads: 'ads',
  assets: 'assets',
  'creative-requests': 'creatives',
  tasks: 'tasks',
  'marketing-reports': 'mkt_rep',
  'it-dashboard': 'it_dash',
  tickets: 'tickets',
  devices: 'devices',
  software: 'software',
  maintenance: 'maintenance',
  'it-reports': 'it_rep',
};

const SUBNAV_TABS = [
  { id: 'overview', label: 'Overview', path: '/marketing', icon: LayoutDashboard },
  { id: 'mkt_dash', label: 'Marketing KPIs', path: '/marketing/marketing-dashboard', icon: Megaphone },
  { id: 'campaigns', label: 'Campaigns', path: '/marketing/campaigns', icon: Target, badgeKey: 'activeCampaigns' },
  { id: 'calendar', label: 'Content Calendar', path: '/marketing/calendar', icon: Calendar },
  { id: 'social', label: 'FB & LinkedIn', path: '/marketing/social', icon: Share2 },
  { id: 'ads', label: 'Paid Ads', path: '/marketing/ads', icon: DollarSign },
  { id: 'assets', label: 'Asset Library', path: '/marketing/assets', icon: FolderArchive },
  { id: 'creatives', label: 'Design Requests', path: '/marketing/creative-requests', icon: Palette },
  { id: 'tasks', label: 'Tasks', path: '/marketing/tasks', icon: CheckSquare },
  { id: 'mkt_rep', label: 'Marketing Reports', path: '/marketing/marketing-reports', icon: FileText },
  { id: 'it_dash', label: 'IT Dashboard', path: '/marketing/it-dashboard', icon: Activity },
  { id: 'tickets', label: 'IT Tickets', path: '/marketing/tickets', icon: Ticket, badgeKey: 'openTickets' },
  { id: 'devices', label: 'Hardware Assets', path: '/marketing/devices', icon: Laptop },
  { id: 'software', label: 'Software Licenses', path: '/marketing/software', icon: ShieldCheck },
  { id: 'maintenance', label: 'Maintenance & ISP', path: '/marketing/maintenance', icon: Network },
  { id: 'it_rep', label: 'IT Reports', path: '/marketing/it-reports', icon: FileCheck },
];

function MarketingItInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useMarketing();

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
        <div className="mkt-subnav-scroll">
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
