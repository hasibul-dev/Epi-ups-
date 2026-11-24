import React from 'react';
import { CompanyPrintHeader, PrintSignatures } from '../../../components/CompanyPrintHeader.jsx';
import { today } from '../../sales/utils/helpers.js';

/**
 * Brand-New Corporate White A4 Document Renderer for Digital Marketing
 * Strictly isolated: Pure #FFFFFF canvas, #111111 text, #1F2937 table headers,
 * 1px solid #999999 borders, and 3 official signatories.
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
      {/* 1. INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT                   */}
      {/* =================================================================== */}
      {reportType === 'single' && (
        task ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CompanyPrintHeader
              docNumber={`EPI-MKT-WO-${String(task.id).padStart(5, '0')}`}
              printDate={currentToday}
              department="DIGITAL MARKETING & CREATIVE OPERATIONS"
            />

            <div
              style={{
                border: '1.5px solid #111111',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                textAlign: 'center',
                margin: '4px 0',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                  color: '#111111',
                }}
              >
                INDIVIDUAL WORK ASSIGNMENT & COMPLETION REPORT
              </h2>
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                Formal Task Brief, Technical Deliverable Scope & Verified Submission Audit
              </span>
            </div>

            {/* Task Metadata Grid */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11.5px',
                border: '1px solid #999999',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, width: '20%', border: '1px solid #999999' }}>
                    Work Order ID:
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 800, width: '30%', border: '1px solid #999999', fontFamily: 'monospace' }}>
                    #{task.id}
                  </td>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, width: '20%', border: '1px solid #999999' }}>
                    Current Status:
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, width: '30%', border: '1px solid #999999' }}>
                    {task.status || 'Assigned'} {task.progress ? `(${task.progress}%)` : ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, border: '1px solid #999999' }}>
                    Work Category:
                  </td>
                  <td style={{ padding: '6px 10px', border: '1px solid #999999' }}>
                    {task.category || 'General'}
                  </td>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, border: '1px solid #999999' }}>
                    Execution Priority:
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, border: '1px solid #999999' }}>
                    {task.priority || 'Normal'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, border: '1px solid #999999' }}>
                    Assigned Employee:
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, border: '1px solid #999999' }}>
                    {task.assignedTo || 'Unassigned'}
                  </td>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, border: '1px solid #999999' }}>
                    Assigned By (Supervisor):
                  </td>
                  <td style={{ padding: '6px 10px', border: '1px solid #999999' }}>
                    {task.assignedBy || 'Super Administrator'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, border: '1px solid #999999' }}>
                    Assignment Date:
                  </td>
                  <td style={{ padding: '6px 10px', border: '1px solid #999999', fontFamily: 'monospace' }}>
                    {task.startDate || '—'}
                  </td>
                  <td style={{ padding: '6px 10px', background: '#f1f5f9', fontWeight: 700, border: '1px solid #999999' }}>
                    Target Deadline:
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, border: '1px solid #999999', fontFamily: 'monospace' }}>
                    {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Project Brief & Work Deliverable Scope */}
            <div style={{ border: '1px solid #999999', padding: '12px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px 0', color: '#111111', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                Project Brief & Work Deliverable Scope
              </h3>
              <p style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
                {task.title}
              </p>
              <p style={{ fontSize: '11.5px', color: '#334155', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {task.desc || 'No detailed scope outlined for this work order.'}
              </p>
              {task.refInfo && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569' }}>
                  <strong>Project / Ref Info:</strong> {task.refInfo}
                </div>
              )}
              {task.attachment && (
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#0284c7' }}>
                  <strong>Attached Brief Link / Document:</strong> {task.attachment}
                </div>
              )}
            </div>

            {/* Employee Completion Report */}
            <div style={{ border: '1px solid #999999', padding: '12px', backgroundColor: task.status === 'Completed' ? '#f0fdf4' : '#ffffff' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 6px 0', color: '#111111', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                Employee Completion Report
              </h3>
              <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Status:</strong> {task.status === 'Completed' ? 'Verified Completed & Delivered' : 'Work in Progress / Pending Completion'}
                  {task.completedDate && ` (Delivered on: ${task.completedDate})`}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Submission Notes & Attached Deliverable Assets:</strong>
                </p>
                <p style={{ margin: '0 0 6px 0', fontStyle: task.completionNotes ? 'italic' : 'normal', color: task.completionNotes ? '#0f172a' : '#64748b' }}>
                  {task.completionNotes || task.note || 'No completion notes submitted yet.'}
                </p>
                <div style={{ fontSize: '11px', color: '#334155', marginTop: '6px' }}>
                  <strong>Attached Deliverable Assets:</strong> {task.completionAttachment || task.deliverables || task.attachment || 'None submitted.'}
                </div>
              </div>
            </div>

            <PrintSignatures
              firstTitle="Marketing Executive"
              secondTitle="Lead Digital Strategist"
              thirdTitle="Managing Director / Super Admin"
            />
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
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
            docNumber={`EPI-MKT-HIST-${currentToday.replace(/-/g, '')}`}
            printDate={currentToday}
            department="DIGITAL MARKETING ARCHIVE & COMPLIANCE"
          />

          <div style={{ border: '1.5px solid #111111', padding: '8px 12px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: '#111111' }}>
              DIGITAL MARKETING WORK HISTORY & ARCHIVE REPORT
            </h2>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
              Audit Archive of Digital Operations ({allTasks.length} total tasks recorded)
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #999999' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1f2937' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '55px' }}>ID</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999' }}>Work Title & Deliverable Summary</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '90px' }}>Category</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '100px' }}>Assigned To</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '75px' }}>Deadline</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '65px' }}>Priority</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '80px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 700 }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                    {t.completionNotes && (
                      <div style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic' }}>
                        Notes: {t.completionNotes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999' }}>{t.category || 'General'}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 600 }}>{t.assignedTo}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontFamily: 'monospace' }}>{t.dueDate}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 600 }}>{t.priority}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 700 }}>{t.status}</td>
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
            docNumber={`EPI-MKT-COMP-${currentToday.replace(/-/g, '')}`}
            printDate={currentToday}
            department="DIGITAL OPERATIONS AUDIT & VERIFICATION"
          />

          <div style={{ border: '1.5px solid #111111', padding: '8px 12px', backgroundColor: '#f0fdf4', textAlign: 'center' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: '#166534' }}>
              DIGITAL MARKETING WORK COMPLETION & AUDIT REPORT
            </h2>
            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
              Verified Delivered Assets & Creative Quality Assurance ({completedTasks.length} completed tasks)
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #999999' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1f2937' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '55px' }}>ID</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999' }}>Work Title & Deliverables</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '90px' }}>Category</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '100px' }}>Specialist</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '85px' }}>Delivery Date</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999' }}>Evidence / Output Links</th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 700 }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999' }}>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    {t.completionNotes && (
                      <div style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic' }}>
                        Notes: {t.completionNotes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999' }}>{t.category || 'General'}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 600 }}>{t.assignedTo}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontFamily: 'monospace' }}>
                    {t.completedDate || t.dueDate}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', color: '#0284c7', fontSize: '9.5px' }}>
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
            docNumber={`EPI-MKT-ALLOC-${currentToday.replace(/-/g, '')}`}
            printDate={currentToday}
            department="DIGITAL MARKETING WORKLOAD & CAPACITY DISPATCH"
          />

          <div style={{ border: '1.5px solid #111111', padding: '8px 12px', backgroundColor: '#eff6ff', textAlign: 'center' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: '#1e40af' }}>
              DIGITAL MARKETING WORK ALLOCATION & ASSIGNMENT REPORT
            </h2>
            <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600 }}>
              Active Task Queue, Employee Capacity & Deadline Schedule ({assignmentTasks.length} active assignments)
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #999999' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1f2937' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '55px' }}>ID</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999' }}>Work Title & Objectives</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '90px' }}>Category</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '100px' }}>Assigned To</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '75px' }}>Deadline</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '65px' }}>Priority</th>
                <th style={{ padding: '6px 8px', border: '1px solid #999999', width: '70px' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {assignmentTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontFamily: 'monospace', fontWeight: 700 }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999' }}>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    {t.desc && (
                      <div style={{ fontSize: '9.5px', color: '#475569' }}>
                        {t.desc.length > 90 ? `${t.desc.slice(0, 90)}...` : t.desc}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999' }}>{t.category || 'General'}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 600 }}>{t.assignedTo}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontFamily: 'monospace' }}>{t.dueDate}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 600 }}>{t.priority}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #999999', fontWeight: 700 }}>
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
