import { useState } from 'react';
import { today, fmt, formatTime12h, compareTimes } from '../utils/helpers.js';
import { PrintHeader, PrintSignatures } from './PrintHeader.jsx';
import ExpandableText from './ExpandableText.jsx';
import { Printer } from 'lucide-react';

export default function WorkSummary({ db, onPrint }) {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());

  const f = from || today();
  const t = to || f;

  const rows = db.history
    .filter((h) => h.type === 'Follow-up' && h.date >= f && h.date <= t)
    .map((h) => ({
      date: h.date || '',
      time: h.time || '',
      client: h.client || '',
      company: h.company || '',
      category: h.category || '',
      method: h.followType || '',
      status: h.status || 'Completed',
      notes: h.notes || '',
    }))
    .sort((a, b) => {
      const dComp = (a.date || '').localeCompare(b.date || '');
      if (dComp !== 0) return dComp;
      return compareTimes(a.time, b.time);
    });

  const count = (m) => rows.filter((x) => x.method === m).length;
  const metrics = [
    ['Total Follow-up', rows.length],
    ['Potential', rows.filter((x) => x.category === 'Potential').length],
    ['No Potential', rows.filter((x) => x.category === 'No Potential' || x.category === 'Non-Potential').length],
    ['Quotation', rows.filter((x) => x.category === 'Quotation').length],
    ['Sale', rows.filter((x) => x.category === 'Sale').length],
    ['Visit', count('Visit')],
    ['Meet', count('Meet')],
    ['Call', count('Call')],
    ['Mail', count('Mail')],
  ];
  const notes = [
    'Completed client follow-ups',
    'Resulting category',
    'Resulting category',
    'Resulting category',
    'Resulting category',
    'Follow-up method',
    'Follow-up method',
    'Follow-up method',
    'Follow-up method',
  ];

  const print = () =>
    onPrint(
      <div className="print-page">
        <PrintHeader title="WORK SUMMARY REPORT" />
        <div className="print-meta">
          <div><b>Name:</b> MD Habibullah<br /><b>Designation:</b> Engineer, Business Development</div>
          <div><b>Period:</b> {fmt(f)} to {fmt(t)}</div>
        </div>
        <div className="print-line"></div>
        <table className="print-table">
          <thead><tr><th style={{ width: '70%' }}>Particular</th><th style={{ width: '30%', textAlign: 'right' }}>Count</th></tr></thead>
          <tbody>
            {metrics.map((x) => (
              <tr key={x[0]}>
                <td style={{ fontWeight: 600 }}>{x[0]}</td>
                <td className="print-count-cell" style={{ textAlign: 'right', fontWeight: 800, color: '#000000' }}>{x[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ height: 20 }}></div>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: 85 }}>Date</th>
              <th style={{ width: 75 }}>Time</th>
              <th>Client</th>
              <th>Company</th>
              <th style={{ width: 90 }}>Category</th>
              <th style={{ width: 95 }}>Follow-up</th>
              <th>Remarks / Notes</th>
              <th style={{ width: 85 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{fmt(r.date)}</td>
                  <td>{r.time ? formatTime12h(r.time) : '—'}</td>
                  <td style={{ fontWeight: 700 }}>{r.client}</td>
                  <td>{r.company}</td>
                  <td>{r.category}</td>
                  <td>{r.method}</td>
                  <td>{r.notes || '—'}</td>
                  <td>
                    <span className="print-status-badge">{r.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="print-empty-state">
                  No activity records found for this period ({fmt(f)} to {fmt(t)}).
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <PrintSignatures />
      </div>
    );

  return (
    <section className="page active">
      <div className="panel">
        <div className="head">
          <div>
            <h2>Work Summary</h2>
            <div className="muted">Select a period to calculate follow-up performance and print the final A4 report.</div>
          </div>
          <button className="summary-print-btn" onClick={print}>
            <Printer size={13} strokeWidth={2.2} /> Print Work Summary
          </button>
        </div>
        <div className="grid">
          <div><label>Start Date</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label>End Date</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
      </div>

      <div className="summary-cards">
        {metrics.map((m, i) => (
          <div className="summary-card" key={m[0]}>
            <div className="s-label">{m[0].toUpperCase()}</div>
            <div className="s-value">{m[1]}</div>
            <div className="s-note">{notes[i]}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="head">
          <div>
            <h2>Work Summary Shortlist</h2>
            <div className="muted">{f === t ? fmt(f) : fmt(f) + ' → ' + fmt(t)}</div>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Company</th><th>Category</th><th>Follow-up Method</th><th>Remarks / Notes</th><th>Status</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((r, i) => (
                <tr key={i}>
                  <td>{fmt(r.date)}</td><td>{r.time ? formatTime12h(r.time) : '—'}</td><td><b>{r.client}</b></td><td>{r.company}</td>
                  <td>{r.category ? <span className="badge">{r.category}</span> : '—'}</td>
                  <td>{r.method || '—'}</td>
                  <td style={{ minWidth: 150 }}>
                    <ExpandableText
                      text={r.notes}
                      title={`Remarks & Notes — ${r.client}`}
                      subtitle={`${fmt(r.date)} · ${r.company}`}
                    />
                  </td>
                  <td><span className="badge done">{r.status}</span></td>
                </tr>
              )) : <tr><td colSpan="8" className="empty">No completed client follow-up found for this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
