import React from 'react';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { today } from '../../sales/utils/helpers.js';

/**
 * Brand-New Corporate White A4 Document Renderer for Digital Marketing
 * Strictly isolated: Pure #FFFFFF canvas, solid #000000 and #111111 text, #1F2937 table headers,
 * 1px solid #111111 and #999999 borders, zero faded text, zero washed-out opacity.
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
    : '';

  return (
    <div
      className={`mkt-print-sheet print-container ${
        orientation === 'landscape' ? 'mkt-landscape' : 'mkt-portrait'
      }`}
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        lineHeight: 1.45,
        padding: '16px 20px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Universal EPI UPS Company Header */}
            <CompanyPrintHeader
              badge="DIGITAL MARKETING & CREATIVE OPERATIONS"
              department="DIGITAL MARKETING & CREATIVE OPERATIONS"
              dateRange={task.dueDate ? `Deadline: ${task.dueDate}` : ''}
            />

            {/* Document Title Banner */}
            <div
              style={{
                border: '1px solid #111111',
                padding: '8px 12px',
                backgroundColor: '#f1f5f9',
                textAlign: 'center',
                margin: '2px 0 6px 0',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                  color: '#000000',
                }}
              >
                INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT
              </h2>
              <div style={{ fontSize: '11px', color: '#111111', fontWeight: 700, marginTop: '2px' }}>
                Official Task Brief, Specifications, Deliverables & Submission Verification
              </div>
            </div>

            {/* Task Information Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11.5px',
                border: '1.5px solid #111111',
                color: '#000000',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, width: '20%', border: '1px solid #111111' }}>
                    Work Order ID:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 900, width: '30%', border: '1px solid #111111', fontFamily: 'monospace', fontSize: '12px' }}>
                    #{task.id}
                  </td>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, width: '20%', border: '1px solid #111111' }}>
                    Execution Status:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 800, width: '30%', border: '1px solid #111111', color: '#000000' }}>
                    {task.status || 'Assigned'} {typeof task.progress === 'number' ? `(${task.progress}%)` : ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, border: '1px solid #111111' }}>
                    Work Category:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 700, border: '1px solid #111111' }}>
                    {task.category || 'General'}
                  </td>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, border: '1px solid #111111' }}>
                    Priority Level:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 800, border: '1px solid #111111', color: task.priority === 'Urgent' ? '#b91c1c' : '#000000' }}>
                    {task.priority || 'Normal'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, border: '1px solid #111111' }}>
                    Assigned Employee:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 800, border: '1px solid #111111' }}>
                    {task.assignedTo || 'Unassigned'}
                  </td>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, border: '1px solid #111111' }}>
                    Assigned By:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 700, border: '1px solid #111111' }}>
                    {task.assignedBy || 'Super Administrator'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, border: '1px solid #111111' }}>
                    Assignment Date:
                  </td>
                  <td style={{ padding: '7px 10px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 700 }}>
                    {task.startDate || '—'}
                  </td>
                  <td style={{ padding: '7px 10px', background: '#e2e8f0', fontWeight: 800, border: '1px solid #111111' }}>
                    Target Deadline:
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 800, border: '1px solid #111111', fontFamily: 'monospace' }}>
                    {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Project Brief & Work Deliverable Scope */}
            <div style={{ border: '1.5px solid #111111', padding: '12px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 6px 0', color: '#000000', borderBottom: '1.5px solid #111111', paddingBottom: '4px' }}>
                Project Brief & Work Deliverable Scope
              </h3>
              <div style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 6px 0', color: '#000000' }}>
                {task.title}
              </div>
              <div style={{ fontSize: '11.5px', color: '#000000', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.5, fontWeight: 500 }}>
                {task.desc || 'No detailed scope outlined for this work order.'}
              </div>
              {task.refInfo && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#111111', fontWeight: 700 }}>
                  <strong>Project / Reference Info:</strong> {task.refInfo}
                </div>
              )}
              {task.instructions && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#111111', fontWeight: 700 }}>
                  <strong>Additional Instructions:</strong> {task.instructions}
                </div>
              )}
              {task.attachment && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#000000', fontWeight: 700 }}>
                  <strong>Attached Brief Link / Document:</strong> {task.attachment}
                </div>
              )}
            </div>

            {/* Employee Completion Report */}
            <div style={{ border: '1.5px solid #111111', padding: '12px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 6px 0', color: '#000000', borderBottom: '1.5px solid #111111', paddingBottom: '4px' }}>
                Employee Completion Report
              </h3>
              <div style={{ fontSize: '11.5px', color: '#000000', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>
                  <strong>Delivery Status:</strong> {task.status === 'Completed' ? 'Verified Completed & Delivered' : 'Work in Progress / Pending Completion'}
                  {task.completedDate && ` (Delivered Date: ${task.completedDate})`}
                </p>
                <p style={{ margin: '0 0 4px 0', fontWeight: 800 }}>
                  Submission Notes & Attached Deliverable Assets:
                </p>
                <div style={{ margin: '0 0 8px 0', color: '#000000', fontWeight: 600, padding: '6px 8px', background: '#f8fafc', border: '1px solid #999999' }}>
                  {task.completionNotes || task.workSummary || task.note || 'No completion notes submitted yet.'}
                </div>
                <div style={{ fontSize: '11px', color: '#000000', fontWeight: 700 }}>
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
          <div style={{ padding: '40px', textAlign: 'center', color: '#000000', fontWeight: 700 }}>
            No work order record selected for printing.
          </div>
        )
      )}

      {/* =================================================================== */}
      {/* 2. DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT                  */}
      {/* =================================================================== */}
      {reportType === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CompanyPrintHeader
            badge="DIGITAL MARKETING ARCHIVE & COMPLIANCE"
            department="DIGITAL MARKETING ARCHIVE & COMPLIANCE"
            dateRange={dateRangeStr}
          />

          <div style={{ border: '1px solid #111111', padding: '8px 12px', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#000000' }}>
              DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT
            </h2>
            <div style={{ fontSize: '11px', color: '#111111', fontWeight: 700, marginTop: '2px' }}>
              Audit Archive of Operational Deliverables ({allTasks.length} matching tasks recorded)
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1.5px solid #111111', color: '#000000' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', color: '#000000' }}>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '55px', fontWeight: 800 }}>ID</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', fontWeight: 800 }}>Work Title & Deliverable Summary</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '100px', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '110px', fontWeight: 800 }}>Assigned To</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '80px', fontWeight: 800 }}>Deadline</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '70px', fontWeight: 800 }}>Priority</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '85px', fontWeight: 800 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center' }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: 800, color: '#000000' }}>{t.title}</div>
                    {t.completionNotes && (
                      <div style={{ fontSize: '10px', color: '#111111', fontStyle: 'italic', marginTop: '2px', fontWeight: 500 }}>
                        Notes: {t.completionNotes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 600 }}>{t.category || 'General'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 700 }}>{t.assignedTo}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 600, textAlign: 'center' }}>{t.dueDate}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 700, textAlign: 'center' }}>{t.priority}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 800, textAlign: 'center' }}>{t.status}</td>
                </tr>
              ))}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CompanyPrintHeader
            badge="DIGITAL OPERATIONS AUDIT & VERIFICATION"
            department="DIGITAL OPERATIONS AUDIT & VERIFICATION"
            dateRange={dateRangeStr}
          />

          <div style={{ border: '1px solid #111111', padding: '8px 12px', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#000000' }}>
              DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT
            </h2>
            <div style={{ fontSize: '11px', color: '#111111', fontWeight: 700, marginTop: '2px' }}>
              Verified Delivered Assets & Output Deliverables ({completedTasks.length} completed tasks)
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1.5px solid #111111', color: '#000000' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', color: '#000000' }}>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '55px', fontWeight: 800 }}>ID</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', fontWeight: 800 }}>Work Title & Deliverables</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '100px', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '110px', fontWeight: 800 }}>Specialist</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '90px', fontWeight: 800 }}>Delivery Date</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', fontWeight: 800 }}>Evidence / Deliverable Details</th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center' }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: 800 }}>{t.title}</div>
                    {t.completionNotes && (
                      <div style={{ fontSize: '10px', color: '#111111', fontStyle: 'italic', marginTop: '2px', fontWeight: 500 }}>
                        Notes: {t.completionNotes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 600 }}>{t.category || 'General'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 700 }}>{t.assignedTo}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 700, textAlign: 'center' }}>
                    {t.completedDate || t.dueDate}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', color: '#000000', fontSize: '10.5px', fontWeight: 600, wordBreak: 'break-word' }}>
                    {t.completionAttachment || t.deliverables || t.attachment || 'Verified Complete'}
                  </td>
                </tr>
              ))}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <CompanyPrintHeader
            badge="DIGITAL MARKETING WORKLOAD & CAPACITY DISPATCH"
            department="DIGITAL MARKETING WORKLOAD & CAPACITY DISPATCH"
            dateRange={dateRangeStr}
          />

          <div style={{ border: '1px solid #111111', padding: '8px 12px', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#000000' }}>
              DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT
            </h2>
            <div style={{ fontSize: '11px', color: '#111111', fontWeight: 700, marginTop: '2px' }}>
              Active Task Queue, Employee Capacity & Deadline Schedule ({assignmentTasks.length} active assignments)
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1.5px solid #111111', color: '#000000' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', color: '#000000' }}>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '55px', fontWeight: 800 }}>ID</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', fontWeight: 800 }}>Work Title & Objectives</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '100px', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '110px', fontWeight: 800 }}>Assigned To</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '80px', fontWeight: 800 }}>Deadline</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '70px', fontWeight: 800 }}>Priority</th>
                <th style={{ padding: '7px 8px', border: '1px solid #111111', width: '75px', fontWeight: 800 }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {assignmentTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 800, textAlign: 'center' }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: 800, color: '#000000' }}>{t.title}</div>
                    {t.desc && (
                      <div style={{ fontSize: '10px', color: '#111111', marginTop: '2px', fontWeight: 500 }}>
                        {t.desc.length > 95 ? `${t.desc.slice(0, 95)}...` : t.desc}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 600 }}>{t.category || 'General'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 700 }}>{t.assignedTo}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontFamily: 'monospace', fontWeight: 600, textAlign: 'center' }}>{t.dueDate}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 700, textAlign: 'center' }}>{t.priority}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #111111', fontWeight: 800, textAlign: 'center' }}>
                    {t.progress || 0}%
                  </td>
                </tr>
              ))}
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
