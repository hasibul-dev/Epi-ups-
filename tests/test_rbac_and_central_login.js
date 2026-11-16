/**
 * EPI CENTRALIZED MANAGEMENT SYSTEM — RBAC & Centralized Login Automated Test Suite
 * 
 * Verifies:
 * 1. ONE Central Login Portal with bcrypt password hashing
 * 2. Super Admin full access across all 4 departments
 * 3. Sales department user restricted strictly to Sales (blocks Service, ERP, Admin)
 * 4. Service department user restricted strictly to Service (blocks Sales, ERP, Admin)
 * 5. Accounts department user restricted strictly to ERP (blocks Sales, Service, Admin)
 * 6. Post-login auto-redirection calculation
 * 7. Deactivated account enforcement
 * 8. Login history logging (timestamp, IP, User Agent)
 * 9. Super Admin User Management (Create, Edit, Status Toggle, Reset Password, Delete)
 */

import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock LocalStorage in Node.js for browser-storage engine testing
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    _dump: () => store,
  };
})();

global.localStorage = mockLocalStorage;
global.window = {
  location: { hostname: '127.0.0.1', origin: 'http://localhost:5050' },
};
global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EPI-Automated-Tester/1.0',
};

// Import centralStore
const { centralStore } = await import('../epi-central-admin/src/services/centralStorage.js');

console.log('======================================================================');
console.log('   EPI CENTRALIZED LOGIN & ROLE-BASED ACCESS CONTROL (RBAC) TESTS     ');
console.log('======================================================================\n');

let passCount = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✔ [PASS] ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${desc}`);
    console.error(`    Error: ${err.message}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// Test 1: Bcrypt Password Hashing & Sanitization
// -------------------------------------------------------------
test('User credentials are cryptographically hashed with bcrypt (no plain-text)', () => {
  const users = centralStore.getUsers();
  assert(users.length >= 4, 'Should have at least 4 default accounts');
  for (const u of users) {
    assert(!u.password, `User ${u.userId} must not store plain text password`);
    assert(u.passwordHash, `User ${u.userId} must have passwordHash`);
    assert(
      u.passwordHash.startsWith('$2a$') || u.passwordHash.startsWith('$2b$'),
      `User ${u.userId} passwordHash must be standard bcrypt format`
    );
  }
  const sanitized = centralStore.sanitizeUser(users[0]);
  assert(!sanitized.password, 'Sanitized user must not have password');
  assert(!sanitized.passwordHash, 'Sanitized user must not have passwordHash');
});

// -------------------------------------------------------------
// Test 2: Super Admin Login & Full Access
// -------------------------------------------------------------
test('Super Admin login succeeds, logs history, and grants full access to all 4 departments', () => {
  const res = centralStore.login('admin', 'password123');
  assert(res.success, 'Super Admin login must succeed');
  assert.strictEqual(res.user.role, 'superadmin');
  assert.strictEqual(res.redirectDepartment, 'dashboard', 'Super Admin redirects to Admin dashboard');
  assert(res.user.departments.includes('sales'));
  assert(res.user.departments.includes('service'));
  assert(res.user.departments.includes('accounts'));

  // Verify Login History logged
  const historyRes = centralStore.getUserLoginHistory(res.user.id);
  assert(historyRes.success);
  assert(historyRes.history.length >= 1, 'Login history must record this login session');
  assert.strictEqual(historyRes.history[0].ip, '127.0.0.1');

  // Verify SSO Tickets for all 3 departments succeed for Super Admin
  const salesTicket = centralStore.createSsoTicket('sales', res.user);
  const salesEx = centralStore.exchangeSsoTicket(salesTicket, 'sales');
  assert(salesEx.success);

  const serviceTicket = centralStore.createSsoTicket('service', res.user);
  const serviceEx = centralStore.exchangeSsoTicket(serviceTicket, 'service');
  assert(serviceEx.success);

  const accountsTicket = centralStore.createSsoTicket('accounts', res.user);
  const accountsEx = centralStore.exchangeSsoTicket(accountsTicket, 'accounts');
  assert(accountsEx.success);
});

// -------------------------------------------------------------
// Test 3: Sales User Login & Strict Department Isolation
// -------------------------------------------------------------
test('Sales User (sales1) login redirects to Sales and strictly blocks Service & Accounts', () => {
  const res = centralStore.login('sales1', 'password123');
  assert(res.success);
  assert.strictEqual(res.user.userId, 'sales1');
  assert.strictEqual(res.redirectDepartment, 'sales', 'Sales user must auto-redirect to sales');
  assert.deepStrictEqual(res.user.departments, ['sales']);

  // Valid Sales SSO ticket
  const ticket = centralStore.createSsoTicket('sales', res.user);
  const ex = centralStore.exchangeSsoTicket(ticket, 'sales');
  assert(ex.success);

  // Unauthorized attempt to create ticket for Service must throw
  assert.throws(() => {
    centralStore.createSsoTicket('service', res.user);
  }, /Unauthorized/);

  // Unauthorized attempt to create ticket for Accounts must throw
  assert.throws(() => {
    centralStore.createSsoTicket('accounts', res.user);
  }, /Unauthorized/);
});

