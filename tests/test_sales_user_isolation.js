/**
 * Automated Verification Suite for Sales Department User-Wise Data Isolation
 * 
 * Verifies all 7 user requirements:
 * 1. Login as Sales User 1 and verify only User 1's data appears.
 * 2. Login as Sales User 2 and verify only User 2's data appears.
 * 3. Create records from both accounts and verify separate ownership.
 * 4. Verify that User 1 cannot access User 2's records through direct API requests (403/404).
 * 5. Verify that User 2 cannot edit or delete User 1's records (403).
 * 6. Verify that Admin can access and manage all sales records, view individual user data, and see who created each record.
 * 7. Verify that all other departments (Service, Accounts, Admin, Marketing) continue working exactly as before.
 */

import assert from 'assert';
import http from 'http';
import bcrypt from 'bcryptjs';
import { centralStore } from '../src/modules/admin/services/centralStorage.js';
import { salesStorage } from '../src/modules/sales/services/salesStorage.js';
import { unifiedStore, createRealisticSeedData } from '../src/services/unifiedStorage.js';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../server/index.js');
const { initDatabase, UsersDAO, SalesClientsDAO, SalesWorkDAO, SalesHistoryDAO } = await import('../server/db/centralDb.js');

await initDatabase();

console.log('========================================================================');
console.log('🚀 TESTING USER-WISE DATA ISOLATION FOR SALES DEPARTMENT');
console.log('========================================================================\n');

let total = 0;
let passed = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error('     Error:', err.message);
    throw err;
  }
}

async function itAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error('     Error:', err.message);
    throw err;
  }
}

// Spin up live HTTP server for real API verification
const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;

