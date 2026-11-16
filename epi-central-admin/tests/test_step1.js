import assert from 'assert';
import { EventEmitter } from 'events';
import app from '../server/app.js';
import { initDatabase, UsersDAO, AuditDAO } from '../server/db.js';

// Simulated in-memory HTTP caller for Express (works completely without TCP network sockets)
function invoke(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { ...headers };
    req.ip = '127.0.0.1';
    req.connection = { remoteAddress: '127.0.0.1' };
    req.socket = { remoteAddress: '127.0.0.1' };
    if (body) {
      req.body = body;
      if (!req.headers['content-type']) req.headers['content-type'] = 'application/json';
    }

    const res = new EventEmitter();
    let resStatusCode = 200;
    const resHeaders = {};
    let responseBody = '';

    res.statusCode = 200;
    res.setHeader = (name, val) => {
      resHeaders[name.toLowerCase()] = val;
    };
    res.getHeader = (name) => resHeaders[name.toLowerCase()];
    res.status = (code) => {
      resStatusCode = code;
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('content-type', 'application/json');
      responseBody = JSON.stringify(data);
      resolve({
        status: resStatusCode,
        headers: resHeaders,
        json: async () => data,
        text: async () => responseBody,
      });
    };
    res.send = (chunk) => {
      responseBody = chunk;
      let parsed = chunk;
      try { parsed = JSON.parse(chunk); } catch (e) {}
      resolve({
        status: resStatusCode,
        headers: resHeaders,
        json: async () => parsed,
        text: async () => responseBody,
      });
    };
    res.end = (chunk) => {
      if (chunk) responseBody = chunk;
      let parsed = responseBody;
      try { parsed = JSON.parse(responseBody); } catch (e) {}
      resolve({
        status: resStatusCode,
        headers: resHeaders,
        json: async () => parsed,
        text: async () => responseBody,
      });
    };

    // Dispatch request to Express app
    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
}

