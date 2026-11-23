import React from 'react';
import { X, Printer, Download, CheckCircle2, Calendar, User, Tag, FileText } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function TaskPrintModal() {
  const { taskPrintModal, closeTaskPrintModal, data } = useMarketing();
  const { open, item, type = 'single', filters = {}, list = [] } = taskPrintModal;

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentToday = today();
  const tasksToPrint = type === 'summary'
    ? (list && list.length > 0 ? list : (data.marketingTasks || []).filter(t => t.status === 'Completed'))
    : [item];

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
          {/* Corporate Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase">
                  EPI UPS BANGLADESH LIMITED
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  House # 03, Road # 15, Sector # 03, Uttara, Dhaka-1230, Bangladesh
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Hotline: +88 01778-249416 | Email: info@epiups.com.bd | Web: www.epiups.com.bd
                </p>
              </div>
              <div className="text-right sm:text-right border-l-2 sm:border-l-0 sm:border-slate-300 pl-3 sm:pl-0">
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 rounded">
                  DIGITAL MARKETING
                </span>
                <div className="text-xs text-slate-500 font-semibold mt-1">
                  Report Date: {currentToday}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                {type === 'summary'
                  ? 'OFFICIAL DIGITAL MARKETING WORK PERFORMANCE & HISTORY REPORT'
                  : 'INDIVIDUAL WORK ASSIGNMENT & COMPLETION CERTIFICATE'}
              </h2>
              {filters?.employee && filters.employee !== 'All' && (
                <p className="text-xs font-semibold text-slate-700">
                  Target Employee: {filters.employee}
                </p>
              )}
            </div>
          </div>

          {/* SINGLE WORK SLIP VIEW */}
          {type === 'single' && item && (
            <div className="space-y-6 text-xs text-slate-800">
              {/* Task Meta Table */}
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="w-36 bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                      Work Order ID:
                    </td>
                    <td className="p-2 font-mono font-semibold">{item.id}</td>
                    <td className="w-36 bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                      Category:
                    </td>
                    <td className="p-2 font-semibold">{item.category}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                      Work Title:
                    </td>
                    <td colSpan={3} className="p-2 font-bold text-slate-900 text-sm">
                      {item.title}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                      Assigned Employee:
                    </td>
                    <td className="p-2 font-bold text-slate-900">{item.assignedTo}</td>
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                      Assigned By:
                    </td>
                    <td className="p-2">{item.assignedBy || 'Administrator'}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                      Assignment Date:
                    </td>
                    <td className="p-2">{item.startDate}</td>
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                      Target Deadline:
                    </td>
                    <td className="p-2 font-semibold">{item.dueDate} {item.dueTime || ''}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                      Priority Level:
                    </td>
                    <td className="p-2 font-bold">{item.priority}</td>
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-l border-r border-slate-300">
                      Current Status:
                    </td>
                    <td className="p-2 font-bold text-slate-900">{item.status} ({item.progress || 0}%)</td>
                  </tr>
                  {item.attachment && (
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Initial Brief/File:
                      </td>
                      <td colSpan={3} className="p-2 font-mono text-[11px]">{item.attachment}</td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300 align-top">
                      Scope / Description:
                    </td>
                    <td colSpan={3} className="p-2 whitespace-pre-wrap leading-relaxed">
                      {item.desc || 'No specific description provided.'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300 align-top">
                      Completion Notes:
                    </td>
                    <td colSpan={3} className="p-2 whitespace-pre-wrap leading-relaxed font-medium">
                      {item.completionNotes || 'In progress / pending final delivery notes.'}
                    </td>
                  </tr>
                  {item.completionAttachment && (
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Deliverable Link/File:
                      </td>
                      <td colSpan={3} className="p-2 font-mono text-[11px] text-blue-700">
                        {item.completionAttachment}
                      </td>
                    </tr>
                  )}
                  {item.completedDate && (
                    <tr>
                      <td className="bg-slate-100 p-2 font-bold text-slate-700 border-r border-slate-300">
                        Completion Timestamp:
                      </td>
                      <td colSpan={3} className="p-2 font-bold text-emerald-800">
                        {item.completedDate} at {item.completedTime || 'N/A'} (Recorded by {item.completedBy || item.assignedTo})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SUMMARY TABLE VIEW */}
          {type === 'summary' && (
            <div className="space-y-4">
              {/* Filter KPI Bar */}
              <div className="grid grid-cols-4 gap-2 border border-slate-300 bg-slate-50 p-3 rounded text-center text-xs">
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
                  {tasksToPrint.map((t, idx) => (
                    <tr key={t.id || idx} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-semibold text-slate-950">
                        {t.title}
                      </td>
                      <td className="p-2 border-r border-slate-300">{t.category}</td>
                      <td className="p-2 border-r border-slate-300 font-medium">{t.assignedTo}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">{t.startDate}</td>
                      <td className="p-2 border-r border-slate-300 font-semibold text-emerald-800">
                        {t.completedDate || t.dueDate || '—'}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-bold">
                        {t.status}
                      </td>
                      <td className="p-2 text-slate-700 italic line-clamp-2">
                        {t.completionNotes || t.desc || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Signatures Sign-Off Block */}
          <div className="grid grid-cols-3 gap-6 pt-16 mt-8 border-t border-slate-300 text-center text-xs">
            <div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900">
                Prepared By
              </div>
              <div className="text-[10px] text-slate-500">Employee / Marketing Executive</div>
            </div>
            <div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900">
                Verified By
              </div>
              <div className="text-[10px] text-slate-500">Lead Digital Strategist / IT Manager</div>
            </div>
            <div>
              <div className="border-t border-slate-900 pt-1.5 font-bold text-slate-900">
                Approved By
              </div>
              <div className="text-[10px] text-slate-500">Managing Director / Super Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
