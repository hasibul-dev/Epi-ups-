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
      {/* 1. Header Section matching EPI Application Hero Banner */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">
            <Share2 size={13} />
            <span>Digital Marketing &amp; IT Support</span>
          </div>
          <h2>Digital Marketing &amp; IT Support Operations</h2>
          <p>
            Enterprise marketing campaign ROI, lead acquisition, and centralized IT hardware &amp; helpdesk ticketing.
          </p>
        </div>

        {/* Clean Action Buttons with exact EPI Button styling */}
        <div className="mkt-hero-actions">
          <button
            type="button"
            onClick={() => openCampaignModal()}
            className="btn-mkt-primary"
            title="Launch a new marketing campaign"
          >
            <Plus size={14} />
            <span>New Campaign</span>
          </button>

          <button
            type="button"
            onClick={() => openTicketModal()}
            className="btn-mkt-secondary"
            title="Log an internal IT support ticket"
          >
            <Ticket size={14} className="text-amber-400" />
            <span>New IT Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => openPostModal()}
            className="btn-mkt-secondary"
            title="Schedule a post in editorial calendar"
          >
            <Calendar size={14} className="text-sky-400" />
            <span>Add Post</span>
          </button>
        </div>
      </div>

      {/* 2. Marketing Performance KPI Cards (4 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Marketing Performance
            </h3>
            <span className="mkt-badge mkt-badge-blue">
              Lead Generation &amp; Branding
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/marketing/campaigns')}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>All Campaigns</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="mkt-kpi-grid">
          {/* Card 1: Active Campaigns */}
          <div
            onClick={() => navigate('/marketing/campaigns')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-blue">
              <Megaphone size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Active Campaigns</span>
              <span className="mkt-stat-val">{activeCampaigns.length}</span>
              <span className="mkt-stat-sub">{campaigns.length} Total Campaigns</span>
            </div>
          </div>

          {/* Card 2: Total Leads Generated */}
          <div
            onClick={() => navigate('/marketing/ads')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-green">
              <TrendingUp size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Total Leads Generated</span>
              <span className="mkt-stat-val text-emerald-400">{totalLeads}</span>
              <span className="mkt-stat-sub">Direct B2B inquiries</span>
            </div>
          </div>

          {/* Card 3: Scheduled Posts */}
          <div
            onClick={() => navigate('/marketing/calendar')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-cyan">
              <Clock size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Scheduled Posts</span>
              <span className="mkt-stat-val">{scheduledPosts.length}</span>
              <span className="mkt-stat-sub">Queued in calendar</span>
            </div>
          </div>

          {/* Card 4: Published Posts */}
          <div
            onClick={() => navigate('/marketing/social')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-blue">
              <CheckCircle2 size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Published Posts</span>
              <span className="mkt-stat-val">{publishedPosts.length}</span>
              <span className="mkt-stat-sub">FB &amp; LinkedIn live</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IT Support & Infrastructure KPI Cards (4 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              IT Support &amp; Infrastructure
            </h3>
            <span className="mkt-badge mkt-badge-amber">
              Helpdesk &amp; Hardware Health
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/marketing/tickets')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>All Helpdesk Tickets</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="mkt-kpi-grid">
          {/* Card 5: Open Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-amber">
              <AlertCircle size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Open Tickets</span>
              <span className="mkt-stat-val text-amber-400">{openTickets.length}</span>
              <span className="mkt-stat-sub">In progress &amp; pending</span>
            </div>
          </div>

          {/* Card 6: Resolved Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-green">
              <CheckCircle size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Resolved Tickets</span>
              <span className="mkt-stat-val text-emerald-400">{resolvedTickets.length}</span>
              <span className="mkt-stat-sub">Verified &amp; closed</span>
            </div>
          </div>

          {/* Card 7: High Priority Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-red">
              <AlertTriangle size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">High Priority Tickets</span>
              <span className="mkt-stat-val text-red-400">{criticalTickets.length}</span>
              <span className="mkt-stat-sub">Critical urgency</span>
            </div>
          </div>

          {/* Card 8: Managed Devices */}
          <div
            onClick={() => navigate('/marketing/devices')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-icon icon-cyan">
              <Laptop size={20} />
            </div>
            <div className="mkt-stat-data">
              <span className="mkt-stat-label">Managed Devices</span>
              <span className="mkt-stat-val">{devices.length}</span>
              <span className="mkt-stat-sub">{operationalDevices.length} Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Operational Panels matching EPI card layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Marketing Campaigns */}
        <div className="mkt-card space-y-4">
          <div className="mkt-card-header">
            <div>
              <h4 className="mkt-card-title">
                <Megaphone size={16} className="text-sky-400" />
                <span>Active Marketing Campaigns</span>
              </h4>
              <p className="mkt-card-desc">Promotional reach, budget utilization and sales inquiries</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketing/campaigns')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Campaign Items List */}
          <div className="space-y-3">
            {campaigns.slice(0, 3).map((camp) => {
              const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
              return (
                <div
                  key={camp.id}
                  onClick={() => openCampaignModal(camp)}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{camp.platforms.join(' & ')}</span>
                        <span>•</span>
                        <span className="text-sky-400">{camp.objective}</span>
                      </div>
                    </div>
                    <span
                      className={`mkt-badge ${
                        camp.status === 'Active' ? 'mkt-badge-green' : 'mkt-badge-neutral'
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
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming Posts Sub-section */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-sky-400" />
                <span>Upcoming Scheduled Posts</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/marketing/calendar')}
                className="text-[11px] text-sky-400 hover:text-sky-300"
              >
                Calendar View →
              </button>
            </div>

            <div className="space-y-1.5">
              {posts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post)}
                  className="p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/60 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-200">{post.title}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[10px]">{post.platform}</span>
                  </div>
                  <span className="text-sky-300 text-[10px] font-mono whitespace-nowrap">
                    {post.scheduledDate} {post.scheduledTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: IT Support Tickets & Infrastructure */}
        <div className="mkt-card space-y-4">
          <div className="mkt-card-header">
            <div>
              <h4 className="mkt-card-title">
                <Ticket size={16} className="text-amber-400" />
                <span>Recent IT Support Tickets</span>
              </h4>
              <p className="mkt-card-desc">Helpdesk requests, hardware diagnostics and technician slips</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketing/tickets')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>All Tickets</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-3">
            {tickets.slice(0, 3).map((tick) => (
              <div
                key={tick.id}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
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
                    className={`mkt-badge ${
                      tick.priority === 'Critical'
                        ? 'mkt-badge-red'
                        : tick.priority === 'High'
                        ? 'mkt-badge-amber'
                        : 'mkt-badge-blue'
                    }`}
                  >
                    {tick.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Wrench size={12} className="text-slate-400" />
                    <span>Tech: {tick.assignedTechnician || 'Unassigned'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`mkt-badge ${
                        tick.status === 'Resolved'
                          ? 'mkt-badge-green'
                          : tick.status === 'In Progress'
                          ? 'mkt-badge-amber'
                          : 'mkt-badge-blue'
                      }`}
                    >
                      {tick.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openTicketDetails(tick)}
                      className="btn-mkt-secondary text-[10px] py-1 px-2"
                      title="Print IT Service Slip"
                    >
                      Slip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Health Sub-section */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Server size={13} className="text-cyan-400" />
                <span>Network &amp; Server Infrastructure</span>
              </span>
              <button
                type="button"
                onClick={() => navigate('/marketing/maintenance')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                Maintenance →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" />
                  <span>Optical Fiber Link</span>
                </div>
                <div className="font-semibold text-white">AmberIT 50 Mbps</div>
                <div className="text-[10px] text-emerald-400 font-mono">Online • 3ms latency</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/30 border border-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity size={11} className="text-cyan-400" />
                  <span>Server Room &amp; UPS</span>
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
