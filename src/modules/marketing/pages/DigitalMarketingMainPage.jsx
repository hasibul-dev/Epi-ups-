import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Tag,
  Printer,
  History,
  LayoutDashboard,
  Layers,
  FileText,
  CheckSquare,
  Eye,
  Paperclip,
  TrendingUp,
  RotateCcw,
  ChevronRight,
  CalendarCheck,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Flag,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today } from '../../sales/utils/helpers.js';
import MarketingNotificationsDrawer from '../components/MarketingNotificationsDrawer.jsx';
import MarketingPrintCenter from '../components/MarketingPrintCenter.jsx';

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
  const location = useLocation();
  const navigate = useNavigate();

  const {
    data,
    openTaskModal,
    openTaskUpdateModal,
    openTaskDetailsModal,
    openTaskPrintModal,
    deleteTask,
    user,
    notifications = [],
    unreadNotificationsCount = 0,
  } = useMarketing();

  const { marketingTasks = [] } = data;
  const currentToday = today();

  // Sync active view with URL: 'overview' | 'all_works' | 'today' | 'reports'
  const getTabFromPath = (pathname) => {
    if (pathname.includes('/all-works')) return 'all_works';
    if (pathname.includes('/today')) return 'today';
    if (pathname.includes('/history')) return 'reports';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'overview') navigate('/marketing');
    else if (tabKey === 'all_works') navigate('/marketing/all-works');
    else if (tabKey === 'today') navigate('/marketing/today');
    else if (tabKey === 'reports') navigate('/marketing/history');
  };

  // Filter states for "All Works"
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter states for "Today's Work"
  const [todayQuickFilter, setTodayQuickFilter] = useState('All'); // 'All' | 'My' | 'InProgress' | 'Pending' | 'Completed' | 'Overdue'

  // Modals & Drawers
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Dynamic Employee options loaded from central database
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
  // KPI CALCULATIONS (Actual Database Records)
  // --------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalAssigned = marketingTasks.length;
    const inProgress = marketingTasks.filter((t) => t.status === 'In Progress').length;
    const completed = marketingTasks.filter((t) => t.status === 'Completed').length;
    const onHold = marketingTasks.filter((t) => t.status === 'On Hold').length;

    // Overdue: deadline passed & not completed
    const overdueList = marketingTasks.filter(
      (t) => t.dueDate && t.dueDate < currentToday && t.status !== 'Completed'
    );
    const overdue = overdueList.length;

    // Today's Works: active today or due today
    const todayWorks = marketingTasks.filter((t) => {
      const isDueToday = t.dueDate === currentToday;
      const isAssignedToday = t.startDate === currentToday;
      const isOverdue = t.dueDate && t.dueDate < currentToday && t.status !== 'Completed';
      const isInProgress = t.status === 'In Progress';
      return isDueToday || isAssignedToday || isOverdue || (isInProgress && t.startDate <= currentToday);
    });

    // Upcoming Deadlines (Due in next 7 days and not completed)
    const upcomingDeadlines = marketingTasks
      .filter((t) => {
        if (t.status === 'Completed') return false;
        if (!t.dueDate) return false;
        return t.dueDate >= currentToday;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);

    // Recent Active Works (Assigned or In Progress)
    const activeWorks = marketingTasks
      .filter((t) => t.status === 'In Progress' || t.status === 'Assigned' || t.status === 'To Do')
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 7);

    // Recent Completed Activities
    const recentCompleted = marketingTasks
      .filter((t) => t.status === 'Completed')
      .sort((a, b) => {
        const dateA = a.completedDate || a.dueDate || a.startDate || '';
        const dateB = b.completedDate || b.dueDate || b.startDate || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 5);

    // Employee Workload Summary
    const workloadMap = {};
    employeeOptions.forEach((emp) => {
      workloadMap[emp] = { name: emp, total: 0, inProgress: 0, completed: 0, pending: 0 };
    });
    marketingTasks.forEach((t) => {
      const emp = t.assignedTo || 'Unassigned';
      if (!workloadMap[emp]) {
        workloadMap[emp] = { name: emp, total: 0, inProgress: 0, completed: 0, pending: 0 };
      }
      workloadMap[emp].total += 1;
      if (t.status === 'Completed') workloadMap[emp].completed += 1;
      else if (t.status === 'In Progress') workloadMap[emp].inProgress += 1;
      else workloadMap[emp].pending += 1;
    });

    const employeeWorkloads = Object.values(workloadMap).filter((w) => w.total > 0);

    return {
      totalAssigned,
      inProgress,
      completed,
      onHold,
      overdue,
      overdueList,
      todayWorksCount: todayWorks.length,
      todayWorks,
      upcomingDeadlines,
      activeWorks,
      recentCompleted,
      employeeWorkloads,
    };
  }, [marketingTasks, currentToday, employeeOptions]);

  // --------------------------------------------------------------------------
  // FILTERED ALL WORKS
  // --------------------------------------------------------------------------
  const filteredAllWorks = useMemo(() => {
    return marketingTasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchDesc = (task.desc || '').toLowerCase().includes(q);
        const matchEmp = (task.assignedTo || '').toLowerCase().includes(q);
        const matchCat = (task.category || '').toLowerCase().includes(q);
        const matchId = (task.id || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchEmp && !matchCat && !matchId) return false;
      }

      if (employeeFilter !== 'All' && task.assignedTo !== employeeFilter) {
        return false;
      }

      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }

      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }

      if (statusFilter !== 'All') {
        if (statusFilter === 'Assigned' && (task.status === 'Assigned' || task.status === 'To Do')) {
          // match
        } else if (task.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [marketingTasks, searchQuery, employeeFilter, categoryFilter, priorityFilter, statusFilter]);

  // --------------------------------------------------------------------------
  // FILTERED TODAY'S WORKS
  // --------------------------------------------------------------------------
  const filteredTodayWorks = useMemo(() => {
    return metrics.todayWorks.filter((task) => {
      const isOverdue = task.dueDate && task.dueDate < currentToday && task.status !== 'Completed';
      const userName = (user?.name || '').toLowerCase();

      if (todayQuickFilter === 'My') {
        if (!task.assignedTo || !userName || !task.assignedTo.toLowerCase().includes(userName)) return false;
      } else if (todayQuickFilter === 'InProgress') {
        if (task.status !== 'In Progress') return false;
      } else if (todayQuickFilter === 'Pending') {
        if (task.status !== 'Assigned' && task.status !== 'To Do') return false;
      } else if (todayQuickFilter === 'Completed') {
        if (task.status !== 'Completed') return false;
      } else if (todayQuickFilter === 'Overdue') {
        if (!isOverdue) return false;
      }
      return true;
    });
  }, [metrics.todayWorks, todayQuickFilter, currentToday, user?.name]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setEmployeeFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
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
          <span className="mkt-badge mkt-badge-amber flex items-center gap-1 font-semibold">
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
        return <span className="mkt-badge mkt-badge-blue font-bold">⏳ In Progress</span>;
      case 'On Hold':
        return <span className="mkt-badge mkt-badge-amber font-bold">⏸️ On Hold</span>;
      case 'Assigned':
      case 'To Do':
      default:
        return <span className="mkt-badge mkt-badge-neutral font-bold">📋 Assigned</span>;
    }
  };

  const confirmDelete = () => {
    if (taskToDelete?.id) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* =================================================================== */}
      {/* 1. PROFESSIONAL CORPORATE HEADER                                    */}
      {/* =================================================================== */}
      <header className="mkt-topbar">
        {/* Left: Corporate Brand & Department */}
        <div className="mkt-topbar-left">
          <div className="mkt-brand-icon">
            <Megaphone size={19} className="text-white" />
          </div>
          <div className="mkt-brand-titles">
            <h1 className="mkt-brand-main-title">
              Digital Marketing Work Management
            </h1>
            <p className="mkt-brand-sub-title">
              EPI UPS Bangladesh Limited
            </p>
          </div>
        </div>

        {/* Right: Quick Controls, Alerts, Profile */}
        <div className="mkt-topbar-right">
          {/* Notification Alerts */}
          <button
            type="button"
            onClick={() => setIsNotifDrawerOpen(true)}
            className="mkt-notif-btn"
            title="Work Assignment & Completion Notifications"
          >
            <Bell size={15} className="text-blue-400" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadNotificationsCount > 0 ? (
              <span className="mkt-notif-badge-unread">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="mkt-notif-badge-count">
                ({notifications.length})
              </span>
            )}
          </button>

          {/* Print Center Shortcut */}
          <button
            type="button"
            onClick={() => handleTabChange('reports')}
            className="btn-mkt-secondary mkt-header-action-btn"
            title="Open Corporate Print & Reporting Center"
          >
            <Printer size={14} className="text-sky-400" />
            <span>Print Center</span>
          </button>

          {/* Add Work Primary Action */}
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="btn-mkt-primary mkt-header-action-btn"
            title="Create and Assign New Work Deliverable"
          >
            <Plus size={15} />
            <span>+ Add Work</span>
          </button>

          {/* Active User Profile Pill */}
          <div className="mkt-user-profile-pill">
            <div className="mkt-user-avatar">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="mkt-user-text hidden sm:flex">
              <span className="mkt-user-name" title={user?.name || 'Administrator'}>
                {user?.name || 'Administrator'}
              </span>
              <span className="mkt-user-role">
                {user?.role === 'superadmin' ? 'Super Admin' : (user?.role || 'Marketing')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. COMPACT SECTION HEADER & NAVIGATION SUBNAV BAR                   */}
      {/* Exactly 4 sections: Overview, All Works, Today's Work, Reports      */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-white/10 rounded-xl p-2 px-3 no-print">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('all_works')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all_works'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} />
            <span>All Works</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {metrics.totalAssigned}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('today')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarCheck size={14} />
            <span>Today's Work</span>
            {metrics.todayWorksCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-400/25 text-sky-300 font-bold border border-sky-400/40">
                {metrics.todayWorksCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('reports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History size={14} />
            <span>Work History & Reports</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400/20 text-emerald-300 font-bold">
              {metrics.completed} Done
            </span>
          </button>
        </div>

        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          <span>Database Synchronized</span>
          <span>•</span>
          <span className="text-slate-300 font-medium">{currentToday}</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. OVERVIEW DASHBOARD VIEW                                          */}
      {/* 5 KPI Cards + 5 Content Sections                                    */}
      {/* =================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 5 KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Total Assigned Works */}
            <div
              onClick={() => handleTabChange('all_works')}
              className="mkt-kpi-card group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="mkt-kpi-label">Total Assigned</span>
                <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Layers size={16} />
                </div>
              </div>
              <div className="mkt-kpi-value text-white group-hover:text-blue-300 transition-colors">
                {metrics.totalAssigned}
              </div>
              <div className="mkt-kpi-subtext text-slate-400">
                All marketing records in database
              </div>
            </div>

            {/* 2. Today's Works */}
            <div
              onClick={() => handleTabChange('today')}
              className="mkt-kpi-card group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="mkt-kpi-label">Today's Queue</span>
                <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Calendar size={16} />
                </div>
              </div>
              <div className="mkt-kpi-value text-white group-hover:text-sky-300 transition-colors">
                {metrics.todayWorksCount}
              </div>
              <div className="mkt-kpi-subtext text-slate-400">
                Active tasks or due today
              </div>
            </div>

            {/* 3. In Progress */}
            <div
              onClick={() => {
                setStatusFilter('In Progress');
                handleTabChange('all_works');
              }}
              className="mkt-kpi-card group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="mkt-kpi-label">In Progress</span>
                <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Clock size={16} />
                </div>
              </div>
              <div className="mkt-kpi-value text-white group-hover:text-blue-300 transition-colors">
                {metrics.inProgress}
              </div>
              <div className="mkt-kpi-subtext text-slate-400">
                Currently under execution
              </div>
            </div>

            {/* 4. Completed */}
            <div
              onClick={() => handleTabChange('reports')}
              className="mkt-kpi-card group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="mkt-kpi-label">Completed</span>
                <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="mkt-kpi-value text-white group-hover:text-emerald-300 transition-colors">
                {metrics.completed}
              </div>
              <div className="mkt-kpi-subtext text-slate-400">
                Delivered & verified work
              </div>
            </div>

            {/* 5. Pending / Overdue */}
            <div
              onClick={() => {
                if (metrics.overdue > 0) {
                  setTodayQuickFilter('Overdue');
                  handleTabChange('today');
                } else {
                  handleTabChange('all_works');
                }
              }}
              className={`mkt-kpi-card group cursor-pointer ${
                metrics.overdue > 0
                  ? '!border-red-500/60 bg-gradient-to-b from-red-950/30 to-slate-900/90 shadow-lg shadow-red-950/40'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`mkt-kpi-label ${metrics.overdue > 0 ? 'text-red-300 font-bold' : ''}`}>
                  Pending / Overdue
                </span>
                <div
                  className={`p-2 rounded-lg ${
                    metrics.overdue > 0
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                      : 'bg-slate-700/30 border border-slate-600/30 text-slate-400'
                  }`}
                >
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div
                className={`mkt-kpi-value ${
                  metrics.overdue > 0 ? 'text-red-400 font-black' : 'text-white'
                }`}
              >
                {metrics.overdue > 0 ? `${metrics.overdue} Overdue` : '0 Overdue'}
              </div>
              <div className="mkt-kpi-subtext text-slate-400">
                {metrics.overdue > 0
                  ? 'Urgent attention required'
                  : 'All tasks on schedule'}
              </div>
            </div>
          </div>

          {/* Section 1: Recent Active Works Table */}
          <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Recent Active Works
                </h3>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  (Assigned & In Progress Queue)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('all_works')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <span>View All Works ({metrics.totalAssigned})</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {metrics.activeWorks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active tasks found in the queue. Click "+ Add Work" to assign new deliverables.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mkt-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>Order ID</th>
                      <th>Work Title & Scope</th>
                      <th>Category</th>
                      <th>Assigned Employee</th>
                      <th>Target Deadline</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.activeWorks.map((task) => (
                      <tr key={task.id} className="hover:bg-white/[0.02]">
                        <td className="font-mono text-[11px] text-blue-400 font-semibold">
                          #{task.id}
                        </td>
                        <td>
                          <div
                            onClick={() => openTaskDetailsModal(task)}
                            className="font-semibold text-white hover:text-blue-300 cursor-pointer text-xs"
                          >
                            {task.title}
                          </div>
                          {task.desc && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {task.desc}
                            </p>
                          )}
                        </td>
                        <td>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {task.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                              {(task.assignedTo || 'U').charAt(0)}
                            </div>
                            <span className="text-xs text-slate-200">
                              {task.assignedTo}
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-300">
                          {task.dueDate} {task.dueTime ? `(${task.dueTime})` : ''}
                        </td>
                        <td>{getPriorityBadge(task.priority)}</td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTaskDetailsModal(task)}
                              className="mkt-action-btn-icon bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                              title="Inspect Work Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openTaskUpdateModal(task)}
                              className="mkt-action-btn bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                              title="Update Progress / Submit Work"
                            >
                              <CheckSquare size={12} />
                              <span>Update</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openTaskPrintModal(task, 'single')}
                              className="mkt-action-btn-icon bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                              title="Print Work Order Slip"
                            >
                              <Printer size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2 & 3: Two-Column Grid: Upcoming Deadlines & Overdue Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section 2: Upcoming Deadlines */}
            <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Upcoming Deadlines (Next 7 Days)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {metrics.upcomingDeadlines.length} tasks scheduled
                </span>
              </div>

              {metrics.upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No pending deadlines due in the next 7 days.
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.upcomingDeadlines.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openTaskDetailsModal(task)}
                      className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{task.assignedTo}</span>
                          <span>•</span>
                          <span className="text-slate-300">{task.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {task.dueDate === currentToday ? 'Due Today' : `Due: ${task.dueDate}`}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Overdue Tasks Alert Panel */}
            <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className={metrics.overdue > 0 ? 'text-red-400' : 'text-emerald-400'} />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Overdue Work Items & Critical Alerts
                  </h3>
                </div>
                <span className={`text-[11px] font-bold ${metrics.overdue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {metrics.overdue > 0 ? `${metrics.overdue} Overdue` : 'Zero Overdue'}
                </span>
              </div>

              {metrics.overdue === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-xs font-semibold text-emerald-300">
                    All marketing assignments are operating on schedule
                  </p>
                  <p className="text-[11px] text-slate-400">
                    No overdue or blocked deliverables detected in the system.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.overdueList.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <h4 className="text-xs font-bold text-white truncate">
                            {task.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Assigned to: <strong className="text-slate-200">{task.assignedTo}</strong> • Deadline was: <span className="text-red-300 font-semibold">{task.dueDate}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openTaskUpdateModal(task)}
                        className="btn-mkt-red !h-7 !px-2.5 text-[11px] flex-shrink-0"
                      >
                        Resolve / Deliver
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Employee Workload Allocation */}
          <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <User size={15} className="text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Employee Workload Allocation
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Team capacity & distribution ({metrics.employeeWorkloads.length} active specialists)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {metrics.employeeWorkloads.map((emp) => {
                const completionPct = emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0;
                return (
                  <div
                    key={emp.name}
                    onClick={() => {
                      setEmployeeFilter(emp.name);
                      handleTabChange('all_works');
                    }}
                    className="p-3 rounded-xl bg-slate-800/60 border border-white/5 hover:border-blue-500/40 hover:bg-slate-800 cursor-pointer transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {emp.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Marketing Team Specialist
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-blue-400">
                        {completionPct}% Done
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                      <div className="p-1 rounded bg-black/30 border border-white/5">
                        <span className="text-slate-400 block text-[9.5px]">Total</span>
                        <strong className="text-white font-mono">{emp.total}</strong>
                      </div>
                      <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-400 block text-[9.5px]">Done</span>
                        <strong className="text-emerald-300 font-mono">{emp.completed}</strong>
                      </div>
                      <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20">
                        <span className="text-blue-400 block text-[9.5px]">Active</span>
                        <strong className="text-blue-300 font-mono">{emp.inProgress + emp.pending}</strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Recent Completed Activities */}
          <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Completed Activities & Deliveries
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('reports')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>Full Archive & Reports</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {metrics.recentCompleted.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No completed deliverables recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.recentCompleted.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-slate-800/40 border border-white/5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs">✓</span>
                        <h4
                          onClick={() => openTaskDetailsModal(task)}
                          className="text-xs font-bold text-white hover:text-blue-300 cursor-pointer"
                        >
                          {task.title}
                        </h4>
                        <span className="mkt-badge mkt-badge-green text-[10px]">
                          Completed
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Completed by <strong className="text-slate-200">{task.assignedTo}</strong> on {task.completedDate || task.dueDate}
                        {task.completionNotes && (
                          <span className="text-slate-300 italic block mt-0.5">
                            "{task.completionNotes}"
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openTaskDetailsModal(task)}
                        className="mkt-action-btn bg-slate-800 text-slate-200 hover:bg-slate-700"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openTaskPrintModal(task, 'single')}
                        className="mkt-action-btn bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                      >
                        <Printer size={12} />
                        <span>Print Slip</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. ALL WORKS – COMPLETE WORK MANAGEMENT VIEW                        */}
      {/* Search, Filter Toolbar, Data Table, 5 Action Buttons                */}
      {/* =================================================================== */}
      {activeTab === 'all_works' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3 no-print">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Work Search & Filter Controls
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Showing <strong>{filteredAllWorks.length}</strong> of <strong>{metrics.totalAssigned}</strong> tasks
                </span>
                {(searchQuery || employeeFilter !== 'All' || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search work title, brief, ID, employee..."
                  className="mkt-input pl-9 text-xs"
                />
              </div>

              {/* Employee Filter */}
              <div>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="mkt-select text-xs"
                >
                  <option value="All">All Assigned Employees</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mkt-select text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Work Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mkt-select text-xs"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? 'All Statuses' : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Segmented Button Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
              <span className="text-[11px] font-semibold text-slate-400">
                Priority:
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {PRIORITIES.map((p) => {
                  const active = priorityFilter === p;
                  const count = p === 'All'
                    ? marketingTasks.length
                    : marketingTasks.filter((t) => t.priority === p).length;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/5'
                      }`}
                    >
                      <span>{p}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          active ? 'bg-white/20 text-white' : 'bg-black/30 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Work Management Table */}
          <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Work Order Registry
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openTaskPrintModal(null, 'assignment', filteredAllWorks)}
                  className="btn-mkt-secondary !h-8 !px-3 text-xs"
                  title="Print filtered list of work orders"
                >
                  <Printer size={13} />
                  <span>Print Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTaskModal()}
                  className="btn-mkt-primary !h-8 !px-3 text-xs"
                >
                  <Plus size={14} />
                  <span>+ Add Work</span>
                </button>
              </div>
            </div>

            {filteredAllWorks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No work orders matched your filter criteria. Try clearing search filters or click "+ Add Work".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mkt-table">
                  <thead>
                    <tr>
                      <th style={{ width: '85px' }}>Order ID</th>
                      <th>Work Title & Scope</th>
                      <th>Category</th>
                      <th>Assigned Employee</th>
                      <th>Assignment Date</th>
                      <th>Target Deadline</th>
                      <th>Priority</th>
                      <th>Status & Progress</th>
                      <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllWorks.map((task) => {
                      const progressPct = typeof task.progress === 'number'
                        ? task.progress
                        : (task.status === 'Completed' ? 100 : 30);

                      return (
                        <tr key={task.id} className="hover:bg-white/[0.02]">
                          <td className="font-mono text-[11px] text-blue-400 font-semibold">
                            #{task.id}
                          </td>
                          <td>
                            <div
                              onClick={() => openTaskDetailsModal(task)}
                              className="font-semibold text-white hover:text-blue-300 cursor-pointer text-xs"
                            >
                              {task.title}
                            </div>
                            {task.desc && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-xs">
                                {task.desc}
                              </p>
                            )}
                          </td>
                          <td>
                            <span className="text-[11px] text-slate-300 font-medium">
                              {task.category || 'General'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                                {(task.assignedTo || 'U').charAt(0)}
                              </div>
                              <span className="text-xs text-slate-200">
                                {task.assignedTo}
                              </span>
                            </div>
                          </td>
                          <td className="text-xs text-slate-400 font-mono">
                            {task.startDate || '—'}
                          </td>
                          <td className="text-xs text-slate-300 font-mono">
                            {task.dueDate} {task.dueTime ? `(${task.dueTime})` : ''}
                          </td>
                          <td>{getPriorityBadge(task.priority)}</td>
                          <td>
                            <div className="space-y-1">
                              {getStatusBadge(task.status)}
                              <div className="w-24 bg-slate-800 rounded-full h-1 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    task.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-1">
                              {/* Details */}
                              <button
                                type="button"
                                onClick={() => openTaskDetailsModal(task)}
                                className="mkt-action-btn-icon bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                                title="Inspect Details"
                              >
                                <Eye size={13} />
                              </button>

                              {/* Update */}
                              <button
                                type="button"
                                onClick={() => openTaskUpdateModal(task)}
                                className="mkt-action-btn-icon bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                                title="Update Progress"
                              >
                                <CheckSquare size={13} />
                              </button>

                              {/* Slip */}
                              <button
                                type="button"
                                onClick={() => openTaskPrintModal(task, 'single')}
                                className="mkt-action-btn-icon bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                                title="Print Slip"
                              >
                                <Printer size={13} />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => openTaskModal(task)}
                                className="mkt-action-btn-icon bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-600 hover:text-white"
                                title="Edit Assignment"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setTaskToDelete({ id: task.id, title: task.title })}
                                className="mkt-action-btn-icon bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white"
                                title="Delete Work Order"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. TODAY'S WORK WORKSPACE VIEW                                      */}
      {/* Focused Day Execution, Segmented Filters, Quick Actions             */}
      {/* =================================================================== */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="mkt-card !p-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Today's Execution Workspace
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target deliverables assigned or due on {currentToday}
              </p>
            </div>

            {/* Quick Segmented Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'All', label: 'All Today' },
                { key: 'My', label: 'My Tasks' },
                { key: 'InProgress', label: 'In Progress' },
                { key: 'Pending', label: 'Pending Start' },
                { key: 'Completed', label: 'Completed' },
                { key: 'Overdue', label: 'Overdue Alert' },
              ].map((pill) => {
                const active = todayQuickFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setTodayQuickFilter(pill.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today Tasks Table / Cards */}
          <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Today's Work Queue ({filteredTodayWorks.length} items)
              </h3>
              <button
                type="button"
                onClick={() => openTaskModal()}
                className="btn-mkt-primary !h-8 !px-3 text-xs"
              >
                <Plus size={14} />
                <span>+ Assign Today Work</span>
              </button>
            </div>

            {filteredTodayWorks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No work items found matching "{todayQuickFilter}" for today.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="mkt-table">
                  <thead>
                    <tr>
                      <th style={{ width: '85px' }}>Order ID</th>
                      <th>Work Title & Scope</th>
                      <th>Employee</th>
                      <th>Category</th>
                      <th>Deadline Time</th>
                      <th>Priority</th>
                      <th>Status & Progress</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTodayWorks.map((task) => (
                      <tr key={task.id} className="hover:bg-white/[0.02]">
                        <td className="font-mono text-[11px] text-blue-400 font-semibold">
                          #{task.id}
                        </td>
                        <td>
                          <div
                            onClick={() => openTaskDetailsModal(task)}
                            className="font-semibold text-white hover:text-blue-300 cursor-pointer text-xs"
                          >
                            {task.title}
                          </div>
                          {task.desc && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {task.desc}
                            </p>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                              {(task.assignedTo || 'U').charAt(0)}
                            </div>
                            <span className="text-xs text-slate-200">
                              {task.assignedTo}
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-300">
                          {task.category || 'General'}
                        </td>
                        <td className="text-xs text-slate-300 font-mono">
                          {task.dueTime ? `${task.dueTime} Today` : 'End of Day'}
                        </td>
                        <td>{getPriorityBadge(task.priority)}</td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openTaskDetailsModal(task)}
                              className="mkt-action-btn-icon bg-slate-800 text-slate-300 hover:text-white"
                              title="Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openTaskUpdateModal(task)}
                              className="mkt-action-btn bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                              title="Update Progress"
                            >
                              <CheckSquare size={12} />
                              <span>Update</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openTaskPrintModal(task, 'single')}
                              className="mkt-action-btn-icon bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                              title="Print Slip"
                            >
                              <Printer size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. WORK HISTORY & REPORTS – DEDICATED PRINT CENTER                  */}
      {/* 4 Official A4 Reports, High-Contrast Preview, Paper & PDF Export    */}
      {/* =================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <MarketingPrintCenter />
        </div>
      )}

      {/* =================================================================== */}
      {/* NOTIFICATIONS DRAWER                                                */}
      {/* =================================================================== */}
      <MarketingNotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      {/* =================================================================== */}
      {/* CUSTOM DELETE CONFIRMATION MODAL                                    */}
      {/* =================================================================== */}
      {taskToDelete && (
        <div
          className="marketing-modal-backdrop"
          onClick={() => setTaskToDelete(null)}
        >
          <div
            className="marketing-modal-card max-w-md !p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Work Order Deletion
                </h3>
                <p className="text-xs text-slate-400">
                  This action will permanently delete this assignment record.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white">"{taskToDelete.title}"</strong> (ID: #{taskToDelete.id})?
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="btn-mkt-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn-mkt-red"
              >
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
