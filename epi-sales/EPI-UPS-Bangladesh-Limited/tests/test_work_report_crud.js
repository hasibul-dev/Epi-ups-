import assert from 'assert';
import app from '../server/app.js';
import { connectToDatabase, closeDatabase, getDb } from '../server/db.js';
import { formatTime12h } from '../src/utils/helpers.js';

async function runWorkReportCrudTests() {
  console.log('Testing Work Report CRUD & Data Management System...');

  const { status } = await connectToDatabase();
  assert(status.connected, 'Database should be connected');
  const db = await getDb();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const testAuthPass = process.env.CRM_PASSWORD || 'rifat@660844';
  const authHeader = { 'Content-Type': 'application/json', 'x-crm-auth': testAuthPass };

  try {
    // Test 1: Historical record create, edit with Save, and verify persistence
    console.log('\n--- 1. Testing Work Report: History record Create & Edit ---');
    const histId = 'h-test-' + Date.now();
    const createRes = await fetch(`${baseUrl}/api/history`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: histId,
        date: '2026-10-13',
        time: '10:00 AM',
        text: 'Initial Inspection Work',
        notes: 'Initial test remark',
        status: 'Completed',
        type: 'Activity',
      }),
    });
    assert.strictEqual(createRes.status, 201, 'History create should return 201');
    const createdHist = await createRes.json();
    assert(createdHist.success, 'Create must succeed');

    // Verify in DB
    let inDb = await db.collection('history').findOne({ id: histId });
    assert(inDb, 'Record must exist in DB');
    assert.strictEqual(inDb.text, 'Initial Inspection Work');

    // Edit record (simulating clicking "✓ Save")
    const editRes = await fetch(`${baseUrl}/api/history/${histId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: '2026-10-14',
        time: '02:30 PM',
        text: 'Updated Inspection Work by User',
        notes: 'Updated remark after user edit',
        status: 'Completed',
      }),
    });
    assert.strictEqual(editRes.status, 200, 'History edit should return 200');
    const editData = await editRes.json();
    assert(editData.success, 'Edit must succeed');

    // Verify update reflected in DB
    inDb = await db.collection('history').findOne({ id: histId });
    assert.strictEqual(inDb.date, '2026-10-14');
    assert.strictEqual(inDb.time, '02:30 PM');
    assert.strictEqual(inDb.text, 'Updated Inspection Work by User');
    console.log('✓ Work Report record edit and save reflected in DB immediately!');

    // Test 2: Delete record from database and verify disappearance from bootstrap
    console.log('\n--- 2. Testing Work Report: Delete record permanently ---');
    const delRes = await fetch(`${baseUrl}/api/history/${histId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    assert.strictEqual(delRes.status, 200, 'Delete must return 200');

    // Verify completely deleted from database
    const afterDelete = await db.collection('history').findOne({ id: histId });
    assert.strictEqual(afterDelete, null, 'Record must be null after deletion');

    // Verify bootstrap no longer contains it
    const bootRes = await fetch(`${baseUrl}/api/bootstrap`, { headers: authHeader });
    const bootData = await bootRes.json();
    assert(!bootData.data.history.some(h => h.id === histId), 'Deleted record must disappear from bootstrap / all views');
    console.log('✓ Record completely deleted from database and disappeared from all views!');

    // Test 3: Planned Work create, edit, and delete
    console.log('\n--- 3. Testing Planned Work: Edit & Permanent Delete ---');
    const workId = 'w-test-' + Date.now();
    await fetch(`${baseUrl}/api/work`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: workId,
        date: '2026-10-13',
        time: '11:00 AM',
        text: 'Planned Battery Replacement',
        notes: 'Battery specs: 12V 100Ah',
        status: 'Pending',
      }),
    });

    // Edit planned work
    await fetch(`${baseUrl}/api/work/${workId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: '2026-10-15',
        time: '04:00 PM',
        text: 'Battery Replacement Rescheduled',
        notes: 'Updated battery specs',
        status: 'Pending',
      }),
    });
    const workInDb = await db.collection('work').findOne({ id: workId });
    assert.strictEqual(workInDb.date, '2026-10-15');
    assert.strictEqual(workInDb.time, '04:00 PM');
    assert.strictEqual(workInDb.text, 'Battery Replacement Rescheduled');

    // Delete planned work
    await fetch(`${baseUrl}/api/work/${workId}`, { method: 'DELETE', headers: authHeader });
    const workAfterDel = await db.collection('work').findOne({ id: workId });
    assert.strictEqual(workAfterDel, null, 'Planned work must be completely deleted from DB');
    console.log('✓ Planned work edit & delete verified!');

    // Test 4: New Work create, edit, and delete
    console.log('\n--- 4. Testing New Work: Edit & Permanent Delete ---');
    const nwId = 'nw-test-' + Date.now();
    await fetch(`${baseUrl}/api/new-work`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: nwId,
        date: '2026-10-13',
        time: '01:00 PM',
        text: 'Client Site Visit',
        notes: 'Carry multimeter',
      }),
    });

    // Edit new work
    await fetch(`${baseUrl}/api/new-work/${nwId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: '2026-10-16',
        time: '11:30 AM',
        text: 'Client Site Visit (Updated)',
        notes: 'Carry toolkit',
        status: 'Completed',
      }),
    });
    const nwInDb = await db.collection('newWork').findOne({ id: nwId });
    assert.strictEqual(nwInDb.date, '2026-10-16');
    assert.strictEqual(nwInDb.time, '11:30 AM');
    assert.strictEqual(nwInDb.text, 'Client Site Visit (Updated)');

    // Delete new work
    await fetch(`${baseUrl}/api/new-work/${nwId}`, { method: 'DELETE', headers: authHeader });
    const nwAfterDel = await db.collection('newWork').findOne({ id: nwId });
    assert.strictEqual(nwAfterDel, null, 'New work must be completely deleted from DB');
    console.log('✓ New work edit & delete verified!');

    // Test 5: Office attendance deletion
    console.log('\n--- 5. Testing Office Attendance: Permanent Delete ---');
    const officeDate = '2026-10-99';
    await fetch(`${baseUrl}/api/office/${officeDate}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ in: '09:00 AM', out: '06:00 PM' }),
    });
    const officeInDb = await db.collection('office').findOne({ date: officeDate });
    assert(officeInDb, 'Office attendance must exist');

    await fetch(`${baseUrl}/api/office/${officeDate}`, { method: 'DELETE', headers: authHeader });
    const officeAfterDel = await db.collection('office').findOne({ date: officeDate });
    assert.strictEqual(officeAfterDel, null, 'Office attendance must be completely deleted');
    const officeHistAfter = await db.collection('history').find({ date: officeDate }).toArray();
    assert.strictEqual(officeHistAfter.length, 0, 'Office history must be completely deleted');
    console.log('✓ Office attendance permanent deletion verified!');

    console.log('\n🎉 ALL WORK REPORT CRUD & DATA MANAGEMENT TESTS PASSED!');
  } finally {
    server.close();
    await closeDatabase();
    process.exit(0);
  }
}

runWorkReportCrudTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
