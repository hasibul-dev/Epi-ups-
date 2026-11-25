import React, { useState, useEffect, useCallback } from 'react';
import { useCentralAuth } from '../context/CentralAuthContext.jsx';
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Wrench,
  Landmark,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Clock,
  Download,
  Upload,
  Activity,
  HardDrive,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { centralStore } from '../services/centralStorage.js';
import {
  PageHeader,
  StatCard,
  EnterpriseCard,
  StatusBadge,
  ActionButton,
} from '../../../components/EnterpriseUI.jsx';

export default function ExecutiveDashboard({ onLaunchDept, onNavigateUsers }) {
  const { token, user: currentUser } = useCentralAuth();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    serviceUsers: 0,
    salesUsers: 0,
    accountsUsers: 0,
    marketingUsers: 0,
    recentLogins: [],
    recentActivities: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertNotice, setAlertNotice] = useState(null);

  // Fetch Dashboard Stats
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data.stats);
      }
    } catch (err) {
      console.error('[ExecutiveDashboard] Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="central-admin-content executive-dashboard-page" style={{ padding: '0 4px' }}>
      {/* Alert Notice Toast */}
      {alertNotice && (
        <div className={`alert-toast alert-${alertNotice.type}`} style={{ marginBottom: 16 }}>
          <span>{alertNotice.msg}</span>
          <button className="alert-toast-close" onClick={() => setAlertNotice(null)}>
            ×
          </button>
        </div>
      )}

      {/* Modern Enterprise Page Header */}
      <PageHeader
        badge="Executive Command Root"
        badgeColor="blue"
        title="Executive Operations & Systems Command"
        subtitle={`Welcome, ${
          currentUser?.name || 'Administrator'
        }. Real-time enterprise telemetry, cross-department access enforcement, and security audits for EPI UPS Bangladesh Limited.`}
        actions={
          <>
            <ActionButton
              variant="secondary"
              icon={RefreshCw}
              size="md"
              onClick={loadData}
              disabled={refreshing}
              title="Refresh real-time statistics"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </ActionButton>

            {onNavigateUsers && (
              <ActionButton
                variant="primary"
                icon={Users}
                size="md"
                onClick={onNavigateUsers}
                title="Manage corporate staff and permissions"
              >
                User Management
              </ActionButton>
            )}
          </>
        }
      />

      {/* 1. Primary KPI Metric Cards (7 Modern Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          title="Total Staff"
          value={stats.totalEmployees}
          subtitle="Registered users"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Accounts"
          value={stats.activeEmployees}
          subtitle="Authorized & ready"
          icon={UserCheck}
          color="green"
          trend="100% Active"
          trendType="up"
        />
        <StatCard
          title="Inactive Accounts"
          value={stats.inactiveEmployees}
          subtitle="Deactivated access"
          icon={UserX}
          color="red"
        />
        <StatCard
          title="Sales Team"
          value={stats.salesUsers}
          subtitle="CRM & pipeline"
          icon={Briefcase}
          color="blue"
          onClick={() => onLaunchDept('sales')}
        />
        <StatCard
          title="Service Team"
          value={stats.serviceUsers}
          subtitle="Field technicians"
          icon={Wrench}
          color="cyan"
          onClick={() => onLaunchDept('service')}
        />
        <StatCard
          title="Accounts & ERP"
          value={stats.accountsUsers}
          subtitle="Finance & billing"
          icon={Landmark}
          color="amber"
          onClick={() => onLaunchDept('accounts')}
        />
        <StatCard
          title="Marketing & IT"
          value={stats.marketingUsers || 0}
          subtitle="Growth & helpdesk"
          icon={Share2}
          color="purple"
          onClick={() => onLaunchDept('marketing')}
        />
      </div>

      {/* 2. System Status & Security Assurance Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.22)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}
          >
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>
              Encrypted Local Storage Vault
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Zero cloud database dependency. All local stores synchronized.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>
              Role-Based Access Control
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Bcrypt salted password encryption with strict departmental route guards.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.22)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(168, 85, 247, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
            }}
          >
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>
              All 4 Operational Departments
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Sales, Service, Accounts ERP, and Marketing & IT live.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Department Workspace Operations Launchpad */}
      <EnterpriseCard
        title="Department Operations Launchpad"
        subtitle="Direct single-click executive entry into operational departmental workspaces"
        icon={Sparkles}
        badge="4 Live Systems"
        className="mb-6"
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {/* Sales Workspace Card */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(0, 82, 204, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.24)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Briefcase size={18} />
                </div>
                <StatusBadge status="active" label="Active CRM" variant="info" size="sm" />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 750, color: '#ffffff', marginBottom: 4 }}>
                EPI Sales Department
              </h4>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 14 }}>
                Customer database, pending work orders, follow-up schedules, quotation preparation, and
                daily sales activities.
              </p>
            </div>
            <ActionButton
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onLaunchDept('sales')}
            >
              Open Sales Workspace
            </ActionButton>
          </div>

          {/* Service Workspace Card */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.24)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Wrench size={18} />
                </div>
                <StatusBadge status="active" label="Active Service Hub" variant="success" size="sm" />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 750, color: '#ffffff', marginBottom: 4 }}>
                EPI Service Department
              </h4>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 14 }}>
                Equipment servicing, preventive maintenance, repair work orders, warranty tracking,
                and calendar dispatch.
              </p>
            </div>
            <ActionButton
              variant="secondary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onLaunchDept('service')}
              style={{
                borderColor: 'rgba(52, 211, 153, 0.4)',
                color: '#6ee7b7',
              }}
            >
              Open Service Workspace
            </ActionButton>
          </div>

          {/* Accounts & ERP Workspace Card */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.24)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Landmark size={18} />
                </div>
                <StatusBadge status="active" label="Active Financials" variant="warning" size="sm" />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 750, color: '#ffffff', marginBottom: 4 }}>
                EPI Accounts & ERP
              </h4>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 14 }}>
                General ledger, double-entry vouchers, sales & purchase invoices, banking, payroll,
                and 15% Mushak VAT reports.
              </p>
            </div>
            <ActionButton
              variant="secondary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onLaunchDept('accounts')}
              style={{
                borderColor: 'rgba(251, 191, 36, 0.4)',
                color: '#fde68a',
              }}
            >
              Open Accounts Workspace
            </ActionButton>
          </div>

          {/* Digital Marketing & IT Support Workspace Card */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(192, 132, 252, 0.24)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Share2 size={18} />
                </div>
                <StatusBadge status="active" label="Active Digital Hub" variant="purple" size="sm" />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 750, color: '#ffffff', marginBottom: 4 }}>
                Digital Marketing & IT Support
              </h4>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 14 }}>
                Social media campaigns, advertisement tracking, editorial calendar, asset library, and
                internal IT support tickets.
              </p>
            </div>
            <ActionButton
              variant="purple"
              size="sm"
              icon={ArrowRight}
              onClick={() => onLaunchDept('marketing')}
            >
              Open Marketing & IT
            </ActionButton>
          </div>
        </div>
      </EnterpriseCard>

      {/* 4. Two-Column Telemetry: Recent User Logins & Recent Audit Activities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Recent User Logins Card */}
        <EnterpriseCard
          title="Recent User Logins"
          subtitle="Real-time login session audit across all departments"
          icon={Clock}
          badge={`${stats.recentLogins?.length || 0} Sessions`}
        >
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {!stats.recentLogins || stats.recentLogins.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                No login sessions recorded yet.
              </div>
            ) : (
              stats.recentLogins.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 12px',
                    borderRadius: 8,
                    marginBottom: 6,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {entry.name ? entry.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 12.5, color: '#f1f5f9' }}>
                        {entry.name || 'Unknown User'}
                      </strong>
                      <span style={{ fontSize: 11, color: '#64748b' }}>({entry.userId})</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 11,
                        color: '#94a3b8',
                        marginTop: 2,
                      }}
                    >
                      <span>
                        <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span>· IP: {entry.ip || 'Local Browser'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </EnterpriseCard>

        {/* Recent System Audit Activities Card */}
        <EnterpriseCard
          title="Recent System Activities"
          subtitle="Administrative changes, security events, and audit trail"
          icon={Activity}
          badge={`${stats.recentActivities?.length || 0} Events`}
        >
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {!stats.recentActivities || stats.recentActivities.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                No recent activity recorded yet.
              </div>
            ) : (
              stats.recentActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    marginBottom: 6,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <ShieldCheck size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <StatusBadge status={act.action} size="sm" />
                      <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                        by{' '}
                        <strong style={{ color: '#cbd5e1' }}>
                          {act.performedBy || act.userName || 'System'}
                        </strong>
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#e2e8f0', margin: '4px 0 2px' }}>
                      {act.details}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 11,
                        color: '#64748b',
                      }}
                    >
                      <span>{new Date(act.timestamp || act.at || Date.now()).toLocaleString()}</span>
                      {act.targetUserId && <span>· Target: @{act.targetUserId}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </EnterpriseCard>
      </div>

      {/* 5. User Management Quick Access Callout */}
      {onNavigateUsers && (
        <div
          style={{
            padding: '18px 22px',
            borderRadius: 14,
            background:
              'linear-gradient(135deg, rgba(0, 82, 204, 0.16) 0%, rgba(26, 115, 232, 0.06) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 750, color: '#ffffff', margin: 0 }}>
                Corporate Staff & Permission Governance
              </h4>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                Create employee accounts, modify departmental authorizations, reset passwords, and
                deactivate staff.
              </p>
            </div>
          </div>
          <ActionButton
            variant="primary"
            icon={ArrowRight}
            size="md"
            onClick={onNavigateUsers}
          >
            Open User Management
          </ActionButton>
        </div>
      )}
    </div>
  );
}
