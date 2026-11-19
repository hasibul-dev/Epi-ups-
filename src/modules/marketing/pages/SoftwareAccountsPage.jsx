import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Mail,
  Key,
  Calendar,
  DollarSign,
  Trash2,
  Edit2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function SoftwareAccountsPage() {
  const { data, saveSoftware, deleteSoftware, isItRole } = useMarketing();
  const { softwareAccounts } = data;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'Licensed Software',
    licenseType: 'Commercial Subscription',
    totalLicenses: 5,
    assignedCount: 4,
    expiryDate: '',
    annualCost: 0,
    vendor: '',
    notes: '',
  });

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      type: 'Licensed Software',
      licenseType: 'Commercial Subscription',
      totalLicenses: 5,
      assignedCount: 1,
      expiryDate: '',
      annualCost: 15000,
      vendor: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      type: item.type || 'Licensed Software',
      licenseType: item.licenseType || 'Commercial Subscription',
      totalLicenses: item.totalLicenses || 1,
      assignedCount: item.assignedCount || 1,
      expiryDate: item.expiryDate || '',
      annualCost: item.annualCost || 0,
      vendor: item.vendor || '',
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    saveSoftware({
      ...(editingItem ? { id: editingItem.id } : {}),
      name: form.name.trim(),
      type: form.type,
      licenseType: form.licenseType,
      totalLicenses: Number(form.totalLicenses) || 1,
      assignedCount: Number(form.assignedCount) || 0,
      expiryDate: form.expiryDate,
      annualCost: Number(form.annualCost) || 0,
      vendor: form.vendor.trim(),
      notes: form.notes.trim(),
    });
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete license pool "${name}"?`)) {
      deleteSoftware(id);
    }
  };

  const totalAnnualCost = softwareAccounts.reduce((acc, s) => acc + (s.annualCost || 0), 0);
  const totalSeats = softwareAccounts.reduce((acc, s) => acc + (s.totalLicenses || 0), 0);
  const assignedSeats = softwareAccounts.reduce((acc, s) => acc + (s.assignedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-purple-400" size={20} />
            Licensed Software & Corporate Email Account Pools
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage enterprise licenses, Microsoft 365, antivirus endpoints, and business domain email allocations
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add License Pool</span>
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Managed Software Pools</div>
          <div className="text-xl font-bold text-white">{softwareAccounts.length}</div>
          <div className="text-[11px] text-purple-400 mt-1">Enterprise subscriptions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Licensed Seats</div>
          <div className="text-xl font-bold text-cyan-400">{totalSeats} Seats</div>
          <div className="text-[11px] text-slate-400 mt-1">{assignedSeats} Assigned to Users</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Available Free Seats</div>
          <div className="text-xl font-bold text-emerald-400">{Math.max(0, totalSeats - assignedSeats)} Seats</div>
          <div className="text-[11px] text-emerald-400 mt-1">Ready for new hires</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Annual Subscription Cost</div>
          <div className="text-xl font-bold text-amber-400">৳{totalAnnualCost.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total IT software budget</div>
        </div>
      </div>

      {/* Software List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {softwareAccounts.map((item) => {
          const isExpired = item.expiryDate && item.expiryDate < today();
          const utilizationPct = item.totalLicenses
            ? Math.round((item.assignedCount / item.totalLicenses) * 100)
            : 0;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key size={14} className="text-purple-400" />
                    {item.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Vendor: <strong className="text-slate-300">{item.vendor}</strong> • {item.licenseType}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Seat Meter */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Seats Utilization</span>
                  <span className="font-semibold text-white">
                    {item.assignedCount} / {item.totalLicenses} Seats ({utilizationPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${utilizationPct}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px] block">Renewal Expiry:</span>
                  <span className={`font-mono ${isExpired ? 'text-red-400 font-bold' : ''}`}>
                    {item.expiryDate || 'Perpetual'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Annual Cost:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    ৳{item.annualCost?.toLocaleString()} BDT
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  {item.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Software Modal */}
      {modalOpen && (
        <div className="marketing-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="marketing-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="marketing-modal-header">
              <h3 className="text-base font-semibold text-white">
                {editingItem ? 'Edit Software License Pool' : 'Register New Software License'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="marketing-modal-body space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Software Package / Domain Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Microsoft 365 Business Standard / epiups.com.bd"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vendor / Reseller
                  </label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="e.g. Flora Limited / Microsoft"
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    License Type
                  </label>
                  <input
                    type="text"
                    value={form.licenseType}
                    onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                    placeholder="e.g. Annual Cloud Subscription"
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Total Seats / Licenses
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.totalLicenses}
                    onChange={(e) => setForm({ ...form, totalLicenses: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assigned Seats
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.assignedCount}
                    onChange={(e) => setForm({ ...form, assignedCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Annual Cost (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.annualCost}
                    onChange={(e) => setForm({ ...form, annualCost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expiry / Renewal Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  License Keys, Portal URLs or Assignment Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Master admin account: admin@epiups.com.bd; renewal notice 30 days prior"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
                >
                  Save Software License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
