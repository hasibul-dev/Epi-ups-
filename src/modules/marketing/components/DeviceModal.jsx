import React, { useState, useEffect } from 'react';
import { X, Server, Save } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

const DEVICE_TYPES = [
  'Desktop PC',
  'Laptop',
  'Server',
  'Network Router',
  'Network Switch',
  'Printer / Scanner',
  'UPS / Power Device',
  'NAS Storage',
  'Other',
];

const DEPARTMENTS = [
  'Executive Admin',
  'Sales Department',
  'Service Department',
  'Accounts & ERP',
  'Digital Marketing & IT Support',
  'Server Room / Infrastructure',
];

const STATUS_OPTIONS = [
  'Operational',
  'Under Repair',
  'Spare / Unassigned',
  'Decommissioned',
];

export default function DeviceModal() {
  const { deviceModal, closeDeviceModal, saveDevice } = useMarketing();
  const { open, item } = deviceModal;

  const [form, setForm] = useState({
    deviceTag: '',
    deviceType: 'Desktop PC',
    brandModel: '',
    specs: '',
    operatingSystem: 'Windows 11 Pro 64-bit',
    assignedTo: '',
    department: 'Sales Department',
    ipAddress: '',
    macAddress: '',
    purchaseDate: today(),
    warrantyExpiry: '',
    status: 'Operational',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        deviceTag: item.deviceTag || '',
        deviceType: item.deviceType || 'Desktop PC',
        brandModel: item.brandModel || '',
        specs: item.specs || '',
        operatingSystem: item.operatingSystem || 'Windows 11 Pro 64-bit',
        assignedTo: item.assignedTo || '',
        department: item.department || 'Sales Department',
        ipAddress: item.ipAddress || '',
        macAddress: item.macAddress || '',
        purchaseDate: item.purchaseDate || today(),
        warrantyExpiry: item.warrantyExpiry || '',
        status: item.status || 'Operational',
        notes: item.notes || '',
      });
    } else {
      setForm({
        deviceTag: `EPI-IT-DEV-${Date.now().toString(36).toUpperCase()}`,
        deviceType: 'Desktop PC',
        brandModel: '',
        specs: '',
        operatingSystem: 'Windows 11 Pro 64-bit',
        assignedTo: '',
        department: 'Sales Department',
        ipAddress: '192.168.1.',
        macAddress: '',
        purchaseDate: today(),
        warrantyExpiry: '',
        status: 'Operational',
        notes: '',
      });
    }
    setError('');
  }, [item, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.deviceTag.trim()) {
      setError('Device Tag / Asset ID is required');
      return;
    }
    if (!form.brandModel.trim()) {
      setError('Brand & Model name is required');
      return;
    }

    saveDevice({
      ...(item ? { id: item.id } : {}),
      ...form,
    });
    closeDeviceModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeDeviceModal}>
      <div className="marketing-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="marketing-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {item ? 'Edit IT Hardware Device' : 'Register New Hardware Device'}
              </h3>
              <p className="text-xs text-slate-400">
                Record computer, networking or peripheral asset specifications and assignment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDeviceModal}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Asset Tag / Device ID *
              </label>
              <input
                type="text"
                name="deviceTag"
                value={form.deviceTag}
                onChange={handleChange}
                placeholder="e.g. EPI-IT-DT-05"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Device Type *
              </label>
              <select
                name="deviceType"
                value={form.deviceType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              >
                {DEVICE_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Brand & Model *
              </label>
              <input
                type="text"
                name="brandModel"
                value={form.brandModel}
                onChange={handleChange}
                placeholder="e.g. Dell Latitude 3420 / HP ProDesk"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operating System / Firmware
              </label>
              <input
                type="text"
                name="operatingSystem"
                value={form.operatingSystem}
                onChange={handleChange}
                placeholder="e.g. Windows 11 Pro 64-bit"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hardware Specifications (CPU, RAM, Storage, Graphics)
            </label>
            <input
              type="text"
              name="specs"
              value={form.specs}
              onChange={handleChange}
              placeholder="e.g. Core i5-1135G7, 16GB DDR4, 512GB NVMe SSD"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assigned Employee / User
              </label>
              <input
                type="text"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                placeholder="e.g. MD. MAHMUDUL HASAN / Shared Workstation"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Static IP Address (LAN)
              </label>
              <input
                type="text"
                name="ipAddress"
                value={form.ipAddress}
                onChange={handleChange}
                placeholder="192.168.1.xxx"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                MAC Address
              </label>
              <input
                type="text"
                name="macAddress"
                value={form.macAddress}
                onChange={handleChange}
                placeholder="XX:XX:XX:XX:XX:XX"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Warranty Expiry Date
              </label>
              <input
                type="date"
                name="warrantyExpiry"
                value={form.warrantyExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Device Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Technical Remarks & History
            </label>
            <textarea
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Repaired fan in 2025; upgraded to 16GB RAM; primary workstation"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeDeviceModal}
              className="btn-mkt-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-mkt-primary"
            >
              <Save size={14} />
              <span>{item ? 'Update Device' : 'Save Device'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
