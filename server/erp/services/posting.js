// Business documents -> double-entry postings. Every document that moves money or stock
// posts a balanced journal entry; voiding reverses it.
import { Account, JournalEntry, nextNumber } from '../models/core.js';
import { Party, Item, StockMovement, Invoice, Payment, Expense } from '../models/trade.js';
import { Employee, PayrollRun, FixedAsset } from '../models/hr.js';
import { sysAccount, postEntry, voidEntry, requireCashOrBank, accountSums, endOfDay } from './ledger.js';
import { AccountingError, calcInvoice, newAvgCost, calcPayrollLine, monthlyDepreciation, naturalBalance, r2 } from './accounting.js';

const fail = (m, s = 400) => { throw new AccountingError(m, s); };
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

/** Run `fn`; if it throws, run each registered undo (in reverse) then rethrow. */
async function withUndo(fn) {
  const undos = [];
  try {
    return await fn((u) => undos.push(u));
  } catch (err) {
    for (const u of undos.reverse()) {
      try { await u(); } catch (e) { console.error('Rollback step failed:', e.message); }
    }
    throw err;
  }
}

// ---------------- Party balances ----------------
export async function partyBalance(partyId) {
  const party = await Party.findById(partyId);
  if (!party) fail('Party not found', 404);
  const isCustomer = party.type === 'customer';
  const [inv] = await Invoice.aggregate([
    { $match: { party: party._id, type: isCustomer ? 'sale' : 'purchase', status: { $ne: 'void' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const [pay] = await Payment.aggregate([
    { $match: { party: party._id, type: isCustomer ? 'receipt' : 'payment', status: 'posted' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return r2((party.openingBalance || 0) + (inv?.total || 0) - (pay?.total || 0));
}

export async function createParty(data, userId) {
  const { openingBalance = 0, openingDate, ...rest } = data;
  const party = await Party.create({ ...rest, openingBalance });
  if (openingBalance > 0) {
    try {
      const ar = party.type === 'customer';
      const [main, eq] = await Promise.all([sysAccount(ar ? 'AR' : 'AP'), sysAccount('OPEN_EQ')]);
      await postEntry({
        date: openingDate || new Date(), voucherType: 'opening',
        narration: `Opening balance - ${party.name}`,
        lines: ar
          ? [{ account: main, debit: openingBalance }, { account: eq, credit: openingBalance }]
          : [{ account: eq, debit: openingBalance }, { account: main, credit: openingBalance }],
        source: { kind: 'Party', id: party._id }, userId,
      });
    } catch (e) {
      await Party.deleteOne({ _id: party._id });
      throw e;
    }
  }
  return party;
}

// ---------------- Invoices ----------------
export async function createInvoice(type, data, userId) {
  const party = await Party.findById(data.party);
  if (!party || !party.active) fail('Select a valid active party');
  if (type === 'sale' && party.type !== 'customer') fail('Sales invoices need a customer');
  if (type === 'purchase' && party.type !== 'supplier') fail('Purchase bills need a supplier');

  const date = new Date(data.date);
  const dueDate = data.dueDate ? new Date(data.dueDate) : addDays(date, party.creditDays || 0);
  if (dueDate < date) fail('Due date cannot be before the invoice date');

  const itemIds = data.lines.map((l) => l.item).filter(Boolean);
  const items = new Map((await Item.find({ _id: { $in: itemIds } })).map((i) => [String(i._id), i]));
  for (const l of data.lines) {
    if (l.item && !items.has(String(l.item))) fail('An item on the invoice no longer exists');
    if (type === 'purchase' && !l.item) fail('Every purchase line must be a stock item');
    if (!l.item && !l.description) fail('Lines without an item need a description');
  }
  const calc = calcInvoice(data.lines);

  if (type === 'sale' && party.creditLimit > 0) {
    const bal = await partyBalance(party._id);
    if (bal + calc.total > party.creditLimit) {
      fail(`Credit limit exceeded: balance ${bal.toFixed(2)} + invoice ${calc.total.toFixed(2)} > limit ${party.creditLimit.toFixed(2)}`);
    }
  }

  return withUndo(async (undo) => {
    const lines = calc.lines.map((l) => ({
      item: l.item || undefined, description: l.description, qty: l.qty, rate: l.rate,
      vatRate: l.vatRate, amount: l.amount, vat: l.vat,
    }));
    const prefix = type === 'sale' ? 'INV' : 'BILL';
    const number = await nextNumber(`invoice-${type}`, prefix);
    const movements = [];

    // Stock first (atomic guards against overselling)
    for (const l of lines) {
      if (!l.item) continue;
      if (type === 'sale') {
        const it = items.get(String(l.item));
        const res = await Item.updateOne({ _id: l.item, qtyOnHand: { $gte: l.qty } }, { $inc: { qtyOnHand: -l.qty } });
        if (res.modifiedCount !== 1) fail(`Insufficient stock for ${it.name} (need ${l.qty}, have ${it.qtyOnHand})`);
        undo(() => Item.updateOne({ _id: l.item }, { $inc: { qtyOnHand: l.qty } }));
        const fresh = await Item.findById(l.item);
        l.unitCost = fresh.avgCost;
        movements.push({ item: l.item, date, type: 'out', qty: l.qty, unitCost: fresh.avgCost, reference: number });
      } else {
        const it = await Item.findById(l.item);
        const avg = newAvgCost(it.qtyOnHand, it.avgCost, l.qty, l.rate);
        const prev = { qty: it.qtyOnHand, avg: it.avgCost };
        await Item.updateOne({ _id: l.item }, { $inc: { qtyOnHand: l.qty }, $set: { avgCost: avg } });
        undo(() => Item.updateOne({ _id: l.item }, { $inc: { qtyOnHand: -l.qty }, $set: { avgCost: prev.avg } }));
        movements.push({ item: l.item, date, type: 'in', qty: l.qty, unitCost: l.rate, reference: number });
      }
    }

    // Main journal
    let jv;
    if (type === 'sale') {
      const [ar, sales, service, vatOut] = await Promise.all([sysAccount('AR'), sysAccount('SALES'), sysAccount('SERVICE'), sysAccount('VAT_OUT')]);
      const goods = r2(lines.filter((l) => l.item).reduce((s, l) => s + l.amount, 0));
      const svc = r2(calc.subtotal - goods);
      const jl = [{ account: ar, debit: calc.total }];
      if (goods > 0) jl.push({ account: sales, credit: goods });
      if (svc > 0) jl.push({ account: service, credit: svc });
      if (calc.vatTotal > 0) jl.push({ account: vatOut, credit: calc.vatTotal });
      jv = await postEntry({ date, voucherType: 'sales', narration: `Sales invoice ${number} - ${party.name}`, reference: number, lines: jl, userId });
    } else {
      const [inv, vatIn, ap] = await Promise.all([sysAccount('INVENTORY'), sysAccount('VAT_IN'), sysAccount('AP')]);
      const jl = [{ account: inv, debit: calc.subtotal }];
      if (calc.vatTotal > 0) jl.push({ account: vatIn, debit: calc.vatTotal });
      jl.push({ account: ap, credit: calc.total });
      jv = await postEntry({ date, voucherType: 'purchase', narration: `Purchase bill ${number} - ${party.name}`, reference: number, lines: jl, userId });
    }
    undo(() => voidEntry(jv._id, { reason: 'rollback', userId }));

    // COGS journal for sales of stock items
    let cogsJv;
    if (type === 'sale') {
      const cost = r2(lines.filter((l) => l.item).reduce((s, l) => s + l.qty * (l.unitCost || 0), 0));
      if (cost > 0) {
        const [cogs, inv] = await Promise.all([sysAccount('COGS'), sysAccount('INVENTORY')]);
        cogsJv = await postEntry({
          date, voucherType: 'sales', narration: `Cost of goods sold - ${number}`, reference: number,
          lines: [{ account: cogs, debit: cost }, { account: inv, credit: cost }], userId,
        });
        undo(() => voidEntry(cogsJv._id, { reason: 'rollback', userId }));
      }
    }

    const doc = await Invoice.create({
      type, number, supplierRef: data.supplierRef, party: party._id, date, dueDate, lines,
      subtotal: calc.subtotal, vatTotal: calc.vatTotal, total: calc.total, paid: 0, status: 'unpaid',
      notes: data.notes, journal: jv._id, cogsJournal: cogsJv?._id, createdBy: userId,
    });
    await StockMovement.insertMany(movements.map((m) => ({ ...m, source: { kind: 'Invoice', id: doc._id } })));
    await JournalEntry.updateMany({ _id: { $in: [jv._id, cogsJv?._id].filter(Boolean) } }, { $set: { source: { kind: 'Invoice', id: doc._id } } });
    return doc;
  });
}

export async function voidInvoice(id, userId, reason) {
  const inv = await Invoice.findById(id);
  if (!inv) fail('Invoice not found', 404);
  if (inv.status === 'void') fail('Invoice is already void');
  if (inv.paid > 0) fail('This invoice has payments applied. Void those payments first.');
  // Check stock is still available before reversing a purchase
  if (inv.type === 'purchase') {
    for (const l of inv.lines) {
      const it = await Item.findById(l.item);
      if (it && it.qtyOnHand < l.qty) fail(`Cannot void: ${it.name} stock already used (on hand ${it.qtyOnHand}, bill qty ${l.qty})`);
    }
  }
  await voidEntry(inv.journal, { reason: reason || `Void ${inv.number}`, userId });
  if (inv.cogsJournal) await voidEntry(inv.cogsJournal, { reason: reason || `Void ${inv.number}`, userId });
  for (const l of inv.lines) {
    if (!l.item) continue;
    await Item.updateOne({ _id: l.item }, { $inc: { qtyOnHand: inv.type === 'sale' ? l.qty : -l.qty } });
  }
  await StockMovement.updateMany({ 'source.kind': 'Invoice', 'source.id': inv._id }, { $set: { voided: true } });
  inv.status = 'void';
  await inv.save();
  return inv;
}

// ---------------- Payments ----------------
export async function accountBalance(accountId) {
  const acc = await Account.findById(accountId);
  const sums = await accountSums();
  const s = sums.get(String(accountId)) || { debit: 0, credit: 0 };
  return naturalBalance(acc.type, s.debit, s.credit);
}

export async function createPayment(type, data, userId) {
  const party = await Party.findById(data.party);
  if (!party) fail('Select a valid party');
  if ((type === 'receipt') !== (party.type === 'customer')) fail(type === 'receipt' ? 'Receipts are taken from customers' : 'Payments are made to suppliers');
  const cashAcc = await requireCashOrBank(data.account);
  const amount = r2(data.amount);
  if (!(amount > 0)) fail('Amount must be greater than zero');
  const date = new Date(data.date);

  if (type === 'payment' && cashAcc.subType === 'cash') {
    const bal = await accountBalance(cashAcc._id);
    if (amount > bal) fail(`Insufficient cash: ${cashAcc.name} balance is ${bal.toFixed(2)}`);
  }

  const invType = type === 'receipt' ? 'sale' : 'purchase';
  let allocations = (data.allocations || []).filter((a) => Number(a.amount) > 0);
  let invoices;
  if (allocations.length) {
    invoices = new Map((await Invoice.find({ _id: { $in: allocations.map((a) => a.invoice) } })).map((i) => [String(i._id), i]));
  } else {
    // auto-allocate oldest first
    const open = await Invoice.find({ party: party._id, type: invType, status: { $in: ['unpaid', 'partial'] } }).sort({ date: 1, createdAt: 1 });
    let left = amount;
    allocations = [];
    for (const inv of open) {
      if (left <= 0) break;
      const due = r2(inv.total - inv.paid);
      const a = Math.min(due, left);
      if (a > 0) { allocations.push({ invoice: inv._id, amount: r2(a) }); left = r2(left - a); }
    }
    invoices = new Map(open.map((i) => [String(i._id), i]));
  }
  let allocated = 0;
  for (const a of allocations) {
    const inv = invoices.get(String(a.invoice));
    if (!inv || String(inv.party) !== String(party._id) || inv.type !== invType) fail('An allocation points to an invoice that does not belong to this party');
    if (inv.status === 'void') fail(`Invoice ${inv.number} is void`);
    a.amount = r2(a.amount);
    if (a.amount > r2(inv.total - inv.paid) + 0.001) fail(`Allocation exceeds amount due on ${inv.number}`);
    allocated = r2(allocated + a.amount);
  }
  if (allocated > amount + 0.001) fail('Allocated total exceeds the payment amount');

  return withUndo(async (undo) => {
    const ctrl = await sysAccount(type === 'receipt' ? 'AR' : 'AP');
    const number = await nextNumber(`payment-${type}`, type === 'receipt' ? 'RCT' : 'PAY');
    const jv = await postEntry({
      date, voucherType: type === 'receipt' ? 'receipt' : 'payment',
      narration: `${type === 'receipt' ? 'Receipt from' : 'Payment to'} ${party.name} (${number})`, reference: data.reference || number,
      lines: type === 'receipt'
        ? [{ account: cashAcc._id, debit: amount }, { account: ctrl, credit: amount }]
        : [{ account: ctrl, debit: amount }, { account: cashAcc._id, credit: amount }],
      userId,
    });
    undo(() => voidEntry(jv._id, { reason: 'rollback', userId }));
    const pay = await Payment.create({
      type, number, party: party._id, date, method: data.method || (cashAcc.subType === 'bank' ? 'bank' : 'cash'),
      account: cashAcc._id, amount, allocations, reference: data.reference, notes: data.notes, journal: jv._id, createdBy: userId,
    });
    jv.source = { kind: 'Payment', id: pay._id };
    await jv.save();
    for (const a of allocations) {
      const inv = invoices.get(String(a.invoice));
      inv.paid = r2(inv.paid + a.amount);
      inv.status = inv.paid >= inv.total - 0.001 ? 'paid' : 'partial';
      await inv.save();
    }
    return pay;
  });
}

export async function voidPayment(id, userId, reason) {
  const pay = await Payment.findById(id);
  if (!pay) fail('Payment not found', 404);
  if (pay.status === 'void') fail('Payment is already void');
  await voidEntry(pay.journal, { reason: reason || `Void ${pay.number}`, userId });
  for (const a of pay.allocations) {
    const inv = await Invoice.findById(a.invoice);
    if (!inv) continue;
    inv.paid = r2(Math.max(0, inv.paid - a.amount));
    if (inv.status !== 'void') inv.status = inv.paid <= 0 ? 'unpaid' : 'partial';
    await inv.save();
  }
  pay.status = 'void';
  await pay.save();
  return pay;
}

// ---------------- Expenses ----------------
export async function createExpense(data, userId) {
  const exp = await Account.findById(data.expenseAccount);
  if (!exp || exp.type !== 'expense' || !exp.active) fail('Select a valid expense account');
  const paid = await requireCashOrBank(data.paidFrom);
  const amount = r2(data.amount);
  const vat = r2(data.vat || 0);
  const total = r2(amount + vat);
  if (paid.subType === 'cash') {
    const bal = await accountBalance(paid._id);
    if (total > bal) fail(`Insufficient cash: ${paid.name} balance is ${bal.toFixed(2)}`);
  }
  return withUndo(async (undo) => {
    const number = await nextNumber('expense', 'EXP');
    const lines = [{ account: exp._id, debit: amount }];
    if (vat > 0) lines.push({ account: await sysAccount('VAT_IN'), debit: vat });
    lines.push({ account: paid._id, credit: total });
    const jv = await postEntry({
      date: data.date, voucherType: 'expense',
      narration: `${exp.name}${data.payee ? ` - ${data.payee}` : ''}${data.description ? `: ${data.description}` : ''}`,
      reference: data.reference || number, lines, userId,
    });
    undo(() => voidEntry(jv._id, { reason: 'rollback', userId }));
    const doc = await Expense.create({
      number, date: data.date, expenseAccount: exp._id, payee: data.payee, description: data.description,
      amount, vat, paidFrom: paid._id, reference: data.reference, journal: jv._id, createdBy: userId,
    });
    jv.source = { kind: 'Expense', id: doc._id };
    await jv.save();
    return doc;
  });
}

export async function voidExpense(id, userId, reason) {
  const e = await Expense.findById(id);
  if (!e) fail('Expense not found', 404);
  if (e.status === 'void') fail('Expense is already void');
  await voidEntry(e.journal, { reason: reason || `Void ${e.number}`, userId });
  e.status = 'void';
  await e.save();
  return e;
}

// ---------------- Inventory adjustments ----------------
export async function adjustStock({ item: itemId, direction, qty, unitCost, date, note }, userId) {
  const item = await Item.findById(itemId);
  if (!item) fail('Item not found', 404);
  qty = Number(qty);
  if (!(qty > 0)) fail('Quantity must be greater than zero');
  const when = new Date(date || Date.now());
  const [inv, cogs] = await Promise.all([sysAccount('INVENTORY'), sysAccount('COGS')]);
  let cost;
  return withUndo(async (undo) => {
    if (direction === 'in') {
      cost = r2(unitCost ?? item.avgCost);
      const prev = { avg: item.avgCost };
      const avg = newAvgCost(item.qtyOnHand, item.avgCost, qty, cost);
      await Item.updateOne({ _id: item._id }, { $inc: { qtyOnHand: qty }, $set: { avgCost: avg } });
      undo(() => Item.updateOne({ _id: item._id }, { $inc: { qtyOnHand: -qty }, $set: { avgCost: prev.avg } }));
    } else {
      cost = item.avgCost;
      const res = await Item.updateOne({ _id: item._id, qtyOnHand: { $gte: qty } }, { $inc: { qtyOnHand: -qty } });
      if (res.modifiedCount !== 1) fail(`Cannot remove ${qty}: only ${item.qtyOnHand} on hand`);
      undo(() => Item.updateOne({ _id: item._id }, { $inc: { qtyOnHand: qty } }));
    }
    const value = r2(qty * cost);
    let jv = null;
    if (value > 0) {
      jv = await postEntry({
        date: when, voucherType: 'journal',
        narration: `Stock adjustment (${direction === 'in' ? 'gain' : 'loss'}) - ${item.name}${note ? `: ${note}` : ''}`,
        lines: direction === 'in'
          ? [{ account: inv, debit: value }, { account: cogs, credit: value }]
          : [{ account: cogs, debit: value }, { account: inv, credit: value }],
        userId,
      });
    }
    return StockMovement.create({
      item: item._id, date: when, type: direction === 'in' ? 'adjust_in' : 'adjust_out', qty, unitCost: cost, note,
      source: jv ? { kind: 'JournalEntry', id: jv._id } : undefined,
    });
  });
}

export async function createItem(data, userId) {
  const { openingQty = 0, openingCost = 0, ...rest } = data;
  const item = await Item.create({ ...rest, qtyOnHand: 0, avgCost: 0 });
  if (openingQty > 0) {
    try {
      const [inv, eq] = await Promise.all([sysAccount('INVENTORY'), sysAccount('OPEN_EQ')]);
      const value = r2(openingQty * openingCost);
      await Item.updateOne({ _id: item._id }, { $set: { qtyOnHand: openingQty, avgCost: openingCost } });
      if (value > 0) {
        await postEntry({
          date: new Date(), voucherType: 'opening', narration: `Opening stock - ${item.name}`,
          lines: [{ account: inv, debit: value }, { account: eq, credit: value }], userId,
        });
      }
      await StockMovement.create({ item: item._id, date: new Date(), type: 'opening', qty: openingQty, unitCost: openingCost });
    } catch (e) {
      await Item.deleteOne({ _id: item._id });
      throw e;
    }
  }
  return Item.findById(item._id);
}

// ---------------- VAT settlement ----------------
export async function vatBalances(asOf) {
  const [inId, outId] = await Promise.all([sysAccount('VAT_IN'), sysAccount('VAT_OUT')]);
  const sums = await accountSums({ to: asOf });
  const i = sums.get(String(inId)) || { debit: 0, credit: 0 };
  const o = sums.get(String(outId)) || { debit: 0, credit: 0 };
  return { input: r2(i.debit - i.credit), output: r2(o.credit - o.debit), inId, outId };
}

export async function settleVat({ date, account }, userId) {
  const { input, output, inId, outId } = await vatBalances(date);
  if (output <= 0 && input <= 0) fail('There is no VAT balance to settle');
  const lines = [];
  let payable = 0;
  if (input >= output) {
    if (output <= 0) fail('No output VAT to offset');
    lines.push({ account: outId, debit: output }, { account: inId, credit: output });
  } else {
    payable = r2(output - input);
    const bank = await requireCashOrBank(account);
    if (bank.subType === 'cash') {
      const bal = await accountBalance(bank._id);
      if (payable > bal) fail(`Insufficient cash: ${bank.name} balance is ${bal.toFixed(2)}`);
    }
    lines.push({ account: outId, debit: output });
    if (input > 0) lines.push({ account: inId, credit: input });
    lines.push({ account: bank._id, credit: payable });
  }
  const jv = await postEntry({ date, voucherType: 'vat', narration: `VAT settlement as of ${new Date(date).toISOString().slice(0, 10)}`, lines, userId });
  return { entry: jv, payable, carryForwardInput: input >= output ? r2(input - output) : 0 };
}

// ---------------- Payroll ----------------
export async function processPayroll(month, userId) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) fail('Month must be YYYY-MM');
  const existing = await PayrollRun.findOne({ month, status: { $ne: 'void' } });
  if (existing) fail(`Payroll for ${month} is already processed`);
  const employees = await Employee.find({ active: true });
  if (!employees.length) fail('There are no active employees');
  const lines = employees.map((e) => ({ employee: e._id, name: e.name, empId: e.empId, ...calcPayrollLine(e) }));
  const totals = lines.reduce((t, l) => ({ gross: t.gross + l.gross, tax: t.tax + l.tax, net: t.net + l.net }), { gross: 0, tax: 0, net: 0 });
  const gross = r2(totals.gross);
  const tax = r2(totals.tax);
  const net = r2(totals.net);
  const [exp, tds, pay] = await Promise.all([sysAccount('SAL_EXP'), sysAccount('TDS_PAY'), sysAccount('SAL_PAY')]);
  const [y, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(y, m, 0)); // last day of month
  const jl = [{ account: exp, debit: gross }];
  if (tax > 0) jl.push({ account: tds, credit: tax });
  jl.push({ account: pay, credit: net });
  const jv = await postEntry({ date, voucherType: 'payroll', narration: `Salary for ${month}`, reference: `PAYROLL-${month}`, lines: jl, userId });
  try {
    // A voided run frees the unique month key by renaming it
    await PayrollRun.updateMany({ month, status: 'void' }, { $set: { month: `${month}#void${Date.now()}` } });
    const run = await PayrollRun.create({
      month, lines, totalGross: gross, totalTax: tax, totalDeductions: tax, totalNet: net, status: 'processed', journal: jv._id, createdBy: userId,
    });
    jv.source = { kind: 'PayrollRun', id: run._id };
    await jv.save();
    return run;
  } catch (e) {
    await voidEntry(jv._id, { reason: 'rollback', userId });
    throw e;
  }
}

export async function payPayroll(id, { account, date }, userId) {
  const run = await PayrollRun.findById(id);
  if (!run) fail('Payroll run not found', 404);
  if (run.status !== 'processed') fail(`Payroll is already ${run.status}`);
  const bank = await requireCashOrBank(account);
  if (bank.subType === 'cash') {
    const bal = await accountBalance(bank._id);
    if (run.totalNet > bal) fail(`Insufficient cash: ${bank.name} balance is ${bal.toFixed(2)}`);
  }
  const pay = await sysAccount('SAL_PAY');
  const jv = await postEntry({
    date: date || new Date(), voucherType: 'payment', narration: `Salary payment for ${run.month}`, reference: `PAYROLL-${run.month}`,
    lines: [{ account: pay, debit: run.totalNet }, { account: bank._id, credit: run.totalNet }],
    source: { kind: 'PayrollRun', id: run._id }, userId,
  });
  run.status = 'paid';
  run.paidAccount = bank._id;
  run.paidDate = new Date(date || Date.now());
  run.paymentJournal = jv._id;
  await run.save();
  return run;
}

export async function voidPayroll(id, userId) {
  const run = await PayrollRun.findById(id);
  if (!run) fail('Payroll run not found', 404);
  if (run.status === 'paid') fail('Payroll is already paid. It cannot be voided.');
  if (run.status === 'void') fail('Payroll is already void');
  await voidEntry(run.journal, { reason: `Void payroll ${run.month}`, userId });
  run.status = 'void';
  await run.save();
  return run;
}

// ---------------- Fixed assets ----------------
export async function createAsset(data, userId) {
  const paid = await requireCashOrBank(data.paidFrom);
  if (data.salvage >= data.cost) fail('Salvage value must be lower than cost');
  if (data.method === 'WDV' && !(data.rate > 0)) fail('Enter the WDV depreciation rate (% per year)');
  if (paid.subType === 'cash') {
    const bal = await accountBalance(paid._id);
    if (data.cost > bal) fail(`Insufficient cash: ${paid.name} balance is ${bal.toFixed(2)}`);
  }
  const fa = await sysAccount('FIXED_ASSET');
  const code = await nextNumber('asset', 'FA', 4);
  const jv = await postEntry({
    date: data.purchaseDate, voucherType: 'payment', narration: `Purchase of fixed asset - ${data.name}`, reference: code,
    lines: [{ account: fa, debit: data.cost }, { account: paid._id, credit: data.cost }], userId,
  });
  try {
    const asset = await FixedAsset.create({ ...data, code, journal: jv._id, createdBy: userId });
    jv.source = { kind: 'FixedAsset', id: asset._id };
    await jv.save();
    return asset;
  } catch (e) {
    await voidEntry(jv._id, { reason: 'rollback', userId });
    throw e;
  }
}

export async function runDepreciation(month, userId) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) fail('Month must be YYYY-MM');
  const [y, m] = month.split('-').map(Number);
  const monthEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59));
  const assets = await FixedAsset.find({ status: 'active', purchaseDate: { $lte: monthEnd }, depMonths: { $ne: month } });
  const rows = [];
  for (const a of assets) {
    const dep = monthlyDepreciation(a, r2(a.cost - a.accumulatedDep));
    if (dep > 0) rows.push({ asset: a, dep });
  }
  if (!rows.length) fail(`No depreciation is due for ${month}`);
  const total = r2(rows.reduce((s, r) => s + r.dep, 0));
  const [depExp, acc] = await Promise.all([sysAccount('DEP_EXP'), sysAccount('ACC_DEP')]);
  const jv = await postEntry({
    date: monthEnd, voucherType: 'depreciation', narration: `Depreciation for ${month}`, reference: `DEP-${month}`,
    lines: [{ account: depExp, debit: total }, { account: acc, credit: total }], userId,
  });
  for (const { asset, dep } of rows) {
    asset.accumulatedDep = r2(asset.accumulatedDep + dep);
    asset.depMonths.push(month);
    await asset.save();
  }
  return { entry: jv, total, assets: rows.map((r) => ({ code: r.asset.code, name: r.asset.name, amount: r.dep })) };
}

export async function disposeAsset(id, { date, proceeds = 0, account }, userId) {
  const a = await FixedAsset.findById(id);
  if (!a) fail('Asset not found', 404);
  if (a.status === 'disposed') fail('Asset is already disposed');
  const book = r2(a.cost - a.accumulatedDep);
  proceeds = r2(proceeds);
  const [fa, acc, other, miscExp] = await Promise.all([
    sysAccount('FIXED_ASSET'), sysAccount('ACC_DEP'), sysAccount('OTHER_INCOME'),
    Account.findOne({ code: '5190' }).then((x) => x?._id || fail('Account 5190 missing')),
  ]);
  const lines = [{ account: fa, credit: a.cost }];
  if (a.accumulatedDep > 0) lines.push({ account: acc, debit: a.accumulatedDep });
  if (proceeds > 0) {
    const cash = await requireCashOrBank(account);
    lines.push({ account: cash._id, debit: proceeds });
  }
  const gain = r2(proceeds - book);
  if (gain > 0) lines.push({ account: other, credit: gain });
  if (gain < 0) lines.push({ account: miscExp, debit: -gain });
  const jv = await postEntry({ date, voucherType: 'journal', narration: `Disposal of asset ${a.code} - ${a.name}`, reference: a.code, lines, source: { kind: 'FixedAsset', id: a._id }, userId });
  a.status = 'disposed';
  await a.save();
  return { asset: a, entry: jv, gainOrLoss: gain };
}

export { endOfDay };
