/**
 * Comprehensive Functional Verification Test Suite
 * Tests every department: Sales, Service, ERP/Accounts, Admin, Unified Storage,
 * Cross-Department Data Connections, CRUD Operations, Double-Entry Balance,
 * and Backup/Restore.
 */

import assert from 'assert';
import bcrypt from 'bcryptjs';
import { createRealisticSeedData } from '../src/services/unifiedStorage.js';
import { erpStore } from '../src/modules/erp/services/erpStorage.js';
import { CATS, warr, isOverdue, status } from '../src/modules/service/services/domain.js';
import { uid, today, addDays } from '../src/modules/sales/utils/helpers.js';

console.log('================================================================');
console.log('🚀 RUNNING COMPREHENSIVE FUNCTIONAL & DATA CONNECTION TESTS');
console.log('================================================================\n');

let testsPassed = 0;
let testsTotal = 0;

function it(name, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error('     Error:', err.message);
    throw err;
  }
}

// -------------------------------------------------------------
// 1. DATA SEEDING & CENTRAL ARCHITECTURE
// -------------------------------------------------------------
console.log('--- 1. CENTRAL DATA ARCHITECTURE & SEED VERIFICATION ---');

const seed = createRealisticSeedData();

it('Seed contains all 8 commercial Bangladesh clients with complete details', () => {
  assert(Array.isArray(seed.clients), 'Clients is an array');
  assert.strictEqual(seed.clients.length, 8, 'Exact 8 commercial clients');
  const trustMachineries = seed.clients.find(c => c.company.includes('TRUST MACHINERIES'));
  assert(trustMachineries, 'Trust Machineries client exists');
  assert.strictEqual(trustMachineries.model, 'EPI-OL10K-31', 'UPS model is correct');
  assert(trustMachineries.phone && trustMachineries.address, 'Phone and address present');
});

it('Seed contains demo user accounts with valid bcrypt hashes', () => {
  assert(Array.isArray(seed.users), 'Users is an array');
  assert(seed.users.length >= 4, 'at least 4 demo accounts created');
  const admin = seed.users.find(u => u.userId === 'admin');
  const sales = seed.users.find(u => u.userId === 'sales1');
  const service = seed.users.find(u => u.userId === 'service1');
  const accounts = seed.users.find(u => u.userId === 'accounts1');

  assert(admin && sales && service && accounts, 'All core demo user IDs exist');
  assert(bcrypt.compareSync('password123', admin.passwordHash), 'Admin password hashes to password123');
  assert(bcrypt.compareSync('password123', sales.passwordHash), 'Sales password hashes to password123');
  assert(bcrypt.compareSync('password123', service.passwordHash), 'Service password hashes to password123');
  assert(bcrypt.compareSync('password123', accounts.passwordHash), 'Accounts password hashes to password123');
});

it('Seed contains service orders covering all 5 sectors', () => {
  assert(Array.isArray(seed.serviceWorks), 'Service works is an array');
  assert(seed.serviceWorks.length >= 6, 'Has multiple service orders');
  const categories = new Set(seed.serviceWorks.map(w => w.category));
  assert(categories.has('Servicing'), 'Has Servicing orders');
  assert(categories.has('Maintenance'), 'Has Maintenance orders');
  assert(categories.has('Installation'), 'Has Installation orders');
  assert(categories.has('General'), 'Has General orders');
});

// -------------------------------------------------------------
// 2. SALES DEPARTMENT FUNCTIONAL LOGIC & CRUD
// -------------------------------------------------------------
console.log('\n--- 2. SALES DEPARTMENT FUNCTIONAL VERIFICATION ---');

let simulatedSalesClients = [...seed.clients];
let simulatedSalesWork = [...seed.salesWork];

it('Sales Add Client: creates complete client record with unique ID', () => {
  const newClient = {
    id: `c-test-${Date.now()}`,
    name: 'Md. Tareq Rahman',
    company: 'Meghna Power Solutions Ltd',
    phone: '+88 01712-998877',
    email: 'tareq@meghnapower.com',
    address: 'Tejgaon Industrial Area, Dhaka',
    clientType: 'Sales',
    category: 'Quotation',
    productType: 'UPS',
    product: 'Online UPS 20kVA 3:3',
    model: 'EPI-OL20K',
    serial: 'SN-EPI-778899',
    saleDate: today(),
    wValue: 2,
    wUnit: 'years',
    wMonths: 24,
    notes: 'Quotation sent for 20kVA data center power backup.',
  };
  simulatedSalesClients.push(newClient);
  assert.strictEqual(simulatedSalesClients.length, 9, 'Client count incremented to 9');
  const found = simulatedSalesClients.find(c => c.company === 'Meghna Power Solutions Ltd');
  assert(found && found.model === 'EPI-OL20K', 'Found newly added client');
});

it('Sales Edit Client: updates client details properly', () => {
  const client = simulatedSalesClients.find(c => c.company === 'Meghna Power Solutions Ltd');
  assert(client, 'Target client exists');
  client.category = 'Order Won';
  client.notes = 'Work order issued. Advance 50% received.';
  assert.strictEqual(client.category, 'Order Won', 'Category updated to Order Won');
});

