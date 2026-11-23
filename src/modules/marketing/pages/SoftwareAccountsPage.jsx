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
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">SOFTWARE & LICENSES</div>
          <h2>Licensed Software & Corporate Email Account Pools</h2>
          <p>
            Manage enterprise licenses, Microsoft 365, antivirus endpoints, and business domain email allocations
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-mkt-it"
        >
          <Plus size={15} />
          <span>Add License Pool</span>
        </button>
      </div>

      {/* Aggregate Overview */}
      <div className="mkt-kpi-grid">
        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Managed Software Pools</span>
          <span className="mkt-stat-val text-white">{softwareAccounts.length}</span>
          <span className="mkt-stat-sub">Enterprise subscriptions</span>
        </div>

        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Total Licensed Seats</span>
          <span className="mkt-stat-val text-cyan-400">{totalSeats} Seats</span>
          <span className="mkt-stat-sub">{assignedSeats} Assigned to Users</span>
        </div>

        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Available Free Seats</span>
          <span className="mkt-stat-val text-emerald-400">{Math.max(0, totalSeats - assignedSeats)} Seats</span>
          <span className="mkt-stat-sub">Ready for new hires</span>
        </div>

        <div className="mkt-stat-card">
          <span className="mkt-stat-label">Annual Subscription Cost</span>
          <span className="mkt-stat-val text-amber-400">৳{totalAnnualCost.toLocaleString()}</span>
          <span className="mkt-stat-sub">Total IT software budget</span>
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
              className="mkt-card space-y-4 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key size={14} className="text-cyan-400" />
                    {item.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Vendor: <strong className="text-slate-300">{item.vendor}</strong> • {item.licenseType}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(item)}
                    className="btn-mkt-action btn-mkt-edit"
                    title="Edit Pool"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="btn-mkt-action btn-mkt-delete"
                    title="Delete Pool"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Seat Meter */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Seats Utilization</span>
                  <span className="font-semibold text-white">
                    {item.assignedCount} / {item.totalLicenses} Seats ({utilizationPct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
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
                <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                  {item.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Software Modal */}
      {modalOpen && (
        <div className="mkt-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="mkt-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="mkt-modal-header">
              <h3 className="text-base font-semibold text-white">
                {editingItem ? 'Edit Software License Pool' : 'Register New Software License'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="mkt-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mkt-modal-body">
                <div className="mkt-form-group">
                  <label className="mkt-form-label">
                    Software Package / Domain Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Microsoft 365 Business Standard / epiups.com.bd"
                    className="mkt-form-input"
                  />
                </div>

                <div className="mkt-form-row">
                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      Vendor / Reseller
                    </label>
                    <input
                      type="text"
                      value={form.vendor}
                      onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                      placeholder="e.g. Flora Limited / Microsoft"
                      className="mkt-form-input"
                    />
                  </div>

                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      License Type
                    </label>
                    <input
                      type="text"
                      value={form.licenseType}
                      onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                      placeholder="e.g. Annual Cloud Subscription"
                      className="mkt-form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      Total Seats
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.totalLicenses}
                      onChange={(e) => setForm({ ...form, totalLicenses: e.target.value })}
                      className="mkt-form-input font-mono"
                    />
                  </div>

                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      Assigned Seats
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.assignedCount}
                      onChange={(e) => setForm({ ...form, assignedCount: e.target.value })}
                      className="mkt-form-input font-mono"
                    />
                  </div>

                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      Annual Cost (৳ BDT)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.annualCost}
                      onChange={(e) => setForm({ ...form, annualCost: e.target.value })}
                      className="mkt-form-input font-mono"
                    />
                  </div>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-form-label">
                    Expiry / Renewal Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="mkt-form-input"
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-form-label">
                    License Keys, Portal URLs or Assignment Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Master admin account: admin@epiups.com.bd; renewal notice 30 days prior"
                    className="mkt-form-textarea"
                  />
                </div>
              </div>

              <div className="mkt-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-mkt-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-mkt-it"
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
