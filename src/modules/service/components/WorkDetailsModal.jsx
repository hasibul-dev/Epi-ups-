import React from 'react'
import Modal from './Modal.jsx'
import { StatusBadge, PriorityBadge } from './Badges.jsx'
import { clientTitle, clientContact, clientProduct, status } from '../services/domain.js'
import { fmt, TODAY } from '../services/dates.js'
import {
  Printer,
  Edit2,
  CheckCircle2,
  RotateCcw,
  Clock,
  User,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Briefcase,
  Zap,
  Wrench,
  Settings2,
  ClipboardList,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function WorkDetailsModal({ work, onClose, onEdit, onComplete, onReopen }) {
  const { s } = useApp()
  if (!work) return null

  const getClientInfo = () => {
    if (work.clientName || work.clientCompany) {
      const title =
        work.clientCompany && work.clientName && work.clientCompany !== work.clientName
          ? `${work.clientCompany} (${work.clientName})`
          : work.clientCompany || work.clientName
      return {
        title,
        contact: work.clientName,
        company: work.clientCompany,
        phone: work.clientPhone,
        address: work.clientAddress,
        product: '',
        isManual: true,
      }
    }
    if (work.clientId) {
      const c = s.clients.find((x) => x.id === work.clientId)
      if (c) {
        return {
          title: clientTitle(c),
          contact: clientContact(c),
          company: c.company,
          phone: c.phone,
          address: c.address,
          product: clientProduct(c),
          serial: c.serial,
          isManual: false,
        }
      }
    }
    return { title: 'No Client Linked', contact: '', phone: '', address: '', product: '', isManual: false }
  }

  const client = getClientInfo()
  const st = status(work)
  const isDone = work.status === 'done'

  const printWorkOrder = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to print work order')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Work Order - ${work.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0052cc;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
            color: #0052cc;
            letter-spacing: -0.02em;
          }
          .header p {
            margin: 3px 0 0;
            font-size: 11px;
            color: #555;
          }
          .ticket-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 8px;
          }
          .section {
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
          }
          .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: #0052cc;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
          }
          .field {
            font-size: 12px;
          }
          .field strong {
            color: #334155;
            display: inline-block;
            min-width: 110px;
          }
          .scope-box {
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            padding: 10px;
            border-radius: 4px;
            font-size: 12.5px;
            margin-top: 4px;
            white-space: pre-wrap;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 48px;
            padding-top: 20px;
          }
          .sig-box {
            border-top: 1px solid #000;
            text-align: center;
            font-size: 11.5px;
            padding-top: 6px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EPI UPS (BANGLADESH) LIMITED</h1>
          <p>Technical Service & Maintenance Center · Hotline: 01711-000000</p>
          <div class="ticket-badge">SERVICE WORK ORDER / JOB SHEET</div>
        </div>

        <div class="section">
          <div class="section-title">1. Work Order Information</div>
          <div class="grid">
            <div class="field"><strong>Work Order ID:</strong> WO-${(work.id || '').slice(-6).toUpperCase()}</div>
            <div class="field"><strong>Status:</strong> ${work.status === 'done' ? 'COMPLETED' : 'PENDING / SCHEDULED'}</div>
            <div class="field"><strong>Category:</strong> ${work.category}</div>
            <div class="field"><strong>Priority:</strong> ${work.priority || 'Normal'}</div>
            <div class="field"><strong>Scheduled Date:</strong> ${fmt(work.date)} at ${work.time || '10:00'}</div>
            <div class="field"><strong>Technician:</strong> ${work.engineer || 'Unassigned'}</div>
            ${work.doneAt ? `<div class="field"><strong>Completed Date:</strong> ${fmt(work.doneAt)}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Client & Equipment Information</div>
          <div class="grid">
            <div class="field"><strong>Client / Company:</strong> ${client.title}</div>
            <div class="field"><strong>Contact Person:</strong> ${client.contact || '—'}</div>
            <div class="field"><strong>Phone:</strong> ${client.phone || '—'}</div>
            <div class="field"><strong>Address:</strong> ${client.address || '—'}</div>
            ${client.product ? `<div class="field"><strong>Equipment:</strong> ${client.product}</div>` : ''}
            ${client.serial ? `<div class="field"><strong>Serial Number:</strong> ${client.serial}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. Work Scope & Tasks</div>
          <div style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">${work.title}</div>
          <div class="scope-box">${work.desc || 'Routine inspection, servicing and diagnostic testing.'}</div>
        </div>

        ${work.notes ? `
          <div class="section">
            <div class="section-title">4. Findings, Replaced Parts & Remarks</div>
            <div class="scope-box">${work.notes}</div>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sig-box">
            Customer / Client Representative Signature & Stamp
          </div>
          <div class="sig-box">
            Assigned Service Engineer Signature
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Modal title={`Work Order Details: ${work.title}`} onClose={onClose} wide>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Status & Category Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: 10,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              WO-{(work.id || '').slice(-6).toUpperCase()}
            </span>
            <span className="bd b">{work.category}</span>
            <PriorityBadge priority={work.priority} />
            <StatusBadge w={work} />
            {work.auto && <span className="bd b">Auto 3M Reminder</span>}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn s sm"
              onClick={printWorkOrder}
              title="Print professional single-page Work Order / Job Sheet"
            >
              <Printer size={13} /> Print Job Sheet
            </button>
            <button
              type="button"
              className="btn s sm"
              onClick={() => {
                onClose()
                if (onEdit) onEdit(work)
              }}
              title="Edit this work order"
            >
              <Edit2 size={13} /> Edit
            </button>
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="fg">
          {/* Client Details */}
          <div className="form-section" style={{ margin: 0 }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={13} /> Client Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
              <div>
                <b style={{ color: '#fff', fontSize: 13.5 }}>{client.title}</b>
              </div>
              {client.contact && (
                <div style={{ color: 'var(--text-secondary)' }}>
                  Contact: {client.contact}
                </div>
              )}
              {client.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <Phone size={12} /> {client.phone}
                </div>
              )}
              {client.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: 'var(--text-muted)' }}>
                  <MapPin size={12} style={{ marginTop: 2, flexShrink: 0 }} /> {client.address}
                </div>
              )}
              {client.product && (
                <div style={{ marginTop: 4, padding: '4px 8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 6 }}>
                  Product: <b>{client.product}</b> {client.serial ? `· SN: ${client.serial}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Assignment Details */}
          <div className="form-section" style={{ margin: 0 }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} /> Schedule &amp; Technician
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} style={{ color: 'var(--epi-blue-light)' }} />
                <span>Scheduled Date: <b style={{ color: '#fff' }}>{fmt(work.date)}</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} style={{ color: 'var(--epi-blue-light)' }} />
                <span>Time: <b style={{ color: '#fff' }}>{work.time || '10:00'}</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} style={{ color: 'var(--accent-emerald)' }} />
                <span>Technician: <b style={{ color: '#fff' }}>{work.engineer || 'Unassigned'}</b></span>
              </div>
              {work.doneAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399' }}>
                  <CheckCircle2 size={13} />
                  <span>Completed on: <b>{fmt(work.doneAt)}</b></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description & Scope */}
        <div className="form-section" style={{ margin: 0 }}>
          <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={13} /> Work Scope &amp; Tasks
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            {work.title}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {work.desc || 'Routine inspection, servicing and maintenance.'}
          </div>
        </div>

        {/* Notes & Parts Used */}
        {work.notes && (
          <div className="form-section" style={{ margin: 0 }}>
            <div className="form-section-title">
              Findings, Parts Replaced &amp; Remarks
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {work.notes}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 10 }}>
          <div>
            {isDone ? (
              <button
                type="button"
                className="btn s sm"
                onClick={() => {
                  if (onReopen) onReopen(work)
                  onClose()
                }}
              >
                <RotateCcw size={13} /> Reopen Task
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary-highlight sm"
                onClick={() => {
                  if (onComplete) onComplete(work)
                  onClose()
                }}
              >
                <CheckCircle2 size={13} /> Mark as Completed
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn s sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
