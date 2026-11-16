import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { resetMockStore } from '../src/services/demoMock.js';

test('Comprehensive Manual CRUD across all ERP modules', async (t) => {
  resetMockStore();

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const url = (p) => `http://127.0.0.1:${port}${p}`;

  t.after(() => new Promise((resolve) => server.close(resolve)));

  // Login
  const loginRes = await fetch(url('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@epiups.com.bd', password: 'ChangeMe#2026' }),
  });
  const { token } = await loginRes.json();
  const auth = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 1. Party CRUD (Add, Edit, Delete when clean)
  const partyRes = await fetch(url('/api/parties'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ type: 'customer', name: 'Temporary Customer Ltd', phone: '+880 1555-111222' }),
  });
  assert.equal(partyRes.status, 201);
  const party = await partyRes.json();

  // Edit party
  const editPartyRes = await fetch(url(`/api/parties/${party._id}`), {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ name: 'Updated Customer Ltd', phone: '+880 1555-333444' }),
  });
  assert.equal(editPartyRes.status, 200);
  const updatedParty = await editPartyRes.json();
  assert.equal(updatedParty.name, 'Updated Customer Ltd');

  // Delete party (succeeds because no transactions exist)
  const delPartyRes = await fetch(url(`/api/parties/${party._id}`), { method: 'DELETE', headers: auth });
  assert.equal(delPartyRes.status, 200);

  // 2. Item CRUD & Stock Adjustment
  const itemRes = await fetch(url('/api/items'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ sku: 'TEMP-SKU-1', name: 'Test Battery 12V', salePrice: 3000 }),
  });
  assert.equal(itemRes.status, 201);
  const item = await itemRes.json();

  // Stock Adjustment (+10 units)
  const adjRes = await fetch(url('/api/stock-adjustments'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      item: item._id,
      direction: 'in',
      qty: 10,
      unitCost: 1800,
      note: 'Initial count surplus',
    }),
  });
  assert.equal(adjRes.status, 201);

  // Verify stock increased
  const itemCheck = await (await fetch(url(`/api/items/${item._id}`), { headers: auth })).json();
  assert.equal(itemCheck.qtyOnHand, 10);
  assert.equal(itemCheck.avgCost, 1800);

  // 3. Banking & Journal: Fund Transfer (Contra)
  // Deposit 500,000 capital into Bank
  const capitalRes = await fetch(url('/api/journal'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      voucherType: 'journal',
      narration: "Owner's initial capital",
      lines: [
        { account: 'acc-2', debit: 500000 },  // Bank (1010)
        { account: 'acc-9', credit: 500000 }, // Capital (3000)
      ],
    }),
  });
  assert.equal(capitalRes.status, 201);

  // Transfer 50,000 from Bank to Cash in Hand
  const transferRes = await fetch(url('/api/journal'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      voucherType: 'contra',
      narration: 'Cash withdrawal for petty expenses',
      lines: [
        { account: 'acc-1', debit: 50000 },  // Cash in Hand
        { account: 'acc-2', credit: 50000 }, // Bank
      ],
    }),
  });
  assert.equal(transferRes.status, 201);

  // Check Banking report
  const bankReport = await (await fetch(url('/api/reports/banking'), { headers: auth })).json();
  assert.equal(bankReport.cash, 50000);
  assert.equal(bankReport.bank, 450000);
  assert.equal(bankReport.total, 500000);

  // 4. Employees & Payroll
  const empRes = await fetch(url('/api/employees'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      empId: 'EMP-101',
      name: 'Rahim Ahmed',
      designation: 'Service Engineer',
      basic: 30000,
      houseRent: 15000,
      medical: 5000,
      conveyance: 2000,
      taxDeduction: 1000,
    }),
  });
  assert.equal(empRes.status, 201);
  const employee = await empRes.json();
  assert.equal(employee.empId, 'EMP-101');

  // Process payroll
  const prRes = await fetch(url('/api/payroll/process'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ month: '2026-11' }),
  });
  assert.equal(prRes.status, 201);
  const payrollRun = await prRes.json();
  assert.equal(payrollRun.totalGross, 52000); // 30k+15k+5k+2k
  assert.equal(payrollRun.totalTax, 1000);
  assert.equal(payrollRun.totalNet, 51000);

  // Pay payroll from Bank
  const payPrRes = await fetch(url(`/api/payroll/${payrollRun._id}/pay`), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ account: 'acc-2', date: new Date().toISOString() }),
  });
  assert.equal(payPrRes.status, 200);
  const paidPr = await payPrRes.json();
  assert.equal(paidPr.status, 'paid');

  // 5. Fixed Assets
  const assetRes = await fetch(url('/api/assets'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Oscilloscope 100MHz',
      category: 'Lab Equipment',
      cost: 60000,
      salvage: 0,
      usefulLifeYears: 5,
      method: 'SL',
      paidFrom: 'acc-2', // Paid from bank
    }),
  });
  assert.equal(assetRes.status, 201);
  const asset = await assetRes.json();
  assert.ok(asset.code.startsWith('FA-'));

  // Run depreciation
  const depRes = await fetch(url('/api/assets/depreciate'), {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ month: '2026-11' }),
  });
  assert.equal(depRes.status, 201);
  const dep = await depRes.json();
  assert.equal(dep.total, 1000); // 60,000 / (5 * 12) = 1,000/month

  // 6. Settings Update
  const setRes = await fetch(url('/api/settings'), {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ companyName: 'EPI Power Bangladesh Ltd' }),
  });
  assert.equal(setRes.status, 200);
  const settings = await setRes.json();
  assert.equal(settings.companyName, 'EPI Power Bangladesh Ltd');

  // 7. Verify General Ledger Drilldown
  const ledgerRes = await fetch(url('/api/reports/ledger?account=acc-2'), { headers: auth });
  assert.equal(ledgerRes.status, 200);
  const ledger = await ledgerRes.json();
  assert.ok(ledger.rows.length > 0);
  assert.equal(ledger.closing, ledger.account.balance);

  // 8. Verify Overall Balance Sheet is 100% in Balance
  const bsRes = await fetch(url('/api/reports/balance-sheet'), { headers: auth });
  const bs = await bsRes.json();
  assert.equal(bs.balanced, true);
  assert.equal(bs.totalAssets, bs.totalLiabilitiesAndEquity);
});

