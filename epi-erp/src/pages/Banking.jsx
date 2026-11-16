import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import { ErrorBox, Form, Loading, Modal, PageHeader, Stat, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { money, today, cap } from '../lib/format.js';

export default function Banking() {
  const { can } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { data, loading, error, reload } = useApi('/reports/banking');
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const opts = (data?.accounts || []).filter((a) => a.active).map((a) => ({ value: a._id, label: `${a.name} (${money(a.balance)})` }));
  const submit = async (v) => {
    setBusy(true); setErr('');
    try {
      if (modal === 'account') await api.post('/accounts', { ...v, type: 'asset', cashFlowCategory: 'operating', code: v.code });
      else {
        if (v.from === v.to) throw new Error('Choose two different accounts');
        await api.post('/journal', { date: v.date, voucherType: 'contra', narration: v.narration || 'Fund transfer', reference: v.reference, lines: [{ account: v.to, debit: v.amount }, { account: v.from, credit: v.amount }] });
      }
      toast(modal === 'account' ? 'Account added' : 'Transfer posted'); setModal(null); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const cols = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Account', render: (a) => <a href="#l" onClick={(e) => { e.preventDefault(); nav(`/reports?tab=ledger&account=${a._id}`); }}>{a.name}</a> },
    { key: 'subType', label: 'Kind', fmt: cap },
    { key: 'bankName', label: 'Bank' }, { key: 'accountNumber', label: 'Account no.' },
    { key: 'debit', label: 'Total in', numeric: true, fmt: money },
    { key: 'credit', label: 'Total out', numeric: true, fmt: money },
    { key: 'balance', label: 'Balance', numeric: true, fmt: money },
  ];
  return (
    <>
      <PageHeader title="Cash & Bank Management" subtitle="Balances are the live ledger balances of your cash and bank accounts">
        {can('journal', 'write') && <button className="btn blue" onClick={() => { setErr(''); setModal('transfer'); }}>Transfer funds</button>}
        {can('accounts', 'write') && <button className="btn primary" onClick={() => { setErr(''); setModal('account'); }}>+ Bank / cash account</button>}
      </PageHeader>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <>
          <div className="grid g3" style={{ marginBottom: 14 }}>
            <Stat label="Cash in hand" value={money(data.cash)} accent="#22c55e" />
            <Stat label="Bank balance" value={money(data.bank)} accent="#2f6bff" />
            <Stat label="Total liquid funds" value={money(data.total)} accent="#e5202e" />
          </div>
          <DataTable rows={data.accounts} columns={cols} exportTitle="Cash and Bank Accounts" />
        </>
      )}
      {modal === 'account' && (
        <Modal title="New cash / bank account" onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form busy={busy} onCancel={() => setModal(null)} onSubmit={submit} fields={[
            { name: 'code', label: 'Account code', required: true, hint: 'e.g. 1011' }, { name: 'name', label: 'Account name', required: true },
            { name: 'subType', label: 'Kind', type: 'select', required: true, default: 'bank', options: [{ value: 'bank', label: 'Bank' }, { value: 'cash', label: 'Cash' }] },
            { name: 'bankName', label: 'Bank name' }, { name: 'accountNumber', label: 'Account number' },
          ]} />
        </Modal>
      )}
      {modal === 'transfer' && (
        <Modal title="Transfer between cash / bank accounts" onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form busy={busy} onCancel={() => setModal(null)} onSubmit={submit} submitLabel="Post transfer" fields={[
            { name: 'from', label: 'From account', type: 'select', options: opts, required: true }, { name: 'to', label: 'To account', type: 'select', options: opts, required: true },
            { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0.01 }, { name: 'date', label: 'Date', type: 'date', default: today(), required: true },
            { name: 'reference', label: 'Reference' }, { name: 'narration', label: 'Narration' },
          ]} />
        </Modal>
      )}
    </>
  );
}
