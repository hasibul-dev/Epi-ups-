import React from 'react';
import {
  CalendarCheck,
  Plus,
  Eye,
  CheckSquare,
  Printer,
} from 'lucide-react';

export default function TodayWorkView({
  filteredTodayWorks,
  todayQuickFilter,
  setTodayQuickFilter,
  currentToday,
  onOpenDetails,
  onOpenUpdate,
  onOpenPrint,
  onOpenAdd,
  getPriorityBadge,
  getStatusBadge,
}) {
  return (
    <div className="space-y-4">
      {/* Header Banner with Today's Date */}
      <div className="dm-card bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
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
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today Tasks Table */}
      <div className="dm-card space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Today's Work Queue ({filteredTodayWorks.length} items)
          </h3>
          <button
            type="button"
            onClick={onOpenAdd}
            className="dm-btn dm-btn-primary !h-8 !px-3 text-xs"
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
            <table className="dm-table">
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
                          onClick={() => onOpenDetails(task)}
                          className="dm-row-btn-icon bg-slate-800 text-slate-300 hover:text-white"
                          title="Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenUpdate(task)}
                          className="dm-row-btn bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                          title="Update Progress"
                        >
                          <CheckSquare size={12} />
                          <span>Update</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPrint(task, 'single')}
                          className="dm-row-btn-icon bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
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
  );
}
