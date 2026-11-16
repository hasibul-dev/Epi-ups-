import { useApp } from '../context/AppContext.jsx'
import { StatusBadge, PriorityBadge } from './Badges.jsx'
import { byTime, clientTitle, clientContact } from '../services/domain.js'
import { fmt, TODAY } from '../services/dates.js'
import { CheckCircle2, RotateCcw, Edit2, Trash2, Clock, User, Wrench } from 'lucide-react'

export default function WorkTable({ list, empty = 'No work found.' }) {
  const { s, upd, editWork } = useApp()

  const getClientInfo = (w) => {
    // 1. Prioritize manual client entries (e.g. for Installation, General Work, or manual records)
    if (w.clientName || w.clientCompany) {
      const title =
        w.clientCompany && w.clientName && w.clientCompany !== w.clientName
          ? `${w.clientCompany} (${w.clientName})`
          : w.clientCompany || w.clientName
      const sub = [w.clientPhone, w.clientAddress].filter(Boolean).join(' · ')
      return { title, sub, isManual: true }
    }
    // 2. Fall back to database client if linked
    if (w.clientId) {
      const c = s.clients.find((x) => x.id === w.clientId)
      if (c) {
        return {
          title: clientTitle(c),
          sub: [clientContact(c), c.phone].filter(Boolean).join(' · '),
          isManual: false,
        }
      }
    }
    return { title: '—', sub: '', isManual: false }
  }

  const complete = (w) =>
    upd((p) => ({
      ...p,
      works: p.works.map((x) => (x.id === w.id ? { ...x, status: 'done', doneAt: TODAY() } : x)),
    }))

  const reopen = (w) =>
    upd((p) => ({
      ...p,
      works: p.works.map((x) => (x.id === w.id ? { ...x, status: 'pending', doneAt: '' } : x)),
    }))

  const remove = (w) =>
    window.confirm('Delete this work?') &&
    upd((p) => ({ ...p, works: p.works.filter((x) => x.id !== w.id) }))

  if (!list.length) return <div className="empty">{empty}</div>

  return (
    <div className="tw">
      <table>
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Work Title</th>
            <th>Client Information</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Technician</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...list].sort(byTime).map((w) => {
            const ci = getClientInfo(w)
            return (
              <tr key={w.id}>
                <td>
                  <b style={{ color: '#fff' }}>{fmt(w.date)}</b>
                  <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 11.5 }}>
                    <Clock size={11} /> {w.time}
                  </div>
                </td>
                <td>
                  <b style={{ color: '#fff' }}>{w.title}</b>
                  {w.auto ? <span className="bd b" style={{ marginLeft: 6 }}>Auto 3M</span> : null}
                  {w.desc && w.desc !== w.title ? (
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{w.desc}</div>
                  ) : null}
                  {w.notes ? (
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2, color: 'var(--text-subtle)' }}>
                      Note: {w.notes}
                    </div>
                  ) : null}
                </td>
                <td>
                  <div>
                    <b style={{ color: '#fff' }}>{ci.title}</b>
                  </div>
                  {ci.sub ? (
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                      {ci.sub}
                    </div>
                  ) : null}
                </td>
                <td>
                  <span className="bd b">{w.category}</span>
                </td>
                <td>
                  <PriorityBadge priority={w.priority} />
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: varNameColor(w.engineer) }}>
                    <User size={12} style={{ color: 'var(--text-muted)' }} />
                    {w.engineer || '—'}
                  </span>
                </td>
                <td>
                  <StatusBadge w={w} />
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    {w.status === 'done' ? (
                      <button className="btn s sm" onClick={() => reopen(w)} title="Reopen this work task">
                        <RotateCcw size={12} /> Reopen
                      </button>
                    ) : (
                      <button className="btn g sm" onClick={() => complete(w)} title="Mark task as complete">
                        <CheckCircle2 size={12} /> Complete
                      </button>
                    )}
                    <button className="btn s sm" onClick={() => editWork(w)} title="Edit work details">
                      <Edit2 size={12} />
                    </button>
                    <button className="btn d sm" onClick={() => remove(w)} title="Delete work order">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function varNameColor(name) {
  if (!name) return 'var(--text-muted)'
  return '#e2e8f0'
}
