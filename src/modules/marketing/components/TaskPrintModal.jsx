import React from 'react';
import { X, Printer, CheckCircle2, Calendar, User, Tag, FileText } from 'lucide-react';
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
              className="btn-mkt-primary !h-[34px] !min-h-[34px] !py-1.5 !px-3.5 text-xs flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print to Paper / PDF</span>
            </button>
            <button
              onClick={closeTaskPrintModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-b-xl print-container">
          {/* Universal Official Company Header with strict 2-column layout */}
          <CompanyPrintHeader
            title={
              type === 'summary'
                ? 'DIGITAL MARKETING WORK PERFORMANCE & HISTORY REPORT'
                : 'DIGITAL MARKETING WORK ORDER SLIP & CERTIFICATE'
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
                    { label: 'On Hold / Other', value: tasksToPrint.filter(t => t.status === 'On Hold' || t.status === 'Assigned' || t.status === 'To Do').length },
                  ]
                : singleTask
                ? [
                    { label: 'Work Order ID', value: singleTask.id || 'N/A' },
                    { label: 'Assigned Employee', value: singleTask.assignedTo || 'Unassigned' },
                    { label: 'Priority', value: singleTask.priority || 'Normal' },
                    { label: 'Status', value: singleTask.status || 'Assigned' },
                  ]
                : []
            }
            badge="DIGITAL MARKETING"
          />

          {/* SINGLE WORK ORDER SLIP VIEW */}
          {type === 'single' && (
            singleTask ? (
              <div className="space-y-4 text-xs text-slate-800">
                {/* Formatted Info Table with Visible #999999 Borders */}
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999999', fontSize: '11px', color: '#111111' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #999999' }}>
                      <td style={{ width: '140px', background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                        Work Order ID:
                      </td>
                      <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#000000', borderRight: '1px solid #999999' }}>
                        {singleTask.id || 'N/A'}
                      </td>
                      <td style={{ width: '140px', background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                        Category:
                      </td>
                      <td style={{ padding: '7px 10px', fontWeight: 600, color: '#111111' }}>
                        {singleTask.category || 'General Marketing'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #999999' }}>
                      <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                        Work Title & Objective:
                      </td>
                      <td colSpan={3} style={{ padding: '7px 10px', fontWeight: 800, fontSize: '12.5px', color: '#000000', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
                        Priority Level:
                      </td>
                      <td style={{ padding: '7px 10px', fontWeight: 800, color: singleTask.priority === 'Urgent' ? '#be123c' : '#000000' }}>
                        {singleTask.priority || 'Normal'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #999999' }}>
                      <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                        Assignment Date:
                      </td>
                      <td style={{ padding: '7px 10px', color: '#111111', fontWeight: 600, borderRight: '1px solid #999999' }}>
                        {singleTask.startDate || '—'}
                      </td>
                      <td style={{ background: '#f1f5f9', padding: '7px 10px', fontWeight: 700, color: '#1F2937', borderRight: '1px solid #999999' }}>
                        Target Deadline:
                      </td>
                      <td style={{ padding: '7px 10px', fontWeight: 700, color: '#be123c' }}>
                        {singleTask.dueDate ? `${singleTask.dueDate} ${singleTask.dueTime || ''}` : '—'}
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
                      <td style={{ padding: '7px 10px', fontWeight: 800, color: singleTask.completedDate ? '#047857' : '#4b5563' }}>
                        {singleTask.completedDate ? `${singleTask.completedDate} ${singleTask.completedTime || ''}` : 'Pending Completion'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Section 1: Project Brief & Work Deliverable Scope */}
                <div style={{ border: '1px solid #999999', borderRadius: '4px', padding: '12px 14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#1F2937', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <FileText size={14} style={{ color: '#475569' }} />
                    <span>1. Project Brief & Work Deliverable Scope</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', lineHeight: 1.6, color: '#111111', margin: 0 }}>
                    {singleTask.desc || 'Complete the assigned industrial marketing deliverable according to EPI UPS brand guidelines and commercial technical specifications.'}
                  </p>
                </div>

                {/* Section 2: Employee Completion Report & Submission Notes */}
                <div style={{ border: '1px solid #999999', borderRadius: '4px', padding: '12px 14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#1F2937', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                    <CheckCircle2 size={14} style={{ color: '#047857' }} />
                    <span>2. Employee Completion Report & Submission Notes</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px', lineHeight: 1.6, color: '#111111', margin: 0, fontStyle: singleTask.completionNotes ? 'normal' : 'italic' }}>
                    {singleTask.completionNotes || 'Work deliverable completed, reviewed, and handed over in full accordance with corporate digital marketing objectives.'}
                  </p>
                  
                  {/* Attached Deliverable Assets Row */}
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <Tag size={13} style={{ color: '#475569' }} />
                    <span style={{ fontWeight: 800, color: '#1F2937' }}>Attached Deliverable Assets:</span>
                    {singleTask.completionAttachment || singleTask.attachment ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#000000', background: '#f1f5f9', padding: '2px 8px', border: '1px solid #999999', borderRadius: '4px' }}>
                        {singleTask.completionAttachment || singleTask.attachment}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontStyle: 'italic' }}>No deliverable assets attached</span>
                    )}
                  </div>
                </div>

                {/* Section 3: Signature and Approval Section */}
                <div style={{ marginTop: '24px', pageBreakInside: 'avoid' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1F2937', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', borderBottom: '1px solid #999999', paddingBottom: '4px' }}>
                    3. Verification & Administrative Sign-Off
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

          {/* SUMMARY REPORT VIEW */}
          {type === 'summary' && (
            <div className="space-y-4">
              {/* Summary Statistics Ribbon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #999999', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Works</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>{tasksToPrint.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                    {tasksToPrint.filter(t => t.status === 'Completed').length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                    {tasksToPrint.filter(t => t.status === 'In Progress').length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>On Hold / Other</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                    {tasksToPrint.filter(t => t.status === 'On Hold' || t.status === 'Assigned' || t.status === 'To Do').length}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999999', fontSize: '10px', color: '#111111' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                    <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '180px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Title & Deliverable</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '90px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Category</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '105px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Assigned Employee</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Assigned</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '85px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Deadline / Completed</th>
                    <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '75px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '140px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Completion Notes & Deliverables</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksToPrint.length > 0 ? (
                    tasksToPrint.map((t, idx) => (
                      <tr key={t.id || idx} style={{ borderBottom: '1px solid #999999', pageBreakInside: 'avoid' }}>
                        <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', background: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {t.title}
                          {t.attachment && (
                            <div style={{ fontSize: '9px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                              📎 Asset: {t.attachment}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', background: '#ffffff', fontWeight: 500 }}>
                          {t.category || '—'}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', background: '#ffffff', fontWeight: 700 }}>
                          {t.assignedTo || 'Unassigned'}
                        </td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', color: '#111111', background: '#ffffff' }}>
                          {t.startDate || '—'}
                        </td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 700, color: '#000000', background: '#ffffff' }}>
                          {t.completedDate ? `✓ ${t.completedDate}` : (t.dueDate || '—')}
                        </td>
                        <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000', background: '#ffffff' }}>
                          {t.status || 'Assigned'}
                        </td>
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
                      <td colSpan={8} style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#111111', background: '#f9fafb', border: '1px solid #999999' }}>
                        No marketing work records found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Signatures Sign-Off Block */}
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
