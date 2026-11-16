import { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, ErrorBox, Field, Loading, Modal, PageHeader, ReasonModal, statusTone, useApi, useToast, DateRange } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useAccountOptions } from '../lib/hooks.js';
import { fmtDate, money, today, cap, monthStart } from '../lib/format.js';

const VTYPES = [
  ['journal', 'Journal voucher'], ['payment', 'Payment voucher'], ['receipt', 'Receipt voucher'], ['contra', 'Contra (cash/bank transfer)'],
];
const blank = () => ({ account: '', debit: '', credit: '', memo: '' });

function VoucherForm({ onDone, onClose }) {
  const accounts = useAccountOptions();
  const [h, setH] = useState({ date: today(), voucherType: 'journal', narration: '', reference: '' });
  const [lines, setLines] = useState([blank(), blank()]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const opts = h.voucherType === 'contra' ? accounts.filter((a) => ['cash', 'bank'].includes(a.subType)) : accounts;
  const tot = useMemo(() => lines.reduce((t, l) => ({ d: t.d + Math.round(Number(l.debit || 0) * 100), c: t.c + Math.round(Number(l.credit || 0) * 100) }), { d: 0, c: 0 }), [lines]);
  const diff = (tot.d - tot.c) / 100;
  const set = (i, k, v) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v, ...(k === 'debit' && v ? { credit: '' } : {}), ...(k === 'credit' && v ? { debit: '' } : {}) } : l)));
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await api.post('/journal', { ...h, lines: lines.filter((l) => l.account).map((l) => ({ account: l.account, debit: Number(l.debit || 0), credit: Number(l.credit || 0), memo: l.memo })) });
      toast('Voucher posted'); onDone();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal wide title="New voucher" onClose={onClose} footer={<>
      <span className={diff === 0 && tot.d > 0 ? 'pos' : 'neg'} style={{ marginRight: 'auto' }}>
        Debit {money(tot.d / 100)} | Credit {money(tot.c / 100)} {diff !== 0 ? `| Difference ${money(Math.abs(diff))}` : tot.d > 0 ? '| Balanced' : ''}
      </span>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn primary" disabled={busy || diff !== 0 || tot.d === 0} onClick={submit}>{busy ? 'Posting...' : 'Post voucher'}</button></>}>
      <ErrorBox error={err} />
      <div className="form-grid" style={{ marginBottom: 14 }}>
        <Field label="Voucher type"><select className="input" value={h.voucherType} onChange={(e) => setH({ ...h, voucherType: e.target.value })}>{VTYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="Date"><input type="date" className="input" value={h.date} onChange={(e) => setH({ ...h, date: e.target.value })} /></Field>
        <Field label="Reference"><input className="input" value={h.reference} onChange={(e) => setH({ ...h, reference: e.target.value })} placeholder="Cheque / slip no." /></Field>
        <Field label="Narration"><input className="input" value={h.narration} onChange={(e) => setH({ ...h, narration: e.target.value })} /></Field>
      </div>
      <div className="table-wrap"><table className="t lines-table"><thead><tr><th>Account</th><th>Debit</th><th>Credit</th><th>Memo</th><th /></tr></thead><tbody>
        {lines.map((l, i) => (
          <tr key={i}>
            <td style={{ minWidth: 220 }}><select className="input" value={l.account} onChange={(e) => set(i, 'account', e.target.value)}><option value="">Select account</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
            <td><input className="input" type="number" min="0" step="0.01" value={l.debit} onChange={(e) => set(i, 'debit', e.target.value)} /></td>
            <td><input className="input" type="number" min="0" step="0.01" value={l.credit} onChange={(e) => set(i, 'credit', e.target.value)} /></td>
            <td><input className="input" value={l.memo} onChange={(e) => set(i, 'memo', e.target.value)} /></td>
            <td><button className="btn sm" disabled={lines.length <= 2} onClick={() => setLines(lines.filter((_, j) => j !== i))} aria-label="Remove line">×</button></td>
          </tr>))}
      </tbody></table></div>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn sm" onClick={() => setLines([...lines, blank()])}>+ Add line</button>
        {diff !== 0 && tot.d + tot.c > 0 && <button className="btn sm" onClick={() => {
          const i = lines.findIndex((l) => !l.debit && !l.credit);
          if (i < 0) return setLines([...lines, { ...blank(), [diff > 0 ? 'credit' : 'debit']: Math.abs(diff) }]);
          set(i, diff > 0 ? 'credit' : 'debit', Math.abs(diff));
        }}>Balance difference</button>}
      </div>
    </Modal>
  );
}

