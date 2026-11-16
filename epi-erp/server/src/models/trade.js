import mongoose from 'mongoose';
const { Schema } = mongoose;
const opts = { timestamps: true };
const oid = (ref) => ({ type: Schema.Types.ObjectId, ref });

export const Party = mongoose.model('Party', new Schema({
  type: { type: String, enum: ['customer', 'supplier'], required: true },
  name: { type: String, required: true, trim: true },
  phone: String,
  email: String,
  address: String,
  bin: String,
  tin: String,
  creditLimit: { type: Number, default: 0, min: 0 },
  creditDays: { type: Number, default: 30, min: 0 },
  openingBalance: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, opts));

export const Item = mongoose.model('Item', new Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: String,
  unit: { type: String, default: 'pcs' },
  salePrice: { type: Number, default: 0, min: 0 },
  vatRate: { type: Number, default: 15, min: 0 },
  reorderLevel: { type: Number, default: 0, min: 0 },
  qtyOnHand: { type: Number, default: 0 },
  avgCost: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, opts));

export const StockMovement = mongoose.model('StockMovement', new Schema({
  item: { ...oid('Item'), required: true, index: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['in', 'out', 'adjust_in', 'adjust_out', 'opening'], required: true },
  qty: { type: Number, required: true }, // always positive; direction from type
  unitCost: { type: Number, default: 0 },
  reference: String,
  note: String,
  source: { kind: String, id: Schema.Types.ObjectId },
  voided: { type: Boolean, default: false },
}, opts));

const invLine = new Schema({
  item: oid('Item'),
  description: String,
  qty: Number,
  rate: Number,
  vatRate: Number,
  amount: Number,
  vat: Number,
  unitCost: Number, // cost at time of sale, for COGS
}, { _id: false });

export const Invoice = mongoose.model('Invoice', new Schema({
  type: { type: String, enum: ['sale', 'purchase'], required: true, index: true },
  number: { type: String, required: true, unique: true },
  supplierRef: String, // supplier's bill number for purchases
  party: { ...oid('Party'), required: true, index: true },
  date: { type: Date, required: true, index: true },
  dueDate: { type: Date, required: true },
  lines: [invLine],
  subtotal: Number,
  vatTotal: Number,
  total: Number,
  paid: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid', 'partial', 'paid', 'void'], default: 'unpaid', index: true },
  notes: String,
  journal: oid('JournalEntry'),
  cogsJournal: oid('JournalEntry'),
  createdBy: oid('User'),
}, opts));

export const Payment = mongoose.model('Payment', new Schema({
  type: { type: String, enum: ['receipt', 'payment'], required: true, index: true },
  number: { type: String, required: true, unique: true },
  party: { ...oid('Party'), required: true, index: true },
  date: { type: Date, required: true, index: true },
  method: { type: String, enum: ['cash', 'bank', 'cheque', 'mobile'], default: 'cash' },
  account: { ...oid('Account'), required: true }, // cash or bank account
  amount: { type: Number, required: true, min: 0.01 },
  allocations: [{ invoice: oid('Invoice'), amount: Number, _id: false }],
  reference: String,
  notes: String,
  status: { type: String, enum: ['posted', 'void'], default: 'posted' },
  journal: oid('JournalEntry'),
  createdBy: oid('User'),
}, opts));

export const Expense = mongoose.model('Expense', new Schema({
  number: { type: String, required: true, unique: true },
  date: { type: Date, required: true, index: true },
  expenseAccount: { ...oid('Account'), required: true },
  payee: String,
  description: String,
  amount: { type: Number, required: true, min: 0.01 }, // amount before VAT
  vat: { type: Number, default: 0, min: 0 }, // rebatable input VAT
  paidFrom: oid('Account'), // cash/bank account; absent => on credit
  supplier: oid('Party'), // required when on credit
  reference: String,
  status: { type: String, enum: ['posted', 'void'], default: 'posted' },
  journal: oid('JournalEntry'),
  createdBy: oid('User'),
}, opts));
