// Pure accounting engine: no database access, fully unit-testable.
// All money is validated in integer paisa to avoid floating-point drift.

export const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const toPaisa = (n) => Math.round(Number(n) * 100);

export class AccountingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'AccountingError';
    this.status = status;
  }
}

export const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'income', 'expense'];
const DEBIT_NORMAL = new Set(['asset', 'expense']);

/** Natural balance: positive when the account sits on its normal side. */
export function naturalBalance(type, debit, credit) {
  return r2(DEBIT_NORMAL.has(type) ? debit - credit : credit - debit);
}

/**
 * Validates a set of journal lines and returns normalised lines + totals.
 * Rules: >= 2 lines, every line has exactly one positive side, total debit == total credit.
 */
export function validateEntry(lines) {
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new AccountingError('A journal entry needs at least two lines');
  }
  let dr = 0;
  let cr = 0;
  const out = lines.map((l, i) => {
    if (!l || !l.account) throw new AccountingError(`Line ${i + 1}: account is required`);
    const debit = Number(l.debit || 0);
    const credit = Number(l.credit || 0);
    if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit < 0 || credit < 0) {
      throw new AccountingError(`Line ${i + 1}: amounts must be non-negative numbers`);
    }
    if (debit > 0 && credit > 0) {
      throw new AccountingError(`Line ${i + 1}: a line cannot have both debit and credit`);
    }
    if (debit === 0 && credit === 0) {
      throw new AccountingError(`Line ${i + 1}: enter a debit or credit amount`);
    }
    dr += toPaisa(debit);
    cr += toPaisa(credit);
    return { account: l.account, debit: r2(debit), credit: r2(credit), memo: l.memo || '' };
  });
  if (dr !== cr) {
    throw new AccountingError(
      `Entry is not balanced: debit ${(dr / 100).toFixed(2)} vs credit ${(cr / 100).toFixed(2)}`
    );
  }
  if (dr === 0) throw new AccountingError('Entry total must be greater than zero');
  return { lines: out, totalDebit: dr / 100, totalCredit: cr / 100 };
}

/** Invoice maths. Lines: { qty, rate, vatRate } */
export function calcInvoice(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new AccountingError('At least one invoice line is required');
  }
  let subtotal = 0;
  let vatTotal = 0;
  const out = lines.map((l, i) => {
    const qty = Number(l.qty);
    const rate = Number(l.rate);
    const vatRate = Number(l.vatRate || 0);
    if (!(qty > 0)) throw new AccountingError(`Line ${i + 1}: quantity must be greater than zero`);
    if (!(rate >= 0)) throw new AccountingError(`Line ${i + 1}: rate cannot be negative`);
    if (vatRate < 0 || vatRate > 100) throw new AccountingError(`Line ${i + 1}: invalid VAT rate`);
    const amount = r2(qty * rate);
    const vat = r2((amount * vatRate) / 100);
    subtotal += amount;
    vatTotal += vat;
    return { ...l, qty, rate, vatRate, amount, vat };
  });
  subtotal = r2(subtotal);
  vatTotal = r2(vatTotal);
  return { lines: out, subtotal, vatTotal, total: r2(subtotal + vatTotal) };
}

/** Weighted-average cost after receiving stock. */
export function newAvgCost(oldQty, oldAvg, inQty, inCost) {
  const totalQty = oldQty + inQty;
  if (totalQty <= 0) return r2(inCost);
  return r2((oldQty * oldAvg + inQty * inCost) / totalQty);
}

/** Payroll for one employee for one month. */
export function calcPayrollLine(emp, { advance = 0, otherDeduction = 0 } = {}) {
  const basic = Number(emp.basic || 0);
  const allowances = r2(
    Number(emp.houseRent || 0) + Number(emp.medical || 0) + Number(emp.conveyance || 0) + Number(emp.otherAllowance || 0)
  );
  const gross = r2(basic + allowances);
  const tax = r2(Number(emp.taxDeduction || 0));
  const deductions = r2(tax + Number(advance) + Number(otherDeduction));
  if (deductions > gross) throw new AccountingError(`${emp.name}: deductions exceed gross salary`);
  return { basic, allowances, gross, tax, advance: r2(advance), otherDeduction: r2(otherDeduction), net: r2(gross - deductions) };
}

/** Monthly depreciation, never taking book value below salvage value. */
export function monthlyDepreciation(asset, currentBookValue) {
  const salvage = Number(asset.salvage || 0);
  const room = r2(currentBookValue - salvage);
  if (room <= 0) return 0;
  let dep;
  if (asset.method === 'WDV') {
    dep = (currentBookValue * Number(asset.rate || 0)) / 100 / 12;
  } else {
    dep = (Number(asset.cost) - salvage) / (Number(asset.usefulLifeYears) * 12);
  }
  return Math.min(r2(dep), room);
}

// ---------- Report builders (inputs: accounts[], sums Map<accountId,{debit,credit}>) ----------

const sumOf = (sums, id) => sums.get(String(id)) || { debit: 0, credit: 0 };