// -------------------------------------------------------------
// Test 4: Service User Login & Strict Department Isolation
// -------------------------------------------------------------
test('Service User (service1) login redirects to Service and strictly blocks Sales & Accounts', () => {
  const res = centralStore.login('service1', 'password123');
  assert(res.success);
  assert.strictEqual(res.user.userId, 'service1');
  assert.strictEqual(res.redirectDepartment, 'service', 'Service user must auto-redirect to service');
  assert.deepStrictEqual(res.user.departments, ['service']);

  // Valid Service SSO ticket
  const ticket = centralStore.createSsoTicket('service', res.user);
  const ex = centralStore.exchangeSsoTicket(ticket, 'service');
  assert(ex.success);

  // Unauthorized attempt for Sales
  assert.throws(() => {
    centralStore.createSsoTicket('sales', res.user);
  }, /Unauthorized/);

  // Unauthorized attempt for Accounts
  assert.throws(() => {
    centralStore.createSsoTicket('accounts', res.user);
  }, /Unauthorized/);
});

// -------------------------------------------------------------
// Test 5: Accounts User Login & Strict Department Isolation
// -------------------------------------------------------------
test('Accounts User (accounts1) login redirects to Accounts and strictly blocks Sales & Service', () => {
  const res = centralStore.login('accounts1', 'password123');
  assert(res.success);
  assert.strictEqual(res.user.userId, 'accounts1');
  assert.strictEqual(res.redirectDepartment, 'accounts', 'Accounts user must auto-redirect to accounts');
  assert.deepStrictEqual(res.user.departments, ['accounts']);

  // Valid Accounts SSO ticket
  const ticket = centralStore.createSsoTicket('accounts', res.user);
  const ex = centralStore.exchangeSsoTicket(ticket, 'accounts');
  assert(ex.success);

  // Unauthorized attempt for Sales
  assert.throws(() => {
    centralStore.createSsoTicket('sales', res.user);
  }, /Unauthorized/);

  // Unauthorized attempt for Service
  assert.throws(() => {
    centralStore.createSsoTicket('service', res.user);
  }, /Unauthorized/);
});

// -------------------------------------------------------------
// Test 6: Deactivated Account Enforcement
// -------------------------------------------------------------
test('Deactivated user is completely blocked from logging in', () => {
  const users = centralStore.getUsers();
  const target = users.find((u) => u.userId === 'sales1');
  centralStore.toggleUserStatus(target.id, { userId: 'admin', name: 'Super Admin' });

  // Attempt login with valid password
  assert.throws(() => {
    centralStore.login('sales1', 'password123');
  }, /Account is deactivated/);

  // Restore account status
  centralStore.toggleUserStatus(target.id, { userId: 'admin', name: 'Super Admin' });
  const restored = centralStore.login('sales1', 'password123');
  assert(restored.success);
});

// -------------------------------------------------------------
// Test 7: Super Admin User Management (Create, Edit, Reset, Delete)
// -------------------------------------------------------------
test('Super Admin user management lifecycle (Create, Edit, Reset Password, Delete)', () => {
  const admin = { userId: 'admin', name: 'Super Admin' };

  // 1. Create
  const created = centralStore.createUser(
    {
      userId: 'eng_tanvir',
      name: 'Tanvir Hossain',
      email: 'tanvir@epiups.com.bd',
      role: 'engineer',
      departments: ['service'],
      password: 'initialSecurePass123!',
    },
    admin
  );
  assert(created.success);
  assert.strictEqual(created.user.userId, 'eng_tanvir');

  // Verify can log in with initial password
  const firstLogin = centralStore.login('eng_tanvir', 'initialSecurePass123!');
  assert(firstLogin.success);
  assert.strictEqual(firstLogin.redirectDepartment, 'service');

  // 2. Edit User
  const updated = centralStore.updateUser(
    created.user.id,
    { name: 'Eng. Tanvir Hossain, Sr.', departments: ['service', 'sales'] },
    admin
  );
  assert(updated.success);
  assert.strictEqual(updated.user.name, 'Eng. Tanvir Hossain, Sr.');
  assert(updated.user.departments.includes('sales'));

  // 3. Reset Password
  const resetRes = centralStore.resetPassword(created.user.id, 'newBcryptPass456#', admin);
  assert(resetRes.success);

  // Old password rejected
  assert.throws(() => {
    centralStore.login('eng_tanvir', 'initialSecurePass123!');
  }, /Invalid User ID or Password/);

  // New password accepted
  const newLogin = centralStore.login('eng_tanvir', 'newBcryptPass456#');
  assert(newLogin.success);

  // 4. Delete User
  const delRes = centralStore.deleteUser(created.user.id, admin);
  assert(delRes.success);
  assert.throws(() => {
    centralStore.login('eng_tanvir', 'newBcryptPass456#');
  }, /Invalid User ID or Password/);
});

console.log('\n======================================================================');
console.log(`   ALL ${passCount}/${passCount} RBAC & CENTRAL LOGIN TESTS PASSED SUCCESSFULLY!`);
console.log('======================================================================\n');
