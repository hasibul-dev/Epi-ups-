import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { DateRange, ErrorBox, Loading, PageHeader, useApi, Badge } from '../components/ui.jsx';
import { cap, fmtDateTime, monthStart, today } from '../lib/format.js';

export default function Audit() {
  const [range, setRange] = useState({ from: monthStart(), to: today() });
  const [action, setAction] = useState('');
  const { data, loading, error } = useApi('/audit-logs', { ...range, action });
  const tone = { create: 'green', update: 'blue', void: 'red', delete: 'red', login: '' };
  const cols = [
    { key: 'at', label: 'When', fmt: fmtDateTime }, { key: 'userName', label: 'User' }, { key: 'role', label: 'Role', fmt: cap },
    { key: 'action', label: 'Action', fmt: cap, render: (l) => <Badge tone={tone[l.action]}>{cap(l.action)}</Badge> },
    { key: 'entity', label: 'Record' }, { key: 'summary', label: 'Details' }, { key: 'ip', label: 'IP' },
  ];
  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Who did what and when. Entries cannot be edited or deleted from the application." />
      <ErrorBox error={error} />
      <div className="toolbar"><DateRange {...range} onChange={setRange} />
        <select className="input" style={{ width: 140 }} value={action} onChange={(e) => setAction(e.target.value)} aria-label="Action"><option value="">All actions</option>{['create', 'update', 'void', 'delete', 'login'].map((a) => <option key={a} value={a}>{cap(a)}</option>)}</select></div>
      {loading ? <Loading /> : <DataTable rows={data} columns={cols} pageSize={50} exportTitle="Audit Log" exportSubtitle={`${range.from} to ${range.to}`} />}
    </>
  );
}
