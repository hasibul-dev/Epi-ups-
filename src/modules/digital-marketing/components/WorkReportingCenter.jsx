import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  CheckSquare,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today, addDays, fmt, inRange } from '../../sales/utils/helpers.js';
import { exportToPdf, exportToCsv, printFormattedReport } from '../../../services/reportExport.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import WorkPrintDocument from './WorkPrintDocument.jsx';

const REPORT_TABS = [
  { id: 'all', label: 'All Work History', icon: FileText, desc: 'Comprehensive historical registry of all marketing assignments and deliverables' },
  { id: 'completed', label: 'Completed Works Report', icon: CheckSquare, desc: 'Audited log of completed deliverables, submission notes & verified collateral assets' },
  { id: 'inprogress', label: 'In-Progress & Active Report', icon: Clock, desc: 'Active task queue, deadlines & ongoing operational workload distribution' },
  { id: 'overdue', label: 'Overdue Deliverables Report', icon: AlertTriangle, desc: 'Overdue tasks past target deadline requiring immediate completion & review' },
  { id: 'employee', label: 'Employee Work Allocation', icon: Users, desc: 'Workload distribution, assigned tasks & specialist capacity tracking' },
];

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

/**
 * Digital Marketing Work History & Reports System
 * Directly modeled after Sales Department Reports (same layout, filtering, preview & printing workflow).
 */
