import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Printer,
  Bell,
  Trash2,
  LayoutDashboard,
  Layers,
  CalendarCheck,
  History,
} from 'lucide-react';
import { useMarketing } from '../marketing/context/MarketingContext.jsx';
import { centralStore } from '../admin/services/centralStorage.js';
import { today } from '../sales/utils/helpers.js';

// Views
import OverviewDashboardView from './views/OverviewDashboardView.jsx';
import AllWorksView from './views/AllWorksView.jsx';
import TodayWorkView from './views/TodayWorkView.jsx';
import WorkReportingCenter from './components/WorkReportingCenter.jsx';

// Modals
import WorkModal from './components/WorkModal.jsx';
import WorkUpdateModal from './components/WorkUpdateModal.jsx';
import WorkDetailsModal from './components/WorkDetailsModal.jsx';
import WorkPrintModal from './components/WorkPrintModal.jsx';
import MarketingNotificationsDrawer from '../marketing/components/MarketingNotificationsDrawer.jsx';

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

export default function DigitalMarketingModule() {
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

  // Sync tab with URL
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

  // Filter states for All Works
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter state for Today's Work
  const [todayQuickFilter, setTodayQuickFilter] = useState('All');

  // Dialogs
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Dynamic Employee list from database
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

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalAssigned = marketingTasks.length;
    const inProgress = marketingTasks.filter((t) => t.status === 'In Progress').length;
    const completed = marketingTasks.filter((t) => t.status === 'Completed').length;
    const onHold = marketingTasks.filter((t) => t.status === 'On Hold').length;

    const overdueList = marketingTasks.filter(
      (t) => t.dueDate && t.dueDate < currentToday && t.status !== 'Completed'
    );
    const overdue = overdueList.length;

    const todayWorks = marketingTasks.filter((t) => {
      const isDueToday = t.dueDate === currentToday;
      const isAssignedToday = t.startDate === currentToday;
      const isOverdue = t.dueDate && t.dueDate < currentToday && t.status !== 'Completed';
      const isInProgress = t.status === 'In Progress';
      return isDueToday || isAssignedToday || isOverdue || (isInProgress && t.startDate <= currentToday);
    });

    const upcomingDeadlines = marketingTasks
      .filter((t) => t.status !== 'Completed' && t.dueDate && t.dueDate >= currentToday)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 6);

    const activeWorks = marketingTasks
      .filter((t) => t.status === 'In Progress' || t.status === 'Assigned' || t.status === 'To Do')
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 7);

    const recentCompleted = marketingTasks
      .filter((t) => t.status === 'Completed')
      .sort((a, b) => (b.completedDate || b.dueDate || '').localeCompare(a.completedDate || a.dueDate || ''))
      .slice(0, 5);

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

  // Filtered All Works
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

      if (employeeFilter !== 'All' && task.assignedTo !== employeeFilter) return false;
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

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

  // Filtered Today's Works
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
          <span className="dm-badge dm-badge-red flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="dm-badge dm-badge-amber flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            High
          </span>
        );
      case 'Normal':
        return (
          <span className="dm-badge dm-badge-blue flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Normal
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="dm-badge dm-badge-neutral flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="dm-badge dm-badge-green font-bold">✓ Completed</span>;
      case 'In Progress':
        return <span className="dm-badge dm-badge-blue font-bold">⏳ In Progress</span>;
      case 'On Hold':
        return <span className="dm-badge dm-badge-amber font-bold">⏸️ On Hold</span>;
      case 'Assigned':
      case 'To Do':
      default:
        return <span className="dm-badge dm-badge-neutral font-bold">📋 Assigned</span>;
    }
  };

  const confirmDelete = () => {
    if (taskToDelete?.id) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="dm-module-container">
      {/* 1. Corporate Header */}
      <header className="dm-topbar">
        <div className="dm-brand-block">
          <div className="dm-brand-icon-box">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="dm-brand-title">
              Digital Marketing Work Management
            </h1>
            <p className="dm-brand-subtitle">
              EPI UPS Bangladesh Limited
            </p>
          </div>
        </div>

        <div className="dm-topbar-actions">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => setIsNotifDrawerOpen(true)}
            className="dm-btn dm-btn-secondary"
            title="Work Assignment & Completion Alerts"
          >
            <Bell size={14} className="text-blue-400" />
            <span>Alerts</span>
            {unreadNotificationsCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                {unreadNotificationsCount}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-mono">
                ({notifications.length})
              </span>
            )}
          </button>

          {/* Print Center Shortcut */}
          <button
            type="button"
            onClick={() => handleTabChange('reports')}
            className="dm-btn dm-btn-secondary"
            title="Open Corporate Print & Reporting Center"
          >
            <Printer size={14} className="text-sky-400" />
            <span>Print Center</span>
          </button>

          {/* + Add Work Primary Button */}
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="dm-btn dm-btn-primary"
            title="Create and Assign New Work Order"
          >
            <Plus size={15} />
            <span>+ Add Work</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-lg bg-blue-600/25 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400">
                {user?.role === 'superadmin' ? 'Super Admin' : (user?.role || 'Marketing')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Navigation Subnav Bar */}
      <nav className="dm-nav-bar no-print">
        <div className="dm-nav-links">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`dm-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('all_works')}
            className={`dm-nav-btn ${activeTab === 'all_works' ? 'active' : ''}`}
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
            className={`dm-nav-btn ${activeTab === 'today' ? 'active' : ''}`}
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
            className={`dm-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          >
            <History size={14} />
            <span>Work History & Reports</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400/20 text-emerald-300 font-bold">
              {metrics.completed} Done
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          <span>Real-time DB Sync</span>
          <span>•</span>
          <span className="text-slate-300 font-medium">{currentToday}</span>
        </div>
      </nav>

      {/* 3. Section Content Routing */}
      {activeTab === 'overview' && (
        <OverviewDashboardView
          metrics={metrics}
          onNavigateTab={handleTabChange}
          onOpenDetails={openTaskDetailsModal}
          onOpenUpdate={openTaskUpdateModal}
          onOpenPrint={openTaskPrintModal}
          onFilterEmployee={setEmployeeFilter}
          onFilterStatus={setStatusFilter}
          onFilterPriority={setPriorityFilter}
          getPriorityBadge={getPriorityBadge}
          getStatusBadge={getStatusBadge}
          currentToday={currentToday}
        />
      )}

      {activeTab === 'all_works' && (
        <AllWorksView
          filteredAllWorks={filteredAllWorks}
          totalAssigned={metrics.totalAssigned}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          resetAllFilters={resetAllFilters}
          employeeOptions={employeeOptions}
          categories={CATEGORIES}
          priorities={PRIORITIES}
          statuses={STATUSES}
          onOpenDetails={openTaskDetailsModal}
          onOpenUpdate={openTaskUpdateModal}
          onOpenPrint={openTaskPrintModal}
          onOpenEdit={openTaskModal}
          onOpenDelete={(task) => setTaskToDelete({ id: task.id, title: task.title })}
          onOpenAdd={() => openTaskModal()}
          getPriorityBadge={getPriorityBadge}
          getStatusBadge={getStatusBadge}
        />
      )}

      {activeTab === 'today' && (
        <TodayWorkView
          filteredTodayWorks={filteredTodayWorks}
          todayQuickFilter={todayQuickFilter}
          setTodayQuickFilter={setTodayQuickFilter}
          currentToday={currentToday}
          onOpenDetails={openTaskDetailsModal}
          onOpenUpdate={openTaskUpdateModal}
          onOpenPrint={openTaskPrintModal}
          onOpenAdd={() => openTaskModal()}
          getPriorityBadge={getPriorityBadge}
          getStatusBadge={getStatusBadge}
        />
      )}

      {activeTab === 'reports' && (
        <WorkReportingCenter />
      )}

      {/* 4. Modals & Drawers */}
      <WorkModal />
      <WorkUpdateModal />
      <WorkDetailsModal />
      <WorkPrintModal />
      <MarketingNotificationsDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      {/* Custom Delete Confirmation Modal */}
      {taskToDelete && (
        <div
          className="dm-modal-backdrop"
          onClick={() => setTaskToDelete(null)}
        >
          <div
            className="dm-modal-card max-w-md p-5 space-y-4"
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
                  This action will permanently remove this record from the database.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white">"{taskToDelete.title}"</strong> (ID: #{taskToDelete.id})?
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="dm-btn dm-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="dm-btn dm-btn-red"
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
