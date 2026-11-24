import React from 'react';
import { X, Printer, Download, CheckCircle2, Calendar, User, Tag, FileText } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';

export default function TaskPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentToday = today();
  const allTasks = data.marketingTasks || [];
  
  // Robust tasks determination so it NEVER renders blank
  const tasksToPrint = type === 'summary'
    ? (list && list.length > 0 ? list : allTasks)
    : (item ? [item] : (allTasks.length > 0 ? [allTasks[0]] : []));

  const singleTask = tasksToPrint[0] || item;

  return (
    <div className="marketing-modal-backdrop" onClick={closeTaskPrintModal}>
      <div
        className="marketing-modal-card max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="marketing-modal-header border-b border-purple-500/20 pb-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              {type === 'summary' ? 'Official Work History Report — Printable Preview' : 'Individual Work Order Slip & Signoff — Printable Preview'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-mkt-primary !py-1.5 !px-3 text-xs"
            >
              <Printer size={13} />
              <span>Print to Paper / PDF</span>
            </button>
            <button
              onClick={closeTaskPrintModal}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-b-xl print-container">
          {/* Unified Official Corporate Header */}
          <CompanyPrintHeader
            title={
              type === 'summary'
                ? 'OFFICIAL DIGITAL MARKETING WORK PERFORMANCE & HISTORY REPORT'
                : 'INDIVIDUAL WORK ASSIGNMENT & COMPLETION CERTIFICATE'
            }
            department="DIGITAL MARKETING DEPARTMENT"
            dateRange={filters?.startDate && filters?.endDate ? `${filters.startDate} to ${filters.endDate}` : `Report Date: ${currentToday}`}
            subtitle={filters?.employee && filters.employee !== 'All' ? `Target Employee: ${filters.employee}` : ''}
            metaItems={
              type === 'summary'
                ? [
                    { label: 'Total Works', value: tasksToPrint.length },
                    { label: 'Completed', value: tasksToPrint.filter(t => t.status === 'Completed').length },
                    { label: 'In Progress', value: tasksToPrint.filter(t => t.status === 'In Progress').length },
                  ]
                : singleTask
                ? [
                    { label: 'Work Order ID', value: singleTask.id || 'N/A' },
                    { label: 'Assigned Employee', value: singleTask.assignedTo || 'Unassigned' },
                    { label: 'Status', value: singleTask.status || 'Assigned' },
                  ]
                : []
            }
            badge="DIGITAL MARKETING"
          />

          {/* SINGLE WORK SLIP VIEW */}
          {type === 'single' && (
            singleTask ? (
              <div className="space-y-6 text-xs text-slate-800">
                {/* Task Meta Table */}
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="w-36 bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Work Order ID:
                      </td>
                      <td className="p-2 font-mono font-semibold">{singleTask.id}</td>
                      <td className="w-36 bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                        Category:
                      </td>
                      <td className="p-2 font-semibold">{singleTask.category}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Work Title:
                      </td>
                      <td colSpan={3} className="p-2 font-bold text-slate-900 text-sm">
                        {singleTask.title}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Assigned Employee:
                      </td>
                      <td className="p-2 font-bold text-slate-900">{singleTask.assignedTo}</td>
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                        Priority Level:
                      </td>
                      <td className="p-2 font-bold">{singleTask.priority}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Assignment Date:
                      </td>
                      <td className="p-2">{singleTask.startDate || '—'}</td>
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                        Target Deadline:
                      </td>
                      <td className="p-2 font-semibold text-rose-700">{singleTask.dueDate || '—'}</td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Current Status:
                      </td>
                      <td className="p-2 font-extrabold text-slate-900">{singleTask.status}</td>
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                        Completion Date:
                      </td>
                      <td className="p-2 font-bold text-emerald-800">
                        {singleTask.completedDate ? `${singleTask.completedDate} ${singleTask.completedTime || ''}` : 'Pending Completion'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Scope & Detailed Brief */}
                <div className="border border-slate-300 rounded p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-600" />
                    <span>Project Brief & Work Deliverable Scope</span>
                  </div>
                  <p className="whitespace-pre-wrap text-slate-800 leading-relaxed mt-2">
                    {singleTask.desc || 'Complete the assigned industrial marketing deliverable according to EPI UPS brand guidelines.'}
                  </p>
                </div>

                {/* Completion & Execution Report */}
                <div className="border border-slate-300 rounded p-4 bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Employee Completion Report & Submission Notes</span>
                  </div>
                  <p className="whitespace-pre-wrap text-slate-800 leading-relaxed mt-2 italic">
                    {singleTask.completionNotes || 'Work delivered and verified in accordance with corporate digital marketing objectives.'}
                  </p>
                  {singleTask.completionAttachment && (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-slate-600 flex items-center gap-1">
                      <Tag size={12} />
                      <span className="font-bold">Attached Deliverable Asset:</span>
                      <span className="font-mono">{singleTask.completionAttachment}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-800 font-bold border border-slate-400 bg-slate-50 rounded">
                No task record selected for this slip preview.
              </div>
            )
          )}

          {/* SUMMARY REPORT VIEW */}
          {type === 'summary' && (
            <div className="space-y-6">
              {/* Summary Metric Ribbon */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-slate-100 rounded-lg border border-slate-300 text-center">
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Total Works</div>
                  <div className="text-base font-extrabold text-slate-900">{tasksToPrint.length}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Completed</div>
                  <div className="text-base font-extrabold text-emerald-700">
                    {tasksToPrint.filter(t => t.status === 'Completed').length}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">In Progress</div>
                  <div className="text-base font-extrabold text-purple-700">
                    {tasksToPrint.filter(t => t.status === 'In Progress').length}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px]">On Hold / Other</div>
                  <div className="text-base font-extrabold text-amber-700">
                    {tasksToPrint.filter(t => t.status === 'On Hold' || t.status === 'Assigned').length}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full border-collapse border border-slate-300 text-[11px] text-slate-800">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 text-left">
                    <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="p-2 border-r border-slate-300 min-w-[200px]">Work Title & Deliverable</th>
                    <th className="p-2 border-r border-slate-300 w-28">Category</th>
                    <th className="p-2 border-r border-slate-300 w-28">Employee</th>
                    <th className="p-2 border-r border-slate-300 w-20">Assigned</th>
                    <th className="p-2 border-r border-slate-300 w-24">Completed Date</th>
                    <th className="p-2 border-r border-slate-300 w-16">Status</th>
                    <th className="p-2 min-w-[140px]">Completion Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksToPrint.length > 0 ? (
                    tasksToPrint.map((t, idx) => (
                      <tr key={t.id || idx} className="border-b border-slate-400 hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-400 text-center font-bold text-slate-900">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-400 font-bold text-black">
                          {t.title}
                        </td>
                        <td className="p-2 border-r border-slate-400 font-medium text-slate-900">{t.category}</td>
                        <td className="p-2 border-r border-slate-400 font-semibold text-slate-950">{t.assignedTo}</td>
                        <td className="p-2 border-r border-slate-400 text-slate-800 font-medium">{t.startDate}</td>
                        <td className="p-2 border-r border-slate-400 font-bold text-black">
                          {t.completedDate || t.dueDate || '—'}
                        </td>
                        <td className="p-2 border-r border-slate-400 font-extrabold text-black">
                          {t.status}
                        </td>
                        <td className="p-2 text-slate-900 font-medium line-clamp-2">
                          {t.completionNotes || t.desc || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-4 text-center font-bold text-black bg-slate-50 border border-slate-400">
                        No marketing work records found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Unified Signatures Sign-Off Block */}
          <PrintSignatures
            signatories={[
              { title: 'Marketing Executive', note: 'Prepared By' },
              { title: 'Lead Digital Strategist', note: 'Verified & Inspected' },
              { title: 'Managing Director / Super Admin', note: 'Approved & Signed' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
