import { Router } from 'express';
import { z } from 'zod';
import { Account, JournalEntry, AuditLog, Settings } from '../models/core.js';
import { Party, Item, StockMovement, Invoice, Payment, Expense } from '../models/trade.js';
import { Employee, PayrollRun, FixedAsset } from '../models/hr.js';
import { authenticate, guard, audit, validate } from '../middleware/auth.js';
import { postEntry, voidEntry, accountSums, endOfDay, requireCashOrBank } from '../services/ledger.js';
import * as P from '../services/posting.js';
import { AccountingError, validateEntry, naturalBalance, r2 } from '../services/accounting.js';

const r = Router();
r.use(authenticate);

const id = z.string().regex(/^[a-f\d]{24}$/i, 'invalid id');
const date = z.coerce.date();
const money = z.coerce.number().min(0);
const pos = z.coerce.number().positive();
const optStr = z.string().trim().optional().or(z.literal(''));
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined));
const dateRange = (q, field = 'date') => {
  if (!q.from && !q.to) return {};
  const f = {};
  if (q.from) f.$gte = new Date(q.from);
  if (q.to) f.$lte = endOfDay(q.to);
  return { [field]: f };
};
const LIMIT = 2000;

// ================= Chart of accounts =================
const accountSchema = z.object({
  code: z.string().trim().min(1).max(12), name: z.string().trim().min(2),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
  subType: z.string().optional(), cashFlowCategory: z.enum(['operating', 'investing', 'financing']).optional(),
  description: optStr, active: z.boolean().optional(), bankName: optStr, accountNumber: optStr,
});
r.get('/accounts', guard('accounts', 'read'), async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.subType) filter.subType = { $in: String(req.query.subType).split(',') };
  if (req.query.active === 'true') filter.active = true;
  if (req.query.q) filter.$or = [{ name: new RegExp(esc(req.query.q), 'i') }, { code: new RegExp(esc(req.query.q), 'i') }];
  const accounts = await Account.find(filter).sort({ code: 1 }).lean();
  if (req.query.withBalance === 'true') {
    const sums = await accountSums();
    for (const a of accounts) {
      const s = sums.get(String(a._id)) || { debit: 0, credit: 0 };
      a.debit = s.debit; a.credit = s.credit; a.balance = naturalBalance(a.type, s.debit, s.credit);
    }
  }
  res.json(accounts);
});
r.post('/accounts', guard('accounts', 'write'), validate(accountSchema), async (req, res) => {
  const a = await Account.create(clean(req.body));
  await audit(req, 'create', 'Account', a._id, `Created account ${a.code} ${a.name}`);
  res.status(201).json(a);
});
r.put('/accounts/:id', guard('accounts', 'write'), validate(accountSchema.partial()), async (req, res) => {
  const a = await Account.findById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Account not found' });
  const used = await JournalEntry.exists({ 'lines.account': a._id });
  if (used && req.body.type && req.body.type !== a.type) throw new AccountingError('Cannot change the type of an account that has transactions');
  if (a.sysKey && req.body.active === false) throw new AccountingError('System accounts cannot be deactivated');
  Object.assign(a, clean(req.body));
  await a.save();
  await audit(req, 'update', 'Account', a._id, `Updated account ${a.code} ${a.name}`);
  res.json(a);
});
r.delete('/accounts/:id', guard('accounts', 'void'), async (req, res) => {
  const a = await Account.findById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Account not found' });
  if (a.sysKey) throw new AccountingError('System accounts cannot be deleted');
  if (await JournalEntry.exists({ 'lines.account': a._id })) throw new AccountingError('This account has transactions. Deactivate it instead of deleting.');
  await a.deleteOne();
  await audit(req, 'delete', 'Account', a._id, `Deleted account ${a.code} ${a.name}`);
  res.json({ ok: true });
});