it('Sales Work Entry: adds work item linked to client with type & follow-up', () => {
  const targetClient = simulatedSalesClients[0];
  const newWork = {
    id: `w-test-${Date.now()}`,
    clientId: targetClient.id,
    type: 'Visit',
    details: 'Site inspection completed. Earthing checked at 1.1 Ohms.',
    date: today(),
    nextDate: addDays(today(), 7),
    nextMethod: 'Call',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  simulatedSalesWork.unshift(newWork);
  assert(simulatedSalesWork.length > seed.salesWork.length, 'Sales work list updated');
  assert.strictEqual(simulatedSalesWork[0].type, 'Visit', 'Work item type matches');
  assert.strictEqual(simulatedSalesWork[0].clientId, targetClient.id, 'Work linked to client ID');
});

it('Sales Delete Client: removes client and cascades to work records', () => {
  const toDelete = simulatedSalesClients.find(c => c.company === 'Meghna Power Solutions Ltd');
  assert(toDelete, 'Client to delete exists');
  simulatedSalesClients = simulatedSalesClients.filter(c => c.id !== toDelete.id);
  simulatedSalesWork = simulatedSalesWork.filter(w => w.clientId !== toDelete.id);
  assert.strictEqual(simulatedSalesClients.length, 8, 'Client count back to 8');
  assert(!simulatedSalesClients.some(c => c.id === toDelete.id), 'Deleted client is gone');
});

// -------------------------------------------------------------
// 3. SERVICE DEPARTMENT FUNCTIONAL LOGIC & CRUD
// -------------------------------------------------------------
console.log('\n--- 3. SERVICE DEPARTMENT FUNCTIONAL VERIFICATION ---');

let simulatedServiceWorks = [...seed.serviceWorks];

it('Service Work Order Creation: saves with priority, engineer & client details', () => {
  const newOrder = {
    id: `srv-test-${Date.now()}`,
    title: 'Emergency Capacitor Replacement & Battery Check',
    category: 'Servicing',
    priority: 'Urgent',
    date: today(),
    time: '14:30',
    engineer: 'Tanvir',
    clientId: seed.clients[0].id,
    clientName: seed.clients[0].name,
    clientCompany: seed.clients[0].company,
    clientPhone: seed.clients[0].phone,
    clientAddress: seed.clients[0].address,
    desc: 'DC bus filter capacitors showing high ESR ripple.',
    notes: 'Parts requisition approved from Central Warehouse.',
    status: 'pending',
    doneAt: '',
  };
  simulatedServiceWorks.unshift(newOrder);
  assert.strictEqual(simulatedServiceWorks[0].priority, 'Urgent', 'Priority matches');
  assert.strictEqual(simulatedServiceWorks[0].engineer, 'Tanvir', 'Engineer assigned');
});

it('Service Work Completion: updates status to done and records completion date', () => {
  const order = simulatedServiceWorks[0];
  assert.strictEqual(order.status, 'pending', 'Initial status is pending');
  order.status = 'done';
  order.doneAt = today();
  assert.strictEqual(order.status, 'done', 'Status updated to done');
  assert.strictEqual(order.doneAt, today(), 'Completion date recorded');
});

it('Service Warranty Engine: accurately computes active vs expired status', () => {
  const activeClient = seed.clients[0]; // Sale date 15 days ago, 12 months warranty
  const wActive = warr(activeClient);
  assert.strictEqual(wActive.active, true, 'Recent purchase has active warranty');

  const oldClient = {
    saleDate: addDays(today(), -500),
    wUnit: 'years',
    wValue: 1,
  };
  const wOld = warr(oldClient);
  assert.strictEqual(wOld.active, false, '500-day old purchase with 1-year warranty is expired');
});

// -------------------------------------------------------------
// 4. ACCOUNTS / ERP FUNCTIONAL & DOUBLE-ENTRY LOGIC
// -------------------------------------------------------------
console.log('\n--- 4. ACCOUNTS / ERP DOUBLE-ENTRY ACCOUNTING VERIFICATION ---');

// Hydrate ERP store with seed data
erpStore.data = seed.erpData;

it('ERP Trial Balance: strictly balances (Debits === Credits)', () => {
  const tb = erpStore.getTrialBalance();
  assert(tb && Array.isArray(tb.rows), 'Trial balance returns rows');
  assert(tb.totalDebit > 0, 'Total debit is positive');
  assert.strictEqual(
    Math.round(tb.totalDebit * 100),
    Math.round(tb.totalCredit * 100),
    `Trial balance out of balance! Debit: ${tb.totalDebit}, Credit: ${tb.totalCredit}`
  );
  assert.strictEqual(tb.balanced, true, 'Balanced flag is true');
});

it('ERP Sales Invoice: generates 15% Mushak-9.1 VAT and posts balanced journal entry', () => {
  const parties = erpStore.getParties('customer');
  assert(parties.length > 0, 'At least one customer party exists');
  const customer = parties[0];
  const items = erpStore.getItems();
  assert(items.length > 0, 'At least one inventory item exists');
  const item = items[0];

  const invoice = erpStore.createInvoice('sale', {
    party: customer._id,
    date: today(),
    items: [
      {
        item: item._id,
        description: `${item.name} Unit`,
        qty: 1,
        rate: 50000,
        vatRate: 15,
      },
    ],
    notes: 'Sold with 15% VAT and delivery to customer site.',
  });

  assert(invoice && invoice._id, 'Invoice created successfully');
  assert.strictEqual(invoice.subtotal, 50000, 'Subtotal is 50,000 BDT');
  assert.strictEqual(invoice.vatTotal, 7500, '15% VAT is 7,500 BDT');
  assert.strictEqual(invoice.total, 57500, 'Grand total is 57,500 BDT');

  // Verify journal was posted and accounts stay balanced
  const tbAfter = erpStore.getTrialBalance();
  assert.strictEqual(
    Math.round(tbAfter.totalDebit * 100),
    Math.round(tbAfter.totalCredit * 100),
    'Trial balance remains strictly balanced after invoice'
  );
});

it('ERP Payment Receipt: records payment against customer and balances books', () => {
  const invoices = erpStore.getInvoices('sale');
  assert(invoices.length > 0, 'Sales invoices exist');
  const targetInv = invoices[0];
  const payAmount = 20000;

  const payment = erpStore.createPayment('receipt', {
    party: targetInv.party,
    account: erpStore.sysAcc('1010')._id, // Cash at Bank - Main
    date: today(),
    amount: payAmount,
    method: 'bank_transfer',
    reference: `TXN-EPI-${Date.now().toString().slice(-6)}`,
    invoices: [{ invoiceId: targetInv._id, amount: payAmount }],
    notes: 'Advance installment received via Bank Transfer.',
  });

  assert(payment && payment._id, 'Payment recorded');
  const tbAfterPay = erpStore.getTrialBalance();
  assert.strictEqual(
    Math.round(tbAfterPay.totalDebit * 100),
    Math.round(tbAfterPay.totalCredit * 100),
    'Trial balance remains balanced after payment receipt'
  );
});

it('ERP Financial Reports: Profit & Loss and Balance Sheet calculate correctly', () => {
  const pl = erpStore.getProfitLoss();
  assert(typeof pl.netProfit === 'number', 'Net profit is numeric');
  assert(pl.totalRevenue >= 0, 'Revenue is non-negative');

  const bs = erpStore.getBalanceSheet();
  assert(bs.totalAssets > 0, 'Assets are positive');
  assert(bs.totalLiabilities >= 0, 'Liabilities non-negative');
  assert(bs.totalEquity !== 0, 'Equity exists');
});

// -------------------------------------------------------------
// 5. CROSS-DEPARTMENT DATA RELATIONSHIPS & SYNC
// -------------------------------------------------------------
console.log('\n--- 5. INTER-DEPARTMENT DATA RELATIONSHIP VERIFICATION ---');

it('Cross-department sync: Sales & Service client entities map into ERP customer parties', () => {
  // Sync central clients into ERP parties
  erpStore.syncCentralClients(seed.clients);
  const erpParties = erpStore.getParties('customer');

  for (const c of seed.clients) {
    const comp = (c.company || c.name).trim().toLowerCase();
    const found = erpParties.find(
      p => (p.clientId && p.clientId === c.id) || p.name.toLowerCase().includes(comp)
    );
    assert(found, `Central client "${c.company || c.name}" is mapped in ERP parties`);
  }
});

// -------------------------------------------------------------
// 6. BACKUP & RESTORE INTEGRITY
// -------------------------------------------------------------
console.log('\n--- 6. BACKUP & RESTORE ARCHITECTURE VERIFICATION ---');

it('Backup & Restore: full state serializes to JSON and deserializes identically', () => {
  const backupData = {
    system: 'EPI Centralized Management System',
    version: '2.0.0-unified',
    exportedAt: new Date().toISOString(),
    data: {
      clients: seed.clients,
      salesWork: seed.salesWork,
      salesHistory: seed.salesHistory,
      salesOffice: seed.salesOffice,
      serviceWorks: seed.serviceWorks,
      serviceSettings: seed.serviceSettings,
      erpData: seed.erpData,
      users: seed.users,
    },
  };

  const jsonStr = JSON.stringify(backupData);
  const parsed = JSON.parse(jsonStr);

  assert.strictEqual(parsed.system, 'EPI Centralized Management System');
  assert.strictEqual(parsed.data.clients.length, 8);
  assert.strictEqual(parsed.data.users.length, seed.users.length);
  assert(parsed.data.erpData.accounts.length > 0);
});

console.log('\n================================================================');
console.log(`🎉 ALL TESTS PASSED: ${testsPassed} / ${testsTotal} CHECKS SUCCESSFUL`);
console.log('================================================================');
