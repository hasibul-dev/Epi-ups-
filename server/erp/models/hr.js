import mongoose from 'mongoose';
const { Schema } = mongoose;
const opts = { timestamps: true };
const oid = (ref) => ({ type: Schema.Types.ObjectId, ref });

export const Employee = mongoose.model('Employee', new Schema({
  empId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  designation: String,
  department: String,
  phone: String,
  nid: String,
  joinDate: Date,
  basic: { type: Number, required: true, min: 0 },
  houseRent: { type: Number, default: 0, min: 0 },
  medical: { type: Number, default: 0, min: 0 },
  conveyance: { type: Number, default: 0, min: 0 },
  otherAllowance: { type: Number, default: 0, min: 0 },
  taxDeduction: { type: Number, default: 0, min: 0 }, // monthly income-tax (TDS) deduction
  active: { type: Boolean, default: true },
}, opts));

export const PayrollRun = mongoose.model('PayrollRun', new Schema({
  month: { type: String, required: true, unique: true }, // YYYY-MM
  lines: [{
    employee: oid('Employee'), name: String, empId: String,
    basic: Number, allowances: Number, gross: Number, tax: Number, advance: Number, otherDeduction: Number, net: Number,
    _id: false,
  }],
  totalGross: Number,
  totalTax: Number,
  totalDeductions: Number,
  totalNet: Number,
  status: { type: String, enum: ['processed', 'paid', 'void'], default: 'processed' },
  paidAccount: oid('Account'),
  paidDate: Date,
  journal: oid('JournalEntry'),
  paymentJournal: oid('JournalEntry'),
  createdBy: oid('User'),
}, opts));

export const FixedAsset = mongoose.model('FixedAsset', new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: String,
  purchaseDate: { type: Date, required: true },
  cost: { type: Number, required: true, min: 0.01 },
  salvage: { type: Number, default: 0, min: 0 },
  usefulLifeYears: { type: Number, default: 5, min: 1 },
  method: { type: String, enum: ['SL', 'WDV'], default: 'SL' },
  rate: { type: Number, default: 0 }, // % per year for WDV
  accumulatedDep: { type: Number, default: 0 },
  depMonths: { type: [String], default: [] }, // YYYY-MM already depreciated
  paidFrom: oid('Account'),
  status: { type: String, enum: ['active', 'disposed'], default: 'active' },
  journal: oid('JournalEntry'),
  createdBy: oid('User'),
}, opts));
