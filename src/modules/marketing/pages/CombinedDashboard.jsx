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
  ExternalLink,
  Layers,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CombinedDashboard() {
  const {
    data,
    openCampaignModal,
    openPostModal,
    openTicketModal,
    openTaskModal,
    openTicketDetails,
  } = useMarketing();
  const navigate = useNavigate();

  const {
    campaigns = [],
    posts = [],
    ads = [],
    tickets = [],
    devices = [],
    marketingTasks = [],
    tasks = [],
  } = data;

  // 1. Marketing Performance Metrics
  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const scheduledPosts = posts.filter((p) => p.status === 'Scheduled');
  const publishedPosts = posts.filter((p) => p.status === 'Published');

  // 2. IT Support & Infrastructure Metrics
  const openTickets = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status));
  const resolvedTickets = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High');
  const operationalDevices = devices.filter((d) => d.status === 'Operational');
  const resolutionRate =
    tickets.length > 0 ? Math.round((resolvedTickets.length / tickets.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* 1. Header Section: Compact & Professional Welcome Banner */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">
            <Share2 size={12} />
            <span>Digital Marketing &amp; IT Support</span>
          </div>
          <h2>Digital Marketing &amp; IT Support</h2>
          <p>
            Centralized operations for B2B industrial UPS campaigns, social lead acquisition, hardware asset tracking &amp; helpdesk ticketing.
          </p>
        </div>

        {/* Clean, Uniform Action Buttons */}
        <div className="mkt-hero-actions">
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="btn-mkt-primary"
            title="Create a new task / work item"
          >
            <Plus size={14} />
            <span>+ Add Work</span>
          </button>

          <button
            type="button"
            onClick={() => openPostModal()}
            className="btn-mkt-secondary"
            title="Schedule a post in editorial calendar"
          >
            <Calendar size={14} className="text-sky-400" />
            <span>+ Add Post</span>
          </button>

          <button
            type="button"
            onClick={() => openCampaignModal()}
            className="btn-mkt-secondary"
            title="Launch a new marketing campaign"
          >
            <Zap size={14} className="text-purple-400" />
            <span>+ Add Campaign</span>
          </button>

          <button
            type="button"
            onClick={() => openTicketModal()}
            className="btn-mkt-secondary"
            title="Log an internal IT support ticket"
          >
            <Ticket size={14} className="text-amber-400" />
            <span>+ Add IT Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/marketing/marketing-reports')}
            className="btn-mkt-secondary"
            title="View marketing & IT performance reports"
          >
            <FileText size={14} className="text-slate-400" />
            <span>Work Reports</span>
          </button>
        </div>
      </div>

      {/* 2. Marketing Performance Section (4 Clean KPI Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Marketing Performance
            </h3>
            <span className="mkt-badge mkt-badge-purple">
              B2B Campaigns &amp; Lead Generation
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/marketing/campaigns')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold transition-colors"
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
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Active Campaigns</span>
              <div className="mkt-stat-icon icon-purple">
                <Megaphone size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-white">{activeCampaigns.length}</div>
            <div className="mkt-stat-sub">
              <span>{campaigns.length} Total Campaigns</span>
            </div>
          </div>

          {/* Card 2: Total Leads Generated */}
          <div
            onClick={() => navigate('/marketing/ads')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Total Leads Generated</span>
              <div className="mkt-stat-icon icon-green">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-emerald-400">{totalLeads.toLocaleString()}</div>
            <div className="mkt-stat-sub">
              <span>Direct B2B Customer Inquiries</span>
            </div>
          </div>

          {/* Card 3: Scheduled Posts */}
          <div
            onClick={() => navigate('/marketing/calendar')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Scheduled Posts</span>
              <div className="mkt-stat-icon icon-blue">
                <Clock size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-sky-400">{scheduledPosts.length}</div>
            <div className="mkt-stat-sub">
              <span>Queued in Editorial Calendar</span>
            </div>
          </div>

          {/* Card 4: Published Posts */}
          <div
            onClick={() => navigate('/marketing/social')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Published Posts</span>
              <div className="mkt-stat-icon icon-cyan">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-cyan-400">{publishedPosts.length}</div>
            <div className="mkt-stat-sub">
              <span>Live on LinkedIn &amp; Facebook</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IT Support & Infrastructure Section (4 Clean KPI Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
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
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Open Tickets</span>
              <div className="mkt-stat-icon icon-amber">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-amber-400">{openTickets.length}</div>
            <div className="mkt-stat-sub">
              <span>In Progress &amp; Pending Support</span>
            </div>
          </div>

          {/* Card 6: Resolved Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Resolved Tickets</span>
              <div className="mkt-stat-icon icon-green">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-emerald-400">{resolvedTickets.length}</div>
            <div className="mkt-stat-sub">
              <span>{resolutionRate}% Resolution Efficiency</span>
            </div>
          </div>

          {/* Card 7: High Priority Tickets */}
          <div
            onClick={() => navigate('/marketing/tickets')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">High Priority Tickets</span>
              <div className="mkt-stat-icon icon-red">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-red-400">{criticalTickets.length}</div>
            <div className="mkt-stat-sub">
              <span>Critical / Urgent Interventions</span>
            </div>
          </div>

          {/* Card 8: Managed Devices */}
          <div
            onClick={() => navigate('/marketing/devices')}
            className="mkt-stat-card"
          >
            <div className="mkt-stat-header">
              <span className="mkt-stat-label">Managed Devices</span>
              <div className="mkt-stat-icon icon-cyan">
                <Laptop size={16} />
              </div>
            </div>
            <div className="mkt-stat-val text-white">{devices.length}</div>
            <div className="mkt-stat-sub">
              <span className="text-cyan-400">{operationalDevices.length} Online &amp; Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Dashboard Sections: 2 Structured Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Marketing Campaigns */}
        <div className="mkt-card space-y-4">
          <div className="mkt-card-header">
            <div>
              <h4 className="mkt-card-title">
                <Megaphone size={15} className="text-purple-400" />
                <span>Active Marketing Campaigns</span>
              </h4>
              <p className="mkt-card-desc">
                Promotional reach, budget utilization and sales inquiries
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketing/campaigns')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Campaign Items List */}
          <div className="space-y-2.5">
            {campaigns.slice(0, 3).map((camp) => {
              const budget = camp.budget || 0;
              const spend = camp.spend || 0;
              const pct = budget > 0 ? Math.min(100, Math.round((spend / budget) * 100)) : 0;

              return (
                <div
                  key={camp.id}
                  onClick={() => openCampaignModal(camp)}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/30 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white tracking-tight">
                        {camp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span className="text-purple-300 font-medium">
                          {(camp.platforms || []).join(' • ')}
                        </span>
                        <span>·</span>
                        <span className="text-slate-400">{camp.objective}</span>
                        {camp.focusProduct && (
                          <>
                            <span>·</span>
                            <span className="text-slate-500 truncate max-w-[180px]">
                              {camp.focusProduct}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`mkt-badge ${
                        camp.status === 'Active'
                          ? 'mkt-badge-green'
                          : camp.status === 'Planning'
                          ? 'mkt-badge-blue'
                          : 'mkt-badge-neutral'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                      <span>
                        Spend: ৳{spend.toLocaleString()} / ৳{budget.toLocaleString()}{' '}
                        <span className="text-slate-500 font-mono">({pct}%)</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {camp.leadsGenerated || 0} Leads
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full transition-all duration-300"
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
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
              >
                Calendar View →
              </button>
            </div>

            <div className="space-y-1.5">
              {posts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post)}
                  className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-slate-200">{post.title}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[10px]">
                      {post.platform}
                    </span>
                  </div>
                  <span className="text-sky-300 text-[10px] font-mono whitespace-nowrap">
                    {post.scheduledDate} {post.scheduledTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent IT Support Tickets */}
        <div className="mkt-card space-y-4">
          <div className="mkt-card-header">
            <div>
              <h4 className="mkt-card-title">
                <Ticket size={15} className="text-amber-400" />
                <span>Recent IT Support Tickets</span>
              </h4>
              <p className="mkt-card-desc">
                Helpdesk requests, hardware diagnostics and technician slips
              </p>
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
          <div className="space-y-2.5">
            {tickets.slice(0, 3).map((tick) => (
              <div
                key={tick.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/30 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        {tick.id}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[240px]">
                        {tick.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      User: <strong className="text-slate-200">{tick.requestingEmployee}</strong>{' '}
                      <span className="text-slate-500">({tick.department})</span> ·{' '}
                      <span className="text-slate-400">{tick.issueCategory}</span>
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
                    <Wrench size={12} className="text-slate-500" />
                    <span>Tech: {tick.assignedTechnician || 'Unassigned'}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`mkt-badge ${
                        tick.status === 'Resolved' || tick.status === 'Closed'
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
                      className="btn-mkt-action"
                      title="View & Print IT Service Slip"
                    >
                      <span>Slip</span>
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
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Maintenance →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" />
                  <span>Optical Fiber Link</span>
                </div>
                <div className="font-bold text-white text-xs">AmberIT 50 Mbps</div>
                <div className="text-[10px] text-emerald-400 font-mono">Online • 3ms latency</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Activity size={11} className="text-cyan-400" />
                  <span>Server Room &amp; UPS</span>
                </div>
                <div className="font-bold text-white text-xs">21.4°C / 46% RH</div>
                <div className="text-[10px] text-cyan-400 font-mono">UPS 218V DC Normal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