// ================= Journal / vouchers =================
const lineIn = z.object({ account: id, debit: money.optional(), credit: money.optional(), memo: optStr });
const journalSchema = z.object({
  date, voucherType: z.enum(['journal', 'payment', 'receipt', 'contra']).default('journal'),
  narration: optStr, reference: optStr, lines: z.array(lineIn).min(2),
});
r.get('/journal', guard('journal', 'read'), async (req, res) => {
  const f = { ...dateRange(req.query) };
  if (req.query.voucherType) f.voucherType = req.query.voucherType;
  if (req.query.status) f.status = req.query.status;
  if (req.query.account) f['lines.account'] = req.query.account;
  if (req.query.q) f.$or = [{ entryNo: new RegExp(esc(req.query.q), 'i') }, { narration: new RegExp(esc(req.query.q), 'i') }, { reference: new RegExp(esc(req.query.q), 'i') }];
  res.json(await JournalEntry.find(f).sort({ date: -1, createdAt: -1 }).limit(LIMIT).populate('lines.account', 'code name').populate('createdBy', 'name').lean());
});
r.post('/journal', guard('journal', 'write'), validate(journalSchema), async (req, res) => {
  const b = req.body;
  if (b.voucherType === 'contra') {
    for (const l of b.lines) await requireCashOrBank(l.account);
  }
  const e = await postEntry({ ...b, reference: b.reference || undefined, narration: b.narration || undefined, userId: req.user._id });
  await audit(req, 'create', 'JournalEntry', e._id, `Posted ${b.voucherType} voucher ${e.entryNo} for ${e.totalDebit.toFixed(2)}`);
  res.status(201).json(e);
});
r.post('/journal/:id/void', guard('journal', 'void'), validate(z.object({ reason: z.string().min(3, 'A reason is required') })), async (req, res) => {
  const e = await JournalEntry.findById(req.params.id);
  if (!e) return res.status(404).json({ error: 'Entry not found' });
  if (e.source?.kind && e.source.kind !== 'Party') throw new AccountingError(`This entry belongs to a ${e.source.kind} document. Void the document instead.`);
  const rev = await voidEntry(e._id, { reason: req.body.reason, userId: req.user._id });
  await audit(req, 'void', 'JournalEntry', e._id, `Voided ${e.entryNo}: ${req.body.reason}`);
  res.json(rev);
});

