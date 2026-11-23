import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit2,
  Users,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

export default function CampaignsPage() {
  const { data, openCampaignModal, deleteCampaign, isMarketingManager } = useMarketing();
  const { campaigns } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.focusProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete campaign "${name}"?`)) {
      deleteCampaign(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">CAMPAIGN OPERATIONS</div>
          <h2>Marketing Campaign Management</h2>
          <p>
            Plan, monitor and optimize industrial power solution marketing campaigns across channels
          </p>
        </div>
        <button
          onClick={() => openCampaignModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by name, focus product, or target audience..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mkt-input pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mkt-select !w-auto"
          >
            <option value="All">All Statuses ({campaigns.length})</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="mkt-card p-8 text-center text-slate-400 text-xs">
            No marketing campaigns match your search criteria.
          </div>
        ) : (
          filteredCampaigns.map((camp) => {
            const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
            const remainingBudget = Math.max(0, (camp.budget || 0) - (camp.spend || 0));

            return (
              <div
                key={camp.id}
                className="mkt-card space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{camp.name}</h2>
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
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>Objective: <strong className="text-slate-300">{camp.objective}</strong></span>
                      <span>•</span>
                      <span>Manager: <strong className="text-purple-300">{camp.assignedEmployee}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-500" />
                        {camp.startDate} to {camp.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => openCampaignModal(camp)}
                      className="btn-mkt-secondary !py-1.5 !px-3 !h-auto !min-h-0 text-xs flex items-center gap-1.5"
                    >
                      <Edit2 size={13} className="text-purple-400" />
                      <span>Edit</span>
                    </button>
                    {isMarketingManager && (
                      <button
                        onClick={() => handleDelete(camp.id, camp.name)}
                        className="btn-mkt-action btn-mkt-delete"
                        title="Delete Campaign"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Focus Product / Solution</div>
                    <div className="text-xs font-semibold text-slate-200">{camp.focusProduct}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Target Platforms</div>
                    <div className="flex flex-wrap gap-1">
                      {camp.platforms.map((p) => (
                        <span
                          key={p}
                          className="mkt-badge mkt-badge-purple"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Budget Allocation & Spend</div>
                    <div className="text-xs font-medium text-slate-200">
                      ৳{camp.spend?.toLocaleString()} / ৳{camp.budget?.toLocaleString()}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {pct}% spent • ৳{remainingBudget.toLocaleString()} left
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Leads & Conversion</div>
                    <div className="text-xs font-bold text-emerald-400">
                      {camp.leadsGenerated} leads
                      <span className="text-slate-400 font-normal ml-1">/ target {camp.leadTarget}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{camp.impressions?.toLocaleString()} Impressions</span>
                      <span>•</span>
                      <span>{camp.clicks?.toLocaleString()} Clicks</span>
                    </div>
                  </div>
                </div>

                {/* Target Audience & Notes */}
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 font-medium">Target Audience: </span>
                  {camp.targetAudience}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
