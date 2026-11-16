import { useState } from 'react';
import DataTable, { ExportMenu } from '../components/DataTable.jsx';
import { Badge, ErrorBox, Form, Loading, Modal, PageHeader, Stat, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { fmtDate, money, today } from '../lib/format.js';

export default function Parties({ type }) {
  const { can } = useAuth();
  const toast = useToast();
  const cust = type === 'customer';
  const mod = cust ? 'sales' : 'purchase';
  const label = cust ? 'Customer' : 'Supplier';
  const { data, loading, error, reload } = useApi('/parties', { type, withBalance: true });
  const [modal, setModal] = useState(null);
  const [stmt, setStmt] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const fields = (editing) => [
    { name: 'name', label: `${label} name`, required: true, full: true },
    { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', full: true },
    { name: 'bin', label: 'BIN (VAT no.)' }, { name: 'tin', label: 'TIN' },
    ...(cust ? [{ name: 'creditLimit', label: 'Credit limit (0 = none)', type: 'number', min: 0, default: 0 }] : []),
    { name: 'creditDays', label: 'Payment terms (days)', type: 'number', step: '1', min: 0, default: 30 },
    ...(!editing ? [{ name: 'openingBalance', label: 'Opening balance', type: 'number', min: 0, default: 0, hint: cust ? 'Amount the customer already owes you' : 'Amount you already owe the supplier' }, { name: 'openingDate', label: 'Opening balance date', type: 'date', default: today() }] : [{ name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' }]),
  ];
  const submit = async (v) => {
    setBusy(true); setErr('');
    try {
      modal.row ? await api.put(`/parties/${modal.row._id}`, v) : await api.post('/parties', { ...v, type });
      toast(`${label} saved`); setModal(null); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const remove = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    try { await api.del(`/parties/${p._id}`); toast('Deleted'); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  const openStmt = async (p) => { try { setStmt(await api.get(`/parties/${p._id}/statement`)); } catch (e) { toast(e.message, 'err'); } };
  const total = (data || []).reduce((s, p) => s + p.balance, 0);
  const cols = [
    { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'bin', label: 'BIN' },
    ...(cust ? [{ key: 'creditLimit', label: 'Credit limit', numeric: true, fmt: money }] : []),
    { key: 'balance', label: cust ? 'Receivable' : 'Payable', numeric: true, fmt: money },
    { key: 'active', label: 'Status', fmt: (v) => (v ? 'Active' : 'Inactive'), render: (p) => <Badge tone={p.active ? 'green' : 'red'}>{p.active ? 'Active' : 'Inactive'}</Badge> },
    { label: 'Actions', noExport: true, render: (p) => (
      <div className="row"><button className="btn sm" onClick={() => openStmt(p)}>Statement</button>
        {can(mod, 'write') && <button className="btn sm" onClick={() => { setErr(''); setModal({ row: p }); }}>Edit</button>}
        {can(mod, 'void') && <button className="btn sm danger" onClick={() => remove(p)}>Delete</button>}</div>) },
  ];
  return (
    <>
      <PageHeader title={`${label}s`} subtitle={`${label} accounts with live ${cust ? 'receivable' : 'payable'} balances`}>
        {can(mod, 'write') && <button className="btn primary" onClick={() => { setErr(''); setModal({}); }}>+ New {label.toLowerCase()}</button>}
      </PageHeader>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <>
          <div className="grid g3" style={{ marginBottom: 14 }}><Stat label={`${label}s`} value={data.length} accent="#2f6bff" /><Stat label={cust ? 'Total receivable' : 'Total payable'} value={money(total)} accent="#e5202e" /></div>
          <DataTable rows={data} columns={cols} exportTitle={`${label} List`} />
        </>
      )}
      {modal && (
        <Modal title={modal.row ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`} onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form fields={fields(!!modal.row)} initial={modal.row || {}} onSubmit={submit} onCancel={() => setModal(null)} busy={busy} />
        </Modal>
      )}
      {stmt && (
        <Modal wide title={`Statement - ${stmt.party.name}`} onClose={() => setStmt(null)}>
          <div className="toolbar"><span className="muted">Opening balance {money(stmt.opening)}</span><div className="grow" />
            <ExportMenu title={`Statement - ${stmt.party.name}`} rows={stmt.rows} columns={[
              { key: 'date', label: 'Date', fmt: fmtDate }, { key: 'ref', label: 'Ref' }, { key: 'desc', label: 'Description' },
              { key: 'debit', label: 'Debit', numeric: true, fmt: money }, { key: 'credit', label: 'Credit', numeric: true, fmt: money }, { key: 'balance', label: 'Balance', numeric: true, fmt: money }]} /></div>
          <div className="table-wrap"><table className="t"><thead><tr><th>Date</th><th>Ref</th><th>Description</th><th className="r">Debit</th><th className="r">Credit</th><th className="r">Balance</th></tr></thead><tbody>
            {stmt.rows.map((r, i) => <tr key={i}><td>{fmtDate(r.date)}</td><td>{r.ref}</td><td>{r.desc}</td><td className="r">{r.debit ? money(r.debit) : ''}</td><td className="r">{r.credit ? money(r.credit) : ''}</td><td className="r">{money(r.balance)}</td></tr>)}
            <tr className="total"><td colSpan={5}>Closing balance</td><td className="r">{money(stmt.closing)}</td></tr></tbody></table></div>
        </Modal>
      )}
    </>
  );
}
