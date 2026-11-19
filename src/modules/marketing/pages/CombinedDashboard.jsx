import React from 'react';
import {
  Share2,
  Wrench,
  Megaphone,
  Ticket,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Eye,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CombinedDashboard() {
  const {
    data,
    openCampaignModal,
    openPostModal,
    openTicketModal,
    openDeviceModal,
    openTicketDetails,
    isMarketingRole,
    isItRole,
  } = useMarketing();
  const navigate = useNavigate();

  const { campaigns, posts, ads, tickets, devices, softwareAccounts } = data;

  // Marketing KPIs
  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const scheduledPosts = posts.filter((p) => p.status === 'Scheduled');

  // IT KPIs
  const openTickets = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High');
  const resolvedTickets = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status));
  const operationalDevices = devices.filter((d) => d.status === 'Operational');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/20 to-slate-900/60 border border-purple-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-2">
              <Share2 size={13} />
              <span>Independent Corporate Operations</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Digital Marketing & IT Support Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Centralized brand communications, social campaign analytics, lead generation, and enterprise IT hardware & infrastructure ticketing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openCampaignModal()}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span>New Campaign</span>
            </button>
            <button
              onClick={() => openTicketModal()}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 flex items-center gap-1.5 transition-all"
            >
              <Ticket size={14} />
              <span>New IT Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Active Campaigns */}
        <div
          onClick={() => navigate('/marketing/campaigns')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Campaigns</span>
            <Megaphone size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-white">{activeCampaigns.length}</div>
          <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
            <span>{campaigns.length} Total Campaigns</span>
          </div>
        </div>

        {/* Card 2: Marketing Leads */}
        <div
          onClick={() => navigate('/marketing/ads')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Leads Generated</span>
            <TrendingUp size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-white">{totalLeads}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Across FB & LinkedIn</div>
        </div>

        {/* Card 3: Scheduled Posts */}
        <div
          onClick={() => navigate('/marketing/calendar')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Editorial Posts</span>
            <Calendar size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-white">{posts.length}</div>
          <div className="text-[11px] text-indigo-400 mt-1">{scheduledPosts.length} Queued</div>
        </div>

        {/* Card 4: Open IT Tickets */}
        <div
          onClick={() => navigate('/marketing/tickets')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open IT Tickets</span>
            <AlertCircle size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-amber-400">{openTickets.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">{criticalTickets.length} High Priority</div>
        </div>

        {/* Card 5: Resolved Tickets */}
        <div
          onClick={() => navigate('/marketing/tickets')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Resolved Tickets</span>
            <CheckCircle2 size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{resolvedTickets.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% Fixed by Team</div>
        </div>

        {/* Card 6: IT Hardware Assets */}
        <div
          onClick={() => navigate('/marketing/devices')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Managed Devices</span>
            <Laptop size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold text-white">{devices.length}</div>
          <div className="text-[11px] text-cyan-400 mt-1">{operationalDevices.length} Online</div>
        </div>
      </div>

      {/* Two-Column Division: Digital Marketing Overview & IT Support Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Digital Marketing Section */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Megaphone size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Digital Marketing Activities</h3>
                <p className="text-[11px] text-slate-400">Campaigns, content calendar & ads</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/marketing/campaigns')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Active Campaigns List */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Marketing Campaigns
            </div>
            {campaigns.slice(0, 3).map((camp) => {
              const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
              return (
                <div
                  key={camp.id}
                  onClick={() => openCampaignModal(camp)}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{camp.platforms.join(' & ')}</span>
                        <span>•</span>
                        <span className="text-purple-400">{camp.objective}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        camp.status === 'Active'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>
                        Spend: ৳{camp.spend?.toLocaleString()} / ৳{camp.budget?.toLocaleString()}
                      </span>
                      <span className="text-emerald-400 font-semibold">{camp.leadsGenerated} Leads</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links for Marketing */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => openPostModal()}
              className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-purple-900/20 border border-slate-700/50 text-center transition-all"
            >
              <div className="text-xs font-medium text-slate-200">+ Post</div>
              <div className="text-[10px] text-slate-400">Content Calendar</div>
            </button>
            <button
              onClick={() => navigate('/marketing/social')}
              className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-purple-900/20 border border-slate-700/50 text-center transition-all"
            >
              <div className="text-xs font-medium text-slate-200">Social Media</div>
              <div className="text-[10px] text-slate-400">FB & LinkedIn</div>
            </button>
            <button
              onClick={() => navigate('/marketing/marketing-reports')}
              className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-purple-900/20 border border-slate-700/50 text-center transition-all"
            >
              <div className="text-xs font-medium text-slate-200">Reports</div>
              <div className="text-[10px] text-slate-400">Analytics & ROI</div>
            </button>
          </div>
        </div>

        {/* Right: IT Support Overview */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Ticket size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">IT Support & Device Operations</h3>
                <p className="text-[11px] text-slate-400">Helpdesk tickets & hardware health</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/marketing/tickets')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Urgent / Recent Tickets */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Support Tickets
            </div>
            {tickets.slice(0, 3).map((tick) => (
              <div
                key={tick.id}
                onClick={() => openTicketDetails(tick)}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-400 font-semibold">{tick.id}</span>
                      <span className="text-xs font-semibold text-white">{tick.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{tick.department}</span>
                      <span>•</span>
                      <span>User: {tick.requestingEmployee}</span>
                      <span>•</span>
                      <span className="text-indigo-400">{tick.issueCategory}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                      tick.priority === 'Critical'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : tick.priority === 'High'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {tick.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-700/40">
                  <span className="flex items-center gap-1">
                    <Wrench size={12} className="text-slate-400" />
                    <span>Tech: {tick.assignedTechnician || 'Unassigned'}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      tick.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : tick.status === 'In Progress'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {tick.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links for IT */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => openDeviceModal()}
              className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-amber-900/20 border border-slate-700/50 text-center transition-all"
            >
              <div className="text-xs font-medium text-slate-200">+ Hardware</div>
              <div className="text-[10px] text-slate-400">Inventory Asset</div>
            </button>
            <button
              onClick={() => navigate('/marketing/software')}
              className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-amber-900/20 border border-slate-700/50 text-center transition-all"
            >
              <div className="text-xs font-medium text-slate-200">Software & Licenses</div>
              <div className="text-[10px] text-slate-400">{softwareAccounts.length} Licensed Pools</div>
            </button>
            <button
              onClick={() => navigate('/marketing/maintenance')}
              className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-amber-900/20 border border-slate-700/50 text-center transition-all"
            >
              <div className="text-xs font-medium text-slate-200">Maintenance</div>
              <div className="text-[10px] text-slate-400">ISP & Server Room</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
