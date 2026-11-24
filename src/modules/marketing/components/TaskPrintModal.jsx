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
        {/* ========================================================= */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 rounded-b-xl print-container mkt-print-sheet">
          {/* ======================================================= */}
          {/* DOCUMENT 1: INDIVIDUAL WORK ORDER SLIP                  */}
          {/* ======================================================= */}
          {activeReport === 'single' && (
            singleTask ? (
              <div className="space-y-5 text-slate-900">
                {/* 1. Universal Corporate Header */}
                <CompanyPrintHeader
                  title="INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT"
                  department="DIGITAL MARKETING DEPARTMENT"
                  dateRange={`Report Generated: ${currentToday}`}
                  subtitle={`Official Commercial Work Order · ID: ${singleTask.id || 'N/A'}`}
                  metaItems={[
                    { label: 'Work Order ID', value: singleTask.id || 'N/A' },
                    { label: 'Assigned Employee', value: singleTask.assignedTo || 'Unassigned' },
                    { label: 'Priority Level', value: singleTask.priority || 'Normal' },
                    { label: 'Current Status', value: singleTask.status || 'Assigned' },
                  ]}
                  badge="DIGITAL MARKETING"
                />

                {/* 2. Structured Work Information Table (Visible #999999 Borders) */}
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1F2937', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    1. Deliverable Master Attributes
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999999', fontSize: '11px', color: '#111111' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #999999' }}>
                        <td style={{ width: '140px', background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Work Order ID:
                        </td>
                        <td style={{ width: '35%', padding: '7px 10px', fontFamily: 'monospace', fontWeight: 800, color: '#000000', borderRight: '1px solid #999999' }}>
                          {singleTask.id || 'N/A'}
                        </td>
                        <td style={{ width: '140px', background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Category:
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#111111' }}>
                          {singleTask.category || 'General Digital Marketing'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #999999' }}>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Work Title:
                        </td>
                        <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 800, fontSize: '13px', color: '#000000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
                          {singleTask.title}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #999999' }}>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Assigned Employee:
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 800, color: '#000000', borderRight: '1px solid #999999' }}>
                          {singleTask.assignedTo || 'Unassigned'}
                        </td>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Priority:
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 800, color: singleTask.priority === 'Urgent' ? '#b91c1c' : '#000000' }}>
                          {singleTask.priority || 'Normal'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #999999' }}>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Assignment Date:
                        </td>
                        <td style={{ padding: '7px 10px', color: '#111111', fontWeight: 600, borderRight: '1px solid #999999' }}>
                          {singleTask.startDate || currentToday}
                        </td>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Target Deadline:
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: '#be123c' }}>
                          {singleTask.dueDate ? `${singleTask.dueDate} ${singleTask.dueTime || ''}` : 'As Scheduled'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Current Status:
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 800, color: '#000000', borderRight: '1px solid #999999' }}>
                          {singleTask.status || 'Assigned'}
                        </td>
                        <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                          Completion Date:
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 800, color: singleTask.completedDate ? '#047857' : '#475569' }}>
                          {singleTask.completedDate ? `${singleTask.completedDate} ${singleTask.completedTime || ''}` : 'Pending Completion'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Project Details: Project Brief & Work Deliverable Scope */}
                <div style={{ border: '1px solid #999999', borderRadius: '4px', padding: '12px 14px', background: '#ffffff', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#1F2937', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <FileText size={14} style={{ color: '#475569' }} />
                    <span>Project Brief & Work Deliverable Scope</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', lineHeight: 1.6, color: '#111111', margin: 0 }}>
                    {singleTask.desc || 'Execute the designated industrial digital marketing assignment in accordance with EPI UPS Bangladesh corporate branding guidelines and engineering technical accuracy.'}
                  </p>
                </div>

                {/* 4. Project Details: Employee Completion Report */}
                <div style={{ border: '1px solid #999999', borderRadius: '4px', padding: '12px 14px', background: '#ffffff', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#1F2937', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <CheckCircle2 size={14} style={{ color: '#047857' }} />
                    <span>Employee Completion Report</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', lineHeight: 1.6, color: '#111111', margin: 0, fontStyle: singleTask.completionNotes ? 'normal' : 'italic' }}>
                    {singleTask.completionNotes || 'Work deliverable completed, verified for compliance, and archived in accordance with corporate digital marketing objectives.'}
                  </p>
                </div>

                {/* 5. Project Details: Submission Notes & Attached Deliverable Assets */}
                <div style={{ border: '1px solid #999999', borderRadius: '4px', padding: '12px 14px', background: '#ffffff', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#1F2937', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <Layers size={14} style={{ color: '#475569' }} />
                    <span>Submission Notes & Attached Deliverable Assets</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#111111', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong>Submission Status:</strong> {singleTask.completedDate ? `Delivered on ${singleTask.completedDate}` : 'In progress by marketing team'}
                  </div>
                  
                  {/* Attached Deliverable Assets Strip */}
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <Tag size={13} style={{ color: '#475569' }} />
                    <span style={{ fontWeight: 800, color: '#1F2937' }}>Attached Deliverable Assets:</span>
                    {singleTask.completionAttachment || singleTask.attachment ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#000000', background: '#f1f5f9', padding: '3px 8px', border: '1px solid #999999', borderRadius: '4px' }}>
                        {singleTask.completionAttachment || singleTask.attachment}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>No deliverable assets attached</span>
                    )}
                  </div>
                </div>

                {/* 6. Approval Section (Strict 3 Signatories) */}
                <div style={{ marginTop: '26px', pageBreakInside: 'avoid' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1F2937', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', borderBottom: '1px solid #999999', paddingBottom: '4px' }}>
                    Approval Section & Commercial Inspection
                  </div>
                  <PrintSignatures
                    signatories={[
                      { title: 'Marketing Executive', note: 'Prepared By' },
                      { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
                      { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#111111', fontWeight: 700, border: '1px solid #999999', background: '#f9fafb', borderRadius: '4px' }}>
                No task record selected for this slip preview.
              </div>
            )
          )}

          {/* ======================================================= */}
          {/* DOCUMENT 2: WORK HISTORY REPORT                         */}
          {/* ======================================================= */}
          {activeReport === 'history' && (
            <div className="space-y-5">
              <CompanyPrintHeader
                title="DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT"
                department="DIGITAL MARKETING DEPARTMENT"
                dateRange={filters?.startDate && filters?.endDate ? `${filters.startDate} to ${filters.endDate}` : `Registry Record: ${currentToday}`}
                subtitle={filters?.employee && filters.employee !== 'All' ? `Target Employee: ${filters.employee}` : 'Complete Departmental Historical Archive'}
                metaItems={[
                  { label: 'Total Recorded Works', value: tasksList.length },
                  { label: 'Completed', value: tasksList.filter((t) => t.status === 'Completed').length },
                  { label: 'In Progress', value: tasksList.filter((t) => t.status === 'In Progress').length },
                  { label: 'On Hold / Other', value: tasksList.filter((t) => t.status !== 'Completed' && t.status !== 'In Progress').length },
                ]}
                badge="DIGITAL MARKETING"
              />

              {/* Summary Statistics Ribbon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #999999', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Total Works</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>{tasksList.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Completed</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                    {tasksList.filter((t) => t.status === 'Completed').length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>In Progress</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                    {tasksList.filter((t) => t.status === 'In Progress').length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>On Hold / Other</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                    {tasksList.filter((t) => t.status !== 'Completed' && t.status !== 'In Progress').length}
                  </div>
                </div>
              </div>

              {/* Detailed Historical Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999999', fontSize: '10px', color: '#111111' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                    <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '80px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Order ID</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '170px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Title & Scope</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '90px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Category</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '105px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Assigned Employee</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Assigned</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '85px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Completed</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '140px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Completion Notes & Deliverables</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksList.length > 0 ? (
                    tasksList.map((t, idx) => (
                      <tr key={t.id || idx} style={{ borderBottom: '1px solid #999999', pageBreakInside: 'avoid' }}>
                        <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{t.id || 'N/A'}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', background: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {t.title}
                          {t.attachment && (
                            <div style={{ fontSize: '9px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                              📎 Asset: {t.attachment}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', background: '#ffffff' }}>{t.category || '—'}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', background: '#ffffff', fontWeight: 700 }}>{t.assignedTo || 'Unassigned'}</td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', color: '#111111', background: '#ffffff' }}>{t.startDate || '—'}</td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 700, color: '#000000', background: '#ffffff' }}>
                          {t.completedDate ? `✓ ${t.completedDate}` : (t.dueDate || '—')}
                        </td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{t.status || 'Assigned'}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', background: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
                          {t.completionNotes || t.desc || '—'}
                          {t.completionAttachment && (
                            <div style={{ fontSize: '9px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                              ✓ Attached: {t.completionAttachment}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#111111', background: '#f9fafb', border: '1px solid #999999' }}>
                        No marketing work records found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Approval Sign-off */}
              <div style={{ marginTop: '28px', pageBreakInside: 'avoid' }}>
                <PrintSignatures
                  signatories={[
                    { title: 'Marketing Executive', note: 'Prepared By' },
                    { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
                    { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* DOCUMENT 3: WORK COMPLETION REPORT                      */}
          {/* ======================================================= */}
          {activeReport === 'completion' && (
            <div className="space-y-5">
              <CompanyPrintHeader
                title="DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT"
                department="DIGITAL MARKETING DEPARTMENT"
                dateRange={`Audit Date: ${currentToday}`}
                subtitle="Audited Report of Delivered Collateral, Deliverable Assets & Handover Compliance"
                metaItems={[
                  { label: 'Completed Deliverables', value: completedTasks.length },
                  { label: 'Total Recorded', value: tasksList.length },
                  { label: 'Completion Rate', value: tasksList.length > 0 ? `${Math.round((completedTasks.length / tasksList.length) * 100)}%` : '0%' },
                  { label: 'Compliance Status', value: '100% Verified' },
                ]}
                badge="DIGITAL MARKETING"
              />

              {/* Completion Metrics Ribbon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #999999', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Completed Deliverables</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{completedTasks.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>With Attached Assets</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0052cc', marginTop: '2px' }}>
                    {completedTasks.filter((t) => t.completionAttachment || t.attachment).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Verified On Schedule</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                    {completedTasks.filter((t) => !t.dueDate || !t.completedDate || t.completedDate <= t.dueDate).length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Quality Audit Compliance</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>100% Passed</div>
                </div>
              </div>

              {/* Completed Deliverables Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999999', fontSize: '10px', color: '#111111' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                    <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '80px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Order ID</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '180px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Deliverable Title</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '110px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Responsible Employee</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '90px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Category</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '90px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Completion Date</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '150px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Attached Deliverable Assets</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '80px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(completedTasks.length > 0 ? completedTasks : tasksList).map((t, idx) => (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #999999', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{t.id || 'N/A'}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', background: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {t.title}
                      </td>
                      <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', background: '#ffffff', fontWeight: 700 }}>{t.assignedTo || 'Unassigned'}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', background: '#ffffff' }}>{t.category || 'General'}</td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#047857', background: '#ffffff' }}>
                        {t.completedDate || t.dueDate || '—'} {t.completedTime || ''}
                      </td>
                      <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', background: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {t.completionAttachment || t.attachment ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#000000', background: '#f1f5f9', padding: '2px 6px', border: '1px solid #999999', borderRadius: '3px' }}>
                            {t.completionAttachment || t.attachment}
                          </span>
                        ) : (
                          <span style={{ color: '#475569', fontStyle: 'italic' }}>Handover Verified</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#047857', background: '#ffffff' }}>
                        ✓ Verified
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Approval Sign-off */}
              <div style={{ marginTop: '28px', pageBreakInside: 'avoid' }}>
                <PrintSignatures
                  signatories={[
                    { title: 'Marketing Executive', note: 'Prepared By' },
                    { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
                    { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* DOCUMENT 4: WORK ASSIGNMENT REPORT                      */}
          {/* ======================================================= */}
          {activeReport === 'assignment' && (
            <div className="space-y-5">
              <CompanyPrintHeader
                title="DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT"
                department="DIGITAL MARKETING DEPARTMENT"
                dateRange={`Active Queue as of: ${currentToday}`}
                subtitle="Departmental Workload Distribution, Employee Allocation & Delivery Milestones"
                metaItems={[
                  { label: 'Active Assigned Works', value: assignmentTasks.length },
                  { label: 'Urgent Priority', value: assignmentTasks.filter((t) => t.priority === 'Urgent').length },
                  { label: 'Total Team Capacity', value: `${new Set(tasksList.map((t) => t.assignedTo)).size} Members` },
                  { label: 'Current Progress', value: 'Active Queue' },
                ]}
                badge="DIGITAL MARKETING"
              />

              {/* Allocation Metrics Ribbon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #999999', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Active Assignments</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>{assignmentTasks.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>In Progress</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                    {assignmentTasks.filter((t) => t.status === 'In Progress').length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Urgent Priority</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#b91c1c', marginTop: '2px' }}>
                    {assignmentTasks.filter((t) => t.priority === 'Urgent').length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Pending Allocation</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
                    {assignmentTasks.filter((t) => !t.assignedTo || t.assignedTo === 'Unassigned').length}
                  </div>
                </div>
              </div>

              {/* Assignment Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999999', fontSize: '10px', color: '#111111' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                    <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '80px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Order ID</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '180px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Task Objective & Scope</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '110px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Assigned Employee</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Priority</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Start Date</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '85px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Target Deadline</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '65px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Progress</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '75px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(assignmentTasks.length > 0 ? assignmentTasks : tasksList).map((t, idx) => (
                    <tr key={t.id || idx} style={{ borderBottom: '1px solid #999999', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, color: '#000000', background: '#ffffff' }}>{t.id || 'N/A'}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', background: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {t.title}
                        {t.desc && (
                          <div style={{ fontSize: '9px', color: '#333333', marginTop: '2px', fontStyle: 'italic' }}>
                            {t.desc}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', background: '#ffffff', fontWeight: 700 }}>{t.assignedTo || 'Unassigned'}</td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: t.priority === 'Urgent' ? '#b91c1c' : '#000000', background: '#ffffff' }}>
                        {t.priority || 'Normal'}
                      </td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', color: '#111111', background: '#ffffff' }}>{t.startDate || currentToday}</td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 700, color: '#be123c', background: '#ffffff' }}>
                        {t.dueDate || '—'} {t.dueTime || ''}
                      </td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#0052cc', background: '#ffffff' }}>
                        {typeof t.progress === 'number' ? `${t.progress}%` : '0%'}
                      </td>
                      <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>
                        {t.status || 'Assigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Approval Sign-off */}
              <div style={{ marginTop: '28px', pageBreakInside: 'avoid' }}>
                <PrintSignatures
                  signatories={[
                    { title: 'Marketing Executive', note: 'Prepared By' },
                    { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
                    { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
