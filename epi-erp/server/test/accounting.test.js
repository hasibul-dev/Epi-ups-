import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEntry, calcInvoice, newAvgCost, calcPayrollLine, monthlyDepreciation,
  buildTrialBalance, buildProfitLoss, buildBalanceSheet, buildCashFlow, ageBuckets, AccountingError, r2,
} from '../src/services/accounting.js';
import { DEFAULT_COA } from '../src/services/ledger.js';

const accounts = DEFAULT_COA.map(([code, name, type, subType, sysKey, cashFlowCategory]) => ({ _id: code, code, name, type, subType, sysKey, cashFlowCategory }));
const A = Object.fromEntries(accounts.filter((a) => a.sysKey).map((a) => [a.sysKey, a._id]));

const sumsFrom = (entries) => {
  const m = new Map();
  for (const e of entries) for (const l of e.lines) {
    const s = m.get(l.account) || { debit: 0, credit: 0 };
    s.debit = r2(s.debit + l.debit); s.credit = r2(s.credit + l.credit); m.set(l.account, s);
  }
  return m;
};
const post = (list, lines) => { const v = validateEntry(lines); list.push({ lines: v.lines }); };

test('rejects unbalanced, one-sided, empty and negative entries', () => {
  assert.throws(() => validateEntry([{ account: 'a', debit: 100 }, { account: 'b', credit: 99.99 }]), /not balanced/);
  assert.throws(() => validateEntry([{ account: 'a', debit: 100 }]), /at least two/);
  assert.throws(() => validateEntry([{ account: 'a', debit: 50, credit: 50 }, { account: 'b', credit: 0, debit: 0 }]), AccountingError);
  assert.throws(() => validateEntry([{ account: 'a', debit: -5 }, { account: 'b', credit: -5 }]), AccountingError);
  assert.throws(() => validateEntry([{ debit: 5 }, { account: 'b', credit: 5 }]), /account is required/);
});

test('accepts balanced entries and avoids floating point drift', () => {
  const v = validateEntry([{ account: 'a', debit: 0.1 }, { account: 'b', debit: 0.2 }, { account: 'c', credit: 0.3 }]);
  assert.equal(v.totalDebit, 0.3);
  assert.equal(v.totalCredit, 0.3);
});

test('invoice maths with VAT', () => {
  const c = calcInvoice([{ qty: 2, rate: 10000, vatRate: 15 }, { qty: 3, rate: 1500.5, vatRate: 15 }]);
  assert.equal(c.subtotal, 24501.5);
  assert.equal(c.vatTotal, 3675.23); // 3000 + 675.225 -> 675.23
  assert.equal(c.total, r2(24501.5 + 3675.23));
  assert.throws(() => calcInvoice([{ qty: 0, rate: 5 }]), /quantity/);
  assert.throws(() => calcInvoice([]), /At least one/);
});

test('weighted average cost', () => {
  assert.equal(newAvgCost(10, 100, 10, 200), 150);
  assert.equal(newAvgCost(0, 0, 5, 80), 80);
});

test('payroll line and depreciation', () => {
  const p = calcPayrollLine({ name: 'A', basic: 30000, houseRent: 15000, medical: 1500, conveyance: 2500, otherAllowance: 0, taxDeduction: 1000 });
  assert.equal(p.gross, 49000);
  assert.equal(p.net, 48000);
  assert.throws(() => calcPayrollLine({ name: 'B', basic: 100, taxDeduction: 500 }), /exceed/);
  assert.equal(monthlyDepreciation({ method: 'SL', cost: 120000, salvage: 0, usefulLifeYears: 5 }, 120000), 2000);
  assert.equal(monthlyDepreciation({ method: 'SL', cost: 120000, salvage: 10000, usefulLifeYears: 5 }, 10000), 0); // at salvage
  assert.equal(monthlyDepreciation({ method: 'SL', cost: 120000, salvage: 10000, usefulLifeYears: 5 }, 10500), 500); // capped
  assert.equal(monthlyDepreciation({ method: 'WDV', cost: 120000, rate: 20 }, 120000), 2000);
});

