import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router-dom';
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
  LogIn,
  LogOut,
  Clock,
} from 'lucide-react';

export default function SalesModule({ initialPage = 'dashboard' }) {
  const store = useDb();
  const { db } = store;
  const { user } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [printNode, setPrintNode] = useState(null);
  const location = useLocation();

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

  const navButtons = [
    { key: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { key: 'client', label: 'Add Client', icon: UserPlus, highlight: true },
    { key: 'work', label: 'Add Work', icon: CalendarPlus, highlight: true },
    { key: 'today', label: "Today's Work", icon: CheckSquare, count: todayDueCount },
    { key: 'clients', label: 'Clients Master', icon: Users, count: totalClients },
    { key: 'dailySummary', label: 'Daily Summary', icon: ClipboardList },
    { key: 'reports', label: 'Activity Reports', icon: FileText },
    { key: 'editData', label: 'Edit Work Data', icon: Edit3 },
  ];

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
                onClick={() => setPage(btn.key)}
                className={`btn ${active ? 'btn-primary-highlight' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
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
                <Icon size={14} />
                <span>{btn.label}</span>
                {btn.count > 0 && (
                  <span
                    style={{
                      background: btn.key === 'today' ? '#e5192d' : 'rgba(56, 189, 248, 0.2)',
                      color: '#fff',
                      padding: '1px 6px',
                      borderRadius: 10,
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    {btn.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Attendance & Backup Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={store.officeIn}
            className="btn btn-secondary"
            title="Mark Office Check-IN for today"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#34d399',
              cursor: 'pointer',
            }}
          >
            <LogIn size={13} />
            <span>Office IN</span>
          </button>

          <button
            type="button"
            onClick={store.officeOut}
            className="btn btn-secondary"
            title="Mark Office Check-OUT for today"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#f87171',
              cursor: 'pointer',
            }}
          >
            <LogOut size={13} />
            <span>Office OUT</span>
          </button>

          <button
            type="button"
            onClick={() => store.downloadBackup()}
            className="btn btn-secondary"
            title="Download JSON Database Backup of Sales records"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Download size={13} />
            <span>Export Backup</span>
          </button>

          <label
            className="btn btn-secondary"
            title="Import JSON Database Backup of Sales records"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#94a3b8',
              cursor: 'pointer',
              margin: 0,
            }}
          >
            <Upload size={13} />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                  store.importBackup(evt.target.result);
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
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
