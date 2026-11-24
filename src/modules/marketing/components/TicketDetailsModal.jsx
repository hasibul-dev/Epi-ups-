import React from 'react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { printHtmlDocument } from '../../../services/reportExport.js';
import {
  X,
  Printer,
  Edit2,
  CheckCircle2,
  Headphones,
  User,
  Building,
  Tag,
  AlertTriangle,
  Clock,
  Laptop,
  Check,
} from 'lucide-react';
import { today } from '../../sales/utils/helpers.js';

export default function TicketDetailsModal() {
  const { ticketDetails, closeTicketDetails, openTicketModal, resolveTicket } = useMarketing();
  const { open, item: ticket } = ticketDetails;

  if (!open || !ticket) return null;

  const handlePrintSlip = () => {
    const esc = (s) => (s === null || s === undefined ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>IT Service Slip - ${esc(ticket.id)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Kalpurush", "SolaimanLipi", Arial, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
    .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand h2 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; }
    .brand p { margin: 3px 0 0; font-size: 10px; color: #475569; }
    .ticket-meta { text-align: right; }
    .ticket-badge { font-size: 15px; font-weight: 800; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5px; }
    td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
    td.lbl { font-weight: 700; background: #f8fafc; color: #334155; width: 22%; }
    .box { border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 14px; border-radius: 4px; }
    .box-title { font-weight: 700; font-size: 11px; margin-bottom: 4px; color: #0f172a; }
    .box-content { font-size: 11px; color: #334155; min-height: 40px; white-space: pre-wrap; }
    .signatures { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 10px; }
    .sig-col { width: 28%; text-align: center; border-top: 1px solid #000; padding-top: 6px; font-size: 10px; font-weight: 600; color: #334155; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 8.5px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h2>EPI UPS BANGLADESH LIMITED</h2>
      <div style="font-size: 11px; font-weight: 700; color: #4338ca; margin-top: 2px;">IT SUPPORT &amp; INFRASTRUCTURE SERVICES</div>
      <p>Corporate Headquarters: House # 03, Road # 15, Sector # 03, Uttara, Dhaka-1230 | Hotline: +88 01778-249416</p>
    </div>
    <div class="ticket-meta">
      <div class="ticket-badge">IT SERVICE SLIP</div>
      <div style="font-size: 12px; font-weight: 700; color: #1e293b;">${esc(ticket.id)}</div>
      <div style="font-size: 10px; color: #64748b;">Logged: ${esc(ticket.createdDate || ticket.createdAt)}</div>
    </div>
  </div>

  <table>
    <tbody>
      <tr>
        <td class="lbl">Requesting User:</td>
        <td style="width: 28%">${esc(ticket.requestingEmployee)}</td>
        <td class="lbl">Department:</td>
        <td style="width: 28%">${esc(ticket.department)}</td>
      </tr>
      <tr>
        <td class="lbl">Issue Category:</td>
        <td>${esc(ticket.issueCategory)}</td>
        <td class="lbl">Priority Level:</td>
        <td><strong>${esc(ticket.priority)}</strong></td>
      </tr>
      <tr>
        <td class="lbl">Device / Asset:</td>
        <td>${esc(ticket.deviceId || 'Office Infrastructure')}</td>
        <td class="lbl">Assigned Technician:</td>
        <td><strong>${esc(ticket.assignedTechnician)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="box">
    <div class="box-title">Problem Description &amp; User Request:</div>
    <div class="box-content">${esc(ticket.description)}</div>
  </div>

  <div class="box">
    <div class="box-title">Technician Action Taken &amp; Resolution Summary:</div>
    <div class="box-content">${esc(ticket.resolutionDetails || 'Hardware inspected, diagnosed, and repaired in accordance with EPI IT standards.')}</div>
    ${ticket.completionDate ? `<div style="font-size: 10px; margin-top: 8px; color: #059669; font-weight: 600;">Resolved on: ${esc(ticket.completionDate)} ${esc(ticket.completionTime || '')}</div>` : ''}
  </div>

  <div class="signatures">
    <div class="sig-col">Employee Acceptance Signature</div>
    <div class="sig-col">IT Technician Signature</div>
    <div class="sig-col">Department Head Authorization</div>
  </div>

  <div class="footer">
    <div>EPI UPS Bangladesh Limited · IT Support Helpdesk · Official Service Slip</div>
    <div>Date Printed: ${new Date().toLocaleDateString('en-GB')}</div>
  </div>
</body>
</html>`;

    printHtmlDocument(html, `IT-Service-Slip-${ticket.id}`);
  };

  const handleQuickResolve = () => {
    const notes = prompt('Enter resolution summary / action taken:', ticket.resolutionDetails || 'Hardware serviced and tested successfully.');
    if (notes !== null) {
      resolveTicket(ticket.id, notes);
      closeTicketDetails();
    }
  };

  const isResolved = ['Resolved', 'Closed'].includes(ticket.status);

  return (
    <div className="mkt-modal-backdrop" onClick={closeTicketDetails}>
      <div className="mkt-modal-dialog" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="mkt-modal-header">
          <h3>
            <Headphones size={18} style={{ color: '#38bdf8' }} />
            <span>IT Support Ticket: {ticket.id}</span>
          </h3>
          <button className="mkt-modal-close" onClick={closeTicketDetails}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mkt-modal-body">
          {/* Top Status & Priority Badge Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`mkt-badge ${
                ticket.status === 'Resolved' || ticket.status === 'Closed'
                  ? 'mkt-badge-green'
                  : ticket.status === 'In Progress'
                  ? 'mkt-badge-amber'
                  : 'mkt-badge-blue'
              }`}>
                {ticket.status}
              </span>
              <span className={`mkt-badge ${
                ticket.priority === 'Critical'
                  ? 'mkt-badge-red'
                  : ticket.priority === 'High'
                  ? 'mkt-badge-amber'
                  : 'mkt-badge-blue'
              }`}>
                <AlertTriangle size={12} />
                {ticket.priority} Priority
              </span>
              <span className="mkt-badge mkt-badge-neutral">
                <Tag size={12} />
                {ticket.issueCategory}
              </span>
            </div>

            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              Logged: {ticket.createdDate} at {ticket.createdTime}
            </div>
          </div>

          {/* Ticket Title & Description Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 10, padding: 14 }}>
            <h4 style={{ margin: '0 0 6px', fontSize: 15, color: '#fff' }}>{ticket.title}</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </p>
          </div>

          {/* Requesting Employee & Technician Information Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Requesting Employee
              </span>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} style={{ color: '#38bdf8' }} />
                {ticket.requestingEmployee}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={13} />
                {ticket.department}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 8, padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Assigned IT Technician
              </span>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Headphones size={14} />
                {ticket.assignedTechnician}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                {ticket.deviceId ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Laptop size={13} /> Hardware Tag: <strong>{ticket.deviceId}</strong>
                  </span>
                ) : (
                  'No specific hardware tag linked'
                )}
              </div>
            </div>
          </div>

          {/* Technical Resolution Log */}
          <div style={{ background: 'rgba(26, 115, 232, 0.08)', border: '1px solid rgba(26, 115, 232, 0.25)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                Resolution Findings & Technician Notes
              </span>
              {ticket.completionDate && (
                <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                  <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Completed: {ticket.completionDate} {ticket.completionTime}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {ticket.resolutionDetails || 'No resolution notes recorded yet. Technician diagnosis in progress.'}
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="mkt-modal-footer">
          <button
            type="button"
            className="btn-mkt-secondary"
            onClick={handlePrintSlip}
            title="Print Official IT Service Slip"
          >
            <Printer size={14} />
            <span>Print Job Slip</span>
          </button>

          <button
            type="button"
            className="btn-mkt-secondary"
            onClick={() => {
              closeTicketDetails();
              openTicketModal(ticket);
            }}
          >
            <Edit2 size={14} />
            <span>Edit Ticket</span>
          </button>

          {!isResolved && (
            <button
              type="button"
              className="btn-mkt-primary"
              onClick={handleQuickResolve}
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
            >
              <Check size={14} />
              <span>Mark Resolved</span>
            </button>
          )}

          <button type="button" className="btn-mkt-secondary" onClick={closeTicketDetails}>
            Close
          </button>
        </div>

        {/* Hidden Printable IT Service Slip (Triggered by window.print()) */}
        <div className="printable-slip">
          <div style={{ borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>EPI UPS BANGLADESH LIMITED</h2>
              <div style={{ fontSize: 12, color: '#333' }}>IT SUPPORT & TECHNICAL SERVICES DEPARTMENT</div>
              <div style={{ fontSize: 10, color: '#666' }}>Corporate Headquarters: Mirpur, Dhaka-1216 | Hotline: +88 01778-249416</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#000' }}>IT SERVICE SLIP</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{ticket.id}</div>
              <div style={{ fontSize: 10, color: '#555' }}>Date: {ticket.createdDate}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 15, fontSize: 11 }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 6, width: '25%', fontWeight: 700 }}>Requesting Employee:</td>
                <td style={{ border: '1px solid #ccc', padding: 6, width: '25%' }}>{ticket.requestingEmployee}</td>
                <td style={{ border: '1px solid #ccc', padding: 6, width: '25%', fontWeight: 700 }}>Department:</td>
                <td style={{ border: '1px solid #ccc', padding: 6, width: '25%' }}>{ticket.department}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 6, fontWeight: 700 }}>Issue Category:</td>
                <td style={{ border: '1px solid #ccc', padding: 6 }}>{ticket.issueCategory}</td>
                <td style={{ border: '1px solid #ccc', padding: 6, fontWeight: 700 }}>Priority Level:</td>
                <td style={{ border: '1px solid #ccc', padding: 6 }}>{ticket.priority}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 6, fontWeight: 700 }}>Device Tag:</td>
                <td style={{ border: '1px solid #ccc', padding: 6 }}>{ticket.deviceId || 'Office Infrastructure'}</td>
                <td style={{ border: '1px solid #ccc', padding: 6, fontWeight: 700 }}>Assigned Technician:</td>
                <td style={{ border: '1px solid #ccc', padding: 6 }}>{ticket.assignedTechnician}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 15 }}>
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>Problem Description:</div>
            <div style={{ fontSize: 11, color: '#222', minHeight: 40 }}>{ticket.description}</div>
          </div>

          <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>Technician Action Taken & Resolution Details:</div>
            <div style={{ fontSize: 11, color: '#222', minHeight: 50 }}>
              {ticket.resolutionDetails || 'Hardware inspected, diagnosed, and repaired in accordance with EPI IT standards.'}
            </div>
            {ticket.completionDate && (
              <div style={{ fontSize: 10, marginTop: 8, fontStyle: 'italic', color: '#444' }}>
                Completed on: {ticket.completionDate} at {ticket.completionTime || '12:00'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 20 }}>
            <div style={{ textAlign: 'center', width: 200, borderTop: '1px solid #000', paddingTop: 6, fontSize: 11 }}>
              Employee Acceptance Signature
            </div>
            <div style={{ textAlign: 'center', width: 200, borderTop: '1px solid #000', paddingTop: 6, fontSize: 11 }}>
              IT Technician Signature
            </div>
            <div style={{ textAlign: 'center', width: 200, borderTop: '1px solid #000', paddingTop: 6, fontSize: 11 }}>
              Department Head Authorization
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
