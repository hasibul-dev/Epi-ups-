import { Account, JournalEntry, nextNumber } from '../models/core.js';
import { validateEntry, AccountingError } from './accounting.js';

// Default chart of accounts. sysKey accounts are used by automatic postings.
export const DEFAULT_COA = [
  ['1000', 'Cash in Hand', 'asset', 'cash', 'CASH', 'operating'],
  ['1010', 'Cash at Bank - Main', 'asset', 'bank', 'BANK', 'operating'],
  ['1100', 'Accounts Receivable', 'asset', 'receivable', 'AR', 'operating'],
  ['1200', 'Inventory', 'asset', 'inventory', 'INVENTORY', 'operating'],
  ['1300', 'VAT Input (Rebatable)', 'asset', 'vat_input', 'VAT_IN', 'operating'],
  ['1500', 'Fixed Assets', 'asset', 'fixed_asset', 'FIXED_ASSET', 'investing'],
  ['1590', 'Accumulated Depreciation', 'asset', 'accum_dep', 'ACC_DEP', 'investing'],
  ['2000', 'Accounts Payable', 'liability', 'payable', 'AP', 'operating'],
  ['2100', 'VAT Payable (Output)', 'liability', 'vat_output', 'VAT_OUT', 'operating'],
  ['2200', 'Salaries Payable', 'liability', 'general', 'SAL_PAY', 'operating'],
  ['2210', 'Income Tax (TDS) Payable', 'liability', 'general', 'TDS_PAY', 'operating'],
  ['2500', 'Bank Loan', 'liability', 'general', 'LOAN', 'financing'],
  ['3000', "Owner's Capital", 'equity', 'general', 'CAPITAL', 'financing'],
  ['3100', 'Retained Earnings', 'equity', 'general', 'RETAINED', 'financing'],
  ['3900', 'Opening Balance Equity', 'equity', 'general', 'OPEN_EQ', 'financing'],
  ['4000', 'Sales Revenue', 'income', 'general', 'SALES', 'operating'],
  ['4100', 'Service Revenue', 'income', 'general', 'SERVICE', 'operating'],
  ['4900', 'Other Income', 'income', 'general', 'OTHER_INCOME', 'operating'],
  ['5000', 'Cost of Goods Sold', 'expense', 'cogs', 'COGS', 'operating'],
  ['5100', 'Salaries & Wages', 'expense', 'general', 'SAL_EXP', 'operating'],
  ['5110', 'Office Rent', 'expense', 'general', null, 'operating'],
  ['5120', 'Utilities (Electricity, Water, Internet)', 'expense', 'general', null, 'operating'],
  ['5130', 'Transport & Carrying', 'expense', 'general', null, 'operating'],
  ['5140', 'Office Supplies', 'expense', 'general', null, 'operating'],
  ['5150', 'Marketing & Promotion', 'expense', 'general', null, 'operating'],
  ['5160', 'Depreciation Expense', 'expense', 'general', 'DEP_EXP', 'operating'],
  ['5170', 'Repairs & Maintenance', 'expense', 'general', null, 'operating'],
  ['5180', 'Bank Charges', 'expense', 'general', null, 'operating'],
  ['5190', 'Miscellaneous Expense', 'expense', 'general', null, 'operating'],
];

export async function ensureDefaultAccounts() {
  let created = 0;
  for (const [code, name, type, subType, sysKey, cashFlowCategory] of DEFAULT_COA) {
    const exists = await Account.findOne({ code });
    if (!exists) {
      await Account.create({ code, name, type, subType, sysKey: sysKey || undefined, cashFlowCategory });
      created++;
    }
  }
  return created;
}

const sysCache = new Map();
export async function sysAccount(key) {
  if (sysCache.has(key)) return sysCache.get(key);
  const acc = await Account.findOne({ sysKey: key });
  if (!acc) throw new AccountingError(`System account "${key}" is missing. Run the seed script to create the default chart of accounts.`, 500);
  sysCache.set(key, acc._id);
  return acc._id;
}
export const clearSysCache = () => sysCache.clear();

/** Cash/bank accounts only: used to validate payment sources. */
export async function requireCashOrBank(id) {
  const acc = await Account.findById(id);
  if (!acc || !acc.active || !['cash', 'bank'].includes(acc.subType)) {
    throw new AccountingError('Select a valid active cash or bank account');
  }
  return acc;
}

/**
 * Post a balanced journal entry. Throws AccountingError if lines are invalid,
 * unbalanced, or reference missing/inactive accounts.
 */
export async function postEntry({ date, voucherType = 'journal', narration, reference, lines, source, userId }) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) throw new AccountingError('A valid date is required');
  const v = validateEntry(lines);
  const ids = [...new Set(v.lines.map((l) => String(l.account)))];
  const found = await Account.find({ _id: { $in: ids } }).select('active');
  if (found.length !== ids.length) throw new AccountingError('One or more accounts do not exist');
  if (found.some((a) => !a.active)) throw new AccountingError('One or more accounts are inactive');
  const entryNo = await nextNumber('journal', 'JV');
  return JournalEntry.create({
    entryNo, date: d, voucherType, narration, reference,
    lines: v.lines, totalDebit: v.totalDebit, totalCredit: v.totalCredit,
    source, createdBy: userId, status: 'posted',
  });
}

/** Void an entry by posting an exact reversal; the original stays for the audit trail. */
export async function voidEntry(entryId, { reason, userId, date } = {}) {
  const orig = await JournalEntry.findById(entryId);
  if (!orig) throw new AccountingError('Journal entry not found', 404);
  if (orig.status === 'void') throw new AccountingError('Entry is already void');
  if (orig.reversalOf) throw new AccountingError('A reversal entry cannot be voided');
  const rev = await postEntry({
    date: date || new Date(),
    voucherType: 'reversal',
    narration: `Reversal of ${orig.entryNo}${reason ? ` - ${reason}` : ''}`,
    reference: orig.entryNo,
    lines: orig.lines.map((l) => ({ account: l.account, debit: l.credit, credit: l.debit, memo: l.memo })),
    source: orig.source,
    userId,
  });
  rev.reversalOf = orig._id;
  await rev.save();
  orig.status = 'void';
  orig.reversedBy = rev._id;
  await orig.save();
  return rev;
}

/**
 * Debit/credit totals per account from posted entries.
 * Reversal pairs net to zero, so both original (void) and reversal are included
 * -- except we exclude nothing here: status 'void' originals + reversals cancel out.
 * To keep reports simple and exact we sum ALL entries (original + reversal).
 */
export async function accountSums({ from, to } = {}) {
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = endOfDay(to);
  }
  const rows = await JournalEntry.aggregate([
    { $match: match },
    { $unwind: '$lines' },
    { $group: { _id: '$lines.account', debit: { $sum: '$lines.debit' }, credit: { $sum: '$lines.credit' } } },
  ]);
  const map = new Map();
  for (const r of rows) map.set(String(r._id), { debit: round(r.debit), credit: round(r.credit) });
  return map;
}

export const endOfDay = (d) => {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
};
const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
