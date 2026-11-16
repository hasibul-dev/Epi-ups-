import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExportMenu } from '../components/DataTable.jsx';
import { Badge, Card, DateRange, ErrorBox, Loading, PageHeader, Tabs, useApi } from '../components/ui.jsx';
import { useAccountOptions } from '../lib/hooks.js';
import { fmtDate, money, today, cap } from '../lib/format.js';

const fyStart = () => { const d = new Date(); const y = d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1; return `${y}-07-01`; };
const C = [{ key: 'name', label: 'Particulars' }, { key: 'amount', label: 'Amount (BDT)', numeric: true, fmt: money }];

// A statement renders [{label, amount?, kind: 'section'|'row'|'total'}]
function Statement({ title, subtitle, rows, extra }) {
  const exportRows = rows.map((r) => ({ name: r.label, amount: r.amount ?? '', _bold: r.kind !== 'row' }));
  return (
    <Card title={title} right={<ExportMenu title={title} subtitle={subtitle} columns={C} rows={exportRows} />}>
      <p className="muted" style={{ marginTop: -6 }}>{subtitle}</p>
      {extra}
      <div className="table-wrap"><table className="t"><tbody>
        {rows.map((r, i) => <tr key={i} className={r.kind === 'section' ? 'section' : r.kind === 'total' ? 'total' : ''}>
          <td style={{ paddingLeft: r.kind === 'row' ? 28 : 12 }}>{r.label}</td><td className="r">{r.amount !== undefined ? money(r.amount) : ''}</td></tr>)}
      </tbody></table></div>
    </Card>
  );
}
const section = (label, sec) => {
  if (!sec) return [];
  const rows = Array.isArray(sec.rows)
    ? sec.rows
    : [...(sec.current?.rows || []), ...(sec.nonCurrent?.rows || [])];
  return [
    { label, kind: 'section' },
    ...rows.map((x) => ({
      label: x.code ? `${x.code} ${x.name}` : (x.name || x.label || 'Item'),
      amount: x.amount,
      kind: 'row',
    })),
    { label: `Total ${label}`, amount: sec.total ?? rows.reduce((s, r) => s + (r.amount || 0), 0), kind: 'total' },
  ];
};

