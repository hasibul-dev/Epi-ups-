import jwt from 'jsonwebtoken';
import { DEFAULT_COA } from './ledger.js';

const secret = () => process.env.JWT_SECRET || 'epi-erp-local-demo-jwt-secret-key-32-chars-minimum';

const ALL_MODULES = [
  'dashboard', 'accounts', 'journal', 'banking', 'sales', 'purchase',
  'payments', 'expenses', 'inventory', 'vat', 'payroll', 'assets',
  'reports', 'users', 'audit', 'settings'
];
const adminPermissions = Object.fromEntries(ALL_MODULES.map((m) => [m, ['read', 'write', 'void']]));

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function naturalBalance(type, debit, credit) {
  const d = Number(debit) || 0;
  const c = Number(credit) || 0;
  return ['asset', 'expense'].includes(type) ? r2(d - c) : r2(c - d);
}

// ----------------------------------------------------
// Core In-Memory Data Store (Starts Clean for Manual Entry)
// ----------------------------------------------------
export let demoUser = {
  _id: '672000000000000000000001',
  name: 'EPI Administrator',
  email: 'admin@epiups.com.bd',
  role: 'admin',
  active: true,
  permissions: adminPermissions,
};

export let demoUsers = [demoUser];

export let demoSettings = {
  key: 'main',
  companyName: 'EPI UPS Bangladesh Limited',
  address: 'House #12, Road #4, Dhanmondi, Dhaka-1205, Bangladesh',
  phone: '+880 2 9876543, +880 1711 000000',
  email: 'info@epiups.com.bd',
  bin: '001234567-0101',
  tin: '123456789012',
  defaultVatRate: 15,
  vatRates: [0, 5, 7.5, 10, 15],
  fiscalYearStartMonth: 7,
  currency: 'BDT',
};

// 25 Default Business Accounts from DEFAULT_COA, starting with 0 balance
export let demoAccounts = DEFAULT_COA.map(([code, name, type, subType, sysKey, cashFlowCategory], idx) => ({
  _id: `acc-${idx + 1}`,
  code,
  name,
  type,
  subType,
  sysKey: sysKey || undefined,
  cashFlowCategory,
  active: true,
  debit: 0,
  credit: 0,
  balance: 0,
}));

// Mutable transactional entity collections: clean initial states for manual entry
export let demoParties = [];
export let demoItems = [];
export let demoInvoices = [];
export let demoExpenses = [];
export let demoPayments = [];
export let demoJournal = [];
export let demoStockMovements = [];
export let demoEmployees = [];
export let demoPayrollRuns = [];
export let demoAssets = [];
export let demoAuditLogs = [
  {
    _id: 'audit-init',
    at: new Date().toISOString(),
    userName: demoUser.name,
    role: demoUser.role,
    action: 'init',
    entity: 'System',
    summary: 'System initialized with clean Chart of Accounts ready for manual data entry',
    ip: '127.0.0.1',
  },
];

// Helper to log user audits
export function addMockAudit(action, entity, summary) {
  demoAuditLogs.unshift({
    _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    userName: demoUser.name,
    role: demoUser.role,
    action,
    entity,
    summary,
    ip: '127.0.0.1',
  });
}

// Reset store function (for clean test runs)
export function resetMockStore() {
  demoAccounts = DEFAULT_COA.map(([code, name, type, subType, sysKey, cashFlowCategory], idx) => ({
    _id: `acc-${idx + 1}`,
    code,
    name,
    type,
    subType,
    sysKey: sysKey || undefined,
    cashFlowCategory,
    active: true,
    debit: 0,
    credit: 0,
    balance: 0,
  }));
  demoParties = [];
  demoItems = [];
  demoInvoices = [];
  demoExpenses = [];
  demoPayments = [];
  demoJournal = [];
  demoStockMovements = [];
  demoEmployees = [];
  demoPayrollRuns = [];
  demoAssets = [];
  demoAuditLogs = [
    {
      _id: 'audit-reset',
      at: new Date().toISOString(),
      userName: demoUser.name,
      role: demoUser.role,
      action: 'reset',
      entity: 'System',
      summary: 'Store reset to clean state for manual data entry',
      ip: '127.0.0.1',
    },
  ];
}

// Account lookup by code or id or sysKey
export function findAccount(idOrCode) {
  if (!idOrCode) return null;
  return demoAccounts.find((a) => a._id === idOrCode || a.code === idOrCode || a.sysKey === idOrCode) || null;
}

export function sysAcc(codeOrKey) {
  const a = findAccount(codeOrKey);
  if (!a) {
    throw new Error(`Account ${codeOrKey} not found in Chart of Accounts`);
  }
  return a;
}

