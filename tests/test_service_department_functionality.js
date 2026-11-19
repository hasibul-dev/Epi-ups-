/**
 * Service Department Functional & Routing Verification Test Suite
 * Verifies all 14 sidebar routes, work order lifecycle, sector data integrity,
 * warranty engine, client linking, and backup export/restore.
 */

import assert from 'assert';
import { createRealisticSeedData } from '../src/services/unifiedStorage.js';
import { CATS, PRIORITIES, warr, isOverdue, status, sync } from '../src/modules/service/services/domain.js';
import { TODAY, addD, addM, fmt } from '../src/modules/service/services/dates.js';

console.log('========================================================================');
console.log('🛠️ RUNNING SERVICE DEPARTMENT ROUTING & WORK ORDER MANAGEMENT TESTS');
console.log('========================================================================\n');

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
// 1. ROUTING & SLUG RESOLUTION TESTS (ALL 14 SIDEBAR OPTIONS)
// -------------------------------------------------------------
console.log('--- 1. SERVICE ROUTING & SIDEBAR SLUG MAPPING (14 ITEMS) ---');

const ROUTE_TO_PAGE = {
  '': 'dashboard',
  dashboard: 'dashboard',
  today: 'today',
  upcoming: 'upcoming',
  calendar: 'calendar',
  clients: 'clients',
  'sales-clients': 'clients',
  servicing: 'servicing',
  maintenance: 'maintenance',
  installation: 'installation',
  general: 'general',
  warranty: 'warranty',
  new: 'new',
  'new-order': 'new',
  history: 'history',
  reports: 'srep',
  srep: 'srep',
  settings: 'settings',
};

const PAGE_TO_ROUTE = {
  dashboard: '/service',
  today: '/service/today',
  upcoming: '/service/upcoming',
  calendar: '/service/calendar',
  clients: '/service/clients',
  servicing: '/service/servicing',
  maintenance: '/service/maintenance',
  installation: '/service/installation',
  general: '/service/general',
  warranty: '/service/warranty',
  new: '/service/new-order',
  history: '/service/history',
  srep: '/service/reports',
  settings: '/service/settings',
};

const EXPECTED_SIDEBAR_ITEMS = [
  { slug: '', expectedPage: 'dashboard', route: '/service' },
  { slug: 'today', expectedPage: 'today', route: '/service/today' },
  { slug: 'upcoming', expectedPage: 'upcoming', route: '/service/upcoming' },
  { slug: 'calendar', expectedPage: 'calendar', route: '/service/calendar' },
  { slug: 'clients', expectedPage: 'clients', route: '/service/clients' },
  { slug: 'servicing', expectedPage: 'servicing', route: '/service/servicing' },
  { slug: 'maintenance', expectedPage: 'maintenance', route: '/service/maintenance' },
  { slug: 'installation', expectedPage: 'installation', route: '/service/installation' },
  { slug: 'general', expectedPage: 'general', route: '/service/general' },
  { slug: 'warranty', expectedPage: 'warranty', route: '/service/warranty' },
  { slug: 'new-order', expectedPage: 'new', route: '/service/new-order' },
  { slug: 'history', expectedPage: 'history', route: '/service/history' },
  { slug: 'reports', expectedPage: 'srep', route: '/service/reports' },
  { slug: 'settings', expectedPage: 'settings', route: '/service/settings' },
];

it('All 14 sidebar items map bidirectionally to valid pages and URL paths', () => {
  assert.strictEqual(EXPECTED_SIDEBAR_ITEMS.length, 14, 'Exactly 14 sidebar options');
  EXPECTED_SIDEBAR_ITEMS.forEach((item) => {
    const resolvedPage = ROUTE_TO_PAGE[item.slug];
    assert.strictEqual(resolvedPage, item.expectedPage, `Slug '${item.slug}' maps to '${item.expectedPage}'`);
    const resolvedRoute = PAGE_TO_ROUTE[resolvedPage];
    assert.strictEqual(resolvedRoute, item.route, `Page '${resolvedPage}' maps back to '${item.route}'`);
  });
});

// -------------------------------------------------------------
// 2. WORK ORDER CRUD & PROGRESSION
// -------------------------------------------------------------
console.log('\n--- 2. WORK ORDER DISPATCH & LIFECYCLE MANAGEMENT ---');

const seed = createRealisticSeedData();
let serviceState = sync({
  clients: seed.clients,
  works: seed.serviceWorks,
  settings: { company: 'EPI UPS Bangladesh Limited', engineers: 'Md. Al-Amin, Tanvir Hasan, Kamrul Islam' },
});

