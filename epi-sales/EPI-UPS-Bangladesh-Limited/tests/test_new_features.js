import assert from 'assert';
import app from '../server/app.js';
import { connectToDatabase, closeDatabase, getDb } from '../server/db.js';
import { formatTime12h, timeToMinutes, compareTimes } from '../src/utils/helpers.js';

async function runTests() {
  console.log('Testing New Features & Endpoints...');

  const { status } = await connectToDatabase();
  assert(status.connected, 'Database should be connected');
  const db = await getDb();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const targetPass = process.env.CRM_PASSWORD || 'rifat@660844';
  const authHeader = { 'Content-Type': 'application/json', 'x-crm-auth': targetPass };

  try {
    // 1. Test Login Endpoint
    console.log('\n--- 1. Testing /api/auth/login ---');
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wrong', password: 'bad' }),
    });
    assert.strictEqual(badLogin.status, 401, 'Bad credentials should return 401');

    const goodLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'rifathabibullah', password: targetPass }),
    });
    assert.strictEqual(goodLogin.status, 200, 'Correct credentials should return 200');
    const loginData = await goodLogin.json();
    assert(loginData.success, 'Login should succeed');
    assert.strictEqual(loginData.username, 'rifathabibullah');
    console.log('✓ Login endpoint verified!');

    // 2. Test Time formatting & sorting
    console.log('\n--- 2. Testing 12-Hour AM/PM Helpers ---');
    assert.strictEqual(formatTime12h('14:30'), '02:30 PM');
    assert.strictEqual(formatTime12h('09:15'), '09:15 AM');
    assert.strictEqual(formatTime12h('00:00'), '12:00 AM');
    assert.strictEqual(formatTime12h('12:00'), '12:00 PM');
    assert.strictEqual(formatTime12h('02:45 PM'), '02:45 PM');

    const testTimes = ['02:00 PM', '09:30 AM', '11:00 AM', '12:15 PM', '08:00 AM', '10:30 PM'];
    testTimes.sort(compareTimes);
    assert.deepStrictEqual(testTimes, [
      '08:00 AM',
      '09:30 AM',
      '11:00 AM',
      '12:15 PM',
      '02:00 PM',
      '10:30 PM',
    ]);
    console.log('✓ 12-hour AM/PM formatting and chronological sorting verified!');

    // 3. Test Editable Office In/Out
    console.log('\n--- 3. Testing Editable Office In/Out Times ---');
    const testDate = '2026-10-13';
    const putOffice = await fetch(`${baseUrl}/api/office/${testDate}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ in: '09:15 AM', out: '05:45 PM' }),
    });
    assert.strictEqual(putOffice.status, 200);
    const officeData = await putOffice.json();
    assert(officeData.success);
    assert.strictEqual(officeData.entry.in, '09:15 AM');
    assert.strictEqual(officeData.entry.out, '05:45 PM');

    // Verify persisted in DB
    const persistedOffice = await db.collection('office').findOne({ date: testDate });
    assert(persistedOffice, 'Office doc must exist in DB');
    assert.strictEqual(persistedOffice.in, '09:15 AM');
    assert.strictEqual(persistedOffice.out, '05:45 PM');

    // Verify history records synchronized
    const officeHist = await db.collection('history').find({ date: testDate, type: { $in: ['Office IN', 'Office OUT'] } }).toArray();
    assert(officeHist.some(h => h.type === 'Office IN' && h.time === '09:15 AM'));
    assert(officeHist.some(h => h.type === 'Office OUT' && h.time === '05:45 PM'));
    console.log('✓ Office In/Out edit and persistence verified!');

    // 4. Test Work Edit & History Synchronization
    console.log('\n--- 4. Testing Work Edit & Delete Synchronization ---');
    const workId = 'test-work-' + Date.now();
    await db.collection('work').insertOne({
      id: workId,
      date: '2026-10-13',
      time: '10:00 AM',
      text: 'Original Task',
      status: 'Pending',
    });

    // Mark done
    const doneRes = await fetch(`${baseUrl}/api/work/${workId}/done`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ completedDate: '2026-10-13' }),
    });
    assert.strictEqual(doneRes.status, 200);

    // Edit work via PUT
    const editRes = await fetch(`${baseUrl}/api/work/${workId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: '2026-10-14',
        time: '03:30 PM',
        text: 'Updated Task Description',
        status: 'Completed',
      }),
    });
    assert.strictEqual(editRes.status, 200);

    // Verify history synchronized
    const updatedHist = await db.collection('history').findOne({ workId });
    assert(updatedHist, 'Linked history record must exist');
    assert.strictEqual(updatedHist.date, '2026-10-14', 'History date must be updated');
    assert.strictEqual(updatedHist.time, '03:30 PM', 'History time must be updated');
    assert.strictEqual(updatedHist.text, 'Updated Task Description', 'History text must be updated');

    // Delete work via DELETE
    const delRes = await fetch(`${baseUrl}/api/work/${workId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    assert.strictEqual(delRes.status, 200);

    // Verify both work and history are removed
    const workAfter = await db.collection('work').findOne({ id: workId });
    const histAfter = await db.collection('history').findOne({ workId });
    assert.strictEqual(workAfter, null, 'Work doc must be deleted');
    assert.strictEqual(histAfter, null, 'History doc must be deleted');
    console.log('✓ Work Edit & History synchronization verified!');

    console.log('\n🎉 ALL NEW FEATURE TESTS PASSED!');
  } finally {
    // Clean up test office record
    await db.collection('office').deleteOne({ date: '2026-10-13' });
    await db.collection('history').deleteMany({ date: '2026-10-13', type: { $in: ['Office IN', 'Office OUT'] } });
    server.close();
    await closeDatabase();
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
