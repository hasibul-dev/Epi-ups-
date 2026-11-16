import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CentralAdminDashboard from './components/CentralAdminDashboard.jsx';
import AuditLogsView from './components/AuditLogsView.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function AdminModule({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const p = location.pathname.replace(/^\/admin\/?/, '');
    if (p === 'audit') setActiveTab('audit');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  const handleLaunchDept = (dept) => {
    if (dept === 'sales') navigate('/sales');
    else if (dept === 'service') navigate('/service');
    else if (dept === 'accounts') navigate('/accounts');
  };

  return (
    <div className="admin-module-container" style={{ padding: '20px 24px' }}>
      {/* Admin Sub-navigation header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary-highlight' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeTab === 'dashboard'
                  ? '1px solid rgba(26, 115, 232, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              background:
                activeTab === 'dashboard'
                  ? 'rgba(26, 115, 232, 0.2)'
                  : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'dashboard' ? '#38bdf8' : '#94a3b8',
            }}
          >
            <LayoutDashboard size={15} />
            <span>Control Center & Users</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary-highlight' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeTab === 'audit'
                  ? '1px solid rgba(26, 115, 232, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
              background:
                activeTab === 'audit'
                  ? 'rgba(26, 115, 232, 0.2)'
                  : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'audit' ? '#38bdf8' : '#94a3b8',
            }}
          >
            <ShieldCheck size={15} />
            <span>Audit Trail & Security Logs</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
              }}
            />
            Super Admin Session Active
          </span>
        </div>
      </div>

      {/* Admin Module Body */}
      {activeTab === 'dashboard' && <CentralAdminDashboard onLaunchDept={handleLaunchDept} />}
      {activeTab === 'audit' && <AuditLogsView />}
    </div>
  );
}