// ----------------------------------------------------
// Double-entry Journal Engine (Core Accounting Integrity)
// ----------------------------------------------------
export function postMockJournalEntry({ date, voucherType = 'journal', narration = '', reference = '', lines = [], source = null }) {
  const normLines = lines.map((l) => {
    const acc = typeof l.account === 'object' ? l.account : findAccount(l.account);
    if (!acc) throw new Error(`Invalid account in journal line: ${l.account}`);
    return {
      account: { _id: acc._id, code: acc.code, name: acc.name, type: acc.type },
      debit: r2(Number(l.debit) || 0),
      credit: r2(Number(l.credit) || 0),
      memo: l.memo || '',
    };
  });

  const totalDebit = r2(normLines.reduce((s, l) => s + l.debit, 0));
  const totalCredit = r2(normLines.reduce((s, l) => s + l.credit, 0));

  if (Math.abs(totalDebit - totalCredit) > 0.02) {
    throw new Error(`Double-entry out of balance: Debit ${totalDebit} does not equal Credit ${totalCredit}`);
  }

  // Update account balances
  for (const l of normLines) {
    const target = demoAccounts.find((a) => a._id === l.account._id || a.code === l.account.code);
    if (target) {
      target.debit = r2(target.debit + l.debit);
      target.credit = r2(target.credit + l.credit);
      target.balance = naturalBalance(target.type, target.debit, target.credit);
    }
  }

  const entryNo = `JV-${String(demoJournal.length + 1).padStart(5, '0')}`;
  const entry = {
    _id: `jv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entryNo,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    voucherType,
    narration,
    reference,
    source,
    totalDebit,
    totalCredit,
    status: 'posted',
    lines: normLines,
    createdAt: new Date().toISOString(),
  };

  demoJournal.unshift(entry);
  addMockAudit('create', 'JournalEntry', `Posted ${voucherType} ${entryNo} for ${totalDebit}`);
  return entry;
}

export function voidMockJournalEntry(id, reason = 'Voided') {
  const entry = demoJournal.find((j) => j._id === id || j.entryNo === id);
  if (!entry) throw new Error('Journal entry not found');
  if (entry.status === 'void') return entry;

  // Reverse account balances
  for (const l of entry.lines) {
    const target = demoAccounts.find((a) => a._id === l.account._id || a.code === l.account.code);
    if (target) {
      target.debit = r2(target.debit - l.debit);
      target.credit = r2(target.credit - l.credit);
      target.balance = naturalBalance(target.type, target.debit, target.credit);
    }
  }

  entry.status = 'void';
  entry.voidReason = reason;
  entry.voidedAt = new Date().toISOString();
  addMockAudit('void', 'JournalEntry', `Voided ${entry.entryNo}: ${reason}`);
  return entry;
}

// ----------------------------------------------------
// Parties (Customers & Suppliers)
// ----------------------------------------------------
export function getMockParties(type, q) {
  let list = demoParties;
  if (type) list = list.filter((p) => p.type === type);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(s) || (p.phone && p.phone.includes(s)));
  }
  return list;
}

export function getMockParty(id) {
  return demoParties.find((p) => p._id === id) || null;
}

export function createMockParty(data) {
  const partyId = `party-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const openBal = r2(Number(data.openingBalance) || 0);

  const party = {
    _id: partyId,
    type: data.type || 'customer',
    name: data.name,
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    bin: data.bin || '',
    tin: data.tin || '',
    creditLimit: Number(data.creditLimit) || 0,
    creditDays: Number(data.creditDays) || 30,
    openingBalance: openBal,
    openingDate: data.openingDate || new Date().toISOString(),
    active: data.active !== false,
    balance: openBal,
  };

  if (openBal > 0) {
    const isCust = party.type === 'customer';
    const ar = sysAcc('1100'); // Accounts Receivable
    const ap = sysAcc('2000'); // Accounts Payable
    const eq = sysAcc('3900'); // Opening Balance Equity

    postMockJournalEntry({
      date: party.openingDate,
      voucherType: 'opening',
      narration: `Opening balance for ${party.type} ${party.name}`,
      reference: `OPEN-${party.name.slice(0, 5).toUpperCase()}`,
      lines: isCust
        ? [{ account: ar, debit: openBal }, { account: eq, credit: openBal }]
        : [{ account: eq, debit: openBal }, { account: ap, credit: openBal }],
      source: { kind: 'Party', id: partyId },
    });
  }

  demoParties.push(party);
  addMockAudit('create', 'Party', `Created ${party.type} ${party.name}`);
  return party;
}

export function updateMockParty(id, data) {
  const party = demoParties.find((p) => p._id === id);
  if (!party) throw new Error('Party not found');
  Object.assign(party, data);
  addMockAudit('update', 'Party', `Updated ${party.type} ${party.name}`);
  return party;
}

export function deleteMockParty(id) {
  const idx = demoParties.findIndex((p) => p._id === id);
  if (idx === -1) throw new Error('Party not found');
  const party = demoParties[idx];

  const hasInvoices = demoInvoices.some((i) => i.party?._id === id || i.party === id);
  const hasPayments = demoPayments.some((p) => p.party?._id === id || p.party === id);
  if (hasInvoices || hasPayments || party.balance !== 0) {
    throw new Error('This party has transactions. Mark it inactive instead of deleting.');
  }

  demoParties.splice(idx, 1);
  addMockAudit('delete', 'Party', `Deleted ${party.type} ${party.name}`);
  return { ok: true };
}

export function getMockPartyStatement(id) {
  const party = demoParties.find((p) => p._id === id);
  if (!party) throw new Error('Party not found');

  const isCust = party.type === 'customer';
  const partyInvs = demoInvoices.filter((i) => (i.party?._id === id || i.party === id) && i.status !== 'void');
  const partyPays = demoPayments.filter((p) => (p.party?._id === id || p.party === id) && p.status === 'posted');

  const rows = [
    ...partyInvs.map((i) => ({
      date: i.date,
      ref: i.number,
      desc: isCust ? 'Sales Invoice' : 'Purchase Bill',
      debit: isCust ? i.total : 0,
      credit: isCust ? 0 : i.total,
    })),
    ...partyPays.map((p) => ({
      date: p.date,
      ref: p.number,
      desc: isCust ? 'Customer Receipt' : 'Supplier Payment',
      debit: isCust ? 0 : p.amount,
      credit: isCust ? p.amount : 0,
    })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  let bal = party.openingBalance || 0;
  const outRows = rows.map((r) => {
    bal = r2(bal + (isCust ? r.debit - r.credit : r.credit - r.debit));
    return { ...r, balance: bal };
  });

  return {
    party,
    opening: party.openingBalance || 0,
    rows: outRows,
    closing: bal,
  };
}

// ----------------------------------------------------
// Inventory Items & Stock Movements
// ----------------------------------------------------
export function getMockItems(q, category) {
  let list = demoItems;
  if (category) list = list.filter((i) => i.category === category);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((i) => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
  }
  return list;
}

export function getMockItem(id) {
  return demoItems.find((i) => i._id === id || i.sku === id) || null;
}

export function createMockItem(data) {
  const itemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const openQty = Number(data.openingQty) || 0;
  const openCost = Number(data.openingCost) || 0;

  const item = {
    _id: itemId,
    sku: data.sku,
    name: data.name,
    category: data.category || '',
    unit: data.unit || 'pcs',
    salePrice: Number(data.salePrice) || 0,
    vatRate: Number(data.vatRate) ?? 15,
    reorderLevel: Number(data.reorderLevel) || 0,
    qtyOnHand: openQty,
    avgCost: openCost,
    active: data.active !== false,
  };

  if (openQty > 0 && openCost > 0) {
    const totalVal = r2(openQty * openCost);
    demoStockMovements.push({
      _id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString(),
      item: { _id: item._id, sku: item.sku, name: item.name, unit: item.unit },
      type: 'opening',
      qty: openQty,
      unitCost: openCost,
      reference: 'OPENING',
      note: 'Initial inventory stock',
    });

    const invAcc = sysAcc('1200'); // Inventory
    const eqAcc = sysAcc('3900');  // Opening Balance Equity
    postMockJournalEntry({
      date: new Date().toISOString(),
      voucherType: 'opening',
      narration: `Opening stock for item ${item.sku} (${openQty} ${item.unit} @ ${openCost})`,
      reference: `STK-${item.sku}`,
      lines: [
        { account: invAcc, debit: totalVal },
        { account: eqAcc, credit: totalVal },
      ],
      source: { kind: 'Item', id: itemId },
    });
  }

  demoItems.push(item);
  addMockAudit('create', 'Item', `Created item ${item.sku} ${item.name}`);
  return item;
}

export function updateMockItem(id, data) {
  const item = demoItems.find((i) => i._id === id);
  if (!item) throw new Error('Item not found');
  Object.assign(item, data);
  addMockAudit('update', 'Item', `Updated item ${item.sku}`);
  return item;
}

export function deleteMockItem(id) {
  const idx = demoItems.findIndex((i) => i._id === id);
  if (idx === -1) throw new Error('Item not found');
  const item = demoItems[idx];

  const hasMoves = demoStockMovements.some((m) => m.item?._id === id || m.item === id);
  const hasInvoices = demoInvoices.some((i) => (i.lines || []).some((l) => l.item?._id === id || l.item === id));
  if (hasMoves || hasInvoices) {
    throw new Error('This item has stock history. Mark it inactive instead of deleting.');
  }

  demoItems.splice(idx, 1);
  addMockAudit('delete', 'Item', `Deleted item ${item.sku}`);
  return { ok: true };
}

export function getMockStockMovements(filters = {}) {
  let list = demoStockMovements;
  if (filters.item) list = list.filter((m) => m.item?._id === filters.item || m.item === filters.item);
  return list;
}

export function adjustMockStock(data) {
  const item = demoItems.find((i) => i._id === data.item);
  if (!item) throw new Error('Item not found');

  const qty = Number(data.qty) || 0;
  const cost = Number(data.unitCost) || item.avgCost || 0;
  const totalVal = r2(qty * cost);
  const isInput = data.direction === 'in';

  if (isInput) {
    const prevQty = item.qtyOnHand || 0;
    const prevVal = prevQty * (item.avgCost || 0);
    const newQty = prevQty + qty;
    item.qtyOnHand = newQty;
    item.avgCost = newQty > 0 ? r2((prevVal + totalVal) / newQty) : cost;
  } else {
    item.qtyOnHand = Math.max(0, (item.qtyOnHand || 0) - qty);
  }

  const sm = {
    _id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    item: { _id: item._id, sku: item.sku, name: item.name, unit: item.unit },
    type: isInput ? 'adj_in' : 'adj_out',
    qty,
    unitCost: cost,
    reference: 'STOCK-ADJUST',
    note: data.note || 'Manual stock adjustment',
  };
  demoStockMovements.unshift(sm);

  const invAcc = sysAcc('1200'); // Inventory
  const cogsAcc = sysAcc('5000'); // COGS / Inventory Adjustment
  postMockJournalEntry({
    date: sm.date,
    voucherType: 'journal',
    narration: `Stock adjustment: ${data.note || ''} (${item.sku} ${data.direction} ${qty})`,
    reference: 'ADJ-STK',
    lines: isInput
      ? [{ account: invAcc, debit: totalVal }, { account: cogsAcc, credit: totalVal }]
      : [{ account: cogsAcc, debit: totalVal }, { account: invAcc, credit: totalVal }],
  });

  addMockAudit('create', 'StockAdjustment', `Stock ${data.direction} ${qty} for ${item.sku}`);
  return sm;
}

// ----------------------------------------------------
// Invoices (Sales Invoices & Purchase Bills)
// ----------------------------------------------------
export function getMockInvoices(type, filters = {}) {
  let list = demoInvoices.filter((i) => i.type === type);
  if (filters.status) list = list.filter((i) => i.status === filters.status);
  if (filters.party) list = list.filter((i) => i.party?._id === filters.party || i.party === filters.party);
  if (filters.q) {
    const s = filters.q.toLowerCase();
    list = list.filter((i) => i.number.toLowerCase().includes(s));
  }
  return list;
}

export function getMockInvoice(id) {
  return demoInvoices.find((i) => i._id === id || i.number === id) || null;
}

export function createMockInvoice(type, data) {
  const isSale = type === 'sale';
  const party = demoParties.find((p) => p._id === data.party);
  if (!party) throw new Error('Party is required');

  const prefix = isSale ? 'INV' : 'BILL';
  const count = demoInvoices.filter((i) => i.type === type).length + 1;
  const number = `${prefix}-${String(count).padStart(5, '0')}`;
  const invId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let subtotal = 0;
  let vatTotal = 0;
  let totalCostOfGoodsSold = 0;

  const resolvedLines = (data.lines || []).map((l) => {
    const it = l.item ? demoItems.find((x) => x._id === l.item) : null;
    const qty = Number(l.qty) || 1;
    const rate = Number(l.rate) || 0;
    const vatRate = Number(l.vatRate) || 0;
    const amount = r2(qty * rate);
    const lineVat = r2((amount * vatRate) / 100);

    subtotal = r2(subtotal + amount);
    vatTotal = r2(vatTotal + lineVat);

    if (it) {
      if (isSale) {
        it.qtyOnHand = Math.max(0, (it.qtyOnHand || 0) - qty);
        const cogsLine = r2(qty * (it.avgCost || 0));
        totalCostOfGoodsSold = r2(totalCostOfGoodsSold + cogsLine);

        demoStockMovements.unshift({
          _id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          item: { _id: it._id, sku: it.sku, name: it.name, unit: it.unit },
          type: 'sale',
          qty,
          unitCost: it.avgCost,
          reference: number,
          note: `Sold to ${party.name}`,
        });
      } else {
        const prevQty = it.qtyOnHand || 0;
        const prevVal = prevQty * (it.avgCost || 0);
        const newQty = prevQty + qty;
        it.qtyOnHand = newQty;
        it.avgCost = newQty > 0 ? r2((prevVal + amount) / newQty) : rate;

        demoStockMovements.unshift({
          _id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          item: { _id: it._id, sku: it.sku, name: it.name, unit: it.unit },
          type: 'purchase',
          qty,
          unitCost: rate,
          reference: number,
          note: `Purchased from ${party.name}`,
        });
      }
    }

    return {
      item: it ? { _id: it._id, sku: it.sku, name: it.name, unit: it.unit } : undefined,
      description: l.description || (it ? it.name : 'Item'),
      qty,
      rate,
      vatRate,
      amount,
      vat: lineVat,
    };
  });

  const grandTotal = r2(subtotal + vatTotal);

  const invoice = {
    _id: invId,
    number,
    type,
    party: { _id: party._id, name: party.name, phone: party.phone, bin: party.bin },
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date(Date.now() + (party.creditDays || 30) * 86400000).toISOString(),
    supplierRef: data.supplierRef || '',
    notes: data.notes || '',
    subtotal,
    vatTotal,
    total: grandTotal,
    paid: 0,
    status: 'unpaid',
    lines: resolvedLines,
    createdAt: new Date().toISOString(),
  };

  // Update party balance
  party.balance = r2((party.balance || 0) + grandTotal);

  // Double-entry accounting posting
  const arAcc = sysAcc('1100');     // Accounts Receivable
  const apAcc = sysAcc('2000');     // Accounts Payable
  const salesAcc = sysAcc('4000');  // Sales Revenue
  const invAcc = sysAcc('1200');    // Inventory
  const cogsAcc = sysAcc('5000');   // Cost of Goods Sold
  const vatOutAcc = sysAcc('2100'); // VAT Output Payable
  const vatInAcc = sysAcc('1300');  // VAT Input Receivable

  if (isSale) {
    const jLines = [
      { account: arAcc, debit: grandTotal },
      { account: salesAcc, credit: subtotal },
    ];
    if (vatTotal > 0) {
      jLines.push({ account: vatOutAcc, credit: vatTotal });
    }
    if (totalCostOfGoodsSold > 0) {
      jLines.push({ account: cogsAcc, debit: totalCostOfGoodsSold });
      jLines.push({ account: invAcc, credit: totalCostOfGoodsSold });
    }

    postMockJournalEntry({
      date: invoice.date,
      voucherType: 'sales',
      narration: `Sales Invoice ${number} - ${party.name}`,
      reference: number,
      lines: jLines,
      source: { kind: 'Invoice', id: invId },
    });
  } else {
    const jLines = [
      { account: invAcc, debit: subtotal },
      { account: apAcc, credit: grandTotal },
    ];
    if (vatTotal > 0) {
      jLines.push({ account: vatInAcc, debit: vatTotal });
    }

    postMockJournalEntry({
      date: invoice.date,
      voucherType: 'purchase',
      narration: `Purchase Bill ${number} - ${party.name}`,
      reference: number,
      lines: jLines,
      source: { kind: 'Invoice', id: invId },
    });
  }

  demoInvoices.unshift(invoice);
  addMockAudit('create', 'Invoice', `Created ${isSale ? 'sales invoice' : 'purchase bill'} ${number} for ${grandTotal}`);
  return invoice;
}

export function voidMockInvoice(id, reason = 'Voided') {
  const inv = demoInvoices.find((i) => i._id === id || i.number === id);
  if (!inv) throw new Error('Invoice not found');
  if (inv.status === 'void') return inv;

  const isSale = inv.type === 'sale';
  const party = demoParties.find((p) => p._id === inv.party?._id || p.name === inv.party?.name);

  // Reverse party balance for unpaid remainder
  const unreversedAmt = r2(inv.total - inv.paid);
  if (party && unreversedAmt > 0) {
    party.balance = r2(party.balance - unreversedAmt);
  }

  // Reverse stock movements
  for (const l of inv.lines) {
    if (l.item?._id) {
      const it = demoItems.find((x) => x._id === l.item._id);
      if (it) {
        if (isSale) {
          it.qtyOnHand = (it.qtyOnHand || 0) + l.qty;
        } else {
          it.qtyOnHand = Math.max(0, (it.qtyOnHand || 0) - l.qty);
        }
      }
    }
  }

  // Void corresponding journal entries
  const jv = demoJournal.find((j) => j.reference === inv.number && j.status === 'posted');
  if (jv) {
    voidMockJournalEntry(jv._id, reason);
  }

  inv.status = 'void';
  inv.voidReason = reason;
  addMockAudit('void', 'Invoice', `Voided invoice ${inv.number}: ${reason}`);
  return inv;
}

// ----------------------------------------------------
// Payments & Receipts
// ----------------------------------------------------
export function getMockPayments(filters = {}) {
  let list = demoPayments;
  if (filters.type) list = list.filter((p) => p.type === filters.type);
  if (filters.status) list = list.filter((p) => p.status === filters.status);
  if (filters.party) list = list.filter((p) => p.party?._id === filters.party || p.party === filters.party);
  if (filters.q) {
    const s = filters.q.toLowerCase();
    list = list.filter((p) => p.number.toLowerCase().includes(s));
  }
  return list;
}

export function createMockPayment(kind, data) {
  const isReceipt = kind === 'receipt';
  const party = demoParties.find((p) => p._id === data.party);
  if (!party) throw new Error('Party is required');

  const account = findAccount(data.account);
  if (!account) throw new Error('Payment cash or bank account is required');

  const amount = r2(Number(data.amount) || 0);
  if (amount <= 0) throw new Error('Payment amount must be greater than zero');

  const prefix = isReceipt ? 'REC' : 'PAY';
  const count = demoPayments.filter((p) => p.type === kind).length + 1;
  const number = `${prefix}-${String(count).padStart(5, '0')}`;
  const payId = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Apply to invoices
  if (Array.isArray(data.allocations) && data.allocations.length > 0) {
    for (const alloc of data.allocations) {
      const inv = demoInvoices.find((i) => i._id === alloc.invoice);
      if (inv) {
        inv.paid = r2(inv.paid + Number(alloc.amount || 0));
        if (inv.paid >= inv.total - 0.01) {
          inv.status = 'paid';
        } else if (inv.paid > 0) {
          inv.status = 'partial';
        }
      }
    }
  } else {
    // Auto apply to oldest open invoices
    const targetType = isReceipt ? 'sale' : 'purchase';
    const openInvs = demoInvoices.filter(
      (i) => i.type === targetType && (i.party?._id === party._id || i.party === party._id) && ['unpaid', 'partial'].includes(i.status)
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    let remaining = amount;
    for (const inv of openInvs) {
      if (remaining <= 0) break;
      const due = r2(inv.total - inv.paid);
      const apply = Math.min(remaining, due);
      inv.paid = r2(inv.paid + apply);
      if (inv.paid >= inv.total - 0.01) {
        inv.status = 'paid';
      } else {
        inv.status = 'partial';
      }
      remaining = r2(remaining - apply);
    }
  }

  // Update party balance
  party.balance = r2(party.balance - amount);

  // Double-entry posting
  const arAcc = sysAcc('1100'); // Accounts Receivable
  const apAcc = sysAcc('2000'); // Accounts Payable

  postMockJournalEntry({
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    voucherType: isReceipt ? 'receipt' : 'payment',
    narration: `${isReceipt ? 'Receipt from' : 'Payment to'} ${party.name}`,
    reference: number,
    lines: isReceipt
      ? [{ account, debit: amount }, { account: arAcc, credit: amount }]
      : [{ account: apAcc, debit: amount }, { account, credit: amount }],
    source: { kind: 'Payment', id: payId },
  });

  const payment = {
    _id: payId,
    number,
    type: kind,
    party: { _id: party._id, name: party.name },
    account: { _id: account._id, code: account.code, name: account.name },
    amount,
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    method: data.method || 'cash',
    reference: data.reference || '',
    notes: data.notes || '',
    status: 'posted',
    createdAt: new Date().toISOString(),
  };

  demoPayments.unshift(payment);
  addMockAudit('create', 'Payment', `Recorded ${kind} ${number} for ${amount}`);
  return payment;
}

export function voidMockPayment(id, reason = 'Voided') {
  const p = demoPayments.find((x) => x._id === id || x.number === id);
  if (!p) throw new Error('Payment not found');
  if (p.status === 'void') return p;

  const party = demoParties.find((x) => x._id === p.party?._id || x.name === p.party?.name);
  if (party) {
    party.balance = r2(party.balance + p.amount);
  }

  // Void matching journal entry
  const jv = demoJournal.find((j) => j.reference === p.number && j.status === 'posted');
  if (jv) {
    voidMockJournalEntry(jv._id, reason);
  }

  p.status = 'void';
  p.voidReason = reason;
  addMockAudit('void', 'Payment', `Voided payment ${p.number}: ${reason}`);
  return p;
}

// ----------------------------------------------------
// Expenses
// ----------------------------------------------------
export function getMockExpenses(filters = {}) {
  let list = demoExpenses;
  if (filters.account) list = list.filter((e) => e.expenseAccount?._id === filters.account);
  if (filters.status) list = list.filter((e) => e.status === filters.status);
  if (filters.q) {
    const s = filters.q.toLowerCase();
    list = list.filter((e) => (e.payee && e.payee.toLowerCase().includes(s)) || (e.description && e.description.toLowerCase().includes(s)));
  }
  return list;
}

export function createMockExpense(data) {
  const expAcc = findAccount(data.expenseAccount);
  if (!expAcc) throw new Error('Expense category account is required');

  const paidFrom = findAccount(data.paidFrom);
  if (!paidFrom) throw new Error('Paid from cash/bank account is required');

  const amount = r2(Number(data.amount) || 0);
  const vat = r2(Number(data.vat) || 0);
  const total = r2(amount + vat);

  const number = `EXP-${String(demoExpenses.length + 1).padStart(5, '0')}`;
  const expId = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const vatInAcc = sysAcc('1300'); // VAT Input Receivable
  const lines = [
    { account: expAcc, debit: amount },
    { account: paidFrom, credit: total },
  ];
  if (vat > 0) {
    lines.push({ account: vatInAcc, debit: vat });
  }

  postMockJournalEntry({
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    voucherType: 'expense',
    narration: `Expense: ${data.description || expAcc.name} - ${data.payee || ''}`,
    reference: number,
    lines,
    source: { kind: 'Expense', id: expId },
  });

  const expense = {
    _id: expId,
    number,
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    expenseAccount: { _id: expAcc._id, code: expAcc.code, name: expAcc.name },
    paidFrom: { _id: paidFrom._id, code: paidFrom.code, name: paidFrom.name },
    payee: data.payee || '',
    description: data.description || '',
    reference: data.reference || '',
    amount,
    vat,
    status: 'posted',
    createdAt: new Date().toISOString(),
  };

  demoExpenses.unshift(expense);
  addMockAudit('create', 'Expense', `Recorded expense ${number} for ${total}`);
  return expense;
}

export function voidMockExpense(id, reason = 'Voided') {
  const exp = demoExpenses.find((e) => e._id === id || e.number === id);
  if (!exp) throw new Error('Expense not found');
  if (exp.status === 'void') return exp;

  const jv = demoJournal.find((j) => j.reference === exp.number && j.status === 'posted');
  if (jv) {
    voidMockJournalEntry(jv._id, reason);
  }

  exp.status = 'void';
  exp.voidReason = reason;
  addMockAudit('void', 'Expense', `Voided expense ${exp.number}: ${reason}`);
  return exp;
}

// ----------------------------------------------------
// Employees & Payroll
// ----------------------------------------------------
export function getMockEmployees() {
  return demoEmployees;
}

export function createMockEmployee(data) {
  const empId = `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const employee = {
    _id: empId,
    empId: data.empId || `EMP-${String(demoEmployees.length + 1).padStart(3, '0')}`,
    name: data.name,
    designation: data.designation || '',
    department: data.department || '',
    phone: data.phone || '',
    nid: data.nid || '',
    joinDate: data.joinDate || new Date().toISOString(),
    basic: Number(data.basic) || 0,
    houseRent: Number(data.houseRent) || 0,
    medical: Number(data.medical) || 0,
    conveyance: Number(data.conveyance) || 0,
    otherAllowance: Number(data.otherAllowance) || 0,
    taxDeduction: Number(data.taxDeduction) || 0,
    active: data.active !== false,
  };

  demoEmployees.push(employee);
  addMockAudit('create', 'Employee', `Created employee ${employee.empId} ${employee.name}`);
  return employee;
}

export function updateMockEmployee(id, data) {
  const emp = demoEmployees.find((e) => e._id === id);
  if (!emp) throw new Error('Employee not found');
  Object.assign(emp, data);
  addMockAudit('update', 'Employee', `Updated employee ${emp.empId}`);
  return emp;
}

export function deleteMockEmployee(id) {
  const idx = demoEmployees.findIndex((e) => e._id === id);
  if (idx === -1) throw new Error('Employee not found');
  const emp = demoEmployees[idx];
  demoEmployees.splice(idx, 1);
  addMockAudit('delete', 'Employee', `Deleted employee ${emp.empId}`);
  return { ok: true };
}

export function getMockPayroll() {
  return demoPayrollRuns;
}

export function processMockPayroll(month) {
  const activeEmps = demoEmployees.filter((e) => e.active);
  if (activeEmps.length === 0) throw new Error('No active employees to process payroll for');

  let totalGross = 0;
  let totalTax = 0;

  const lines = activeEmps.map((e) => {
    const gross = e.basic + e.houseRent + e.medical + e.conveyance + e.otherAllowance;
    const net = gross - e.taxDeduction;
    totalGross += gross;
    totalTax += e.taxDeduction;
    return {
      employee: { _id: e._id, empId: e.empId, name: e.name, designation: e.designation },
      basic: e.basic,
      houseRent: e.houseRent,
      medical: e.medical,
      conveyance: e.conveyance,
      otherAllowance: e.otherAllowance,
      gross,
      taxDeduction: e.taxDeduction,
      net,
    };
  });

  const totalNet = totalGross - totalTax;
  const runId = `pr-${Date.now()}`;
  const salAcc = sysAcc('5100');     // Salaries Expense
  const tdsAcc = sysAcc('2210');     // TDS Payable (2210)
  const payAcc = sysAcc('2200');     // Salaries Payable

  postMockJournalEntry({
    date: new Date().toISOString(),
    voucherType: 'journal',
    narration: `Payroll accrual for month ${month}`,
    reference: `PAYROLL-${month}`,
    lines: [
      { account: salAcc, debit: totalGross },
      { account: tdsAcc, credit: totalTax },
      { account: payAcc, credit: totalNet },
    ],
    source: { kind: 'PayrollRun', id: runId },
  });

  const run = {
    _id: runId,
    month,
    totalGross,
    totalTax,
    totalNet,
    lines,
    status: 'processed',
    createdAt: new Date().toISOString(),
  };

  demoPayrollRuns.unshift(run);
  addMockAudit('create', 'PayrollRun', `Processed payroll for ${month}: net ${totalNet}`);
  return run;
}

export function payMockPayroll(id, data) {
  const run = demoPayrollRuns.find((r) => r._id === id);
  if (!run) throw new Error('Payroll run not found');
  if (run.status === 'paid') throw new Error('Payroll already paid');

  const bankAcc = findAccount(data.account);
  if (!bankAcc) throw new Error('Payment account required');

  const payAcc = sysAcc('2200'); // Salaries Payable
  postMockJournalEntry({
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    voucherType: 'payment',
    narration: `Disbursement of salaries for ${run.month}`,
    reference: `PAYROLL-PAY-${run.month}`,
    lines: [
      { account: payAcc, debit: run.totalNet },
      { account: bankAcc, credit: run.totalNet },
    ],
  });

  run.status = 'paid';
  run.paidDate = data.date || new Date().toISOString();
  run.paidAccount = bankAcc;
  addMockAudit('update', 'PayrollRun', `Paid payroll ${run.month}`);
  return run;
}

export function voidMockPayroll(id, reason = 'Voided') {
  const run = demoPayrollRuns.find((r) => r._id === id);
  if (!run) throw new Error('Payroll run not found');

  const jv = demoJournal.find((j) => j.reference === `PAYROLL-${run.month}` && j.status === 'posted');
  if (jv) {
    voidMockJournalEntry(jv._id, reason);
  }

  run.status = 'void';
  addMockAudit('void', 'PayrollRun', `Voided payroll ${run.month}`);
  return run;
}

// ----------------------------------------------------
// Fixed Assets
// ----------------------------------------------------
export function getMockAssets() {
  return demoAssets;
}

export function createMockAsset(data) {
  const cost = Number(data.cost) || 0;
  const paidFrom = findAccount(data.paidFrom);
  if (!paidFrom) throw new Error('Payment account required for asset acquisition');

  const code = `FA-${String(demoAssets.length + 1).padStart(3, '0')}`;
  const assetId = `fa-${Date.now()}`;

  const faAcc = sysAcc('1500'); // Fixed Assets
  postMockJournalEntry({
    date: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : new Date().toISOString(),
    voucherType: 'payment',
    narration: `Acquisition of asset ${code} - ${data.name}`,
    reference: code,
    lines: [
      { account: faAcc, debit: cost },
      { account: paidFrom, credit: cost },
    ],
    source: { kind: 'FixedAsset', id: assetId },
  });

  const asset = {
    _id: assetId,
    code,
    name: data.name,
    category: data.category || '',
    purchaseDate: data.purchaseDate || new Date().toISOString(),
    cost,
    salvage: Number(data.salvage) || 0,
    usefulLifeYears: Number(data.usefulLifeYears) || 5,
    method: data.method || 'SL',
    rate: Number(data.rate) || 0,
    accumulatedDep: 0,
    status: 'active',
  };

  demoAssets.push(asset);
  addMockAudit('create', 'FixedAsset', `Created fixed asset ${code} ${data.name}`);
  return asset;
}

export function runMockDepreciation(month) {
  const activeAssets = demoAssets.filter((a) => a.status === 'active');
  let totalDep = 0;

  for (const a of activeAssets) {
    const monthly = a.method === 'SL'
      ? r2((a.cost - a.salvage) / (a.usefulLifeYears * 12))
      : r2(((a.cost - a.accumulatedDep) * (a.rate / 100)) / 12);

    if (monthly > 0 && a.cost - a.accumulatedDep > a.salvage) {
      a.accumulatedDep = r2(a.accumulatedDep + monthly);
      totalDep = r2(totalDep + monthly);
    }
  }

  if (totalDep > 0) {
    const depExp = sysAcc('5160'); // Depreciation Expense (5160)
    const accumDep = sysAcc('1590'); // Accumulated Depreciation
    postMockJournalEntry({
      date: new Date().toISOString(),
      voucherType: 'journal',
      narration: `Monthly depreciation for ${month}`,
      reference: `DEP-${month}`,
      lines: [
        { account: depExp, debit: totalDep },
        { account: accumDep, credit: totalDep },
      ],
    });
  }

  addMockAudit('create', 'Depreciation', `Ran depreciation for ${month}: ${totalDep}`);
  return { month, total: totalDep };
}

export function disposeMockAsset(id, data) {
  const asset = demoAssets.find((a) => a._id === id);
  if (!asset) throw new Error('Asset not found');

  const proceeds = Number(data.proceeds) || 0;
  const bankAcc = findAccount(data.account) || sysAcc('1010');
  const bookVal = r2(asset.cost - asset.accumulatedDep);
  const gainOrLoss = r2(proceeds - bookVal);

  const faAcc = sysAcc('1500'); // Fixed Assets
  const accumDepAcc = sysAcc('1590'); // Accumulated Depreciation
  const lines = [
    { account: accumDepAcc, debit: asset.accumulatedDep },
    { account: faAcc, credit: asset.cost },
  ];
  if (proceeds > 0) {
    lines.push({ account: bankAcc, debit: proceeds });
  }
  if (gainOrLoss < 0) {
    lines.push({ account: sysAcc('5190'), debit: Math.abs(gainOrLoss), memo: 'Loss on asset disposal' });
  } else if (gainOrLoss > 0) {
    lines.push({ account: sysAcc('4000'), credit: gainOrLoss, memo: 'Gain on asset disposal' });
  }

  postMockJournalEntry({
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    voucherType: 'journal',
    narration: `Disposal of asset ${asset.code} - ${asset.name}`,
    reference: `DISP-${asset.code}`,
    lines,
  });

  asset.status = 'disposed';
  addMockAudit('update', 'FixedAsset', `Disposed asset ${asset.code}`);
  return { asset, proceeds, bookVal, gainOrLoss };
}

// ----------------------------------------------------
// Accounts Management (Chart of Accounts)
// ----------------------------------------------------
export function getMockAccounts(filters = {}) {
  let list = demoAccounts;
  if (filters.type) list = list.filter((a) => a.type === filters.type);
  if (filters.subType) {
    const subTypes = String(filters.subType).split(',');
    list = list.filter((a) => subTypes.includes(a.subType));
  }
  if (filters.active === 'true') list = list.filter((a) => a.active);
  if (filters.q) {
    const s = filters.q.toLowerCase();
    list = list.filter((a) => a.name.toLowerCase().includes(s) || a.code.toLowerCase().includes(s));
  }
  return list;
}

export function createMockAccount(data) {
  const existing = demoAccounts.find((a) => a.code === data.code);
  if (existing) throw new Error(`Account code ${data.code} already exists`);

  const account = {
    _id: `acc-${demoAccounts.length + 1}`,
    code: data.code,
    name: data.name,
    type: data.type,
    subType: data.subType || '',
    cashFlowCategory: data.cashFlowCategory || 'operating',
    bankName: data.bankName || '',
    accountNumber: data.accountNumber || '',
    active: data.active !== false,
    debit: 0,
    credit: 0,
    balance: 0,
  };

  demoAccounts.push(account);
  addMockAudit('create', 'Account', `Created account ${account.code} ${account.name}`);
  return account;
}

export function updateMockAccount(id, data) {
  const acc = demoAccounts.find((a) => a._id === id);
  if (!acc) throw new Error('Account not found');
  Object.assign(acc, data);
  addMockAudit('update', 'Account', `Updated account ${acc.code} ${acc.name}`);
  return acc;
}

export function deleteMockAccount(id) {
  const idx = demoAccounts.findIndex((a) => a._id === id);
  if (idx === -1) throw new Error('Account not found');
  const acc = demoAccounts[idx];
  if (acc.sysKey) throw new Error('System accounts cannot be deleted');
  if (acc.balance !== 0 || acc.debit !== 0 || acc.credit !== 0) {
    throw new Error('This account has transactions. Deactivate it instead of deleting.');
  }
  demoAccounts.splice(idx, 1);
  addMockAudit('delete', 'Account', `Deleted account ${acc.code} ${acc.name}`);
  return { ok: true };
}

// ----------------------------------------------------
// VAT Summary, Register, and Settlement
// ----------------------------------------------------
export function getDemoVatSummary(from, to) {
  const salesInvs = demoInvoices.filter((i) => i.type === 'sale' && i.status !== 'void');
  const purchInvs = demoInvoices.filter((i) => i.type === 'purchase' && i.status !== 'void');
  const validExps = demoExpenses.filter((e) => e.status === 'posted' && (e.vat || 0) > 0);

  const outTaxable = r2(salesInvs.reduce((s, i) => s + (i.subtotal || 0), 0));
  const outVat = r2(salesInvs.reduce((s, i) => s + (i.vatTotal || 0), 0));

  const inPurchTaxable = r2(purchInvs.reduce((s, i) => s + (i.subtotal || 0), 0));
  const inPurchVat = r2(purchInvs.reduce((s, i) => s + (i.vatTotal || 0), 0));

  const inExpTaxable = r2(validExps.reduce((s, e) => s + (e.amount || 0), 0));
  const inExpVat = r2(validExps.reduce((s, e) => s + (e.vat || 0), 0));

  const totalInputVat = r2(inPurchVat + inExpVat);
  const netPayable = r2(outVat - totalInputVat);

  const vatOutAcc = findAccount('2100');
  const vatInAcc = findAccount('1300');
  const outputBalance = vatOutAcc ? vatOutAcc.balance : outVat;
  const inputBalance = vatInAcc ? vatInAcc.balance : totalInputVat;

  return {
    period: { from: from || '2026-07-01', to: to || new Date().toISOString().slice(0, 10) },
    output: { taxable: outTaxable, vat: outVat, documents: salesInvs.length },
    input: {
      purchases: { taxable: inPurchTaxable, vat: inPurchVat, documents: purchInvs.length },
      expenses: { taxable: inExpTaxable, vat: inExpVat, documents: validExps.length },
      vat: totalInputVat,
    },
    netPayable,
    ledger: {
      outputBalance,
      inputBalance,
      netPayable: r2(outputBalance - inputBalance),
    },
  };
}

export function getDemoVatRegister() {
  const rows = [];
  for (const i of demoInvoices) {
    if (i.status === 'void' || !i.vatTotal) continue;
    rows.push({
      date: i.date,
      type: i.type === 'sale' ? 'Output (Sales)' : 'Input (Purchase)',
      number: i.number,
      party: i.party?.name || '',
      bin: i.party?.bin || '',
      taxable: i.subtotal,
      vat: i.vatTotal,
    });
  }
  for (const e of demoExpenses) {
    if (e.status === 'void' || !e.vat) continue;
    rows.push({
      date: e.date,
      type: 'Input (Expense)',
      number: e.number,
      party: e.payee || '',
      bin: '',
      taxable: e.amount,
      vat: e.vat,
    });
  }
  return rows.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function settleMockVat(data) {
  const vatOutAcc = sysAcc('2100');
  const vatInAcc = sysAcc('1300');
  const outBal = vatOutAcc.balance;
  const inBal = vatInAcc.balance;
  const net = r2(outBal - inBal);

  const bankAcc = findAccount(data.account) || sysAcc('1010');
  const lines = [
    { account: vatOutAcc, debit: outBal },
    { account: vatInAcc, credit: Math.min(outBal, inBal) },
  ];
  if (net > 0) {
    lines.push({ account: bankAcc, credit: net });
  }

  postMockJournalEntry({
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    voucherType: 'payment',
    narration: `Mushak-9.1 VAT settlement`,
    reference: 'VAT-SETTLE',
    lines,
  });

  return { payable: Math.max(0, net), carryForwardInput: Math.max(0, -net) };
}

// ----------------------------------------------------
// Dynamic Financial Reports Calculated from Real Data
// ----------------------------------------------------
export function getDemoTrialBalance(asOf) {
  const rows = demoAccounts.map((a) => ({
    accountId: a._id,
    code: a.code,
    name: a.name,
    type: a.type,
    debit: a.debit,
    credit: a.credit,
    balance: a.balance,
  }));

  const totalDebit = r2(rows.reduce((s, r) => s + r.debit, 0));
  const totalCredit = r2(rows.reduce((s, r) => s + r.credit, 0));
  const balanced = Math.abs(totalDebit - totalCredit) < 0.02;

  return {
    asOf: asOf || new Date().toISOString().slice(0, 10),
    rows,
    totalDebit,
    totalCredit,
    balanced,
  };
}

export function getDemoProfitLoss(from, to) {
  const incomeAccounts = demoAccounts.filter((a) => a.type === 'income');
  const cogsAccounts = demoAccounts.filter((a) => a.subType === 'cogs');
  const expenseAccounts = demoAccounts.filter((a) => a.type === 'expense' && a.subType !== 'cogs');

  const incomeRows = incomeAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
  const cogsRows = cogsAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
  const expRows = expenseAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));

  const totalIncome = r2(incomeRows.reduce((s, r) => s + r.amount, 0));
  const totalCogs = r2(cogsRows.reduce((s, r) => s + r.amount, 0));
  const grossProfit = r2(totalIncome - totalCogs);
  const totalExpense = r2(expRows.reduce((s, r) => s + r.amount, 0));
  const netProfit = r2(grossProfit - totalExpense);

  return {
    from: from || '2026-07-01',
    to: to || new Date().toISOString().slice(0, 10),
    income: { rows: incomeRows, total: totalIncome },
    cogs: { rows: cogsRows, total: totalCogs },
    grossProfit,
    operatingExpenses: { rows: expRows, total: totalExpense },
    netProfit,
  };
}

export function getDemoBalanceSheet(asOf) {
  const assetAccounts = demoAccounts.filter((a) => a.type === 'asset');
  const liabilityAccounts = demoAccounts.filter((a) => a.type === 'liability');
  const equityAccounts = demoAccounts.filter((a) => a.type === 'equity');

  const totalIncome = demoAccounts.filter((a) => a.type === 'income').reduce((s, a) => s + a.balance, 0);
  const totalExpense = demoAccounts.filter((a) => a.type === 'expense').reduce((s, a) => s + a.balance, 0);
  const currentEarnings = r2(totalIncome - totalExpense);

  const assetRows = assetAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
  const liabilityRows = liabilityAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
  const equityRows = equityAccounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));

  const totalAssets = r2(assetRows.reduce((s, r) => s + r.amount, 0));
  const totalLiabilities = r2(liabilityRows.reduce((s, r) => s + r.amount, 0));
  const equityBase = r2(equityRows.reduce((s, r) => s + r.amount, 0));
  const totalEquity = r2(equityBase + currentEarnings);
  const totalLiabilitiesAndEquity = r2(totalLiabilities + totalEquity);
  const balanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.02;

  return {
    asOf: asOf || new Date().toISOString().slice(0, 10),
    assets: { rows: assetRows, total: totalAssets },
    liabilities: { rows: liabilityRows, total: totalLiabilities },
    equity: { rows: equityRows, currentEarnings, total: totalEquity },
    totalAssets,
    totalLiabilitiesAndEquity,
    balanced,
  };
}

export function getDemoCashFlow(from, to) {
  const cashAccounts = demoAccounts.filter((a) => a.subType === 'cash' || a.subType === 'bank');
  const closingCash = r2(cashAccounts.reduce((s, a) => s + a.balance, 0));

  let operatingTotal = 0;
  let financingTotal = 0;
  let investingTotal = 0;

  for (const j of demoJournal) {
    if (j.status === 'void') continue;
    for (const l of j.lines) {
      const isCash = cashAccounts.some((c) => c.code === l.account.code || c._id === l.account._id);
      if (isCash) {
        const netCash = l.debit - l.credit;
        if (j.voucherType === 'opening' || j.narration.toLowerCase().includes('capital')) {
          financingTotal = r2(financingTotal + netCash);
        } else if (j.reference.startsWith('FA-') || j.narration.toLowerCase().includes('asset')) {
          investingTotal = r2(investingTotal + netCash);
        } else {
          operatingTotal = r2(operatingTotal + netCash);
        }
      }
    }
  }

  const netChange = r2(operatingTotal + investingTotal + financingTotal);

  return {
    from: from || '2026-07-01',
    to: to || new Date().toISOString().slice(0, 10),
    openingCash: 0,
    operating: { items: [{ name: 'Operating cash flow', amount: operatingTotal }], total: operatingTotal },
    investing: { items: investingTotal !== 0 ? [{ name: 'Fixed asset transactions', amount: investingTotal }] : [], total: investingTotal },
    financing: { items: financingTotal !== 0 ? [{ name: 'Capital contributions', amount: financingTotal }] : [], total: financingTotal },
    netChange,
    closingCash,
    ledgerClosingCash: closingCash,
    reconciles: Math.abs(closingCash - netChange) < 0.02,
  };
}

export function getDemoLedger(accId, from, to) {
  const acc = findAccount(accId) || demoAccounts[0];
  const rows = [];
  let runningBal = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  for (const j of [...demoJournal].reverse()) {
    for (const l of j.lines) {
      if (l.account._id === acc._id || l.account.code === acc.code) {
        if (j.status !== 'void') {
          totalDebit = r2(totalDebit + l.debit);
          totalCredit = r2(totalCredit + l.credit);
          const change = naturalBalance(acc.type, l.debit, l.credit);
          runningBal = r2(runningBal + change);
        }
        rows.push({
          date: j.date,
          entryNo: j.entryNo,
          voucherType: j.voucherType,
          narration: j.narration,
          counter: j.lines.find((x) => x.account.code !== acc.code)?.account.name || 'Various',
          debit: l.debit,
          credit: l.credit,
          balance: runningBal,
          status: j.status,
        });
      }
    }
  }

  return {
    account: acc,
    from: from || '2026-07-01',
    to: to || new Date().toISOString().slice(0, 10),
    opening: 0,
    rows: rows.reverse(),
    totalDebit,
    totalCredit,
    closing: acc.balance,
  };
}

export function getDemoBanking() {
  const cashAccounts = demoAccounts.filter((a) => a.subType === 'cash');
  const bankAccounts = demoAccounts.filter((a) => a.subType === 'bank');
  const cash = r2(cashAccounts.reduce((s, a) => s + a.balance, 0));
  const bank = r2(bankAccounts.reduce((s, a) => s + a.balance, 0));
  const total = r2(cash + bank);

  return {
    accounts: [...cashAccounts, ...bankAccounts],
    cash,
    bank,
    total,
  };
}

export function getDemoStockValuation() {
  const rows = demoItems.map((i) => {
    const qtyOnHand = i.qtyOnHand || 0;
    const avgCost = i.avgCost || 0;
    const value = r2(qtyOnHand * avgCost);
    return {
      sku: i.sku,
      name: i.name,
      unit: i.unit,
      qty: qtyOnHand,
      avgCost,
      value,
      reorderLevel: i.reorderLevel,
      low: qtyOnHand <= (i.reorderLevel || 0),
    };
  });

  const totalValue = r2(rows.reduce((s, r) => s + r.value, 0));
  const lowCount = rows.filter((r) => r.low).length;

  return {
    rows,
    totalValue,
    lowCount,
  };
}

export function getDemoAgeing(type, asOf) {
  const isPayable = type === 'payable';
  const targetType = isPayable ? 'purchase' : 'sale';
  const openInvs = demoInvoices.filter((i) => i.type === targetType && ['unpaid', 'partial'].includes(i.status));

  const byParty = new Map();
  for (const inv of openInvs) {
    const pName = inv.party?.name || 'Unknown';
    if (!byParty.has(pName)) {
      byParty.set(pName, {
        party: pName,
        phone: inv.party?.phone || '',
        total: 0,
        current: 0,
        d1_30: 0,
        d31_60: 0,
        d61_90: 0,
        d90plus: 0,
        invoices: 0,
      });
    }
    const entry = byParty.get(pName);
    const due = r2(inv.total - inv.paid);
    entry.total = r2(entry.total + due);
    entry.current = r2(entry.current + due);
    entry.invoices += 1;
  }

  const rows = [...byParty.values()];
  const totalVal = r2(rows.reduce((s, r) => s + r.total, 0));

  return {
    asOf: asOf || new Date().toISOString().slice(0, 10),
    type: type || 'receivable',
    rows,
    totals: { current: totalVal, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: totalVal },
  };
}

export function getDemoDashboard() {
  const cashAccounts = demoAccounts.filter((a) => a.subType === 'cash');
  const bankAccounts = demoAccounts.filter((a) => a.subType === 'bank');
  const arAcc = findAccount('1100');
  const apAcc = findAccount('2000');
  const invAcc = findAccount('1200');
  const vatOutAcc = findAccount('2100');
  const vatInAcc = findAccount('1300');

  const cash = r2(cashAccounts.reduce((s, a) => s + a.balance, 0));
  const bank = r2(bankAccounts.reduce((s, a) => s + a.balance, 0));
  const receivables = arAcc ? arAcc.balance : 0;
  const payables = apAcc ? apAcc.balance : 0;
  const inventoryValue = invAcc ? invAcc.balance : 0;
  const vatPayable = r2((vatOutAcc ? vatOutAcc.balance : 0) - (vatInAcc ? vatInAcc.balance : 0));

  const totalIncome = demoAccounts.filter((a) => a.type === 'income').reduce((s, a) => s + a.balance, 0);
  const totalExpense = demoAccounts.filter((a) => a.type === 'expense').reduce((s, a) => s + a.balance, 0);
  const profit = r2(totalIncome - totalExpense);

  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const isCurrent = i === 0;
    months.push({
      month: d.toISOString().slice(0, 7),
      income: isCurrent ? totalIncome : 0,
      expense: isCurrent ? totalExpense : 0,
      profit: isCurrent ? profit : 0,
    });
  }

  const expAccounts = demoAccounts.filter((a) => a.type === 'expense' && a.balance > 0);
  const expenseBreakdown = expAccounts.map((a) => ({ name: a.name, amount: a.balance })).sort((a, b) => b.amount - a.amount).slice(0, 6);

  const lowStock = demoItems.filter((i) => (i.qtyOnHand || 0) <= (i.reorderLevel || 0));
  const tb = getDemoTrialBalance();

  return {
    cash,
    bank,
    receivables,
    payables,
    inventoryValue,
    vatPayable,
    month: { income: totalIncome, expense: totalExpense, profit },
    fiscalYear: { from: '2026-07-01', income: totalIncome, expense: totalExpense, profit },
    trend: months,
    expenseBreakdown,
    lowStock: lowStock.slice(0, 8).map((i) => ({ sku: i.sku, name: i.name, qty: i.qtyOnHand, reorderLevel: i.reorderLevel })),
    lowStockCount: lowStock.length,
    booksBalanced: tb.balanced,
  };
}

// ----------------------------------------------------
// Authentication Handler for Demo Mode
// ----------------------------------------------------
export function handleDemoAuth(req, res) {
  if (req.path === '/api/auth/status') {
    return res.json({ needsSetup: false });
  }

  if (req.path === '/api/auth/login' || req.path === '/api/auth/setup') {
    const token = jwt.sign(
      { sub: demoUser._id, role: demoUser.role, email: demoUser.email, name: demoUser.name },
      secret(),
      { expiresIn: '8h' }
    );
    const refreshToken = jwt.sign(
      { sub: demoUser._id, role: demoUser.role, type: 'refresh' },
      secret(),
      { expiresIn: '7d' }
    );
    addMockAudit('login', 'User', `${demoUser.email} signed in`);
    return res.json({
      token,
      refreshToken,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        permissions: demoUser.permissions,
      },
    });
  }

  if (req.path === '/api/auth/refresh') {
    const token = jwt.sign(
      { sub: demoUser._id, role: demoUser.role, email: demoUser.email, name: demoUser.name },
      secret(),
      { expiresIn: '8h' }
    );
    const refreshToken = jwt.sign(
      { sub: demoUser._id, role: demoUser.role, type: 'refresh' },
      secret(),
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      refreshToken,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        permissions: demoUser.permissions,
      },
    });
  }

  if (req.path === '/api/auth/me') {
    return res.json({
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        permissions: demoUser.permissions,
      },
    });
  }

  return false;
}
