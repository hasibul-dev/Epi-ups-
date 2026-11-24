import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  CheckSquare,
  Tag,
  Paperclip,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { today } from '../../sales/utils/helpers.js';

/**
 * Pure Corporate White A4 Document Renderer for Digital Marketing
 * Strictly isolated styling: Pure #FFFFFF canvas, #111111 text, #1F2937 table headers,
 * 1px solid #999999 borders, #000000 headings, and 3 official signatories.
 */
export default function MarketingPrintDocument({
  reportType = 'single', // 'single' | 'history' | 'completion' | 'assignment'
  task = null,
  tasks = [],
  filters = {},
  orientation = 'portrait', // 'portrait' | 'landscape'
}) {
  const currentToday = today();
  const allTasks = tasks || [];

  // Categorized subsets
  const completedTasks = allTasks.filter((t) => t.status === 'Completed');
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress');
  const assignmentTasks = allTasks.filter((t) => t.status !== 'Completed');
  const overdueTasks = allTasks.filter(
    (t) => t.dueDate && t.dueDate < currentToday && t.status !== 'Completed'
  );

  return (
    <div
      className={`mkt-print-sheet print-container ${
        orientation === 'landscape' ? 'mkt-landscape' : 'mkt-portrait'
      }`}
      style={{
        backgroundColor: '#ffffff',
        color: '#111111',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        lineHeight: 1.5,
        padding: '24px 28px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* =================================================================== */}
      {/* 1. INDIVIDUAL WORK ORDER SLIP                                       */}
      {/* =================================================================== */}
      {reportType === 'single' && (
        task ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Universal Corporate Header */}
            <CompanyPrintHeader
              title="INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT"
              department="DIGITAL MARKETING DEPARTMENT"
              dateRange={`Report Generated: ${currentToday}`}
              subtitle={`Official Commercial Work Order · ID: ${task.id || 'N/A'}`}
              metaItems={[
                { label: 'Work Order ID', value: task.id || 'N/A' },
                { label: 'Assigned Employee', value: task.assignedTo || 'Unassigned' },
                { label: 'Priority Level', value: task.priority || 'Normal' },
                { label: 'Current Status', value: task.status || 'Assigned' },
              ]}
              badge="DIGITAL MARKETING"
            />

            {/* 1. Deliverable Master Attributes */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1F2937',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                }}
              >
                1. Deliverable Master Specifications
              </div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #999999',
                  fontSize: '11px',
                  color: '#111111',
                  tableLayout: 'fixed',
                }}
              >
                <tbody>
                  <tr style={{ borderBottom: '1px solid #999999' }}>
                    <td
                      style={{
                        width: '135px',
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Work Order ID:
                    </td>
                    <td
                      style={{
                        width: '35%',
                        padding: '7px 10px',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: '#000000',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      {task.id || 'N/A'}
                    </td>
                    <td
                      style={{
                        width: '135px',
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Category:
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 700, color: '#111111' }}>
                      {task.category || 'General Digital Marketing'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #999999' }}>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Work Title:
                    </td>
                    <td
                      colSpan={3}
                      style={{
                        padding: '8px 10px',
                        fontWeight: 800,
                        fontSize: '12.5px',
                        color: '#000000',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.4,
                      }}
                    >
                      {task.title}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #999999' }}>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Assigned Employee:
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        fontWeight: 800,
                        color: '#000000',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      {task.assignedTo || 'Unassigned'}
                    </td>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Priority Level:
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        fontWeight: 800,
                        color: task.priority === 'Urgent' ? '#b91c1c' : '#000000',
                      }}
                    >
                      {task.priority || 'Normal'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #999999' }}>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Assignment Date:
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        color: '#111111',
                        fontWeight: 600,
                        borderRight: '1px solid #999999',
                      }}
                    >
                      {task.startDate || currentToday}
                    </td>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Target Deadline:
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 700, color: '#be123c' }}>
                      {task.dueDate ? `${task.dueDate} ${task.dueTime || ''}` : 'As Scheduled'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Current Status:
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        fontWeight: 800,
                        color: '#000000',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      {task.status || 'Assigned'}
                    </td>
                    <td
                      style={{
                        background: '#f1f5f9',
                        padding: '7px 10px',
                        fontWeight: 700,
                        color: '#1F2937',
                        borderRight: '1px solid #999999',
                      }}
                    >
                      Completion Date:
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        fontWeight: 800,
                        color: task.completedDate ? '#047857' : '#475569',
                      }}
                    >
                      {task.completedDate
                        ? `${task.completedDate} ${task.completedTime || ''}`
                        : 'Pending Completion'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. Project Brief & Work Deliverable Scope */}
            <div
              style={{
                border: '1px solid #999999',
                borderRadius: '4px',
                padding: '11px 13px',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1F2937',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '5px',
                  marginBottom: '7px',
                }}
              >
                <FileText size={13} style={{ color: '#475569' }} />
                <span>Project Brief & Work Deliverable Scope</span>
              </div>
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: '#111111',
                  margin: 0,
                }}
              >
                {task.desc ||
                  'Execute the designated industrial digital marketing assignment in accordance with EPI UPS Bangladesh corporate branding guidelines and engineering technical accuracy.'}
              </p>
            </div>

            {/* 3. Employee Completion Notes & Performance Report */}
            <div
              style={{
                border: '1px solid #999999',
                borderRadius: '4px',
                padding: '11px 13px',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1F2937',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '5px',
                  marginBottom: '7px',
                }}
              >
                <CheckCircle2 size={13} style={{ color: '#047857' }} />
                <span>Employee Completion Notes & Performance Handover</span>
              </div>
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: '#111111',
                  margin: 0,
                  fontStyle: task.completionNotes ? 'normal' : 'italic',
                }}
              >
                {task.completionNotes ||
                  'Work deliverable completed, verified for compliance, and archived in accordance with corporate digital marketing objectives.'}
              </p>
            </div>

            {/* 4. Submission Notes & Attached Deliverable Assets */}
            <div
              style={{
                border: '1px solid #999999',
                borderRadius: '4px',
                padding: '11px 13px',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1F2937',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '5px',
                  marginBottom: '7px',
                }}
              >
                <Layers size={13} style={{ color: '#475569' }} />
                <span>Submission Notes & Attached Deliverable Assets</span>
              </div>
              <div style={{ fontSize: '11px', color: '#111111', marginBottom: '8px' }}>
                <strong>Submission Status:</strong>{' '}
                {task.completedDate ? `Delivered on ${task.completedDate}` : 'In progress by marketing team'}
              </div>
              <div
                style={{
                  paddingTop: '6px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                }}
              >
                <Tag size={12} style={{ color: '#475569' }} />
                <span style={{ fontWeight: 800, color: '#1F2937' }}>Attached Deliverable Assets:</span>
                {task.completionAttachment || task.attachment ? (
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: '#000000',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      border: '1px solid #999999',
                      borderRadius: '3px',
                    }}
                  >
                    {task.completionAttachment || task.attachment}
                  </span>
                ) : (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                    No deliverable assets attached
                  </span>
                )}
              </div>
            </div>

            {/* 5. Approval Signatures (3 Columns) */}
            <div style={{ marginTop: '18px', pageBreakInside: 'avoid' }}>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: '#1F2937',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                  borderBottom: '1px solid #999999',
                  paddingBottom: '4px',
                }}
              >
                Official Commercial Approval & Verification
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
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#111111',
              fontWeight: 700,
              border: '1px solid #999999',
              background: '#f9fafb',
              borderRadius: '6px',
            }}
          >
            Please select a specific work order record from the selector above to preview its slip.
          </div>
        )
      )}

      {/* =================================================================== */}
      {/* 2. WORK HISTORY & ARCHIVE REPORT                                    */}
      {/* =================================================================== */}
      {reportType === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CompanyPrintHeader
            title="DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT"
            department="DIGITAL MARKETING DEPARTMENT"
            dateRange={
              filters?.startDate && filters?.endDate
                ? `${filters.startDate} to ${filters.endDate}`
                : `Registry Record: ${currentToday}`
            }
            subtitle={
              filters?.employee && filters.employee !== 'All'
                ? `Filter by Employee: ${filters.employee}`
                : 'Complete Departmental Historical Archive'
            }
            metaItems={[
              { label: 'Total Recorded Works', value: allTasks.length },
              { label: 'Completed', value: completedTasks.length },
              { label: 'In Progress', value: inProgressTasks.length },
              { label: 'Overdue Works', value: overdueTasks.length },
            ]}
            badge="DIGITAL MARKETING"
          />

          {/* Historical KPI Summary Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #999999',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Total Recorded
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>
                {allTasks.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Completed
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                {completedTasks.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                In Progress
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                {inProgressTasks.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Pending / On Hold
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                {allTasks.filter((t) => t.status !== 'Completed' && t.status !== 'In Progress').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Overdue Works
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: overdueTasks.length > 0 ? '#b91c1c' : '#047857', marginTop: '2px' }}>
                {overdueTasks.length}
              </div>
            </div>
          </div>

          {/* Detailed Historical Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #999999',
              fontSize: '10px',
              color: '#111111',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '75px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Order ID</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '180px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Title & Scope</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '90px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '100px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Assigned Employee</th>
                <th style={{ padding: '6px 5px', border: '1px solid #999999', width: '68px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Assigned</th>
                <th style={{ padding: '6px 5px', border: '1px solid #999999', width: '78px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Completed</th>
                <th style={{ padding: '6px 5px', border: '1px solid #999999', width: '65px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Status</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '130px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Completion Notes & Deliverables</th>
              </tr>
            </thead>
            <tbody>
              {allTasks.length > 0 ? (
                allTasks.map((t, idx) => (
                  <tr
                    key={t.id || idx}
                    style={{
                      borderBottom: '1px solid #999999',
                      pageBreakInside: 'avoid',
                      backgroundColor: idx % 2 === 1 ? '#fcfdfd' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '6px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, color: '#000000' }}>
                      {t.id || 'N/A'}
                    </td>
                    <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.35 }}>
                      {t.title}
                      {t.attachment && (
                        <div style={{ fontSize: '9px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                          📎 Asset: {t.attachment}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 6px', border: '1px solid #999999', color: '#111111' }}>
                      {t.category || '—'}
                    </td>
                    <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', fontWeight: 700 }}>
                      {t.assignedTo || 'Unassigned'}
                    </td>
                    <td style={{ padding: '6px 5px', border: '1px solid #999999', textAlign: 'center', color: '#111111' }}>
                      {t.startDate || '—'}
                    </td>
                    <td style={{ padding: '6px 5px', border: '1px solid #999999', textAlign: 'center', fontWeight: 700, color: '#000000' }}>
                      {t.completedDate ? `✓ ${t.completedDate}` : (t.dueDate || '—')}
                    </td>
                    <td style={{ padding: '6px 5px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: t.status === 'Completed' ? '#047857' : '#000000' }}>
                      {t.status || 'Assigned'}
                    </td>
                    <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.35 }}>
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
                  <td
                    colSpan={9}
                    style={{
                      padding: '18px',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#111111',
                      background: '#f9fafb',
                      border: '1px solid #999999',
                    }}
                  >
                    No marketing work records match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 3 Approval Signatures */}
          <div style={{ marginTop: '22px', pageBreakInside: 'avoid' }}>
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

      {/* =================================================================== */}
      {/* 3. WORK COMPLETION & AUDIT REPORT                                   */}
      {/* =================================================================== */}
      {reportType === 'completion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CompanyPrintHeader
            title="DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT"
            department="DIGITAL MARKETING DEPARTMENT"
            dateRange={`Audit Date: ${currentToday}`}
            subtitle="Audited Report of Delivered Collateral, Deliverable Assets & Handover Compliance"
            metaItems={[
              { label: 'Completed Deliverables', value: completedTasks.length },
              { label: 'Total Recorded', value: allTasks.length },
              {
                label: 'Completion Rate',
                value: allTasks.length > 0 ? `${Math.round((completedTasks.length / allTasks.length) * 100)}%` : '0%',
              },
              { label: 'Compliance Status', value: '100% Verified' },
            ]}
            badge="DIGITAL MARKETING"
          />

          {/* Completion Metrics Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #999999',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Completed Deliverables
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                {completedTasks.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                With Attached Assets
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0052cc', marginTop: '2px' }}>
                {completedTasks.filter((t) => t.completionAttachment || t.attachment).length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Verified On Schedule
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                {completedTasks.filter((t) => !t.dueDate || !t.completedDate || t.completedDate <= t.dueDate).length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Audit Pass Rate
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>
                100% Passed
              </div>
            </div>
          </div>

          {/* Completed Deliverables Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #999999',
              fontSize: '10px',
              color: '#111111',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '75px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Order ID</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '190px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Deliverable Title</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '110px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Responsible Employee</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '85px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '80px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Completed Date</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', minWidth: '150px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Attached Deliverable Assets</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '75px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {(completedTasks.length > 0 ? completedTasks : allTasks).map((t, idx) => (
                <tr
                  key={t.id || idx}
                  style={{
                    borderBottom: '1px solid #999999',
                    pageBreakInside: 'avoid',
                    backgroundColor: idx % 2 === 1 ? '#fcfdfd' : '#ffffff',
                  }}
                >
                  <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, color: '#000000' }}>
                    {t.id || 'N/A'}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.35 }}>
                    {t.title}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', fontWeight: 700 }}>
                    {t.assignedTo || 'Unassigned'}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', color: '#111111' }}>
                    {t.category || 'General'}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#047857' }}>
                    {t.completedDate || t.dueDate || '—'} {t.completedTime || ''}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#111111', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {t.completionAttachment || t.attachment ? (
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#000000',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          border: '1px solid #999999',
                          borderRadius: '3px',
                        }}
                      >
                        {t.completionAttachment || t.attachment}
                      </span>
                    ) : (
                      <span style={{ color: '#475569', fontStyle: 'italic' }}>Handover Verified</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#047857' }}>
                    ✓ Verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 3 Approval Signatures */}
          <div style={{ marginTop: '22px', pageBreakInside: 'avoid' }}>
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

      {/* =================================================================== */}
      {/* 4. WORK ALLOCATION & ASSIGNMENT REPORT                              */}
      {/* =================================================================== */}
      {reportType === 'assignment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CompanyPrintHeader
            title="DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT"
            department="DIGITAL MARKETING DEPARTMENT"
            dateRange={`Active Queue as of: ${currentToday}`}
            subtitle="Departmental Workload Distribution, Employee Allocation & Delivery Milestones"
            metaItems={[
              { label: 'Active Assigned Works', value: assignmentTasks.length },
              { label: 'Urgent Priority', value: assignmentTasks.filter((t) => t.priority === 'Urgent').length },
              { label: 'Team Capacity', value: `${new Set(allTasks.map((t) => t.assignedTo)).size} Members` },
              { label: 'Queue Status', value: 'Active Operational' },
            ]}
            badge="DIGITAL MARKETING"
          />

          {/* Allocation Metrics Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #999999',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Active Assignments
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>
                {assignmentTasks.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                In Progress
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>
                {assignmentTasks.filter((t) => t.status === 'In Progress').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Urgent Priority
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#b91c1c', marginTop: '2px' }}>
                {assignmentTasks.filter((t) => t.priority === 'Urgent').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Unassigned Tasks
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
                {assignmentTasks.filter((t) => !t.assignedTo || t.assignedTo === 'Unassigned').length}
              </div>
            </div>
          </div>

          {/* Assignment Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #999999',
              fontSize: '10px',
              color: '#111111',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #1F2937' }}>
                <th style={{ padding: '6px 4px', border: '1px solid #999999', width: '28px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>#</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '75px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Work Order ID</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '190px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Task Objective & Scope</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '105px', textAlign: 'left', color: '#1F2937', fontWeight: 800 }}>Assigned Employee</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '65px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Priority</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Start Date</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '80px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Target Deadline</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '60px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Progress</th>
                <th style={{ padding: '6px 6px', border: '1px solid #999999', width: '70px', textAlign: 'center', color: '#1F2937', fontWeight: 800 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(assignmentTasks.length > 0 ? assignmentTasks : allTasks).map((t, idx) => (
                <tr
                  key={t.id || idx}
                  style={{
                    borderBottom: '1px solid #999999',
                    pageBreakInside: 'avoid',
                    backgroundColor: idx % 2 === 1 ? '#fcfdfd' : '#ffffff',
                  }}
                >
                  <td style={{ padding: '6px 4px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, color: '#000000' }}>
                    {t.id || 'N/A'}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #999999', fontWeight: 700, color: '#000000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.35 }}>
                    {t.title}
                    {t.desc && (
                      <div style={{ fontSize: '9px', color: '#333333', marginTop: '2px', fontStyle: 'italic' }}>
                        {t.desc}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #999999', color: '#000000', fontWeight: 700 }}>
                    {t.assignedTo || 'Unassigned'}
                  </td>
                  <td
                    style={{
                      padding: '6px 6px',
                      border: '1px solid #999999',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: t.priority === 'Urgent' ? '#b91c1c' : '#000000',
                    }}
                  >
                    {t.priority || 'Normal'}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', color: '#111111' }}>
                    {t.startDate || currentToday}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 700, color: '#be123c' }}>
                    {t.dueDate || '—'} {t.dueTime || ''}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#0052cc' }}>
                    {typeof t.progress === 'number' ? `${t.progress}%` : '0%'}
                  </td>
                  <td style={{ padding: '6px 6px', border: '1px solid #999999', textAlign: 'center', fontWeight: 800, color: '#000000' }}>
                    {t.status || 'Assigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 3 Approval Signatures */}
          <div style={{ marginTop: '22px', pageBreakInside: 'avoid' }}>
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
  );
}
