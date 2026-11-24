import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  CheckSquare,
  Filter,
  Search,
  RotateCcw,
  Eye,
  Table,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  User,
  Tag,
  Paperclip,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today, fmt } from '../../sales/utils/helpers.js';
import { exportToPdf } from '../../../services/reportExport.js';
import MarketingPrintDocument from './MarketingPrintDocument.jsx';

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

export default function MarketingPrintCenter() {
  const { data, openTaskPrintModal } = useMarketing();
  const { marketingTasks = [] } = data;
  const currentToday = today();

  // Active Report Selection: 'single' | 'history' | 'completion' | 'assignment'
  const [activeReport, setActiveReport] = useState('single');

  // Preview / View Mode: 'preview' (A4 document) | 'table' (raw records)
  const [viewMode, setViewMode] = useState('preview');

  // Page Orientation preference
  const [orientation, setOrientation] = useState('portrait');

  // Selected single task ID
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // --------------------------------------------------------------------------
  // Dynamic Filters
  // --------------------------------------------------------------------------
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState('All'); // 'All' | 'WithAssets'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Employee list
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
    marketingTasks.forEach((t) => {
      if (t.assignedTo) list.add(t.assignedTo);
    });
    return Array.from(list);
  }, [marketingTasks]);

  // Set default selected task if none chosen
  const singleTask = useMemo(() => {
    if (selectedTaskId) {
      const found = marketingTasks.find((t) => t.id === selectedTaskId);
      if (found) return found;
    }
    // Default to the first task matching employee filter if set
    if (employeeFilter !== 'All') {
      const byEmp = marketingTasks.find((t) => t.assignedTo === employeeFilter);
      if (byEmp) return byEmp;
    }
    return marketingTasks[0] || null;
  }, [marketingTasks, selectedTaskId, employeeFilter]);

  // --------------------------------------------------------------------------
  // Filtered Task Lists per Report Type
  // --------------------------------------------------------------------------
  const filteredTasks = useMemo(() => {
    return marketingTasks.filter((task) => {
      // 1. Employee
      if (employeeFilter !== 'All' && task.assignedTo !== employeeFilter) return false;

      // 2. Category
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;

      // 3. Priority (relevant for Assignment & History)
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

      // 4. Status (for Assignment & History)
      if (activeReport === 'completion') {
        if (task.status !== 'Completed') return false;
      } else if (activeReport === 'assignment') {
        if (task.status === 'Completed') return false;
        if (statusFilter !== 'All' && task.status !== statusFilter) return false;
      } else if (activeReport === 'history') {
        if (statusFilter !== 'All' && task.status !== statusFilter) return false;
      }

      // 5. Asset status for Completion report
      if (activeReport === 'completion' && assetFilter === 'WithAssets') {
        if (!task.completionAttachment && !task.attachment) return false;
      }

      // 6. Date Range
      const taskDate = task.completedDate || task.dueDate || task.startDate;
      if (startDate && taskDate && taskDate < startDate) return false;
      if (endDate && taskDate && taskDate > endDate) return false;

      // 7. Search Keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(q);
        const matchDesc = (task.desc || '').toLowerCase().includes(q);
        const matchNotes = (task.completionNotes || '').toLowerCase().includes(q);
        const matchId = (task.id || '').toLowerCase().includes(q);
        const matchAsset = (task.completionAttachment || task.attachment || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchNotes && !matchId && !matchAsset) return false;
      }

      return true;
    });
  }, [
    marketingTasks,
    activeReport,
    employeeFilter,
    categoryFilter,
    priorityFilter,
    statusFilter,
    assetFilter,
    startDate,
    endDate,
    searchQuery,
  ]);

  // Quick Date Range Presets
  const applyDatePreset = (preset) => {
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(currentToday);
      setEndDate(currentToday);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(currentToday);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(currentToday);
    }
  };

  const resetAllFilters = () => {
    setEmployeeFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setAssetFilter('All');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    employeeFilter !== 'All' ||
    categoryFilter !== 'All' ||
    priorityFilter !== 'All' ||
    statusFilter !== 'All' ||
    assetFilter !== 'All' ||
    startDate !== '' ||
    endDate !== '' ||
    searchQuery !== '';

  // --------------------------------------------------------------------------
  // Print & PDF Export Triggers
  // --------------------------------------------------------------------------
  const handlePrintDocument = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (activeReport === 'single' && singleTask) {
      exportToPdf({
        title: 'INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT',
        department: 'Marketing',
        subtitle: `Work Order ID: ${singleTask.id || 'N/A'} · Assigned: ${singleTask.assignedTo || 'Unassigned'}`,
        dateRange: `Issued: ${singleTask.startDate || currentToday} | Deadline: ${singleTask.dueDate || '—'}`,
        headers: ['Specification Attribute', 'Operational Detail / Scope'],
        rows: [
          ['Work Order ID', singleTask.id || 'N/A'],
          ['Work Title', singleTask.title || ''],
          ['Assigned Employee', singleTask.assignedTo || 'Unassigned'],
          ['Category', singleTask.category || 'General Marketing'],
          ['Priority Level', singleTask.priority || 'Normal'],
          ['Assignment Date', singleTask.startDate || '—'],
          ['Target Deadline', `${singleTask.dueDate || '—'} ${singleTask.dueTime || ''}`],
          ['Current Status', singleTask.status || 'Assigned'],
          ['Completion Date', `${singleTask.completedDate || 'Pending'} ${singleTask.completedTime || ''}`],
          ['Project Brief & Scope', singleTask.desc || 'Standard deliverable scope.'],
          ['Completion Notes', singleTask.completionNotes || 'Deliverable handover.'],
          ['Attached Assets', singleTask.completionAttachment || singleTask.attachment || 'None'],
        ],
        orientation: 'portrait',
        filename: `Work_Order_Slip_${singleTask.id || 'MKT'}.pdf`,
      });
    } else if (activeReport === 'completion') {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT',
        department: 'Marketing',
        subtitle: 'Audited Log of Completed Deliverables and Verified Collateral Assets',
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : `As of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Deliverable Title', 'Responsible Employee', 'Category', 'Completed Date', 'Deliverable Assets', 'Status'],
        rows: filteredTasks.map((t, idx) => [
          idx + 1,
          t.id || `MKT-${idx + 1}`,
          t.title,
          t.assignedTo || 'Unassigned',
          t.category || 'General',
          `${t.completedDate || t.dueDate || '—'} ${t.completedTime || ''}`,
          t.completionAttachment || t.attachment || 'Verified Handover',
          t.status || 'Completed',
        ]),
        orientation: 'landscape',
        filename: `Marketing_Work_Completion_Report_${currentToday}.pdf`,
      });
    } else if (activeReport === 'assignment') {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT',
        department: 'Marketing',
        subtitle: 'Operational Workload Distribution and Target Delivery Milestones',
        dateRange: `Active Queue as of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Task Objective & Scope', 'Assigned Employee', 'Priority', 'Start Date', 'Target Deadline', 'Progress', 'Status'],
        rows: filteredTasks.map((t, idx) => [
          idx + 1,
          t.id || `MKT-${idx + 1}`,
          t.title,
          t.assignedTo || 'Unassigned',
          t.priority || 'Normal',
          t.startDate || '—',
          `${t.dueDate || '—'} ${t.dueTime || ''}`,
          typeof t.progress === 'number' ? `${t.progress}%` : '0%',
          t.status || 'Assigned',
        ]),
        orientation: 'landscape',
        filename: `Marketing_Work_Assignment_Report_${currentToday}.pdf`,
      });
    } else {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT',
        department: 'Marketing',
        subtitle: 'Comprehensive Performance and Historical Deliverable Registry',
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : `As of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Work Title & Scope', 'Category', 'Employee', 'Assigned Date', 'Completed Date', 'Status', 'Submission Notes'],
        rows: filteredTasks.map((t, idx) => [
          idx + 1,
          t.id || `MKT-${idx + 1}`,
          t.title,
          t.category || 'General',
          t.assignedTo || 'Unassigned',
          t.startDate || '—',
          t.completedDate || t.dueDate || '—',
          t.status || 'Assigned',
          t.completionNotes || t.desc || '—',
        ]),
        orientation: 'landscape',
        filename: `Marketing_Work_History_Report_${currentToday}.pdf`,
      });
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* =================================================================== */}
      {/* 1. WORKSPACE HEADER & TITLE                                         */}
      {/* =================================================================== */}
      <div className="mkt-card !p-4 bg-gradient-to-r from-slate-900/90 via-purple-950/20 to-slate-900/90 border border-purple-500/20 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-900/20">
              <Printer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  Corporate Print & Reporting Center
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Digital Marketing ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate, inspect and export verified official commercial records, work order slips, and performance audits.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-end sm:self-auto text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5">
            <div>
              <span className="text-slate-400 text-[11px]">Total Database Records:</span>{' '}
              <strong className="text-white font-bold">{marketingTasks.length}</strong>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div>
              <span className="text-slate-400 text-[11px]">Completed:</span>{' '}
              <strong className="text-emerald-400 font-bold">
                {marketingTasks.filter((t) => t.status === 'Completed').length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. COMPACT REPORT SELECTION NAVIGATION (4 CARDS / TABS)             */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 no-print">
        {/* Tab 1: Individual Slip */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('single');
            setOrientation('portrait');
          }}
          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
            activeReport === 'single'
              ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
          }`}
        >
          {activeReport === 'single' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          )}
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'single' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <FileText size={16} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              activeReport === 'single' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 bg-white/5'
            }`}>
              A4 Portrait
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
            1. Individual Work Slip
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Deliverable scope, completion notes & 3 signatures
          </p>
        </button>

        {/* Tab 2: Work History Report */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('history');
            setOrientation('landscape');
          }}
          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
            activeReport === 'history'
              ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
          }`}
        >
          {activeReport === 'history' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          )}
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'history' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <Clock size={16} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              activeReport === 'history' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 bg-white/5'
            }`}>
              A4 Landscape
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
            2. Work History Report
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Departmental historical registry & archive
          </p>
        </button>

        {/* Tab 3: Work Completion Report */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('completion');
            setOrientation('landscape');
          }}
          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
            activeReport === 'completion'
              ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
          }`}
        >
          {activeReport === 'completion' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          )}
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'completion' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <CheckCircle2 size={16} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              activeReport === 'completion' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 bg-white/5'
            }`}>
              Audit Verified
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
            3. Work Completion Report
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Delivered collateral & attached asset audit
          </p>
        </button>

        {/* Tab 4: Work Assignment Report */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('assignment');
            setOrientation('landscape');
          }}
          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
            activeReport === 'assignment'
              ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
          }`}
        >
          {activeReport === 'assignment' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          )}
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'assignment' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <CheckSquare size={16} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              activeReport === 'assignment' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 bg-white/5'
            }`}>
              Active Queue
            </span>
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
            4. Work Assignment Report
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Workload distribution & deadline schedules
          </p>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 3. DYNAMIC REPORT-SPECIFIC FILTER SECTION                           */}
      {/* =================================================================== */}
      <div className="mkt-card !p-4 bg-slate-900/80 border border-white/10 space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {activeReport === 'single' && 'Individual Slip Record Selector'}
              {activeReport === 'history' && 'Work History & Archive Search Filters'}
              {activeReport === 'completion' && 'Delivered Assets & Completion Audit Filters'}
              {activeReport === 'assignment' && 'Work Allocation & Assignment Filters'}
            </h3>
          </div>

          {/* Quick Date Presets (for History & Completion) */}
          {(activeReport === 'history' || activeReport === 'completion') && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => applyDatePreset('all')}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300"
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset('today')}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset('7days')}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300"
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset('30days')}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300"
              >
                30 Days
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* CONTROL: Specific to Individual Slip */}
          {activeReport === 'single' ? (
            <>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select Work Order Slip to Preview:
                </label>
                <select
                  value={singleTask?.id || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="mkt-select !py-1.5 text-xs font-semibold text-white bg-slate-950 border border-purple-500/30"
                >
                  {marketingTasks
                    .filter((t) => (employeeFilter === 'All' ? true : t.assignedTo === employeeFilter))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.id}] {t.title} · ({t.assignedTo || 'Unassigned'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Filter List by Employee:
                </label>
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
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Work Order ID:
                </label>
                <input
                  type="text"
                  readOnly
                  value={singleTask?.id || 'N/A'}
                  className="mkt-input !py-1 text-xs font-mono font-bold text-purple-300 bg-purple-950/20 border-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Current Status:
                </label>
                <input
                  type="text"
                  readOnly
                  value={singleTask?.status || 'Assigned'}
                  className="mkt-input !py-1 text-xs font-bold text-emerald-300 bg-emerald-950/20 border-emerald-500/20"
                />
              </div>
            </>
          ) : (
            /* CONTROLS: For History, Completion, and Assignment reports */
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Employee Filter:
                </label>
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
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category:
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mkt-select !py-1.5 text-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {activeReport === 'assignment' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Priority Level:
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="mkt-select !py-1.5 text-xs"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Queue Status:
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mkt-select !py-1.5 text-xs"
                    >
                      <option value="All">All Active Works</option>
                      <option value="In Progress">In Progress Only</option>
                      <option value="Assigned">Assigned / Pending</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </>
              ) : activeReport === 'completion' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Asset Attachment:
                    </label>
                    <select
                      value={assetFilter}
                      onChange={(e) => setAssetFilter(e.target.value)}
                      className="mkt-select !py-1.5 text-xs"
                    >
                      <option value="All">All Completed Works</option>
                      <option value="WithAssets">With Attached Deliverable Assets</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Start Date:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mkt-input !py-1 text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Start Date:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mkt-input !py-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      End Date:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mkt-input !py-1 text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Keyword Search:
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, title, deliverables..."
                  className="mkt-input !py-1 text-xs"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MODERN PRINT CENTER TOOLBAR (COMPACT 34PX BUTTONS)               */}
      {/* =================================================================== */}
      <div className="mkt-card !p-3 bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Left: Summary Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Showing:</span>
            <span className="px-2 py-0.5 rounded font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {activeReport === 'single' ? (singleTask ? '1 Selected Task' : '0') : `${filteredTasks.length} Records`}
            </span>
          </div>

          {/* Orientation Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                orientation === 'portrait' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Portrait
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                orientation === 'landscape' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Landscape
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={12} />
              <span>A4 Preview</span>
            </button>
            {activeReport !== 'single' && (
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table size={12} />
                <span>Data Table</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Print & PDF Action Buttons (Strictly 34px Uniform Height) */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="btn-mkt-glass text-purple-300 hover:text-white flex items-center gap-1 text-xs"
              title="Reset All Applied Filters"
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          )}

          {/* Direct PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="btn-mkt-secondary !h-[34px] !min-h-[34px] !py-1 !px-3 text-xs flex items-center gap-1.5"
            title="Download Clean PDF File"
          >
            <Download size={13} className="text-sky-400" />
            <span>Download PDF</span>
          </button>

          {/* Native Browser Print to Paper / PDF */}
          <button
            type="button"
            onClick={handlePrintDocument}
            className="btn-mkt-primary !h-[34px] !min-h-[34px] !py-1 !px-4 text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 font-bold"
            title="Print Document or Save to PDF via Browser"
          >
            <Printer size={13} />
            <span>Print to Paper / PDF</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. DOCUMENT PREVIEW / DATA TABLE AREA                               */}
      {/* =================================================================== */}
      {viewMode === 'preview' ? (
        <div className="space-y-2">
          {/* Document Preview Frame Info Ribbon */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 no-print">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300">
                Official Corporate Document Preview (Print-Ready Canvas)
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-mono">
                {orientation === 'landscape' ? 'A4 Landscape (297mm × 210mm)' : 'A4 Portrait (210mm × 297mm)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Standard contrast: Pure #FFFFFF & #111111</span>
            </div>
          </div>

          {/* White Paper Canvas Embedded in Dark Workspace */}
          <div className="p-3 sm:p-6 bg-slate-950/80 rounded-xl border border-white/10 shadow-2xl overflow-x-auto">
            <div
              className="mx-auto bg-white rounded shadow-2xl transition-all"
              style={{
                maxWidth: orientation === 'landscape' ? '1120px' : '860px',
                minHeight: '800px',
              }}
            >
              <MarketingPrintDocument
                reportType={activeReport}
                task={singleTask}
                tasks={filteredTasks}
                filters={{
                  employee: employeeFilter,
                  category: categoryFilter,
                  priority: priorityFilter,
                  status: statusFilter,
                  startDate,
                  endDate,
                }}
                orientation={orientation}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Alternate Quick Data Table View */
        <div className="mkt-table-container no-print">
          <table className="mkt-work-table">
            <thead>
              <tr>
                <th className="w-20">ID</th>
                <th className="min-w-[220px]">Work Title</th>
                <th className="w-32">Employee</th>
                <th className="w-28">Category</th>
                <th className="w-24">Priority</th>
                <th className="w-28">Target Date</th>
                <th className="w-28">Status</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs">
                    No matching records found in this criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-purple-950/10">
                    <td className="font-mono text-xs font-bold text-purple-300">{task.id}</td>
                    <td className="font-semibold text-xs text-white">{task.title}</td>
                    <td className="text-xs text-slate-200">{task.assignedTo || 'Unassigned'}</td>
                    <td>
                      <span className="mkt-badge mkt-badge-purple text-[10px]">{task.category}</span>
                    </td>
                    <td>
                      <span
                        className={`mkt-badge text-[10px] ${
                          task.priority === 'Urgent'
                            ? 'mkt-badge-red'
                            : task.priority === 'High'
                            ? 'mkt-badge-amber'
                            : 'mkt-badge-blue'
                        }`}
                      >
                        {task.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-300">{task.dueDate || task.completedDate || '—'}</td>
                    <td>
                      <span
                        className={`mkt-badge ${
                          task.status === 'Completed'
                            ? 'mkt-badge-green font-bold'
                            : task.status === 'In Progress'
                            ? 'mkt-badge-purple'
                            : 'mkt-badge-blue'
                        }`}
                      >
                        {task.status || 'Assigned'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setActiveReport('single');
                            setViewMode('preview');
                          }}
                          className="mkt-action-btn btn-mkt-cyan"
                          title="Preview Work Order Slip"
                        >
                          <FileText size={12} />
                          <span>Slip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
