import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  FileText,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';
import { exportToPdf } from '../../../services/reportExport.js';
import { printIsolatedElement } from '../services/marketingPrintService.js';
import WorkPrintDocument from './WorkPrintDocument.jsx';

/**
 * Individual Work Record Print & Export Modal
 * Directly previews and prints the selected work order slip via an isolated print document.
 * The app shell, modal backdrop, card, and wrappers NEVER enter the print output.
 */
export default function WorkPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  if (!open) return null;

  const currentToday = today();
  const allTasks = data.marketingTasks || [];
  const singleTask = item || list[0] || allTasks[0];

  const handlePrint = () => {
    printIsolatedElement('dm-modal-print-sheet', {
      title: `Work Order Slip #${singleTask?.id || 'Doc'}`,
      orientation: 'portrait',
    });
  };

  const handleDownloadPdf = async () => {
    if (!singleTask) return;
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
      filename: `Work_Order_Slip_${singleTask.id || 'Doc'}.pdf`,
    });
  };

  const modalContent = (
    <div className="dm-modal-backdrop" onClick={closeTaskPrintModal}>
      <div
        className="dm-modal-card max-w-4xl max-h-[92vh] flex flex-col bg-[#0F1B2D] border border-[#25364B] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Toolbar (On-Screen Controls) */}
        <div className="flex items-center justify-between p-3.5 px-5 border-b border-[#25364B] bg-[#08111F] no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
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
              className="dm-btn dm-btn-secondary !h-8 !px-3 text-xs flex items-center gap-1.5"
              title="Save as PDF"
            >
              <Download size={13} className="text-cyan-400" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="dm-btn dm-btn-primary !h-8 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/40"
              title="Print Clean White Slip via Isolated Document"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={closeTaskPrintModal}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#132238] transition-colors ml-1"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Clean On-Screen Document Preview */}
        <div className="dm-modal-preview-wrapper p-4 sm:p-6 overflow-y-auto flex-1 bg-[#08111F] flex justify-center">
          <div
            id="dm-modal-print-sheet"
            className="w-full max-w-[210mm] bg-white rounded-none p-4 sm:p-6 shadow-md border-0 outline-none"
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
          >
            <WorkPrintDocument
              reportType="single"
              task={singleTask}
              tasks={list.length > 0 ? list : allTasks}
              filters={filters}
              orientation="portrait"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
