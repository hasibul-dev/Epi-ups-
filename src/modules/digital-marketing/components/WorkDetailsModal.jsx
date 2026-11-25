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
  AlertTriangle,
  CheckSquare,
  ExternalLink,
} from 'lucide-react';
import { useMarketing } from '../../marketing/context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

export default function WorkDetailsModal() {
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
          <span className="dm-badge dm-badge-red flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Urgent Priority
          </span>
        );
      case 'High':
        return (
          <span className="dm-badge dm-badge-amber flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            High Priority
          </span>
        );
      case 'Normal':
        return (
          <span className="dm-badge dm-badge-blue flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Normal Priority
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="dm-badge dm-badge-neutral flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="dm-badge dm-badge-green font-bold">✓ Completed</span>;
      case 'In Progress':
        return <span className="dm-badge dm-badge-blue font-bold">⏳ In Progress</span>;
      case 'On Hold':
        return <span className="dm-badge dm-badge-amber font-bold">⏸️ On Hold</span>;
      case 'Assigned':
      case 'To Do':
      default:
        return <span className="dm-badge dm-badge-neutral font-bold">📋 Assigned</span>;
    }
  };

  return (
    <div className="dm-modal-backdrop" onClick={closeTaskDetailsModal}>
      <div className="dm-modal-card max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#25364B] bg-[#08111F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">#{item.id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-semibold">{item.category || 'General'}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-wide leading-tight mt-0.5">
                {item.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskDetailsModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132238] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#08111F] rounded-xl border border-[#25364B]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              {getStatusBadge(item.status)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Priority:</span>
              {getPriorityBadge(item.priority)}
            </div>
          </div>

          {/* Key Operational Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#132238] rounded-xl border border-[#25364B] space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Assignment Details
              </span>
              <div className="flex items-center gap-2">
                <User size={13} className="text-blue-400" />
                <span className="text-slate-300">Assigned To: <strong className="text-white">{item.assignedTo}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">By:</span>
                <span className="text-slate-300">{item.assignedBy || 'Administrator'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-slate-400" />
                <span className="text-slate-300">Assigned Date: {item.startDate || '—'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#132238] rounded-xl border border-[#25364B] space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Deadlines & Schedule
              </span>
              <div className="flex items-center gap-2">
                <Calendar size={13} className={isOverdue ? 'text-red-400' : 'text-amber-400'} />
                <span className="text-slate-300">
                  Target Due: <strong className={isOverdue ? 'text-red-400' : 'text-white'}>{item.dueDate}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-sky-400" />
                <span className="text-slate-300">Due Time: {item.dueTime || '18:00'}</span>
              </div>
              {isOverdue && (
                <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <AlertTriangle size={13} />
                  <span>Task is currently overdue</span>
                </div>
              )}
            </div>
          </div>

          {/* Description & Scope */}
          <div className="p-4 bg-[#132238] rounded-xl border border-[#25364B] space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Detailed Work Description & Objectives
            </span>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {item.desc || 'No detailed work description provided.'}
            </p>
            {item.refInfo && (
              <div className="text-xs text-slate-400 pt-1 border-t border-white/5">
                <strong>Project / Ref Info:</strong> <span className="text-slate-200">{item.refInfo}</span>
              </div>
            )}
            {item.instructions && (
              <div className="text-xs text-slate-400 pt-1 border-t border-white/5">
                <strong>Additional Instructions:</strong> <span className="text-slate-200">{item.instructions}</span>
              </div>
            )}
            {item.attachment && (
              <div className="text-xs text-sky-400 pt-1 border-t border-white/5 flex items-center gap-1.5">
                <Paperclip size={12} />
                <span>Attached Brief / Reference: <strong>{item.attachment}</strong></span>
              </div>
            )}
          </div>

          {/* Completion Details (If submitted) */}
          {(item.completionNotes || item.completionAttachment || item.completedDate || isDone) && (
            <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Work Completion Report & Delivered Assets
                </span>
              </div>
              {item.completedDate && (
                <p className="text-xs text-slate-400">
                  Delivered on: <strong className="text-emerald-300">{item.completedDate}</strong>
                </p>
              )}
              {item.completionNotes && (
                <p className="text-xs text-slate-200 italic bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
                  "{item.completionNotes}"
                </p>
              )}
              {(item.completionAttachment || item.deliverables) && (
                <div className="text-xs text-sky-400 flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  <span>Output Deliverables: <strong>{item.completionAttachment || item.deliverables}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#25364B] bg-[#08111F]">
          <button
            type="button"
            onClick={() => {
              closeTaskDetailsModal();
              openTaskPrintModal(item, 'single');
            }}
            className="dm-btn dm-btn-secondary"
          >
            <Printer size={14} />
            <span>Print Work Slip</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeTaskDetailsModal();
                openTaskModal(item);
              }}
              className="dm-btn dm-btn-secondary"
            >
              <Edit2 size={14} />
              <span>Edit Work</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeTaskDetailsModal();
                openTaskUpdateModal(item);
              }}
              className="dm-btn dm-btn-primary"
            >
              <CheckSquare size={14} />
              <span>Update Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