test('full business cycle: statements balance and cash flow reconciles', () => {
  const je = [];
  // capital injected to bank 1,000,000
  post(je, [{ account: A.BANK, debit: 1000000 }, { account: A.CAPITAL, credit: 1000000 }]);
  // buy 10 UPS @ 20,000 + 15% VAT on credit
  const pur = calcInvoice([{ qty: 10, rate: 20000, vatRate: 15 }]);
  post(je, [{ account: A.INVENTORY, debit: pur.subtotal }, { account: A.VAT_IN, debit: pur.vatTotal }, { account: A.AP, credit: pur.total }]);
  // sell 4 @ 30,000 + VAT on credit; COGS 4 * 20,000
  const sale = calcInvoice([{ qty: 4, rate: 30000, vatRate: 15 }]);
  post(je, [{ account: A.AR, debit: sale.total }, { account: A.SALES, credit: sale.subtotal }, { account: A.VAT_OUT, credit: sale.vatTotal }]);
  post(je, [{ account: A.COGS, debit: 80000 }, { account: A.INVENTORY, credit: 80000 }]);
  // customer pays in full to bank; supplier paid 100,000
  post(je, [{ account: A.BANK, debit: sale.total }, { account: A.AR, credit: sale.total }]);
  post(je, [{ account: A.AP, debit: 100000 }, { account: A.BANK, credit: 100000 }]);
  // rent expense 15,000 cash; asset purchase 120,000 by bank; depreciation 2,000
  post(je, [{ account: A.CASH, debit: 20000 }, { account: A.BANK, credit: 20000 }]);
  post(je, [{ account: '5110', debit: 15000 }, { account: A.CASH, credit: 15000 }]);
  post(je, [{ account: A.FIXED_ASSET, debit: 120000 }, { account: A.BANK, credit: 120000 }]);
  post(je, [{ account: A.DEP_EXP, debit: 2000 }, { account: A.ACC_DEP, credit: 2000 }]);
  // payroll: gross 49,000, tax 1,000, net 48,000 paid by bank
  post(je, [{ account: A.SAL_EXP, debit: 49000 }, { account: A.TDS_PAY, credit: 1000 }, { account: A.SAL_PAY, credit: 48000 }]);
  post(je, [{ account: A.SAL_PAY, debit: 48000 }, { account: A.BANK, credit: 48000 }]);

  const sums = sumsFrom(je);
  const tb = buildTrialBalance(accounts, sums);
  assert.equal(tb.balanced, true);
  assert.equal(tb.totalDebit, tb.totalCredit);

  const pl = buildProfitLoss(accounts, sums);
  assert.equal(pl.income.total, 120000);
  assert.equal(pl.cogs.total, 80000);
  assert.equal(pl.grossProfit, 40000);
  assert.equal(pl.operatingExpenses.total, 15000 + 2000 + 49000);
  assert.equal(pl.netProfit, 40000 - 66000);

  const bs = buildBalanceSheet(accounts, sums);
  assert.equal(bs.balanced, true, `A=${bs.totalAssets} L+E=${bs.totalLiabilitiesAndEquity}`);
  assert.equal(bs.equity.currentEarnings, pl.netProfit);

  const cf = buildCashFlow(accounts, je, 0);
  const cashNow = r2(['1000', '1010'].reduce((s, id) => s + (sums.get(id)?.debit || 0) - (sums.get(id)?.credit || 0), 0));
  assert.equal(cf.closingCash, cashNow);
  assert.equal(cf.investing.total, -120000);
  assert.equal(cf.financing.total, 1000000);
});

test('ageing buckets', () => {
  const b = ageBuckets([
    { dueDate: '2026-11-10', outstanding: 100 }, { dueDate: '2026-10-20', outstanding: 200 },
    { dueDate: '2026-09-15', outstanding: 300 }, { dueDate: '2026-07-01', outstanding: 400 },
  ], '2026-11-02');
  assert.deepEqual(b, { current: 100, d1_30: 200, d31_60: 300, d61_90: 0, d90plus: 400, total: 1000 });
});
