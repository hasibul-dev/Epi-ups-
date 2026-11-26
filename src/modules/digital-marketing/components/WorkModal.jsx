import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckSquare,
  Save,
  Calendar,
  Clock,
  User,
  AlertCircle,
  FileText,
  Tag,
  Flag,
  Paperclip,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today } from '../../sales/utils/helpers.js';

const TASK_CATEGORIES = [
  'SEO / Website',
  'Advertising',
  'Social Media',
  'Graphic Design',
  'Content / Copywriting',
  'Video / Animation',
  'Event / Campaign',
  'Technical / IT Support',
  'Other',
];

const DEFAULT_EMPLOYEES = [
  { name: 'Tanvir Ahmed', role: 'Lead Marketing Specialist' },
  { name: 'Samia Jahan', role: 'Content & Social Media' },
  { name: 'Rafiul Islam', role: 'Digital Ads Specialist' },
  { name: 'Md. Al-Amin', role: 'Senior IT Support Engineer' },
  { name: 'Kamrul Hasan', role: 'IT Support Technician' },
  { name: 'Kazi Nasim', role: 'Network & Hardware Specialist' },
];

const PRIORITIES = ['Urgent', 'High', 'Normal', 'Low'];
const STATUS_OPTIONS = ['Assigned', 'In Progress', 'Completed', 'On Hold'];

