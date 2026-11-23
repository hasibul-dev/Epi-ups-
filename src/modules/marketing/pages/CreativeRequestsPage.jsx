import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

const STATUS_COLUMNS = ['Briefed', 'In Progress', 'In Review', 'Approved'];

export default function CreativeRequestsPage() {
  const { data, openCreativeModal, saveCreativeRequest, deleteCreativeRequest } = useMarketing();
  const { creativeRequests } = data;

  const [filterDept, setFilterDept] = useState('All');

  const filteredRequests = creativeRequests.filter((r) => {
    return filterDept === 'All' || r.requestingDept === filterDept;
  });

  const handleStatusChange = (req, newStatus) => {
    saveCreativeRequest({ ...req, status: newStatus });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete design request "${title}"?`)) {
      deleteCreativeRequest(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">CREATIVE PIPELINE</div>
          <h2>Creative & Graphic Design Pipeline</h2>
          <p>
            Design requests from Sales, Service and Administration for brochures, exhibition roll-ups and digital banners
          </p>
        </div>
        <button
          onClick={() => openCreativeModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>New Design Request</span>
        </button>
      </div>

      {/* Department Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Requesting Dept:</span>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="All">All Departments</option>
          <option value="Sales Department">Sales Department</option>
          <option value="Service Department">Service Department</option>
          <option value="Accounts & ERP">Accounts & ERP</option>
          <option value="Executive Admin">Executive Admin</option>
        </select>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((colStatus) => {
          const colRequests = filteredRequests.filter((r) => r.status === colStatus);

          return (
            <div
              key={colStatus}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{colStatus}</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                    {colRequests.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colRequests.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-900/30 text-slate-500 text-xs italic">
                    No requests {colStatus.toLowerCase()}
                  </div>
                ) : (
                  colRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-sky-500/30 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          {req.requestingDept}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            req.priority === 'High'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-white">{req.title}</h4>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Dimensions: <span className="text-slate-300 font-mono">{req.dimensions}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800 line-clamp-3">
                        {req.brief}
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Due: <strong className="text-slate-300">{req.dueDate}</strong></span>
                        <span>Designer: <strong className="text-sky-300">{req.assignedDesigner}</strong></span>
                      </div>

                      <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req, e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 focus:outline-none"
                        >
                          {STATUS_COLUMNS.map((st) => (
                            <option key={st} value={st}>
                              Move: {st}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openCreativeModal(req)}
                            className="btn-action-secondary p-1 rounded-lg text-slate-300"
                            title="Edit Request"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(req.id, req.title)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            title="Delete Request"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
