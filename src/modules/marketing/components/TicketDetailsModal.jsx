import React from 'react';
import { useMarketing } from '../context/MarketingContext.jsx';
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
    window.print();
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
            <Headphones size={18} style={{ color: '#c084fc' }} />
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
              <span className={`pill-status pill-${ticket.status.toLowerCase().replace(/\s+/g, '')}`}>
                {ticket.status}
              </span>
              <span className={`pill-status pill-${ticket.priority.toLowerCase()}`}>
                <AlertTriangle size={12} />
                {ticket.priority} Priority
              </span>
              <span className="pill-status pill-normal">
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
          <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
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
