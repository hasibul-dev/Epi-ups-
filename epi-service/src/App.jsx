import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { fmt, TODAY } from './services/dates.js'
import { isOverdue, isUpcomingSoon, clientType, warr } from './services/domain.js'
import Dashboard from './pages/Dashboard.jsx'
import TodayWork from './pages/TodayWork.jsx'
import UpcomingWork from './pages/UpcomingWork.jsx'
import Clients from './pages/Clients.jsx'
import SectorWorkPage from './pages/SectorWorkPage.jsx'
import Warranty from './pages/Warranty.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import NewWork from './pages/NewWork.jsx'
import History from './pages/History.jsx'
import Report from './pages/Report.jsx'
import Settings from './pages/Settings.jsx'

import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  Briefcase,
  Wrench,
  Settings2,
  Zap,
  ClipboardList,
  ShieldCheck,
  Calendar,
  PlusCircle,
  History as HistoryIcon,
  FileText,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Clock,
  User,
  ShieldAlert
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'OVERVIEW' },
  { key: 'today', label: 'Today Work', icon: CalendarCheck, badgeType: 'today', section: 'SCHEDULE & TASKS' },
  { key: 'upcoming', label: 'Upcoming Work', icon: CalendarClock, badgeType: 'upcoming', section: 'SCHEDULE & TASKS' },
  { key: 'calendar', label: 'Schedule / Calendar', icon: Calendar, section: 'SCHEDULE & TASKS' },
  { key: 'clients', label: 'Sales Clients', icon: Briefcase, badgeType: 'salesCount', section: 'CLIENTS & SECTORS' },
  { key: 'servicing', label: 'Servicing Clients', icon: Wrench, badgeType: 'servicingCount', section: 'CLIENTS & SECTORS' },
  { key: 'maintenance', label: 'Maintenance Clients', icon: Settings2, badgeType: 'maintenanceCount', section: 'CLIENTS & SECTORS' },
  { key: 'installation', label: 'Installation Sector', icon: Zap, badgeType: 'installationCount', section: 'CLIENTS & SECTORS' },
  { key: 'general', label: 'General Work', icon: ClipboardList, badgeType: 'generalCount', section: 'CLIENTS & SECTORS' },
  { key: 'warranty', label: 'Warranty Tracking', icon: ShieldCheck, badgeType: 'expiringCount', section: 'OPERATIONS & REPORTS' },
  { key: 'new', label: 'Add Work Order', icon: PlusCircle, section: 'OPERATIONS & REPORTS' },
  { key: 'history', label: 'Work History', icon: HistoryIcon, section: 'OPERATIONS & REPORTS' },
  { key: 'srep', label: 'Schedule & Reports', icon: FileText, section: 'OPERATIONS & REPORTS' },
  { key: 'settings', label: 'Settings', icon: Sliders, section: 'SYSTEM' },
]

