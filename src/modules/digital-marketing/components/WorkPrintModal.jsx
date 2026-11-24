import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  User,
  FileText,
  Clock,
  CheckSquare,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today } from '../../sales/utils/helpers.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { exportToPdf } from '../../../services/reportExport.js';
import WorkPrintDocument from './WorkPrintDocument.jsx';

/**
 * Streamlined, Professional Digital Marketing Print Modal Dialog
 * Opens a compact configuration dialog allowing the user to select:
 * 1. Report Type
 * 2. Employee (optional)
 * 3. Start Date & End Date (for bulk reports) OR Specific Work Record (for individual slip)
 * 4. Single-click "Generate & Print" or "Save as PDF"
 */
export default function WorkPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  const currentToday = today();
  const allTasks = data.marketingTasks || [];

  // Form State
  const [reportType, setReportType] = useState('single');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Extract Employee Options
  const employeeOptions = useMemo(() => {
    const set = new Set(['Tanvir Ahmed', 'Samia Jahan', 'Rafiul Islam', 'Md. Al-Amin', 'Kamrul Hasan', 'Kazi Nasim']);
    try {
      const dbUsers = centralStore.getUsers();
      if (Array.isArray(dbUsers)) {
        dbUsers.forEach((u) => {
          if (u.name) set.add(u.name);
        });
      }
    } catch {}
    allTasks.forEach((t) => {
      if (t.assignedTo) set.add(t.assignedTo);
    });
    return Array.from(set);
  }, [allTasks]);

  // Synchronize when modal opens
  useEffect(() => {
    if (open) {
      if (type === 'single') setReportType('single');
      else if (type === 'completion') setReportType('completion');
      else if (type === 'assignment') setReportType('assignment');
      else setReportType('history');

      setSelectedTaskId(item?.id || '');
      setSelectedEmployee(filters?.employee || item?.assignedTo || 'All');
      setStartDate(filters?.startDate || '');
      setEndDate(filters?.endDate || '');
    }
  }, [open, type, item, filters]);

  if (!open) return null;

  // Filtered tasks for individual record selection
  const singleTaskOptions = allTasks.filter((t) => {
    if (selectedEmployee !== 'All' && t.assignedTo !== selectedEmployee) return false;
    return true;
  });

  // Selected single task
  const singleTask =
    (selectedTaskId ? allTasks.find((t) => t.id === selectedTaskId) : null) ||
    singleTaskOptions[0] ||
    item ||
    allTasks[0];

  // Filtered dataset for batch reports
  const activeReportTasks = allTasks.filter((t) => {
    if (selectedEmployee !== 'All' && t.assignedTo !== selectedEmployee) return false;

    if (reportType === 'completion') {
      if (t.status !== 'Completed') return false;
    } else if (reportType === 'assignment') {
      if (t.status === 'Completed') return false;
    }

    const tDate = t.completedDate || t.dueDate || t.startDate;
    if (startDate && tDate && tDate < startDate) return false;
    if (endDate && tDate && tDate > endDate) return false;

    return true;
  });

  // Immediate Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download Export
  const handleDownloadPdf = async () => {
    if (reportType === 'single' && singleTask) {
      exportToPdf({
        title: 'INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT',
        department: 'Marketing',
        subtitle: `Work Order ID: #${singleTask.id} · Assigned: ${singleTask.assignedTo || 'Unassigned'}`,
        dateRange: `Issued: ${singleTask.startDate || currentToday} | Target Deadline: ${singleTask.dueDate || '—'}`,
        headers: ['Specification Attribute', 'Operational Detail / Scope'],
        rows: [
          ['Work Order ID', `#${singleTask.id}`],
          ['Work Title', singleTask.title || ''],
          ['Assigned Employee', singleTask.assignedTo || 'Unassigned'],
          ['Assigned By', singleTask.assignedBy || 'Super Administrator'],
          ['Work Category', singleTask.category || 'General Digital Marketing'],
          ['Priority Level', singleTask.priority || 'Normal'],
          ['Assignment Date', singleTask.startDate || '—'],
          ['Target Deadline', `${singleTask.dueDate || '—'} ${singleTask.dueTime || ''}`],
          ['Execution Status', singleTask.status || 'Assigned'],
          ['Completion Date', singleTask.completedDate || 'Pending'],
          ['Project Brief & Scope', singleTask.desc || 'Standard deliverable scope.'],
          ['Submission Notes', singleTask.completionNotes || 'No submission notes.'],
          ['Attached Assets', singleTask.completionAttachment || singleTask.attachment || 'None'],
        ],
        orientation: 'portrait',
        filename: `EPI_Work_Order_Slip_${singleTask.id || 'Doc'}.pdf`,
      });
    } else if (reportType === 'completion') {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT',
        department: 'Marketing',
        subtitle: 'Audited Log of Completed Deliverables and Verified Collateral Assets',
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : `As of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Deliverable Title', 'Responsible Employee', 'Category', 'Completed Date', 'Deliverable Assets', 'Status'],
        rows: activeReportTasks.map((t, idx) => [
          idx + 1,
          `#${t.id}`,
          t.title,
          t.assignedTo || 'Unassigned',
          t.category || 'General',
          t.completedDate || t.dueDate || '—',
          t.completionAttachment || t.attachment || 'Verified Handover',
          t.status || 'Completed',
        ]),
        orientation: 'landscape',
        filename: `EPI_Work_Completion_Report_${currentToday}.pdf`,
      });
    } else if (reportType === 'assignment') {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT',
        department: 'Marketing',
        subtitle: 'Operational Workload Distribution and Target Delivery Milestones',
        dateRange: `Active Queue as of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Task Objective & Scope', 'Assigned Employee', 'Priority', 'Start Date', 'Target Deadline', 'Progress', 'Status'],
        rows: activeReportTasks.map((t, idx) => [
          idx + 1,
          `#${t.id}`,
          t.title,
          t.assignedTo || 'Unassigned',
          t.priority || 'Normal',
          t.startDate || '—',
          `${t.dueDate || '—'} ${t.dueTime || ''}`,
          typeof t.progress === 'number' ? `${t.progress}%` : 'In Progress',
          t.status || 'Assigned',
        ]),
        orientation: 'landscape',
        filename: `EPI_Work_Assignment_Report_${currentToday}.pdf`,
      });
    } else {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT',
        department: 'Marketing',
        subtitle: 'Comprehensive Performance and Historical Deliverable Registry',
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : `As of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Work Title & Scope', 'Category', 'Employee', 'Assigned Date', 'Completed Date', 'Status', 'Submission Notes'],
        rows: activeReportTasks.map((t, idx) => [
          idx + 1,
          `#${t.id}`,
          t.title,
          t.category || 'General',
          t.assignedTo || 'Unassigned',
          t.startDate || '—',
          t.completedDate || t.dueDate || '—',
          t.status || 'Assigned',
          t.completionNotes || t.desc || '—',
        ]),
        orientation: 'landscape',
        filename: `EPI_Work_History_Report_${currentToday}.pdf`,
      });
    }
  };

  return (
    <div className="dm-modal-backdrop" onClick={closeTaskPrintModal}>
      {/* =================================================================== */}
      {/* COMPACT, PROFESSIONAL PRINT CONFIGURATION DIALOG                     */}
      {/* =================================================================== */}
      <div
        className="dm-modal-card max-w-lg p-6 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl space-y-5 no-print"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Print Report
              </h3>
              <p className="text-xs text-slate-400">
                Select report type and required information
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskPrintModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dialog Selection Form */}
        <div className="space-y-4 text-xs">
          {/* 1. Report Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Report Type <span className="text-red-400">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="dm-select w-full font-medium"
            >
              <option value="single">1. Individual Work Order Slip (A4 Portrait)</option>
              <option value="history">2. Work History & Archive Report (A4 Landscape)</option>
              <option value="completion">3. Work Completion & Audit Report (A4 Landscape)</option>
              <option value="assignment">4. Work Assignment & Capacity Report (A4 Landscape)</option>
            </select>
          </div>

          {/* 2. Employee Selector (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Employee <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="dm-select w-full"
            >
              <option value="All">All Employees (Entire Team)</option>
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Contextual Field: Specific Work Record OR Date Range */}
          {reportType === 'single' ? (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Specific Work Record <span className="text-red-400">*</span>
              </label>
              <select
                value={singleTask?.id || ''}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="dm-select w-full font-medium"
              >
                {singleTaskOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} - {t.title} ({t.assignedTo})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Generates a formal deliverable work order slip with full specs, notes & signatures.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Start Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="dm-input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  End Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="dm-input w-full text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dialog Actions Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={closeTaskPrintModal}
            className="dm-btn dm-btn-secondary"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="dm-btn dm-btn-secondary !text-sky-300 hover:!text-white border border-slate-700 hover:border-slate-600"
              title="Save document as high-resolution PDF file"
            >
              <Download size={14} className="text-sky-400" />
              <span>Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="dm-btn dm-btn-primary !px-5 font-bold shadow-lg shadow-blue-900/40"
              title="Immediately open browser print dialog"
            >
              <Printer size={15} />
              <span>Generate & Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* HIDDEN-ON-SCREEN PRINT MOUNT CONTAINER                              */}
      {/* Rendered only during @media print to produce exact crisp white A4   */}
      {/* =================================================================== */}
      <div id="dm-modal-print-sheet" className="dm-print-sheet-mount">
        <WorkPrintDocument
          reportType={reportType}
          task={singleTask}
          tasks={activeReportTasks.length > 0 ? activeReportTasks : allTasks}
          filters={{ startDate, endDate, employee: selectedEmployee }}
          orientation={reportType === 'single' ? 'portrait' : 'landscape'}
        />
      </div>
    </div>
  );
}
