import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, ErrorBox, Form, Loading, Modal, PageHeader, Stat, Tabs, useApi, useToast, DateRange } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { cap, fmtDate, money, qty, today } from '../lib/format.js';

export default function Inventory() {
  const { can } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('items');
  const items = useApi('/items');
  const val = useApi('/reports/stock-valuation');
  const [range, setRange] = useState({ from: '', to: '' });
  const moves = useApi(tab === 'moves' ? '/stock-movements' : null, range);
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = () => { items.reload(); val.reload(); moves.reload(); };
  const run = async (fn, msg) => {
    setBusy(true); setErr('');
    try { await fn(); toast(msg); setModal(null); refresh(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const itemFields = (editing) => [
    { name: 'sku', label: 'SKU / code', required: true }, { name: 'name', label: 'Item name', required: true },
    { name: 'category', label: 'Category', placeholder: 'e.g. Online UPS, Battery, IPS' }, { name: 'unit', label: 'Unit', default: 'pcs' },
    { name: 'salePrice', label: 'Sale price', type: 'number', min: 0, default: 0 }, { name: 'vatRate', label: 'VAT %', type: 'number', default: 15, min: 0 },
    { name: 'reorderLevel', label: 'Reorder level', type: 'number', step: '1', min: 0, default: 0 },
    ...(editing ? [{ name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' }]
      : [{ name: 'openingQty', label: 'Opening quantity', type: 'number', step: 'any', min: 0, default: 0 }, { name: 'openingCost', label: 'Opening unit cost', type: 'number', min: 0, default: 0 }]),
  ];
  const remove = async (i) => { if (confirm(`Delete ${i.name}?`)) try { await api.del(`/items/${i._id}`); toast('Deleted'); refresh(); } catch (e) { toast(e.message, 'err'); } };
  const itemOpts = (items.data || []).filter((i) => i.active).map((i) => ({ value: i._id, label: `${i.sku} - ${i.name} (${qty(i.qtyOnHand)} on hand)` }));
  const cols = [
    { key: 'sku', label: 'SKU' }, { key: 'name', label: 'Item' }, { key: 'category', label: 'Category' }, { key: 'unit', label: 'Unit' },
    { key: 'qtyOnHand', label: 'On hand', numeric: true, fmt: qty }, { key: 'reorderLevel', label: 'Reorder at', numeric: true, fmt: qty },
    { key: 'avgCost', label: 'Avg cost', numeric: true, fmt: money }, { key: 'salePrice', label: 'Sale price', numeric: true, fmt: money },
    { key: (i) => i.qtyOnHand * i.avgCost, label: 'Stock value', numeric: true, fmt: money },
    { key: (i) => (i.qtyOnHand <= i.reorderLevel ? 'Low' : 'OK'), label: 'Stock', render: (i) => (i.qtyOnHand <= i.reorderLevel ? <Badge tone="red">Low</Badge> : <Badge tone="green">OK</Badge>) },
    ...(can('inventory', 'write') ? [{ label: 'Actions', noExport: true, render: (i) => (
      <div className="row"><button className="btn sm" onClick={() => { setErr(''); setModal({ kind: 'item', row: i }); }}>Edit</button>
        {can('inventory', 'void') && <button className="btn sm danger" onClick={() => remove(i)}>Delete</button>}</div>) }] : []),
  ];
  const mcols = [
    { key: 'date', label: 'Date', fmt: fmtDate }, { key: (m) => m.item?.sku, label: 'SKU' }, { key: (m) => m.item?.name, label: 'Item' },
    { key: 'type', label: 'Type', fmt: (v) => cap(v.replace('_', ' ')) }, { key: 'qty', label: 'Qty', numeric: true, fmt: qty },
    { key: 'unitCost', label: 'Unit cost', numeric: true, fmt: money }, { key: 'reference', label: 'Reference' }, { key: 'note', label: 'Note' },
  ];
  return (
    <>
      <PageHeader title="Inventory & Stock" subtitle="Weighted-average costing. Stock moves automatically with sales and purchases.">
        {can('inventory', 'write') && <><button className="btn blue" onClick={() => { setErr(''); setModal({ kind: 'adjust' }); }}>Stock adjustment</button><button className="btn primary" onClick={() => { setErr(''); setModal({ kind: 'item' }); }}>+ New item</button></>}
      </PageHeader>
      <ErrorBox error={items.error || val.error} />
      {val.data && <div className="grid g3" style={{ marginBottom: 14 }}><Stat label="Stock value" value={money(val.data.totalValue)} accent="#14b8a6" /><Stat label="Active items" value={val.data.rows.length} accent="#2f6bff" /><Stat label="Below reorder level" value={val.data.lowCount} tone={val.data.lowCount ? 'neg' : 'pos'} accent="#e5202e" /></div>}
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'items', label: 'Items' }, { value: 'moves', label: 'Stock movements' }]} />
      {tab === 'items' && (items.loading ? <Loading /> : <DataTable rows={items.data} columns={cols} exportTitle="Inventory Items" rowClass={(i) => (i.active ? '' : 'dim')} totals={{ 'Stock value': (items.data || []).reduce((s, i) => s + i.qtyOnHand * i.avgCost, 0) }} />)}
      {tab === 'moves' && (<><div className="toolbar"><DateRange {...range} onChange={setRange} /></div>{moves.loading ? <Loading /> : <DataTable rows={moves.data || []} columns={mcols} exportTitle="Stock Movements" />}</>)}
      {modal?.kind === 'item' && (
        <Modal title={modal.row ? 'Edit item' : 'New item'} onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form busy={busy} fields={itemFields(!!modal.row)} initial={modal.row || {}} onCancel={() => setModal(null)}
            onSubmit={(v) => run(() => (modal.row ? api.put(`/items/${modal.row._id}`, v) : api.post('/items', v)), 'Item saved')} />
        </Modal>
      )}
      {modal?.kind === 'adjust' && (
        <Modal title="Stock adjustment" onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <p className="muted" style={{ marginTop: 0 }}>Adjustments post to the inventory and cost-of-goods-sold accounts at average cost.</p>
          <Form busy={busy} onCancel={() => setModal(null)} submitLabel="Post adjustment" onSubmit={(v) => run(() => api.post('/stock-adjustments', v), 'Adjustment posted')} fields={[
            { name: 'item', label: 'Item', type: 'select', options: itemOpts, required: true, full: true },
            { name: 'direction', label: 'Direction', type: 'select', required: true, options: [{ value: 'in', label: 'Increase (found / gain)' }, { value: 'out', label: 'Decrease (damage / loss)' }] },
            { name: 'qty', label: 'Quantity', type: 'number', step: 'any', required: true, min: 0.001 },
            { name: 'unitCost', label: 'Unit cost (increase only)', type: 'number', min: 0, hint: 'Blank = current average cost' },
            { name: 'date', label: 'Date', type: 'date', default: today() },
            { name: 'note', label: 'Reason', required: true, full: true },
          ]} />
        </Modal>
      )}
    </>
  );
}