function TrialBalance() {
  const [asOf, setAsOf] = useState(today());
  const { data, loading, error } = useApi('/reports/trial-balance', { asOf });
  const cols = [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Account' }, { key: 'type', label: 'Type', fmt: cap }, { key: 'debit', label: 'Debit', numeric: true, fmt: (v) => (v ? money(v) : '') }, { key: 'credit', label: 'Credit', numeric: true, fmt: (v) => (v ? money(v) : '') }];
  return (<>
    <div className="toolbar"><DateRange single to={asOf} onChange={({ to }) => setAsOf(to)} /></div>
    <ErrorBox error={error} />
    {loading ? <Loading /> : (
      <Card title="Trial Balance" right={<div className="row"><Badge tone={data.balanced ? 'green' : 'red'}>{data.balanced ? 'Balanced' : 'Out of balance'}</Badge>
        <ExportMenu title="Trial Balance" subtitle={`As of ${data.asOf}`} columns={cols} rows={[...data.rows, { code: '', name: 'TOTAL', type: '', debit: data.totalDebit, credit: data.totalCredit, _bold: true }]} /></div>}>
        <div className="table-wrap"><table className="t"><thead><tr><th>Code</th><th>Account</th><th>Type</th><th className="r">Debit</th><th className="r">Credit</th></tr></thead><tbody>
          {data.rows.map((r) => <tr key={r.accountId}><td>{r.code}</td><td>{r.name}</td><td>{cap(r.type)}</td><td className="r">{r.debit ? money(r.debit) : ''}</td><td className="r">{r.credit ? money(r.credit) : ''}</td></tr>)}
          <tr className="total"><td colSpan={3}>Total</td><td className="r">{money(data.totalDebit)}</td><td className="r">{money(data.totalCredit)}</td></tr></tbody></table></div>
      </Card>)}
  </>);
}

function ProfitLoss() {
  const [r, setR] = useState({ from: fyStart(), to: today() });
  const { data: d, loading, error } = useApi('/reports/profit-loss', r);
  return (<>
    <div className="toolbar"><DateRange {...r} onChange={setR} /></div>
    <ErrorBox error={error} />
    {loading ? <Loading /> : <Statement title="Profit & Loss Statement" subtitle={`${d.from} to ${d.to}`} rows={[
      ...section('Income', d.income), ...section('Cost of Goods Sold', d.cogs), { label: 'Gross Profit', amount: d.grossProfit, kind: 'total' },
      ...section('Operating Expenses', d.operatingExpenses), { label: d.netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS', amount: d.netProfit, kind: 'total' }]} />}
  </>);
}

function BalanceSheet() {
  const [asOf, setAsOf] = useState(today());
  const { data: d, loading, error } = useApi('/reports/balance-sheet', { asOf });

  const totalAssets = d?.totalAssets ?? d?.assets?.total ?? 0;
  const totalLiab = d?.liabilities?.total ?? 0;
  const totalEq = d?.equity?.total ?? 0;
  const totalLiabilitiesAndEquity = d?.totalLiabilitiesAndEquity ?? (totalLiab + totalEq);
  const balanced = d?.balanced ?? (Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01);
  const equityRows = d?.equity?.rows || [];

  return (
    <>
      <div className="toolbar"><DateRange single to={asOf} onChange={({ to }) => setAsOf(to)} /></div>
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : !d ? (
        <div className="empty">No balance sheet data available.</div>
      ) : (
        <Statement
          title="Balance Sheet"
          subtitle={`As of ${d.asOf || asOf}`}
          extra={
            <p>
              <Badge tone={balanced ? 'green' : 'red'}>
                {balanced ? 'Assets = Liabilities + Equity' : 'Out of balance'}
              </Badge>
            </p>
          }
          rows={[
            ...section('Assets', d.assets),
            ...section('Liabilities', d.liabilities),
            { label: 'Equity', kind: 'section' },
            ...equityRows.map((x) => ({
              label: x.code ? `${x.code} ${x.name}` : (x.name || 'Equity Item'),
              amount: x.amount,
              kind: 'row',
            })),
            { label: 'Current period profit / (loss)', amount: d.equity?.currentEarnings ?? 0, kind: 'row' },
            { label: 'Total Equity', amount: totalEq, kind: 'total' },
            { label: 'Total Liabilities & Equity', amount: totalLiabilitiesAndEquity, kind: 'total' },
          ]}
        />
      )}
    </>
  );
}

function CashFlow() {
  const [r, setR] = useState({ from: fyStart(), to: today() });
  const { data: d, loading, error } = useApi('/reports/cash-flow', r);
  const sec = (label, s) => {
    const items = s?.items || s?.rows || [];
    return [
      { label, kind: 'section' },
      ...items.map((i) => ({ label: i.name || i.narration || 'Item', amount: i.amount, kind: 'row' })),
      { label: `Net cash from ${label.toLowerCase()}`, amount: s?.total ?? 0, kind: 'total' },
    ];
  };
  return (<>
    <div className="toolbar"><DateRange {...r} onChange={setR} /></div>
    <ErrorBox error={error} />
    {loading ? <Loading /> : !d ? <div className="empty">No cash flow data available.</div> : (
      <Statement title="Cash Flow Statement" subtitle={`${d.from} to ${d.to} (direct method, cash and bank accounts)`} extra={<p><Badge tone={d.reconciles ? 'green' : 'red'}>{d.reconciles ? 'Reconciles to ledger cash & bank' : 'Does not reconcile'}</Badge></p>} rows={[
        { label: 'Opening cash & bank', amount: d.openingCash ?? 0, kind: 'total' },
        ...sec('Operating activities', d.operating), ...sec('Investing activities', d.investing), ...sec('Financing activities', d.financing),
        { label: 'Net change in cash', amount: d.netChange ?? 0, kind: 'total' }, { label: 'Closing cash & bank', amount: d.closingCash ?? 0, kind: 'total' }]} />
    )}
  </>);
}

function Ledger({ initial }) {
  const accounts = useAccountOptions();
  const [acc, setAcc] = useState(initial || '');
  const [r, setR] = useState({ from: fyStart(), to: today() });
  const { data: d, loading, error } = useApi(acc ? '/reports/ledger' : null, { account: acc, ...r });
  const cols = [{ key: 'date', label: 'Date', fmt: fmtDate }, { key: 'entryNo', label: 'Entry' }, { key: 'narration', label: 'Narration' }, { key: 'counter', label: 'Against' },
    { key: 'debit', label: 'Debit', numeric: true, fmt: (v) => (v ? money(v) : '') }, { key: 'credit', label: 'Credit', numeric: true, fmt: (v) => (v ? money(v) : '') }, { key: 'balance', label: 'Balance', numeric: true, fmt: money }];
  return (<>
    <div className="toolbar"><select className="input" style={{ width: 300 }} value={acc} onChange={(e) => setAcc(e.target.value)} aria-label="Account"><option value="">Select an account...</option>{accounts.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select><DateRange {...r} onChange={setR} /></div>
    <ErrorBox error={error} />
    {!acc ? <div className="empty">Choose an account to see its ledger.</div> : loading ? <Loading /> : (
      <Card title={`General Ledger - ${d.account.code} ${d.account.name}`} right={<ExportMenu title={`Ledger ${d.account.name}`} subtitle={`${d.from} to ${d.to}`} columns={cols} rows={d.rows} />}>
        <p className="muted">Opening balance {money(d.opening)}</p>
        <div className="table-wrap"><table className="t"><thead><tr><th>Date</th><th>Entry</th><th>Narration</th><th>Against</th><th className="r">Debit</th><th className="r">Credit</th><th className="r">Balance</th></tr></thead><tbody>
          {d.rows.map((x, i) => <tr key={i} className={x.status === 'void' ? 'dim' : ''}><td>{fmtDate(x.date)}</td><td>{x.entryNo}</td><td>{x.narration}</td><td>{x.counter}</td><td className="r">{x.debit ? money(x.debit) : ''}</td><td className="r">{x.credit ? money(x.credit) : ''}</td><td className="r">{money(x.balance)}</td></tr>)}
          <tr className="total"><td colSpan={4}>Closing</td><td className="r">{money(d.totalDebit)}</td><td className="r">{money(d.totalCredit)}</td><td className="r">{money(d.closing)}</td></tr></tbody></table></div>
        <p className="muted">Voided entries are shown struck through; their reversal entries cancel them.</p>
      </Card>)}
  </>);
}

export default function Reports() {
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'pl';
  return (
    <>
      <PageHeader title="Financial Reports" subtitle="Generated live from posted journal entries" />
      <Tabs value={tab} onChange={(t) => setSp({ tab: t })} tabs={[
        { value: 'pl', label: 'Profit & Loss' }, { value: 'bs', label: 'Balance Sheet' }, { value: 'tb', label: 'Trial Balance' }, { value: 'cf', label: 'Cash Flow' }, { value: 'ledger', label: 'General Ledger' }]} />
      {tab === 'pl' && <ProfitLoss />}{tab === 'bs' && <BalanceSheet />}{tab === 'tb' && <TrialBalance />}{tab === 'cf' && <CashFlow />}{tab === 'ledger' && <Ledger initial={sp.get('account')} />}
    </>
  );
}
