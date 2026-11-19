import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { isUpcomingSoon, CATS } from '../services/domain.js'
import { TODAY, addD, fmt } from '../services/dates.js'
import { CalendarClock, Calendar, CalendarPlus, Search } from 'lucide-react'

export default function UpcomingWork() {
  const { s, addWork } = useApp()
  const T = TODAY()
  const [rangeDays, setRangeDays] = useState(7)
  const [catFilter, setCatFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [customFrom, setCustomFrom] = useState(T)
  const [customTo, setCustomTo] = useState(addD(T, 7))

  const soonList = s.works.filter((w) => isUpcomingSoon(w, 2))

  const rangeEnd = addD(T, rangeDays)

  const filteredUpcoming = s.works.filter((w) => {
    // Only pending / in-progress tasks scheduled in the future (w.date >= T)
    if (w.status === 'done') return false
    if (w.date < T) return false

    if (rangeDays === 'custom') {
      if (customFrom && w.date < customFrom) return false
      if (customTo && w.date > customTo) return false
    } else {
      if (w.date > rangeEnd) return false
    }

    if (catFilter && w.category !== catFilter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const hay = [
        w.title,
        w.desc,
        w.notes,
        w.engineer,
        w.clientName,
        w.clientCompany,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }

    return true
  })

  return (
    <>
      {/* 1. Next 48 Hours Immediate Work */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <CalendarClock size={18} style={{ color: 'var(--epi-blue-light)' }} /> Critical Upcoming Work — Next 2 Days ({soonList.length})
            </h3>
            <span className="muted" style={{ fontSize: 12, marginTop: 2, display: 'block' }}>
              Tasks, maintenance reminders, and installations due within the next 48 hours
            </span>
          </div>
          <button className="btn" onClick={() => addWork(addD(T, 1))}>
            <CalendarPlus size={14} /> + Schedule for Tomorrow
          </button>
        </div>
        <WorkTable list={soonList} empty="No urgent work scheduled in the next 48 hours." />
      </div>

      {/* 2. Range Filtered Upcoming Work */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} style={{ color: 'var(--epi-blue-bright)' }} /> Upcoming Work Orders Pipeline ({filteredUpcoming.length})
            </h3>
            <span className="card-subtitle">
              {rangeDays === 'custom'
                ? `Showing work between ${fmt(customFrom)} and ${fmt(customTo)}`
                : `Showing all work scheduled in the next ${rangeDays} days (until ${fmt(rangeEnd)})`}
            </span>
          </div>

          <button className="btn sm s" onClick={() => addWork(addD(T, 3))}>
            <CalendarPlus size={13} /> + Add Future Work
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="row" style={{ marginBottom: 14 }}>
          {/* Preset Range Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Next 2 Days', val: 2 },
              { label: 'Next 7 Days', val: 7 },
              { label: 'Next 14 Days', val: 14 },
              { label: 'Next 30 Days', val: 30 },
              { label: 'Next 90 Days', val: 90 },
              { label: 'Custom Range', val: 'custom' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                className={`btn sm ${rangeDays === p.val ? 'btn-primary-highlight' : 's'}`}
                onClick={() => setRangeDays(p.val)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {rangeDays === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>From:</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={{ width: 'auto' }} />
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>To:</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={{ width: 'auto' }} />
            </div>
          )}

          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Categories</option>
            {CATS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input
              placeholder="Search upcoming tasks, client, technician…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 30 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <WorkTable list={filteredUpcoming} empty={`No upcoming work found for the selected ${rangeDays === 'custom' ? 'date range' : `${rangeDays}-day period`}.`} />
      </div>
    </>
  )
}
