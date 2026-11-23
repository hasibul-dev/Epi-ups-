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
      <div className="mkt-kpi-grid">
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Ad Spend</span>
          <span className="mkt-stat-val text-white">৳{totalSpend.toLocaleString()}</span>
          <span className="mkt-stat-sub">Budget: ৳{totalBudget.toLocaleString()}</span>
        </div>

        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Ad Leads</span>
          <span className="mkt-stat-val text-emerald-400">{totalLeads} Leads</span>
          <span className="mkt-stat-sub">Direct B2B inquiries</span>
        </div>

        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Ad Clicks</span>
          <span className="mkt-stat-val text-sky-400">{totalClicks.toLocaleString()}</span>
          <span className="mkt-stat-sub">High-intent visitors</span>
        </div>

        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Avg Cost Per Lead</span>
          <span className="mkt-stat-val text-purple-400">
            ৳{totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0}
          </span>
          <span className="mkt-stat-sub">Calculated Ad ROI</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`mkt-pill-filter ${platformFilter === plat ? 'active-purple' : ''}`}
            >
              {plat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mkt-select !w-auto text-xs !py-1.5 !px-3"
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
          <div className="mkt-card p-8 text-center text-slate-400 text-xs">
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
                        className={`mkt-badge ${
                          ad.status === 'Active'
                            ? 'mkt-badge-green'
                            : 'mkt-badge-neutral'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span className="mkt-badge mkt-badge-purple">{ad.platform}</span>
                      <span>•</span>
                      <span>Format: <strong className="text-slate-300">{ad.adFormat}</strong></span>
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
                      className="btn-mkt-secondary text-xs !py-1.5 !px-3 !h-auto !min-h-0 flex items-center gap-1.5"
                    >
                      <Edit2 size={13} className="text-purple-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id, ad.name)}
                      className="btn-mkt-action btn-mkt-delete"
                      title="Delete Advertisement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Spend / Budget</div>
                    <div className="text-xs font-semibold text-slate-200">
                      ৳{ad.spend?.toLocaleString()} / ৳{ad.budget?.toLocaleString()}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full"
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
