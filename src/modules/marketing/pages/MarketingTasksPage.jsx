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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="text-purple-400" size={20} />
            Marketing Deliverables & Action Items
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track copy drafts, digital campaign audits, SEO content, and graphic design tasks
          </p>
        </div>
        <button
          onClick={() => openTaskModal()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
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
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No marketing tasks match the current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-900/30 border-slate-800/60 opacity-75'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
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
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          task.priority === 'High' || task.priority === 'Urgent'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.desc && (
                      <p className="text-xs text-slate-400 line-clamp-1">{task.desc}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span className="text-purple-400 font-medium">{task.category}</span>
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
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    onClick={() => openTaskModal(task)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit Task"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id, task.title)}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
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
