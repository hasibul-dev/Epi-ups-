import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, DateRange, ErrorBox, Field, Loading, Modal, PageHeader, ReasonModal, statusTone, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useAccountOptions, usePartyOptions } from '../lib/hooks.js';
import { cap, fmtDate, money, today } from '../lib/format.js';

function PaymentForm({ kind, onDone, onClose }) {
  const rec = kind === 'receipt';
  const parties = usePartyOptions(rec ? 'customer' : 'supplier');
  const accounts = useAccountOptions({ subType: 'cash,bank' });
  const toast = useToast();
  const [f, setF] = useState({ party: '', date: today(), account: '', amount: '', method: 'cash', reference: '', notes: '' });
  const [alloc, setAlloc] = useState({});
  const { data: open } = useApi(f.party ? (rec ? '/sales-invoices' : '/purchase-bills') : null, { party: f.party });
  const outstanding = (open || []).filter((i) => ['unpaid', 'partial'].includes(i.status));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const allocTotal = Object.values(alloc).reduce((s, v) => s + Number(v || 0), 0);
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const allocations = Object.entries(alloc).filter(([, v]) => Number(v) > 0).map(([invoice, amount]) => ({ invoice, amount: Number(amount) }));
      const p = await api.post(`/payments/${kind}`, { ...f, amount: Number(f.amount), allocations });
      toast(`${p.number} recorded`); onDone();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal wide title={rec ? 'Receive payment from customer' : 'Pay supplier'} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy || !f.party || !f.account || !(Number(f.amount) > 0)} onClick={submit}>{busy ? 'Saving...' : 'Post'}</button></>}>
      <ErrorBox error={err} />
      <div className="form-grid">
        <Field label={rec ? 'Customer *' : 'Supplier *'}><select className="input" value={f.party} onChange={(e) => { setF({ ...f, party: e.target.value }); setAlloc({}); }}><option value="">Select...</option>{parties.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
        <Field label="Date"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label={rec ? 'Deposit to *' : 'Pay from *'}><select className="input" value={f.account} onChange={(e) => setF({ ...f, account: e.target.value })}><option value="">Select cash / bank...</option>{accounts.filter((a) => ['cash', 'bank'].includes(a.subType)).map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></Field>
        <Field label="Amount *"><input type="number" className="input" min="0.01" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Method"><select className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{['cash', 'bank', 'cheque', 'mobile'].map((m) => <option key={m} value={m}>{cap(m)}</option>)}</select></Field>
        <Field label="Reference (cheque / txn no.)"><input className="input" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></Field>
      </div>
      {f.party && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Apply to invoices <small className="muted">(leave blank to apply oldest first)</small></h3>
          {outstanding.length === 0 ? <div className="muted">No open invoices for this party. The amount will be recorded as an advance.</div> : (
            <div className="table-wrap"><table className="t"><thead><tr><th>Invoice</th><th>Date</th><th className="r">Due</th><th style={{ width: 140 }}>Apply</th></tr></thead><tbody>
              {outstanding.map((i) => <tr key={i._id}><td>{i.number}</td><td>{fmtDate(i.date)}</td><td className="r">{money(i.total - i.paid)}</td>
                <td><div className="row" style={{ flexWrap: 'nowrap' }}><input className="input" type="number" min="0" step="0.01" max={i.total - i.paid} value={alloc[i._id] || ''} onChange={(e) => setAlloc({ ...alloc, [i._id]: e.target.value })} />
                  <button className="btn sm" onClick={() => setAlloc({ ...alloc, [i._id]: i.total - i.paid })}>Full</button></div></td></tr>)}
            </tbody></table></div>)}
          {allocTotal > 0 && <p className={allocTotal > Number(f.amount || 0) ? 'neg' : 'muted'}>Applied {money(allocTotal)} of {money(Number(f.amount || 0))}</p>}
        </div>
      )}
    </Modal>
  );
}

export default function Payments() {
  const { can } = useAuth();
  const toast = useToast();
  const [range, setRange] = useState({ from: '', to: '' });
  const [type, setType] = useState('');
  const { data, loading, error, reload } = useApi('/payments', { ...range, type });
  const [form, setForm] = useState(null);
  const [voidT, setVoidT] = useState(null);
  const live = (data || []).filter((p) => p.status === 'posted');
  const cols = [
    { key: 'number', label: 'Voucher' }, { key: 'date', label: 'Date', fmt: fmtDate },
    { key: 'type', label: 'Type', fmt: (v) => (v === 'receipt' ? 'Receipt' : 'Payment') },
    { key: (p) => p.party?.name, label: 'Party' }, { key: (p) => p.account?.name, label: 'Cash / Bank' }, { key: 'method', label: 'Method', fmt: cap }, { key: 'reference', label: 'Reference' },
    { key: 'amount', label: 'Amount', numeric: true, fmt: money },
    { key: 'status', label: 'Status', fmt: cap, render: (p) => <Badge tone={statusTone(p.status)}>{cap(p.status)}</Badge> },
    ...(can('payments', 'void') ? [{ label: 'Actions', noExport: true, render: (p) => p.status === 'posted' && <button className="btn sm danger" onClick={() => setVoidT(p)}>Void</button> }] : []),
  ];
  return (
    <>
      <PageHeader title="Receipts & Payments" subtitle="Customer receipts reduce receivables; supplier payments reduce payables">
        {can('payments', 'write') && <><button className="btn blue" onClick={() => setForm('receipt')}>+ Receive from customer</button><button className="btn primary" onClick={() => setForm('payment')}>+ Pay supplier</button></>}
      </PageHeader>
      <ErrorBox error={error} />
      <div className="toolbar"><DateRange {...range} onChange={setRange} />
        <select className="input" style={{ width: 150 }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Type"><option value="">All types</option><option value="receipt">Receipts</option><option value="payment">Payments</option></select></div>
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} rowClass={(p) => (p.status === 'void' ? 'dim' : '')} exportTitle="Receipts and Payments" totals={{ Amount: live.reduce((s, p) => s + p.amount, 0) }} />}
      {form && <PaymentForm kind={form} onClose={() => setForm(null)} onDone={() => { setForm(null); reload(); }} />}
      {voidT && <ReasonModal title={`Void ${voidT.number}`} message="The entry is reversed and invoice balances are restored." confirmLabel="Void"
        onConfirm={(reason) => api.post(`/payments/${voidT._id}/void`, { reason })} onClose={(ok) => { setVoidT(null); if (ok) { toast('Payment voided'); reload(); } }} />}
    </>
  );
}
