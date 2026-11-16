import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import useDb from './hooks/useDb.js';
import { today } from './utils/helpers.js';
import Dashboard from './components/Dashboard.jsx';
import AddClient from './components/AddClient.jsx';
import AddWork from './components/AddWork.jsx';
import TodayWork from './components/TodayWork.jsx';
import EditWorkData from './components/EditWorkData.jsx';
import WorkSummary from './components/WorkSummary.jsx';
import Reports from './components/Reports.jsx';
import ClientsMaster from './components/ClientsMaster.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Download, RefreshCw, Briefcase, Plus, Users, CalendarCheck, ClipboardList, FileText } from 'lucide-react';

export default function SalesModule({ initialPage = 'dashboard' }) {
  const store = useDb();
  const { db } = store;
  const { user } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [printNode, setPrintNode] = useState(null);

  useEffect(() => {
    if (initialPage) {
      setPage(initialPage);
    }
  }, [initialPage]);

  // Synchronize print container if printNode is updated
  useEffect(() => {
    const el = document.getElementById('print-mount');
    if (!el) return;
    if (printNode) {
      el.replaceChildren(printNode);
      window.print();
      setPrintNode(null);
    }
  }, [printNode]);

  const navButtons = [
    { key: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { key: 'today', label: "Today's Work", icon: CalendarCheck },
    { key: 'workSummary', label: 'Work Summary', icon: ClipboardList },
    { key: 'clientsMaster', label: 'Clients Master', icon: Users },
    { key: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="sales-module-root" style={{ padding: '20px 24px' }}>
      {/* Sales Sub-Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            const active = page === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setPage(btn.key)}
                className={`btn ${active ? 'btn-primary-highlight' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '1px solid rgba(26, 115, 232, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: active ? 'rgba(26, 115, 232, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: active ? '#38bdf8' : '#94a3b8',
                }}
              >
                <Icon size={15} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => store.downloadBackup()}
            className="btn btn-secondary"
            title="Download JSON Database Backup"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              fontSize: 12.5,
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {/* Main Page Rendering */}
      <div className="sales-content-body">
        {page === 'dashboard' && <Dashboard store={store} setPage={setPage} />}
        {page === 'clients' && <AddClient store={store} setPage={setPage} />}
        {page === 'addWork' && <AddWork store={store} setPage={setPage} />}
        {page === 'today' && <TodayWork store={store} setPage={setPage} />}
        {page === 'edit' && <EditWorkData store={store} setPage={setPage} />}
        {page === 'workSummary' && <WorkSummary store={store} setPage={setPage} />}
        {page === 'reports' && (
          <Reports
            store={store}
            onPrint={(node) => {
              flushSync(() => {
                setPrintNode(node);
              });
            }}
          />
        )}
        {page === 'clientsMaster' && <ClientsMaster store={store} setPage={setPage} />}
      </div>

      <div id="print-mount" style={{ display: 'none' }} />
    </div>
  );
}

