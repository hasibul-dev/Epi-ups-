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
  CalendarCheck,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckSquare,
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
    openTaskPrintModal,
    saveTask,
    deleteTask,
    user,
    notifications,
    unreadNotificationsCount,
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

  // Filter states for "All Works" and "Overview"
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Filter states for "Today's Work"
  const [todayQuickFilter, setTodayQuickFilter] = useState('All'); // 'All' | 'My' | 'InProgress' | 'Completed' | 'Overdue'

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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchDesc = (task.desc || '').toLowerCase().includes(q);
        const matchEmp = (task.assignedTo || '').toLowerCase().includes(q);
        const matchCat = (task.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchEmp && !matchCat) return false;
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

      if (dateFilter && task.startDate !== dateFilter && task.dueDate !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [marketingTasks, searchQuery, employeeFilter, categoryFilter, priorityFilter, statusFilter, dateFilter]);

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
      } else if (todayQuickFilter === 'Completed') {
        if (task.status !== 'Completed') return false;
      } else if (todayQuickFilter === 'Overdue') {
        if (!isOverdue) return false;
      }
      return true;
    });
  }, [metrics.todayWorks, todayQuickFilter, currentToday, user?.name]);

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
    <div className="space-y-4 w-full">
      {/* ============================================================= */}
      {/* 1. PROFESSIONAL TOP HEADER                                    */}
      {/* (Non-wrapping, vertically centered, consistent 34px buttons)   */}
      {/* ============================================================= */}
      <header className="mkt-topbar">
        {/* Left: Branding & Department Title */}
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

        {/* Right: Actions, Notifications & Profile in ONE vertically centered row */}
        <div className="mkt-topbar-right">
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setIsNotifDrawerOpen(true)}
            className="mkt-notif-btn"
            title="Work Assignment Notifications"
          >
            <Bell size={15} className="text-purple-400" />
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

          {/* Print Report Button (Cyan / Blue Accent) */}
          <button
            type="button"
            onClick={() =>
              openTaskPrintModal(
                null,
                activeTab === 'reports' ? 'history' : activeTab === 'today' ? 'assignment' : 'history',
                activeTab === 'reports' ? filteredHistory : activeTab === 'today' ? todayTasks : marketingTasks,
                {
                  employee: activeTab === 'reports' ? reportEmployee : employeeFilter,
                  category: activeTab === 'reports' ? reportCategory : categoryFilter,
                  startDate: activeTab === 'reports' ? reportStartDate : '',
                  endDate: activeTab === 'reports' ? reportEndDate : '',
                }
              )
            }
            className="btn-mkt-cyan mkt-header-action-btn"
            title="Print Official Work Performance Report"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          {/* Prominent Add Work Button (Purple Gradient) */}
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="btn-mkt-add-work mkt-header-action-btn"
            title="Create and Assign New Work Deliverable"
          >
            <Plus size={16} />
            <span>+ Add Work</span>
          </button>

          {/* User Profile Pill (Vertically Centered, Never Wraps) */}
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

      {/* ============================================================= */}
      {/* 2. MAIN CONTENT AREA (Strict Order & Full Width)               */}
      {/* 1. Compact Heading -> 2. KPI Cards -> 3. Filters -> 4. Table   */}
      {/* ============================================================= */}
      <div className="space-y-4 w-full">
        {/* ----------------------------------------------------------- */}
        {/* Step 1: Compact Dashboard Heading (Zero duplicate buttons)  */}
        {/* ----------------------------------------------------------- */}
        <div className="mkt-compact-heading">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-5 rounded-full bg-gradient-to-b from-purple-500 to-sky-500 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {activeTab === 'overview' && 'Work Operations Overview'}
                {activeTab === 'all_works' && 'All Digital Marketing Works'}
                {activeTab === 'today' && "Today's Work & Daily Queue"}
                {activeTab === 'reports' && 'Work History & Archived Records'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'overview' && 'Real-time overview of active deliverables, workload allocation, and team milestones'}
                {activeTab === 'all_works' && 'Directory of all marketing assignments with multi-column filtering and inline updates'}
                {activeTab === 'today' && `Work items scheduled, in-progress, or due on today (${currentToday})`}
                {activeTab === 'reports' && 'Permanent audit trail of delivered deliverables with employee completion notes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
              {activeTab === 'overview' && `${metrics.totalAssigned} Total Works`}
              {activeTab === 'all_works' && `${filteredAllWorks.length} of ${marketingTasks.length} Records`}
              {activeTab === 'today' && `${filteredTodayWorks.length} Tasks Scheduled Today`}
              {activeTab === 'reports' && `${filteredHistory.length} Delivered Records`}
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Step 2: Dashboard Summary KPI Cards (Consistent Dimensions) */}
        {/* ----------------------------------------------------------- */}
        <div className="mkt-today-kpi-grid">
          {/* Total Assigned Works (Blue Accent) */}
          <div
            onClick={() => handleTabChange('all_works')}
            className="mkt-today-kpi-card cursor-pointer border-sky-500/20 hover:border-sky-500/50"
          >
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex-shrink-0">
              <Layers size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Total Assigned Works
              </span>
              <div className="text-2xl font-extrabold text-white leading-tight font-mono">
                {metrics.totalAssigned}
              </div>
              <span className="text-[10px] text-sky-400/80 block truncate">Active & completed</span>
            </div>
          </div>

          {/* Today's Works (Purple Accent) */}
          <div
            onClick={() => handleTabChange('today')}
            className="mkt-today-kpi-card cursor-pointer border-purple-500/20 hover:border-purple-500/50"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex-shrink-0">
              <CalendarCheck size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Today's Works
              </span>
              <div className="text-2xl font-extrabold text-white leading-tight font-mono">
                {metrics.todayWorksCount}
              </div>
              <span className="text-[10px] text-purple-400/80 block truncate">Active on {currentToday}</span>
            </div>
          </div>

          {/* In Progress (Amber/Cyan Accent) */}
          <div
            onClick={() => {
              setStatusFilter('In Progress');
              handleTabChange('all_works');
            }}
            className="mkt-today-kpi-card cursor-pointer border-amber-500/20 hover:border-amber-500/50"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex-shrink-0">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                In Progress
              </span>
              <div className="text-2xl font-extrabold text-amber-300 leading-tight font-mono">
                {metrics.inProgress}
              </div>
              <span className="text-[10px] text-amber-400/80 block truncate">Executing currently</span>
            </div>
          </div>

          {/* Completed (Emerald Green Accent) */}
          <div
            onClick={() => handleTabChange('reports')}
            className="mkt-today-kpi-card cursor-pointer border-emerald-500/20 hover:border-emerald-500/50"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Completed
              </span>
              <div className="text-2xl font-extrabold text-emerald-300 leading-tight font-mono">
                {metrics.completed}
              </div>
              <span className="text-[10px] text-emerald-400/80 block truncate">Delivered & verified</span>
            </div>
          </div>

          {/* Pending / Overdue (Alert Accent) */}
          <div
            onClick={() => {
              setStatusFilter('Assigned');
              handleTabChange('all_works');
            }}
            className={`mkt-today-kpi-card cursor-pointer ${
              metrics.overdue > 0 ? 'is-overdue-alert' : 'border-rose-500/20 hover:border-rose-500/50'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border flex-shrink-0 ${
                metrics.overdue > 0
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-slate-800 border-white/10 text-slate-400'
              }`}
            >
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Pending / Overdue
              </span>
              <div
                className={`text-2xl font-extrabold leading-tight font-mono ${
                  metrics.overdue > 0 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {metrics.overdue > 0 ? `${metrics.overdue} Overdue` : `${metrics.totalAssigned - metrics.completed} Pending`}
              </div>
              <span
                className={`text-[10px] font-medium block truncate ${
                  metrics.overdue > 0 ? 'text-rose-300' : 'text-slate-500'
                }`}
              >
                {metrics.overdue > 0 ? 'Needs escalation' : 'On schedule'}
              </span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Step 3 & 4: View-Specific Search/Filters + Work Table       */}
        {/* ----------------------------------------------------------- */}

        {/* VIEW 1: OVERVIEW DASHBOARD VIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 w-full">
            {/* Search and Filters Toolbar */}
            <div className="mkt-card !p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                <div className="relative md:col-span-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search active work title, description, employee..."
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

            {/* Step 4: Full-Width Work Table */}
            <div className="mkt-table-container">
              <table className="mkt-work-table">
                <thead>
                  <tr>
                    <th className="min-w-[260px]">Work Title</th>
                    <th className="w-40">Assigned Employee</th>
                    <th className="w-24">Priority</th>
                    <th className="w-36">Deadline</th>
                    <th className="w-32">Status</th>
                    <th className="w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllWorks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
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
                          {/* 1. Work Title */}
                          <td>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-xs text-white leading-snug">
                                {task.title}
                              </div>
                              {task.desc && (
                                <p className="text-[11px] text-slate-400 line-clamp-1">{task.desc}</p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="mkt-badge mkt-badge-purple text-[9.5px]">
                                  {task.category}
                                </span>
                                {task.attachment && (
                                  <span className="text-sky-400 flex items-center gap-0.5">
                                    <Paperclip size={10} />
                                    <span>{task.attachment}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Assigned Employee */}
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

                          {/* 3. Priority */}
                          <td>{getPriorityBadge(task.priority)}</td>

                          {/* 4. Deadline */}
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

                          {/* 5. Status */}
                          <td>
                            <div className="space-y-1">
                              {getStatusBadge(task.status)}
                              {typeof task.progress === 'number' && (
                                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full ${isDone ? 'bg-emerald-400' : 'bg-purple-500'}`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Update Button (Blue) */}
                              <button
                                onClick={() => openTaskUpdateModal(task)}
                                className="mkt-action-btn btn-mkt-primary-blue"
                                title="Update Progress / Submit Completion"
                              >
                                Update
                              </button>

                              {/* Slip Print Button */}
                              <button
                                onClick={() => openTaskPrintModal(task, 'single')}
                                className="mkt-action-btn-icon btn-mkt-cyan"
                                title="Print Work Order Slip"
                              >
                                <Printer size={13} />
                              </button>

                              {/* Edit Button (Dark glass with blue border) */}
                              <button
                                onClick={() => openTaskModal(task)}
                                className="mkt-action-btn-icon btn-mkt-glass text-sky-400 hover:text-white"
                                title="Edit Assignment"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Button (Dark glass with red border) */}
                              <button
                                onClick={() => handleDelete(task.id, task.title)}
                                className="mkt-action-btn-icon btn-mkt-delete-red"
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

            {/* Team Workload Summary Strip underneath Overview Table */}
            <div className="mkt-card !p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Team Workload Allocation
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">{employeeOptions.length} Active Members</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {employeeOptions.map((emp) => {
                  const empTasks = marketingTasks.filter((t) => t.assignedTo === emp);
                  const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
                  const empPending = empTasks.length - empCompleted;
                  return (
                    <div
                      key={emp}
                      onClick={() => {
                        setEmployeeFilter(emp);
                        handleTabChange('all_works');
                      }}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="font-semibold text-slate-200 text-xs truncate">{emp}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{empPending} pending</span>
                        <span className="text-emerald-400 font-bold">{empCompleted} done</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ALL WORKS TABLE VIEW */}
        {activeTab === 'all_works' && (
          <div className="space-y-4 w-full">
            {/* Search and Filters Toolbar */}
            <div className="mkt-card !p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
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

            {/* Step 4: Full-Width Work Table */}
            <div className="mkt-table-container">
              <table className="mkt-work-table">
                <thead>
                  <tr>
                    <th className="min-w-[260px]">Work Title</th>
                    <th className="w-40">Assigned Employee</th>
                    <th className="w-24">Priority</th>
                    <th className="w-36">Deadline</th>
                    <th className="w-32">Status</th>
                    <th className="w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllWorks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
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
                          {/* 1. Work Title */}
                          <td>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-xs text-white leading-snug">
                                {task.title}
                              </div>
                              {task.desc && (
                                <p className="text-[11px] text-slate-400 line-clamp-1">{task.desc}</p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="mkt-badge mkt-badge-purple text-[9.5px]">
                                  {task.category}
                                </span>
                                {task.attachment && (
                                  <span className="text-sky-400 flex items-center gap-0.5">
                                    <Paperclip size={10} />
                                    <span>{task.attachment}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Assigned Employee */}
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

                          {/* 3. Priority */}
                          <td>{getPriorityBadge(task.priority)}</td>

                          {/* 4. Deadline */}
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

                          {/* 5. Status */}
                          <td>
                            <div className="space-y-1">
                              {getStatusBadge(task.status)}
                              {typeof task.progress === 'number' && (
                                <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full ${isDone ? 'bg-emerald-400' : 'bg-purple-500'}`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Update Button (Blue) */}
                              <button
                                onClick={() => openTaskUpdateModal(task)}
                                className="mkt-action-btn btn-mkt-primary-blue"
                                title="Update Progress / Submit Completion"
                              >
                                Update
                              </button>

                              {/* Slip Print Button */}
                              <button
                                onClick={() => openTaskPrintModal(task, 'single')}
                                className="mkt-action-btn-icon btn-mkt-cyan"
                                title="Print Work Order Slip"
                              >
                                <Printer size={13} />
                              </button>

                              {/* Edit Button (Dark glass with blue border) */}
                              <button
                                onClick={() => openTaskModal(task)}
                                className="mkt-action-btn-icon btn-mkt-glass text-sky-400 hover:text-white"
                                title="Edit Assignment"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Button (Dark glass with red border) */}
                              <button
                                onClick={() => handleDelete(task.id, task.title)}
                                className="mkt-action-btn-icon btn-mkt-delete-red"
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

        {/* VIEW 3: DEDICATED TODAY'S WORK VIEW */}
        {activeTab === 'today' && (
          <div className="space-y-4 w-full">
            {/* Quick Filter Bar */}
            <div className="mkt-card !p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-purple-400" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Today's Deliverable Queue
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tasks scheduled, in-progress, or due on {currentToday}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { id: 'All', label: 'All Today' },
                  { id: 'My', label: 'My Tasks' },
                  { id: 'InProgress', label: 'In Progress' },
                  { id: 'Completed', label: 'Completed' },
                  { id: 'Overdue', label: 'Overdue Alert' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setTodayQuickFilter(filter.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      todayQuickFilter === filter.id
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                        : 'text-slate-400 hover:text-white bg-slate-900/60'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Today's Work Table */}
            <div className="mkt-table-container">
              <table className="mkt-work-table">
                <thead>
                  <tr>
                    <th className="min-w-[260px]">Work Title</th>
                    <th className="w-40">Assigned Employee</th>
                    <th className="w-24">Priority</th>
                    <th className="w-36">Deadline</th>
                    <th className="w-32">Status</th>
                    <th className="w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTodayWorks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                        No tasks found for today matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTodayWorks.map((task) => {
                      const isDone = task.status === 'Completed';
                      const isOverdue = task.dueDate && task.dueDate < currentToday && !isDone;

                      return (
                        <tr key={task.id} className={`${isDone ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`}>
                          <td>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-xs text-white">{task.title}</div>
                              {task.desc && <p className="text-[11px] text-slate-400 line-clamp-1">{task.desc}</p>}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300 flex-shrink-0">
                                {(task.assignedTo || 'E').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-slate-200 truncate">{task.assignedTo}</span>
                            </div>
                          </td>
                          <td>{getPriorityBadge(task.priority)}</td>
                          <td>
                            <div className="text-xs text-slate-200 font-semibold flex items-center gap-1">
                              <Calendar size={11} className="text-slate-400" />
                              <span>{task.dueDate} {task.dueTime || ''}</span>
                            </div>
                          </td>
                          <td>{getStatusBadge(task.status)}</td>
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openTaskUpdateModal(task)}
                                className="mkt-action-btn btn-mkt-primary-blue"
                                title="Update Progress / Submit Completion"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => openTaskPrintModal(task, 'single')}
                                className="mkt-action-btn-icon btn-mkt-cyan"
                                title="Print Work Order Slip"
                              >
                                <Printer size={13} />
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

        {/* VIEW 4: DIGITAL MARKETING CORPORATE PRINT CENTER & WORKSPACE */}
        {activeTab === 'reports' && (
          <MarketingPrintCenter />
        )}
      </div>

      {/* ============================================================= */}
      {/* NOTIFICATIONS DRAWER COMPONENT                                */}
      {/* ============================================================= */}
      <MarketingNotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}
