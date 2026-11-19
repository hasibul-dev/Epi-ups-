import React from 'react';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Share2,
  Plus,
  Eye,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function MarketingDashboard() {
  const { data, openCampaignModal, openPostModal, openAdModal } = useMarketing();
  const navigate = useNavigate();
  const { campaigns, posts, ads, creativeRequests } = data;

  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsGenerated || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const upcomingPosts = posts.filter((p) => p.status === 'Scheduled');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-purple-400" size={20} />
            Digital Marketing Performance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics for B2B industrial UPS campaigns, social lead conversions, and brand reach
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPostModal()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            + New Post
          </button>
          <button
            onClick={() => openCampaignModal()}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Launch Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Active Campaigns</span>
            <Megaphone size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeCampaigns.length}</div>
          <div className="text-[11px] text-purple-400 mt-1">{campaigns.length} Total Campaigns</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Total Marketing Budget</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">৳{totalBudget.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Spend: <span className="text-emerald-400 font-semibold">৳{totalSpend.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Total Leads Generated</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLeads}</div>
          <div className="text-[11px] text-indigo-400 mt-1">Direct B2B Inquiries</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">Campaign Impressions</span>
            <TrendingUp size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Total Target Reach</div>
        </div>
      </div>

      {/* Campaigns Table Preview */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Active Strategic Campaigns</h2>
          <button
            onClick={() => navigate('/marketing/campaigns')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Manage Campaigns →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Campaign Name</th>
                <th className="py-2.5 px-3">Platforms</th>
                <th className="py-2.5 px-3">Focus Product</th>
                <th className="py-2.5 px-3">Budget / Spend</th>
                <th className="py-2.5 px-3">Leads</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {campaigns.map((camp) => {
                const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
                return (
                  <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{camp.name}</div>
                      <div className="text-[11px] text-slate-400">{camp.objective}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {camp.platforms.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">
                      {camp.focusProduct}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">
                        ৳{camp.spend?.toLocaleString()} / ৳{camp.budget?.toLocaleString()}
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-400">{camp.leadsGenerated}</span>
                      <span className="text-[11px] text-slate-500 ml-1">/ {camp.leadTarget}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          camp.status === 'Active'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openCampaignModal(camp)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
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

      {/* Two Column Grid: Upcoming Social Posts & Creative Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Posts */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              Upcoming Editorial Calendar Posts
            </h2>
            <button
              onClick={() => navigate('/marketing/calendar')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Calendar View →
            </button>
          </div>

          <div className="space-y-2">
            {posts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                onClick={() => openPostModal(post)}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-[75%]">
                  <div className="text-xs font-semibold text-white truncate">{post.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-indigo-400 font-medium">{post.platform}</span>
                    <span>•</span>
                    <span>{post.scheduledDate} ({post.scheduledTime})</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    post.status === 'Published'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : post.status === 'Scheduled'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Ads Quick Snapshot */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Share2 size={16} className="text-purple-400" />
              Paid Advertisements Tracking
            </h2>
            <button
              onClick={() => navigate('/marketing/ads')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Ads Manager →
            </button>
          </div>

          <div className="space-y-2">
            {ads.map((ad) => (
              <div
                key={ad.id}
                onClick={() => openAdModal(ad)}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">{ad.name}</div>
                    <div className="text-[11px] text-slate-400">
                      Platform: <span className="text-purple-400">{ad.platform}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{ad.leads} Leads</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700/30">
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