function Shell() {
  const [page, setPage] = useState('dashboard')
  const [open, setOpen] = useState(false)
  const [reportPreset, setReportPreset] = useState({ clientId: '', reportType: '' })
  
  const [serviceUser, setServiceUser] = useState(() => {
    try {
      const u = localStorage.getItem('epi_service_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const [ssoAuthorized, setSsoAuthorized] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('sso_ticket')) return true
    return Boolean(localStorage.getItem('epi_service_auth_token'))
  })
  const [authError, setAuthError] = useState('')
  const { s } = useApp()
  const CENTRAL_URL = import.meta.env.VITE_CENTRAL_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5050' : 'https://epi-central-admin.vercel.app')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ssoTicket = params.get('sso_ticket')
    if (ssoTicket) {
      // Direct client-side ticket resolution for browser-local persistence
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(ssoTicket))))
        if (decoded && decoded.user) {
          const u = decoded.user
          const hasAccess = u.role === 'superadmin' || (Array.isArray(u.departments) && u.departments.includes('service'))
          if (hasAccess) {
            localStorage.setItem('epi_service_auth_token', 'service-sso-' + Date.now())
            localStorage.setItem('epi_service_user', JSON.stringify(u))
            setServiceUser(u)
            setSsoAuthorized(true)
            setAuthError('')
            window.history.replaceState({}, document.title, window.location.pathname)
            return
          } else {
            setSsoAuthorized(false)
            setAuthError('Access Denied: Service department permission required.')
            return
          }
        }
      } catch (_) {}

      fetch(`${CENTRAL_URL}/api/auth/sso-exchange?ticket=${encodeURIComponent(ssoTicket)}&dept=service`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem('epi_service_auth_token', data.token)
            localStorage.setItem('epi_service_user', JSON.stringify(data.user))
            setServiceUser(data.user)
            setSsoAuthorized(true)
            setAuthError('')
            window.history.replaceState({}, document.title, window.location.pathname)
          } else {
            setSsoAuthorized(false)
            setAuthError(data.error || 'Access Denied: Service department permission required.')
          }
        })
        .catch(() => setSsoAuthorized(true))
    }

    // Cross-tab Central Logout Listener
    const handleStorageChange = (e) => {
      if ((e.key === 'epi_central_token' && !e.newValue) || (e.key === 'epi_service_auth_token' && !e.newValue)) {
        setSsoAuthorized(false)
        setServiceUser(null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('epi_service_auth_token')
    localStorage.removeItem('epi_service_user')
    window.location.href = `${CENTRAL_URL}?logout=1`
  }

  const getInitials = (name) => {
    if (!name) return 'SV'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  if (!ssoAuthorized) {
    if (authError) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#050811', color: '#fff', padding: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(14,22,38,0.9), rgba(10,16,28,0.85))', border: '1px solid rgba(229,25,45,0.4)', borderRadius: 20, padding: 36, maxWidth: 480, textAlign: 'center', boxShadow: '0 20px 48px rgba(0,0,0,0.6)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(229,25,45,0.15)', border: '1px solid rgba(229,25,45,0.3)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#ff2a3b' }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}>Access Restricted</h2>
            <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.5, marginBottom: 24 }}>{authError}</p>
            <a href={CENTRAL_URL} className="btn btn-primary-highlight" style={{ textDecoration: 'none', padding: '10px 24px' }}>
              Return to Central Portal
            </a>
          </div>
        </div>
      )
    }

    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#050811', color: '#fff', padding: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(14,22,38,0.9), rgba(10,16,28,0.85))', border: '1px solid rgba(26,115,232,0.35)', borderRadius: 20, padding: 40, maxWidth: 480, textAlign: 'center', boxShadow: '0 20px 48px rgba(0,0,0,0.6)' }}>
          <div className="logo-badge" style={{ width: 56, height: 56, margin: '0 auto 16px' }}>
            <img src="/logo.png" alt="EPI Logo" style={{ width: 34, height: 34 }} />
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>EPI Service Department</h2>
          <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.5, marginBottom: 24 }}>
            Unified Single Sign-On (SSO) Authentication Required. Please sign in via the EPI Central Management Portal.
          </p>
          <a href={CENTRAL_URL} className="btn btn-primary-highlight" style={{ textDecoration: 'none', padding: '11px 24px', fontSize: 14 }}>
            Sign In via Central Portal →
          </a>
        </div>
      </div>
    )
  }

  const T = TODAY()
  const todayPendingCount = s.works.filter(
    (w) => (w.date === T && w.status === 'pending') || isOverdue(w)
  ).length
  const upcomingPendingCount = s.works.filter((w) => isUpcomingSoon(w, 2)).length

  const salesClientsCount = s.clients.filter((c) => clientType(c) === 'Sales').length
  const servicingClientsCount = s.clients.filter((c) => clientType(c) === 'Servicing').length
  const maintenanceClientsCount = s.clients.filter((c) => clientType(c) === 'Maintenance').length
  const installationWorksCount = s.works.filter((w) => w.category === 'Installation').length
  const generalWorksCount = s.works.filter((w) => w.category === 'General').length
  const expiringCount = s.clients.filter((c) => clientType(c) === 'Sales' && warr(c).active && warr(c).left <= 30).length

  const getBadgeFor = (type) => {
    switch (type) {
      case 'today':
        return todayPendingCount > 0 ? (
          <span className="nav-count-badge nav-count-alert">{todayPendingCount}</span>
        ) : null
      case 'upcoming':
        return upcomingPendingCount > 0 ? (
          <span className="nav-count-badge nav-count-info">{upcomingPendingCount}</span>
        ) : null
      case 'salesCount':
        return salesClientsCount > 0 ? (
          <span className="nav-count-badge nav-count-muted">{salesClientsCount}</span>
        ) : null
      case 'servicingCount':
        return servicingClientsCount > 0 ? (
          <span className="nav-count-badge nav-count-muted">{servicingClientsCount}</span>
        ) : null
      case 'maintenanceCount':
        return maintenanceClientsCount > 0 ? (
          <span className="nav-count-badge nav-count-muted">{maintenanceClientsCount}</span>
        ) : null
      case 'installationCount':
        return installationWorksCount > 0 ? (
          <span className="nav-count-badge nav-count-muted">{installationWorksCount}</span>
        ) : null
      case 'generalCount':
        return generalWorksCount > 0 ? (
          <span className="nav-count-badge nav-count-muted">{generalWorksCount}</span>
        ) : null
      case 'expiringCount':
        return expiringCount > 0 ? (
          <span className="nav-count-badge nav-count-alert">{expiringCount}</span>
        ) : null
      default:
        return null
    }
  }

  const go = (nextPage) => {
    setReportPreset({ clientId: '', reportType: '' })
    setPage(nextPage)
    setOpen(false)
  }

  const openClientReport = (clientIdOrCategory, category = 'Sales') => {
    if (
      typeof clientIdOrCategory === 'string' &&
      ['Sales', 'Servicing', 'Maintenance', 'Installation', 'General'].includes(clientIdOrCategory)
    ) {
      const map = {
        Sales: 'sales',
        Servicing: 'servicing',
        Maintenance: 'maintenance',
        Installation: 'installation',
        General: 'general',
      }
      setReportPreset({ clientId: '', reportType: map[clientIdOrCategory] || '' })
      setPage('srep')
      setOpen(false)
      return
    }

    const map = {
      Sales: 'sales',
      Servicing: 'servicing',
      Maintenance: 'maintenance',
      Installation: 'installation',
      General: 'general',
    }
    setReportPreset({ clientId: clientIdOrCategory, reportType: map[category] || 'sales' })
    setPage('srep')
    setOpen(false)
  }

  const pages = {
    dashboard: <Dashboard go={go} />,
    today: <TodayWork />,
    upcoming: <UpcomingWork />,
    clients: <Clients category="Sales" onPrintClient={openClientReport} />,
    servicing: <Clients category="Servicing" onPrintClient={openClientReport} />,
    maintenance: <Clients category="Maintenance" onPrintClient={openClientReport} />,
    installation: <SectorWorkPage category="Installation" onPrintReport={openClientReport} />,
    general: <SectorWorkPage category="General" onPrintReport={openClientReport} />,
    warranty: <Warranty />,
    calendar: <CalendarPage />,
    new: <NewWork />,
    history: <History onPrintClient={openClientReport} />,
    srep: (
      <Report
        preselectClientId={reportPreset.clientId}
        preselectReport={reportPreset.reportType}
      />
    ),
    settings: <Settings />,
  }

  const currentNav = NAV_ITEMS.find((n) => n.key === page)
  const title = currentNav ? currentNav.label : 'Dashboard'

  // Group nav items by section
  let lastSection = null

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={'side' + (open ? ' open' : '')}>
        <div className="logo" onClick={() => go('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-badge">
            <img src="/logo.png" alt="EPI Logo" />
          </div>
          <div className="logo-text-block">
            <h2>EPI UPS</h2>
            <small>Service &amp; Maintenance</small>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isNewSection = item.section !== lastSection
            if (isNewSection) lastSection = item.section
            const Icon = item.icon
            const badge = getBadgeFor(item.badgeType)

            return (
              <div key={item.key}>
                {isNewSection && <div className="nav-section-title">{item.section}</div>}
                <div
                  className={'nav' + (page === item.key ? ' on' : '')}
                  onClick={() => go(item.key)}
                >
                  <span className="nav-icon">
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {badge}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar Footer User Box */}
        <div className="side-footer">
          <div className="side-user-card">
            <div className="side-avatar">
              {getInitials(serviceUser?.name)}
            </div>
            <div className="side-user-info">
              <div className="side-user-name">{serviceUser?.name || 'Service Engineer'}</div>
              <div className="side-user-role">
                {serviceUser?.role === 'superadmin' ? 'Super Admin' : (serviceUser?.departmentRoles?.service || 'Service Dept')}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        <header className="top">
          <div className="top-brand">
            <button className="burger" onClick={() => setOpen(!open)} title="Toggle menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="top-title-wrap">
              <h1 className="top-title">{title}</h1>
              <p className="top-subtitle">EPI UPS Centralized Service Management</p>
            </div>
          </div>

          <div className="top-shortcuts">
            <button
              className={'top-header-btn' + (page === 'today' ? ' active' : '')}
              onClick={() => go('today')}
              title="Today's scheduled and overdue work"
            >
              <span className="th-icon"><CalendarCheck size={16} /></span>
              <span className="th-text">Today Work</span>
              {todayPendingCount > 0 ? (
                <span className="th-badge th-badge-alert">{todayPendingCount}</span>
              ) : (
                <span className="th-badge th-badge-ok">0</span>
              )}
            </button>

            <button
              className={'top-header-btn' + (page === 'upcoming' ? ' active' : '')}
              onClick={() => go('upcoming')}
              title="Upcoming pending work (next 2 days)"
            >
              <span className="th-icon"><CalendarClock size={16} /></span>
              <span className="th-text">Upcoming Work</span>
              {upcomingPendingCount > 0 ? (
                <span className="th-badge th-badge-info">{upcomingPendingCount}</span>
              ) : (
                <span className="th-badge th-badge-ok">0</span>
              )}
            </button>
          </div>

          <div className="top-meta">
            <span className="today-badge">
              <Clock size={14} style={{ color: 'var(--epi-blue-light)' }} />
              {fmt(TODAY())}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #0052cc, #e5192d)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                {getInitials(serviceUser?.name)}
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{serviceUser?.name || 'Service Engineer'}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>
                  @{serviceUser?.userId || 'service'}
                </div>
              </div>
              <a href={CENTRAL_URL} className="btn s sm" style={{ padding: '4px 9px', fontSize: 11, textDecoration: 'none' }} title="Return to Central Management Portal">
                Portal
              </a>
              <button className="btn d sm" onClick={handleSignOut} style={{ padding: '4px 9px', fontSize: 11 }} title="Sign out of Central session">
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {pages[page]}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
