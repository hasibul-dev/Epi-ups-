import React from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { exportToPdf } from '../../../services/reportExport.js';
import { printIsolatedElement } from '../../digital-marketing/services/marketingPrintService.js';
import MarketingPrintDocument from './MarketingPrintDocument.jsx';

/**
 * Enterprise Digital Marketing Work Slip Print Modal
 * Directly previews and prints the selected work order slip without redundant popups or selection fields.
 * Matches Sales Department interaction pattern.
 *
 * Supported Reports & Test Integration:
 * - INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT
 *   - Project Brief & Work Deliverable Scope
 *   - Employee Completion Report
 *   - Submission Notes & Attached Deliverable Assets
 *   - Attached Deliverable Assets:
 * - DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT
 * - DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT
 * - DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT
 *
 * Signatories:
 * - Marketing Executive
 * - Lead Digital Strategist
 * - Managing Director / Super Admin
 */
export default function TaskPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  if (!open) return null;

  const currentToday = today();
  const allTasks = data.marketingTasks || [];
  const singleTask = item || list[0] || allTasks[0];

  const handlePrint = () => {
    const success = printIsolatedElement('dm-modal-print-sheet', {
      title: `Work Order Slip #${singleTask?.id || 'Doc'}`,
      orientation: 'portrait',
    });
    if (!success) {
      window.print();
    }
  };

  const handleDownloadPdf = () => {
    if (!singleTask) return;
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
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeTaskPrintModal}>
      <div
        className="marketing-modal-card max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="flex items-center justify-between p-3.5 px-5 border-b border-white/10 bg-slate-900 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Printer size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Work Order Slip — #{singleTask?.id || 'N/A'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {singleTask?.title || 'Operational Work Deliverable'} · Assigned to: <strong className="text-slate-200">{singleTask?.assignedTo || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn-mkt-secondary text-xs flex items-center gap-1.5 !h-8 !px-3"
              title="Save as PDF"
            >
              <Download size={13} className="text-sky-400" />
              <span>Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-mkt-primary text-xs flex items-center gap-1.5 !h-8 !px-4 font-bold shadow-md shadow-blue-900/30"
              title="Print to Paper or Save PDF via Browser"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={closeTaskPrintModal}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Clean A4 Document Canvas Preview */}
        <div className="dm-modal-preview-wrapper p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/80 flex justify-center">
          <div
            id="dm-modal-print-sheet"
            className="w-full max-w-[210mm] bg-white rounded-none p-4 sm:p-6 shadow-none dm-print-sheet-mount print-container"
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
          >
            <MarketingPrintDocument
              reportType={type || 'single'}
              task={singleTask}
              tasks={list.length > 0 ? list : allTasks}
              filters={filters}
              orientation={type === 'single' ? 'portrait' : 'landscape'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
