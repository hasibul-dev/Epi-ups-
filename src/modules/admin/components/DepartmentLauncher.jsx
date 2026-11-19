import React from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import { Briefcase, Wrench, Landmark, ArrowRight, ShieldCheck, Lock, Share2 } from 'lucide-react';

export default function DepartmentLauncher({ onLaunchDept }) {
  const { user, canAccessDept } = useCentralAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const depts = user?.departments || [];

  return (
    <div className="dept-launcher-page">
      <div className="dept-launcher-hero">
        <h2>Welcome, {user?.name}</h2>
        <p>
          You are signed in to the <strong>EPI Centralized Management System</strong> (User ID: <code>{user?.userId}</code>).
          Select an authorized departmental workspace below to begin your work.
        </p>
      </div>

      <div className="dept-workspaces-container">
        {/* Sales Department Card */}
        {(isSuperAdmin || canAccessDept('sales')) ? (
          <div className="launcher-card card-sales">
            <div className="launcher-card-icon sales-bg">
              <Briefcase size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag tag-sales">Sales Department</span>
                <span className="launcher-access-tag">Authorized</span>
              </div>
              <h3>EPI Sales Department</h3>
              <p>
                Manage client directories, track customer follow-ups, organize daily work tasks, and generate sales activity reports.
              </p>
              <button
                className="btn-launch-action sales-btn"
                onClick={() => onLaunchDept('sales')}
              >
                Launch Sales Workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="launcher-card card-locked">
            <div className="launcher-card-icon locked-bg">
              <Lock size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag">Sales Department</span>
                <span className="launcher-lock-tag">Restricted</span>
              </div>
              <h3>EPI Sales Department</h3>
              <p>You do not have access permission for this department. Please contact your Super Admin if required.</p>
            </div>
          </div>
        )}

        {/* Service Department Card */}
        {(isSuperAdmin || canAccessDept('service')) ? (
          <div className="launcher-card card-service">
            <div className="launcher-card-icon service-bg">
              <Wrench size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag tag-service">Service Department</span>
                <span className="launcher-access-tag">Authorized</span>
              </div>
              <h3>EPI Service Department</h3>
              <p>
                Track maintenance visits, emergency repair orders, scheduled client servicing, warranty status, and service calendar dispatch.
              </p>
              <button
                className="btn-launch-action service-btn"
                onClick={() => onLaunchDept('service')}
              >
                Launch Service Workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="launcher-card card-locked">
            <div className="launcher-card-icon locked-bg">
              <Lock size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag">Service Department</span>
                <span className="launcher-lock-tag">Restricted</span>
              </div>
              <h3>EPI Service Department</h3>
              <p>You do not have access permission for this department. Please contact your Super Admin if required.</p>
            </div>
          </div>
        )}

        {/* Accounts Department Card */}
        {(isSuperAdmin || canAccessDept('accounts')) ? (
          <div className="launcher-card card-accounts">
            <div className="launcher-card-icon accounts-bg">
              <Landmark size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag tag-accounts">Accounts Department</span>
                <span className="launcher-access-tag">Authorized</span>
              </div>
              <h3>EPI Accounts Department</h3>
              <p>
                Manage chart of accounts, double-entry vouchers, sales and purchase invoices, bank accounts, employee payroll, and 15% VAT registers.
              </p>
              <button
                className="btn-launch-action accounts-btn"
                onClick={() => onLaunchDept('accounts')}
              >
                Launch Accounts Workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="launcher-card card-locked">
            <div className="launcher-card-icon locked-bg">
              <Lock size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag">Accounts Department</span>
                <span className="launcher-lock-tag">Restricted</span>
              </div>
              <h3>EPI Accounts Department</h3>
              <p>You do not have access permission for this department. Please contact your Super Admin if required.</p>
            </div>
          </div>
        )}

        {/* Digital Marketing & IT Support Card */}
        {(isSuperAdmin || canAccessDept('marketing')) ? (
          <div className="launcher-card card-marketing" style={{ borderColor: 'rgba(168, 85, 247, 0.35)' }}>
            <div className="launcher-card-icon marketing-bg" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Share2 size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag tag-marketing" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>Digital Marketing & IT</span>
                <span className="launcher-access-tag">Authorized</span>
              </div>
              <h3>Digital Marketing & IT Support</h3>
              <p>
                Social media scheduling, campaign management, ad budgets, media assets, design requests, and internal IT support tickets.
              </p>
              <button
                className="btn-launch-action marketing-btn"
                style={{ background: 'linear-gradient(135deg, #7e22ce, #a855f7)', color: '#fff' }}
                onClick={() => onLaunchDept('marketing')}
              >
                Launch Marketing & IT Workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="launcher-card card-locked">
            <div className="launcher-card-icon locked-bg">
              <Lock size={28} />
            </div>
            <div className="launcher-card-body">
              <div className="launcher-tag-row">
                <span className="launcher-dept-tag">Marketing & IT</span>
                <span className="launcher-lock-tag">Restricted</span>
              </div>
              <h3>Digital Marketing & IT Support</h3>
              <p>You do not have access permission for this department. Please contact your Super Admin if required.</p>
            </div>
          </div>
        )}
      </div>

      <div className="launcher-security-notice">
        <ShieldCheck size={16} />
        <span>
          Department security policy enforced: Sessions are cryptographically signed and checked on every transaction.
        </span>
      </div>
    </div>
  );
}
