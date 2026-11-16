import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, ErrorBox, Loading, PageHeader, Stat, useApi } from '../components/ui.jsx';
import { money, qty } from '../lib/format.js';

const tick = { fill: '#8e9bc0', fontSize: 12 };
const tip = { contentStyle: { background: '#121a36', border: '1px solid #232e56', borderRadius: 10 }, formatter: (v) => money(v) };
const COLORS = ['#2f6bff', '#e5202e', '#22c55e', '#f5a524', '#a855f7', '#14b8a6'];

export default function Dashboard() {
  const { data: d, loading, error, reload } = useApi('/reports/dashboard');
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const tone = (n) => (n < 0 ? 'neg' : 'pos');
  return (
    <>
      <PageHeader title="Accounting Dashboard" subtitle="Live figures calculated from posted transactions">
        <span className={`badge ${d.booksBalanced ? 'green' : 'red'}`}>{d.booksBalanced ? 'Books balanced (Debit = Credit)' : 'Books out of balance!'}</span>
        <button className="btn sm" onClick={reload}>Refresh</button>
      </PageHeader>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Stat label="Cash in hand" value={money(d.cash)} accent="#22c55e" />
        <Stat label="Cash at bank" value={money(d.bank)} accent="#2f6bff" />
        <Stat label="Receivables" value={money(d.receivables)} sub="Owed by customers" accent="#f5a524" />
        <Stat label="Payables" value={money(d.payables)} sub="Owed to suppliers" accent="#e5202e" />
      </div>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Stat label="Income (this month)" value={money(d.month.income)} accent="#2f6bff" />
        <Stat label="Expenses (this month)" value={money(d.month.expense)} accent="#e5202e" />
        <Stat label="Profit / Loss (this month)" value={money(d.month.profit)} tone={tone(d.month.profit)} accent="#22c55e" />
        <Stat label="Profit / Loss (fiscal year)" value={money(d.fiscalYear.profit)} tone={tone(d.fiscalYear.profit)} sub={`Since ${d.fiscalYear.from}`} accent="#a855f7" />
      </div>
      <div className="grid g-2-1" style={{ marginBottom: 14 }}>
        <Card title="Income vs Expense - last 6 months">
          <div style={{ height: 290 }}>
            <ResponsiveContainer>
              <BarChart data={d.trend}>
                <CartesianGrid stroke="#232e56" vertical={false} />
                <XAxis dataKey="month" tick={tick} /><YAxis tick={tick} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip {...tip} /><Legend />
                <Bar dataKey="income" name="Income" fill="#2f6bff" radius={[5, 5, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#e5202e" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top expenses this month">
          {d.expenseBreakdown.length === 0 ? <div className="empty">No expenses this month.</div> : (
            <div style={{ height: 290 }}>
              <ResponsiveContainer>
                <BarChart data={d.expenseBreakdown} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="#232e56" horizontal={false} />
                  <XAxis type="number" tick={tick} /><YAxis type="category" dataKey="name" tick={tick} width={120} />
                  <Tooltip {...tip} />
                  <Bar dataKey="amount" radius={[0, 5, 5, 0]}>{d.expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
      <div className="grid g-2-1">
        <Card title="Profit trend">
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={d.trend}>
                <CartesianGrid stroke="#232e56" vertical={false} /><XAxis dataKey="month" tick={tick} /><YAxis tick={tick} />
                <Tooltip {...tip} /><Line type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid">
          <Stat label="Inventory value" value={money(d.inventoryValue)} accent="#14b8a6" />
          <Stat label="VAT payable (net)" value={money(d.vatPayable)} accent="#f5a524" />
          <Card title={`Low stock items (${d.lowStockCount})`}>
            {d.lowStock.length === 0 ? <span className="muted">All items are above reorder level.</span> : (
              <table className="t" style={{ minWidth: 0 }}><tbody>{d.lowStock.map((i) => <tr key={i.sku}><td>{i.name}</td><td className="r neg">{qty(i.qty)}</td></tr>)}</tbody></table>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
