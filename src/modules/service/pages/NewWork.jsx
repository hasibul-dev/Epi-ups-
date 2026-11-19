import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import Field from '../components/Field.jsx'
import { CATS, PRIORITIES, clientContact, clientTitle, clientType } from '../services/domain.js'
import { TODAY, uid } from '../services/dates.js'
import { PlusCircle, Search, Filter, CheckCircle2, SlidersHorizontal } from 'lucide-react'

export default function NewWork() {
  const { s, upd } = useApp()
  const [category, setCategory] = useState('Servicing')
  const [priority, setPriority] = useState('Normal')
  const [statusVal, setStatusVal] = useState('pending')
  const [date, setDate] = useState(TODAY())
  const [time, setTime] = useState('10:00')
  const [engineer, setEngineer] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [notes, setNotes] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filter states for the bottom queue
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const engineers = (s.settings.engineers || '').split(',').map((x) => x.trim()).filter(Boolean)

  const handleClientSelect = (e) => {
    const cid = e.target.value
    setClientId(cid)
    if (cid) {
      const c = s.clients.find((x) => x.id === cid)
      if (c) {
        setClientName(c.contactPerson || c.name || '')
        setClientCompany(c.company || '')
        setClientPhone(c.phone || '')
        setClientAddress(c.address || '')
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    const newOrder = {
      id: uid(),
      title: title.trim(),
      category,
      priority,
      status: statusVal,
      date,
      time,
      engineer: engineer.trim(),
      desc: desc.trim(),
      notes: notes.trim(),
      clientId: clientId || '',
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientCompany: clientCompany.trim(),
      clientAddress: clientAddress.trim(),
      doneAt: statusVal === 'done' ? TODAY() : '',
    }

    upd((prev) => ({
      ...prev,
      works: [newOrder, ...prev.works],
    }))

    setSuccessMsg(`Work order "${newOrder.title}" created successfully!`)
    // Reset form
    setTitle('')
    setDesc('')
    setNotes('')
    setClientId('')
    setClientName('')
    setClientPhone('')
    setClientCompany('')
    setClientAddress('')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Filter queue
  const queueWorks = s.works.filter((w) => {
    if (filterCat && w.category !== filterCat) return false
    if (filterStatus && w.status !== filterStatus) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const hay = [
        w.title,
        w.desc,
        w.notes,
        w.engineer,
        w.category,
        w.clientName,
        w.clientCompany,
        w.clientPhone,
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
      {/* 1. Work Order Creation Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlusCircle size={20} style={{ color: 'var(--epi-blue-light)' }} /> Add New Work Order
            </h2>
            <p className="muted" style={{ margin: '3px 0 0', fontSize: 12 }}>
              Create and dispatch servicing, maintenance, installation, or general work orders
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="alert ok" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category Selector Buttons */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Work Category
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`btn sm ${category === c ? 'btn-primary-highlight' : 's'}`}
                  style={{ borderRadius: 8, padding: '6px 14px', fontSize: 12 }}
                >
                  {c === 'Installation' ? '🔌 Installation' : c === 'General' ? '📋 General' : c === 'Servicing' ? '🛠️ Servicing' : c === 'Maintenance' ? '⚙️ Maintenance' : '💼 Sales'}
                </button>
              ))}
            </div>
          </div>

          {/* Client Selection Section */}
          <div className="form-section">
            <div className="form-section-title">Client Selection &amp; Location</div>
            <div className="fg" style={{ marginBottom: 10 }}>
              <Field label="Choose Existing Client (Auto-Fills Details)" wide>
                <select value={clientId} onChange={handleClientSelect}>
                  <option value="">— Select from Client Master or Type Below —</option>
                  {s.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {clientTitle(c)} ({clientType(c)}) {clientContact(c) ? `— ${clientContact(c)}` : ''}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Client / Contact Name">
                <input
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </Field>

              <Field label="Phone / Mobile">
                <input
                  placeholder="e.g. 01711-223344"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </Field>

              <Field label="Company / Organization">
                <input
                  placeholder="e.g. Apex Spinning & Financial Ltd"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                />
              </Field>

              <Field label="Site Address">
                <input
                  placeholder="Installation / site address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Work Details Section */}
          <div className="form-section">
            <div className="form-section-title">Task Specification &amp; Scheduling</div>
            <div className="fg">
              <Field label="Work Order Title *" wide>
                <input
                  placeholder={
                    category === 'Installation'
                      ? 'e.g. 20kVA Online UPS Commissioning & Battery Bank Setup'
                      : category === 'Maintenance'
                      ? 'e.g. Quarterly scheduled UPS preventive maintenance'
                      : 'e.g. Battery impedance test & inverter calibration'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <Field label="Schedule Date *">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Field>

              <Field label="Schedule Time">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Field>

              <Field label="Priority">
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </Field>

              <Field label="Assigned Technician" wide>
                <input
                  list="new-work-engineers"
                  placeholder="Select or enter field engineer name"
                  value={engineer}
                  onChange={(e) => setEngineer(e.target.value)}
                />
                <datalist id="new-work-engineers">
                  {engineers.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
              </Field>

              <Field label="Work Description / Scope" wide>
                <textarea
                  rows="2"
                  placeholder="Detailed work scope, parts to inspect, or customer requirements"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </Field>

              <Field label="Internal Technical Notes" wide>
                <textarea
                  rows="2"
                  placeholder="Tools needed, safety prerequisites, or spare parts"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button
              type="submit"
              className="btn btn-primary-highlight"
              disabled={!title.trim() || !date}
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              <PlusCircle size={15} /> Save &amp; Dispatch Work Order
            </button>
          </div>
        </form>
      </div>

      {/* 2. All Work Orders Queue with Search & Filters */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, color: '#fff' }}>
              📋 Active Work Queue &amp; Recent Orders ({queueWorks.length})
            </h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Search, view details, print job sheets, edit, or mark tasks as completed
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: 200 }}>
              <input
                placeholder="Search orders, clients, technicians…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30 }}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All Categories</option>
              {CATS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
        </div>

        <WorkTable list={queueWorks} empty="No work orders match the current filter criteria." />
      </div>
    </>
  )
}
