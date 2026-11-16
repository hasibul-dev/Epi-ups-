import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, DateRange, ErrorBox, Form, Loading, Modal, PageHeader, ReasonModal, statusTone, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useAccountOptions } from '../lib/hooks.js';
import { cap, fmtDate, monthStart, money, today } from '../lib/format.js';

export default function Expenses() {
  const { can } = useAuth();
  const toast = useToast();
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [account, setAccount] = useState('');
  const { data, loading, error, reload } = useApi('/expenses', { ...range, account });
  const expAcc = useAccountOptions({ type: 'expense' });
  const payAcc = useAccountOptions({ subType: 'cash,bank' });
  const [modal, setModal] = useState(false);
  const [voidT, setVoidT] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (v) => {
    setBusy(true); setErr('');
    try { await api.post('/expenses', v); toast('Expense recorded'); setModal(false); reload(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const live = (data || []).filter((e) => e.status === 'posted');
  const cols = [
    { key: 'number', label: 'No.' }, { key: 'date', label: 'Date', fmt: fmtDate },
    { key: (e) => e.expenseAccount?.name, label: 'Category' }, { key: 'payee', label: 'Payee' }, { key: 'description', label: 'Description' },
    { key: (e) => e.paidFrom?.name, label: 'Paid from' },
    { key: 'amount', label: 'Amount', numeric: true, fmt: money }, { key: 'vat', label: 'VAT', numeric: true, fmt: money },
    { key: 'status', label: 'Status', fmt: cap, render: (e) => <Badge tone={statusTone(e.status)}>{cap(e.status)}</Badge> },
    ...(can('expenses', 'void') ? [{ label: 'Actions', noExport: true, render: (e) => e.status === 'posted' && <button className="btn sm danger" onClick={() => setVoidT(e)}>Void</button> }] : []),
  ];
  return (
    <>
      <PageHeader title="Expense Management" subtitle="Each expense posts Dr Expense (+ Input VAT) / Cr Cash or Bank">
        {can('expenses', 'write') && <button className="btn primary" onClick={() => { setErr(''); setModal(true); }}>+ New expense</button>}
      </PageHeader>
      <ErrorBox error={error} />
      <div className="toolbar"><DateRange {...range} onChange={setRange} />
        <select className="input" style={{ width: 220 }} value={account} onChange={(e) => setAccount(e.target.value)} aria-label="Category"><option value="">All categories</option>{expAcc.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} rowClass={(e) => (e.status === 'void' ? 'dim' : '')} exportTitle="Expenses" exportSubtitle={`${range.from} to ${range.to}`}
        totals={{ Amount: live.reduce((s, e) => s + e.amount, 0), VAT: live.reduce((s, e) => s + e.vat, 0) }} />}
      {modal && (
        <Modal title="New expense" onClose={() => setModal(false)}>
          <ErrorBox error={err} />
          <Form busy={busy} onCancel={() => setModal(false)} onSubmit={submit} fields={[
            { name: 'date', label: 'Date', type: 'date', default: today(), required: true },
            { name: 'expenseAccount', label: 'Expense category', type: 'select', options: expAcc, required: true },
            { name: 'amount', label: 'Amount (excl. VAT)', type: 'number', required: true, min: 0.01 },
            { name: 'vat', label: 'Input VAT (if rebatable)', type: 'number', min: 0, default: 0 },
            { name: 'paidFrom', label: 'Paid from', type: 'select', options: payAcc.filter((a) => ['cash', 'bank'].includes(a.subType)), required: true },
            { name: 'payee', label: 'Payee' }, { name: 'reference', label: 'Reference / voucher no.' },
            { name: 'description', label: 'Description', type: 'textarea', full: true },
          ]} />
        </Modal>
      )}
      {voidT && <ReasonModal title={`Void ${voidT.number}`} message="This reverses the accounting entry." confirmLabel="Void expense"
        onConfirm={(reason) => api.post(`/expenses/${voidT._id}/void`, { reason })} onClose={(ok) => { setVoidT(null); if (ok) { toast('Expense voided'); reload(); } }} />}
    </>
  );
}
