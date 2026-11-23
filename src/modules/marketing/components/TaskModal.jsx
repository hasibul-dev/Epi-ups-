import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Save, Calendar, Clock, User, AlertCircle, FileText, Tag, Flag } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, addDays } from '../../sales/utils/helpers.js';

const TASK_CATEGORIES = [
  'SEO / Website',
  'Advertising',
  'Social Media',
  'Copywriting',
  'Design',
  'IT Support',
  'Network & Infrastructure',
  'Event / Trade Show',
  'Technical Documentation',
  'Other',
];

const EMPLOYEES = [
  { name: 'Tanvir Ahmed', role: 'Lead Marketing Specialist' },
  { name: 'Samia Jahan', role: 'Content & Social Media' },
  { name: 'Rafiul Islam', role: 'Digital Ads Specialist' },
  { name: 'Md. Al-Amin', role: 'Senior IT Support Engineer' },
  { name: 'Kamrul Hasan', role: 'IT Support Technician' },
  { name: 'Kazi Nasim', role: 'Network & Hardware Specialist' },
  { name: 'MD. MAHMUDUL HASAN', role: 'Sales Manager' },
  { name: 'Chief Accountant', role: 'Accounts & ERP' },
];

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const STATUS_OPTIONS = ['To Do', 'In Progress', 'Completed'];

export default function TaskModal() {
  const { taskModal, closeTaskModal, saveTask, user } = useMarketing();
  const { open, item } = taskModal;

  const [form, setForm] = useState({
    title: '',
    category: 'SEO / Website',
    assignedTo: 'Tanvir Ahmed',
    customAssignee: '',
    startDate: today(),
    dueDate: today(),
    dueTime: '18:00',
    priority: 'Normal',
    status: 'To Do',
    desc: '',
  });

  const [isCustomAssignee, setIsCustomAssignee] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      const isKnown = EMPLOYEES.some((e) => e.name === item.assignedTo);
      setForm({
        title: item.title || '',
        category: item.category || 'SEO / Website',
        assignedTo: isKnown ? item.assignedTo : (item.assignedTo ? 'Other' : 'Tanvir Ahmed'),
        customAssignee: isKnown ? '' : (item.assignedTo || ''),
        startDate: item.startDate || today(),
        dueDate: item.dueDate || today(),
        dueTime: item.dueTime || '18:00',
        priority: item.priority || 'Normal',
        status: item.status || 'To Do',
        desc: item.desc || '',
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
        status: 'To Do',
        desc: '',
      });
      setIsCustomAssignee(false);
    }
    setError('');
  }, [item, open, user]);

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
      setError('Task Title is required');
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
      assignedBy: item?.assignedBy || user?.name || 'Super Admin',
      startDate: form.startDate || today(),
      dueDate: form.dueDate || today(),
      dueTime: form.dueTime || '18:00',
      priority: form.priority,
      status: form.status,
      desc: form.desc.trim(),
    });
    closeTaskModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeTaskModal}>
      <div className="marketing-modal-card max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="marketing-modal-header border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {item ? 'Edit Work Item & Deliverable' : 'Assign New Work Item'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure task parameters, assign team members, and set delivery deadlines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="marketing-modal-body space-y-4 pt-4">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title / Action Item <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Audit Facebook Pixel lead triggers and compare with CRM"
              className="mkt-input"
              required
            />
          </div>

          {/* Category & Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Tag size={13} className="text-purple-400" />
                <span>Category</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mkt-select"
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
                className="mkt-select"
              >
                {EMPLOYEES.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.name} — {emp.role}
                  </option>
                ))}
                <option value="CUSTOM_OTHER">+ Custom Employee / External...</option>
              </select>

              {isCustomAssignee && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customAssignee"
                    value={form.customAssignee}
                    onChange={handleChange}
                    placeholder="Enter employee name or vendor..."
                    className="mkt-input text-xs"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Start Date, Due Date, Due Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="mkt-input text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Calendar size={13} className="text-amber-400" />
                <span>Due Date <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="mkt-input text-xs"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Clock size={13} className="text-sky-400" />
                <span>Due Time</span>
              </label>
              <input
                type="time"
                name="dueTime"
                value={form.dueTime}
                onChange={handleChange}
                className="mkt-input text-xs"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Flag size={13} className="text-rose-400" />
                <span>Priority Level</span>
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mkt-select"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p === 'Urgent' ? '🔴 Urgent (Critical Deadline)' : p === 'High' ? '🟠 High' : p === 'Normal' ? '🔵 Normal' : '⚪ Low'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <CheckSquare size={13} className="text-emerald-400" />
                <span>Task Status</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mkt-select"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Completed' ? '✅ Completed' : st === 'In Progress' ? '⏳ In Progress' : '📋 To Do'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <FileText size={13} className="text-slate-400" />
              <span>Description, Instructions & Deliverable Scope</span>
            </label>
            <textarea
              name="desc"
              rows={3}
              value={form.desc}
              onChange={handleChange}
              placeholder="Outline specific objectives, technical specifications, links, or handoff criteria..."
              className="mkt-input !py-2.5 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Assigned by: <strong className="text-slate-200">{item?.assignedBy || user?.name || 'Super Admin'}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeTaskModal}
                className="btn-mkt-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-mkt-primary"
              >
                <Save size={14} />
                <span>{item ? 'Update Work Item' : 'Assign Work'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
