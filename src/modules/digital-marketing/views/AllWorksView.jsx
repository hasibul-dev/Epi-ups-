import React from 'react';
import {
  Filter,
  Search,
  RotateCcw,
  Printer,
  Plus,
  Eye,
  CheckSquare,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function AllWorksView({
  filteredAllWorks,
  totalAssigned,
  searchQuery,
  setSearchQuery,
  employeeFilter,
  setEmployeeFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  resetAllFilters,
  employeeOptions,
  categories,
  priorities,
  statuses,
  onOpenDetails,
  onOpenUpdate,
  onOpenPrint,
  onOpenEdit,
  onOpenDelete,
  onOpenAdd,
  getPriorityBadge,
  getStatusBadge,
}) {
  return (
    <div className="space-y-4">
      {/* Smart Filter Toolbar */}
      <div className="dm-card space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#25364B] pb-3">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Work Search & Filter Controls
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Showing <strong>{filteredAllWorks.length}</strong> of <strong>{totalAssigned}</strong> tasks
            </span>
            {(searchQuery || employeeFilter !== 'All' || categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work title, brief, ID, employee..."
              className="dm-input pl-9 text-xs"
            />
          </div>

          {/* Employee Dropdown */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="dm-select text-xs"
            >
              <option value="All">All Assigned Employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="dm-select text-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Work Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dm-select text-xs"
            >
              {statuses.map((st) => (
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
            {priorities.map((p) => {
              const active = priorityFilter === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Work Management Table */}
      <div className="dm-card space-y-3">
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
              onClick={() => onOpenPrint(null, 'assignment', filteredAllWorks)}
              className="dm-btn dm-btn-secondary !h-8 !px-3 text-xs"
              title="Print filtered list of work orders"
            >
              <Printer size={13} />
              <span>Print Table</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdd}
              className="dm-btn dm-btn-primary !h-8 !px-3 text-xs"
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
            <table className="dm-table">
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
                          onClick={() => onOpenDetails(task)}
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
                          <button
                            type="button"
                            onClick={() => onOpenDetails(task)}
                            className="dm-row-btn-icon bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Inspect Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenUpdate(task)}
                            className="dm-row-btn-icon bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white"
                            title="Update Progress"
                          >
                            <CheckSquare size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPrint(task, 'single')}
                            className="dm-row-btn-icon bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                            title="Print Slip"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEdit(task)}
                            className="dm-row-btn-icon bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-600 hover:text-white"
                            title="Edit Assignment"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDelete(task)}
                            className="dm-row-btn-icon bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white"
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
  );
}
