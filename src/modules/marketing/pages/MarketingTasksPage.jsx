import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

const CATEGORIES = ['All', 'Copywriting', 'SEO / Website', 'Advertising', 'Social Media', 'Design'];
const STATUSES = ['All', 'To Do', 'In Progress', 'Completed'];

export default function MarketingTasksPage() {
  const { data, openTaskModal, saveTask, deleteTask } = useMarketing();
  const { marketingTasks } = data;

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTasks = marketingTasks.filter((t) => {
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchCat && matchStatus;
  });

  const toggleTaskStatus = (task) => {
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    saveTask({ ...task, status: nextStatus });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      deleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">MARKETING DELIVERABLES</div>
          <h2>Marketing Deliverables & Action Items</h2>
          <p>
            Track copy drafts, digital campaign audits, SEO content, and graphic design tasks
          </p>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`mkt-pill-filter ${categoryFilter === cat ? 'active-purple' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mkt-select !w-auto !py-1.5 !px-3 text-xs"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="mkt-card p-8 text-center text-slate-400 text-xs">
            No marketing tasks match the current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`mkt-card !p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone ? 'opacity-70' : 'hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 text-slate-500 hover:text-purple-400 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isDone ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`mkt-badge ${
                          task.priority === 'High' || task.priority === 'Urgent'
                            ? 'mkt-badge-red'
                            : 'mkt-badge-neutral'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.desc && (
                      <p className="text-xs text-slate-400 line-clamp-1">{task.desc}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="mkt-badge mkt-badge-purple">{task.category}</span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-slate-300">{task.assignedTo}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        Due {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={task.status}
                    onChange={(e) => saveTask({ ...task, status: e.target.value })}
                    className="mkt-select !w-auto !py-1 !px-2.5 text-xs font-semibold"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => openTaskModal(task)}
                    className="btn-mkt-action btn-mkt-edit"
                    title="Edit Task"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id, task.title)}
                    className="btn-mkt-action btn-mkt-delete"
                    title="Delete Task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
