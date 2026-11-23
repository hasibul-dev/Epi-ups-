import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Bell,
  Check,
  Tag,
  ArrowUpDown,
  Sparkles,
  Layers,
  Flag,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';
import MarketingNotificationsDrawer from '../components/MarketingNotificationsDrawer.jsx';

const CATEGORIES = [
  'All',
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

const PRIORITIES = ['All', 'Urgent', 'High', 'Normal', 'Low'];

export default function MarketingTasksPage() {
  const {
    data,
    openTaskModal,
    saveTask,
    deleteTask,
    user,
    notifications,
    unreadNotificationsCount,
  } = useMarketing();

  const { marketingTasks = [] } = data;
  const currentToday = today();

  // View Mode: 'today' | 'all'
  const [viewMode, setViewMode] = useState('today');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('All'); // 'All' | 'My Tasks' | 'Assigned' | 'In Progress' | 'Completed' | 'Overdue'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Notification Drawer state
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // --------------------------------------------------------------------------
  // DYNAMIC TODAY'S WORK COMPUTATIONS
  // --------------------------------------------------------------------------
  const todayMetrics = useMemo(() => {
    // Tasks relevant for Today:
    // 1. Due today
    // 2. Overdue (due before today & not completed)
    // 3. Active today (startDate <= today && dueDate >= today)
    // 4. In progress today
    // 5. Completed today
    const tasksToday = marketingTasks.filter((t) => {
      const isDueToday = t.dueDate === currentToday;
      const isOverdue = t.dueDate && t.dueDate < currentToday && t.status !== 'Completed';
      const isActiveToday = (t.startDate && t.startDate <= currentToday) && (t.dueDate && t.dueDate >= currentToday);
      const isInProgress = t.status === 'In Progress';
      const isDoneToday = t.status === 'Completed' && (
        (t.completedAt && t.completedAt.startsWith(currentToday)) ||
        t.dueDate === currentToday
      );
      return isDueToday || isOverdue || isActiveToday || isInProgress || isDoneToday;
    });

    const pending = tasksToday.filter((t) => t.status === 'To Do').length;
    const inProgress = tasksToday.filter((t) => t.status === 'In Progress').length;
    const completed = tasksToday.filter((t) => t.status === 'Completed').length;
    const overdue = marketingTasks.filter(
      (t) => t.dueDate && t.dueDate < currentToday && t.status !== 'Completed'
    ).length;

    return {
      totalToday: tasksToday.length,
      pending,
      inProgress,
      completed,
      overdue,
      todayList: tasksToday,
    };
  }, [marketingTasks, currentToday]);

  // --------------------------------------------------------------------------
  // FILTERED TASKS COMPUTATION
  // --------------------------------------------------------------------------
  const displayTasks = useMemo(() => {
    // Base source depends on viewMode
    let baseList = viewMode === 'today' ? todayMetrics.todayList : marketingTasks;

    return baseList.filter((task) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(query);
        const matchDesc = (task.desc || '').toLowerCase().includes(query);
        const matchAssignee = (task.assignedTo || '').toLowerCase().includes(query);
        const matchCategory = (task.category || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchAssignee && !matchCategory) {
          return false;
        }
      }

      // 2. Quick Filter
      const isOverdue = task.dueDate && task.dueDate < currentToday && task.status !== 'Completed';
      if (quickFilter === 'My Tasks') {
        const userName = (user?.name || '').toLowerCase();
        if (!task.assignedTo || !userName || !task.assignedTo.toLowerCase().includes(userName)) {
          return false;
        }
      } else if (quickFilter === 'Assigned') {
        if (!task.assignedTo || task.assignedTo === 'Unassigned') return false;
      } else if (quickFilter === 'In Progress') {
        if (task.status !== 'In Progress') return false;
      } else if (quickFilter === 'Completed') {
        if (task.status !== 'Completed') return false;
      } else if (quickFilter === 'Overdue') {
        if (!isOverdue) return false;
      }

      // 3. Category Filter
      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }

      // 4. Priority Filter
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [
    viewMode,
    todayMetrics.todayList,
    marketingTasks,
    searchQuery,
    quickFilter,
    categoryFilter,
    priorityFilter,
    currentToday,
    user?.name,
  ]);

  // Quick inline status update
  const handleQuickStatusChange = (task, newStatus) => {
    saveTask({ ...task, status: newStatus });
  };

  const handleToggleDone = (task) => {
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    saveTask({ ...task, status: nextStatus });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      deleteTask(id);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="mkt-badge mkt-badge-red flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="mkt-badge mkt-badge-amber flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            High
          </span>
        );
      case 'Normal':
        return (
          <span className="mkt-badge mkt-badge-blue flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Normal
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="mkt-badge mkt-badge-neutral flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & WORK ACTIONS                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="mkt-hero-banner !py-4 !px-5">
        <div className="mkt-hero-info">
          <div className="flex items-center gap-2 mb-1">
            <span className="mkt-hero-badge">WORK & TASK MANAGEMENT</span>
            <span className="text-[11px] text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30">
              {marketingTasks.length} Total Deliverables
            </span>
          </div>
          <h2>Enterprise Work Allocation & Deliverables</h2>
          <p>
            Assign, schedule, and track all marketing deliverables and IT support tasks with live assignment notifications
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* In-App Notifications Bell Button */}
          <button
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative px-3 py-2 rounded-xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.15)]"
            title="View Assignment Notifications"
          >
            <Bell size={15} className="text-purple-400" />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none animate-pulse">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-normal">({notifications.length})</span>
            )}
          </button>

          {/* New Task / Assign Work Button */}
          <button
            onClick={() => openTaskModal()}
            className="btn-mkt-primary"
          >
            <Plus size={15} />
            <span>+ Assign Work</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DEDICATED TODAY'S WORK KPI DASHBOARD SUMMARY               */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Today's Work Summary Overview
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">({currentToday})</span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('today')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'today'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Today's Work ({todayMetrics.totalToday})</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'all'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>All Tasks ({marketingTasks.length})</span>
            </button>
          </div>
        </div>

        <div className="mkt-today-kpi-grid">
          {/* Card 1: Total Tasks Today */}
          <div
            onClick={() => {
              setViewMode('today');
              setQuickFilter('All');
            }}
            className="mkt-today-kpi-card cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tasks Today
              </span>
              <div className="text-xl font-extrabold text-white leading-tight">
                {todayMetrics.totalToday}
              </div>
              <span className="text-[10px] text-sky-400/80">Active / Due Today</span>
            </div>
          </div>

          {/* Card 2: Pending (To Do) */}
          <div
            onClick={() => {
              setViewMode('today');
              setQuickFilter('All');
            }}
            className="mkt-today-kpi-card cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-slate-500/15 border border-slate-500/30 text-slate-300">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pending Tasks
              </span>
              <div className="text-xl font-extrabold text-white leading-tight">
                {todayMetrics.pending}
              </div>
              <span className="text-[10px] text-slate-400">Awaiting kickoff</span>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div
            onClick={() => {
              setViewMode('today');
              setQuickFilter('In Progress');
            }}
            className="mkt-today-kpi-card cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <CheckSquare size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                In Progress
              </span>
              <div className="text-xl font-extrabold text-white leading-tight">
                {todayMetrics.inProgress}
              </div>
              <span className="text-[10px] text-purple-400/80">Under execution</span>
            </div>
          </div>

          {/* Card 4: Completed Tasks */}
          <div
            onClick={() => {
              setViewMode('today');
              setQuickFilter('Completed');
            }}
            className="mkt-today-kpi-card cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Completed
              </span>
              <div className="text-xl font-extrabold text-emerald-300 leading-tight">
                {todayMetrics.completed}
              </div>
              <span className="text-[10px] text-emerald-400/80">Delivered</span>
            </div>
          </div>

          {/* Card 5: Overdue Tasks Alert */}
          <div
            onClick={() => {
              setViewMode('all');
              setQuickFilter('Overdue');
            }}
            className={`mkt-today-kpi-card cursor-pointer ${
              todayMetrics.overdue > 0 ? 'is-overdue-alert' : ''
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border ${
                todayMetrics.overdue > 0
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-slate-800 border-white/10 text-slate-400'
              }`}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Overdue Tasks
              </span>
              <div
                className={`text-xl font-extrabold leading-tight ${
                  todayMetrics.overdue > 0 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {todayMetrics.overdue}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  todayMetrics.overdue > 0 ? 'text-rose-300' : 'text-slate-500'
                }`}
              >
                {todayMetrics.overdue > 0 ? 'Immediate action required' : 'No overdue items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SEARCH & ADVANCED FILTER TOOLBAR                           */}
      {/* ------------------------------------------------------------- */}
      <div className="mkt-card !p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, employee or category..."
              className="mkt-input !pl-9 !py-1.5 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mkt-select !w-auto !py-1.5 !px-3 text-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              Priority:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="mkt-select !w-auto !py-1.5 !px-3 text-xs"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick View:</span>
            {[
              { id: 'All', label: 'All' },
              { id: 'My Tasks', label: 'My Tasks' },
              { id: 'Assigned', label: 'Assigned Tasks' },
              { id: 'In Progress', label: 'In Progress' },
              { id: 'Completed', label: 'Completed' },
              { id: 'Overdue', label: 'Overdue' },
            ].map((f) => {
              const active = quickFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setQuickFilter(f.id)}
                  className={`mkt-pill-filter ${active ? 'active-purple' : ''} ${
                    f.id === 'Overdue' && todayMetrics.overdue > 0 && !active
                      ? '!text-rose-400 !border-rose-500/30'
                      : ''
                  }`}
                >
                  <span>{f.label}</span>
                  {f.id === 'Overdue' && todayMetrics.overdue > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300">
                      {todayMetrics.overdue}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <strong className="text-white">{displayTasks.length}</strong> of{' '}
            {marketingTasks.length} tasks
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. UNIFIED COMPACT TASK TABLE                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="mkt-table-container">
        <table className="mkt-work-table">
          <thead>
            <tr>
              <th className="w-10 text-center">Done</th>
              <th className="min-w-[280px]">Task Title & Deliverable Details</th>
              <th className="w-32">Category</th>
              <th className="w-44">Assigned To</th>
              <th className="w-24">Priority</th>
              <th className="w-40">Due Date & Time</th>
              <th className="w-32">Status</th>
              <th className="w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckSquare size={32} className="text-slate-600" />
                    <span className="font-medium">No tasks found matching the selected filters</span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setQuickFilter('All');
                        setCategoryFilter('All');
                        setPriorityFilter('All');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold mt-1"
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              displayTasks.map((task) => {
                const isDone = task.status === 'Completed';
                const isOverdue =
                  task.dueDate && task.dueDate < currentToday && !isDone;
                const isDueToday = task.dueDate === currentToday;

                return (
                  <tr
                    key={task.id}
                    className={`${isDone ? 'is-completed' : ''} ${
                      isOverdue ? 'is-overdue' : ''
                    }`}
                  >
                    {/* Toggle Done Checkbox */}
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleDone(task)}
                        className="text-slate-500 hover:text-purple-400 transition-colors p-1"
                        title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <Circle size={18} />
                        )}
                      </button>
                    </td>

                    {/* Title & Description */}
                    <td>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-xs leading-snug ${
                              isDone ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        {task.desc && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {task.desc}
                          </p>
                        )}
                        {task.assignedBy && (
                          <div className="text-[10px] text-slate-500">
                            Assigned by: <span className="text-slate-400">{task.assignedBy}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="mkt-badge mkt-badge-purple text-[10.5px]">
                        {task.category || 'General'}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300 flex-shrink-0">
                          {(task.assignedTo || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate">
                            {task.assignedTo || 'Unassigned'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td>{getPriorityBadge(task.priority)}</td>

                    {/* Due Date & Overdue Tag */}
                    <td>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                          <span>{task.dueDate || 'No date'}</span>
                          {task.dueTime && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {task.dueTime}
                            </span>
                          )}
                        </div>

                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300">
                            <AlertTriangle size={10} />
                            Overdue
                          </span>
                        )}

                        {isDueToday && !isDone && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                            <Clock size={10} />
                            Due Today
                          </span>
                        )}

                        {isDone && (
                          <span className="text-[10px] text-emerald-400/80 font-medium">
                            ✓ Done
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status with Quick Interactive Dropdown */}
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => handleQuickStatusChange(task, e.target.value)}
                        className={`mkt-table-status-select ${
                          task.status === 'Completed'
                            ? 'mkt-status-completed'
                            : task.status === 'In Progress'
                            ? 'mkt-status-progress'
                            : 'mkt-status-todo'
                        }`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTaskModal(task)}
                          className="btn-mkt-action btn-mkt-edit"
                          title="Edit Task Details"
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. IN-APP NOTIFICATIONS DRAWER COMPONENT                      */}
      {/* ------------------------------------------------------------- */}
      <MarketingNotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}
