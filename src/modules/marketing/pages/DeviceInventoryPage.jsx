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
          className="btn-mkt-it"
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
            className="mkt-input pl-9 text-xs"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="mkt-select text-xs"
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
            className="mkt-select text-xs"
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
      <div className="mkt-card space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong className="text-white">{filteredDevices.length}</strong> registered hardware assets</span>
        </div>

        <div className="table-responsive">
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Type & Model</th>
                <th>Specifications</th>
                <th>Assigned User & Dept</th>
                <th>Network IP / MAC</th>
                <th>Warranty Expiry</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
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
                    <tr key={dev.id}>
                      <td className="font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {dev.deviceTag}
                      </td>

                      <td>
                        <div className="font-semibold text-white">{dev.brandModel}</div>
                        <div className="text-[11px] text-slate-400">{dev.deviceType}</div>
                      </td>

                      <td className="max-w-[200px]">
                        <div className="text-slate-300 truncate" title={dev.specs}>
                          {dev.specs || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {dev.operatingSystem}
                        </div>
                      </td>

                      <td>
                        <div className="font-medium text-slate-200">{dev.assignedTo || 'Unassigned'}</div>
                        <div className="text-[11px] text-slate-400">{dev.department}</div>
                      </td>

                      <td className="font-mono text-[11px]">
                        <div className="text-slate-300">{dev.ipAddress || 'DHCP'}</div>
                        <div className="text-slate-500 text-[10px]">{dev.macAddress || '—'}</div>
                      </td>

                      <td>
                        <div
                          className={`font-mono text-xs ${
                            isWarrantyExpired ? 'text-red-400 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          {dev.warrantyExpiry || 'N/A'}
                        </div>
                        {isWarrantyExpired && (
                          <span className="mkt-badge mkt-badge-red !text-[9.5px]">Expired</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`mkt-badge ${
                            dev.status === 'Operational'
                              ? 'mkt-badge-green'
                              : dev.status === 'Under Repair'
                              ? 'mkt-badge-amber'
                              : 'mkt-badge-neutral'
                          }`}
                        >
                          {dev.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDeviceModal(dev)}
                            className="btn-mkt-action btn-mkt-edit"
                            title="Edit Device"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(dev.id, dev.deviceTag)}
                            className="btn-mkt-action btn-mkt-delete"
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
