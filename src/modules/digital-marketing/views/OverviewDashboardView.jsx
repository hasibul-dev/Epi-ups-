import React from 'react';
import {
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowUpRight,
  Eye,
  CheckSquare,
  Printer,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function OverviewDashboardView({
  metrics,
  onNavigateTab,
  onOpenDetails,
  onOpenUpdate,
  onOpenPrint,
  onFilterEmployee,
  onFilterStatus,
  onFilterPriority,
  getPriorityBadge,
  getStatusBadge,
  currentToday,
}) {
  return (
    <div className="space-y-5">
      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Assigned Works */}
        <div
          onClick={() => onNavigateTab('all_works')}
          className="dm-kpi-card group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="dm-kpi-label">Total Assigned</span>
            <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Layers size={16} />
            </div>
          </div>
          <div className="dm-kpi-val text-white group-hover:text-blue-300 transition-colors">
            {metrics.totalAssigned}
          </div>
          <div className="dm-kpi-sub text-slate-400">
            All marketing records in database
          </div>
        </div>

        {/* 2. Today's Work */}
        <div
          onClick={() => onNavigateTab('today')}
          className="dm-kpi-card group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="dm-kpi-label">Today's Queue</span>
            <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Calendar size={16} />
            </div>
          </div>
          <div className="dm-kpi-val text-white group-hover:text-sky-300 transition-colors">
            {metrics.todayWorksCount}
          </div>
          <div className="dm-kpi-sub text-slate-400">
            Active tasks or due today
          </div>
        </div>

        {/* 3. In Progress */}
        <div
          onClick={() => {
            onFilterStatus('In Progress');
            onNavigateTab('all_works');
          }}
          className="dm-kpi-card group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="dm-kpi-label">In Progress</span>
            <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="dm-kpi-val text-white group-hover:text-blue-300 transition-colors">
            {metrics.inProgress}
          </div>
          <div className="dm-kpi-sub text-slate-400">
            Currently under execution
          </div>
        </div>

        {/* 4. Completed */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="dm-kpi-card group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="dm-kpi-label">Completed</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="dm-kpi-val text-white group-hover:text-emerald-300 transition-colors">
            {metrics.completed}
          </div>
          <div className="dm-kpi-sub text-slate-400">
            Delivered & verified work
          </div>
        </div>

        {/* 5. Pending / Overdue */}
        <div
          onClick={() => {
            if (metrics.overdue > 0) {
              onNavigateTab('today');
            } else {
              onNavigateTab('all_works');
            }
          }}
          className={`dm-kpi-card group cursor-pointer ${
            metrics.overdue > 0
              ? '!border-red-500/60 bg-gradient-to-b from-red-950/30 to-slate-900/90 shadow-lg shadow-red-950/40'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`dm-kpi-label ${metrics.overdue > 0 ? 'text-red-300 font-bold' : ''}`}>
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
            className={`dm-kpi-val ${
              metrics.overdue > 0 ? 'text-red-400 font-black' : 'text-white'
            }`}
          >
            {metrics.overdue > 0 ? `${metrics.overdue} Overdue` : '0 Overdue'}
          </div>
          <div className="dm-kpi-sub text-slate-400">
            {metrics.overdue > 0
              ? 'Urgent attention required'
              : 'All tasks on schedule'}
          </div>
        </div>
      </div>

      {/* Section 1: Recent Active Works Table */}
      <div className="dm-card space-y-3">
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
            onClick={() => onNavigateTab('all_works')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>View All Works ({metrics.totalAssigned})</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {metrics.activeWorks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No active tasks found in the queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dm-table">
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
                        onClick={() => onOpenDetails(task)}
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
                          onClick={() => onOpenDetails(task)}
                          className="dm-row-btn-icon bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                          title="Inspect Work Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenUpdate(task)}
                          className="dm-row-btn bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                          title="Update Progress / Submit Work"
                        >
                          <CheckSquare size={12} />
                          <span>Update</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPrint(task, 'single')}
                          className="dm-row-btn-icon bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
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
        <div className="dm-card space-y-3">
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
                  onClick={() => onOpenDetails(task)}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-blue-500/30 hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between gap-3"
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
        <div className="dm-card space-y-3">
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
                    onClick={() => onOpenUpdate(task)}
                    className="dm-btn dm-btn-red !h-7 !px-2.5 text-[11px] flex-shrink-0"
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
      <div className="dm-card space-y-3">
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
                  onFilterEmployee(emp.name);
                  onNavigateTab('all_works');
                }}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-blue-500/40 hover:bg-slate-850 cursor-pointer transition-all space-y-2.5"
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
                        Marketing Specialist
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-400">
                    {completionPct}% Done
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                  <div className="p-1 rounded bg-black/40 border border-white/5">
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

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
      <div className="dm-card space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Completed Activities & Deliveries
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
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
                className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-xs">✓</span>
                    <h4
                      onClick={() => onOpenDetails(task)}
                      className="text-xs font-bold text-white hover:text-blue-300 cursor-pointer"
                    >
                      {task.title}
                    </h4>
                    <span className="dm-badge dm-badge-green text-[10px]">
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
                    onClick={() => onOpenDetails(task)}
                    className="dm-row-btn bg-slate-800 text-slate-200 hover:bg-slate-700"
                  >
                    <Eye size={12} />
                    <span>Inspect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPrint(task, 'single')}
                    className="dm-row-btn bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
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
  );
}
