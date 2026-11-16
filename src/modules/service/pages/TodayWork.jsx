import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { isOverdue } from '../services/domain.js'
import { TODAY, fmt } from '../services/dates.js'
import { CalendarCheck, AlertTriangle, CalendarPlus } from 'lucide-react'

export default function TodayWork() {
  const { s, addWork } = useApp()
  const T = TODAY()
  const todayList = s.works.filter((w) => w.date === T)
  const overdueList = s.works.filter((w) => isOverdue(w))

  return (
    <>
      {overdueList.length > 0 && (
        <div className="card overdue-card">
          <div className="card-header-bar">
            <div>
              <h3 className="card-title" style={{ color: '#ff8f8f', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> Overdue Work &amp; Maintenance ({overdueList.length})
              </h3>
              <span className="card-subtitle">Past scheduled tasks awaiting completion</span>
            </div>
          </div>
          <WorkTable list={overdueList} />
        </div>
      )}

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <CalendarCheck size={18} style={{ color: 'var(--epi-blue-light)' }} /> Today Work — {fmt(T)}
            </h3>
            <span className="muted" style={{ fontSize: 12, marginTop: 2, display: 'block' }}>
              {todayList.length} scheduled for today · {todayList.filter((w) => w.status === 'done').length} completed
            </span>
          </div>
          <button className="btn" onClick={() => addWork(T)}>
            <CalendarPlus size={14} /> + Add Work
          </button>
        </div>
        <WorkTable list={todayList} empty="No work scheduled for today 🎉" />
      </div>
    </>
  )
}