// ================= Parties =================
const partySchema = z.object({
  type: z.enum(['customer', 'supplier']), name: z.string().trim().min(2),
  phone: optStr, email: z.email().optional().or(z.literal('')), address: optStr, bin: optStr, tin: optStr,
  creditLimit: money.optional(), creditDays: money.optional(), openingBalance: money.optional(), openingDate: date.optional(), active: z.boolean().optional(),
});
r.get('/parties', guard('sales', 'read'), async (req, res) => {
  const f = {};
  if (req.query.type) f.type = req.query.type;
  if (req.query.q) f.$or = [{ name: new RegExp(esc(req.query.q), 'i') }, { phone: new RegExp(esc(req.query.q), 'i') }];
  const parties = await Party.find(f).sort({ name: 1 }).limit(LIMIT).lean();
  if (req.query.withBalance === 'true') {
    for (const p of parties) p.balance = await P.partyBalance(p._id);
  }
  res.json(parties);
});
r.post('/parties', guard('sales', 'write'), validate(partySchema), async (req, res) => {
  const p = await P.createParty(clean(req.body), req.user._id);
  await audit(req, 'create', 'Party', p._id, `Created ${p.type} ${p.name}`);
  res.status(201).json(p);
});
r.put('/parties/:id', guard('sales', 'write'), validate(partySchema.partial()), async (req, res) => {
  const p = await Party.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Party not found' });
  const { openingBalance, openingDate, type, ...rest } = req.body;
  Object.assign(p, clean(rest));
  await p.save();
  await audit(req, 'update', 'Party', p._id, `Updated ${p.type} ${p.name}`);
  res.json(p);
});
r.delete('/parties/:id', guard('sales', 'void'), async (req, res) => {
  const p = await Party.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Party not found' });
  if ((await Invoice.exists({ party: p._id })) || (await Payment.exists({ party: p._id })) || p.openingBalance > 0) {
    throw new AccountingError('This party has transactions. Mark it inactive instead of deleting.');
  }
  await p.deleteOne();
  await audit(req, 'delete', 'Party', p._id, `Deleted ${p.type} ${p.name}`);
  res.json({ ok: true });
});
r.get('/parties/:id/statement', guard('sales', 'read'), async (req, res) => {
  const p = await Party.findById(req.params.id).lean();
  if (!p) return res.status(404).json({ error: 'Party not found' });
  const cust = p.type === 'customer';
  const [invs, pays] = await Promise.all([
    Invoice.find({ party: p._id, status: { $ne: 'void' } }).lean(),
    Payment.find({ party: p._id, status: 'posted' }).lean(),
  ]);
  const rows = [
    ...invs.map((i) => ({ date: i.date, ref: i.number, desc: cust ? 'Sales invoice' : 'Purchase bill', debit: cust ? i.total : 0, credit: cust ? 0 : i.total })),
    ...pays.map((x) => ({ date: x.date, ref: x.number, desc: cust ? 'Receipt' : 'Payment', debit: cust ? 0 : x.amount, credit: cust ? x.amount : 0 })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  let bal = p.openingBalance || 0;
  const out = rows.map((x) => {
    bal = r2(bal + (cust ? x.debit - x.credit : x.credit - x.debit));
    return { ...x, balance: bal };
  });
  res.json({ party: p, opening: p.openingBalance || 0, rows: out, closing: bal });
});

// ================= Items & stock =================
const itemSchema = z.object({
  sku: z.string().trim().min(1), name: z.string().trim().min(2), category: optStr, unit: optStr,
  salePrice: money.optional(), vatRate: money.optional(), reorderLevel: money.optional(), active: z.boolean().optional(),
  openingQty: money.optional(), openingCost: money.optional(),
});
r.get('/items', guard('inventory', 'read'), async (req, res) => {
  const f = {};
  if (req.query.q) f.$or = [{ name: new RegExp(esc(req.query.q), 'i') }, { sku: new RegExp(esc(req.query.q), 'i') }];
  if (req.query.category) f.category = req.query.category;
  res.json(await Item.find(f).sort({ name: 1 }).limit(LIMIT).lean());
});
r.post('/items', guard('inventory', 'write'), validate(itemSchema), async (req, res) => {
  const it = await P.createItem(clean(req.body), req.user._id);
  await audit(req, 'create', 'Item', it._id, `Created item ${it.sku} ${it.name}`);
  res.status(201).json(it);
});
r.put('/items/:id', guard('inventory', 'write'), validate(itemSchema.partial()), async (req, res) => {
  const it = await Item.findById(req.params.id);
  if (!it) return res.status(404).json({ error: 'Item not found' });
  const { openingQty, openingCost, ...rest } = req.body;
  Object.assign(it, clean(rest));
  await it.save();
  await audit(req, 'update', 'Item', it._id, `Updated item ${it.sku}`);
  res.json(it);
});
r.delete('/items/:id', guard('inventory', 'void'), async (req, res) => {
  const it = await Item.findById(req.params.id);
  if (!it) return res.status(404).json({ error: 'Item not found' });
  if ((await StockMovement.exists({ item: it._id })) || (await Invoice.exists({ 'lines.item': it._id }))) {
    throw new AccountingError('This item has stock history. Mark it inactive instead of deleting.');
  }
  await it.deleteOne();
  await audit(req, 'delete', 'Item', it._id, `Deleted item ${it.sku}`);
  res.json({ ok: true });
});
r.get('/stock-movements', guard('inventory', 'read'), async (req, res) => {
  const f = { ...dateRange(req.query), voided: false };
  if (req.query.item) f.item = req.query.item;
  res.json(await StockMovement.find(f).sort({ date: -1, createdAt: -1 }).limit(LIMIT).populate('item', 'sku name unit').lean());
});
r.post('/stock-adjustments', guard('inventory', 'write'), validate(z.object({
  item: id, direction: z.enum(['in', 'out']), qty: pos, unitCost: money.optional(), date: date.optional(), note: z.string().min(3, 'Give a reason for the adjustment'),
})), async (req, res) => {
  const m = await P.adjustStock(req.body, req.user._id);
  await audit(req, 'create', 'StockAdjustment', m._id, `Stock ${req.body.direction} ${req.body.qty}: ${req.body.note}`);
  res.status(201).json(m);
});

// ================= Invoices (sales & purchase) =================
const invoiceSchema = z.object({
  party: id, date, dueDate: date.optional(), supplierRef: optStr, notes: optStr,
  lines: z.array(z.object({ item: id.optional().or(z.literal('')), description: optStr, qty: pos, rate: money, vatRate: money.optional() })).min(1),
});
for (const [path, type, mod] of [['sales-invoices', 'sale', 'sales'], ['purchase-bills', 'purchase', 'purchase']]) {
  r.get(`/${path}`, guard(mod, 'read'), async (req, res) => {
    const f = { type, ...dateRange(req.query) };
    if (req.query.status) f.status = req.query.status;
    if (req.query.party) f.party = req.query.party;
    if (req.query.q) f.number = new RegExp(esc(req.query.q), 'i');
    const docs = await Invoice.find(f).sort({ date: -1, createdAt: -1 }).limit(LIMIT).populate('party', 'name').populate('lines.item', 'sku name unit').lean();
    res.json(docs);
  });
  r.get(`/${path}/:id`, guard(mod, 'read'), async (req, res) => {
    const d = await Invoice.findOne({ _id: req.params.id, type }).populate('party').populate('lines.item', 'sku name unit').lean();
    if (!d) return res.status(404).json({ error: 'Document not found' });
    res.json(d);
  });
  r.post(`/${path}`, guard(mod, 'write'), validate(invoiceSchema), async (req, res) => {
    const body = { ...req.body, lines: req.body.lines.map((l) => clean(l)) };
    const d = await P.createInvoice(type, body, req.user._id);
    await audit(req, 'create', 'Invoice', d._id, `Created ${type === 'sale' ? 'sales invoice' : 'purchase bill'} ${d.number} for ${d.total.toFixed(2)}`);
    res.status(201).json(d);
  });
  r.post(`/${path}/:id/void`, guard(mod, 'void'), validate(z.object({ reason: z.string().min(3, 'A reason is required') })), async (req, res) => {
    const d = await P.voidInvoice(req.params.id, req.user._id, req.body.reason);
    await audit(req, 'void', 'Invoice', d._id, `Voided ${d.number}: ${req.body.reason}`);
    res.json(d);
  });
}

// ================= Payments / receipts =================
const paymentSchema = z.object({
  party: id, date, account: id, amount: pos, method: z.enum(['cash', 'bank', 'cheque', 'mobile']).optional(),
  reference: optStr, notes: optStr, allocations: z.array(z.object({ invoice: id, amount: pos })).optional(),
});
r.get('/payments', guard('payments', 'read'), async (req, res) => {
  const f = { ...dateRange(req.query) };
  if (req.query.type) f.type = req.query.type;
  if (req.query.party) f.party = req.query.party;
  if (req.query.status) f.status = req.query.status;
  if (req.query.q) f.number = new RegExp(esc(req.query.q), 'i');
  res.json(await Payment.find(f).sort({ date: -1, createdAt: -1 }).limit(LIMIT).populate('party', 'name').populate('account', 'code name').lean());
});
r.post('/payments/:kind', guard('payments', 'write'), validate(paymentSchema), async (req, res) => {
  const kind = req.params.kind;
  if (!['receipt', 'payment'].includes(kind)) return res.status(404).json({ error: 'Unknown payment type' });
  const p = await P.createPayment(kind, clean(req.body), req.user._id);
  await audit(req, 'create', 'Payment', p._id, `Recorded ${kind} ${p.number} for ${p.amount.toFixed(2)}`);
  res.status(201).json(p);
});
r.post('/payments/:id/void', guard('payments', 'void'), validate(z.object({ reason: z.string().min(3, 'A reason is required') })), async (req, res) => {
  const p = await P.voidPayment(req.params.id, req.user._id, req.body.reason);
  await audit(req, 'void', 'Payment', p._id, `Voided ${p.number}: ${req.body.reason}`);
  res.json(p);
});

// ================= Expenses =================
const expenseSchema = z.object({
  date, expenseAccount: id, paidFrom: id, amount: pos, vat: money.optional(), payee: optStr, description: optStr, reference: optStr,
});
r.get('/expenses', guard('expenses', 'read'), async (req, res) => {
  const f = { ...dateRange(req.query) };
  if (req.query.account) f.expenseAccount = req.query.account;
  if (req.query.status) f.status = req.query.status;
  if (req.query.q) f.$or = [{ payee: new RegExp(esc(req.query.q), 'i') }, { description: new RegExp(esc(req.query.q), 'i') }, { number: new RegExp(esc(req.query.q), 'i') }];
  res.json(await Expense.find(f).sort({ date: -1, createdAt: -1 }).limit(LIMIT).populate('expenseAccount', 'code name').populate('paidFrom', 'code name').lean());
});
r.post('/expenses', guard('expenses', 'write'), validate(expenseSchema), async (req, res) => {
  const e = await P.createExpense(clean(req.body), req.user._id);
  await audit(req, 'create', 'Expense', e._id, `Recorded expense ${e.number} for ${(e.amount + e.vat).toFixed(2)}`);
  res.status(201).json(e);
});
r.post('/expenses/:id/void', guard('expenses', 'void'), validate(z.object({ reason: z.string().min(3, 'A reason is required') })), async (req, res) => {
  const e = await P.voidExpense(req.params.id, req.user._id, req.body.reason);
  await audit(req, 'void', 'Expense', e._id, `Voided ${e.number}: ${req.body.reason}`);
  res.json(e);
});

// ================= VAT =================
r.get('/vat/summary', guard('vat', 'read'), async (req, res) => {
  const from = req.query.from, to = req.query.to;
  const range = dateRange({ from, to });
  const [sales, purchases, expenses, bal] = await Promise.all([
    Invoice.aggregate([{ $match: { type: 'sale', status: { $ne: 'void' }, ...range } }, { $group: { _id: null, taxable: { $sum: '$subtotal' }, vat: { $sum: '$vatTotal' }, n: { $sum: 1 } } }]),
    Invoice.aggregate([{ $match: { type: 'purchase', status: { $ne: 'void' }, ...range } }, { $group: { _id: null, taxable: { $sum: '$subtotal' }, vat: { $sum: '$vatTotal' }, n: { $sum: 1 } } }]),
    Expense.aggregate([{ $match: { status: 'posted', vat: { $gt: 0 }, ...range } }, { $group: { _id: null, taxable: { $sum: '$amount' }, vat: { $sum: '$vat' }, n: { $sum: 1 } } }]),
    P.vatBalances(to || new Date()),
  ]);
  const out = sales[0] || { taxable: 0, vat: 0, n: 0 };
  const inP = purchases[0] || { taxable: 0, vat: 0, n: 0 };
  const inE = expenses[0] || { taxable: 0, vat: 0, n: 0 };
  const outputVat = r2(out.vat);
  const inputVat = r2(inP.vat + inE.vat);
  res.json({
    period: { from, to },
    output: { taxable: r2(out.taxable), vat: outputVat, documents: out.n },
    input: { purchases: { taxable: r2(inP.taxable), vat: r2(inP.vat), documents: inP.n }, expenses: { taxable: r2(inE.taxable), vat: r2(inE.vat), documents: inE.n }, vat: inputVat },
    netPayable: r2(outputVat - inputVat),
    ledger: { outputBalance: bal.output, inputBalance: bal.input, netPayable: r2(bal.output - bal.input) },
  });
});
r.get('/vat/register', guard('vat', 'read'), async (req, res) => {
  const range = dateRange(req.query);
  const [inv, exp] = await Promise.all([
    Invoice.find({ status: { $ne: 'void' }, vatTotal: { $gt: 0 }, ...range }).populate('party', 'name bin').lean(),
    Expense.find({ status: 'posted', vat: { $gt: 0 }, ...range }).lean(),
  ]);
  const rows = [
    ...inv.map((i) => ({ date: i.date, type: i.type === 'sale' ? 'Output (Sales)' : 'Input (Purchase)', number: i.number, party: i.party?.name, bin: i.party?.bin, taxable: i.subtotal, vat: i.vatTotal })),
    ...exp.map((e) => ({ date: e.date, type: 'Input (Expense)', number: e.number, party: e.payee, taxable: e.amount, vat: e.vat })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(rows);
});
r.post('/vat/settle', guard('vat', 'write'), validate(z.object({ date, account: id.optional() })), async (req, res) => {
  const out = await P.settleVat(req.body, req.user._id);
  await audit(req, 'create', 'VatSettlement', out.entry._id, `VAT settled: payable ${out.payable.toFixed(2)}`);
  res.status(201).json(out);
});

// ================= Employees & payroll =================
const empSchema = z.object({
  empId: z.string().trim().min(1), name: z.string().trim().min(2), designation: optStr, department: optStr, phone: optStr, nid: optStr,
  joinDate: date.optional(), basic: money, houseRent: money.optional(), medical: money.optional(), conveyance: money.optional(),
  otherAllowance: money.optional(), taxDeduction: money.optional(), active: z.boolean().optional(),
});
r.get('/employees', guard('payroll', 'read'), async (req, res) => {
  const f = {};
  if (req.query.q) f.$or = [{ name: new RegExp(esc(req.query.q), 'i') }, { empId: new RegExp(esc(req.query.q), 'i') }];
  res.json(await Employee.find(f).sort({ empId: 1 }).limit(LIMIT).lean());
});
r.post('/employees', guard('payroll', 'write'), validate(empSchema), async (req, res) => {
  const e = await Employee.create(clean(req.body));
  await audit(req, 'create', 'Employee', e._id, `Added employee ${e.empId} ${e.name}`);
  res.status(201).json(e);
});
r.put('/employees/:id', guard('payroll', 'write'), validate(empSchema.partial()), async (req, res) => {
  const e = await Employee.findById(req.params.id);
  if (!e) return res.status(404).json({ error: 'Employee not found' });
  Object.assign(e, clean(req.body));
  await e.save();
  await audit(req, 'update', 'Employee', e._id, `Updated employee ${e.empId}`);
  res.json(e);
});
r.delete('/employees/:id', guard('payroll', 'void'), async (req, res) => {
  const e = await Employee.findById(req.params.id);
  if (!e) return res.status(404).json({ error: 'Employee not found' });
  if (await PayrollRun.exists({ 'lines.employee': e._id })) throw new AccountingError('This employee is in payroll history. Mark them inactive instead.');
  await e.deleteOne();
  await audit(req, 'delete', 'Employee', e._id, `Deleted employee ${e.empId}`);
  res.json({ ok: true });
});
r.get('/payroll', guard('payroll', 'read'), async (_req, res) => res.json(await PayrollRun.find().sort({ month: -1 }).populate('paidAccount', 'name').lean()));
r.post('/payroll/process', guard('payroll', 'write'), validate(z.object({ month: z.string() })), async (req, res) => {
  const run = await P.processPayroll(req.body.month, req.user._id);
  await audit(req, 'create', 'PayrollRun', run._id, `Processed payroll ${run.month}: net ${run.totalNet.toFixed(2)}`);
  res.status(201).json(run);
});
r.post('/payroll/:id/pay', guard('payroll', 'write'), validate(z.object({ account: id, date: date.optional() })), async (req, res) => {
  const run = await P.payPayroll(req.params.id, req.body, req.user._id);
  await audit(req, 'update', 'PayrollRun', run._id, `Paid payroll ${run.month}`);
  res.json(run);
});
r.post('/payroll/:id/void', guard('payroll', 'void'), async (req, res) => {
  const run = await P.voidPayroll(req.params.id, req.user._id);
  await audit(req, 'void', 'PayrollRun', run._id, `Voided payroll ${run.month}`);
  res.json(run);
});

// ================= Fixed assets =================
const assetSchema = z.object({
  name: z.string().trim().min(2), category: optStr, purchaseDate: date, cost: pos, salvage: money.optional(),
  usefulLifeYears: pos, method: z.enum(['SL', 'WDV']), rate: money.optional(), paidFrom: id,
});
r.get('/assets', guard('assets', 'read'), async (req, res) => {
  const f = {};
  if (req.query.q) f.$or = [{ name: new RegExp(esc(req.query.q), 'i') }, { code: new RegExp(esc(req.query.q), 'i') }];
  if (req.query.status) f.status = req.query.status;
  res.json(await FixedAsset.find(f).sort({ code: 1 }).limit(LIMIT).lean());
});
r.post('/assets', guard('assets', 'write'), validate(assetSchema), async (req, res) => {
  const a = await P.createAsset(clean(req.body), req.user._id);
  await audit(req, 'create', 'FixedAsset', a._id, `Added asset ${a.code} ${a.name} cost ${a.cost.toFixed(2)}`);
  res.status(201).json(a);
});
r.post('/assets/depreciate', guard('assets', 'write'), validate(z.object({ month: z.string() })), async (req, res) => {
  const out = await P.runDepreciation(req.body.month, req.user._id);
  await audit(req, 'create', 'Depreciation', out.entry._id, `Depreciation ${req.body.month}: ${out.total.toFixed(2)}`);
  res.status(201).json(out);
});
r.post('/assets/:id/dispose', guard('assets', 'void'), validate(z.object({ date, proceeds: money.optional(), account: id.optional() })), async (req, res) => {
  const out = await P.disposeAsset(req.params.id, req.body, req.user._id);
  await audit(req, 'update', 'FixedAsset', out.asset._id, `Disposed asset ${out.asset.code}`);
  res.json(out);
});

// ================= Audit log & settings =================
r.get('/audit-logs', guard('audit', 'read'), async (req, res) => {
  const f = { ...dateRange(req.query, 'at') };
  if (req.query.user) f.user = req.query.user;
  if (req.query.entity) f.entity = req.query.entity;
  if (req.query.action) f.action = req.query.action;
  if (req.query.q) f.summary = new RegExp(esc(req.query.q), 'i');
  res.json(await AuditLog.find(f).sort({ at: -1 }).limit(LIMIT).lean());
});
r.get('/settings', async (_req, res) => res.json((await Settings.findOne({ key: 'main' })) || (await Settings.create({ key: 'main' }))));
r.put('/settings', guard('settings', 'write'), validate(z.object({
  companyName: z.string().min(2).optional(), address: optStr, phone: optStr, email: optStr, bin: optStr, tin: optStr,
  defaultVatRate: money.optional(), vatRates: z.array(money).optional(),
})), async (req, res) => {
  const s = (await Settings.findOne({ key: 'main' })) || new Settings({ key: 'main' });
  Object.assign(s, req.body);
  await s.save();
  await audit(req, 'update', 'Settings', s._id, 'Updated company settings');
  res.json(s);
});

export default r;
