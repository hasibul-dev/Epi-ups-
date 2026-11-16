import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { Badge, Card, ErrorBox, Form, Loading, Modal, PageHeader, useApi, useToast } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { cap, fmtDateTime } from '../lib/format.js';

const ROLES = [
  ['admin', 'Full access including users and settings'], ['accountant', 'All accounting modules, post / void transactions, reports'], ['manager', 'Read-only reports; create sales, purchases and stock entries'],
  ['hr', 'Employees and payroll only'], ['store', 'Inventory and stock; view sales and purchases'], ['auditor', 'Read-only access to everything except users'],
];

export default function Users() {
  const centralUrl = import.meta.env.VITE_CENTRAL_URL || 'http://localhost:5050';
  const { can, user: me } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/users');
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const roleOpts = ROLES.map(([v, d]) => ({ value: v, label: `${cap(v)} - ${d}` }));
  const save = async (v) => {
    setBusy(true); setErr('');
    try {
      if (modal.row) { const { email, ...rest } = v; if (!rest.password) delete rest.password; await api.put(`/users/${modal.row._id}`, rest); } else await api.post('/users', v);
      toast('User saved'); setModal(null); reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const cols = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role', fmt: cap },
    { key: 'active', label: 'Status', fmt: (v) => (v ? 'Active' : 'Disabled'), render: (u) => <Badge tone={u.active ? 'green' : 'red'}>{u.active ? 'Active' : 'Disabled'}</Badge> },
    { key: 'lastLogin', label: 'Last login', fmt: fmtDateTime },
    ...(can('users', 'write') ? [{ label: 'Actions', noExport: true, render: (u) => <button className="btn sm" onClick={() => { setErr(''); setModal({ row: u }); }}>Edit</button> }] : []),
  ];
  return (
    <>
      <PageHeader title="Accounting Roles & Permissions" subtitle="Financial permissions are enforced on the server for every accounting transaction">
        <a href={centralUrl} className="btn" style={{ textDecoration: 'none' }}>
          Open Central Admin Panel →
        </a>
      </PageHeader>
      
      <div style={{ background: 'rgba(0, 82, 204, 0.08)', border: '1px solid rgba(0, 82, 204, 0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, lineHeight: 1.5 }}>
        <b style={{ color: 'var(--primary, #0052cc)' }}>Centralized Account &amp; Credential Management:</b>
        <span style={{ marginLeft: 6, color: 'var(--fg)' }}>
          User creation, password resets, and department permissions are governed exclusively by the EPI Central Admin Panel. Passwords and credentials cannot be changed from individual department screens.
        </span>
      </div>

      <ErrorBox error={error} />
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} exportTitle="Users" />}
      <div style={{ height: 16 }} />
      <Card title="Financial Role Matrix"><div className="grid g3">{ROLES.map(([r, d]) => <div key={r}><b>{cap(r)}</b><div className="muted">{d}</div></div>)}</div></Card>
      {modal && (
        <Modal title={modal.row ? `Edit Accounting Role: ${modal.row.name}` : 'Assign Accounting Role'} onClose={() => setModal(null)}>
          <ErrorBox error={err} />
          <Form busy={busy} onCancel={() => setModal(null)} onSubmit={save} initial={modal.row || {}} fields={[
            { name: 'name', label: 'Full name', required: true, disabled: !!modal.row },
            { name: 'email', label: 'Email', type: 'email', required: !modal.row, disabled: !!modal.row },
            { name: 'role', label: 'Financial Role', type: 'select', options: roleOpts, required: true, full: true, default: 'accountant' },
            ...(modal.row ? [{ name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active in Accounts', hidden: () => modal.row._id === me.id }] : []),
          ]} />
        </Modal>
      )}
    </>
  );
}
