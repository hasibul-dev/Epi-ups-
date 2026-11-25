/**
 * EPI ACCOUNTS / ERP — Browser-Local Storage & Double-Entry Accounting Engine
 * 
 * 100% Client-Side Persistence with LocalStorage.
 * Zero Cloud Database (No MongoDB / Atlas requirement).
 * Complete Double-Entry Ledger, Mushak-9.1 VAT, Invoicing, Payroll, Assets & Financial Reports.
 */

import { assertAuthorizedAdmin } from '../../../utils/backupAuth.js';

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

const STORAGE_KEY = 'epi_erp_browser_data_v1';

class BrowserErpEngine {
  constructor() {
    this.data = this.loadData();
  }

  createDefaultStore() {
    const initialAccounts = DEFAULT_COA.map(([code, name, type, subType, sysKey, cashFlowCategory], idx) => ({
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

    const defaultUser = {
      _id: 'usr-admin-01',
      id: 'usr-admin-01',
      name: 'EPI Administrator',
      email: 'admin@epiups.com.bd',
      role: 'admin',
      active: true,
      permissions: adminPermissions,
    };

    const defaultSettings = {
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

    return {
      accounts: initialAccounts,
      parties: [],
      items: [],
      invoices: [],
      expenses: [],
      payments: [],
      journal: [],
      stockMovements: [],
      employees: [],
      payrollRuns: [],
      assets: [],
      auditLogs: [
        {
          _id: 'audit-init',
          at: new Date().toISOString(),
          userName: defaultUser.name,
          role: defaultUser.role,
          action: 'init',
          entity: 'System',
          summary: 'EPI Accounts browser-local double-entry database initialized',
          ip: 'Local Browser',
        },
      ],
      settings: defaultSettings,
      users: [defaultUser],
    };
  }

  loadData() {
    if (typeof localStorage === 'undefined') {
      return this.createDefaultStore();
    }
    try {
      if (typeof window !== 'undefined' && window.__EPI_UNIFIED_STORE__?.memory?.erpData?.accounts) {
        return window.__EPI_UNIFIED_STORE__.memory.erpData;
      }
      const rawUnified = localStorage.getItem('epi_erp_storage_v1');
      if (rawUnified) {
        const parsed = JSON.parse(rawUnified);
        if (parsed && Array.isArray(parsed.accounts)) return parsed;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.accounts)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[ErpStorage] Failed to read storage:', e);
    }

    const initial = this.createDefaultStore();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (_) {}

    return initial;
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      const json = JSON.stringify(this.data);
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem('epi_erp_storage_v1', json);
      if (typeof window !== 'undefined' && window.__EPI_UNIFIED_STORE__) {
        window.__EPI_UNIFIED_STORE__.memory.erpData = this.data;
        window.__EPI_UNIFIED_STORE__.persist();
      }
    } catch (e) {
      console.warn('[ErpStorage] Failed to save state to localStorage:', e);
    }
  }

  reloadFromUnified() {
    this.data = this.loadData();
    this.syncCentralClients();
  }

  syncCentralClients(customClients) {
    try {
      let centralClients = customClients;
      if (!centralClients) {
        if (typeof window !== 'undefined' && window.__EPI_UNIFIED_STORE__?.memory?.clients) {
          centralClients = window.__EPI_UNIFIED_STORE__.memory.clients;
        } else if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('epi_unified_clients_v2');
          if (raw) centralClients = JSON.parse(raw);
        }
      }
      if (!Array.isArray(centralClients) || centralClients.length === 0) return;

      let changed = false;
      for (const c of centralClients) {
        const comp = (c.company || c.name || '').trim();
        if (!comp) continue;
        const exists = this.data.parties.some(
          (p) => p.clientId === c.id || p.name.toLowerCase() === comp.toLowerCase()
        );
        if (!exists) {
          this.data.parties.push({
            _id: `party-${c.id || Date.now()}`,
            clientId: c.id,
            type: 'customer',
            name: c.company ? `${c.company} (${c.name})` : c.name,
            phone: c.phone || '',
            email: c.email || '',
            address: c.address || '',
            bin: '',
            tin: '',
            creditLimit: 500000,
            creditDays: 30,
            openingBalance: 0,
            openingDate: c.saleDate || new Date().toISOString(),
            active: true,
            balance: 0,
          });
          changed = true;
        }
      }
      if (changed) {
        this.save();
      }
    } catch (e) {
      console.warn('[ErpStorage] Client sync note:', e);
    }
  }

  addAudit(action, entity, summary) {
    const user = (this.data.users && this.data.users[0]) || { name: 'Admin', role: 'admin' };
    if (!Array.isArray(this.data.auditLogs)) this.data.auditLogs = [];
    this.data.auditLogs.unshift({
      _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      userName: user.name,
      role: user.role,
      action,
      entity,
      summary,
      ip: 'Local Browser',
    });
    if (this.data.auditLogs.length > 500) this.data.auditLogs.length = 500;
    this.save();
  }

  findAccount(idOrCode) {
    if (!idOrCode) return null;
    return this.data.accounts.find((a) => a._id === idOrCode || a.code === idOrCode || a.sysKey === idOrCode) || null;
  }

  sysAcc(codeOrKey) {
    const a = this.findAccount(codeOrKey);
    if (!a) throw new Error(`Account ${codeOrKey} not found in Chart of Accounts`);
    return a;
  }

  // --- Double-entry Journal Engine ---
  postJournalEntry({ date, voucherType = 'journal', narration = '', reference = '', lines = [], source = null }) {
    const normLines = lines.map((l) => {
      const acc = typeof l.account === 'object' ? l.account : this.findAccount(l.account);
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
      const target = this.data.accounts.find((a) => a._id === l.account._id || a.code === l.account.code);
      if (target) {
        target.debit = r2(target.debit + l.debit);
        target.credit = r2(target.credit + l.credit);
        target.balance = naturalBalance(target.type, target.debit, target.credit);
      }
    }

    const entryNo = `JV-${String(this.data.journal.length + 1).padStart(5, '0')}`;
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

    this.data.journal.unshift(entry);
    this.addAudit('create', 'JournalEntry', `Posted ${voucherType} ${entryNo} for ${totalDebit}`);
    this.save();
    return entry;
  }

  voidJournalEntry(id, reason = 'Voided') {
    const entry = this.data.journal.find((j) => j._id === id || j.entryNo === id);
    if (!entry) throw new Error('Journal entry not found');
    if (entry.status === 'void') return entry;

    for (const l of entry.lines) {
      const target = this.data.accounts.find((a) => a._id === l.account._id || a.code === l.account.code);
      if (target) {
        target.debit = r2(target.debit - l.debit);
        target.credit = r2(target.credit - l.credit);
        target.balance = naturalBalance(target.type, target.debit, target.credit);
      }
    }

    entry.status = 'void';
    entry.voidReason = reason;
    entry.voidedAt = new Date().toISOString();
    this.addAudit('void', 'JournalEntry', `Voided ${entry.entryNo}: ${reason}`);
    this.save();
    return entry;
  }

  // --- Parties (Customers & Suppliers) ---
  getParties(type, q) {
    this.syncCentralClients();
    let list = this.data.parties;
    if (type) list = list.filter((p) => p.type === type);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(s) || (p.phone && p.phone.includes(s)));
    }
    return list;
  }

  getParty(id) {
    return this.data.parties.find((p) => p._id === id) || null;
  }

  createParty(data) {
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
      const ar = this.sysAcc('1100');
      const ap = this.sysAcc('2000');
      const eq = this.sysAcc('3900');

      this.postJournalEntry({
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

    this.data.parties.push(party);
    this.addAudit('create', 'Party', `Created ${party.type} ${party.name}`);
    this.save();
    return party;
  }

  updateParty(id, data) {
    const party = this.data.parties.find((p) => p._id === id);
    if (!party) throw new Error('Party not found');
    Object.assign(party, data);
    this.addAudit('update', 'Party', `Updated ${party.type} ${party.name}`);
    this.save();
    return party;
  }

  deleteParty(id) {
    const idx = this.data.parties.findIndex((p) => p._id === id);
    if (idx === -1) throw new Error('Party not found');
    const party = this.data.parties[idx];

    const hasInvoices = this.data.invoices.some((i) => i.party?._id === id || i.party === id);
    const hasPayments = this.data.payments.some((p) => p.party?._id === id || p.party === id);
    if (hasInvoices || hasPayments || party.balance !== 0) {
      throw new Error('This party has transactions. Mark it inactive instead of deleting.');
    }

    this.data.parties.splice(idx, 1);
    this.addAudit('delete', 'Party', `Deleted ${party.type} ${party.name}`);
    this.save();
    return { ok: true };
  }

  getPartyStatement(id) {
    const party = this.data.parties.find((p) => p._id === id);
    if (!party) throw new Error('Party not found');

    const isCust = party.type === 'customer';
    const partyInvs = this.data.invoices.filter((i) => (i.party?._id === id || i.party === id) && i.status !== 'void');
    const partyPays = this.data.payments.filter((p) => (p.party?._id === id || p.party === id) && p.status === 'posted');

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

  // --- Inventory Items & Stock Movements ---
  getItems(q, category) {
    let list = this.data.items;
    if (category) list = list.filter((i) => i.category === category);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
    }
    return list;
  }

  getItem(id) {
    return this.data.items.find((i) => i._id === id || i.sku === id) || null;
  }

  createItem(data) {
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
      this.data.stockMovements.push({
        _id: `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: new Date().toISOString(),
        item: { _id: item._id, sku: item.sku, name: item.name, unit: item.unit },
        type: 'opening',
        qty: openQty,
        unitCost: openCost,
        reference: 'OPENING',
        note: 'Initial inventory stock',
      });

      const invAcc = this.sysAcc('1200');
      const eqAcc = this.sysAcc('3900');
      this.postJournalEntry({
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

    this.data.items.push(item);
    this.addAudit('create', 'Item', `Created item ${item.sku} ${item.name}`);
    this.save();
    return item;
  }

  updateItem(id, data) {
    const item = this.data.items.find((i) => i._id === id);
    if (!item) throw new Error('Item not found');
    Object.assign(item, data);
    this.addAudit('update', 'Item', `Updated item ${item.sku}`);
    this.save();
    return item;
  }

  deleteItem(id) {
    const idx = this.data.items.findIndex((i) => i._id === id);
    if (idx === -1) throw new Error('Item not found');
    const item = this.data.items[idx];

    const hasMoves = this.data.stockMovements.some((m) => m.item?._id === id || m.item === id);
    const hasInvoices = this.data.invoices.some((i) => (i.lines || []).some((l) => l.item?._id === id || l.item === id));
    if (hasMoves || hasInvoices) {
      throw new Error('This item has stock history. Mark it inactive instead of deleting.');
    }

    this.data.items.splice(idx, 1);
    this.addAudit('delete', 'Item', `Deleted item ${item.sku}`);
    this.save();
    return { ok: true };
  }

  getStockMovements(filters = {}) {
    let list = this.data.stockMovements;
    if (filters.item) list = list.filter((m) => m.item?._id === filters.item || m.item === filters.item);
    return list;
  }

  adjustStock(data) {
    const item = this.data.items.find((i) => i._id === data.item);
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
    this.data.stockMovements.unshift(sm);

    const invAcc = this.sysAcc('1200');
    const cogsAcc = this.sysAcc('5000');
    this.postJournalEntry({
      date: sm.date,
      voucherType: 'journal',
      narration: `Stock adjustment: ${data.note || ''} (${item.sku} ${data.direction} ${qty})`,
      reference: 'ADJ-STK',
      lines: isInput
        ? [{ account: invAcc, debit: totalVal }, { account: cogsAcc, credit: totalVal }]
        : [{ account: cogsAcc, debit: totalVal }, { account: invAcc, credit: totalVal }],
    });

    this.addAudit('create', 'StockAdjustment', `Stock ${data.direction} ${qty} for ${item.sku}`);
    this.save();
    return sm;
  }

  // --- Invoices (Sales Invoices & Purchase Bills) ---
  getInvoices(type, filters = {}) {
    let list = this.data.invoices.filter((i) => i.type === type);
    if (filters.status) list = list.filter((i) => i.status === filters.status);
    if (filters.party) list = list.filter((i) => i.party?._id === filters.party || i.party === filters.party);
    if (filters.q) {
      const s = filters.q.toLowerCase();
      list = list.filter((i) => i.number.toLowerCase().includes(s));
    }
    return list;
  }

  getInvoice(id) {
    return this.data.invoices.find((i) => i._id === id || i.number === id) || null;
  }

  createInvoice(type, data) {
    const isSale = type === 'sale';
    const party = this.data.parties.find((p) => p._id === data.party);
    if (!party) throw new Error('Party is required');

    const prefix = isSale ? 'INV' : 'BILL';
    const count = this.data.invoices.filter((i) => i.type === type).length + 1;
    const number = `${prefix}-${String(count).padStart(5, '0')}`;
    const invId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    let subtotal = 0;
    let vatTotal = 0;
    let totalCostOfGoodsSold = 0;

    const rawLines = data.lines || data.items || [];
    const resolvedLines = rawLines.map((l) => {
      const it = l.item ? this.data.items.find((x) => x._id === l.item) : null;
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

          this.data.stockMovements.unshift({
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

          this.data.stockMovements.unshift({
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

    party.balance = r2((party.balance || 0) + grandTotal);

    const arAcc = this.sysAcc('1100');
    const apAcc = this.sysAcc('2000');
    const salesAcc = this.sysAcc('4000');
    const invAcc = this.sysAcc('1200');
    const cogsAcc = this.sysAcc('5000');
    const vatOutAcc = this.sysAcc('2100');
    const vatInAcc = this.sysAcc('1300');

    if (isSale) {
      const jLines = [
        { account: arAcc, debit: grandTotal },
        { account: salesAcc, credit: subtotal },
      ];
      if (vatTotal > 0) jLines.push({ account: vatOutAcc, credit: vatTotal });
      if (totalCostOfGoodsSold > 0) {
        jLines.push({ account: cogsAcc, debit: totalCostOfGoodsSold });
        jLines.push({ account: invAcc, credit: totalCostOfGoodsSold });
      }

      this.postJournalEntry({
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
      if (vatTotal > 0) jLines.push({ account: vatInAcc, debit: vatTotal });

      this.postJournalEntry({
        date: invoice.date,
        voucherType: 'purchase',
        narration: `Purchase Bill ${number} - ${party.name}`,
        reference: number,
        lines: jLines,
        source: { kind: 'Invoice', id: invId },
      });
    }

    this.data.invoices.unshift(invoice);
    this.addAudit('create', 'Invoice', `Created ${isSale ? 'sales invoice' : 'purchase bill'} ${number} for ${grandTotal}`);
    this.save();
    return invoice;
  }

  voidInvoice(id, reason = 'Voided') {
    const inv = this.data.invoices.find((i) => i._id === id || i.number === id);
    if (!inv) throw new Error('Invoice not found');
    if (inv.status === 'void') return inv;

    const isSale = inv.type === 'sale';
    const party = this.data.parties.find((p) => p._id === inv.party?._id || p.name === inv.party?.name);

    const unreversedAmt = r2(inv.total - inv.paid);
    if (party && unreversedAmt > 0) {
      party.balance = r2(party.balance - unreversedAmt);
    }

    for (const l of inv.lines) {
      if (l.item?._id) {
        const it = this.data.items.find((x) => x._id === l.item._id);
        if (it) {
          if (isSale) {
            it.qtyOnHand = (it.qtyOnHand || 0) + l.qty;
          } else {
            it.qtyOnHand = Math.max(0, (it.qtyOnHand || 0) - l.qty);
          }
        }
      }
    }

    const jv = this.data.journal.find((j) => j.reference === inv.number && j.status === 'posted');
    if (jv) {
      this.voidJournalEntry(jv._id, reason);
    }

    inv.status = 'void';
    inv.voidReason = reason;
    this.addAudit('void', 'Invoice', `Voided invoice ${inv.number}: ${reason}`);
    this.save();
    return inv;
  }

  // --- Payments & Receipts ---
  getPayments(filters = {}) {
    let list = this.data.payments;
    if (filters.type) list = list.filter((p) => p.type === filters.type);
    if (filters.status) list = list.filter((p) => p.status === filters.status);
    if (filters.party) list = list.filter((p) => p.party?._id === filters.party || p.party === filters.party);
    if (filters.q) {
      const s = filters.q.toLowerCase();
      list = list.filter((p) => p.number.toLowerCase().includes(s));
    }
    return list;
  }

  createPayment(kind, data) {
    const isReceipt = kind === 'receipt';
    const partyId = typeof data.party === 'object' ? data.party?._id : data.party;
    const party = this.data.parties.find((p) => p._id === partyId);
    if (!party) throw new Error('Party is required');

    const account = this.findAccount(data.account);
    if (!account) throw new Error('Payment cash or bank account is required');

    const amount = r2(Number(data.amount) || 0);
    if (amount <= 0) throw new Error('Payment amount must be greater than zero');

    const prefix = isReceipt ? 'REC' : 'PAY';
    const count = this.data.payments.filter((p) => p.type === kind).length + 1;
    const number = `${prefix}-${String(count).padStart(5, '0')}`;
    const payId = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Apply to invoices
    if (Array.isArray(data.allocations) && data.allocations.length > 0) {
      for (const alloc of data.allocations) {
        const inv = this.data.invoices.find((i) => i._id === alloc.invoice);
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
      const targetType = isReceipt ? 'sale' : 'purchase';
      const openInvs = this.data.invoices.filter(
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

    party.balance = r2(party.balance - amount);

    const arAcc = this.sysAcc('1100');
    const apAcc = this.sysAcc('2000');

    this.postJournalEntry({
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

    this.data.payments.unshift(payment);
    this.addAudit('create', 'Payment', `Recorded ${kind} ${number} for ${amount}`);
    this.save();
    return payment;
  }

  voidPayment(id, reason = 'Voided') {
    const p = this.data.payments.find((x) => x._id === id || x.number === id);
    if (!p) throw new Error('Payment not found');
    if (p.status === 'void') return p;

    const party = this.data.parties.find((x) => x._id === p.party?._id || x.name === p.party?.name);
    if (party) {
      party.balance = r2(party.balance + p.amount);
    }

    const jv = this.data.journal.find((j) => j.reference === p.number && j.status === 'posted');
    if (jv) {
      this.voidJournalEntry(jv._id, reason);
    }

    p.status = 'void';
    p.voidReason = reason;
    this.addAudit('void', 'Payment', `Voided payment ${p.number}: ${reason}`);
    this.save();
    return p;
  }

  // --- Expenses ---
  getExpenses(filters = {}) {
    let list = this.data.expenses;
    if (filters.account) list = list.filter((e) => e.expenseAccount?._id === filters.account);
    if (filters.status) list = list.filter((e) => e.status === filters.status);
    if (filters.q) {
      const s = filters.q.toLowerCase();
      list = list.filter((e) => (e.payee && e.payee.toLowerCase().includes(s)) || (e.description && e.description.toLowerCase().includes(s)));
    }
    return list;
  }

  createExpense(data) {
    const expAcc = this.findAccount(data.expenseAccount);
    if (!expAcc) throw new Error('Expense category account is required');

    const paidFrom = this.findAccount(data.paidFrom);
    if (!paidFrom) throw new Error('Paid from cash/bank account is required');

    const amount = r2(Number(data.amount) || 0);
    const vat = r2(Number(data.vat) || 0);
    const total = r2(amount + vat);

    const number = `EXP-${String(this.data.expenses.length + 1).padStart(5, '0')}`;
    const expId = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const vatInAcc = this.sysAcc('1300');
    const lines = [
      { account: expAcc, debit: amount },
      { account: paidFrom, credit: total },
    ];
    if (vat > 0) {
      lines.push({ account: vatInAcc, debit: vat });
    }

    this.postJournalEntry({
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

    this.data.expenses.unshift(expense);
    this.addAudit('create', 'Expense', `Recorded expense ${number} for ${total}`);
    this.save();
    return expense;
  }

  voidExpense(id, reason = 'Voided') {
    const exp = this.data.expenses.find((e) => e._id === id || e.number === id);
    if (!exp) throw new Error('Expense not found');
    if (exp.status === 'void') return exp;

    const jv = this.data.journal.find((j) => j.reference === exp.number && j.status === 'posted');
    if (jv) {
      this.voidJournalEntry(jv._id, reason);
    }

    exp.status = 'void';
    exp.voidReason = reason;
    this.addAudit('void', 'Expense', `Voided expense ${exp.number}: ${reason}`);
    this.save();
    return exp;
  }

  // --- Employees & Payroll ---
  getEmployees() {
    return this.data.employees;
  }

  createEmployee(data) {
    const empId = `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const employee = {
      _id: empId,
      empId: data.empId || `EMP-${String(this.data.employees.length + 1).padStart(3, '0')}`,
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

    this.data.employees.push(employee);
    this.addAudit('create', 'Employee', `Created employee ${employee.empId} ${employee.name}`);
    this.save();
    return employee;
  }

  updateEmployee(id, data) {
    const emp = this.data.employees.find((e) => e._id === id);
    if (!emp) throw new Error('Employee not found');
    Object.assign(emp, data);
    this.addAudit('update', 'Employee', `Updated employee ${emp.empId}`);
    this.save();
    return emp;
  }

  deleteEmployee(id) {
    const idx = this.data.employees.findIndex((e) => e._id === id);
    if (idx === -1) throw new Error('Employee not found');
    const emp = this.data.employees[idx];
    this.data.employees.splice(idx, 1);
    this.addAudit('delete', 'Employee', `Deleted employee ${emp.empId}`);
    this.save();
    return { ok: true };
  }

  getPayroll() {
    return this.data.payrollRuns;
  }

  processPayroll(month) {
    const activeEmps = this.data.employees.filter((e) => e.active);
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
    const salAcc = this.sysAcc('5100');
    const tdsAcc = this.sysAcc('2210');
    const payAcc = this.sysAcc('2200');

    this.postJournalEntry({
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

    this.data.payrollRuns.unshift(run);
    this.addAudit('create', 'PayrollRun', `Processed payroll for ${month}: net ${totalNet}`);
    this.save();
    return run;
  }

  payPayroll(id, data) {
    const run = this.data.payrollRuns.find((r) => r._id === id);
    if (!run) throw new Error('Payroll run not found');
    if (run.status === 'paid') throw new Error('Payroll already paid');

    const bankAcc = this.findAccount(data.account);
    if (!bankAcc) throw new Error('Payment account required');

    const payAcc = this.sysAcc('2200');
    this.postJournalEntry({
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
    this.addAudit('update', 'PayrollRun', `Paid payroll ${run.month}`);
    this.save();
    return run;
  }

  voidPayroll(id, reason = 'Voided') {
    const run = this.data.payrollRuns.find((r) => r._id === id);
    if (!run) throw new Error('Payroll run not found');

    const jv = this.data.journal.find((j) => j.reference === `PAYROLL-${run.month}` && j.status === 'posted');
    if (jv) {
      this.voidJournalEntry(jv._id, reason);
    }

    run.status = 'void';
    this.addAudit('void', 'PayrollRun', `Voided payroll ${run.month}`);
    this.save();
    return run;
  }

  // --- Fixed Assets ---
  getAssets() {
    return this.data.assets;
  }

  createAsset(data) {
    const cost = Number(data.cost) || 0;
    const paidFrom = this.findAccount(data.paidFrom);
    if (!paidFrom) throw new Error('Payment account required for asset acquisition');

    const code = `FA-${String(this.data.assets.length + 1).padStart(3, '0')}`;
    const assetId = `fa-${Date.now()}`;

    const faAcc = this.sysAcc('1500');
    this.postJournalEntry({
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

    this.data.assets.push(asset);
    this.addAudit('create', 'FixedAsset', `Created fixed asset ${code} ${data.name}`);
    this.save();
    return asset;
  }

  runDepreciation(month) {
    const activeAssets = this.data.assets.filter((a) => a.status === 'active');
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
      const depExp = this.sysAcc('5160');
      const accumDep = this.sysAcc('1590');
      this.postJournalEntry({
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

    this.addAudit('create', 'Depreciation', `Ran depreciation for ${month}: ${totalDep}`);
    this.save();
    return { month, total: totalDep };
  }

  disposeAsset(id, data) {
    const asset = this.data.assets.find((a) => a._id === id);
    if (!asset) throw new Error('Asset not found');

    const proceeds = Number(data.proceeds) || 0;
    const bankAcc = this.findAccount(data.account) || this.sysAcc('1010');
    const bookVal = r2(asset.cost - asset.accumulatedDep);
    const gainOrLoss = r2(proceeds - bookVal);

    const faAcc = this.sysAcc('1500');
    const accumDepAcc = this.sysAcc('1590');
    const lines = [
      { account: accumDepAcc, debit: asset.accumulatedDep },
      { account: faAcc, credit: asset.cost },
    ];
    if (proceeds > 0) {
      lines.push({ account: bankAcc, debit: proceeds });
    }
    if (gainOrLoss < 0) {
      lines.push({ account: this.sysAcc('5190'), debit: Math.abs(gainOrLoss), memo: 'Loss on asset disposal' });
    } else if (gainOrLoss > 0) {
      lines.push({ account: this.sysAcc('4000'), credit: gainOrLoss, memo: 'Gain on asset disposal' });
    }

    this.postJournalEntry({
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      voucherType: 'journal',
      narration: `Disposal of asset ${asset.code} - ${asset.name}`,
      reference: `DISP-${asset.code}`,
      lines,
    });

    asset.status = 'disposed';
    this.addAudit('update', 'FixedAsset', `Disposed asset ${asset.code}`);
    this.save();
    return { asset, proceeds, bookVal, gainOrLoss };
  }

  // --- Accounts Management (Chart of Accounts) ---
  getAccounts(filters = {}) {
    let list = this.data.accounts;
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

  createAccount(data) {
    const existing = this.data.accounts.find((a) => a.code === data.code);
    if (existing) throw new Error(`Account code ${data.code} already exists`);

    const account = {
      _id: `acc-${this.data.accounts.length + 1}`,
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

    this.data.accounts.push(account);
    this.addAudit('create', 'Account', `Created account ${account.code} ${account.name}`);
    this.save();
    return account;
  }

  updateAccount(id, data) {
    const acc = this.data.accounts.find((a) => a._id === id);
    if (!acc) throw new Error('Account not found');
    Object.assign(acc, data);
    this.addAudit('update', 'Account', `Updated account ${acc.code} ${acc.name}`);
    this.save();
    return acc;
  }

  deleteAccount(id) {
    const idx = this.data.accounts.findIndex((a) => a._id === id);
    if (idx === -1) throw new Error('Account not found');
    const acc = this.data.accounts[idx];
    if (acc.sysKey) throw new Error('System accounts cannot be deleted');
    if (acc.balance !== 0 || acc.debit !== 0 || acc.credit !== 0) {
      throw new Error('This account has transactions. Deactivate it instead of deleting.');
    }
    this.data.accounts.splice(idx, 1);
    this.addAudit('delete', 'Account', `Deleted account ${acc.code} ${acc.name}`);
    this.save();
    return { ok: true };
  }

  // --- VAT Summary, Register, and Settlement ---
  getVatSummary(from, to) {
    const salesInvs = this.data.invoices.filter((i) => i.type === 'sale' && i.status !== 'void');
    const purchInvs = this.data.invoices.filter((i) => i.type === 'purchase' && i.status !== 'void');
    const validExps = this.data.expenses.filter((e) => e.status === 'posted' && (e.vat || 0) > 0);

    const outTaxable = r2(salesInvs.reduce((s, i) => s + (i.subtotal || 0), 0));
    const outVat = r2(salesInvs.reduce((s, i) => s + (i.vatTotal || 0), 0));

    const inPurchTaxable = r2(purchInvs.reduce((s, i) => s + (i.subtotal || 0), 0));
    const inPurchVat = r2(purchInvs.reduce((s, i) => s + (i.vatTotal || 0), 0));

    const inExpTaxable = r2(validExps.reduce((s, e) => s + (e.amount || 0), 0));
    const inExpVat = r2(validExps.reduce((s, e) => s + (e.vat || 0), 0));

    const totalInputVat = r2(inPurchVat + inExpVat);
    const netPayable = r2(outVat - totalInputVat);

    const vatOutAcc = this.findAccount('2100');
    const vatInAcc = this.findAccount('1300');
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

  getVatRegister() {
    const rows = [];
    for (const i of this.data.invoices) {
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
    for (const e of this.data.expenses) {
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

  settleVat(data) {
    const vatOutAcc = this.sysAcc('2100');
    const vatInAcc = this.sysAcc('1300');
    const outBal = vatOutAcc.balance;
    const inBal = vatInAcc.balance;
    const net = r2(outBal - inBal);

    const bankAcc = this.findAccount(data.account) || this.sysAcc('1010');
    const lines = [
      { account: vatOutAcc, debit: outBal },
      { account: vatInAcc, credit: Math.min(outBal, inBal) },
    ];
    if (net > 0) {
      lines.push({ account: bankAcc, credit: net });
    }

    this.postJournalEntry({
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      voucherType: 'payment',
      narration: `Mushak-9.1 VAT settlement`,
      reference: 'VAT-SETTLE',
      lines,
    });

    return { payable: Math.max(0, net), carryForwardInput: Math.max(0, -net) };
  }

  // --- Dynamic Financial Reports ---
  getTrialBalance(asOf) {
    const rows = this.data.accounts.map((a) => ({
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

  getProfitLoss(from, to) {
    const incomeAccounts = this.data.accounts.filter((a) => a.type === 'income');
    const cogsAccounts = this.data.accounts.filter((a) => a.subType === 'cogs');
    const expenseAccounts = this.data.accounts.filter((a) => a.type === 'expense' && a.subType !== 'cogs');

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
      totalRevenue: totalIncome,
      totalIncome,
      income: { rows: incomeRows, total: totalIncome },
      cogs: { rows: cogsRows, total: totalCogs },
      grossProfit,
      operatingExpenses: { rows: expRows, total: totalExpense },
      netProfit,
    };
  }

  getBalanceSheet(asOf) {
    const assetAccounts = this.data.accounts.filter((a) => a.type === 'asset');
    const liabilityAccounts = this.data.accounts.filter((a) => a.type === 'liability');
    const equityAccounts = this.data.accounts.filter((a) => a.type === 'equity');

    const totalIncome = this.data.accounts.filter((a) => a.type === 'income').reduce((s, a) => s + a.balance, 0);
    const totalExpense = this.data.accounts.filter((a) => a.type === 'expense').reduce((s, a) => s + a.balance, 0);
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
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
      balanced,
    };
  }

  getCashFlow(from, to) {
    const cashAccounts = this.data.accounts.filter((a) => a.subType === 'cash' || a.subType === 'bank');
    const closingCash = r2(cashAccounts.reduce((s, a) => s + a.balance, 0));

    let operatingTotal = 0;
    let financingTotal = 0;
    let investingTotal = 0;

    for (const j of this.data.journal) {
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

  getLedger(accId, from, to) {
    const acc = this.findAccount(accId) || this.data.accounts[0];
    const rows = [];
    let runningBal = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const j of [...this.data.journal].reverse()) {
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

  getBanking() {
    const cashAccounts = this.data.accounts.filter((a) => a.subType === 'cash');
    const bankAccounts = this.data.accounts.filter((a) => a.subType === 'bank');
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

  getStockValuation() {
    const rows = this.data.items.map((i) => {
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

  getAgeing(type, asOf) {
    const isPayable = type === 'payable';
    const targetType = isPayable ? 'purchase' : 'sale';
    const openInvs = this.data.invoices.filter((i) => i.type === targetType && ['unpaid', 'partial'].includes(i.status));

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

  getDashboard() {
    const cashAccounts = this.data.accounts.filter((a) => a.subType === 'cash');
    const bankAccounts = this.data.accounts.filter((a) => a.subType === 'bank');
    const arAcc = this.findAccount('1100');
    const apAcc = this.findAccount('2000');
    const invAcc = this.findAccount('1200');
    const vatOutAcc = this.findAccount('2100');
    const vatInAcc = this.findAccount('1300');

    const cash = r2(cashAccounts.reduce((s, a) => s + a.balance, 0));
    const bank = r2(bankAccounts.reduce((s, a) => s + a.balance, 0));
    const receivables = arAcc ? arAcc.balance : 0;
    const payables = apAcc ? apAcc.balance : 0;
    const inventoryValue = invAcc ? invAcc.balance : 0;
    const vatPayable = r2((vatOutAcc ? vatOutAcc.balance : 0) - (vatInAcc ? vatInAcc.balance : 0));

    const totalIncome = this.data.accounts.filter((a) => a.type === 'income').reduce((s, a) => s + a.balance, 0);
    const totalExpense = this.data.accounts.filter((a) => a.type === 'expense').reduce((s, a) => s + a.balance, 0);
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

    const expAccounts = this.data.accounts.filter((a) => a.type === 'expense' && a.balance > 0);
    const expenseBreakdown = expAccounts.map((a) => ({ name: a.name, amount: a.balance })).sort((a, b) => b.amount - a.amount).slice(0, 6);

    const lowStock = this.data.items.filter((i) => (i.qtyOnHand || 0) <= (i.reorderLevel || 0));
    const tb = this.getTrialBalance();

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

  // --- Export and Import JSON Backup ---
  exportDatabase(user) {
    assertAuthorizedAdmin(user);
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      system: 'EPI Accounts / ERP Management System',
      ...this.data,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `epi_accounts_erp_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    return data;
  }

  importDatabase(jsonStr, user) {
    assertAuthorizedAdmin(user);
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      if (!parsed || !Array.isArray(parsed.accounts)) {
        throw new Error('Invalid ERP backup file structure');
      }
      this.data = {
        accounts: parsed.accounts || [],
        parties: parsed.parties || [],
        items: parsed.items || [],
        invoices: parsed.invoices || [],
        expenses: parsed.expenses || [],
        payments: parsed.payments || [],
        journal: parsed.journal || [],
        stockMovements: parsed.stockMovements || [],
        employees: parsed.employees || [],
        payrollRuns: parsed.payrollRuns || [],
        assets: parsed.assets || [],
        auditLogs: parsed.auditLogs || [],
        settings: parsed.settings || this.data.settings,
        users: parsed.users || this.data.users,
      };
      this.save();
      return { success: true, count: this.data.invoices.length + this.data.parties.length };
    } catch (e) {
      throw new Error('ERP Backup Import Failed: ' + e.message);
    }
  }
}

export const erpStore = new BrowserErpEngine();

/**
 * Handle API calls directly in the browser.
 * Matches all REST routes called by `api.js`.
 */
export async function erpStorageRouter(method, path, body = {}, params = {}) {
  const m = method.toUpperCase();
  const cleanPath = path.replace(/^\/api/, '');

  // Auth routes
  if (cleanPath === '/auth/status') {
    return { needsSetup: false };
  }

  if (cleanPath === '/auth/login' || cleanPath === '/auth/setup') {
    const u = erpStore.data.users[0];
    const token = 'erp_token_' + Date.now();
    return {
      token,
      refreshToken: 'erp_refresh_' + Date.now(),
      user: {
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        permissions: u.permissions || adminPermissions,
      },
    };
  }

  if (cleanPath === '/auth/refresh') {
    const u = erpStore.data.users[0];
    return {
      token: 'erp_token_' + Date.now(),
      refreshToken: 'erp_refresh_' + Date.now(),
      user: {
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        permissions: u.permissions || adminPermissions,
      },
    };
  }

  if (cleanPath === '/auth/me') {
    let u = null;
    try {
      const raw = (typeof localStorage !== 'undefined' && localStorage.getItem('epi_central_user')) || null;
      if (raw) u = JSON.parse(raw);
    } catch (_) {}
    if (!u) {
      u = erpStore.data.users[0] || { name: 'EPI Accountant', role: 'admin' };
    }
    return {
      user: {
        id: u._id || u.id || u.userId,
        name: u.name,
        email: u.email,
        role: u.role === 'superadmin' ? 'admin' : (u.role || 'accountant'),
        departments: u.departments || ['accounts'],
        permissions: u.permissions || adminPermissions,
      },
    };
  }

  // Dashboard
  if (cleanPath === '/dashboard/summary' || cleanPath === '/reports/dashboard' || cleanPath === '/dashboard') {
    return erpStore.getDashboard();
  }

  // Settings
  if (cleanPath === '/settings') {
    if (m === 'PUT') {
      Object.assign(erpStore.data.settings, body);
      erpStore.save();
      return erpStore.data.settings;
    }
    return erpStore.data.settings;
  }

  // Accounts
  if (cleanPath === '/accounts') {
    if (m === 'POST') return erpStore.createAccount(body);
    return erpStore.getAccounts(params);
  }

  const accMatch = cleanPath.match(/^\/accounts\/([^\/]+)$/);
  if (accMatch) {
    if (m === 'PUT') return erpStore.updateAccount(accMatch[1], body);
    if (m === 'DELETE') return erpStore.deleteAccount(accMatch[1]);
  }

  // Parties
  if (cleanPath === '/parties') {
    if (m === 'POST') return erpStore.createParty(body);
    return erpStore.getParties(params.type, params.q);
  }

  const partyStmtMatch = cleanPath.match(/^\/parties\/([^\/]+)\/statement$/);
  if (partyStmtMatch && m === 'GET') {
    return erpStore.getPartyStatement(partyStmtMatch[1]);
  }

  const partyMatch = cleanPath.match(/^\/parties\/([^\/]+)$/);
  if (partyMatch) {
    if (m === 'GET') return erpStore.getParty(partyMatch[1]);
    if (m === 'PUT') return erpStore.updateParty(partyMatch[1], body);
    if (m === 'DELETE') return erpStore.deleteParty(partyMatch[1]);
  }

  // Items
  if (cleanPath === '/items') {
    if (m === 'POST') return erpStore.createItem(body);
    return erpStore.getItems(params.q, params.category);
  }

  const itemMatch = cleanPath.match(/^\/items\/([^\/]+)$/);
  if (itemMatch) {
    if (m === 'GET') return erpStore.getItem(itemMatch[1]);
    if (m === 'PUT') return erpStore.updateItem(itemMatch[1], body);
    if (m === 'DELETE') return erpStore.deleteItem(itemMatch[1]);
  }

  // Stock adjustments and movements
  if (cleanPath === '/stock-adjustments' && m === 'POST') {
    return erpStore.adjustStock(body);
  }

  if (cleanPath === '/stock-movements') {
    return erpStore.getStockMovements(params);
  }

  // Invoices (Sales & Purchase)
  if (cleanPath === '/sales-invoices') {
    if (m === 'POST') return erpStore.createInvoice('sale', body);
    return erpStore.getInvoices('sale', params);
  }

  const salesInvVoidMatch = cleanPath.match(/^\/sales-invoices\/([^\/]+)\/void$/);
  if (salesInvVoidMatch && m === 'POST') {
    return erpStore.voidInvoice(salesInvVoidMatch[1], body.reason);
  }

  const salesInvMatch = cleanPath.match(/^\/sales-invoices\/([^\/]+)$/);
  if (salesInvMatch && m === 'GET') {
    return erpStore.getInvoice(salesInvMatch[1]);
  }

  if (cleanPath === '/purchase-bills' || cleanPath === '/purchase-invoices') {
    if (m === 'POST') return erpStore.createInvoice('purchase', body);
    return erpStore.getInvoices('purchase', params);
  }

  const purchInvVoidMatch = cleanPath.match(/^\/(?:purchase-bills|purchase-invoices)\/([^\/]+)\/void$/);
  if (purchInvVoidMatch && m === 'POST') {
    return erpStore.voidInvoice(purchInvVoidMatch[1], body.reason);
  }

  const purchInvMatch = cleanPath.match(/^\/(?:purchase-bills|purchase-invoices)\/([^\/]+)$/);
  if (purchInvMatch && m === 'GET') {
    return erpStore.getInvoice(purchInvMatch[1]);
  }

  // Payments
  if (cleanPath === '/payments') {
    return erpStore.getPayments(params);
  }

  if (cleanPath === '/payments/receipt' && m === 'POST') {
    return erpStore.createPayment('receipt', body);
  }

  if (cleanPath === '/payments/payment' && m === 'POST') {
    return erpStore.createPayment('payment', body);
  }

  const payVoidMatch = cleanPath.match(/^\/payments\/([^\/]+)\/void$/);
  if (payVoidMatch && m === 'POST') {
    return erpStore.voidPayment(payVoidMatch[1], body.reason);
  }

  // Expenses
  if (cleanPath === '/expenses') {
    if (m === 'POST') return erpStore.createExpense(body);
    return erpStore.getExpenses(params);
  }

  const expVoidMatch = cleanPath.match(/^\/expenses\/([^\/]+)\/void$/);
  if (expVoidMatch && m === 'POST') {
    return erpStore.voidExpense(expVoidMatch[1], body.reason);
  }

  // Journal
  if (cleanPath === '/journal') {
    if (m === 'POST') return erpStore.postJournalEntry(body);
    return erpStore.data.journal;
  }

  const jvVoidMatch = cleanPath.match(/^\/journal\/([^\/]+)\/void$/);
  if (jvVoidMatch && m === 'POST') {
    return erpStore.voidJournalEntry(jvVoidMatch[1], body.reason);
  }

  // Employees & Payroll
  if (cleanPath === '/employees') {
    if (m === 'POST') return erpStore.createEmployee(body);
    return erpStore.getEmployees();
  }

  const empMatch = cleanPath.match(/^\/employees\/([^\/]+)$/);
  if (empMatch) {
    if (m === 'PUT') return erpStore.updateEmployee(empMatch[1], body);
    if (m === 'DELETE') return erpStore.deleteEmployee(empMatch[1]);
  }

  if (cleanPath === '/payroll') {
    return erpStore.getPayroll();
  }

  if (cleanPath === '/payroll/process' && m === 'POST') {
    return erpStore.processPayroll(body.month);
  }

  const payPayMatch = cleanPath.match(/^\/payroll\/([^\/]+)\/pay$/);
  if (payPayMatch && m === 'POST') {
    return erpStore.payPayroll(payPayMatch[1], body);
  }

  const payVoidPayrollMatch = cleanPath.match(/^\/payroll\/([^\/]+)\/void$/);
  if (payVoidPayrollMatch && m === 'POST') {
    return erpStore.voidPayroll(payVoidPayrollMatch[1], body?.reason);
  }

  // Fixed Assets
  if (cleanPath === '/assets') {
    if (m === 'POST') return erpStore.createAsset(body);
    return erpStore.getAssets();
  }

  if (cleanPath === '/assets/depreciate' && m === 'POST') {
    return erpStore.runDepreciation(body.month);
  }

  const assetDispMatch = cleanPath.match(/^\/assets\/([^\/]+)\/dispose$/);
  if (assetDispMatch && m === 'POST') {
    return erpStore.disposeAsset(assetDispMatch[1], body);
  }

  // VAT
  if (cleanPath === '/vat/summary') {
    return erpStore.getVatSummary(params.from, params.to);
  }

  if (cleanPath === '/vat/register') {
    return erpStore.getVatRegister();
  }

  if (cleanPath === '/vat/settle' && m === 'POST') {
    return erpStore.settleVat(body);
  }

  // Reports
  if (cleanPath === '/reports/trial-balance') {
    return erpStore.getTrialBalance(params.asOf);
  }

  if (cleanPath === '/reports/profit-loss') {
    return erpStore.getProfitLoss(params.from, params.to);
  }

  if (cleanPath === '/reports/balance-sheet') {
    return erpStore.getBalanceSheet(params.asOf);
  }

  if (cleanPath === '/reports/cash-flow') {
    return erpStore.getCashFlow(params.from, params.to);
  }

  if (cleanPath === '/reports/general-ledger' || cleanPath === '/reports/ledger') {
    return erpStore.getLedger(params.account, params.from, params.to);
  }

  if (cleanPath === '/reports/stock-valuation' || cleanPath === '/stock-valuation') {
    return erpStore.getStockValuation();
  }

  if (cleanPath === '/reports/ageing' || cleanPath === '/ageing') {
    return erpStore.getAgeing(params.type, params.asOf);
  }

  // Banking
  if (cleanPath === '/banking' || cleanPath === '/reports/banking') {
    return erpStore.getBanking();
  }

  // Users & Audit
  if (cleanPath === '/users') {
    return erpStore.data.users;
  }

  if (cleanPath === '/audit' || cleanPath === '/audit-logs') {
    return erpStore.data.auditLogs;
  }

  // Unhandled
  return undefined;
}
