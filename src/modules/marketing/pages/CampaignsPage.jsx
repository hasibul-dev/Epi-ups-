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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-purple-400" size={20} />
            Marketing Campaign Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plan, monitor and optimize industrial power solution marketing campaigns across channels
          </p>
        </div>
        <button
          onClick={() => openCampaignModal()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
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
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
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
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No marketing campaigns match your search criteria.
          </div>
        ) : (
          filteredCampaigns.map((camp) => {
            const pct = camp.budget ? Math.min(100, Math.round((camp.spend / camp.budget) * 100)) : 0;
            const remainingBudget = Math.max(0, (camp.budget || 0) - (camp.spend || 0));

            return (
              <div
                key={camp.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{camp.name}</h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          camp.status === 'Active'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : camp.status === 'Planning'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
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
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    {isMarketingManager && (
                      <button
                        onClick={() => handleDelete(camp.id, camp.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
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
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-900/60 border border-slate-700 text-slate-300"
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
                    <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
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
