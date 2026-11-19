import React, { useState, useEffect } from 'react';
import { useMarketing } from '../context/MarketingContext.jsx';
import { X, Headphones, Save } from 'lucide-react';
import { today } from '../../sales/utils/helpers.js';

export default function TicketModal() {
  const { ticketModal, closeTicketModal, saveTicket, data } = useMarketing();
  const { open, item } = ticketModal;

  const [formData, setFormData] = useState({
    id: '',
    requestingEmployee: '',
    department: 'Sales Department',
    issueCategory: 'Hardware / PC',
    title: '',
    description: '',
    priority: 'Normal',
    assignedTechnician: 'Md. Al-Amin',
    deviceId: '',
    createdDate: today(),
    createdTime: new Date().toTimeString().slice(0, 5),
    status: 'Open',
    resolutionDetails: '',
    completionDate: '',
    completionTime: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      const nextNum = (data.tickets || []).length + 1;
      setFormData({
        id: `TICK-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`,
        requestingEmployee: '',
        department: 'Sales Department',
        issueCategory: 'Hardware / PC',
        title: '',
        description: '',
        priority: 'Normal',
        assignedTechnician: 'Md. Al-Amin',
        deviceId: '',
        createdDate: today(),
        createdTime: new Date().toTimeString().slice(0, 5),
        status: 'Open',
        resolutionDetails: '',
        completionDate: '',
        completionTime: '',
      });
    }
  }, [item, open, data.tickets]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an issue summary');
      return;
    }
    if (!formData.requestingEmployee.trim()) {
      alert('Please enter requesting employee name');
      return;
    }

    saveTicket(formData);
    closeTicketModal();
  };

  return (
    <div className="mkt-modal-backdrop" onClick={closeTicketModal}>
      <div className="mkt-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="mkt-modal-header">
          <h3>
            <Headphones size={18} style={{ color: '#38bdf8' }} />
            {item ? `Edit IT Support Ticket (${formData.id})` : 'New IT Support Request'}
          </h3>
          <button className="mkt-modal-close" onClick={closeTicketModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mkt-modal-body">
            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Ticket Reference ID</label>
                <input
                  className="mkt-form-input font-mono"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. TICK-2026-007"
                />
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Issue Priority *</label>
                <select
                  className="mkt-form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low (General inquiry / upgrade request)</option>
                  <option value="Normal">Normal (Standard operational issue)</option>
                  <option value="High">High (Impacting single employee work)</option>
                  <option value="Critical">Critical (Office-wide network/server down)</option>
                </select>
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Requesting Employee *</label>
                <input
                  className="mkt-form-input"
                  placeholder="e.g. Md. Rifat Habibullah"
                  value={formData.requestingEmployee}
                  onChange={(e) => setFormData({ ...formData, requestingEmployee: e.target.value })}
                  required
                />
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Employee Department *</label>
                <select
                  className="mkt-form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Sales Department">Sales Department</option>
                  <option value="Service Department">Service Department</option>
                  <option value="Accounts & ERP">Accounts & ERP</option>
                  <option value="Executive Admin">Executive Admin</option>
                  <option value="Digital Marketing & IT">Digital Marketing & IT</option>
                </select>
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Issue Category *</label>
                <select
                  className="mkt-form-select"
                  value={formData.issueCategory}
                  onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                >
                  <option value="Hardware / PC">Hardware / PC (Tower, Laptop, Display, RAM)</option>
                  <option value="Operating System & Software">Operating System & Software (Windows, Office)</option>
                  <option value="Network & Internet">Network & Internet (Wi-Fi, Fiber, Router, LAN)</option>
                  <option value="Email & Account Support">Email & Account Support (Password, Outlook)</option>
                  <option value="Printer & Scanner">Printer & Scanner (Canon Laser, Network Print)</option>
                  <option value="UPS Monitoring & SNMP Software">UPS Monitoring & SNMP Software</option>
                  <option value="Data Backup & Security">Data Backup & Security (Synology NAS, Drive)</option>
                </select>
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Linked Device (Optional)</label>
                <select
                  className="mkt-form-select"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                >
                  <option value="">-- No Specific Hardware --</option>
                  {(data.devices || []).map((d) => (
                    <option key={d.id} value={d.deviceTag}>
                      {d.deviceTag} — {d.brandModel} ({d.assignedTo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Issue Summary / Title *</label>
              <input
                className="mkt-form-input"
                placeholder="Brief summary of the issue (e.g. Sales Laptop Blue Screen BSOD)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="mkt-form-group">
              <label className="mkt-form-label">Detailed Problem Description *</label>
              <textarea
                className="mkt-form-textarea"
                rows={3}
                placeholder="Describe error messages, symptoms, when it started, steps to reproduce..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Assigned IT Technician *</label>
                <select
                  className="mkt-form-select"
                  value={formData.assignedTechnician}
                  onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                >
                  <option value="Md. Al-Amin">Md. Al-Amin (IT Specialist)</option>
                  <option value="Kamrul Hasan">Kamrul Hasan (Network Engineer)</option>
                  <option value="Unassigned">-- Unassigned Queue --</option>
                </select>
              </div>

              <div className="mkt-form-group">
                <label className="mkt-form-label">Ticket Status *</label>
                <select
                  className="mkt-form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Open">Open (Pending Diagnosis)</option>
                  <option value="In Progress">In Progress (Work Underway)</option>
                  <option value="Pending Vendor">Pending Vendor / Spare Parts</option>
                  <option value="Resolved">Resolved (Fixed & Tested)</option>
                  <option value="Closed">Closed (Completed & Verified)</option>
                </select>
              </div>
            </div>

            <div className="mkt-form-row">
              <div className="mkt-form-group">
                <label className="mkt-form-label">Created Date</label>
                <input
                  type="date"
                  className="mkt-form-input"
                  value={formData.createdDate}
                  onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                />
              </div>
              <div className="mkt-form-group">
                <label className="mkt-form-label">Created Time</label>
                <input
                  type="time"
                  className="mkt-form-input"
                  value={formData.createdTime}
                  onChange={(e) => setFormData({ ...formData, createdTime: e.target.value })}
                />
              </div>
            </div>

            {/* Resolution Details (Visible when In Progress / Resolved / Closed) */}
            <div className="mkt-form-group">
              <label className="mkt-form-label">Technician Resolution Details & Findings</label>
              <textarea
                className="mkt-form-textarea"
                rows={3}
                placeholder="Diagnostic root cause, replaced cables/parts, software reinstall, settings configured..."
                value={formData.resolutionDetails}
                onChange={(e) => setFormData({ ...formData, resolutionDetails: e.target.value })}
              />
            </div>

            {['Resolved', 'Closed'].includes(formData.status) && (
              <div className="mkt-form-row">
                <div className="mkt-form-group">
                  <label className="mkt-form-label">Completion Date</label>
                  <input
                    type="date"
                    className="mkt-form-input"
                    value={formData.completionDate || today()}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  />
                </div>
                <div className="mkt-form-group">
                  <label className="mkt-form-label">Completion Time</label>
                  <input
                    type="time"
                    className="mkt-form-input"
                    value={formData.completionTime || '12:00'}
                    onChange={(e) => setFormData({ ...formData, completionTime: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mkt-modal-footer">
            <button type="button" className="btn-mkt-secondary" onClick={closeTicketModal}>
              Cancel
            </button>
            <button type="submit" className="btn-mkt-primary">
              <Save size={14} />
              <span>{item ? 'Save Ticket Changes' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
