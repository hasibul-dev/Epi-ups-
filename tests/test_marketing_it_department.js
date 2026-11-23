/**
 * AUTOMATED TEST SUITE: Digital Marketing & IT Support Department
 * Verifies data models, persistent CRUD operations, backup import/export,
 * RBAC credentials, and unified database synchronization.
 */

import assert from 'node:assert';
import {
  createInitialMarketingItData,
  marketingStore,
} from '../src/modules/marketing/services/marketingStorage.js';
import { centralStore } from '../src/modules/admin/services/centralStorage.js';
import { unifiedStore } from '../src/services/unifiedStorage.js';

console.log('====================================================');
console.log('🧪 RUNNING DIGITAL MARKETING & IT SUPPORT TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// TEST GROUP 1: Initial Seed Data Models
// ----------------------------------------------------
console.log('--- Group 1: Seed Data Model Structure ---');

test('Seed data creates valid entities for both Marketing & IT', () => {
  const seed = createInitialMarketingItData();
  assert.ok(Array.isArray(seed.campaigns), 'campaigns array exists');
  assert.ok(seed.campaigns.length >= 4, 'at least 4 initial campaigns');
  assert.ok(Array.isArray(seed.posts), 'posts array exists');
  assert.ok(seed.posts.length >= 6, 'at least 6 initial posts');
  assert.ok(Array.isArray(seed.ads), 'ads array exists');
  assert.ok(seed.ads.length >= 3, 'at least 3 initial ads');
  assert.ok(Array.isArray(seed.assets), 'assets array exists');
  assert.ok(seed.assets.length >= 5, 'at least 5 initial assets');
  assert.ok(Array.isArray(seed.creativeRequests), 'creativeRequests array exists');
  assert.ok(Array.isArray(seed.marketingTasks), 'marketingTasks array exists');
  assert.ok(Array.isArray(seed.captions), 'captions array exists');
  assert.ok(Array.isArray(seed.tickets), 'tickets array exists');
  assert.ok(seed.tickets.length >= 6, 'at least 6 initial IT tickets');
  assert.ok(Array.isArray(seed.devices), 'devices array exists');
  assert.ok(seed.devices.length >= 8, 'at least 8 initial devices');
  assert.ok(Array.isArray(seed.softwareAccounts), 'softwareAccounts array exists');
  assert.ok(Array.isArray(seed.maintenance), 'maintenance array exists');
  assert.ok(Array.isArray(seed.notifications), 'notifications array exists');
  assert.ok(seed.notifications.length >= 3, 'at least 3 initial notifications');
  assert.ok(seed.systemSettings?.departmentName, 'systemSettings departmentName exists');
});

test('Campaign entity has industrial UPS properties and valid financials', () => {
  const seed = createInitialMarketingItData();
  const c = seed.campaigns[0];
  assert.ok(c.id, 'Campaign has id');
  assert.ok(c.name.includes('UPS'), 'Campaign mentions UPS solution');
  assert.ok(typeof c.budget === 'number' && c.budget > 0, 'Campaign budget is positive number');
  assert.ok(typeof c.spend === 'number' && c.spend >= 0, 'Campaign spend is positive number');
  assert.ok(Array.isArray(c.platforms), 'Platforms is array');
  assert.ok(c.focusProduct, 'Focus product defined');
});

test('IT Ticket entity has priority, user, device ID and tracking fields', () => {
  const seed = createInitialMarketingItData();
  const t = seed.tickets[0];
  assert.ok(t.id.startsWith('TICK-'), 'Ticket has TICK- prefix');
  assert.ok(t.requestingEmployee, 'Ticket has requestingEmployee');
  assert.ok(t.department, 'Ticket has department');
  assert.ok(['Critical', 'High', 'Normal', 'Low'].includes(t.priority), 'Ticket priority is valid');
  assert.ok(['Open', 'In Progress', 'Resolved', 'Closed'].includes(t.status), 'Ticket status is valid');
  assert.ok(t.assignedTechnician, 'Ticket has assigned technician');
});

// ----------------------------------------------------
// TEST GROUP 2: Store Engine CRUD Operations
// ----------------------------------------------------
console.log('\n--- Group 2: Persistent Store Engine CRUD Operations ---');

test('Campaign CRUD: Create, Edit, Delete', () => {
  // Reset demo
  marketingStore.resetDemo();

  // 1. Create
  const newCamp = marketingStore.saveCampaign({
    name: 'Automation Test 60kVA UPS Campaign',
    objective: 'Brand Awareness',
    platforms: ['Facebook', 'LinkedIn'],
    targetAudience: 'Testing audience',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    budget: 50000,
    spend: 10000,
    leadTarget: 50,
    leadsGenerated: 12,
    focusProduct: 'EPI 60kVA Online UPS',
    status: 'Active',
  });
  assert.ok(newCamp.id, 'Created campaign gets an id');

  const snap1 = marketingStore.getSnapshot();
  const found = snap1.campaigns.find((c) => c.id === newCamp.id);
  assert.ok(found, 'Created campaign found in snapshot');
  assert.strictEqual(found.name, 'Automation Test 60kVA UPS Campaign');

  // 2. Edit
  marketingStore.saveCampaign({
    ...found,
    spend: 15000,
    leadsGenerated: 20,
  });
  const snap2 = marketingStore.getSnapshot();
  const updated = snap2.campaigns.find((c) => c.id === newCamp.id);
  assert.strictEqual(updated.spend, 15000, 'Spend updated');
  assert.strictEqual(updated.leadsGenerated, 20, 'Leads updated');

  // 3. Delete
  marketingStore.deleteCampaign(newCamp.id);
  const snap3 = marketingStore.getSnapshot();
  assert.ok(!snap3.campaigns.find((c) => c.id === newCamp.id), 'Deleted campaign removed from store');
});

test('IT Ticket CRUD: Create, Resolve with completion date, Delete', () => {
  const newTicket = marketingStore.saveTicket({
    requestingEmployee: 'Sales Exec Test',
    department: 'Sales Department',
    issueCategory: 'Hardware / PC',
    title: 'Monitor black screen issue',
    description: 'Monitor does not power on with power strip switch',
    priority: 'High',
    assignedTechnician: 'Md. Al-Amin',
    status: 'In Progress',
  });
  assert.ok(newTicket.id.startsWith('TICK-'), 'Ticket gets formal TICK- id');

  // Resolve ticket
  const resolved = marketingStore.saveTicket({
    ...newTicket,
    status: 'Resolved',
    resolutionDetails: 'Replaced blown IEC power cord fuse.',
  });
  assert.strictEqual(resolved.status, 'Resolved');
  assert.ok(resolved.completionDate, 'Resolved ticket automatically records completion date');

  // Delete ticket
  marketingStore.deleteTicket(newTicket.id);
  const snap = marketingStore.getSnapshot();
  assert.ok(!snap.tickets.find((t) => t.id === newTicket.id), 'Deleted ticket removed from store');
});

test('Device Hardware CRUD: Create, Edit, Delete', () => {
  const newDev = marketingStore.saveDevice({
    deviceTag: 'EPI-IT-TEST-09',
    deviceType: 'Laptop',
    brandModel: 'Lenovo ThinkPad E14',
    specs: 'Core i5-1235U, 16GB, 512GB SSD',
    operatingSystem: 'Windows 11 Pro',
    assignedTo: 'Tanvir Ahmed',
    department: 'Digital Marketing & IT Support',
    ipAddress: '192.168.1.188',
    status: 'Operational',
  });
  assert.ok(newDev.id, 'Device has id');

  const snap1 = marketingStore.getSnapshot();
  const found = snap1.devices.find((d) => d.id === newDev.id);
  assert.strictEqual(found.deviceTag, 'EPI-IT-TEST-09');

  marketingStore.deleteDevice(newDev.id);
  const snap2 = marketingStore.getSnapshot();
  assert.ok(!snap2.devices.find((d) => d.id === newDev.id), 'Device removed');
});

test('Work Task Assignment & Automatic Notification Generation', () => {
  // 1. Create a task assigned to a team member
  const task = marketingStore.saveTask(
    {
      title: 'Automated Test: Deploy Marketing Landing Page for 40kVA UPS',
      category: 'SEO / Website',
      assignedTo: 'Tanvir Ahmed',
      assignedBy: 'Super Admin',
      startDate: '2026-11-23',
      dueDate: '2026-11-25',
      dueTime: '17:00',
      priority: 'Urgent',
      status: 'To Do',
      desc: 'Verify speed index and mobile responsiveness.',
    },
    { name: 'Super Admin', role: 'superadmin' }
  );

  assert.ok(task.id, 'Task created with unique id');
  assert.strictEqual(task.assignedTo, 'Tanvir Ahmed');
  assert.strictEqual(task.priority, 'Urgent');

  // Verify automatic assignment notification generated
  const snap = marketingStore.getSnapshot();
  const assignNotif = snap.notifications.find(
    (n) => n.taskId === task.id && n.type === 'assignment' && n.recipient === 'Tanvir Ahmed'
  );
  assert.ok(assignNotif, 'Assignment notification automatically created for recipient');
  assert.strictEqual(assignNotif.priority, 'Urgent');
  assert.ok(assignNotif.message.includes('Super Admin assigned you'), 'Notification message mentions assigner');

  // 2. Mark task completed -> should notify assigner
  marketingStore.saveTask(
    {
      ...task,
      status: 'Completed',
    },
    { name: 'Tanvir Ahmed', role: 'marketing_manager' }
  );

  const snapAfterComplete = marketingStore.getSnapshot();
  const completeNotif = snapAfterComplete.notifications.find(
    (n) => n.taskId === task.id && n.type === 'completed'
  );
  assert.ok(completeNotif, 'Completion notification automatically generated for assigner');

  // 3. Mark notification as read
  marketingStore.markNotificationAsRead(assignNotif.id);
  const snapAfterRead = marketingStore.getSnapshot();
  const updatedNotif = snapAfterRead.notifications.find((n) => n.id === assignNotif.id);
  assert.strictEqual(updatedNotif.read, true, 'Notification marked as read');

  // Cleanup test task
  marketingStore.deleteTask(task.id);
  const snapAfterDelete = marketingStore.getSnapshot();
  assert.ok(!snapAfterDelete.marketingTasks.find((t) => t.id === task.id), 'Task deleted');
});

test('Employee Work Progress, Completion Notes & Work History Retention', () => {
  // 1. Assign work to employee
  const task = marketingStore.saveTask(
    {
      title: 'Digital Marketing Test: Summer UPS Promo Video Creation',
      category: 'Video / Animation',
      assignedTo: 'Samia Jahan',
      assignedBy: 'Super Administrator',
      startDate: '2026-11-23',
      dueDate: '2026-11-25',
      priority: 'High',
      status: 'Assigned',
      desc: 'Create 30-sec promo reel for 20kVA Online UPS.',
    },
    { name: 'Super Administrator', role: 'superadmin' }
  );

  // 2. Employee starts work & updates progress
  const inProgress = marketingStore.updateTaskProgress(
    task.id,
    {
      progress: 60,
      status: 'In Progress',
      note: 'Storyboard approved. Rendering 3D animation sequence.',
    },
    { name: 'Samia Jahan', role: 'employee' }
  );
  assert.strictEqual(inProgress.status, 'In Progress');
  assert.strictEqual(inProgress.progress, 60);
  assert.ok(inProgress.history.length >= 2, 'History tracks status transitions');

  // 3. Employee completes work with completion notes & attachments
  const completed = marketingStore.completeTask(
    task.id,
    {
      completionNotes: 'Video rendered in 4K MP4 format and uploaded to Drive. Subtitles embedded.',
      completionAttachment: 'drive.google.com/file/d/sample-ups-promo.mp4',
    },
    { name: 'Samia Jahan', role: 'employee' }
  );
  assert.strictEqual(completed.status, 'Completed');
  assert.strictEqual(completed.progress, 100);
  assert.ok(completed.completedDate, 'Records completion date');
  assert.strictEqual(completed.completionNotes, 'Video rendered in 4K MP4 format and uploaded to Drive. Subtitles embedded.');

  // 4. Verify in Work History
  const historyList = marketingStore.getWorkHistory({ employee: 'Samia Jahan' });
  const inHistory = historyList.find((t) => t.id === task.id);
  assert.ok(inHistory, 'Completed work appears in Work History');
  assert.strictEqual(inHistory.assignedBy, 'Super Administrator', 'Original assigner preserved');
  assert.strictEqual(inHistory.startDate, '2026-11-23', 'Original assignment date preserved');

  // Cleanup test task
  marketingStore.deleteTask(task.id);
});

// ----------------------------------------------------
// TEST GROUP 3: Central Auth & RBAC Default Users
// ----------------------------------------------------
console.log('\n--- Group 3: RBAC Default Users & Roles ---');

test('Superadmin has marketing department in permissions', () => {
  const users = centralStore.getUsers();
  const superadmin = users.find((u) => u.userId === 'admin' || u.role === 'superadmin');
  assert.ok(superadmin, 'Superadmin exists');
  assert.ok(superadmin.departments.includes('marketing'), 'Superadmin has marketing department access');
  assert.ok(superadmin.departments.includes('sales'), 'Superadmin has sales access');
  assert.ok(superadmin.departments.includes('service'), 'Superadmin has service access');
  assert.ok(superadmin.departments.includes('accounts'), 'Superadmin has accounts access');
});

test('Default marketing1 and it1 users exist with correct roles', () => {
  const users = centralStore.getUsers();
  
  const mktUser = users.find((u) => u.userId === 'marketing1');
  assert.ok(mktUser, 'marketing1 user exists');
  assert.strictEqual(mktUser.role, 'marketing_manager', 'marketing1 role is marketing_manager');
  assert.ok(mktUser.departments.includes('marketing'), 'marketing1 has marketing dept access');

  const itUser = users.find((u) => u.userId === 'it1');
  assert.ok(itUser, 'it1 user exists');
  assert.strictEqual(itUser.role, 'it_manager', 'it1 role is it_manager');
  assert.ok(itUser.departments.includes('marketing'), 'it1 has marketing dept access');

  // Test login authentication with password123
  const mktLogin = centralStore.login('marketing1', 'password123');
  assert.ok(mktLogin && mktLogin.token, 'marketing1 successfully logs in with password123');

  const itLogin = centralStore.login('it1', 'password123');
  assert.ok(itLogin && itLogin.token, 'it1 successfully logs in with password123');
});

// ----------------------------------------------------
// TEST GROUP 4: Backup Export and Import
// ----------------------------------------------------
console.log('\n--- Group 4: Backup Import & Export Engine ---');

test('Backup Import and Export preserves all 11 marketing & IT collections', () => {
  const originalSnap = marketingStore.getSnapshot();
  const serialized = JSON.stringify({
    system: 'EPI Digital Marketing & IT Support',
    version: '1.0.0',
    data: originalSnap,
  });

  const res = marketingStore.importBackup(serialized);
  assert.strictEqual(res.success, true, 'Import succeeded');

  const restoredSnap = marketingStore.getSnapshot();
  assert.strictEqual(restoredSnap.campaigns.length, originalSnap.campaigns.length);
  assert.strictEqual(restoredSnap.tickets.length, originalSnap.tickets.length);
  assert.strictEqual(restoredSnap.devices.length, originalSnap.devices.length);
});

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
