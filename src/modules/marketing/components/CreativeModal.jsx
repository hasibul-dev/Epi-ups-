import React, { useState, useEffect } from 'react';
import { X, Palette, Save } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, addDays } from '../../sales/utils/helpers.js';

const DEPARTMENTS = [
  'Sales Department',
  'Service Department',
  'Accounts & ERP',
  'Executive Admin',
  'Digital Marketing & IT Support',
];

const CREATIVE_TYPES = [
  'Exhibition Standee',
  'Product Flyer / Brochure',
  'Social Media Banner',
  'Datasheet / Catalog Design',
  'Video Animation',
  'Other',
];

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const STATUSES = ['Briefed', 'In Progress', 'In Review', 'Approved', 'Completed'];

export default function CreativeModal() {
  const { creativeModal, closeCreativeModal, saveCreativeRequest } = useMarketing();
  const { open, item } = creativeModal;

  const [form, setForm] = useState({
    title: '',
    requestingDept: 'Sales Department',
    type: 'Social Media Banner',
    priority: 'Normal',
    dueDate: addDays(today(), 5),
    assignedDesigner: 'Samia Jahan',
    dimensions: '1080x1080 (Square)',
    brief: '',
    status: 'Briefed',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        requestingDept: item.requestingDept || 'Sales Department',
        type: item.type || 'Social Media Banner',
        priority: item.priority || 'Normal',
        dueDate: item.dueDate || addDays(today(), 5),
        assignedDesigner: item.assignedDesigner || 'Samia Jahan',
        dimensions: item.dimensions || '1080x1080 (Square)',
        brief: item.brief || '',
        status: item.status || 'Briefed',
        notes: item.notes || '',
      });
    } else {
      setForm({
        title: '',
        requestingDept: 'Sales Department',
        type: 'Social Media Banner',
        priority: 'Normal',
        dueDate: addDays(today(), 5),
        assignedDesigner: 'Samia Jahan',
        dimensions: '1080x1080 (Square)',
        brief: '',
        status: 'Briefed',
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
    if (!form.title.trim()) {
      setError('Request title is required');
      return;
    }

    saveCreativeRequest({
      ...(item ? { id: item.id } : {}),
      ...form,
      title: form.title.trim(),
    });
    closeCreativeModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeCreativeModal}>
      <div className="marketing-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="marketing-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {item ? 'Edit Creative & Design Request' : 'New Creative / Design Request'}
              </h3>
              <p className="text-xs text-slate-400">
                Design requests from Sales, Service, or Executive Admin for marketing collateral
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCreativeModal}
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
              Creative Request Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. 10kVA UPS Roll-Up Standee for Industrial Trade Fair"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Requesting Department
              </label>
              <select
                name="requestingDept"
                value={form.requestingDept}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Creative Asset Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {CREATIVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Required Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assigned Designer
              </label>
              <input
                type="text"
                name="assignedDesigner"
                value={form.assignedDesigner}
                onChange={handleChange}
                placeholder="e.g. Samia Jahan"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Dimensions / Format
              </label>
              <input
                type="text"
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="e.g. 33x79 inches (300 DPI) or A4 Flyer"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Creative Brief / Instructions
            </label>
            <textarea
              name="brief"
              rows={3}
              value={form.brief}
              onChange={handleChange}
              placeholder="What are the key elements, product specs, headline, CTA and branding requirements?"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeCreativeModal}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-medium text-white shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              <Save size={14} />
              {item ? 'Update Request' : 'Save Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
