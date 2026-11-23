import React from 'react';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function MarketingDashboard() {
  const { data, openCampaignModal, openPostModal, openAdModal } = useMarketing();
  const navigate = useNavigate();
  const { campaigns, posts, ads } = data;

  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const upcomingPosts = posts.filter((p) => p.status === 'Scheduled');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">
            <Megaphone size={13} />
            <span>Marketing Analytics</span>
          </div>
          <h2>Digital Marketing Performance</h2>
          <p>
            Real-time analytics for B2B industrial UPS campaigns, social lead conversions, and brand reach.
          </p>
        </div>

        <div className="mkt-hero-actions">
          <button
            type="button"
            onClick={() => openPostModal()}
            className="btn-mkt-secondary"
          >
            <Calendar size={14} className="text-sky-400" />
            <span>Add Post</span>
          </button>
          <button
            type="button"
            onClick={() => openCampaignModal()}
            className="btn-mkt-primary"
          >
            <Plus size={14} />
            <span>Launch Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mkt-kpi-grid">
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

        <div
          onClick={() => navigate('/marketing/campaigns')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-icon icon-green">
            <DollarSign size={20} />
          </div>
          <div className="mkt-stat-data">
            <span className="mkt-stat-label">Total Budget</span>
            <span className="mkt-stat-val text-emerald-400">৳{totalBudget.toLocaleString()}</span>
            <span className="mkt-stat-sub">Spend: ৳{totalSpend.toLocaleString()}</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/marketing/ads')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-icon icon-cyan">
            <Users size={20} />
          </div>
          <div className="mkt-stat-data">
            <span className="mkt-stat-label">Leads Generated</span>
            <span className="mkt-stat-val">{totalLeads}</span>
            <span className="mkt-stat-sub">Direct B2B inquiries</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/marketing/social')}
          className="mkt-stat-card"
        >
          <div className="mkt-stat-icon icon-blue">
            <TrendingUp size={20} />
          </div>
          <div className="mkt-stat-data">
            <span className="mkt-stat-label">Impressions</span>
            <span className="mkt-stat-val">{totalImpressions.toLocaleString()}</span>
            <span className="mkt-stat-sub">Audience reach</span>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="mkt-card space-y-4">
        <div className="mkt-card-header">
          <div>
            <h4 className="mkt-card-title">
              <Megaphone size={16} className="text-sky-400" />
              <span>Active Strategic Campaigns</span>
            </h4>
            <p className="mkt-card-desc">Ongoing commercial initiatives for industrial power products</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/marketing/campaigns')}
            className="btn-glass-action btn-glass-purple"
          >
            <span>Manage Campaigns</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Platforms</th>
                <th>Focus Product</th>
                <th>Budget / Spend</th>
                <th>Leads</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => {
                const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
                return (
                  <tr key={camp.id}>
                    <td>
                      <div className="font-semibold text-white">{camp.name}</div>
                      <div className="text-[11px] text-slate-400">{camp.objective}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {camp.platforms.map((p) => (
                          <span key={p} className="mkt-badge mkt-badge-neutral text-[10px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-slate-300 max-w-[200px] truncate">
                      {camp.focusProduct}
                    </td>
                    <td>
                      <div className="text-slate-200 font-mono text-xs">
                        ৳{camp.spend?.toLocaleString()} / ৳{camp.budget?.toLocaleString()}
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-400">{camp.leadsGenerated}</span>
                      <span className="text-[11px] text-slate-400 ml-1">/ {camp.leadTarget}</span>
                    </td>
                    <td>
                      <span
                        className={`mkt-badge ${
                          camp.status === 'Active' ? 'mkt-badge-green' : 'mkt-badge-neutral'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => openCampaignModal(camp)}
                        className="btn-mkt-secondary text-xs py-1 px-2.5"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Social Posts & Paid Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Posts */}
        <div className="mkt-card space-y-3">
          <div className="mkt-card-header">
            <div>
              <h4 className="mkt-card-title">
                <Calendar size={16} className="text-sky-400" />
                <span>Upcoming Editorial Posts</span>
              </h4>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketing/calendar')}
              className="btn-glass-action btn-glass-blue"
            >
              Calendar View →
            </button>
          </div>

          <div className="space-y-2">
            {posts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                onClick={() => openPostModal(post)}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-[75%]">
                  <div className="text-xs font-semibold text-white truncate">{post.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-sky-400 font-medium">{post.platform}</span>
                    <span>•</span>
                    <span>{post.scheduledDate} ({post.scheduledTime})</span>
                  </div>
                </div>
                <span
                  className={`mkt-badge ${
                    post.status === 'Published'
                      ? 'mkt-badge-green'
                      : post.status === 'Scheduled'
                      ? 'mkt-badge-blue'
                      : 'mkt-badge-neutral'
                  }`}
                >
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Ads Quick Snapshot */}
        <div className="mkt-card space-y-3">
          <div className="mkt-card-header">
            <div>
              <h4 className="mkt-card-title">
                <Share2 size={16} className="text-emerald-400" />
                <span>Paid Advertisements Tracking</span>
              </h4>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketing/ads')}
              className="btn-glass-action btn-glass-cyan"
            >
              Ads Manager →
            </button>
          </div>

          <div className="space-y-2">
            {ads.map((ad) => (
              <div
                key={ad.id}
                onClick={() => openAdModal(ad)}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">{ad.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Platform: <span className="text-sky-400 font-medium">{ad.platform}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{ad.leads} Leads</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                  <span>Spend: ৳{ad.spend?.toLocaleString()}</span>
                  <span>Clicks: {ad.clicks?.toLocaleString()}</span>
                  <span>Avg CPC: ৳{ad.cpc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
