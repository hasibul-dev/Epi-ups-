import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, UserCheck, KeyRound, Sparkles, Copy, Check, AlertCircle, Shield, Briefcase, Wrench, Landmark, Share2 } from 'lucide-react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';

export default function UserManagementModal({ userToEdit, onClose, onSaved }) {
  const { token } = useCentralAuth();
  const isEditing = !!userToEdit;

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState('active');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUserId(userToEdit.userId || '');
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setRole(userToEdit.role || 'employee');
      setDepartments(userToEdit.departments || []);
      setStatus(userToEdit.status || 'active');
      setPassword('');
      setChangePassword(false);
    } else {
      setUserId('');
      setName('');
      setEmail('');
      setRole('employee');
      setDepartments(['sales']); // Default suggestion
      setStatus('active');
      setChangePassword(true);
      generateStrongPassword();
    }
  }, [userToEdit]);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 14; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setCopied(false);
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDept = (dept) => {
    setDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const applyPreset = (preset) => {
    switch (preset) {
      case 'service':
        setDepartments(['service']);
        break;
      case 'sales':
        setDepartments(['sales']);
        break;
      case 'accounts':
        setDepartments(['accounts']);
        break;
      case 'marketing':
        setDepartments(['marketing']);
        break;
      case 'sales_service':
        setDepartments(['sales', 'service']);
        break;
      case 'sales_accounts':
        setDepartments(['sales', 'accounts']);
        break;
      case 'all':
        setDepartments(['sales', 'service', 'accounts', 'marketing']);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Please provide a User ID.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide the employee name.');
      return;
    }
    if (!isEditing && (!password || password.length < 8)) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (isEditing && changePassword && (!password || password.length < 8)) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const url = isEditing
        ? `/api/admin/users/${userToEdit.id}`
        : '/api/admin/users';
      
      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        userId: userId.trim(),
        name: name.trim(),
        email: email.trim(),
        role,
        departments,
        status,
      };

      if (!isEditing) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save user account.');
      }

      // If editing and password reset requested
      if (isEditing && changePassword && password) {
        const passRes = await fetch(`/api/admin/users/${userToEdit.id}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: password }),
        });
        const passData = await passRes.json();
        if (!passRes.ok || !passData.success) {
          throw new Error(passData.error || 'User updated, but failed to reset password.');
        }
      }

      onSaved(data.user, (!isEditing || changePassword) ? password : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed.');
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            {isEditing ? (
              <UserCheck size={22} className="modal-header-icon" />
            ) : (
              <UserPlus size={22} className="modal-header-icon" />
            )}
            <div>
              <h3>{isEditing ? 'Edit Employee Account' : 'Add New Employee Account'}</h3>
              <p>Configure departmental permissions and login access credentials</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="login-alert-danger" style={{ margin: '14px 20px 0' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-row-2">
            <div className="form-group-field">
              <label className="form-label">
                User ID <span className="req">*</span>
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. EMP-101 or rifathabibullah"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={isEditing || submitting}
              />
              <span className="field-hint">Used by the employee to log in.</span>
            </div>

            <div className="form-group-field">
              <label className="form-label">
                Employee Full Name <span className="req">*</span>
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Md. Rifat Habibullah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group-field">
              <label className="form-label">Official Email (Optional)</label>
              <input
                type="email"
                className="text-input"
                placeholder="e.g. employee@epiups.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group-field">
              <label className="form-label">
                <Shield size={14} /> System Role & Designation
              </label>
              <select
                className="text-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={submitting || (isEditing && userToEdit.role === 'superadmin')}
              >
                <option value="employee">Standard Employee</option>
                <option value="manager">Department Manager</option>
                <option value="marketing_manager">Digital Marketing Manager</option>
                <option value="marketing_executive">Digital Marketing Executive</option>
                <option value="it_manager">IT Support Manager</option>
                <option value="it_technician">IT Support Technician</option>
                <option value="engineer">Service Engineer</option>
                <option value="accountant">Accounts / Accountant</option>
                <option value="superadmin">Super Administrator (Full System Access)</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#38bdf8' }}>
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (e.target.checked && !password) generateStrongPassword();
                  }}
                />
                <span>Change / Set New Password for this employee</span>
              </label>
            </div>
          )}

          {(!isEditing || changePassword) && (
            <div className="form-group-field">
              <div className="field-header-split">
                <label className="form-label">
                  <KeyRound size={14} /> {isEditing ? 'New Password' : 'Temporary Password'} <span className="req">*</span>
                </label>
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={generateStrongPassword}
                >
                  <Sparkles size={13} /> Auto-Generate Strong Password
                </button>
              </div>
              <div className="input-with-action">
                <input
                  type="text"
                  className="text-input font-mono"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditing || changePassword}
                  disabled={submitting}
                />
                {password && (
                  <button
                    type="button"
                    className="input-inline-btn"
                    onClick={copyPassword}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <span className="field-hint">
                Password will be cryptographically hashed using standard bcrypt before saving.
              </span>
            </div>
          )}

          {/* Department Access Configuration */}
          <div className="form-group-field">
            <div className="field-header-split">
              <label className="form-label">
                <Shield size={14} /> Assigned Department Permissions
              </label>
              <div className="preset-pill-group">
                <span className="preset-label">Presets:</span>
                <button type="button" className="btn-preset-pill" onClick={() => applyPreset('sales')}>Sales</button>
                <button type="button" className="btn-preset-pill" onClick={() => applyPreset('service')}>Service</button>
                <button type="button" className="btn-preset-pill" onClick={() => applyPreset('accounts')}>Accounts</button>
                <button type="button" className="btn-preset-pill" onClick={() => applyPreset('marketing')}>Marketing & IT</button>
                <button type="button" className="btn-preset-pill" onClick={() => applyPreset('sales_service')}>Sales+Service</button>
                <button type="button" className="btn-preset-pill" onClick={() => applyPreset('all')}>All 4</button>
              </div>
            </div>

            <div className="dept-checkbox-cards-grid">
              {/* Sales Department Card */}
              <label className={`dept-card-select ${departments.includes('sales') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={departments.includes('sales')}
                  onChange={() => toggleDept('sales')}
                />
                <div className="dept-card-icon dept-icon-sales">
                  <Briefcase size={20} />
                </div>
                <div className="dept-card-info">
                  <strong>EPI Sales Department</strong>
                  <span>Clients, work logs, follow-ups & reports</span>
                </div>
              </label>

              {/* Service Department Card */}
              <label className={`dept-card-select ${departments.includes('service') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={departments.includes('service')}
                  onChange={() => toggleDept('service')}
                />
                <div className="dept-card-icon dept-icon-service">
                  <Wrench size={20} />
                </div>
                <div className="dept-card-info">
                  <strong>EPI Service Department</strong>
                  <span>Maintenance, repairs, warranty & dispatch</span>
                </div>
              </label>

              {/* Accounts Department Card */}
              <label className={`dept-card-select ${departments.includes('accounts') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={departments.includes('accounts')}
                  onChange={() => toggleDept('accounts')}
                />
                <div className="dept-card-icon dept-icon-accounts">
                  <Landmark size={20} />
                </div>
                <div className="dept-card-info">
                  <strong>EPI Accounts Department</strong>
                  <span>Ledgers, invoices, payroll, banking & VAT</span>
                </div>
              </label>

              {/* Digital Marketing & IT Support Card */}
              <label className={`dept-card-select ${departments.includes('marketing') ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={departments.includes('marketing')}
                  onChange={() => toggleDept('marketing')}
                />
                <div className="dept-card-icon dept-icon-marketing" style={{ color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)' }}>
                  <Share2 size={20} />
                </div>
                <div className="dept-card-info">
                  <strong>Digital Marketing & IT Support</strong>
                  <span>Campaigns, social media, IT tickets & devices</span>
                </div>
              </label>
            </div>
            {departments.length === 0 && (
              <span className="field-hint text-amber">
                Warning: Without department permissions, the employee will not be able to access any departmental workspace.
              </span>
            )}
          </div>

          {/* Account Status */}
          <div className="form-group-field">
            <label className="form-label">Account Status</label>
            <div className="status-toggle-options">
              <label className={`status-option ${status === 'active' ? 'active-status' : ''}`}>
                <input
                  type="radio"
                  name="userStatus"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                <span>Active (Employee can sign in)</span>
              </label>
              <label className={`status-option ${status === 'inactive' ? 'inactive-status' : ''}`}>
                <input
                  type="radio"
                  name="userStatus"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                />
                <span>Inactive (Login and active sessions revoked)</span>
              </label>
            </div>
          </div>

          <div className="modal-actions-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Employee Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
