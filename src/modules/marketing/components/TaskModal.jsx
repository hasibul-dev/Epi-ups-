import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Save } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, addDays } from '../../sales/utils/helpers.js';

const TASK_CATEGORIES = [
  'Copywriting',
  'SEO / Website',
  'Advertising',
  'Social Media',
  'Design',
  'Event / Trade Show',
  'Other',
];

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const STATUS_OPTIONS = ['To Do', 'In Progress', 'Completed'];

export default function TaskModal() {
  const { taskModal, closeTaskModal, saveTask, user } = useMarketing();
  const { open, item } = taskModal;

  const [form, setForm] = useState({
    title: '',
    category: 'Social Media',
    assignedTo: '',
    dueDate: addDays(today(), 3),
    priority: 'Normal',
    status: 'To Do',
    desc: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        category: item.category || 'Social Media',
        assignedTo: item.assignedTo || '',
        dueDate: item.dueDate || addDays(today(), 3),
        priority: item.priority || 'Normal',
        status: item.status || 'To Do',
        desc: item.desc || '',
      });
    } else {
      setForm({
        title: '',
        category: 'Social Media',
        assignedTo: user?.name || 'Tanvir Ahmed',
        dueDate: addDays(today(), 3),
        priority: 'Normal',
        status: 'To Do',
        desc: '',
      });
    }
    setError('');
  }, [item, open, user]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }

    saveTask({
      ...(item ? { id: item.id } : {}),
      title: form.title.trim(),
      category: form.category,
      assignedTo: form.assignedTo.trim() || user?.name || 'Marketing Team',
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
      desc: form.desc.trim(),
    });
    closeTaskModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeTaskModal}>
      <div className="marketing-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="marketing-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {item ? 'Edit Marketing Task' : 'Add New Marketing Task'}
              </h3>
              <p className="text-xs text-slate-400">
                Track deliverables, copy drafts, ad audits, and creative deadlines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskModal}
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
              Task Title / Deliverable *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Audit Facebook Pixel lead triggers and compare with CRM"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assigned Employee
              </label>
              <input
                type="text"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                placeholder="e.g. Tanvir Ahmed / Samia Jahan"
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
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
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
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
              Description & Task Details
            </label>
            <textarea
              name="desc"
              rows={3}
              value={form.desc}
              onChange={handleChange}
              placeholder="Detailed instructions, requirements, deliverables or references..."
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
              <span>{item ? 'Update Task' : 'Save Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
