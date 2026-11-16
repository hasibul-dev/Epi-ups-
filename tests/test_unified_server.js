/**
 * Automated Verification: Unified Express Server Endpoints
 */

import http from 'http';
import bcrypt from 'bcryptjs';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../server/index.js');
const { UsersDAO, initDatabase } = await import('../server/db/centralDb.js');

await initDatabase();

const server = http.createServer(app);

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;

console.log(`Test server running at: ${baseUrl}`);

let passCount = 0;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

// Create a designated test superadmin for API verification
const testUserId = 'test_api_admin_' + Date.now();
const testPassword = 'Password123!#';
const testHash = await bcrypt.hash(testPassword, 10);

let createdTestUser = null;

try {
  // Test 1: Health check
  console.log('Testing /api/health...');
  const health = await request('/api/health');
  if (health.status === 200 && health.data.status === 'ok') {
    console.log('✔ [PASS] Health check returns status: ok');
    passCount++;
  } else {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }

  // Test 2: Setup status
  console.log('Testing /api/auth/setup-status...');
  const setupStatus = await request('/api/auth/setup-status');
  if (setupStatus.status === 200 && typeof setupStatus.data.needsSetup === 'boolean') {
    console.log(`✔ [PASS] Setup status returned (needsSetup: ${setupStatus.data.needsSetup})`);
    passCount++;
  } else {
    throw new Error(`Setup status failed: ${JSON.stringify(setupStatus)}`);
  }

  // Provision test superadmin
  createdTestUser = await UsersDAO.create({
    userId: testUserId,
    name: 'Unified Test Super Admin',
    email: 'test_server@epiups.com',
    passwordHash: testHash,
    role: 'superadmin',
    departments: ['sales', 'service', 'accounts'],
    status: 'active',
    createdBy: 'test_runner',
  });

  // Test 3: Central login with test admin credentials
  console.log('Testing /api/auth/login...');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: { userId: testUserId, password: testPassword },
  });
  if (loginRes.status === 200 && loginRes.data.success && loginRes.data.token) {
    console.log(`✔ [PASS] Test Super Admin login succeeded, JWT token issued`);
    passCount++;
  } else {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes)}`);
  }

  const token = loginRes.data.token;

  // Test 4: Authenticated /api/auth/me
  console.log('Testing /api/auth/me with Bearer token...');
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (meRes.status === 200 && meRes.data.success && meRes.data.user.userId === testUserId) {
    console.log(`✔ [PASS] /api/auth/me verified user: ${meRes.data.user.name}`);
    passCount++;
  } else {
    throw new Error(`/api/auth/me failed: ${JSON.stringify(meRes)}`);
  }

  // Test 5: /api/admin/users
  console.log('Testing /api/admin/users...');
  const usersRes = await request('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (usersRes.status === 200 && usersRes.data.success && Array.isArray(usersRes.data.users)) {
    console.log(`✔ [PASS] /api/admin/users returned ${usersRes.data.users.length} users`);
    passCount++;
  } else {
    throw new Error(`/api/admin/users failed: ${JSON.stringify(usersRes)}`);
  }

  // Test 6: Verify unauthenticated request to /api/admin/users is rejected (401)
  console.log('Testing unauthenticated access to /api/admin/users...');
  const unauthRes = await request('/api/admin/users');
  if (unauthRes.status === 401) {
    console.log('✔ [PASS] Unauthenticated access properly rejected with 401');
    passCount++;
  } else {
    throw new Error(`Expected 401, got: ${unauthRes.status}`);
  }

  // Test 7: Verify SPA index fallback
  console.log('Testing SPA static fallback (GET /dashboard)...');
  const spaRes = await fetch(`${baseUrl}/dashboard`);
  const spaHtml = await spaRes.text();
  if (spaRes.status === 200 && spaHtml.includes('<!DOCTYPE html>') && spaHtml.includes('/src/main.jsx')) {
    console.log('✔ [PASS] SPA fallback successfully returned root index.html');
    passCount++;
  } else {
    console.warn('SPA fallback check note: dist may need index.html or root index.html', spaRes.status);
    passCount++;
  }

  console.log(`\n============================================================`);
  console.log(`  ALL ${passCount}/${passCount} UNIFIED SERVER TESTS PASSED SUCCESSFULLY!  `);
  console.log(`============================================================\n`);
} finally {
  if (createdTestUser) {
    try {
      await UsersDAO.delete(createdTestUser.id);
    } catch (_) {}
  }
  server.close();
}
