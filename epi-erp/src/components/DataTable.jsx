import { useMemo, useState } from 'react';
import { exportCSV, exportExcel, exportPDF, printTable } from '../lib/export.js';
import { Empty, useToast } from './ui.jsx';
import { useApi } from './ui.jsx';

const val = (c, row) => (typeof c.key === 'function' ? c.key(row) : row[c.key]);

export function ExportMenu({ title, subtitle, columns, rows }) {
  const toast = useToast();
  const { data: settings } = useApi('/settings');
  const cols = columns.filter((c) => !c.noExport);
  const payload = { title, subtitle, columns: cols, rows, company: settings?.companyName };
  const run = (fn) => async () => { try { await fn(payload); } catch (e) { toast(`Export failed: ${e.message}`, 'err'); } };
  const disabled = !rows.length;
  return (
    <div className="row">
      <button className="btn sm" disabled={disabled} onClick={run(exportExcel)}>Excel</button>
      <button className="btn sm" disabled={disabled} onClick={run(exportPDF)}>PDF</button>
      <button className="btn sm" disabled={disabled} onClick={run(exportCSV)}>CSV</button>
      <button className="btn sm" disabled={disabled} onClick={run(printTable)}>Print</button>
    </div>
  );
}

export default function DataTable({ columns, rows, search = true, pageSize = 25, exportTitle, exportSubtitle, totals, rowClass, empty, toolbar, onRowClick }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let r = rows || [];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      r = r.filter((row) => columns.some((c) => !c.noExport && String(c.fmt ? c.fmt(val(c, row), row) : val(c, row) ?? '').toLowerCase().includes(needle)));
    }
    if (sort) {
      const c = columns.find((x) => x.label === sort.label);
      r = [...r].sort((a, b) => {
        const x = val(c, a), y = val(c, b);
        const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return r;
  }, [rows, q, sort, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const view = filtered.slice(cur * pageSize, cur * pageSize + pageSize);
  const toggle = (c) => {
    if (c.noExport && !c.sortable) return;
    setSort((s) => (s?.label === c.label ? { label: c.label, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { label: c.label, dir: 'asc' }));
  };

  return (
    <div>
      <div className="toolbar">
        {search && <input className="input search" placeholder="Search..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} aria-label="Search table" />}
        {toolbar}
        <div className="grow" />
        {exportTitle && <ExportMenu title={exportTitle} subtitle={exportSubtitle} columns={columns} rows={filtered} />}
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>{columns.map((c) => (
              <th key={c.label} className={`${c.numeric ? 'r' : ''} ${!c.noExport || c.sortable ? 'sortable' : ''}`} onClick={() => toggle(c)}>
                {c.label}{sort?.label === c.label ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {view.map((row, i) => (
              <tr key={row._id || row.id || i} className={rowClass?.(row) || ''} onClick={onRowClick ? () => onRowClick(row) : undefined} style={onRowClick ? { cursor: 'pointer' } : undefined}>
                {columns.map((c) => {
                  const v = val(c, row);
                  return <td key={c.label} className={c.numeric ? 'r' : ''}>{c.render ? c.render(row) : c.fmt ? c.fmt(v, row) : v ?? ''}</td>;
                })}
              </tr>
            ))}
            {totals && filtered.length > 0 && (
              <tr className="total">{columns.map((c, i) => <td key={c.label} className={c.numeric ? 'r' : ''}>{totals[c.label] !== undefined ? (c.fmt ? c.fmt(totals[c.label]) : totals[c.label]) : i === 0 ? 'Total' : ''}</td>)}</tr>
            )}
          </tbody>
        </table>
        {!filtered.length && <Empty>{empty || (q ? 'No results match your search.' : 'No records yet.')}</Empty>}
      </div>
      {filtered.length > pageSize && (
        <div className="pager">
          <span>{filtered.length} records</span>
          <button className="btn sm" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Prev</button>
          <span>Page {cur + 1} / {pages}</span>
          <button className="btn sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
