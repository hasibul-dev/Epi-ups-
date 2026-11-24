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
  Layers,
  Calendar,
  User,
  Tag,
  Paperclip,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today } from '../../sales/utils/helpers.js';
import { exportToPdf } from '../../../services/reportExport.js';
import WorkPrintDocument from './WorkPrintDocument.jsx';

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

export default function WorkReportingCenter() {
  const { data, openTaskPrintModal } = useMarketing();
  const { marketingTasks = [] } = data;
  const currentToday = today();

  const [activeReport, setActiveReport] = useState('single');
  const [orientation, setOrientation] = useState('portrait');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Dynamic Filters
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load employee names from database
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

  // Selected single task
  const singleTask = useMemo(() => {
    if (selectedTaskId) {
      const found = marketingTasks.find((t) => t.id === selectedTaskId);
      if (found) return found;
    }
    if (employeeFilter !== 'All') {
      const byEmp = marketingTasks.find((t) => t.assignedTo === employeeFilter);
      if (byEmp) return byEmp;
    }
    return marketingTasks[0] || null;
  }, [selectedTaskId, employeeFilter, marketingTasks]);

  // Filtered dataset
  const filteredTasks = useMemo(() => {
    return marketingTasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchDesc = (t.desc || '').toLowerCase().includes(q);
        const matchEmp = (t.assignedTo || '').toLowerCase().includes(q);
        const matchCat = (t.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchEmp && !matchCat) return false;
      }

      if (employeeFilter !== 'All' && t.assignedTo !== employeeFilter) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

      if (statusFilter !== 'All') {
        if (t.status !== statusFilter) return false;
      }

      if (startDate && (t.completedDate || t.dueDate || t.startDate) < startDate) return false;
      if (endDate && (t.completedDate || t.dueDate || t.startDate) > endDate) return false;

      return true;
    });
  }, [marketingTasks, searchQuery, employeeFilter, categoryFilter, priorityFilter, statusFilter, startDate, endDate]);

  const handlePrintDocument = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('dm-print-document-preview');
    if (!element) return;
    const reportNames = {
      single: `EPI_Work_Order_Slip_${singleTask?.id || 'Doc'}`,
      history: 'EPI_Digital_Marketing_Work_History_Report',
      completion: 'EPI_Digital_Marketing_Work_Completion_Report',
      assignment: 'EPI_Digital_Marketing_Work_Assignment_Report',
    };
    await exportToPdf('dm-print-document-preview', reportNames[activeReport] || 'EPI_Report');
  };

  const resetFilters = () => {
    setEmployeeFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="dm-card flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Corporate Print & Reporting Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate and export official A4 corporate documents for Digital Marketing operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Orientation Toggle */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-2.5 py-1 rounded ${orientation === 'portrait' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Portrait
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-2.5 py-1 rounded ${orientation === 'landscape' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Landscape
            </button>
          </div>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="dm-btn dm-btn-secondary"
            title="Download high-resolution PDF document"
          >
            <Download size={14} className="text-sky-400" />
            <span>Download PDF</span>
          </button>

          {/* Print to Paper / PDF */}
          <button
            type="button"
            onClick={handlePrintDocument}
            className="dm-btn dm-btn-primary"
            title="Print document or save using browser dialog"
          >
            <Printer size={14} />
            <span>Print Document</span>
          </button>
        </div>
      </div>

      {/* 2. Report Selection Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        {/* Card 1: Single Work Slip */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('single');
            setOrientation('portrait');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === 'single'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/40'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'single' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <FileText size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              A4 Portrait
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">1. Individual Work Order Slip</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Task brief, deliverables & sign-off slip
          </p>
        </button>

        {/* Card 2: Work History Report */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('history');
            setOrientation('landscape');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === 'history'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/40'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'history' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <Clock size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              A4 Landscape
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">2. Work History Report</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Historical registry & operational archive
          </p>
        </button>

        {/* Card 3: Work Completion Report */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('completion');
            setOrientation('landscape');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === 'completion'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/40'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'completion' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Audit Verified
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">3. Work Completion Report</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Delivered collateral & asset audit report
          </p>
        </button>

        {/* Card 4: Work Assignment Report */}
        <button
          type="button"
          onClick={() => {
            setActiveReport('assignment');
            setOrientation('landscape');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === 'assignment'
              ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/40'
              : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className={`p-1.5 rounded-lg ${activeReport === 'assignment' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              <CheckSquare size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Active Queue
            </span>
          </div>
          <h4 className="text-xs font-bold text-white">4. Work Assignment Report</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            Workload distribution & deadline schedule
          </p>
        </button>
      </div>

      {/* 3. Report Filter Controls */}
      <div className="dm-card space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {activeReport === 'single' ? 'Select Record for Work Order Slip' : 'Report Search & Date Filters'}
            </h3>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>

        {activeReport === 'single' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Filter by Assigned Employee
              </label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Work Order Task
              </label>
              <select
                value={singleTask?.id || ''}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="dm-select text-xs"
              >
                {marketingTasks
                  .filter((t) => employeeFilter === 'All' || t.assignedTo === employeeFilter)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.id} - {t.title} ({t.assignedTo})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employee</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="dm-select text-xs"
              >
                <option value="All">All Employees</option>
                {employeeOptions.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="dm-select text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="dm-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="dm-input text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Live A4 Document Preview */}
      <div className="dm-card !p-4 bg-slate-900 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Document Print Preview (A4 Pure White Sheet)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Preview matches official paper and PDF export
          </span>
        </div>

        <div className="overflow-x-auto p-4 bg-slate-950/60 rounded-xl flex justify-center border border-white/5">
          <div id="dm-print-document-preview" className="shadow-2xl">
            <WorkPrintDocument
              reportType={activeReport}
              task={singleTask}
              tasks={filteredTasks}
              orientation={orientation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