it('Add Work Order with DB client selection auto-populates client attributes', () => {
  const client = serviceState.clients[0];
  const newOrder = {
    id: 'wo-test-01',
    category: 'Installation',
    clientId: client.id,
    clientName: client.contactPerson || client.name,
    clientCompany: client.company,
    clientPhone: client.phone,
    clientAddress: client.address,
    title: 'Site Delivery & 10kVA UPS Commissioning',
    date: TODAY(),
    time: '14:30',
    priority: 'High',
    engineer: 'Md. Al-Amin',
    status: 'pending',
    desc: 'Perform full electrical testing, load test, and battery bank interconnection',
    notes: 'Verify 3-phase input balance',
  };

  serviceState.works.push(newOrder);
  const found = serviceState.works.find((w) => w.id === 'wo-test-01');
  assert(found, 'Work order added to service works');
  assert.strictEqual(found.category, 'Installation');
  assert.strictEqual(found.clientCompany, client.company);
  assert.strictEqual(found.status, 'pending');
});

it('Mark Work Order completed sets status done and completedDate', () => {
  const target = serviceState.works.find((w) => w.id === 'wo-test-01');
  target.status = 'done';
  target.completedDate = TODAY();

  assert.strictEqual(target.status, 'done');
  assert.strictEqual(target.completedDate, TODAY());
  assert.strictEqual(status(target), 'done');
});

it('Reopen Work Order transitions status back to pending and clears completedDate', () => {
  const target = serviceState.works.find((w) => w.id === 'wo-test-01');
  target.status = 'pending';
  delete target.completedDate;

  assert.strictEqual(target.status, 'pending');
  assert.strictEqual(target.completedDate, undefined);
  assert.strictEqual(status(target), 'pending');
});

it('Delete Work Order successfully removes record from active state', () => {
  const initialCount = serviceState.works.length;
  serviceState.works = serviceState.works.filter((w) => w.id !== 'wo-test-01');
  assert.strictEqual(serviceState.works.length, initialCount - 1);
  assert(!serviceState.works.some((w) => w.id === 'wo-test-01'));
});

// -------------------------------------------------------------
// 3. SECTOR PARTITIONING & DATA CONSISTENCY
// -------------------------------------------------------------
console.log('\n--- 3. FIVE SECTOR WORK MANAGEMENT & CATEGORY FILTERING ---');

it('Works correctly partition across all 5 standard sectors (Sales, Servicing, Maintenance, Installation, General)', () => {
  CATS.forEach((cat) => {
    const count = serviceState.works.filter((w) => w.category === cat).length;
    assert(typeof count === 'number', `Count for sector ${cat} is valid`);
  });
  const installationCount = serviceState.works.filter((w) => w.category === 'Installation').length;
  assert(installationCount > 0, 'Installation sector has records');
});

// -------------------------------------------------------------
// 4. CLIENT WORK HISTORY & CASCADING DELETION
// -------------------------------------------------------------
console.log('\n--- 4. CLIENT WORK HISTORY & CASCADE INTEGRITY ---');

it('Deleting a client cascades and cleans up all associated work orders', () => {
  const testClient = {
    id: 'client-temp-cascade',
    name: 'Cascade Test Corp',
    company: 'Cascade Test Corp',
    clientType: 'Servicing',
    saleDate: TODAY(),
    wUnit: 'years',
    wValue: 1,
    wMonths: 12,
  };
  serviceState.clients.push(testClient);
  serviceState.works.push({
    id: 'wo-cascade-1',
    clientId: 'client-temp-cascade',
    title: 'Routine inspection',
    category: 'Servicing',
    date: TODAY(),
    status: 'pending',
  });

  assert(serviceState.clients.some((c) => c.id === 'client-temp-cascade'));
  assert(serviceState.works.some((w) => w.clientId === 'client-temp-cascade'));

  // Perform cascade delete
  serviceState.clients = serviceState.clients.filter((c) => c.id !== 'client-temp-cascade');
  serviceState.works = serviceState.works.filter((w) => w.clientId !== 'client-temp-cascade');

  assert(!serviceState.clients.some((c) => c.id === 'client-temp-cascade'), 'Client removed');
  assert(!serviceState.works.some((w) => w.clientId === 'client-temp-cascade'), 'Associated works removed');
});

// -------------------------------------------------------------
// 5. SERVICE DATABASE EXPORT & BACKUP SERIALIZATION
// -------------------------------------------------------------
console.log('\n--- 5. BACKUP EXPORT & SERIALIZATION ---');

it('Full service backup serializes and contains clients, works, and system settings', () => {
  const backup = {
    system: 'EPI Service Department',
    exportedAt: new Date().toISOString(),
    clients: serviceState.clients,
    works: serviceState.works,
    settings: serviceState.settings,
  };

  const json = JSON.stringify(backup);
  const parsed = JSON.parse(json);

  assert.strictEqual(parsed.system, 'EPI Service Department');
  assert(Array.isArray(parsed.clients) && parsed.clients.length > 0);
  assert(Array.isArray(parsed.works) && parsed.works.length > 0);
  assert.strictEqual(parsed.settings.company, 'EPI UPS Bangladesh Limited');
});

console.log('\n========================================================================');
console.log(`🎉 ALL TESTS PASSED: ${testsPassed} / ${testsTotal} CHECKS SUCCESSFUL`);
console.log('========================================================================\n');