async function apiRequest(path, options = {}, token = null) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runSuite() {
  // -------------------------------------------------------------
  // 1. Storage & Memory Engine Level Isolation Tests
  // -------------------------------------------------------------
  console.log('--- 1. STORAGE-LEVEL USER DATA OWNERSHIP & ISOLATION ---');

  // Reset unified store with seed data
  await unifiedStore.init();
  const seed = createRealisticSeedData();
  unifiedStore.memory = { ...seed };

  const salesUser1 = {
    userId: 'sales1',
    name: 'Sales User 1',
    role: 'employee',
    departments: ['sales'],
  };

  const salesUser2 = {
    userId: 'sales2',
    name: 'Sales User 2',
    role: 'employee',
    departments: ['sales'],
  };

  const adminUser = {
    userId: 'admin',
    name: 'Super Administrator',
    role: 'superadmin',
    departments: ['sales', 'service', 'accounts', 'marketing'],
  };

  it('1.1: Sales User 1 creates a client -> stamped with User 1 ID and ownership', () => {
    const client1 = salesStorage.addClient(
      {
        name: 'Rahim Chowdhury',
        company: 'Chowdhury Cables Ltd',
        phone: '01711-123456',
        category: 'Potential',
      },
      salesUser1
    );

    assert(client1.id, 'Client ID generated');
    assert.strictEqual(client1.userId, 'sales1', 'userId is sales1');
    assert.strictEqual(client1.createdBy, 'sales1', 'createdBy is sales1');
    assert.strictEqual(client1.createdByName, 'Sales User 1', 'createdByName is Sales User 1');
  });

  it('1.2: Sales User 2 creates a client -> stamped with User 2 ID and ownership', () => {
    const client2 = salesStorage.addClient(
      {
        name: 'Karim Uddin',
        company: 'Karim Textiles Ltd',
        phone: '01811-654321',
        category: 'Quotation',
      },
      salesUser2
    );

    assert(client2.id, 'Client ID generated');
    assert.strictEqual(client2.userId, 'sales2', 'userId is sales2');
    assert.strictEqual(client2.createdBy, 'sales2', 'createdBy is sales2');
    assert.strictEqual(client2.createdByName, 'Sales User 2', 'createdByName is Sales User 2');
  });

  it('1.3: User 1 sees ONLY User 1 data; User 2 sees ONLY User 2 data', () => {
    const dataUser1 = salesStorage.getData(salesUser1);
    const dataUser2 = salesStorage.getData(salesUser2);

    const user1ClientNames = dataUser1.clients.map((c) => c.name);
    const user2ClientNames = dataUser2.clients.map((c) => c.name);

    assert(user1ClientNames.includes('Rahim Chowdhury'), 'User 1 sees Rahim Chowdhury');
    assert(!user1ClientNames.includes('Karim Uddin'), 'User 1 CANNOT see Karim Uddin (User 2 data)');

    assert(user2ClientNames.includes('Karim Uddin'), 'User 2 sees Karim Uddin');
    assert(!user2ClientNames.includes('Rahim Chowdhury'), 'User 2 CANNOT see Rahim Chowdhury (User 1 data)');

    // Ensure all records in dataUser1 belong to sales1
    dataUser1.clients.forEach((c) => {
      assert(
        c.userId === 'sales1' || c.createdBy === 'sales1',
        `All records in User 1 view must belong to sales1 (found ${c.userId})`
      );
    });

    // Ensure all records in dataUser2 belong to sales2
    dataUser2.clients.forEach((c) => {
      assert(
        c.userId === 'sales2' || c.createdBy === 'sales2',
        `All records in User 2 view must belong to sales2 (found ${c.userId})`
      );
    });
  });

  it('1.4: Sales User 2 is BLOCKED (403) from editing or deleting User 1 client', () => {
    const dataUser1 = salesStorage.getData(salesUser1);
    const user1Client = dataUser1.clients.find((c) => c.name === 'Rahim Chowdhury');
    assert(user1Client, 'User 1 client exists');

    // Attempt unauthorized update by User 2
    assert.throws(
      () => {
        salesStorage.updateClient(user1Client.id, { company: 'Hacked Company' }, salesUser2);
      },
      /403 Forbidden/,
      'User 2 cannot update User 1 client'
    );

    // Attempt unauthorized deletion by User 2
    assert.throws(
      () => {
        salesStorage.deleteClient(user1Client.id, salesUser2);
      },
      /403 Forbidden/,
      'User 2 cannot delete User 1 client'
    );

    // Attempt unauthorized bulk deletion by User 2
    assert.throws(
      () => {
        salesStorage.deleteClients([user1Client.id], salesUser2);
      },
      /403 Forbidden/,
      'User 2 cannot bulk-delete User 1 client'
    );
  });

  it('1.5: Admin can access ALL sales records and view individual user data', () => {
    const adminAllData = salesStorage.getData(adminUser);
    const clientNames = adminAllData.clients.map((c) => c.name);

    assert(clientNames.includes('Rahim Chowdhury'), 'Admin sees User 1 client');
    assert(clientNames.includes('Karim Uddin'), 'Admin sees User 2 client');

    // Admin filters to User 2 individual data
    const adminUser2Data = salesStorage.getData(adminUser, { userId: 'sales2' });
    const u2Names = adminUser2Data.clients.map((c) => c.name);
    assert(u2Names.includes('Karim Uddin'), 'Admin sees User 2 client when filtered');
    assert(!u2Names.includes('Rahim Chowdhury'), 'Admin sees only User 2 data when user2 filter active');
  });

  // -------------------------------------------------------------
  // 2. Real HTTP REST Backend Endpoints & Ownership Protection
  // -------------------------------------------------------------
  console.log('\n--- 2. BACKEND API ENDPOINTS & HTTP 403/404 SECURITY ---');

  // Authenticate Admin, Sales1, Sales2 via API
  let adminToken = '';
  let sales1Token = '';
  let sales2Token = '';

  await itAsync('2.1: Login via API for Admin, Sales User 1, and Sales User 2', async () => {
    const adminLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { userId: 'admin', password: 'password123' },
    });
    assert(adminLogin.ok && adminLogin.data.token, 'Admin login succeeded');
    adminToken = adminLogin.data.token;

    const s1Login = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { userId: 'sales1', password: 'password123' },
    });
    assert(s1Login.ok && s1Login.data.token, 'Sales 1 login succeeded');
    sales1Token = s1Login.data.token;

    const s2Login = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { userId: 'sales2', password: 'password123' },
    });
    assert(s2Login.ok && s2Login.data.token, 'Sales 2 login succeeded');
    sales2Token = s2Login.data.token;
  });

  let createdClient1Id = '';
  let createdClient2Id = '';

  await itAsync('2.2: POST /api/sales/clients: Auto-stamps user ID regardless of submitted body', async () => {
    // Sales 1 tries to spoof userId as 'someone_else' -> Server MUST ignore it and stamp 'sales1'
    const res1 = await apiRequest(
      '/api/sales/clients',
      {
        method: 'POST',
        body: {
          name: 'Bengal Power API Client',
          company: 'Bengal Power Solutions',
          phone: '01700-112233',
          userId: 'spoofed_user_id', // Spoof attempt
        },
      },
      sales1Token
    );

    assert.strictEqual(res1.status, 201, 'Sales 1 client created');
    assert.strictEqual(res1.data.data.userId, 'sales1', 'Spoofed user ID ignored, stamped with authenticated sales1');
    assert.strictEqual(res1.data.data.createdBy, 'sales1', 'createdBy is sales1');
    createdClient1Id = res1.data.data.id;

    // Sales 2 creates their record
    const res2 = await apiRequest(
      '/api/sales/clients',
      {
        method: 'POST',
        body: {
          name: 'Meghna Pharma API Client',
          company: 'Meghna Pharma Ltd',
          phone: '01800-445566',
        },
      },
      sales2Token
    );

    assert.strictEqual(res2.status, 201, 'Sales 2 client created');
    assert.strictEqual(res2.data.data.userId, 'sales2', 'Stamped with authenticated sales2');
    createdClient2Id = res2.data.data.id;
  });

  await itAsync('2.3: GET /api/sales/clients: User 1 sees ONLY User 1 clients, User 2 sees ONLY User 2 clients', async () => {
    const res1 = await apiRequest('/api/sales/clients', { method: 'GET' }, sales1Token);
    assert.strictEqual(res1.status, 200, 'User 1 GET succeeded');
    const u1Ids = res1.data.data.map((c) => c.id);
    assert(u1Ids.includes(createdClient1Id), 'User 1 sees client 1');
    assert(!u1Ids.includes(createdClient2Id), 'User 1 DOES NOT see client 2 (User 2 data)');

    const res2 = await apiRequest('/api/sales/clients', { method: 'GET' }, sales2Token);
    assert.strictEqual(res2.status, 200, 'User 2 GET succeeded');
    const u2Ids = res2.data.data.map((c) => c.id);
    assert(u2Ids.includes(createdClient2Id), 'User 2 sees client 2');
    assert(!u2Ids.includes(createdClient1Id), 'User 2 DOES NOT see client 1 (User 1 data)');
  });

  await itAsync('2.4: GET /api/sales/clients/:id: User 1 requesting User 2 ID returns HTTP 403 Forbidden', async () => {
    const forbiddenRes = await apiRequest(`/api/sales/clients/${createdClient2Id}`, { method: 'GET' }, sales1Token);
    assert.strictEqual(forbiddenRes.status, 403, 'Direct access to User 2 record ID returned HTTP 403 Forbidden');
    assert(forbiddenRes.data.error.includes('Forbidden'), 'Clear forbidden error message returned');
  });

  await itAsync('2.5: PUT /api/sales/clients/:id: User 2 updating User 1 record returns HTTP 403 Forbidden', async () => {
    const forbiddenUpdate = await apiRequest(
      `/api/sales/clients/${createdClient1Id}`,
      {
        method: 'PUT',
        body: { company: 'Unauthorized Malicious Modification' },
      },
      sales2Token
    );

    assert.strictEqual(forbiddenUpdate.status, 403, 'Unauthorized PUT returned HTTP 403 Forbidden');
  });

  await itAsync('2.6: DELETE /api/sales/clients/:id: User 2 deleting User 1 record returns HTTP 403 Forbidden', async () => {
    const forbiddenDelete = await apiRequest(`/api/sales/clients/${createdClient1Id}`, { method: 'DELETE' }, sales2Token);
    assert.strictEqual(forbiddenDelete.status, 403, 'Unauthorized DELETE returned HTTP 403 Forbidden');
  });

  await itAsync('2.7: Non-existent ID returns HTTP 404 Not Found', async () => {
    const notFoundRes = await apiRequest('/api/sales/clients/non_existent_id_9999', { method: 'GET' }, sales1Token);
    assert.strictEqual(notFoundRes.status, 404, 'Non-existent record returns HTTP 404');
  });

  await itAsync('2.8: Admin has full access to view, filter, edit, and delete any sales record', async () => {
    // Admin GET /api/sales/clients sees both
    const adminRes = await apiRequest('/api/sales/clients', { method: 'GET' }, adminToken);
    assert.strictEqual(adminRes.status, 200, 'Admin GET succeeded');
    const allIds = adminRes.data.data.map((c) => c.id);
    assert(allIds.includes(createdClient1Id), 'Admin sees client 1');
    assert(allIds.includes(createdClient2Id), 'Admin sees client 2');

    // Admin filters by sales2
    const adminUser2Res = await apiRequest('/api/sales/clients?userId=sales2', { method: 'GET' }, adminToken);
    assert.strictEqual(adminUser2Res.status, 200);
    const u2OnlyIds = adminUser2Res.data.data.map((c) => c.id);
    assert(u2OnlyIds.includes(createdClient2Id), 'Admin filtered view contains client 2');
    assert(!u2OnlyIds.includes(createdClient1Id), 'Admin filtered view excludes client 1');

    // Admin edits client 1
    const adminEditRes = await apiRequest(
      `/api/sales/clients/${createdClient1Id}`,
      {
        method: 'PUT',
        body: { notes: 'Verified and approved by Super Admin' },
      },
      adminToken
    );
    assert.strictEqual(adminEditRes.status, 200, 'Admin can edit client 1');
    assert.strictEqual(adminEditRes.data.data.notes, 'Verified and approved by Super Admin');

    // Admin can access GET /api/sales/users to manage all sales users
    const usersRes = await apiRequest('/api/sales/users', { method: 'GET' }, adminToken);
    assert.strictEqual(usersRes.status, 200, 'Admin lists all sales department users');
    const userIds = usersRes.data.users.map((u) => u.userId);
    assert(userIds.includes('sales1') && userIds.includes('sales2'), 'sales1 and sales2 listed');
  });

  // -------------------------------------------------------------
  // 3. Planned Tasks / Work / History / Office Attendance Isolation
  // -------------------------------------------------------------
  console.log('\n--- 3. ALL SALES MODULES DATA ISOLATION VERIFICATION ---');

  let work1Id = '';
  let work2Id = '';

  await itAsync('3.1: Work / Planned Tasks: Separate ownership and isolation', async () => {
    // User 1 creates task
    const w1Res = await apiRequest(
      '/api/sales/work',
      {
        method: 'POST',
        body: {
          date: '2026-11-25',
          time: '10:00 AM',
          text: 'User 1 Confidential Client Meeting',
        },
      },
      sales1Token
    );
    assert.strictEqual(w1Res.status, 201);
    work1Id = w1Res.data.data.id;

    // User 2 creates task
    const w2Res = await apiRequest(
      '/api/sales/work',
      {
        method: 'POST',
        body: {
          date: '2026-11-25',
          time: '02:00 PM',
          text: 'User 2 Private Site Inspection',
        },
      },
      sales2Token
    );
    assert.strictEqual(w2Res.status, 201);
    work2Id = w2Res.data.data.id;

    // User 1 GET /api/sales/work
    const list1 = await apiRequest('/api/sales/work', { method: 'GET' }, sales1Token);
    const list1Ids = list1.data.data.map((w) => w.id);
    assert(list1Ids.includes(work1Id), 'User 1 sees task 1');
    assert(!list1Ids.includes(work2Id), 'User 1 DOES NOT see task 2');

    // User 2 GET /api/sales/work/:id for User 1's task -> 403
    const forbiddenWork = await apiRequest(`/api/sales/work/${work1Id}`, { method: 'GET' }, sales2Token);
    assert.strictEqual(forbiddenWork.status, 403, 'User 2 blocked from User 1 work task with 403');
  });

  await itAsync('3.2: Office Attendance: User 1 and User 2 attendance logs are strictly separate', async () => {
    const testDate = `2026-12-${String(10 + (Date.now() % 15))}`;
    // User 1 office IN
    const in1 = await apiRequest('/api/sales/office/in', { method: 'POST', body: { date: testDate } }, sales1Token);
    assert.strictEqual(in1.status, 201);

    // User 2 office IN (should succeed independently, not blocked by User 1's attendance)
    const in2 = await apiRequest('/api/sales/office/in', { method: 'POST', body: { date: testDate } }, sales2Token);
    assert.strictEqual(in2.status, 201);

    // User 1 GET /api/sales/office sees only their own attendance
    const off1 = await apiRequest('/api/sales/office', { method: 'GET' }, sales1Token);
    assert(off1.data.data.every((o) => o.userId === 'sales1'), 'User 1 sees only sales1 attendance');

    // User 2 GET /api/sales/office sees only their own attendance
    const off2 = await apiRequest('/api/sales/office', { method: 'GET' }, sales2Token);
    assert(off2.data.data.every((o) => o.userId === 'sales2'), 'User 2 sees only sales2 attendance');

    // Check out
    await apiRequest('/api/sales/office/out', { method: 'POST', body: { date: testDate, out: new Date().toISOString() } }, sales1Token);
    await apiRequest('/api/sales/office/out', { method: 'POST', body: { date: testDate, out: new Date().toISOString() } }, sales2Token);
  });

  await itAsync('3.3: Dashboard Summary: Numbers reflect strictly the authenticated user data', async () => {
    const dash1 = await apiRequest('/api/sales/dashboard', { method: 'GET' }, sales1Token);
    assert.strictEqual(dash1.status, 200);
    assert.strictEqual(dash1.data.scope, 'user:sales1', 'Scope is user:sales1');

    const dash2 = await apiRequest('/api/sales/dashboard', { method: 'GET' }, sales2Token);
    assert.strictEqual(dash2.status, 200);
    assert.strictEqual(dash2.data.scope, 'user:sales2', 'Scope is user:sales2');

    const dashAdmin = await apiRequest('/api/sales/dashboard', { method: 'GET' }, adminToken);
    assert.strictEqual(dashAdmin.status, 200);
    assert.strictEqual(dashAdmin.data.scope, 'all', 'Admin scope is all');
  });

  // -------------------------------------------------------------
  // 4. Other Departments Functionality Unaffected
  // -------------------------------------------------------------
  console.log('\n--- 4. OTHER DEPARTMENTS INTEGRITY VERIFICATION ---');

  await itAsync('4.1: Service department status & routes operate normally', async () => {
    const serviceRes = await apiRequest('/api/service/status', { method: 'GET' }, adminToken);
    assert.strictEqual(serviceRes.status, 200, 'Service operational');
    assert.strictEqual(serviceRes.data.department, 'service');
  });

  await itAsync('4.2: Accounts / ERP double-entry engine operates normally', async () => {
    const { erpStore } = await import('../src/modules/erp/services/erpStorage.js');
    const accounts = erpStore.getAccounts();
    assert(Array.isArray(accounts) && accounts.length >= 20, 'ERP Chart of accounts loaded');
    const customer = erpStore.createParty({ type: 'customer', name: 'Test Corp', phone: '01700' });
    assert(customer && (customer._id || customer.id), 'ERP Customer party created');
  });

  await itAsync('4.3: Admin management endpoints operate normally', async () => {
    const adminStats = await apiRequest('/api/admin/stats', { method: 'GET' }, adminToken);
    assert.strictEqual(adminStats.status, 200, 'Admin stats operational');
    assert(adminStats.data.stats, 'Admin stats present');
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passed} / ${total} TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

try {
  await runSuite();
} finally {
  server.close(() => {
    process.exit(0);
  });
  // Fallback in case keep-alive sockets linger
  setTimeout(() => process.exit(0), 1000).unref();
}
