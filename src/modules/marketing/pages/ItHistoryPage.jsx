import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileText,
  Printer,
  Download,
  RotateCcw,
  User,
  Wrench,
  Server,
  Eye,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function ItHistoryPage() {
  const { data, openTicketDetails, saveTicket } = useMarketing();
  const { tickets, networkMaintenance } = data;

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'maintenance'
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Closed and resolved tickets
  const historyTickets = (tickets || []).filter((t) =>
    ['Resolved', 'Closed'].includes(t.status)
  );

  const filteredTickets = historyTickets.filter((t) => {
    const matchesSearch =
      (t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.requestingEmployee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedTechnician || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.resolutionDetails || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'All' || t.department === deptFilter;
    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesDept && matchesCat;
  });

  const filteredMaintenance = (networkMaintenance || []).filter((m) => {
    return (
      (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleReopen = (ticket) => {
    if (window.confirm(`Reopen ticket "${ticket.id}: ${ticket.title}"?`)) {
      saveTicket({
        ...ticket,
        status: 'In Progress',
        updatedAt: new Date().toISOString(),
      });
      alert(`Ticket ${ticket.id} has been reopened and returned to active queue.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'Ticket ID,Subject,Requesting User,Department,Category,Priority,Technician,Resolution,Resolved Date\n';
    filteredTickets.forEach((t) => {
      csv += `"${t.id}","${t.title}","${t.requestingEmployee}","${t.department}","${t.category}","${t.priority}","${t.assignedTechnician}","${(t.resolutionDetails || '').replace(/"/g, '""')}","${t.resolvedAt || t.updatedAt || '—'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EPI-IT-Work-History-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const departments = ['All', ...new Set((tickets || []).map((t) => t.department).filter(Boolean))];
  const categories = ['All', ...new Set((tickets || []).map((t) => t.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="mkt-hero-banner">
        <div className="mkt-hero-info">
          <div className="mkt-hero-badge">ARCHIVE &amp; AUDIT TRAIL</div>
          <h2>IT Work History &amp; Completed Tickets</h2>
          <p>
            Complete historical record of resolved helpdesk tickets, hardware repairs, and infrastructure maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handlePrint} className="btn-mkt-secondary" title="Print History Report">
            <Printer size={14} className="text-slate-300" />
            <span>Print</span>
          </button>
          <button onClick={handleExportCSV} className="btn-mkt-secondary" title="Export CSV Data">
            <Download size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="mkt-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`mkt-pill-filter ${activeTab === 'tickets' ? 'active-blue' : ''}`}
            >
              Resolved Helpdesk Tickets ({historyTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`mkt-pill-filter ${activeTab === 'maintenance' ? 'active-blue' : ''}`}
            >
              Network &amp; Server Maintenance ({networkMaintenance?.length || 0})
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{activeTab === 'tickets' ? filteredTickets.length : filteredMaintenance.length}</strong> completed records
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, requester, or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mkt-input pl-9 text-xs"
            />
          </div>

          {activeTab === 'tickets' && (
            <>
              <div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="mkt-select text-xs"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mkt-select text-xs"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab === 'tickets' ? (
        <div className="mkt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="mkt-table w-full">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject &amp; Issue</th>
                  <th>Department / User</th>
                  <th>Category</th>
                  <th>Technician</th>
                  <th>Resolution Summary</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">
                      No resolved tickets found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="font-mono text-sky-400 font-semibold">{t.id}</td>
                      <td>
                        <div
                          className="font-medium text-white hover:text-sky-400 cursor-pointer text-xs"
                          onClick={() => openTicketDetails(t)}
                        >
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {t.description}
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-white">{t.requestingEmployee}</div>
                        <div className="text-[11px] text-slate-400">{t.department}</div>
                      </td>
                      <td>
                        <span className="mkt-badge mkt-badge-blue text-[10px]">{t.category}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-300 flex items-center gap-1">
                          <User size={11} className="text-slate-400" />
                          {t.assignedTechnician || 'Unassigned'}
                        </span>
                      </td>
                      <td className="max-w-xs">
                        <div className="text-xs text-emerald-400/90 line-clamp-2">
                          {t.resolutionDetails || 'Resolved successfully.'}
                        </div>
                      </td>
                      <td>
                        <span className="mkt-badge mkt-badge-green text-[10.5px]">
                          <CheckCircle2 size={11} />
                          {t.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openTicketDetails(t)}
                            className="btn-mkt-action btn-mkt-edit"
                            title="View Full Details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleReopen(t)}
                            className="btn-mkt-action text-amber-400 hover:text-amber-300"
                            title="Reopen Ticket"
                          >
                            <RotateCcw size={13} />
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
      ) : (
        <div className="mkt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="mkt-table w-full">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Title / Maintenance Task</th>
                  <th>Vendor / Provider</th>
                  <th>Date &amp; Schedule</th>
                  <th>Downtime</th>
                  <th>Status</th>
                  <th>Technical Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No maintenance history logs found.
                    </td>
                  </tr>
                ) : (
                  filteredMaintenance.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="font-mono text-sky-400 text-xs">{m.id}</td>
                      <td>
                        <div className="text-xs font-medium text-white">{m.title}</div>
                        <div className="text-[11px] text-slate-400">{m.type}</div>
                      </td>
                      <td className="text-xs text-slate-300">{m.vendor}</td>
                      <td className="text-xs text-slate-300">
                        {m.date} {m.time ? `· ${m.time}` : ''}
                      </td>
                      <td className="text-xs text-amber-400">{m.downtime || 'None'}</td>
                      <td>
                        <span className="mkt-badge mkt-badge-success text-[10.5px]">
                          {m.status}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400 max-w-sm">{m.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