export default function WorkModal() {
  const { taskModal, closeTaskModal, saveTask, user } = useMarketing();
  const { open, item } = taskModal;

  const employeeList = useMemo(() => {
    try {
      const dbUsers = centralStore.getUsers();
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        const mapped = dbUsers.map((u) => ({
          name: u.name || u.userId,
          role: u.role || 'Employee',
        }));
        const names = new Set(mapped.map((m) => m.name.toLowerCase()));
        DEFAULT_EMPLOYEES.forEach((def) => {
          if (!names.has(def.name.toLowerCase())) {
            mapped.push(def);
          }
        });
        return mapped;
      }
    } catch {}
    return DEFAULT_EMPLOYEES;
  }, []);

  const [form, setForm] = useState({
    title: '',
    category: 'SEO / Website',
    assignedTo: 'Tanvir Ahmed',
    customAssignee: '',
    startDate: today(),
    dueDate: today(),
    dueTime: '18:00',
    priority: 'Normal',
    status: 'Assigned',
    refInfo: '',
    desc: '',
    instructions: '',
    attachment: '',
  });

  const [isCustomAssignee, setIsCustomAssignee] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      const isKnown = employeeList.some((e) => e.name.toLowerCase() === (item.assignedTo || '').toLowerCase());
      setForm({
        title: item.title || '',
        category: item.category || 'SEO / Website',
        assignedTo: isKnown ? item.assignedTo : (item.assignedTo ? 'CUSTOM_OTHER' : 'Tanvir Ahmed'),
        customAssignee: isKnown ? '' : (item.assignedTo || ''),
        startDate: item.startDate || today(),
        dueDate: item.dueDate || today(),
        dueTime: item.dueTime || '18:00',
        priority: item.priority || 'Normal',
        status: item.status || 'Assigned',
        refInfo: item.refInfo || item.projectInfo || '',
        desc: item.desc || '',
        instructions: item.instructions || '',
        attachment: item.attachment || '',
      });
      setIsCustomAssignee(!isKnown && Boolean(item.assignedTo));
    } else {
      setForm({
        title: '',
        category: 'SEO / Website',
        assignedTo: user?.name || 'Tanvir Ahmed',
        customAssignee: '',
        startDate: today(),
        dueDate: today(),
        dueTime: '18:00',
        priority: 'Normal',
        status: 'Assigned',
        refInfo: '',
        desc: '',
        instructions: '',
        attachment: '',
      });
      setIsCustomAssignee(false);
    }
    setError('');
  }, [item, open, user, employeeList]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'assignedTo') {
      if (value === 'CUSTOM_OTHER') {
        setIsCustomAssignee(true);
        setForm((prev) => ({ ...prev, assignedTo: 'CUSTOM_OTHER' }));
      } else {
        setIsCustomAssignee(false);
        setForm((prev) => ({ ...prev, assignedTo: value, customAssignee: '' }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Work Title is required');
      return;
    }

    const finalAssignedTo = isCustomAssignee
      ? (form.customAssignee.trim() || 'Unassigned')
      : (form.assignedTo || user?.name || 'Tanvir Ahmed');

    saveTask({
      ...(item ? { id: item.id } : {}),
      title: form.title.trim(),
      category: form.category,
      assignedTo: finalAssignedTo,
      assignedBy: item?.assignedBy || user?.name || 'Super Administrator',
      startDate: form.startDate || today(),
      dueDate: form.dueDate || today(),
      dueTime: form.dueTime || '18:00',
      priority: form.priority,
      status: form.status,
      refInfo: form.refInfo.trim(),
      desc: form.desc.trim(),
      instructions: form.instructions.trim(),
      attachment: form.attachment.trim(),
    });
    closeTaskModal();
  };

  const modalContent = (
    <div className="dm-modal-backdrop" onClick={closeTaskModal}>
      <div className="dm-modal-card max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#25364B] bg-[#08111F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {item ? 'Edit Work Order' : 'Assign New Work Order'}
              </h3>
              <p className="text-xs text-slate-400">
                Allocate marketing deliverables to employees with deadlines & detailed specifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132238] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Work Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Audit Facebook Pixel lead triggers and compare with CRM"
              className="dm-input"
              required
            />
          </div>

          {/* Category & Assigned Employee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Tag size={13} className="text-blue-400" />
                <span>Work Category</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="dm-select"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <User size={13} className="text-sky-400" />
                <span>Assigned Employee</span>
              </label>
              <select
                name="assignedTo"
                value={isCustomAssignee ? 'CUSTOM_OTHER' : form.assignedTo}
                onChange={handleChange}
                className="dm-select"
              >
                {employeeList.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
                <option value="CUSTOM_OTHER">+ External / Custom Employee...</option>
              </select>

              {isCustomAssignee && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customAssignee"
                    value={form.customAssignee}
                    onChange={handleChange}
                    placeholder="Enter employee or contractor name..."
                    className="dm-input text-xs"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Assignment Date, Deadline, Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Assignment Date</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="dm-input text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Calendar size={13} className="text-amber-400" />
                <span>Deadline Date <span className="text-red-400">*</span></span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="dm-input text-xs"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Clock size={13} className="text-sky-400" />
                <span>Deadline Time</span>
              </label>
              <input
                type="time"
                name="dueTime"
                value={form.dueTime}
                onChange={handleChange}
                className="dm-input text-xs"
              />
            </div>
          </div>

          {/* Priority & Initial Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Flag size={13} className="text-red-400" />
                <span>Priority</span>
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="dm-select"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p === 'Urgent' ? '🔴 Urgent' : p === 'High' ? '🟠 High' : p === 'Normal' ? '🔵 Normal' : '⚪ Low'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <CheckSquare size={13} className="text-emerald-400" />
                <span>Initial Status</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="dm-select"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Completed' ? '✅ Completed' : st === 'In Progress' ? '⏳ In Progress' : st === 'On Hold' ? '⏸️ On Hold' : '📋 Assigned'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference / Project Information & Attachment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <FileText size={13} className="text-blue-400" />
                <span>Reference / Project Information</span>
              </label>
              <input
                type="text"
                name="refInfo"
                value={form.refInfo}
                onChange={handleChange}
                placeholder="e.g. 40kVA Online Industrial UPS / Hospital Bid"
                className="dm-input text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Paperclip size={13} className="text-sky-400" />
                <span>Attachment / Document Link</span>
              </label>
              <input
                type="text"
                name="attachment"
                value={form.attachment}
                onChange={handleChange}
                placeholder="e.g. brief_specs.pdf, drive.google.com/..."
                className="dm-input text-xs"
              />
            </div>
          </div>

          {/* Detailed Work Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <FileText size={13} className="text-slate-400" />
              <span>Detailed Work Description</span>
            </label>
            <textarea
              name="desc"
              rows={3}
              value={form.desc}
              onChange={handleChange}
              placeholder="Outline specific deliverables, technical specifications, objectives, or targets..."
              className="dm-input !h-auto !py-2.5 resize-none text-xs"
            />
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <CheckSquare size={13} className="text-slate-400" />
              <span>Additional Instructions</span>
            </label>
            <textarea
              name="instructions"
              rows={2}
              value={form.instructions}
              onChange={handleChange}
              placeholder="Any special guidelines, testing requirements, collaboration notes or format criteria..."
              className="dm-input !h-auto !py-2 resize-none text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#25364B]">
            <span className="text-[11px] text-slate-400">
              Assigned by: <strong className="text-slate-200">{item?.assignedBy || user?.name || 'Super Administrator'}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeTaskModal}
                className="dm-btn dm-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="dm-btn dm-btn-primary"
              >
                <Save size={14} />
                <span>{item ? 'Update Work Order' : 'Assign Work'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
