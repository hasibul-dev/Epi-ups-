import React from 'react';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { today } from '../../sales/utils/helpers.js';

/**
 * Brand-New Corporate White A4 Document Renderer for Digital Marketing
 * Strictly isolated: Pure #FFFFFF canvas, solid #000000 and #111111 text, #1F2937 table headers,
 * crisp table gridlines (#111111 header and #999999 internal borders), zero outer borders/frames,
 * optimized column widths for A4 portrait with proper text wrapping and repeated headers.
 */
export default function WorkPrintDocument({
  reportType = 'single', // 'single' | 'history' | 'completion' | 'assignment'
  task = null,
  tasks = [],
  filters = {},
  orientation = 'portrait', // 'portrait' | 'landscape'
}) {
  const currentToday = today();
  const allTasks = tasks || [];

  const completedTasks = allTasks.filter((t) => t.status === 'Completed');
  const assignmentTasks = allTasks.filter((t) => t.status !== 'Completed');

  // Compute period string from filters
  const dateRangeStr = filters.startDate && filters.endDate
    ? `${filters.startDate} to ${filters.endDate}`
    : filters.startDate
    ? `From ${filters.startDate}`
    : filters.endDate
    ? `Up to ${filters.endDate}`
    : `As of ${currentToday}`;

  return (
    <div
      className={`mkt-print-sheet print-container ${
        orientation === 'landscape' ? 'mkt-landscape' : 'mkt-portrait'
      }`}
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", Arial, sans-serif',
        lineHeight: 1.45,
        padding: '8px 12px',
        boxSizing: 'border-box',
        width: '100%',
        margin: '0 auto',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      }}
    >
      {/* =================================================================== */}
      {/* 1. INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT                   */}
      {/* =================================================================== */}
      {reportType === 'single' && (
        task ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Universal EPI UPS Company Header */}
            <CompanyPrintHeader
              badge="DIGITAL MARKETING & CREATIVE OPERATIONS"
              department="DIGITAL MARKETING & CREATIVE OPERATIONS"
              dateRange={task.dueDate ? `Deadline: ${task.dueDate}` : ''}
            />

            {/* Document Title Banner — Clean Borderless Header with Subtle Divider */}
            <div
              style={{
                borderBottom: '2px solid #111111',
                padding: '4px 0 8px 0',
                textAlign: 'center',
                margin: '0 0 4px 0',
              }}
            >
              <h2
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  margin: 0,
                  color: '#000000',
                }}
              >
                INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT
              </h2>
              <div style={{ fontSize: '10.5px', color: '#222222', fontWeight: 700, marginTop: '2px' }}>
                Official Task Brief, Specifications, Deliverables & Submission Verification
              </div>
            </div>

            {/* Task Information Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px',
                border: '1px solid #111111',
                color: '#000000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, width: '22%', border: '1px solid #999999' }}>
                    Work Order ID:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 900, width: '28%', border: '1px solid #999999', fontFamily: 'monospace', fontSize: '11.5px' }}>
                    #{task.id}
                  </td>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, width: '22%', border: '1px solid #999999' }}>
                    Execution Status:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 800, width: '28%', border: '1px solid #999999', color: '#000000' }}>
                    {task.status || 'Assigned'} {typeof task.progress === 'number' ? `(${task.progress}%)` : ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, border: '1px solid #999999' }}>
                    Work Category:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, border: '1px solid #999999' }}>
                    {task.category || 'General'}
                  </td>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, border: '1px solid #999999' }}>
                    Priority Level:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 800, border: '1px solid #999999', color: task.priority === 'Urgent' ? '#b91c1c' : '#000000' }}>
                    {task.priority || 'Normal'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, border: '1px solid #999999' }}>
                    Assigned Employee:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 800, border: '1px solid #999999' }}>
                    {task.assignedTo || 'Unassigned'}
                  </td>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, border: '1px solid #999999' }}>
                    Assigned By:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, border: '1px solid #999999' }}>
                    {task.assignedBy || 'Super Administrator'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, border: '1px solid #999999' }}>
                    Assignment Date:
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 700 }}>
                    {task.startDate || '—'}
                  </td>
                  <td style={{ padding: '6px 8px', background: '#f1f5f9', fontWeight: 800, border: '1px solid #999999' }}>
                    Target Deadline:
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 800, border: '1px solid #999999', fontFamily: 'monospace' }}>
                    {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Project Brief & Work Deliverable Scope */}
            <div style={{ border: '1px solid #999999', padding: '10px 12px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '11.5px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 5px 0', color: '#000000', borderBottom: '1px solid #111111', paddingBottom: '3px' }}>
                Project Brief & Work Deliverable Scope
              </h3>
              <div style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 5px 0', color: '#000000' }}>
                {task.title}
              </div>
              <div style={{ fontSize: '11px', color: '#111111', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.45, fontWeight: 500 }}>
                {task.desc || 'No detailed scope outlined for this work order.'}
              </div>
              {task.refInfo && (
                <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#111111', fontWeight: 700 }}>
                  <strong>Project / Reference Info:</strong> {task.refInfo}
                </div>
              )}
              {task.instructions && (
                <div style={{ marginTop: '4px', fontSize: '10.5px', color: '#111111', fontWeight: 700 }}>
                  <strong>Additional Instructions:</strong> {task.instructions}
                </div>
              )}
              {task.attachment && (
                <div style={{ marginTop: '4px', fontSize: '10.5px', color: '#000000', fontWeight: 700 }}>
                  <strong>Attached Brief Link / Document:</strong> {task.attachment}
                </div>
              )}
            </div>

            {/* Employee Completion Report */}
            <div style={{ border: '1px solid #999999', padding: '10px 12px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '11.5px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 5px 0', color: '#000000', borderBottom: '1px solid #111111', paddingBottom: '3px' }}>
                Employee Completion Report
              </h3>
              <div style={{ fontSize: '11px', color: '#111111', lineHeight: 1.45 }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 700 }}>
                  <strong>Delivery Status:</strong> {task.status === 'Completed' ? 'Verified Completed & Delivered' : 'Work in Progress / Pending Completion'}
                  {task.completedDate && ` (Delivered Date: ${task.completedDate})`}
                </p>
                <p style={{ margin: '0 0 3px 0', fontWeight: 800 }}>
                  Submission Notes & Attached Deliverable Assets:
                </p>
                <div style={{ margin: '0 0 6px 0', color: '#000000', fontWeight: 600, padding: '5px 8px', background: '#f8fafc', border: '1px solid #cccccc' }}>
                  {task.completionNotes || task.workSummary || task.note || 'No completion notes submitted yet.'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#000000', fontWeight: 700 }}>
                  <strong>Attached Deliverable Assets:</strong> {task.completionAttachment || task.deliverables || task.attachment || 'None submitted.'}
                </div>
              </div>
            </div>

            {/* 3 Signatures */}
            <PrintSignatures
              firstTitle="Marketing Executive"
              secondTitle="Lead Digital Strategist"
              thirdTitle="Managing Director / Super Admin"
            />
          </div>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: '#000000', fontWeight: 700 }}>
            No work order record selected for printing.
          </div>
        )
      )}

      {/* =================================================================== */}
      {/* 2. DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT                  */}
      {/* =================================================================== */}
      {reportType === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CompanyPrintHeader
            badge="DIGITAL MARKETING ARCHIVE & COMPLIANCE"
            department="DIGITAL MARKETING ARCHIVE & COMPLIANCE"
            dateRange={dateRangeStr}
          />

          {/* Clean Title Bar with Border-Bottom (Zero Outer Box Frame) */}
          <div
            style={{
              borderBottom: '2px solid #111111',
              padding: '4px 0 6px 0',
              textAlign: 'center',
              margin: '0 0 4px 0',
            }}
          >
            <h2
              style={{
                fontSize: '14px',
                fontWeight: 900,
                textTransform: 'uppercase',
                margin: 0,
                color: '#000000',
                letterSpacing: '0.02em',
              }}
            >
              DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT
            </h2>
            <div style={{ fontSize: '10.5px', color: '#222222', fontWeight: 700, marginTop: '2px' }}>
              Audit Archive of Operational Deliverables ({allTasks.length} matching tasks recorded)
            </div>
          </div>

          {/* Clean A4 Portrait Table Layout with Word Wrapping and Repeating Headers */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10px',
              border: '1px solid #111111',
              color: '#000000',
              tableLayout: 'auto',
            }}
          >
            <thead style={{ display: 'table-header-group' }}>
              <tr style={{ background: '#f1f5f9', color: '#000000' }}>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '45px', fontWeight: 800, textAlign: 'center' }}>
                  ID
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #111111', borderBottom: '2px solid #111111', minWidth: '180px', fontWeight: 800, textAlign: 'left' }}>
                  Work Title &amp; Deliverable Summary
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '90px', fontWeight: 800, textAlign: 'left' }}>
                  Category
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '95px', fontWeight: 800, textAlign: 'left' }}>
                  Assigned To
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '75px', fontWeight: 800, textAlign: 'center' }}>
                  Deadline
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '60px', fontWeight: 800, textAlign: 'center' }}>
                  Priority
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '75px', fontWeight: 800, textAlign: 'center' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {allTasks.length > 0 ? (
                allTasks.map((t, idx) => (
                  <tr
                    key={t.id}
                    style={{
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      background: idx % 2 === 1 ? '#f9fafb' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #999999', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <div style={{ fontWeight: 800, color: '#000000', fontSize: '10.5px' }}>{t.title}</div>
                      {t.desc && (
                        <div style={{ fontSize: '9.5px', color: '#222222', marginTop: '1px', lineHeight: 1.35 }}>
                          {t.desc.length > 120 ? `${t.desc.slice(0, 120)}...` : t.desc}
                        </div>
                      )}
                      {t.completionNotes && (
                        <div style={{ fontSize: '9.5px', color: '#111111', fontStyle: 'italic', marginTop: '2px', fontWeight: 600 }}>
                          Notes: {t.completionNotes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 600, fontSize: '9.5px' }}>
                      {t.category || 'General'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 700, fontSize: '10px' }}>
                      {t.assignedTo}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 600, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.dueDate || '—'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 700, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.priority || 'Normal'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 800, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#111111', fontWeight: 700, background: '#f9fafb', border: '1px solid #999999' }}>
                    No work records found matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <PrintSignatures
            firstTitle="Marketing Executive"
            secondTitle="Lead Digital Strategist"
            thirdTitle="Managing Director / Super Admin"
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT                 */}
      {/* =================================================================== */}
      {reportType === 'completion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CompanyPrintHeader
            badge="DIGITAL OPERATIONS AUDIT & VERIFICATION"
            department="DIGITAL OPERATIONS AUDIT & VERIFICATION"
            dateRange={dateRangeStr}
          />

          <div
            style={{
              borderBottom: '2px solid #111111',
              padding: '4px 0 6px 0',
              textAlign: 'center',
              margin: '0 0 4px 0',
            }}
          >
            <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#000000', letterSpacing: '0.02em' }}>
              DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT
            </h2>
            <div style={{ fontSize: '10.5px', color: '#222222', fontWeight: 700, marginTop: '2px' }}>
              Verified Delivered Assets & Output Deliverables ({completedTasks.length} completed tasks)
            </div>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10px',
              border: '1px solid #111111',
              color: '#000000',
              tableLayout: 'auto',
            }}
          >
            <thead style={{ display: 'table-header-group' }}>
              <tr style={{ background: '#f1f5f9', color: '#000000' }}>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '45px', fontWeight: 800, textAlign: 'center' }}>
                  ID
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #111111', borderBottom: '2px solid #111111', minWidth: '170px', fontWeight: 800, textAlign: 'left' }}>
                  Work Title &amp; Deliverables
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '90px', fontWeight: 800, textAlign: 'left' }}>
                  Category
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '90px', fontWeight: 800, textAlign: 'left' }}>
                  Specialist
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '75px', fontWeight: 800, textAlign: 'center' }}>
                  Delivery Date
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '130px', fontWeight: 800, textAlign: 'left' }}>
                  Evidence / Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.length > 0 ? (
                completedTasks.map((t, idx) => (
                  <tr
                    key={t.id}
                    style={{
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      background: idx % 2 === 1 ? '#f9fafb' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #999999', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <div style={{ fontWeight: 800, color: '#000000', fontSize: '10.5px' }}>{t.title}</div>
                      {t.completionNotes && (
                        <div style={{ fontSize: '9.5px', color: '#111111', fontStyle: 'italic', marginTop: '2px', fontWeight: 600 }}>
                          Notes: {t.completionNotes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 600, fontSize: '9.5px' }}>
                      {t.category || 'General'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 700, fontSize: '10px' }}>
                      {t.assignedTo}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 700, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.completedDate || t.dueDate || '—'}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #999999', color: '#000000', fontSize: '9.5px', fontWeight: 600, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {t.completionAttachment || t.deliverables || t.attachment || 'Verified Complete'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#111111', fontWeight: 700, background: '#f9fafb', border: '1px solid #999999' }}>
                    No completed work records found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <PrintSignatures
            firstTitle="Marketing Executive"
            secondTitle="Lead Digital Strategist"
            thirdTitle="Managing Director / Super Admin"
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT           */}
      {/* =================================================================== */}
      {reportType === 'assignment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CompanyPrintHeader
            badge="DIGITAL MARKETING WORKLOAD & CAPACITY DISPATCH"
            department="DIGITAL MARKETING WORKLOAD & CAPACITY DISPATCH"
            dateRange={dateRangeStr}
          />

          <div
            style={{
              borderBottom: '2px solid #111111',
              padding: '4px 0 6px 0',
              textAlign: 'center',
              margin: '0 0 4px 0',
            }}
          >
            <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#000000', letterSpacing: '0.02em' }}>
              DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT
            </h2>
            <div style={{ fontSize: '10.5px', color: '#222222', fontWeight: 700, marginTop: '2px' }}>
              Active Task Queue, Employee Capacity & Deadline Schedule ({assignmentTasks.length} active assignments)
            </div>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10px',
              border: '1px solid #111111',
              color: '#000000',
              tableLayout: 'auto',
            }}
          >
            <thead style={{ display: 'table-header-group' }}>
              <tr style={{ background: '#f1f5f9', color: '#000000' }}>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '45px', fontWeight: 800, textAlign: 'center' }}>
                  ID
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #111111', borderBottom: '2px solid #111111', minWidth: '180px', fontWeight: 800, textAlign: 'left' }}>
                  Work Title &amp; Objectives
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '90px', fontWeight: 800, textAlign: 'left' }}>
                  Category
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '95px', fontWeight: 800, textAlign: 'left' }}>
                  Assigned To
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '75px', fontWeight: 800, textAlign: 'center' }}>
                  Deadline
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '60px', fontWeight: 800, textAlign: 'center' }}>
                  Priority
                </th>
                <th style={{ padding: '6px 6px', border: '1px solid #111111', borderBottom: '2px solid #111111', width: '65px', fontWeight: 800, textAlign: 'center' }}>
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {assignmentTasks.length > 0 ? (
                assignmentTasks.map((t, idx) => (
                  <tr
                    key={t.id}
                    style={{
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      background: idx % 2 === 1 ? '#f9fafb' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #999999', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <div style={{ fontWeight: 800, color: '#000000', fontSize: '10.5px' }}>{t.title}</div>
                      {t.desc && (
                        <div style={{ fontSize: '9.5px', color: '#222222', marginTop: '1px', lineHeight: 1.35 }}>
                          {t.desc.length > 110 ? `${t.desc.slice(0, 110)}...` : t.desc}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 600, fontSize: '9.5px' }}>
                      {t.category || 'General'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 700, fontSize: '10px' }}>
                      {t.assignedTo}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 600, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.dueDate || '—'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 700, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.priority || 'Normal'}
                    </td>
                    <td style={{ padding: '5px 6px', border: '1px solid #999999', fontWeight: 800, textAlign: 'center', fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                      {t.progress || 0}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#111111', fontWeight: 700, background: '#f9fafb', border: '1px solid #999999' }}>
                    No active assignments found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <PrintSignatures
            firstTitle="Marketing Executive"
            secondTitle="Lead Digital Strategist"
            thirdTitle="Managing Director / Super Admin"
          />
        </div>
      )}
    </div>
  );
}
