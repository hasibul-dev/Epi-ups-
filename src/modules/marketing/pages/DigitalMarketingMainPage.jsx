import React, { useState, useMemo } from 'react';
import {
  Megaphone,
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
  Printer,
  History,
  LayoutDashboard,
  Layers,
  FileText,
  Play,
  PauseCircle,
  Paperclip,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today } from '../../sales/utils/helpers.js';
import MarketingNotificationsDrawer from '../components/MarketingNotificationsDrawer.jsx';

const CATEGORIES = [
  'All',
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

const PRIORITIES = ['All', 'Urgent', 'High', 'Normal', 'Low'];
const STATUSES = ['All', 'Assigned', 'In Progress', 'Completed', 'On Hold'];

export default function DigitalMarketingMainPage() {
  const {
    data,
    openTaskModal,
    openTaskUpdateModal,
    openTaskPrintModal,
    saveTask,
    deleteTask,
    user,
    notifications,
    unreadNotificationsCount,
  } = useMarketing();

  const { marketingTasks = [] } = data;
  const currentToday = today();

  // Primary Tab: 'overview' | 'all_works' | 'reports'
  const [activeTab, setActiveTab] = useState('overview');

  // Filter states for "All Works"
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Filter states for "Work History & Reports"
  const [reportEmployee, setReportEmployee] = useState('All');
  const [reportCategory, setReportCategory] = useState('All');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  // Notification Drawer state
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // List of all employees in database
  const employeeOptions = useMemo(() => {
    const list = new Set(['Tanvir Ahmed', 'Samia Jahan', 'Rafiul Islam', 'Md. Al-Amin', 'Kamrul Hasan', 'Kazi Nasim']);
    try {
      const dbUsers = centralStore.getUsers();
      if (Array.isArray(dbUsers)) {
        dbUsers.forEach((u) => {
          if (u.name) list.add(u.name);
        });
      }
    } catch {}
    (marketingTasks || []).forEach((t) => {
      if (t.assignedTo) list.add(t.assignedTo);
    });
    return Array.from(list);
  }, [marketingTasks]);

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS
  // --------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalAssigned = marketingTasks.length;
    const inProgress = marketingTasks.filter((t) => t.status === 'In Progress').length;
    const completed = marketingTasks.filter((t) => t.status === 'Completed').length;
    const onHold = marketingTasks.filter((t) => t.status === 'On Hold').length;

    // Overdue: deadline passed & not completed
    const overdue = marketingTasks.filter(
      (t) => t.dueDate && t.dueDate < currentToday && t.status !== 'Completed'
    ).length;

    // Today's Works: active today or due today
    const todayWorks = marketingTasks.filter((t) => {
      const isDueToday = t.dueDate === currentToday;
      const isAssignedToday = t.startDate === currentToday;
      const isOverdue = t.dueDate && t.dueDate < currentToday && t.status !== 'Completed';
      const isInProgress = t.status === 'In Progress';
      return isDueToday || isAssignedToday || isOverdue || (isInProgress && t.startDate <= currentToday);
    });

    // My Assigned Works
    const userName = (user?.name || '').toLowerCase();
    const myWorks = marketingTasks.filter(
      (t) => t.assignedTo && userName && t.assignedTo.toLowerCase().includes(userName)
    );

    return {
      totalAssigned,
      inProgress,
      completed,
      onHold,
      overdue,
      todayWorksCount: todayWorks.length,
      todayWorks,
      myWorks,
    };
  }, [marketingTasks, currentToday, user?.name]);

  // --------------------------------------------------------------------------
  // FILTERED ALL WORKS
  // --------------------------------------------------------------------------
  const filteredAllWorks = useMemo(() => {
    return marketingTasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchDesc = (task.desc || '').toLowerCase().includes(q);
        const matchEmp = (task.assignedTo || '').toLowerCase().includes(q);
        const matchCat = (task.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchEmp && !matchCat) return false;
      }

      // Employee
      if (employeeFilter !== 'All' && task.assignedTo !== employeeFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'All') {
        if (statusFilter === 'Assigned' && (task.status === 'Assigned' || task.status === 'To Do')) {
          // match
        } else if (task.status !== statusFilter) {
          return false;
        }
      }

      // Date (Assigned Date or Deadline)
      if (dateFilter && task.startDate !== dateFilter && task.dueDate !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [marketingTasks, searchQuery, employeeFilter, categoryFilter, priorityFilter, statusFilter, dateFilter]);

  // --------------------------------------------------------------------------
  // FILTERED WORK HISTORY / REPORTS
  // --------------------------------------------------------------------------
  const filteredHistory = useMemo(() => {
    let list = marketingTasks.filter((t) => t.status === 'Completed');

    if (reportEmployee !== 'All') {
      list = list.filter((t) => t.assignedTo === reportEmployee);
    }

    if (reportCategory !== 'All') {
      list = list.filter((t) => t.category === reportCategory);
    }

    if (reportStartDate) {
      list = list.filter((t) => (t.completedDate || t.dueDate || t.startDate) >= reportStartDate);
    }

    if (reportEndDate) {
      list = list.filter((t) => (t.completedDate || t.dueDate || t.startDate) <= reportEndDate);
    }

    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      list = list.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) ||
          (t.completionNotes && t.completionNotes.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      const dateA = a.completedDate || a.completedAt || a.dueDate || '';
      const dateB = b.completedDate || b.completedAt || b.dueDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [marketingTasks, reportEmployee, reportCategory, reportStartDate, reportEndDate, reportSearch]);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="mkt-badge mkt-badge-green font-bold">✓ Completed</span>;
      case 'In Progress':
        return <span className="mkt-badge mkt-badge-purple font-bold">⏳ In Progress</span>;
      case 'On Hold':
        return <span className="mkt-badge mkt-badge-amber font-bold">⏸️ On Hold</span>;
      case 'Assigned':
      case 'To Do':
      default:
        return <span className="mkt-badge mkt-badge-neutral font-bold">📋 Assigned</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------- */}
      {/* 1. UNIFIED DEPARTMENT HERO BANNER                             */}
      {/* ------------------------------------------------------------- */}
      <div className="mkt-hero-banner !py-4 !px-5">
        <div className="mkt-hero-info">
          <div className="flex items-center gap-2 mb-1">
            <span className="mkt-hero-badge">DIGITAL MARKETING</span>
            <span className="text-[11px] text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30">
              Work & Task Management System
            </span>
          </div>
          <h2>Digital Marketing Operations & Work Allocation</h2>
          <p>
            Centralized work assignment, employee task updates, execution tracking, work history & printable reports
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative px-3 py-2 rounded-xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.15)]"
            title="Assignment Notifications"
          >
            <Bell size={15} className="text-purple-400" />
            <span>Alerts</span>
            {unreadNotificationsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none animate-pulse">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-normal">({notifications.length})</span>
            )}
          </button>

          {/* Print Summary Report */}
          <button
            onClick={() => openTaskPrintModal(null, 'summary')}
            className="btn-mkt-secondary !py-2 text-xs"
            title="Print Official Work Performance Report"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          {/* Primary Action: Add Work */}
          <button
            onClick={() => openTaskModal()}
            className="btn-mkt-primary !py-2"
          >
            <Plus size={15} />
            <span>+ Add Work</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SIMPLE NAVIGATION TABS (Overview, All Works, History)       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>1. Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('all_works')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'all_works'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Layers size={14} />
            <span>2. All Works ({marketingTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <History size={14} />
            <span>3. Work History & Reports ({metrics.completed})</span>
          </button>
        </div>

        {/* User Context Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5">
          <User size={13} className="text-purple-400" />
          <span>Active User: <strong className="text-slate-200">{user?.name || 'Administrator'}</strong></span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & DASHBOARD SUMMARY                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* A. Dashboard Summary Cards */}
          <div className="mkt-today-kpi-grid">
            {/* Total Assigned Works */}
            <div
              onClick={() => setActiveTab('all_works')}
              className="mkt-today-kpi-card cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Layers size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Assigned Works
                </span>
                <div className="text-xl font-extrabold text-white leading-tight">
                  {metrics.totalAssigned}
                </div>
                <span className="text-[10px] text-sky-400/80">System-wide tasks</span>
              </div>
            </div>

            {/* Today's Works */}
            <div
              onClick={() => {
                setActiveTab('all_works');
                setDateFilter(currentToday);
              }}
              className="mkt-today-kpi-card cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today's Works
                </span>
                <div className="text-xl font-extrabold text-white leading-tight">
                  {metrics.todayWorksCount}
                </div>
                <span className="text-[10px] text-purple-400/80">Active / Due Today</span>
              </div>
            </div>

            {/* In Progress */}
            <div
              onClick={() => {
                setActiveTab('all_works');
                setStatusFilter('In Progress');
              }}
              className="mkt-today-kpi-card cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  In Progress
                </span>
                <div className="text-xl font-extrabold text-amber-300 leading-tight">
                  {metrics.inProgress}
                </div>
                <span className="text-[10px] text-amber-400/80">Under execution</span>
              </div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setActiveTab('reports')}
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
                  {metrics.completed}
                </div>
                <span className="text-[10px] text-emerald-400/80">In Work History</span>
              </div>
            </div>

            {/* Pending / Overdue */}
            <div
              onClick={() => {
                setActiveTab('all_works');
                setStatusFilter('Assigned');
              }}
              className={`mkt-today-kpi-card cursor-pointer ${
                metrics.overdue > 0 ? 'is-overdue-alert' : ''
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border ${
                  metrics.overdue > 0
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                    : 'bg-slate-800 border-white/10 text-slate-400'
                }`}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending / Overdue
                </span>
                <div
                  className={`text-xl font-extrabold leading-tight ${
                    metrics.overdue > 0 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {metrics.overdue > 0 ? `${metrics.overdue} Overdue` : `${metrics.totalAssigned - metrics.completed} Pending`}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    metrics.overdue > 0 ? 'text-rose-300' : 'text-slate-500'
                  }`}
                >
                  {metrics.overdue > 0 ? 'Needs attention' : 'On schedule'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Today's Highlighted Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1 & 2: Today's Action Items */}
            <div className="lg:col-span-2 mkt-card space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Today's Priority Deliverables</h3>
                </div>
                <button
                  onClick={() => setActiveTab('all_works')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                >
                  <span>View All Works</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="space-y-2">
                {metrics.todayWorks.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No active tasks scheduled for today. Click "+ Add Work" to assign new tasks.
                  </div>
                ) : (
                  metrics.todayWorks.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="mkt-badge mkt-badge-purple text-[10px]">
                            {t.category}
                          </span>
                          {getPriorityBadge(t.priority)}
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Assigned: <strong className="text-slate-300">{t.assignedTo}</strong></span>
                          <span>•</span>
                          <span>Due: <strong className="text-slate-300">{t.dueDate} {t.dueTime || ''}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(t.status)}
                        <button
                          onClick={() => openTaskUpdateModal(t)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Employee Workload Breakdown */}
            <div className="mkt-card space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Employee Workload</h3>
                </div>
                <span className="text-[11px] text-slate-400">{employeeOptions.length} Active</span>
              </div>

              <div className="space-y-2.5 divide-y divide-white/5">
                {employeeOptions.slice(0, 6).map((emp) => {
                  const empTasks = marketingTasks.filter((t) => t.assignedTo === emp);
                  const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
                  const empPending = empTasks.length - empCompleted;
                  return (
                    <div
                      key={emp}
                      onClick={() => {
                        setEmployeeFilter(emp);
                        setActiveTab('all_works');
                      }}
                      className="pt-2 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 truncate">{emp}</div>
                        <div className="text-[10px] text-slate-400">
                          {empCompleted} finished • {empPending} pending
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[11px]">
                          {empTasks.length} Works
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: ALL ASSIGNED WORKS (Table with complete filters)       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'all_works' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="mkt-card !p-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search work title, description, employee..."
                  className="mkt-input !pl-9 !py-1.5 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Employee Filter */}
              <div>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="mkt-select !py-1.5 text-xs"
                >
                  <option value="All">All Employees</option>
                  {employeeOptions.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mkt-select !py-1.5 text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mkt-select !py-1.5 text-xs"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? 'All Statuses' : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Priority:</span>
                <div className="flex items-center gap-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        priorityFilter === p
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold"
                  >
                    Clear Date ({dateFilter}) ✕
                  </button>
                )}
                {(searchQuery || employeeFilter !== 'All' || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setEmployeeFilter('All');
                      setCategoryFilter('All');
                      setPriorityFilter('All');
                      setStatusFilter('All');
                      setDateFilter('');
                    }}
                    className="text-purple-400 hover:text-purple-300 underline font-semibold text-[11px]"
                  >
                    Reset Filters
                  </button>
                )}
                <span className="text-[11px] text-slate-400">
                  Showing <strong className="text-white">{filteredAllWorks.length}</strong> of {marketingTasks.length} works
                </span>
              </div>
            </div>
          </div>

          {/* Unified Table */}
          <div className="mkt-table-container">
            <table className="mkt-work-table">
              <thead>
                <tr>
                  <th className="min-w-[260px]">Work Title & Deliverable Details</th>
                  <th className="w-40">Assigned Employee</th>
                  <th className="w-32">Category</th>
                  <th className="w-24">Assigned Date</th>
                  <th className="w-36">Deadline</th>
                  <th className="w-24">Priority</th>
                  <th className="w-32">Status</th>
                  <th className="w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllWorks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckSquare size={32} className="text-slate-600" />
                        <span>No assigned work matches the selected filters</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAllWorks.map((task) => {
                    const isDone = task.status === 'Completed';
                    const isOverdue = task.dueDate && task.dueDate < currentToday && !isDone;

                    return (
                      <tr
                        key={task.id}
                        className={`${isDone ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`}
                      >
                        {/* Title & Description */}
                        <td>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-xs text-white leading-snug">
                              {task.title}
                            </div>
                            {task.desc && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{task.desc}</p>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>Assigned by: <strong className="text-slate-400">{task.assignedBy || 'Admin'}</strong></span>
                              {task.attachment && (
                                <span className="text-sky-400 flex items-center gap-0.5">
                                  <Paperclip size={10} />
                                  <span>{task.attachment}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assigned Employee */}
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300 flex-shrink-0">
                              {(task.assignedTo || 'E').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {task.assignedTo}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <span className="mkt-badge mkt-badge-purple text-[10px]">
                            {task.category}
                          </span>
                        </td>

                        {/* Assigned Date */}
                        <td className="text-slate-400 text-xs font-medium">
                          {task.startDate || '—'}
                        </td>

                        {/* Deadline */}
                        <td>
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-200 font-semibold flex items-center gap-1">
                              <Calendar size={11} className="text-slate-400" />
                              <span>{task.dueDate}</span>
                              {task.dueTime && (
                                <span className="text-[10.5px] text-slate-400 font-normal">
                                  {task.dueTime}
                                </span>
                              )}
                            </div>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300">
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td>{getPriorityBadge(task.priority)}</td>

                        {/* Status */}
                        <td>
                          <div className="space-y-1">
                            {getStatusBadge(task.status)}
                            {typeof task.progress === 'number' && (
                              <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isDone ? 'bg-emerald-400' : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Employee Work Update Button */}
                            <button
                              onClick={() => openTaskUpdateModal(task)}
                              className="px-2 py-1 rounded-md text-[11px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25"
                              title="Update Progress / Submit Completion"
                            >
                              Update
                            </button>

                            {/* Print Slip */}
                            <button
                              onClick={() => openTaskPrintModal(task, 'single')}
                              className="btn-mkt-action"
                              title="Print Work Order Slip"
                            >
                              <Printer size={13} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openTaskModal(task)}
                              className="btn-mkt-action btn-mkt-edit"
                              title="Edit Assignment Details"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete */}
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: WORK HISTORY & PRINTABLE REPORTS                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="mkt-card !p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History size={16} className="text-emerald-400" />
                  <span>Work Completion History & Official Printable Records</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Permanent audit trail of delivered tasks with employee completion notes and signoffs
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openTaskPrintModal(null, 'summary')}
                  className="btn-mkt-primary !py-1.5 !px-3 text-xs"
                >
                  <Printer size={13} />
                  <span>Print Full History Report</span>
                </button>
              </div>
            </div>

            {/* History Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Employee Filter:
                </label>
                <select
                  value={reportEmployee}
                  onChange={(e) => setReportEmployee(e.target.value)}
                  className="mkt-select !py-1.5 text-xs"
                >
                  <option value="All">All Employees</option>
                  {employeeOptions.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category Filter:
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="mkt-select !py-1.5 text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="mkt-input !py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  End Date:
                </label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="mkt-input !py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Search Notes:
                </label>
                <input
                  type="text"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Keyword search..."
                  className="mkt-input !py-1 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
              <span>
                Found <strong className="text-emerald-400">{filteredHistory.length}</strong> completed work records
              </span>
              {(reportEmployee !== 'All' || reportCategory !== 'All' || reportStartDate || reportEndDate || reportSearch) && (
                <button
                  onClick={() => {
                    setReportEmployee('All');
                    setReportCategory('All');
                    setReportStartDate('');
                    setReportEndDate('');
                    setReportSearch('');
                  }}
                  className="text-purple-400 hover:text-purple-300 underline font-semibold"
                >
                  Reset History Filters
                </button>
              )}
            </div>
          </div>

          {/* History Records Table */}
          <div className="mkt-table-container">
            <table className="mkt-work-table">
              <thead>
                <tr>
                  <th className="min-w-[240px]">Work Title</th>
                  <th className="w-36">Employee</th>
                  <th className="w-24">Assignment Date</th>
                  <th className="w-32">Completion Date</th>
                  <th className="w-28">Category</th>
                  <th className="w-20">Final Status</th>
                  <th className="min-w-[200px]">Completion Notes & Deliverables</th>
                  <th className="w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                      No completed works found in this filter range.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((task) => (
                    <tr key={task.id} className="hover:bg-emerald-950/10">
                      <td className="font-semibold text-xs text-white">
                        {task.title}
                      </td>
                      <td className="text-xs font-medium text-slate-200">
                        {task.assignedTo}
                      </td>
                      <td className="text-xs text-slate-400">
                        {task.startDate}
                      </td>
                      <td className="text-xs font-semibold text-emerald-300">
                        {task.completedDate || task.dueDate || '—'} {task.completedTime || ''}
                      </td>
                      <td>
                        <span className="mkt-badge mkt-badge-purple text-[10px]">
                          {task.category}
                        </span>
                      </td>
                      <td>
                        <span className="mkt-badge mkt-badge-green font-bold">
                          ✓ Completed
                        </span>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-300 italic line-clamp-2">
                            {task.completionNotes || 'Delivered on schedule.'}
                          </p>
                          {task.completionAttachment && (
                            <span className="text-[11px] text-sky-400 flex items-center gap-1">
                              <Paperclip size={10} />
                              <span className="truncate max-w-[180px]">{task.completionAttachment}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openTaskPrintModal(task, 'single')}
                            className="px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-white/10 hover:text-white flex items-center gap-1"
                            title="Print Individual Work Report Certificate"
                          >
                            <Printer size={12} />
                            <span>Slip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* NOTIFICATIONS DRAWER COMPONENT                                */}
      {/* ------------------------------------------------------------- */}
      <MarketingNotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}