export default function Journal() {
  const { can } = useAuth();
  const toast = useToast();
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [vt, setVt] = useState('');
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useApi('/journal', { ...range, voucherType: vt, status });
  const [form, setForm] = useState(false);
  const [view, setView] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const cols = [
    { key: 'entryNo', label: 'Entry #' },
    { key: 'date', label: 'Date', fmt: fmtDate },
    { key: 'voucherType', label: 'Type', fmt: cap },
    { key: 'narration', label: 'Narration' },
    { key: 'reference', label: 'Reference' },
    { key: 'totalDebit', label: 'Amount', numeric: true, fmt: money },
    { key: 'status', label: 'Status', fmt: cap, render: (e) => <Badge tone={statusTone(e.status)}>{cap(e.status)}</Badge> },
    { label: 'Actions', noExport: true, render: (e) => (
      <div className="row"><button className="btn sm" onClick={() => setView(e)}>View</button>
        {can('journal', 'void') && e.status === 'posted' && !e.reversalOf && <button className="btn sm danger" onClick={() => setVoidTarget(e)}>Void</button>}</div>) },
  ];
  return (
    <>
      <PageHeader title="Journal & Vouchers" subtitle="Every entry is double-entry. Debit must equal Credit before it can be posted.">
        {can('journal', 'write') && <button className="btn primary" onClick={() => setForm(true)}>+ New voucher</button>}
      </PageHeader>
      <ErrorBox error={error} />
      <div className="toolbar">
        <DateRange {...range} onChange={setRange} />
        <select className="input" style={{ width: 150 }} value={vt} onChange={(e) => setVt(e.target.value)} aria-label="Voucher type"><option value="">All types</option>{['journal', 'payment', 'receipt', 'contra', 'sales', 'purchase', 'expense', 'payroll', 'depreciation', 'opening', 'vat', 'reversal'].map((v) => <option key={v} value={v}>{cap(v)}</option>)}</select>
        <select className="input" style={{ width: 130 }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All status</option><option value="posted">Posted</option><option value="void">Void</option></select>
      </div>
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} rowClass={(e) => (e.status === 'void' ? 'dim' : '')} exportTitle="Journal Entries" exportSubtitle={`${range.from} to ${range.to}`} />}
      {form && <VoucherForm onClose={() => setForm(false)} onDone={() => { setForm(false); reload(); }} />}
      {view && (
        <Modal wide title={`${view.entryNo} - ${cap(view.voucherType)}`} onClose={() => setView(null)}>
          <p className="muted">{fmtDate(view.date)} {view.narration && `| ${view.narration}`} {view.reference && `| Ref: ${view.reference}`}</p>
          <div className="table-wrap"><table className="t"><thead><tr><th>Account</th><th className="r">Debit</th><th className="r">Credit</th><th>Memo</th></tr></thead><tbody>
            {view.lines.map((l, i) => <tr key={i}><td>{l.account?.code} - {l.account?.name}</td><td className="r">{l.debit ? money(l.debit) : ''}</td><td className="r">{l.credit ? money(l.credit) : ''}</td><td>{l.memo}</td></tr>)}
            <tr className="total"><td>Total</td><td className="r">{money(view.totalDebit)}</td><td className="r">{money(view.totalCredit)}</td><td /></tr></tbody></table></div>
          <p className="muted">Posted by {view.createdBy?.name || 'system'}</p>
        </Modal>
      )}
      {voidTarget && <ReasonModal title={`Void ${voidTarget.entryNo}`} message="A reversing entry will be posted. The original stays in the audit trail." confirmLabel="Void entry"
        onConfirm={(reason) => api.post(`/journal/${voidTarget._id}/void`, { reason })} onClose={(ok) => { setVoidTarget(null); if (ok) { toast('Entry voided'); reload(); } }} />}
    </>
  );
}
