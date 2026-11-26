import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import useDb from './hooks/useDb.js';
import { today, clockTime } from './utils/helpers.js';
import Dashboard from './components/Dashboard.jsx';
import AddClient from './components/AddClient.jsx';
import AddWork from './components/AddWork.jsx';
import TodayWork from './components/TodayWork.jsx';
import EditWorkData from './components/EditWorkData.jsx';
import WorkSummary from './components/WorkSummary.jsx';
import Reports from './components/Reports.jsx';
import ClientsMaster from './components/ClientsMaster.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Download,
  Upload,
  Briefcase,
  UserPlus,
  CalendarPlus,
  CheckSquare,
  Users,
  ClipboardList,
  FileText,
  Edit3,
  Clock,
} from 'lucide-react';

export default function SalesModule({ initialPage = 'dashboard' }) {
  const { user } = useAuth();
  const store = useDb(user);
  const { db } = store;
  const [page, setPage] = useState(initialPage);
  const [printNode, setPrintNode] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync sub-routes from URL pathname
  useEffect(() => {
    const p = location.pathname.replace(/^\/sales\/?/, '');
    const routeMap = {
      '': 'dashboard',
      'dashboard': 'dashboard',
      'clients': 'clients',
      'clients-master': 'clients',
      'schedule': 'today',
      'today': 'today',
      'summary': 'dailySummary',
      'daily-summary': 'dailySummary',
      'reports': 'reports',
      'history': 'reports',
      'edit': 'editData',
      'edit-data': 'editData',
      'new-client': 'client',
      'new-work': 'work',
    };
    if (routeMap[p] !== undefined) {
      setPage(routeMap[p]);
    }
  }, [location.pathname]);

  // Synchronous print handler
  const print = (node) => {
    flushSync(() => setPrintNode(node));
    window.print();
  };

  // Real-time counter for today's pending follow-ups & activities
  const tDate = today();
  const todayDueCount =
    (db?.clients?.filter((c) => c.nextDate && c.nextDate <= tDate)?.length || 0) +
    (db?.work?.filter((w) => w.date === tDate && w.status === 'Pending')?.length || 0);

  const totalClients = (db?.clients || []).length;

  // Essential top shortcut navigation for Sales Dashboard
  const navButtons = [
    { key: 'dashboard', label: 'Dashboard', icon: Briefcase, path: '/sales' },
    { key: 'today', label: "Today's Work", icon: CheckSquare, count: todayDueCount, path: '/sales/today' },
    { key: 'client', label: 'Add Client', icon: UserPlus, highlight: true, path: '/sales/new-client' },
    { key: 'work', label: 'Add Work', icon: CalendarPlus, highlight: true, path: '/sales/new-work' },
  ];

  const handleNavClick = (btn) => {
    setPage(btn.key);
    if (btn.path) {
      navigate(btn.path);
    }
  };

  return (
    <div className="sales-module-root" style={{ padding: '20px 24px' }}>
      {/* Sales Sub-Header Quick Navigation Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            const active = page === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => handleNavClick(btn)}
                className={`btn ${active ? 'btn-primary-highlight' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 650,
                  minHeight: 38,
                  cursor: 'pointer',
                  border: active
                    ? '1px solid rgba(26, 115, 232, 0.45)'
                    : btn.highlight
                    ? '1px solid rgba(56, 189, 248, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: active
                    ? 'rgba(26, 115, 232, 0.22)'
                    : btn.highlight
                    ? 'rgba(56, 189, 248, 0.08)'
                    : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#38bdf8' : btn.highlight ? '#e0f2fe' : '#94a3b8',
                }}
              >
                <Icon size={15} />
                <span>{btn.label}</span>
                {btn.count > 0 && (
                  <span
                    style={{
                      background: btn.key === 'today' ? '#e5192d' : 'rgba(56, 189, 248, 0.2)',
                      color: '#fff',
                      padding: '2px 7px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {btn.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Scope / Admin Data Filter */}
        {store.isAdmin ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <Users size={14} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Viewing User:</span>
            <select
              value={store.selectedUserFilter}
              onChange={(e) => store.setSelectedUserFilter(e.target.value)}
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
              title="Admin Sales User Data Filter"
            >
              <option value="all">All Sales Users ({db?.clients?.length || 0} clients)</option>
              {store.salesUsers?.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name || u.userId} ({u.userId})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 12,
              color: '#94a3b8',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span>
              Private Workspace: <strong style={{ color: '#f8fafc' }}>{user?.name || user?.userId}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Page Rendering with 100% Genuine Data & Event Handlers */}
      <div className="sales-content-body">
        {store.loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <div
              className="spinner"
              style={{
                width: 32,
                height: 32,
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                margin: '0 auto 12px',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <b>Loading CRM data from persistent storage...</b>
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard db={db} setPage={setPage} />}
            {page === 'client' && <AddClient onSave={store.addClient} setPage={setPage} />}
            {page === 'work' && <AddWork onSave={store.addWork} />}
            {page === 'today' && <TodayWork store={store} setPage={setPage} />}
            {page === 'clients' && <ClientsMaster db={db} store={store} setPage={setPage} onPrint={print} />}
            {page === 'dailySummary' && <WorkSummary db={db} onPrint={print} />}
            {page === 'reports' && <Reports db={db} store={store} onPrint={print} />}
            {page === 'editData' && <EditWorkData store={store} />}
          </>
        )}
      </div>

      {/* Dedicated Print Mount for Official Letterhead Reports */}
      <div id="printArea" className="print-only">
        {printNode}
      </div>
    </div>
  );
}
