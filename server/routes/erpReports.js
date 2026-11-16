import { Router } from 'express';
import { Account, JournalEntry, Settings } from '../erp/models/core.js';
import { Invoice } from '../erp/models/trade.js';
import { Item } from '../erp/models/trade.js';
import { authenticate, guard } from '../erp/middleware/auth.js';
import { accountSums, endOfDay } from '../erp/services/ledger.js';
import {
  buildTrialBalance, buildProfitLoss, buildBalanceSheet, buildCashFlow, ageBuckets, naturalBalance, r2, AccountingError,
} from '../erp/services/accounting.js';

const r = Router();
r.use(authenticate);

const asDate = (v, fallback) => {
  const d = v ? new Date(v) : fallback;
  if (Number.isNaN(d.getTime())) throw new AccountingError('Invalid date');
  return d;
};
const day = (d) => new Date(d).toISOString().slice(0, 10);
const sub = (sums, id) => sums.get(String(id)) || { debit: 0, credit: 0 };

async function fiscalStart(now = new Date()) {
  const s = await Settings.findOne({ key: 'main' });
  const m = (s?.fiscalYearStartMonth || 7) - 1;
  const y = now.getUTCMonth() >= m ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  return new Date(Date.UTC(y, m, 1));
}

r.get('/trial-balance', guard('reports', 'read'), async (req, res) => {
  const asOf = asDate(req.query.asOf, new Date());
  const [accounts, sums] = await Promise.all([Account.find().lean(), accountSums({ to: asOf })]);
  res.json({ asOf: day(asOf), ...buildTrialBalance(accounts, sums) });
});

r.get('/profit-loss', guard('reports', 'read'), async (req, res) => {
  const to = asDate(req.query.to, new Date());
  const from = asDate(req.query.from, await fiscalStart(to));
  const [accounts, sums] = await Promise.all([Account.find().lean(), accountSums({ from, to })]);
  res.json({ from: day(from), to: day(to), ...buildProfitLoss(accounts, sums) });
});

r.get('/balance-sheet', guard('reports', 'read'), async (req, res) => {
  const asOf = asDate(req.query.asOf, new Date());
  const [accounts, sums] = await Promise.all([Account.find().lean(), accountSums({ to: asOf })]);
  res.json({ asOf: day(asOf), ...buildBalanceSheet(accounts, sums) });
});

r.get('/cash-flow', guard('reports', 'read'), async (req, res) => {
  const to = asDate(req.query.to, new Date());
  const from = asDate(req.query.from, await fiscalStart(to));
  const accounts = await Account.find().lean();
  const cashIds = accounts.filter((a) => a.subType === 'cash' || a.subType === 'bank').map((a) => a._id);
  const before = new Date(from.getTime() - 1);
  const [openSums, entries] = await Promise.all([
    accountSums({ to: before }),
    JournalEntry.find({ date: { $gte: from, $lte: endOfDay(to) }, 'lines.account': { $in: cashIds } }).select('lines').lean(),
  ]);
  const opening = cashIds.reduce((s, id) => { const x = sub(openSums, id); return s + x.debit - x.credit; }, 0);
  const cf = buildCashFlow(accounts, entries, opening);
  const closeSums = await accountSums({ to });
  const actualClosing = r2(cashIds.reduce((s, id) => { const x = sub(closeSums, id); return s + x.debit - x.credit; }, 0));
  res.json({ from: day(from), to: day(to), ...cf, reconciles: Math.abs(actualClosing - cf.closingCash) < 0.005, ledgerClosingCash: actualClosing });
});

r.get('/ledger', guard('reports', 'read'), async (req, res) => {
  const acc = await Account.findById(req.query.account).lean();
  if (!acc) throw new AccountingError('Select an account', 400);
  const to = asDate(req.query.to, new Date());
  const from = asDate(req.query.from, await fiscalStart(to));
  const openSums = await accountSums({ to: new Date(from.getTime() - 1) });
  const o = sub(openSums, acc._id);
  const opening = naturalBalance(acc.type, o.debit, o.credit);
  const entries = await JournalEntry.find({ date: { $gte: from, $lte: endOfDay(to) }, 'lines.account': acc._id })
    .sort({ date: 1, createdAt: 1 }).populate('lines.account', 'code name').lean();
  let bal = opening;
  let totalDebit = 0;
  let totalCredit = 0;
  const rows = [];
  for (const e of entries) {
    for (const l of e.lines) {
      if (String(l.account._id) !== String(acc._id)) continue;
      bal = r2(bal + (naturalBalance(acc.type, l.debit, l.credit)));
      totalDebit += l.debit; totalCredit += l.credit;
      const others = e.lines.filter((x) => String(x.account._id) !== String(acc._id)).map((x) => `${x.account.code} ${x.account.name}`);
      rows.push({
        date: e.date, entryNo: e.entryNo, voucherType: e.voucherType, narration: e.narration, status: e.status,
        counter: others.length > 2 ? 'Various' : others.join(', '), debit: l.debit, credit: l.credit, balance: bal,
      });
    }
  }
  res.json({ account: acc, from: day(from), to: day(to), opening, rows, totalDebit: r2(totalDebit), totalCredit: r2(totalCredit), closing: bal });
});

