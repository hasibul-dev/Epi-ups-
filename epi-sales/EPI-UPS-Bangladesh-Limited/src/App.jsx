import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import useDb from './hooks/useDb.js';
import { today } from './utils/helpers.js';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import CentralSSOGate from './components/CentralSSOGate.jsx';
import Dashboard from './components/Dashboard.jsx';
import AddClient from './components/AddClient.jsx';
import AddWork from './components/AddWork.jsx';
import TodayWork from './components/TodayWork.jsx';
import EditWorkData from './components/EditWorkData.jsx';
import WorkSummary from './components/WorkSummary.jsx';
import Reports from './components/Reports.jsx';
import ClientsMaster from './components/ClientsMaster.jsx';
import { Database, Download } from 'lucide-react';

export default function App() {
  const store = useDb();
  const { db } = store;
  const [page, setPage] = useState('dashboard');
  const [printNode, setPrintNode] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Central User Profile state
  const [centralUser, setCentralUser] = useState(() => {
    try {
      const saved = localStorage.getItem('epi_central_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Authentication check
  const [isUnlocked, setIsUnlocked] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sso_ticket')) return true;

    const remember = localStorage.getItem('epi_ups_auth_remember') === 'true';
    const unlocked = remember
      ? localStorage.getItem('epi_ups_auth_unlocked') === 'true'
      : sessionStorage.getItem('epi_ups_auth_unlocked') === 'true';
    return Boolean(unlocked);
  });

  const CENTRAL_URL = import.meta.env.VITE_CENTRAL_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5050' : 'https://epi-central-admin.vercel.app');

  // Central Management Single Sign-On (SSO) listener & ticket exchange
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoTicket = params.get('sso_ticket');
    if (ssoTicket) {
      // Direct client-side ticket resolution for browser-local persistence
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(ssoTicket))));
        if (decoded && decoded.user) {
          const u = decoded.user;
          const hasAccess = u.role === 'superadmin' || (Array.isArray(u.departments) && u.departments.includes('sales'));
          if (hasAccess) {
            localStorage.setItem('epi_ups_auth_remember', 'true');
            localStorage.setItem('epi_ups_auth_unlocked', 'true');
            localStorage.setItem('epi_ups_auth_token', 'sales-sso-' + Date.now());
            localStorage.setItem('epi_ups_username', u.userId || u.name);
            localStorage.setItem('epi_central_user', JSON.stringify(u));
            setCentralUser(u);
            setIsUnlocked(true);
            setPermissionDenied(false);
            store.refreshDb();
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          } else {
            setCentralUser(u);
            setPermissionDenied(true);
            setIsUnlocked(false);
            return;
          }
        }
      } catch (_) {}

      fetch(`${CENTRAL_URL}/api/auth/sso-exchange?ticket=${encodeURIComponent(ssoTicket)}&dept=sales`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem('epi_ups_auth_remember', 'true');
            localStorage.setItem('epi_ups_auth_unlocked', 'true');
            localStorage.setItem('epi_ups_auth_token', data.token);
            localStorage.setItem('epi_ups_username', data.user.userId || data.user.name);
            localStorage.setItem('epi_central_user', JSON.stringify(data.user));
            setCentralUser(data.user);
            setIsUnlocked(true);
            setPermissionDenied(false);
            store.refreshDb();
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setPermissionDenied(true);
            setIsUnlocked(false);
          }
        })
        .catch((err) => {
          console.warn('[Sales SSO] Ticket exchange note:', err.message);
        });
    }

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'EPI_CENTRAL_SSO_INIT' && e.data.token) {
        localStorage.setItem('epi_ups_auth_remember', 'true');
        localStorage.setItem('epi_ups_auth_unlocked', 'true');
        localStorage.setItem('epi_ups_auth_token', e.data.token);
        localStorage.setItem('epi_ups_username', e.data.user?.userId || e.data.user?.name || 'Sales User');
        if (e.data.user) {
          localStorage.setItem('epi_central_user', JSON.stringify(e.data.user));
          setCentralUser(e.data.user);
        }
        setIsUnlocked(true);
        setPermissionDenied(false);
        store.refreshDb();
      }
    };
    window.addEventListener('message', handleMessage);

    // Cross-tab Central Logout Listener
    const handleStorageChange = (e) => {
      if ((e.key === 'epi_central_token' && !e.newValue) || (e.key === 'epi_ups_auth_unlocked' && !e.newValue)) {
        setIsUnlocked(false);
        setCentralUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Centralized Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('epi_ups_auth_unlocked');
    sessionStorage.removeItem('epi_ups_auth_unlocked');
    localStorage.removeItem('epi_ups_auth_token');
    sessionStorage.removeItem('epi_ups_auth_token');
    localStorage.removeItem('epi_central_user');
    localStorage.removeItem('epi_central_token');
    window.location.href = `${CENTRAL_URL}?logout=1`;
  };

  // Render the print layout into #printArea, then open the print dialog
  const print = (node) => {
    flushSync(() => setPrintNode(node));
    window.print();
  };

  // Real-time counter for today's pending follow-ups & activities
  const tDate = today();
  const todayDueCount =
    (db?.clients?.filter((c) => c.nextDate && c.nextDate <= tDate)?.length || 0) +
    (db?.work?.filter((w) => w.date === tDate && w.status === 'Pending')?.length || 0);

  // Department Permission check
  const isSuper = centralUser?.role === 'superadmin';
  const hasSalesDept = isSuper || (centralUser?.departments && centralUser.departments.includes('sales'));

  if (!isUnlocked) {
    return <CentralSSOGate user={centralUser} permissionDenied={permissionDenied} />;
  }

  if (centralUser && !hasSalesDept) {
    return <CentralSSOGate user={centralUser} permissionDenied={true} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        page={page}
        setPage={(p) => {
          setPage(p);
          setMobileOpen(false);
        }}
        db={db}
        user={centralUser}
        onSignOut={handleSignOut}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <div className="main-viewport">
        <TopBar
          page={page}
          setPage={setPage}
          todayDueCount={todayDueCount}
          onToggleSidebar={() => setMobileOpen((prev) => !prev)}
          user={centralUser}
          onSignOut={handleSignOut}
        />

        <main className="main-content">
          {store.loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
              <div className="dot-pulse" style={{ margin: '0 auto 14px' }}></div>
              <b>Loading CRM data from local storage...</b>
            </div>
          ) : (
            <>
              {page === 'dashboard' && (
                <Dashboard
                  db={db}
                  setPage={setPage}
                />
              )}
              {page === 'client' && <AddClient onSave={store.addClient} setPage={setPage} />}
              {page === 'work' && <AddWork onSave={store.addWork} />}
              {page === 'today' && <TodayWork store={store} setPage={setPage} />}
              {page === 'clients' && <ClientsMaster db={db} store={store} setPage={setPage} onPrint={print} />}
              {page === 'reports' && <Reports db={db} store={store} onPrint={print} />}
              {page === 'editData' && <EditWorkData store={store} />}
              {page === 'dailySummary' && <WorkSummary db={db} onPrint={print} />}
            </>
          )}
        </main>

        <footer className="app-footer">
          <div className="app-footer-content">
            <div className="app-footer-brand">
              <span className="footer-company">EPI UPS Bangladesh Limited</span>
              <span className="footer-dot">•</span>
              <span className="footer-desc">CRM &amp; BD Assistant</span>
            </div>

            <div className="app-footer-system" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="footer-system-label">Storage:</span>
              <div
                className="footer-db-status connected"
                title="EPI Sales operates with high-performance local persistent storage (IndexedDB + LocalStorage sync)"
                style={{ cursor: 'default' }}
              >
                <span className="status-beacon beacon-live" />
                <Database size={13} strokeWidth={2.2} />
                <span className="footer-db-text">Local Storage</span>
                <span className="footer-db-pill">Active</span>
              </div>
              <button
                type="button"
                onClick={store.exportJson}
                className="sidebar-action-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(0, 82, 204, 0.15)',
                  border: '1px solid rgba(0, 82, 204, 0.35)',
                  color: '#38bdf8',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                title="Download full JSON backup of client and activity records"
              >
                <Download size={12} strokeWidth={2.2} />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      <div id="printArea" className="print-only">{printNode}</div>
    </div>
  );
}
