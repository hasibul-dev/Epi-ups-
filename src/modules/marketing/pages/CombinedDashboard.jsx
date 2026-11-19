import React from 'react';
import {
  Share2,
  Megaphone,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Laptop,
  Plus,
  Ticket,
  Clock,
  ArrowRight,
  FileText,
  Activity,
  Zap,
  Server,
  Wrench,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CombinedDashboard() {
  const {
    data,
    openCampaignModal,
    openPostModal,
    openTicketModal,
    openTicketDetails,
  } = useMarketing();
  const navigate = useNavigate();

  const { campaigns, posts, ads, tickets, devices } = data;

  // Marketing KPIs
  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const scheduledPosts = posts.filter((p) => p.status === 'Scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'Published');

  // IT KPIs
  const openTickets = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status));
  const resolvedTickets = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High');
  const operationalDevices = devices.filter((d) => d.status === 'Operational');

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Share2 size={16} />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Digital Marketing & IT Support
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/25">
              Operations Center
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl pl-10">
            Corporate communications, promotional campaign ROI, client lead generation, and enterprise IT infrastructure helpdesk.
          </p>
        </div>

        {/* Cleanly aligned primary action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pl-10 lg:pl-0">
          <button
            onClick={() => openCampaignModal()}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>New Campaign</span>
          </button>
          <button
            onClick={() => openTicketModal()}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Ticket size={14} />
            <span>New IT Ticket</span>
          </button>
          <button
            onClick={() => openPostModal()}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Calendar size={14} className="text-indigo-400" />
            <span>Add Post</span>
          </button>
        </div>
      </div>

      {/* 2. Marketing KPI Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Marketing Performance
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
              Lead Acquisition & Branding
            </span>
          </div>
          <button
            onClick={() => navigate('/marketing/campaigns')}
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Campaigns Master</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Active Campaigns */}
          <div
            onClick={() => navigate('/marketing/campaigns')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Campaigns</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Megaphone size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{activeCampaigns.length}</div>
            <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
              <span>{campaigns.length} Total Campaigns</span>
            </div>
          </div>

          {/* Card 2: Total Leads Generated */}
          <div
            onClick={() => navigate('/marketing/ads')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Leads Generated</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{totalLeads}</div>
            <div className="text-[11px] text-slate-400 mt-1">Direct inquiries & quotation requests</div>
          </div>

          {/* Card 3: Scheduled Posts */}
          <div
            onClick={() => navigate('/marketing/calendar')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Scheduled Posts</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Clock size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-400 tracking-tight">{scheduledPosts.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Queued in editorial calendar</div>
          </div>

          {/* Card 4: Published Posts */}
          <div
            onClick={() => navigate('/marketing/social')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Published Posts</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{publishedPosts.length}</div>
            <div className="text-[11px] text-cyan-400 mt-1">Live on Facebook & LinkedIn</div>
          </div>
        </div>
      </div>

      {/* 3. IT Support KPI Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              IT Support & Infrastructure
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              Hardware, Network & Helpdesk
            </span>
          </div>
          <button
            onClick={() => navigate('/marketing/tickets')}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Tickets Queue</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 5: Open Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Open Tickets</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <AlertCircle size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400 tracking-tight">{openTickets.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">In progress & pending vendor</div>
          </div>

          {/* Card 6: Resolved Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Resolved Tickets</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <CheckCircle size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{resolvedTickets.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1">Verified fixes & closed</div>
          </div>

          {/* Card 7: High Priority Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-red-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">High Priority Tickets</span>
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                <AlertTriangle size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-400 tracking-tight">{criticalTickets.length}</div>
            <div className="text-[11px] text-red-400 mt-1">Critical & high urgency issues</div>
          </div>

          {/* Card 8: Managed Devices */}
          <div
            onClick={() => navigate('/marketing/devices')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Managed Devices</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Laptop size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{devices.length}</div>
            <div className="text-[11px] text-cyan-400 mt-1">{operationalDevices.length} Online & operational</div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Marketing Campaigns & Publications */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <Megaphone size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Active Campaigns & Publications</h3>
                <p className="text-[11px] text-slate-400">Promotions, budget utilization and lead generation</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/marketing/campaigns')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Active Campaigns List */}
          <div className="space-y-3">
            {campaigns.slice(0, 3).map((camp) => {
              const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
              return (
                <div
                  key={camp.id}
                  onClick={() => openCampaignModal(camp)}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/40 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white hover:text-purple-300 transition-colors">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{camp.platforms.join(' & ')}</span>
                        <span>•</span>
                        <span className="text-purple-400 font-medium">{camp.objective}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        camp.status === 'Active'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>
                        Spend: ৳{camp.spend?.toLocaleString()} / ৳{camp.budget?.toLocaleString()} ({pct}%)
                      </span>
                      <span className="text-emerald-400 font-semibold">{camp.leadsGenerated} Leads</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
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

          {/* Upcoming Editorial Queue Preview */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-400" />
                <span>Upcoming Scheduled Posts</span>
              </span>
              <button
                onClick={() => navigate('/marketing/calendar')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                Calendar View →
              </button>
            </div>

            <div className="space-y-1.5">
              {posts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post)}
                  className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/40 hover:border-slate-600 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-200">{post.title}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[10px]">{post.platform}</span>
                  </div>
                  <span className="text-indigo-300 text-[10px] font-mono whitespace-nowrap">
                    {post.scheduledDate} {post.scheduledTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: IT Support Queue & System Health */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Ticket size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Recent IT Support Tickets</h3>
                <p className="text-[11px] text-slate-400">Employee helpdesk issues, priorities and service slips</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/marketing/tickets')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>All Tickets</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {tickets.slice(0, 3).map((tick) => (
              <div
                key={tick.id}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">{tick.id}</span>
                      <span className="text-xs font-semibold text-white truncate max-w-[240px]">
                        {tick.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      User: <strong className="text-slate-300">{tick.requestingEmployee}</strong> ({tick.department})
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

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                  <span className="flex items-center gap-1">
                    <Wrench size={12} className="text-slate-400" />
                    <span>Tech: {tick.assignedTechnician || 'Unassigned'}</span>
                  </span>

                  <div className="flex items-center gap-2">
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
                    <button
                      onClick={() => openTicketDetails(tick)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-medium transition-colors"
                      title="Print IT Service Slip"
                    >
                      Slip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Health Status */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Server size={13} className="text-cyan-400" />
                <span>Network & Infrastructure Health</span>
              </span>
              <button
                onClick={() => navigate('/marketing/maintenance')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                Maintenance →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/40 space-y-0.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" />
                  <span>Optical Fiber Link</span>
                </div>
                <div className="font-semibold text-white">AmberIT 50 Mbps</div>
                <div className="text-[10px] text-emerald-400 font-mono">3ms ping • Online</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/40 space-y-0.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity size={11} className="text-cyan-400" />
                  <span>Server Room & Power</span>
                </div>
                <div className="font-semibold text-white">21.4°C / 46% RH</div>
                <div className="text-[10px] text-cyan-400 font-mono">UPS 218V DC Normal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
