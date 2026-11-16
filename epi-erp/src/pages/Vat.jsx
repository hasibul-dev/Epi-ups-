import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { DateRange, ErrorBox, Form, Loading, Modal, PageHeader, Stat, Tabs, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useAccountOptions } from '../lib/hooks.js';
import { fmtDate, monthStart, money, today } from '../lib/format.js';

export default function Vat() {
  const { can } = useAuth();
  const toast = useToast();
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [tab, setTab] = useState('summary');
  const sum = useApi('/vat/summary', range);
  const reg = useApi('/vat/register', range);
  const accounts = useAccountOptions({ subType: 'cash,bank' });
  const [modal, setModal] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const settle = async (v) => {
    setBusy(true); setErr('');
    try {
      const r = await api.post('/vat/settle', v);
      toast(r.payable > 0 ? `VAT of ${money(r.payable)} paid` : `Input VAT offset. ${money(r.carryForwardInput)} carried forward`); setModal(false); sum.reload(); reg.reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const s = sum.data;
  const cols = [
    { key: 'date', label: 'Date', fmt: fmtDate }, { key: 'type', label: 'Type' }, { key: 'number', label: 'Document' }, { key: 'party', label: 'Party / payee' }, { key: 'bin', label: 'BIN' },
    { key: 'taxable', label: 'Taxable value', numeric: true, fmt: money }, { key: 'vat', label: 'VAT', numeric: true, fmt: money },
  ];
  return (
    <>
      <PageHeader title="VAT & Tax Management" subtitle="Bangladesh VAT: output VAT on sales, rebatable input VAT on purchases and expenses (Mushak-9.1 working figures)">
        {can('vat', 'write') && <button className="btn primary" onClick={() => { setErr(''); setModal(true); }}>Settle VAT</button>}
      </PageHeader>
      <ErrorBox error={sum.error || reg.error} />
      <div className="toolbar"><DateRange {...range} onChange={setRange} /></div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'summary', label: 'Summary' }, { value: 'register', label: 'VAT register' }]} />
      {tab === 'summary' && (sum.loading ? <Loading /> : (
        <>
          <div className="grid g4" style={{ marginBottom: 14 }}>
            <Stat label="Output VAT (sales)" value={money(s.output.vat)} sub={`On taxable sales ${money(s.output.taxable)} | ${s.output.documents} invoices`} accent="#e5202e" />
            <Stat label="Input VAT (purchases)" value={money(s.input.purchases.vat)} sub={`${s.input.purchases.documents} bills`} accent="#2f6bff" />
            <Stat label="Input VAT (expenses)" value={money(s.input.expenses.vat)} sub={`${s.input.expenses.documents} expenses`} accent="#14b8a6" />
            <Stat label="Net VAT for period" value={money(s.netPayable)} tone={s.netPayable > 0 ? 'neg' : 'pos'} sub={s.netPayable > 0 ? 'Payable' : 'Refundable / carry forward'} accent="#f5a524" />
          </div>
          <div className="grid g2">
            <Stat label="Ledger: VAT payable balance (to date)" value={money(s.ledger.outputBalance)} sub="Account 2100" accent="#e5202e" />
            <Stat label="Ledger: VAT input balance (to date)" value={money(s.ledger.inputBalance)} sub={`Account 1300 | Net ${money(s.ledger.netPayable)}`} accent="#2f6bff" />
          </div>
        </>
      ))}
      {tab === 'register' && (reg.loading ? <Loading /> : <DataTable rows={reg.data} columns={cols} exportTitle="VAT Register" exportSubtitle={`${range.from} to ${range.to}`}
        totals={{ 'Taxable value': (reg.data || []).reduce((t, r) => t + r.taxable, 0), VAT: (reg.data || []).reduce((t, r) => t + (r.type.startsWith('Output') ? r.vat : -r.vat), 0) }} />)}
      {modal && (
        <Modal title="Settle VAT" onClose={() => setModal(false)}>
          <ErrorBox error={err} />
          <p className="muted" style={{ marginTop: 0 }}>Offsets input VAT against output VAT up to the selected date and pays any balance from the account you choose. If input exceeds output, the excess is carried forward.</p>
          <Form busy={busy} onCancel={() => setModal(false)} submitLabel="Post settlement" onSubmit={settle} fields={[
            { name: 'date', label: 'Settle as of', type: 'date', default: today(), required: true },
            { name: 'account', label: 'Pay VAT from', type: 'select', options: accounts.filter((a) => ['cash', 'bank'].includes(a.subType)), hint: 'Needed only when VAT is payable' },
          ]} />
        </Modal>
      )}
    </>
  );
}
