/**
 * Automated Verification: Admin/Super Administrator RBAC Enforcement for Database Backups
 * Verifies that:
 * 1. Only users with the Admin / Super Administrator role can export, import, or upload data/backups.
 * 2. Non-admin users are strictly blocked with an Unauthorized error in all storage engines & APIs.
 * 3. Browser storage session checks block unauthorized calls.
 */

import assert from 'assert';
import { isAuthorizedAdmin, assertAuthorizedAdmin } from '../src/utils/backupAuth.js';
import { unifiedStore } from '../src/services/unifiedStorage.js';
import { salesStorage } from '../src/modules/sales/services/salesStorage.js';
import { erpStore } from '../src/modules/erp/services/erpStorage.js';
import { marketingStore } from '../src/modules/marketing/services/marketingStorage.js';
import { centralStore, installCentralFetchInterceptor } from '../src/modules/admin/services/centralStorage.js';

// Polyfill minimal browser globals for Node test environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
};
global.sessionStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
};

console.log('========================================================================');
console.log('🔒 VERIFYING ADMIN / SUPER ADMIN RBAC ENFORCEMENT FOR BACKUPS');
console.log('========================================================================\n');

// Sample Roles
const superAdminUser = { userId: 'admin', name: 'Super Admin', role: 'superadmin' };
const adminUser = { userId: 'sysadmin', name: 'System Admin', role: 'admin' };
const salesUser = { userId: 'sales1', name: 'Sales Representative', role: 'employee', departments: ['sales'] };
const serviceUser = { userId: 'service1', name: 'Service Engineer', role: 'employee', departments: ['service'] };
const accountantUser = { userId: 'acc1', name: 'Chief Accountant', role: 'accountant', departments: ['accounts'] };
const marketingUser = { userId: 'mkt1', name: 'Marketing Officer', role: 'employee', departments: ['marketing'] };

// --- TEST 1: Role Detection Verification ---
console.log('--- 1. Role Authorization Helper Checks ---');
assert.strictEqual(isAuthorizedAdmin(superAdminUser), true, 'Super Admin is authorized');
assert.strictEqual(isAuthorizedAdmin(adminUser), true, 'Admin is authorized');
assert.strictEqual(isAuthorizedAdmin({ ...adminUser, role: 'manager', isAdmin: true }), true, 'User with isAdmin=true is authorized');

assert.strictEqual(isAuthorizedAdmin(salesUser), false, 'Sales employee is NOT authorized');
assert.strictEqual(isAuthorizedAdmin(serviceUser), false, 'Service employee is NOT authorized');
assert.strictEqual(isAuthorizedAdmin(accountantUser), false, 'Accountant is NOT authorized');
assert.strictEqual(isAuthorizedAdmin(marketingUser), false, 'Marketing employee is NOT authorized');
console.log('  ✅ [PASS] Role detection accurately distinguishes Admin/Superadmin from non-admin roles');

// --- TEST 2: Unified Store Backup Authorization ---
console.log('\n--- 2. Unified Store Backup RBAC Enforcement ---');

// Super Admin / Admin allowed
const fullBackup = unifiedStore.exportFullBackup(superAdminUser);
assert.ok(fullBackup && fullBackup.system, 'Super Admin can export full backup');
const adminBackup = unifiedStore.exportFullBackup(adminUser);
assert.ok(adminBackup && adminBackup.system, 'Admin can export full backup');

// Non-admins blocked
const nonAdminUsers = [salesUser, serviceUser, accountantUser, marketingUser];
for (const u of nonAdminUsers) {
  assert.throws(
    () => unifiedStore.exportFullBackup(u),
    /Unauthorized.*Admin/i,
    `exportFullBackup blocked for ${u.userId} (${u.role})`
  );
  assert.rejects(
    async () => await unifiedStore.importFullBackup(JSON.stringify(fullBackup), u),
    /Unauthorized.*Admin/i,
    `importFullBackup blocked for ${u.userId} (${u.role})`
  );
}
console.log('  ✅ [PASS] Unified storage strictly allows admins and blocks non-admins');

// --- TEST 3: Department Storage Engines (Sales, ERP, Marketing, Central) ---
console.log('\n--- 3. Department Storage Engines RBAC Enforcement ---');

// Sales Storage
assert.ok(salesStorage.exportJsonBackup(superAdminUser), 'Super Admin can export Sales backup');
assert.throws(() => salesStorage.exportJsonBackup(salesUser), /Unauthorized/i, 'Sales user cannot export Sales backup');
assert.throws(() => salesStorage.importJsonBackup('{}', salesUser), /Unauthorized/i, 'Sales user cannot import Sales backup');

// ERP Storage
assert.ok(erpStore.exportDatabase(superAdminUser), 'Super Admin can export ERP database');
assert.throws(() => erpStore.exportDatabase(accountantUser), /Unauthorized/i, 'Accountant cannot export ERP backup');
assert.throws(() => erpStore.importDatabase('{}', accountantUser), /Unauthorized/i, 'Accountant cannot import ERP backup');

// Marketing Storage
assert.ok(marketingStore.exportBackup(superAdminUser), 'Super Admin can export Marketing backup');
assert.throws(() => marketingStore.exportBackup(marketingUser), /Unauthorized/i, 'Marketing user cannot export Marketing backup');
assert.throws(() => marketingStore.importBackup('{}', marketingUser), /Unauthorized/i, 'Marketing user cannot import Marketing backup');

// Central Admin Storage
assert.ok(centralStore.exportDatabase(superAdminUser), 'Super Admin can export Central database');
assert.throws(() => centralStore.exportDatabase(serviceUser), /Unauthorized/i, 'Service user cannot export Central backup');
assert.throws(() => centralStore.importDatabase('{}', serviceUser), /Unauthorized/i, 'Service user cannot import Central backup');

console.log('  ✅ [PASS] All departmental storage engines enforce Admin/Superadmin authorization');

// --- TEST 4: Browser Storage Session Check ---
console.log('\n--- 4. Active Browser Storage Session RBAC Check ---');

// Place non-admin user in localStorage
localStorage.setItem('epi_central_user', JSON.stringify(salesUser));
assert.strictEqual(isAuthorizedAdmin(), false, 'Session detected as non-admin');
assert.throws(() => assertAuthorizedAdmin(), /Unauthorized/i, 'assertAuthorizedAdmin throws for non-admin session');
assert.throws(() => unifiedStore.exportFullBackup(), /Unauthorized/i, 'unifiedStore.exportFullBackup blocked by active session');

// Switch session to Super Admin in localStorage
localStorage.setItem('epi_central_user', JSON.stringify(superAdminUser));
assert.strictEqual(isAuthorizedAdmin(), true, 'Session detected as admin');
assert.doesNotThrow(() => assertAuthorizedAdmin(), 'assertAuthorizedAdmin passes for admin session');
assert.doesNotThrow(() => unifiedStore.exportFullBackup(), 'unifiedStore.exportFullBackup allowed for admin session');

localStorage.removeItem('epi_central_user');
console.log('  ✅ [PASS] Active browser storage session enforcement verified');

console.log('\n========================================================================');
console.log('🎉 ALL BACKUP RBAC SECURITY VERIFICATIONS PASSED SUCCESSFULLY!');
console.log('========================================================================\n');
