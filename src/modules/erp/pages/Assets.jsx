import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, ErrorBox, Form, Loading, Modal, PageHeader, Stat, statusTone, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useAccountOptions } from '../lib/hooks.js';
import { cap, fmtDate, money, thisMonth, today } from '../lib/format.js';

export default function Assets() {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/assets');
  const accounts = useAccountOptions({ subType: 'cash,bank' });
  const cb = accounts.filter((a) => ['cash', 'bank'].includes(a.subType));
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn, msg) => { setBusy(true); setErr(''); try { const r = await fn(); toast(typeof msg === 'function' ? msg(r) : msg); setModal(null); reload(); } catch (e) { setErr(e.message); } finally { setBusy(false); } };
  const live = (data || []).filter((a) => a.status === 'active');
  const cols = [
    { key: 'code', label: 'Code' }, { key: 'name', label: 'Asset' }, { key: 'category', label: 'Category' }, { key: 'purchaseDate', label: 'Purchased', fmt: fmtDate },
    { key: 'method', label: 'Method', fmt: (v, a) => (v === 'SL' ? `Straight-line ${a.usefulLifeYears}y` : `WDV ${a.rate}%`) },
    { key: 'cost', label: 'Cost', numeric: true, fmt: money }, { key: 'accumulatedDep', label: 'Accum. dep.', numeric: true, fmt: money },
    { key: (a) => a.cost - a.accumulatedDep, label: 'Book value', numeric: true, fmt: money },
    { key: 'status', label: 'Status', fmt: cap, render: (a) => <Badge tone={statusTone(a.status)}>{cap(a.status)}</Badge> },
    ...(can('assets', 'void') ? [{ label: 'Actions', noExport: true, render: (a) => a.status === 'active' && <button className="btn sm danger" onClick={() => { setErr(''); setModal({ kind: 'dispose', row: a }); }}>Dispose</button> }] : []),
  ];
  return (
    <>
      <PageHeader title="Fixed Asset Management" subtitle="Cost, depreciation and disposal, all posted to the ledger">
        {can('assets', 'write') && <><button className="btn blue" onClick={() => { setErr(''); setModal({ kind: 'dep' }); }}>Run depreciation</button><button className="btn primary" onClick={() => { setErr(''); setModal({ kind: 'new' }); }}>+ New asset</button></>}
      </PageHeader>
      <ErrorBox error={error} />
      <div className="grid g3" style={{ marginBottom: 14 }}>
        <Stat label="Total cost (active)" value={money(live.reduce((s, a) => s + a.cost, 0))} accent="#2f6bff" />
        <Stat label="Accumulated depreciation" value={money(live.reduce((s, a) => s + a.accumulatedDep, 0))} accent="#e5202e" />
        <Stat label="Net book value" value={money(live.reduce((s, a) => s + a.cost - a.accumulatedDep, 0))} accent="#22c55e" />
      </div>
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} exportTitle="Fixed Asset Register" rowClass={(a) => (a.status === 'disposed' ? 'dim' : '')} />}
      {modal?.kind === 'new' && (
        <Modal wide title="New fixed asset" onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form busy={busy} onCancel={() => setModal(null)} onSubmit={(v) => run(() => api.post('/assets', v), 'Asset added')} fields={[
            { name: 'name', label: 'Asset name', required: true }, { name: 'category', label: 'Category', placeholder: 'Vehicle, Furniture, Equipment...' },
            { name: 'purchaseDate', label: 'Purchase date', type: 'date', default: today(), required: true }, { name: 'cost', label: 'Cost', type: 'number', required: true, min: 0.01 },
            { name: 'salvage', label: 'Salvage value', type: 'number', min: 0, default: 0 }, { name: 'usefulLifeYears', label: 'Useful life (years)', type: 'number', step: '1', min: 1, default: 5, required: true },
            { name: 'method', label: 'Depreciation method', type: 'select', required: true, default: 'SL', options: [{ value: 'SL', label: 'Straight-line' }, { value: 'WDV', label: 'Written-down value' }] },
            { name: 'rate', label: 'WDV rate (% / year)', type: 'number', min: 0, hidden: (v) => v.method !== 'WDV' },
            { name: 'paidFrom', label: 'Paid from', type: 'select', options: cb, required: true, full: true },
          ]} />
        </Modal>
      )}
      {modal?.kind === 'dep' && (
        <Modal title="Run monthly depreciation" onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <p className="muted" style={{ marginTop: 0 }}>Posts Dr Depreciation Expense / Cr Accumulated Depreciation for every active asset not yet depreciated in the chosen month.</p>
          <Form busy={busy} submitLabel="Run" onCancel={() => setModal(null)} onSubmit={(v) => run(() => api.post('/assets/depreciate', v), (r) => `Depreciation ${money(r.total)} posted`)} fields={[{ name: 'month', label: 'Month', type: 'month', default: thisMonth(), required: true }]} />
        </Modal>
      )}
      {modal?.kind === 'dispose' && (
        <Modal title={`Dispose ${modal.row.name}`} onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <p className="muted" style={{ marginTop: 0 }}>Book value {money(modal.row.cost - modal.row.accumulatedDep)}. Any difference from the sale proceeds is posted as gain (other income) or loss (miscellaneous expense).</p>
          <Form busy={busy} submitLabel="Dispose" onCancel={() => setModal(null)} onSubmit={(v) => run(() => api.post(`/assets/${modal.row._id}/dispose`, v), 'Asset disposed')} fields={[
            { name: 'date', label: 'Date', type: 'date', default: today(), required: true }, { name: 'proceeds', label: 'Sale proceeds', type: 'number', min: 0, default: 0 },
            { name: 'account', label: 'Proceeds received in', type: 'select', options: cb, hint: 'Required if proceeds > 0' }]} />
        </Modal>
      )}
    </>
  );
}
