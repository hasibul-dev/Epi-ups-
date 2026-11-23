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
          className="btn-mkt-it"
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
            className="mkt-input pl-9 text-xs"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mkt-select text-xs"
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
            className="mkt-select text-xs"
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
            className="mkt-select text-xs"
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
      <div className="mkt-card space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong className="text-white">{filteredTickets.length}</strong> matching support tickets</span>
        </div>

        <div className="table-responsive">
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject & Description</th>
                <th>Requestor & Dept</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Technician</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                    No tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((tick) => (
                  <tr key={tick.id}>
                    <td>
                      <span className="font-mono font-bold text-amber-400">{tick.id}</span>
                      <div className="text-[10px] text-slate-500">{tick.createdDate}</div>
                    </td>

                    <td className="max-w-[280px]">
                      <div className="font-semibold text-white truncate">{tick.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{tick.description}</div>
                    </td>

                    <td>
                      <div className="font-medium text-slate-200">{tick.requestingEmployee}</div>
                      <div className="text-[11px] text-slate-400">{tick.department}</div>
                    </td>

                    <td className="text-slate-300">{tick.issueCategory}</td>

                    <td>
                      <span
                        className={`mkt-badge ${
                          tick.priority === 'Critical'
                            ? 'mkt-badge-red'
                            : tick.priority === 'High'
                            ? 'mkt-badge-amber'
                            : 'mkt-badge-blue'
                        }`}
                      >
                        {tick.priority}
                      </span>
                    </td>

                    <td className="text-slate-200 font-medium">
                      {tick.assignedTechnician || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>

                    <td>
                      <span
                        className={`mkt-badge ${
                          tick.status === 'Resolved'
                            ? 'mkt-badge-green'
                            : tick.status === 'In Progress'
                            ? 'mkt-badge-amber'
                            : 'mkt-badge-blue'
                        }`}
                      >
                        {tick.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTicketDetails(tick)}
                          className="btn-mkt-secondary !py-1 !px-2.5 !h-auto !min-h-0 text-xs flex items-center gap-1"
                          title="View Details & Print Service Slip"
                        >
                          <FileText size={12} className="text-sky-400" />
                          <span>Slip</span>
                        </button>

                        {tick.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickResolve(tick)}
                            className="btn-mkt-action btn-mkt-success !p-1.5"
                            title="Quick Resolve Ticket"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => openTicketModal(tick)}
                          className="btn-mkt-action btn-mkt-edit"
                          title="Edit Ticket"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => handleDelete(tick.id, tick.title)}
                          className="btn-mkt-action btn-mkt-delete"
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
