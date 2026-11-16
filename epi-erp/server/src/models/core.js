import mongoose from 'mongoose';
const { Schema } = mongoose;
const opts = { timestamps: true };
const oid = (ref) => ({ type: Schema.Types.ObjectId, ref });

export const ROLES = ['admin', 'accountant', 'manager', 'hr', 'store', 'auditor'];

export const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'accountant' },
  active: { type: Boolean, default: true },
  lastLogin: Date,
}, opts));

export const Account = mongoose.model('Account', new Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['asset', 'liability', 'equity', 'income', 'expense'], required: true },
  subType: { type: String, default: 'general' }, // cash, bank, receivable, payable, inventory, fixed_asset, accum_dep, vat_input, vat_output, cogs, general
  sysKey: { type: String, index: true, sparse: true }, // system accounts used by auto-posting
  cashFlowCategory: { type: String, enum: ['operating', 'investing', 'financing'], default: 'operating' },
  description: String,
  active: { type: Boolean, default: true },
  bankName: String,
  accountNumber: String,
}, opts));

const lineSchema = new Schema({
  account: { ...oid('Account'), required: true },
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },
  memo: String,
}, { _id: false });

const journalSchema = new Schema({
  entryNo: { type: String, unique: true, required: true },
  date: { type: Date, required: true, index: true },
  voucherType: { type: String, enum: ['journal', 'payment', 'receipt', 'contra', 'sales', 'purchase', 'expense', 'payroll', 'depreciation', 'opening', 'vat', 'reversal'], default: 'journal' },
  narration: String,
  reference: String,
  lines: { type: [lineSchema], required: true },
  totalDebit: { type: Number, required: true },
  totalCredit: { type: Number, required: true },
  status: { type: String, enum: ['posted', 'void'], default: 'posted', index: true },
  source: { kind: String, id: Schema.Types.ObjectId },
  reversalOf: oid('JournalEntry'),
  reversedBy: oid('JournalEntry'),
  createdBy: oid('User'),
}, opts);
journalSchema.index({ 'lines.account': 1, date: 1 });
export const JournalEntry = mongoose.model('JournalEntry', journalSchema);

export const Counter = mongoose.model('Counter', new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
}));

export const AuditLog = mongoose.model('AuditLog', new Schema({
  user: oid('User'),
  userName: String,
  role: String,
  action: { type: String, index: true }, // create, update, delete, void, login, logout...
  entity: { type: String, index: true },
  entityId: String,
  summary: String,
  ip: String,
  at: { type: Date, default: Date.now, index: true },
}));

export const Settings = mongoose.model('Settings', new Schema({
  key: { type: String, default: 'main', unique: true },
  companyName: { type: String, default: 'EPI UPS Bangladesh Limited' },
  address: String,
  phone: String,
  email: String,
  bin: String, // Business Identification Number (VAT)
  tin: String,
  defaultVatRate: { type: Number, default: 15 },
  vatRates: { type: [Number], default: [0, 5, 7.5, 10, 15] },
  fiscalYearStartMonth: { type: Number, default: 7 }, // Bangladesh fiscal year: July-June
  currency: { type: String, default: 'BDT' },
}, opts));

export async function nextNumber(key, prefix, pad = 5) {
  const c = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true });
  return `${prefix}-${String(c.seq).padStart(pad, '0')}`;
}
