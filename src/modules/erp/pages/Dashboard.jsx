import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ErrorBox, Loading, useApi } from '../components/ui.jsx';
import { money, qty } from '../lib/format.js';
import {
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  EnterpriseCard,
  StatusBadge,
  ActionButton,
} from '../../../components/EnterpriseUI.jsx';

const tickStyle = { fill: '#94a3b8', fontSize: 11 };
const tooltipStyle = {
  contentStyle: {
    background: 'rgba(14, 22, 42, 0.94)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    color: '#ffffff',
    fontSize: 12,
  },
  formatter: (v) => [money(v)],
};

const EXPENSE_COLORS = ['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#c084fc', '#06b6d4'];

export default function Dashboard() {
  const { data: d, loading, error, reload } = useApi('/reports/dashboard');

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const isProfitPos = (d.month?.profit || 0) >= 0;

  return (
    <div className="erp-enterprise-dashboard" style={{ padding: '0 4px' }}>
      {/* 1. Modern Enterprise Page Header */}
      <PageHeader
        badge="General Ledger Root"
        badgeColor="blue"
        title="Financial & Accounts Command Center"
        subtitle="Real-time general ledger, double-entry voucher verification, and 15% Mushak-9.1 VAT calculations for EPI UPS Bangladesh Limited."
        actions={
          <>
            <StatusBadge
              status={d.booksBalanced ? 'active' : 'overdue'}
              label={
                d.booksBalanced
                  ? 'Books Balanced (Debit === Credit)'
                  : 'Warning: Ledger Out of Balance!'
              }
              variant={d.booksBalanced ? 'success' : 'danger'}
              size="md"
            />

            <ActionButton
              variant="secondary"
              icon={RefreshCw}
              size="md"
              onClick={reload}
              title="Refresh ledger balances and metrics"
            >
              Refresh
            </ActionButton>
          </>
        }
      />

      {/* 2. Primary Liquidity & Working Capital Row (4 Modern Stat Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 16,
        }}
      >
        <StatCard
          title="Cash in Hand"
          value={money(d.cash)}
          subtitle="Physical cash in vault"
          icon={Wallet}
          color="green"
        />

        <StatCard
          title="Bank Balances"
          value={money(d.bank)}
          subtitle="Liquid operating accounts"
          icon={Landmark}
          color="blue"
        />

        <StatCard
          title="Receivables"
          value={money(d.receivables)}
          subtitle="Owed by corporate clients"
          icon={ArrowUpRight}
          color="amber"
          trend="Inbound Asset"
          trendType="neutral"
        />

        <StatCard
          title="Payables"
          value={money(d.payables)}
          subtitle="Owed to equipment suppliers"
          icon={ArrowDownRight}
          color="red"
          trend="Liability"
          trendType="down"
        />
      </div>

      {/* 3. Monthly Operational Performance Row (4 Modern Stat Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Revenue (This Month)"
          value={money(d.month?.income || 0)}
          subtitle="Billed client sales"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="Expenses (This Month)"
          value={money(d.month?.expense || 0)}
          subtitle="Operating disbursements"
          icon={TrendingDown}
          color="red"
        />

        <StatCard
          title="Net Profit (Month)"
          value={money(d.month?.profit || 0)}
          subtitle="Net monthly margin"
          icon={DollarSign}
          color={isProfitPos ? 'green' : 'red'}
          trend={isProfitPos ? 'Profitable' : 'Deficit'}
          trendType={isProfitPos ? 'up' : 'down'}
        />

        <StatCard
          title="Fiscal Year Profit"
          value={money(d.fiscalYear?.profit || 0)}
          subtitle={`Since ${d.fiscalYear?.from || 'Fiscal Start'}`}
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* 4. Main Charts Section (Two Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Income vs Expense Bar Chart */}
        <EnterpriseCard
          title="Revenue vs Operating Expenses"
          subtitle="Last 6 months performance comparison"
          icon={TrendingUp}
          badge="6 Months"
        >
          <div style={{ height: 280, width: '100%', marginTop: 8 }}>
            <ResponsiveContainer>
              <BarChart data={d.trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
                <XAxis dataKey="month" tick={tickStyle} stroke="#64748b" />
                <YAxis
                  tick={tickStyle}
                  stroke="#64748b"
                  tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                <Bar dataKey="income" name="Income" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EnterpriseCard>

        {/* Top Expenses Horizontal Breakdown */}
        <EnterpriseCard
          title="Top Operating Expenses"
          subtitle="Expense disbursements by major accounts category this month"
          icon={Receipt}
          badge={`${d.expenseBreakdown?.length || 0} Categories`}
        >
          {!d.expenseBreakdown || d.expenseBreakdown.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: 12.5 }}>
              No operating expenses recorded for this month yet.
            </div>
          ) : (
            <div style={{ height: 280, width: '100%', marginTop: 8 }}>
              <ResponsiveContainer>
                <BarChart
                  data={d.expenseBreakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" horizontal={false} />
                  <XAxis type="number" tick={tickStyle} stroke="#64748b" />
                  <YAxis type="category" dataKey="name" tick={tickStyle} stroke="#64748b" width={110} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                    {d.expenseBreakdown.map((_, i) => (
                      <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </EnterpriseCard>
      </div>

      {/* 5. Profit Trend & Inventory / VAT Summary (Two Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Profit Curve Trend */}
        <EnterpriseCard
          title="Net Profit Trend"
          subtitle="6-month trailing net profit & loss margin curve"
          icon={DollarSign}
        >
          <div style={{ height: 220, width: '100%', marginTop: 8 }}>
            <ResponsiveContainer>
              <LineChart data={d.trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
                <XAxis dataKey="month" tick={tickStyle} stroke="#64748b" />
                <YAxis tick={tickStyle} stroke="#64748b" />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', stroke: '#050811', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </EnterpriseCard>

        {/* Inventory, VAT & Low Stock Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <StatCard
              title="Inventory Value"
              value={money(d.inventoryValue || 0)}
              subtitle="Asset stock on hand"
              icon={Package}
              color="cyan"
            />
            <StatCard
              title="Net VAT Payable"
              value={money(d.vatPayable || 0)}
              subtitle="Mushak-9.1 net due"
              icon={ShieldCheck}
              color="amber"
            />
          </div>

          <EnterpriseCard
            title={`Low Stock Inventory Alerts (${d.lowStockCount || 0})`}
            subtitle="Spare parts and UPS inventory units approaching reorder threshold"
            icon={AlertTriangle}
          >
            {!d.lowStock || d.lowStock.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: '#34d399', fontSize: 12 }}>
                ✓ All equipment & component items are above safe reorder levels.
              </div>
            ) : (
              <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <tbody>
                    {d.lowStock.map((i) => (
                      <tr
                        key={i.sku}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <td style={{ padding: '6px 8px', color: '#f1f5f9' }}>{i.name}</td>
                        <td
                          style={{
                            padding: '6px 8px',
                            textAlign: 'right',
                            color: '#f87171',
                            fontWeight: 700,
                          }}
                        >
                          {qty(i.qty)} units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </EnterpriseCard>
        </div>
      </div>
    </div>
  );
}
