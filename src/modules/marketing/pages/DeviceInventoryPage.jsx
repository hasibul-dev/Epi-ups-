import React, { useState } from 'react';
import {
  Laptop,
  Plus,
  Search,
  Filter,
  Server,
  Printer,
  HardDrive,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

const DEVICE_TYPES = [
  'All',
  'Desktop PC',
  'Laptop',
  'Server',
  'Network Router',
  'Printer / Scanner',
  'NAS Storage',
];

const STATUSES = ['All', 'Operational', 'Under Repair', 'Spare / Unassigned', 'Decommissioned'];

export default function DeviceInventoryPage() {
  const { data, openDeviceModal, deleteDevice, isItRole } = useMarketing();
  const { devices } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.deviceTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.ipAddress && d.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'All' || d.deviceType === typeFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = (id, tag) => {
    if (window.confirm(`Are you sure you want to delete hardware asset "${tag}"?`)) {
      deleteDevice(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">HARDWARE & ASSET INVENTORY</div>
          <h2>Computer & Hardware Asset Inventory</h2>
          <p>
            Track company workstations, laptops, network routers, printers, server hardware, and warranty lifecycles
          </p>
        </div>
        <button
          onClick={() => openDeviceModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>Register Hardware Asset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tag, brand/model, employee, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                Device Type: {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hardware Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found {filteredDevices.length} registered hardware assets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Asset Tag</th>
                <th className="py-2.5 px-3">Type & Model</th>
                <th className="py-2.5 px-3">Specifications</th>
                <th className="py-2.5 px-3">Assigned User & Dept</th>
                <th className="py-2.5 px-3">Network IP / MAC</th>
                <th className="py-2.5 px-3">Warranty Expiry</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                    No hardware assets found.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => {
                  const isWarrantyExpired = dev.warrantyExpiry && dev.warrantyExpiry < today();

                  return (
                    <tr key={dev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {dev.deviceTag}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{dev.brandModel}</div>
                        <div className="text-[11px] text-slate-400">{dev.deviceType}</div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="text-slate-300 truncate" title={dev.specs}>
                          {dev.specs || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {dev.operatingSystem}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{dev.assignedTo || 'Unassigned'}</div>
                        <div className="text-[11px] text-slate-400">{dev.department}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="text-slate-300">{dev.ipAddress || 'DHCP'}</div>
                        <div className="text-slate-500 text-[10px]">{dev.macAddress || '—'}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          className={`font-mono text-xs ${
                            isWarrantyExpired ? 'text-red-400 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          {dev.warrantyExpiry || 'N/A'}
                        </div>
                        {isWarrantyExpired && (
                          <span className="text-[10px] text-red-400 font-medium">Expired</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            dev.status === 'Operational'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : dev.status === 'Under Repair'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {dev.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDeviceModal(dev)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit Device"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(dev.id, dev.deviceTag)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete Device"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
