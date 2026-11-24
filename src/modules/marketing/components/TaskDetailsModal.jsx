import React from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  User,
  Tag,
  Flag,
  CheckCircle2,
  Paperclip,
  Printer,
  Edit2,
  TrendingUp,
  AlertTriangle,
  Layers,
  History,
  ShieldCheck,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function TaskDetailsModal() {
  const {
    taskDetailsModal,
    closeTaskDetailsModal,
    openTaskModal,
    openTaskUpdateModal,
    openTaskPrintModal,
  } = useMarketing();

  const { open, item } = taskDetailsModal;
  if (!open || !item) return null;

  const currentToday = today();
  const isDone = item.status === 'Completed';
  const isOverdue = item.dueDate && item.dueDate < currentToday && !isDone;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="mkt-badge mkt-badge-red flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent Priority
          </span>
        );
      case 'High':
        return (
          <span className="mkt-badge mkt-badge-amber flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            High Priority
          </span>
        );
      case 'Normal':
        return (
          <span className="mkt-badge mkt-badge-blue flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Normal Priority
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="mkt-badge mkt-badge-neutral flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="mkt-badge mkt-badge-green font-bold">✓ Completed</span>;
      case 'In Progress':
        return <span className="mkt-badge mkt-badge-blue font-bold">⏳ In Progress</span>;
      case 'On Hold':
        return <span className="mkt-badge mkt-badge-amber font-bold">⏸️ On Hold</span>;
      case 'Assigned':
      case 'To Do':
      default:
        return <span className="mkt-badge mkt-badge-neutral font-bold">📋 Assigned</span>;
    }
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeTaskDetailsModal}>
      <div
        className="marketing-modal-card max-w-3xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="marketing-modal-header border-b border-blue-500/20 pb-4">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/20">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300">
                    {item.id || 'N/A'}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Work Order Details & Specifications
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete operational overview, deliverable scope, and audit activity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge(item.status)}
              <button
                type="button"
                onClick={closeTaskDetailsModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Close Window"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="marketing-modal-body space-y-4 pt-4">
          {/* Main Title & Badges */}
          <div className="p-4 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="mkt-badge mkt-badge-blue text-xs font-bold">
                {item.category || 'General Marketing'}
              </span>
              <div className="flex items-center gap-2">
                {getPriorityBadge(item.priority)}
                {isOverdue && (
                  <span className="mkt-badge mkt-badge-red font-bold flex items-center gap-1">
                    <AlertTriangle size={11} /> Overdue Alert
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-base font-extrabold text-white leading-snug">
              {item.title}
            </h2>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <TrendingUp size={12} className="text-blue-400" />
                  <span>Execution Progress:</span>
                </span>
                <span className="font-mono font-bold text-blue-300">
                  {typeof item.progress === 'number' ? `${item.progress}%` : (isDone ? '100%' : '50%')}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDone
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-blue-500 to-sky-400'
                  }`}
                  style={{
                    width: `${typeof item.progress === 'number' ? item.progress : (isDone ? 100 : 50)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Operational Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User size={12} className="text-blue-400" />
                Assigned Employee
              </span>
              <div className="font-semibold text-xs text-white truncate">
                {item.assignedTo || 'Unassigned'}
              </div>
              <span className="text-[10px] text-slate-400 block truncate">Responsible Person</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck size={12} className="text-sky-400" />
                Assigned By
              </span>
              <div className="font-semibold text-xs text-slate-200 truncate">
                {item.assignedBy || 'Administrator'}
              </div>
              <span className="text-[10px] text-slate-400 block truncate">Authorizing Manager</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                Assignment Date
              </span>
              <div className="font-semibold text-xs text-slate-200">
                {item.startDate || currentToday}
              </div>
              <span className="text-[10px] text-slate-400 block">Commencement Date</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock size={12} className={isOverdue ? 'text-rose-400' : 'text-amber-400'} />
                Target Deadline
              </span>
              <div className={`font-semibold text-xs ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                {item.dueDate || '—'} {item.dueTime || ''}
              </div>
              <span className={`text-[10px] block ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {isOverdue ? 'Overdue Deadline' : 'Scheduled Milestone'}
              </span>
            </div>
          </div>

          {/* Project Brief & Work Scope */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              <FileText size={14} className="text-blue-400" />
              <span>Project Brief & Detailed Work Scope</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap word-break">
              {item.desc || 'No detailed scope provided. Standard marketing delivery criteria applies.'}
            </p>
            {item.attachment && (
              <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-sky-400">
                <Paperclip size={13} />
                <span className="font-semibold text-slate-300">Reference File / Asset Link:</span>
                <span className="font-mono text-xs bg-slate-950 px-2 py-0.5 rounded border border-white/10 text-sky-300">
                  {item.attachment}
                </span>
              </div>
            )}
          </div>

          {/* Completion & Delivery Information (If completed or has notes) */}
          {(item.completionNotes || item.completionAttachment || isDone) && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Employee Delivery & Completion Handover</span>
                </div>
                {item.completedDate && (
                  <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30">
                    Delivered: {item.completedDate} {item.completedTime || ''}
                  </span>
                )}
              </div>

              {item.completionNotes ? (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap word-break">
                  {item.completionNotes}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Marked completed on schedule. Official deliverable assets verified.
                </p>
              )}

              {item.completionAttachment && (
                <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
                  <Paperclip size={13} className="text-emerald-400" />
                  <span className="font-semibold text-slate-200">Attached Deliverable Asset:</span>
                  <span className="font-mono text-xs bg-slate-950 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-300 font-bold">
                    {item.completionAttachment}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          {Array.isArray(item.history) && item.history.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-2">
                <History size={14} className="text-blue-400" />
                <span>Audit & Activity Trail</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {item.history.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-[11px]">{h.action}</strong>
                        <span className="text-[10px] text-slate-500">by {h.by}</span>
                        <span className="text-[10px] text-slate-500">
                          {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      {h.note && <p className="text-[11px] text-slate-400">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="marketing-modal-footer border-t border-blue-500/20 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Print Slip */}
            <button
              type="button"
              onClick={() => {
                closeTaskDetailsModal();
                openTaskPrintModal(item, 'single');
              }}
              className="btn-mkt-cyan !h-[34px] !min-h-[34px] !py-1 !px-3 text-xs flex items-center gap-1.5"
              title="Print Official Work Order Slip"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>

            {/* Edit Assignment */}
            <button
              type="button"
              onClick={() => {
                closeTaskDetailsModal();
                openTaskModal(item);
              }}
              className="btn-mkt-glass !h-[34px] !min-h-[34px] !py-1 !px-3 text-xs flex items-center gap-1.5 text-sky-400 hover:text-white"
              title="Edit Work Order Specifications"
            >
              <Edit2 size={13} />
              <span>Edit Work</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Update Progress Button */}
            <button
              type="button"
              onClick={() => {
                closeTaskDetailsModal();
                openTaskUpdateModal(item);
              }}
              className="btn-mkt-primary !h-[34px] !min-h-[34px] !py-1 !px-4 text-xs flex items-center gap-1.5 font-bold"
              title="Update Work Progress or Submit Completion"
            >
              <CheckCircle2 size={13} />
              <span>Update Progress / Delivery</span>
            </button>

            <button
              type="button"
              onClick={closeTaskDetailsModal}
              className="btn-mkt-secondary !h-[34px] !min-h-[34px] !py-1 !px-3.5 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
