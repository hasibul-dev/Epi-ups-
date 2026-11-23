import React, { useState } from 'react';
import {
  Network,
  Plus,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Trash2,
  Edit2,
  Zap,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function NetworkMaintenancePage() {
  const { data, saveMaintenance, deleteMaintenance, isItRole } = useMarketing();
  const { maintenance } = data;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    type: 'ISP & Fiber Line Check',
    date: today(),
    technician: 'Md. Al-Amin',
    findings: '',
    actionTaken: '',
    status: 'Satisfactory',
  });

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      type: 'ISP & Fiber Line Check',
      date: today(),
      technician: 'Md. Al-Amin',
      findings: 'Primary ISP throughput 50Mbps verified. Ping to gateway 3ms.',
      actionTaken: 'Inspected media converter and cleaned fiber jumper.',
      status: 'Satisfactory',
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      type: item.type || 'ISP & Fiber Line Check',
      date: item.date || today(),
      technician: item.technician || 'Md. Al-Amin',
      findings: item.findings || '',
      actionTaken: item.actionTaken || '',
      status: item.status || 'Satisfactory',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.type.trim()) return;

    saveMaintenance({
      ...(editingItem ? { id: editingItem.id } : {}),
      ...form,
    });
    setModalOpen(false);
  };

  const handleDelete = (id, type) => {
    if (window.confirm(`Are you sure you want to delete maintenance record "${type}"?`)) {
      deleteMaintenance(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">INFRASTRUCTURE & UPTIME</div>
          <h2>Network Infrastructure & Preventive Maintenance</h2>
          <p>
            Optical fiber ISP links, server room climate, backup battery health, and routine scheduled audits
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-mkt-it"
        >
          <Plus size={15} />
          <span>New Maintenance Record</span>
        </button>
      </div>

      {/* Network Links Real-Time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary ISP */}
        <div className="mkt-card !p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Primary Optical Fiber</h3>
            </div>
            <span className="mkt-badge mkt-badge-green">
              Online (Active)
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-300 font-medium">AmberIT Dedicated 50Mbps Bandwidth</div>
            <div className="text-slate-400 text-[11px]">Static IP: 103.112.xx.xx • BDIX Connected</div>
            <div className="text-emerald-400 text-[11px] font-mono mt-1">Latency: 3ms • 99.9% Uptime</div>
          </div>
        </div>

        {/* Secondary ISP */}
        <div className="mkt-card !p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Secondary Backup ISP</h3>
            </div>
            <span className="mkt-badge mkt-badge-blue">
              Standby / Hot-Failover
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-300 font-medium">Link3 Technologies 15Mbps Fiber</div>
            <div className="text-slate-400 text-[11px]">Automatic MikroTik VRRP failover configured</div>
            <div className="text-sky-400 text-[11px] font-mono mt-1">Latency: 8ms • Ready</div>
          </div>
        </div>

        {/* Server Room Environment */}
        <div className="mkt-card !p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Server Room Climate</h3>
            </div>
            <span className="mkt-badge mkt-badge-green">
              Optimal
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-300 font-medium">Temperature: 21.4°C • Humidity: 46%</div>
            <div className="text-slate-400 text-[11px]">Primary AC: 2.0 Ton Inverter (Running)</div>
            <div className="text-cyan-400 text-[11px] font-mono mt-1">UPS DC Bus: 218.4V (100% Charged)</div>
          </div>
        </div>
      </div>

      {/* Maintenance Logs Table */}
      <div className="mkt-card space-y-4">
        <h2 className="text-sm font-semibold text-white">Maintenance History & Inspection Audits</h2>

        <div className="space-y-3">
          {maintenance.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs hover:border-sky-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{item.type}</span>
                  <span className="mkt-badge mkt-badge-green">
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Date: <strong className="text-slate-300">{item.date}</strong></span>
                  <span>•</span>
                  <span>Tech: <strong className="text-cyan-300">{item.technician}</strong></span>
                  <button
                    onClick={() => openEdit(item)}
                    className="btn-mkt-action btn-mkt-edit ml-1.5"
                    title="Edit Record"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.type)}
                    className="btn-mkt-action btn-mkt-delete"
                    title="Delete Record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="text-slate-300">
                <span className="text-slate-400 font-medium">Findings: </span>
                {item.findings}
              </div>

              <div className="text-slate-300">
                <span className="text-slate-400 font-medium">Action Taken: </span>
                {item.actionTaken}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Maintenance Record Modal */}
      {modalOpen && (
        <div className="mkt-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="mkt-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="mkt-modal-header">
              <h3 className="text-base font-semibold text-white">
                {editingItem ? 'Edit Maintenance Record' : 'Record Preventive Maintenance'}
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
                    Maintenance Type / Inspection Activity *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="e.g. ISP & Fiber Line Check / UPS Battery Bank Health Test"
                    className="mkt-form-input"
                  />
                </div>

                <div className="mkt-form-row">
                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="mkt-form-input"
                    />
                  </div>

                  <div className="mkt-form-group">
                    <label className="mkt-form-label">
                      Inspecting Technician
                    </label>
                    <input
                      type="text"
                      value={form.technician}
                      onChange={(e) => setForm({ ...form, technician: e.target.value })}
                      placeholder="e.g. Md. Al-Amin"
                      className="mkt-form-input"
                    />
                  </div>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-form-label">
                    Inspection Findings & Measurements
                  </label>
                  <textarea
                    rows={2}
                    value={form.findings}
                    onChange={(e) => setForm({ ...form, findings: e.target.value })}
                    placeholder="e.g. Verified optical RX power -18.2 dBm; ping to BDIX 4ms..."
                    className="mkt-form-textarea"
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-form-label">
                    Action Taken & Fixes Applied
                  </label>
                  <textarea
                    rows={2}
                    value={form.actionTaken}
                    onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
                    placeholder="e.g. Cleaned fiber ferrule and renewed DHCP leases..."
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
