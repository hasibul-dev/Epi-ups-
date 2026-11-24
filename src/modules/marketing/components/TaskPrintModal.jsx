import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  User,
  Tag,
  FileText,
  Clock,
  Award,
  Layers,
  CheckSquare,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today, fmt } from '../../sales/utils/helpers.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { exportToPdf } from '../../../services/reportExport.js';
import MarketingPrintDocument from './MarketingPrintDocument.jsx';

export default function TaskPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  const [activeReport, setActiveReport] = useState('single');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Keep internal report state synchronized when modal opens
  useEffect(() => {
    if (open) {
      if (type === 'single') setActiveReport('single');
      else if (type === 'completion') setActiveReport('completion');
      else if (type === 'assignment') setActiveReport('assignment');
      else setActiveReport('history');

      setSelectedTaskId(item?.id || '');
    }
  }, [open, type, item]);

  if (!open) return null;

  const currentToday = today();
  const allTasks = data.marketingTasks || [];
  const tasksList = list && list.length > 0 ? list : allTasks;

  // Selected single task
  const singleTask =
    (selectedTaskId ? allTasks.find((t) => t.id === selectedTaskId) : null) ||
    item ||
    tasksList[0] ||
    allTasks[0];

  // Specific lists
  const completedTasks = tasksList.filter((t) => t.status === 'Completed');
  const assignmentTasks = tasksList.filter((t) => t.status !== 'Completed');

  // Browser Print trigger (handles paper and browser "Save as PDF")
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download Export
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
        subtitle: `Audited Log of Completed Deliverables and Verified Collateral Assets`,
        dateRange: filters?.startDate && filters?.endDate ? `${filters.startDate} to ${filters.endDate}` : `As of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Deliverable Title', 'Responsible Employee', 'Category', 'Completed Date', 'Deliverable Assets', 'Status'],
        rows: (completedTasks.length > 0 ? completedTasks : tasksList).map((t, idx) => [
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
        subtitle: `Operational Workload Distribution and Target Delivery Milestones`,
        dateRange: `Active Queue as of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Task Objective & Scope', 'Assigned Employee', 'Priority', 'Start Date', 'Target Deadline', 'Progress', 'Status'],
        rows: (assignmentTasks.length > 0 ? assignmentTasks : tasksList).map((t, idx) => [
          idx + 1,
          t.id || `MKT-${idx + 1}`,
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
        subtitle: `Comprehensive Performance and Historical Deliverable Registry`,
        dateRange: filters?.startDate && filters?.endDate ? `${filters.startDate} to ${filters.endDate}` : `As of: ${currentToday}`,
        headers: ['SL', 'Work Order ID', 'Work Title & Scope', 'Category', 'Employee', 'Assigned Date', 'Completed Date', 'Status', 'Submission Notes'],
        rows: tasksList.map((t, idx) => [
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
    <div className="marketing-modal-backdrop" onClick={closeTaskPrintModal}>
      <div
        className="marketing-modal-card max-w-5xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* MODAL CONTROLS & REPORT SELECTOR (HIDDEN DURING PRINT)    */}
        {/* ========================================================= */}
        <div className="marketing-modal-header border-b border-purple-500/20 pb-3.5 space-y-3 no-print">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Printer size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Digital Marketing Corporate Print & Export Console
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Direct PDF Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="btn-mkt-secondary !h-[34px] !min-h-[34px] !py-1 !px-3 text-xs flex items-center gap-1.5"
                title="Download Clean PDF File"
              >
                <Download size={13} className="text-sky-400" />
                <span>Save as PDF</span>
              </button>

              {/* Browser Print / System PDF */}
              <button
                type="button"
                onClick={handlePrint}
                className="btn-mkt-primary !h-[34px] !min-h-[34px] !py-1 !px-3.5 text-xs flex items-center gap-1.5"
                title="Print Document or Save to PDF via Browser"
              >
                <Printer size={13} />
                <span>Print to Paper / PDF</span>
              </button>

              <button
                type="button"
                onClick={closeTaskPrintModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Window"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Report Document Type Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setActiveReport('single')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeReport === 'single'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText size={13} />
                <span>1. Work Order Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReport('history')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeReport === 'history'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock size={13} />
                <span>2. Work History Report</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReport('completion')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeReport === 'completion'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>3. Work Completion Report</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReport('assignment')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeReport === 'assignment'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckSquare size={13} />
                <span>4. Work Assignment Report</span>
              </button>
            </div>

            {/* Quick Task Selector for Individual Slip */}
            {activeReport === 'single' && allTasks.length > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Select Work:</span>
                <select
                  value={singleTask?.id || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-900 text-slate-100 border border-white/20 rounded px-2.5 py-1 text-xs font-medium max-w-[240px] truncate"
                >
                  {allTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id}: {t.title} ({t.assignedTo})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPLETE NEW PRINTABLE CORPORATE DOCUMENT CONTAINER       */}
        {/* Strictly Isolated White A4 Document Canvas                */}
        {/* Unified corporate report document for all 4 report types:  */}
        {/* 1. INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT         */}
        {/*    - Project Brief & Work Deliverable Scope               */}
        {/*    - Employee Completion Report                           */}
        {/*    - Submission Notes & Attached Deliverable Assets       */}
        {/*    - Attached Deliverable Assets:                         */}
        {/* 2. DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT         */}
        {/* 3. DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT        */}
        {/* 4. DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT   */}
        {/* Signatories: Marketing Executive, Lead Digital Strategist,  */}
        {/* Managing Director / Super Admin                           */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-8 bg-white text-slate-900 rounded-b-xl print-container">
          <MarketingPrintDocument
            reportType={activeReport}
            task={singleTask}
            tasks={
              activeReport === 'completion'
                ? (completedTasks.length > 0 ? completedTasks : tasksList)
                : activeReport === 'assignment'
                ? (assignmentTasks.length > 0 ? assignmentTasks : tasksList)
                : tasksList
            }
            filters={filters}
            orientation={activeReport === 'single' ? 'portrait' : 'landscape'}
          />
        </div>
      </div>
    </div>
  );
}
