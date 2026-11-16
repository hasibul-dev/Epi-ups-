import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, DateRange, ErrorBox, Field, Loading, Modal, PageHeader, ReasonModal, statusTone, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useItems, usePartyOptions } from '../lib/hooks.js';
import { printTable } from '../lib/export.js';
import { cap, fmtDate, isoDate, money, num, qty, today } from '../lib/format.js';

const blank = () => ({ item: '', description: '', qty: 1, rate: '', vatRate: 15 });

function InvoiceForm({ type, onDone, onClose }) {
  const sale = type === 'sale';
  const parties = usePartyOptions(sale ? 'customer' : 'supplier');
  const { items } = useItems();
  const { data: settings } = useApi('/settings');
  const [h, setH] = useState({ party: '', date: today(), dueDate: '', supplierRef: '', notes: '' });
  const [lines, setLines] = useState([blank()]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const setLine = (i, patch) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const pickItem = (i, id) => {
    const it = items.find((x) => x._id === id);
    setLine(i, { item: id, ...(it ? { rate: sale ? it.salePrice : it.avgCost || '', vatRate: it.vatRate, description: it.name } : {}) });
  };
  const totals = useMemo(() => {
    let sub = 0, vat = 0;
    for (const l of lines) { const a = Math.round(Number(l.qty || 0) * Number(l.rate || 0) * 100) / 100; sub += a; vat += Math.round(a * Number(l.vatRate || 0)) / 100; }
    return { sub, vat: Math.round(vat * 100) / 100, total: Math.round((sub + vat) * 100) / 100 };
  }, [lines]);
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const body = { ...h, lines: lines.map((l) => ({ ...l, qty: Number(l.qty), rate: Number(l.rate), vatRate: Number(l.vatRate || 0) })) };
      if (!body.dueDate) delete body.dueDate;
      const d = await api.post(sale ? '/sales-invoices' : '/purchase-bills', body);
      toast(`${d.number} created`); onDone();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  const vatRates = settings?.vatRates || [0, 5, 7.5, 10, 15];
  return (
    <Modal wide title={sale ? 'New sales invoice' : 'New purchase bill'} onClose={onClose} footer={<>
      <span style={{ marginRight: 'auto' }}>Subtotal {money(totals.sub)} | VAT {money(totals.vat)} | <b>Total {money(totals.total)}</b></span>
      <button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy || !h.party} onClick={submit}>{busy ? 'Saving...' : 'Create & post'}</button></>}>
      <ErrorBox error={err} />
      <div className="form-grid" style={{ marginBottom: 14 }}>
        <Field label={sale ? 'Customer *' : 'Supplier *'}><select className="input" value={h.party} onChange={(e) => setH({ ...h, party: e.target.value })}><option value="">Select...</option>{parties.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
        <Field label="Date"><input type="date" className="input" value={h.date} onChange={(e) => setH({ ...h, date: e.target.value })} /></Field>
        <Field label="Due date" hint="Blank = party payment terms"><input type="date" className="input" value={h.dueDate} onChange={(e) => setH({ ...h, dueDate: e.target.value })} /></Field>
        {!sale && <Field label="Supplier bill no."><input className="input" value={h.supplierRef} onChange={(e) => setH({ ...h, supplierRef: e.target.value })} /></Field>}
        <Field label="Notes" full><input className="input" value={h.notes} onChange={(e) => setH({ ...h, notes: e.target.value })} /></Field>
      </div>
      <div className="table-wrap"><table className="t lines-table"><thead><tr><th>Item</th>{sale && <th>Description</th>}<th>Qty</th><th>Rate</th><th>VAT %</th><th className="r">Amount</th><th /></tr></thead><tbody>
        {lines.map((l, i) => {
          const it = items.find((x) => x._id === l.item);
          return (
            <tr key={i}>
              <td style={{ minWidth: 200 }}><select className="input" value={l.item} onChange={(e) => pickItem(i, e.target.value)}><option value="">{sale ? 'Service / non-stock' : 'Select item'}</option>{items.map((x) => <option key={x._id} value={x._id}>{x.sku} - {x.name}{sale ? ` (${qty(x.qtyOnHand)} in stock)` : ''}</option>)}</select></td>
              {sale && <td><input className="input" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Description" /></td>}
              <td style={{ width: 90 }}><input className="input" type="number" min="0" step="any" value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} />{sale && it && Number(l.qty) > it.qtyOnHand && <small className="neg">Only {qty(it.qtyOnHand)}</small>}</td>
              <td style={{ width: 120 }}><input className="input" type="number" min="0" step="0.01" value={l.rate} onChange={(e) => setLine(i, { rate: e.target.value })} /></td>
              <td style={{ width: 90 }}><select className="input" value={l.vatRate} onChange={(e) => setLine(i, { vatRate: e.target.value })}>{vatRates.map((v) => <option key={v} value={v}>{v}%</option>)}</select></td>
              <td className="r">{num(Number(l.qty || 0) * Number(l.rate || 0))}</td>
              <td><button className="btn sm" disabled={lines.length === 1} onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label="Remove line">×</button></td>
            </tr>);
        })}</tbody></table></div>
      <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setLines([...lines, blank()])}>+ Add line</button>
    </Modal>
  );
}

