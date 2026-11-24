import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle2,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { centralStore } from '../../admin/services/centralStorage.js';
import { today } from '../../sales/utils/helpers.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { exportToPdf } from '../../../services/reportExport.js';
import MarketingPrintDocument from './MarketingPrintDocument.jsx';

/**
 * Enterprise Digital Marketing Print & Export Modal
 * Provides streamlined selection dialog for:
 * 1. INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT
 *    - Project Brief & Work Deliverable Scope
 *    - Employee Completion Report
 *    - Submission Notes & Attached Deliverable Assets
 *    - Attached Deliverable Assets:
 * 2. DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT
 * 3. DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT
 * 4. DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT
 *
 * Signatories:
 * - Marketing Executive
 * - Lead Digital Strategist
 * - Managing Director / Super Admin
 */
export default function TaskPrintModal() {
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

  // Specific filtered lists
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

  // Browser Print trigger (handles paper and browser "Save as PDF")
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download Export
  const handleDownloadPdf = () => {
    if (reportType === 'single' && singleTask) {
      exportToPdf({
        title: 'INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT',
        department: 'Marketing',
        subtitle: `Work Order ID: #${singleTask.id || 'N/A'} · Assigned: ${singleTask.assignedTo || 'Unassigned'}`,
        dateRange: `Issued: ${singleTask.startDate || currentToday} | Target Deadline: ${singleTask.dueDate || '—'}`,
        headers: ['Specification Attribute', 'Operational Detail / Scope'],
        rows: [
          ['Work Order ID', `#${singleTask.id || 'N/A'}`],
          ['Work Title', singleTask.title || ''],
          ['Assigned Employee', singleTask.assignedTo || 'Unassigned'],
          ['Category', singleTask.category || 'General Marketing'],
          ['Priority Level', singleTask.priority || 'Normal'],
          ['Assignment Date', singleTask.startDate || '—'],
          ['Target Deadline', `${singleTask.dueDate || '—'} ${singleTask.dueTime || ''}`],
          ['Current Status', singleTask.status || 'Assigned'],
          ['Completion Date', `${singleTask.completedDate || 'Pending'} ${singleTask.completedTime || ''}`],
          ['Project Brief & Work Deliverable Scope', singleTask.desc || 'Standard deliverable scope.'],
          ['Employee Completion Report', singleTask.completionNotes || 'Deliverable handover.'],
          ['Submission Notes & Attached Deliverable Assets', singleTask.completionAttachment || singleTask.attachment || 'None'],
          ['Attached Deliverable Assets:', singleTask.completionAttachment || singleTask.attachment || 'Verified Handover'],
        ],
        orientation: 'portrait',
        filename: `Work_Order_Slip_${singleTask.id || 'MKT'}.pdf`,
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
          `#${t.id || `MKT-${idx + 1}`}`,
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
    } else if (reportType === 'assignment') {
      exportToPdf({
        title: 'DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT',
        department: 'Marketing',
        subtitle: 'Operational Workload Distribution and Target Delivery Milestones',
        dateRange: `Active Queue as of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Task Objective & Scope', 'Assigned Employee', 'Priority', 'Start Date', 'Target Deadline', 'Progress', 'Status'],
        rows: activeReportTasks.map((t, idx) => [
          idx + 1,
          `#${t.id || `MKT-${idx + 1}`}`,
          t.title,
          t.assignedTo || 'Unassigned',
          t.priority || 'Normal',
          t.startDate || '—',
          `${t.dueDate || '—'} ${t.dueTime || ''}`,
          typeof t.progress === 'number' ? `${t.progress}%` : 'In Progress',
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
        rows: activeReportTasks.map((t, idx) => [
          idx + 1,
          `#${t.id || `MKT-${idx + 1}`}`,
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
    <div className="marketing-modal-backdrop" onClick={closeTaskPrintModal}>
      {/* =================================================================== */}
      {/* COMPACT SELECTION DIALOG (NO PERMANENT LARGE PREVIEW ON SCREEN)     */}
      {/* =================================================================== */}
      <div
        className="marketing-modal-card max-w-lg p-6 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl space-y-5 no-print"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            title="Close Window"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selection Form */}
        <div className="space-y-4 text-xs">
          {/* 1. Report Type */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Report Type <span className="text-red-400">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mkt-select w-full font-medium"
            >
              <option value="single">1. Individual Work Order Slip (A4 Portrait)</option>
              <option value="history">2. Work History & Archive Report (A4 Landscape)</option>
              <option value="completion">3. Work Completion & Audit Report (A4 Landscape)</option>
              <option value="assignment">4. Work Assignment & Capacity Report (A4 Landscape)</option>
            </select>
          </div>

          {/* 2. Employee (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Employee <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="mkt-select w-full"
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
                className="mkt-select w-full font-medium"
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
                  className="mkt-input w-full text-xs"
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
                  className="mkt-input w-full text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dialog Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={closeTaskPrintModal}
            className="btn-mkt-secondary text-xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn-mkt-secondary text-xs flex items-center gap-1.5 !text-sky-300 hover:!text-white border border-slate-700 hover:border-slate-600"
              title="Save as PDF"
            >
              <Download size={14} className="text-sky-400" />
              <span>Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-mkt-primary text-xs flex items-center gap-1.5 !px-5 font-bold shadow-lg shadow-blue-900/40"
              title="Generate & Print"
            >
              <Printer size={15} />
              <span>Generate & Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ISOLATED WHITE A4 DOCUMENT CANVAS FOR @MEDIA PRINT                  */}
      {/* Signatories: Marketing Executive, Lead Digital Strategist,          */}
      {/* Managing Director / Super Admin                                     */}
      {/* =================================================================== */}
      <div id="dm-modal-print-sheet" className="dm-print-sheet-mount print-container">
        <MarketingPrintDocument
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
