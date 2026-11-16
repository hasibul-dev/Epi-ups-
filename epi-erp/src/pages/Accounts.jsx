import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, ErrorBox, Form, Loading, Modal, PageHeader, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { money, cap } from '../lib/format.js';
import { useNavigate } from 'react-router-dom';

const TYPES = ['asset', 'liability', 'equity', 'income', 'expense'].map((v) => ({ value: v, label: cap(v) }));
const SUBS = ['general', 'cash', 'bank', 'receivable', 'payable', 'inventory', 'fixed_asset', 'accum_dep', 'vat_input', 'vat_output', 'cogs'].map((v) => ({ value: v, label: v.replace('_', ' ') }));
const fields = (editing) => [
  { name: 'code', label: 'Account code', required: true },
  { name: 'name', label: 'Account name', required: true },
  { name: 'type', label: 'Type', type: 'select', options: TYPES, required: true, disabled: editing },
  { name: 'subType', label: 'Sub-type', type: 'select', options: SUBS, default: 'general', hint: 'Use "bank" or "cash" for accounts that hold money' },
  { name: 'cashFlowCategory', label: 'Cash-flow category', type: 'select', options: ['operating', 'investing', 'financing'].map((v) => ({ value: v, label: cap(v) })), default: 'operating' },
  { name: 'bankName', label: 'Bank name', hidden: (v) => v.subType !== 'bank' },
  { name: 'accountNumber', label: 'Account number', hidden: (v) => v.subType !== 'bank' },
  { name: 'description', label: 'Description', full: true },
  ...(editing ? [{ name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' }] : []),
];

export default function Accounts() {
  const { can } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [type, setType] = useState('');
  const { data, loading, error, reload } = useApi('/accounts', { withBalance: true, type });
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (v) => {
    setBusy(true); setErr('');
    try {
      modal.row ? await api.put(`/accounts/${modal.row._id}`, v) : await api.post('/accounts', v);
      toast('Account saved'); setModal(null); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const remove = async (a) => {
    if (!confirm(`Delete account ${a.code} ${a.name}?`)) return;
    try { await api.del(`/accounts/${a._id}`); toast('Account deleted'); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  const cols = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Account', render: (a) => <a href="#ledger" onClick={(e) => { e.preventDefault(); nav(`/reports?tab=ledger&account=${a._id}`); }}>{a.name}</a> },
    { key: 'type', label: 'Type', fmt: cap },
    { key: 'subType', label: 'Sub-type', fmt: (v) => v.replace('_', ' ') },
    { key: 'debit', label: 'Debit', numeric: true, fmt: money },
    { key: 'credit', label: 'Credit', numeric: true, fmt: money },
    { key: 'balance', label: 'Balance', numeric: true, fmt: money },
    { key: 'active', label: 'Status', render: (a) => <Badge tone={a.active ? 'green' : 'red'}>{a.active ? 'Active' : 'Inactive'}</Badge>, fmt: (v) => (v ? 'Active' : 'Inactive') },
    ...(can('accounts', 'write') ? [{ label: 'Actions', noExport: true, render: (a) => (
      <div className="row"><button className="btn sm" onClick={() => { setErr(''); setModal({ row: a }); }}>Edit</button>
        {can('accounts', 'void') && !a.sysKey && <button className="btn sm danger" onClick={() => remove(a)}>Delete</button>}</div>) }] : []),
  ];
  return (
    <>
      <PageHeader title="Chart of Accounts" subtitle="Click an account name to open its ledger. Balances come from posted journal entries.">
        {can('accounts', 'write') && <button className="btn primary" onClick={() => { setErr(''); setModal({}); }}>+ New account</button>}
      </PageHeader>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <DataTable rows={data} columns={cols} pageSize={50} exportTitle="Chart of Accounts"
          toolbar={<select className="input" style={{ width: 160 }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type"><option value="">All types</option>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>} />
      )}
      {modal && (
        <Modal title={modal.row ? 'Edit account' : 'New account'} onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form fields={fields(!!modal.row)} initial={modal.row ? { ...modal.row } : { active: true }} onSubmit={save} onCancel={() => setModal(null)} busy={busy} />
        </Modal>
      )}
    </>
  );
}
