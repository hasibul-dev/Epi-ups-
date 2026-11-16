import { useState } from 'react';
import DataTable, { ExportMenu } from '../components/DataTable.jsx';
import { Badge, ErrorBox, Form, Loading, Modal, PageHeader, ReasonModal, Stat, Tabs, statusTone, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useAccountOptions } from '../lib/hooks.js';
import { cap, fmtDate, money, thisMonth, today } from '../lib/format.js';

export default function Payroll() {
  const { can } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('employees');
  const emps = useApi('/employees');
  const runs = useApi('/payroll');
  const accounts = useAccountOptions({ subType: 'cash,bank' });
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [voidT, setVoidT] = useState(null);
  const refresh = () => { emps.reload(); runs.reload(); };
  const run = async (fn, msg) => { setBusy(true); setErr(''); try { await fn(); toast(msg); setModal(null); refresh(); } catch (e) { setErr(e.message); } finally { setBusy(false); } };
  const active = (emps.data || []).filter((e) => e.active);
  const gross = (e) => e.basic + e.houseRent + e.medical + e.conveyance + e.otherAllowance;
  const empFields = [
    { name: 'empId', label: 'Employee ID', required: true }, { name: 'name', label: 'Full name', required: true },
    { name: 'designation', label: 'Designation' }, { name: 'department', label: 'Department' },
    { name: 'phone', label: 'Phone' }, { name: 'nid', label: 'NID' }, { name: 'joinDate', label: 'Joining date', type: 'date' },
    { name: 'basic', label: 'Basic salary', type: 'number', required: true, min: 0, default: 0 }, { name: 'houseRent', label: 'House rent', type: 'number', min: 0, default: 0 },
    { name: 'medical', label: 'Medical', type: 'number', min: 0, default: 0 }, { name: 'conveyance', label: 'Conveyance', type: 'number', min: 0, default: 0 },
    { name: 'otherAllowance', label: 'Other allowance', type: 'number', min: 0, default: 0 }, { name: 'taxDeduction', label: 'Monthly income-tax (TDS)', type: 'number', min: 0, default: 0 },
    { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active', default: true },
  ];
  const ecols = [
    { key: 'empId', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'designation', label: 'Designation' }, { key: 'department', label: 'Department' },
    { key: 'basic', label: 'Basic', numeric: true, fmt: money }, { key: gross, label: 'Gross', numeric: true, fmt: money }, { key: 'taxDeduction', label: 'TDS', numeric: true, fmt: money },
    { key: 'active', label: 'Status', fmt: (v) => (v ? 'Active' : 'Inactive'), render: (e) => <Badge tone={e.active ? 'green' : 'red'}>{e.active ? 'Active' : 'Inactive'}</Badge> },
    ...(can('payroll', 'write') ? [{ label: 'Actions', noExport: true, render: (e) => <button className="btn sm" onClick={() => { setErr(''); setModal({ kind: 'emp', row: e }); }}>Edit</button> }] : []),
  ];
  const rcols = [
    { key: (r) => r.month.split('#')[0], label: 'Month' }, { key: 'totalGross', label: 'Gross', numeric: true, fmt: money }, { key: 'totalTax', label: 'TDS', numeric: true, fmt: money },
    { key: 'totalNet', label: 'Net pay', numeric: true, fmt: money }, { key: (r) => r.lines.length, label: 'Employees', numeric: true },
    { key: 'paidDate', label: 'Paid on', fmt: fmtDate }, { key: 'status', label: 'Status', fmt: cap, render: (r) => <Badge tone={statusTone(r.status)}>{cap(r.status)}</Badge> },
    { label: 'Actions', noExport: true, render: (r) => (
      <div className="row"><button className="btn sm" onClick={() => setModal({ kind: 'sheet', row: r })}>Payslips</button>
        {can('payroll', 'write') && r.status === 'processed' && <button className="btn sm blue" onClick={() => { setErr(''); setModal({ kind: 'pay', row: r }); }}>Pay</button>}
        {can('payroll', 'void') && r.status === 'processed' && <button className="btn sm danger" onClick={() => setVoidT(r)}>Void</button>}</div>) },
  ];
  return (
    <>
      <PageHeader title="Employees & Payroll" subtitle="Processing posts Dr Salaries / Cr TDS Payable + Salaries Payable. Paying clears Salaries Payable from cash or bank.">
        {can('payroll', 'write') && <><button className="btn blue" onClick={() => { setErr(''); setModal({ kind: 'process' }); }}>Process payroll</button><button className="btn primary" onClick={() => { setErr(''); setModal({ kind: 'emp' }); }}>+ New employee</button></>}
      </PageHeader>
      <ErrorBox error={emps.error || runs.error} />
      <div className="grid g3" style={{ marginBottom: 14 }}><Stat label="Active employees" value={active.length} accent="#2f6bff" /><Stat label="Monthly gross payroll" value={money(active.reduce((s, e) => s + gross(e), 0))} accent="#e5202e" /><Stat label="Monthly net payroll" value={money(active.reduce((s, e) => s + gross(e) - e.taxDeduction, 0))} accent="#22c55e" /></div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'employees', label: 'Employees' }, { value: 'runs', label: 'Payroll runs' }]} />
      {tab === 'employees' && (emps.loading ? <Loading /> : <DataTable rows={emps.data} columns={ecols} exportTitle="Employees" rowClass={(e) => (e.active ? '' : 'dim')} />)}
      {tab === 'runs' && (runs.loading ? <Loading /> : <DataTable rows={runs.data} columns={rcols} exportTitle="Payroll Runs" rowClass={(r) => (r.status === 'void' ? 'dim' : '')} />)}
      {modal?.kind === 'emp' && (
        <Modal title={modal.row ? 'Edit employee' : 'New employee'} onClose={() => setModal(null)} wide>
          <ErrorBox error={err} />
          <Form busy={busy} fields={empFields} initial={modal.row ? { ...modal.row, joinDate: modal.row.joinDate?.slice(0, 10) } : {}} onCancel={() => setModal(null)}
            onSubmit={(v) => run(() => (modal.row ? api.put(`/employees/${modal.row._id}`, v) : api.post('/employees', v)), 'Employee saved')} />
        </Modal>
      )}
      {modal?.kind === 'process' && (
        <Modal title="Process monthly payroll" onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <p className="muted" style={{ marginTop: 0 }}>Uses the current salary structure of all active employees. The entry is dated the last day of the month.</p>
          <Form busy={busy} submitLabel="Process" onCancel={() => setModal(null)} onSubmit={(v) => run(() => api.post('/payroll/process', v), 'Payroll processed')} fields={[{ name: 'month', label: 'Month', type: 'month', default: thisMonth(), required: true }]} />
        </Modal>
      )}
      {modal?.kind === 'pay' && (
        <Modal title={`Pay salaries - ${modal.row.month}`} onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <p style={{ marginTop: 0 }}>Net payable: <b>{money(modal.row.totalNet)}</b></p>
          <Form busy={busy} submitLabel="Pay now" onCancel={() => setModal(null)} onSubmit={(v) => run(() => api.post(`/payroll/${modal.row._id}/pay`, v), 'Salaries paid')} fields={[
            { name: 'account', label: 'Pay from', type: 'select', required: true, options: accounts.filter((a) => ['cash', 'bank'].includes(a.subType)) }, { name: 'date', label: 'Payment date', type: 'date', default: today() }]} />
        </Modal>
      )}
      {modal?.kind === 'sheet' && (
        <Modal wide title={`Payroll sheet - ${modal.row.month.split('#')[0]}`} onClose={() => setModal(null)}>
          <div className="toolbar"><div className="grow" /><ExportMenu title={`Payroll ${modal.row.month.split('#')[0]}`} rows={modal.row.lines} columns={[
            { key: 'empId', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'basic', label: 'Basic', numeric: true, fmt: money }, { key: 'allowances', label: 'Allowances', numeric: true, fmt: money },
            { key: 'gross', label: 'Gross', numeric: true, fmt: money }, { key: 'tax', label: 'TDS', numeric: true, fmt: money }, { key: 'net', label: 'Net pay', numeric: true, fmt: money }]} /></div>
          <div className="table-wrap"><table className="t"><thead><tr><th>ID</th><th>Name</th><th className="r">Basic</th><th className="r">Allowances</th><th className="r">Gross</th><th className="r">TDS</th><th className="r">Net</th></tr></thead><tbody>
            {modal.row.lines.map((l) => <tr key={l.empId}><td>{l.empId}</td><td>{l.name}</td><td className="r">{money(l.basic)}</td><td className="r">{money(l.allowances)}</td><td className="r">{money(l.gross)}</td><td className="r">{money(l.tax)}</td><td className="r">{money(l.net)}</td></tr>)}
            <tr className="total"><td colSpan={4}>Total</td><td className="r">{money(modal.row.totalGross)}</td><td className="r">{money(modal.row.totalTax)}</td><td className="r">{money(modal.row.totalNet)}</td></tr></tbody></table></div>
        </Modal>
      )}
      {voidT && <ReasonModal title={`Void payroll ${voidT.month}`} message="Reverses the payroll journal. Paid payrolls cannot be voided." confirmLabel="Void payroll"
        onConfirm={() => api.post(`/payroll/${voidT._id}/void`)} onClose={(ok) => { setVoidT(null); if (ok) { toast('Payroll voided'); refresh(); } }} />}
    </>
  );
}