async function runTests() {
  console.log('--- STARTING STEP 1 COMPREHENSIVE IN-PROCESS VERIFICATION ---');

  // Initialize DB
  await initDatabase();

  // Clean any previous test data in test run
  const existingUsers = await UsersDAO.findAll();
  for (const u of existingUsers) {
    await UsersDAO.delete(u.id);
  }

  // 1. Verify Setup Status: Needs setup should be TRUE initially
  console.log('\n[Test 1] Checking Initial Setup Status...');
  const statusRes = await invoke(app, { method: 'GET', url: '/api/auth/setup-status' });
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.needsSetup, true, 'System should require initial setup when no admin exists');
  console.log('✓ Initial setup required as expected (needsSetup: true)');

  // 2. Perform First-Time Super Admin Setup
  console.log('\n[Test 2] Performing Super Admin Setup...');
  const setupRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/setup-admin',
    body: {
      userId: 'super_admin_master',
      name: 'Master Super Admin',
      email: 'admin@epiups.com.bd',
      password: 'SuperAdminSecret#2026',
    },
  });
  const setupData = await setupRes.json();
  assert.strictEqual(setupRes.status, 201, `Super Admin creation should return 201: ${setupData.error}`);
  assert.strictEqual(setupData.success, true);
  assert.strictEqual(setupData.user.role, 'superadmin');
  const superAdminToken = setupData.token;
  console.log('✓ Super Admin created successfully with token');

  // 2b. Second attempt to setup Super Admin should be rejected
  const setup2Res = await invoke(app, {
    method: 'POST',
    url: '/api/auth/setup-admin',
    body: {
      userId: 'imposter_admin',
      name: 'Imposter',
      password: 'Password123!',
    },
  });
  assert.strictEqual(setup2Res.status, 403, 'Subsequent setup attempts must be forbidden (403)');
  console.log('✓ Re-setup attempt strictly blocked with 403 Forbidden');

  // 3. Test Super Admin Login
  console.log('\n[Test 3] Testing Super Admin Login...');
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: {
      userId: 'super_admin_master',
      password: 'SuperAdminSecret#2026',
    },
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.user.role, 'superadmin');
  console.log('✓ Super Admin login successful');

  // 4. Test User Creation by Super Admin: Create Department Employees
  console.log('\n[Test 4] Creating Department-Specific Employee Accounts...');
  const testEmployees = [
    { userId: 'emp_service', name: 'Service Engineer A', departments: ['service'], password: 'Password@Service1' },
    { userId: 'emp_sales', name: 'Sales Officer B', departments: ['sales'], password: 'Password@Sales1' },
    { userId: 'emp_accounts', name: 'Accountant C', departments: ['accounts'], password: 'Password@Accounts1' },
    { userId: 'emp_sales_service', name: 'Field Lead D', departments: ['sales', 'service'], password: 'Password@Field1' },
    { userId: 'emp_manager', name: 'General Manager E', departments: ['service', 'sales', 'accounts'], password: 'Password@Manager1' },
  ];

  const tokens = {};

  for (const emp of testEmployees) {
    const createRes = await invoke(app, {
      method: 'POST',
      url: '/api/admin/users',
      headers: { 'authorization': `Bearer ${superAdminToken}` },
      body: emp,
    });
    const createData = await createRes.json();
    assert.strictEqual(createRes.status, 201, `Failed to create ${emp.userId}: ${createData.error}`);
    console.log(`✓ Created employee: ${emp.userId} (${emp.departments.join(', ')})`);

    // Log in as employee to get token
    const empLogin = await invoke(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: { userId: emp.userId, password: emp.password },
    });
    const empLoginData = await empLogin.json();
    assert.strictEqual(empLogin.status, 200);
    tokens[emp.userId] = empLoginData.token;
  }

  // 5. Test Department Access Control (Phase 3 Backend Authorization Verification)
  console.log('\n[Test 5] Verifying Backend-Based Department Authorization...');

  async function checkDept(tok, dept) {
    return await invoke(app, {
      method: 'GET',
      url: `/api/departments/verify/${dept}`,
      headers: { 'authorization': `Bearer ${tok}` },
    });
  }

  // 5a. Service-only user:
  const svc_svc = await checkDept(tokens['emp_service'], 'service');
  assert.strictEqual(svc_svc.status, 200, 'Service user MUST access Service');
  const svc_sales = await checkDept(tokens['emp_service'], 'sales');
  assert.strictEqual(svc_sales.status, 403, 'Service user MUST NOT access Sales');
  const svc_acc = await checkDept(tokens['emp_service'], 'accounts');
  assert.strictEqual(svc_acc.status, 403, 'Service user MUST NOT access Accounts');
  console.log('✓ Service-only employee: Service ALLOWED (200), Sales BLOCKED (403), Accounts BLOCKED (403)');

  // 5b. Sales-only user:
  const sales_sales = await checkDept(tokens['emp_sales'], 'sales');
  assert.strictEqual(sales_sales.status, 200, 'Sales user MUST access Sales');
  const sales_svc = await checkDept(tokens['emp_sales'], 'service');
  assert.strictEqual(sales_svc.status, 403, 'Sales user MUST NOT access Service');
  const sales_acc = await checkDept(tokens['emp_sales'], 'accounts');
  assert.strictEqual(sales_acc.status, 403, 'Sales user MUST NOT access Accounts');
  console.log('✓ Sales-only employee: Sales ALLOWED (200), Service BLOCKED (403), Accounts BLOCKED (403)');

  // 5c. Accounts-only user:
  const acc_acc = await checkDept(tokens['emp_accounts'], 'accounts');
  assert.strictEqual(acc_acc.status, 200, 'Accounts user MUST access Accounts');
  const acc_svc = await checkDept(tokens['emp_accounts'], 'service');
  assert.strictEqual(acc_svc.status, 403, 'Accounts user MUST NOT access Service');
  const acc_sales = await checkDept(tokens['emp_accounts'], 'sales');
  assert.strictEqual(acc_sales.status, 403, 'Accounts user MUST NOT access Sales');
  console.log('✓ Accounts-only employee: Accounts ALLOWED (200), Service BLOCKED (403), Sales BLOCKED (403)');

  // 5d. Sales + Service user:
  const dual_sales = await checkDept(tokens['emp_sales_service'], 'sales');
  assert.strictEqual(dual_sales.status, 200);
  const dual_svc = await checkDept(tokens['emp_sales_service'], 'service');
  assert.strictEqual(dual_svc.status, 200);
  const dual_acc = await checkDept(tokens['emp_sales_service'], 'accounts');
  assert.strictEqual(dual_acc.status, 403);
  console.log('✓ Sales+Service employee: Sales ALLOWED (200), Service ALLOWED (200), Accounts BLOCKED (403)');

  // 5e. Super Admin: full system access
  assert.strictEqual((await checkDept(superAdminToken, 'sales')).status, 200);
  assert.strictEqual((await checkDept(superAdminToken, 'service')).status, 200);
  assert.strictEqual((await checkDept(superAdminToken, 'accounts')).status, 200);
  console.log('✓ Super Admin: ALL departments ALLOWED (200)');

  // 6. Test Ordinary Employee attempting to call Super Admin APIs
  console.log('\n[Test 6] Testing Security: Employee Attempting Admin Operations...');
  const illegalAdminRes = await invoke(app, {
    method: 'GET',
    url: '/api/admin/users',
    headers: { 'authorization': `Bearer ${tokens['emp_sales']}` },
  });
  assert.strictEqual(illegalAdminRes.status, 403, 'Ordinary employee must be blocked from admin endpoints');
  console.log('✓ Ordinary employee blocked with 403 Forbidden on /api/admin/users');

  // 7. Test Account Deactivation & Immediate Session Revocation
  console.log('\n[Test 7] Testing Account Deactivation & Instant Session Revocation...');
  const targetUser = await UsersDAO.findByUserId('emp_sales');
  const deactRes = await invoke(app, {
    method: 'PATCH',
    url: `/api/admin/users/${targetUser.id}/status`,
    headers: { 'authorization': `Bearer ${superAdminToken}` },
  });
  assert.strictEqual(deactRes.status, 200);
  console.log('✓ Super Admin deactivated emp_sales');

  // Verify active session token of emp_sales is immediately rejected
  const revokedSession = await invoke(app, {
    method: 'GET',
    url: '/api/auth/me',
    headers: { 'authorization': `Bearer ${tokens['emp_sales']}` },
  });
  assert.strictEqual(revokedSession.status, 403, 'Deactivated account token must be rejected immediately (403)');
  console.log('✓ Deactivated account active token was immediately revoked on next request');

  // Attempting login with correct password on deactivated account
  const deactLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: { userId: 'emp_sales', password: 'Password@Sales1' },
  });
  assert.strictEqual(deactLogin.status, 403, 'Login to deactivated account must return 403');
  console.log('✓ New login to deactivated account blocked with 403');

  // 8. Test Password Reset by Super Admin
  console.log('\n[Test 8] Testing Password Reset by Admin...');
  const resetRes = await invoke(app, {
    method: 'POST',
    url: `/api/admin/users/${targetUser.id}/reset-password`,
    headers: { 'authorization': `Bearer ${superAdminToken}` },
    body: { newPassword: 'NewSalesPassword#2026' },
  });
  assert.strictEqual(resetRes.status, 200);
  console.log('✓ Password reset by Super Admin succeeded');

  // Reactivate account
  await invoke(app, {
    method: 'PATCH',
    url: `/api/admin/users/${targetUser.id}/status`,
    headers: { 'authorization': `Bearer ${superAdminToken}` },
  });

  // Login with new password
  const newPassLogin = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    body: { userId: 'emp_sales', password: 'NewSalesPassword#2026' },
  });
  assert.strictEqual(newPassLogin.status, 200);
  console.log('✓ Employee successfully logged in with new password');

  // 9. Verify Dashboard Statistics
  console.log('\n[Test 9] Verifying Central Admin Dashboard Statistics...');
  const statsRes = await invoke(app, {
    method: 'GET',
    url: '/api/admin/stats',
    headers: { 'authorization': `Bearer ${superAdminToken}` },
  });
  const statsData = await statsRes.json();
  assert.strictEqual(statsData.success, true);
  assert.strictEqual(statsData.stats.totalEmployees, 6); // 1 super admin + 5 employees
  assert.strictEqual(statsData.stats.activeEmployees, 6);
  console.log(`✓ Stats verified: Total=${statsData.stats.totalEmployees}, Sales=${statsData.stats.salesUsers}, Service=${statsData.stats.serviceUsers}, Accounts=${statsData.stats.accountsUsers}`);

  // 10. Verify Audit Log Integrity
  console.log('\n[Test 10] Verifying Audit Logs Trail...');
  const logsRes = await invoke(app, {
    method: 'GET',
    url: '/api/admin/audit-logs',
    headers: { 'authorization': `Bearer ${superAdminToken}` },
  });
  const logsData = await logsRes.json();
  assert.strictEqual(logsData.success, true);
  assert(logsData.logs.length >= 8, 'Audit logs should record all major activities');
  console.log(`✓ Audit log verified: ${logsData.logs.length} logged events recorded in history`);

  console.log('\n============================================================');
  console.log('ALL 10 TESTS PASSED: STEP 1 IMPLEMENTATION FULLY VERIFIED!');
  console.log('============================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