export default function WorkReportingCenter() {
  const { data, openTaskPrintModal, openTaskDetailsModal, openTaskUpdateModal } = useMarketing();
  const { marketingTasks = [] } = data;
  const currentToday = today();

  const [activeReport, setActiveReport] = useState('all');
  const [from, setFrom] = useState(addDays(today(), -30));
  const [to, setTo] = useState(today());
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [previewMode, setPreviewMode] = useState(false);

  // Dynamic Employee List
  const employeeOptions = useMemo(() => {
    const list = new Set(['Tanvir Ahmed', 'Samia Jahan', 'Rafiul Islam', 'Md. Al-Amin', 'Kamrul Hasan', 'Kazi Nasim']);
    try {
      const dbUsers = centralStore.getUsers();
      if (Array.isArray(dbUsers)) {
        dbUsers.forEach((u) => {
          if (u.name) list.add(u.name);
        });
      }
    } catch { }
    marketingTasks.forEach((t) => {
      if (t.assignedTo) list.add(t.assignedTo);
    });
    return Array.from(list);
  }, [marketingTasks]);

  // Quick Date Presets (Matching Sales)
  const setPreset = (preset) => {
    const t = today();
    if (preset === 'today') {
      setFrom(t);
      setTo(t);
    } else if (preset === '7days') {
      setFrom(addDays(t, -6));
      setTo(t);
    } else if (preset === '30days') {
      setFrom(addDays(t, -29));
      setTo(t);
    } else if (preset === 'thisMonth') {
      const parts = t.split('-');
      setFrom(`${parts[0]}-${parts[1]}-01`);
      setTo(t);
    } else if (preset === 'ytd') {
      const parts = t.split('-');
      setFrom(`${parts[0]}-01-01`);
      setTo(t);
    } else if (preset === 'all') {
      setFrom('2020-01-01');
      setTo('2099-12-31');
    }
  };

  const activeDef = REPORT_TABS.find((t) => t.id === activeReport) || REPORT_TABS[0];

  // Filtered dataset
  const filteredTasks = useMemo(() => {
    const fromDate = from || '2020-01-01';
    const toDate = to || '2099-12-31';
    const q = searchQuery.trim().toLowerCase();

    return marketingTasks.filter((t) => {
      // Tab constraint
      const isOverdue = t.dueDate && t.dueDate < currentToday && t.status !== 'Completed';
      if (activeReport === 'completed' && t.status !== 'Completed') return false;
      if (activeReport === 'inprogress' && t.status === 'Completed') return false;
      if (activeReport === 'overdue' && !isOverdue) return false;

      // Dropdown filters
      if (employeeFilter !== 'All' && t.assignedTo !== employeeFilter) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;

      // Date range constraint
      const tDate = t.completedDate || t.dueDate || t.startDate;
      if (tDate && (tDate < fromDate || tDate > toDate)) return false;

      // Search keyword
      if (q) {
        const match = [t.id, t.title, t.desc, t.assignedTo, t.category, t.completionNotes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!match.includes(q)) return false;
      }

      return true;
    });
  }, [marketingTasks, activeReport, from, to, employeeFilter, categoryFilter, statusFilter, searchQuery, currentToday]);

  // Metric counts
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => t.status === 'Completed').length;
  const pendingCount = filteredTasks.filter((t) => t.status !== 'Completed').length;
  const overdueCount = filteredTasks.filter((t) => t.dueDate && t.dueDate < currentToday && t.status !== 'Completed').length;

  // PDF Export (Matching Sales)
  const handleExportPdf = () => {
    const dateRangeStr = `${fmt(from)} to ${fmt(to)}`;
    const headers = ['SL', 'Order ID', 'Work Title & Scope', 'Category', 'Specialist', 'Start Date', 'Deadline', 'Status', 'Notes'];
    const pdfRows = filteredTasks.map((t, idx) => [
      idx + 1,
      `#${t.id}`,
      t.title || '',
      t.category || 'General',
      t.assignedTo || 'Unassigned',
      t.startDate ? fmt(t.startDate) : '—',
      t.dueDate ? fmt(t.dueDate) : '—',
      t.status || 'Assigned',
      t.completionNotes || t.desc || '—',
    ]);

    exportToPdf({
      title: activeDef.label,
      department: 'Marketing',
      subtitle: activeDef.desc,
      dateRange: dateRangeStr,
      headers,
      rows: pdfRows,
      summary: {
        'Total Records': totalCount,
        'Completed': completedCount,
        'Pending': pendingCount,
        'Overdue': overdueCount,
      },
      orientation: 'landscape',
      filename: `Digital_Marketing_${activeReport}_Report_${currentToday}.pdf`,
    });
  };

  // Excel / CSV Export (Matching Sales)
  const handleExportExcel = () => {
    const dateRangeStr = `${from} to ${to}`;
    const headers = ['SL No', 'Work Order ID', 'Work Title', 'Deliverable Scope', 'Category', 'Specialist', 'Start Date', 'Deadline', 'Completed Date', 'Status', 'Completion Notes'];
    const csvRows = filteredTasks.map((t, idx) => [
      idx + 1,
      `#${t.id}`,
      t.title || '',
      t.desc || '',
      t.category || 'General',
      t.assignedTo || 'Unassigned',
      t.startDate || '',
      t.dueDate || '',
      t.completedDate || '',
      t.status || 'Assigned',
      t.completionNotes || '',
    ]);

    exportToCsv({
      title: activeDef.label,
      department: 'Digital Marketing Department',
      dateRange: dateRangeStr,
      headers,
      rows: csvRows,
    });
  };

  // Native Browser Print (Matching Sales)
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 1. Report Selector Tab Bar (Matches Sales Reports.jsx) */}
      <div className="dm-card !p-4 no-print">
        <div className="mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>📊</span>
            <span>Corporate Print &amp; Reporting Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate, filter, preview, and print official company records with full letterhead, signatures, and Excel/PDF export
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReport(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Filters & Controls Toolbar (Matches Sales Reports.jsx) */}
      <div className="dm-card !p-4 space-y-3 no-print">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-white/10">
          <div>
            <span className="text-sm font-bold text-sky-400">{activeDef.label}</span>
            <span className="text-xs text-slate-400 ml-2">{activeDef.desc}</span>
          </div>

          {/* Quick Date Presets */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Presets:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'ytd', label: 'YTD' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className="dm-preset-btn"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="dm-input !py-1 text-xs w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">End Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="dm-input !py-1 text-xs w-full"
            />
          </div>

          {/* Filter Employee */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Filter Employee</label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="dm-select text-xs w-full"
            >
              <option value="All">All Employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Filter Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="dm-select text-xs w-full"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Keyword */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Title, scope, employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dm-input !pl-7 !py-1 text-xs w-full"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Action Buttons: Preview Toggle, Excel, PDF, Print (Matches Sales) */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="dm-btn dm-btn-secondary !h-8 !px-2.5 text-xs flex items-center gap-1.5"
              title="Toggle A4 Print Preview"
            >
              <Eye size={13} />
              <span>{previewMode ? 'Live Table' : 'Print Preview'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="dm-btn dm-btn-secondary !h-8 !px-2.5 text-xs flex items-center gap-1.5"
              title="Export Formatted CSV / Excel"
            >
              <FileSpreadsheet size={13} />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="dm-btn dm-btn-secondary !h-8 !px-2.5 text-xs flex items-center gap-1.5"
              title="Export Clean PDF Document"
            >
              <Download size={13} />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerPrint}
              className="dm-btn dm-btn-primary !h-8 !px-3 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30"
              title="Print Document"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Summary Metrics Bar (Matches Sales Reports.jsx) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="dm-card !p-3 border-slate-800">
          <div className="text-lg font-bold text-white">{totalCount}</div>
          <span className="text-[11px] font-semibold text-slate-400">Total Filtered Records</span>
        </div>
        <div className="dm-card !p-3 border-slate-800">
          <div className="text-lg font-bold text-emerald-400">{completedCount}</div>
          <span className="text-[11px] font-semibold text-slate-400">Completed Deliverables</span>
        </div>
        <div className="dm-card !p-3 border-slate-800">
          <div className="text-lg font-bold text-sky-400">{pendingCount}</div>
          <span className="text-[11px] font-semibold text-slate-400">Pending / In Progress</span>
        </div>
        <div className="dm-card !p-3 border-slate-800">
          <div className="text-lg font-bold text-rose-400">{overdueCount}</div>
          <span className="text-[11px] font-semibold text-slate-400">Overdue Action Items</span>
        </div>
      </div>

      {/* 4. Dual View: Inline A4 Document Print Preview OR Live Work History Table */}
      {previewMode ? (
        <div className="print-page-container bg-white p-4 sm:p-6 max-w-[1050px] mx-auto text-slate-900 border border-slate-200">
          <WorkPrintDocument
            reportType={activeReport === 'completed' ? 'completion' : activeReport === 'employee' ? 'assignment' : 'history'}
            tasks={filteredTasks}
            orientation="landscape"
            filters={{ startDate: from, endDate: to, employee: employeeFilter }}
          />
        </div>
      ) : (
        /* Live Work History Table (Matches Sales Reports.jsx) */
        <div className="dm-card !p-0 overflow-hidden no-print">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {activeDef.label} ({filteredTasks.length} Records)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Click "Print Slip" on any record to directly preview and print that individual work order
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No work records found matching the active filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="mkt-table w-full">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>SL</th>
                    <th style={{ width: '80px' }}>Order ID</th>
                    <th>Work Title &amp; Scope</th>
                    <th style={{ width: '130px' }}>Specialist</th>
                    <th style={{ width: '120px' }}>Category</th>
                    <th style={{ width: '95px' }}>Start Date</th>
                    <th style={{ width: '100px' }}>Target Date</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>Status</th>
                    <th>Completion Notes</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t, idx) => (
                    <tr key={t.id}>
                      <td className="text-center text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="font-mono font-bold text-sky-400 text-xs">
                        #{t.id}
                      </td>
                      <td>
                        <div className="font-bold text-white text-xs">{t.title}</div>
                        {t.desc && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {t.desc}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-200">
                          {t.assignedTo || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-300 font-medium">
                          {t.category || 'General'}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-400">
                        {t.startDate || '—'}
                      </td>
                      <td className="font-mono text-xs text-slate-300">
                        {t.completedDate || t.dueDate || '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : t.status === 'In Progress'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {t.status || 'Assigned'}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400 max-w-[180px] truncate">
                        {t.completionNotes || t.completionAttachment || t.attachment || '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Individual Work Record Print Slip Button */}
                          <button
                            type="button"
                            onClick={() => openTaskPrintModal({ item: t, type: 'single' })}
                            className="mkt-action-btn btn-print-slip"
                            title="Directly Print Individual Work Order Slip"
                          >
                            <Printer size={12} />
                            <span>Print Slip</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openTaskDetailsModal(t)}
                            className="mkt-action-btn btn-view-details"
                            title="View Details"
                          >
                            <Eye size={12} />
                            <span>View</span>
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
      )}

      {/* Hidden print mount for browser printing when table view is active */}
      {!previewMode && (
        <div id="mkt-hidden-print-sheet" className="dm-print-sheet-mount">
          <WorkPrintDocument
            reportType={activeReport === 'completed' ? 'completion' : activeReport === 'employee' ? 'assignment' : 'history'}
            tasks={filteredTasks}
            orientation="landscape"
            filters={{ startDate: from, endDate: to, employee: employeeFilter }}
          />
        </div>
      )}
    </div>
  );
}