r.get('/banking', guard('banking', 'read'), async (_req, res) => {
  const [accounts, sums] = await Promise.all([Account.find({ subType: { $in: ['cash', 'bank'] } }).sort({ code: 1 }).lean(), accountSums()]);
  const rows = accounts.map((a) => {
    const s = sub(sums, a._id);
    return { ...a, debit: s.debit, credit: s.credit, balance: naturalBalance(a.type, s.debit, s.credit) };
  });
  const cash = r2(rows.filter((a) => a.subType === 'cash').reduce((s, a) => s + a.balance, 0));
  const bank = r2(rows.filter((a) => a.subType === 'bank').reduce((s, a) => s + a.balance, 0));
  res.json({ accounts: rows, cash, bank, total: r2(cash + bank) });
});

r.get('/ageing', guard('reports', 'read'), async (req, res) => {
  const asOf = asDate(req.query.asOf, new Date());
  const type = req.query.type === 'payable' ? 'purchase' : 'sale';
  const invs = await Invoice.find({ type, status: { $in: ['unpaid', 'partial'] }, date: { $lte: endOfDay(asOf) } }).populate('party', 'name phone').lean();
  const byParty = new Map();
  for (const i of invs) {
    const key = String(i.party._id);
    if (!byParty.has(key)) byParty.set(key, { party: i.party, items: [] });
    byParty.get(key).items.push({ dueDate: i.dueDate, outstanding: r2(i.total - i.paid), number: i.number });
  }
  const rows = [...byParty.values()].map((p) => ({ party: p.party.name, phone: p.party.phone, ...ageBuckets(p.items, asOf), invoices: p.items.length }))
    .sort((a, b) => b.total - a.total);
  const all = [...byParty.values()].flatMap((p) => p.items);
  res.json({ asOf: day(asOf), type: type === 'sale' ? 'receivable' : 'payable', rows, totals: ageBuckets(all, asOf) });
});

r.get('/stock-valuation', guard('inventory', 'read'), async (_req, res) => {
  const items = await Item.find({ active: true }).sort({ name: 1 }).lean();
  const rows = items.map((i) => ({ sku: i.sku, name: i.name, unit: i.unit, qty: i.qtyOnHand, avgCost: i.avgCost, value: r2(i.qtyOnHand * i.avgCost), reorderLevel: i.reorderLevel, low: i.qtyOnHand <= i.reorderLevel }));
  res.json({ rows, totalValue: r2(rows.reduce((s, x) => s + x.value, 0)), lowCount: rows.filter((x) => x.low).length });
});

r.get('/dashboard', guard('dashboard', 'read'), async (req, res) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const fyStart = await fiscalStart(now);
  const trendStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const accounts = await Account.find().lean();
  const byId = new Map(accounts.map((a) => [String(a._id), a]));
  const [all, month, fy, trendRows, items] = await Promise.all([
    accountSums({ to: now }),
    accountSums({ from: monthStart, to: now }),
    accountSums({ from: fyStart, to: now }),
    JournalEntry.aggregate([
      { $match: { date: { $gte: trendStart, $lte: now } } },
      { $unwind: '$lines' },
      { $group: { _id: { m: { $dateToString: { format: '%Y-%m', date: '$date' } }, a: '$lines.account' }, debit: { $sum: '$lines.debit' }, credit: { $sum: '$lines.credit' } } },
    ]),
    Item.find({ active: true }).lean(),
  ]);
  const bySub = (st) => r2(accounts.filter((a) => a.subType === st).reduce((s, a) => { const x = sub(all, a._id); return s + naturalBalance(a.type, x.debit, x.credit); }, 0));
  const pl = (sums) => buildProfitLoss(accounts, sums);
  const plMonth = pl(month);
  const plFy = pl(fy);

  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(trendStart.getUTCFullYear(), trendStart.getUTCMonth() + i, 1));
    months.push({ month: d.toISOString().slice(0, 7), income: 0, expense: 0 });
  }
  for (const t of trendRows) {
    const a = byId.get(String(t._id.a));
    const row = months.find((m) => m.month === t._id.m);
    if (!a || !row) continue;
    if (a.type === 'income') row.income += t.credit - t.debit;
    if (a.type === 'expense') row.expense += t.debit - t.credit;
  }
  months.forEach((m) => { m.income = r2(m.income); m.expense = r2(m.expense); m.profit = r2(m.income - m.expense); });

  const expenseBreakdown = plMonth.cogs.rows.concat(plMonth.operatingExpenses.rows).sort((a, b) => b.amount - a.amount).slice(0, 6)
    .map((x) => ({ name: x.name, amount: x.amount }));
  const lowStock = items.filter((i) => i.qtyOnHand <= i.reorderLevel);
  const tb = buildTrialBalance(accounts, all);

  res.json({
    cash: bySub('cash'), bank: bySub('bank'),
    receivables: bySub('receivable'), payables: bySub('payable'),
    inventoryValue: bySub('inventory'),
    vatPayable: r2(bySub('vat_output') - bySub('vat_input')),
    month: { income: plMonth.income.total, expense: plMonth.totalExpense, profit: plMonth.netProfit },
    fiscalYear: { from: day(fyStart), income: plFy.income.total, expense: plFy.totalExpense, profit: plFy.netProfit },
    trend: months, expenseBreakdown,
    lowStock: lowStock.slice(0, 8).map((i) => ({ sku: i.sku, name: i.name, qty: i.qtyOnHand, reorderLevel: i.reorderLevel })),
    lowStockCount: lowStock.length,
    booksBalanced: tb.balanced,
  });
});

export default r;