export default function Invoices({ type }) {
  const sale = type === 'sale';
  const mod = sale ? 'sales' : 'purchase';
  const path = sale ? '/sales-invoices' : '/purchase-bills';
  const { can } = useAuth();
  const toast = useToast();
  const [range, setRange] = useState({ from: '', to: '' });
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useApi(path, { ...range, status });
  const [form, setForm] = useState(false);
  const [view, setView] = useState(null);
  const [voidT, setVoidT] = useState(null);
  const live = (data || []).filter((d) => d.status !== 'void');
  const cols = [
    { key: 'number', label: 'Number' }, { key: 'date', label: 'Date', fmt: fmtDate }, { key: 'dueDate', label: 'Due', fmt: fmtDate },
    { key: (d) => d.party?.name, label: sale ? 'Customer' : 'Supplier' },
    { key: 'subtotal', label: 'Subtotal', numeric: true, fmt: money }, { key: 'vatTotal', label: 'VAT', numeric: true, fmt: money },
    { key: 'total', label: 'Total', numeric: true, fmt: money }, { key: 'paid', label: 'Paid', numeric: true, fmt: money },
    { key: (d) => d.total - d.paid, label: 'Balance', numeric: true, fmt: (v, d) => money(d && d.status === 'void' ? 0 : v) },
    { key: 'status', label: 'Status', fmt: cap, render: (d) => <Badge tone={statusTone(d.status)}>{cap(d.status)}</Badge> },
    { label: 'Actions', noExport: true, render: (d) => (
      <div className="row"><button className="btn sm" onClick={async () => setView(await api.get(`${path}/${d._id}`))}>View</button>
        {can(mod, 'void') && d.status !== 'void' && <button className="btn sm danger" onClick={() => setVoidT(d)}>Void</button>}</div>) },
  ];
  const printInvoice = (d) => printTable({
    title: `${sale ? 'Tax Invoice' : 'Purchase Bill'} ${d.number}`,
    subtitle: `${d.party.name} | Date ${fmtDate(d.date)} | Due ${fmtDate(d.dueDate)} | Subtotal ${money(d.subtotal)} | VAT ${money(d.vatTotal)} | TOTAL ${money(d.total)}`,
    columns: [{ key: (l) => l.item?.name || l.description, label: 'Item' }, { key: 'qty', label: 'Qty', numeric: true, fmt: qty }, { key: 'rate', label: 'Rate', numeric: true, fmt: money },
      { key: 'vatRate', label: 'VAT %', numeric: true }, { key: 'amount', label: 'Amount', numeric: true, fmt: money }, { key: 'vat', label: 'VAT', numeric: true, fmt: money }],
    rows: d.lines,
  });
  return (
    <>
      <PageHeader title={sale ? 'Sales Invoices' : 'Purchase Bills'} subtitle={sale ? 'Posts Dr Receivable / Cr Sales + VAT, and relieves stock to COGS' : 'Posts Dr Inventory + Input VAT / Cr Payable and updates stock cost'}>
        {can(mod, 'write') && <button className="btn primary" onClick={() => setForm(true)}>+ New {sale ? 'invoice' : 'bill'}</button>}
      </PageHeader>
      <ErrorBox error={error} />
      <div className="toolbar"><DateRange {...range} onChange={setRange} />
        <select className="input" style={{ width: 140 }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All status</option>{['unpaid', 'partial', 'paid', 'void'].map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select></div>
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} rowClass={(d) => (d.status === 'void' ? 'dim' : '')} exportTitle={sale ? 'Sales Invoices' : 'Purchase Bills'}
        totals={{ Subtotal: live.reduce((s, d) => s + d.subtotal, 0), VAT: live.reduce((s, d) => s + d.vatTotal, 0), Total: live.reduce((s, d) => s + d.total, 0), Paid: live.reduce((s, d) => s + d.paid, 0), Balance: live.reduce((s, d) => s + d.total - d.paid, 0) }} />}
      {form && <InvoiceForm type={type} onClose={() => setForm(false)} onDone={() => { setForm(false); reload(); }} />}
      {view && (
        <Modal wide title={`${view.number} - ${view.party.name}`} onClose={() => setView(null)} footer={<button className="btn" onClick={() => printInvoice(view)}>Print / PDF</button>}>
          <p className="muted">Date {fmtDate(view.date)} | Due {fmtDate(view.dueDate)} | Status {cap(view.status)} {view.supplierRef && `| Supplier bill ${view.supplierRef}`}</p>
          <div className="table-wrap"><table className="t"><thead><tr><th>Item</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">VAT %</th><th className="r">Amount</th><th className="r">VAT</th></tr></thead><tbody>
            {view.lines.map((l, i) => <tr key={i}><td>{l.item ? `${l.item.sku} - ${l.item.name}` : l.description}</td><td className="r">{qty(l.qty)}</td><td className="r">{money(l.rate)}</td><td className="r">{l.vatRate}%</td><td className="r">{money(l.amount)}</td><td className="r">{money(l.vat)}</td></tr>)}
            <tr className="total"><td colSpan={4}>Subtotal / VAT</td><td className="r">{money(view.subtotal)}</td><td className="r">{money(view.vatTotal)}</td></tr>
            <tr className="total"><td colSpan={4}>Total | Paid {money(view.paid)} | Due {money(view.total - view.paid)}</td><td className="r" colSpan={2}>{money(view.total)}</td></tr></tbody></table></div>
          {view.notes && <p className="muted">Notes: {view.notes}</p>}
        </Modal>
      )}
      {voidT && <ReasonModal title={`Void ${voidT.number}`} message="Accounting entries are reversed and stock is restored. Invoices with payments applied must have those payments voided first." confirmLabel="Void"
        onConfirm={(reason) => api.post(`${path}/${voidT._id}/void`, { reason })} onClose={(ok) => { setVoidT(null); if (ok) { toast('Document voided'); reload(); } }} />}
    </>
  );
}
