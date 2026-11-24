import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Play,
  PauseCircle,
  FileText,
  Paperclip,
  Save,
  AlertCircle,
  Calendar,
  User,
  ExternalLink,
  Flag,
} from 'lucide-react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { today } from '../../sales/utils/helpers.js';

const STATUS_OPTIONS = [
  { value: 'Assigned', label: 'Assigned (Pending Start)', color: 'text-slate-400' },
  { value: 'In Progress', label: 'In Progress (Active Execution)', color: 'text-purple-400' },
  { value: 'Completed', label: 'Completed (Work Delivered)', color: 'text-emerald-400' },
  { value: 'On Hold', label: 'On Hold (Blocked / Waiting)', color: 'text-amber-400' },
];

export default function TaskUpdateModal() {
  const { taskUpdateModal, closeTaskUpdateModal, updateTaskProgress, user } = useMarketing();
  const { open, item } = taskUpdateModal;

  const [status, setStatus] = useState('In Progress');
  const [progress, setProgress] = useState(50);
  const [workSummary, setWorkSummary] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [deliverableDetails, setDeliverableDetails] = useState('');
  const [completionAttachment, setCompletionAttachment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setStatus(item.status || 'In Progress');
      setProgress(typeof item.progress === 'number' ? item.progress : (item.status === 'Completed' ? 100 : 50));
      setWorkSummary(item.workSummary || '');
      setCompletionNotes(item.completionNotes || item.note || '');
      setDeliverableDetails(item.deliverables || item.deliverableDetails || '');
      setCompletionAttachment(item.completionAttachment || item.attachment || '');
      setError('');
    }
  }, [item, open]);

  if (!open || !item) return null;

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed') {
      setProgress(100);
    } else if (newStatus === 'Assigned') {
      setProgress(0);
    } else if (progress === 0 || progress === 100) {
      setProgress(50);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (status === 'Completed' && !completionNotes.trim() && !workSummary.trim()) {
      setError('Please provide completion notes or work summary outlining the deliverables.');
      return;
    }

    updateTaskProgress(item.id, {
      status,
      progress: Number(progress),
      note: completionNotes.trim() || workSummary.trim(),
      workSummary: workSummary.trim(),
      completionNotes: completionNotes.trim(),
      deliverableDetails: deliverableDetails.trim(),
      deliverables: deliverableDetails.trim(),
      attachment: completionAttachment.trim(),
      completionAttachment: completionAttachment.trim(),
    });

    closeTaskUpdateModal();
  };

  return (
    <div className="marketing-modal-backdrop" onClick={closeTaskUpdateModal}>
      <div className="marketing-modal-card max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="marketing-modal-header border-b border-blue-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.25)]">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Employee Work Update & Delivery
              </h3>
              <p className="text-xs text-slate-400">
                Update execution progress, status, completion deliverables, and evidence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTaskUpdateModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Work Overview Card */}
        <div className="p-4 bg-slate-900/60 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="mkt-badge mkt-badge-blue text-[10.5px]">
              {item.category || 'General'}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar size={11} className="text-slate-500" />
              Deadline: <strong className="text-slate-300">{item.dueDate} {item.dueTime || ''}</strong>
            </span>
          </div>

          <h4 className="text-sm font-bold text-white">{item.title}</h4>

          {item.desc && (
            <p className="text-xs text-slate-300 bg-black/30 p-2.5 rounded-lg border border-white/5">
              {item.desc}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>Assigned to: <strong className="text-slate-200">{item.assignedTo}</strong></span>
            <span>•</span>
            <span>Assigned by: <strong className="text-slate-200">{item.assignedBy || 'Administrator'}</strong></span>
            {item.attachment && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <Paperclip size={11} />
                  <span>Brief: {item.attachment}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="marketing-modal-body space-y-4 pt-3">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((st) => {
                const active = status === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => handleStatusChange(st.value)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      active
                        ? st.value === 'Completed'
                          ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : st.value === 'In Progress'
                          ? 'bg-blue-500/25 border-blue-500/50 text-blue-300 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                          : st.value === 'On Hold'
                          ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                          : 'bg-slate-700/40 border-slate-500/40 text-slate-200'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {st.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Execution Progress</span>
              <span className="font-bold text-blue-300">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0% (Not Started)</span>
              <span>25%</span>
              <span>50% (Halfway)</span>
              <span>75%</span>
              <span>100% (Ready for Review)</span>
            </div>
          </div>

          {/* Work Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Summary / Progress Overview
            </label>
            <input
              type="text"
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="e.g. Completed initial design mockups and client approval"
              className="mkt-input text-xs"
            />
          </div>

          {/* Completion Notes / Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {status === 'Completed' ? 'Completion Notes & Deliverable Summary *' : 'Progress Log / Employee Notes'}
            </label>
            <textarea
              rows={2}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder={
                status === 'Completed'
                  ? 'Summarize work completed, final outputs, delivery links, or handoff criteria...'
                  : 'Add brief note on current progress, next steps, or any blockers...'
              }
              className="mkt-input !py-2.5 resize-none text-xs"
              required={status === 'Completed'}
            />
          </div>

          {/* Deliverable Details & Attachment Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <FileText size={13} className="text-blue-400" />
                <span>Deliverable Details / URLs</span>
              </label>
              <input
                type="text"
                value={deliverableDetails}
                onChange={(e) => setDeliverableDetails(e.target.value)}
                placeholder="e.g. figma.com/..., live campaign URL"
                className="mkt-input text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Paperclip size={13} className="text-sky-400" />
                <span>Attachment / Evidence Link</span>
              </label>
              <input
                type="text"
                value={completionAttachment}
                onChange={(e) => setCompletionAttachment(e.target.value)}
                placeholder="e.g. drive.google.com/..., banner_final.png"
                className="mkt-input text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Updating as: <strong className="text-slate-200">{user?.name || item.assignedTo}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeTaskUpdateModal}
                className="btn-mkt-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-mkt-primary"
              >
                <Save size={14} />
                <span>Submit Work Update</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