export function buildTrialBalance(accounts, sums) {
  const rows = [];
  let totalDebit = 0;
  let totalCredit = 0;
  for (const a of accounts) {
    const s = sumOf(sums, a._id);
    if (!s.debit && !s.credit) continue;
    const net = r2(s.debit - s.credit);
    const debit = net > 0 ? net : 0;
    const credit = net < 0 ? -net : 0;
    totalDebit += debit;
    totalCredit += credit;
    rows.push({ accountId: a._id, code: a.code, name: a.name, type: a.type, debit, credit });
  }
  rows.sort((x, y) => x.code.localeCompare(y.code));
  totalDebit = r2(totalDebit);
  totalCredit = r2(totalCredit);
  return { rows, totalDebit, totalCredit, balanced: toPaisa(totalDebit) === toPaisa(totalCredit) };
}

function sectionRows(accounts, sums, type, filter = () => true) {
  const rows = [];
  let total = 0;
  for (const a of accounts) {
    if (a.type !== type || !filter(a)) continue;
    const s = sumOf(sums, a._id);
    const amount = naturalBalance(type, s.debit, s.credit);
    if (!amount) continue;
    total += amount;
    rows.push({ accountId: a._id, code: a.code, name: a.name, amount });
  }
  rows.sort((x, y) => x.code.localeCompare(y.code));
  return { rows, total: r2(total) };
}

export function buildProfitLoss(accounts, sums) {
  const income = sectionRows(accounts, sums, 'income');
  const cogs = sectionRows(accounts, sums, 'expense', (a) => a.subType === 'cogs');
  const opex = sectionRows(accounts, sums, 'expense', (a) => a.subType !== 'cogs');
  const grossProfit = r2(income.total - cogs.total);
  const netProfit = r2(grossProfit - opex.total);
  return { income, cogs, grossProfit, operatingExpenses: opex, totalExpense: r2(cogs.total + opex.total), netProfit };
}

export function buildBalanceSheet(accounts, sums) {
  const assets = sectionRows(accounts, sums, 'asset');
  const liabilities = sectionRows(accounts, sums, 'liability');
  const equity = sectionRows(accounts, sums, 'equity');
  const pl = buildProfitLoss(accounts, sums);
  const currentEarnings = pl.netProfit;
  const totalEquity = r2(equity.total + currentEarnings);
  const totalLiabilitiesAndEquity = r2(liabilities.total + totalEquity);
  return {
    assets,
    liabilities,
    equity: { ...equity, currentEarnings, total: totalEquity },
    totalAssets: assets.total,
    totalLiabilitiesAndEquity,
    balanced: toPaisa(assets.total) === toPaisa(totalLiabilitiesAndEquity),
  };
}

/**
 * Direct-method cash flow. entries: [{ lines:[{account,debit,credit}] }] within the period.
 * Each entry's net cash movement is classified by the largest non-cash line's cashFlowCategory.
 */
export function buildCashFlow(accounts, entries, openingCash) {
  const byId = new Map(accounts.map((a) => [String(a._id), a]));
  const isCash = (a) => a && (a.subType === 'cash' || a.subType === 'bank');
  const cats = {
    operating: new Map(),
    investing: new Map(),
    financing: new Map(),
  };
  for (const e of entries) {
    let cashNet = 0;
    let best = null;
    for (const l of e.lines) {
      const acc = byId.get(String(l.account));
      if (!acc) continue;
      if (isCash(acc)) {
        cashNet += l.debit - l.credit;
      } else {
        const size = Math.max(l.debit, l.credit);
        if (!best || size > best.size) best = { size, acc };
      }
    }
    cashNet = r2(cashNet);
    if (!cashNet || !best) continue;
    const cat = cats[best.acc.cashFlowCategory] ? best.acc.cashFlowCategory : 'operating';
    cats[cat].set(best.acc.name, r2((cats[cat].get(best.acc.name) || 0) + cashNet));
  }
  const shape = (m) => {
    const items = [...m.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => a.name.localeCompare(b.name));
    return { items, total: r2(items.reduce((s, i) => s + i.amount, 0)) };
  };
  const operating = shape(cats.operating);
  const investing = shape(cats.investing);
  const financing = shape(cats.financing);
  const netChange = r2(operating.total + investing.total + financing.total);
  return { operating, investing, financing, netChange, openingCash: r2(openingCash), closingCash: r2(openingCash + netChange) };
}

/** Receivable/payable ageing buckets. items: [{ dueDate, outstanding }] */
export function ageBuckets(items, asOf) {
  const b = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
  const asOfMs = new Date(asOf).getTime();
  for (const it of items) {
    const days = Math.floor((asOfMs - new Date(it.dueDate).getTime()) / 86400000);
    const amt = Number(it.outstanding);
    if (days <= 0) b.current += amt;
    else if (days <= 30) b.d1_30 += amt;
    else if (days <= 60) b.d31_60 += amt;
    else if (days <= 90) b.d61_90 += amt;
    else b.d90plus += amt;
  }
  for (const k of Object.keys(b)) b[k] = r2(b[k]);
  b.total = r2(b.current + b.d1_30 + b.d31_60 + b.d61_90 + b.d90plus);
  return b;
}
