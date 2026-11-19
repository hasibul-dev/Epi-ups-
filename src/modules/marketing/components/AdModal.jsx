import React, { useState, useEffect } from 'react';
import { X, Target, Save } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, addDays } from '../../sales/utils/helpers.js';

const PLATFORMS = [
  'Facebook Ads',
  'LinkedIn Sponsored',
  'Google Search',
  'YouTube Ads',
  'Instagram Sponsored',
];

const AD_FORMATS = [
  'Lead Form & Carousel',
  'Single Image Sponsored Content',
  'Search Text Ad',
  'Video Ad',
  'Message Ad',
];

const AD_STATUSES = ['Active', 'Paused', 'Completed', 'Draft'];

export default function AdModal() {
  const { adModal, closeAdModal, saveAd, data } = useMarketing();
  const { open, item } = adModal;

  const [form, setForm] = useState({
    name: '',
    platform: 'Facebook Ads',
    campaignId: '',
    adFormat: 'Lead Form & Carousel',
    budget: 20000,
    dailyBudget: 1500,
    startDate: today(),
    endDate: addDays(today(), 15),
    status: 'Active',
    impressions: 0,
    clicks: 0,
    spend: 0,
    cpc: 5.0,
    leads: 0,
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        platform: item.platform || 'Facebook Ads',
        campaignId: item.campaignId || (data.campaigns[0]?.id || ''),
        adFormat: item.adFormat || 'Lead Form & Carousel',
        budget: item.budget || 0,
        dailyBudget: item.dailyBudget || 0,
        startDate: item.startDate || today(),
        endDate: item.endDate || addDays(today(), 15),
        status: item.status || 'Active',
        impressions: item.impressions || 0,
        clicks: item.clicks || 0,
        spend: item.spend || 0,
        cpc: item.cpc || 0,
        leads: item.leads || 0,
        notes: item.notes || '',
      });
    } else {
      setForm({
        name: '',
        platform: 'Facebook Ads',
        campaignId: data.campaigns[0]?.id || '',
        adFormat: 'Lead Form & Carousel',
        budget: 25000,
        dailyBudget: 1500,
        startDate: today(),
        endDate: addDays(today(), 15),
        status: 'Active',
        impressions: 0,
        clicks: 0,
        spend: 0,
        cpc: 4.5,
        leads: 0,
        notes: '',
      });
    }
    setError('');
  }, [item, open, data.campaigns]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['budget', 'dailyBudget', 'impressions', 'clicks', 'spend', 'cpc', 'leads'].includes(name)
        ? Number(value) || 0
        : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Ad name / title is required');
      return;
    }

    saveAd({
      ...(item ? { id: item.id } : {}),
      ...form,
      name: form.name.trim(),
    });
    closeAdModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeAdModal}>
      <div className="marketing-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="marketing-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {item ? 'Edit Paid Advertisement' : 'Launch / Record Paid Ad Campaign'}
              </h3>
              <p className="text-xs text-slate-400">
                Track ad budget, daily spend, CTR, cost-per-click and customer leads
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAdModal}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="marketing-modal-body space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Ad Set / Campaign Title *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. FB Sponsored: Industrial Online UPS Summer Power Shield"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ad Platform *
              </label>
              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Parent Marketing Campaign
              </label>
              <select
                name="campaignId"
                value={form.campaignId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="">None / Standalone</option>
                {data.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ad Format
              </label>
              <select
                name="adFormat"
                value={form.adFormat}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {AD_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Budget (৳ BDT)
              </label>
              <input
                type="number"
                name="budget"
                min="0"
                value={form.budget}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Daily Budget (৳ BDT)
              </label>
              <input
                type="number"
                name="dailyBudget"
                min="0"
                value={form.dailyBudget}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Spend (৳ BDT)
              </label>
              <input
                type="number"
                name="spend"
                min="0"
                value={form.spend}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ad Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {AD_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Impressions
              </label>
              <input
                type="number"
                name="impressions"
                min="0"
                value={form.impressions}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Clicks
              </label>
              <input
                type="number"
                name="clicks"
                min="0"
                value={form.clicks}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Avg. CPC (৳)
              </label>
              <input
                type="number"
                step="0.1"
                name="cpc"
                min="0"
                value={form.cpc}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Leads Generated
              </label>
              <input
                type="number"
                name="leads"
                min="0"
                value={form.leads}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Audience / Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Targeting industrial pin codes in Gazipur, Savar, Tongi, Narayanganj..."
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeAdModal}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-medium text-white shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              <Save size={14} />
              {item ? 'Update Advertisement' : 'Save Ad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
