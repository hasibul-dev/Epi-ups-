import { useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import { DateRange, ErrorBox, Loading, PageHeader, Stat, useApi } from '../components/ui.jsx';
import { money, today } from '../lib/format.js';

export default function Ageing({ type }) {
  const rec = type === 'receivable';
  const [asOf, setAsOf] = useState(today());
  const { data, loading, error } = useApi('/reports/ageing', { type, asOf });
  const cols = [
    { key: 'party', label: rec ? 'Customer' : 'Supplier' }, { key: 'phone', label: 'Phone' }, { key: 'invoices', label: 'Open docs', numeric: true },
    { key: 'current', label: 'Not due', numeric: true, fmt: money }, { key: 'd1_30', label: '1-30 days', numeric: true, fmt: money }, { key: 'd31_60', label: '31-60 days', numeric: true, fmt: money },
    { key: 'd61_90', label: '61-90 days', numeric: true, fmt: money }, { key: 'd90plus', label: '90+ days', numeric: true, fmt: money }, { key: 'total', label: 'Total', numeric: true, fmt: money },
  ];
  return (
    <>
      <PageHeader title={rec ? 'Customer Receivables' : 'Supplier Payables'} subtitle="Outstanding invoices grouped by how overdue they are">
        <DateRange single to={asOf} onChange={({ to }) => setAsOf(to)} />
      </PageHeader>
      <ErrorBox error={error} />
      {loading ? <Loading /> : (
        <>
          <div className="grid g4" style={{ marginBottom: 14 }}>
            <Stat label="Total outstanding" value={money(data.totals.total)} accent="#e5202e" />
            <Stat label="Not yet due" value={money(data.totals.current)} accent="#22c55e" />
            <Stat label="Overdue 1-60 days" value={money(data.totals.d1_30 + data.totals.d31_60)} accent="#f5a524" />
            <Stat label="Overdue 60+ days" value={money(data.totals.d61_90 + data.totals.d90plus)} tone={data.totals.d61_90 + data.totals.d90plus > 0 ? 'neg' : ''} accent="#e5202e" />
          </div>
          <DataTable rows={data.rows} columns={cols} exportTitle={rec ? 'Receivables Ageing' : 'Payables Ageing'} exportSubtitle={`As of ${data.asOf}`}
            totals={{ 'Not due': data.totals.current, '1-30 days': data.totals.d1_30, '31-60 days': data.totals.d31_60, '61-90 days': data.totals.d61_90, '90+ days': data.totals.d90plus, Total: data.totals.total }} />
        </>
      )}
    </>
  );
}
