import React, { useState } from 'react';
import {
  Target,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  MousePointer,
  Users,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

const PLATFORMS = ['All', 'Facebook Ads', 'LinkedIn Sponsored', 'Google Search', 'YouTube Ads'];
const STATUSES = ['All', 'Active', 'Paused', 'Completed', 'Draft'];

export default function AdsManagementPage() {
  const { data, openAdModal, deleteAd, isMarketingRole } = useMarketing();
  const { ads } = data;

  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalSpend = ads.reduce((acc, a) => acc + (a.spend || 0), 0);
  const totalBudget = ads.reduce((acc, a) => acc + (a.budget || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const totalLeads = ads.reduce((acc, a) => acc + (a.leads || 0), 0);

  const filteredAds = ads.filter((a) => {
    const matchPlat = platformFilter === 'All' || a.platform === platformFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchPlat && matchStatus;
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete advertisement "${name}"?`)) {
      deleteAd(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">PAID CAMPAIGNS & ADS</div>
          <h2>Paid Advertisement & Campaign ROI Tracking</h2>
          <p>
            Track paid ad budgets, cost-per-click (CPC), impressions, and qualified commercial sales leads
          </p>
        </div>
        <button
          onClick={() => openAdModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>Launch / Add Ad</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mkt-card p-4">
          <div className="text-xs text-slate-400 mb-1">Total Ad Spend</div>
          <div className="text-xl font-bold text-white">৳{totalSpend.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Budget: ৳{totalBudget.toLocaleString()}</div>
        </div>

        <div className="mkt-card p-4">
          <div className="text-xs text-slate-400 mb-1">Total Ad Leads</div>
          <div className="text-xl font-bold text-emerald-400">{totalLeads} Leads</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct inquiries</div>
        </div>

        <div className="mkt-card p-4">
          <div className="text-xs text-slate-400 mb-1">Total Ad Clicks</div>
          <div className="text-xl font-bold text-sky-400">{totalClicks.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">High-intent visitors</div>
        </div>

        <div className="mkt-card p-4">
          <div className="text-xs text-slate-400 mb-1">Avg Cost Per Lead</div>
          <div className="text-xl font-bold text-blue-400">
            ৳{totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Calculated ROI</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                platformFilter === plat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {filteredAds.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No advertisements match your current filter.
          </div>
        ) : (
          filteredAds.map((ad) => {
            const pct = ad.budget ? Math.min(100, Math.round((ad.spend / ad.budget) * 100)) : 0;
            return (
              <div
                key={ad.id}
                className="mkt-card space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{ad.name}</h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ad.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sky-300 font-semibold">{ad.platform}</span>
                      <span>•</span>
                      <span>Format: {ad.adFormat}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        {ad.startDate} to {ad.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => openAdModal(ad)}
                      className="btn-action-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id, ad.name)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Delete Advertisement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Spend / Budget</div>
                    <div className="text-xs font-semibold text-slate-200">
                      ৳{ad.spend?.toLocaleString()} / ৳{ad.budget?.toLocaleString()}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Impressions & Clicks</div>
                    <div className="text-xs font-semibold text-slate-200">
                      {ad.impressions?.toLocaleString()} / {ad.clicks?.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Avg. CPC</div>
                    <div className="text-xs font-bold text-sky-400">৳{ad.cpc}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Cost per website click</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Leads Generated</div>
                    <div className="text-xs font-bold text-emerald-400">{ad.leads} Leads</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      CPL: ৳{ad.leads > 0 ? Math.round(ad.spend / ad.leads) : 0}
                    </div>
                  </div>
                </div>

                {ad.notes && (
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Targeting Details: </span>
                    {ad.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
