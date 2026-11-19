import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { WarrantyBadge, ClientTypeBadge } from '../components/Badges.jsx'
import { clientContact, clientProduct, clientTitle, warr } from '../services/domain.js'
import { fmt } from '../services/dates.js'
import { Search, ShieldCheck, Edit2, Plus } from 'lucide-react'

export default function Warranty() {
  const { s, editClient, addClient } = useApp()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const allClients = [...s.clients].filter((c) => Boolean(c.saleDate))

  const activeCount = allClients.filter((c) => warr(c).active).length
  const expiredCount = allClients.length - activeCount
  const expiringSoonCount = allClients.filter((c) => warr(c).active && warr(c).left <= 30).length

  const filtered = allClients
    .filter((c) => {
      const w = warr(c)
      if (filter === 'active' && !w.active) return false
      if (filter === 'expired' && w.active) return false
      if (filter === 'soon' && (!w.active || w.left > 30)) return false

      if (q.trim()) {
        const needle = q.toLowerCase()
        const hay = [
          clientTitle(c),
          clientContact(c),
          c.phone,
          c.email,
          c.address,
          clientProduct(c),
          c.productType,
          c.model,
          c.serial,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(needle)) return false
      }

      return true
    })
    .sort((a, b) => warr(a).left - warr(b).left)

  return (
    <>
      <div className="grid">
        <div className="stat" onClick={() => setFilter('active')} style={{ cursor: 'pointer' }}>
          <b style={{ color: 'var(--accent-emerald)' }}>{activeCount}</b>
          <span>Active Warranties</span>
        </div>
        <div className="stat" onClick={() => setFilter('soon')} style={{ cursor: 'pointer' }}>
          <b style={{ color: 'var(--accent-amber)' }}>{expiringSoonCount}</b>
          <span>Expiring in 30 Days</span>
        </div>
        <div className="stat" onClick={() => setFilter('expired')} style={{ cursor: 'pointer' }}>
          <b style={{ color: 'var(--epi-red)' }}>{expiredCount}</b>
          <span>Expired Warranties</span>
        </div>
        <div className="stat" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <b>{allClients.length}</b>
          <span>Total Tracked Equipment</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} style={{ color: 'var(--epi-blue-light)' }} /> Warranty Tracking &amp; Expiry Management ({filtered.length})
            </h3>
            <span className="muted" style={{ fontSize: 12 }}>
              Track warranty duration, start dates, and automatic expiration for all client equipment
            </span>
          </div>

          <button className="btn btn-primary-highlight sm" onClick={() => addClient('Sales')}>
            <Plus size={13} /> + Register Equipment Warranty
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="row" style={{ marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <input
              placeholder="Search by client, equipment, model, serial no…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 30 }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${allClients.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'soon', label: `Expiring ≤30d (${expiringSoonCount})` },
              { id: 'expired', label: `Expired (${expiredCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn sm ${filter === f.id ? 'btn-primary-highlight' : 's'}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Client &amp; Contact</th>
                  <th>Client Type</th>
                  <th>Equipment / Product</th>
                  <th>Serial Number</th>
                  <th>Start / Sale Date</th>
                  <th>Warranty Period</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const w = warr(c)
                  return (
                    <tr key={c.id}>
                      <td>
                        <b style={{ color: '#fff' }}>{clientTitle(c)}</b>
                        {clientContact(c) && <div className="muted">{clientContact(c)}</div>}
                      </td>
                      <td>
                        <ClientTypeBadge c={c} />
                      </td>
                      <td>
                        <b>{clientProduct(c)}</b>
                        <div className="muted" style={{ fontSize: 11 }}>Qty: {c.quantity || 1}</div>
                      </td>
                      <td>
                        <code>{c.serial || '—'}</code>
                      </td>
                      <td>{fmt(c.saleDate)}</td>
                      <td>{w.months} Months</td>
                      <td>{fmt(w.exp)}</td>
                      <td>
                        <WarrantyBadge c={c} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn s sm"
                          onClick={() => editClient(c)}
                          title="Edit client equipment & warranty dates"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No warranty records match your search or filter.</div>
        )}
      </div>
    </>
  )
}
