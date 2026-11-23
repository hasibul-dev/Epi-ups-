import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Wrench,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['All', 'Critical', 'High', 'Normal', 'Low'];
const DEPARTMENTS = [
  'All',
  'Sales Department',
  'Service Department',
  'Accounts & ERP',
  'Executive Admin',
  'Digital Marketing & IT Support',
];

export default function ItTicketsPage() {
  const {
    data,
    openTicketModal,
    openTicketDetails,
    saveTicket,
    deleteTicket,
    resolveTicket,
    isItManager,
  } = useMarketing();
  const { tickets } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requestingEmployee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesDept = deptFilter === 'All' || t.department === deptFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete ticket "${id}: ${title}"?`)) {
      deleteTicket(id);
    }
  };

  const handleQuickResolve = (t) => {
    const details = window.prompt(
      `Enter resolution note for ticket ${t.id}:`,
      'Diagnosed and resolved by IT Support Engineer.'
    );
    if (details !== null) {
      resolveTicket(t.id, details);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">IT HELPDESK & TICKETING</div>
          <h2>IT Support Helpdesk & Issue Ticketing</h2>
          <p>
            Log employee IT hardware problems, software errors, network issues, and generate printable service slips
          </p>
        </div>
        <button
          onClick={() => openTicketModal()}
          className="btn-mkt-primary"
        >
          <Plus size={15} />
          <span>New IT Ticket</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by ID, user, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                Priority: {pr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {DEPARTMENTS.map((dp) => (
              <option key={dp} value={dp}>
                Dept: {dp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found {filteredTickets.length} matching support tickets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Subject & Description</th>
                <th className="py-2.5 px-3">Requestor & Dept</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                    No tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((tick) => (
                  <tr key={tick.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-amber-400">{tick.id}</span>
                      <div className="text-[10px] text-slate-500">{tick.createdDate}</div>
                    </td>

                    <td className="py-3 px-3 max-w-[280px]">
                      <div className="font-semibold text-white truncate">{tick.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{tick.description}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{tick.requestingEmployee}</div>
                      <div className="text-[11px] text-slate-400">{tick.department}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">{tick.issueCategory}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tick.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : tick.priority === 'High'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {tick.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-200 font-medium">
                      {tick.assignedTechnician || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tick.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : tick.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {tick.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTicketDetails(tick)}
                          className="btn-action-secondary px-2.5 py-1 rounded-lg text-xs flex items-center gap-1"
                          title="View Details & Print Service Slip"
                        >
                          <FileText size={12} />
                          <span>Slip</span>
                        </button>

                        {tick.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickResolve(tick)}
                            className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Quick Resolve Ticket"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => openTicketModal(tick)}
                          className="btn-action-secondary p-1 rounded-lg text-slate-300"
                          title="Edit Ticket"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => handleDelete(tick.id, tick.title)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 size={13} />
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
    </div>
  );
}
