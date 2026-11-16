import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { resetMockStore } from '../src/services/demoMock.js';

test('Authentication and Full Manual ERP Workflow Integration', async (t) => {
  resetMockStore();

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const url = (p) => `http://127.0.0.1:${port}${p}`;

  t.after(() => new Promise((resolve) => server.close(resolve)));

  // 1. Login with demo admin
  const loginRes = await fetch(url('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@epiups.com.bd', password: 'AnyPasswordInDemo' }),
  });

  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token, 'Must return an access token');
  assert.ok(loginData.refreshToken, 'Must return a refresh token');
  assert.equal(loginData.user.email, 'admin@epiups.com.bd');
  assert.equal(loginData.user.role, 'admin');

  const token = loginData.token;
  const refreshToken = loginData.refreshToken;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. /api/auth/me returns current user
  const meRes = await fetch(url('/api/auth/me'), { headers: authHeaders });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.user.email, 'admin@epiups.com.bd');

  // 3. /api/auth/refresh renews tokens
  const refreshRes = await fetch(url('/api/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  assert.equal(refreshRes.status, 200);
  const refreshData = await refreshRes.json();
  assert.ok(refreshData.token, 'Must return new access token');
  assert.ok(refreshData.refreshToken, 'Must return new refresh token');

  // 4. Initial clean slate check (forms ready for manual input)
  const initPartiesRes = await fetch(url('/api/parties'), { headers: authHeaders });
  assert.equal(initPartiesRes.status, 200);
  const initParties = await initPartiesRes.json();
  assert.ok(Array.isArray(initParties));
  assert.equal(initParties.length, 0, 'Parties start clean with 0 records');

  const initItemsRes = await fetch(url('/api/items'), { headers: authHeaders });
  assert.equal(initItemsRes.status, 200);
  const initItems = await initItemsRes.json();
  assert.ok(Array.isArray(initItems));
  assert.equal(initItems.length, 0, 'Items start clean with 0 records');

  // 5. Manual Data Entry: Customer & Supplier
  const custRes = await fetch(url('/api/parties'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'customer',
      name: 'Dhaka Telecom Ltd',
      phone: '+880 1711-234567',
      email: 'billing@dhakatelecom.bd',
      creditDays: 30,
    }),
  });
  assert.equal(custRes.status, 201);
  const customer = await custRes.json();
  assert.equal(customer.name, 'Dhaka Telecom Ltd');
  assert.equal(customer.type, 'customer');

  const suppRes = await fetch(url('/api/parties'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'supplier',
      name: 'EPI Power Systems Asia Ltd',
      phone: '+880 1911-888999',
      creditDays: 45,
    }),
  });
  assert.equal(suppRes.status, 201);
  const supplier = await suppRes.json();
  assert.equal(supplier.name, 'EPI Power Systems Asia Ltd');

  // Verify parties appear in listing
  const partiesListRes = await fetch(url('/api/parties'), { headers: authHeaders });
  const partiesList = await partiesListRes.json();
  assert.equal(partiesList.length, 2);

  // 6. Manual Data Entry: Inventory Item with Opening Stock
  const itemRes = await fetch(url('/api/items'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      sku: 'EPI-UPS-1KVA',
      name: 'EPI Online UPS 1KVA / 900W',
      category: 'Online UPS',
      unit: 'pcs',
      salePrice: 28500,
      vatRate: 15,
      reorderLevel: 5,
      openingQty: 10,
      openingCost: 20000,
    }),
  });
  assert.equal(itemRes.status, 201);
  const item = await itemRes.json();
  assert.equal(item.sku, 'EPI-UPS-1KVA');
  assert.equal(item.qtyOnHand, 10);
  assert.equal(item.avgCost, 20000);

  // 7. Manual Data Entry: Purchase Bill
  const billRes = await fetch(url('/api/purchase-bills'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      party: supplier._id,
      date: new Date().toISOString(),
      lines: [
        {
          item: item._id,
          description: item.name,
          qty: 5,
          rate: 22000,
          vatRate: 15,
        },
      ],
    }),
  });
  assert.equal(billRes.status, 201);
  const bill = await billRes.json();
  assert.ok(bill.number.startsWith('BILL-'));
  assert.equal(bill.subtotal, 110000);
  assert.equal(bill.vatTotal, 16500);
  assert.equal(bill.total, 126500);

  // Verify stock increased: 10 opening + 5 purchased = 15
  const itemAfterBillRes = await fetch(url(`/api/items/${item._id}`), { headers: authHeaders });
  const itemAfterBill = await itemAfterBillRes.json();
  assert.equal(itemAfterBill.qtyOnHand, 15);

  // 8. Manual Data Entry: Sales Invoice
  const invRes = await fetch(url('/api/sales-invoices'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      party: customer._id,
      date: new Date().toISOString(),
      lines: [
        {
          item: item._id,
          description: item.name,
          qty: 3,
          rate: 28500,
          vatRate: 15,
        },
      ],
    }),
  });
  assert.equal(invRes.status, 201);
  const invoice = await invRes.json();
  assert.ok(invoice.number.startsWith('INV-'));
  assert.equal(invoice.subtotal, 85500);
  assert.equal(invoice.vatTotal, 12825);
  assert.equal(invoice.total, 98325);

  // Verify stock decreased: 15 - 3 sold = 12
  const itemAfterSaleRes = await fetch(url(`/api/items/${item._id}`), { headers: authHeaders });
  const itemAfterSale = await itemAfterSaleRes.json();
  assert.equal(itemAfterSale.qtyOnHand, 12);

  // 9. Manual Data Entry: Customer Receipt Payment
  const payRes = await fetch(url('/api/payments/receipt'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      party: customer._id,
      account: 'acc-2', // Bank account
      amount: 50000,
      allocations: [{ invoice: invoice._id, amount: 50000 }],
    }),
  });
  assert.equal(payRes.status, 201);
  const payment = await payRes.json();
  assert.ok(payment.number.startsWith('REC-'));
  assert.equal(payment.amount, 50000);

  // Verify invoice updated to partial paid: 98325 - 50000 = 48325 remaining
  const invAfterPayRes = await fetch(url(`/api/sales-invoices/${invoice._id}`), { headers: authHeaders });
  const invAfterPay = await invAfterPayRes.json();
  assert.equal(invAfterPay.paid, 50000);
  assert.equal(invAfterPay.status, 'partial');

  // 10. Manual Data Entry: Expense
  const expRes = await fetch(url('/api/expenses'), {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      expenseAccount: 'acc-21', // Office Rent
      paidFrom: 'acc-2',       // Bank
      amount: 15000,
      vat: 0,
      payee: 'Office Landlord',
      description: 'Monthly office rental',
    }),
  });
  assert.equal(expRes.status, 201);
  const expense = await expRes.json();
  assert.ok(expense.number.startsWith('EXP-'));
  assert.equal(expense.amount, 15000);

  // 11. Verify Financial Reports dynamically reflect the entered data
  const tbRes = await fetch(url('/api/reports/trial-balance'), { headers: authHeaders });
  assert.equal(tbRes.status, 200);
  const tb = await tbRes.json();
  assert.equal(tb.balanced, true, 'Trial balance must be balanced');
  assert.equal(tb.totalDebit, tb.totalCredit, 'Total debit must match total credit');

  const bsRes = await fetch(url('/api/reports/balance-sheet'), { headers: authHeaders });
  assert.equal(bsRes.status, 200);
  const bs = await bsRes.json();
  assert.equal(bs.balanced, true, 'Balance sheet must balance (Assets = Liabilities + Equity)');
  assert.equal(bs.totalAssets, bs.totalLiabilitiesAndEquity, 'Total Assets must match Total Liabilities & Equity');

  const plRes = await fetch(url('/api/reports/profit-loss'), { headers: authHeaders });
  assert.equal(plRes.status, 200);
  const pl = await plRes.json();
  assert.equal(pl.income.total, 85500, 'Income must reflect sales subtotal');
  assert.equal(pl.operatingExpenses.total, 15000, 'Operating expenses must reflect rent expense');

  const vatRes = await fetch(url('/api/vat/summary'), { headers: authHeaders });
  assert.equal(vatRes.status, 200);
  const vat = await vatRes.json();
  assert.equal(vat.output.vat, 12825, 'Output VAT must match sales invoice VAT');
  assert.equal(vat.input.purchases.vat, 16500, 'Input VAT must match purchase bill VAT');

  const dashRes = await fetch(url('/api/reports/dashboard'), { headers: authHeaders });
  assert.equal(dashRes.status, 200);
  const dash = await dashRes.json();
  assert.equal(dash.booksBalanced, true, 'Dashboard confirms books are balanced');
  assert.equal(dash.bank, 35000, 'Bank balance = +50k receipt - 15k rent = 35k');

  // 12. Unauthorized request rejection
  const badTokenRes = await fetch(url('/api/reports/dashboard'), {
    headers: { Authorization: 'Bearer invalid-token-string' },
  });
  assert.equal(badTokenRes.status, 401);
  const badTokenData = await badTokenRes.json();
  assert.equal(badTokenData.code, 'TOKEN_INVALID');
});
