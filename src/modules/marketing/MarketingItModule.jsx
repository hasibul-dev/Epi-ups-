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
  Plus,
  Download,
  Upload,
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
  { id: 'overview', label: 'Command Overview', path: '/marketing', icon: LayoutDashboard },
  { id: 'mkt_dash', label: 'Marketing KPIs', path: '/marketing/marketing-dashboard', icon: Megaphone },
  { id: 'campaigns', label: 'Campaigns', path: '/marketing/campaigns', icon: Target, badgeKey: 'activeCampaigns' },
  { id: 'calendar', label: 'Content Calendar', path: '/marketing/calendar', icon: Calendar },
  { id: 'social', label: 'FB & LinkedIn', path: '/marketing/social', icon: Share2 },
  { id: 'ads', label: 'Paid Ads', path: '/marketing/ads', icon: DollarSign },
  { id: 'assets', label: 'Asset Library', path: '/marketing/assets', icon: FolderArchive },
  { id: 'creatives', label: 'Creative Requests', path: '/marketing/creative-requests', icon: Palette },
  { id: 'tasks', label: 'Marketing Tasks', path: '/marketing/tasks', icon: CheckSquare },
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
  const {
    data,
    openPostModal,
    openCampaignModal,
    openTicketModal,
    openDeviceModal,
    exportBackup,
    importBackup,
  } = useMarketing();

  const rawSlug = location.pathname.replace(/^\/marketing\/?/, '').split('/')[0] || '';
  const currentTab = ROUTE_MAP[rawSlug] || 'overview';

  const badgeCounts = {
    activeCampaigns: data.campaigns.filter((c) => c.status === 'Active').length,
    openTickets: data.tickets.filter((t) => ['Open', 'In Progress'].includes(t.status)).length,
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importBackup(event.target.result);
        alert('Digital Marketing & IT Support data backup successfully imported!');
      } catch (err) {
        alert(`Failed to import backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    <div className="marketing-module-wrapper space-y-5">
      {/* Top Header & Subnav Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
            <Share2 size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Digital Marketing & IT Support Operations</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                EPI-DM-IT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Integrated B2B marketing channels, lead acquisition & enterprise IT helpdesk
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => openPostModal()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Plus size={13} />
            <span>Post</span>
          </button>
          <button
            onClick={() => openCampaignModal()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Plus size={13} />
            <span>Campaign</span>
          </button>
          <button
            onClick={() => openTicketModal()}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 flex items-center gap-1 transition-colors"
          >
            <Ticket size={13} />
            <span>Ticket</span>
          </button>
          <button
            onClick={() => openDeviceModal()}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 flex items-center gap-1 transition-colors"
          >
            <Laptop size={13} />
            <span>Device</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={() => exportBackup()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Download JSON Backup"
          >
            <Download size={14} />
          </button>

          <label
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Import JSON Backup"
          >
            <Upload size={14} />
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Horizontal Subnavigation Carousel / Tab Bar */}
      <div className="marketing-subnav-container">
        <div className="marketing-subnav-scroll flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SUBNAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const badge = tab.badgeKey ? badgeCounts[tab.badgeKey] : null;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`marketing-subnav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-semibold'
                    : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-purple-900/80 text-white'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content View */}
      <div className="marketing-page-content min-h-[500px]">
        {renderPage()}
      </div>

      {/* All Department Dialogs & Modals */}
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
